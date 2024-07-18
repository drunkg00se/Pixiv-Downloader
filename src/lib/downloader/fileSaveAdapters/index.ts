import { env } from '@/lib/env';
import { fsaHandler } from './fileSystemAccess';
import { gmDownload } from './gmDownload';
import { logger } from '@/lib/logger';
import { aDownload } from './aDownload';
import type { DownloadMeta } from '..';
import { config } from '@/lib/config';
import { GM_info } from '$';
import { gmDownloadDataUrl } from './gmDownloadDataUrl';

type FileSaveFn = (blob: Blob, downloadMeta: DownloadMeta) => Promise<void>;

let saveFile: FileSaveFn;

const blobAvaliable = env.isBlobDlAvaliable();
const subPathAvaliable = env.isSupportSubpath();

if (subPathAvaliable) {
	if (!blobAvaliable) {
		// firefox + Tampermonkey
		// 将动图格式转换至dataUrl以实现保存到子文件夹
		saveFile = gmDownloadDataUrl;
	} else {
		saveFile = gmDownload;
	}
} else {
	// Violentmonkey 不支持子路径
	saveFile = aDownload;
	logger.warn('Download function is not fully supported:', GM_info.scriptHandler, GM_info.version);
}

export const fileSaveAdapters = {
	getAdapter(): FileSaveFn {
		if (this.isFileSystemAccessEnable()) {
			fsaHandler.setFilenameConflictAction(config.get('fileSystemFilenameConflictAction'));
			return fsaHandler.saveFile.bind(fsaHandler);
		} else {
			return saveFile;
		}
	},

	isFileSystemAccessEnable(): boolean {
		return env.isFileSystemAccessAvaliable() && config.get('useFileSystemAccess');
	},

	dirHandleCheck(): void {
		if (this.isFileSystemAccessEnable() && fsaHandler.isDirHandleNotSet())
			fsaHandler.updateDirHandle();
	},

	async updateDirHandle(): Promise<string> {
		if (this.isFileSystemAccessEnable()) {
			await fsaHandler.updateDirHandle();
			return fsaHandler.getCurrentDirName();
		}
		return '';
	},

	getFsaDirName(): string {
		if (this.isFileSystemAccessEnable()) {
			return fsaHandler.getCurrentDirName();
		} else {
			return '';
		}
	}
};
