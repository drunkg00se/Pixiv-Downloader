import { default as WebMWriter } from 'webm-writer';
import { config } from '@/lib/config';
import { readBlobAsDataUrl } from '@/lib/util';

function isBlobArray(frames: Blob[] | ImageBitmap[]): frames is Blob[] {
  return frames[0] instanceof Blob;
}

export async function webm(
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  signal?: AbortSignal
): Promise<Blob> {
  signal?.throwIfAborted();

  const quality = config.get('webmQuality') / 100;

  if (isBlobArray(frames)) {
    frames = await Promise.all(frames.map((frame) => createImageBitmap(frame)));
  }

  signal?.throwIfAborted();

  const width = frames[0].width;
  const height = frames[0].height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  const dataUrlsPromises: Promise<string>[] = [];

  for (const frame of frames) {
    ctx.drawImage(frame, 0, 0);

    frame.close();

    const url = canvas.convertToBlob({ type: 'image/webp', quality }).then(readBlobAsDataUrl);

    dataUrlsPromises.push(url);
  }

  const dataUrls = await Promise.all(dataUrlsPromises);

  signal?.throwIfAborted();

  const videoWriter = new WebMWriter({
    quality, // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
    frameRate: 30, // Number of frames per second
    transparent: false // True if an alpha channel should be included in the video
  });

  for (const [i, dataUrl] of dataUrls.entries()) {
    videoWriter.addFrame(dataUrl, delays[i]);
  }

  const blob: Blob = await videoWriter.complete();

  signal?.throwIfAborted();

  return blob;
}
