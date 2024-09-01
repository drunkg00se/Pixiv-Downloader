import { SiteInject } from '../base';
import { observerCallback } from './observerCB';
import { GM_addStyle } from '$';
import downloadBar from '@/assets/styles/downloadBar.scss?inline';
import checkbox from '@/assets/styles/checkbox.scss?inline';
import { historyDb, type HistoryData } from '@/lib/db';
import { pixivParser, type PixivMeta } from './parser';
import type {
  RegisterConfig,
  GenerateIdWithValidation
} from '@/lib/components/Downloader/DownloaderRegisterConfig';
import { IllustType, type Category } from './types';
import { downloader } from '@/lib/downloader';
import { PixivDownloadConfig } from './downloadConfigBuilder';
import { getSelfId } from './helpers/getSelfId';
import { regexp } from '@/lib/regExp';
import { api } from './service';

export class Pixiv extends SiteInject {
  public inject(): void {
    super.inject();

    new MutationObserver(observerCallback).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  protected injectStyle(): void {
    super.injectStyle();

    GM_addStyle(checkbox);
    GM_addStyle(downloadBar);
  }

  protected observeColorScheme() {
    const onThemeChange = () => {
      const sitePreferDark = document.documentElement.getAttribute('data-theme') as
        | 'default'
        | 'dark';

      if (sitePreferDark === 'dark') {
        this.setModalDarkMode();
      } else {
        this.setModalLightMode();
      }
    };
    onThemeChange();

    new MutationObserver(onThemeChange).observe(document.documentElement, {
      attributes: true,
      childList: false,
      subtree: false
    });
  }

  protected getBatchDownloadConfig(): RegisterConfig<PixivMeta, true> {
    return {
      async avatar(url: string) {
        const userIdMatch = /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/.exec(
          url
        );

        let userId: string;
        userIdMatch ? (userId = userIdMatch[1] || userIdMatch[2]) : (userId = getSelfId() ?? '');

        if (!userId) return '';

        try {
          const userData = await api.getUserData(userId);
          return userData.imageBig;
        } catch (error) {
          console.log(error);
          return '';
        }
      },

      filterOption: {
        filters: [
          {
            id: 'exclude_downloaded',
            type: 'exclude',
            name: '排除已下载',
            checked: false,
            fn(meta) {
              return !!meta.id && historyDb.has(meta.id);
            }
          },
          {
            id: 'illust',
            type: 'include',
            name: '插画',
            checked: true,
            fn(meta) {
              return meta.illustType === IllustType.illusts;
            }
          },
          {
            id: 'manga',
            type: 'include',
            name: '漫画',
            checked: true,
            fn(meta) {
              return meta.illustType === IllustType.manga;
            }
          },
          {
            id: 'ugoira',
            type: 'include',
            name: '动图',
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
          name: '个人页',
          match(url) {
            const userIdMatch =
              /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/.exec(url);
            if (!userIdMatch) return false;

            const userId = userIdMatch[1] || userIdMatch[2];
            return userId === getSelfId();
          },
          genPageId: [
            {
              id: 'self_bookmark_public',
              name: '公开收藏',
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                return pixivParser.bookmarkGenerator(...args, getSelfId());
              }
            },
            {
              id: 'self_bookmark_private',
              name: '不公开收藏',
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                return pixivParser.bookmarkGenerator(...args, getSelfId(), 'hide');
              }
            }
          ]
        },
        {
          name: '用户页',
          match: /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/,
          genPageId: [
            {
              id: 'works',
              name: '作品',
              fn: (...args: Parameters<typeof pixivParser.illustMangaGenerator>) => {
                const userIdMatch =
                  /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/.exec(
                    location.href
                  )!;
                const userId = userIdMatch[1] || userIdMatch[2];

                return pixivParser.illustMangaGenerator(...args, userId);
              }
            },
            {
              id: 'bookmark',
              name: '收藏',
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                const userIdMatch =
                  /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/.exec(
                    location.href
                  )!;
                const userId = userIdMatch[1] || userIdMatch[2];

                return pixivParser.bookmarkGenerator(...args, userId);
              }
            }
          ]
        },
        {
          name: '已关注用户的作品',
          match: regexp.followLatest,
          genPageId: [
            {
              id: 'follow_latest_all',
              name: '全部',
              fn: (...args: Parameters<GenerateIdWithValidation<PixivMeta>>) => {
                return pixivParser.followLatestGenerator(...args, 'all');
              }
            },
            {
              id: 'follow_latest_all',
              name: 'R-18',
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
                bookmarkRest: 'hide' | 'show' = 'show'
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
        return pixivParser.parse(id);
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
