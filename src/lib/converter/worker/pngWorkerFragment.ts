/// <reference lib="webworker" />

import type { Image } from 'upng-js';
import type { EffectImageDecodedData, MixEffectEncodedData } from '../index';
import type { PngWorkerConfig } from '../adapter/png';

async function encodeAPNG(
  frames: Blob[] | ImageBitmap[],
  delays: number[],
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
  const png: ArrayBuffer = UPNG.encode(u8arrs, width, height, cnum, delays, { loop: 0 });
  if (!png) throw new Error('Failed to encode apng.');

  return png;
}

async function decodeApng(ab: ArrayBuffer): Promise<EffectImageDecodedData> {
  //@ts-expect-error UPNG
  const img: Image = UPNG.decode(ab);
  //@ts-expect-error UPNG
  const rgba: ArrayBuffer[] = UPNG.toRGBA8(img);

  const { width, height } = img;

  const delays = img.frames.map((frame) => frame.delay);

  return { frames: rgba, delays, width, height };
}

async function appendEffect(illustBlob: Blob, effect: ArrayBuffer): Promise<MixEffectEncodedData>;
async function appendEffect(
  illustBlob: Blob,
  effect: ArrayBuffer[],
  delays: number[],
  width: number,
  height: number
): Promise<MixEffectEncodedData>;
async function appendEffect(
  illustBlob: Blob,
  effect: ArrayBuffer | ArrayBuffer[],
  delays?: number[],
  width?: number,
  height?: number
): Promise<MixEffectEncodedData> {
  if (!Array.isArray(effect)) {
    const apngDatas = await decodeApng(effect);
    effect = apngDatas.frames;
    delays = apngDatas.delays;
    width = apngDatas.width;
    height = apngDatas.height;
  } else {
    if (!delays || width === undefined || height === undefined)
      throw new Error('Missing argument.');
  }

  const illustBitmap = await createImageBitmap(illustBlob);
  const effectBitmaps = await Promise.all(
    effect.map((buf) => createImageBitmap(new ImageData(new Uint8ClampedArray(buf), width, height)))
  );

  const { width: illustWidth, height: illustHeight } = illustBitmap;

  const illustAspectRatio = illustWidth / illustHeight;
  const effectAspectRatio = width / height;

  let dx: number;
  let dy: number;
  let dWidth: number;
  let dHeight: number;

  if (effectAspectRatio > illustAspectRatio) {
    dWidth = illustHeight * effectAspectRatio;
    dHeight = illustHeight;
    dx = (illustWidth - dWidth) / 2;
    dy = 0;
  } else {
    dWidth = illustWidth;
    dHeight = illustWidth / effectAspectRatio;
    dx = 0;
    dy = (illustHeight - dHeight) / 2;
  }

  const canvas = new OffscreenCanvas(illustWidth, illustHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const finalDatas: ImageData[] = [];

  for (let i = 0; i < effectBitmaps.length; i++) {
    ctx.drawImage(illustBitmap, 0, 0);
    ctx.drawImage(effectBitmaps[i], dx, dy, dWidth, dHeight);
    finalDatas.push(ctx.getImageData(0, 0, illustWidth, illustHeight));

    effectBitmaps[i].close();
  }

  illustBitmap.close();

  const bitmaps: ImageBitmap[] = [];

  for (let i = 0; i < finalDatas.length; i++) {
    const bitmap = await createImageBitmap(finalDatas[i]);
    bitmaps.push(bitmap);
  }

  return {
    bitmaps,
    frames: effect,
    width,
    height,
    delays
  };
}

self.onmessage = async (evt) => {
  try {
    const data = evt.data as PngWorkerConfig;

    if ('effect' in data) {
      let result: MixEffectEncodedData;

      if ('delays' in data) {
        const { illust, effect, width, height, delays } = data;
        result = await appendEffect(illust, effect, delays, width, height);
      } else {
        const { illust, effect } = data;
        result = await appendEffect(illust, effect);
      }

      self.postMessage(result, [...result.frames, ...result.bitmaps]);
    } else {
      const { frames, delays, cnum = 256 } = data;
      const apng = await encodeAPNG(frames, delays, cnum);

      self.postMessage(apng, [apng]);
    }
  } catch (error) {
    console.error(error);
    self.postMessage(undefined);
  }
};
