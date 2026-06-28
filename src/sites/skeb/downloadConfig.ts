import type { SkebMeta } from './parser';
import {
  MayBeMultiIllustsConfig,
  SupportedTemplate,
  type IndexOption,
  type OptionBase
} from '../base/downloadConfig';
import type { DownloadConfig } from '@/lib/downloader';
import { fetchNovelPdf } from './novelHelper';

export class SkebDownloadConfig extends MayBeMultiIllustsConfig {
  protected userId: string;
  protected workId: string;
  protected genre: string;
  protected body: string;

  constructor(meta: SkebMeta<string | string[]>) {
    super(meta);
    this.userId = meta.userId;
    this.workId = meta.workId;
    this.genre = meta.genre;
    this.body = meta.body;
  }

  static get supportedTemplate() {
    return {
      [SupportedTemplate.ID]: '{id}',
      [SupportedTemplate.ARTIST]: '{artist}',
      [SupportedTemplate.ARTISTID]: '{artistID}',
      [SupportedTemplate.DATE]: '{date} {date(YYYY-MM-DD)}',
      [SupportedTemplate.PAGE]: '{page}',
      [SupportedTemplate.TAGS]: '{tags}',
      [SupportedTemplate.TITLE]: '{title}'
    };
  }

  protected getZipComment(): string {
    return this.body;
  }

  protected getTemplateData(
    data: Partial<typeof SkebDownloadConfig.supportedTemplate> & { page: string }
  ): typeof SkebDownloadConfig.supportedTemplate {
    return {
      id: this.workId,
      artist: this.normalizeString(this.artist) || this.userId,
      artistID: this.userId,
      date: this.createDate,
      title: this.normalizeString(this.title) || this.workId,
      tags: this.tags.join('_'),
      ...data
    };
  }

  create(option: OptionBase | IndexOption): DownloadConfig {
    const {
      filenameTemplate,
      directoryTemplate,
      setProgress,
      useFileSystemAccessApi,
      filenameConflictAction
    } = option;
    const index = 'index' in option ? option.index : 0;

    const config: DownloadConfig = {
      taskId: this.getTaskId(),
      src: this.getSrc(index),
      path: this.getSavePath(
        directoryTemplate,
        filenameTemplate,
        this.getExt(index),
        this.getTemplateData({ page: String(index) })
      ),
      timeout: this.getDownloadTimeout(index),
      onProgress: setProgress,
      useFileSystemAccessApi,
      filenameConflictAction
    };

    if (this.genre === 'novel') {
      config.beforeFileSave = (blob, _cfg, signal) => this.#transformNovelBlob(blob, index, signal);
    }

    return config;
  }

  createMulti(option: OptionBase): DownloadConfig[] {
    if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);

    const {
      filenameTemplate,
      directoryTemplate,
      setProgress,
      useFileSystemAccessApi,
      filenameConflictAction
    } = option;
    const taskId = this.getTaskId();
    const onFileSaved = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;

    return this.src.map((src, i) => {
      const config: DownloadConfig = {
        taskId,
        src,
        path: this.getSavePath(
          directoryTemplate,
          filenameTemplate,
          this.getExt(i),
          this.getTemplateData({ page: String(i) })
        ),
        timeout: this.getDownloadTimeout(),
        onFileSaved,
        useFileSystemAccessApi,
        filenameConflictAction
      };

      if (this.genre === 'novel') {
        config.beforeFileSave = (blob, _cfg, signal) => this.#transformNovelBlob(blob, i, signal);
      }

      return config;
    });
  }

  createBundle(option: OptionBase): DownloadConfig[] {
    if (!this.isStringArray(this.src) || !this.isStringArray(this.ext))
      throw new Error(`Artwork ${this.id} only have one media.`);

    const {
      filenameTemplate,
      directoryTemplate,
      setProgress,
      useFileSystemAccessApi,
      filenameConflictAction
    } = option;

    const taskId = this.getTaskId();
    const onXhrLoaded = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;

    const path = this.getSavePath(
      directoryTemplate,
      filenameTemplate,
      'zip',
      this.getTemplateData({
        page: String(this.src.length)
      })
    );

    const filenameTemplateWithPage = filenameTemplate.includes(`{${SupportedTemplate.PAGE}}`)
      ? filenameTemplate
      : filenameTemplate + `_{${SupportedTemplate.PAGE}}`;

    const filenames = this.src.map((_, i) => {
      return this.getSavePath(
        '',
        filenameTemplateWithPage,
        this.getExt(i),
        this.getTemplateData({ page: String(i) })
      );
    });

    const configs = this.src.map((src, i) => {
      return {
        taskId,
        src,
        path,
        timeout: this.getDownloadTimeout(i),
        onXhrLoaded,
        beforeFileSave: this.handleBundleFactory(filenames),
        onError: this.handleBundleErrorFactory(),
        onAbort: this.handleBundleAbortFactory(),
        useFileSystemAccessApi,
        filenameConflictAction
      };
    });

    if (this.genre === 'novel') {
      return configs.map((config, i) => {
        const originalBeforeSave = config.beforeFileSave;
        config.beforeFileSave = async (blob, cfg, signal) => {
          const transformed = await this.#transformNovelBlob(blob, i, signal);
          return originalBeforeSave?.(transformed, cfg, signal);
        };
        return config;
      });
    }

    return configs;
  }

  async #transformNovelBlob(blob: Blob, index: number, signal?: AbortSignal): Promise<Blob> {
    const ext = this.getExt(index);

    try {
      const json = JSON.parse(await blob.text());

      if (ext === 'txt') {
        return new Blob([json.text], { type: 'text/plain' });
      }

      if (ext === 'pdf' && json.urls?.length) {
        return await fetchNovelPdf(json.urls, signal);
      }
    } catch {
      // fall through
    }

    return blob;
  }
}
