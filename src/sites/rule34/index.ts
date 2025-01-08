import { downloadArtwork } from './downloadArtwork';
import { SiteInject } from '../base';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { rule34Parser, type Rule34Meta } from './parser';
import { downloader } from '@/lib/downloader';
import { historyDb } from '@/lib/db';
import { Rule34DownloadConfig } from './downloadConfigBuilder';
import t from '@/lib/lang';

export class Rule34 extends SiteInject {
  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as Rule34Meta,

    avatar: '/images/r34chibi.png',

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

    pageMatch: {
      favorites: {
        name: 'Favorites',
        match: /(?=.*page=favorites)(?=.*s=view)(?=.*id=[0-9]+)/,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity, userId?: string) => {
          userId ??= /(?<=id=)[0-9]+/.exec(location.search)![0];
          return rule34Parser.favoriteGenerator(pageRange, checkValidity, userId);
        }
      },

      pools: {
        name: 'Pools',
        match: /(?=.*page=pool)(?=.*s=show)(?=.*id=[0-9]+)/,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity, poolId?: string) => {
          poolId ??= /(?<=id=)[0-9]+/.exec(location.search)![0];
          return rule34Parser.poolGenerator(pageRange, checkValidity, poolId);
        }
      },

      posts: {
        name: 'Posts',
        match: /(?=.*page=post)(?=.*s=list)/,
        filterWhenGenerateIngPage: true,
        fn: (pageRange, checkValidity, tags?: string | string[]) => {
          tags ??= new URLSearchParams(location.search).get('tags') ?? 'all';
          return rule34Parser.postGenerator(pageRange, checkValidity, tags);
        }
      }
    },

    parseMetaByArtworkId(id) {
      return rule34Parser.parse(id);
    },

    async downloadByArtworkId(meta, taskId) {
      downloader.dirHandleCheck();

      const { id, tags, artist, title, source, rating } = meta;
      const downloadConfigs = new Rule34DownloadConfig(meta).getDownloadConfig();
      downloadConfigs.taskId = taskId;

      await downloader.download(downloadConfigs);

      historyDb.add({
        pid: Number(id),
        user: artist,
        title,
        tags,
        source,
        rating
      });
    },

    onDownloadAbort(taskIds) {
      downloader.abort(taskIds);
    }
  });

  public inject() {
    super.inject();

    const query = location.search;
    if (!query) return;

    const searchParams = new URLSearchParams(query);
    const page = searchParams.get('page');
    const s = searchParams.get('s');

    if (page === 'post' && s === 'view') {
      // 画廊页

      // 检查artwork是否被删除
      if (!document.querySelector('#image, #gelcomVideoPlayer')) return;

      const id = searchParams.get('id')!;
      this.createArtworkBtn(id);
    } else {
      this.createThumbnailBtn();
    }
  }

  protected createThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>(
      '.thumb > a:first-child:not(:has(.blacklist-img))'
    );
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      el.setAttribute(
        'style',
        'position: relative; align-self: center; width: auto; height: auto;'
      );

      const imgEl = el.querySelector<HTMLImageElement>('img')!;

      const setContainerHeight = () => {
        const aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
        aspectRatio > 1 && (el.style.height = 'inherit');
      };
      setContainerHeight();

      imgEl.onload = setContainerHeight;

      const idMathch = /(?<=&id=)\d+/.exec(el.href);
      if (!idMathch) return;

      const id = idMathch[0];
      el.appendChild(
        new ThumbnailButton({
          id,
          onClick: downloadArtwork
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
        site: 'rule34',
        onClick: downloadArtwork
      })
    );
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'rule34/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  protected getFilenameTemplate(): string[] {
    return ['{artist}', '{character}', '{id}', '{date}'];
  }

  protected getBlacklistTags() {
    const [tagsStr] = /(?<=tag_blacklist=).*?(?=;|$)/.exec(document.cookie) ?? [];
    if (!tagsStr) return [];

    const tags = decodeURIComponent(decodeURIComponent(tagsStr));
    return tags.split(' ');
  }

  static get hostname(): string {
    return 'rule34.xxx';
  }
}
