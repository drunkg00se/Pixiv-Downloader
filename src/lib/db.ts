import Dexie, { type Table } from 'dexie';
import { logger } from './logger';
import { generateCsv } from './util';

interface HistoryItemBase {
  pid: number;
  userId?: number;
  user?: string;
  title?: string;
  comment?: string;
  tags?: string[];
}

type HistoryItem = HistoryItemBase & { page?: Uint8Array };

export type HistoryData = HistoryItemBase & { page?: number };
export type HistoryImportObject = HistoryItemBase & { page?: Record<string, number> };

interface EffectImageItem {
  id: string;
  data: ArrayBuffer[];
  width: number;
  height: number;
  delays: number[];
}

class HistoryDb extends Dexie {
  private history!: Table<HistoryItem, number>;
  private imageEffect!: Table<EffectImageItem, string>;
  private caches!: Map<number, Uint8Array | null>;

  constructor() {
    super('PdlHistory');
    this.version(3).stores({
      history: 'pid, userId, user, title, *tags',
      imageEffect: 'id'
    });

    logger.time('loadDb');
    this.history.toArray().then((datas) => {
      this.caches = new Map(datas.map((data) => [data.pid, data.page || null]));
      logger.timeEnd('loadDb');
    });
  }

  private throwIfInvalidNumber(num: number | string): number {
    if (typeof num === 'string') {
      if (num !== '') {
        num = +num;
      } else {
        return logger.throw('Invalid argument: can not be "".', RangeError);
      }
    }

    if (num < 0 || !Number.isSafeInteger(num)) {
      logger.throw(`Invalid number: ${num}, must be a non-negative integer.`, RangeError);
    }

    return num;
  }

  private async updatePageArray(page: number, pageArray?: Uint8Array): Promise<Uint8Array> {
    const byteIndex = Math.floor(page / 8);
    const bitIndex = page % 8;

    if (!pageArray) {
      const newArr = new Uint8Array(byteIndex + 1);
      newArr[byteIndex] |= 1 << bitIndex;

      return newArr;
    } else if (byteIndex > pageArray.length - 1) {
      const newArr = new Uint8Array(byteIndex + 1);
      newArr.set(pageArray);
      newArr[byteIndex] |= 1 << bitIndex;

      return newArr;
    } else {
      pageArray[byteIndex] |= 1 << bitIndex;
      return pageArray;
    }
  }

  public async add(historyData: HistoryData) {
    const { pid, page } = historyData;
    this.throwIfInvalidNumber(pid);

    return this.transaction('rw', this.history, async () => {
      if (page !== undefined) {
        this.throwIfInvalidNumber(page);

        const historyItem = await this.history.get(pid);

        if (historyItem?.page) {
          // not fully downloaded
          const u8arr = await this.updatePageArray(page, historyItem.page);
          this.history.put({ ...historyData, page: u8arr });
          this.caches.set(pid, u8arr);
        } else if (historyItem) {
          // fully downloaded
          delete historyData.page;
          this.history.put(historyData as HistoryItem);
        } else {
          // new download
          const u8arr = await this.updatePageArray(page);
          this.history.put({ ...historyData, page: u8arr });
          this.caches.set(pid, u8arr);
        }
      } else {
        this.history.put(historyData as HistoryItem);
        this.caches.set(pid, null);
      }
    });
  }

  public import(objArr: HistoryImportObject[]) {
    const historyItems = objArr.map((historyObj) => {
      if (historyObj.page) {
        return { ...historyObj, page: new Uint8Array(Object.values(historyObj.page)) };
      } else {
        return historyObj;
      }
    }) as HistoryItem[];

    historyItems.forEach((data) => {
      this.caches.set(data.pid, data.page || null);
    });
    return this.history.bulkPut(historyItems);
  }

  public async has(pid: number | string): Promise<boolean> {
    pid = this.throwIfInvalidNumber(pid);

    if (this.caches) {
      return this.caches.has(pid);
    } else {
      return !!(await this.history.get(pid));
    }
  }

  /**
   * Returns `true` if the page has been downloaded, `false` if it hasn't,
   *
   * @param {number | string} pid
   * @param {number} page
   * @returns {boolean}
   */
  public async hasPage(pid: number | string, page: number): Promise<boolean> {
    pid = this.throwIfInvalidNumber(pid);
    this.throwIfInvalidNumber(page);

    const byteIndex = Math.floor(page / 8);
    const bitIndex = page % 8;

    if (this.caches) {
      const cachesData = this.caches.get(pid);

      if (cachesData === null) {
        return true;
      } else if (cachesData) {
        return (
          !(byteIndex > cachesData.length - 1) && (cachesData[byteIndex] & (1 << bitIndex)) !== 0
        );
      }

      return false;
    } else {
      const historyItem = await this.history.get(pid);

      if (!historyItem) {
        return false;
      } else if (!historyItem.page) {
        return true;
      }

      return (
        !(byteIndex > historyItem.page.length - 1) &&
        (historyItem.page[byteIndex] & (1 << bitIndex)) !== 0
      );
    }
  }

  public getAll(): Promise<HistoryItem[]> {
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
    this.caches && this.caches.clear();
    return this.history.clear();
  }

  // Firefox does not support storing `ImageData`, so it will always return `undefined`.
  public async getImageEffect(effectId: string): Promise<EffectImageItem | undefined> {
    const item = await this.imageEffect.get(effectId);
    if (!item) return item;

    return item;
  }

  public addImageEffect(effectData: EffectImageItem) {
    return this.imageEffect.put(effectData);
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
