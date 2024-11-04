import { SiteInject } from '../base';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import type { BatchDownloadConfig } from '@/lib/components/Downloader/useBatchDownload';
import { danbooruParser, type DanbooruMeta } from './parser';
import t from '@/lib/lang';
import { historyDb } from '@/lib/db';
import { DanbooruDownloadConfig } from './downloadConfigBuilder';
import { downloader } from '@/lib/downloader';
import { DanbooruPoolButton } from '@/lib/components/Danbooru/danbooruPoolButton';
import { addBookmark } from './addBookmark';

export class Danbooru extends SiteInject {
  static get hostname(): string {
    return 'danbooru.donmai.us';
  }

  protected inject(): void {
    this.downloadArtwork = this.downloadArtwork.bind(this);

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
        onClick: this.downloadArtwork
      });

      el.appendChild(btn);
    });
  }

  protected createArtworkBtn(id: string) {
    const btnContainer = document.querySelector<HTMLElement>(
      'section.image-container:has(picture)'
    );
    btnContainer?.appendChild(
      new ArtworkButton({
        id,
        onClick: this.downloadArtwork
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

      const btn = new DanbooruPoolButton({ id: poolId });

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

  protected async downloadArtwork(btn: ThumbnailButton) {
    downloader.dirHandleCheck();

    const id = btn.dataset.id!;
    const mediaMeta = await danbooruParser.parse(id, { type: 'api' });

    const downloadConfigs = new DanbooruDownloadConfig(mediaMeta).getDownloadConfig(btn);

    this.config.get('addBookmark') && addBookmark(id);

    await downloader.download(downloadConfigs);

    const { tags, artist, title, comment } = mediaMeta;
    historyDb.add({
      pid: Number(id),
      user: artist,
      title,
      comment,
      tags
    });
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
            name: t('downloader.category.filter.image'),
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
            name: t('downloader.category.filter.video'),
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
            filterWhenGenerateIngPage: false,
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
            filterWhenGenerateIngPage: false,
            fn: (pageRange) => {
              const groupId = /(?<=\/favorite_groups\/)[0-9]+/.exec(location.pathname)?.[0];
              if (!groupId) throw new Error('Invalid pool id');
              return danbooruParser.poolAndGroupGenerator(pageRange, groupId, 'favoriteGroup');
            }
          }
        },
        {
          name: 'post_list',
          match: /\/posts(?!\/[0-9]+)/,
          genPageId: {
            id: 'post_list',
            name: 'Post',
            filterWhenGenerateIngPage: true,
            fn: (pageRange, checkValidity) => {
              const searchParam = new URLSearchParams(new URL(location.href).search);
              const tags = searchParam.get('tags')?.split(' ');
              const limit = searchParam.get('limit');
              const limitParam = limit ? Number(limit) : undefined;

              return danbooruParser.postListGenerator(pageRange, checkValidity, tags, limitParam);
            }
          }
        },
        {
          name: 'pool_button',
          match: /(?<=\/pools\/)[0-9]+/,
          genPageId: {
            id: 'pool_button',
            name: 'Pool',
            filterWhenGenerateIngPage: false,
            fn: (pageRange, poolId: string) => {
              if (!poolId) throw new Error('Invalid pool id');
              return danbooruParser.poolAndGroupGenerator(pageRange, poolId, 'pool');
            }
          }
        },
        {
          name: 'pool_gallery',
          match: /\/pools\/gallery/,
          genPageId: null
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
