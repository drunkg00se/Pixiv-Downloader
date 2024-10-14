import Dexie, { type Table } from 'dexie';
import { logger } from './logger';
import { generateCsv } from './util';
import type { Readable, Unsubscriber } from 'svelte/store';

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

interface CacheItem {
  pid: number;
  page: Uint8Array | null;
}

class HistoryDb extends Dexie {
  private history!: Table<HistoryItem, number>;
  private imageEffect!: Table<EffectImageItem, string>;

  constructor() {
    super('PdlHistory');
    this.version(3).stores({
      history: 'pid, userId, user, title, *tags',
      imageEffect: 'id'
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

  protected updatePageArray(page: number, pageArray?: Uint8Array): Uint8Array {
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
          const u8arr = this.updatePageArray(page, historyItem?.page);
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

      const byteIndex = Math.floor(page / 8);
      const bitIndex = page % 8;
      return (
        !(byteIndex > historyItem.page.length - 1) &&
        (historyItem.page[byteIndex] & (1 << bitIndex)) !== 0
      );
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

type HistoryCache = Map<CacheItem['pid'], CacheItem['page']>;

class CachedHistoryDb extends HistoryDb {
  protected cache: HistoryCache = new Map();
  private initCachePromise: Promise<void>;
  private channel: BroadcastChannel;

  constructor() {
    super();
    this.initCachePromise = this.initCache();
    this.channel = this.initChannel();
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
    const CHANNEL_NAME = 'pdl_sync-cache';
    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.addEventListener('message', (evt) => {
      const { data }: { data: CacheItem | CacheItem[] | undefined } = evt;
      if (data === undefined) {
        this.cache.clear();
        logger.info('clear database cache');
        return;
      }

      if (Array.isArray(data)) {
        data.forEach((item) => {
          this.cache.set(item.pid, item.page);
        });
        logger.info('Sync database cache:', data.length);
      } else {
        this.cache.set(data.pid, data.page);
      }
    });

    return channel;
  }

  private syncCacheViaChannel(item?: CacheItem | CacheItem[]) {
    this.channel.postMessage(item);
  }

  protected updateCache(item: CacheItem | CacheItem[]) {
    if (Array.isArray(item)) {
      item.forEach((cache) => {
        this.cache.set(cache.pid, cache.page);
      });
    } else {
      this.cache.set(item.pid, item.page);
    }
    this.syncCacheViaChannel(item);
  }

  protected clearCache() {
    this.cache.clear();
    this.syncCacheViaChannel();
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

      const pageArray = await this.getCache(pid);
      if (pageArray !== null) {
        // not downloaded | not fully downloaded
        this.updateCache({ pid, page: this.updatePageArray(page, pageArray) });
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

      const byteIndex = Math.floor(page / 8);
      const bitIndex = page % 8;
      return (
        !(byteIndex > cachesData.length - 1) && (cachesData[byteIndex] & (1 << bitIndex)) !== 0
      );
    }
  }

  public clear(): Promise<void> {
    this.clearCache();
    return super.clear();
  }
}

type Subscription = (val: HistoryCache) => void;
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

  protected initChannel(): BroadcastChannel {
    const channel = super.initChannel();
    channel.addEventListener('message', () => {
      this.runSubscription();
    });

    return channel;
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
