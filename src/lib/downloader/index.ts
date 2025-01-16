import { GM_xmlhttpRequest } from '$';
import { logger } from '@/lib/logger';
import { CancelError, RequestError, TimoutError } from '@/lib/error';
import { fileSaveAdapters } from './fileSaveAdapters';
import PQueue from 'p-queue';

type XhrResult = [Error, null] | [null, Blob];

type DownloadOption = { signal?: AbortSignal; priority?: number };

export type DownloaderHooks<T> = {
  onProgress?: (progress: number, config: DownloadConfig<T>) => void;
  onXhrLoaded?: (config: DownloadConfig<T>) => void;
  beforeFileSave?: (blob: Blob, config: DownloadConfig<T>) => Promise<Blob | void>;
  onFileSaved?: (config: DownloadConfig<T>) => void;
  onError?: (err: Error, config: DownloadConfig<T>) => void;
  onAbort?: (config: DownloadConfig<T>) => void;
};

export type DownloadConfig<T> = {
  taskId: string;
  src: string;
  path: string;
  source: T;
  timeout?: number;
  headers?: Record<string, string>;
} & DownloaderHooks<T>;

interface IDownloader {
  fileSystemAccessEnabled: Readonly<boolean>;
  dirHandleCheck: () => void;
  updateDirHandle: () => Promise<string>;
  getCurrentFsaDirName: () => string;
  download: <T>(
    configs: DownloadConfig<T> | DownloadConfig<T>[],
    option?: DownloadOption
  ) => Promise<void>;
}

class Downloader implements IDownloader {
  #DOWNLOAD_RETRY = 3;

  #downloadQueue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 4 });

  get fileSystemAccessEnabled() {
    return fileSaveAdapters.isFileSystemAccessEnable();
  }

  /**
   * 下载触发后应该先弹窗选择文件保存位置，避免下载/转换用时过长导致错误
   * Must be handling a user gesture to show a file picker.
   * https://bugs.chromium.org/p/chromium/issues/detail?id=1193489
   */
  dirHandleCheck() {
    fileSaveAdapters.dirHandleCheck();
  }

  updateDirHandle() {
    return fileSaveAdapters.updateDirHandle();
  }

  getCurrentFsaDirName() {
    return fileSaveAdapters.getFsaDirName();
  }

  #xhr<T>(config: DownloadConfig<T>, signal?: AbortSignal): Promise<XhrResult> {
    if (signal?.aborted) return Promise.resolve([signal.reason as Error, null]);

    const { src, onProgress, timeout, taskId, headers } = config;

    return new Promise((resolve) => {
      const abortObj = GM_xmlhttpRequest({
        url: src,
        method: 'GET',
        responseType: 'blob',
        timeout,
        headers,

        ontimeout() {
          resolve([new TimoutError(`${taskId} | ${src}`), null]);
        },

        onerror(error) {
          let err;

          if (error.status === 429) {
            err = new RequestError(config.src, error.status);
          } else {
            err = new Error(`Download failed. ID: ${taskId}.`);
          }

          resolve([err, null]);
        },

        onprogress(res) {
          if (res.loaded > 0 && res.total > 0) {
            const progress = Math.floor((res.loaded / res.total) * 100);
            onProgress?.(progress, config);
          }
        },

        onload(res) {
          const { status, statusText, finalUrl } = res;

          if (status < 200 || status > 299) {
            resolve([new RequestError(statusText + ' ' + finalUrl, status), null]);
            return;
          }

          resolve([null, res.response]);
        }
      });

      signal?.addEventListener(
        'abort',
        () => {
          abortObj.abort();
          resolve([signal.reason as Error, null]);
        },
        { once: true }
      );
    });
  }

  async #dispatchDownload<T>(
    config: DownloadConfig<T>,
    priority: number = 0,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const { src, taskId, path } = config;

      const result = await this.#downloadQueue.add(
        async ({ signal }) => {
          signal?.throwIfAborted();

          logger.info('Download start:', src);

          let result: Blob;
          let retryCount = 0;

          do {
            const xhrResult = await this.#xhr(config, signal);

            signal?.throwIfAborted();

            if (xhrResult[0] === null) {
              result = xhrResult[1];
              break;
            } else {
              const err = xhrResult[0];
              if (!(err instanceof TimoutError) || ++retryCount > this.#DOWNLOAD_RETRY) {
                throw err;
              } else {
                logger.error(`Download will be retried. Count: ${retryCount}.`, err);
              }
            }
          } while (retryCount <= this.#DOWNLOAD_RETRY);

          return result!;
        },
        { signal, priority }
      );

      // result won't be void because we does not set `options.timeout`;
      if (!result) throw new TimoutError(`${taskId} | ${src}`);

      logger.info('Xhr complete:', src);

      config.onXhrLoaded?.(config);

      const saveFile = fileSaveAdapters.getAdapter();

      // 存在beforeFileSave函数时，返回该函数的返回值。
      // 若无返回值，则不保存文件。
      // 不存在beforeFileSave函数时，直接保存result。
      if (typeof config.beforeFileSave === 'function') {
        const modifiedResult = await config.beforeFileSave(result, config);

        signal?.throwIfAborted();

        if (!modifiedResult) return;

        await saveFile(modifiedResult, path, signal);
      } else {
        await saveFile(result, path, signal);
      }

      config.onFileSaved?.(config);

      logger.info('Download complete:', path);
    } catch (error) {
      if (error instanceof CancelError) {
        config.onAbort?.(config);
      } else {
        config.onError?.(error as Error, config);
      }

      throw error;
    }
  }

  async download<T>(configs: DownloadConfig<T> | DownloadConfig<T>[], option: DownloadOption = {}) {
    const { signal, priority } = option;

    signal?.throwIfAborted();

    logger.info('Downloader add:', configs);

    if (!Array.isArray(configs)) configs = [configs];
    if (configs.length < 1) return;

    const downloads = configs.map((config) => {
      return this.#dispatchDownload(config, priority, signal);
    });

    const downloadResult = await Promise.allSettled(downloads);

    for (const result of downloadResult) {
      if (result.status === 'rejected') throw result.reason;
    }
  }
}

export const downloader = new Downloader();
