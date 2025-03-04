import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import type { NijieDiffSrc, NijieMeta } from './parser';
import { type DownloadConfig } from '@/lib/downloader';
import { DownloadConfigBuilder } from '../base/downloadConfigBuilder';

export interface NijieDownloaderSource extends NijieMeta {
  page: number;
  total: number;
}

function artworkProgressFactory(
  btn?: ThumbnailButton
): DownloadConfig<NijieDownloaderSource>['onProgress'] | undefined {
  if (!btn) return;

  return function onArtworkProgress(progress) {
    btn.setProgress(progress);
  };
}

export class NijieDownloadConfig extends DownloadConfigBuilder<NijieDownloaderSource> {
  #source: NijieDownloaderSource;

  constructor(protected meta: NijieMeta) {
    super(meta);

    this.#source = { ...this.meta, page: 0, total: 1 };
  }

  protected buildFilePath(): string {
    const path = super.buildFilePath();
    const { page, userId } = this.#source;

    return path.replaceAll('{page}', String(page)).replaceAll('{artistID}', userId);
  }

  public getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<NijieDownloaderSource> {
    return {
      taskId: this.generateTaskId(),
      src: this.#source.src,
      path: this.buildFilePath(),
      source: this.#source,
      timeout: this.isImage() ? 60000 : undefined,
      onProgress: artworkProgressFactory(btn)
    };
  }

  protected onImageDiffDownloadProgress(btn?: ThumbnailButton, total?: number) {
    if (!btn || !total) return;
    let completed = 0;

    return () => {
      const progress = Math.floor((++completed / total) * 100);
      btn.setProgress(progress);
    };
  }

  public generateMultiPageConfig(
    diffSrcs: NijieDiffSrc[],
    page?: number,
    btn?: ThumbnailButton
  ): DownloadConfig<NijieDownloaderSource> | DownloadConfig<NijieDownloaderSource>[] {
    const config = this.getDownloadConfig(btn);
    const total = diffSrcs.length;
    const path = super.buildFilePath();

    config.onProgress = undefined;
    config.onXhrLoaded = this.onImageDiffDownloadProgress(btn, total);

    if (page === undefined) {
      return diffSrcs.map((diffSrc, idx) => {
        const source = {
          ...this.#source,
          ...diffSrc,
          total,
          page: idx
        };

        return {
          ...config,
          source,
          src: source.src,
          path: path.replaceAll('{page}', String(idx)).replaceAll('{artistID}', source.userId)
        };
      });
    } else {
      if (page > total || page < 0) throw new RangeError('Invalid page');

      const source = {
        ...this.#source,
        ...diffSrcs[page],
        total,
        page
      };

      return {
        ...config,
        source,
        src: source.src,
        path: path.replaceAll('{page}', String(page)).replaceAll('{artistID}', source.userId)
      };
    }
  }
}
