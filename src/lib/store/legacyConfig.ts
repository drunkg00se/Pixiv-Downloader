import { ConvertFormat } from '../converter/adapter';
import type { FilenameConflictAction } from '../downloader/fileSaveAdapters/fileSystemAccess';

const enum PixivTagLocale {
  JAPANESE = 'ja',
  CHINESE = 'zh',
  TRADITIONAL_CHINESE = 'zh_tw',
  ENGLISH = 'en'
}

type UgoiraFormat = ConvertFormat | 'zip';

interface ConfigData {
  version: string;
  ugoiraFormat: UgoiraFormat;
  folderPattern: string;
  filenamePattern: string;
  tagLang: PixivTagLocale;
  showMsg: boolean;
  mixEffect: boolean;
  bundleIllusts: boolean;
  bundleManga: boolean;
  addBookmark: boolean;
  addBookmarkWithTags: boolean;
  privateR18: boolean;
  likeIllust: boolean;
  useFileSystemAccess: boolean;
  fileSystemFilenameConflictAction: FilenameConflictAction;
  showPopupButton: boolean;
  gifQuality: number;
  webmBitrate: number;
  mp4Bitrate: number;
  losslessWebp: boolean;
  webpQuality: number;
  webpMehtod: number;
  pngColor: number;
  historyBackupInterval: number;
  lastHistoryBackup: number;
  auth: Record<string, string> | null;
  'pdl-btn-self-bookmark-left': number;
  'pdl-btn-self-bookmark-top': number;
  'pdl-btn-left': number;
  'pdl-btn-top': number;
}

const configStr = localStorage.getItem('pdlSetting');

if (configStr) localStorage.removeItem('pdlSetting');

export const legacyConfig: Partial<ConfigData> = configStr ? JSON.parse(configStr) : {};
