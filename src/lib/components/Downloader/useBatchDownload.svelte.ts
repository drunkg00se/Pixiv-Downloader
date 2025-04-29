import { logger } from '@/lib/logger';
import { CancelError, InvalidPostError, PermissionError, RequestError } from '@/lib/error';
import { sleep } from '@/lib/util';
import type { MediaMeta } from '@/sites/base/parser';
import PQueue from 'p-queue';
import { useChannel } from './useChannel';
import {
  batchDownloaderStore,
  type BatchDownloaderState
} from '@/lib/store/batchDownloader.svelte';

export type YieldArtwork<IdOrMeta extends string | MediaMeta<string | string[]>> = {
  total: number;
  page: number;
  avaliable: IdOrMeta[];
  invalid: IdOrMeta[];
  unavaliable: IdOrMeta[];
};

type CustomTagFilter = (blacklistedTags: string[], tags: string[]) => boolean;

type FilterFn<ArtworkMeta extends MediaMeta<string | string[]>> = (
  artworkMeta: Partial<ArtworkMeta>
) => boolean | Promise<boolean>;

export type ValidatedArtworkGenerator<
  ArtworkMeta extends MediaMeta<string | string[]>,
  RestArgs = undefined
> = (
  pageRange: [start: number, end: number] | null,
  checkValidity: (meta: Partial<ArtworkMeta>) => Promise<boolean>,
  ...restArgs: RestArgs extends unknown[] ? RestArgs : [RestArgs]
) =>
  | Generator<YieldArtwork<ArtworkMeta>, void, undefined>
  | Generator<YieldArtwork<string>, void, undefined>
  | AsyncGenerator<YieldArtwork<ArtworkMeta>, void, undefined>
  | AsyncGenerator<YieldArtwork<string>, void, undefined>;

export type ArtworkGenerator<RestArgs = undefined> = (
  pageRange: [start: number, end: number] | null,
  ...restArgs: RestArgs extends unknown[] ? RestArgs : [RestArgs]
) =>
  | Generator<YieldArtwork<string>, void, undefined>
  | AsyncGenerator<YieldArtwork<string>, void, undefined>;

type GeneratorOptionBase = {
  name: string | (() => string);
  match: string | ((url: string) => boolean) | RegExp;
  beforeDownload?(): void | Promise<void>;
  afterDownload?(): void;
};

type ValidatedArtworkGeneratorOption<ArtworkMeta extends MediaMeta<string | string[]>> =
  GeneratorOptionBase & {
    filterInGenerator: true;
    fn: ValidatedArtworkGenerator<ArtworkMeta, any[]>;
  };

type ArtworkGeneratorOption = GeneratorOptionBase & {
  filterInGenerator: false;
  fn: ArtworkGenerator<any[]>;
};

export type PageOption<ArtworkMeta extends MediaMeta<string | string[]>> = Record<
  string,
  ValidatedArtworkGeneratorOption<ArtworkMeta> | ArtworkGeneratorOption | GeneratorOptionBase
>;

type OmitNotGeneratorKey<
  ArtworkMeta extends MediaMeta<string | string[]>,
  P extends PageOption<ArtworkMeta>
> = {
  [K in keyof P]: P[K] extends ArtworkGeneratorOption
    ? K
    : P[K] extends ValidatedArtworkGeneratorOption<ArtworkMeta>
      ? K
      : never;
}[keyof P];

type DropFirstArg<F> = F extends (x: any, ...args: infer P) => any ? P : never;

type DropFirstAndSecondArg<F> = F extends (x: any, y: any, ...args: infer P) => any ? P : never;

type GetGeneratorParameters<
  Option,
  ArtworkMeta extends MediaMeta<string | string[]>
> = Option extends ArtworkGeneratorOption
  ? DropFirstArg<Option['fn']>
  : Option extends ValidatedArtworkGeneratorOption<ArtworkMeta>
    ? DropFirstAndSecondArg<Option['fn']>
    : never;

type BatchDownload<
  ArtworkMeta extends MediaMeta<string | string[]>,
  P extends PageOption<ArtworkMeta> = PageOption<ArtworkMeta>
> = {
  artworkCount: Readonly<ReactiveValue<number>>;
  successd: Readonly<ReactiveValue<string[]>>;
  failed: Readonly<ReactiveValue<FailedItem[]>>;
  excluded: Readonly<ReactiveValue<string[]>>;
  downloading: Readonly<ReactiveValue<boolean>>;
  log: Readonly<ReactiveValue<LogItem | undefined>>;
  batchDownload<K extends OmitNotGeneratorKey<ArtworkMeta, P>>(
    fnId: K,
    ...restArgs: GetGeneratorParameters<P[K], ArtworkMeta>
  ): Promise<void>;
  hasTask(signal: AbortSignal): boolean;
  abort(): void;
  getConcurrency(): number;
  setConcurrency(v?: number): void;
};

export type BatchDownloadDefinition<
  ArtworkMeta extends MediaMeta<string | string[]>,
  P extends PageOption<ArtworkMeta> = PageOption<ArtworkMeta>
> = () => BatchDownload<ArtworkMeta, P>;

export type BatchDownloadConfig<
  ArtworkMeta extends MediaMeta<string | string[]>,
  P extends PageOption<ArtworkMeta> = PageOption<ArtworkMeta>
> = {
  parseMetaByArtworkId: (id: string) => Promise<ArtworkMeta>;

  downloadArtworkByMeta(meta: ArtworkMeta, signal: AbortSignal): Promise<void>;

  beforeDownload?(): void | Promise<void>;

  afterDownload?(): void;

  onDownloadAbort?(): void;

  avatar?: string | ((url: string) => string | Promise<string>);

  filterOption: {
    filters: {
      id: string;
      type: 'include' | 'exclude';
      name: string | (() => string);
      checked: boolean;
      fn: FilterFn<ArtworkMeta>;
    }[];

    /**
     * true: use default filter
     * CustomTagFilter: use custom filter
     */
    enableTagFilter?: ArtworkMeta extends { tags: string[] } ? true | CustomTagFilter : never;
  };

  pageOption: P;
};

type FailedItem = {
  id: string;
  reason: unknown;
};

type LogItem = {
  type: 'Info' | 'Add' | 'Complete' | 'Fail' | 'Error';
  message: string;
};

const STATUS_CODES_TOO_MANY_REQUEST = 429;
const DOWNLOAD_RESUME_TIMEOUT = 30000;
const DEFAULT_CONCURRENCY = 5;

export function defineBatchDownload<
  T extends MediaMeta<string | string[]>,
  P extends PageOption<T> = PageOption<T>
>(downloaderConfig: BatchDownloadConfig<T, P>): BatchDownloadDefinition<T, P> {
  const { requestDownload, cancelDownloadRequest, processNextDownload } = useChannel();

  let batchDownloaderState: BatchDownloaderState | null = null;
  let artworkCount = $state(0);
  let successd = $state<string[]>([]);
  let failed = $state<FailedItem[]>([]);
  let excluded = $state<string[]>([]);
  let downloading = $state<boolean>(false);
  let log = $state<LogItem>();

  const failedIdTasks: string[] = [];
  const failedMetaTasks: T[] = [];
  const unavaliableIdTasks: string[] = [];
  const unavaliableMetaTasks: T[] = [];
  const includeFilters: FilterFn<T>[] = [];
  const excludeFilters: FilterFn<T>[] = [];

  let controller: AbortController | null;
  const taskControllers: Map<AbortSignal, AbortController> = new Map();
  const downloadQueue = new PQueue({
    concurrency: DEFAULT_CONCURRENCY,
    interval: 1100,
    intervalCap: 1
  });

  const batchDownloadStore = {
    artworkCount: {
      get current() {
        return artworkCount;
      }
    },

    successd: {
      get current() {
        return successd;
      }
    },

    failed: {
      get current() {
        return failed;
      }
    },

    excluded: {
      get current() {
        return excluded;
      }
    },

    downloading: {
      get current() {
        return downloading;
      }
    },

    log: {
      get current() {
        return log;
      }
    },

    batchDownload,

    abort() {
      controller && controller.abort(new CancelError());
    },

    hasTask(signal: AbortSignal) {
      return taskControllers.has(signal);
    },

    getConcurrency(): number {
      return downloadQueue.concurrency;
    },

    setConcurrency(num?: number) {
      if (typeof num === 'undefined') {
        downloadQueue.concurrency = DEFAULT_CONCURRENCY;
        return;
      }

      downloadQueue.concurrency = num;
    }
  };

  function isStringArray(arr: string[] | T[]): arr is string[] {
    return typeof arr[0] === 'string';
  }

  function reset() {
    artworkCount = 0;
    successd = [];
    failed = [];
    excluded = [];

    failedIdTasks.length = 0;
    unavaliableIdTasks.length = 0;
    failedMetaTasks.length = 0;
    unavaliableMetaTasks.length = 0;

    writeLog('Info', 'Reset store.');
  }

  function setDownloading(state: boolean) {
    if (downloading && state) {
      throw new Error('Already downloading.');
    }

    downloading = state;
  }

  function addSuccessd(idOrIdArr: string | string[]) {
    if (Array.isArray(idOrIdArr)) {
      successd.push(...idOrIdArr);
      writeLog('Complete', idOrIdArr[idOrIdArr.length - 1]);
    } else {
      successd.push(idOrIdArr);
      writeLog('Complete', idOrIdArr);
    }
  }

  function addFailed(item: FailedItem | FailedItem[]) {
    let failedItem: FailedItem;

    if (Array.isArray(item)) {
      failed.push(...item);
      failedItem = item[item.length - 1];
    } else {
      failed.push(item);
      failedItem = item;
    }

    const { id, reason } = failedItem;
    if (reason instanceof Error || typeof reason === 'string') {
      writeLog('Fail', id, reason);
    }
  }

  function addExcluded(idOrMeta: string | string[] | T | T[]) {
    if (Array.isArray(idOrMeta)) {
      isStringArray(idOrMeta)
        ? excluded.push(...idOrMeta)
        : excluded.push(...idOrMeta.map((meta) => meta.id));
      writeLog(
        'Info',
        `${idOrMeta.length + ' task' + (idOrMeta.length > 1 ? 's were' : ' was')} excluded...`
      );
    } else {
      const id = typeof idOrMeta === 'string' ? idOrMeta : idOrMeta.id;
      excluded.push(id);
      writeLog('Info', `${id} was excluded...`);
    }
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

    log = item;
  }

  function filterTag(partialMeta: Partial<T>, customTagFilter?: CustomTagFilter): boolean {
    if (!('tags' in partialMeta) || !Array.isArray(partialMeta.tags)) return true;

    const { whitelistTag, blacklistTag } = batchDownloaderState!;

    const defaultTagFilter = (userTags: string[], metaTags: string[]) =>
      userTags.some((tag) => metaTags.includes(tag));

    customTagFilter ??= defaultTagFilter;

    if (whitelistTag.length) {
      return customTagFilter(whitelistTag, partialMeta.tags);
    }

    if (blacklistTag.length) {
      return !customTagFilter(blacklistTag, partialMeta.tags);
    }

    return true;
  }

  async function checkValidity(partialMeta: Partial<T>): Promise<boolean> {
    try {
      const { enableTagFilter } = downloaderConfig.filterOption;
      if (enableTagFilter === true) {
        if (!filterTag(partialMeta)) return false;
      } else if (enableTagFilter) {
        if (!filterTag(partialMeta, enableTagFilter)) return false;
      }

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

  async function batchDownload<K extends OmitNotGeneratorKey<T, P>>(
    fnId: K,
    ...restArgs: GetGeneratorParameters<P[K], T>
  ) {
    setDownloading(true);

    writeLog('Info', 'Download start...');

    downloadQueue.start();

    batchDownloaderState = $state.snapshot(batchDownloaderStore.$state);

    const selectedFilters = batchDownloaderState.selectedFilters ?? [];
    selectedFilters.forEach((id) => {
      const filter = downloaderConfig.filterOption.filters.find((filter) => filter.id === id);
      if (filter) {
        if (filter.type === 'include') {
          includeFilters.push(filter.fn);
        } else {
          excludeFilters.push(filter.fn);
        }
      }
    });

    // reset store before download start, so we can still access store data after download finished.
    reset();

    const { beforeDownload, afterDownload } = downloaderConfig;

    let generatorAfterDownloadCb: (() => void) | undefined = undefined;

    let generator!: ReturnType<typeof getGenerator>;

    controller = new AbortController();

    const signal = controller.signal;

    signal.addEventListener(
      'abort',
      () => {
        cancelDownloadRequest(signal.reason);
        downloaderConfig.onDownloadAbort?.();
      },
      { once: true }
    );

    try {
      const pageIdItem = getGenPageIdItem(fnId);
      if (!pageIdItem || !('fn' in pageIdItem))
        throw new Error('Invalid generator id: ' + (fnId as string));

      const {
        filterInGenerator,
        beforeDownload: beforeDownloadInGenerator,
        afterDownload
      } = pageIdItem;
      generatorAfterDownloadCb = afterDownload;

      typeof beforeDownload === 'function' && (await beforeDownload());
      typeof beforeDownloadInGenerator === 'function' && (await beforeDownloadInGenerator());

      generator = getGenerator(pageIdItem, ...restArgs);

      writeLog('Info', 'Waiting for other downloads to finish...');
      await requestDownload();

      writeLog('Info', 'Starting...');
      await dispatchDownload(generator, filterInGenerator, signal);

      // retry failed downloads
      if (batchDownloaderState.retryFailed && (failedIdTasks.length || failedMetaTasks.length)) {
        if (failedIdTasks.length) {
          generator = getIdRetryGenerator(
            artworkCount,
            failedIdTasks.slice(),
            unavaliableIdTasks.slice()
          );

          failedIdTasks.length = 0;
          unavaliableIdTasks.length = 0;
        } else if (failedMetaTasks.length) {
          generator = getMetaRetryGenerator(
            artworkCount,
            failedMetaTasks.slice(),
            unavaliableMetaTasks.slice()
          );

          failedMetaTasks.length = 0;
          unavaliableMetaTasks.length = 0;
        }

        failed = [];

        writeLog('Info', 'Retry...');

        await dispatchDownload(generator, filterInGenerator, signal);
      }

      writeLog('Info', 'Download complete.');
    } catch (error) {
      generator?.return();

      // unexpected error, call `controller.abort()` to abort unfinished download
      if (!signal.aborted) {
        controller.abort(error);
      }

      if (error instanceof Error) {
        writeLog('Error', error);
      }

      throw error;
    } finally {
      typeof generatorAfterDownloadCb === 'function' && generatorAfterDownloadCb();
      typeof afterDownload === 'function' && afterDownload();

      controller = null;
      batchDownloaderState = null;
      includeFilters.length = 0;
      excludeFilters.length = 0;

      downloadQueue.pause();
      setDownloading(false);
      processNextDownload();
    }
  }

  function getGenPageIdItem(fnId: keyof P) {
    const { pageOption } = downloaderConfig;

    for (const key in pageOption) {
      if (key === fnId) {
        return pageOption[key];
      }
    }
  }

  function getGenerator(
    item: ValidatedArtworkGeneratorOption<T> | ArtworkGeneratorOption,
    ...restArgs: unknown[]
  ) {
    let generator: ReturnType<(typeof item)['fn']>;

    const { downloadAllPages, pageEnd, pageStart } = batchDownloaderState!;

    if (!downloadAllPages && pageEnd < pageStart)
      throw new Error('End page must not be less than the start page.');

    const pageRange: [start: number, end: number] | null = downloadAllPages
      ? null
      : [pageStart, pageEnd];

    if ('filterInGenerator' in item && !item.filterInGenerator) {
      generator = item.fn(pageRange, ...restArgs);
    } else {
      generator = item.fn(pageRange, checkValidity, ...restArgs);
    }

    return generator;
  }

  function* getIdRetryGenerator(
    total: number,
    failedArtworks: string[],
    unavaliableTasks: string[]
  ): Generator<YieldArtwork<string>, void, undefined> {
    yield {
      total,
      page: 0,
      avaliable: failedArtworks,
      invalid: [],
      unavaliable: unavaliableTasks
    };
  }

  function* getMetaRetryGenerator(
    total: number,
    failedArtworks: T[],
    unavaliableTasks: T[]
  ): Generator<YieldArtwork<T>, void, undefined> {
    yield {
      total,
      page: 0,
      avaliable: failedArtworks,
      invalid: [],
      unavaliable: unavaliableTasks
    };
  }

  async function dispatchDownload(
    generator: ReturnType<typeof getGenerator>,
    filterInGenerator: boolean,
    batchDownloadSignal: AbortSignal
  ) {
    batchDownloadSignal.throwIfAborted();

    const waitUntilDownloadReject = new Promise<void>((_, reject) => {
      batchDownloadSignal.addEventListener(
        'abort',
        () => {
          reject(batchDownloadSignal.reason);

          downloadQueue.size !== 0 && downloadQueue.clear();

          taskControllers.forEach((controller) => controller.abort(batchDownloadSignal.reason));
          taskControllers.clear();
        },
        { once: true }
      );
    });

    const { parseMetaByArtworkId, downloadArtworkByMeta } = downloaderConfig;

    let result:
      | IteratorResult<YieldArtwork<string>, void>
      | IteratorResult<YieldArtwork<T>, void>
      | void;

    while (
      (result = await Promise.race([generator.next(), waitUntilDownloadReject])) &&
      !result.done
    ) {
      batchDownloadSignal.throwIfAborted();

      const { total, avaliable, invalid, unavaliable } = result.value;

      logger.info(total, avaliable, invalid, unavaliable);

      if (total !== artworkCount) {
        artworkCount = total;
      }

      if (invalid.length) {
        addExcluded(invalid);
      }

      if (unavaliable.length) {
        if (isStringArray(unavaliable)) {
          addFailed(unavaliable.map((id) => ({ id, reason: new InvalidPostError(id) })));
          unavaliableIdTasks.push(...unavaliable);
        } else {
          addFailed(
            unavaliable.map((meta) => ({ id: meta.id, reason: new InvalidPostError(meta.id) }))
          );
          unavaliableMetaTasks.push(...unavaliable);
        }
      }

      if (!avaliable.length) {
        // Avoid frequent network requests by the generator.
        await Promise.race([sleep(1500), waitUntilDownloadReject]);
        continue;
      }

      for (const idOrMeta of avaliable) {
        const taskController = new AbortController();
        const taskSingal = taskController.signal;

        taskControllers.set(taskSingal, taskController);

        downloadQueue
          .add(
            async ({ signal: taskSingal }) => {
              if (!taskSingal)
                throw new Error(
                  'Expect `QueueAddOptions.signal` to be a AbortSignal but got undefined.'
                );

              const isId = typeof idOrMeta === 'string';
              const metaId = isId ? idOrMeta : idOrMeta.id;

              try {
                taskSingal.throwIfAborted();

                let artworkMeta: T;

                if (!isId) {
                  artworkMeta = idOrMeta;
                } else {
                  artworkMeta = await parseMetaByArtworkId(metaId);

                  taskSingal.throwIfAborted();

                  if (!filterInGenerator && !(await checkValidity(artworkMeta))) {
                    addExcluded(metaId);
                    return;
                  }
                }

                writeLog('Add', metaId);

                await downloadArtworkByMeta(artworkMeta, taskSingal);

                !taskSingal.aborted && addSuccessd(metaId);
              } catch (error) {
                if (taskSingal.aborted) return;

                addFailed({ id: metaId, reason: error });

                // stop batch download if we get permissionError
                if (error instanceof PermissionError) {
                  controller?.abort(error);
                  return;
                }

                const isInvalid = error instanceof InvalidPostError;
                if (isId) {
                  (isInvalid ? unavaliableIdTasks : failedIdTasks).push(idOrMeta);
                } else {
                  (isInvalid ? unavaliableMetaTasks : failedMetaTasks).push(idOrMeta);
                }

                if (
                  error instanceof RequestError &&
                  error.status === STATUS_CODES_TOO_MANY_REQUEST &&
                  !downloadQueue.isPaused
                ) {
                  // too many request, pause the download queue and resume is after 30 seconds.
                  downloadQueue.pause();

                  setTimeout(() => {
                    !batchDownloadSignal.aborted && downloadQueue.start();
                  }, DOWNLOAD_RESUME_TIMEOUT);

                  writeLog('Error', new Error('Http status: 429, wait for 30 seconds.'));
                }

                logger.error(error);
              }
            },
            { signal: taskSingal }
          )
          .catch(logger.warn)
          .finally(() => {
            taskControllers.delete(taskSingal);
          });
      }

      await Promise.race([waitUntilDownloadReject, downloadQueue.onEmpty()]);
    }

    return Promise.race([waitUntilDownloadReject, downloadQueue.onIdle()]);
  }

  return function batchDownloadDefinition() {
    return batchDownloadStore;
  };
}
