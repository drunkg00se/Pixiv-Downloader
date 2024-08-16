import GIF from 'gif.js';
import gifWorker from 'gif.js/dist/gif.worker?raw';
import type { ConvertMeta, ConvertUgoiraSource } from '..';
import { logger } from '@/lib/logger';
import { CancelError } from '@/lib/error';
import { config } from '@/lib/config';

const workerUrl = URL.createObjectURL(new Blob([gifWorker], { type: 'text/javascript' }));

export function gif(
  frames: Blob[] | ImageBitmap[],
  convertMeta: ConvertMeta<ConvertUgoiraSource>
): Promise<Blob> {
  return Promise.all(
    frames.map((frame) => {
      if (frame instanceof Blob) {
        return createImageBitmap(frame);
      } else {
        return frame;
      }
    })
  ).then((bitmaps: ImageBitmap[]) => {
    return new Promise<Blob>((resolve, reject) => {
      logger.info('Start convert:', convertMeta.id);
      logger.time(convertMeta.id);

      const canvas = document.createElement('canvas');
      const width = (canvas.width = bitmaps[0].width);
      const height = (canvas.height = bitmaps[0].height);
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      const gif = new GIF({
        workers: 2,
        quality: config.get('gifQuality'),
        width,
        height,
        workerScript: workerUrl
      });

      convertMeta.abort = () => {
        gif.abort();
      };

      bitmaps.forEach((bitmap, i) => {
        ctx.drawImage(bitmap, 0, 0);
        gif.addFrame(ctx, {
          copy: true,
          delay: convertMeta.source.delays[i]
        });
        bitmap.close();
      });

      gif.on('progress', (progress: number) => {
        convertMeta.onProgress?.(progress * 100);
      });

      gif.on('finished', (gifBlob: Blob) => {
        logger.timeEnd(convertMeta.id);
        resolve(gifBlob);
      });

      gif.on('abort', () => {
        logger.timeEnd(convertMeta.id);
        logger.warn('Convert stop manually. ' + convertMeta.id);
        convertMeta.isAborted = true;
        reject(new CancelError());
      });

      gif.render();
    });
  });
}
