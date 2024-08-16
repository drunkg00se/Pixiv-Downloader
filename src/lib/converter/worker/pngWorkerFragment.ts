/// <reference lib="webworker" />

import type { Image } from '@pdf-lib/upng';
import type { EffectReturn, EffectData } from '../index';
import type { PngWorkerConfig } from '../adapter/png';

async function encodeAPNG(
  frames: Blob[] | ImageBitmap[],
  delay: number[],
  cnum: number
): Promise<ArrayBuffer> {
  const bitmaps = await Promise.all(
    frames.map((frame) => {
      if (frame instanceof Blob) {
        return createImageBitmap(frame);
      } else {
        return frame;
      }
    })
  );

  const width = bitmaps[0].width;
  const height = bitmaps[0].height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const u8arrs: Uint8ClampedArray[] = [];

  for (let i = 0; i < bitmaps.length; i++) {
    ctx.drawImage(bitmaps[i], 0, 0);
    bitmaps[i].close();
    u8arrs.push(ctx.getImageData(0, 0, width, height).data);
  }

  //@ts-expect-error UPNG
  const png: ArrayBuffer = UPNG.encode(u8arrs, width, height, cnum, delay, { loop: 0 });
  if (!png) throw new Error('Failed to encode apng.');

  return png;
}

async function decodeApng(ab: ArrayBuffer): Promise<EffectData> {
  //@ts-expect-error UPNG
  const img: Image = UPNG.decode(ab);
  //@ts-expect-error UPNG
  const rgba: ArrayBuffer[] = UPNG.toRGBA8(img);

  const frames = rgba.map((ab) => new ImageData(new Uint8ClampedArray(ab), img.width, img.height));
  const delays = img.frames.map((frame) => frame.delay);

  return { frames, delays };
}

async function appendEffect(illustBlob: Blob, effect: ArrayBuffer): Promise<EffectReturn>;
async function appendEffect(
  illustBlob: Blob,
  effect: ImageData[],
  delays: number[]
): Promise<EffectReturn>;
async function appendEffect(
  illustBlob: Blob,
  effect: ArrayBuffer | ImageData[],
  delays?: number[]
): Promise<EffectReturn> {
  if (!Array.isArray(effect)) {
    const apngDatas = await decodeApng(effect);
    effect = apngDatas.frames;
    delays = apngDatas.delays;
  } else {
    if (!delays) throw new Error('Argument "delays" is required.');
  }

  const illustBitmap = await createImageBitmap(illustBlob);
  const effectBitmaps = await Promise.all(effect.map((data) => createImageBitmap(data)));

  const { width, height } = illustBitmap;
  const { width: effectWidth, height: effectHeight } = effectBitmaps[0];

  const illustAspectRatio = width / height;
  const effectAspectRatio = effectWidth / effectHeight;

  let dx: number;
  let dy: number;
  let dWidth: number;
  let dHeight: number;

  if (effectAspectRatio > illustAspectRatio) {
    dWidth = height * effectAspectRatio;
    dHeight = height;
    dx = (width - dWidth) / 2;
    dy = 0;
  } else {
    dWidth = width;
    dHeight = width / effectAspectRatio;
    dx = 0;
    dy = (height - dHeight) / 2;
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const finalDatas: ImageData[] = [];

  for (let i = 0; i < effectBitmaps.length; i++) {
    ctx.drawImage(illustBitmap, 0, 0);
    ctx.drawImage(effectBitmaps[i], dx, dy, dWidth, dHeight);
    finalDatas.push(ctx.getImageData(0, 0, width, height));

    effectBitmaps[i].close();
  }

  illustBitmap.close();

  const bitmaps: ImageBitmap[] = [];

  for (let i = 0; i < finalDatas.length; i++) {
    const bitmap = await createImageBitmap(finalDatas[i]);
    bitmaps.push(bitmap);
  }

  return { bitmaps, frames: effect.map((data) => data), delays };
}

self.onmessage = async (evt) => {
  try {
    const data = evt.data as PngWorkerConfig;

    if ('effect' in data) {
      const { illust, effect, delay } = data;
      let imageBitmaps: EffectReturn;

      if (delay) {
        imageBitmaps = await appendEffect(illust, effect, delay);
      } else {
        imageBitmaps = await appendEffect(illust, effect);
      }

      self.postMessage(imageBitmaps, [
        ...imageBitmaps.frames.map((arr) => arr.data.buffer),
        ...imageBitmaps.bitmaps
      ]);
    } else {
      const { frames, delay, cnum = 256 } = data;
      const apng = await encodeAPNG(frames, delay, cnum);

      self.postMessage(apng, [apng]);
    }
  } catch (error) {
    console.error(error);
    self.postMessage(undefined);
  }
};
