import GIF from 'gif.js';
import gifWorker from 'gif.js/dist/gif.worker?raw';
import { config } from '@/lib/config';

const workerUrl = URL.createObjectURL(new Blob([gifWorker], { type: 'text/javascript' }));

function isBlobArray(frames: Blob[] | ImageBitmap[]): frames is Blob[] {
  return frames[0] instanceof Blob;
}

export async function gif(
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  signal?: AbortSignal,
  onProgress?: (val: number) => void
): Promise<Blob> {
  signal?.throwIfAborted();

  if (isBlobArray(frames)) {
    frames = await Promise.all(frames.map((frame) => createImageBitmap(frame)));
  }

  signal?.throwIfAborted();

  const canvas = document.createElement('canvas');
  const width = (canvas.width = frames[0].width);
  const height = (canvas.height = frames[0].height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  let resolveConvert: (blob: Blob) => void;
  let rejectConvert: (reason?: unknown) => void;

  const convertPromise = new Promise<Blob>((resolve, reject) => {
    resolveConvert = resolve;
    rejectConvert = reject;
  });

  const gif = new GIF({
    workers: 2,
    quality: config.get('gifQuality'),
    width,
    height,
    workerScript: workerUrl
  });

  gif.on('progress', (progress: number) => {
    onProgress?.(progress * 100);
  });

  gif.on('abort', () => {
    rejectConvert(signal?.reason);
  });

  gif.on('finished', (gifBlob: Blob) => {
    resolveConvert(gifBlob);
  });

  signal?.addEventListener(
    'abort',
    () => {
      gif.abort();
    },
    { once: true }
  );

  frames.forEach((bitmap, i) => {
    ctx.drawImage(bitmap, 0, 0);

    gif.addFrame(ctx, {
      copy: true,
      delay: delays[i]
    });

    bitmap.close();
  });

  gif.render();

  return convertPromise;
}
