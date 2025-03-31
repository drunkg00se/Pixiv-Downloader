import { ConvertFormat } from '../converter/adapter';
import { legacyConfig } from './legacyConfig';
import { LocalStorage } from './storage.svelte';

export const enum PixivTagLocale {
  JAPANESE = 'ja',
  CHINESE = 'zh',
  TRADITIONAL_CHINESE = 'zh_tw',
  ENGLISH = 'en'
}

export type UgoiraFormat = ConvertFormat | 'zip';

type SiteFeatureState = {
  ugoiraFormat: UgoiraFormat | null;
  mixSeasonalEffect: boolean | null;
  tagLocale: PixivTagLocale | null;
  compressMultiIllusts: boolean | null;
  compressManga: boolean | null;
  addBookmark: boolean | null;
  bookmarkWithTags: boolean | null;
  privateBookmarkIfR18: boolean | null;
  likeIllustWhenDownloading: boolean | null;
};

class SiteFeatureStore extends LocalStorage<SiteFeatureState> {
  constructor() {
    super('pdl-site-state', {
      ugoiraFormat: null,
      mixSeasonalEffect: null,
      tagLocale: null,
      compressMultiIllusts: null,
      compressManga: null,
      addBookmark: legacyConfig.addBookmark ?? null,
      bookmarkWithTags: null,
      privateBookmarkIfR18: null,
      likeIllustWhenDownloading: null
    });
  }
}

export const siteFeature = new SiteFeatureStore();
