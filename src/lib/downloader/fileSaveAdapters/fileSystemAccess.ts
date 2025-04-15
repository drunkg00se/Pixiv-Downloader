import { unsafeWindow } from '$';
import { channelEvent } from '@/lib/channelEvent';
import { CancelError } from '@/lib/error';
import { logger } from '@/lib/logger';

// 状态标识，避免下载多图时多次弹出DirectoryPicker
export const enum DirHandleStatus {
  REQUEST = 'dirHandle.request',
  RESPONSE = 'dirHandle.response',
  PICKED = 'dirHandle.picked',
  UNPICK = 'dirHandle.unpick',
  PICKING = 'dirHandle.picking'
}

type DirHandleEventArgsMap = {
  [DirHandleStatus.REQUEST]: never;
  [DirHandleStatus.RESPONSE]: FileSystemDirectoryHandle;
  [DirHandleStatus.PICKED]: FileSystemDirectoryHandle;
  [DirHandleStatus.UNPICK]: never;
  [DirHandleStatus.PICKING]: never;
};

export const enum FilenameConflictAction {
  UNIQUIFY = 'uniquify',
  OVERWRITE = 'overwrite',
  PROMPT = 'prompt'
}

class FileSystemAccessHandler {
  private filenameConflictAction: FilenameConflictAction = FilenameConflictAction.UNIQUIFY;

  private dirHandle: FileSystemDirectoryHandle | undefined = undefined;

  private dirHandleStatus = DirHandleStatus.UNPICK;

  private cachedTasks: [
    data: Blob,
    path: string,
    signal: AbortSignal | undefined,
    resolve: () => void,
    reject: (reason?: unknown) => void
  ][] = [];

  private duplicateFilenameCached: Record<string, string[]> = {};

  constructor() {
    this.#addChannelEventListeners();

    channelEvent.emit<DirHandleEventArgsMap, DirHandleStatus.REQUEST>(DirHandleStatus.REQUEST);
  }

  #addChannelEventListeners() {
    channelEvent.on(DirHandleStatus.REQUEST, () => {
      if (!this.dirHandle) return;

      channelEvent.emit<DirHandleEventArgsMap, DirHandleStatus.RESPONSE>(
        DirHandleStatus.RESPONSE,
        this.dirHandle
      );

      logger.info('响应请求dirHandle');
    });

    channelEvent.on<DirHandleEventArgsMap, DirHandleStatus.RESPONSE>(
      DirHandleStatus.RESPONSE,
      (handler: FileSystemDirectoryHandle) => {
        if (this.dirHandle) return;

        if (this.dirHandleStatus === DirHandleStatus.UNPICK)
          this.dirHandleStatus = DirHandleStatus.PICKED;

        this.dirHandle = handler;

        logger.info('首次获取dirHandle', this.dirHandle);
      }
    );

    channelEvent.on(DirHandleStatus.PICKING, () => {
      this.dirHandleStatus = DirHandleStatus.PICKING;
      logger.info('正在选择目录');
    });

    channelEvent.on(DirHandleStatus.UNPICK, () => {
      logger.warn('取消更新dirHandle');

      if (this.dirHandle) {
        this.dirHandleStatus = DirHandleStatus.PICKED;
        this.processCachedTasks();
      } else {
        this.dirHandleStatus = DirHandleStatus.UNPICK;
        this.rejectCachedTasks();
      }
    });

    channelEvent.on<DirHandleEventArgsMap, DirHandleStatus.PICKED>(
      DirHandleStatus.PICKED,
      (handler: FileSystemDirectoryHandle) => {
        this.dirHandleStatus = DirHandleStatus.PICKED;
        this.dirHandle = handler;

        logger.info('更新dirHandle', this.dirHandle);
        this.processCachedTasks();
      }
    );
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
      const [blob, path, signal, onSaveFullfilled, onSaveRejected] = this.cachedTasks[i];
      this.saveFile(blob, path, signal).then(onSaveFullfilled, onSaveRejected);
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
    this.cachedTasks.forEach(([, , , , onSaveRejected]) => onSaveRejected(new CancelError()));
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
        // @ts-expect-error accept MIMEType & FileExtension
        types: [{ description: 'Image file', accept: { ['image/' + ext]: '.' + ext } }]
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
      this.dirHandleStatus = DirHandleStatus.PICKING;

      channelEvent.emit<DirHandleEventArgsMap, DirHandleStatus.PICKING>(DirHandleStatus.PICKING);

      this.dirHandle = await unsafeWindow.showDirectoryPicker({ id: 'pdl', mode: 'readwrite' });

      logger.info('更新dirHandle', this.dirHandle);

      this.dirHandleStatus = DirHandleStatus.PICKED;

      channelEvent.emit<DirHandleEventArgsMap, DirHandleStatus.PICKED>(
        DirHandleStatus.PICKED,
        this.dirHandle
      );

      this.processCachedTasks();

      return true;
    } catch (error) {
      logger.warn(error);

      channelEvent.emit<DirHandleEventArgsMap, DirHandleStatus.UNPICK>(DirHandleStatus.UNPICK);

      /** 更新目录失败，如果旧目录存在则继续存储到旧目录 */
      if (this.dirHandle) {
        this.dirHandleStatus = DirHandleStatus.PICKED;
        this.processCachedTasks();
      } else {
        /** 目录不存在，reject待下载的任务 */
        this.dirHandleStatus = DirHandleStatus.UNPICK;
        this.rejectCachedTasks();
      }
      return false;
    }
  }

  public getCurrentDirName(): string {
    return this.dirHandle?.name ?? '';
  }

  public isDirHandleNotSet(): boolean {
    return this.dirHandleStatus === DirHandleStatus.UNPICK;
  }

  public setFilenameConflictAction(action: FilenameConflictAction) {
    this.filenameConflictAction !== action && (this.filenameConflictAction = action);
  }

  public async saveFile(blob: Blob, path: string, signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted();

    if (this.dirHandleStatus === DirHandleStatus.PICKING) {
      let onSaveFullfilled!: () => void;
      let onSaveRejected!: (reason?: unknown) => void;

      const promiseExcutor = new Promise<void>((resolve, reject) => {
        onSaveFullfilled = resolve;
        onSaveRejected = reject;
      });

      this.cachedTasks.push([blob, path, signal, onSaveFullfilled, onSaveRejected]);
      return promiseExcutor;
    }

    if (this.dirHandleStatus === DirHandleStatus.UNPICK) {
      const isSuccess = await this.updateDirHandle();
      if (!isSuccess) throw new TypeError('Failed to get dir handle.');
    }

    let currenDirHandle: FileSystemDirectoryHandle;
    let filename: string;
    const index = path.lastIndexOf('/');

    if (index === -1) {
      filename = path;
      currenDirHandle = this.dirHandle!;
    } else {
      filename = path.slice(index + 1);
      currenDirHandle = await this.getDirHandleRecursive(path.slice(0, index));
    }

    signal?.throwIfAborted();

    const fileHandle = await this.getFilenameHandle(currenDirHandle, filename);
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();

    this.clearFilenameCached(filename, fileHandle.name);
  }
}

export const fsaHandler = new FileSystemAccessHandler();
