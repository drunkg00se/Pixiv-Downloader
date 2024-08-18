import { logger } from '@/lib/logger';
import { CancelError, RequestError } from '@/lib/error';
import { type ConvertFormat, convertAdapter } from './adapter';
export type { ConvertFormat } from './adapter';

export interface ConvertUgoiraSource {
  id: string;
  data: Blob[] | ImageBitmap[];
  delays: number[];
}

export type ConvertImageEffectSource = {
  id: string;
  illust: Blob;
  data: Blob | EffectImageDecodedData;
};

type ConvertSource = ConvertUgoiraSource | ConvertImageEffectSource;
export interface ConvertMeta<T = ConvertSource> {
  id: string;
  format: ConvertFormat;
  source: T;
  isAborted: boolean;
  resolve: (val: T extends ConvertUgoiraSource ? Blob : MixEffectResult) => void;
  reject: (reason: TypeError | RequestError | CancelError) => void;
  abort: () => void;
  onProgress?: (val: number) => void;
}

export interface EffectImageDecodedData {
  frames: ArrayBuffer[];
  width: number;
  height: number;
  delays: number[];
}

export type MixEffectEncodedData = EffectImageDecodedData & {
  bitmaps: ImageBitmap[];
};

type MixEffectResult = EffectImageDecodedData & {
  blob: Blob;
};

interface Converter {
  addFrame(taskId: string, data: Blob, delay: number, order?: number): void;
  convert(
    taskId: string,
    format: ConvertFormat,
    onProgress?: ConvertMeta<ConvertSource>['onProgress']
  ): Promise<Blob>;
  del: (taskIds: string | string[]) => void;
  framesCount(taskId: string): number;
  appendPixivEffect(
    taskId: string,
    format: ConvertFormat,
    illust: Blob,
    effect: EffectImageDecodedData | Blob,
    onProgress?: ConvertMeta<ConvertImageEffectSource>['onProgress']
  ): Promise<MixEffectResult>;
}

function createConverter(): Converter {
  const MAX_CONVERT = 2;
  const framesData: Record<string, ConvertUgoiraSource> = {};

  let isStop = false;
  let queue: ConvertMeta<ConvertSource>[] = [];
  let active: ConvertMeta<ConvertSource>[] = [];

  const isConvertSource = (
    meta: ConvertMeta<ConvertSource>
  ): meta is ConvertMeta<ConvertUgoiraSource> => {
    return Array.isArray(meta.source.data) && meta.source.data[0] instanceof Blob;
  };

  const doConvert = (convertMeta: ConvertMeta<ConvertSource>) => {
    const { id, format, resolve, reject } = convertMeta;

    active.push(convertMeta);
    convertMeta.onProgress?.(0);
    const adapter = convertAdapter.getAdapter(format);

    if (!isConvertSource(convertMeta)) {
      const mixEffect = convertAdapter.getMixEffectFn();

      mixEffect(convertMeta as ConvertMeta<ConvertImageEffectSource>)
        .then(({ bitmaps, frames, delays, width, height }) => {
          const meta: ConvertMeta<ConvertUgoiraSource> = {
            ...convertMeta,
            source: {
              id,
              data: bitmaps,
              delays
            }
          };

          return Promise.all([adapter(meta.source.data, meta), frames, delays, width, height]);
        })
        .then(([blob, frames, delays, width, height]) => {
          resolve({ blob, frames, delays, width, height });
        }, reject)
        .finally(() => {
          active.splice(active.indexOf(convertMeta), 1);
          if (queue.length) doConvert(queue.shift() as ConvertMeta<ConvertSource>);
        });
    } else {
      // 清理framesData
      delete framesData[id];

      adapter(convertMeta.source.data, convertMeta)
        .then(resolve, reject)
        .finally(() => {
          active.splice(active.indexOf(convertMeta), 1);
          if (queue.length) doConvert(queue.shift() as ConvertMeta<ConvertSource>);
        });
    }
  };

  return {
    del: (taskIds: string | string[]): void => {
      if (typeof taskIds === 'string') taskIds = [taskIds];
      if (!taskIds.length) return;

      logger.info(
        'Converter del, active:',
        active.map((meta) => meta.id),
        'queue:',
        queue.map((meta) => meta.id)
      );

      isStop = true;

      // 删除存储的图片
      taskIds.forEach((taskId) => {
        if (taskId in framesData) delete framesData[taskId];
      });

      // 停止转换中的任务
      active = active.filter((convertMeta) => {
        if (taskIds.includes(convertMeta.id)) {
          convertMeta.abort();
        } else {
          return true;
        }
      });

      // 删除队列中的任务
      queue = queue.filter((convertMeta) => !taskIds.includes(convertMeta.id));

      isStop = false;

      while (active.length < MAX_CONVERT && queue.length) {
        doConvert(queue.shift() as ConvertMeta<ConvertSource>);
      }
    },

    addFrame(taskId: string, data: Blob, delay: number, order?: number): void {
      if (!(taskId in framesData)) {
        framesData[taskId] = {
          id: taskId,
          data: [],
          delays: []
        };
      }
      if (order === undefined) {
        const length = framesData[taskId].data.length;
        framesData[taskId]['data'][length] = data;
        framesData[taskId]['delays'][length] = delay;
      } else {
        framesData[taskId]['data'][order] = data;
        framesData[taskId]['delays'][order] = delay;
      }
    },

    framesCount(taskId: string): number {
      return taskId in framesData
        ? framesData[taskId]['delays'].filter((delay) => delay !== undefined).length
        : 0;
    },

    convert(
      taskId: string,
      format: ConvertFormat,
      onProgress?: ConvertMeta<ConvertUgoiraSource>['onProgress']
    ): Promise<Blob> {
      return new Promise<Blob>((resolve, reject) => {
        const meta: ConvertMeta<ConvertUgoiraSource> = {
          id: taskId,
          format,
          source: framesData[taskId],
          isAborted: false,
          onProgress,
          resolve,
          reject,
          abort() {
            this.isAborted = true;
          }
        };

        logger.info('Converter add', taskId);

        queue.push(meta);

        while (active.length < MAX_CONVERT && queue.length && !isStop) {
          doConvert(queue.shift() as ConvertMeta<ConvertSource>);
        }
      });
    },

    async appendPixivEffect(
      taskId: string,
      format: ConvertFormat,
      illust: Blob,
      effect: EffectImageDecodedData | Blob,
      onProgress?: ConvertMeta<ConvertImageEffectSource>['onProgress']
    ): Promise<MixEffectResult> {
      return new Promise<MixEffectResult>((resolve, reject) => {
        const meta: ConvertMeta<ConvertImageEffectSource> = {
          id: taskId,
          format,
          source: {
            id: taskId,
            illust,
            data: effect
          },
          isAborted: false,
          onProgress,
          resolve,
          reject,
          abort() {
            this.isAborted = true;
          }
        };

        logger.info('Converter add', taskId);

        queue.push(meta);

        while (active.length < MAX_CONVERT && queue.length && !isStop) {
          doConvert(queue.shift() as ConvertMeta<ConvertSource>);
        }
      });
    }
  };
}

export const converter = createConverter();
