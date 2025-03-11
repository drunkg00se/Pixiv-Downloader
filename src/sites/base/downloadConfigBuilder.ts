import { downloader, type DownloadConfig } from '@/lib/downloader';
import type { BooruMeta, MediaMeta } from '@/sites/base/parser';
import { replaceInvalidChar, unescapeHtml } from '@/lib/util';
import dayjs from 'dayjs';
import { regexp } from '@/lib/regExp';
import { config } from '@/lib/config';
import { env } from '@/lib/env';
import type { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

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
    return regexp.imageExt.test(this.meta.extendName);
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

export interface OptionBase {
  folderTemplate: string;
  filenameTemplate: string;
  setProgress?: (progress: number) => void;
}

export type SingleOption<T extends MediaMeta, Option extends OptionBase> = Option & {
  mediaMeta: T;
};

export type MultiOption<T extends MediaMeta<string[]>, Option extends OptionBase> = Option & {
  mediaMeta: T;
};

export type IndexOption<T extends MediaMeta<string[]>, Option extends OptionBase> = Option & {
  mediaMeta: T;
  index: number;
};

export class MediaDownloadConfig<T extends MediaMeta<string | string[]>> {
  id: string;
  src: string | string[];
  ext: string | string[];
  artist: string;
  title: string;
  tags: string[];
  createDate: string;

  imageTimeout: number | undefined = 60000;
  videoTimeout: number | undefined = undefined;

  taskId: string | undefined = undefined;

  downloaded: number;
  total: number;

  onDownloadCompleted: (() => void) | undefined = undefined;

  protected constructor(mediaMeta: T) {
    const { id, src, extendName, artist, title, tags, createDate } = mediaMeta;

    this.id = id;
    this.src = src;
    this.ext = extendName;
    this.artist = artist;
    this.title = title;
    this.tags = tags;
    this.createDate = createDate;

    this.total = Array.isArray(src) ? src.length : 1;
    this.downloaded = 0;
  }

  normalizeString(str: string): string {
    return replaceInvalidChar(unescapeHtml(str));
  }

  getTaskId() {
    return (this.taskId ??= this.id + '_' + Math.random().toString(36).slice(2));
  }

  getSrc(idx = 0) {
    return Array.isArray(this.src) ? this.src[idx] : this.src;
  }

  getDownloadTimeout(idx = 0) {
    return MediaDownloadConfig.isImageExt(Array.isArray(this.ext) ? this.ext[idx] : this.ext)
      ? this.imageTimeout
      : this.videoTimeout;
  }

  replaceDateTemplate(_: string, p1: string): string {
    const format = p1 || 'YYYY-MM-DD';
    return dayjs(this.createDate).format(format);
  }

  replaceTemplate(template: string): string[] {
    const artist = this.normalizeString(this.artist);
    const title = this.normalizeString(this.title);
    const tags = this.tags.map((tag) => this.normalizeString(tag));

    const path = template
      .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, this.replaceDateTemplate)
      .replaceAll('{artist}', artist)
      .replaceAll('{title}', title)
      .replaceAll('{tags}', tags.join('_'))
      .replaceAll('{id}', this.id);

    return Array.from({ length: Array.isArray(this.ext) ? this.ext.length : 1 }, () => path);
  }

  getSavePath(folderTemplate: string, filenameTemplate: string, idx = 0): string {
    const template = folderTemplate ? `${folderTemplate}/${filenameTemplate}` : filenameTemplate;
    const path = this.replaceTemplate(template);

    if (Array.isArray(this.ext)) {
      return `${path[idx]}.${this.ext[idx]}`;
    } else {
      return `${path[idx]}.${this.ext}`;
    }
  }

  getAllSavePaths(folderTemplate: string, filenameTemplate: string): string[] {
    const template = folderTemplate ? `${folderTemplate}/${filenameTemplate}` : filenameTemplate;
    const path = this.replaceTemplate(template);

    if (Array.isArray(this.ext)) {
      return path.map((v, i) => `${v}.${this.ext[i]}`);
    } else {
      return [`${path[0]}.${this.ext}`];
    }
  }

  getMultipleMediaDownloadCB(setProgress: NonNullable<OptionBase['setProgress']>) {
    return (this.onDownloadCompleted ??= () => {
      setProgress(++this.downloaded / this.total);
    });
  }

  static supportedTemplate() {
    return ['{artist}', '{character}', '{date}', '{id}'];
  }

  static isImageExt(ext: string) {
    return regexp.imageExt.test(ext);
  }

  static create<T extends MediaMeta, O extends OptionBase>(
    option: SingleOption<T, O>
  ): DownloadConfig<T>;
  static create<U extends MediaMeta<string[]>, O extends OptionBase>(
    option: IndexOption<U, O>
  ): DownloadConfig<U>;
  static create<T extends MediaMeta, U extends MediaMeta<string[]>, O extends OptionBase>(
    option: SingleOption<T, O> | IndexOption<U, O>
  ): DownloadConfig<T | U> {
    const { mediaMeta, filenameTemplate, folderTemplate, setProgress } = option;
    const config = new MediaDownloadConfig(mediaMeta);

    let index: number | undefined = undefined;
    if ('index' in option) {
      index = option.index;
    }

    const path = config.getSavePath(folderTemplate, filenameTemplate, index);

    return {
      taskId: config.getTaskId(),
      src: config.getSrc(index),
      path: path,
      source: mediaMeta,
      timeout: config.getDownloadTimeout(index),
      onProgress: setProgress
    };
  }

  static createMulti<T extends MediaMeta<string[]>, O extends OptionBase>(
    option: MultiOption<T, O>
  ): DownloadConfig<T>[] {
    const { mediaMeta, filenameTemplate, folderTemplate, setProgress } = option;
    const config = new MediaDownloadConfig(mediaMeta);
    const path = config.getAllSavePaths(folderTemplate, filenameTemplate);

    return path.map((v, i) => {
      return {
        taskId: config.getTaskId(),
        src: config.getSrc(i),
        path: v,
        source: mediaMeta,
        timeout: config.getDownloadTimeout(i),
        onFileSaved: setProgress ? config.getMultipleMediaDownloadCB(setProgress) : undefined
      };
    });
  }
}

interface MoebooruOption extends OptionBase {
  cfClearance?: string;
}

export class BooruDownloadConfig extends MediaDownloadConfig<BooruMeta> {
  protected character: string;

  constructor(meta: BooruMeta) {
    super(meta);
    this.character = meta.character;
  }

  protected getHeaders(cfClearance: string): Record<'cookie', string> {
    return {
      cookie: `cf_clearance=${cfClearance}`
    };
  }

  replaceTemplate(template: string): string[] {
    const artist = this.normalizeString(this.artist);
    const title = this.normalizeString(this.title);

    const path = template
      .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, this.replaceDateTemplate)
      .replaceAll('{artist}', artist)
      .replaceAll('{title}', title)
      .replaceAll('{id}', this.id)
      .replaceAll('{character}', this.normalizeString(this.character));

    return Array.from({ length: Array.isArray(this.ext) ? this.ext.length : 1 }, () => path);
  }

  static supportedTemplate() {
    return ['{artist}', '{title}', '{character}', '{id}', '{date}'];
  }

  static create(option: SingleOption<BooruMeta, MoebooruOption>): DownloadConfig<BooruMeta> {
    const { mediaMeta, filenameTemplate, folderTemplate, setProgress, cfClearance } = option;
    const config = new BooruDownloadConfig(mediaMeta);

    const path = config.getSavePath(folderTemplate, filenameTemplate);

    return {
      headers: cfClearance ? config.getHeaders(cfClearance) : undefined,
      taskId: config.getTaskId(),
      src: config.getSrc(),
      path: path as string,
      source: mediaMeta,
      timeout: config.getDownloadTimeout(),
      onProgress: setProgress
    };
  }
}
