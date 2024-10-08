import { ArtworkTagButton } from '@/lib/components/Pixiv/artworkTagButton';

export function createFrequentTagBtn() {
  const tagsEles = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[status]'));
  if (!tagsEles.length) return;

  tagsEles.forEach((ele) => {
    if (ele.nextElementSibling?.tagName === 'PDL-ARTWORK-TAG') return;

    const artworkTagBtn = new ArtworkTagButton(ele);

    ele.parentElement!.appendChild(artworkTagBtn);
  });
}
