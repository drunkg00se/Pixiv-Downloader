import { JsonDataError } from '@/lib/error';
import type { MediaMeta, SiteParser } from '../interface';
import { getElementText } from '@/lib/util';
import { danbooruApi } from './api';
import type {
  GenerateIdWithoutValidation,
  GenerateIdWithValidation
} from '@/lib/components/Downloader/useBatchDownload';
import type { DanbooruPost } from './types';

// general | sensitive | questionable | explicit
type Rating = 'g' | 's' | 'q' | 'e' | '';

export type DanbooruMeta = MediaMeta & {
  comment: string;
  character: string;
  rating: Rating;
  source: string;
};

interface DanbooruParser extends SiteParser<DanbooruMeta> {
  parse(id: string, param: { type: 'html' | 'api' }): Promise<DanbooruMeta>;
  parseIdByHtml(id: string): Promise<DanbooruMeta>;
  parseIdByApi(id: string): Promise<DanbooruMeta>;
  poolAndGroupGenerator: GenerateIdWithoutValidation<[id: string, type: 'pool' | 'favoriteGroup']>;
  postListGenerator: GenerateIdWithValidation<DanbooruMeta, [tags?: string[], limit?: number]>;
}

export const danbooruParser: DanbooruParser = {
  async parse(id, params) {
    const { type } = params;
    if (type === 'html') {
      return this.parseIdByHtml(id);
    } else {
      return this.parseIdByApi(id);
    }
  },

  async parseIdByHtml(id: string): Promise<DanbooruMeta> {
    const doc = await danbooruApi.getDoc('/posts/' + id);
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
    const source = doc.querySelector<HTMLAnchorElement>('li#post-info-source > a')?.href ?? '';
    const rating = /Rating: (General|Sensitive|Questionable|Explicit)/
      .exec(doc.documentElement.innerHTML)![1]
      .charAt(0)
      .toLowerCase() as Rating;

    // Comment
    let comment: string = '';
    const commentEl = doc.querySelector<HTMLElement>('#original-artist-commentary');
    commentEl && (comment = getElementText(commentEl));

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
  },

  async parseIdByApi(id: string): Promise<DanbooruMeta> {
    const [postDataResult, commentDataResult] = await Promise.allSettled([
      danbooruApi.getPost(id),
      danbooruApi.getArtistCommentary(id)
    ]);

    if (postDataResult.status === 'rejected') throw postDataResult.reason;

    // post may not have a comment.
    if (
      commentDataResult.status === 'rejected' &&
      !(commentDataResult.reason instanceof JsonDataError)
    )
      throw commentDataResult.reason;

    const {
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
    } = postDataResult.value;

    const { original_title = '', original_description = '' } =
      'value' in commentDataResult ? commentDataResult.value : {};

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
      id,
      src: file_url,
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
  },

  async *poolAndGroupGenerator(pageRange, poolOrGroupId, type) {
    const dataPromise =
      type === 'pool'
        ? danbooruApi.getPool(poolOrGroupId)
        : danbooruApi.getFavoriteGroups(poolOrGroupId);

    const [data, profile] = await Promise.all([dataPromise, danbooruApi.getProfile()]);

    const { post_ids } = data;
    const { per_page } = profile;
    const [pageStart = null, pageEnd = null] = pageRange ?? [];
    const idsPerPage: string[][] = [];
    const postCount = post_ids.length;

    for (let i = 0; i < postCount; i += per_page) {
      const ids = post_ids.slice(i, i + per_page).map((id) => String(id));
      idsPerPage.push(ids);
    }

    const poolPage = idsPerPage.length;
    const start = pageStart ?? 1;
    const end = pageEnd ? (pageEnd > poolPage ? poolPage : pageEnd) : poolPage;
    const total =
      end === poolPage
        ? (end - start) * per_page + idsPerPage[poolPage - 1].length
        : (end - start + 1) * per_page;

    if (start > poolPage) throw new RangeError(`Page ${start} exceeds the limit.`);

    for (let page = start - 1; page < end; page++) {
      yield {
        total,
        page,
        avaliable: idsPerPage[page],
        invalid: [],
        unavaliable: []
      };
    }
  },

  async *postListGenerator(pageRange, checkValidity, tags, limit) {
    const [pageStart = 1, pageEnd = 0] = pageRange ?? [];

    let page = pageStart;
    let postListData: DanbooruPost[] | null = await danbooruApi.getPostList({
      page,
      tags,
      limit
    });
    let total = postListData.length;
    let fetchError: Error | null = null;

    if (total === 0) throw new Error(`There is no post in page ${page}.`);

    do {
      let nextPageData: DanbooruPost[] | null = null;

      // fetch next page's post data.
      if (page !== pageEnd) {
        try {
          nextPageData = await danbooruApi.getPostList({ page: page + 1, tags, limit });
          // return empty array if there is no post.
          if (nextPageData.length) {
            total += nextPageData.length;
          } else {
            nextPageData = null;
          }
        } catch (error) {
          fetchError = error as Error;
          nextPageData = null;
        }
      }

      const avaliable: string[] = [];
      const invalid: string[] = [];
      const unavaliable: string[] = [];

      for (let i = 0; i < postListData.length; i++) {
        const { id, file_ext, tag_string } = postListData[i];
        const idStr = String(id);
        const validityCheckMeta: Partial<DanbooruMeta> = {
          id: idStr,
          extendName: file_ext,
          tags: tag_string.split(' ')
        };
        const isValid = await checkValidity(validityCheckMeta);
        isValid ? avaliable.push(idStr) : invalid.push(idStr);
      }

      yield {
        total,
        page,
        avaliable,
        invalid,
        unavaliable
      };

      page++;
      postListData = nextPageData;
    } while (postListData);

    if (fetchError) throw fetchError;
  }
};
