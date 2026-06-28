export interface SkebUser {
  id: number;
  screen_name: string;
  name: string;
  avatar_url: string;
  header_url: string;
  creator: boolean;
  received_works_count: number;
  acceptable: boolean;
  description: string;
  skills: SkebSkill[];
  pixiv_id: number | null;
  nijie_id: number | null;
  fanbox_id: string | null;
}

export interface SkebSkill {
  genre: SkebGenre;
  default_amount: number;
}

export type SkebGenre = 'art' | 'comic' | 'voice' | 'novel' | 'video' | 'music' | 'correction';

export interface SkebWorkListItem {
  path: string;
  genre: SkebGenre;
  nsfw: boolean;
  hardcore: boolean;
  private: boolean;
  tipped: boolean;
  body: string;
  thumbnail_image_urls: SkebImageUrls | null;
  consored_thumbnail_image_urls: SkebImageUrls | null;
  private_thumbnail_image_urls: SkebImageUrls | null;
  creator_id: number;
  vtt_url: string | null;
  duration: number | null;
  nc: number;
  word_count: number | null;
  transcoder: string | null;
  creator_acceptable_same_genre: boolean;
}

export interface SkebImageUrls {
  src: string;
  srcset: string;
}

export interface SkebPreview {
  id: number;
  url: string;
  poster_url: string | null;
  vtt_url: string | null;
  information: SkebPreviewInformation;
}

export interface SkebPreviewInformation {
  width: number;
  height: number;
  byte_size: number;
  duration: number | null;
  software: string | null;
  extension: string;
  is_movie: boolean;
  transcoder: string;
}

export interface SkebNovelResponse {
  text: string;
  urls: string[];
}

export interface SkebWork extends SkebWorkListItem {
  id: number;
  extension: string;
  width: number;
  height: number;
  size: string;
  preview_url: string;
  article_image_url: string | null;
  og_image_url: string | null;
  tag_list: string[];
  anonymous: boolean;
  thanks: string | null;
  source_thanks: string | null;
  translated_thanks: string | null;
  movie: boolean;
  software: string | null;
  creator: SkebUser;
  client: SkebUser;
  previews: SkebPreview[];
}
