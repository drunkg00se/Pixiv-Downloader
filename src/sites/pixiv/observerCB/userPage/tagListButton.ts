import { isDownloading, downloadBookmarksOrTags } from '@/sites/pixiv/helpers/batchDownload';
import { regexp } from '@/lib/regExp';
import { TagListButton } from '@/lib/components/Pixiv/tagListButton';

//根据location.search来判断需要查询的tag种类
export type TagsCategory = 'artworks' | 'illustrations' | 'manga' | 'bookmarks';
export function createTagListBtn(userId: string, category: TagsCategory) {
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
    if (ele.querySelector('pdl-tag-list-button')) return;

    const btn = new TagListButton(ele.href, (evt) => {
      //关闭modal
      modal!.querySelector('svg')!.parentElement!.click();
      downloadBookmarksOrTags(evt);
    });

    //如果正在下载，不显示hover样式和屏蔽点击事件
    if (isDownloading) btn.setAttribute('disabled', '');
    ele.appendChild(btn);
  });
}
