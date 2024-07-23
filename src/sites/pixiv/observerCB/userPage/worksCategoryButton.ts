import { isDownloading, downloadBookmarksOrTags } from '@/sites/pixiv/helpers/batchDownload';
import { getSelfId } from '@/sites/pixiv/helpers/getSelfId';
import { createPdlBtn } from '@/lib/components/Button/pdlButton';
import type { Category, BookmarksRest } from '../../types';
import { regexp } from '@/lib/regExp';
import { ArtworkTagButton } from '@/lib/components/Pixiv/artworkTagButton';

//根据location.search来判断需要查询的tag种类
export type TagsCategory = 'artworks' | 'illustrations' | 'manga' | 'bookmarks';
export function createTagsBtn(userId: string, category: TagsCategory) {
  const tagsEles = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[status]'));
  if (!tagsEles.length) return;

  let cate: Category;
  if (category === 'illustrations' || category === 'artworks') {
    cate = 'illusts';
  } else {
    cate = category;
  }

  let rest: BookmarksRest = 'show';
  if (userId === getSelfId() && category === 'bookmarks' && location.search.includes('rest=hide'))
    rest = 'hide';

  tagsEles.forEach((ele) => {
    if (ele.nextElementSibling?.tagName === 'PDL-ARTWORK-TAG') return;

    const artworkTagBtn = new ArtworkTagButton(ele);
    artworkTagBtn.addEventListener('click', downloadBookmarksOrTags);

    // 下载中切换tag页面而重新生成的tag不应该可点击，收藏页面不会重新生成tag
    if (isDownloading) artworkTagBtn.setAttribute('disabled', '');

    ele.parentElement!.appendChild(artworkTagBtn);
  });

  //标签搜索对话框
  // const tagFilter = document.querySelector("section .gm-profile-work-list-tag-filter-click");
  // if (tagFilter) return;
  let modalTagsEles: NodeListOf<HTMLAnchorElement>;
  let modal: HTMLDivElement | null;
  if (category === 'bookmarks') {
    modal = document.querySelector('div[role="presentation"]');
    if (!modal) return;
    modalTagsEles = modal.querySelectorAll('a');
  } else {
    const charcoalTokens = document.querySelectorAll<HTMLDivElement>('.charcoal-token');
    modal = charcoalTokens[charcoalTokens.length - 1];
    if (!modal) return;
    modalTagsEles = modal.querySelectorAll<HTMLAnchorElement>('a');
  }

  if (!regexp.userPageTags.exec(modalTagsEles[0]?.href)) return;
  modalTagsEles.forEach((ele) => {
    if (ele.querySelector('.pdl-btn')) return;
    let tag;
    if (rest === 'hide') {
      tag = ele.href.slice(ele.href.lastIndexOf('/') + 1, ele.href.lastIndexOf('?'));
    } else {
      tag = ele.href.slice(ele.href.lastIndexOf('/') + 1);
    }

    // const tag = ele.href.slice(ele.href.lastIndexOf("/") + 1);
    const attrs = {
      attrs: { 'pdl-userId': userId, category: cate, tag, rest },
      classList: ['pdl-btn', 'pdl-modal-tag']
    };
    //如果正在下载，不显示hover样式和屏蔽点击事件
    if (isDownloading) attrs.classList.push('pdl-tag-hide');
    const dlBtn = createPdlBtn(attrs);
    dlBtn.addEventListener('click', (evt) => {
      //关闭modal
      modal!.querySelector('svg')!.parentElement!.click();
      downloadBookmarksOrTags(evt);
    });
    ele.appendChild(dlBtn);
  });
}
