import { DownloadConfigBuilder } from '../base/downloadConfigBuilder';
import { type DownloadConfig } from '@/lib/downloader';
import type { Rule34Meta } from './parser';
import { ThumbnailButton } from '../../lib/components/Button/thumbnailButton';
import { config } from '@/lib/config';

function artworkProgressFactory(
  btn?: ThumbnailButton
): DownloadConfig<Rule34Meta>['onProgress'] | undefined {
  if (!btn) return;

  return function onArtworkProgress(progress) {
    btn.setProgress(progress);
  };
}

export class Rule34DownloadConfig extends DownloadConfigBuilder<Rule34Meta> {
  protected headers = config.get('token')
    ? {
        cookie: `cf_clearance=${config.get('token')}`
      }
    : undefined;

  constructor(protected meta: Rule34Meta) {
    super(meta);
  }

  public getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<Rule34Meta> {
    return {
      headers: this.headers,
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
