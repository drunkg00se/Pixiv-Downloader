import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { SiteInject } from '../base';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import type { ConfigData } from '@/lib/config';
import { DanbooruPoolButton } from '@/lib/components/Danbooru/danbooruPoolButton';
import { E621ngApi, type E621FullCurrentUser, type E621Post } from './api';
import { downloader } from '@/lib/downloader';
import { E621ngParser, type E621ngMeta } from './parser';
import { E621ngMetaDownloadConfig } from './downloadConfigBuilder';
import { historyDb } from '@/lib/db';
import { logger } from '@/lib/logger';
import { unsafeWindow } from '$';
import t from '@/lib/lang';

export class E621ng extends SiteInject {
  static get hostname(): string[] {
    return ['e621.net', 'e926.net'];
  }

  protected api = new E621ngApi({
    rateLimit: 2,
    authorization: ['', '']
  });

  protected parser = new E621ngParser();

  protected profile: E621FullCurrentUser | null = null;

  protected getCustomConfig(): Partial<ConfigData> | void {
    return {
      folderPattern: 'e621/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  protected getFilenameTemplate(): string[] {
    return ['{artist}', '{character}', '{id}', '{date}'];
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
        // {
        //   id: 'exclude_blacklist',
        //   type: 'exclude',
        //   name: t('downloader.category.filter.exclude_blacklist'),
        //   checked: true,
        //   fn: async (meta) => {
        //     return (
        //       !!meta.matchTags &&
        //       danbooruParser.isBlacklisted(
        //         meta.matchTags,
        //         (this.blacklist ??= await danbooruParser.parseBlacklist('api'))
        //       )
        //     );
        //   }
        // },
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

          const getPostsMetaByPage = async (page: number): Promise<E621Post[]> => {
            return (
              await this.api.getPosts({
                limit: this.profile!.per_page,
                page,
                tags: `pool:${poolId}`
              })
            ).posts;
          };

          const isPostValid = async (data: E621Post): Promise<boolean> => {
            const { id, file, tags: fullTags } = data;
            const tags: string[] = [];

            for (const tagArr of Object.values(fullTags)) {
              tagArr.forEach((tag) => {
                tags.push(tag);
              });
            }

            return await checkValidity({
              id: String(id),
              extendName: file.ext,
              tags
            });
          };

          return this.parser.paginationMetaGenerator(
            pageRange,
            this.profile!.per_page,
            getPostsMetaByPage,
            isPostValid,
            (data) => this.parser.buildMeta(data)
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
          const limit = searchParam.get('limit') || this.profile!.per_page;

          const getPostsMetaByPage = async (page: number): Promise<E621Post[]> => {
            return (
              await this.api.getPosts({
                limit: +limit,
                page,
                tags
              })
            ).posts;
          };

          const isPostValid = async (data: E621Post): Promise<boolean> => {
            const { id, file, tags: fullTags } = data;
            const tags: string[] = [];

            for (const tagArr of Object.values(fullTags)) {
              tagArr.forEach((tag) => {
                tags.push(tag);
              });
            }

            return await checkValidity({
              id: String(id),
              extendName: file.ext,
              tags
            });
          };

          return this.parser.paginationMetaGenerator(
            pageRange,
            this.profile!.per_page,
            getPostsMetaByPage,
            isPostValid,
            (data) => this.parser.buildMeta(data)
          );
        }
      },

      favorites: {
        name: 'Favorites',
        match: () => this.#isFavoritesPage(),
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          const searchParam = new URLSearchParams(new URL(location.href).search);
          const limit = searchParam.get('limit') || this.profile!.per_page;
          const userId = searchParam.get('user_id') || this.profile!.id;
          if (!userId) throw new Error('Cannot get user id.');

          const getPostsMetaByPage = async (page: number): Promise<E621Post[]> => {
            return (
              await this.api.getFavorites({
                limit: +limit,
                page,
                user_id: +userId
              })
            ).posts;
          };

          const isPostValid = async (data: E621Post): Promise<boolean> => {
            const { id, file, tags: fullTags } = data;
            const tags: string[] = [];

            for (const tagArr of Object.values(fullTags)) {
              tagArr.forEach((tag) => {
                tags.push(tag);
              });
            }

            return await checkValidity({
              id: String(id),
              extendName: file.ext,
              tags
            });
          };

          return this.parser.paginationMetaGenerator(
            pageRange,
            this.profile!.per_page,
            getPostsMetaByPage,
            isPostValid,
            (data) => this.parser.buildMeta(data)
          );
        }
      },

      pool_gallery_button: {
        name: 'pool_gallery_button',
        match: () => false,
        filterInGenerator: true,
        fn: (pageRange, checkValidity, poolId: string) => {
          if (!poolId) throw new Error('Invalid pool id');

          const getPostsMetaByPage = async (page: number): Promise<E621Post[]> => {
            return (
              await this.api.getPosts({
                limit: this.profile!.per_page,
                page,
                tags: `pool:${poolId}`
              })
            ).posts;
          };

          const isPostValid = async (data: E621Post): Promise<boolean> => {
            const { id, file, tags: fullTags } = data;
            const tags: string[] = [];

            for (const tagArr of Object.values(fullTags)) {
              tagArr.forEach((tag) => {
                tags.push(tag);
              });
            }

            return await checkValidity({
              id: String(id),
              extendName: file.ext,
              tags
            });
          };

          return this.parser.paginationMetaGenerator(
            pageRange,
            this.profile!.per_page,
            getPostsMetaByPage,
            isPostValid,
            (data) => this.parser.buildMeta(data)
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

    async downloadArtworkByMeta(meta, signal) {
      downloader.dirHandleCheck();

      const downloadConfigs = new E621ngMetaDownloadConfig(meta).getDownloadConfig();

      await downloader.download(downloadConfigs, { priority: 1, signal });

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
      const userId = this.parser.parseCurrentUserId();
      if (!userId) throw new Error('Cannot get user id.');
      this.profile = await this.api.getCurrentUserProfile(+userId);
      // this.blacklist = await danbooruParser.parseBlacklist(
      //   'profile',
      //   this.profile.blacklisted_tags ?? ''
      // );
    },

    afterDownload: () => {
      this.profile = null;
      // this.blacklist = null;
    }
  });

  async #addFavorites(id: number) {
    const csrfToken = this.parser.parseCsrfToken();
    if (!csrfToken) throw new Error('Cannot parse csrf-token.');

    const noticeFn: (msg: string, permanent?: boolean) => void = (unsafeWindow as any).Danbooru
      .Utility.notice;
    const noticeErr: (msg: string) => void = (unsafeWindow as any).Danbooru.Utility.notice;

    try {
      noticeFn(`Updating posts: ${id}`);
      await this.api.addFavorites(id, csrfToken);
      noticeFn(`Favorite added: ${id}`);
    } catch (error) {
      noticeErr(`Failed to add favorite: ${id}. Reason: ${error}`);
      logger.error(error);
    }
  }

  protected async downloadArtwork(btn: ThumbnailButton) {
    downloader.dirHandleCheck();
    const id = +btn.dataset.id!;

    const { post } = await this.api.getPost(id);
    const mediaMeta = this.parser.buildMeta(post);
    const downloadConfigs = new E621ngMetaDownloadConfig(mediaMeta).getDownloadConfig(btn);

    if (this.config.get('addBookmark') && !post.is_favorited) {
      this.#addFavorites(id);
    }

    await downloader.download(downloadConfigs, { priority: 1 });

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
