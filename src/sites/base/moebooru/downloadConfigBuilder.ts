import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import type { MoebooruMeta } from './parser';
import { type DownloadConfig } from '@/lib/downloader';
import { DownloadConfigBuilder } from '../downloadConfigBuilder';
import { config } from '@/lib/config';

function artworkProgressFactory(
  btn?: ThumbnailButton
): DownloadConfig<MoebooruMeta>['onProgress'] | undefined {
  if (!btn) return;

  return function onArtworkProgress(progress) {
    btn.setProgress(progress);
  };
}

export class MoebooruDownloadConfig extends DownloadConfigBuilder<MoebooruMeta> {
  #headers: Record<string, string> | undefined;

  constructor(protected meta: MoebooruMeta) {
    super(meta);

    const cf_clearance = config.get('auth')?.cf_clearance;

    this.#headers = cf_clearance
      ? {
          cookie: `cf_clearance=${cf_clearance}`
        }
      : undefined;
  }

  public getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<MoebooruMeta> {
    return {
      headers: this.#headers,
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
