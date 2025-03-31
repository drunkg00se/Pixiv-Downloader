import { SiteInject } from '../base';
import { historyDb, type HistoryData } from '@/lib/db';
import { pixivParser, type PixivIllustMeta, type PixivMeta } from './parser';
import { BookmarkRestrict, IllustType, type BookmarksRest, type Category } from './types';
import { downloader, type DownloadConfig } from '@/lib/downloader';
import { getSelfId } from './helpers/getSelfId';
import { regexp } from '@/lib/regExp';
import { pixivApi } from './api';
import { logger } from '@/lib/logger';
import { createThumbnailBtn } from './observerCB/createThumbnailBtn';
import { fixPixivPreviewer } from './helpers/fixPixivPreviewer';
import { createToolbarBtn } from './observerCB/artworksPage/toolbarButton';
import { createWorkExpanedViewBtn } from './observerCB/artworksPage/workExpanedViewButton';
import { createPresentationBtn } from './observerCB/artworksPage/presentationButton';
import { createPreviewModalBtn } from './observerCB/artworksPage/previewModalButton';
import { createMangaViewerBtn } from './observerCB/artworksPage/mangaViewerButton';
import { createUnlistedToolbar } from './observerCB/artworksPage/unlistedToolbar';
import { createTagListBtn } from './observerCB/userPage/tagListButton';
import { createFrequentTagBtn } from './observerCB/userPage/frequentTagButton';
import type { TagProps } from '@/lib/components/Pixiv/artworkTagButton';
import { ThumbnailBtnStatus, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { PixivDownloadConfig } from './downloadConfig';
import { addBookmark } from './helpers/addBookmark';
import { likeIllust } from './helpers/likeIllust';
import type { TemplateData } from '../base/downloadConfig';
import { t } from '@/lib/i18n.svelte';
import { ConvertFormat, type QualityOption } from '@/lib/converter/adapter';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { convertSetting } from '@/lib/store/convertSetting.svelte';
import { PixivTagLocale, siteFeature, type UgoiraFormat } from '@/lib/store/siteFeature.svelte';

export class Pixiv extends SiteInject {
  private firstObserverCbRunFlag = true;
  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as PixivMeta,

    async avatar(url: string) {
      let userId: string;
      let matchReg: RegExpExecArray | null;

      if ((matchReg = regexp.series.exec(url))) {
        userId = matchReg[1];
      } else if ((matchReg = regexp.userPage.exec(url))) {
        userId = matchReg[1] || matchReg[2];
      } else {
        userId = getSelfId() ?? '';
      }

      if (!userId) return '';

      try {
        const userData = await pixivApi.getUserData(userId);
        return userData.imageBig;
      } catch (error) {
        logger.error(error);
        return '';
      }
    },

    filterOption: {
      filters: [
        {
          id: 'exclude_downloaded',
          type: 'exclude',
          name: () => t('downloader.category.filter.exclude_downloaded'),
          checked: false,
          fn(meta) {
            return !!meta.id && historyDb.has(meta.id);
          }
        },
        {
          id: 'illust',
          type: 'include',
          name: () => t('downloader.category.filter.pixiv_illust'),
          checked: true,
          fn(meta) {
            return meta.illustType === IllustType.illusts;
          }
        },
        {
          id: 'manga',
          type: 'include',
          name: () => t('downloader.category.filter.pixiv_manga'),
          checked: true,
          fn(meta) {
            return meta.illustType === IllustType.manga;
          }
        },
        {
          id: 'ugoira',
          type: 'include',
          name: () => t('downloader.category.filter.pixiv_ugoira'),
          checked: true,
          fn(meta) {
            return meta.illustType === IllustType.ugoira;
          }
        }
      ],
      enableTagFilter: true
    },

    pageOption: {
      self_bookmark_public: {
        name: () => t('downloader.download_type.pixiv_bookmark_public'),
        match(url) {
          const userIdMatch = regexp.userPage.exec(url);
          if (!userIdMatch) return false;

          const userId = userIdMatch[1] || userIdMatch[2];
          return userId === getSelfId();
        },
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.bookmarkGenerator(pageRange, checkValidity, getSelfId());
        }
      },

      self_bookmark_private: {
        name: () => t('downloader.download_type.pixiv_bookmark_private'),
        match(url) {
          const userIdMatch = regexp.userPage.exec(url);
          if (!userIdMatch) return false;

          const userId = userIdMatch[1] || userIdMatch[2];
          return userId === getSelfId();
        },
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.bookmarkGenerator(pageRange, checkValidity, getSelfId(), 'hide');
        }
      },

      user_page_works: {
        name: () => t('downloader.download_type.pixiv_works'),
        match: regexp.userPage,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const userIdMatch = regexp.userPage.exec(location.href)!;
          const userId = userIdMatch[1] || userIdMatch[2];

          return pixivParser.illustMangaGenerator(pageRange, checkValidity, userId);
        }
      },

      user_page_bookmark: {
        name: () => t('downloader.download_type.pixiv_bookmark'),
        match: regexp.userPage,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const userIdMatch = regexp.userPage.exec(location.href)!;
          const userId = userIdMatch[1] || userIdMatch[2];

          return pixivParser.bookmarkGenerator(pageRange, checkValidity, userId);
        }
      },

      follow_latest_all: {
        name: () => t('downloader.download_type.pixiv_follow_latest_all'),
        match: regexp.followLatest,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.followLatestGenerator(pageRange, checkValidity, 'all');
        }
      },

      follow_latest_r18: {
        name: () => t('downloader.download_type.pixiv_follow_latest_r18'),
        match: regexp.followLatest,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.followLatestGenerator(pageRange, checkValidity, 'r18');
        }
      },

      series: {
        name: () => t('downloader.download_type.pixiv_series'),
        match: regexp.series,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const matchSeries = regexp.series.exec(location.pathname)!;
          return pixivParser.seriesGenerator(pageRange, checkValidity, matchSeries[2]);
        }
      },

      tagged_artwork: {
        name: 'tagged_artwork',
        match: () => false, // use for user tag download
        filterInGenerator: true,
        fn: (
          pageRange: [start: number, end: number] | null,
          checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
          userId: string,
          category: Category,
          tag: string,
          bookmarkRest: BookmarksRest = 'show'
        ) => {
          if (category === 'bookmarks') {
            return pixivParser.taggedArtworkGenerator(
              pageRange,
              checkValidity,
              userId,
              category,
              tag,
              bookmarkRest
            );
          } else {
            return pixivParser.taggedArtworkGenerator(
              pageRange,
              checkValidity,
              userId,
              category,
              tag
            );
          }
        }
      }
    },
    parseMetaByArtworkId: (id) => {
      const tagLang = siteFeature.current.tagLocale ?? PixivTagLocale.JAPANESE;
      return pixivParser.parse(id, { tagLang, type: 'api' });
    },

    downloadArtworkByMeta: async (meta, signal) => {
      this.getFileHandleIfNeeded();

      const downloadConfigs = this.getDownloadConfig(meta);

      await downloader.download(downloadConfigs, { signal });

      const { comment, id, tags, artist, userId, title } = meta;
      const historyData: HistoryData = {
        pid: Number(id),
        user: artist,
        userId: Number(userId),
        title,
        comment,
        tags
      };
      historyDb.add(historyData);
    }
  });

  constructor() {
    downloadSetting.setDirectoryTemplate('pixiv/{artist}');
    downloadSetting.setFilenameTemplate('{artist}_{title}_{id}_p{page}');

    siteFeature.patch((state) => {
      state.ugoiraFormat ??= 'zip';
      state.mixSeasonalEffect ??= false;
      state.tagLocale ??= PixivTagLocale.JAPANESE;
      state.compressMultiIllusts ??= false;
      state.compressManga ??= false;
      state.addBookmark ??= false;
      state.bookmarkWithTags ??= false;
      state.privateBookmarkIfR18 ??= false;
      state.likeIllustWhenDownloading ??= false;
    });

    super();
  }

  static get hostname(): string {
    return 'www.pixiv.net';
  }

  public inject() {
    super.inject();

    this.downloadArtwork = this.downloadArtwork.bind(this);

    new MutationObserver((records) => {
      this.injectThumbnailButtons(records);
      this.pageActions();
    }).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  protected getSupportedTemplate(): Partial<TemplateData> {
    return PixivDownloadConfig.supportedTemplate;
  }

  protected observeColorScheme() {
    const onThemeChange = () => {
      const sitePreferDark = document.documentElement.getAttribute('data-theme') as
        | 'default'
        | 'dark';
      sitePreferDark === 'dark' ? this.setAppDarkMode() : this.setAppLightMode();
    };

    new MutationObserver(onThemeChange).observe(document.documentElement, {
      attributes: true,
      childList: false,
      subtree: false
    });

    onThemeChange();
  }

  private injectThumbnailButtons(records: MutationRecord[]) {
    const addedNodes: HTMLElement[] = [];
    records.forEach((record) => {
      if (!record.addedNodes.length) return;
      (record.addedNodes as NodeListOf<HTMLElement>).forEach((node) => {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.tagName.toLowerCase() !== ThumbnailButton.tagNameLowerCase &&
          node.tagName !== 'IMG'
        ) {
          addedNodes.push(node);
        }
      });
    });
    if (!addedNodes.length) return;

    //为小图添加下载按钮
    if (this.firstObserverCbRunFlag) {
      //排行榜页前50不是动态加载，第一次加载没有Pdlbtn
      createThumbnailBtn(document.querySelectorAll('a'), this.downloadArtwork);
      this.firstObserverCbRunFlag = false;
    } else {
      fixPixivPreviewer(addedNodes);

      const thumbnails = addedNodes.reduce((prev, current) => {
        //新增的node也没有pdlbtn
        return prev.concat(
          current instanceof HTMLAnchorElement
            ? [current]
            : Array.from(current.querySelectorAll('a'))
        );
      }, [] as HTMLAnchorElement[]);
      createThumbnailBtn(thumbnails, this.downloadArtwork);
    }
  }

  private pageActions() {
    const pathname = location.pathname;
    let param: RegExpExecArray | null;
    switch (true) {
      case !!(param = regexp.artworksPage.exec(pathname)): {
        const id = param[1];
        createToolbarBtn(id, this.downloadArtwork);
        createWorkExpanedViewBtn(id, this.downloadArtwork);
        createPresentationBtn(id, this.downloadArtwork);
        createPreviewModalBtn(id, this.downloadArtwork);
        createMangaViewerBtn(id, this.downloadArtwork);
        break;
      }
      case regexp.userPageTags.test(pathname): {
        const { downloading, batchDownload } = this.useBatchDownload();
        const handleDownload = (props: TagProps) => {
          const { userId, category, tag, rest } = props;
          return batchDownload('tagged_artwork', userId, category, tag, rest);
        };

        createFrequentTagBtn(downloading, handleDownload);
        createTagListBtn(downloading, handleDownload);
        break;
      }
      case regexp.historyPage.test(pathname): {
        createThumbnailBtn(
          document.querySelectorAll<HTMLSpanElement>('span[style]._history-item'),
          this.downloadArtwork
        );
        break;
      }
      case !!(param = regexp.unlisted.exec(pathname)): {
        const unlistedId = param[0];
        const canonicalUrlEL =
          document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ||
          document.head.querySelector<HTMLLinkElement>(
            'link[data-next-head][href^="https://www.pixiv.net/artworks/"]'
          );
        const canonicalUrl = canonicalUrlEL?.getAttribute('href');

        if (!canonicalUrl) throw new Error(`Cannot get canonical url for ${unlistedId}`);
        const id = regexp.artworksPage.exec(canonicalUrl)?.[1];
        if (!id) throw new Error(`Cannot get artwork id for ${unlistedId}`);

        createUnlistedToolbar(id, this.downloadArtwork, unlistedId);
        createWorkExpanedViewBtn(id, this.downloadArtwork, unlistedId);
        createPresentationBtn(id, this.downloadArtwork, unlistedId);
        createPreviewModalBtn(id, this.downloadArtwork, unlistedId);
        createMangaViewerBtn(id, this.downloadArtwork, unlistedId);
        break;
      }
      default:
        break;
    }
  }

  protected isMultiImageMeta(
    meta: PixivIllustMeta<string | string[]>
  ): meta is PixivIllustMeta<string[]> {
    return Array.isArray(meta.src) && meta.src.length > 1;
  }

  protected getConvertQualityOption(ugoiraFormat: ConvertFormat): QualityOption;
  protected getConvertQualityOption(ugoiraFormat?: UgoiraFormat | null): QualityOption | void;
  protected getConvertQualityOption(ugoiraFormat?: UgoiraFormat | null): QualityOption | void {
    switch (ugoiraFormat) {
      case ConvertFormat.GIF:
        return {
          format: ConvertFormat.GIF,
          quality: convertSetting.current.gifQuality
        };
      case ConvertFormat.PNG:
        return {
          format: ConvertFormat.PNG,
          cnum: convertSetting.current.pngColor
        };
      case ConvertFormat.WEBM:
        return {
          format: ConvertFormat.WEBM,
          bitrate: convertSetting.current.webmBitrate
        };
      case ConvertFormat.WEBP: {
        const {
          losslessWebp: lossless,
          webpQuality: quality,
          webpMehtod: method
        } = convertSetting.current;
        return {
          format: ConvertFormat.WEBP,
          lossless,
          quality,
          method
        };
      }
      case ConvertFormat.MP4:
        return {
          format: ConvertFormat.MP4,
          bitrate: convertSetting.current.mp4Bitrate
        };
      default:
        return;
    }
  }

  protected getDownloadConfig(
    meta: PixivMeta,
    setProgress?: (progress: number) => void,
    page?: number
  ): DownloadConfig | DownloadConfig[] {
    const { compressManga, compressMultiIllusts, mixSeasonalEffect, ugoiraFormat, tagLocale } =
      siteFeature.current;

    const defaultFormat = ConvertFormat.MP4;
    const qualityOption = this.getConvertQualityOption(ugoiraFormat);

    const option = {
      ...downloadSetting.current,
      useTranslatedTags: !!tagLocale && tagLocale !== PixivTagLocale.JAPANESE,
      setProgress
    };

    if ('ugoiraMeta' in meta) {
      if (qualityOption) {
        return new PixivDownloadConfig(meta).createConvert({
          ...option,
          qualityOption
        });
      }

      return new PixivDownloadConfig(meta).createBundle(option);
    }

    if (this.isMultiImageMeta(meta)) {
      if (page !== undefined) {
        if (mixSeasonalEffect) {
          return new PixivDownloadConfig(meta).createSeasonalEffect({
            ...option,
            index: page,
            qualityOption: qualityOption || this.getConvertQualityOption(defaultFormat)
          });
        }

        return new PixivDownloadConfig(meta).create({
          ...option,
          index: page
        });
      }

      if (
        (meta.illustType === IllustType.manga && compressManga) ||
        (meta.illustType === IllustType.illusts && compressMultiIllusts)
      ) {
        return new PixivDownloadConfig(meta).createBundle(option);
      }

      return new PixivDownloadConfig(meta).createMulti(option);
    }

    if (mixSeasonalEffect) {
      return new PixivDownloadConfig(meta).createSeasonalEffect({
        ...option,
        qualityOption: qualityOption || this.getConvertQualityOption(defaultFormat)
      });
    }

    return new PixivDownloadConfig(meta).create(option);
  }

  protected async downloadArtwork(btn: ThumbnailButton) {
    this.getFileHandleIfNeeded();

    const { id, page, unlistedId } = btn.dataset as {
      id: string;
      page?: string;
      unlistedId?: string;
    };
    const pageNum = page !== undefined ? +page : undefined;

    const tagLang = siteFeature.current.tagLocale ?? PixivTagLocale.JAPANESE;

    let pixivMeta: PixivMeta;

    if (!unlistedId) {
      const shouldAddBookmark = siteFeature.current.addBookmark;
      const shouldLikeIllust = siteFeature.current.likeIllustWhenDownloading;

      if (shouldAddBookmark || shouldLikeIllust) {
        pixivMeta = await pixivParser.parse(id, { tagLang, type: 'html' });
        const { bookmarkData, token, tags, likeData } = pixivMeta;

        if (!bookmarkData && shouldAddBookmark) {
          const addedTags = siteFeature.current.bookmarkWithTags ? tags : undefined;
          const restrict =
            siteFeature.current.privateBookmarkIfR18 && tags.includes('R-18')
              ? BookmarkRestrict.private
              : BookmarkRestrict.public;
          addBookmark(id, token, { btn, tags: addedTags, restrict });
        }

        if (!likeData && shouldLikeIllust) {
          likeIllust(id, token);
        }
      } else {
        pixivMeta = await pixivParser.parse(id, { tagLang, type: 'api' });
      }
    } else {
      pixivMeta = await pixivParser.parse(unlistedId, { tagLang, type: 'unlisted' });
    }

    const downloadConfigs = this.getDownloadConfig(
      pixivMeta,
      (progress: number) => {
        if (progress > 0) {
          btn.setProgress(progress);
        } else {
          btn.setStatus(ThumbnailBtnStatus.Loading);
        }
      },
      pageNum
    );

    await downloader.download(downloadConfigs, { priority: 1 });

    const { comment, tags, artist, userId, title } = pixivMeta;
    const historyData: HistoryData = {
      pid: Number(id),
      user: artist,
      userId: Number(userId),
      title,
      comment,
      tags
    };

    if (page !== undefined) {
      historyData.page = Number(page);
    }

    if (unlistedId) {
      historyData.unlistedId = unlistedId;
    }

    historyDb.add(historyData);
  }
}
