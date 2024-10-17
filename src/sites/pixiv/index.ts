import { SiteInject } from '../base';
import { observerCallback } from './observerCB';
import { historyDb, type HistoryData } from '@/lib/db';
import { pixivParser, type PixivMeta } from './parser';
import type {
  BatchDownloadConfig,
  GenerateIdWithValidation
} from '@/lib/components/Downloader/useBatchDownload';
import { IllustType, type BookmarksRest, type Category } from './types';
import { downloader } from '@/lib/downloader';
import { PixivDownloadConfig } from './downloadConfigBuilder';
import { getSelfId } from './helpers/getSelfId';
import { regexp } from '@/lib/regExp';
import { api } from './service';
import t from '@/lib/lang';
import { logger } from '@/lib/logger';

export class Pixiv extends SiteInject {
  static get hostname(): string {
    return 'www.pixiv.net';
  }

  public inject(): void {
    super.inject();

    new MutationObserver(observerCallback).observe(document.body, {
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

  protected getBatchDownloadConfig(): BatchDownloadConfig<PixivMeta, true> {
    return {
      async avatar(url: string) {
        const userIdMatch = regexp.userPage.exec(url);

        let userId: string;
        userIdMatch ? (userId = userIdMatch[1] || userIdMatch[2]) : (userId = getSelfId() ?? '');

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
        enableTagFilter: true,
        filterWhenGenerateIngPage: true
      },

      pageMatch: [
        {
          name: 'my_page',
          match(url) {
            const userIdMatch = regexp.userPage.exec(url);
            if (!userIdMatch) return false;

            const userId = userIdMatch[1] || userIdMatch[2];
            return userId === getSelfId();
          },

          genPageId: [
            {
              id: 'self_bookmark_public',
              name: t('downloader.download_type.pixiv_bookmark_public'),
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                return pixivParser.bookmarkGenerator(...args, getSelfId());
              }
            },

            {
              id: 'self_bookmark_private',
              name: t('downloader.download_type.pixiv_bookmark_private'),
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                return pixivParser.bookmarkGenerator(...args, getSelfId(), 'hide');
              }
            }
          ]
        },

        {
          name: 'user_page',
          match: regexp.userPage,
          genPageId: [
            {
              id: 'works',
              name: t('downloader.download_type.pixiv_works'),
              fn: (...args: Parameters<typeof pixivParser.illustMangaGenerator>) => {
                const userIdMatch = regexp.userPage.exec(location.href)!;
                const userId = userIdMatch[1] || userIdMatch[2];

                return pixivParser.illustMangaGenerator(...args, userId);
              }
            },

            {
              id: 'bookmark',
              name: t('downloader.download_type.pixiv_bookmark'),
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                const userIdMatch = regexp.userPage.exec(location.href)!;
                const userId = userIdMatch[1] || userIdMatch[2];

                return pixivParser.bookmarkGenerator(...args, userId);
              }
            }
          ]
        },

        {
          name: 'follow_latest',
          match: regexp.followLatest,
          genPageId: [
            {
              id: 'follow_latest_all',
              name: t('downloader.download_type.pixiv_follow_latest_all'),
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                return pixivParser.followLatestGenerator(...args, 'all');
              }
            },

            {
              id: 'follow_latest_r18',
              name: t('downloader.download_type.pixiv_follow_latest_r18'),
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                return pixivParser.followLatestGenerator(...args, 'r18');
              }
            }
          ]
        },

        {
          name: 'download_specific_tag',
          match: () => false, // use for user tag download
          genPageId: [
            {
              id: 'tagged_artwork',
              name: 'tagged_artwork',
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
          ]
        }
      ],

      parseMetaByArtworkId(id) {
        return pixivParser.parse(id, true);
      },

      async downloadByArtworkId(meta, taskId) {
        downloader.dirHandleCheck();

        const downloadConfigs = new PixivDownloadConfig(meta).getDownloadConfig();
        downloadConfigs.forEach((config) => {
          config.taskId = taskId;
          config.source.id = taskId;
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

        return id;
      },

      onDownloadAbort(taskIds) {
        downloader.abort(taskIds);
      }
    };
  }
}
