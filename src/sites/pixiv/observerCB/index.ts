import { createThumbnailBtn } from './createThumbnailBtn';
import { fixPixivPreviewer } from '../helpers/fixPixivPreviewer';
import { regexp } from '@/lib/regExp';
import { createTagListBtn } from './userPage/tagListButton';
import { createToolbarBtn } from './artworksPage/toolbarButton';
import { createWorkExpanedViewBtn } from './artworksPage/workExpanedViewButton';
import { createPresentationBtn } from './artworksPage/presentationButton';
import { createPreviewModalBtn } from './artworksPage/previewModalButton';
import { createMangaViewerBtn } from './artworksPage/mangaViewerButton';
import { createFrequentTagBtn } from './userPage/frequentTagButton';

function pageActions() {
  const pathname = location.pathname;
  let param: any;
  switch (true) {
    case !!(param = regexp.artworksPage.exec(pathname)): {
      const id = param[1];
      createToolbarBtn(id);
      createWorkExpanedViewBtn(id);
      createPresentationBtn(id);
      createPreviewModalBtn();
      createMangaViewerBtn(id);
      break;
    }
    case regexp.userPageTags.test(pathname): {
      createFrequentTagBtn();
      createTagListBtn();
      break;
    }
    case regexp.historyPage.test(pathname): {
      createThumbnailBtn(document.querySelectorAll<HTMLSpanElement>('span[style]._history-item'));
      break;
    }
    default:
      break;
  }
}

let firstRunFlag = true;
export function observerCallback(records: MutationRecord[]) {
  const addedNodes: HTMLElement[] = [];
  records.forEach((record) => {
    if (!record.addedNodes.length) return;
    (record.addedNodes as NodeListOf<HTMLElement>).forEach((node) => {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName !== 'PDL-BUTTON' &&
        node.tagName !== 'IMG'
      ) {
        addedNodes.push(node);
      }
    });
  });
  if (!addedNodes.length) return;

  //为小图添加下载按钮
  if (firstRunFlag) {
    //排行榜页前50不是动态加载，第一次加载没有Pdlbtn
    createThumbnailBtn(document.querySelectorAll('a'));
    firstRunFlag = false;
  } else {
    fixPixivPreviewer(addedNodes);

    const thumbnails = addedNodes.reduce((prev, current) => {
      //新增的node也没有pdlbtn
      return prev.concat(
        current instanceof HTMLAnchorElement ? [current] : Array.from(current.querySelectorAll('a'))
      );
    }, [] as HTMLAnchorElement[]);
    createThumbnailBtn(thumbnails);
  }

  pageActions();
}
