import { GM_xmlhttpRequest } from '$';
import { logger } from '@/lib/logger';
import { CancelError, RequestError, SafariRefererError, TimoutError } from '@/lib/error';
import { env } from '@/lib/env';
import { fileSaveAdapters } from './fileSaveAdapters';
import PQueue from 'p-queue';
import {
  selectRootDirHandle,
  type FilenameConflictAction
} from './fileSaveAdapters/fileSystemAccess';

type XhrResult = [Error, null] | [null, Blob];

type DownloadOption = { signal?: AbortSignal; priority?: number };

export type DownloaderHooks = {
  onProgress?: (progress: number, config: DownloadConfig) => void;
  onXhrLoaded?: (config: DownloadConfig) => void;
  beforeFileSave?: (
    blob: Blob,
    config: DownloadConfig,
    signal?: AbortSignal
  ) => Promise<Blob | void>;
  onFileSaved?: (config: DownloadConfig) => void;
  onError?: (err: Error, config: DownloadConfig) => void;
  onAbort?: (config: DownloadConfig) => void;
};

export type DownloadConfig = {
  taskId: string;
  useFileSystemAccessApi: boolean;
  src: string;
  path: string;
  timeout?: number;
  headers?: Record<string, string>;
  /**
   * @default 'uniquify'
   */
  filenameConflictAction?: FilenameConflictAction;
} & DownloaderHooks;

interface IDownloader {
  updateDirHandle: () => Promise<string>;
  download: (configs: DownloadConfig | DownloadConfig[], option?: DownloadOption) => Promise<void>;
}

class Downloader implements IDownloader {
  #DOWNLOAD_RETRY = 3;

  #downloadQueue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 4 });

  async updateDirHandle() {
    return (await selectRootDirHandle()).name;
  }

  #xhr(config: DownloadConfig, signal?: AbortSignal): Promise<XhrResult> {
    if (signal?.aborted) return Promise.resolve([signal.reason as Error, null]);

    const { src, onProgress, timeout, taskId, headers } = config;

    return new Promise((resolve) => {
      const abortObj = GM_xmlhttpRequest({
        url: src,
        method: 'GET',
        responseType: 'blob',
        timeout,
        headers,
        // Safari 平台限制：Tampermonkey 的原生 fetch/XHR 实现无法设置 Referer 等
        // 受限请求头（WebKit bug 253696，DNR modifyHeaders 对扩展自身的 fetch 无效），
        // 而 i.pximg.net 等图床依赖 Referer 鉴权，缺失时返回 403。
        // 设置 fetch: false 可切换到 Tampermonkey 自研的 Swift 网络实现
        // （由 App 内 NSURLSession 发送请求，不受 WebKit 受限头规则约束）。
        // @see https://github.com/Tampermonkey/tampermonkey/issues/2253
        ...(env.isSafari() ? { fetch: false } : {}),

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
            // Safari 上 403 大概率是 Referer 未能发出（见上方 fetch: false 注释），
            // 抛出带明确原因的错误，避免用户只看到一串 URL。
            if (status === 403 && env.isSafari()) {
              resolve([new SafariRefererError(src, status), null]);
              return;
            }

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

  async #dispatchDownload(
    config: DownloadConfig,
    priority: number = 0,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const { src, taskId, path, useFileSystemAccessApi, filenameConflictAction } = config;

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

      const saveFile = fileSaveAdapters.getAdapter(useFileSystemAccessApi, filenameConflictAction);

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

  async download(configs: DownloadConfig | DownloadConfig[], option: DownloadOption = {}) {
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
