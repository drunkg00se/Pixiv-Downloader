import { regexp } from '@/lib/regExp';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { logger } from '@/lib/logger';

let observer: MutationObserver | null;
let btn: ThumbnailButton | null;

// 预览大图的下载按钮
export function createPresentationBtn(
  id: string,
  downloadArtwork: (btn: ThumbnailButton) => void,
  unlistedId?: string
) {
  //侧边栏也符合选择符匹配
  const containers = document.querySelector("body > [role='presentation'] div[class]");

  if (!containers) {
    if (observer) {
      // 关闭预览后btn元素会随container一起移除，不需要额外处理
      observer.disconnect();
      observer = null;
      btn = null;
    }
    return;
  }
  if (containers.querySelector(ThumbnailButton.tagNameLowerCase)) return;

  // 避免匹配到侧边栏pixiv图标: a > img
  const img = containers.querySelector<HTMLImageElement>('div > img');
  if (!img) return;
  const isOriginImg = regexp.originSrcPageNum.exec(img.src);
  if (!isOriginImg) return;

  const [pageNum] = isOriginImg;

  btn = new ThumbnailButton({
    id,
    type: ThumbnailBtnType.PixivPresentation,
    page: Number(pageNum),
    extraData: unlistedId ? { unlistedId } : undefined,
    onClick: downloadArtwork
  });

  containers.appendChild(btn);

  // 跟踪多图id的img元素变化
  observer = new MutationObserver((mutationList) => {
    // mutationList[0] is the record that removes the img
    const newImg = mutationList[1]['addedNodes'][0] as HTMLImageElement;
    const [pageNum] = regexp.originSrcPageNum.exec(newImg.src) ?? [];
    if (!pageNum) return logger.throw('Invalid image element.');

    btn?.remove();
    btn = new ThumbnailButton({
      id,
      type: ThumbnailBtnType.PixivPresentation,
      page: Number(pageNum),
      extraData: unlistedId ? { unlistedId } : undefined,
      onClick: downloadArtwork
    });
    containers.appendChild(btn);
  });
  observer.observe(img.parentElement!, { childList: true, subtree: true });
}
