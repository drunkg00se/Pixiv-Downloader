import { downloadArtwork } from '../../downloadArtwork';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';

// 多图"展开全部"后各图片下载按钮
export function createWorkExpanedViewBtn(id: string, unlistedId?: string): void {
  const works = document.querySelectorAll<HTMLAnchorElement>(
    'figure a.gtm-expand-full-size-illust'
  );
  if (works.length < 2) return;

  const containers = Array.from(works).map(
    (node) => node.parentElement!.parentElement as HTMLElement
  );

  //避免重复增加按钮
  const elementToAppend = Array.from(containers).filter(
    (el) => !el.querySelector('pdl-artwork-button')
  );
  if (!elementToAppend.length) return;

  elementToAppend.forEach((node, idx) => {
    node.appendChild(
      new ArtworkButton({
        id,
        page: idx,
        extraData: unlistedId ? { unlistedId } : undefined,
        onClick: downloadArtwork
      })
    );
  });
}
