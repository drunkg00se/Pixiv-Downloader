import { SiteInject } from '../base';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { danbooruParser, type DanbooruBlacklistItem, type DanbooruMeta } from './parser';
import t from '@/lib/lang';
import { historyDb } from '@/lib/db';
import { DanbooruDownloadConfig } from './downloadConfigBuilder';
import { downloader } from '@/lib/downloader';
import { DanbooruPoolButton } from '@/lib/components/Danbooru/danbooruPoolButton';
import { addBookmark } from './addBookmark';
import type { DanbooruUserProfile } from './types';
import { danbooruApi } from './api';

export class Danbooru extends SiteInject {
  protected profile: DanbooruUserProfile | null = null;
  protected blacklist: DanbooruBlacklistItem[] | null = null;

  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as DanbooruMeta,

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
          id: 'exclude_blacklist',
          type: 'exclude',
          name: t('downloader.category.filter.exclude_blacklist'),
          checked: true,
          fn: async (meta) => {
            return (
              !!meta.matchTags &&
              danbooruParser.isBlacklisted(
                meta.matchTags,
                (this.blacklist ??= await danbooruParser.parseBlacklist('api'))
              )
            );
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

      enableTagFilter: (userTags: string[], metaTags: string[]) => {
        const pureTags = metaTags.map((typedTag) => /(?<=[a-z]+:).+/.exec(typedTag)?.[0] ?? '');
        return userTags.some((tag) => pureTags.includes(tag));
      }
    },

    pageOption: {
      pool: {
        name: 'Pool',
        match: /(?<=\/pools\/)[0-9]+/,
        filterInGenerator: false,
        fn: (pageRange) => {
          const poolId = /(?<=\/pools\/)[0-9]+/.exec(location.pathname)?.[0];
          if (!poolId) throw new Error('Invalid pool id');
          return danbooruParser.poolAndGroupGenerator(
            pageRange,
            poolId,
            'pool',
            this.profile?.per_page
          );
        }
      },

      favorite_groups: {
        name: 'FavoriteGroups',
        match: /(?<=\/favorite_groups\/)[0-9]+/,
        filterInGenerator: false,
        fn: (pageRange) => {
          const groupId = /(?<=\/favorite_groups\/)[0-9]+/.exec(location.pathname)?.[0];
          if (!groupId) throw new Error('Invalid pool id');
          return danbooruParser.poolAndGroupGenerator(
            pageRange,
            groupId,
            'favoriteGroup',
            this.profile?.per_page
          );
        }
      },

      post_list: {
        name: 'Post',
        match: () => location.pathname === '/' || location.pathname === '/posts',
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const searchParam = new URLSearchParams(new URL(location.href).search);
          const tags = searchParam.get('tags')?.split(' ');
          const limit = searchParam.get('limit');
          const limitParam = limit ? Number(limit) : undefined;

          return danbooruParser.postListGenerator(
            pageRange,
            checkValidity,
            tags,
            limitParam,
            this.profile?.show_deleted_posts
          );
        }
      },

      pool_gallery_button: {
        name: 'pool_gallery_button',
        match: () => false,
        filterInGenerator: false,
        fn: (pageRange, poolId: string) => {
          if (!poolId) throw new Error('Invalid pool id');
          return danbooruParser.poolAndGroupGenerator(
            pageRange,
            poolId,
            'pool',
            this.profile?.per_page
          );
        }
      },

      show_downloader_in_pool_gallery: {
        name: 'pool_gallery',
        match: /\/pools\/gallery/
      }
    },

    parseMetaByArtworkId(id) {
      return danbooruParser.parseIdByApi(id);
    },

    async downloadByArtworkId(meta, taskId) {
      downloader.dirHandleCheck();

      const downloadConfigs = new DanbooruDownloadConfig(meta).getDownloadConfig();
      downloadConfigs.taskId = taskId;

      await downloader.download(downloadConfigs);

      const { id, tags, artist, title, comment, source, rating } = meta;
      historyDb.add({
        pid: Number(id),
        user: artist,
        title,
        comment,
        tags,
        source,
        rating
      });
    },

    beforeDownload: async () => {
      this.profile = await danbooruApi.getProfile();
      this.blacklist = await danbooruParser.parseBlacklist(
        'profile',
        this.profile.blacklisted_tags ?? ''
      );
    },

    onDownloadAbort(taskIds) {
      downloader.abort(taskIds);
    },

    afterDownload: () => {
      this.profile = null;
      this.blacklist = null;
    }
  });

  static get hostname(): string {
    return 'danbooru.donmai.us';
  }

  public inject(): void {
    super.inject();

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

    const { downloading, batchDownload } = this.useBatchDownload();
    const onClick = (btn: ThumbnailButton) => {
      const poolId = btn.dataset.id!;
      return batchDownload('pool_gallery_button', poolId);
    };

    btnContainers.forEach((el) => {
      const poolId = /(?<=\/pools\/)\d+/.exec(el.href)?.[0];
      if (!poolId) return;

      const btn = new DanbooruPoolButton({ id: poolId, downloading, onClick });

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

    const { tags, artist, title, comment, source, rating } = mediaMeta;
    historyDb.add({
      pid: Number(id),
      user: artist,
      title,
      comment,
      tags,
      source,
      rating
    });
  }
}
