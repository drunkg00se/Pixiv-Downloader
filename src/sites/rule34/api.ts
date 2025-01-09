import { ApiBase } from '../base/api';

interface Rule34PostData {
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
  rating: 'explicit' | 'safe' | 'questionable';
  sample: boolean;
  sample_height: number;
  sample_width: number;
  score: number;
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

class Rule34Api extends ApiBase {
  async getPosts(params: Partial<PostsListParams>): Promise<Rule34PostData[]> {
    let url = 'https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1';
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
}

export const rule34Api = new Rule34Api();
