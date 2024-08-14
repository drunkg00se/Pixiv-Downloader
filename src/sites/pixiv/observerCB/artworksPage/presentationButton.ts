import { regexp } from '@/lib/regExp';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadArtwork } from '../../downloadArtwork';

// 预览大图的下载按钮
export const createPresentationBtn: (id: string) => void = (() => {
  let observer: MutationObserver | null, btn: ThumbnailButton | null;

  function cb(mutationList: MutationRecord[]) {
    const newImg = mutationList[1]['addedNodes'][0] as HTMLImageElement;
    const [pageNum] = regexp.originSrcPageNum.exec(newImg.src) ?? [];
    if (!pageNum) throw new Error('[Error]Invalid Image Element.');
    btn!.dataset.page = String(pageNum);
  }

  return (id: string): void => {
    //侧边栏也符合选择符匹配
    const containers = document.querySelector("body > [role='presentation'] > div");
    if (!containers) {
      if (observer) {
        // 关闭预览后btn元素会随container一起移除，不需要额外处理
        observer.disconnect();
        observer = null;
        btn = null;
      }
      return;
    }
    if (containers.querySelector('pdl-button')) return;

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
      onClick: downloadArtwork
    });

    containers.appendChild(btn);

    if (!img.parentElement) return;
    // 跟踪多图id的img元素变化
    observer = new MutationObserver(cb);
    observer.observe(img.parentElement, { childList: true, subtree: true });
  };
})();
