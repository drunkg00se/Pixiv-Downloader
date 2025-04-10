import { writable, derived, readonly, type Readable, get } from 'svelte/store';
import optionStore from './store';
import { logger } from '@/lib/logger';
import { CancelError, RequestError } from '@/lib/error';
import { sleep } from '@/lib/util';
import type { MediaMeta } from '@/sites/base/parser';
import PQueue from 'p-queue';
import { useChannel } from './useChannel';

export interface YieldArtwork<IdOrMeta extends string | MediaMeta<string | string[]>> {
  total: number;
  page: number;
  avaliable: IdOrMeta[];
  invalid: IdOrMeta[];
  unavaliable: IdOrMeta[];
}

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

interface GeneratorOptionBase {
  name: string | (() => string);
  match: string | ((url: string) => boolean) | RegExp;
  beforeDownload?(): void | Promise<void>;
  afterDownload?(): void;
}

interface ValidatedArtworkGeneratorOption<ArtworkMeta extends MediaMeta<string | string[]>>
  extends GeneratorOptionBase {
  filterInGenerator: true;
  fn: ValidatedArtworkGenerator<ArtworkMeta, any[]>;
}

interface ArtworkGeneratorOption extends GeneratorOptionBase {
  filterInGenerator: false;
  fn: ArtworkGenerator<any[]>;
}

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

interface BatchDownload<
  ArtworkMeta extends MediaMeta<string | string[]>,
  P extends PageOption<ArtworkMeta> = PageOption<ArtworkMeta>
> {
  artworkCount: Readable<number>;
  successd: Readable<string[]>;
  failed: Readable<FailedItem[]>;
  excluded: Readable<string[]>;
  downloading: Readable<boolean>;
  log: Readable<LogItem>;
  batchDownload<K extends OmitNotGeneratorKey<ArtworkMeta, P>>(
    fnId: K,
    ...restArgs: GetGeneratorParameters<P[K], ArtworkMeta>
  ): Promise<void>;
  abort(): void;
}

export interface BatchDownloadDefinition<
  ArtworkMeta extends MediaMeta<string | string[]>,
  P extends PageOption<ArtworkMeta> = PageOption<ArtworkMeta>
> {
  (): BatchDownload<ArtworkMeta, P>;
}

export interface BatchDownloadConfig<
  ArtworkMeta extends MediaMeta<string | string[]>,
  P extends PageOption<ArtworkMeta> = PageOption<ArtworkMeta>
> {
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
}

interface FailedItem {
  id: string;
  reason: unknown;
}

interface LogItem {
  type: 'Info' | 'Add' | 'Complete' | 'Fail' | 'Error';
  message: string;
}

const ERROR_MASKED = 'Masked.';

export function defineBatchDownload<
  T extends MediaMeta<string | string[]>,
  P extends PageOption<T> = PageOption<T>
>(downloaderConfig: BatchDownloadConfig<T, P>): BatchDownloadDefinition<T, P> {
  const { requestDownload, cancelDownloadRequest, processNextDownload } = useChannel();

  const artworkCount = writable<number>(0);
  const successd = writable<string[]>([]);
  const failed = writable<FailedItem[]>([]);
  const excluded = writable<string[]>([]);
  const downloading = writable<boolean>(false);
  const log = writable<LogItem>();

  const failedIdTasks: string[] = [];
  const unavaliableIdTasks: string[] = [];
  const failedMetaTasks: T[] = [];
  const unavaliableMetaTasks: T[] = [];

  let controller: AbortController | null;
  const taskControllers: Set<AbortController> = new Set();

  const downloadQueue = new PQueue({ concurrency: 5, interval: 1100, intervalCap: 1 });

  let resolveDownload: () => void;
  let rejectDownload: (reason?: unknown) => void;

  let $pageStart!: number;
  let $pageEnd!: number;
  let $downloadAllPages: boolean;
  let $blacklistTag: string[] = [];
  let $whitelistTag: string[] = [];
  let $retryFailed: boolean = false;

  const includeFilters: FilterFn<T>[] = [];
  const excludeFilters: FilterFn<T>[] = [];

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
    isDone && resolveDownload?.();
  });

  function isStringArray(arr: string[] | T[]): arr is string[] {
    return typeof arr[0] === 'string';
  }

  function reset() {
    artworkCount.set(0);
    successd.set([]);
    failed.set([]);
    excluded.set([]);

    failedIdTasks.length = 0;
    unavaliableIdTasks.length = 0;
    failedMetaTasks.length = 0;
    unavaliableMetaTasks.length = 0;

    controller = null;
    downloadQueue.size !== 0 && downloadQueue.clear();
    taskControllers.size !== 0 && taskControllers.clear();

    // may be paused by http status 429, so we need to start it.
    downloadQueue.start();

    resolveDownload = () => {};
    rejectDownload = () => {};

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
      let reason: unknown;

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

  function addExcluded(idOrMeta: string | string[] | T | T[]) {
    excluded.update((val) => {
      if (Array.isArray(idOrMeta)) {
        isStringArray(idOrMeta)
          ? val.push(...idOrMeta)
          : val.push(...idOrMeta.map((meta) => meta.id));
        writeLog(
          'Info',
          `${idOrMeta.length + ' task' + (idOrMeta.length > 1 ? 's were' : ' was')} excluded...`
        );
      } else {
        const id = typeof idOrMeta === 'string' ? idOrMeta : idOrMeta.id;
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

  function filterTag(partialMeta: Partial<T>, customTagFilter?: CustomTagFilter): boolean {
    if (!('tags' in partialMeta) || !Array.isArray(partialMeta.tags)) return true;

    const defaultTagFilter = (userTags: string[], metaTags: string[]) =>
      userTags.some((tag) => metaTags.includes(tag));

    customTagFilter ??= defaultTagFilter;

    if ($whitelistTag.length) {
      return customTagFilter($whitelistTag, partialMeta.tags);
    }

    if ($blacklistTag.length) {
      return !customTagFilter($blacklistTag, partialMeta.tags);
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

    // reset store before download start, so we can still access store data after download finished.
    reset();

    const { beforeDownload, afterDownload } = downloaderConfig;

    let generatorAfterDownloadCb: (() => void) | undefined = undefined;

    let downloadError: unknown = null;

    let generator!: ReturnType<typeof getGenerator>;

    controller = new AbortController();

    const signal = controller.signal;

    signal.addEventListener(
      'abort',
      () => {
        downloadQueue.size !== 0 && downloadQueue.clear();

        taskControllers.forEach((controller) => controller.abort(signal.reason));
        taskControllers.clear();

        cancelDownloadRequest(signal.reason);
        rejectDownload?.(signal.reason);

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
        beforeDownload: generaotrBeforeDownloadCb,
        afterDownload
      } = pageIdItem;
      generatorAfterDownloadCb = afterDownload;

      typeof beforeDownload === 'function' && (await beforeDownload());
      typeof generaotrBeforeDownloadCb === 'function' && (await generaotrBeforeDownloadCb());

      generator = getGenerator(pageIdItem, ...restArgs);

      writeLog('Info', 'Waiting for other downloads to finish...');
      await requestDownload();

      writeLog('Info', 'Starting...');
      await dispatchDownload(generator, filterInGenerator, signal);

      // retry failed downloads
      if ($retryFailed && (failedIdTasks.length || failedMetaTasks.length)) {
        if (failedIdTasks.length) {
          generator = getIdRetryGenerator(
            get(artworkCount),
            failedIdTasks.slice(),
            unavaliableIdTasks.slice()
          );

          failedIdTasks.length = 0;
          unavaliableIdTasks.length = 0;
        } else if (failedMetaTasks.length) {
          generator = getMetaRetryGenerator(
            get(artworkCount),
            failedMetaTasks.slice(),
            unavaliableMetaTasks.slice()
          );

          failedMetaTasks.length = 0;
          unavaliableMetaTasks.length = 0;
        }

        failed.set([]);

        writeLog('Info', 'Retry...');

        await dispatchDownload(generator, filterInGenerator, signal);
      }

      writeLog('Info', 'Download complete.');
    } catch (error) {
      downloadError = error;

      generator?.return();

      // unexpected error, call `controller.abort()` to abort unfinished download
      if (!signal.aborted) {
        controller.abort(error);
      }

      if (error instanceof Error) {
        writeLog('Error', error);
      }
    }

    typeof generatorAfterDownloadCb === 'function' && generatorAfterDownloadCb();
    typeof afterDownload === 'function' && afterDownload();

    setDownloading(false);
    processNextDownload();

    if (downloadError) throw downloadError;
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

    if (!$downloadAllPages && $pageEnd < $pageStart)
      throw new Error('End page must not be less than the start page.');

    const pageRange: [start: number, end: number] | null = $downloadAllPages
      ? null
      : [$pageStart, $pageEnd];

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

    const waitUntilDownloadComplete = new Promise<void>((resolve, reject) => {
      resolveDownload = resolve;
      rejectDownload = reject;
    });

    const { parseMetaByArtworkId, downloadArtworkByMeta } = downloaderConfig;

    let result:
      | IteratorResult<YieldArtwork<string>, void>
      | IteratorResult<YieldArtwork<T>, void>
      | void;

    while (
      (result = await Promise.race([generator.next(), waitUntilDownloadComplete])) &&
      !result.done
    ) {
      batchDownloadSignal.throwIfAborted();

      const { total, avaliable, invalid, unavaliable } = result.value;

      logger.info(total, avaliable, invalid, unavaliable);

      // Update artwork count store
      setArtworkCount(total);
      invalid.length && addExcluded(invalid);

      if (unavaliable.length) {
        if (isStringArray(unavaliable)) {
          addFailed(unavaliable.map((id) => ({ id, reason: ERROR_MASKED })));
          unavaliableIdTasks.push(...unavaliable);
        } else {
          addFailed(unavaliable.map((meta) => ({ id: meta.id, reason: ERROR_MASKED })));
          unavaliableMetaTasks.push(...unavaliable);
        }
      }

      if (!avaliable.length) {
        // Avoid frequent network requests by the generator.
        await Promise.race([sleep(1500), waitUntilDownloadComplete]);
        continue;
      }

      for (const idOrMeta of avaliable) {
        const taskController = new AbortController();
        const taskSingal = taskController.signal;

        taskControllers.add(taskController);

        downloadQueue
          .add(
            async ({ signal: taskSingal }) => {
              if (!taskSingal)
                throw new Error(
                  'Expect `QueueAddOptions.signal` to be a AbortSignal but got undefined.'
                );

              try {
                taskSingal.throwIfAborted();

                let artworkMeta: T;
                let metaId: string;

                if (typeof idOrMeta !== 'string') {
                  artworkMeta = idOrMeta;
                  metaId = artworkMeta.id;
                } else {
                  metaId = idOrMeta;

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

                const isFailedTask = error !== ERROR_MASKED;

                if (typeof idOrMeta === 'string') {
                  addFailed({ id: idOrMeta, reason: error });
                  isFailedTask && failedIdTasks.push(idOrMeta);
                } else {
                  addFailed({ id: idOrMeta.id, reason: error });
                  isFailedTask && failedMetaTasks.push(idOrMeta);
                }

                if (
                  error instanceof RequestError &&
                  error.status === 429 &&
                  !downloadQueue.isPaused
                ) {
                  // too many request, pause the download queue and resume is after 30 seconds.
                  downloadQueue.pause();

                  setTimeout(() => {
                    !batchDownloadSignal.aborted && downloadQueue.start();
                  }, 30000);

                  writeLog('Error', new Error('Http status: 429, wait for 30 seconds.'));
                }

                logger.error(error);
              }
            },
            { signal: taskSingal }
          )
          .catch(logger.warn)
          .finally(() => {
            taskControllers.delete(taskController);
          });
      }

      await downloadQueue.onEmpty();
    }

    return waitUntilDownloadComplete;
  }

  function abort() {
    controller && controller.abort(new CancelError());
  }

  function batchDownloadDefinition() {
    return batchDownloadStore;
  }

  const batchDownloadStore = {
    artworkCount: readonly(artworkCount),
    successd: readonly(successd),
    failed: readonly(failed),
    excluded: readonly(excluded),
    downloading: readonly(downloading),
    log: readonly(log),
    batchDownload,
    abort
  };

  return batchDownloadDefinition;
}
