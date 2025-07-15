import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

export function createHomeRecommendBtn(
  elements: HTMLElement[],
  downloadArtwork: (btn: ThumbnailButton) => void
) {
  if (elements.length === 0) return;

  elements.forEach((element) => {
    const workContent = element.querySelector<HTMLDivElement>(
      '[data-ga4-entity-id^="manga"], [data-ga4-entity-id^="illust"]'
    );
    const bookmarkBtn = workContent?.querySelector<HTMLButtonElement>(
      'div.justify-between > [data-ga4-label="bookmark_button"]'
    );

    if (!workContent || !bookmarkBtn) return;

    const id = workContent.dataset.ga4EntityId?.match(/([0-9]+)/)?.[0];
    if (!id) throw new Error('ID not found in data-ga4-entity-id');

    const title = bookmarkBtn.previousElementSibling as HTMLDivElement;
    title.style.maxWidth = 'calc(100% - 68px)'; // adjust title width

    const btn = new ThumbnailButton({
      id,
      type: ThumbnailBtnType.PixivToolbar,
      onClick: downloadArtwork
    });

    const btnWarpper = document.createElement('div');
    btnWarpper.className = 'flex flex-row gap-4';
    btnWarpper.appendChild(btn);
    bookmarkBtn.parentElement!.insertBefore(btnWarpper, bookmarkBtn);
    btnWarpper.appendChild(bookmarkBtn);
  });
}
