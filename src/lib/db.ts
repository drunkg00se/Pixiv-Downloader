import Dexie, { type Table } from 'dexie';
import { logger } from './logger';
import { generateCsv } from './util';
import type { Readable, Unsubscriber } from 'svelte/store';
import { channelEvent } from './channelEvent';

interface HistoryItemBase {
  pid: number;
  userId?: number;
  user?: string;
  title?: string;
  comment?: string;
  tags?: string[];
  /* pixiv unlisted artwork id */
  unlistedId?: string;
  /* booru site's image rating */
  rating?: string;
  source?: string;
}

type HistoryItem = HistoryItemBase & { page?: Uint8Array };

export type HistoryData = HistoryItemBase & { page?: number };

export type HistoryImportObject = HistoryItemBase & { page?: Record<string, number> };

interface pixivSeasonalEffectItem {
  id: string;
  data: ArrayBuffer;
}

interface CacheItem {
  pid: number;
  page: Uint8Array | null;
}

type HistoryCache = Map<CacheItem['pid'], CacheItem['page']>;

type Subscription = (val: HistoryCache) => void;

const enum DbEvents {
  SYNC = 'db.sync',
  CLEAR = 'db.clear'
}

type DBEventArgsMap = {
  [DbEvents.SYNC]: CacheItem | CacheItem[];
  [DbEvents.CLEAR]: never;
};

class HistoryDb extends Dexie {
  private history!: Table<HistoryItem, number>;
  private imageEffect!: Table<pixivSeasonalEffectItem, string>;
  private filehandle!: Table<FileSystemDirectoryHandle, string>;
  #DIRECTORY_HANDLE_NAME = 'directory-handle';

  constructor() {
    super('PdlHistory');
    this.version(4).stores({
      history: 'pid, userId, user, title, *tags',
      imageEffect: 'id',
      filehandle: ''
    });
  }

  protected throwIfInvalidNumber(num: number | string): number {
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

  public async add(historyData: HistoryData) {
    const { pid, page } = historyData;

    return this.transaction('rw', this.history, async () => {
      if (page !== undefined) {
        this.throwIfInvalidNumber(page);

        const historyItem = await this.get(pid);

        if (historyItem && historyItem.page === undefined) {
          // all pages have been downloaded, update artwork meta
          delete historyData.page;
          this.history.put(historyData as HistoryItem);
        } else {
          // historyItem = undefined: not downloaded
          // historyItem.page !== undefined: not fully downloaded
          const u8arr = HistoryDb.updatePageData(page, historyItem?.page);
          this.history.put({ ...historyData, page: u8arr });
        }
      } else {
        // all pages downloaded
        this.history.put(historyData as HistoryItem);
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

    return this.history.bulkPut(historyItems);
  }

  public async has(pid: number | string, page?: number): Promise<boolean> {
    if (page === undefined) {
      return !!(await this.get(pid));
    } else {
      this.throwIfInvalidNumber(page);
      const historyItem = await this.get(pid);

      if (!historyItem) return false;
      if (!historyItem.page) return true;
      return HistoryDb.isPageInData(page, historyItem.page);
    }
  }

  public get(pid: number | string): Promise<HistoryItem | undefined> {
    pid = this.throwIfInvalidNumber(pid);
    return this.history.get(pid);
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

  public clear(): Promise<void> {
    return this.history.clear();
  }

  // Firefox does not support storing `Arraybuffer`, so it will always return `undefined`.
  public async getImageEffect(effectId: string): Promise<pixivSeasonalEffectItem | undefined> {
    return await this.imageEffect.get(effectId);
  }

  public addImageEffect(effectData: pixivSeasonalEffectItem) {
    return this.imageEffect.put(effectData);
  }

  public getDirectoryHandle() {
    return this.filehandle.get(this.#DIRECTORY_HANDLE_NAME);
  }

  public setDirectoryHandle(dirHandle: FileSystemDirectoryHandle) {
    return this.filehandle.put(dirHandle, this.#DIRECTORY_HANDLE_NAME);
  }

  static updatePageData(page: number, pageData?: Uint8Array): Uint8Array {
    const byteIndex = Math.floor(page / 8);
    const bitIndex = page % 8;

    if (!pageData) {
      const newArr = new Uint8Array(byteIndex + 1);
      newArr[byteIndex] |= 1 << bitIndex;

      return newArr;
    } else if (byteIndex > pageData.length - 1) {
      const newArr = new Uint8Array(byteIndex + 1);
      newArr.set(pageData);
      newArr[byteIndex] |= 1 << bitIndex;

      return newArr;
    } else {
      pageData[byteIndex] |= 1 << bitIndex;
      return pageData;
    }
  }

  static isPageInData(page: number, pageData: Uint8Array): boolean {
    const byteIndex = Math.floor(page / 8);
    const bitIndex = page % 8;
    return !(byteIndex > pageData.length - 1) && (pageData[byteIndex] & (1 << bitIndex)) !== 0;
  }
}

class CachedHistoryDb extends HistoryDb {
  protected cache: HistoryCache = new Map();

  private initCachePromise: Promise<void>;

  constructor() {
    super();

    this.initCachePromise = this.initCache();

    this.initChannel();
  }

  protected async initCache() {
    logger.time('loadDb');
    const historyItems = await this.getAll();

    let historyItem: HistoryItem;
    for (let i = 0; (historyItem = historyItems[i++]); ) {
      const { pid, page = null } = historyItem;
      this.cache.set(pid, page);
    }
    logger.timeEnd('loadDb');
  }

  protected initChannel() {
    channelEvent.on<DBEventArgsMap, DbEvents.SYNC>(DbEvents.SYNC, (items) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          this.cache.set(item.pid, item.page);
        });

        logger.info('Sync database cache:', items.length);
      } else {
        this.cache.set(items.pid, items.page);
      }
    });

    channelEvent.on<DBEventArgsMap, DbEvents.CLEAR>(DbEvents.CLEAR, () => {
      this.cache.clear();
      logger.info('clear database cache');
    });
  }

  protected updateCache(item: CacheItem | CacheItem[]) {
    if (Array.isArray(item)) {
      item.forEach((cache) => {
        this.cache.set(cache.pid, cache.page);
      });
    } else {
      this.cache.set(item.pid, item.page);
    }

    channelEvent.emit<DBEventArgsMap, DbEvents.SYNC>(DbEvents.SYNC, item);
  }

  protected clearCache() {
    this.cache.clear();

    channelEvent.emit<DBEventArgsMap, DbEvents.CLEAR>(DbEvents.CLEAR);
  }

  private async getCache(pid: number | string): Promise<CacheItem['page'] | undefined> {
    pid = this.throwIfInvalidNumber(pid);
    await this.initCachePromise;
    return this.cache.get(pid);
  }

  public async add(historyData: HistoryData): Promise<void> {
    const { pid, page } = historyData;

    if (page === undefined) {
      // all pages downloaded
      !(await this.has(pid)) && this.updateCache({ pid, page: null });
    } else {
      // only one page downloaded
      this.throwIfInvalidNumber(page);

      const pageData = await this.getCache(pid);
      if (pageData !== null) {
        // not downloaded | not fully downloaded
        this.updateCache({ pid, page: HistoryDb.updatePageData(page, pageData) });
      } else {
        this.updateCache({ pid, page: null });
      }
    }

    return super.add(historyData);
  }

  public import(objArr: HistoryImportObject[]) {
    const cacheItems: CacheItem[] = objArr.map((historyObj) => {
      return {
        pid: historyObj.pid,
        page: historyObj.page ? new Uint8Array(Object.values(historyObj.page)) : null
      };
    });

    this.updateCache(cacheItems);

    return super.import(objArr);
  }

  public async has(pid: number | string, page?: number): Promise<boolean> {
    pid = this.throwIfInvalidNumber(pid);
    await this.initCachePromise;

    if (page === undefined) {
      return this.cache.has(pid);
    } else {
      this.throwIfInvalidNumber(page);

      const cachesData = await this.getCache(pid);

      if (cachesData === undefined) return false;
      if (cachesData === null) return true;
      return HistoryDb.isPageInData(page, cachesData);
    }
  }

  public clear(): Promise<void> {
    this.clearCache();
    return super.clear();
  }
}

class ReadableHistoryDb extends CachedHistoryDb implements Readable<HistoryCache> {
  private subscribers: Set<Subscription> = new Set();

  private runSubscription() {
    logger.info('runSubscription', this.subscribers.size);

    this.subscribers.forEach((subscription) => {
      subscription(this.cache);
    });
  }

  protected async initCache(): Promise<void> {
    await super.initCache();

    this.runSubscription();
  }

  protected initChannel() {
    super.initChannel();

    const runSubscription = this.runSubscription.bind(this);

    channelEvent.on<DBEventArgsMap, DbEvents.SYNC>(DbEvents.SYNC, runSubscription);
    channelEvent.on<DBEventArgsMap, DbEvents.CLEAR>(DbEvents.CLEAR, runSubscription);
  }

  protected updateCache(item: CacheItem | CacheItem[]): void {
    super.updateCache(item);
    this.runSubscription();
  }

  protected clearCache(): void {
    super.clearCache();
    this.runSubscription();
  }

  public subscribe(subscription: Subscription): Unsubscriber {
    this.subscribers.add(subscription);
    subscription(this.cache);
    return () => {
      this.subscribers.delete(subscription);
    };
  }
}

export const historyDb = new ReadableHistoryDb();
