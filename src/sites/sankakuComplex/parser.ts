import { ParserBase, type BooruMeta } from '../base/parser';
import {
  SankakuTagType,
  type SankakuPost,
  type SankakuPostInPool,
  type SankakuPostURL,
  type SankakuTagDetail
} from './api';

export interface SankakuMeta extends BooruMeta {
  tagsWithType: string[];
}

export class SankakuParser extends ParserBase {
  #tagTypeMap: Record<SankakuTagType, string> = {
    [SankakuTagType.GENERAL]: 'general',
    [SankakuTagType.ARTIST]: 'artist',
    [SankakuTagType.STUDIO]: 'studio',
    [SankakuTagType.COPYRIGHT]: 'copyright',
    [SankakuTagType.CHARACTER]: 'character',
    [SankakuTagType.GENRE]: 'genre',
    [SankakuTagType.MEDIUM]: 'medium',
    [SankakuTagType.META]: 'meta',
    [SankakuTagType.FASHION]: 'fashion',
    [SankakuTagType.ANATOMY]: 'anatomy'
  };

  #isPostWithFileURL(postData: SankakuPost | SankakuPostInPool): postData is SankakuPostInPool {
    return 'file_url' in postData;
  }

  buildMeta(postData: SankakuPostInPool): SankakuMeta;
  buildMeta(
    postData: SankakuPost,
    postURL: SankakuPostURL['data'],
    tagsDetail: SankakuTagDetail[]
  ): SankakuMeta;
  buildMeta(
    postData: SankakuPost | SankakuPostInPool,
    postURL?: SankakuPostURL['data'],
    tagsDetail?: SankakuTagDetail[]
  ): SankakuMeta {
    let file_url: string;
    let tags: SankakuTagDetail[];

    if (this.#isPostWithFileURL(postData)) {
      ({ file_url, tags } = postData);
    } else {
      if (!postURL || !tagsDetail)
        throw new Error('Argument `postURL` and `tagsDetail` are required.');

      ({ file_url } = postURL);
      tags = tagsDetail;
    }

    const { id, created_at, file_ext, tag_names, source, fav_count, md5 } = postData;

    if (!file_url) throw new Error('Can not get the file url for post: ' + id);

    const tagsWithType: string[] = [];
    const artists: string[] = [];
    const characters: string[] = [];

    tags.forEach((tag) => {
      const { tagName, type } = tag;

      const mapTag = this.#tagTypeMap[tag.type];
      tagsWithType.push(`${mapTag}:${tagName}`);

      if (type === SankakuTagType.ARTIST) {
        artists.push(tagName);
      } else if (type === SankakuTagType.CHARACTER) {
        characters.push(tagName);
      }
    });

    return {
      id,
      src: file_url,
      extendName: file_ext,
      artist: artists.join(',') || this.UNKNOWN_ARTIST,
      character: characters.join(',') || this.UNKNOWN_CHARACTER,
      tags: tag_names,
      tagsWithType,
      score: fav_count,
      source: source || '',
      createDate: new Date(created_at.s * 1000).toISOString(),
      title: md5
    };
  }

  getAccessToken(): string | undefined {
    const [accessToken] = new RegExp('(?<=accessToken=).*?(?=;|$)').exec(document.cookie) ?? [];
    return accessToken;
  }

  getAvatarURL(): string {
    return localStorage.current_user
      ? (JSON.parse(localStorage.current_user).avatar_url ?? '')
      : '';
  }

  isURLExpired(url: string, expiresEarlyBySeconds = 60) {
    const timestamp = new URL(url).searchParams.get('e');
    if (!timestamp) throw new Error('Can not find the expired params. ' + url);

    return Date.now() >= (+timestamp - expiresEarlyBySeconds) * 1000;
  }
}
