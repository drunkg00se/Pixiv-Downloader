import { FilenameConflictAction } from '../downloader/fileSaveAdapters/fileSystemAccess';
import { env } from '../env';
import { replaceInvalidChar } from '../util';
import { legacyConfig } from './legacyConfig';
import { createPersistedStore } from './storage.svelte';

export type DownloadSettingState = {
  directoryTemplate: string;
  filenameTemplate: string;
  useFileSystemAccessApi: boolean;
  filenameConflictAction: FilenameConflictAction;
};

type DownloadSettingProto = ThisType<DownloadSettingState> & {
  readonly isSubpathSupported: boolean;
  setDirectoryTemplate(template: string): string;
  setFilenameTemplate(template: string): string;
};

export const downloadSetting = createPersistedStore<DownloadSettingState, DownloadSettingProto>(
  'pdl-download-setting',
  {
    directoryTemplate: legacyConfig.folderPattern ?? '',
    filenameTemplate: legacyConfig.filenamePattern ?? '{id}',
    useFileSystemAccessApi: legacyConfig.useFileSystemAccess ?? false,
    filenameConflictAction:
      legacyConfig.fileSystemFilenameConflictAction ?? FilenameConflictAction.UNIQUIFY
  },
  {
    get isSubpathSupported() {
      return this.useFileSystemAccessApi || env.isSupportSubpath();
    },

    setDirectoryTemplate(template: string): string {
      const newTemplate = template.split('/').map(replaceInvalidChar).filter(Boolean).join('/');

      if (newTemplate !== this.directoryTemplate) {
        this.directoryTemplate = newTemplate;
      }

      return newTemplate;
    },

    setFilenameTemplate(template: string): string {
      const newTemplate = replaceInvalidChar(template);

      if (newTemplate === '') return this.filenameTemplate;

      if (newTemplate !== this.filenameTemplate) {
        this.filenameTemplate = newTemplate;
      }

      return newTemplate;
    }
  }
);
