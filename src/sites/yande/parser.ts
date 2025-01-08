import type { MediaMeta, SiteParser } from '../interface';
import { yandeApi, type YandePoolData, type YandePostData } from './api';
import type { GenerateMeta, YieldArtworkMeta } from '@/lib/components/Downloader/useBatchDownload';

interface YandeWebPostData {
  posts: YandePostData[];
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
  pools: Omit<YandePoolData, 'posts'>[];
  /* tag, tagType pair */
  tags: Record<string, string>;
  votes: object;
}

export interface YandeBlacklistItem {
  tags: string[];
  original_tag_string: string;
  require: string[];
  exclude: string[];
}

type YandeWebPostListData = Pick<YandeWebPostData, 'posts' | 'tags'>;

type YandeGeneratorPostData = YandePostData & { tagType: Record<string, string> };

export type YandeMeta = MediaMeta & { character: string };

type PopularPeriod = '1d' | '1w' | '1m' | '1y';

interface YandeParser extends SiteParser<YandeMeta> {
  _isValidCallbackFactory(
    checkValidity: (meta: Partial<YandeMeta>) => Promise<boolean>
  ): (postData: YandeGeneratorPostData) => Promise<boolean>;
  _buildMeta<T extends YandePostData>(postData: T, tagType: Record<string, string>): YandeMeta;
  _parsePostListData(docText: string): YandePostData[];
  _parseTagListData(docText: string): Record<string, string>;
  _paginationGenerator<T, M>(
    pageRange: [start: number, end: number] | null,
    postsPerPage: number,
    getPostData: (page: number) => Promise<T[]>,
    isValid: (data: T) => Promise<boolean>,
    buildMeta: (data: T) => M
  ): AsyncGenerator<YieldArtworkMeta<M>, void, undefined>;
  isBlacklisted(matchTags: string[], blacklist: YandeBlacklistItem[]): boolean;
  parse(id: string): Promise<YandeMeta>;
  parseArtwork(artworkId: string): Promise<YandeWebPostData>;
  parsePostList(tags: string | string[], page: number): Promise<YandeWebPostListData>;
  parsePopular(period: PopularPeriod): Promise<YandeWebPostListData>;
  parsePool(poolId: string): Promise<YandeWebPostData>;
  parseBlacklist(): Promise<YandeBlacklistItem[]>;
  postGenerator: GenerateMeta<YandeMeta, [tags: string | string[]]>;
  popularGenerator: GenerateMeta<YandeMeta, [period: PopularPeriod]>;
  poolGenerator: GenerateMeta<YandeMeta, [poolId: string]>;
}

export const yandeParser: YandeParser = {
  async parse(id: string): Promise<YandeMeta> {
    const { posts, tags } = await this.parseArtwork(id);
    return this._buildMeta(posts[0], tags);
  },

  _parsePostListData(docText: string): YandePostData[] {
    const matchData = docText.match(/(?<=Post\.register\().+(?=\))/g)!;
    return matchData.map((dataStr) => JSON.parse(dataStr));
  },

  _parseTagListData(docText: string): Record<string, string> {
    const [tagStr] = docText.match(/(?<=Post\.register_tags\().+(?=\))/)!;
    return JSON.parse(tagStr);
  },

  async parsePostList(tags: string | string[], page: number): Promise<YandeWebPostListData> {
    Array.isArray(tags) && tags.join('+');
    const htmlText = await yandeApi.getHtmlText(`/post?page=${page}&tags=${tags}`);

    return {
      posts: this._parsePostListData(htmlText),
      tags: this._parseTagListData(htmlText)
    };
  },

  async parsePopular(period: PopularPeriod): Promise<YandeWebPostListData> {
    const htmlText = await yandeApi.getHtmlText(`/post/popular_recent?period=${period}`);

    return {
      posts: this._parsePostListData(htmlText),
      tags: this._parseTagListData(htmlText)
    };
  },

  async parseArtwork(id: string): Promise<YandeWebPostData> {
    const htmlText = await yandeApi.getHtmlText(`/post/show/${id}`);
    const [dataStr] = /(?<=Post\.register_resp\().+(?=\);)/.exec(htmlText)!;

    return JSON.parse(dataStr);
  },

  async parsePool(poolId: string): Promise<YandeWebPostData> {
    const htmlText = await yandeApi.getHtmlText(`/pool/show/${poolId}`);
    const [dataStr] = /(?<=Post\.register_resp\().+(?=\);)/.exec(htmlText)!;

    return JSON.parse(dataStr);
  },

  /**
   * init_blacklisted
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L429
   */
  async parseBlacklist() {
    // blacklist can be updated via ajax so we shouldn't get blacklist from current document.
    const doc = await yandeApi.getDoc('/static/more');
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

  _buildMeta(data, tagType): YandeMeta {
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
      id: String(data.id),
      src: data.file_url,
      extendName: data.file_ext,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      title: data.md5,
      tags,
      createDate: new Date(data.created_at * 1000).toISOString()
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

    const getPostData = async (page: number): Promise<YandeGeneratorPostData[]> => {
      const { posts, tags } = await this.parsePostList(postTags, page);
      return posts.map((post) => ({ ...post, tagType: tags }));
    };

    const buildMeta = (data: YandeGeneratorPostData): YandeMeta => {
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
    const getPopularData = async (): Promise<YandeGeneratorPostData[]> => {
      const { posts, tags } = await this.parsePopular(period);
      return posts.map((post) => ({ ...post, tagType: tags }));
    };

    const buildMeta = (data: YandeGeneratorPostData): YandeMeta => {
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
    const getPoolData = async (): Promise<YandeGeneratorPostData[]> => {
      const { posts, tags } = await this.parsePool(poolId);
      return posts.map((post) => ({ ...post, tagType: tags }));
    };

    const buildMeta = (data: YandeGeneratorPostData): YandeMeta => {
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
