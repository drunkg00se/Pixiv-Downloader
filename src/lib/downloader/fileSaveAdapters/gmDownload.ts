import { GM_download } from '$';
import { logger } from '@/lib/logger';

// 需要下载到子目录的场景
export function gmDownload(blob: Blob, path: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();

    const imgUrl = URL.createObjectURL(blob);

    const abortObj = GM_download({
      url: URL.createObjectURL(blob),
      name: path,

      onerror: (error) => {
        URL.revokeObjectURL(imgUrl);

        // GM_download.abort()执行时会触发onerror
        if (signal?.aborted) {
          resolve();
        } else {
          logger.error(error);
          reject(new Error(`FileSave error: ${path}`));
        }
      },

      onload: () => {
        URL.revokeObjectURL(imgUrl);
        resolve();
      }
    });

    signal?.addEventListener('abort', () => abortObj.abort(), { once: true });
  });
}
