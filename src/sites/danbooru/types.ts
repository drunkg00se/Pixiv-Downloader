// https://danbooru.donmai.us/wiki_pages/api%3Ausers
export interface DanbooruUserProfile {
  id: number | null;
  name: string;
  /** 10, 20, 30, 31, 32, 40, 50 */
  level: number;
  inviter_id: number | null;
  post_update_count: number;
  note_update_count: number;
  post_upload_count: number;
  favorite_count: number;
  // unread_dmail_count: number;
  is_banned: boolean;
  /** Each bit stores a boolean value. */
  // bit_prefs: number;
  theme: 'auto' | 'light' | 'dark';
  favorite_tags: string | null;
  blacklisted_tags: string | null;
  comment_threshold: number;
  time_zone: string;
  /** 1 - 200 */
  per_page: number;
  default_image_size: 'large' | 'original';
  // custom_css: string;
  // upload_points: number;
  last_logged_in_at: string;
  last_forum_read_at: string;
  created_at: string;
  updated_at: string;

  // not listed
  custom_style: null;
  is_deleted: boolean;
  level_string: string;
  receive_email_notifications: boolean;
  new_post_navigation_layout: boolean;
  enable_private_favorites: boolean;
  show_deleted_children: boolean;
  disable_categorized_saved_searches: boolean;
  disable_tagged_filenames: boolean;
  disable_mobile_gestures: boolean;
  enable_safe_mode: boolean;
  enable_desktop_mode: boolean;
  disable_post_tooltips: boolean;
  requires_verification: boolean;
  is_verified: boolean;
  show_deleted_posts: boolean;
  statement_timeout: number;
  favorite_group_limit: number;
  tag_query_limit: number;
  max_saved_searches: number;
  wiki_page_version_count: number;
  artist_version_count: number;
  artist_commentary_version_count: number;
  pool_version_count: number;
  forum_post_count: number;
  comment_count: number;
  favorite_group_count: number;
  appeal_count: number;
  flag_count: number;
  positive_feedback_count: number;
  neutral_feedback_count: number;
  negative_feedback_count: number;
}

/** https://danbooru.donmai.us/wiki_pages/api%3Apools */
export interface DanbooruPool {
  id: number;
  name: string;
  /** "2024-10-11T07:52:11.514+08:00", */
  created_at: string;
  updated_at: string;
  description: string;
  /** unused */
  is_active: boolean;
  is_deleted: boolean;
  /** array of post ids */
  post_ids: number[];
  category: 'series' | 'collection';
  post_count: number;
}

/** https://danbooru.donmai.us/wiki_pages/api%3Aposts */
export interface DanbooruPost {
  id: number;
  uploader_id: number;
  approver_id: number;
  tag_string: string;
  tag_string_general: string;
  tag_string_artist: string;
  tag_string_copyright: string;
  tag_string_character: string;
  tag_string_meta: string;
  /** general | sensitive | questionable | explicit */
  rating: 'g' | 's' | 'q' | 'e' | null;
  parent_id: number | null;
  source: string;
  md5: string;
  file_url: string | undefined;
  large_file_url: string;
  preview_file_url: string;
  file_ext: string;
  file_size: number;
  image_width: number;
  image_height: number;
  score: number;
  fav_count: number;
  tag_count_general: number;
  tag_count_artist: number;
  tag_count_copyright: number;
  tag_count_character: number;
  tag_count_meta: number;
  last_comment_bumped_at: string | null;
  last_noted_at: string | null;
  has_children: boolean;
  created_at: string;
  updated_at: string;

  // not listed
  up_score: number;
  down_score: number;
  is_pending: boolean;
  is_flagged: boolean;
  is_deleted: boolean;
  tag_count: number;
  is_banned: boolean;
  pixiv_id: string | null;
  last_commented_at: string | null;
  has_active_children: boolean;
  bit_flags: number;
  has_large: boolean;
  has_visible_children: boolean;
  media_asset: {
    id: number;
    created_at: string;
    updated_at: string;
    md5: string;
    file_ext: string;
    file_size: number;
    image_width: number;
    image_height: number;
    duration: null;
    status: 'active' | 'pending' | 'flagged' | 'deleted';
    file_key: string;
    is_public: boolean;
    pixel_hash: string;
    variants: {
      type: string;
      url: string;
      width: number;
      height: number;
      file_ext: string;
    }[];
  };
}

/** https://danbooru.donmai.us/wiki_pages/api%3Aartist_commentaries */
export interface DanbooruArtistCommentary {
  id: number;
  post_id: number;
  original_title: string;
  original_description: string;
  translated_title: string;
  translated_description: string;
  created_at: string;
  updated_at: string;
}

export interface DanbooruFavoriteGroup {
  id: number;
  name: string;
  creator_id: number;
  post_ids: number[];
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export interface DanbooruBadResponse {
  success: false;
  error: string;
  message: string;
  backtrace: string[] | null;
}
