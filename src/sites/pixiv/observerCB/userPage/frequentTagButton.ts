import { isDownloading, downloadBookmarksOrTags } from '@/sites/pixiv/helpers/batchDownload';
import { ArtworkTagButton } from '@/lib/components/Pixiv/artworkTagButton';

export function createFrequentTagBtn() {
  const tagsEles = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[status]'));
  if (!tagsEles.length) return;

  tagsEles.forEach((ele) => {
    if (ele.nextElementSibling?.tagName === 'PDL-ARTWORK-TAG') return;

    const artworkTagBtn = new ArtworkTagButton(ele);
    artworkTagBtn.addEventListener('click', downloadBookmarksOrTags);

    // 下载中切换tag页面而重新生成的tag不应该可点击，收藏页面不会重新生成tag
    if (isDownloading) artworkTagBtn.setAttribute('disabled', '');

    ele.parentElement!.appendChild(artworkTagBtn);
  });
}
