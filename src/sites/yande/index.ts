import { SiteInject } from '../base';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadArtwork } from './downloadArtwork';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { yandeParser, type YandeMeta } from './parser';
import { YandeDownloadConfig } from './downloadConfigBuilder';
import { downloader } from '@/lib/downloader';
import { historyDb } from '@/lib/db';
import t from '@/lib/lang';

export class Yande extends SiteInject {
  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as YandeMeta,

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

    pageMatch: {
      posts: {
        name: t('downloader.download_type.yande_posts'),
        match: () => location.pathname === '/post',
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity, tags?: string | string[]) => {
          tags ??= new URLSearchParams(location.search).get('tags') ?? '';
          return yandeParser.postGenerator(pageRange, checkValidity, tags);
        }
      },

      popular_1d: {
        name: t('downloader.download_type.yande_popular_1d'),
        match: () => location.pathname === '/post/popular_recent',
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          return yandeParser.popularGenerator(pageRange, checkValidity, '1d');
        }
      },

      popular_1w: {
        name: t('downloader.download_type.yande_popular_1w'),
        match: () => location.pathname === '/post/popular_recent',
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          return yandeParser.popularGenerator(pageRange, checkValidity, '1w');
        }
      },

      popular_1m: {
        name: t('downloader.download_type.yande_popular_1m'),
        match: () => location.pathname === '/post/popular_recent',
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          return yandeParser.popularGenerator(pageRange, checkValidity, '1m');
        }
      },

      popular_1y: {
        name: t('downloader.download_type.yande_popular_1y'),
        match: () => location.pathname === '/post/popular_recent',
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity) => {
          return yandeParser.popularGenerator(pageRange, checkValidity, '1y');
        }
      },

      pool: {
        name: t('downloader.download_type.yande_pool'),
        match: /\/pool\/show\//,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity, poolId?: string) => {
          poolId ??= /(?<=show\/)[0-9]+/.exec(location.pathname)![0];
          return yandeParser.poolGenerator(pageRange, checkValidity, poolId);
        }
      }
    },

    parseMetaByArtworkId(id) {
      return yandeParser.parse(id);
    },

    async downloadByArtworkId(meta, taskId) {
      downloader.dirHandleCheck();
      const { id, tags, artist, title } = meta;
      const downloadConfigs = new YandeDownloadConfig(meta).getDownloadConfig();
      downloadConfigs.taskId = taskId;

      await downloader.download(downloadConfigs);

      historyDb.add({
        pid: Number(id),
        user: artist,
        title,
        tags
      });
    },

    onDownloadAbort(taskIds) {
      downloader.abort(taskIds);
    }
  });

  public inject() {
    this.resetArrayFrom();
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

  // yande.re uses a pollyfill for `Array.from`, which doesn't support `Set` as an argument,
  // and breaks svelte's `get_binding_group_value` function.
  protected resetArrayFrom() {
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    Array.from = (iframe.contentWindow as any).Array.from;
    iframe.remove();
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
          onClick: downloadArtwork
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
        onClick: downloadArtwork
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

    function createBtn() {
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
          onClick: downloadArtwork
        })
      );
    }

    createBtn();

    new MutationObserver(createBtn).observe(postId, { childList: true });
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'yande/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  protected getFilenameTemplate(): string[] {
    return ['{artist}', '{character}', '{id}', '{date}'];
  }

  static get hostname(): string {
    return 'yande.re';
  }
}
