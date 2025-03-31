import { FilenameConflictAction } from '../downloader/fileSaveAdapters/fileSystemAccess';
import { env } from '../env';
import { replaceInvalidChar } from '../util';
import { legacyConfig } from './legacyConfig';
import { LocalStorage } from './storage.svelte';

export type DownloadSettingState = {
  directoryTemplate: string;
  filenameTemplate: string;
  useFileSystemAccessApi: boolean;
  filenameConflictAction: FilenameConflictAction;
};

class DownloadSettingStore extends LocalStorage<DownloadSettingState> {
  constructor() {
    super('pdl-download-setting', {
      directoryTemplate: legacyConfig.folderPattern ?? '',
      filenameTemplate: legacyConfig.filenamePattern ?? '{id}',
      useFileSystemAccessApi: legacyConfig.useFileSystemAccess ?? false,
      filenameConflictAction:
        legacyConfig.fileSystemFilenameConflictAction ?? FilenameConflictAction.UNIQUIFY
    });
  }

  get isSubpathSupported() {
    return this.current.useFileSystemAccessApi || env.isSupportSubpath();
  }

  public setDirectoryTemplate(template: string): string {
    const newTemplate = template.split('/').map(replaceInvalidChar).filter(Boolean).join('/');

    if (newTemplate !== this.value.directoryTemplate) {
      this.current.directoryTemplate = newTemplate;
    }

    return newTemplate;
  }

  public setFilenameTemplate(template: string): string {
    const newTemplate = replaceInvalidChar(template);

    if (newTemplate === '') return this.value.filenameTemplate;

    if (newTemplate !== this.value.filenameTemplate) {
      this.current.filenameTemplate = newTemplate;
    }

    return newTemplate;
  }
}

export const downloadSetting = new DownloadSettingStore();
