import { ApiBase } from '../../base/api';

export interface GelbooruPostDataV020 {
  preview_url: string;
  sample_url: string;
  file_url: string;
  directory: number;
  hash: string;
  width: number;
  height: number;
  id: number;
  /** Image filename */
  image: string;
  /** Unix time */
  change: number;
  owner: string;
  parent_id: number;
  rating: 'explicit' | 'safe' | 'questionable' | 'general';
  sample: boolean;
  sample_height: number;
  sample_width: number;
  /**
   * rule34: 0
   * safebooru: null
   * */
  score: number | null;
  tags: string;
  source: string;
  status: string;
  has_notes: boolean;
  comment_count: number;
}

interface PostsListParams {
  /** How many posts you want to retrieve. There is a hard limit of 1000 posts per request. */
  limit: number;
  /** The page number. */
  pid: number;
  /** The tags to search for. Any tag combination that works on the web site will work here.
   * This includes all the meta-tags. See cheatsheet for more information. */
  tags: string | string[];
  /** Change ID of the post. This is in Unix time so there are likely others with the same value
   * if updated at the same time. */
  cid: string;
  /** The post id. */
  id: string;
}

export class GelbooruApiV020 extends ApiBase {
  async getPosts(params: Partial<PostsListParams>): Promise<GelbooruPostDataV020[]> {
    let url = '/index.php?page=dapi&s=post&q=index&json=1';

    Object.entries(params).forEach(([key, val]) => {
      if (typeof val === 'number') {
        val = String(val);
      } else if (Array.isArray(val)) {
        val = val.join('+');
      }

      url += `&${key}=${val}`;
    });

    const res = await fetch(url);
    try {
      // response will be empty if there is no post.
      return await res.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return [];
      } else {
        throw error;
      }
    }
  }

  getPostDoc(id: string): Promise<Document> {
    return this.getDoc('index.php?page=post&s=view&id=' + id);
  }

  // Does not include blacklisted images(unless you search the blacklisted tag), making it
  // more suitable for batch downloads that need to handle page ranges.
  getPostsDoc(pid = 0, tags: string | string[] = 'all') {
    if (Array.isArray(tags)) tags = tags.join('+');
    return this.getDoc(`/index.php?page=post&s=list&tags=${tags}&pid=${pid}`);
  }

  getFavoriteDoc(userId: string, pid = 0): Promise<Document> {
    return this.getDoc(`/index.php?page=favorites&s=view&id=${userId}&pid=${pid}`);
  }

  getPoolDoc(poolId: string): Promise<Document> {
    return this.getDoc(`/index.php?page=pool&s=show&id=${poolId}`);
  }
}
