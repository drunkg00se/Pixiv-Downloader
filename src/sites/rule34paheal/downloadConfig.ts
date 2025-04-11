import type { DownloadConfig } from '@/lib/downloader';
import {
  MediaDownloadConfig,
  SupportedTemplate,
  type OptionBase,
  type TemplateData
} from '../base/downloadConfig';
import type { Rule34PahealMeta } from './parser';

export class Rule34PahealDownloadConfig extends MediaDownloadConfig {
  constructor(meta: Rule34PahealMeta) {
    super(meta);
  }

  static get supportedTemplate(): Partial<TemplateData> {
    return {
      [SupportedTemplate.ID]: '{id}',
      [SupportedTemplate.DATE]: '{date}, {date(YYYY-MM-DD)}',
      [SupportedTemplate.TAGS]: '{tags}',
      [SupportedTemplate.MD5]: '{md5}'
    };
  }

  protected getTemplateData(): Partial<TemplateData> {
    return {
      id: this.id,
      tags: this.tags.join(' '),
      date: this.createDate,
      md5: this.title
    };
  }

  create(option: OptionBase): DownloadConfig {
    const {
      filenameTemplate,
      filenameConflictAction,
      directoryTemplate,
      useFileSystemAccessApi,
      setProgress
    } = option;

    return {
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
