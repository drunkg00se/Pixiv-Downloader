import { gif } from './gif';
import { mixPngEffect, png } from './png';
import { webp } from './webp';
import { webm } from './webm';
import { mp4 } from './mp4';

export type ConvertFormat = 'gif' | 'png' | 'webp' | 'webm' | 'mp4';

type ConvertAdapterFn = (
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  signal?: AbortSignal,
  onProgress?: (val: number) => void
) => Promise<Blob>;

const adapter: Record<ConvertFormat, ConvertAdapterFn> = {
  gif,
  png,
  webp,
  webm,
  mp4
};

export const convertAdapter = {
  getAdapter(format: ConvertFormat) {
    return adapter[format];
  },

  getMixEffectFn() {
    return mixPngEffect;
  }
};
