import { SiteInject } from '../base';
import { historyDb, type HistoryData } from '@/lib/db';
import { pixivParser, type PixivMeta } from './parser';
import { IllustType, type BookmarksRest, type Category } from './types';
import { downloader } from '@/lib/downloader';
import { PixivDownloadConfig } from './downloadConfigBuilder';
import { getSelfId } from './helpers/getSelfId';
import { regexp } from '@/lib/regExp';
import { api } from './service';
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
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

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
        const userData = await api.getUserData(userId);
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

    pageMatch: {
      self_bookmark_public: {
        name: t('downloader.download_type.pixiv_bookmark_public'),
        match(url) {
          const userIdMatch = regexp.userPage.exec(url);
          if (!userIdMatch) return false;

          const userId = userIdMatch[1] || userIdMatch[2];
          return userId === getSelfId();
        },
        filterWhenGenerateIngPage: true,
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
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.bookmarkGenerator(pageRange, checkValidity, getSelfId(), 'hide');
        }
      },

      user_page_works: {
        name: t('downloader.download_type.pixiv_works'),
        match: regexp.userPage,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          const userIdMatch = regexp.userPage.exec(location.href)!;
          const userId = userIdMatch[1] || userIdMatch[2];

          return pixivParser.illustMangaGenerator(pageRange, checkValidity, userId);
        }
      },

      user_page_bookmark: {
        name: t('downloader.download_type.pixiv_bookmark'),
        match: regexp.userPage,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          const userIdMatch = regexp.userPage.exec(location.href)!;
          const userId = userIdMatch[1] || userIdMatch[2];

          return pixivParser.bookmarkGenerator(pageRange, checkValidity, userId);
        }
      },

      follow_latest_all: {
        name: t('downloader.download_type.pixiv_follow_latest_all'),
        match: regexp.followLatest,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.followLatestGenerator(pageRange, checkValidity, 'all');
        }
      },

      follow_latest_r18: {
        name: t('downloader.download_type.pixiv_follow_latest_r18'),
        match: regexp.followLatest,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          return pixivParser.followLatestGenerator(pageRange, checkValidity, 'r18');
        }
      },

      series: {
        name: t('downloader.download_type.pixiv_series'),
        match: regexp.series,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          const matchSeries = regexp.series.exec(location.pathname)!;
          return pixivParser.seriesGenerator(pageRange, checkValidity, matchSeries[2]);
        }
      },

      tagged_artwork: {
        name: 'tagged_artwork',
        match: () => false, // use for user tag download
        filterWhenGenerateIngPage: true,
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

    async downloadByArtworkId(meta, taskId) {
      downloader.dirHandleCheck();

      const downloadConfigs = new PixivDownloadConfig(meta).getDownloadConfig();
      downloadConfigs.forEach((config) => {
        config.taskId = taskId;
      });

      await downloader.download(downloadConfigs);

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
    },

    onDownloadAbort(taskIds) {
      downloader.abort(taskIds);
    }
  });

  static get hostname(): string {
    return 'www.pixiv.net';
  }

  public inject() {
    super.inject();

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

  protected getFilenameTemplate(): string[] {
    return ['{artist}', '{artistID}', '{title}', '{id}', '{page}', '{tags}', '{date}'];
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
      createThumbnailBtn(document.querySelectorAll('a'));
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
      createThumbnailBtn(thumbnails);
    }
  }

  private pageActions() {
    const pathname = location.pathname;
    let param: RegExpExecArray | null;
    switch (true) {
      case !!(param = regexp.artworksPage.exec(pathname)): {
        const id = param[1];
        createToolbarBtn(id);
        createWorkExpanedViewBtn(id);
        createPresentationBtn(id);
        createPreviewModalBtn(id);
        createMangaViewerBtn(id);
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
        createThumbnailBtn(document.querySelectorAll<HTMLSpanElement>('span[style]._history-item'));
        break;
      }
      case !!(param = regexp.unlisted.exec(pathname)): {
        const unlistedId = param[0];
        const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
        if (!canonicalUrl) return;
        const id = regexp.artworksPage.exec(canonicalUrl)?.[1];
        if (!id) return;

        createUnlistedToolbar(id, unlistedId);
        createWorkExpanedViewBtn(id, unlistedId);
        createPresentationBtn(id, unlistedId);
        createPreviewModalBtn(id, unlistedId);
        createMangaViewerBtn(id, unlistedId);
        break;
      }
      default:
        break;
    }
  }
}
