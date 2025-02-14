import { SiteInject } from '../../base';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { MoebooruParser, type MoebooruBlacklistItem, type MoebooruMeta } from './parser';
import { MoebooruDownloadConfig } from './downloadConfigBuilder';
import { downloader } from '@/lib/downloader';
import { historyDb } from '@/lib/db';
import t from '@/lib/lang';

export abstract class Moebooru extends SiteInject {
  protected blacklist: MoebooruBlacklistItem[] | null = null;

  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as MoebooruMeta,

    avatar: '/favicon.ico',

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
            if (!meta.tags) return false;
            this.blacklist ??= await MoebooruParser.parseBlacklist();
            return MoebooruParser.isBlacklisted(meta.tags, this.blacklist);
          }
        },
        {
          id: 'allow_image',
          type: 'include',
          name: t('downloader.category.filter.image'),
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
        name: t('downloader.download_type.yande_posts'),
        match: () => location.pathname === '/post',
        filterInGenerator: true,
        fn: (pageRange, checkValidity, tags?: string | string[]) => {
          tags ??= new URLSearchParams(location.search).get('tags') ?? '';
          return MoebooruParser.postGenerator(pageRange, checkValidity, tags);
        }
      },

      popular_1d: {
        name: t('downloader.download_type.yande_popular_1d'),
        match: () => location.pathname === '/post/popular_recent',
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return MoebooruParser.popularGenerator(pageRange, checkValidity, '1d');
        }
      },

      popular_1w: {
        name: t('downloader.download_type.yande_popular_1w'),
        match: () => location.pathname === '/post/popular_recent',
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return MoebooruParser.popularGenerator(pageRange, checkValidity, '1w');
        }
      },

      popular_1m: {
        name: t('downloader.download_type.yande_popular_1m'),
        match: () => location.pathname === '/post/popular_recent',
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return MoebooruParser.popularGenerator(pageRange, checkValidity, '1m');
        }
      },

      popular_1y: {
        name: t('downloader.download_type.yande_popular_1y'),
        match: () => location.pathname === '/post/popular_recent',
        filterInGenerator: true,
        fn: (pageRange, checkValidity) => {
          return MoebooruParser.popularGenerator(pageRange, checkValidity, '1y');
        }
      },

      pool: {
        name: t('downloader.download_type.yande_pool'),
        match: /\/pool\/show\//,
        filterInGenerator: true,
        fn: (pageRange, checkValidity, poolId?: string) => {
          poolId ??= /(?<=show\/)[0-9]+/.exec(location.pathname)![0];
          return MoebooruParser.poolGenerator(pageRange, checkValidity, poolId);
        }
      }
    },

    parseMetaByArtworkId(id) {
      return MoebooruParser.parse(id);
    },

    async downloadArtworkByMeta(meta, signal) {
      downloader.dirHandleCheck();
      const { id, tags, artist, title, rating, source } = meta;
      const downloadConfigs = new MoebooruDownloadConfig(meta).getDownloadConfig();

      await downloader.download(downloadConfigs, { signal });

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

  protected async downloadArtwork(btn: ThumbnailButton) {
    downloader.dirHandleCheck();
    const id = btn.dataset.id!;
    const mediaMeta = await MoebooruParser.parse(id);
    const { tags, artist, title, rating, source } = mediaMeta;
    const downloadConfigs = new MoebooruDownloadConfig(mediaMeta).getDownloadConfig(btn);

    await downloader.download(downloadConfigs, { priority: 1 });

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
          onClick: this.downloadArtwork
        })
      );
    });
  }

  protected createArtworkBtn(id: string) {
    const image = document.querySelector('#image')!;
    const btnContainer = image.closest('div')!;

    btnContainer.style.position = 'relative';
    btnContainer.style.width = 'max-content';

    btnContainer.appendChild(
      new ArtworkButton({
        id,
        site: 'yande',
        onClick: this.downloadArtwork
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

  // TODO: check konanchan
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
          onClick: this.downloadArtwork
        })
      );
    };

    createBtn();

    new MutationObserver(createBtn).observe(postId, { childList: true });
  }

  protected getFilenameTemplate(): string[] {
    return ['{artist}', '{character}', '{id}', '{date}'];
  }
}
