import { logger } from '@/lib/logger';
import pngWorkerFragment from '../worker/pngWorkerFragment?rawjs';
import UPNG from 'upng-js?raw';
import pako from 'pako/dist/pako.js?raw';
import { config } from '@/lib/config';

export type EncodeApngConfig = {
  frames: Blob[] | ImageBitmap[];
  delays: number[];
  cnum: number;
};

export type AppendEffectWorkerOptions = {
  illust: Blob;
  effect: ArrayBuffer;
};

export type AppendEffectResult = {
  frames: ImageBitmap[];
  delays: number[];
};

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

export async function png(
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  signal?: AbortSignal
): Promise<Blob> {
  signal?.throwIfAborted();

  let resolveConvert: (blob: Blob) => void;
  let rejectConvert: (reason?: unknown) => void;

  const convertPromise = new Promise<Blob>((resolve, reject) => {
    resolveConvert = resolve;
    rejectConvert = reject;
  });

  let worker: Worker;
  if (freeApngWorkers.length) {
    worker = freeApngWorkers.shift() as Worker;
    logger.info('Reuse apng workers.');
  } else {
    worker = new Worker(workerUrl);
  }

  signal?.addEventListener(
    'abort',
    () => {
      worker.terminate();
      rejectConvert(signal?.reason);
    },
    { once: true }
  );

  worker.onmessage = function (e) {
    freeApngWorkers.push(worker);

    if (signal?.aborted) return;

    if (!e.data) {
      return rejectConvert(new TypeError('Failed to get png data.'));
    }

    const pngBlob = new Blob([e.data], { type: 'image/png' });

    resolveConvert(pngBlob);
  };

  const cfg: EncodeApngConfig = { frames, delays, cnum: config.get('pngColor') };

  worker.postMessage(
    cfg,
    cfg.frames[0] instanceof ImageBitmap ? (cfg.frames as ImageBitmap[]) : []
  );

  return convertPromise;
}

export function mixPngEffect(
  illust: Blob,
  seasonalEffect: ArrayBuffer,
  signal?: AbortSignal
): Promise<AppendEffectResult> {
  signal?.throwIfAborted();

  let resolveConvert: (result: AppendEffectResult) => void;
  let rejectConvert: (reason?: unknown) => void;

  const convertPromise = new Promise<AppendEffectResult>((resolve, reject) => {
    resolveConvert = resolve;
    rejectConvert = reject;
  });

  let worker: Worker;
  if (freeApngWorkers.length) {
    worker = freeApngWorkers.shift() as Worker;
    logger.info('Reuse apng workers.');
  } else {
    worker = new Worker(workerUrl);
  }

  signal?.addEventListener('abort', () => {
    worker.terminate();
    rejectConvert(signal?.reason);
  });

  worker.onmessage = function (e) {
    worker.terminate();

    if (!e.data) {
      return rejectConvert(new Error('Mix Effect convert Failed.'));
    }

    resolveConvert(e.data as AppendEffectResult);
  };

  const cfg: AppendEffectWorkerOptions = { illust, effect: seasonalEffect };
  worker.postMessage(cfg, [seasonalEffect]);

  return convertPromise;
}
