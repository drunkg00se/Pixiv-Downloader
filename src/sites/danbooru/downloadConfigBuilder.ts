import { downloader, type DownloadConfig } from '@/lib/downloader';
import { DownloadConfigBuilder } from '../base/downloadConfigBuilder';
import type { DanbooruMeta } from './parser';
import { ThumbnailButton } from '../../lib/components/Button/thumbnailButton';

function artworkProgressFactory(
  btn?: ThumbnailButton
): DownloadConfig<DanbooruMeta>['onProgress'] | undefined {
  if (!btn) return;

  return function onArtworkProgress(progress) {
    btn.setProgress(progress);
  };
}

export class DanbooruDownloadConfig extends DownloadConfigBuilder<DanbooruMeta> {
  constructor(protected meta: DanbooruMeta) {
    super(meta);
  }

  public getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<DanbooruMeta> {
    return {
      taskId: Math.random().toString(36).slice(2),
      src: this.meta.src,
      path: this.buildFilePath(),
      source: this.meta,
      timeout: this.isImage() ? 60000 : undefined,
      // GM_download下载带cf_clearance cookie
      directSave: downloader.fileSystemAccessEnabled ? false : true,
      onProgress: artworkProgressFactory(btn)
    };
  }

  protected buildFilePath(): string {
    const path = super.buildFilePath();
    return path.replaceAll('{character}', this.normalizeString(this.meta.character));
  }
}
