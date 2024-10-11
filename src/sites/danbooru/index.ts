import { downloadArtwork } from './downloadArtwork';
import { SiteInject } from '../base';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadPoolArtwork } from './downloadPoolArtwork';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import type { BatchDownloadConfig } from '@/lib/components/Downloader/useBatchDownload';

export class Danbooru extends SiteInject {
  static get hostname(): string {
    return 'danbooru.donmai.us';
  }

  protected inject(): void {
    super.inject();
    this.pageAction();
  }

  protected createThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>(
      'article a.post-preview-link'
    );
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      const id = /(?<=\/posts\/)\d+/.exec(el.href)?.[0];
      if (!id) return;

      const btn = new ThumbnailButton({
        id,
        onClick: downloadArtwork
      });

      el.appendChild(btn);
    });
  }

  protected createArtworkBtn(id: string) {
    const btnContainer = document.querySelector<HTMLElement>('section.image-container')!;
    btnContainer.appendChild(
      new ArtworkButton({
        id,
        onClick: downloadArtwork
      })
    );
  }

  protected createPoolThumbnailBtn() {
    const btnContainers = document.querySelectorAll<HTMLAnchorElement>(
      'article a.post-preview-link'
    );
    if (!btnContainers.length) return;

    btnContainers.forEach((el) => {
      const poolId = /(?<=\/pools\/)\d+/.exec(el.href)?.[0];
      if (!poolId) return;

      const btn = new ThumbnailButton({
        id: poolId,
        type: ThumbnailBtnType.DanbooruPool,
        onClick: downloadPoolArtwork
      });

      el.appendChild(btn);
    });
  }

  protected pageAction() {
    const path = location.pathname;
    if (/^\/posts\/\d+/.test(path)) {
      const imageContainer = document.querySelector(
        'section.image-container:not(.blacklisted-active)'
      );
      if (!imageContainer) return;

      const id = imageContainer.getAttribute('data-id')!;
      this.createArtworkBtn(id);
      this.createThumbnailBtn();
    } else if (/^\/pools\/gallery/.test(path)) {
      this.createPoolThumbnailBtn();
    } else {
      this.createThumbnailBtn();
    }
  }

  protected observeColorScheme() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    let uaPreferDark = query.matches;

    const siteSetting = document.body.getAttribute('data-current-user-theme') as
      | 'dark'
      | 'auto'
      | 'light';
    const sitePreferDark = siteSetting === 'dark';

    if (sitePreferDark || (siteSetting === 'auto' && uaPreferDark)) {
      this.setModalDarkMode();
    }

    if (siteSetting === 'auto') {
      query.addEventListener('change', (e) => {
        uaPreferDark = e.matches;
        uaPreferDark ? this.setModalDarkMode() : this.setModalLightMode();
      });
    }
  }

  protected getBatchDownloadConfig(): undefined | BatchDownloadConfig<any, true | undefined> {
    // TODO
    return undefined;
  }
}
