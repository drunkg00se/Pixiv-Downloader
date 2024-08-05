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
  public history!: Table<HistoryData, number>;

  public constructor() {
    super('PdlHistory');
    this.version(3).stores({
      history: 'pid, userId, user, title, comment, *tags'
    });
  }
}

function createHistoryDb() {
  const db = new HistoryDb();
  let record: Set<number>;

  logger.time('loadDb');
  db.history.toArray().then((datas) => {
    record = new Set(datas.map((data) => data.pid));
    logger.timeEnd('loadDb');
  });

  return {
    async add(historyData: HistoryData) {
      if (!(await this.has(historyData.pid))) {
        db.history.put(historyData);
        record.add(historyData.pid);
      }
    },

    bulkAdd(historyDatas: HistoryData[]) {
      const result = db.history.bulkPut(historyDatas);
      historyDatas.forEach((data) => {
        record.add(data.pid);
      });
      return result;
    },

    async has(pid: number | string): Promise<boolean> {
      if (typeof pid === 'string') pid = Number(pid);
      if (record) {
        return record.has(pid);
      } else {
        return !!(await db.history.get(pid));
      }
    },

    getAll(): Promise<HistoryData[]> {
      return db.history.toArray();
    },

    generateCsv(): Promise<Blob> {
      return this.getAll().then((datas) => {
        const csvData: string[][] = datas.map((historyData) => {
          const { pid, userId = '', user = '', title = '', tags = '', comment = '' } = historyData;
          return [String(pid), String(userId), user, title, comment, tags ? tags.join(',') : tags];
        });
        csvData.unshift(['id', 'userId', 'user', 'title', 'comment', 'tags']);

        return generateCsv(csvData);
      });
    },

    clear() {
      record && (record = new Set());
      return db.history.clear();
    }
  };
}

export const historyDb = createHistoryDb();
