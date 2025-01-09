import { JsonDataError } from '@/lib/error';
import { ApiBase } from '../base/api';

// https://yande.re/help/api
// Status Code	              Meaning
// 200 OK	                    Request was successful
// 403 Forbidden	            Access denied
// 404 Not Found	            Not found
// 420 Invalid Record	        Record could not be saved
// 421 User Throttled	        User is throttled, try again later
// 422 Locked	                The resource is locked and cannot be modified
// 423 Already Exists	        Resource already exists
// 424 Invalid Parameters	    The given parameters were invalid
// 500 Internal Server Error	Some unknown error occurred on the server
// 503 Service Unavailable	  Server cannot currently handle the request, try again later

interface BadResponse {
  success: false;
  reason: string;
}

export interface YandePostData {
  id: number;
  tags: string;
  created_at: number;
  updated_at: number;
  creator_id: number;
  approver_id: number | null;
  author: string;
  change: number;
  source: string;
  score: number;
  md5: string;
  file_size: number;
  file_ext: string;
  file_url: string;
  is_shown_in_index: boolean;
  preview_url: string;
  preview_width: number;
  preview_height: number;
  actual_preview_width: number;
  actual_preview_height: number;
  sample_url: string;
  sample_width: number;
  sample_height: number;
  sample_file_size: number;
  jpeg_url: string;
  jpeg_width: number;
  jpeg_height: number;
  jpeg_file_size: number;
  rating: 's' | 'e' | 'q';
  is_rating_locked: false;
  has_children: false;
  parent_id: null;
  status: 'active';
  is_pending: boolean;
  width: number;
  height: number;
  /* artwork will not be shown in the posts list if it's held */
  is_held: boolean;
  frames_pending_string: string;
  frames_pending: unknown[];
  frames_string: string;
  frames: unknown[];
  is_note_locked: boolean;
  last_noted_at: number;
  last_commented_at: number;
}

export interface YandePoolData {
  id: number;
  name: string;
  /* Time in ISO 8601 format */
  created_at: string;
  updated_at: string;
  user_id: number;
  is_public: boolean;
  post_count: number;
  description: string;
  posts: YandePostData[];
}

interface PostParams {
  /* How many posts you want to retrieve. There is a hard limit of 100 posts per request. */
  limit: number;
  /* The page number. */
  page: number;
  /* The tags to search for. Any tag combination that works on the web site will work here. This includes all the meta-tags. */
  tags: string | string[];
}

class YandeApi extends ApiBase {
  private isBadResponse(obj: object): obj is BadResponse {
    return 'success' in obj && !obj.success;
  }

  async getJSON<T extends object>(url: string, init?: RequestInit): Promise<T> {
    const json: T = await super.getJSON(url, init);
    if (this.isBadResponse(json)) {
      throw new JsonDataError(json.reason);
    }

    return json;
  }

  async getPosts(params: Partial<PostParams>): Promise<YandePostData[]> {
    let url = '/post.json?';
    Object.entries(params).forEach(([key, val]) => {
      if (typeof val === 'number') {
        val = String(val);
      } else if (Array.isArray(val)) {
        val = val.join('+');
      }

      url += `&${key}=${val}`;
    });

    return this.getJSON<YandePostData[]>(url);
  }

  // pool only have one page
  async getPool(poolId: string, page: number = 1) {
    return this.getJSON<YandePoolData>(`/pool/show.json?id=${poolId}&page=${page}`);
  }
}

export const yandeApi = new YandeApi();
