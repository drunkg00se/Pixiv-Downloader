import { unsafeWindow } from '$';
import { logger } from '@/lib/logger';
import type { DownloadMeta } from '..';
import { CancelError } from '@/lib/error';

// 状态标识，避免下载多图时多次弹出DirectoryPicker
const enum DirHandleStatus {
  unpick,
  picking,
  picked
}

type PickingStatus = {
  kind: DirHandleStatus.picking;
};

type UpdateHandle = {
  kind: DirHandleStatus.picked;
  handle: FileSystemDirectoryHandle;
};

type UnpickStatus = {
  kind: DirHandleStatus.unpick;
};

type RequestHandle = {
  kind: 'request';
};

type ReponseHandle = {
  kind: 'response';
  handle: FileSystemDirectoryHandle;
};

type UpdateChannelData =
  | UnpickStatus
  | PickingStatus
  | UpdateHandle
  | RequestHandle
  | ReponseHandle;

type FilenameConflictAction = 'uniquify' | 'overwrite' | 'prompt';

class FileSystemAccessHandler {
  private filenameConflictAction: FilenameConflictAction = 'uniquify';

  private updateDirHandleChannel: BroadcastChannel;

  private dirHandle: FileSystemDirectoryHandle | undefined = undefined;
  private dirHandleStatus = DirHandleStatus.unpick;

  private cachedTasks: [Blob, DownloadMeta, () => void, (reason?: any) => void][] = [];

  private duplicateFilenameCached: Record<string, string[]> = {};

  constructor(channelName: string) {
    this.updateDirHandleChannel = new BroadcastChannel(channelName);

    this.updateDirHandleChannel.onmessage = (evt: MessageEvent) => {
      const data = evt.data as UpdateChannelData;

      switch (data.kind) {
        case DirHandleStatus.picking:
          this.dirHandleStatus = DirHandleStatus.picking;
          logger.info('正在选择目录');
          break;
        case DirHandleStatus.unpick:
          logger.warn('取消更新dirHandle');
          if (this.dirHandle) {
            this.dirHandleStatus = DirHandleStatus.picked;
            this.processCachedTasks();
          } else {
            this.dirHandleStatus = DirHandleStatus.unpick;
            this.rejectCachedTasks();
          }
          break;
        case DirHandleStatus.picked:
          this.dirHandleStatus = DirHandleStatus.picked;
          this.dirHandle = data.handle;
          logger.info('更新dirHandle', this.dirHandle);
          this.processCachedTasks();
          break;
        case 'request':
          if (this.dirHandle) {
            this.updateDirHandleChannel.postMessage({
              kind: 'response',
              handle: this.dirHandle
            });
            logger.info('响应请求dirHandle');
          }
          break;
        case 'response':
          if (!this.dirHandle) {
            if (this.dirHandleStatus === DirHandleStatus.unpick)
              this.dirHandleStatus = DirHandleStatus.picked;
            this.dirHandle = data.handle;
            logger.info('首次获取dirHandle', this.dirHandle);
          }
          break;
        default:
          throw new Error('Invalid data kind.');
      }
    };

    this.updateDirHandleChannel.postMessage({ kind: 'request' });
  }

  protected async getDirHandleRecursive(
    dirs: string | string[]
  ): Promise<FileSystemDirectoryHandle> {
    if (!this.dirHandle) throw new Error('未选择保存文件夹');

    let handler = this.dirHandle;

    if (typeof dirs === 'string') {
      if (dirs.indexOf('/') === -1) return await handler.getDirectoryHandle(dirs, { create: true });
      dirs = dirs.split('/').filter((dir) => !!dir);
    }

    for await (const dir of dirs) {
      handler = await handler.getDirectoryHandle(dir, { create: true });
    }

    return handler;
  }

  protected processCachedTasks() {
    const { length } = this.cachedTasks;
    for (let i = 0; i < length; i++) {
      const [blob, downloadMeta, onSaveFullfilled, onSaveRejected] = this.cachedTasks[i];
      this.saveFile(blob, downloadMeta).then(onSaveFullfilled, onSaveRejected);
    }
    logger.info(`执行${length}个缓存任务`);

    // saveWithFileSystemAccess可能存在push数据到数组的情况
    if (this.cachedTasks.length > length) {
      this.cachedTasks = this.cachedTasks.slice(length);
    } else {
      this.cachedTasks.length = 0;
    }
  }

  protected rejectCachedTasks() {
    this.cachedTasks.forEach(([, , , onSaveRejected]) => onSaveRejected(new CancelError()));
    this.cachedTasks.length = 0;
    logger.info(`取消${this.cachedTasks.length}个缓存任务`);
  }

  protected async getFilenameHandle(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ): Promise<FileSystemFileHandle> {
    if (this.filenameConflictAction === 'overwrite')
      return await dirHandle.getFileHandle(filename, { create: true });

    /** 首次检查是否存在同名文件 */
    if (!(filename in this.duplicateFilenameCached)) {
      this.duplicateFilenameCached[filename] = [];

      try {
        await dirHandle.getFileHandle(filename);
        logger.warn('存在同名文件', filename);
      } catch (error) {
        return await dirHandle.getFileHandle(filename, { create: true });
      }
    }

    const extIndex = filename.lastIndexOf('.');
    const ext = filename.slice(extIndex + 1);
    const name = filename.slice(0, extIndex);

    if (this.filenameConflictAction === 'prompt') {
      return await unsafeWindow.showSaveFilePicker({
        suggestedName: filename,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        types: [{ description: 'Image file', accept: { ['image/' + ext]: ['.' + ext] } }]
      });
    } else {
      for (let suffix = 1; suffix < 1000; suffix++) {
        const newName = `${name} (${suffix}).${ext}`;

        try {
          await dirHandle.getFileHandle(newName);
        } catch (error) {
          if (this.duplicateFilenameCached[filename].includes(newName)) {
            continue;
          } else {
            this.duplicateFilenameCached[filename].push(newName);
          }

          logger.info('使用文件名:', newName);
          return await dirHandle.getFileHandle(newName, { create: true });
        }
      }

      throw new RangeError('Oops, you have too many duplicate files.');
    }
  }

  protected clearFilenameCached(duplicateName: string, actualName: string): void {
    if (!(duplicateName in this.duplicateFilenameCached)) return;

    const usedNameArr = this.duplicateFilenameCached[duplicateName];

    logger.info('清理重名文件名', usedNameArr, actualName);

    if (usedNameArr.length === 0) {
      delete this.duplicateFilenameCached[duplicateName];
      return;
    }

    const index = usedNameArr.indexOf(actualName);
    if (index === -1) return;

    usedNameArr.splice(index, 1);
    if (usedNameArr.length === 0) delete this.duplicateFilenameCached[duplicateName];
  }

  public async updateDirHandle(): Promise<boolean> {
    try {
      this.dirHandleStatus = DirHandleStatus.picking;
      this.updateDirHandleChannel.postMessage({ kind: DirHandleStatus.picking });

      this.dirHandle = await unsafeWindow.showDirectoryPicker({ id: 'pdl', mode: 'readwrite' });
      logger.info('更新dirHandle', this.dirHandle);

      this.dirHandleStatus = DirHandleStatus.picked;
      this.updateDirHandleChannel.postMessage({
        kind: DirHandleStatus.picked,
        handle: this.dirHandle
      });

      this.processCachedTasks();

      return true;
    } catch (error) {
      logger.warn(error);

      this.updateDirHandleChannel.postMessage({ kind: DirHandleStatus.unpick });

      /** 更新目录失败，如果旧目录存在则继续存储到旧目录 */
      if (this.dirHandle) {
        this.dirHandleStatus = DirHandleStatus.picked;
        this.processCachedTasks();
      } else {
        /** 目录不存在，reject待下载的任务 */
        this.dirHandleStatus = DirHandleStatus.unpick;
        this.rejectCachedTasks();
      }
      return false;
    }
  }

  public getCurrentDirName(): string {
    return this.dirHandle?.name ?? '';
  }

  public isDirHandleNotSet(): boolean {
    return this.dirHandleStatus === DirHandleStatus.unpick;
  }

  public setFilenameConflictAction(action: FilenameConflictAction) {
    this.filenameConflictAction = action;
  }

  public async saveFile(blob: Blob, downloadMeta: DownloadMeta): Promise<void> {
    if (downloadMeta.isAborted) throw new CancelError();

    if (this.dirHandleStatus === DirHandleStatus.picking) {
      let onSaveFullfilled!: () => void;
      let onSaveRejected!: (reason?: any) => void;

      const promiseExcutor = new Promise<void>((resolve, reject) => {
        onSaveFullfilled = resolve;
        onSaveRejected = reject;
      });

      this.cachedTasks.push([blob, downloadMeta, onSaveFullfilled, onSaveRejected]);
      return promiseExcutor;
    }

    if (this.dirHandleStatus === DirHandleStatus.unpick) {
      const isSuccess = await this.updateDirHandle();
      if (!isSuccess) throw new TypeError('Failed to get dir handle.');
    }

    let currenDirHandle: FileSystemDirectoryHandle;
    let filename: string;
    const path = downloadMeta.config.path;
    const index = path.lastIndexOf('/');

    if (index === -1) {
      filename = path;
      currenDirHandle = this.dirHandle!;
    } else {
      filename = path.slice(index + 1);
      currenDirHandle = await this.getDirHandleRecursive(path.slice(0, index));
    }

    if (downloadMeta.isAborted) throw new CancelError();

    const fileHandle = await this.getFilenameHandle(currenDirHandle, filename);
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();

    this.clearFilenameCached(filename, fileHandle.name);
  }
}

export const fsaHandler = new FileSystemAccessHandler('update_dir_channel');
