import { type DownloadConfig } from '@/lib/downloader';
import type { BooruMeta, MediaMeta } from '@/sites/base/parser';
import { replaceInvalidChar, unescapeHtml } from '@/lib/util';
import dayjs from 'dayjs';
import { regexp } from '@/lib/regExp';

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

export class MediaDownloadConfig {
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

  protected constructor(mediaMeta: MediaMeta<string | string[]>) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getHeaders(_option?: OptionBase): Record<string, string> | undefined {
    return undefined;
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
      .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, this.replaceDateTemplate.bind(this))
      .replaceAll('{artist}', artist)
      .replaceAll('{title}', title)
      .replaceAll('{tags}', tags.join('_'))
      .replaceAll('{id}', this.id);

    return Array.from({ length: Array.isArray(this.ext) ? this.ext.length : 1 }, () => path);
  }

  getSavePath(folderTemplate: string, filenameTemplate: string, idx = 0, ext?: string): string {
    const template = folderTemplate ? `${folderTemplate}/${filenameTemplate}` : filenameTemplate;
    const path = this.replaceTemplate(template);

    if (Array.isArray(this.ext)) {
      return `${path[idx]}.${ext ?? this.ext[idx]}`;
    } else {
      return `${path[idx]}.${ext ?? this.ext}`;
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
      setProgress((++this.downloaded / this.total) * 100);
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
  ): DownloadConfig;
  static create<U extends MediaMeta<string[]>, O extends OptionBase>(
    option: IndexOption<U, O>
  ): DownloadConfig;
  static create<T extends MediaMeta, U extends MediaMeta<string[]>, O extends OptionBase>(
    option: SingleOption<T, O> | IndexOption<U, O>
  ): DownloadConfig {
    const { mediaMeta, filenameTemplate, folderTemplate, setProgress } = option;
    const config = new this(mediaMeta);

    let index: number | undefined = undefined;
    if ('index' in option) {
      index = option.index;
    }

    const path = config.getSavePath(folderTemplate, filenameTemplate, index);

    return {
      headers: config.getHeaders(),
      taskId: config.getTaskId(),
      src: config.getSrc(index),
      path: path,
      timeout: config.getDownloadTimeout(index),
      onProgress: setProgress
    };
  }

  static createMulti<T extends MediaMeta<string[]>, O extends OptionBase>(
    option: MultiOption<T, O>
  ): DownloadConfig[] {
    const { mediaMeta, filenameTemplate, folderTemplate, setProgress } = option;
    const config = new this(mediaMeta);
    const path = config.getAllSavePaths(folderTemplate, filenameTemplate);

    return path.map((v, i) => {
      return {
        headers: config.getHeaders(),
        taskId: config.getTaskId(),
        src: config.getSrc(i),
        path: v,
        timeout: config.getDownloadTimeout(i),
        onFileSaved: setProgress ? config.getMultipleMediaDownloadCB(setProgress) : undefined
      };
    });
  }
}

interface BooruOption extends OptionBase {
  cfClearance?: string;
}

export class BooruDownloadConfig extends MediaDownloadConfig {
  protected character: string;

  constructor(meta: BooruMeta) {
    super(meta);
    this.character = meta.character;
  }

  getHeaders(option: BooruOption): Record<string, string> {
    return {
      cookie: `cf_clearance=${option.cfClearance}`
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

  static create(option: SingleOption<BooruMeta, BooruOption>): DownloadConfig {
    return super.create(option);
  }

  static createMulti(): never {
    throw new Error('BooruDownloadConfig does not support this method.');
  }
}
