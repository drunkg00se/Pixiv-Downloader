import { gif } from './gif';
import { mixPngEffect, png } from './png';
import { webp } from './webp';
import { webm } from './webm';
import { mp4 } from './mp4';

export const enum ConvertFormat {
  GIF = 'gif',
  WEBP = 'webp',
  PNG = 'png',
  WEBM = 'webm',
  MP4 = 'mp4'
}

type GifOption = {
  format: ConvertFormat.GIF;
  quality: number;
};

type Mp4Option = {
  format: ConvertFormat.MP4;
  /** Mbps */
  bitrate: number;
};

type PngOption = {
  format: ConvertFormat.PNG;
  cnum: number;
};

type WebmOption = {
  format: ConvertFormat.WEBM;
  /** Mbps */
  bitrate: number;
};

type WebpOption = {
  format: ConvertFormat.WEBP;
  lossless: boolean;
  quality: number;
  method: number;
};

export type QualityOption = GifOption | Mp4Option | PngOption | WebmOption | WebpOption;

type ConvertAdapterFn = (
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  signal?: AbortSignal,
  onProgress?: (val: number) => void
) => Promise<Blob>;

export const convertAdapter = {
  getAdapter(option: QualityOption): ConvertAdapterFn {
    switch (option.format) {
      case ConvertFormat.GIF:
        return (
          frames: Blob[] | ImageBitmap[],
          delays: number[],
          signal?: AbortSignal,
          onProgress?: (val: number) => void
        ) => {
          return gif(frames, delays, option.quality, signal, onProgress);
        };
      case ConvertFormat.PNG:
        return (frames: Blob[] | ImageBitmap[], delays: number[], signal?: AbortSignal) => {
          return png(frames, delays, option.cnum, signal);
        };
      case ConvertFormat.MP4:
        return (frames: Blob[] | ImageBitmap[], delays: number[], signal?: AbortSignal) => {
          return mp4(frames, delays, option.bitrate, signal);
        };
      case ConvertFormat.WEBM:
        return (frames: Blob[] | ImageBitmap[], delays: number[], signal?: AbortSignal) => {
          return webm(frames, delays, option.bitrate, signal);
        };
      case ConvertFormat.WEBP:
        return (
          frames: Blob[] | ImageBitmap[],
          delays: number[],
          signal?: AbortSignal,
          onProgress?: (val: number) => void
        ) => {
          const { lossless, quality, method } = option;
          return webp(frames, delays, lossless, quality, method, signal, onProgress);
        };

      default:
        throw new Error('Unspported format.');
    }
  },

  getMixEffectFn() {
    return mixPngEffect;
  }
};
