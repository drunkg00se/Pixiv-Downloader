import { logger } from '@/lib/logger';
import { pixivApi } from '../api';
import { BookmarkRestrict } from '../types';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

const enum BookmarkType {
  main = 'main',
  sub = 'sub',
  rank = 'rank'
}

interface AddBookmarkOptionalParam {
  btn?: ThumbnailButton;
  tags?: string[];
  restrict?: BookmarkRestrict;
}

export async function addBookmark(
  illustId: string,
  token: string,
  optionalParams: AddBookmarkOptionalParam
) {
  const { btn, tags, restrict } = optionalParams ?? {};

  try {
    await pixivApi.addBookmark(illustId, token, tags, restrict);

    if (!btn) return;
    const bookmarkBtnRef = findBookmarkBtn(btn);
    if (!bookmarkBtnRef) return;
    switch (bookmarkBtnRef.kind) {
      case BookmarkType.main: {
        const pathBorder = bookmarkBtnRef.button.querySelector<SVGPathElement>('svg g path');
        pathBorder && (pathBorder.style.color = 'rgb(255, 64, 96)');
        break;
      }
      case BookmarkType.sub: {
        const pathBorder = bookmarkBtnRef.button.querySelector<SVGPathElement>('path');
        pathBorder && (pathBorder.style.color = 'rgb(255, 64, 96)');
        break;
      }
      case BookmarkType.rank: {
        bookmarkBtnRef.button.style.backgroundColor = 'rgb(255, 64, 96)';
        break;
      }
      default:
        break;
    }
  } catch (error) {
    logger.error(error);
  }
}
interface MainBookMark {
  kind: BookmarkType.main;
  button: HTMLButtonElement;
}

interface SubBookmark {
  kind: BookmarkType.sub;
  button: HTMLButtonElement;
}

interface RankBookmark {
  kind: BookmarkType.rank;
  button: HTMLDivElement;
}

type BookmarkButtonRef = MainBookMark | SubBookmark | RankBookmark;

function findBookmarkBtn(btn: ThumbnailButton): BookmarkButtonRef | void {
  const bookmarkBtnRef = {} as BookmarkButtonRef;

  if (!btn.dataset.type) {
    const favBtn =
      btn.parentElement?.nextElementSibling?.querySelector<HTMLButtonElement>(
        'button[type="button"]'
      );

    if (favBtn) {
      bookmarkBtnRef.kind = BookmarkType.sub;
      bookmarkBtnRef.button = favBtn;
    } else {
      //排行榜
      const favBtn = btn.parentElement?.querySelector<HTMLDivElement>('div._one-click-bookmark');
      if (favBtn) {
        bookmarkBtnRef.kind = BookmarkType.rank;
        bookmarkBtnRef.button = favBtn;
      }
    }
    // 动态页无收藏按钮
  } else if (btn.dataset.type === ThumbnailBtnType.PixivToolbar) {
    const favBtn = btn.parentElement?.parentElement?.querySelector<HTMLButtonElement>(
      'button.gtm-main-bookmark'
    );

    if (favBtn) {
      bookmarkBtnRef.kind = BookmarkType.main;
      bookmarkBtnRef.button = favBtn;
    }
  } else {
    return logger.warn(new Error('Can not find bookmark button.'));
  }

  return bookmarkBtnRef;
}
