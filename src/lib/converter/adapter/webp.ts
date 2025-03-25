import { logger } from '@/lib/logger';
import webpWorkerFragment from '../worker/webpWorkerFragment?rawjs';
import webpWasm from '../wasm/toWebpWorker?raw';

const workerUrl = URL.createObjectURL(
  new Blob([webpWasm + webpWorkerFragment], { type: 'text/javascript' })
);

const freeWebpWorkers: Worker[] = [];

export async function webp(
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  lossless: boolean,
  quality: number,
  method: number,
  signal?: AbortSignal,
  onProgress?: (val: number) => void
): Promise<Blob> {
  signal?.throwIfAborted();

  let worker: Worker;

  if (freeWebpWorkers.length) {
    worker = freeWebpWorkers.shift() as Worker;
    logger.info('Reuse webp workers.');
  } else {
    worker = new Worker(workerUrl);
  }

  let resolveConvert: (blob: Blob) => void;
  let rejectConvert: (reason?: unknown) => void;

  const convertPromise = new Promise<Blob>((resolve, reject) => {
    resolveConvert = resolve;
    rejectConvert = reject;
  });

  signal?.addEventListener(
    'abort',
    () => {
      worker.terminate();
      rejectConvert(signal?.reason);
    },
    { once: true }
  );

  worker.onmessage = (evt) => {
    if (signal?.aborted) return;

    const data = evt.data as number | Uint8Array;

    if (typeof data !== 'object') {
      onProgress?.(evt.data);
    } else {
      freeWebpWorkers.push(worker);

      resolveConvert(new Blob([evt.data], { type: 'image/webp' }));
    }
  };

  worker.postMessage(
    {
      frames,
      delays,
      lossless: Number(lossless),
      quality,
      method
    },
    frames[0] instanceof ImageBitmap ? (frames as ImageBitmap[]) : []
  );

  return convertPromise;
}
