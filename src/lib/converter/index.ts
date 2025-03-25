import { logger } from '@/lib/logger';
import { type QualityOption, convertAdapter } from './adapter';
import PQueue from 'p-queue';

type UgoiraFramesData = {
  ugoiraFrames: Blob[];
  delays: number[];
};

type AddFrameOption = {
  id: string;
  frame: Blob;
  delay: number;
  order?: number;
};

type ConvertOption = {
  id: string;
  qualityOption: QualityOption;
  onProgress?: (val: number) => void;
  signal?: AbortSignal;
};

type ProcessConvertOption = ConvertOption & {
  frames: Blob[] | ImageBitmap[];
  delays: number[];
};

type AppendEffectOption = ConvertOption & {
  illust: Blob;
  seasonalEffect: ArrayBuffer;
};

interface IConverter {
  addFrame(addFrameOption: AddFrameOption): void;
  clearFrames(taskId: string): void;
  convert(convertOption: ConvertOption): Promise<Blob>;
  framesCount(taskId: string): number;
  appendPixivEffect(appendEffectOption: AppendEffectOption): Promise<Blob>;
}

class Converter implements IConverter {
  #ugoiraFramesData: Record<string, UgoiraFramesData> = {};

  #queue = new PQueue({ concurrency: 2 });

  async #processConvert(processConvertOption: ProcessConvertOption): Promise<Blob> {
    const { id, qualityOption, frames, delays, signal, onProgress } = processConvertOption;

    logger.info('Start convert:', id);

    const adapter = convertAdapter.getAdapter(qualityOption);

    const t0 = performance.now();

    const result = await adapter(frames, delays, signal, onProgress);

    const t1 = performance.now();

    logger.info(`Convert finished: ${id} ${t1 - t0}ms.`);

    return result;
  }

  addFrame(addFrameOption: AddFrameOption): void {
    const { id, frame, delay, order } = addFrameOption;

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

  async convert(convertOption: ConvertOption): Promise<Blob> {
    const { id, signal, onProgress } = convertOption;

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
          ...convertOption,
          frames: ugoiraFrames,
          delays
        });
      },
      { signal }
    );

    if (!result) throw new Error(`Task ${id} has no result returned.`);

    return result;
  }

  async appendPixivEffect(option: AppendEffectOption): Promise<Blob> {
    const { id, signal, illust, seasonalEffect, onProgress } = option;

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
          ...option,
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
