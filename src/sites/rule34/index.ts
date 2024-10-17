import { downloadArtwork } from './downloadArtwork';
import { SiteInject } from '../base';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import type { BatchDownloadConfig } from '@/lib/components/Downloader/useBatchDownload';

export class Rule34 extends SiteInject {
  static get hostname(): string {
    return 'rule34.xxx';
  }

  protected inject() {
    super.inject();
    this.pageAction();
  }

  protected createThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>(
      '.thumb:not(.blacklisted-image) > a:first-child'
    );
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      el.style.display = 'inline-block';
      el.style.position = 'relative';

      const imgEl = el.querySelector<HTMLImageElement>('img')!;
      imgEl.style.boxSizing = 'border-box';

      let aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
      aspectRatio > 1 && (el.style.height = 'inherit');

      imgEl.onload = () => {
        aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
        aspectRatio > 1 && (el.style.height = 'inherit');
      };

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

  protected pageAction() {
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

  protected getCustomConfig() {
    return {
      folderPattern: 'rule34/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  protected getFilenameTemplate(): string[] {
    return ['{artist}', '{character}', '{id}', '{date}'];
  }

  protected getBatchDownloadConfig(): undefined | BatchDownloadConfig<any, true | undefined> {
    // TODO
    return undefined;
  }
}
