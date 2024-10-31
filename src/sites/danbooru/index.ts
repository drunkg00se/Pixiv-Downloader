import { downloadArtwork } from './downloadArtwork';
import { SiteInject } from '../base';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadPoolArtwork } from './downloadPoolArtwork';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import type { BatchDownloadConfig } from '@/lib/components/Downloader/useBatchDownload';
import { danbooruParser, type DanbooruMeta } from './parser';
import t from '@/lib/lang';
import { historyDb } from '@/lib/db';
import { DanbooruDownloadConfig } from './downloadConfigBuilder';
import { downloader } from '@/lib/downloader';

export class Danbooru extends SiteInject {
  static get hostname(): string {
    return 'danbooru.donmai.us';
  }

  protected inject(): void {
    const path = location.pathname;
    if (/^\/posts\/\d+/.test(path)) {
      const imageContainer = document.querySelector(
        'section.image-container:not(.blacklisted-active)'
      );
      if (!imageContainer) return;

      const id = imageContainer.getAttribute('data-id')!;
      this.createArtworkBtn(id);
      this.createThumbnailBtn();
    } else if (/^\/pools\/gallery/.test(path)) {
      this.createPoolThumbnailBtn();
    } else {
      this.createThumbnailBtn();
    }
  }

  protected createThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>(
      'article a.post-preview-link'
    );
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      const id = /(?<=\/posts\/)\d+/.exec(el.href)?.[0];
      if (!id) return;

      const btn = new ThumbnailButton({
        id,
        onClick: downloadArtwork
      });

      el.appendChild(btn);
    });
  }

  protected createArtworkBtn(id: string) {
    const btnContainer = document.querySelector<HTMLElement>('section.image-container')!;
    btnContainer.appendChild(
      new ArtworkButton({
        id,
        onClick: downloadArtwork
      })
    );
  }

  protected createPoolThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>(
      'article a.post-preview-link'
    );
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      const poolId = /(?<=\/pools\/)\d+/.exec(el.href)?.[0];
      if (!poolId) return;

      const btn = new ThumbnailButton({
        id: poolId,
        shouldObserveDb: false, // Danbooru pool的id不作记录
        onClick: downloadPoolArtwork
      });

      el.appendChild(btn);
    });
  }

  protected observeColorScheme() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    let uaPreferDark = query.matches;

    const siteSetting = document.body.getAttribute('data-current-user-theme') as
      | 'dark'
      | 'auto'
      | 'light';
    const sitePreferDark = siteSetting === 'dark';

    if (sitePreferDark || (siteSetting === 'auto' && uaPreferDark)) {
      this.setAppDarkMode();
    }

    if (siteSetting === 'auto') {
      query.addEventListener('change', (e) => {
        uaPreferDark = e.matches;
        uaPreferDark ? this.setAppDarkMode() : this.setAppLightMode();
      });
    }
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'danbooru/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  protected getFilenameTemplate(): string[] {
    return ['{artist}', '{character}', '{id}', '{date}'];
  }

  protected getBatchDownloadConfig(): BatchDownloadConfig<DanbooruMeta> {
    const customTagFilter = (userTags: string[], metaTags: string[]) => {
      const pureTags = metaTags.map((typedTag) => /(?<=[a-z]+:).+/.exec(typedTag)?.[0] ?? '');
      return userTags.some((tag) => pureTags.includes(tag));
    };

    return {
      avatar: '/packs/static/danbooru-logo-128x128-ea111b6658173e847734.png',

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
            id: 'allow_image',
            type: 'include',
            name: 'Image',
            checked: true,
            fn(meta) {
              return (
                !!meta.extendName && /bmp|jp(e)?g|png|tif|gif|exif|svg|webp/i.test(meta.extendName)
              );
            }
          },
          {
            id: 'allow_video',
            type: 'include',
            name: 'Video',
            checked: true,
            fn(meta) {
              return (
                !!meta.extendName &&
                /mp4|avi|mov|mkv|flv|wmv|webm|mpeg|mpg|m4v/i.test(meta.extendName)
              );
            }
          }
        ],

        enableTagFilter: {
          blacklist: customTagFilter,
          whitelist: customTagFilter
        }
      },

      pageMatch: [
        {
          name: 'pool',
          match: /(?<=\/pools\/)[0-9]+/,
          genPageId: {
            id: 'pool',
            name: 'Pool',
            fn: (pageRange) => {
              const poolId = /(?<=\/pools\/)[0-9]+/.exec(location.pathname)?.[0];
              if (!poolId) throw new Error('Invalid pool id');
              return danbooruParser.poolAndGroupGenerator(pageRange, poolId, 'pool');
            }
          }
        },
        {
          name: 'favorite_groups',
          match: /(?<=\/favorite_groups\/)[0-9]+/,
          genPageId: {
            id: 'favorite_groups',
            name: 'FavoriteGroups',
            fn: (pageRange) => {
              const groupId = /(?<=\/favorite_groups\/)[0-9]+/.exec(location.pathname)?.[0];
              if (!groupId) throw new Error('Invalid pool id');
              return danbooruParser.poolAndGroupGenerator(pageRange, groupId, 'favoriteGroup');
            }
          }
        }
      ],

      parseMetaByArtworkId(id) {
        return danbooruParser.parseIdByApi(id);
      },

      async downloadByArtworkId(meta, taskId) {
        downloader.dirHandleCheck();

        const downloadConfigs = new DanbooruDownloadConfig(meta).getDownloadConfig();
        downloadConfigs.taskId = taskId;

        await downloader.download(downloadConfigs);

        const { id, tags, artist, title, comment } = meta;
        historyDb.add({
          pid: Number(id),
          user: artist,
          title,
          comment,
          tags
        });

        return id;
      },

      onDownloadAbort(taskIds) {
        downloader.abort(taskIds);
      }
    };
  }
}
