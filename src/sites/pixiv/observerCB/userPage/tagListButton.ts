import { isDownloading, downloadBookmarksOrTags } from '@/sites/pixiv/helpers/batchDownload';
import { TagListButton } from '@/lib/components/Pixiv/tagListButton';

export function createTagListBtn() {
  const listContainer = document.querySelector('div[style*="position: relative"]');
  if (!listContainer) return;

  // bookmark: div[role="presentation"]
  // others: div[class="charcoal-token"]
  const modalRoot = listContainer?.closest('div[role="presentation"], div[class="charcoal-token"]');
  const closeBtn = modalRoot?.querySelector('svg')?.parentElement;

  const tagElements = listContainer.querySelectorAll<HTMLAnchorElement>(
    'div[style*="position: absolute"] a'
  );

  tagElements.forEach((ele) => {
    if (ele.querySelector('pdl-tag-list-button')) return;

    const btn = new TagListButton(ele.href, (evt) => {
      // 关闭modal
      closeBtn?.click();
      downloadBookmarksOrTags(evt);
    });

    // 如果正在下载，不显示hover样式和屏蔽点击事件
    if (isDownloading) btn.setAttribute('disabled', '');
    ele.appendChild(btn);
  });
}
