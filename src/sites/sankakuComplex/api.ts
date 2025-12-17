import { JsonDataError } from '@/lib/error';
import { ApiBase } from '../base/api';

type Status = 'pending' | 'active' | 'flagged' | 'deleted';

type Rating = 'e' | 'q' | 's';

// /posts/${id}/fu?lang=en
export interface SankakuPostURL {
  success: true;
  data: {
    file_url: string;
    fallback_url: string;
    sample_url: string;
  };
}

interface SankakuAuthor {
  id: string;
  name: string;
  display_name: string;
  level: number;
  avatar: string;
  avatar_rating: Rating;
}

export const enum SankakuTagType {
  GENERAL = 0,
  ARTIST,
  STUDIO,
  COPYRIGHT,
  CHARACTER,
  GENRE,
  MEDIUM = 8,
  META,
  FASHION,
  ANATOMY
}

// /posts/${id}/tags?lang=en&page=1&limit=100
export interface SankakuTagDetail {
  id: string;
  name_en: string | null;
  name_ja: string | null;
  type: SankakuTagType;
  count: number;
  post_count: number;
  pool_count: number;
  companion_count: number;
  series_count: number;
  locale: string;
  rating: Rating;
  version: number | null;
  tagName: string;
  total_post_count: number;
  total_pool_count: number;
  is_following: boolean;
  notification_enabled: boolean;
  name: string;
  creator?: {
    tag_id: string;
    created_at: string;
    updated_at: string;
    profile_view_count: number;
  };
}

// /posts/${id}/tags?lang=en&page=1&limit=40
interface SankakuTagResponse {
  success: true;
  data: SankakuTagDetail[];
  total: number;
  page: number;
}

// /v2/posts?lang=en&page=1&limit=1&default_threshold=2&tags=id_range:${id}
export interface SankakuPost {
  id: string;
  rating: Rating;
  status: Status;
  author: SankakuAuthor;
  sample_width: number;
  sample_height: number;
  preview_url: string;
  preview_width: number;
  preview_height: number;
  width: number;
  height: number;
  file_size: number;
  /** extend name */
  file_ext: string;
  /** MIME */
  file_type: string;
  created_at: {
    json_class: 'Time';
    /** second */
    s: number;
    n: number;
  };
  has_children: boolean;
  has_comments: boolean;
  has_notes: boolean;
  is_favorited: boolean;
  user_vote: number | null;
  md5: string;
  parent_id: string | null;
  change: number;
  fav_count: number;
  vote_count: number;
  total_score: number;
  comment_count: number | null;
  source: string | null;
  in_visible_pool: boolean;
  is_premium: boolean;
  is_rating_locked: boolean;
  is_note_locked: boolean;
  is_status_locked: boolean;
  redirect_to_signup: boolean;
  sequence: number | null;
  generation_directives: string | null;
  /** only 5 tags are inclueded */
  tags: SankakuTagDetail[];
  /** tags in english */
  tag_names: string[];
  is_restricted_anonymous_upload: boolean;
  is_anonymous: boolean;
  total_tags: number;
  video_duration: number | null;
  reactions: unknown[];
  subtitles: unknown[];
  audios: unknown[];
  gif_preview_url: string | null;
}

// /pools/${id}?lang=en&exceptStatuses[]=deleted
export interface SankakuPostInPool extends SankakuPost {
  sample_url: string;
  file_url: string;
  /** all tags are inclueded */
  tags: SankakuTagDetail[];
}

export interface SankakuPool {
  id: string;
  name_en: string | null;
  name_ja: string | null;
  description: string;
  description_en: string | null;
  description_ja: string | null;
  /** @example 2025-11-22 05:11 */
  created_at: string;
  updated_at: string;
  author: SankakuAuthor;
  status: Status;
  post_count: number;
  pages_count: number;
  visible_post_count: number;
  rating: Rating;
  parent_id: string | null;
  has_children: null;
  is_rating_locked: boolean;
  fav_count: number;
  vote_count: number;
  total_score: number;
  comment_count: number | null;
  tags: SankakuTagDetail[];
  post_tags: SankakuTagDetail[];
  artist_tags: SankakuTagDetail[];
  genre_tags: SankakuTagDetail[];
  is_favorited: boolean;
  user_vote: number | null;
  posts: SankakuPostInPool[];
  file_url: string;
  sample_url: string;
  preview_url: string;
  cover_post: SankakuPostInPool[];
  reading: {
    current_page: number;
    sequence: number;
    post_id: string;
    series_id: null;
    created_at: string;
    updated_at: string;
    percent: number;
  } | null;
  is_premium: boolean;
  is_anonymous: boolean;
  redirect_to_signup: boolean;
  locale: string;
  cover_post_id: string;
  reactions: unknown[];
  is_public: true;
  is_intact: true;
  is_raw: boolean;
  is_trial: boolean;
  is_pending: boolean;
  is_active: true;
  is_flagged: boolean;
  is_deleted: boolean;
  name: string;
  parent_pool: null;
  child_pools: null;
  flagged_by_user: boolean;
  prem_post_count: number;
}

// /v2/posts/keyset?lang=en&default_threshold=2&hide_posts_in_books=in-larger-tags&limit=40&page=1&tags=collection:${id}
interface SankakuKeyset {
  data: SankakuPost[];
  meta: {
    page_count: number;
    next: string | null;
    prev: string | null;
  };
}

interface SankakuFavResponse {
  success: true;
  post_id: string;
  favorited_users: string;
  score: number;
}

interface SankakuSeriesQuery {
  data: {
    seriesV2: {
      activePoolCount: number;
      author: {
        id: string;
        name: string;
        displayName: string;
        avatar: { url: string };
      };
      commentCount: number;
      coverPool: {
        coverPost: { previewUrl: string | null; sampleUrl: string | null };
      };
      createdAt: string;
      description: string | null;
      descriptionEn: string | null;
      descriptionJa: string | null;
      favCount: number;
      id: string;
      isCompleted: boolean;
      isFavorite: boolean;
      isPremium: boolean;
      name: string;
      nameEn: string;
      nameJa: string | null;
      poolCount: number;
      score: number;
      status: 'active' | 'pending';
      tags: unknown[];
      updatedAt: string | null;
      userVote: null;
      voteCount: number;
      pools: {
        id: string;
      }[];
    };
  };
}

export class SankakuApi extends ApiBase {
  #baseUrl: string;
  #headers: Record<string, string>;
  #getAccessToken?: () => string | undefined;

  constructor({
    baseUrl = 'https://sankakuapi.com',
    getAccessToken
  }: Partial<{
    baseUrl: string;
    getAccessToken: () => string | undefined;
  }>) {
    super({ rateLimit: 3 });

    this.#headers = {
      accept: 'application/vnd.sankaku.api+json;v=2',
      'api-version': '2',
      platform: 'web-app'
    };

    this.#baseUrl = baseUrl;
    this.#getAccessToken = getAccessToken;
  }

  async getJSON<T extends object>(url: string, init?: RequestInit): Promise<T> {
    const accessToken = this.#getAccessToken?.();

    const data = await super.getJSON<T>(this.#baseUrl + url, {
      ...init,
      headers: {
        ...this.#headers,
        ...(accessToken && { authorization: `Bearer ${accessToken}` }),
        ...init?.headers
      }
    });

    if ('success' in data && data.success !== true) {
      const errMsg = 'code' in data ? data.code : '';
      throw new JsonDataError('Bad response. ' + errMsg);
    }

    return data;
  }

  async getPostData(postId: string): Promise<SankakuPost> {
    const params = {
      lang: 'en',
      page: '1',
      limit: '1',
      tags: 'id_range:' + postId
    };

    const searchParams = new URLSearchParams(Object.entries(params)).toString();

    const data = await this.getJSON<SankakuPost[]>(`/v2/posts?${searchParams}`);

    return data[0];
  }

  async getPostUrl(postId: string): Promise<SankakuPostURL['data']> {
    return (await this.getJSON<SankakuPostURL>(`/posts/${postId}/fu?lang=en`)).data;
  }

  async getTagDetail(postId: string): Promise<SankakuTagDetail[]> {
    const params = {
      lang: 'en',
      page: '1',
      /** @max 100 */
      limit: '100'
    };

    let currentPage: SankakuTagResponse;
    const tags: SankakuTagDetail[] = [];

    do {
      const searchParams = new URLSearchParams(Object.entries(params)).toString();

      currentPage = await this.getJSON<SankakuTagResponse>(`/posts/${postId}/tags?${searchParams}`);

      tags.push(...currentPage.data);

      params.page = String(+params.page + 1);
    } while (tags.length < currentPage.total);

    return tags;
  }

  getPool(poolId: string): Promise<SankakuPool> {
    const params = {
      lang: 'en',
      'exceptStatuses[]': 'deleted'
    };
    const searchParams = new URLSearchParams(Object.entries(params)).toString();

    return this.getJSON(`/pools/${poolId}?${searchParams}`);
  }

  addFav(postId: string): Promise<SankakuFavResponse> {
    if (!('authorization' in this.#headers)) {
      throw new Error('AccessToken not found, please sign in');
    }

    return this.getJSON(`/posts/${postId}/favorite`, { method: 'POST' });
  }

  // /v2/posts/keyset?lang=en&default_threshold=2&hide_posts_in_books=in-larger-tags&limit=40&page=1&tags=collection:${id}
  getCollection(collectionId: string, page: string | number): Promise<SankakuKeyset> {
    const params = {
      lang: 'en',
      limit: '40',
      tags: `collection:${collectionId}`,
      page: String(page)
    };
    const searchParams = new URLSearchParams(Object.entries(params)).toString();

    return this.getJSON(`/v2/posts/keyset?${searchParams}`);
  }

  async querySeries(seriesId: string): Promise<string[]> {
    const body = `{"query":"\\n  query Series($seriesId: StringOrInt!) {\\n    seriesV2(id: $seriesId) {\\n      id\\n      name\\n      nameEn\\n      nameJa\\n      description\\n      descriptionEn\\n      descriptionJa\\n      isFavorite\\n      favCount\\n      voteCount\\n      score\\n      userVote\\n      isPremium\\n      isCompleted\\n      status\\n      createdAt\\n      updatedAt\\n      poolCount\\n      activePoolCount\\n      commentCount\\n      coverPool {\\n        coverPost {\\n          previewUrl\\n          sampleUrl\\n        }\\n      }\\n      pools {\\n        id\\n        name\\n        author {\\n          id\\n          name\\n          displayName\\n          level\\n          avatar {\\n            url\\n          }\\n        }\\n        nameEn\\n        nameJa\\n        coverPost {\\n          id\\n          author {\\n            id\\n          }\\n          isPremium\\n          sampleUrl\\n          sampleWidth\\n          sampleHeight\\n          previewUrl\\n          previewWidth\\n          previewHeight\\n          fileUrl\\n          width\\n          height\\n          fileSize\\n          fileType\\n          createdAt\\n          isFavorited\\n          totalScore\\n          voteCount\\n          favCount\\n          inVisiblePool\\n          rating\\n          status\\n          hasChildren\\n          tags {\\n            id\\n            name\\n            tagType\\n            nameEn\\n            nameJa\\n          }\\n        }\\n        premPostCount\\n        status\\n        isPremium\\n        isRatingLocked\\n        rating\\n        sequenceV2(seriesId: $seriesId)\\n        tags {\\n          id\\n          name\\n          tagType\\n          nameEn\\n          nameJa\\n        }\\n        reading {\\n          currentPage\\n        }\\n        postCount\\n        totalScore\\n        voteCount\\n      }\\n      tags {\\n        id\\n        name\\n        tagType\\n        nameEn\\n        nameJa\\n      }\\n      author {\\n        id\\n        name\\n        displayName\\n        avatar {\\n          url\\n        }\\n      }\\n      status\\n    }\\n  }\\n","variables":{"seriesId":"${seriesId}"},"operationName":"Series"}`;
    const data = await this.getJSON<SankakuSeriesQuery>('/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: '*/*'
      },
      body
    });
    return data.data.seriesV2.pools.map((pool) => pool.id);
  }
}
