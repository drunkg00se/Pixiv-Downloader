import { CancelError } from '@/lib/error';
import { type DownloadMeta } from '..';

// 适用于不需子目录，且浏览器扩展不支持下载Blob（firefox）的的场景
export function aDownload(blob: Blob, downloadMeta: DownloadMeta): Promise<void> {
	if (downloadMeta.isAborted) return Promise.reject(new CancelError());

	// 处理带子目录的路径
	let path = downloadMeta.config.path;
	const separaterIndex = path.lastIndexOf('/');
	if (separaterIndex !== -1) path = path.slice(separaterIndex + 1);

	const dlEle = document.createElement('a');
	dlEle.href = URL.createObjectURL(blob);
	dlEle.download = path;
	dlEle.click();

	URL.revokeObjectURL(dlEle.href);

	return Promise.resolve();
}
