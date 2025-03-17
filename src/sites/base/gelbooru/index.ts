import { SiteInject } from '../../base';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { GelbooruParserV020, type GelbooruHtmlPostDataV020, type GelbooruMeta } from './parser';
import { downloader } from '@/lib/downloader';
import { historyDb } from '@/lib/db';
import t from '@/lib/lang';
import type { GelbooruApiV020 } from './api';
import { unsafeWindow } from '$';
import { PostValidState } from '../parser';
import { BooruDownloadConfig, type TemplateData } from '../downloadConfig';

export abstract class GelbooruV020 extends SiteInject {
  protected abstract api: GelbooruApiV020;
  protected abstract parser: GelbooruParserV020;

  protected abstract getThumbnailSelector(): string;

  protected searchParams = new URLSearchParams(location.search);

  protected getSupportedTemplate(): Partial<TemplateData> {
    return BooruDownloadConfig.supportedTemplate;
  }

  protected getAvatar() {
    return '/favicon.ico';
  }

  #validityCheckFactory(
    checkValidity: (meta: Partial<GelbooruMeta>) => Promise<boolean>
  ): (postData: GelbooruHtmlPostDataV020) => Promise<PostValidState> {
    return async (post) => {
      const { id, tags } = post;
      return (await checkValidity({ id, tags })) ? PostValidState.VALID : PostValidState.INVALID;
    };
  }

  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as GelbooruMeta,

    avatar: this.getAvatar.bind(this),

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
            return !!meta.tags && !meta.tags.includes('video');
          }
        },
        // Safebooru doesn't really have videos, although it has about 73 GIFs tagged with 'video'
        {
          id: 'allow_video',
          type: 'include',
          name: t('downloader.category.filter.video'),
          checked: true,
          fn(meta) {
            return !!meta.tags && meta.tags.includes('video');
          }
        }
      ],

      enableTagFilter: true
    },

    pageOption: {
      favorites: {
        name: 'Favorites',
        match: /(?=.*page=favorites)(?=.*s=view)(?=.*id=[0-9]+)/,
        filterInGenerator: true,
        fn: (pageRange, checkValidity, userId?: string) => {
          userId ??= /(?<=id=)[0-9]+/.exec(location.search)![0];

          const getFavoriteByPage = async (page: number) => {
            const THUMBS_PER_PAGE = 50;
            const pid = (page - 1) * THUMBS_PER_PAGE;
            const doc = await this.api.getFavoriteDoc(userId, pid);
            const data = this.parser.parseFavoriteByDoc(doc);

            return {
              lastPage: data.length < THUMBS_PER_PAGE,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getFavoriteByPage,
            (post) => post.id,
            this.#validityCheckFactory(checkValidity)
          );
        }
      },

      pools: {
        name: 'Pools',
        match: /(?=.*page=pool)(?=.*s=show)(?=.*id=[0-9]+)/,
        filterInGenerator: true,
        fn: (_, checkValidity, poolId?: string) => {
          poolId ??= /(?<=id=)[0-9]+/.exec(location.search)![0];

          const getPoolData = async () => {
            const doc = await this.api.getPoolDoc(poolId);
            return {
              lastPage: true,
              data: this.parser.parsePostsByDoc(doc)
            };
          };

          return this.parser.paginationGenerator(
            [1, 1],
            getPoolData,
            (post) => post.id,
            this.#validityCheckFactory(checkValidity)
          );
        }
      },

      posts: {
        name: 'Posts',
        match: /(?=.*page=post)(?=.*s=list)/,
        filterInGenerator: true,
        fn: (pageRange, checkValidity, tags?: string | string[]) => {
          tags ??= new URLSearchParams(location.search).get('tags') ?? 'all';

          const getPostsByPage = async (page: number) => {
            const THUMBS_PER_PAGE = 42;
            const pid = (page - 1) * THUMBS_PER_PAGE;
            const doc = await this.api.getPostsDoc(pid, tags);
            const data = this.parser.parsePostsByDoc(doc);

            return {
              lastPage: data.length < THUMBS_PER_PAGE,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostsByPage,
            (post) => post.id,
            this.#validityCheckFactory(checkValidity)
          );
        }
      }
    },

    parseMetaByArtworkId: async (id) => {
      const doc = await this.api.getPostDoc(id);
      return this.parser.buildMeta(id, doc);
    },

    downloadArtworkByMeta: async (meta, signal) => {
      downloader.dirHandleCheck();

      const downloadConfigs = new BooruDownloadConfig(meta).create({
        folderTemplate: this.config.get('folderPattern'),
        filenameTemplate: this.config.get('filenamePattern'),
        cfClearance: this.config.get('auth')?.cf_clearance
      });

      await downloader.download(downloadConfigs, { signal });

      const { id, tags, artist, title, source, rating } = meta;
      historyDb.add({
        pid: Number(id),
        user: artist,
        title,
        tags,
        source,
        rating
      });
    }
  });

  #addBookmark(id: string) {
    (unsafeWindow as any).addFav(id);
  }

  protected async downloadArtwork(btn: ThumbnailButton) {
    downloader.dirHandleCheck();

    const id = btn.dataset.id!;

    const doc = await this.api.getPostDoc(id);
    const mediaMeta = this.parser.buildMeta(id, doc);
    const downloadConfig = new BooruDownloadConfig(mediaMeta).create({
      folderTemplate: this.config.get('folderPattern'),
      filenameTemplate: this.config.get('filenamePattern'),
      cfClearance: this.config.get('auth')?.cf_clearance,
      setProgress: (progress: number) => {
        btn.setProgress(progress);
      }
    });

    // TODO: check if post is already favorited.
    this.config.get('addBookmark') && this.#addBookmark(id);

    await downloader.download(downloadConfig, { priority: 1 });

    const { tags, artist, title, source, rating } = mediaMeta;
    historyDb.add({
      pid: Number(id),
      user: artist,
      title,
      tags,
      source,
      rating
    });
  }

  protected setThumbnailStyle(btnContainer: HTMLAnchorElement) {
    btnContainer.style.position = 'relative';
  }

  protected createThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>(this.getThumbnailSelector());
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      this.setThumbnailStyle(el);

      const idMathch = /(?<=&id=)\d+/.exec(el.href);
      if (!idMathch) return;

      const id = idMathch[0];
      el.appendChild(
        new ThumbnailButton({
          id,
          onClick: this.downloadArtwork.bind(this)
        })
      );
    });
  }

  protected createArtworkBtn(id: string) {
    const btnContainer = document.querySelector<HTMLDivElement>('div.flexi > div')!;
    btnContainer.style.position = 'relative';

    btnContainer.appendChild(
      new ArtworkButton({
        id,
        site: 'gelbooru',
        onClick: this.downloadArtwork.bind(this)
      })
    );
  }

  protected isPostsList() {
    return this.searchParams.get('page') === 'post' && this.searchParams.get('s') === 'list';
  }

  protected isPostView() {
    return this.searchParams.get('page') === 'post' && this.searchParams.get('s') === 'view';
  }

  protected isPool() {
    return this.searchParams.get('page') === 'pool' && this.searchParams.get('s') === 'show';
  }

  protected isMyfavorites() {
    return this.searchParams.get('page') === 'favorites' && this.searchParams.get('s') === 'view';
  }

  protected isAccountProfile() {
    return this.searchParams.get('page') === 'account' && this.searchParams.get('s') === 'profile';
  }

  public inject() {
    super.inject();

    if (this.searchParams.size === 0) return;

    if (this.isPostView()) {
      // 检查artwork是否被删除
      if (!document.querySelector('#image, #gelcomVideoPlayer')) return;

      const id = this.searchParams.get('id')!;
      this.createArtworkBtn(id);
    } else {
      this.createThumbnailBtn();
    }
  }
}
