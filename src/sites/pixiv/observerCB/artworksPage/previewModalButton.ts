import { regexp } from '@/lib/regExp';
import { logger } from '@/lib/logger';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadArtwork } from '../../downloadArtwork';

export function createPreviewModalBtn() {
  //artworks插画页预览按钮class
  const illustModalBtn = document.querySelector(
    '.gtm-manga-viewer-preview-modal-open:not(.pdl-listened)'
  );

  //artworks漫画页预览按钮class
  const mangaModalBtn = document.querySelector('.gtm-manga-viewer-open-preview:not(.pdl-listened)');

  //漫画阅读器打开时，第一个元素是关闭阅读器按钮，此时存在.gtm-manga-viewer-open-preview
  const mangaViewerModalBtn = document.querySelectorAll(
    '.gtm-manga-viewer-close-icon:not(.pdl-listened)'
  )?.[1];
  if (!illustModalBtn && !mangaModalBtn && !mangaViewerModalBtn) return;

  [illustModalBtn, mangaModalBtn, mangaViewerModalBtn].forEach((node) => {
    if (node) {
      node.classList.add('pdl-listened');
      node.addEventListener('click', handleModalClick);
    }
  });
}

function handleModalClick(): void {
  //获得modal打开后的dom
  const timer = setInterval(() => {
    logger.info('Start to find modal.');
    const ulList = document.querySelectorAll('ul');
    const previewList = ulList[ulList.length - 1];
    if (getComputedStyle(previewList).display !== 'grid') return;

    clearInterval(timer);
    const [, id] = regexp.artworksPage.exec(location.pathname) ?? [];

    (previewList.childNodes as NodeListOf<HTMLLIElement>).forEach((node, idx) => {
      node.style.position = 'relative';
      node.appendChild(
        new ThumbnailButton({
          id,
          page: idx,
          onClick: downloadArtwork
        })
      );
    });
  }, 300);
}
