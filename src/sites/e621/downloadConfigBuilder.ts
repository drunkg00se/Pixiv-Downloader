import type { DownloadConfig } from '@/lib/downloader';
import { DownloadConfigBuilder } from '../base/downloadConfigBuilder';
import type { E621ngMeta } from './parser';
import { ThumbnailButton } from '../../lib/components/Button/thumbnailButton';

function artworkProgressFactory(
  btn?: ThumbnailButton
): DownloadConfig<E621ngMeta>['onProgress'] | undefined {
  if (!btn) return;

  return function onArtworkProgress(progress) {
    btn.setProgress(progress);
  };
}

export class E621ngMetaDownloadConfig extends DownloadConfigBuilder<E621ngMeta> {
  constructor(protected meta: E621ngMeta) {
    super(meta);
  }

  public getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<E621ngMeta> {
    return {
      taskId: this.generateTaskId(),
      src: this.meta.src,
      path: this.buildFilePath(),
      source: this.meta,
      timeout: this.isImage() ? 60000 : undefined,
      onProgress: artworkProgressFactory(btn)
    };
  }

  protected buildFilePath(): string {
    const path = super.buildFilePath();
    return path.replaceAll('{character}', this.normalizeString(this.meta.character));
  }
}
