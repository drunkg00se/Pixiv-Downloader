import { writable, derived, readonly, type Readable, get } from 'svelte/store';
import optionStore from './store';
import { logger } from '@/lib/logger';
import { CancelError, RequestError } from '@/lib/error';
import { sleep } from '@/lib/util';

interface YieldArtworkId {
  total: number;
  page: number;
  avaliable: string[];
  invalid: string[];
  unavaliable: string[];
}

export type GenerateIdWithValidation<T, K extends string | string[] = []> = (
  pageRange: [start: number, end: number] | null,
  checkValidity: (meta: Partial<T>) => Promise<boolean>,
  ...restArgs: K extends string ? K[] : K
) => Generator<YieldArtworkId, void, undefined> | AsyncGenerator<YieldArtworkId, void, undefined>;

export type GenerateIdWithoutValidation<K extends string | string[] = []> = (
  pageRange: [start: number, end: number] | null,
  ...restArgs: K extends string ? K[] : K
) => Generator<YieldArtworkId, void, undefined> | AsyncGenerator<YieldArtworkId, void, undefined>;

export type GenPageId<
  T,
  K extends string | string[],
  FilterWhenGenerateIngPage extends true | undefined
> = FilterWhenGenerateIngPage extends true
  ? GenerateIdWithValidation<T, K>
  : GenerateIdWithoutValidation<K>;

export type GenPageIdItem<
  T,
  K extends string | string[],
  FilterWhenGenerateIngPage extends true | undefined
> = {
  id: string;
  name: string;
  fn: GenPageId<T, K, FilterWhenGenerateIngPage>;
};

export interface BatchDownloadConfig<
  T,
  FilterWhenGenerateIngPage extends true | undefined = undefined
> {
  filterOption: {
    filters: {
      id: string;
      type: 'include' | 'exclude';
      name: string;
      checked: boolean;
      fn(artworkMeta: Partial<T>): boolean | Promise<boolean>;
    }[];
    enableTagFilter?: T extends { tags: string[] } ? true : never;
    filterWhenGenerateIngPage?: FilterWhenGenerateIngPage;
  };
  avatar?: string | ((url: string) => string | Promise<string>);
  pageMatch: {
    name?: string;
    match: string | ((url: string) => boolean) | RegExp;
    genPageId:
      | GenPageIdItem<T, any, FilterWhenGenerateIngPage>
      | GenPageIdItem<T, any, FilterWhenGenerateIngPage>[];
  }[];
  parseMetaByArtworkId(id: string): T | Promise<T>;
  // TODO: no need to return id
  downloadByArtworkId(meta: T, taskId: string): Promise<string>; //return Id for msg
  onDownloadAbort(taskIds: string[]): void;
}

interface FailedItem {
  id: string;
  reason: any;
}

interface LogItem {
  type: 'Info' | 'Add' | 'Complete' | 'Fail' | 'Error';
  message: string;
}

const enum ChannelMessageType {
  SET_PENDING,
  SET_IDLE,
  ADD_QUEUE,
  REMOVE_QUEUE,
  PROCESS_NEXT,
  QUERY
}

interface SetStateMessage {
  type: ChannelMessageType.SET_PENDING | ChannelMessageType.SET_IDLE | ChannelMessageType.QUERY;
  value: null;
}

interface HandleQueueMessage {
  type: ChannelMessageType.ADD_QUEUE | ChannelMessageType.REMOVE_QUEUE;
  value: string;
}

interface ProcessNextMessage {
  type: ChannelMessageType.PROCESS_NEXT;
  value: string[];
}

type ChannelMessage = SetStateMessage | HandleQueueMessage | ProcessNextMessage;

function useChannel() {
  const CHANNEL_NAME = 'pdl_batch-download';
  const TAB_ID = String(Math.random());
  const channel = new BroadcastChannel(CHANNEL_NAME);
  const queue: string[] = [];

  let downloading = false;
  let pending = false;
  let onFullfilled: () => void;
  let onRejected: (reason?: unknown) => void;

  channel.addEventListener('message', (evt) => {
    const { data }: { data: ChannelMessage } = evt;

    switch (data.type) {
      case ChannelMessageType.QUERY:
        logger.info('channel receive: QUERY');

        downloading &&
          channel.postMessage({
            type: ChannelMessageType.SET_PENDING,
            value: null
          });
        break;
      case ChannelMessageType.SET_PENDING:
        logger.info('channel receive: SET_PENDING');

        !pending && (pending = true);
        break;
      case ChannelMessageType.SET_IDLE:
        logger.info('channel receive: SET_IDLE');

        pending && (pending = false);
        break;
      case ChannelMessageType.ADD_QUEUE:
        logger.info('channel receive: ADD_QUEUE');

        downloading && queue.push(data.value);
        break;
      case ChannelMessageType.REMOVE_QUEUE:
        logger.info('channel receive: REMOVE_QUEUE');

        if (downloading) {
          const idx = queue.findIndex((id) => id === data.value);
          idx !== -1 && queue.splice(idx, 1);
        }
        break;
      case ChannelMessageType.PROCESS_NEXT:
        logger.info('channel receive: PROCESS_NEXT', TAB_ID, data.value);

        if (data.value[0] !== TAB_ID) return;

        queue.push(...data.value.slice(1));
        pending = false;
        downloading = true;
        onFullfilled();

        break;
      default:
        break;
    }
  });

  window.addEventListener('unload', () => {
    if (pending) {
      channel.postMessage({
        type: ChannelMessageType.REMOVE_QUEUE,
        value: TAB_ID
      });

      return;
    }

    if (downloading) {
      queue.length
        ? channel.postMessage({
            type: ChannelMessageType.PROCESS_NEXT,
            value: queue
          })
        : channel.postMessage({
            type: ChannelMessageType.SET_IDLE,
            value: null
          });
    }
  });

  channel.postMessage({
    type: ChannelMessageType.QUERY,
    value: null
  });

  return {
    async requestDownload() {
      if (!pending) {
        downloading = true;
        channel.postMessage({
          type: ChannelMessageType.SET_PENDING,
          value: null
        });

        logger.info('channel post: SET_PENDING');
        return;
      }

      const waitUntilIdle = new Promise<void>((resolve, reject) => {
        onFullfilled = resolve;
        onRejected = reject;
      });

      channel.postMessage({
        type: ChannelMessageType.ADD_QUEUE,
        value: TAB_ID
      });

      logger.info('channel post: ADD_QUEUE', TAB_ID);

      return waitUntilIdle;
    },

    cancelDownloadRequest(reason?: unknown) {
      if (!pending) return;

      channel.postMessage({
        type: ChannelMessageType.REMOVE_QUEUE,
        value: TAB_ID
      });

      logger.info('channel post: REMOVE_QUEUE', TAB_ID);

      onRejected(reason);
    },

    processNextDownload() {
      if (!downloading) return;
      downloading = false;

      if (queue.length) {
        pending = true;

        channel.postMessage({
          type: ChannelMessageType.PROCESS_NEXT,
          value: queue
        });

        queue.length = 0;

        logger.info('channel post: PROCESS_NEXT');
      } else {
        channel.postMessage({
          type: ChannelMessageType.SET_IDLE,
          value: null
        });

        logger.info('channel post: SET_IDLE');
      }
    }
  };
}

export let useBatchDownload: () => {
  artworkCount: Readable<number>;
  successd: Readable<string[]>;
  failed: Readable<FailedItem[]>;
  excluded: Readable<string[]>;
  downloading: Readable<boolean>;
  log: Readable<LogItem>;
  batchDownload(fnId: string, ...restArgs: string[]): Promise<void>;
  abort: () => void;
} = () => {
  throw new Error('You need to call `defineBatchDownload` before using `useBatchDownload`.');
};

const ERROR_MASKED = 'Masked.';

export function defineBatchDownload(downloaderConfig: BatchDownloadConfig<any, true | undefined>) {
  const artworkCount = writable<number>(0);
  const successd = writable<string[]>([]);
  const failed = writable<FailedItem[]>([]);
  const excluded = writable<string[]>([]);
  const downloading = writable<boolean>(false);
  const log = writable<LogItem>();

  const { requestDownload, cancelDownloadRequest, processNextDownload } = useChannel();

  const tasks: string[] = [];
  const failedTasks: string[] = [];
  const unavaliableTasks: string[] = [];

  let controller: AbortController | null;
  let downloadCompleted!: () => void;
  let downloadAbort!: (reason?: any) => void;

  const readonlyStore = {
    artworkCount: readonly(artworkCount),
    successd: readonly(successd),
    failed: readonly(failed),
    excluded: readonly(excluded),
    downloading: readonly(downloading),
    log: readonly(log)
  };

  let $pageStart!: number;
  let $pageEnd!: number;
  let $downloadAllPages: boolean;
  let $blacklistTag: string[] = [];
  let $whitelistTag: string[] = [];
  let $retryFailed: boolean = false;

  const includeFilters: ((artworkMeta: Partial<any>) => boolean | Promise<boolean>)[] = [];
  const excludeFilters: ((artworkMeta: Partial<any>) => boolean | Promise<boolean>)[] = [];

  const {
    selectedFilters,
    blacklistTag,
    whitelistTag,
    downloadAllPages,
    pageStart,
    pageEnd,
    retryFailed
  } = optionStore;

  const watchPageRange = derived([downloadAllPages, pageStart, pageEnd], (data) => data);
  watchPageRange.subscribe(([downloadAllPages, pageStart, pageEnd]) => {
    // update page range
    $downloadAllPages = downloadAllPages;
    $pageStart = pageStart;
    $pageEnd = pageEnd;
  });

  selectedFilters.subscribe((selected) => {
    if (!selected) return;

    includeFilters.length = 0;
    excludeFilters.length = 0;

    selected.forEach((id) => {
      const filter = downloaderConfig.filterOption.filters.find((filter) => filter.id === id);
      if (filter) {
        if (filter.type === 'include') {
          includeFilters.push(filter.fn);
        } else {
          excludeFilters.push(filter.fn);
        }
      }
    });
  });

  blacklistTag.subscribe((val) => {
    $blacklistTag = [...val];
  });
  whitelistTag.subscribe((val) => {
    $whitelistTag = [...val];
  });

  retryFailed.subscribe((val) => {
    $retryFailed = val;
  });

  const checkIfDownloadCompleted = derived(
    [artworkCount, successd, failed, excluded],
    ([$artworkCount, $successd, $failed, $excluded]) =>
      $artworkCount === $successd.length + $failed.length + $excluded.length
  );
  checkIfDownloadCompleted.subscribe((isDone) => {
    // resolve waitUntilDownloadComplete when download completed.
    isDone && downloadCompleted?.();
  });

  function reset() {
    artworkCount.set(0);
    successd.set([]);
    failed.set([]);
    excluded.set([]);
    tasks.length = 0;
    failedTasks.length = 0;
    unavaliableTasks.length = 0;
    controller = null;
    downloadCompleted = () => {};
    downloadAbort = () => {};
    writeLog('Info', 'Reset store.');
  }

  function setDownloading(isDownloading: boolean) {
    downloading.update((val) => {
      // throw if already downloading
      if (val && isDownloading) throw new Error('Already downloading.');
      return isDownloading;
    });
  }

  function setArtworkCount(num: number) {
    artworkCount.set(num);
  }

  function addSuccessd(id: string | string[]) {
    successd.update((val) => {
      if (Array.isArray(id)) {
        val.push(...id);
        writeLog('Complete', id[id.length - 1]);
      } else {
        val.push(id);
        writeLog('Complete', id);
      }
      return val;
    });
  }

  function addFailed(item: FailedItem | FailedItem[]) {
    failed.update((val) => {
      let id: string;
      let reason: any;

      if (Array.isArray(item)) {
        val.push(...item);
        const lastItem = item[item.length - 1];
        id = lastItem.id;
        reason = lastItem.reason;
      } else {
        val.push(item);
        id = item.id;
        reason = item.reason;
      }

      if (reason instanceof Error || typeof reason === 'string') {
        writeLog('Fail', id, reason);
      }

      return val;
    });
  }

  function addExcluded(id: string | string[]) {
    excluded.update((val) => {
      if (Array.isArray(id)) {
        val.push(...id);
        writeLog('Info', `${id.length} was excluded...`);
      } else {
        val.push(id);
        writeLog('Info', `${id} was excluded...`);
      }
      return val;
    });
  }

  function writeLog(type: Extract<LogItem['type'], 'Error'>, error: Error): void;
  function writeLog(
    type: Extract<LogItem['type'], 'Fail'>,
    id: string,
    error: Error | string
  ): void;
  function writeLog(type: Exclude<LogItem['type'], 'Error' | 'Fail'>, idOrMsg: string): void;
  function writeLog(type: LogItem['type'], arg: string | Error, error?: Error | string): void {
    const item = {
      type,
      message: ''
    };

    switch (type) {
      case 'Error':
        if (!(arg instanceof Error))
          throw new TypeError('error` is expected to be error, but got ' + typeof arg);

        item.message = `[${arg.name}] ${arg.message}`;
        break;
      case 'Fail':
        if (typeof arg !== 'string')
          throw new TypeError('`id` is expected to be string, but got ' + typeof arg);

        typeof error === 'string'
          ? (item.message = `[Fail] ${arg}...${error}`)
          : (item.message = `[Fail] ${arg}...${error ? error.name + ':' + error.message : ''}`);
        break;
      default:
        item.message = `[${type}] ${arg as string}`;
        break;
    }

    log.set(item);
  }

  function filterTag(partialMeta: any): boolean {
    if (!('tags' in partialMeta) || !Array.isArray(partialMeta.tags)) return true;

    if ($whitelistTag.length) {
      return $whitelistTag.some((tag) => partialMeta.tags.includes(tag));
    }

    if ($blacklistTag.length) {
      return !$blacklistTag.some((tag) => partialMeta.tags.includes(tag));
    }

    return true;
  }

  async function checkValidity(partialMeta: any): Promise<boolean> {
    try {
      const { enableTagFilter } = downloaderConfig.filterOption;
      if (enableTagFilter && !filterTag(partialMeta)) return false;

      // return false if no includefilter seleted.
      if (!includeFilters.length) return false;

      for (let i = 0; i < excludeFilters.length; i++) {
        const fn = excludeFilters[i];
        const isExcluded = await fn(partialMeta);

        if (isExcluded) return false;
      }

      for (let i = 0; i < includeFilters.length; i++) {
        const fn = includeFilters[i];
        const isValid = await fn(partialMeta);

        if (isValid) return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  async function batchDownload(fnId: string, ...restArgs: string[]) {
    setDownloading(true);
    writeLog('Info', 'Start download...');

    // reset store before download start, so we can still access store data after download finished.
    reset();

    controller = new AbortController();
    const signal = controller.signal;

    signal.addEventListener(
      'abort',
      () => {
        cancelDownloadRequest(signal.reason);
        downloadAbort?.(signal.reason);
        downloaderConfig.onDownloadAbort(tasks);
      },
      { once: true }
    );

    let generator!: ReturnType<typeof getGenerator>;
    try {
      generator = getGenerator(fnId, ...restArgs);

      writeLog('Info', 'Waiting for other downloads to finish...');
      await requestDownload();

      await dispatchDownload(generator, signal);

      // retry failed downloads
      if ($retryFailed && failedTasks.length) {
        writeLog('Info', 'Retry...');

        generator = retryGenerator(
          get(artworkCount),
          failedTasks.slice(),
          unavaliableTasks.slice()
        );
        failedTasks.length = 0;
        unavaliableTasks.length = 0;
        failed.set([]);

        await dispatchDownload(generator, signal);
      }

      writeLog('Info', 'Download complete.');
    } catch (error) {
      logger.error(error);

      generator?.return();

      // unexpected error, call `controller.abort()` to abort unfinished download
      if (!signal.aborted) {
        controller.abort(error);
      }

      if (error instanceof Error) {
        writeLog('Error', error);
      }
    }

    setDownloading(false);
    processNextDownload();
  }

  function getGenerator(fnId: string, ...restArgs: string[]) {
    let genFn!: GenPageId<any, any, true | undefined>;
    let generator: ReturnType<typeof genFn>;

    const pageConfig = downloaderConfig.pageMatch.find((pageItem) => {
      const { genPageId } = pageItem;
      if (Array.isArray(genPageId)) {
        const item = genPageId.find((item) => item.id === fnId);
        if (item) {
          genFn = item.fn;

          return true;
        }
      } else {
        if (genPageId.id === fnId) {
          genFn = genPageId.fn;
          return true;
        }
      }

      return false;
    });

    if (!pageConfig || !genFn) throw new Error('Invalid generator id: ' + fnId);
    if (!$downloadAllPages && $pageEnd < $pageStart)
      throw new Error('End page must not be less than the start page.');

    const pageRange: [start: number, end: number] | null = $downloadAllPages
      ? null
      : [$pageStart, $pageEnd];

    const { filterWhenGenerateIngPage } = downloaderConfig.filterOption;
    if (filterWhenGenerateIngPage) {
      generator = (genFn as GenPageId<any, any, true>)(pageRange, checkValidity, ...restArgs);
    } else {
      generator = (genFn as GenPageId<any, any, undefined>)(pageRange, ...restArgs);
    }

    return generator;
  }

  function* retryGenerator(total: number, failedArtworks: string[], unavaliableTasks: string[]) {
    yield {
      total,
      page: 0,
      avaliable: failedArtworks,
      invalid: [],
      unavaliable: unavaliableTasks
    };
  }

  async function dispatchDownload(
    generator: NonNullable<ReturnType<typeof getGenerator>>,
    signal: AbortSignal
  ) {
    signal.throwIfAborted();

    const waitUntilDownloadComplete = new Promise<void>((resolve, reject) => {
      downloadCompleted = resolve;
      downloadAbort = reject;
    });

    const THRESHOLD = 5;
    const { parseMetaByArtworkId, downloadByArtworkId } = downloaderConfig;
    const { filterWhenGenerateIngPage } = downloaderConfig.filterOption;
    const dlPromise: Promise<void>[] = [];
    let result: IteratorResult<YieldArtworkId, void> | void;
    let status429: boolean = false;

    const failedHanlderFactory = (id: string) => {
      return (reason: any) => {
        if (signal.aborted) return;

        addFailed({ id, reason });

        reason && logger.error(reason);
        reason !== ERROR_MASKED && failedTasks.push(id);

        if (reason instanceof RequestError && reason.status === 429) {
          status429 = true;
        }
      };
    };

    while (
      (result = await Promise.race([generator.next(), waitUntilDownloadComplete])) &&
      !result.done
    ) {
      const { total, avaliable, invalid, unavaliable } = result.value;

      logger.info(total, avaliable, invalid, unavaliable);

      signal.throwIfAborted();

      // Update artwork count store
      setArtworkCount(total);
      invalid.length && addExcluded(invalid);
      if (unavaliable.length) {
        addFailed(unavaliable.map((id) => ({ id, reason: ERROR_MASKED })));
        unavaliableTasks.push(...unavaliable);
      }

      // Avoid frequent network requests by the generator.
      if (!avaliable.length) await Promise.race([sleep(1500), waitUntilDownloadComplete]);

      for (const id of avaliable) {
        if (status429) {
          writeLog('Error', new Error('Http status: 429, wait for 30 seconds.'));
          await Promise.race([sleep(30000), waitUntilDownloadComplete]);
          status429 = false;
        }

        const artworkMeta = await parseMetaByArtworkId(id).catch(failedHanlderFactory(id));

        signal.throwIfAborted();
        if (!artworkMeta) continue;

        if (!filterWhenGenerateIngPage) {
          const isValid = await checkValidity(artworkMeta);
          if (!isValid) {
            addExcluded(id);
            await Promise.race([sleep(1000), waitUntilDownloadComplete]);
            continue;
          }
        }

        writeLog('Add', id);

        const taskId = generateTaskID(id);
        const processDownload = downloadByArtworkId(artworkMeta, taskId)
          .then(function handleSucccess() {
            !signal.aborted && addSuccessd(id);
          }, failedHanlderFactory(id))
          .finally(function removeTask() {
            const idx = tasks.findIndex((storeId) => storeId === id);
            idx !== -1 && tasks.splice(idx, 1);
          });

        tasks.push(taskId);
        dlPromise.push(processDownload);

        if (dlPromise.length >= THRESHOLD) {
          await Promise.race([...dlPromise, waitUntilDownloadComplete]);
          dlPromise.length = 0;
        } else {
          await Promise.race([sleep(1000), waitUntilDownloadComplete]);
        }
      }
    }

    return waitUntilDownloadComplete;
  }

  function abort() {
    controller && controller.abort(new CancelError());
  }

  function generateTaskID(id: string): string {
    return id + '_' + Math.random().toString(36).slice(2);
  }

  useBatchDownload = () => {
    return {
      ...readonlyStore,
      batchDownload,
      abort
    };
  };
}
