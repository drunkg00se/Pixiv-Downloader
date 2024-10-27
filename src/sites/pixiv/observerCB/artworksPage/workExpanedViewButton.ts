import { downloadArtwork } from '../../downloadArtwork';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';

// 多图"展开全部"后各图片下载按钮
export function createWorkExpanedViewBtn(id: string, unlistedId?: string): void {
  const works = document.querySelectorAll<HTMLAnchorElement>(
    'figure a.gtm-expand-full-size-illust'
  );
  if (works.length < 2) return;

  works.forEach((work, idx) => {
    const container = work.parentElement?.parentElement;
    if (!container || container.querySelector('pdl-artwork-button')) return;

    container.appendChild(
      new ArtworkButton({
        id,
        page: idx,
        extraData: unlistedId ? { unlistedId } : undefined,
        onClick: downloadArtwork
      })
    );
  });
}
