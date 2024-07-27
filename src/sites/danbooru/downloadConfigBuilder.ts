import type { DownloadConfig } from '@/lib/downloader';
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
    // Firefox ver128.0
    // when `downloadMode` is set to `browser` and use `GM_download()` to donwload image from danbooru,
    // the request headers set by firefox "sec-fetch-site: cross-site, sec-fetch-mode: no-cors"
    // will cause the request to be rejected by Cloudflare.
    return {
      taskId: Math.random().toString(36).slice(2),
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
