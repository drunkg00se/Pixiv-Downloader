import { downloadArtwork } from './downloadArtwork';
import { SiteInject } from '../base';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

export class Rule34 extends SiteInject {
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

    const wrapper = document.createElement('div');
    wrapper.classList.add('pdl-wrap-artworks', 'rule34');

    const btn = new ThumbnailButton({
      id,
      type: ThumbnailBtnType.Gallery,
      onClick: downloadArtwork
    });

    wrapper.appendChild(btn);
    btnContainer.appendChild(wrapper);
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

  protected observeColorScheme() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    if (query.matches) {
      this.setModalDarkMode();
    }

    query.addEventListener('change', (e) => {
      e.matches ? this.setModalDarkMode() : this.setModalLightMode();
    });
  }
}
