import { config } from '@/lib/config';
import { type DownloadConfig, downloader } from '@/lib/downloader';
import { env } from '@/lib/env';
import type { MediaMeta } from '@/sites/base/parser';
import { replaceInvalidChar, unescapeHtml } from '@/lib/util';
import dayjs from 'dayjs';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

export abstract class DownloadConfigBuilder<T extends MediaMeta> {
  constructor(protected meta: MediaMeta) {}

  protected normalizeString(str: string): string {
    return replaceInvalidChar(unescapeHtml(str));
  }

  protected getFolderPattern(): string {
    return config.get('folderPattern');
  }

  protected getFilenamePattern(): string {
    return config.get('filenamePattern');
  }

  protected getFullpathPattern(): string {
    const folder = this.getFolderPattern();
    const filename = this.getFilenamePattern() + '.' + this.meta.extendName;
    return folder ? folder + '/' + filename : filename;
  }

  protected isBrowserApi(): boolean {
    return env.isBrowserDownloadMode();
  }

  protected isFsaEnable(): boolean {
    return downloader.fileSystemAccessEnabled;
  }

  protected supportSubpath(): boolean {
    return this.isBrowserApi() || this.isFsaEnable();
  }

  protected isImage(): boolean {
    return /bmp|jp(e)?g|png|tif|gif|exif|svg|webp/i.test(this.meta.extendName);
  }

  protected buildFilePath(): string {
    const path = this.getFullpathPattern();
    const { id, createDate } = this.meta;
    let { artist, title, tags } = this.meta;

    artist = this.normalizeString(artist);
    title = this.normalizeString(title);
    tags = tags.map((tag) => this.normalizeString(tag));

    const replaceDate = (_: string, p1: string): string => {
      const format = p1 || 'YYYY-MM-DD';
      return dayjs(createDate).format(format);
    };

    return path
      .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, replaceDate)
      .replaceAll('{artist}', artist)
      .replaceAll('{title}', title)
      .replaceAll('{tags}', tags.join('_'))
      .replaceAll('{id}', id);
  }

  protected generateTaskId() {
    return this.meta.id + '_' + Math.random().toString(36).slice(2);
  }

  abstract getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<T> | DownloadConfig<T>[];
}
