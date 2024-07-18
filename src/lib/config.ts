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
  TRADITIONAL_CHINESE = 'zh-tw',
  ENGLISH = 'en'
}

export interface ConfigData {
  version: string;
  ugoiraFormat: UgoiraFormat;
  folderPattern: string;
  filenamePattern: string;
  tagLang: TagLanguage;
  showMsg: boolean;
  filterExcludeDownloaded: boolean;
  filterIllusts: boolean;
  filterManga: boolean;
  filterUgoira: boolean;
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
  losslessWebp: boolean;
  webpQuality: number;
  webpMehtod: number;
  pngColor: number;
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

function loadConfig(siteConfig?: Partial<ConfigData>): Config {
  const defaultConfig: Readonly<ConfigData> = Object.freeze({
    version: __VERSION__,
    ugoiraFormat: UgoiraFormat.ZIP,
    folderPattern: 'pixiv/{artist}',
    filenamePattern: '{artist}_{title}_{id}_p{page}',
    tagLang: TagLanguage.JAPANESE,
    showMsg: true,
    filterExcludeDownloaded: false,
    filterIllusts: true,
    filterManga: true,
    filterUgoira: true,
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
    losslessWebp: false,
    webpQuality: 95,
    webpMehtod: 4,
    pngColor: 256,
    'pdl-btn-self-bookmark-left': 100,
    'pdl-btn-self-bookmark-top': 76,
    'pdl-btn-left': 0,
    'pdl-btn-top': 100,
    ...siteConfig
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
      return config;
    },

    update(newConfig: ConfigData) {
      config = newConfig;
      localStorage.pdlSetting = JSON.stringify(config);
    }
  };
}

const hostname = location.hostname;
let siteConfig: Partial<ConfigData> | undefined;
if (hostname === 'rule34.xxx') {
  siteConfig = {
    folderPattern: 'rule34/{artist}',
    filenamePattern: '{id}_{artist}_{character}'
  };
} else if (hostname === 'danbooru.donmai.us') {
  siteConfig = {
    folderPattern: 'danbooru/{artist}',
    filenamePattern: '{id}_{artist}_{character}'
  };
}

export const config = loadConfig(siteConfig);
