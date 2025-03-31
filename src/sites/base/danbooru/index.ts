import { SiteInject } from '../../base';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { DanbooruParser, type DanbooruBlacklistItem, type DanbooruMeta } from './parser';
import { historyDb } from '@/lib/db';
import { downloader } from '@/lib/downloader';
import { DanbooruPoolButton } from '@/lib/components/Danbooru/danbooruPoolButton';
import type { DanbooruArtistCommentary, DanbooruPost, DanbooruUserProfile } from './types';
import { DanbooruApi } from './api';
import { JsonDataError } from '@/lib/error';
import { unsafeWindow } from '$';
import { evalScript } from '@/lib/util';
import { logger } from '@/lib/logger';
import { PostValidState } from '../parser';
import { BooruDownloadConfig, type TemplateData } from '../downloadConfig';
import { t } from '@/lib/i18n.svelte';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { siteFeature } from '@/lib/store/siteFeature.svelte';

export abstract class AbstractDanbooru extends SiteInject {
  protected abstract api: DanbooruApi;
  protected abstract parser: DanbooruParser;

  protected profile: DanbooruUserProfile | null = null;
  protected blacklist: DanbooruBlacklistItem[] | null = null;

  constructor() {
    siteFeature.patch((state) => {
      state.addBookmark ??= false;
    });
    super();
  }

  protected abstract getAvatar(): string;

  protected getSupportedTemplate(): Partial<TemplateData> {
    return BooruDownloadConfig.supportedTemplate;
  }

  protected async getPostAndComment(id: string) {
    const [postResult, commentResult] = await Promise.allSettled([
      this.api.getPost(id),
      this.api.getArtistCommentary(id)
    ]);

    if (postResult.status === 'rejected') throw postResult.reason;

    let comment: DanbooruArtistCommentary | undefined = undefined;

    //  post may not have comment.
    if (commentResult.status === 'rejected') {
      if (!(commentResult.reason instanceof JsonDataError)) {
        throw commentResult.reason;
      }
    } else {
      comment = commentResult.value;
    }

    return { post: postResult.value, comment };
  }

  protected async getMetaByPostId(id: string) {
    const { post, comment: commentary } = await this.getPostAndComment(id);
    return this.parser.buildMetaByApi(post, commentary);
  }

  #validityCheckFactory(
    checkValidity: (meta: Partial<DanbooruMeta>) => Promise<boolean>,
    showDeletedPosts = true // deleted post will still be shown in pool.
  ): (postData: DanbooruPost) => Promise<PostValidState> {
    return async (post) => {
      const { id, is_deleted, file_ext, file_url, tag_string } = post;

      if (!file_url) return PostValidState.UNAVAILABLE;
      if (is_deleted && !showDeletedPosts) return PostValidState.INVALID;

      const blacklistValidationTags = this.parser.getBlacklistValidationTags(post);

      return (await checkValidity({
        id: String(id),
        extendName: file_ext,
        tags: tag_string.split(' '),
        blacklistValidationTags
      }))
        ? PostValidState.VALID
        : PostValidState.INVALID;
    };
  }

  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as DanbooruMeta,

    avatar: () => this.getAvatar(),

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
          id: 'exclude_blacklist',
          type: 'exclude',
          name: () => t('downloader.category.filter.exclude_blacklist'),
          checked: true,
          fn: async (meta) => {
            return (
              !!meta.blacklistValidationTags &&
              this.parser.isBlacklisted(meta.blacklistValidationTags, this.blacklist!)
            );
          }
        },
        {
          id: 'allow_image',
          type: 'include',
          name: () => t('downloader.category.filter.image'),
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
          name: () => t('downloader.category.filter.video'),
          checked: true,
          fn(meta) {
            return (
              !!meta.extendName &&
              /mp4|avi|mov|mkv|flv|wmv|webm|mpeg|mpg|m4v/i.test(meta.extendName)
            );
          }
        }
      ],

      enableTagFilter: true
    },

    pageOption: {
      pool: {
        name: 'Pool',
        match: /(?<=\/pools\/)[0-9]+/,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const poolId = /(?<=\/pools\/)[0-9]+/.exec(location.pathname)?.[0];
          if (!poolId) throw new Error('Invalid pool id');

          const perPage = this.profile!.per_page;

          const getPostDataByPage = async (page: number) => {
            const data = await this.api.getPostList({
              tags: [`ordpool:${poolId}`],
              limit: perPage,
              page
            });

            return {
              lastPage: data.length < perPage,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostDataByPage,
            (post) => String(post.id),
            this.#validityCheckFactory(checkValidity)
          );
        }
      },

      favorite_groups: {
        name: 'FavoriteGroups',
        match: /(?<=\/favorite_groups\/)[0-9]+/,
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const groupId = /(?<=\/favorite_groups\/)[0-9]+/.exec(location.pathname)?.[0];
          if (!groupId) throw new Error('Invalid pool id');

          const perPage = this.profile!.per_page;

          const getPostDataByPage = async (page: number) => {
            const data = await this.api.getPostList({
              tags: [`ordfavgroup:${groupId}`],
              limit: perPage,
              page
            });

            return {
              lastPage: data.length < perPage,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostDataByPage,
            (post) => String(post.id),
            this.#validityCheckFactory(checkValidity)
          );
        }
      },

      post_list: {
        name: 'Post',
        match: () => location.pathname === '/' || location.pathname === '/posts',
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const perPage = this.profile!.per_page;

          const searchParam = new URLSearchParams(location.search);
          const tags = searchParam.get('tags')?.split(' ') ?? [];
          const limit = searchParam.get('limit');
          const limitParam = limit ? Number(limit) : perPage;

          const getPostDataByPage = async (page: number) => {
            const data = await this.api.getPostList({
              tags,
              limit: limitParam,
              page
            });

            return {
              lastPage: data.length < limitParam,
              data
            };
          };

          const showDeletedPosts =
            tags?.includes('status:deleted') || this.profile!.show_deleted_posts;

          return this.parser.paginationGenerator(
            pageRange,
            getPostDataByPage,
            (post) => String(post.id),
            this.#validityCheckFactory(checkValidity, showDeletedPosts)
          );
        }
      },

      pool_gallery_button: {
        name: 'pool_gallery_button',
        match: () => false,
        filterInGenerator: true,
        fn: (pageRange, checkValidity, poolId: string) => {
          if (!poolId) throw new Error('Invalid pool id');

          const perPage = this.profile!.per_page;

          const getPostDataByPage = async (page: number) => {
            const data = await this.api.getPostList({
              tags: [`ordpool:${poolId}`],
              limit: perPage,
              page
            });

            return {
              lastPage: data.length < perPage,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostDataByPage,
            (post) => String(post.id),
            this.#validityCheckFactory(checkValidity)
          );
        }
      },

      show_downloader_in_pool_gallery: {
        name: 'pool_gallery',
        match: /\/pools\/gallery/
      }
    },

    parseMetaByArtworkId: async (id) => {
      return this.getMetaByPostId(id);
    },

    downloadArtworkByMeta: async (meta, signal) => {
      this.getFileHandleIfNeeded();

      const downloadConfig = new BooruDownloadConfig(meta).create({
        ...downloadSetting.current
      });

      await downloader.download(downloadConfig, { signal });

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
      this.profile = await this.api.getProfile();

      const blacklistTags = this.profile.blacklisted_tags;
      this.blacklist = blacklistTags ? this.parser.getBlacklistItem(blacklistTags) : null;
    },

    afterDownload: () => {
      this.profile = null;
      this.blacklist = null;
    }
  });

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

  protected async addBookmark(id: string) {
    try {
      const token = this.parser.parseCsrfToken();
      if (!token) throw new Error('Can not get csrf-token');

      const script = await this.api.addFavorite(id, token);

      const galleryMatch = /(?<=^\/posts\/)\d+/.exec(location.pathname);

      // 在画廊页下载其它作品时，只显示提示
      if (galleryMatch && id !== galleryMatch[0]) {
        (unsafeWindow as any).Danbooru.Utility.notice('You have favorited ' + id);
      } else {
        evalScript(script);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  protected async downloadArtwork(btn: ThumbnailButton) {
    this.getFileHandleIfNeeded();

    const id = btn.dataset.id!;
    const mediaMeta = await this.getMetaByPostId(id);

    const downloadConfig = new BooruDownloadConfig(mediaMeta).create({
      ...downloadSetting.current,
      setProgress: (progress: number) => {
        btn.setProgress(progress);
      }
    });

    siteFeature.current.addBookmark && this.addBookmark(id);

    await downloader.download(downloadConfig, { priority: 1 });

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

  protected createArtworkBtn() {
    const btnContainer = document.querySelector<HTMLElement>(
      'section.image-container:has(:is(picture, video))'
    );
    if (!btnContainer) return;

    const id = btnContainer.getAttribute('data-id')!;
    btnContainer.appendChild(
      new ArtworkButton({
        id,
        site: btnContainer.querySelector('video') ? 'native_video' : undefined,
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

  public inject(): void {
    super.inject();

    this.downloadArtwork = this.downloadArtwork.bind(this);

    const path = location.pathname;
    if (/^\/posts\/\d+/.test(path)) {
      this.createArtworkBtn();
      this.createThumbnailBtn();
    } else if (/^\/pools\/gallery/.test(path)) {
      this.createPoolThumbnailBtn();
    } else {
      this.createThumbnailBtn();
    }
  }
}
