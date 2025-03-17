import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { SiteInject } from '../base';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import type { ConfigData } from '@/lib/config';
import { DanbooruPoolButton } from '@/lib/components/Danbooru/danbooruPoolButton';
import { E621ngApi, type E621FullCurrentUser, type E621Post } from './api';
import { downloader } from '@/lib/downloader';
import { E621ngParser, type E621ngMeta } from './parser';
import { historyDb } from '@/lib/db';
import { logger } from '@/lib/logger';
import { unsafeWindow } from '$';
import t from '@/lib/lang';
import { PostValidState } from '../base/parser';
import { BooruDownloadConfig, type TemplateData } from '../base/downloadConfig';

export class E621ng extends SiteInject {
  static get hostname(): string[] {
    return ['e621.net', 'e926.net', 'e6ai.net'];
  }

  protected api: E621ngApi;
  protected parser: E621ngParser;
  protected profile: E621FullCurrentUser | null;

  constructor() {
    super();

    const { username, apiKey } = this.config.get('auth')!;

    this.api = new E621ngApi({
      rateLimit: 2,
      authorization: [username, apiKey]
    });

    this.parser = new E621ngParser();

    this.profile = null;

    this.config.subscribe((configData) => {
      const { username, apiKey } = configData.auth!;
      this.api.updateAuthIfNeeded(username, apiKey);
    });
  }

  protected getSupportedTemplate(): Partial<TemplateData> {
    return BooruDownloadConfig.supportedTemplate;
  }

  protected getCustomConfig(): Partial<ConfigData> | void {
    return {
      folderPattern: 'e621/{artist}',
      filenamePattern: '{id}_{artist}_{character}',
      auth: {
        username: '',
        apiKey: ''
      }
    };
  }

  #notice(msg: string) {
    (unsafeWindow as any).Danbooru.Utility.notice(msg);
  }
  #noticeError(msg: string) {
    (unsafeWindow as any).Danbooru.Utility.error(msg);
  }

  #isPoolGallery() {
    return location.pathname === '/pools/gallery';
  }

  #isPoolView() {
    return /\/pools\/[0-9]+/.test(location.pathname);
  }

  #isPostView() {
    return /\/posts\/[0-9]+/.test(location.pathname);
  }

  #isFavoritesPage() {
    return location.pathname === '/favorites';
  }

  #isPostsPage() {
    return location.pathname === '/posts';
  }

  #isAuthorized() {
    const auth = this.config.get('auth');
    return auth && auth.username && auth.apiKey;
  }

  #throwIfNotAuthorized() {
    if (!this.#isAuthorized()) {
      const msg = 'Please input your username and apiKey in setting.';
      this.#noticeError(msg);
      throw new Error(msg);
    }
  }

  #validityCallbackFactory(
    checkValidity: (meta: Partial<E621ngMeta>) => Promise<boolean>
  ): (data: E621Post) => Promise<PostValidState> {
    return async (data) => {
      const { id, file, tags: fullTags } = data;
      const tags: string[] = [];

      for (const tagArr of Object.values(fullTags)) {
        tagArr.forEach((tag) => {
          tags.push(tag);
        });
      }

      return (await checkValidity({
        id: String(id),
        extendName: file.ext,
        tags
      }))
        ? PostValidState.VALID
        : PostValidState.INVALID;
    };
  }

  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as E621ngMeta,

    avatar: '/packs/static/main-logo-2653c015c5870ec4ff08.svg',

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
              // https://e621.net/help/supported_filetypes
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

      enableTagFilter: true
    },

    pageOption: {
      pool: {
        name: 'Pool',
        match: () => this.#isPoolView(),
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const poolId = /(?<=\/pools\/)[0-9]+/.exec(location.pathname)?.[0];
          if (!poolId) throw new Error('Invalid pool id');

          const postsPerPage = this.profile!.per_page;

          const getPostsMetaByPage = async (page: number) => {
            const data = (
              await this.api.getPosts({
                limit: postsPerPage,
                page,
                tags: `pool:${poolId}`
              })
            ).posts;

            return {
              lastPage: data.length < postsPerPage,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostsMetaByPage,
            (data) => this.parser.buildMeta(data),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      post_list: {
        name: 'Posts',
        match: () => this.#isPostsPage(),
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const searchParam = new URLSearchParams(new URL(location.href).search);
          const tags = searchParam.get('tags') || '';
          const limit = +(searchParam.get('limit') || this.profile!.per_page);

          const getPostsMetaByPage = async (page: number) => {
            const data = (
              await this.api.getPosts({
                limit: limit,
                page,
                tags
              })
            ).posts;

            return {
              lastPage: data.length < limit,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostsMetaByPage,
            (data) => this.parser.buildMeta(data),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      favorites: {
        name: 'Favorites',
        match: () => this.#isFavoritesPage(),
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const searchParam = new URLSearchParams(new URL(location.href).search);
          const limit = +(searchParam.get('limit') || this.profile!.per_page);
          const userId = +(searchParam.get('user_id') || this.profile!.id);
          if (!userId) throw new Error('Cannot get user id.');

          const getPostsMetaByPage = async (page: number) => {
            const data = (
              await this.api.getFavorites({
                limit,
                page,
                user_id: userId
              })
            ).posts;

            return {
              lastPage: data.length < limit,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostsMetaByPage,
            (data) => this.parser.buildMeta(data),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      pool_gallery_button: {
        name: 'pool_gallery_button',
        match: () => false,
        filterInGenerator: true,
        fn: (pageRange, checkValidity, poolId: string) => {
          if (!poolId) throw new Error('Invalid pool id');

          const getPostsMetaByPage = async (page: number) => {
            const limit = this.profile!.per_page;
            const data = (
              await this.api.getPosts({
                limit,
                page,
                tags: `pool:${poolId}`
              })
            ).posts;

            return {
              lastPage: data.length < limit,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostsMetaByPage,
            (data) => this.parser.buildMeta(data),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      show_downloader_in_pool_gallery: {
        name: 'pool_gallery',
        match: /\/pools\/gallery/
      }
    },

    parseMetaByArtworkId: async (id) => {
      const { post } = await this.api.getPost(+id);
      return this.parser.buildMeta(post);
    },

    downloadArtworkByMeta: async (meta, signal) => {
      downloader.dirHandleCheck();

      const downloadConfig = new BooruDownloadConfig(meta).create({
        folderTemplate: this.config.get('folderPattern'),
        filenameTemplate: this.config.get('filenamePattern')
      });

      await downloader.download(downloadConfig, { priority: 1, signal });

      const { tags, artist, title, comment, source, rating } = meta;
      historyDb.add({
        pid: Number(meta.id),
        user: artist,
        title,
        comment,
        tags,
        source,
        rating
      });
    },

    beforeDownload: async () => {
      this.#throwIfNotAuthorized();

      const userId = this.parser.parseCurrentUserId();
      if (!userId) throw new Error('Cannot get user id.');
      this.profile = await this.api.getCurrentUserProfile(+userId);
    },

    afterDownload: () => {
      this.profile = null;
    }
  });

  async #addFavorites(id: number) {
    const csrfToken = this.parser.parseCsrfToken();
    if (!csrfToken) throw new Error('Cannot parse csrf-token.');

    try {
      this.#notice(`Updating posts: ${id}`);
      await this.api.addFavorites(id, csrfToken);
      this.#notice(`Favorite added: ${id}`);
    } catch (error) {
      this.#noticeError(`Failed to add favorite: ${id}. Reason: ${error}`);
      logger.error(error);
    }
  }

  protected async downloadArtwork(btn: ThumbnailButton) {
    this.#throwIfNotAuthorized();

    downloader.dirHandleCheck();
    const id = +btn.dataset.id!;

    const { post } = await this.api.getPost(id);
    const mediaMeta = this.parser.buildMeta(post);
    const downloadConfig = new BooruDownloadConfig(mediaMeta).create({
      folderTemplate: this.config.get('folderPattern'),
      filenameTemplate: this.config.get('filenamePattern'),
      setProgress: (progress: number) => {
        btn.setProgress(progress);
      }
    });

    if (this.config.get('addBookmark') && !post.is_favorited) {
      this.#addFavorites(id);
    }

    await downloader.download(downloadConfig, { priority: 1 });

    const { tags, artist, title, comment, source, rating } = mediaMeta;

    historyDb.add({
      pid: id,
      user: artist,
      title,
      comment,
      tags,
      source,
      rating
    });
  }

  protected createArtworkBtn() {
    // blacklist can be diabled by 'Disable All Filters' button, so always append download button for post.
    const btnContainer = document.querySelector<HTMLElement>('#image-container');
    if (!btnContainer) return;

    btnContainer.style.width = 'fit-content';
    btnContainer.style.position = 'relative';

    const id = btnContainer.dataset.id as string;

    btnContainer.appendChild(
      new ArtworkButton({
        id,
        site: btnContainer.querySelector('video') ? 'native_video' : undefined,
        onClick: this.downloadArtwork
      })
    );
  }

  protected createPoolThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>('article.thumbnail > a');
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      const poolId = /(?<=\/pools\/)[0-9]+/.exec(el.href)?.[0];
      if (!poolId) return;

      const { downloading, batchDownload } = this.useBatchDownload();
      const onClick = (btn: ThumbnailButton) => {
        const poolId = btn.dataset.id!;
        return batchDownload('pool_gallery_button', poolId);
      };

      const btn = new DanbooruPoolButton({ id: poolId, downloading, onClick });

      el.style.position = 'relative';
      el.appendChild(btn);
    });
  }

  protected createThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>('article.thumbnail > a');
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      const id = /(?<=\/posts\/)[0-9]+/.exec(el.href)?.[0];
      if (!id) return;

      el.style.position = 'relative';

      const btn = new ThumbnailButton({
        id,
        onClick: this.downloadArtwork
      });

      el.appendChild(btn);
    });
  }

  public inject(): void {
    super.inject();

    this.downloadArtwork = this.downloadArtwork.bind(this);

    if (this.#isPostView()) {
      this.createArtworkBtn();
    } else if (this.#isPoolGallery()) {
      this.createPoolThumbnailBtn();
    } else {
      this.createThumbnailBtn();
    }
  }
}
