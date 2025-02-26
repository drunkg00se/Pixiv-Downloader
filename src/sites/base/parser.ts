import type { YieldArtworkMeta } from '@/lib/components/Downloader/useBatchDownload';

export interface MediaMeta {
  id: string;
  src: string;
  extendName: string;
  artist: string;
  title: string;
  tags: string[];
  createDate: string;
}

export enum PostValidState {
  VALID,
  INVALID,
  UNAVAILABLE
}

export abstract class ParserBase {
  async *paginationGenerator<PostData extends object, IdOrMeta extends string | MediaMeta>(
    pageRange: [start: number, end: number] | null,
    postsPerPage: number,
    getPostData: (page: number) => Promise<PostData[]>,
    isValid: (data: PostData) => Promise<PostValidState>,
    buildMeta: (data: PostData) => IdOrMeta
  ): AsyncGenerator<YieldArtworkMeta<IdOrMeta>, void, undefined> {
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

      const avaliable: IdOrMeta[] = [];
      const invalid: IdOrMeta[] = [];
      const unavaliable: IdOrMeta[] = [];

      for (const data of postDatas) {
        const isPostValid = await isValid(data);
        const idOrMeta = buildMeta(data);

        if (isPostValid === PostValidState.VALID) {
          avaliable.push(idOrMeta);
        } else if (isPostValid === PostValidState.INVALID) {
          invalid.push(idOrMeta);
        } else {
          unavaliable.push(idOrMeta);
        }
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
