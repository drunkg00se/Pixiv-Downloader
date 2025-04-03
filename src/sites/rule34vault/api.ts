import { ApiBase } from '../base/api';

export const enum Rule34VaultPostType {
  JPG = 0,
  MP4
}

export const enum Rule34VaultTagType {
  GENERAL = 1,
  COPYRIGHT = 2,
  CHARACTER = 4,
  ARTIST = 8
}

export const enum TagSearchSortType {
  LATEST = 0,
  TOP_RATED,
  MOST_VIEWED
}

interface Tag {
  id: number;
  value: string;
  /** some tag does not have popularity key */
  popularity?: number;
  count: number;
  type: Rule34VaultTagType;
}

interface Rule34VaultPostBase {
  id: number;
  /** @example "2025-04-01T09:39:45.965111Z" */
  created: string;
  /** display date */
  posted: string;
  /** likes key does not exist if likes count = 0 */
  likes?: number;
  /** view count */
  views?: number;
  status: number;
  uploaderId: number;
  width: number;
  height: number;
  files: {
    [key: string]: [number, number];
  };
  uploader: {
    data: null;
    displayName: string;
    emailVerified: boolean;
    avatarModifyDate: string;
    attributes: number[];
    userName: string;
    role: number;
    id: number;
    created: string;
  };
  tags: Tag[];
  data: {
    sources: string[] | null;
  };
}

interface Rule34VaultImagePost extends Rule34VaultPostBase {
  type: Rule34VaultPostType.JPG;
}

interface Rule34VaultVideoPost extends Rule34VaultPostBase {
  type: Rule34VaultPostType.MP4;
  /** video duration */
  duration?: number;
}

export type Rule34VaultPost = Rule34VaultImagePost | Rule34VaultVideoPost;

export interface Rule34VaultUserProfile {
  data: {
    userId: number;
    updated: string;
    likes: number;
    bookmarks: number;
    superLikes: number;
    postComments: number;
    playlistComments: number;
    urls: null;
    playlists: number;
    publicPlaylists: number;
    profileImageDate: string | null;
    followers: number;
    following: number;
    followingPlaylists: number;
    postsUploaded: number;
    subscriptionLastSeen: string;
    description: string | null;
    privacy: {
      showBookmarks: boolean;
      showSuperLikes: boolean;
      showFollowedPlaylists: boolean;
      showTagSubscriptions: boolean;
    };
  };
  displayName: string;
  emailVerified: boolean;
  avatarModifyDate: string | null;
  attributes: number[] | null;
  userName: string;
  role: number;
  id: number;
  created: string;
}

export interface SearchParamBase {
  /** we don't need to provide the cursor for the first search */
  cursor?: string;
  checkHasMore: true;
  countTotal: boolean;
  skip: number;
  take: number;
}

export interface TagAndBookmarkSearchParam extends SearchParamBase {
  includeTags: string[];
  sortBy: TagSearchSortType;
  /** all post types are searched if the type parameter is omitted */
  type?: Rule34VaultPostType;
}

export type SubscriptionSearchParam = Omit<TagAndBookmarkSearchParam, 'sortBy'>;

interface SearchResponse {
  /** if there are no matching posts, the cursor is not returned. */
  cursor?: string;
  hasMore: boolean;
  items: Omit<Rule34VaultPost, 'uploader' | 'tags' | 'data'>[];
  /** returned when blacklist is inactive and countTotal === true */
  totalCount?: number;
  /** returned when blacklist is actived */
  pagination?: 1;
}

interface BookmarkResponse {
  isLiked: boolean;
  isBookmarked: boolean;
  isSuperLiked: boolean;
}

export class Rule34VaultApi extends ApiBase {
  getPostData(id: string): Promise<Rule34VaultPost> {
    return this.getJSON(`/api/v2/post/${id}`);
  }

  getUserProfile(username: string): Promise<Rule34VaultUserProfile> {
    return this.getJSON(`/api/v2/account/user/${username}`);
  }

  /**
   * Token: used to filter user's blacklisted tags
   * Blacklist does not apply to bookmarks and cums
   */
  #requestSearch<T extends SearchResponse, P extends SearchParamBase>(
    url: string,
    param: P,
    token?: string
  ): Promise<T> {
    return this.getJSON(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(param)
    });
  }

  searchPlaylist(id: string, param: SearchParamBase, token?: string): Promise<SearchResponse> {
    return this.#requestSearch(`/api/v2/post/search/playlist/${id}`, param, token);
  }

  searchTags(param: TagAndBookmarkSearchParam, token?: string): Promise<SearchResponse> {
    return this.#requestSearch('/api/v2/post/search/root', param, token);
  }

  searchUserBookmark(
    userId: string,
    param: TagAndBookmarkSearchParam,
    token: string
  ): Promise<SearchResponse> {
    return this.#requestSearch(`/api/v2/post/search/bookmarked/${userId}`, param, token);
  }

  searchUserSubscriptions(
    userId: string,
    param: SubscriptionSearchParam,
    token: string
  ): Promise<SearchResponse> {
    return this.#requestSearch(
      `/api/v2/post/search/tag-subscriptions/${userId}`,
      { ...param, sortBy: TagSearchSortType.LATEST },
      token
    );
  }

  addBookmark(id: string, token: string): Promise<BookmarkResponse> {
    return this.getJSON('/api/v2/post/action/bookmark', {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${token}`
      },
      body: `{"postId":${id}}`
    });
  }
}
