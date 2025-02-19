import { RequestError } from '@/lib/error';
import {
  GelbooruApiV020,
  type GelbooruPostDataV020,
  type PostsListParams
} from '../base/gelbooru/api';

type TypeChangedKey = 'sample' | 'has_notes';

type BooleanString = 'true' | 'false';

export interface GelbooruPostDataV025 extends Omit<GelbooruPostDataV020, TypeChangedKey> {
  /** "Mon Feb 17 19:16:17 -0600 2025" */
  created_at: string;
  md5: string;
  creator_id: number;
  sample: 0 | 1;
  preview_height: number;
  preview_width: number;
  title: string;
  has_notes: BooleanString;
  has_comments: BooleanString;
  post_locked: 0 | 1;
  has_children: BooleanString;
}

interface PostsList {
  ['@attributes']: {
    /** gelbooru has hard limit of 100 */
    limit: number;
    /** pid * 100 */
    offset: number;
    /** total posts count of the search result */
    count: number;
  };
  /** No `post` key if there is no post matches the search */
  post?: GelbooruPostDataV025[];
}

export class GelbooruApiV025 extends GelbooruApiV020 {
  async getPosts(): Promise<GelbooruPostDataV020[]> {
    throw new Error('This is a Gelbooru v0.2.0 method, do not use.');
  }

  async getPostsV025(params: Partial<PostsListParams>): Promise<GelbooruPostDataV025[]> {
    let url = '/index.php?page=dapi&s=post&q=index&json=1';

    Object.entries(params).forEach(([key, val]) => {
      if (typeof val === 'number') {
        val = String(val);
      } else if (Array.isArray(val)) {
        val = val.join('+');
      }

      url += `&${key}=${val}`;
    });

    const res = await this.fetch(url);

    if (!res.ok) throw new RequestError(url, res.status);

    const postsListData = (await res.json()) as PostsList;

    if (postsListData.post) {
      return postsListData.post;
    } else {
      return [];
    }
  }
}
