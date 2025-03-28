import type { NijieMeta } from './parser';
import {
  MayBeMultiIllustsConfig,
  SupportedTemplate,
  type IndexOption,
  type OptionBase
} from '../base/downloadConfig';
import type { DownloadConfig } from '@/lib/downloader';

export class NijieDownloadConfig extends MayBeMultiIllustsConfig {
  protected userId: string;
  protected comment: string;
  protected score: number;

  constructor(meta: NijieMeta<string | string[]>) {
    super(meta);
    this.userId = meta.userId;
    this.comment = meta.comment;
    this.score = meta.score;
  }

  static get supportedTemplate() {
    return {
      [SupportedTemplate.ID]: '{id}',
      [SupportedTemplate.ARTIST]: '{artist}',
      [SupportedTemplate.ARTISTID]: '{artistID}',
      [SupportedTemplate.DATE]: '{date} {date(YYYY-MM-DD)}',
      [SupportedTemplate.PAGE]: '{page}',
      [SupportedTemplate.SCORE]: '{score}: likeCount',
      [SupportedTemplate.TAGS]: '{tags}',
      [SupportedTemplate.TITLE]: '{title}'
    };
  }

  protected getZipComment(): string {
    return this.comment;
  }

  protected getTemplateData(
    data: Partial<typeof NijieDownloadConfig.supportedTemplate> & { page: string }
  ): typeof NijieDownloadConfig.supportedTemplate {
    return {
      id: this.id,
      artist: this.normalizeString(this.artist) || this.userId,
      artistID: this.userId,
      date: this.createDate,
      score: String(this.score),
      title: this.normalizeString(this.title) || this.id,
      tags: this.tags
        .map((tag) => this.normalizeString(tag))
        .filter(Boolean)
        .join('_'),
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

    return {
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
      return {
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
        onAbort: this.handleBundleAbortFactory(),
        useFileSystemAccessApi,
        filenameConflictAction
      };
    });
  }
}
