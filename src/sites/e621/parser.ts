import type { MediaMeta } from '../interface';
import type { E621Post } from './api';
import type { YieldArtworkMeta } from '@/lib/components/Downloader/useBatchDownload';

export type E621ngMeta = MediaMeta & {
  comment: string;
  character: string;
  rating: E621Post['rating'];
  source: string;
  isFavorited: boolean;
};

export class E621ngParser {
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

  public async *paginationMetaGenerator<PostData, Meta>(
    pageRange: [start: number, end: number] | null,
    postsPerPage: number,
    getPostData: (page: number) => Promise<PostData[]>,
    isValid: (data: PostData) => Promise<boolean>,
    buildMeta: (data: PostData) => Meta
  ): AsyncGenerator<YieldArtworkMeta<Meta>, void, undefined> {
    const [pageStart = 1, pageEnd = 0] = pageRange ?? [];

    let page = pageStart;
    let postDatas: PostData[] | null = await getPostData(page);
    let total = postDatas.length;
    let fetchError: Error | null = null;

    if (total === 0) throw new Error(`There is no post in page ${page}.`);

    do {
      let nextPageData: PostData[] | null = null;

      // fetch next page's post data.
      if (page !== pageEnd && postDatas.length >= postsPerPage) {
        try {
          nextPageData = await getPostData(page + 1);
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

      const avaliable: Meta[] = [];
      const invalid: Meta[] = [];
      const unavaliable: Meta[] = [];

      for (const data of postDatas) {
        const isValidData = await isValid(data);
        const meta = buildMeta(data);
        isValidData ? avaliable.push(meta) : invalid.push(meta);
      }

      yield {
        total,
        page,
        avaliable,
        invalid,
        unavaliable
      };

      page++;
      postDatas = nextPageData;
    } while (postDatas);

    if (fetchError) throw fetchError;
  }
}
