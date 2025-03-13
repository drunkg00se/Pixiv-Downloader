import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

// artworks页作品下载按钮
export function createToolbarBtn(
  id: string,
  downloadArtwork: (btn: ThumbnailButton) => void
): void {
  const toolbar = document.querySelector<HTMLElement>('main section section');
  if (!toolbar || toolbar.querySelector(ThumbnailButton.tagNameLowerCase)) return;

  const btn = new ThumbnailButton({
    id,
    type: ThumbnailBtnType.PixivToolbar,
    onClick: downloadArtwork
  });

  const pdlBtnWrap = toolbar.lastElementChild!.cloneNode();
  pdlBtnWrap.appendChild(btn);
  toolbar.appendChild(pdlBtnWrap);
}
