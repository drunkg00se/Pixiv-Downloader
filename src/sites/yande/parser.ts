import { RequestError } from '@/lib/error';
import type { MediaMeta, SiteParser } from '../interface';

interface ImageData {
  posts: {
    id: string;
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
    rating: string;
    is_rating_locked: boolean;
    has_children: boolean;
    parent_id: number;
    status: string;
    is_pending: boolean;
    width: number;
    height: number;
    is_held: boolean;
    frames_pending_string: string;
    frames_pending: any[];
    frames_string: string;
    frames: any[];
    is_note_locked: boolean;
    last_noted_at: number;
    last_commented_at: number;
  }[];
  pool_posts: any[];
  pools: any[];
  tags: Record<string, string>;
  votes: object;
}

export type YandeMeta = MediaMeta & { character: string };

export const yandeParser: SiteParser<YandeMeta> = {
  async parse(id: string): Promise<YandeMeta> {
    const res = await fetch('/post/show/' + id);
    if (!res.ok) throw new RequestError(res.url, res.status);
    const html = await res.text();

    const matchImageData = html.match(/(?<=Post\.register_resp\().+(?=\);)/);
    if (!matchImageData) throw new Error('Can not parse image data.');

    const imageData = JSON.parse(matchImageData[0]) as ImageData;
    const postData = imageData.posts[0];

    const artists: string[] = [];
    const characters: string[] = [];
    const tags: string[] = [];

    for (const tag in imageData.tags) {
      const tagType = imageData.tags[tag];

      if (tagType === 'artist') {
        artists.push(tag);
      } else if (tagType === 'character') {
        characters.push(tag);
      }

      tags.push(tagType + ':' + tag);
    }

    postData.source && tags.push('source:' + postData.source);

    return {
      id,
      src: postData.file_url,
      extendName: postData.file_ext,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      title: postData.md5,
      tags,
      createDate: new Date(postData.created_at * 1000).toISOString()
    };
  }
};
