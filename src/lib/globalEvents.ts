export type DirHandleNotFoundEventDetail = {
  getFileHandle: () => Promise<void>;
  abort: () => void;
};

export type FileHandleNotFoundEventDetail = DirHandleNotFoundEventDetail & {
  path: string;
  signal?: AbortSignal;
};

export type RequestUserActivationEventDetail = {
  onAction: () => void;
  onClosed: () => void;
};

export const EVENT_FILE_HANDLE_NOT_FOUND = 'event-file-handle-not-fount';
export const EVENT_DIR_HANDLE_NOT_FOUND = 'event-dir-handle-not-fount';
export const EVENT_REQUEST_USER_ACTIVATION = 'event-request-user-activation';
