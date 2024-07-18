import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadArtwork } from '../../downloadArtwork';

// 多图"展开全部"后各图片下载按钮
export function createWorkScrollBtn(id: string): void {
  const works = document.querySelectorAll<HTMLAnchorElement>(
    'figure a.gtm-expand-full-size-illust'
  );
  if (works.length < 2) return;

  const containers = Array.from(works).map(
    (node) => node.parentElement!.parentElement as HTMLElement
  );

  //避免重复增加按钮
  const elementToAppend = Array.from(containers).filter((el) => !el.querySelector('pdl-button'));
  if (!elementToAppend.length) return;

  elementToAppend.forEach((node, idx) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('pdl-wrap-artworks');

    wrapper.appendChild(
      new ThumbnailButton({
        id,
        page: idx,
        type: ThumbnailBtnType.Gallery,
        onClick: downloadArtwork
      })
    );
    node.appendChild(wrapper);
  });
}
