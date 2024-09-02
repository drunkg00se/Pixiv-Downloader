import { RequestError } from '@/lib/error';
import type { MediaMeta, SiteParser } from '../interface';

export type Rule34Meta = MediaMeta & { character: string };

export const rule34Parser: SiteParser<Rule34Meta> = {
  async parse(id: string): Promise<Rule34Meta> {
    const res = await fetch('index.php?page=post&s=view&id=' + id);
    if (!res.ok) throw new RequestError(res.url, res.status);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const src =
      doc.querySelector<HTMLSourceElement>('#gelcomVideoPlayer > source')?.src ||
      doc.querySelector('meta[property="og:image"]')!.getAttribute('content')!;

    const imageNameMatch = /(?<=\/)\w+\.\w+(?=\?)/.exec(src);
    if (!imageNameMatch) throw new Error('Can not parse image name from src.');

    const imageName = imageNameMatch[0];
    const [title, extendName] = imageName.split('.');

    const artists: string[] = [];
    const characters: string[] = [];
    const tags: string[] = [];

    const tagEls = doc.querySelectorAll<HTMLLIElement>('li[class*="tag-type"]');
    tagEls.forEach((tagEl) => {
      const tagTypeMatch = /(?<=tag-type-)\w+/.exec(tagEl.className);
      if (!tagTypeMatch) throw new Error('Unknown tag: ' + tagEl.className);

      const tagType = tagTypeMatch[0];
      const tag = tagEl.querySelector<HTMLAnchorElement>('a[href*="page=post"]')?.textContent || '';

      if (tagType === 'artist') {
        artists.push(tag);
      } else if (tagType === 'character') {
        characters.push(tag);
      }

      tags.push(tagType + ':' + tag);
    });

    const uploaderEl = doc.querySelector<HTMLAnchorElement>('a[href*="page=account&s=profile"]');
    const postDateStr = uploaderEl?.parentElement?.firstChild?.nodeValue;
    const postDate = postDateStr ? postDateStr.split(': ')[1] : '';

    const sourceEl = uploaderEl?.parentElement?.nextElementSibling?.nextElementSibling as
      | HTMLLIElement
      | undefined
      | null;

    if (sourceEl && sourceEl.textContent?.toLowerCase().includes('source')) {
      const sourceLink = sourceEl.querySelector('a');
      if (sourceLink) {
        tags.push('source:' + sourceLink.href);
      } else {
        tags.push('source:' + sourceEl.textContent.replace('Source: ', ''));
      }
    }

    return {
      id,
      src,
      extendName,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      title,
      tags,
      createDate: postDate
    };
  }
};
