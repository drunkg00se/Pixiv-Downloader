import { RequestError } from '@/lib/error';
import type { MediaMeta, SiteParser } from '../interface';
import type { GenerateIdWithValidation } from '@/lib/components/Downloader/useBatchDownload';
import { rule34Api } from './api';
import { logger } from '@/lib/logger';

type Rating = 'safe' | 'questionable' | 'explicit';

export type Rule34Meta = MediaMeta & {
  character: string;
  rating: Rating;
  source: string;
};

interface Rule34WebPostData {
  id: string;
  tags: string[];
  rating: string;
  score: number;
  user: string;
}

interface Rule34Parser extends SiteParser<Rule34Meta> {
  _parsePostData(doc: Document): Rule34WebPostData[];
  _paginationGenerator: GenerateIdWithValidation<
    Rule34Meta,
    [thumbsPerPage: number, (page: number) => Promise<Rule34WebPostData[]>]
  >;
  parse(id: string): Promise<Rule34Meta>;
  parseFavorite(userId: string, pid: number): Promise<Rule34WebPostData[]>;
  parsePool(poolId: string): Promise<Rule34WebPostData[]>;
  parsePost(pid: number, tags: string | string[]): Promise<Rule34WebPostData[]>;
  favoriteGenerator: GenerateIdWithValidation<Rule34Meta, [userId: string]>;
  poolGenerator: GenerateIdWithValidation<Rule34Meta, [poolId: string]>;
  postGenerator: GenerateIdWithValidation<Rule34Meta, [tags: string | string[]]>;
}

export const rule34Parser: Rule34Parser = {
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
    let source = '';

    const tagEls = doc.querySelectorAll<HTMLLIElement>('li[class*="tag-type"]');
    tagEls.forEach((tagEl) => {
      const tagTypeMatch = /(?<=tag-type-)\w+/.exec(tagEl.className);
      if (!tagTypeMatch) throw new Error('Unknown tag: ' + tagEl.className);

      const tagType = tagTypeMatch[0];
      const tag = (
        tagEl.querySelector<HTMLAnchorElement>('a[href*="page=post"]')?.textContent || ''
      ).replaceAll(' ', '_');

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

    if (sourceEl && /^source:/i.test(sourceEl.textContent ?? '')) {
      const sourceLink = sourceEl.querySelector('a');
      if (sourceLink) {
        source = sourceLink.href;
      } else {
        source = sourceEl.textContent?.replace(/^source: ?/i, '') ?? '';
      }
    }

    const rating = /Rating: ?(Explicit|Questionable|Safe)/
      .exec(doc.documentElement.innerHTML)![1]
      .toLowerCase() as Rating;

    return {
      id,
      src,
      extendName,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      title,
      tags,
      createDate: postDate,
      source,
      rating
    };
  },

  async parseFavorite(userId: string, pid = 0): Promise<Rule34WebPostData[]> {
    const doc = await rule34Api.getDoc(`/index.php?page=favorites&s=view&id=${userId}&pid=${pid}`);
    const favDataScripts = doc.querySelectorAll<HTMLScriptElement>('.image-list > span + script');

    const favData = Array.from(favDataScripts).map((el) => {
      const content = el.textContent!;
      const [id] = /(?<=posts\[)[0-9]+?(?=\])/.exec(content)!;
      const [tags] = /(?<=tags: ["']).*?(?=["']\.)/.exec(content)!;
      const [rating] = /(?<=rating: ["']).*?(?=["'],)/.exec(content)!;
      const [score] = /(?<=score: ["'])[0-9]+(?=["'],)/.exec(content)!;
      const [user] = /(?<=user: ["']).*?(?=["']\s+})/.exec(content)!;

      return {
        id,
        tags: tags.split(' '),
        rating,
        score: +score,
        user
      };
    });

    return favData;
  },

  _parsePostData(doc: Document): Rule34WebPostData[] {
    const imageItems = Array.from(doc.querySelectorAll('.image-list > span.thumb'));
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
  },

  async parsePool(poolId: string): Promise<Rule34WebPostData[]> {
    const doc = await rule34Api.getDoc(`/index.php?page=pool&s=show&id=${poolId}`);
    return this._parsePostData(doc);
  },

  // Does not include blacklisted tags, making it more suitable for batch downloads that need to handle page ranges.
  async parsePost(pid = 0, tags: string | string[] = 'all') {
    if (Array.isArray(tags)) tags = tags.join('+');
    const doc = await rule34Api.getDoc(`/index.php?page=post&s=list&tags=${tags}&pid=${pid}`);
    return this._parsePostData(doc);
  },

  async *_paginationGenerator(pageRange, checkValidity, thumbsPerPage, getPostDataCallback) {
    const [pageStart = 1, pageEnd = 0] = pageRange ?? [];

    let page = pageStart;
    let postData: Rule34WebPostData[] | null = await getPostDataCallback(page);
    let total = postData.length;
    let fetchError: Error | null = null;

    if (total === 0) throw new Error(`There is no post in page ${page}.`);

    do {
      let nextPageData: Rule34WebPostData[] | null = null;

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
        const validityCheckMeta: Partial<Rule34Meta> = {
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
  },

  async *favoriteGenerator(pageRange, checkValidity, userId: string) {
    const THUMBS_PER_PAGE = 50;

    const getFavoriteByPage = (page: number) => {
      const pid = (page - 1) * THUMBS_PER_PAGE;
      return this.parseFavorite(userId, pid);
    };

    yield* this._paginationGenerator(pageRange, checkValidity, THUMBS_PER_PAGE, getFavoriteByPage);
  },

  async *poolGenerator(_, checkValidity, poolId) {
    yield* this._paginationGenerator([1, 1], checkValidity, Infinity, () => this.parsePool(poolId));
  },

  async *postGenerator(pageRange, checkValidity, tags) {
    const THUMBS_PER_PAGE = 42;

    const getPostsByPage = (page: number) => {
      const pid = (page - 1) * THUMBS_PER_PAGE;
      return this.parsePost(pid, tags);
    };

    yield* this._paginationGenerator(pageRange, checkValidity, THUMBS_PER_PAGE, getPostsByPage);
  }
};
