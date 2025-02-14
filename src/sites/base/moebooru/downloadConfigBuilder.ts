import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import type { MoebooruMeta } from './parser';
import { type DownloadConfig } from '@/lib/downloader';
import { DownloadConfigBuilder } from '../downloadConfigBuilder';

function artworkProgressFactory(
  btn?: ThumbnailButton
): DownloadConfig<MoebooruMeta>['onProgress'] | undefined {
  if (!btn) return;

  return function onArtworkProgress(progress) {
    btn.setProgress(progress);
  };
}

export class MoebooruDownloadConfig extends DownloadConfigBuilder<MoebooruMeta> {
  constructor(protected meta: MoebooruMeta) {
    super(meta);
  }

  public getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<MoebooruMeta> {
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
