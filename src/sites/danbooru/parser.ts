import { RequestError } from '@/lib/error';
import type { MediaMeta, SiteParser } from '../interface';
import { getElementText, sleep } from '@/lib/util';

export type DanbooruMeta = MediaMeta & { comment: string; character: string };

interface DanbooruParser extends SiteParser<DanbooruMeta> {
  getDoc(url: string): Promise<Document>;
  parse(id: string): Promise<DanbooruMeta>;
  getPoolPostCount(poolId: string): Promise<number>;
  genIdByPool(
    poolId: string,
    filter?: (id: string) => boolean | Promise<boolean>
  ): AsyncGenerator<string, void, void>;
}

export const danbooruParser: DanbooruParser = {
  async getDoc(url: string): Promise<Document> {
    const res = await fetch(url);
    if (!res.ok) throw new RequestError('Request failed with status code ' + res.status, res);
    const html = await res.text();
    return new DOMParser().parseFromString(html, 'text/html');
  },

  async parse(id: string): Promise<DanbooruMeta> {
    const doc = await this.getDoc('/posts/' + id);
    const src = doc.querySelector<HTMLAnchorElement>('a[download]')?.href;
    if (!src) throw new Error('Can not get media src');

    const ogImageMeta = doc.querySelector('meta[property="og:image"]')!;
    const mediaSrc = ogImageMeta.getAttribute('content')!;
    const title = mediaSrc.slice(mediaSrc.lastIndexOf('/') + 1).split('.')[0];

    const ogTypeMeta =
      doc.querySelector('meta[property="og:video:type"]') ||
      doc.querySelector('meta[property="og:image:type"]')!;
    const mimeType = ogTypeMeta.getAttribute('content')!;
    const extendName = mimeType.slice(mimeType.lastIndexOf('/') + 1);

    const artists: string[] = [];
    const characters: string[] = [];
    const tags: string[] = [];

    const tagLists = doc.querySelectorAll<HTMLUListElement>(
      'section#tag-list  ul[class*="-tag-list"]'
    );
    if (tagLists.length) {
      tagLists.forEach((ul) => {
        const tagTypeMatch = /[a-zA-Z]+(?=-tag-list)/.exec(ul.className);
        if (!tagTypeMatch) throw new Error('Unknown tag: ' + ul.className);

        const tagType = tagTypeMatch[0];
        const liEls = ul.children;

        let tagRef: string[] | undefined;
        if (tagType === 'artist') {
          tagRef = artists;
        } else if (tagType === 'character') {
          tagRef = characters;
        }

        for (let i = 0; i < liEls.length; i++) {
          const tag = liEls[i].getAttribute('data-tag-name');
          if (!tag) continue;

          tagRef && tagRef.push(tag);
          tags.push(tagType + ':' + tag);
        }
      });
    }

    const postDate = doc.querySelector('time')?.getAttribute('datetime') ?? '';

    const source = doc.querySelector<HTMLAnchorElement>('li#post-info-source > a')?.href;
    if (source) tags.push('source:' + source);

    // Comment
    let comment: string = '';
    const commentEl = doc.querySelector<HTMLElement>('#original-artist-commentary');
    commentEl && (comment = getElementText(commentEl));

    return {
      id,
      src,
      extendName,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      title,
      comment,
      tags,
      createDate: postDate
    };
  },

  async getPoolPostCount(poolId: string) {
    const doc = await this.getDoc(`/pools/${poolId}`);
    const nextEl = doc.querySelector('a.paginator-next');
    if (nextEl) {
      const lastPageEl = nextEl.previousElementSibling as HTMLAnchorElement;
      const poolPageCount = Number(lastPageEl.textContent);

      const lastPageDoc = await this.getDoc(lastPageEl.href);
      const postPerPage = Number(lastPageDoc.body.getAttribute('data-current-user-per-page'));
      const lastPagePostCount = lastPageDoc.querySelectorAll<HTMLElement>(
        '.posts-container article'
      ).length;
      return (poolPageCount - 1) * postPerPage + lastPagePostCount;
    } else {
      // pool只有一页
      const imageContainers = doc.querySelectorAll<HTMLElement>('.posts-container article');
      return imageContainers.length;
    }
  },

  async *genIdByPool(poolId: string, filter) {
    let page = 0;
    let nextUrl;

    do {
      ++page > 1 && (await sleep(1000));

      const doc = await this.getDoc(`/pools/${poolId}?page=${page}`);
      const nextEl = doc.querySelector('a.paginator-next');
      nextUrl = nextEl?.getAttribute('href') ?? '';

      const imageContainers = doc.querySelectorAll<HTMLElement>('.posts-container article');
      const ids = Array.from(imageContainers).map((el) => el.getAttribute('data-id')!);

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];

        const isValid = (await filter?.(id)) ?? true;
        if (isValid) {
          yield id;
          i !== id.length - 1 && (await sleep(1000));
        }
      }
    } while (nextUrl);
  }
};
