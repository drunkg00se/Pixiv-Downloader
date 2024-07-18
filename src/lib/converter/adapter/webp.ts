import type { ConvertMeta } from '..';
import { logger } from '@/lib/logger';
import { CancelError } from '@/lib/error';
import webpWorkerFragment from '../worker/webpWorkerFragment?raw';
import webpWasm from '../wasm/toWebpWorker?raw';
import { config } from '@/lib/config';

const workerUrl = URL.createObjectURL(
	new Blob([webpWasm + webpWorkerFragment], { type: 'text/javascript' })
);

const freeWebpWorkers: Worker[] = [];

export function webp(frames: Blob[], convertMeta: ConvertMeta): Promise<Blob> {
	return new Promise<Worker>((resolve, reject) => {
		logger.time(convertMeta.id);

		let worker: Worker;

		if (freeWebpWorkers.length) {
			logger.info('Reuse webp workers.');
			worker = freeWebpWorkers.shift() as Worker;
			resolve(worker);
		} else {
			worker = new Worker(workerUrl);
			worker.onmessage = (evt) => {
				if (evt.data === 'ok') {
					logger.info('Webp worker loaded.');
					resolve(worker);
				} else {
					reject(evt.data);
				}
			};
		}
	}).then((worker) => {
		if (convertMeta.isAborted) {
			freeWebpWorkers.push(worker);
			logger.timeEnd(convertMeta.id);
			logger.warn('Convert stop manually.' + convertMeta.id);
			throw new CancelError();
		}

		return new Promise<Blob>((resolve, reject) => {
			worker.onmessage = (evt) => {
				if (convertMeta.isAborted) {
					worker.terminate();
					logger.timeEnd(convertMeta.id);
					logger.warn('Convert stop manually.' + convertMeta.id);
					reject(new CancelError());
				} else {
					const data = evt.data as number | Uint8Array;
					if (typeof data !== 'object') {
						convertMeta.onProgress?.(evt.data);
					} else {
						logger.timeEnd(convertMeta.id);
						freeWebpWorkers.push(worker);
						resolve(new Blob([evt.data], { type: 'image/webp' }));
					}
				}
			};

			const delays = convertMeta.source.delays;
			worker.postMessage({
				frames,
				delays,
				lossless: Number(config.get('losslessWebp')),
				quality: config.get('webpQuality'),
				method: config.get('webpMehtod')
			});
		});
	});
}
