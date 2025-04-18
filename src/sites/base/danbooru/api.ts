import { JsonDataError, RequestError } from '@/lib/error';
import { logger } from '@/lib/logger';
import type {
  DanbooruUserProfile,
  DanbooruArtistCommentary,
  DanbooruBadResponse,
  DanbooruFavoriteGroup,
  DanbooruPool,
  DanbooruPost
} from './types';
import { ApiBase } from '../api';

/** limit: https://danbooru.donmai.us/wiki_pages/help%3Ausers */
interface PostListSearchParam {
  tags?: string[];
  limit?: number;
  page?: number;
}

export class DanbooruApi extends ApiBase {
  // Danbooru uses some custom status codes in the 4xx and 5xx range:
  // 200 OK: Request was successful
  // 204 No Content: Request was successful (returned by create actions)
  // 400 Bad Request: The given parameters could not be parsed
  // 401 Unauthorized: Authentication failed
  // 403 Forbidden: Access denied (see help:users for permissions information)
  // 404 Not Found: Not found
  // 410 Gone: Pagination limit (see help:users for pagination limits)
  // 420 Invalid Record: Record could not be saved
  // 422 Locked: The resource is locked and cannot be modified
  // 423 Already Exists: Resource already exists
  // 424 Invalid Parameters: The given parameters were invalid
  // 429 User Throttled: User is throttled, try again later (see help:users for API limits)
  // 500 Internal Server Error: A database timeout, or some unknown error occurred on the server
  // 502 Bad Gateway: Server cannot currently handle the request, try again later (returned during heavy load)
  // 503 Service Unavailable: Server cannot currently handle the request, try again later (returned during downbooru)
  async getJSON<T>(url: string, init?: RequestInit): Promise<T> {
    logger.info('Fetch url:', url);
    const res = await this.fetch(url, init);
    if (res.status >= 500) throw new RequestError(res.url, res.status);

    const data = await res.json();
    if ('success' in data && !data.success) {
      const { error, message } = data as DanbooruBadResponse;
      throw new JsonDataError(error + ', ' + message);
    }

    return data as T;
  }

  getPool(id: string): Promise<DanbooruPool> {
    return this.getJSON<DanbooruPool>(`/pools/${id}.json`);
  }

  getPost(id: string): Promise<DanbooruPost> {
    return this.getJSON<DanbooruPost>(`/posts/${id}.json`);
  }

  getPostDoc(id: string): Promise<Document> {
    return this.getDoc('/posts/' + id);
  }

  getPostList(param?: PostListSearchParam): Promise<DanbooruPost[]> {
    const { tags = [], limit = 0, page = 0 } = param ?? {};
    const searchParam = new URLSearchParams();

    tags?.length && searchParam.append('tags', tags.join(' '));
    limit && searchParam.append('limit', String(limit));
    page && searchParam.append('page', String(page));

    return this.getJSON<DanbooruPost[]>(`/posts.json?${searchParam.toString()}`);
  }

  /**
   * In aftbooru, account needs to be over a week old to get commentary.
   */
  getArtistCommentary(id: string): Promise<DanbooruArtistCommentary> {
    return this.getJSON<DanbooruArtistCommentary>(`/posts/${id}/artist_commentary.json`);
  }

  getFavoriteGroups(id: string): Promise<DanbooruFavoriteGroup> {
    return this.getJSON<DanbooruFavoriteGroup>(`/favorite_groups/${id}.json`);
  }

  getProfile(): Promise<DanbooruUserProfile> {
    return this.getJSON<DanbooruUserProfile>(`/profile.json`);
  }

  async addFavorite(id: string, token: string) {
    const res = await this.fetch(`/favorites?post_id=${id}`, {
      method: 'POST',
      headers: {
        'X-Csrf-Token': token
      }
    });
    if (!res.ok) throw new RequestError(res.url, res.status);

    return await res.text();
  }
}
