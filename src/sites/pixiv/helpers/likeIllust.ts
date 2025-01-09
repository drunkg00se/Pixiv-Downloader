import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { pixivApi } from '../api';

function isArtworkPage(illustId: string) {
  return location.pathname.includes(`/artworks/${illustId}`);
}

export async function likeIllust(illustId: string, token: string) {
  await pixivApi.likeIllust(illustId, token);
  if (!isArtworkPage(illustId)) return;

  // disable like button
  const likeBtn = document.querySelector(
    `${ThumbnailButton.tagNameLowerCase}[data-type="pixiv-toolbar"]`
  )?.parentElement?.previousElementSibling?.firstElementChild as
    | HTMLButtonElement
    | undefined
    | null;
  if (!likeBtn) return;

  likeBtn.disabled = true;
  likeBtn.style.color = '#0096fa';
  likeBtn.style.cursor = 'default';
}
