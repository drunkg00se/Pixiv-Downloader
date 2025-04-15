import { ParserBase, type BooruMeta } from '../parser';
import type {
  MoebooruPostDataLegacy,
  MoebooruPostData,
  MoebooruPoolData,
  PossibleMoebooruPostData
} from './api';

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
  votes: {
    /**
     * 2: added to favorite but later removed
     * 3: favorite
     */
    [id: string]: 2 | 3;
  };
}

interface MoebooruHtmlPostData extends MoebooruHtmlPostDataLegacy {
  posts: MoebooruPostData[];
}

export interface MoebooruBlacklistItem {
  tags: string[];
  original_tag_string: string;
  require: string[];
  exclude: string[];
}

type PossibleHtmlPostData = MoebooruHtmlPostDataLegacy | MoebooruHtmlPostData;

type PossiblePostListDataWithTagType = Pick<PossibleHtmlPostData, 'posts' | 'tags'>;

export interface MoebooruMeta extends BooruMeta {
  rating: MoebooruPostData['rating'];
}

export class MoebooruParser extends ParserBase {
  #parsePostListData(docText: string): PossibleMoebooruPostData[] {
    const matchData = docText.match(/(?<=Post\.register\().+(?=\))/g)!;
    return matchData.map((dataStr) => JSON.parse(dataStr));
  }

  #parseTagListData(docText: string): Record<string, string> {
    const [tagStr] = docText.match(/(?<=Post\.register_tags\().+(?=\))/)!;
    return JSON.parse(tagStr);
  }

  /**
   * init_blacklisted
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L429
   */
  #parseBlacklist(blacklist: string[]): MoebooruBlacklistItem[] {
    return blacklist.map((blacklist) => {
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
  }

  public parseCsrfToken() {
    const el = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    if (!el) throw new Error('Can not find csrf-token element.');
    return el.content;
  }

  public isLatestData(data: PossibleMoebooruPostData): data is MoebooruPostData {
    return 'file_ext' in data;
  }

  public buildMeta(
    data: MoebooruPostDataLegacy | MoebooruPostData,
    tagType: Record<string, string>
  ): MoebooruMeta {
    if (data.status === 'deleted') throw new Error(`Post ${data.id} is deleted.`);

    const { id, file_url, md5, created_at, source, rating, score } = data;

    const file_ext = this.isLatestData(data) ? data.file_ext : file_url.match(/\.(\w+)$/)![1];

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
      artist: artists.join(',') || this.UNKNOWN_ARTIST,
      character: characters.join(',') || this.UNKNOWN_CHARACTER,
      title: md5,
      tags,
      createDate: new Date(created_at * 1000).toISOString(),
      rating,
      score,
      source
    };
  }

  public isFavorite(id: string, votesData: MoebooruHtmlPostDataLegacy['votes']): boolean {
    return id in votesData && votesData[id] === 3;
  }

  /**
   * for post_list, popular
   */
  public parsePostsList(htmlText: string): PossiblePostListDataWithTagType {
    return {
      posts: this.#parsePostListData(htmlText),
      tags: this.#parseTagListData(htmlText)
    };
  }

  /**
   *  for post/show, pool
   */
  public parsePostAndPool(htmlText: string): PossibleHtmlPostData {
    const [dataStr] = /(?<=Post\.register_resp\().+(?=\);)/.exec(htmlText)!;
    return JSON.parse(dataStr);
  }

  public parseBlacklistByDoc(doc: Document): MoebooruBlacklistItem[] {
    const el = doc.querySelector('script#user-blacklisted-tags');
    if (!el) throw new Error('Can not get blacklist.');
    const blacklistArr = JSON.parse(el.textContent ?? '[]') as string[];

    return this.#parseBlacklist(blacklistArr);
  }

  // konachan stores blacklist as `blacklisted_tags` cookies
  public parseBlacklistByCookie(): MoebooruBlacklistItem[] {
    const blacklistMatch = document.cookie.match(/(?<=blacklisted_tags=).+?(?=;)/);
    let blacklistStr = blacklistMatch ? decodeURIComponent(blacklistMatch[0]) : '[]';

    // default value of blacklisted_tags
    if (blacklistStr === '[""]') blacklistStr = '[]';

    return this.#parseBlacklist(JSON.parse(blacklistStr));
  }

  /**
   * is_blacklisted
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L315
   */
  public isBlacklisted(matchTags: string[], blacklist: MoebooruBlacklistItem[]): boolean {
    return blacklist.some((blacklistItem) => {
      const { require, exclude } = blacklistItem;
      const hasTag = (tag: string) => matchTags.includes(tag);

      return require.every(hasTag) && !exclude.some(hasTag);
    });
  }
}
