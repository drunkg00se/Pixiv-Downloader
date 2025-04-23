import { TagListButton } from '@/lib/components/Pixiv/tagListButton';
import type { TagProps } from '@/lib/components/Pixiv/artworkTagButton';

export function createTagListBtn(
  downloading: ReactiveValue<boolean>,
  handleDownload: (props: TagProps) => Promise<void>
) {
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
    if (ele.querySelector(TagListButton.tagNameLowerCase)) return;

    const btn = new TagListButton(ele.href, downloading, (props) => {
      // 关闭modal
      closeBtn?.click();

      return handleDownload(props);
    });

    ele.appendChild(btn);
  });
}
