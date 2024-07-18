import { GM_download, GM_xmlhttpRequest } from '$';
import { logger } from '@/lib/logger';
import { sleep } from '@/lib/util';
import { CancelError, RequestError } from '@/lib/error';
import { fileSaveAdapters } from './fileSaveAdapters';

export interface DownloaderHooks<T> {
	onProgress?: (progress: number, config: DownloadConfig<T>) => void;

	// 仅GM_xmlhttpRequest
	onXhrLoaded?: (config: DownloadConfig<T>) => void;

	// 仅GM_xmlhttpRequest
	beforeFileSave?: (blob: Blob, config: DownloadConfig<T>) => Promise<Blob | void>;

	onFileSaved?: (config: DownloadConfig<T>) => void;
	onError?: (err: Error, config: DownloadConfig<T>) => void;
	onAbort?: (config: DownloadConfig<T>) => void;
}

interface DownloadConfigBase<T> {
	taskId: string;
	src: string;
	path: string;
	source: T;
	timeout?: number;
	headers?: Record<string, string>;
}

interface DirectSaveConfig<T> extends DownloadConfigBase<T> {
	directSave: true;
	onProgress?: DownloaderHooks<T>['onProgress'];
	onFileSaved?: DownloaderHooks<T>['onFileSaved'];
	onError?: DownloaderHooks<T>['onError'];
	onAbort?: DownloaderHooks<T>['onAbort'];
}

interface XhrConfig<T> extends DownloadConfigBase<T>, DownloaderHooks<T> {
	directSave?: false;
}

export type DownloadConfig<T> = DirectSaveConfig<T> | XhrConfig<T>;

export interface DownloadMeta<T = DownloadConfig<any>> {
	taskId: string;
	config: T;
	retry: number;
	isAborted: boolean;
	timeout?: number;
	resolve: (val: string) => void;
	reject: (err: Error) => void;
	abort?: () => void;
}

interface ErrorHandler {
	ontimeout: () => void;
	onerror: (error: { error: string }) => void;
}

interface Downloader {
	fileSystemAccessEnabled: Readonly<boolean>;
	dirHandleCheck: () => void;
	updateDirHandle: () => Promise<string>;
	getCurrentFsaDirName: () => string;
	download: <T>(configs: DownloadConfig<T> | DownloadConfig<T>[]) => Promise<string[]>;
	abort: (taskIds: string | string[]) => void;
}

function createDownloader(): Downloader {
	const MAX_DOWNLOAD = 5;
	const MAX_RETRY = 3;
	const DOWNLOAD_INTERVAL = 500;

	let queue: DownloadMeta[] = [];
	let active: DownloadMeta[] = [];

	const cleanAndStartNext = (removeMeta: DownloadMeta, nextMeta?: DownloadMeta) => {
		sleep(DOWNLOAD_INTERVAL).then(() => {
			active.splice(active.indexOf(removeMeta), 1);

			if (nextMeta) {
				active.push(nextMeta);
				dispatchDownload(nextMeta);
			} else if (queue.length) {
				const meta = queue.shift()!;
				active.push(meta);
				dispatchDownload(meta);
			}
		});
	};

	const errorHandlerFactory = (downloadMeta: DownloadMeta): ErrorHandler => {
		return {
			ontimeout(): void {
				const { taskId, config, isAborted } = downloadMeta;
				if (isAborted) return;

				downloadMeta.retry++;
				logger.error('Download timeout', downloadMeta.retry, ':', config.src);

				if (downloadMeta.retry > MAX_RETRY) {
					const err = new Error(`Download failed: ${taskId} | ${config.src}`);

					config.onError?.(err, config);
					downloadMeta.reject(err);

					cleanAndStartNext(downloadMeta);
				} else {
					logger.info('Download retry:', downloadMeta.retry, config.src);
					cleanAndStartNext(downloadMeta, downloadMeta);
				}
			},

			/* GM_download().abort() 会触发 onerror */
			onerror(error: { error: string }): void {
				const { taskId, config, isAborted } = downloadMeta;
				if (isAborted) return;

				let err;
				// GmResponseEventBase
				if ('status' in error && error.status === 429) {
					err = new RequestError('Too many request', error);
				} else {
					//GmDownloadErrorEvent
					err = new Error(`Download failed. ID: ${taskId}. Reason: ${error.error}.`);
					logger.error(error);
				}

				config.onError?.(err, config);
				downloadMeta.reject(err);

				cleanAndStartNext(downloadMeta);
			}
		};
	};

	const gmDownload = (
		downloadMeta: DownloadMeta<DirectSaveConfig<any>>,
		errHandler: ErrorHandler
	) => {
		const { taskId, config } = downloadMeta;
		const { ontimeout, onerror } = errHandler;

		return GM_download({
			url: config.src,
			name: config.path,
			headers: config.headers,
			ontimeout,
			onerror,

			// Firefox 参数只包含loaded, toal, estimatedEndTime(Chrome没有此参数), 且触发次数非常少
			onprogress(res) {
				if (res.loaded > 0 && res.total > 0) {
					const progress = Math.floor((res.loaded / res.total) * 100);
					config.onProgress?.(progress, config);
				}
			},

			onload() {
				cleanAndStartNext(downloadMeta);

				config.onFileSaved?.(config);

				downloadMeta.resolve(taskId);
				logger.info('Download complete:', taskId, config.path);
			}
		});
	};

	const xhr = (downloadMeta: DownloadMeta<XhrConfig<any>>, errHandler: ErrorHandler) => {
		const { taskId, config, timeout } = downloadMeta;
		const { ontimeout, onerror } = errHandler;
		const saveFile = fileSaveAdapters.getAdapter();

		return GM_xmlhttpRequest({
			url: config.src,
			timeout,
			method: 'GET',
			headers: config.headers,
			responseType: 'blob',
			ontimeout,
			onerror,

			onprogress: (res) => {
				if (res.loaded > 0 && res.total > 0) {
					const progress = Math.floor((res.loaded / res.total) * 100);
					config.onProgress?.(progress, config);
				}
			},

			onload: async (e) => {
				logger.info('Xhr complete:', config.src);

				cleanAndStartNext(downloadMeta);

				if (downloadMeta.isAborted)
					return logger.warn('Download was canceled.', taskId, config.path);

				config.onXhrLoaded?.(config);

				try {
					// 存在beforeFileSave函数时，若该函数有返回值，则保存该返回值，
					// 若无返回值，则不保存文件。
					// 不存在beforeFileSave函数时，直接保存e.response。
					let modRes: void | Blob;
					if (typeof config.beforeFileSave === 'function') {
						modRes = await config.beforeFileSave(e.response, config);

						if (modRes && !downloadMeta.isAborted) {
							await saveFile(modRes, downloadMeta);

							config.onFileSaved?.(config);

							logger.info('Download complete:', config.path);
						}
					} else {
						await saveFile(e.response, downloadMeta);

						config.onFileSaved?.(config);

						logger.info('Download complete:', config.path);
					}

					downloadMeta.resolve(downloadMeta.taskId);
				} catch (error) {
					config.onError?.(error as Error, config);

					downloadMeta.reject(error as Error);
				}
			}
		});
	};

	const isDirectSaveConfig = (
		downloadMeta: DownloadMeta
	): downloadMeta is DownloadMeta<DirectSaveConfig<any>> => {
		return !!downloadMeta.config.directSave;
	};

	const dispatchDownload = (downloadMeta: DownloadMeta): void => {
		logger.info('Start download:', downloadMeta.config.src);

		let abortObj: ReturnType<typeof GM_download | typeof GM_xmlhttpRequest>;
		const errHandler = errorHandlerFactory(downloadMeta);

		if (isDirectSaveConfig(downloadMeta)) {
			abortObj = gmDownload(downloadMeta, errHandler);
		} else {
			abortObj = xhr(downloadMeta as DownloadMeta<XhrConfig<any>>, errHandler);
		}

		downloadMeta.abort = abortObj.abort;
	};

	return {
		get fileSystemAccessEnabled() {
			return fileSaveAdapters.isFileSystemAccessEnable();
		},

		/**
		 * 下载触发后应该先弹窗选择文件保存位置，避免下载/转换用时过长导致错误
		 * Must be handling a user gesture to show a file picker.
		 * https://bugs.chromium.org/p/chromium/issues/detail?id=1193489
		 */
		dirHandleCheck() {
			fileSaveAdapters.dirHandleCheck();
		},

		updateDirHandle() {
			return fileSaveAdapters.updateDirHandle();
		},

		getCurrentFsaDirName() {
			return fileSaveAdapters.getFsaDirName();
		},

		async download(configs) {
			logger.info('Downloader add:', configs);
			if (!Array.isArray(configs)) configs = [configs];
			if (configs.length < 1) return Promise.resolve([]);

			const promises: Promise<string>[] = [];
			configs.forEach((config) => {
				promises.push(
					new Promise<string>((resolve, reject) => {
						const downloadMeta = {
							taskId: config.taskId,
							config,
							isAborted: false,
							retry: 0,
							timeout: config.timeout,
							resolve,
							reject
						};
						queue.push(downloadMeta);
					})
				);
			});

			while (active.length < MAX_DOWNLOAD && queue.length) {
				const meta = queue.shift()!;
				active.push(meta);
				dispatchDownload(meta);
			}

			const results = await Promise.allSettled(promises);
			const resultIds: string[] = [];

			for (let i = 0; i < results.length; i++) {
				const result = results[i];
				if (result.status === 'rejected') throw result.reason;
				resultIds.push(result.value);
			}

			return resultIds;
		},

		abort(taskIds: string | string[]): void {
			if (typeof taskIds === 'string') taskIds = [taskIds];
			if (!taskIds.length) return;

			logger.info('Downloader delete, active:', active.length, 'queue', queue.length);

			active = active.filter((downloadMeta) => {
				if (taskIds.includes(downloadMeta.taskId) && !downloadMeta.isAborted) {
					downloadMeta.isAborted = true;
					downloadMeta.abort?.();

					downloadMeta.config.onAbort?.(downloadMeta.config);

					downloadMeta.reject(new CancelError());

					logger.warn('Download aborted:', downloadMeta.config.path);
				} else {
					return true;
				}
			});

			queue = queue.filter((downloadMeta) => !taskIds.includes(downloadMeta.taskId));

			while (active.length < MAX_DOWNLOAD && queue.length) {
				const meta = queue.shift()!;
				active.push(meta);
				dispatchDownload(meta);
			}
		}
	};
}

export const downloader = createDownloader();