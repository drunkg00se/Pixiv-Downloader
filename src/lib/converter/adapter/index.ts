import { gif } from './gif';
import { mixPngEffect, png } from './png';
import { webp } from './webp';
import { webm } from './webm';
import { mp4 } from './mp4';
import type { ConvertMeta, ConvertUgoiraSource } from '..';

const adapter: Record<
  string,
  (frames: Blob[] | ImageBitmap[], convertMeta: ConvertMeta<ConvertUgoiraSource>) => Promise<Blob>
> = {
  gif,
  png,
  webp,
  webm,
  mp4
};

export type ConvertFormat = keyof typeof adapter;

export const convertAdapter = {
  getAdapter(format: ConvertFormat) {
    return adapter[format];
  },

  getMixEffectFn() {
    return mixPngEffect;
  }
};
