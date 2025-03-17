import { SiteInject } from '../base';
import { historyDb, type HistoryData } from '@/lib/db';
import { pixivParser, type PixivIllustMeta, type PixivMeta } from './parser';
import { BookmarkRestrict, IllustType, type BookmarksRest, type Category } from './types';
import { downloader, type DownloadConfig } from '@/lib/downloader';
import { getSelfId } from './helpers/getSelfId';
import { regexp } from '@/lib/regExp';
import { pixivApi } from './api';
import t from '@/lib/lang';
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
import { TagLanguage, UgoiraFormat } from '@/lib/config';
import type { TemplateData } from '../base/downloadConfig';

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
          name: t('downloader.category.filter.exclude_downloaded'),
          checked: false,
          fn(meta) {
            return !!meta.id && historyDb.has(meta.id);
          }
        },
        {
          id: 'illust',
          type: 'include',
          name: t('downloader.category.filter.pixiv_illust'),
          checked: true,
          fn(meta) {
            return meta.illustType === IllustType.illusts;
          }
        },
        {
          id: 'manga',
          type: 'include',
          name: t('downloader.category.filter.pixiv_manga'),
          checked: true,
          fn(meta) {
            return meta.illustType === IllustType.manga;
          }
        },
        {
          id: 'ugoira',
          type: 'include',
          name: t('downloader.category.filter.pixiv_ugoira'),
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
        name: t('downloader.download_type.pixiv_bookmark_public'),
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
        name: t('downloader.download_type.pixiv_bookmark_private'),
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
        name: t('downloader.download_type.pixiv_works'),
        match: regexp.userPage,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const userIdMatch = regexp.userPage.exec(location.href)!;
          const userId = userIdMatch[1] || userIdMatch[2];

          return pixivParser.illustMangaGenerator(pageRange, checkValidity, userId);
        }
      },

      user_page_bookmark: {
        name: t('downloader.download_type.pixiv_bookmark'),
        match: regexp.userPage,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const userIdMatch = regexp.userPage.exec(location.href)!;
          const userId = userIdMatch[1] || userIdMatch[2];

          return pixivParser.bookmarkGenerator(pageRange, checkValidity, userId);
        }
      },

      follow_latest_all: {
        name: t('downloader.download_type.pixiv_follow_latest_all'),
        match: regexp.followLatest,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.followLatestGenerator(pageRange, checkValidity, 'all');
        }
      },

      follow_latest_r18: {
        name: t('downloader.download_type.pixiv_follow_latest_r18'),
        match: regexp.followLatest,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.followLatestGenerator(pageRange, checkValidity, 'r18');
        }
      },

      series: {
        name: t('downloader.download_type.pixiv_series'),
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
      return pixivParser.parse(id, { tagLang: this.config.get('tagLang'), type: 'api' });
    },

    downloadArtworkByMeta: async (meta, signal) => {
      downloader.dirHandleCheck();

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

  protected getCustomConfig() {
    return {
      folderPattern: 'pixiv/{artist}',
      filenamePattern: '{artist}_{title}_{id}_p{page}'
    };
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
        const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
        if (!canonicalUrl) return;
        const id = regexp.artworksPage.exec(canonicalUrl)?.[1];
        if (!id) return;

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

  protected getDownloadConfig(
    meta: PixivMeta,
    setProgress?: (progress: number) => void,
    page?: number
  ): DownloadConfig | DownloadConfig[] {
    const folderTemplate = this.config.get('folderPattern');
    const filenameTemplate = this.config.get('filenamePattern');
    const ugoiraFormat = this.config.get('ugoiraFormat');
    const bundleManga = this.config.get('bundleManga');
    const bundleIllust = this.config.get('bundleIllusts');
    const mixEffect = this.config.get('mixEffect');
    const mixEffectFormat = ugoiraFormat === UgoiraFormat.ZIP ? UgoiraFormat.MP4 : ugoiraFormat;

    const useTranslatedTags = this.config.get('tagLang') !== TagLanguage.JAPANESE;

    const option = {
      folderTemplate,
      filenameTemplate,
      useTranslatedTags,
      setProgress
    };

    if ('ugoiraMeta' in meta) {
      if (ugoiraFormat !== UgoiraFormat.ZIP) {
        return new PixivDownloadConfig(meta).createConvert({
          ...option,
          convertFormat: ugoiraFormat
        });
      }

      return new PixivDownloadConfig(meta).createBundle(option);
    }

    if (this.isMultiImageMeta(meta)) {
      if (page !== undefined) {
        if (mixEffect) {
          return new PixivDownloadConfig(meta).createSeasonalEffect({
            ...option,
            index: page,
            convertFormat: mixEffectFormat
          });
        }

        return new PixivDownloadConfig(meta).create({
          ...option,
          index: page
        });
      }

      if (
        (meta.illustType === IllustType.manga && bundleManga) ||
        (meta.illustType === IllustType.illusts && bundleIllust)
      ) {
        return new PixivDownloadConfig(meta).createBundle(option);
      }

      return new PixivDownloadConfig(meta).createMulti(option);
    }

    if (mixEffect) {
      return new PixivDownloadConfig(meta).createSeasonalEffect({
        ...option,
        convertFormat: mixEffectFormat
      });
    }

    return new PixivDownloadConfig(meta).create(option);
  }

  protected async downloadArtwork(btn: ThumbnailButton) {
    downloader.dirHandleCheck();

    const { id, page, unlistedId } = btn.dataset as {
      id: string;
      page?: string;
      unlistedId?: string;
    };
    const pageNum = page !== undefined ? +page : undefined;

    const tagLang = this.config.get('tagLang');

    let pixivMeta: PixivMeta;

    if (!unlistedId) {
      const shouldAddBookmark = this.config.get('addBookmark');
      const shouldLikeIllust = this.config.get('likeIllust');

      if (shouldAddBookmark || shouldLikeIllust) {
        pixivMeta = await pixivParser.parse(id, { tagLang, type: 'html' });
        const { bookmarkData, token, tags, likeData } = pixivMeta;

        if (!bookmarkData && shouldAddBookmark) {
          const addedTags = this.config.get('addBookmarkWithTags') ? tags : undefined;
          const restrict =
            this.config.get('privateR18') && tags.includes('R-18')
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
