import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

export function createMangaViewerBtn(
  id: string,
  downloadArtwork: (btn: ThumbnailButton) => void,
  unlistedId?: string
): void {
  const mangaViewerBackBtn = document.querySelector<HTMLDivElement>('.gtm-manga-viewer-close-icon');
  if (!mangaViewerBackBtn) return;

  const container = mangaViewerBackBtn.parentElement;
  if (!container || container.querySelector(ThumbnailButton.tagNameLowerCase)) return;

  container.appendChild(
    new ThumbnailButton({
      id,
      type: ThumbnailBtnType.PixivMangaViewer,
      extraData: unlistedId ? { unlistedId } : undefined,
      onClick: downloadArtwork
    })
  );
}
