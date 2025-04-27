export type DirHandleNotFoundEventDetail = {
  getFileHandle: () => Promise<void>;
  abort: () => void;
};

export type FileHandleNotFoundEventDetail = DirHandleNotFoundEventDetail & {
  path: string;
  signal?: AbortSignal;
};

export const EVENT_FILE_HANDLE_NOT_FOUND = 'evnt-file-handle-not-fount';
export const EVENT_DIR_HANDLE_NOT_FOUND = 'evnt-dir-handle-not-fount';
