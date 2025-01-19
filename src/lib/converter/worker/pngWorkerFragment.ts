/// <reference lib="webworker" />

import type * as UPNG from 'upng-js';
import type {
  AppendEffectResult,
  AppendEffectWorkerOptions,
  EncodeApngConfig
} from '../adapter/png';

type ApngDecodeResult = {
  frames: ArrayBuffer[];
  width: number;
  height: number;
  delays: number[];
};

function isBlobArray(frames: Blob[] | ImageBitmap[]): frames is Blob[] {
  return frames[0] instanceof Blob;
}

async function encodeAPNG(
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  cnum: number
): Promise<ArrayBuffer> {
  if (isBlobArray(frames)) {
    frames = await Promise.all(frames.map((frame) => createImageBitmap(frame)));
  }

  const width = frames[0].width;
  const height = frames[0].height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const u8arrs: Uint8ClampedArray[] = [];

  for (const frame of frames) {
    ctx.drawImage(frame, 0, 0);
    frame.close();
    u8arrs.push(ctx.getImageData(0, 0, width, height).data);
  }

  //@ts-expect-error UPNG
  const png = UPNG.encode(u8arrs, width, height, cnum, delays, { loop: 0 });
  if (!png) throw new Error('Failed to encode apng.');

  return png;
}

function decodeApng(ab: ArrayBuffer): ApngDecodeResult {
  //@ts-expect-error UPNG
  const img = UPNG.decode(ab);
  //@ts-expect-error UPNG
  const rgba = UPNG.toRGBA8(img);

  const { width, height } = img;

  const delays = img.frames.map((frame) => frame.delay);

  return { frames: rgba, delays, width, height };
}

async function appendEffect(illustBlob: Blob, effect: ArrayBuffer): Promise<AppendEffectResult> {
  const illustBitmap = await createImageBitmap(illustBlob);

  const { frames: effectFrames, delays, width, height } = decodeApng(effect);

  const effectBitmaps = await Promise.all(
    effectFrames.map((buf) =>
      createImageBitmap(new ImageData(new Uint8ClampedArray(buf), width, height))
    )
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

  for (const effectBitmap of effectBitmaps) {
    ctx.drawImage(illustBitmap, 0, 0);
    ctx.drawImage(effectBitmap, dx, dy, dWidth, dHeight);

    finalDatas.push(ctx.getImageData(0, 0, illustWidth, illustHeight));

    effectBitmap.close();
  }

  illustBitmap.close();

  const result = finalDatas.map((data) => createImageBitmap(data));

  return {
    frames: await Promise.all(result),
    delays
  };
}

self.onmessage = async (evt) => {
  try {
    const data = evt.data as AppendEffectWorkerOptions | EncodeApngConfig;

    if ('effect' in data) {
      const { illust, effect } = data;
      const result = await appendEffect(illust, effect);

      self.postMessage(result, [...result.frames]);
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
