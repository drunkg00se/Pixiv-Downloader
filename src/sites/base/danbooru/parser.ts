import { ParserBase, type BooruMeta } from '../parser';
import { getElementText, intersect } from '@/lib/util';
import type { DanbooruPost, DanbooruArtistCommentary } from './types';

type Rating = NonNullable<DanbooruPost['rating']> | '';

export interface DanbooruMeta extends BooruMeta {
  comment: string;
  rating: Rating;
  blacklistValidationTags?: string[];
}

export interface DanbooruBlacklistItem {
  tags: string;
  require: string[];
  exclude: string[];
  optional: string[];
  min_score: number | null;
}

interface IDanbooruParser {
  getBlacklistValidationTags(data: DanbooruPost): string[];

  parseCsrfToken(): string | null;

  buildMetaByDoc(doc: Document): DanbooruMeta;

  buildMetaByApi(post: DanbooruPost, artistCommentary?: DanbooruArtistCommentary): DanbooruMeta;

  getBlacklistByHtml(): string;

  getBlacklistItem(blacklistedTags: string, source?: 'html' | 'api'): DanbooruBlacklistItem[];

  isBlacklisted(matchTags: string[], blacklist: DanbooruBlacklistItem[]): boolean;
}

export class DanbooruParser extends ParserBase implements IDanbooruParser {
  /**
   * https://github.com/danbooru/danbooru/blob/master/app/javascript/src/javascripts/blacklists.js
   */
  #parseBlacklistItem(tags: string): DanbooruBlacklistItem {
    const tagsArr = tags.split(' ');
    const require: string[] = [];
    const exclude: string[] = [];
    const optional: string[] = [];
    let min_score: null | number = null;

    tagsArr.forEach((tag) => {
      if (tag.charAt(0) === '-') {
        exclude.push(tag.slice(1));
      } else if (tag.charAt(0) === '~') {
        optional.push(tag.slice(1));
      } else if (tag.match(/^score:<.+/)) {
        const score = tag.match(/^score:<(.+)/)![1];
        min_score = Number.parseInt(score);
      } else {
        require.push(tag);
      }
    });

    return { tags, require, exclude, optional, min_score };
  }

  getBlacklistValidationTags(data: DanbooruPost): string[] {
    const { tag_string, rating, uploader_id, is_deleted, is_flagged, is_pending } = data;
    const matchTags: string[] = tag_string.match(/\S+/g) ?? [];

    matchTags.push('rating:' + rating);
    matchTags.push('uploaderid:' + uploader_id);
    is_deleted && matchTags.push('status:deleted');
    is_flagged && matchTags.push('status:flagged');
    is_pending && matchTags.push('status:pending');

    return matchTags;
  }

  parseCsrfToken(): string | null {
    const token = document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    return token || null;
  }

  getBlacklistByHtml(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="blacklisted-tags"]')?.content ?? '';
  }

  getBlacklistItem(blacklistTags: string, source = 'api') {
    let separator: RegExp;

    if (source === 'html') {
      separator = /,/;
    } else {
      separator = /\n+/;
    }

    const tags = blacklistTags
      .replace(/(rating:\w)\w+/gi, '$1')
      .toLowerCase()
      .split(separator)
      .filter((tag) => tag.trim() !== '');

    return tags.map(this.#parseBlacklistItem);
  }

  isBlacklisted(matchTags: string[], blacklist: DanbooruBlacklistItem[]) {
    const scoreRe = /score:(-?[0-9]+)/;
    const scoreMatch = (matchTags.find((tag) => scoreRe.test(tag)) ?? '').match(scoreRe);
    const score = scoreMatch ? +scoreMatch[1] : scoreMatch;

    return blacklist.some((blacklistItem) => {
      const { require, exclude, optional, min_score } = blacklistItem;
      const hasTag = (tag: string) => matchTags.includes(tag);

      const scoreTest = min_score === null || score === null || score < min_score;

      return (
        require.every(hasTag) &&
        scoreTest &&
        (!optional.length || intersect(matchTags, optional).length) &&
        !exclude.some(hasTag)
      );
    });
  }

  buildMetaByDoc(doc: Document): DanbooruMeta {
    const src = doc.querySelector<HTMLAnchorElement>('a[download]')?.href;
    if (!src) throw new Error('Can not get media src');

    const ogImageMeta = doc.querySelector('meta[property="og:image"]')!;
    const mediaSrc = ogImageMeta.getAttribute('content')!;
    const title = mediaSrc.slice(mediaSrc.lastIndexOf('/') + 1).split('.')[0];

    const ogTypeMeta =
      doc.querySelector('meta[property="og:video:type"]') ||
      doc.querySelector('meta[property="og:image:type"]')!;
    const mimeType = ogTypeMeta.getAttribute('content')!;
    const extendName = mimeType.slice(mimeType.lastIndexOf('/') + 1);

    const artists: string[] = [];
    const characters: string[] = [];
    const tags: string[] = [];

    const tagLists = doc.querySelectorAll<HTMLUListElement>(
      'section#tag-list  ul[class*="-tag-list"]'
    );
    if (tagLists.length) {
      tagLists.forEach((ul) => {
        const tagTypeMatch = /[a-zA-Z]+(?=-tag-list)/.exec(ul.className);
        if (!tagTypeMatch) throw new Error('Unknown tag: ' + ul.className);

        const tagType = tagTypeMatch[0];
        const liEls = ul.children;

        let tagRef: string[] | undefined;
        if (tagType === 'artist') {
          tagRef = artists;
        } else if (tagType === 'character') {
          tagRef = characters;
        }

        for (let i = 0; i < liEls.length; i++) {
          const tag = liEls[i].getAttribute('data-tag-name');
          if (!tag) continue;

          tagRef && tagRef.push(tag);
          tags.push(tagType + ':' + tag);
        }
      });
    }

    const postDate = doc.querySelector('time')?.getAttribute('datetime') ?? '';

    // Comment
    let comment: string = '';
    const commentEl = doc.querySelector<HTMLElement>('#original-artist-commentary');
    commentEl && (comment = getElementText(commentEl));

    const imageContainer = doc.querySelector<HTMLElement>('section.image-container')!;
    const {
      source = '',
      rating = '',
      id
    } = imageContainer.dataset as {
      source: string;
      rating: Rating;
      id: string;
    };

    if (!id) throw new Error('Can not parse post id.');

    return {
      id,
      src,
      extendName,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      title,
      comment,
      tags,
      createDate: postDate,
      source,
      rating
    };
  }

  buildMetaByApi(post: DanbooruPost, artistCommentary?: DanbooruArtistCommentary): DanbooruMeta {
    const {
      id,
      created_at,
      file_ext,
      file_url,
      md5,
      tag_string_artist,
      tag_string_character,
      tag_string_copyright,
      tag_string_general,
      tag_string_meta,
      source,
      rating
    } = post;

    const { original_title = '', original_description = '' } = artistCommentary ?? {};

    const addTypeToTag = (type: string, tag: string) =>
      tag.split(' ').map((tag) => type + ':' + tag);

    const tags: string[] = [
      ...addTypeToTag('artist', tag_string_artist),
      ...addTypeToTag('character', tag_string_character),
      ...addTypeToTag('copyright', tag_string_copyright),
      ...addTypeToTag('general', tag_string_general),
      ...addTypeToTag('meta', tag_string_meta)
    ];

    const comment =
      original_title && original_description
        ? original_title + '\n' + original_description
        : original_title || original_description;

    return {
      id: String(id),
      src: file_url ?? '',
      extendName: file_ext,
      artist: tag_string_artist.replaceAll(' ', ',') || 'UnknownArtist',
      character: tag_string_character.replaceAll(' ', ',') || 'UnknownCharacter',
      title: md5,
      comment,
      tags,
      createDate: created_at,
      rating: rating ?? '',
      source
    };
  }
}
