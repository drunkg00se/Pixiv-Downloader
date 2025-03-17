import type { NijieMeta } from './parser';
import {
  MayBeMultiIllustsConfig,
  SupportedTemplate,
  type IndexOption,
  type OptionBase,
  type TemplateData
} from '../base/downloadConfig';
import type { DownloadConfig } from '@/lib/downloader';

export class NijieDownloadConfig extends MayBeMultiIllustsConfig {
  protected userId: string;
  protected comment: string;

  constructor(meta: NijieMeta<string | string[]>) {
    super(meta);
    this.userId = meta.userId;
    this.comment = meta.comment;
  }

  static supportedTemplate() {
    return ['{artist}', '{artistID}', '{title}', '{id}', '{page}', '{tags}', '{date}'];
  }

  protected getZipComment(): string {
    return this.comment;
  }

  protected getTemplateData(data: Partial<TemplateData> & { page: string }): Partial<TemplateData> {
    return {
      id: this.id,
      artist: this.normalizeString(this.artist) || this.userId,
      artistID: this.userId,
      date: this.createDate,
      title: this.normalizeString(this.title) || this.id,
      tags: this.tags
        .map((tag) => this.normalizeString(tag))
        .filter(Boolean)
        .join('_'),
      ...data
    };
  }

  create(option: OptionBase | IndexOption): DownloadConfig {
    const { filenameTemplate, folderTemplate, setProgress } = option;
    const index = 'index' in option ? option.index : 0;

    return {
      taskId: this.getTaskId(),
      src: this.getSrc(index),
      path: this.getSavePath(
        folderTemplate,
        filenameTemplate,
        this.getExt(index),
        this.getTemplateData({ page: String(index) })
      ),
      timeout: this.getDownloadTimeout(index),
      onProgress: setProgress
    };
  }

  createMulti(option: OptionBase): DownloadConfig[] {
    if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);

    const { filenameTemplate, folderTemplate, setProgress } = option;
    const taskId = this.getTaskId();
    const onFileSaved = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;

    return this.src.map((src, i) => {
      return {
        taskId,
        src,
        path: this.getSavePath(
          folderTemplate,
          filenameTemplate,
          this.getExt(i),
          this.getTemplateData({ page: String(i) })
        ),
        timeout: this.getDownloadTimeout(),
        onFileSaved
      };
    });
  }

  createBundle(option: OptionBase): DownloadConfig[] {
    if (!this.isStringArray(this.src) || !this.isStringArray(this.ext))
      throw new Error(`Artwork ${this.id} only have one media.`);

    const { filenameTemplate, folderTemplate, setProgress } = option;

    const taskId = this.getTaskId();
    const onXhrLoaded = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;

    const path = this.getSavePath(
      folderTemplate,
      filenameTemplate,
      'zip',
      this.getTemplateData({
        page: String(this.src.length)
      })
    );

    // always add {page} when bundling
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

    return this.src.map((src, i) => {
      return {
        taskId,
        src,
        path,
        timeout: this.getDownloadTimeout(i),
        onXhrLoaded,
        beforeFileSave: this.handleBundleFactory(filenames),
        onError: this.handleBundleErrorFactory(),
        onAbort: this.handleBundleAbortFactory()
      };
    });
  }
}
