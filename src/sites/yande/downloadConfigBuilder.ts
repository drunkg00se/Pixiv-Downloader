import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import type { YandeMeta } from './parser';
import { type DownloadConfig } from '@/lib/downloader';
import { DownloadConfigBuilder } from '../base/downloadConfigBuilder';

function artworkProgressFactory(
  btn?: ThumbnailButton
): DownloadConfig<YandeMeta>['onProgress'] | undefined {
  if (!btn) return;

  return function onArtworkProgress(progress) {
    btn.setProgress(progress);
  };
}

export class YandeDownloadConfig extends DownloadConfigBuilder<YandeMeta> {
  constructor(protected meta: YandeMeta) {
    super(meta);
  }

  public getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<YandeMeta> {
    return {
      taskId: this.generateTaskId(),
      src: this.meta.src,
      path: this.buildFilePath(),
      source: this.meta,
      timeout: 60000,
      onProgress: artworkProgressFactory(btn)
    };
  }

  protected buildFilePath(): string {
    const path = super.buildFilePath();
    return path.replaceAll('{character}', this.normalizeString(this.meta.character));
  }
}
