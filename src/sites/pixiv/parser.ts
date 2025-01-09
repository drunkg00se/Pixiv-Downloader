import type {
  UgoiraMeta,
  UserPageData,
  UserPageIllustsData,
  PreloadData,
  GlobalData,
  FollowLatest,
  Category,
  BookmarksRest,
  FollowLatestMode,
  ArtworkDetail
} from './types';
import type { MediaMeta, SiteParser } from '../interface';
import { getElementText } from '@/lib/util';
import { IllustType } from './types';
import { pixivApi } from '@/sites/pixiv/api';
import { regexp } from '@/lib/regExp';
import { logger } from '@/lib/logger';
import type { ValidatedIdGenerator } from '@/lib/components/Downloader/useBatchDownload';
import { TagLanguage } from '@/lib/config';

interface PixivMetaBase extends MediaMeta {
  userId: string;
  illustType: IllustType;
  tagsTranslated: string[];
  pageCount: number;
  comment: string;
  token: string;
  bookmarkData: ArtworkDetail['bookmarkData'];
}

export interface PixivIllustMeta extends PixivMetaBase {
  illustType: IllustType.illusts | IllustType.manga;
}

export interface PixivUgoiraMeta extends PixivMetaBase {
  illustType: IllustType.ugoira;
  ugoiraMeta: UgoiraMeta;
}

export type PixivMeta = PixivIllustMeta | PixivUgoiraMeta;

interface PixivParam extends Record<string, string> {
  type: 'html' | 'api' | 'unlisted';
  tagLang: TagLanguage;
}

interface PixivParser extends SiteParser<PixivMeta> {
  parse(id: string, param: PixivParam): Promise<PixivMeta>;
  illustMangaGenerator: ValidatedIdGenerator<PixivMeta, string>;
  followLatestGenerator: ValidatedIdGenerator<PixivMeta, FollowLatestMode>;
  chunkGenerator: ValidatedIdGenerator<
    PixivMeta,
    | [userId: string, category: 'bookmarks', tag: string, bookmarkRest: BookmarksRest]
    | [userId: string, category: 'illusts' | 'manga', tag: string]
  >;
  bookmarkGenerator: ValidatedIdGenerator<
    PixivMeta,
    | [userId: string]
    | [userId: string, bookmarkRest: BookmarksRest]
    | [userId: string, bookmarkRest: BookmarksRest, tag: string]
  >;
  taggedArtworkGenerator: ValidatedIdGenerator<
    PixivMeta,
    | [
        userId: string,
        category: Extract<Category, 'bookmarks'>,
        tag: string,
        bookmarkRest: BookmarksRest
      ]
    | [userId: string, category: Exclude<Category, 'bookmarks'>, tag: string]
  >;
  seriesGenerator: ValidatedIdGenerator<PixivMeta, string>;
}

export const pixivParser: PixivParser = {
  async parse(illustId: string, param: PixivParam): Promise<PixivMeta> {
    let illustData: ArtworkDetail;
    let token: string;
    const { tagLang, type } = param;

    if (type === 'api') {
      illustData = await pixivApi.getArtworkDetail(illustId, tagLang);
      token = '';
    } else if (type === 'unlisted') {
      illustData = await pixivApi.getUnlistedArtworkDetail(illustId, tagLang);
      token = '';
    } else {
      const htmlText = await pixivApi.getArtworkHtml(illustId, tagLang);

      const preloadDataText = htmlText.match(regexp.preloadData);
      if (!preloadDataText) throw new Error('Fail to parse preload data: ' + illustId);

      const globalDataText = htmlText.match(regexp.globalData);
      if (!globalDataText) throw new Error('Fail to parse global data: ' + illustId);

      const preloadData = JSON.parse(preloadDataText[1]) as PreloadData;
      const globalData = JSON.parse(globalDataText[1]) as GlobalData;

      illustData = preloadData.illust[illustId];
      token = globalData.token;
    }

    const {
      id,
      illustType,
      userName,
      userId,
      illustTitle,
      illustComment,
      tags,
      pageCount,
      createDate,
      urls,
      bookmarkData
    } = illustData;

    const tagsArr: string[] = [];
    const tagsTranslatedArr: string[] = [];
    tags.tags.forEach((tagData) => {
      tagsArr.push(tagData.tag);
      tagsTranslatedArr.push(tagData.translation?.en || tagData.tag);
    });

    // Coment
    const unescapeComment = illustComment
      .replaceAll(/&lt;|&amp;lt;/g, '<')
      .replaceAll(/&gt;|&amp;gt;/g, '>');
    const p = document.createElement('p');
    p.innerHTML = unescapeComment;
    const comment = getElementText(p);

    const meta = {
      id,
      src: urls.original,
      extendName: urls.original.slice(-3),
      artist: userName,
      title: illustTitle,
      tags: tagsArr,
      tagsTranslated: tagsTranslatedArr,
      userId,
      pageCount,
      comment,
      bookmarkData,
      createDate,
      token
    };

    if (illustType === IllustType.ugoira) {
      return {
        ...meta,
        illustType,
        ugoiraMeta: await pixivApi.getUgoiraMeta(illustId)
      };
    } else {
      return {
        ...meta,
        illustType
      };
    }
  },

  async *illustMangaGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
    userId: string
  ) {
    const ARTWORKS_PER_PAGE = 48;
    const profile = await pixivApi.getUserAllProfile(userId);
    let ids: string[] = [];

    typeof profile.illusts === 'object' && ids.push(...Object.keys(profile.illusts));
    typeof profile.manga === 'object' && ids.push(...Object.keys(profile.manga));
    if (!ids.length) throw new Error(`User ${userId} has no illusts or mangas.`);

    //Sort ids in descending order.
    ids = ids.sort((a, b) => Number(b) - Number(a));

    // select page range id
    let sliceStart: number;
    let sliceEnd: number;

    const [startPage = null, endPage = null] = pageRange ?? [];
    let page = startPage ?? 1;

    startPage === null ? (sliceStart = 0) : (sliceStart = (startPage - 1) * ARTWORKS_PER_PAGE);
    endPage === null ? (sliceEnd = ids.length) : (sliceEnd = endPage * ARTWORKS_PER_PAGE);

    const selectedIds = ids.slice(sliceStart, sliceEnd);
    if (!selectedIds.length) throw new RangeError(`Page ${page} exceeds the limit.`);

    const baseUrl = `https://www.pixiv.net/ajax/user/${userId}/profile/illusts?`;
    const total = selectedIds.length;

    do {
      const chunk: string[] = selectedIds.splice(0, ARTWORKS_PER_PAGE);
      const queryStr =
        chunk.map((id) => 'ids[]=' + id).join('&') +
        `&work_category=illustManga&is_first_page=0&lang=ja`;

      const data = await pixivApi.getJSON<UserPageIllustsData>(baseUrl + queryStr);
      const workDatas = Object.values(data.works).sort((a, b) => Number(b.id) - Number(a.id));

      const avaliable: string[] = [];
      const invalid: string[] = [];
      const unavaliable: string[] = [];

      for (let i = 0; i < workDatas.length; i++) {
        const work = workDatas[i];
        const { id, isMasked } = work;

        if (isMasked) {
          unavaliable.push(String(id)); // unavaliable id is number;
          continue;
        }

        const isValid = await checkValidity(work);
        isValid ? avaliable.push(id) : invalid.push(id);
      }

      yield {
        total,
        page,
        avaliable,
        invalid,
        unavaliable
      };

      page++;
    } while (selectedIds.length > 0);
  },

  async *chunkGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
    userId: string,
    category: Category,
    tag: string,
    bookmarkRest: BookmarksRest = 'show'
  ) {
    const ARTWORKS_PER_PAGE = 48;
    const [startPage = null, endPage = null] = pageRange ?? [];

    if (!userId) throw new Error('Require argument "userId".');

    let offset: number;
    let offsetEnd!: number;
    let total!: number;
    let page = startPage ?? 1;

    startPage === null ? (offset = 0) : (offset = (startPage - 1) * ARTWORKS_PER_PAGE);

    do {
      let requestUrl: string;
      if (category === 'bookmarks') {
        requestUrl = `/ajax/user/${userId}/illusts/bookmarks?tag=${tag}&offset=${offset}&limit=${ARTWORKS_PER_PAGE}&rest=${bookmarkRest}&lang=ja`;
      } else {
        requestUrl = `/ajax/user/${userId}/${category}/tag?tag=${tag}&offset=${offset}&limit=${ARTWORKS_PER_PAGE}&lang=ja`;
      }

      const userPageData = await pixivApi.getJSON<UserPageData>(requestUrl);
      const { works, total: totalArtwork } = userPageData;
      if (totalArtwork === 0)
        throw new Error(`User ${userId} has no ${category} tagged with ${tag}.`);

      if (!offsetEnd) {
        endPage === null
          ? (offsetEnd = totalArtwork)
          : (offsetEnd =
              endPage * ARTWORKS_PER_PAGE > totalArtwork
                ? totalArtwork
                : endPage * ARTWORKS_PER_PAGE);

        if (offsetEnd <= offset) throw new RangeError(`Page ${page} exceeds the limit.`);

        total = offsetEnd - offset;
      }

      const avaliable: string[] = [];
      const invalid: string[] = [];
      const unavaliable: string[] = [];

      for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const { id, isMasked } = work;

        if (isMasked) {
          unavaliable.push(String(id));
          continue;
        }

        const isValid = await checkValidity(work);
        isValid ? avaliable.push(id) : invalid.push(id);
      }

      yield {
        total,
        page,
        avaliable,
        invalid,
        unavaliable
      };

      page++;
    } while ((offset += ARTWORKS_PER_PAGE) < offsetEnd);
  },

  async *bookmarkGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
    userId: string,
    bookmarkRest: BookmarksRest = 'show',
    tag: string = ''
  ) {
    yield* this.chunkGenerator(pageRange, checkValidity, userId, 'bookmarks', tag, bookmarkRest);
  },

  async *taggedArtworkGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
    userId: string,
    category: Category,
    tag: string,
    bookmarkRest: BookmarksRest = 'show'
  ) {
    if (category === 'bookmarks') {
      yield* this.bookmarkGenerator(pageRange, checkValidity, userId, bookmarkRest, tag);
    } else {
      yield* this.chunkGenerator(pageRange, checkValidity, userId, category, tag);
    }
  },

  async *followLatestGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
    mode = 'all'
  ) {
    const PAGE_LIMIT = 34;
    const ARTWORKS_PER_PAGE = 60;
    let [startPage = null, endPage = null] = pageRange ?? [];

    startPage === null && (startPage = 1);
    (endPage === null || endPage > PAGE_LIMIT) && (endPage = PAGE_LIMIT);

    if (startPage > PAGE_LIMIT) throw new RangeError(`Page ${startPage} exceeds the limit.`);

    let earliestId: number;
    let total: number;
    let cache: FollowLatest;
    let page = startPage;

    function findEarliestId(ids: number[]): number {
      return Math.min(...ids);
    }

    async function* yieldData(data: FollowLatest, page: number) {
      const avaliable: string[] = [];
      const invalid: string[] = [];
      const unavaliable: string[] = [];

      const { illust } = data.thumbnails;

      for (let i = 0; i < illust.length; i++) {
        const work = illust[i];
        const { id, isMasked } = work;

        if (isMasked) {
          unavaliable.push(String(id));
          continue;
        }

        const isValid = await checkValidity(work);
        isValid ? avaliable.push(id) : invalid.push(id);
      }

      const { ids } = data.page;

      // `data.page.ids` may contains some unavailable IDs that are not included in `data.thumbnails.illust`
      if (ids.length !== illust.length) {
        const idDiff = ids.filter((id) => !illust.some((item) => +item.id === id));
        unavaliable.push(...idDiff.map((id) => String(id)));
      }

      yield {
        total,
        page,
        avaliable,
        invalid,
        unavaliable
      };
    }

    const data = await pixivApi.getFollowLatestWorks(page, mode);
    const ids = data.page.ids;
    total = ids.length;
    earliestId = findEarliestId(ids);

    // download only one page
    if (endPage === startPage) {
      yield* yieldData(data, startPage);
      return;
    }

    if (total === ARTWORKS_PER_PAGE) {
      // 可能作品数目刚好是60，所以需要检查第二页是否重复
      const secondPageData = await pixivApi.getFollowLatestWorks(++page, mode);
      const secondIds = secondPageData.page.ids;
      const secondPageEarliestId = findEarliestId(secondIds);

      if (secondPageEarliestId < earliestId) {
        // 非重复页
        earliestId = secondPageEarliestId;
        cache = secondPageData;
        total += secondIds.length;
      }
    }

    yield* yieldData(data, startPage);

    // 第二页无新作品
    if (total === ARTWORKS_PER_PAGE) return;
    // 只有两页
    if (total < ARTWORKS_PER_PAGE * 2 || endPage - startPage === 1) {
      yield* yieldData(cache!, page);
      return;
    }

    while (++page <= endPage) {
      const data = await pixivApi.getFollowLatestWorks(page, mode);
      const ids = data.page.ids;
      const pageEarliestId = findEarliestId(ids);

      if (pageEarliestId >= earliestId) {
        // 返回重复数据说明无新作品了
        logger.info('getFollowLatestGenerator: got duplicate works');
        yield* yieldData(cache!, page - 1);
        break;
      }

      earliestId = pageEarliestId;
      total += ids.length;
      //生成前一页数据，保证已知total一直大于已下载作品数，避免判断下载已完成。
      yield* yieldData(cache!, page - 1);
      cache = data;
    }

    // yield last page
    yield* yieldData(cache!, page - 1);
  },

  async *seriesGenerator(pageRange, checkValidity, seriesId) {
    const [startPage = 1, endPage = 0] = pageRange ?? [];
    let yieldedId = 0;
    let total = 0;
    let currentPage = startPage;

    do {
      const seriesData = await pixivApi.getSeriesData(seriesId, currentPage);
      const { series } = seriesData.page;
      if (!series.length) throw new Error(`Invalid page: ${currentPage}`);

      const { illust } = seriesData.thumbnails;

      if (!total) {
        // work for now since the series is sorted in descending order
        const isLastPage = series.some(({ order }) => order === 1);
        const totalWorkCount = seriesData.page.total;

        if (isLastPage) {
          total = series.length;
        } else if (endPage === 0) {
          total = totalWorkCount;
        } else {
          const artworksPerPage = series.length;
          const lastPage = Math.ceil(totalWorkCount / artworksPerPage);

          if (endPage >= lastPage) {
            const lastPageWorkCount = totalWorkCount % artworksPerPage || artworksPerPage;
            total = (lastPage - startPage) * artworksPerPage + lastPageWorkCount;
          } else {
            total = (endPage - startPage + 1) * artworksPerPage;
          }
        }
      }

      const avaliable: string[] = [];
      const invalid: string[] = [];
      const unavaliable: string[] = [];

      for (let i = 0; i < series.length; i++) {
        const { workId } = series[i];
        // illust.length is not equal to series.length
        const thumbnail = illust.find((thumbnail) => thumbnail.id === workId);

        if (!thumbnail || thumbnail.isMasked) {
          unavaliable.push(workId);
          continue;
        }

        const isValid = await checkValidity(thumbnail);
        isValid ? avaliable.push(workId) : invalid.push(workId);
      }

      yield {
        total,
        page: currentPage,
        avaliable,
        invalid,
        unavaliable
      };

      yieldedId += series.length;
      currentPage++;
    } while (yieldedId < total);
  }
};
