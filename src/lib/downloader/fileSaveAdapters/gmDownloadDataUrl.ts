import { CancelError } from '@/lib/error';
import type { DownloadMeta } from '..';
import { type GmDownloadRequest, GM_download } from '$';
import { readBlobAsDataUrl } from '@/lib/util';

// firefox 将动图保存到子目录
export function gmDownloadDataUrl(blob: Blob, downloadMeta: DownloadMeta): Promise<void> {
  return readBlobAsDataUrl(blob).then((dataUrl) => {
    return new Promise((resolve, reject) => {
      if (downloadMeta.isAborted) return reject(new CancelError());

      const request: GmDownloadRequest = {
        url: dataUrl,
        name: downloadMeta.config.path,

        onerror: (error) => {
          // GM_download.abort()执行时会触发onerror
          if (downloadMeta.isAborted) {
            resolve();
          } else {
            console.error(error);
            reject(new Error(`FileSave error: ${downloadMeta.config.path}`));
          }
        },

        onload: () => {
          resolve();
        }
      };

      downloadMeta.abort = GM_download(request).abort;
    });
  });
}
