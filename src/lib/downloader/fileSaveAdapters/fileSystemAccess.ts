import { unsafeWindow } from '$';
import { channelEvent } from '@/lib/channelEvent';
import { historyDb } from '@/lib/db';
import { CancelError } from '@/lib/error';
import {
  EVENT_DIR_HANDLE_NOT_FOUND,
  EVENT_FILE_HANDLE_NOT_FOUND,
  EVENT_REQUEST_USER_ACTIVATION,
  type DirHandleNotFoundEventDetail,
  type FileHandleNotFoundEventDetail,
  type RequestUserActivationEventDetail
} from '@/lib/globalEvents';
import { logger } from '@/lib/logger';
import { regexp } from '@/lib/regExp';

export const enum DirHandleStatus {
  PICKED = 'dirHandle.picked',
  UNPICK = 'dirHandle.unpick',
  PICKING = 'dirHandle.picking'
}

type DirHandleEventArgsMap = {
  [DirHandleStatus.PICKED]: FileSystemDirectoryHandle;
  [DirHandleStatus.UNPICK]: never;
  [DirHandleStatus.PICKING]: never;
};

export const enum FilenameConflictAction {
  UNIQUIFY = 'uniquify',
  OVERWRITE = 'overwrite',
  PROMPT = 'prompt'
}

let dirHandle: FileSystemDirectoryHandle | null = null;
let dirHandleStatus = DirHandleStatus.UNPICK;

const occupiedFilename: Set<string> = new Set();

const pendingList: [(v: FileSystemDirectoryHandle) => void, (reason?: unknown) => void][] = [];

channelEvent.on(DirHandleStatus.PICKING, () => {
  logger.info('channelEvnet:DirHandleStatus.PICKING');
  dirHandleStatus = DirHandleStatus.PICKING;
});

channelEvent.on(DirHandleStatus.UNPICK, async () => {
  logger.info('channelEvnet:DirHandleStatus.UNPICK');

  dirHandleStatus = DirHandleStatus.UNPICK;
  dirHandle = null;
  rejectPendingList(new Error('Directory handle not found.'));
});

channelEvent.on<DirHandleEventArgsMap, DirHandleStatus.PICKED>(
  DirHandleStatus.PICKED,
  async (handler: FileSystemDirectoryHandle) => {
    logger.info('channelEvnet:DirHandleStatus.PICKED');

    dirHandleStatus = DirHandleStatus.PICKED;
    dirHandle = handler;

    if ((await dirHandle.queryPermission({ mode: 'readwrite' })) === 'granted') {
      resolvePendingList(dirHandle);
    } else {
      rejectPendingList(new Error('Permission denied.'));
    }
  }
);

async function getPersistedDirHanle(): Promise<FileSystemDirectoryHandle | null> {
  return (await historyDb.getDirectoryHandle()) ?? null;
}

function setPersistedDirHanle(dirHandle: FileSystemDirectoryHandle): void {
  historyDb.setDirectoryHandle(dirHandle);
}

function resolvePendingList(dirHandle: FileSystemDirectoryHandle) {
  if (!pendingList.length) return;

  for (const [resolve] of pendingList) {
    resolve(dirHandle);
  }

  pendingList.length = 0;
}

function rejectPendingList(reason?: unknown) {
  if (!pendingList.length) return;

  for (const [, reject] of pendingList) {
    reject(reason);
  }

  pendingList.length = 0;
}

function setDirHandleStatus(status: DirHandleStatus.PICKING): void;
function setDirHandleStatus(status: DirHandleStatus.UNPICK): void;
function setDirHandleStatus(
  status: DirHandleStatus.PICKED,
  dirHandle: FileSystemDirectoryHandle
): void;
function setDirHandleStatus(status: DirHandleStatus, dirHandle?: FileSystemDirectoryHandle): void {
  if (status === DirHandleStatus.PICKING) {
    dirHandleStatus = DirHandleStatus.PICKING;
    channelEvent.emit<DirHandleEventArgsMap, DirHandleStatus.PICKING>(DirHandleStatus.PICKING);
    return;
  }

  if (status === DirHandleStatus.UNPICK) {
    dirHandleStatus = DirHandleStatus.UNPICK;
    channelEvent.emit<DirHandleEventArgsMap, DirHandleStatus.UNPICK>(DirHandleStatus.UNPICK);
    return;
  }

  if (!dirHandle) throw new Error('directory handle should not be null.');

  dirHandleStatus = DirHandleStatus.PICKED;
  channelEvent.emit<DirHandleEventArgsMap, DirHandleStatus.PICKED>(
    DirHandleStatus.PICKED,
    dirHandle
  );
}

async function verifyPermission(fileHandle: FileSystemDirectoryHandle) {
  const opts = { mode: 'readwrite' } as const;

  if ((await fileHandle.queryPermission(opts)) === 'granted') {
    return true;
  }

  if (navigator.userActivation.isActive) {
    if ((await fileHandle.requestPermission(opts)) === 'granted') {
      return true;
    }
  } else {
    if (dirHandleStatus !== DirHandleStatus.PICKING) {
      setDirHandleStatus(DirHandleStatus.PICKING);
    }

    const success = await new Promise<boolean>((resolve) => {
      globalThis.dispatchEvent(
        new CustomEvent<RequestUserActivationEventDetail>(EVENT_REQUEST_USER_ACTIVATION, {
          detail: {
            onAction() {
              resolve(true);
            },
            onClosed() {
              resolve(false);
            }
          }
        })
      );
    });

    if (!success) {
      setDirHandleStatus(DirHandleStatus.PICKED, fileHandle);
      return false;
    }

    const permissionState = await fileHandle.requestPermission(opts);

    setDirHandleStatus(DirHandleStatus.PICKED, fileHandle);

    if (success && permissionState === 'granted') {
      return true;
    }
  }

  return false;
}

/*
 * Must be handling a user gesture to show a file picker.
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1193489
 * https://developer.mozilla.org/en-US/docs/Web/API/UserActivation/isActive
 */
async function getDirHandleByUserAction(
  userAction: () => Promise<FileSystemDirectoryHandle>
): Promise<FileSystemDirectoryHandle> {
  try {
    if (dirHandleStatus !== DirHandleStatus.PICKING) {
      setDirHandleStatus(DirHandleStatus.PICKING);
    }

    dirHandle = await userAction();

    setDirHandleStatus(DirHandleStatus.PICKED, dirHandle);

    resolvePendingList(dirHandle);

    setPersistedDirHanle(dirHandle);
  } catch (error) {
    if (dirHandle) {
      logger.warn(error);

      const hasPermission = await verifyPermission(dirHandle);

      setDirHandleStatus(DirHandleStatus.PICKED, dirHandle);

      if (!hasPermission) {
        const error = new Error('Permission denied.');
        rejectPendingList(error);
        throw error;
      }

      resolvePendingList(dirHandle);
    } else {
      setDirHandleStatus(DirHandleStatus.UNPICK);
      rejectPendingList(error);
      throw error;
    }
  }

  return dirHandle;
}

async function getRootDirHandle(signal?: AbortSignal) {
  if (dirHandleStatus === DirHandleStatus.UNPICK) {
    setDirHandleStatus(DirHandleStatus.PICKING);

    if ((dirHandle = await getPersistedDirHanle())) {
      const hasPermission = await verifyPermission(dirHandle);

      setDirHandleStatus(DirHandleStatus.PICKED, dirHandle);

      if (!hasPermission) {
        const error = new Error('Permission denied.');
        rejectPendingList(error);
        throw error;
      }

      resolvePendingList(dirHandle);

      return dirHandle;
    }

    return await getDirHandleByUserAction(() => {
      return new Promise<FileSystemDirectoryHandle>((resolve, reject) => {
        globalThis.dispatchEvent(
          new CustomEvent<DirHandleNotFoundEventDetail>(EVENT_DIR_HANDLE_NOT_FOUND, {
            detail: {
              getFileHandle: async () => {
                try {
                  const dirHandle = await unsafeWindow.showDirectoryPicker({
                    id: 'pdl-dir-handle',
                    mode: 'readwrite'
                  });
                  resolve(dirHandle);
                } catch (error) {
                  reject(error);
                }
              },
              abort: () => reject(new CancelError())
            }
          })
        );

        signal?.addEventListener(
          'abort',
          () => {
            reject(signal.reason);
          },
          { once: true }
        );

        // push the promise to the pendingList so it can be resolved when the user
        // selects a directory handle in the setting.
        pendingList.push([resolve, reject]);
      });
    });
  }

  if (dirHandleStatus === DirHandleStatus.PICKING) {
    const prom = new Promise<FileSystemDirectoryHandle>((resolve, reject) => {
      pendingList.push([resolve, reject]);
    });

    return await prom;
  }

  if (!dirHandle) throw new Error('DirHandle should not be null.');

  if (!(await verifyPermission(dirHandle))) {
    const error = new Error('Permission denied.');
    rejectPendingList(error);
    throw error;
  }

  return dirHandle;
}

async function getFileHandle(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  filenameConflictAction: FilenameConflictAction
): Promise<FileSystemFileHandle> {
  if (filenameConflictAction === FilenameConflictAction.OVERWRITE) {
    return dirHandle.getFileHandle(filename, { create: true });
  }

  if (!occupiedFilename.has(filename)) {
    occupiedFilename.add(filename);

    try {
      await dirHandle.getFileHandle(filename);
    } catch (error) {
      // await is needed here
      return await dirHandle.getFileHandle(filename, { create: true });
    } finally {
      occupiedFilename.delete(filename);
    }
  }

  // filename is duplicated

  if (filenameConflictAction === FilenameConflictAction.PROMPT) {
    throw new DOMException('', 'NotFoundError');
  }

  const extIndex = filename.lastIndexOf('.');
  const ext = filename.slice(extIndex + 1);
  const name = filename.slice(0, extIndex);

  for (let suffix = 1; suffix < 101; suffix++) {
    const newFilename = `${name} (${suffix}).${ext}`;

    if (occupiedFilename.has(newFilename)) {
      continue;
    }

    occupiedFilename.add(newFilename);

    try {
      await dirHandle.getFileHandle(newFilename);
    } catch (error) {
      const fileHandle = await dirHandle.getFileHandle(newFilename, { create: true });
      logger.info(`Rename ${filename}' to ${newFilename}`);
      return fileHandle;
    } finally {
      occupiedFilename.delete(newFilename);
    }
  }

  const newFilename = `${name} - ${new Date().toISOString().replaceAll(':', '')}.${ext}`;

  return dirHandle.getFileHandle(newFilename, { create: true });
}

export async function saveFile(
  filenameConflictAction: FilenameConflictAction,
  blob: Blob,
  path: string,
  signal?: AbortSignal
): Promise<void> {
  const rootDirHandle = await getRootDirHandle(signal);

  signal?.throwIfAborted();

  let currentDirHandle: FileSystemDirectoryHandle = rootDirHandle;
  let fileHandle: FileSystemFileHandle | null = null;
  let writableStream: FileSystemWritableFileStream | null = null;

  const filenameIndex = path.lastIndexOf('/');
  const filename = filenameIndex === -1 ? path : path.slice(filenameIndex + 1);

  try {
    if (filenameIndex !== -1) {
      const relativePaths = path.slice(0, filenameIndex).split('/');

      for (const dir of relativePaths) {
        currentDirHandle = await currentDirHandle.getDirectoryHandle(dir, { create: true });
      }
    }

    fileHandle = await getFileHandle(currentDirHandle, filename, filenameConflictAction);
    writableStream = await fileHandle.createWritable();
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'NotFoundError')) {
      throw error;
    }

    if (fileHandle !== null) {
      currentDirHandle.removeEntry(fileHandle.name);
    }

    fileHandle = await new Promise<FileSystemFileHandle>((resolve, reject) => {
      const extIndex = filename.lastIndexOf('.');
      const ext = filename.slice(extIndex + 1);
      const mimeType = regexp.imageExt.test(ext) ? `image/${ext}` : `video/${ext}`;

      globalThis.dispatchEvent(
        new CustomEvent<FileHandleNotFoundEventDetail>(EVENT_FILE_HANDLE_NOT_FOUND, {
          detail: {
            signal,
            path,
            getFileHandle: async () => {
              try {
                const fileHandle = await unsafeWindow.showSaveFilePicker({
                  startIn: currentDirHandle,
                  suggestedName: filename,
                  types: [
                    {
                      description: 'Media',
                      accept: { [mimeType]: '.' + ext } as Record<
                        `${string}/${string}`,
                        `.${string}`
                      >
                    }
                  ]
                });
                resolve(fileHandle);
              } catch (error) {
                reject(error);
              }
            },
            abort: () => reject(new CancelError())
          }
        })
      );

      signal?.addEventListener(
        'abort',
        () => {
          reject(signal.reason);
        },
        { once: true }
      );
    });

    writableStream = await fileHandle.createWritable();
  }

  await writableStream.write(blob);
  await writableStream.close();
}

export function selectRootDirHandle() {
  return getDirHandleByUserAction(() => {
    return unsafeWindow.showDirectoryPicker({
      id: 'pdl-dir-handle',
      mode: 'readwrite'
    });
  });
}
