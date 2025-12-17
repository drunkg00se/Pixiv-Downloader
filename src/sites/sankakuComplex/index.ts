import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { SiteInject } from '../base';
import { logger } from '@/lib/logger';
import { SankakuApi, type SankakuPool } from './api';
import { SankakuParser } from './parser';
import { SankakuDownloadConfig } from './downloadConfig';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { downloader } from '@/lib/downloader';
import { historyDb } from '@/lib/db';
import { siteFeature } from '@/lib/store/siteFeature.svelte';
import { clientSetting } from '@/lib/store/clientSetting.svelte';
import { ReactiveValue } from '@/lib/reactiveValue.svelte';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { regexp } from '@/lib/regExp';
import { t } from '@/lib/i18n.svelte';
import { PostValidState } from '../base/parser';

/** @default query */
type SelectorMatchStrategy = 'query' | 'match' | 'both';

type SelectorOption = string | { selector: string; strategy: SelectorMatchStrategy };

type CreateButtonOption = {
  containerSelectors: SelectorOption | SelectorOption[];
  btnProvider: (el: HTMLElement) => HTMLElement | undefined | Promise<HTMLElement | undefined>;
};

export class SankakuApp extends SiteInject {
  private parser = new SankakuParser();
  private api = new SankakuApi({ getAccessToken: () => this.parser.getAccessToken() });

  /** file_url in pool will be expired in 1 hour. */
  private sharedPoolData = new Map<string, Promise<SankakuPool>>();

  constructor() {
    if (clientSetting.version === null) {
      downloadSetting.setDirectoryTemplate('Sankaku/{artist}');
      downloadSetting.setFilenameTemplate('{id}_{artist}_{character}');
      siteFeature.addBookmark ??= false;
    }

    const themeWatcher = new ReactiveValue<boolean>(
      () => {
        return !!document.head
          .querySelector('style[data-meta="MuiCssBaseline"]')
          ?.textContent?.match(/(?<!-)color: #fff/);
      },
      (update) => {
        return this.#onElementAdded(
          (elements) => {
            if (
              elements.find((element) => element.getAttribute('data-meta') === 'MuiCssBaseline')
            ) {
              update();
            }
          },
          document.head,
          { childList: true, subtree: false }
        );
      }
    );

    clientSetting.setThemeWatcher(themeWatcher);

    super();
  }

  #onElementAdded(
    cb: (addedNode: HTMLElement[]) => void,
    target: Parameters<MutationObserver['observe']>[0],
    option?: Parameters<MutationObserver['observe']>[1]
  ): () => void {
    option ??= {
      subtree: true,
      childList: true
    };

    const ignoreElementList = [
      ThumbnailButton.tagNameLowerCase.toUpperCase(),
      ArtworkButton.tagNameLowerCase.toUpperCase()
    ];

    const observer = new MutationObserver((records) => {
      const addedElementNodes = records
        .filter((record) => record.type === 'childList' && record.addedNodes.length)
        .flatMap((record) => Array.from(record.addedNodes))
        .filter(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            !ignoreElementList.includes((node as HTMLElement).tagName)
        ) as HTMLElement[];

      if (!addedElementNodes.length) return;

      cb(addedElementNodes);
    });

    observer.observe(target, option);

    return () => {
      observer.disconnect();
    };
  }

  protected getSupportedTemplate() {
    return SankakuDownloadConfig.supportedTemplate;
  }

  static get hostname(): string[] {
    return ['www.sankakucomplex.com', 'sankaku.app'];
  }

  #getPoolIdByURL() {
    const { pathname } = location;

    const poolId = /(?<=\/books\/)[a-zA-Z0-9]+/.exec(pathname)?.[0];
    if (!poolId) throw new Error('Can not parse pool ID from ' + pathname);

    return poolId;
  }

  async #addBookmark(postId: string) {
    try {
      await this.api.addFav(postId);
      this.toast({ message: 'You have favorited this post', timeout: 2000 });
    } catch (error) {
      logger.error(error);
      this.toast({ message: (error as Error).message, type: 'error' });
    }
  }

  async #downloadArtwork(btn: ThumbnailButton): Promise<void> {
    const id = btn.dataset.id!;

    const [postData, postUrl, tagDetail] = await Promise.all([
      this.api.getPostData(id),
      this.api.getPostUrl(id),
      this.api.getTagDetail(id)
    ]);

    const mediaMeta = this.parser.buildMeta(postData, postUrl, tagDetail);

    const downloadConfig = new SankakuDownloadConfig(mediaMeta).create({
      ...downloadSetting,
      setProgress: (progress: number) => {
        btn.setProgress(progress);
      }
    });

    if (siteFeature.addBookmark) {
      this.#addBookmark(id);
    }

    await downloader.download(downloadConfig, { priority: 1 });

    const { tagsWithType, artist, title, source } = mediaMeta;

    historyDb.add({
      pid: id,
      user: artist,
      title,
      tags: tagsWithType,
      source
    });
  }

  #createButtonOption: CreateButtonOption[] = [
    {
      containerSelectors: 'div[class*="jss"] > div > a[href*="/posts"]:has(img)',
      btnProvider: (el) => {
        if (el.querySelector(ThumbnailButton.tagNameLowerCase)) return;

        const href = el.getAttribute('href')!;
        const matchId = /(?<=posts\/)[a-zA-Z0-9]+/.exec(href);

        if (!matchId) throw new Error('Fail to get ID.');

        el.style = 'display: block; position: relative; font-size: 0px;';

        return new ThumbnailButton({
          id: matchId[0],
          onClick: (btn) => this.#downloadArtwork(btn)
        });
      }
    },
    {
      containerSelectors: [
        '[data-swiper-slide-index][slide] div:has(> .swiper-zoom-container > img)',
        '.MuiGrid-root:has(> div > video)'
      ],
      btnProvider: (el) => {
        if (el.querySelector(ArtworkButton.tagNameLowerCase)) return;

        const idProvider = el.closest('[slide]');
        if (!idProvider) throw new Error('Can not find ID provider.');

        const id = idProvider.getAttribute('slide')!;

        return new ArtworkButton({
          id,
          site: el.matches(':has(video)') ? 'sankaku_video' : undefined,
          onClick: (btn) => this.#downloadArtwork(btn)
        });
      }
    },
    /** book */
    {
      containerSelectors: '[data-index] > div:has(span[id]), [data-index] > button:has(img[id])',
      btnProvider: async (el) => {
        if (el.querySelector(ArtworkButton.tagNameLowerCase)) return;
        if (/series\/[a-zA-Z0-9]+/.test(location.pathname)) return;

        /** get post id */
        const page = +el.closest('[data-index]')!.getAttribute('data-index')!;
        const poolId = this.#getPoolIdByURL();
        let poolDataPromise: Promise<SankakuPool> | undefined = this.sharedPoolData.get(poolId);

        if (!poolDataPromise) {
          poolDataPromise = this.api.getPool(poolId);
          this.sharedPoolData.set(poolId, poolDataPromise);
        }

        const poolData = await poolDataPromise.catch((err) => {
          if (this.sharedPoolData.has(poolId)) this.sharedPoolData.delete(poolId);
          throw err;
        });

        const postId = poolData.posts[page].id;

        el.style.position = 'relative';
        el.style.fontSize = '0px';

        if (el instanceof HTMLButtonElement) {
          return new ThumbnailButton({
            id: postId,
            page,
            onClick: () => void 0
          });
        }

        return new ArtworkButton({
          id: postId,
          page,
          onClick: () => void 0
        });
      }
    }
  ];

  #createButton(elements?: HTMLElement[]) {
    this.#createButtonOption.forEach(async (option) => {
      const { containerSelectors, btnProvider } = option;

      const selectorOptions = Array.isArray(containerSelectors)
        ? containerSelectors
        : [containerSelectors];

      for (const selectorOption of selectorOptions) {
        let selector: string;
        let strategy: SelectorMatchStrategy;

        if (typeof selectorOption === 'string') {
          selector = selectorOption;
          strategy = 'query';
        } else {
          ({ selector, strategy } = selectorOption);
        }

        if (!elements && strategy === 'match') {
          logger.error('Argument "elements" is required when strategy is "match"');
          continue;
        }

        const containers =
          (elements
            ?.flatMap((el) => {
              if (strategy === 'query') {
                return Array.from(el.querySelectorAll<HTMLElement>(selector));
              } else if (strategy === 'match') {
                return el.matches(selector) ? el : null;
              } else {
                return el.matches(selector)
                  ? el
                  : Array.from(el.querySelectorAll<HTMLElement>(selector));
              }
            })
            .filter(Boolean) as HTMLElement[]) ||
          Array.from(document.querySelectorAll<HTMLElement>(selector));

        if (containers.length === 0) continue;

        for (const container of containers) {
          try {
            const maybePromise = btnProvider(container);

            const childEl = maybePromise instanceof Promise ? await maybePromise : maybePromise;

            if (!childEl) continue;

            container.appendChild(childEl);
          } catch (error) {
            logger.error(error, container);
          }
        }
      }
    });
  }

  public inject(): void {
    super.inject();

    this.#onElementAdded((elements) => {
      this.#createButton(elements);
    }, document.querySelector('#app')!);
  }

  #useBatchDownload = this.app.initBatchDownloader({
    avatar: () => {
      return (
        this.parser.getAvatarURL() ||
        'https://f.sankakucomplex.com/assets/triangle-grey-plus.b8c7af16.svg'
      );
    },

    parseMetaByArtworkId: async (id: string) => {
      const [postData, postUrl, tagDetail] = await Promise.all([
        this.api.getPostData(id),
        this.api.getPostUrl(id),
        this.api.getTagDetail(id)
      ]);
      return this.parser.buildMeta(postData, postUrl, tagDetail);
    },

    downloadArtworkByMeta: async (meta, signal) => {
      if (this.parser.isURLExpired(meta.src)) throw new Error('URL is expired.');

      const downloadConfig = new SankakuDownloadConfig(meta).create({
        ...downloadSetting
      });

      await downloader.download(downloadConfig, { signal });

      const { id, tagsWithType, artist, title, source } = meta;

      historyDb.add({
        pid: id,
        user: artist,
        title,
        tags: tagsWithType,
        source
      });
    },

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
          id: 'allow_image',
          type: 'include',
          name: () => t('downloader.category.filter.image'),
          checked: true,
          fn(meta) {
            return !!meta.extendName && regexp.imageExt.test(meta.extendName);
          }
        },
        {
          id: 'allow_video',
          type: 'include',
          name: () => t('downloader.category.filter.video'),
          checked: true,
          fn(meta) {
            return !!meta.extendName && regexp.videoExt.test(meta.extendName);
          }
        }
      ],

      enableTagFilter: true
    },

    pageOption: {
      books: {
        name: 'Book',
        match: (url) => /books\/[a-zA-Z0-9]+/.test(url),
        filterInGenerator: true,
        fn: (_pageRange, checkValidity) => {
          const matchBookId = /(?<=books\/)[a-zA-Z0-9]+/.exec(location.href);
          if (!matchBookId) throw new Error('Failed to get the book ID.');

          const id = matchBookId[0];

          return this.parser.paginationGenerator(
            null,
            async () => {
              const { posts } = await this.api.getPool(id);
              return { data: posts, lastPage: true };
            },
            (data) => this.parser.buildMeta(data),
            async (data) =>
              (await checkValidity(this.parser.buildMeta(data)))
                ? PostValidState.VALID
                : PostValidState.INVALID
          );
        }
      },

      collection: {
        name: 'Collection',
        match: (url) => /collections\/[a-zA-Z0-9]+/.test(url),
        filterInGenerator: true,
        fn: (_pageRange, checkValidity) => {
          const matchColleId = /(?<=collections\/)[a-zA-Z0-9]+/.exec(location.href);
          if (!matchColleId) throw new Error('Failed to get the collection ID.');

          const id = matchColleId[0];

          return this.parser.paginationGenerator(
            null,
            async (page) => {
              const { data, meta } = await this.api.getCollection(id, page);
              return { data, lastPage: !meta.next };
            },
            (data) => data.id,
            async (data) =>
              (await checkValidity({ id: data.id, extendName: data.file_ext }))
                ? PostValidState.VALID
                : PostValidState.INVALID
          );
        }
      },

      series: {
        name: 'Series',
        match: (url) => /series\/[a-zA-Z0-9]+/.test(url),
        filterInGenerator: true,
        fn: (_pageRange, checkValidity) => {
          const matchSeriesId = /(?<=series\/)[a-zA-Z0-9]+/.exec(location.href);
          if (!matchSeriesId) throw new Error('Failed to get the series ID.');

          const volumeIndex = +(new URLSearchParams(location.search).get('volumeIndex') ?? '0');
          const seriesId = matchSeriesId[0];

          return this.parser.paginationGenerator(
            null,
            async () => {
              const poolId = (await this.api.querySeries(seriesId))[volumeIndex];
              const { posts } = await this.api.getPool(poolId);
              return { data: posts, lastPage: true };
            },
            (data) => this.parser.buildMeta(data),
            async (data) =>
              (await checkValidity(this.parser.buildMeta(data)))
                ? PostValidState.VALID
                : PostValidState.INVALID
          );
        }
      }
    }
  });
}
