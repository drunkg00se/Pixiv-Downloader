import { clientSetting } from '@/lib/store/clientSetting.svelte';
import { SiteInject } from '../base';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { siteFeature } from '@/lib/store/siteFeature.svelte';
import { type TemplateData } from '../base/downloadConfig';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { historyDb } from '@/lib/db';
import { downloader } from '@/lib/downloader';
import { Rule34UsApi } from './api';
import { Rule34UsParser } from './parser';
import { Rule34UsDownloadConfig } from './downloadConfig';
import { unsafeWindow } from '$';
import { regexp } from '@/lib/regExp';
import { t } from '@/lib/i18n.svelte';

export class Rule34Us extends SiteInject {
  #api = new Rule34UsApi();
  #parser = new Rule34UsParser();

  #searchParam = new URLSearchParams(location.search);

  constructor() {
    if (clientSetting.version === null) {
      downloadSetting.setDirectoryTemplate('Rule34us/{artist}');
      siteFeature.addBookmark ??= false;
    }

    super();
  }

  static get hostname(): string | string[] {
    return 'rule34.us';
  }

  protected getSupportedTemplate(): Partial<TemplateData> {
    return Rule34UsDownloadConfig.supportedTemplate;
  }

  #isPostList() {
    return this.#searchParam.get('r') === 'posts/index';
  }

  #isPostView() {
    return this.#searchParam.get('r') === 'posts/view';
  }

  #isFavorites() {
    return this.#searchParam.get('r') === 'favorites/view';
  }

  #getQueryTag() {
    return this.#searchParam.get('q');
  }

  #getQueryId() {
    return this.#searchParam.get('id');
  }

  protected useBatchDownload = this.app.initBatchDownloader({
    avatar: '/v1/counter/7.gif',

    parseMetaByArtworkId: async (id: string) => {
      const doc = await this.#api.getPostViewDoc(id);
      return this.#parser.buildMetaByDoc(id, doc);
    },

    downloadArtworkByMeta: async (meta, signal) => {
      const downloadConfig = new Rule34UsDownloadConfig(meta).create({
        ...downloadSetting
      });

      await downloader.download(downloadConfig, { signal });

      const { tagsWithType, title, artist, id } = meta;
      historyDb.add({
        pid: Number(id),
        title,
        tags: tagsWithType!,
        user: artist
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
      posts: {
        name: 'Posts',
        match: () => this.#isPostList(),
        filterInGenerator: false,
        fn: (pageRange) => {
          const tags = this.#getQueryTag() || undefined;
          return this.#parser.paginationGenerator(
            pageRange,
            async (page: number) => {
              const THUMBS_PER_PAGE = 42;
              const doc = await this.#api.getPostListDoc(page - 1, tags);
              const data = this.#parser.parsePostIdsByDoc(doc);
              return {
                lastPage: data.length < THUMBS_PER_PAGE,
                data
              };
            },
            (data) => data
          );
        }
      },

      // search with fav:id
      favorites: {
        name: 'Favorites',
        match: () => this.#isFavorites(),
        filterInGenerator: false,
        fn: (pageRange) => {
          const id = this.#getQueryId();
          if (!id) throw new Error('Cannot get user id.');

          return this.#parser.paginationGenerator(
            pageRange,
            async (page: number) => {
              const THUMBS_PER_PAGE = 30;
              const doc = await this.#api.getFavoritesDoc(id, page - 1);
              const data = this.#parser.parsePostIdsByDoc(doc);
              return {
                lastPage: data.length < THUMBS_PER_PAGE,
                data
              };
            },
            (data) => data
          );
        }
      }
    }
  });

  #addBookmark(id: string) {
    (unsafeWindow as any).addFav(id);
  }

  async #downloadArtwork(btn: ThumbnailButton) {
    const id = btn.dataset.id!;

    const postDoc = await this.#api.getPostViewDoc(id);
    const mediaMeta = this.#parser.buildMetaByDoc(id, postDoc);
    const downloadConfig = new Rule34UsDownloadConfig(mediaMeta).create({
      ...downloadSetting,
      setProgress: (progress: number) => {
        btn.setProgress(progress);
      }
    });

    if (siteFeature.addBookmark) this.#addBookmark(id);

    await downloader.download(downloadConfig, { priority: 1 });

    const { tagsWithType, title, artist } = mediaMeta;
    historyDb.add({
      pid: Number(id),
      title,
      tags: tagsWithType!,
      user: artist
    });
  }

  #createThumbnailButtons() {
    const thumbnailEls = document.querySelectorAll<HTMLAnchorElement>('a[href*="posts/view&id="]');
    if (!thumbnailEls.length) return;

    const fitContent = this.#isFavorites() ? false : true;

    thumbnailEls.forEach((el) => {
      const idMatch = /(?<=id=)[0-9]+$/.exec(el.href);
      if (!idMatch) throw new Error('Cannot match post id.');
      const id = idMatch[0];

      el.setAttribute(
        'style',
        'display: block; position: relative; height: inherit; font-size: 0px'
      );

      fitContent && (el.style.width = 'fit-content');

      el.appendChild(
        new ThumbnailButton({
          id,
          onClick: (btn) => this.#downloadArtwork(btn)
        })
      );
    });
  }

  #createArtworkButton() {
    const id = this.#getQueryId();
    if (!id) throw new Error('Cannot get post id.');

    const mediaEl = document.querySelector<HTMLImageElement | HTMLVideoElement>(
      '.content_push > :is(video, img[width])'
    );
    if (!mediaEl) throw new Error('Cannot find media element.');

    const wrapper = document.createElement('div');
    wrapper.setAttribute(
      'style',
      'position: relative; width: fit-content; margin: 0 auto; font-size: 0px'
    );

    mediaEl.parentElement?.insertBefore(wrapper, mediaEl);
    wrapper.appendChild(mediaEl);
    wrapper.appendChild(
      new ArtworkButton({
        id,
        site: mediaEl.tagName === 'VIDEO' ? 'native_video' : undefined,
        onClick: (btn) => this.#downloadArtwork(btn)
      })
    );
  }

  public inject(): void {
    super.inject();

    if (this.#isPostView()) {
      this.#createArtworkButton();
    } else {
      this.#createThumbnailButtons();
    }
  }
}
