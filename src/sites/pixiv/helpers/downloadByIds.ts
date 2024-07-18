import { logger } from '@/lib/logger';
import { downloader } from '@/lib/downloader';
import { wakeableSleep } from '@/lib/util';
import { pixivParser } from '@/sites/pixiv/parser';
import { JsonDataError, RequestError } from '@/lib/error';
import { type HistoryData, historyDb } from '@/lib/db';
import { PixivDownloadConfig } from '@/sites/pixiv/downloadConfigBuilder';

export interface ProgressData {
	illustId?: string;
	avaliable: number;
	completed: number;
}

export interface FailedDownloadResult {
	failed: string[];
	unavaliable: string[];
}

export interface FilteredIds {
	unavaliable: string[];
	avaliable: string[];
	invalid: string[];
}

export async function downloadByIds(
	total: number,
	idsGenerators: AsyncGenerator<FilteredIds & { total?: number }, void, unknown>[],
	signal: AbortSignal,
	onProgress: (progressData: ProgressData | string) => void
): Promise<FailedDownloadResult> {
	signal.throwIfAborted();

	const failed: string[] = [];
	const unavaliable: string[] = [];
	const invalid: string[] = [];
	const tasks: string[] = [];
	let completed = 0;
	let tooManyRequests = false;
	let wakeTooManyRequest: () => void | undefined;
	let wakeInterval: () => void | undefined;

	// 需要等待异步下载结果，所以返回一个Promise
	let resolve: (val: FailedDownloadResult) => void;
	let reject!: (reason: string) => void;
	const done: Promise<FailedDownloadResult> = new Promise((r, j) => {
		resolve = r;
		reject = j;
	});

	signal.addEventListener(
		'abort',
		() => {
			if (tasks.length) {
				downloader.abort(tasks);
				tasks.length = 0;
			}

			wakeTooManyRequest?.();
			wakeInterval?.();
			reject(signal.aborted ? signal.reason : 'Unexpected generator error');
		},
		{ once: true }
	);

	const afterEach = (illustId?: string) => {
		const avaliable = total - failed.length - unavaliable.length - invalid.length;
		onProgress({
			illustId,
			avaliable,
			completed
		});

		if (completed === avaliable) {
			resolve({ failed, unavaliable });
		}
	};

	onProgress('Downloading...');

	try {
		for (const idsGenerator of idsGenerators) {
			for await (const ids of idsGenerator) {
				logger.info('Got ids:', ids);

				signal.throwIfAborted();

				if (ids.unavaliable.length) {
					unavaliable.push(...ids.unavaliable);
				}

				if (ids.invalid.length) {
					invalid.push(...ids.invalid);
				}

				// 允许生成器更新total，因为“已关注用户的新作” 作品数量需要逐页获取
				if (typeof ids.total === 'number' && !Number.isNaN(ids.total)) {
					total = ids.total;
				}

				if (ids.avaliable.length) {
					for (const id of ids.avaliable) {
						signal.throwIfAborted();

						if (tooManyRequests) {
							onProgress('Too many requests, wait 30s');
							const { wake, sleep } = wakeableSleep(30000);
							wakeTooManyRequest = wake;
							await sleep;
							signal.throwIfAborted();
							tooManyRequests = false;
							onProgress('Downloading...');
						}

						let historyData: HistoryData;

						pixivParser
							.parse(id)
							.then((pixivMeta) => {
								const { id, tags, artist, userId, title } = pixivMeta;

								historyData = {
									pid: Number(id),
									user: artist,
									userId: Number(userId),
									title,
									tags
								};

								const downloadConfigs = new PixivDownloadConfig(pixivMeta).getDownloadConfig();

								tasks.push(downloadConfigs[0].taskId);

								return downloader.download(downloadConfigs);
							})
							.then(
								(taskId) => {
									historyDb.add(historyData);

									if (!signal.aborted) {
										tasks.splice(tasks.indexOf(taskId[0]), 1);
										completed++;
										afterEach(id);
									}
								},
								(reason) => {
									if (!signal.aborted) {
										reason && logger.error(reason);

										if (reason instanceof RequestError && reason.response.status === 429) {
											tooManyRequests = true;
										}

										if (reason instanceof JsonDataError) {
											unavaliable.push(id);
										} else {
											failed.push(id);
										}

										afterEach(id);
									}
								}
							);

						const { wake, sleep } = wakeableSleep(1000);
						wakeInterval = wake;
						await sleep;
					}
				} else {
					afterEach('no avaliable id');
				}
			}
		}
	} catch (error) {
		if (!signal.aborted) {
			done.catch((reason) => {
				logger.info('catch unexpected abort: ', reason);
			});
			signal.dispatchEvent(new Event('abort'));
			throw error;
		}
	}

	return done;
}
