import { logger } from '@/lib/logger';
import { type ConvertFormat, convertAdapter } from './adapter';
import PQueue from 'p-queue';
export { type ConvertFormat } from './adapter';

type UgoiraFramesData = {
  ugoiraFrames: Blob[];
  delays: number[];
};

type AddFrameOptions = {
  id: string;
  frame: Blob;
  delay: number;
  order?: number;
};

type ConvertOptions = {
  id: string;
  format: ConvertFormat;
  onProgress?: (val: number) => void;
  signal?: AbortSignal;
};

type ProcessConvertOptions = ConvertOptions & {
  frames: Blob[] | ImageBitmap[];
  delays: number[];
};

type AppendEffectOptions = ConvertOptions & {
  illust: Blob;
  seasonalEffect: ArrayBuffer;
};

interface IConverter {
  addFrame(addFrameOptions: AddFrameOptions): void;
  clearFrames(taskId: string): void;
  convert(convertOptions: ConvertOptions): Promise<Blob>;
  framesCount(taskId: string): number;
  appendPixivEffect(appendEffectOptions: AppendEffectOptions): Promise<Blob>;
}

class Converter implements IConverter {
  #ugoiraFramesData: Record<string, UgoiraFramesData> = {};

  #queue = new PQueue({ concurrency: 2 });

  async #processConvert(processConvertOptions: ProcessConvertOptions): Promise<Blob> {
    const { id, format, frames, delays, signal, onProgress } = processConvertOptions;

    logger.info('Start convert:', id);

    const adapter = convertAdapter.getAdapter(format);

    const t0 = performance.now();

    const result = await adapter(frames, delays, signal, onProgress);

    const t1 = performance.now();

    logger.info(`Convert finished: ${id} ${t1 - t0}ms.`);

    return result;
  }

  addFrame(addFrameOptions: AddFrameOptions): void {
    const { id, frame, delay, order } = addFrameOptions;

    this.#ugoiraFramesData[id] ??= {
      ugoiraFrames: [],
      delays: []
    };

    const { ugoiraFrames, delays } = this.#ugoiraFramesData[id];

    if (order === undefined) {
      const length = frames.length;
      ugoiraFrames[length] = frame;
      delays[length] = delay;
    } else {
      ugoiraFrames[order] = frame;
      delays[order] = delay;
    }
  }

  clearFrames(taskId: string): void {
    taskId in this.#ugoiraFramesData && delete this.#ugoiraFramesData[taskId];
  }

  framesCount(taskId: string): number {
    return taskId in this.#ugoiraFramesData
      ? this.#ugoiraFramesData[taskId]['ugoiraFrames'].filter(Boolean).length
      : 0;
  }

  async convert(convertOptions: ConvertOptions): Promise<Blob> {
    const { id, signal, onProgress } = convertOptions;

    signal?.throwIfAborted();

    const result = await this.#queue.add(
      ({ signal }) => {
        signal?.throwIfAborted();

        if (!(id in this.#ugoiraFramesData)) {
          throw new Error('No frame data matched with taskId: ' + id);
        }

        const { ugoiraFrames, delays } = this.#ugoiraFramesData[id];

        if (!ugoiraFrames.length || !delays.length) {
          throw new Error('No frame data found in taskId: ' + id);
        }

        this.clearFrames(id);

        onProgress?.(0);

        return this.#processConvert({
          ...convertOptions,
          frames: ugoiraFrames,
          delays
        });
      },
      { signal }
    );

    if (!result) throw new Error(`Task ${id} has no result returned.`);

    return result;
  }

  async appendPixivEffect(options: AppendEffectOptions): Promise<Blob> {
    const { id, signal, illust, seasonalEffect, onProgress } = options;

    signal?.throwIfAborted();

    const result = await this.#queue.add(
      async ({ signal }) => {
        signal?.throwIfAborted();

        logger.info('Append Effect:', id);

        onProgress?.(0);

        const mixEffect = convertAdapter.getMixEffectFn();

        const t0 = performance.now();

        const { frames, delays } = await mixEffect(illust, seasonalEffect, signal);

        const t1 = performance.now();

        logger.info(`Effect appended: ${id} ${t1 - t0}ms.`);

        return this.#processConvert({
          ...options,
          frames,
          delays,
          signal
        });
      },
      { signal }
    );

    if (!result) throw new Error(`Task ${id} has no result returned.`);

    return result;
  }
}

export const converter = new Converter();
