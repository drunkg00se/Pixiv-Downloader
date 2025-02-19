import type { MediaMeta } from '../../interface';
import type { ValidatedIdGenerator } from '@/lib/components/Downloader/useBatchDownload';
import type { GelbooruPostDataV020 } from './api';
import { logger } from '@/lib/logger';

export type GelbooruMeta = MediaMeta & {
  character: string;
  rating: GelbooruPostDataV020['rating'];
  source: string;
};

export interface GelbooruHtmlPostDataV020 {
  id: string;
  tags: string[];
  rating: string;
  score: number;
  user: string;
}

interface IGelbooruParserV020 {
  buildMeta(id: string, doc: Document): GelbooruMeta;
  parseBlacklistTags(): string[];
  parsePostsByDoc(doc: Document): GelbooruHtmlPostDataV020[];
  parseFavoriteByDoc(doc: Document): GelbooruHtmlPostDataV020[];
  paginationGenerator: ValidatedIdGenerator<
    GelbooruMeta,
    [thumbsPerPage: number, (page: number) => Promise<GelbooruHtmlPostDataV020[]>]
  >;
}

export class GelbooruParserV020 implements IGelbooruParserV020 {
  protected parseArtworkSrc(doc: Document): string {
    return doc.querySelector('meta[property="og:image"]')!.getAttribute('content')!;
  }

  protected parseArtworkNameBySrc(src: string): [title: string, ext: string] {
    const imageNameMatch = /(?<=\/)\w+\.\w+(?=\?|$)/.exec(src);
    if (!imageNameMatch) throw new Error('Can not parse image name from src.');

    const imageName = imageNameMatch[0];
    return imageName.split('.') as [string, string];
  }

  protected parseTags(doc: Document) {
    const artist: string[] = [];
    const character: string[] = [];
    const tags: string[] = [];

    const tagEls = doc.querySelectorAll<HTMLLIElement>('li[class*="tag-type"]');
    tagEls.forEach((tagEl) => {
      const tagTypeMatch = /(?<=tag-type-)\w+/.exec(tagEl.className);
      if (!tagTypeMatch) throw new Error('Unknown tag: ' + tagEl.className);

      const tagType = tagTypeMatch[0];
      const tag = (
        tagEl.querySelector<HTMLAnchorElement>('a[href*="page=post"]')?.textContent || ''
      ).replaceAll(' ', '_');

      if (tagType === 'artist') {
        artist.push(tag);
      } else if (tagType === 'character') {
        character.push(tag);
      }

      tags.push(tagType + ':' + tag);
    });

    return {
      artist,
      character,
      tags
    };
  }

  protected parseStatistics(doc: Document) {
    const uploaderEl = doc.querySelector<HTMLAnchorElement>('a[href*="page=account&s=profile"]');
    const postDateStr = uploaderEl?.parentElement?.firstChild?.nodeValue;
    const postDate = postDateStr ? postDateStr.split(': ')[1] : '';

    let source = '';
    const sourceEl = uploaderEl?.parentElement?.nextElementSibling?.nextElementSibling as
      | HTMLLIElement
      | undefined
      | null;

    if (sourceEl && /^source:/i.test(sourceEl.textContent ?? '')) {
      const sourceLink = sourceEl.querySelector('a');
      if (sourceLink) {
        source = sourceLink.href;
      } else {
        source = sourceEl.textContent?.replace(/^source: ?/i, '') ?? '';
      }
    }

    const rating = /Rating: ?(General|Explicit|Questionable|Safe|Sensitive)/
      .exec(doc.documentElement.innerHTML)![1]
      .toLowerCase() as GelbooruPostDataV020['rating'];

    return {
      postDate,
      source,
      rating
    };
  }

  buildMeta(id: string, doc: Document): GelbooruMeta {
    const src = this.parseArtworkSrc(doc);
    const [title, extendName] = this.parseArtworkNameBySrc(src);
    const { artist, character, tags } = this.parseTags(doc);
    const { postDate, source, rating } = this.parseStatistics(doc);

    return {
      id,
      src,
      extendName,
      artist: artist.join(',') || 'UnknownArtist',
      character: character.join(',') || 'UnknownCharacter',
      title,
      tags,
      createDate: postDate,
      source,
      rating
    };
  }

  parseBlacklistTags(): string[] {
    const [tagsStr] = /(?<=tag_blacklist=).*?(?=;|$)/.exec(document.cookie) ?? [];
    if (!tagsStr) return [];

    const tags = decodeURIComponent(decodeURIComponent(tagsStr));
    return tags.split(' ');
  }

  parseFavoriteByDoc(doc: Document): GelbooruHtmlPostDataV020[] {
    const favDataScripts = doc.querySelectorAll<HTMLScriptElement>('span + script');

    const favData = Array.from(favDataScripts).map((el) => {
      const content = el.textContent!;
      const [id] = /(?<=posts\[)[0-9]+?(?=\])/.exec(content)!;
      const [dataStr] = content.match(/{.+}/)!;

      const { tags, rating, score, user } = JSON.parse(
        dataStr.replace('.split(/ /g)', '').replaceAll("'", '"')
      ) as Omit<GelbooruHtmlPostDataV020, 'id' | 'tags'> & { tags: string };

      return {
        id,
        tags: decodeURIComponent(tags).split(/\s/g),
        rating: rating.toLowerCase(),
        score: +score,
        user
      };
    });

    return favData;
  }

  parsePostsByDoc(doc: Document): GelbooruHtmlPostDataV020[] {
    // gelbooru posts list: thumbnail-preview > a[id]
    const imageItems = Array.from(doc.querySelectorAll('span[id], .thumbnail-preview > a[id]'));
    const postData = imageItems.map((el) => {
      const image = el.querySelector('img')!;
      const fullTags = image.title.trim().replaceAll(/ +/g, ' ').split(' ');

      const id = el.id.slice(1);
      const tags: string[] = [];
      let rating: string = '';
      let score: number = 0;
      let user: string = '';

      for (let i = 0; i < fullTags.length; i++) {
        const tag = fullTags[i];
        if (tag.startsWith('rating:')) {
          rating = tag.slice(7);
        } else if (tag.startsWith('score:')) {
          score = +tag.slice(6);
        } else if (tag.startsWith('user:')) {
          user = tag.slice(5);
        } else {
          tags.push(tag);
        }
      }

      return {
        id,
        tags,
        rating,
        score: +score,
        user
      };
    });

    logger.info(`Parse posts in ${doc.URL}:`, postData);

    return postData;
  }

  async *paginationGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<GelbooruMeta>) => Promise<boolean>,
    thumbsPerPage: number,
    getPostDataCallback: (page: number) => Promise<GelbooruHtmlPostDataV020[]>
  ) {
    const [pageStart = 1, pageEnd = 0] = pageRange ?? [];

    let page = pageStart;
    let postData: GelbooruHtmlPostDataV020[] | null = await getPostDataCallback(page);
    let total = postData.length;
    let fetchError: Error | null = null;

    if (total === 0) throw new Error(`There is no post in page ${page}.`);

    do {
      let nextPageData: GelbooruHtmlPostDataV020[] | null = null;

      // fetch next page's post data.
      if (page !== pageEnd && postData.length >= thumbsPerPage) {
        try {
          nextPageData = await getPostDataCallback(page + 1);
          if (nextPageData.length) {
            total += nextPageData.length;
          } else {
            nextPageData = null;
          }
        } catch (error) {
          fetchError = error as Error;
          nextPageData = null;
        }
      }

      const avaliable: string[] = [];
      const invalid: string[] = [];
      const unavaliable: string[] = [];

      for (let i = 0; i < postData.length; i++) {
        const { id, tags } = postData[i];
        const validityCheckMeta: Partial<GelbooruMeta> = {
          id,
          tags
        };
        const isValid = await checkValidity(validityCheckMeta);
        isValid ? avaliable.push(id) : invalid.push(id);
      }

      yield {
        total,
        page,
        avaliable,
        invalid,
        unavaliable
      };

      page++;
      postData = nextPageData;
    } while (postData);

    if (fetchError) throw fetchError;
  }
}
