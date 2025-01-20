import { logger } from '@/lib/logger';

export const enum UgoiraFormat {
  ZIP = 'zip',
  GIF = 'gif',
  WEBP = 'webp',
  PNG = 'png',
  WEBM = 'webm',
  MP4 = 'mp4'
}

export const enum FilenameConfigAction {
  UNIQUIFY = 'uniquify',
  OVERWRITE = 'overwrite',
  PROMPT = 'prompt'
}

export const enum TagLanguage {
  JAPANESE = 'ja',
  CHINESE = 'zh',
  TRADITIONAL_CHINESE = 'zh_tw',
  ENGLISH = 'en'
}

export const enum HistoryBackupInterval {
  NEVER = 0,
  EVERY_DAY = 86400,
  EVERY_7_DAY = 604800,
  EVERY_30_DAY = 2592000
}

export interface ConfigData {
  version: string;
  ugoiraFormat: UgoiraFormat;
  folderPattern: string;
  filenamePattern: string;
  tagLang: TagLanguage;
  showMsg: boolean;
  mixEffect: boolean;
  bundleIllusts: boolean;
  bundleManga: boolean;
  addBookmark: boolean;
  addBookmarkWithTags: boolean;
  privateR18: boolean;
  likeIllust: boolean;
  useFileSystemAccess: boolean;
  fileSystemFilenameConflictAction: FilenameConfigAction;
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
  /** rule34 cf_clearance */
  token: string;
  'pdl-btn-self-bookmark-left': number;
  'pdl-btn-self-bookmark-top': number;
  'pdl-btn-left': number;
  'pdl-btn-top': number;
}

interface Config {
  get<T extends keyof ConfigData>(key: T): ConfigData[T];
  set<T extends keyof ConfigData>(key: T, value: ConfigData[T]): void;
  getAll(): ConfigData;
  update(config: ConfigData): void;
}

export let config: Config;

export function loadConfig(customConfig: Partial<ConfigData> = {}): Config {
  if (config) throw new Error('`config` has already been defined.');

  const defaultConfig: Readonly<ConfigData> = Object.freeze({
    version: __VERSION__,
    ugoiraFormat: UgoiraFormat.ZIP,
    folderPattern: '',
    filenamePattern: '{id}',
    tagLang: TagLanguage.JAPANESE,
    showMsg: true,
    mixEffect: false,
    bundleIllusts: false,
    bundleManga: false,
    addBookmark: false,
    addBookmarkWithTags: false,
    privateR18: false,
    likeIllust: false,
    useFileSystemAccess: false,
    fileSystemFilenameConflictAction: FilenameConfigAction.UNIQUIFY,
    showPopupButton: true,
    gifQuality: 10,
    webmBitrate: 20,
    mp4Bitrate: 20,
    losslessWebp: false,
    webpQuality: 95,
    webpMehtod: 4,
    pngColor: 256,
    historyBackupInterval: HistoryBackupInterval.NEVER,
    lastHistoryBackup: 0,
    token: '',
    'pdl-btn-self-bookmark-left': 100,
    'pdl-btn-self-bookmark-top': 76,
    'pdl-btn-left': 0,
    'pdl-btn-top': 100,
    ...customConfig
  });

  let configData: ConfigData;

  if (!localStorage.pdlSetting) {
    configData = Object.assign({}, defaultConfig);
  } else {
    try {
      configData = JSON.parse(localStorage.pdlSetting);
    } catch (error) {
      logger.error('Use default config because: ', error);
      configData = Object.assign({}, defaultConfig);
    }
  }

  if (configData.version !== defaultConfig.version) {
    // 更新设置
    configData = {
      ...defaultConfig,
      ...configData,
      version: defaultConfig.version,
      showMsg: true
    };
    localStorage.pdlSetting = JSON.stringify(configData);
  }

  return (config = {
    get<T extends keyof ConfigData>(key: T): ConfigData[T] {
      return configData[key] ?? defaultConfig[key];
    },

    set<T extends keyof ConfigData>(key: T, value: ConfigData[T]): void {
      if (configData[key] !== value) {
        configData[key] = value;
        localStorage.pdlSetting = JSON.stringify(configData);
        logger.info('Config set:', key, value);
      }
    },

    getAll(): ConfigData {
      return { ...configData };
    },

    update(newConfig: ConfigData) {
      configData = { ...newConfig };
      localStorage.pdlSetting = JSON.stringify(configData);
    }
  });
}
