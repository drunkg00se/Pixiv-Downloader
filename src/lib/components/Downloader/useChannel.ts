import { channelEvent } from '@/lib/channelEvent';
import { logger } from '@/lib/logger';

const enum BatchDownloadEventType {
  SET_PENDING = 'batchdownload.set-pending',
  SET_IDLE = 'batchdownload.set-idle',
  ADD_QUEUE = 'batchdownload.add-queue',
  REMOVE_QUEUE = 'batchdownload.remove-queue',
  PROCESS_NEXT = 'batchdownload.process-next',
  QUERY = 'batchdownload.query'
}

type BatchDownloadEventArgsMap = {
  [BatchDownloadEventType.SET_PENDING]: never;
  [BatchDownloadEventType.SET_IDLE]: never;
  [BatchDownloadEventType.ADD_QUEUE]: string;
  [BatchDownloadEventType.REMOVE_QUEUE]: string;
  [BatchDownloadEventType.PROCESS_NEXT]: [tabIds: string[]];
  [BatchDownloadEventType.QUERY]: never;
};

export function useChannel() {
  const TAB_ID = String(Math.random());

  const queue: string[] = [];

  let downloading = false;
  let pending = false;
  let onFullfilled: () => void;
  let onRejected: (reason?: unknown) => void;

  channelEvent.on<BatchDownloadEventArgsMap, BatchDownloadEventType.QUERY>(
    BatchDownloadEventType.QUERY,
    () => {
      downloading &&
        channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.SET_PENDING>(
          BatchDownloadEventType.SET_PENDING
        );
    }
  );

  channelEvent.on<BatchDownloadEventArgsMap, BatchDownloadEventType.SET_PENDING>(
    BatchDownloadEventType.SET_PENDING,
    () => {
      !pending && (pending = true);
    }
  );

  channelEvent.on<BatchDownloadEventArgsMap, BatchDownloadEventType.SET_IDLE>(
    BatchDownloadEventType.SET_IDLE,
    () => {
      pending && (pending = false);
    }
  );

  channelEvent.on<BatchDownloadEventArgsMap, BatchDownloadEventType.ADD_QUEUE>(
    BatchDownloadEventType.ADD_QUEUE,
    (tabId) => {
      downloading && queue.push(tabId);
    }
  );

  channelEvent.on<BatchDownloadEventArgsMap, BatchDownloadEventType.REMOVE_QUEUE>(
    BatchDownloadEventType.REMOVE_QUEUE,
    (tabId) => {
      if (!downloading) return;

      const idx = queue.findIndex((id) => id === tabId);
      idx !== -1 && queue.splice(idx, 1);
    }
  );

  channelEvent.on<BatchDownloadEventArgsMap, BatchDownloadEventType.PROCESS_NEXT>(
    BatchDownloadEventType.PROCESS_NEXT,
    (tabIds) => {
      if (tabIds[0] !== TAB_ID) return;

      queue.push(...tabIds.slice(1));
      pending = false;
      downloading = true;
      onFullfilled();
    }
  );

  window.addEventListener('unload', () => {
    if (pending) {
      channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.REMOVE_QUEUE>(
        BatchDownloadEventType.REMOVE_QUEUE,
        TAB_ID
      );
      return;
    }

    if (downloading) {
      queue.length
        ? channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.PROCESS_NEXT>(
            BatchDownloadEventType.PROCESS_NEXT,
            queue
          )
        : channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.SET_IDLE>(
            BatchDownloadEventType.SET_IDLE
          );
    }
  });

  channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.QUERY>(
    BatchDownloadEventType.QUERY
  );

  return {
    async requestDownload() {
      if (!pending) {
        downloading = true;

        channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.SET_PENDING>(
          BatchDownloadEventType.SET_PENDING
        );

        logger.info('channel post: SET_PENDING');

        return;
      }

      const waitUntilIdle = new Promise<void>((resolve, reject) => {
        onFullfilled = resolve;
        onRejected = reject;
      });

      channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.ADD_QUEUE>(
        BatchDownloadEventType.ADD_QUEUE,
        TAB_ID
      );

      logger.info('channel post: ADD_QUEUE', TAB_ID);

      return waitUntilIdle;
    },

    cancelDownloadRequest(reason?: unknown) {
      if (!pending) return;

      channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.REMOVE_QUEUE>(
        BatchDownloadEventType.REMOVE_QUEUE,
        TAB_ID
      );

      logger.info('channel post: REMOVE_QUEUE', TAB_ID);

      onRejected(reason);
    },

    processNextDownload() {
      if (!downloading) return;
      downloading = false;

      if (queue.length) {
        pending = true;

        channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.PROCESS_NEXT>(
          BatchDownloadEventType.PROCESS_NEXT,
          queue
        );

        queue.length = 0;

        logger.info('channel post: PROCESS_NEXT');
      } else {
        channelEvent.emit<BatchDownloadEventArgsMap, BatchDownloadEventType.SET_IDLE>(
          BatchDownloadEventType.SET_IDLE
        );

        logger.info('channel post: SET_IDLE');
      }
    }
  };
}
