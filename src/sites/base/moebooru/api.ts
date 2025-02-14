import { JsonDataError } from '@/lib/error';
import { ApiBase } from '../api';

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

// https://github.com/moebooru/moebooru/blob/master/app/models/post/api_methods.rb

// konanchan
export interface MoebooruPostDataLegacy {
  id: number;
  tags: string;
  created_at: number;
  creator_id: number;
  author: string;
  change: number;
  source: string;
  score: number;
  md5: string;
  file_size: number;
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
  has_children: false;
  parent_id: null;
  status: 'active';
  width: number;
  height: number;
  /* artwork will not be shown in the posts list if it's held */
  is_held: boolean;
  frames_pending_string: string;
  frames_pending: unknown[];
  frames_string: string;
  frames: unknown[];
}

export interface MoebooruPostData extends MoebooruPostDataLegacy {
  updated_at: number;
  approver_id: number | null;
  file_ext: string;
  is_rating_locked: false;
  is_pending: boolean;
  is_note_locked: boolean;
  last_noted_at: number;
  last_commented_at: number;
}

export interface MoebooruPoolDataLegacy {
  id: number;
  name: string;
  /* Time in ISO 8601 format */
  created_at: string;
  updated_at: string;
  user_id: number;
  is_public: boolean;
  post_count: number;
  description: string;
  posts: MoebooruPostDataLegacy[];
}

export interface MoebooruPoolData extends MoebooruPoolDataLegacy {
  posts: MoebooruPostData[];
}

interface PostParams {
  /* How many posts you want to retrieve. There is a hard limit of 100 posts per request. */
  limit: number;
  /* The page number. */
  page: number;
  /* The tags to search for. Any tag combination that works on the web site will work here. This includes all the meta-tags. */
  tags: string | string[];
}

type PopularPostsParams =
  | {
      period: 'day' | 'week';
      day: number;
      month: number;
      year: number;
    }
  | {
      period: 'month';
      month: number;
      year: number;
    };

class MoebooruApi extends ApiBase {
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

  async getPostById(id: string) {
    const [data] = await this.getJSON<MoebooruPostData[] | MoebooruPostDataLegacy[]>(
      `/post.json?tags=id:${id}`
    );

    return data;
  }

  async getPosts(
    params: Partial<PostParams>
  ): Promise<MoebooruPostData[] | MoebooruPostDataLegacy[]> {
    let url = '/post.json?';
    Object.entries(params).forEach(([key, val]) => {
      if (typeof val === 'number') {
        val = String(val);
      } else if (Array.isArray(val)) {
        val = val.join('+');
      }

      url += `&${key}=${val}`;
    });

    return this.getJSON<MoebooruPostData[] | MoebooruPostDataLegacy[]>(url);
  }

  // pool only have one page
  async getPool(poolId: string, page: number = 1) {
    return this.getJSON<MoebooruPoolDataLegacy | MoebooruPoolData>(
      `/pool/show.json?id=${poolId}&page=${page}`
    );
  }

  async getPopularPosts(params: PopularPostsParams) {
    let url;

    const { month, year } = params;

    if (params.period === 'month') {
      url = `post/popular_by_month.json?month=${month}&year=${year}`;
    } else {
      url = `post/popular_by_${params.period}.json?day=${params.day}&month=${month}&year=${year}`;
    }

    return this.getJSON<MoebooruPoolDataLegacy[] | MoebooruPoolData[]>(url);
  }
}

export const moebooruApi = new MoebooruApi();
