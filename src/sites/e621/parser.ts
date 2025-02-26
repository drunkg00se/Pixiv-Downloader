import { ParserBase, type MediaMeta } from '@/sites/base/parser';
import type { E621Post } from './api';
// import type { YieldArtworkMeta } from '@/lib/components/Downloader/useBatchDownload';

export type E621ngMeta = MediaMeta & {
  comment: string;
  character: string;
  rating: E621Post['rating'];
  source: string;
  isFavorited: boolean;
};

export class E621ngParser extends ParserBase {
  buildMeta(postData: E621Post): E621ngMeta {
    const {
      id,
      file,
      tags: fullTags,
      description,
      created_at,
      rating,
      sources,
      is_favorited: isFavorited
    } = postData;

    const { ext, url, md5 } = file;
    if (!url) throw new Error(`Url can not be null: Post ${id}`);

    const tags: string[] = [];

    for (const [type, tagArr] of Object.entries(fullTags)) {
      tagArr.forEach((tag) => tags.push(`${type}:${tag}`));
    }

    return {
      id: String(id),
      src: url,
      extendName: ext,
      artist: fullTags.artist.join(',') || 'UnknownArtist',
      character: fullTags.character.join(',') || 'UnknownCharacter',
      title: md5,
      comment: description,
      tags,
      createDate: created_at,
      source: sources.join('\n'),
      rating,
      isFavorited
    };
  }

  parseCsrfToken() {
    return document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
  }

  parseCurrentUserId() {
    return document.head.querySelector<HTMLMetaElement>('meta[name="current-user-id"]')?.content;
  }
}
