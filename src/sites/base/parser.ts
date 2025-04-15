import type { YieldArtwork } from '@/lib/components/Downloader/useBatchDownload';

export interface MediaMeta<T extends string | string[] = string> {
  id: string;
  src: T;
  extendName: T;
  artist: string;
  title: string;
  tags: string[];
  createDate: string;
}

export interface BooruMeta extends MediaMeta {
  tagsWithType?: string[];
  character: string;
  score: number;
  source: string;
}

export enum PostValidState {
  VALID,
  INVALID,
  UNAVAILABLE
}

export abstract class ParserBase {
  protected UNKNOWN_ARTIST = 'UnknownArtist';
  protected UNKNOWN_CHARACTER = 'UnknownCharacter';

  async *paginationGenerator<
    PostData extends object | string,
    IdOrMeta extends string | MediaMeta<string | string[]>
  >(
    pageRange: [start: number, end: number] | null,
    getPostData: (
      page: number
    ) => Promise<
      { lastPage: false; data: PostData[] } | { lastPage: true; data: PostData[] | undefined }
    >,
    buildMeta: (data: PostData) => IdOrMeta,
    isValid?: (data: PostData) => Promise<PostValidState>
  ): AsyncGenerator<YieldArtwork<IdOrMeta>, void, undefined> {
    const [pageStart = 1, pageEnd = 0] = pageRange ?? [];
    let page = pageStart;

    let { lastPage, data: postDatas } = await getPostData(page);

    if (!postDatas || !postDatas.length) throw new Error(`There is no post in page ${page}.`);

    let total = postDatas.length;
    let fetchError: Error | null = null;

    do {
      let nextPageData: PostData[] | undefined = undefined;
      let nextPageIsLast: boolean = true;

      // fetch next page's post data.
      if (page !== pageEnd && !lastPage) {
        try {
          const { lastPage, data } = await getPostData(page + 1);
          const dataLen = data?.length ?? 0;

          // consider it the last page if data.length === 0
          if (dataLen) {
            total += dataLen;
            nextPageData = data;
            nextPageIsLast = lastPage;
          }
        } catch (error) {
          fetchError = error as Error;
        }
      }

      const avaliable: IdOrMeta[] = [];
      const invalid: IdOrMeta[] = [];
      const unavaliable: IdOrMeta[] = [];

      if (typeof isValid === 'function') {
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
      } else {
        for (const data of postDatas) {
          avaliable.push(buildMeta(data));
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
      lastPage = nextPageIsLast;
    } while (postDatas);

    if (fetchError) throw fetchError;
  }
}
