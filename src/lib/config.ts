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
  useFileSystemAccess: boolean;
  fileSystemFilenameConflictAction: FilenameConfigAction;
  showPopupButton: boolean;
  gifQuality: number;
  webmQuality: number;
  mp4Bitrate: number;
  losslessWebp: boolean;
  webpQuality: number;
  webpMehtod: number;
  pngColor: number;
  historyBackupInterval: number;
  lastHistoryBackup: number;
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

function loadConfig(): Config {
  const getDefaultFolder = () => {
    switch (location.hostname) {
      case 'www.pixiv.net':
        return 'pixiv/{artist}';
      case 'danbooru.donmai.us':
        return 'danbooru/{artist}';
      case 'rule34.xxx':
        return 'rule34/{artist}';
      case 'yande.re':
        return 'yande/{artist}';
      case 'booru.allthefallen.moe':
        return 'ATFbooru/{artist}';
      default:
        return '';
    }
  };

  const getDefaultFilename = () => {
    if (location.hostname === 'www.pixiv.net') {
      return '{artist}_{title}_{id}_p{page}';
    } else {
      return '{id}_{artist}_{character}';
    }
  };

  const defaultConfig: Readonly<ConfigData> = Object.freeze({
    version: __VERSION__,
    ugoiraFormat: UgoiraFormat.ZIP,
    folderPattern: getDefaultFolder(),
    filenamePattern: getDefaultFilename(),
    tagLang: TagLanguage.JAPANESE,
    showMsg: true,
    mixEffect: false,
    bundleIllusts: false,
    bundleManga: false,
    addBookmark: false,
    addBookmarkWithTags: false,
    privateR18: false,
    useFileSystemAccess: false,
    fileSystemFilenameConflictAction: FilenameConfigAction.UNIQUIFY,
    showPopupButton: true,
    gifQuality: 10,
    webmQuality: 95,
    mp4Bitrate: 20,
    losslessWebp: false,
    webpQuality: 95,
    webpMehtod: 4,
    pngColor: 256,
    historyBackupInterval: HistoryBackupInterval.NEVER,
    lastHistoryBackup: 0,
    'pdl-btn-self-bookmark-left': 100,
    'pdl-btn-self-bookmark-top': 76,
    'pdl-btn-left': 0,
    'pdl-btn-top': 100
  });

  let config: ConfigData;

  if (!localStorage.pdlSetting) {
    config = Object.assign({}, defaultConfig);
  } else {
    try {
      config = JSON.parse(localStorage.pdlSetting);
    } catch (error) {
      logger.error('Use default config because: ', error);
      config = Object.assign({}, defaultConfig);
    }
  }

  if (config.version !== defaultConfig.version) {
    // 更新设置
    config = {
      ...defaultConfig,
      ...config,
      version: defaultConfig.version,
      showMsg: true
    };
    localStorage.pdlSetting = JSON.stringify(config);
  }

  return {
    get<T extends keyof ConfigData>(key: T): ConfigData[T] {
      return config[key] ?? defaultConfig[key];
    },

    set<T extends keyof ConfigData>(key: T, value: ConfigData[T]): void {
      if (config[key] !== value) {
        config[key] = value;
        localStorage.pdlSetting = JSON.stringify(config);
        logger.info('Config set:', key, value);
      }
    },

    getAll(): ConfigData {
      return { ...config };
    },

    update(newConfig: ConfigData) {
      config = { ...newConfig };
      localStorage.pdlSetting = JSON.stringify(config);
    }
  };
}

export const config = loadConfig();
