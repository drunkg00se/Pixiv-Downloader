import type { MediaMeta, SiteParser } from '../../interface';
import { moebooruApi } from './api';
import type { MoebooruPostDataLegacy, MoebooruPostData, MoebooruPoolData } from './api';
import type {
  ValidatedMetaGenerator,
  YieldArtworkMeta
} from '@/lib/components/Downloader/useBatchDownload';

interface MoebooruHtmlPostDataLegacy {
  posts: MoebooruPostDataLegacy[];
  pool_posts: {
    id: number;
    pool_id: number;
    post_id: number;
    active: boolean;
    /* Image sequence in string type */
    sequence: string;
    next_post_id: number | null;
    prev_post_id: number | null;
  }[];
  pools: Omit<MoebooruPoolData, 'posts'>[];
  /* tag, tagType pair */
  tags: Record<string, string>;
  votes: object;
}

// interface MoebooruHtmlPostData extends MoebooruHtmlPostDataLegacy {
//   posts: MoebooruPostData[];
// }

export interface MoebooruBlacklistItem {
  tags: string[];
  original_tag_string: string;
  require: string[];
  exclude: string[];
}

type MoebooruHtmlPostListData<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy> =
  Pick<T, 'posts' | 'tags'>;

type MoebooruGeneratorPostData<T extends MoebooruPostDataLegacy = MoebooruPostDataLegacy> = T & {
  tagType: Record<string, string>;
};

export type MoebooruMeta = MediaMeta & {
  character: string;
  rating: MoebooruPostData['rating'];
  source: string;
};

type PopularPeriod = '1d' | '1w' | '1m' | '1y';

interface MoebooruParser extends SiteParser<MoebooruMeta> {
  _isLatestData(data: MoebooruPostDataLegacy | MoebooruPostData): data is MoebooruPostData;

  _isValidCallbackFactory(
    checkValidity: (meta: Partial<MoebooruMeta>) => Promise<boolean>
  ): (postData: MoebooruGeneratorPostData) => Promise<boolean>;

  _buildMeta<T extends MoebooruPostDataLegacy = MoebooruPostDataLegacy>(
    postData: T,
    tagType: Record<string, string>
  ): MoebooruMeta;

  _parsePostListData<T extends MoebooruPostDataLegacy = MoebooruPostDataLegacy>(
    docText: string
  ): T[];

  _parseTagListData(docText: string): Record<string, string>;

  _paginationGenerator<T, M>(
    pageRange: [start: number, end: number] | null,
    postsPerPage: number,
    getPostData: (page: number) => Promise<T[]>,
    isValid: (data: T) => Promise<boolean>,
    buildMeta: (data: T) => M
  ): AsyncGenerator<YieldArtworkMeta<M>, void, undefined>;

  isBlacklisted(matchTags: string[], blacklist: MoebooruBlacklistItem[]): boolean;

  parse(id: string): Promise<MoebooruMeta>;

  parseArtwork<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy>(
    artworkId: string
  ): Promise<T>;

  parsePostList<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy>(
    tags: string | string[],
    page: number
  ): Promise<MoebooruHtmlPostListData<T>>;

  parsePopular<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy>(
    period: PopularPeriod
  ): Promise<MoebooruHtmlPostListData<T>>;

  parsePool<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy>(
    poolId: string
  ): Promise<T>;

  parseBlacklist(): Promise<MoebooruBlacklistItem[]>;

  postGenerator: ValidatedMetaGenerator<MoebooruMeta, [tags: string | string[]]>;

  popularGenerator: ValidatedMetaGenerator<MoebooruMeta, [period: PopularPeriod]>;

  poolGenerator: ValidatedMetaGenerator<MoebooruMeta, [poolId: string]>;
}

export const MoebooruParser: MoebooruParser = {
  async parse(id: string): Promise<MoebooruMeta> {
    const { posts, tags } = await this.parseArtwork(id);
    return this._buildMeta(posts[0], tags);
  },

  _isLatestData(data: MoebooruPostDataLegacy | MoebooruPostData): data is MoebooruPostData {
    return 'file_ext' in data;
  },

  _parsePostListData<T extends MoebooruPostDataLegacy = MoebooruPostDataLegacy>(
    docText: string
  ): T[] {
    const matchData = docText.match(/(?<=Post\.register\().+(?=\))/g)!;
    return matchData.map((dataStr) => JSON.parse(dataStr));
  },

  _parseTagListData(docText: string): Record<string, string> {
    const [tagStr] = docText.match(/(?<=Post\.register_tags\().+(?=\))/)!;
    return JSON.parse(tagStr);
  },

  async parsePostList<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy>(
    tags: string | string[],
    page: number
  ): Promise<MoebooruHtmlPostListData<T>> {
    Array.isArray(tags) && tags.join('+');
    const htmlText = await moebooruApi.getHtml(`/post?page=${page}&tags=${tags}`);

    return {
      posts: this._parsePostListData(htmlText),
      tags: this._parseTagListData(htmlText)
    };
  },

  async parsePopular<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy>(
    period: PopularPeriod
  ): Promise<MoebooruHtmlPostListData<T>> {
    const htmlText = await moebooruApi.getHtml(`/post/popular_recent?period=${period}`);

    return {
      posts: this._parsePostListData(htmlText),
      tags: this._parseTagListData(htmlText)
    };
  },

  async parseArtwork<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy>(
    id: string
  ): Promise<T> {
    const htmlText = await moebooruApi.getHtml(`/post/show/${id}`);
    const [dataStr] = /(?<=Post\.register_resp\().+(?=\);)/.exec(htmlText)!;

    return JSON.parse(dataStr);
  },

  async parsePool<T extends MoebooruHtmlPostDataLegacy = MoebooruHtmlPostDataLegacy>(
    poolId: string
  ): Promise<T> {
    const htmlText = await moebooruApi.getHtml(`/pool/show/${poolId}`);
    const [dataStr] = /(?<=Post\.register_resp\().+(?=\);)/.exec(htmlText)!;

    return JSON.parse(dataStr);
  },

  /**
   * init_blacklisted
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L429
   */
  async parseBlacklist() {
    // blacklist can be updated via ajax so we shouldn't get blacklist from current document.
    const doc = await moebooruApi.getDoc('/static/more');
    const el = doc.querySelector('script#user-blacklisted-tags');
    if (!el) throw new Error('Can not get blacklist.');

    const blacklistArr = JSON.parse(el.textContent ?? '[]') as string[];

    return blacklistArr.map((blacklist) => {
      const matchRatingTag = blacklist.replace(/(rating:[qes])\w+/, '$1');
      const tags = matchRatingTag.split(' ');
      const require: string[] = [];
      const exclude: string[] = [];

      tags.forEach((tag) => {
        if (tag.charAt(0) === '-') {
          exclude.push(tag.slice(1));
        } else {
          require.push(tag);
        }
      });

      return {
        tags,
        original_tag_string: blacklist,
        require,
        exclude
      };
    });
  },

  /**
   * is_blacklisted
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L315
   */
  isBlacklisted(matchTags, blacklist) {
    return blacklist.some((blacklistItem) => {
      const { require, exclude } = blacklistItem;
      const hasTag = (tag: string) => matchTags.includes(tag);

      return require.every(hasTag) && !exclude.some(hasTag);
    });
  },

  _buildMeta<T extends MoebooruPostDataLegacy = MoebooruPostDataLegacy>(
    data: T,
    tagType: Record<string, string>
  ): MoebooruMeta {
    const { id, file_url, md5, created_at, source, rating } = data;

    const file_ext = this._isLatestData(data) ? data.file_ext : file_url.match(/\.(\w+)$/)![1];

    const artists: string[] = [];
    const characters: string[] = [];

    const tags: string[] = data.tags.split(' ').map((tag) => {
      const type = tagType[tag] ?? 'unknown';

      if (type === 'artist') {
        artists.push(tag);
      } else if (type === 'character') {
        characters.push(tag);
      }

      return type + ':' + tag;
    });

    return {
      id: String(id),
      src: file_url,
      extendName: file_ext,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      title: md5,
      tags,
      createDate: new Date(created_at * 1000).toISOString(),
      rating,
      source
    };
  },

  /**
   * register
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L286
   */
  _isValidCallbackFactory(checkValidity) {
    return async (data) => {
      const tags = data.tags.split(' ');
      tags.push('rating:' + data.rating.charAt(0));
      tags.push('status:' + data.status);
      return await checkValidity({ id: String(data.id), tags });
    };
  },

  async *_paginationGenerator<T, M>(
    pageRange: [start: number, end: number] | null,
    postsPerPage: number,
    getPostData: (page: number) => Promise<T[]>,
    isValid: (data: T) => Promise<boolean>,
    buildMeta: (data: T) => M
  ) {
    const [pageStart = 1, pageEnd = 0] = pageRange ?? [];

    let page = pageStart;
    let postDatas: T[] | null = await getPostData(page);
    let total = postDatas.length;
    let fetchError: Error | null = null;

    if (total === 0) throw new Error(`There is no post in page ${page}.`);

    do {
      let nextPageData: T[] | null = null;

      // fetch next page's post data.
      if (page !== pageEnd && postDatas.length >= postsPerPage) {
        try {
          nextPageData = await getPostData(page + 1);
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

      const avaliable: M[] = [];
      const invalid: M[] = [];
      const unavaliable: M[] = [];

      for (let i = 0; i < postDatas.length; i++) {
        const data = postDatas[i];
        const isValidData = await isValid(data);
        const meta = buildMeta(data);
        isValidData ? avaliable.push(meta) : invalid.push(meta);
      }

      yield {
        total,
        page,
        avaliable,
        invalid,
        unavaliable
      };

      page++;
      postDatas = nextPageData;
    } while (postDatas);

    if (fetchError) throw fetchError;
  },

  async *postGenerator(pageRange, checkValidity, postTags) {
    const POSTS_PER_PAGE = 40;

    const getPostData = async (page: number): Promise<MoebooruGeneratorPostData[]> => {
      const { posts, tags } = await this.parsePostList(postTags, page);
      return posts.map((post) => ({ ...post, tagType: tags }));
    };

    const buildMeta = (data: MoebooruGeneratorPostData): MoebooruMeta => {
      return this._buildMeta(data, data.tagType);
    };

    yield* this._paginationGenerator(
      pageRange,
      POSTS_PER_PAGE,
      getPostData,
      this._isValidCallbackFactory(checkValidity),
      buildMeta
    );
  },

  async *popularGenerator(_, checkValidity, period) {
    const getPopularData = async (): Promise<MoebooruGeneratorPostData[]> => {
      const { posts, tags } = await this.parsePopular(period);
      return posts.map((post) => ({ ...post, tagType: tags }));
    };

    const buildMeta = (data: MoebooruGeneratorPostData): MoebooruMeta => {
      return this._buildMeta(data, data.tagType);
    };

    yield* this._paginationGenerator(
      [1, 1],
      Infinity,
      getPopularData,
      this._isValidCallbackFactory(checkValidity),
      buildMeta
    );
  },

  async *poolGenerator(_, checkValidity, poolId) {
    const getPoolData = async (): Promise<MoebooruGeneratorPostData[]> => {
      const { posts, tags } = await this.parsePool(poolId);
      return posts.map((post) => ({ ...post, tagType: tags }));
    };

    const buildMeta = (data: MoebooruGeneratorPostData): MoebooruMeta => {
      return this._buildMeta(data, data.tagType);
    };

    yield* this._paginationGenerator(
      [1, 1],
      Infinity,
      getPoolData,
      this._isValidCallbackFactory(checkValidity),
      buildMeta
    );
  }
};
