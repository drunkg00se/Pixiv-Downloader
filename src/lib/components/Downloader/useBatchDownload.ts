import { writable, derived, readonly, type Readable } from 'svelte/store';
import optionStore from './store';
import type { RegisterConfig, GenPageId } from './DownloaderRegisterConfig';
import { logger } from '@/lib/logger';
import { CancelError, RequestError } from '@/lib/error';
import { sleep } from '@/lib/util';

interface FailedItem {
  id: string;
  reason: any;
}

interface LogItem {
  type: 'Info' | 'Add' | 'Complete' | 'Fail' | 'Error';
  message: string;
}

export let useBatchDownload: () => {
  artworkCount: Readable<number | null>;
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

export function defineBatchDownload(downloaderConfig: RegisterConfig<any, true | undefined>) {
  const artworkCount = writable<number | null>(0);
  const successd = writable<string[]>([]);
  const failed = writable<FailedItem[]>([]);
  const excluded = writable<string[]>([]);
  const downloading = writable<boolean>(false);
  const log = writable<LogItem>();

  const tasks: string[] = [];
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

  let $pageStart!: number | null;
  let $pageEnd!: number | null;
  let $blacklistTag: string[] = [];
  let $whitelistTag: string[] = [];

  const includeFilters: ((artworkMeta: Partial<any>) => boolean | Promise<boolean>)[] = [];
  const excludeFilters: ((artworkMeta: Partial<any>) => boolean | Promise<boolean>)[] = [];

  const { selectedFilters, blacklistTag, whitelistTag, downloadAllPages, pageStart, pageEnd } =
    optionStore;

  const watchPageRange = derived([downloadAllPages, pageStart, pageEnd], (data) => data);
  watchPageRange.subscribe(([downloadAllPages, pageStart, pageEnd]) => {
    // update page range
    if (downloadAllPages) {
      $pageStart = null;
      $pageEnd = null;
    } else {
      $pageStart = pageStart;
      $pageEnd = pageEnd;
    }
  });

  selectedFilters.subscribe((selected) => {
    if (!selected) return;
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

  const checkIfDownloadCompleted = derived(
    [artworkCount, successd, failed, excluded],
    ([$artworkCount, $successd, $failed, $excluded]) => {
      if ($artworkCount === null) false;
      return $artworkCount === $successd.length + $failed.length + $excluded.length;
    }
  );
  checkIfDownloadCompleted.subscribe((isDone) => {
    // resolve waitUntilDownloadComplete when download completed.
    isDone && downloadCompleted?.();
  });

  function reset() {
    artworkCount.set(null);
    successd.set([]);
    failed.set([]);
    excluded.set([]);
    tasks.length = 0;
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
      } else {
        logger.error(id, reason);
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

    try {
      const generator = getGenerator(fnId, ...restArgs);
      generator && (await dispatchDownload(generator, signal));
      writeLog('Info', 'Download complete.');
    } catch (error) {
      // unexpected error, call `controller.abort()` to abort unfinished download
      if (!signal.aborted) {
        controller.abort(error);
      }

      if (error instanceof Error) {
        writeLog('Error', error);
      }
    }

    setDownloading(false);
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

    const { filterWhenGenerateIngPage } = downloaderConfig.filterOption;
    const pageRange: [start: number | null, end: number | null] | null =
      $pageStart === null && $pageEnd === null ? null : [$pageStart, $pageEnd];

    if (filterWhenGenerateIngPage) {
      generator = (genFn as GenPageId<any, any, true>)(pageRange, checkValidity, ...restArgs);
    } else {
      generator = (genFn as GenPageId<any, any, undefined>)(pageRange, ...restArgs);
    }

    return generator;
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

    signal.addEventListener(
      'abort',
      () => {
        downloadAbort?.(new CancelError());
        downloaderConfig.onDownloadAbort(tasks);
      },
      { once: true }
    );

    const THRESHOLD = 5;
    const { parseMetaByArtworkId, downloadByArtworkId } = downloaderConfig;
    const { filterWhenGenerateIngPage } = downloaderConfig.filterOption;
    const dlPromise: Promise<void>[] = [];
    let status429: boolean = false;

    // TODO: 处理生成器错误
    // TODO: race waitUntilDownloadComplete while waiting for generator.next();
    for await (const { total, avaliable, invalid, unavaliable } of generator) {
      logger.info(total, avaliable, invalid, unavaliable);

      signal.throwIfAborted();

      // update artwork count store
      setArtworkCount(total);
      invalid.length && addExcluded(invalid);
      unavaliable.length && addFailed(unavaliable.map((id) => ({ id, reason: 'Masked.' })));

      for (const id of avaliable) {
        if (status429) {
          writeLog('Error', new Error('Http status: 429'));
          await Promise.race([sleep(30000), waitUntilDownloadComplete]);
          status429 = false;
        }

        const artworkMeta = await parseMetaByArtworkId(id).catch(function handleFailed(
          reason: any
        ) {
          if (!signal.aborted) {
            addFailed({ id, reason });
            reason && logger.error(reason);
          }
        });

        signal.throwIfAborted();
        if (!artworkMeta) continue;

        if (!filterWhenGenerateIngPage) {
          const isValid = await checkValidity(artworkMeta);
          if (!isValid) {
            addExcluded(id);
            continue;
          }
        }

        writeLog('Add', id);

        const taskId = generateTaskID(id);
        const processDownload = downloadByArtworkId(artworkMeta, taskId)
          .then(
            function handleSucccess() {
              !signal.aborted && addSuccessd(id);
            },
            function handleFailed(reason) {
              if (!signal.aborted) {
                addFailed({ id, reason });
                reason && logger.error(reason);

                if (reason instanceof RequestError && reason.response.status === 429) {
                  status429 = true;
                }
              }
            }
          )
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
