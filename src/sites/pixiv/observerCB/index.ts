import { createThumbnailBtn } from './thumbnailBtn';
import { fixPixivPreviewer } from '../helpers/fixPixivPreviewer';
import { regexp } from '@/lib/regExp';
import { createTagListBtn } from './userPage/tagListButton';
import {
  createDownloadBar,
  createFollowLatestDownloadBar,
  createSearchDownloadbar,
  removeDownloadBar
} from './downloadBar';
import { createToolbarBtn } from './artworksPage/toolbarButton';
import { createWorkScrollBtn } from './artworksPage/workScrollButton';
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
      createWorkScrollBtn(id);
      createPresentationBtn(id);
      createPreviewModalBtn();
      createMangaViewerBtn(id);
      break;
    }
    case !!(param = regexp.userPage.exec(pathname)): {
      // 正则匹配项不同，param[1]可能是undefined
      const id = param[1] || param[2];
      createDownloadBar(id);
      const matchTagPage = regexp.userPageTags.exec(pathname);
      if (matchTagPage) {
        createFrequentTagBtn();
        createTagListBtn();
      }
      break;
    }
    case regexp.followLatest.test(pathname): {
      createFollowLatestDownloadBar();
      break;
    }
    case regexp.searchPage.test(pathname): {
      createSearchDownloadbar();
      break;
    }
    case regexp.historyPage.test(pathname): {
      createThumbnailBtn(document.querySelectorAll<HTMLSpanElement>('span[style]._history-item'));
      break;
    }
    default:
      removeDownloadBar();
      break;
  }
}

let firstRun = true;
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
  if (firstRun) {
    //排行榜页前50不是动态加载，第一次加载没有Pdlbtn
    createThumbnailBtn(document.querySelectorAll('a'));
    firstRun = false;
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
