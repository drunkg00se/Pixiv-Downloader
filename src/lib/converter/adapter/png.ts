import type { ConvertMeta } from '..';
import { logger } from '@/lib/logger';
import { CancelError } from '@/lib/error';
import pngWorkerFragment from '../worker/pngWorkerFragment?raw';
import UPNG from 'upng-js?raw';
import pako from 'pako?raw';
import { config } from '@/lib/config';

const workerUrl = URL.createObjectURL(
  new Blob(
    [
      pngWorkerFragment +
        pako +
        UPNG.replace('window.UPNG', 'self.UPNG').replace('window.pako', 'self.pako')
    ],
    {
      type: 'text/javascript'
    }
  )
);

const freeApngWorkers: Worker[] = [];

export function png(frames: Blob[], convertMeta: ConvertMeta): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    logger.info('Start convert:', convertMeta.id);
    logger.time(convertMeta.id);

    let worker: Worker;
    if (freeApngWorkers.length) {
      worker = freeApngWorkers.shift() as Worker;
      logger.info('Reuse apng workers.');
    } else {
      worker = new Worker(workerUrl);
    }

    convertMeta.abort = () => {
      logger.timeEnd(convertMeta.id);
      logger.warn('Convert stop manually. ' + convertMeta.id);
      reject(new CancelError());
      convertMeta.isAborted = true;
      worker.terminate();
    };

    worker.onmessage = function (e) {
      freeApngWorkers.push(worker);
      logger.timeEnd(convertMeta.id);

      if (!e.data) {
        return reject(new TypeError('Failed to get png data. ' + convertMeta.id));
      }

      const pngBlob = new Blob([e.data], { type: 'image/png' });
      resolve(pngBlob);
    };

    const delay = convertMeta.source.delays;
    const cfg = { frames, delay, cnum: config.get('pngColor') };
    worker.postMessage(cfg);
  });
}
