import Dexie, { type Table } from 'dexie';
import { logger } from './logger';
import { generateCsv } from './util';

export interface HistoryData {
  pid: number;
  userId?: number;
  user?: string;
  title?: string;
  comment?: string;
  tags?: string[];
}

class HistoryDb extends Dexie {
  private history!: Table<HistoryData, number>;
  private record!: Set<number>;

  constructor() {
    super('PdlHistory');
    this.version(2).stores({
      history: 'pid, userId, user, title, *tags'
    });

    logger.time('loadDb');
    this.history.toArray().then((datas) => {
      this.record = new Set(datas.map((data) => data.pid));
      logger.timeEnd('loadDb');
    });
  }

  public async add(historyData: HistoryData) {
    if (!(await this.has(historyData.pid))) {
      this.history.put(historyData);
      this.record.add(historyData.pid);
    }
  }

  public bulkAdd(historyDatas: HistoryData[]) {
    const result = this.history.bulkPut(historyDatas);
    historyDatas.forEach((data) => {
      this.record.add(data.pid);
    });
    return result;
  }

  public async has(pid: number | string): Promise<boolean> {
    if (typeof pid === 'string') pid = Number(pid);
    if (!Number.isInteger(pid) || pid < 0) throw logger.error('Invalid Pid');

    if (this.record) {
      return this.record.has(pid);
    } else {
      return !!(await this.history.get(pid));
    }
  }

  public getAll(): Promise<HistoryData[]> {
    return this.history.toArray();
  }

  public generateCsv(): Promise<Blob> {
    return this.getAll().then((datas) => {
      const csvData: string[][] = datas.map((historyData) => {
        const { pid, userId = '', user = '', title = '', tags = '', comment = '' } = historyData;
        return [String(pid), String(userId), user, title, comment, tags ? tags.join(',') : tags];
      });
      csvData.unshift(['id', 'userId', 'user', 'title', 'comment', 'tags']);

      return generateCsv(csvData);
    });
  }

  public clear() {
    this.record && (this.record = new Set());
    return this.history.clear();
  }
}

let instance: HistoryDb;
const SingletonHistoryDb = new Proxy(HistoryDb, {
  construct(target) {
    if (!instance) {
      return (instance = new target());
    }

    return instance;
  }
});

export const historyDb = new SingletonHistoryDb();
