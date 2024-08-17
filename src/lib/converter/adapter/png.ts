import type {
  ConvertMeta,
  ConvertUgoiraSource,
  EffectData,
  EffectReturn,
  ConvertImageEffectSource
} from '..';
import { logger } from '@/lib/logger';
import { CancelError } from '@/lib/error';
import pngWorkerFragment from '../worker/pngWorkerFragment?rawjs';
import UPNG from 'upng-js?raw';
import pako from 'pako/dist/pako.js?raw';
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

type PngWorkerEffectConfig =
  | {
      illust: Blob;
      effect: ArrayBuffer;
      delay?: undefined;
    }
  | {
      illust: Blob;
      effect: ImageData[];
      delay: number[];
    };

type EncodeApngConfig = {
  frames: Blob[] | ImageBitmap[];
  delay: number[];
  cnum: number;
};

export type PngWorkerConfig = PngWorkerEffectConfig | EncodeApngConfig;

export function png(
  frames: Blob[] | ImageBitmap[],
  convertMeta: ConvertMeta<ConvertUgoiraSource>
): Promise<Blob> {
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
    const cfg: EncodeApngConfig = { frames, delay, cnum: config.get('pngColor') };
    worker.postMessage(
      cfg,
      cfg.frames[0] instanceof ImageBitmap ? (cfg.frames as ImageBitmap[]) : []
    );
  });
}

export function mixPngEffect(
  convertMeta: ConvertMeta<ConvertImageEffectSource>
): Promise<EffectReturn> {
  logger.info('Start convert:', convertMeta.id);
  logger.time(convertMeta.id);

  const { illust, data } = convertMeta.source;

  let p: Promise<ArrayBuffer | EffectData>;

  if (data instanceof Blob) {
    p = data.arrayBuffer();
  } else {
    p = Promise.resolve(data);
  }

  return p.then((effect) => {
    return new Promise((resolve, reject) => {
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
        logger.timeEnd(convertMeta.id);

        if (!e.data) {
          return reject(new Error('Mix Effect convert Failed ' + convertMeta.id));
        }

        resolve(e.data as EffectReturn);
        worker.terminate();
      };

      let cfg: PngWorkerConfig;

      if (effect instanceof ArrayBuffer) {
        cfg = { illust, effect };
        worker.postMessage(cfg, [cfg.effect]);
      } else {
        cfg = { illust, delay: effect.delays, effect: effect.frames };
        worker.postMessage(
          cfg,
          cfg.effect.map((arr) => arr.data.buffer)
        );
      }
    });
  });
}
