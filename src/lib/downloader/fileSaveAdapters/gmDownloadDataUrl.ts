import { GM_download } from '$';
import { logger } from '@/lib/logger';
import { readBlobAsDataUrl } from '@/lib/util';

// firefox 将动图保存到子目录
export function gmDownloadDataUrl(blob: Blob, path: string, signal?: AbortSignal): Promise<void> {
  return readBlobAsDataUrl(blob).then((dataUrl) => {
    signal?.throwIfAborted();

    return new Promise((resolve, reject) => {
      const abortObj = GM_download({
        url: dataUrl,
        name: path,

        onerror: (error) => {
          // GM_download.abort()执行时会触发onerror
          if (signal?.aborted) {
            resolve();
          } else {
            logger.error(error);
            reject(new Error(`FileSave error: ${path}`));
          }
        },

        onload: () => {
          resolve();
        }
      });

      signal?.addEventListener('abort', () => abortObj.abort(), { once: true });
    });
  });
}
