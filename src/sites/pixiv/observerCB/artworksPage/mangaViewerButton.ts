import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadArtwork } from '../../downloadArtwork';

export function createMangaViewerBtn(id: string, unlistedId?: string): void {
  const mangaViewerBackBtn = document.querySelector<HTMLDivElement>('.gtm-manga-viewer-close-icon');
  if (!mangaViewerBackBtn) return;

  const container = mangaViewerBackBtn.parentElement!;
  if (container.querySelector('pdl-button')) return;

  container.appendChild(
    new ThumbnailButton({
      id,
      type: ThumbnailBtnType.PixivMangaViewer,
      extraData: unlistedId ? { unlistedId } : undefined,
      onClick: downloadArtwork
    })
  );
}
