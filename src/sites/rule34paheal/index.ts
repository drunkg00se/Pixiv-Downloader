import { SiteInject } from '../base';
import { clientSetting } from '@/lib/store/clientSetting.svelte';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import type { TemplateData } from '../base/downloadConfig';
import { Rule34PahealApi } from './api';
import { Rule34PahealParser } from './parser';
import { Rule34PahealDownloadConfig } from './downloadConfig';
import { downloader } from '@/lib/downloader';
import { historyDb } from '@/lib/db';
import { t } from '@/lib/i18n.svelte';
import { regexp } from '@/lib/regExp';
import { PostValidState } from '../base/parser';

export class Rule34Paheal extends SiteInject {
  #api = new Rule34PahealApi();
  #parser = new Rule34PahealParser();

  constructor() {
    if (clientSetting.version === null) {
      downloadSetting.setDirectoryTemplate('Rule34Paheal');
    }

    super();
  }

  static get hostname() {
    return 'rule34.paheal.net';
  }

  protected getSupportedTemplate(): Partial<TemplateData> {
    return Rule34PahealDownloadConfig.supportedTemplate;
  }

  protected useBatchDownload = this.app.initBatchDownloader({
    avatar: '/favicon.ico',

    parseMetaByArtworkId: async (id: string) => {
      const postDoc = await this.#api.getPostViewDoc(id);
      return this.#parser.buildMetaByDoc(id, postDoc);
    },

    downloadArtworkByMeta: async (meta, signal) => {
      const downloadConfig = new Rule34PahealDownloadConfig(meta).create({
        ...downloadSetting
      });

      await downloader.download(downloadConfig, { signal });

      const { tags, title, source, id } = meta;
      historyDb.add({
        pid: Number(id),
        title,
        tags,
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
      posts: {
        name: 'Posts',
        match: () => this.#isPostList(),
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          if (pageRange && pageRange[0] > 500)
            throw new Error('Only 500 pages of results are searchable');

          const tagPageStr = location.pathname.slice('/post/list/'.length);
          const [tagOrPage, maybePage] = tagPageStr.split('/');

          let tag: undefined | string;
          if (maybePage === undefined && /^[0-9]+$/.test(tagOrPage)) {
            tag = undefined;
          } else {
            tag = tagOrPage === '' ? undefined : tagOrPage;
          }

          const getArtworkMetasByPage = async (page: number) => {
            const doc = await this.#api.getPostListDoc(page, tag);
            return {
              lastPage: !this.#parser.docHasNextPage(doc),
              data: this.#parser.buildMetasByPostsListDoc(doc)
            };
          };

          return this.#parser.paginationGenerator(
            pageRange,
            getArtworkMetasByPage,
            (data) => data.id,
            async (data) => {
              return (await checkValidity(data)) ? PostValidState.VALID : PostValidState.INVALID;
            }
          );
        }
      }
    }
  });

  #isPostList() {
    return location.pathname.startsWith('/post/list');
  }

  #isPostView() {
    return /\/post\/view\/[0-9]+/.test(location.pathname);
  }

  async #downloadArtwork(btn: ThumbnailButton) {
    this.getFileHandleIfNeeded();

    const id = btn.dataset.id!;

    const postDoc = await this.#api.getPostViewDoc(id);
    const mediaMeta = this.#parser.buildMetaByDoc(id, postDoc);
    const downloadConfig = new Rule34PahealDownloadConfig(mediaMeta).create({
      ...downloadSetting,
      setProgress: (progress: number) => {
        btn.setProgress(progress);
      }
    });

    await downloader.download(downloadConfig, { priority: 1 });

    const { tags, title, source } = mediaMeta;
    historyDb.add({
      pid: Number(id),
      title,
      tags,
      source
    });
  }

  #createArtworkButton() {
    const idMatch = /(?<=view\/)[0-9]+/.exec(location.pathname);
    if (!idMatch) return;
    const id = idMatch[0];

    const blockBodyEL = document.querySelector(':is(#Imagemain, #Videomain) .blockbody');
    const mediaEl = document.querySelector<HTMLImageElement | HTMLVideoElement>('#main_image');
    if (!blockBodyEL || !mediaEl) throw new Error('Cannot find container or media.');

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('pdl-wrapper');
    btnContainer.appendChild(mediaEl);
    btnContainer.appendChild(
      new ArtworkButton({
        id,
        site: mediaEl.tagName === 'VIDEO' ? 'native_video' : undefined,
        onClick: (btn) => this.#downloadArtwork(btn)
      })
    );

    blockBodyEL.appendChild(btnContainer);

    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(
      '.pdl-wrapper { position: relative; width: fit-content; margin: 0 auto; font-size: 0px; } #main_image { max-width: 100% !important; }' // !important breaks zoomer: Full Size.
    );
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
  }

  #createThumbnailButtons() {
    const thumbnailEls = document.querySelectorAll<HTMLDivElement>('.shm-thumb.thumb');
    if (!thumbnailEls.length) return;

    thumbnailEls.forEach((el) => {
      const id = el.dataset.postId;
      if (!id) throw new Error('Cannot get post id.');

      const container = el.querySelector<HTMLAnchorElement>('a.shm-thumb-link');
      if (!container) throw new Error('Cannot find button container');

      container.setAttribute('style', 'display: inline-block; position: relative; font-size: 0px;');
      container.appendChild(
        new ThumbnailButton({
          id,
          onClick: (btn) => this.#downloadArtwork(btn)
        })
      );
    });
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
