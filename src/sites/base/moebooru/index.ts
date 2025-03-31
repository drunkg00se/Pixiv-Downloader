import { SiteInject } from '../../base';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { MoebooruParser, type MoebooruBlacklistItem, type MoebooruMeta } from './parser';
import { downloader } from '@/lib/downloader';
import { historyDb } from '@/lib/db';
import {
  MoebooruApi,
  type PopularPeriod,
  type PopularPostsParams,
  type PossibleMoebooruPostData
} from './api';
import { logger } from '@/lib/logger';
import { PostValidState } from '../parser';
import { BooruDownloadConfig, type TemplateData } from '../downloadConfig';
import { t } from '@/lib/i18n.svelte';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { siteFeature } from '@/lib/store/siteFeature.svelte';
import { userAuthentication } from '@/lib/store/auth.svelte';

type MoebooruGeneratorPostData = PossibleMoebooruPostData & {
  tagType: Record<string, string>;
};

export abstract class Moebooru extends SiteInject {
  protected abstract parser: MoebooruParser;
  protected abstract api: MoebooruApi;

  protected abstract getBlacklist(): Promise<MoebooruBlacklistItem[]>;

  protected blacklist: MoebooruBlacklistItem[] | null = null;

  constructor() {
    siteFeature.patch((state) => {
      state.addBookmark ??= false;
    });
    super();
  }

  protected getSupportedTemplate(): Partial<TemplateData> {
    return BooruDownloadConfig.supportedTemplate;
  }

  /**
   * register
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L286
   */
  #validityCallbackFactory(
    checkValidity: (meta: Partial<MoebooruMeta>) => Promise<boolean>
  ): (postData: MoebooruGeneratorPostData) => Promise<PostValidState> {
    return async (data) => {
      const tags = data.tags.split(' ');
      tags.push('rating:' + data.rating.charAt(0));
      tags.push('status:' + data.status);
      return (await checkValidity({ id: String(data.id), tags }))
        ? PostValidState.VALID
        : PostValidState.INVALID;
    };
  }

  #buildMetaByGeneratorData(data: MoebooruGeneratorPostData): MoebooruMeta {
    return this.parser.buildMeta(data, data.tagType);
  }

  #getPopularDataFactory(period: PopularPeriod) {
    return async () => {
      const htmlText = await this.api.getPopularHtmlByPeriod(period);
      const { posts, tags: tagType } = this.parser.parsePostsList(htmlText);
      const data = posts.map((post) => ({ ...post, tagType }));

      return {
        lastPage: true,
        data
      };
    };
  }

  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as MoebooruMeta,

    avatar: '/favicon.ico',

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
            if (!meta.tags) return false;
            this.blacklist ??= await this.getBlacklist();
            return this.parser.isBlacklisted(meta.tags, this.blacklist);
          }
        },
        {
          id: 'allow_image',
          type: 'include',
          name: () => t('downloader.category.filter.image'),
          checked: true,
          fn() {
            return true;
          }
        }
      ],

      enableTagFilter: true
    },

    pageOption: {
      posts: {
        name: () => t('downloader.download_type.moebooru_posts'),
        match: () => location.pathname === '/post',
        filterInGenerator: true,
        fn: (pageRange, checkValidity, tags?: string | string[]) => {
          tags ??= new URLSearchParams(location.search).get('tags') ?? '';

          const getPostData = async (page: number) => {
            const POSTS_PER_PAGE = 40;
            const htmlText = await this.api.getPostsHtml(tags, page);
            const { posts, tags: tagType } = this.parser.parsePostsList(htmlText);
            const data = posts.map((post) => ({ ...post, tagType }));

            return {
              lastPage: data.length < POSTS_PER_PAGE,
              data
            };
          };

          return this.parser.paginationGenerator(
            pageRange,
            getPostData,
            this.#buildMetaByGeneratorData.bind(this),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      popular_1d: {
        name: () => t('downloader.download_type.moebooru_popular_1d'),
        match: () => location.pathname === '/post/popular_recent',
        filterInGenerator: true,
        fn: (_, checkValidity) => {
          return this.parser.paginationGenerator(
            [1, 1],
            this.#getPopularDataFactory('1d'),
            this.#buildMetaByGeneratorData.bind(this),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      popular_1w: {
        name: () => t('downloader.download_type.moebooru_popular_1w'),
        match: () => location.pathname === '/post/popular_recent',
        filterInGenerator: true,
        fn: (_, checkValidity) => {
          return this.parser.paginationGenerator(
            [1, 1],
            this.#getPopularDataFactory('1w'),
            this.#buildMetaByGeneratorData.bind(this),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      popular_1m: {
        name: () => t('downloader.download_type.moebooru_popular_1m'),
        match: () => location.pathname === '/post/popular_recent',
        filterInGenerator: true,
        fn: (_, checkValidity) => {
          return this.parser.paginationGenerator(
            [1, 1],
            this.#getPopularDataFactory('1m'),
            this.#buildMetaByGeneratorData.bind(this),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      popular_1y: {
        name: () => t('downloader.download_type.moebooru_popular_1y'),
        match: () => location.pathname === '/post/popular_recent',
        filterInGenerator: true,
        fn: (_, checkValidity) => {
          return this.parser.paginationGenerator(
            [1, 1],
            this.#getPopularDataFactory('1y'),
            this.#buildMetaByGeneratorData.bind(this),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      popular_by_date: {
        name: () => t('downloader.download_type.moebooru_popular_date'),
        match: /\/post\/popular_by_(day|week|month)/,
        filterInGenerator: true,
        fn: (_, checkValidity) => {
          const period = /(?<=popular_by_)day|week|month/.exec(location.pathname)![0] as
            | 'day'
            | 'week'
            | 'month';
          const searchParams = new URLSearchParams(location.search);

          let params: PopularPostsParams;

          if (searchParams.size === 0) {
            params = { period };
          } else {
            params = {
              period,
              month: searchParams.get('month') || undefined,
              year: searchParams.get('year') || undefined
            };

            if (params.period !== 'month') {
              params.day = searchParams.get('day') || undefined;
            }
          }

          const getPopularData = async () => {
            const htmlText = await this.api.getPopularHtmlByDate(params);
            const { posts, tags: tagType } = this.parser.parsePostsList(htmlText);
            const data = posts.map((post) => ({ ...post, tagType }));

            return {
              lastPage: true,
              data
            };
          };

          return this.parser.paginationGenerator(
            [1, 1],
            getPopularData,
            this.#buildMetaByGeneratorData.bind(this),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      },

      pool: {
        name: () => t('downloader.download_type.moebooru_pool'),
        match: /\/pool\/show\//,
        filterInGenerator: true,
        fn: (_, checkValidity, poolId?: string) => {
          poolId ??= /(?<=show\/)[0-9]+/.exec(location.pathname)![0];

          const getPoolData = async () => {
            const htmlText = await this.api.getPoolHtml(poolId);
            const { posts, tags: tagType } = this.parser.parsePostAndPool(htmlText);
            const data = posts.map((post) => ({ ...post, tagType }));

            return {
              lastPage: true,
              data
            };
          };

          return this.parser.paginationGenerator(
            [1, 1],
            getPoolData,
            this.#buildMetaByGeneratorData.bind(this),
            this.#validityCallbackFactory(checkValidity)
          );
        }
      }
    },

    parseMetaByArtworkId: async (id) => {
      const htmlText = await this.api.getPostHtml(id);
      const { posts, tags } = this.parser.parsePostAndPool(htmlText);
      return this.parser.buildMeta(posts[0], tags);
    },

    downloadArtworkByMeta: async (meta, signal) => {
      this.getFileHandleIfNeeded();

      const downloadConfig = new BooruDownloadConfig(meta).create({
        ...downloadSetting.current,
        cfClearance: userAuthentication.current.cf_clearance || undefined
      });

      await downloader.download(downloadConfig, { signal });

      const { id, tags, artist, title, rating, source } = meta;
      historyDb.add({
        pid: Number(id),
        user: artist,
        title,
        tags,
        rating,
        source
      });
    },

    afterDownload: () => {
      this.blacklist && (this.blacklist = null);
    }
  });

  async #downloadArtwork(btn: ThumbnailButton) {
    this.getFileHandleIfNeeded();

    const id = btn.dataset.id!;
    const htmlText = await this.api.getPostHtml(id);
    const { posts, tags: tagType, votes } = this.parser.parsePostAndPool(htmlText);
    const mediaMeta = this.parser.buildMeta(posts[0], tagType);

    const downloadConfig = new BooruDownloadConfig(mediaMeta).create({
      ...downloadSetting.current,
      cfClearance: userAuthentication.current.cf_clearance || undefined,
      setProgress: (progress: number) => {
        btn.setProgress(progress);
      }
    });

    if (siteFeature.current.addBookmark && !this.parser.isFavorite(id, votes)) {
      const token = this.parser.parseCsrfToken();
      this.api.addFavorite(id, token).catch(logger.error);
    }

    await downloader.download(downloadConfig, { priority: 1 });

    const { tags, artist, title, rating, source } = mediaMeta;
    historyDb.add({
      pid: Number(id),
      user: artist,
      title,
      tags,
      rating,
      source
    });
  }

  protected createThumbnailBtn(containers: HTMLAnchorElement[]) {
    if (!containers.length) return;

    containers.forEach((el) => {
      const idMathch = /(?<=\/post\/show\/)\d+|(?<=\/post\/browse#)\d+/.exec(el.href);
      if (!idMathch) return;
      const id = idMathch[0];

      const oldBtn = el.querySelector<ThumbnailButton>(ThumbnailButton.tagNameLowerCase);
      if (oldBtn) {
        if (oldBtn.dataset.id === id) return;

        oldBtn.remove();
      } else {
        // add style
        if (el.href.includes('/post/show')) {
          el.style.height = 'fit-content';

          // yande.re/comment
          if (!el.classList.contains('thumb')) {
            const image = el.querySelector('img')!;

            if (image.src.includes('blacklisted-preview.png')) return;

            // blacklist image's src is modified by js
            // so check the src agian when image loaded
            image.onload = () => {
              if (image.src.includes('blacklisted-preview.png') && image.nextElementSibling) {
                image.nextElementSibling.remove();
              }
            };

            el.style.marginBottom = '1em';
            image.style.marginBottom = '0px';
          }
        }

        el.parentElement!.style.display = 'flex'; // change container's width to match the image
        el.style.position = 'relative';
      }

      el.appendChild(
        new ThumbnailButton({
          id,
          onClick: this.#downloadArtwork.bind(this)
        })
      );
    });
  }

  protected createArtworkBtn(id: string) {
    const btnContainer = document.querySelector<HTMLDivElement>(
      '#post-view > .content > div:has(:is(img, video))'
    );
    if (!btnContainer) throw new Error('Can not find button container');

    btnContainer.style.position = 'relative';
    btnContainer.style.width = 'max-content';

    btnContainer.appendChild(
      new ArtworkButton({
        id,
        site: btnContainer.querySelector('video') ? 'vjs_video' : 'moebooru_image',
        onClick: this.#downloadArtwork.bind(this)
      })
    );
  }

  protected createScrollerBtn() {
    const scrollerList = document.querySelector<HTMLUListElement>('ul.post-browser-posts');
    if (!scrollerList) return;

    const ob = new MutationObserver((records) => {
      const containers: HTMLAnchorElement[] = [];

      records.forEach((record) => {
        if (!record.addedNodes.length) return;

        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          const thumbs = node.querySelectorAll<HTMLAnchorElement>('a.thumb');
          if (thumbs.length) containers.push(...thumbs);
        });
      });

      this.createThumbnailBtn(containers);
    });

    ob.observe(scrollerList, { subtree: true, childList: true });
  }

  protected createImageBrowseBtn() {
    const postId = document.querySelector<HTMLSpanElement>('span.post-id');
    if (!postId) return;

    const createBtn = () => {
      // remove old button if exists.
      document
        .querySelector(
          `${ThumbnailButton.tagNameLowerCase}[data-type="${ThumbnailBtnType.YandeBrowse}"]`
        )
        ?.remove();

      const id = postId!.textContent;
      if (!id) return;

      document.body.appendChild(
        new ThumbnailButton({
          id,
          type: ThumbnailBtnType.YandeBrowse,
          onClick: this.#downloadArtwork.bind(this)
        })
      );
    };

    createBtn();

    new MutationObserver(createBtn).observe(postId, { childList: true });
  }

  public inject() {
    super.inject();

    const pathname = location.pathname;
    const galleryMatch = pathname.match(/(?<=\/post\/show\/)\d+/);

    if (galleryMatch) {
      this.createArtworkBtn(galleryMatch[0]);
    } else if (pathname === '/post/browse') {
      this.createScrollerBtn();
      this.createImageBrowseBtn();
    } else {
      const btnContainers = document.querySelectorAll<HTMLAnchorElement>(
        'a.thumb, div.post div.col1 a'
      );
      this.createThumbnailBtn(Array.from(btnContainers));
    }
  }
}
