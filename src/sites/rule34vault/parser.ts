import { ParserBase, type BooruMeta } from '../base/parser';
import {
  type Rule34VaultPost,
  Rule34VaultPostType,
  Rule34VaultTagType,
  type Rule34VaultUserProfile
} from './api';

export interface Rule34VaultMeta extends BooruMeta {
  tagsToStore: string[];
}

export class Rule34VaultParser extends ParserBase {
  #tagTypeMap: Record<Rule34VaultTagType, string> = {
    [Rule34VaultTagType.GENERAL]: 'general',
    [Rule34VaultTagType.COPYRIGHT]: 'copyright',
    [Rule34VaultTagType.CHARACTER]: 'character',
    [Rule34VaultTagType.ARTIST]: 'artist'
  };

  buildMeta(postData: Rule34VaultPost): Rule34VaultMeta {
    const { id, type, data, posted, likes = 0, tags: postTags } = postData;

    const tagsToFilter: string[] = [];
    const tagsToStore: string[] = [];
    const artists: string[] = [];
    const characters: string[] = [];

    for (const { value, type } of postTags) {
      tagsToFilter.push(value);

      const tag = value.replaceAll(' ', '_');
      tagsToStore.push(`${this.#tagTypeMap[type]}:${tag}`);

      if (type === Rule34VaultTagType.ARTIST) {
        artists.push(tag);
      } else if (type === Rule34VaultTagType.CHARACTER) {
        characters.push(tag);
      }
    }

    const extendName = type === Rule34VaultPostType.JPG ? 'jpg' : 'mp4';

    const src = `https://r34xyz.b-cdn.net/posts/${(id / 1000) | 0}/${id}/${id}.${extendName}`;

    return {
      id: String(id),
      src,
      extendName,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      tags: tagsToFilter,
      tagsToStore,
      score: likes,
      source: data.sources ? data.sources.join('\n') : '',
      createDate: posted,
      title: ''
    };
  }

  getCurrentUserToken(): string | undefined {
    return localStorage.getItem('token') || undefined;
  }

  getCurrentUserProfile(): Rule34VaultUserProfile | undefined {
    const profileStr = localStorage.getItem('user');
    return profileStr ? JSON.parse(profileStr) : undefined;
  }
}
