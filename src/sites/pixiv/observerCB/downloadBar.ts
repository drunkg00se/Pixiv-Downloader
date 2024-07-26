import t from '@/lib/lang';
import { createPdlBtn } from '@/lib/components/Button/pdlButton';
import {
  downloadFollowLatest,
  downloadWorks,
  downloadBookmarksOrTags,
  downloadSearchResult
} from '../helpers/batchDownload';
import { config, type ConfigData } from '@/lib/config';
import { getSelfId } from '@/sites/pixiv/helpers/getSelfId';

export type FilterOption = Pick<
  ConfigData,
  'filterExcludeDownloaded' | 'filterIllusts' | 'filterManga' | 'filterUgoira'
>;

export type FilterType = keyof FilterOption;

type FilterRefsType = Record<FilterType, HTMLInputElement | undefined>;

interface DlBarType {
  filter: FilterRefsType;
  statusBar?: HTMLDivElement;
  abortBtn?: HTMLButtonElement;
}

export const dlBarRef: DlBarType = {
  filter: {
    filterExcludeDownloaded: undefined,
    filterIllusts: undefined,
    filterManga: undefined,
    filterUgoira: undefined
  },
  statusBar: undefined,
  abortBtn: undefined
};

export function updateStatus(str: string) {
  dlBarRef.statusBar && (dlBarRef.statusBar.textContent = str);
}

function createFilterEl(id: string, filterType: FilterType, text: string): HTMLDivElement {
  const checkbox = document.createElement('input');
  const label = document.createElement('label');

  checkbox.id = id;
  checkbox.type = 'checkbox';
  checkbox.classList.add('pdl-checkbox');
  checkbox.setAttribute('category', String(filterType));
  checkbox.checked = config.get(filterType);

  label.setAttribute('for', id);
  label.setAttribute('category', String(filterType));
  label.textContent = text;

  checkbox.addEventListener('change', (evt) => {
    const checkbox = evt.currentTarget as HTMLInputElement;
    const category = checkbox.getAttribute('category') as FilterType;
    config.set(category, checkbox.checked);
  });

  dlBarRef.filter[filterType] = checkbox;
  const wrap = document.createElement('div');
  wrap.classList.add('pdl-filter');
  wrap.appendChild(checkbox);
  wrap.appendChild(label);
  return wrap;
}

export function createFilter(): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.classList.add('pdl-filter-wrap');

  wrapper.appendChild(
    createFilterEl(
      'pdl-filter-exclude_downloaded',
      'filterExcludeDownloaded',
      t('checkbox.filter_exclude_downloaded')
    )
  );
  wrapper.appendChild(
    createFilterEl('pdl-filter-illusts', 'filterIllusts', t('checkbox.filter_illusts'))
  );
  wrapper.appendChild(
    createFilterEl('pdl-filter-manga', 'filterManga', t('checkbox.filter_manga'))
  );
  wrapper.appendChild(
    createFilterEl('pdl-filter-ugoira', 'filterUgoira', t('checkbox.filter_ugoira'))
  );

  return wrapper;
}

export function createExcludeDownloadedFilter() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('pdl-filter-wrap');

  wrapper.appendChild(
    createFilterEl(
      'pdl-filter-exclude_downloaded',
      'filterExcludeDownloaded',
      t('checkbox.filter_exclude_downloaded')
    )
  );

  return wrapper;
}

export function createDownloadBar(userId: string): void {
  const nav = document.querySelector('nav');

  // 分页nav的previousElementSibling不为空
  // 增加下载栏后导航nav的previousElementSibling为pdl-filter-wrap
  if (!nav || nav.previousElementSibling) return;

  // 不同用户页返回前进时下载栏应该更新
  const dlBtn = nav.querySelector('.pdl-btn-all');
  if (dlBtn) {
    if (dlBtn.getAttribute('pdl-userid') === userId) return;
    removeDownloadBar();
  }

  // 约稿页nav的元素似乎会先插入主页，导致dlbar插入在主页按钮后
  // 无插画，漫画，收藏的用户不创建下载栏(https://www.pixiv.net/users/78011277)
  const doesRequestPageLoaded = [
    "a[href$='illustrations']",
    "a[href$='manga']",
    "a[href*='bookmarks']"
  ].some((selector) => !!nav.querySelector(selector));
  if (!doesRequestPageLoaded) return;

  const dlBar = document.createElement('div');
  dlBar.classList.add('pdl-dlbar');
  const statusBar = document.createElement('div');
  statusBar.classList.add('pdl-dlbar-status_bar');
  dlBarRef.statusBar = dlBar.appendChild(statusBar);

  const baseClasses = nav.querySelector<HTMLAnchorElement>('a:not([aria-current])')!.classList;

  dlBarRef.abortBtn = dlBar.appendChild(
    createPdlBtn({
      attrs: { 'pdl-userId': userId },
      classList: [...baseClasses, 'pdl-stop', 'pdl-hide'],
      textContent: t('button.download_stop')
    })
  );

  if (userId !== getSelfId()) {
    const hasWorks = ["a[href$='illustrations']", "a[href$='manga']"].some(
      (selector) => !!nav.querySelector(selector)
    );

    if (hasWorks) {
      const el = createPdlBtn({
        attrs: { 'pdl-userid': userId },
        classList: [...baseClasses, 'pdl-btn-all'],
        textContent: t('button.download_works')
      });
      el.addEventListener('click', downloadWorks);
      dlBar.appendChild(el);
    }

    if (nav.querySelector("a[href*='bookmarks']")) {
      const el = createPdlBtn({
        attrs: { 'pdl-userid': userId, category: 'bookmarks' },
        classList: [...baseClasses, 'pdl-btn-all'],
        textContent: t('button.download_bookmarks')
      });
      el.addEventListener('click', downloadBookmarksOrTags);
      dlBar.appendChild(el);
    }
  } else {
    //个人页面 只显示收藏
    if (nav.querySelector("a[href*='bookmarks']")) {
      dlBar.appendChild(
        createPdlBtn({
          attrs: { 'pdl-userid': userId, category: 'bookmarks', rest: 'all' },
          classList: [...baseClasses, 'pdl-btn-all'],
          textContent: t('button.download_bookmarks')
        })
      );
      dlBar.appendChild(
        createPdlBtn({
          attrs: {
            'pdl-userid': userId,
            category: 'bookmarks',
            rest: 'show'
          },
          classList: [...baseClasses, 'pdl-btn-all'],
          textContent: t('button.download_bookmarks_public')
        })
      );
      dlBar.appendChild(
        createPdlBtn({
          attrs: {
            'pdl-userid': userId,
            category: 'bookmarks',
            rest: 'hide'
          },
          classList: [...baseClasses, 'pdl-btn-all'],
          textContent: t('button.download_bookmarks_private')
        })
      );
      dlBar.querySelectorAll<HTMLButtonElement>('.pdl-btn-all').forEach((node) => {
        node.addEventListener('click', downloadBookmarksOrTags);
      });
    }
  }

  const filter = createFilter();
  nav.parentElement!.insertBefore(filter, nav);
  nav.appendChild(dlBar);
}

export function removeDownloadBar() {
  const dlBarWrap = document.querySelector('.pdl-dlbar');
  if (dlBarWrap) {
    dlBarWrap.remove();
    document.querySelector('.pdl-filter-wrap')?.remove();
  }
}

function updateFollowLatestDownloadBarBtnText(
  prevDlBtn: HTMLButtonElement,
  prevDlAllBtn: HTMLButtonElement
): void {
  if (
    location.pathname.includes('r18') &&
    prevDlBtn.textContent !== t('button.download_r18_one_page')
  ) {
    prevDlBtn.textContent = t('button.download_r18_one_page');
    prevDlAllBtn.textContent = t('button.download_r18');
  } else if (
    !location.pathname.includes('r18') &&
    prevDlBtn.textContent !== t('button.download_all_one_page')
  ) {
    prevDlBtn.textContent = t('button.download_all_one_page');
    prevDlAllBtn.textContent = t('button.download_all');
  }
}

export function createFollowLatestDownloadBar() {
  const prevDlBtn = document.querySelector<HTMLButtonElement>('.pdl-btn-all');
  if (prevDlBtn) {
    const prevDlAllBtn = document.querySelector('.pdl-dl-all') as HTMLButtonElement;
    updateFollowLatestDownloadBarBtnText(prevDlBtn, prevDlAllBtn);
    return;
  }

  const nav = document.querySelector('nav');
  if (!nav || nav.parentElement!.childElementCount === 1) return;

  const navBar = nav.parentElement as HTMLDivElement;
  const modeSwitch = nav.nextElementSibling as HTMLDivElement;
  const filter = createFilter();
  navBar.parentElement!.insertBefore(filter, navBar);

  const dlBar = document.createElement('div');
  dlBar.classList.add('pdl-dlbar');
  dlBar.classList.add('pdl-dlbar-follow_latest');
  //状态栏
  const statusBar = document.createElement('div');
  statusBar.classList.add('pdl-dlbar-status_bar');
  dlBarRef.statusBar = dlBar.appendChild(statusBar);

  //下载按钮
  const baseClasses = nav.querySelector<HTMLAnchorElement>('a:not([aria-current])')!.classList;

  dlBarRef.abortBtn = dlBar.appendChild(
    createPdlBtn({
      attrs: { 'pdl-userid': '' },
      classList: [...baseClasses, 'pdl-stop', 'pdl-hide'],
      textContent: t('button.download_stop')
    })
  );

  const dlBtn = createPdlBtn({
    attrs: { 'pdl-userid': '' },
    classList: [...baseClasses, 'pdl-btn-all'],
    textContent: t('button.download_works')
  });
  dlBtn.addEventListener('click', downloadFollowLatest);
  dlBar.appendChild(dlBtn);

  const dlAllBtn = createPdlBtn({
    attrs: { 'pdl-userid': '' },
    classList: [...baseClasses, 'pdl-btn-all', 'pdl-dl-all'],
    textContent: t('button.download_works')
  });
  dlAllBtn.addEventListener('click', downloadFollowLatest);
  dlBar.appendChild(dlAllBtn);

  navBar.insertBefore(dlBar, modeSwitch);
}

export function createSearchDownloadbar() {
  if (document.querySelector('.pdl-dlbar')) return;
  // 首个section可能为热门作品
  const sections = document.querySelectorAll('section');
  const worksSection = sections[sections.length - 1];
  const styleRefEle = document.querySelector('nav a:not([aria-current])');
  if (!worksSection || !styleRefEle) return;

  const dlBarContainer = worksSection.firstElementChild!.firstElementChild!;
  const dlBar = document.createElement('div');
  dlBar.classList.add('pdl-dlbar');
  dlBar.classList.add('pdl-dlbar-search');
  //状态栏
  const statusBar = document.createElement('div');
  statusBar.classList.add('pdl-dlbar-status_bar');
  dlBarRef.statusBar = dlBar.appendChild(statusBar);

  //下载按钮
  const baseClasses = styleRefEle.classList;
  dlBarRef.abortBtn = dlBar.appendChild(
    createPdlBtn({
      attrs: { 'pdl-userid': '' },
      classList: [...baseClasses, 'pdl-stop', 'pdl-hide'],
      textContent: t('button.download_stop')
    })
  );

  const dlBtn = createPdlBtn({
    attrs: { 'pdl-userid': '' },
    classList: [...baseClasses, 'pdl-btn-all'],
    textContent: t('button.download_all_one_page')
  });
  dlBtn.addEventListener('click', downloadSearchResult);

  const filter = createExcludeDownloadedFilter();
  dlBarContainer.parentElement!.insertBefore(filter, dlBarContainer);
  dlBar.appendChild(dlBtn);
  dlBarContainer.appendChild(dlBar);
}

export function changeDlbarDisplay(): void {
  document.querySelectorAll('.pdl-dlbar .pdl-btn-all').forEach((ele) => {
    ele.classList.toggle('pdl-hide');
  });

  document.querySelector('.pdl-dlbar .pdl-stop')?.classList.toggle('pdl-hide');

  document.querySelectorAll('pdl-artwork-tag, pdl-tag-list-button').forEach((ele) => {
    if (ele.hasAttribute('disabled')) {
      ele.removeAttribute('disabled');
    } else {
      ele.setAttribute('disabled', '');
    }
  });

  document.querySelector('.pdl-filter-wrap')?.classList.toggle('pdl-unavailable');
}
