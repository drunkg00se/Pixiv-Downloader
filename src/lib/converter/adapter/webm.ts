import type { ConvertMeta } from '..';
import { default as WebMWriter } from 'webm-writer';
import { CancelError } from '@/lib/error';
import { config } from '@/lib/config';
import { readBlobAsDataUrl } from '@/lib/util';

export function webm(frames: Blob[], convertMeta: ConvertMeta): Promise<Blob> {
  const quality = config.get('webmQuality') / 100;
  return Promise.all(frames.map((frame) => createImageBitmap(frame)))
    .then((bitmaps: ImageBitmap[]) => {
      if (convertMeta.isAborted) throw new CancelError();

      const width = bitmaps[0].width;
      const height = bitmaps[0].height;
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d')!;

      const dataUrls: Promise<string>[] = [];
      for (let i = 0; i < frames.length; i++) {
        ctx.drawImage(bitmaps[i], 0, 0);
        const url = canvas.convertToBlob({ type: 'image/webp', quality }).then(readBlobAsDataUrl);
        dataUrls.push(url);
      }

      return Promise.all(dataUrls);
    })
    .then((dataUrls) => {
      if (convertMeta.isAborted) throw new CancelError();

      const videoWriter = new WebMWriter({
        quality, // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
        frameRate: 30, // Number of frames per second
        transparent: false // True if an alpha channel should be included in the video
      });
      const delays = convertMeta.source.delays;

      for (let i = 0; i < dataUrls.length; i++) {
        videoWriter.addFrame(dataUrls[i], delays[i]);
      }

      return videoWriter.complete();
    })
    .then((blob) => {
      if (convertMeta.isAborted) throw new CancelError();
      return blob;
    });
}
