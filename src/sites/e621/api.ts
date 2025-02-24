import { logger } from '@/lib/logger';
import { ApiBase, type ApiOption } from '../base/api';
import { RequestError } from '@/lib/error';

/**
 * https://e621.net/help/api
 * https://e621.wiki
 *
 * GET        /favorites.json        List Favorites
 * POST       /favorites.json        Add Favorite
 * GET        /pools/{id}.json       Get Pool
 * GET        /users/{id}.json       Get User
 * GET        /posts.json            Search Posts
 * GET        /posts/{id}.json       Get Post
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type BadResponse = { success: false; reason: string };

export interface E621Post {
  id: number;
  /** date-time "2025-02-19T06:00:55.055-05:00" */
  created_at: string;
  updated_at: string;
  file: {
    width: number;
    height: number;
    ext: string;
    size: number;
    md5: string;
    url: string | null;
  };
  preview: {
    width: number;
    height: number;
    url: string | null;
  };
  sample: {
    has: boolean;
    height: number | null;
    width: number | null;
    url: string | null;
    alternates: Record<
      '480p' | '720p' | 'original',
      {
        type: 'video';
        height: number;
        width: number;
        urls: [string | null, string | null];
      }
    >;
  };
  score: {
    up: number;
    down: number;
    total: number;
  };
  tags: {
    general: string[];
    artist: string[];
    copyright: string[];
    character: string[];
    species: string[];
    invalid: string[];
    meta: string[];
    lore: string[];
  };
  locked_tags: string[] | null;
  change_seq: number;
  flags: {
    pending: boolean;
    flagged: boolean;
    note_locked: boolean;
    status_locked: boolean;
    rating_locked: boolean;
    deleted: boolean;
  };
  rating: 's' | 'q' | 'e';
  fav_count: number;
  sources: string[];
  pools: number[];
  relationships: {
    parent_id: number | null;
    has_children: boolean;
    has_active_children: boolean;
    children: number[];
  };
  approver_id: number | null;
  uploader_id: number;
  description: string;
  comment_count: number;
  is_favorited: boolean;
  has_notes: boolean;
  duration: number | null;
}

export interface E621Pool {
  id: number;
  name: string;
  updated_at: string;
  creator_id: number;
  description: string;
  is_active: boolean;
  category: 'collection' | 'series';
  post_ids: number[];
  created_at: string;
  creator_name: string;
  post_count: number;
}

export interface E621PostResp {
  post: E621Post;
}
export interface E621PostsResp {
  posts: E621Post[];
}

export interface E621FullCurrentUser {
  blacklist_users: boolean;
  description_collapsed_initially: boolean;
  hide_comments: boolean;
  show_hidden_comments: boolean;
  show_post_statistics: boolean;
  receive_email_notifications: boolean;
  enable_keyboard_navigation: boolean;
  enable_privacy_mode: boolean;
  style_usernames: boolean;
  enable_auto_complete: boolean;
  disabled_cropped_thumbnails: boolean;
  enable_safe_mode: boolean;
  disable_responsive_mode: boolean;
  no_flagging: boolean;
  disable_user_dmails: boolean;
  enable_compact_uploader: boolean;
  replacements_beta: boolean;
  updated_at: string;
  email: string;
  last_logged_in_at: string;
  last_forum_read_at: string;
  recent_tags: string;
  comment_threshold: number;
  default_image_sizede: 'large' | 'fit' | 'fitv' | 'original';
  favorite_tags: string;
  blacklisted_tags: string;
  time_zone: string;
  per_page: number;
  custom_style: string;
  api_regen_multiplier: number;
  api_burst_limit: number;
  remaining_api_limit: number;
  statement_timeout: number;
  favorite_limit: number;
  tag_query_limit: number;
  has_mail: boolean;
  id: number;
  created_at: string;
  name: string;
  level: number;
  base_upload_limit: number;
  post_upload_count: number;
  post_update_count: number;
  note_update_count: number;
  is_banned: boolean;
  can_approve_posts: boolean;
  can_upload_free: boolean;
  level_string: string;
  avatar_id: number | null;
  wiki_page_version_count: number;
  artist_version_count: number;
  pool_version_count: number;
  forum_post_count: number;
  comment_count: number;
  flag_count: number;
  favorite_count: number;
  positive_feedback_count: number;
  neutral_feedback_count: number;
  negative_feedback_count: number;
  upload_limit: number;
  profile_about: string;
  profile_artinfo: string;
}

interface E621ApiOption extends ApiOption {
  authorization: [username: string, apiKey: string];
}

type FavoritesParams = {
  /** The maximum number of results to return. Between 0 and 320. */
  limit: number;
  /** The page number of results to get. Between 1 and 750. */
  page: number;
  /** You must be the user or Moderator+ if the user has their favorites hidden. */
  user_id: number;
};

type PostsParams = {
  /** The maximum number of results to return. Between 0 and 320. */
  limit: number;
  /** The page number of results to get. Between 1 and 750. */
  page: number;
  tags: string;
  md5?: string;
  random?: string;
};

export class E621ngApi extends ApiBase {
  #authParams: URLSearchParams;

  constructor(option: E621ApiOption) {
    super(option);

    const [username, apiKey] = option.authorization;
    const UA = `Pixiv Downloader/${__VERSION__} (by drunkg00se on e621)`;

    this.#authParams = new URLSearchParams({ username, apiKey, _client: UA });
  }

  updateAuthIfNeeded(username: string, apiKey: string) {
    username !== this.#authParams.get('username') && this.#authParams.set('username', username);
    apiKey !== this.#authParams.get('apiKey') && this.#authParams.set('apiKey', apiKey);
  }

  async getJSON<T extends object>(url: string, init?: RequestInit): Promise<T> {
    const fullUrl = new URL(url, location.origin);

    url += fullUrl.search === '' ? '?' : '&';
    url += this.#authParams.toString();

    logger.info('Fetch url:', url);

    const res = await this.fetch(url, init);
    if (!res.ok) throw new RequestError(res.url, res.status);
    return await res.json();
  }

  getFavorites(params: FavoritesParams): Promise<E621PostsResp> {
    const searchParams = new URLSearchParams(
      Object.entries(params).map(([key, val]) => [key, String(val)])
    );

    return this.getJSON(`/favorites.json?${searchParams.toString()}`);
  }

  getPool(poolId: number): Promise<E621Pool> {
    return this.getJSON(`/pools/${poolId}.json`);
  }

  getPosts(params: PostsParams): Promise<E621PostsResp> {
    const { limit, page } = params;
    if (limit < 0 || limit > 320) throw new RangeError('limit should between 0 and 320.');
    if (page < 1 || page > 750) throw new RangeError('Page should between 1 and 750.');

    const searchParams = new URLSearchParams(
      Object.entries(params).map(([key, val]) =>
        typeof val === 'string' ? [key, val] : [key, String(val)]
      )
    );

    return this.getJSON(`/posts.json?${searchParams.toString()}`);
  }

  getPost(id: number): Promise<E621PostResp> {
    return this.getJSON(`/posts/${id}.json`);
  }

  getCurrentUserProfile(userId: number): Promise<E621FullCurrentUser> {
    return this.getJSON(`/users/${userId}.json`);
  }

  async addFavorites(postId: number, token: string): Promise<E621PostResp> {
    const res = await this.fetch(`/favorites.json?${this.#authParams.toString()}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-csrf-token': token
      },
      body: `post_id=${postId}`
    });

    if (!res.ok) throw new RequestError('/favorites.json', res.status);
    return res.json();
  }
}
