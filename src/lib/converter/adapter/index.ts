import { gif } from './gif';
import { png } from './png';
import { webp } from './webp';
import { webm } from './webm';
import { mp4 } from './mp4';
import type { ConvertMeta } from '..';

const adapter: Record<string, (frames: Blob[], convertMeta: ConvertMeta) => Promise<Blob>> = {
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
  }
};
