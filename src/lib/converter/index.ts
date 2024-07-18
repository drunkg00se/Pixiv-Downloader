import { logger } from '@/lib/logger';
import { CancelError, RequestError } from '@/lib/error';
import { type ConvertFormat, convertAdapter } from './adapter';
export type { ConvertFormat } from './adapter';

interface ConvertSource {
  id: string;
  data: Blob[];
  delays: number[];
}

export interface ConvertMeta {
  id: string;
  format: ConvertFormat;
  source: ConvertSource;
  isAborted: boolean;
  resolve: (val: Blob) => void;
  reject: (reason: TypeError | RequestError | CancelError) => void;
  abort: () => void;
  onProgress?: (val: number) => void;
}

interface Converter {
  addFrame(taskId: string, data: Blob, delay: number, order?: number): void;
  convert(
    taskId: string,
    format: ConvertFormat,
    onProgress?: ConvertMeta['onProgress']
  ): Promise<Blob>;
  del: (taskIds: string | string[]) => void;
  framesCount(taskId: string): number;
}

function createConverter(): Converter {
  const MAX_CONVERT = 2;
  const framesData: Record<string, ConvertSource> = {};

  let isStop = false;
  let queue: ConvertMeta[] = [];
  let active: ConvertMeta[] = [];

  const doConvert = (convertMeta: ConvertMeta) => {
    const { id, format, source, resolve, reject } = convertMeta;

    active.push(convertMeta);
    convertMeta.onProgress?.(0);

    // 清理framesData
    delete framesData[id];

    const adapter = convertAdapter.getAdapter(format);
    adapter(source.data, convertMeta)
      .then(resolve, reject)
      .finally(() => {
        active.splice(active.indexOf(convertMeta), 1);
        if (queue.length) doConvert(queue.shift() as ConvertMeta);
      });
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
        doConvert(queue.shift() as ConvertMeta);
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
        framesData[taskId]['data'].push(data);
        framesData[taskId]['delays'].push(delay);
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
      onProgress?: ConvertMeta['onProgress']
    ): Promise<Blob> {
      return new Promise<Blob>((resolve, reject) => {
        const meta: ConvertMeta = {
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
          doConvert(queue.shift() as ConvertMeta);
        }
      });
    }
  };
}

export const converter = createConverter();
