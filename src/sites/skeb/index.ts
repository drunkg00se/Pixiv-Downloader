import { SiteInject } from '../base';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { downloader, type DownloadConfig } from '@/lib/downloader';
import { SkebParser } from './parser';
import { PostValidState } from '../base/parser';
import { SkebApi } from './api';
import { SkebDownloadConfig } from './downloadConfig';
import { historyDb, type HistoryData } from '@/lib/db';
import type { TemplateData } from '../base/downloadConfig';
import { t } from '@/lib/i18n.svelte';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { siteFeature } from '@/lib/store/siteFeature.svelte';
import type { SkebWorkListItem } from './types';

import { clientSetting } from '@/lib/store/clientSetting.svelte';

export class Skeb extends SiteInject {
  protected parser = new SkebParser();
  protected api = new SkebApi();

  constructor() {
    if (clientSetting.version === null) {
      downloadSetting.setDirectoryTemplate('skeb/{artist}');
      downloadSetting.setFilenameTemplate('{artist}_{id}_p{page}');
    }

    super();
  }

  static get hostname() {
    return 'skeb.jp';
  }

  protected getSupportedTemplate(): Partial<TemplateData> {
    return SkebDownloadConfig.supportedTemplate;
  }

  #getScreenName(): string | undefined {
    return this.parser.parseScreenNameFromPath(location.pathname);
  }

  #getWorkNumber(): number | undefined {
    return this.parser.parseWorkNumberFromPath(location.pathname);
  }

  #isWorkPage() {
    return /^\/@[^/]+\/works\/\d+$/.test(location.pathname);
  }

  #isUserPage() {
    return /^\/@[^/]+\/?$/.test(location.pathname);
  }

  protected useBatchDownload = this.app.initBatchDownloader({
    avatar: async () => {
      const screenName = this.#getScreenName();
      if (!screenName) return '';

      try {
        const user = await this.api.getUser(screenName);
        return user.avatar_url;
      } catch {
        return '';
      }
    },

    parseMetaByArtworkId: async (id) => {
      const screenName = this.#getScreenName();
      if (!screenName) throw new Error('Cannot determine screen name.');

      const workNumber = id.includes('/') ? id.split('/').pop()! : id;
      const work = await this.api.getWork(screenName, Number(workNumber));
      return this.parser.buildMetaByWork(work);
    },

    downloadArtworkByMeta: async (meta, signal) => {
      let downloadConfig: DownloadConfig | DownloadConfig[];
      const option = { ...downloadSetting };

      const bundleIllusts = siteFeature.compressMultiIllusts;

      if (Array.isArray(meta.src)) {
        downloadConfig = bundleIllusts
          ? new SkebDownloadConfig(meta).createBundle(option)
          : new SkebDownloadConfig(meta).createMulti(option);
      } else {
        downloadConfig = new SkebDownloadConfig(meta).create(option);
      }

      await downloader.download(downloadConfig, { signal });

      const { id, artist, userId, title, tags } = meta;

      const historyData: HistoryData = {
        pid: id,
        user: artist,
        userId: Number(userId),
        title,
        comment: '',
        tags
      };

      historyDb.add(historyData);
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
          id: 'allow_art',
          type: 'include',
          name: () => t('downloader.category.filter.skeb_art'),
          checked: true,
          fn(meta) {
            return meta.genre === 'art';
          }
        },
        {
          id: 'allow_comic',
          type: 'include',
          name: () => t('downloader.category.filter.skeb_comic'),
          checked: true,
          fn(meta) {
            return meta.genre === 'comic';
          }
        },
        {
          id: 'allow_voice',
          type: 'include',
          name: () => t('downloader.category.filter.skeb_voice'),
          checked: false,
          fn(meta) {
            return meta.genre === 'voice';
          }
        },
        {
          id: 'allow_video',
          type: 'include',
          name: () => t('downloader.category.filter.skeb_video'),
          checked: false,
          fn(meta) {
            return meta.genre === 'video';
          }
        },
        {
          id: 'allow_music',
          type: 'include',
          name: () => t('downloader.category.filter.skeb_music'),
          checked: false,
          fn(meta) {
            return meta.genre === 'music';
          }
        },
        {
          id: 'allow_novel',
          type: 'include',
          name: () => t('downloader.category.filter.skeb_novel'),
          checked: false,
          fn(meta) {
            return meta.genre === 'novel';
          }
        },
        {
          id: 'allow_correction',
          type: 'include',
          name: () => t('downloader.category.filter.skeb_correction'),
          checked: false,
          fn(meta) {
            return meta.genre === 'correction';
          }
        }
      ],

      enableTagFilter: true
    },

    pageOption: {
      creatorWorks: {
        name: () => t('downloader.download_type.pixiv_works'),
        match: () => this.#isUserPage() || this.#isWorkPage(),
        filterInGenerator: false,
        fn: (pageRange) => {
          const screenName = this.#getScreenName();
          if (!screenName) throw new Error('Cannot determine screen name.');

          const limit = 30;

          return this.parser.paginationGenerator(
            pageRange,
            async (page: number) => {
              const offset = (page - 1) * limit;
              const works = await this.api.getWorks(screenName, offset, limit);

              return {
                lastPage: works.length < limit,
                data: works
              };
            },
            (work: SkebWorkListItem) => {
              const workNumber = this.parser.parseWorkNumberFromPath(work.path);
              const creator = work.path.match(/@([^/]+)/)?.[1] ?? screenName;
              return `${creator}/${workNumber ?? ''}`;
            },
            async (work: SkebWorkListItem) => {
              return work.private ? PostValidState.INVALID : PostValidState.VALID;
            }
          );
        }
      }
    }
  });

  protected async downloadArtwork(btn: ThumbnailButton) {
    const {
      id,
      screenName: dataScreenName,
      page
    } = btn.dataset as {
      id: string;
      screenName?: string;
      page?: string;
    };
    const pageNum = page !== undefined ? +page : undefined;
    const screenName = dataScreenName || this.#getScreenName();
    if (!screenName) throw new Error('Cannot determine screen name.');

    const workNumber = id.includes('/') ? id.split('/').pop()! : id;
    const work = await this.api.getWork(screenName, Number(workNumber));
    const meta = this.parser.buildMetaByWork(work);

    const option = {
      ...downloadSetting,
      setProgress: (progress: number) => {
        btn.setProgress(progress);
      }
    };

    let downloadConfig: DownloadConfig | DownloadConfig[];

    if (pageNum !== undefined) {
      downloadConfig = new SkebDownloadConfig(meta).create({ ...option, index: pageNum });
    } else if (Array.isArray(meta.src)) {
      const bundleIllusts = siteFeature.compressMultiIllusts;
      downloadConfig = bundleIllusts
        ? new SkebDownloadConfig(meta).createBundle(option)
        : new SkebDownloadConfig(meta).createMulti(option);
    } else {
      downloadConfig = new SkebDownloadConfig(meta).create(option);
    }

    await downloader.download(downloadConfig, { priority: 1 });

    const historyData: HistoryData = {
      pid: meta.id,
      user: meta.artist,
      userId: Number(meta.userId),
      title: meta.title,
      comment: '',
      tags: meta.tags,
      page: pageNum
    };

    historyDb.add(historyData);
  }

  protected createWorkPageBtns() {
    if (!this.#isWorkPage()) return;

    const screenName = this.#getScreenName();
    const workNumber = this.#getWorkNumber();
    if (!screenName || !workNumber) return;

    const id = `${screenName}/${workNumber}`;

    const containers = document.querySelectorAll<HTMLElement>(
      'div.image-column div.container.mb-3'
    );

    containers.forEach((container, idx) => {
      if (container.querySelector(ArtworkButton.tagNameLowerCase)) return;

      container.style.position = 'relative';
      container.appendChild(
        new ArtworkButton({
          id,
          page: idx,
          onClick: this.downloadArtwork,
          extraData: { screenName }
        })
      );
    });

    const imageColumn = document.querySelector('div.image-column');
    if (imageColumn && !imageColumn.querySelector(`:scope > ${ThumbnailButton.tagNameLowerCase}`)) {
      imageColumn.appendChild(
        new ThumbnailButton({
          id,
          onClick: this.downloadArtwork,
          extraData: { screenName }
        })
      );
    }
  }

  protected createThumbnailBtn() {
    const containers = document.querySelectorAll<HTMLElement>(
      'a[href*="/works/"]:has(div.card-image)'
    );

    containers.forEach((container) => {
      if (container.querySelector(ThumbnailButton.tagNameLowerCase)) return;

      const href = container.getAttribute('href') ?? '';
      const match = href.match(/\/@([^/]+)\/works\/(\d+)/);
      if (!match) return;

      const screenName = match[1];
      const id = `${screenName}/${match[2]}`;
      container.style.position = 'relative';
      container.appendChild(
        new ThumbnailButton({
          id,
          onClick: this.downloadArtwork,
          extraData: { screenName }
        })
      );
    });
  }

  #observeDomChanges() {
    const observer = new MutationObserver(() => {
      this.createThumbnailBtn();
      this.createWorkPageBtns();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  public inject(): void {
    super.inject();

    this.downloadArtwork = this.downloadArtwork.bind(this);
    this.createThumbnailBtn();
    this.createWorkPageBtns();
    this.#observeDomChanges();
  }
}
