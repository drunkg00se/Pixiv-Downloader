import type { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { UnlistedArtworkToolbar } from '@/lib/components/Pixiv/unlistedToolbar';

export function createUnlistedToolbar(
  id: string,
  downloadArtwork: (btn: ThumbnailButton) => void,
  unlistedId: string
) {
  const toolbar = document.querySelector(UnlistedArtworkToolbar.tagNameLowerCase);
  if (toolbar) return;

  const container = document.querySelector('div[style^="transform: translateY"]');
  if (!container) return;

  const el = new UnlistedArtworkToolbar({
    id,
    onClick: downloadArtwork,
    extraData: {
      unlistedId
    }
  });

  container.appendChild(el);

  // reset show-all button's style
  const showAllBtn = container.querySelector<HTMLButtonElement>(
    'button[type="button"]:not([style])'
  );
  showAllBtn && (showAllBtn.style.bottom = '48px');
}
