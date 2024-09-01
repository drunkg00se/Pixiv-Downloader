import { SiteInject } from '../base';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadArtwork } from './downloadArtwork';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import type { BatchDownloadConfig } from '@/lib/components/Downloader/useBatchDownload';

export class Yande extends SiteInject {
  protected inject() {
    super.inject();
    this.pageAction();
  }

  protected createThumbnailBtn(containers: HTMLAnchorElement[]) {
    if (!containers.length) return;

    containers.forEach((el) => {
      const idMathch = /(?<=\/post\/show\/)\d+|(?<=\/post\/browse#)\d+/.exec(el.href);
      if (!idMathch) return;
      const id = idMathch[0];

      const oldBtn = el.querySelector<ThumbnailButton>('pdl-button');
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

            if (image.src.includes('blacklisted-preview.png')) {
              return;
            }

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
      const oldBtn = document.querySelector('pdl-button[type]');
      if (oldBtn) oldBtn.remove();

      const id = postId!.textContent ?? '';
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

  protected pageAction() {
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

  protected observeColorScheme() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    if (query.matches) {
      this.setModalDarkMode();
    }

    query.addEventListener('change', (e) => {
      e.matches ? this.setModalDarkMode() : this.setModalLightMode();
    });
  }

  protected getBatchDownloadConfig(): undefined | BatchDownloadConfig<any, true | undefined> {
    // TODO
    return undefined;
  }
}
