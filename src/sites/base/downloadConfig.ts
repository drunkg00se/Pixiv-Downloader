import { type DownloadConfig, type DownloaderHooks } from '@/lib/downloader';
import type { BooruMeta, MediaMeta } from '@/sites/base/parser';
import { replaceInvalidChar, unescapeHtml } from '@/lib/util';
import dayjs from 'dayjs';
import { regexp } from '@/lib/regExp';
import { compressor } from '@/lib/compressor';
import type { DownloadSettingState } from '@/lib/store/downloadSetting.svelte';

export const enum SupportedTemplate {
  ID = 'id',
  ARTIST = 'artist',
  ARTISTID = 'artistID',
  CHARACTER = 'character',
  DATE = 'date',
  MD5 = 'md5',
  SCORE = 'score',
  TAGS = 'tags',
  TITLE = 'title',
  PAGE = 'page'
}

export type TemplateData = {
  [k in SupportedTemplate]: string;
};

export interface OptionBase extends DownloadSettingState {
  setProgress?: (progress: number) => void;
}

export abstract class MediaDownloadConfig<T extends string | string[] = string> {
  protected id: string;
  protected src: T;
  protected ext: T;
  protected artist: string;
  protected title: string;
  protected tags: string[];
  protected createDate: string;

  protected imageTimeout: number | undefined = 60000;
  protected videoTimeout: number | undefined = undefined;

  protected taskId: string | undefined = undefined;

  protected downloaded: number;
  protected total: number;

  protected onDownloadCompleted: (() => void) | undefined = undefined;

  protected constructor(mediaMeta: MediaMeta<T>) {
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

  static get supportedTemplate(): Partial<TemplateData> {
    throw new Error('Should be overwritten by a subclass');
  }

  protected normalizeString(str: string): string {
    return replaceInvalidChar(unescapeHtml(str));
  }

  protected isStringArray(val: string | string[]): val is string[] {
    return Array.isArray(val);
  }

  protected isImageExt(ext: string) {
    return regexp.imageExt.test(ext);
  }

  protected getTaskId(): string {
    return (this.taskId ??= this.id + '_' + Math.random().toString(36).slice(2));
  }

  protected getSrc(idx = 0): string {
    return Array.isArray(this.src) ? this.src[idx] : this.src;
  }

  protected getExt(idx = 0): string {
    return Array.isArray(this.ext) ? this.ext[idx] : this.ext;
  }

  protected getDownloadTimeout(idx = 0): number | undefined {
    return this.isImageExt(Array.isArray(this.ext) ? this.ext[idx] : this.ext)
      ? this.imageTimeout
      : this.videoTimeout;
  }

  protected getMultipleMediaDownloadCB(setProgress: NonNullable<OptionBase['setProgress']>) {
    return (this.onDownloadCompleted ??= () => {
      setProgress((++this.downloaded / this.total) * 100);
    });
  }

  protected getPathTemplate(folderTemplate: string, filenameTemplate: string): string {
    return folderTemplate ? `${folderTemplate}/${filenameTemplate}` : filenameTemplate;
  }

  #replaceTemplate(template: string, data: Partial<TemplateData>): string {
    const re = new RegExp(
      `{(${SupportedTemplate.ARTIST}|` +
        `${SupportedTemplate.ARTISTID}|` +
        `${SupportedTemplate.CHARACTER}|` +
        `${SupportedTemplate.ID}|` +
        `${SupportedTemplate.MD5}|` +
        `${SupportedTemplate.PAGE}|` +
        `${SupportedTemplate.SCORE}|` +
        `${SupportedTemplate.TAGS}|` +
        `${SupportedTemplate.TITLE})}`,
      'g'
    );

    const path = template.replace(
      re,
      (match, templateName: Exclude<SupportedTemplate, SupportedTemplate.DATE>) => {
        if (!(templateName in data)) return match;
        const val = data[templateName];

        return !val ? match : val;
      }
    );

    const dateRe = new RegExp(`{(${SupportedTemplate.DATE})(\\((.+?)\\))?}`, 'g');

    return path.replace(
      dateRe,
      (match, _templateName: SupportedTemplate.DATE, _formatMatch: string, formatValue: string) => {
        if (!data.date) return match;
        const format = formatValue || 'YYYY-MM-DD';
        const date = data.date;

        return dayjs(date).format(format);
      }
    );
  }

  protected getSavePath(
    folderTemplate: string,
    filenameTemplate: string,
    ext: string,
    templateData: Partial<TemplateData>
  ): string {
    const path = this.#replaceTemplate(
      this.getPathTemplate(folderTemplate, filenameTemplate),
      templateData
    );

    return `${path}.${ext}`;
  }

  protected abstract getTemplateData(data?: Partial<TemplateData>): Partial<TemplateData>;

  abstract create(option: OptionBase): DownloadConfig | DownloadConfig[];
}

export interface IndexOption extends OptionBase {
  index: number;
}
export abstract class MayBeMultiIllustsConfig extends MediaDownloadConfig<string | string[]> {
  protected handleBeforeSaveCb: DownloaderHooks['beforeFileSave'] | undefined = undefined;
  protected handleErrorCb: DownloaderHooks['onError'] | undefined = undefined;
  protected handleAbortCb: DownloaderHooks['onAbort'] | undefined = undefined;

  protected filenames: string[] | undefined = undefined;

  protected handleBundleFactory(filenames: string[]) {
    this.filenames ??= filenames;

    return (this.handleBeforeSaveCb ??= async (
      imgBlob: Blob,
      config: DownloadConfig,
      signal?: AbortSignal
    ): Promise<Blob | void> => {
      signal?.throwIfAborted();

      const { taskId, src } = config;
      const index = (this.src as string[]).indexOf(src);
      if (index === -1) throw new Error('No src matches.');

      compressor.add(taskId, this.filenames![index], imgBlob);

      if (compressor.fileCount(taskId) !== filenames.length) return;

      const zipData = await compressor.bundle(taskId, this.getZipComment());

      signal?.throwIfAborted();

      compressor.remove(taskId);

      return zipData;
    });
  }

  protected handleBundleErrorFactory() {
    return (this.handleErrorCb ??= () => {
      compressor.remove(this.getTaskId());
    });
  }

  protected handleBundleAbortFactory() {
    return (this.handleAbortCb ??= () => {
      compressor.remove(this.getTaskId());
    });
  }

  protected abstract getZipComment(): string | undefined;

  abstract create(option: OptionBase | IndexOption): DownloadConfig;

  abstract createMulti(option: OptionBase): DownloadConfig[];

  abstract createBundle(option: OptionBase): DownloadConfig[];
}

interface BooruOption extends OptionBase {
  cfClearance?: string;
}

export class BooruDownloadConfig extends MediaDownloadConfig {
  protected character: string;
  protected score: number;

  constructor(meta: BooruMeta) {
    super(meta);
    this.character = meta.character;
    this.score = meta.score;
  }

  static get supportedTemplate(): Partial<TemplateData> {
    return {
      [SupportedTemplate.ID]: '{id}',
      [SupportedTemplate.ARTIST]: '{artist}',
      [SupportedTemplate.CHARACTER]: '{character}',
      [SupportedTemplate.DATE]: '{date}, {date(YYYY-MM-DD)}',
      [SupportedTemplate.TITLE]: '{title}',
      [SupportedTemplate.SCORE]: '{score}'
    };
  }

  protected getHeaders(cfClearance: string): Record<string, string> {
    return {
      cookie: `cf_clearance=${cfClearance}`
    };
  }

  protected getTemplateData(): Partial<TemplateData> {
    return {
      id: this.id,
      artist: this.artist,
      character: this.character,
      date: this.createDate,
      title: this.title,
      score: String(this.score)
    };
  }

  create(option: BooruOption): DownloadConfig {
    const {
      filenameTemplate,
      filenameConflictAction,
      directoryTemplate,
      useFileSystemAccessApi,
      setProgress,
      cfClearance
    } = option;

    return {
      headers: cfClearance ? this.getHeaders(cfClearance) : undefined,
      taskId: this.getTaskId(),
      src: this.getSrc(),
      path: this.getSavePath(
        directoryTemplate,
        filenameTemplate,
        this.getExt(),
        this.getTemplateData()
      ),
      timeout: this.getDownloadTimeout(),
      onProgress: setProgress,
      useFileSystemAccessApi,
      filenameConflictAction
    };
  }
}
