import { CancelError } from '@/lib/error';
import type { DownloadMeta } from '..';
import { type GmDownloadRequest, GM_download } from '$';

// 需要下载到子目录的场景
export function gmDownload(blob: Blob, downloadMeta: DownloadMeta): Promise<void> {
	return new Promise((resolve, reject) => {
		if (downloadMeta.isAborted) return reject(new CancelError());

		const imgUrl = URL.createObjectURL(blob);

		const request: GmDownloadRequest = {
			url: URL.createObjectURL(blob),
			name: downloadMeta.config.path,

			onerror: (error) => {
				URL.revokeObjectURL(imgUrl);

				// GM_download.abort()执行时会触发onerror
				if (downloadMeta.isAborted) {
					resolve();
				} else {
					reject(
						new Error(
							`FileSave error: ${downloadMeta.config.path} because ${error.error} ${error.details ?? ''} `
						)
					);
				}
			},

			onload: () => {
				URL.revokeObjectURL(imgUrl);
				resolve();
			}
		};

		downloadMeta.abort = GM_download(request).abort;
	});
}
