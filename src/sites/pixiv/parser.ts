import type {
  UgoiraMeta,
  UserPageWorksItem,
  UserPageData,
  UserPageIllustsData,
  PreloadData,
  GlobalData,
  FollowLatest,
  PreloadIllustData,
  Category,
  BookmarksRest,
  FollowLatestMode
} from './types';
import type { FilterOption } from '@/sites/pixiv/observerCB/downloadBar';
import type { MediaMeta, SiteParser } from '../interface';
import type { FilteredIds } from './helpers/downloadByIds';
import { getElementText, sleep } from '@/lib/util';
import { IllustType } from './types';
import { api } from '@/sites/pixiv/service';
import { regexp } from '@/lib/regExp';
import { logger } from '@/lib/logger';
import { historyDb } from '@/lib/db';
import type { GenerateIdWithValidation } from '@/lib/components/Downloader/DownloaderRegisterConfig';

export interface chunksGenerator {
  total: number;
  generator: AsyncGenerator<FilteredIds, void, unknown>;
}

interface PixivMetaBase extends MediaMeta {
  userId: string;
  illustType: IllustType;
  tagsTranslated: string[];
  pageCount: number;
  comment: string;
  token: string;
  bookmarkData: PreloadIllustData['bookmarkData'];
}

export interface PixivIllustMeta extends PixivMetaBase {
  illustType: IllustType.illusts | IllustType.manga;
}

export interface PixivUgoiraMeta extends PixivMetaBase {
  illustType: IllustType.ugoira;
  ugoiraMeta: UgoiraMeta;
}

export type PixivMeta = PixivIllustMeta | PixivUgoiraMeta;

interface PixivParser extends SiteParser<PixivMeta> {
  parse(id: string): Promise<PixivMeta>;
  getFollowLatestGenerator(
    filterOption: FilterOption,
    mode: FollowLatestMode,
    page?: number
  ): Promise<chunksGenerator>;
  getChunksGenerator(
    userId: string,
    category: Category,
    tag: string,
    rest: BookmarksRest,
    filterOption: FilterOption
  ): Promise<chunksGenerator>;
  getAllWorksGenerator(userId: string, filterOption: FilterOption): Promise<chunksGenerator>;
  illustMangaGenerator: GenerateIdWithValidation<PixivMeta, string>;
  bookmarkGenerator: GenerateIdWithValidation<
    PixivMeta,
    | [userId: string]
    | [userId: string, bookmarkRest: 'hide' | 'show']
    | [userId: string, bookmarkRest: 'hide' | 'show', tag: string]
  >;
  followLatestGenerator: GenerateIdWithValidation<PixivMeta, ['all' | 'r18']>;
  taggedArtworkGenerator: GenerateIdWithValidation<
    PixivMeta,
    | [
        userId: string,
        category: Extract<Category, 'bookmarks'>,
        tag: string,
        bookmarkRest: 'hide' | 'show'
      ]
    | [userId: string, category: Exclude<Category, 'bookmarks'>, tag: string]
  >;
}

function isValidIllustType(illustType: IllustType, option: FilterOption): boolean {
  switch (illustType) {
    case IllustType.illusts:
      if (option.filterIllusts) return true;
      break;
    case IllustType.manga:
      if (option.filterManga) return true;
      break;
    case IllustType.ugoira:
      if (option.filterUgoira) return true;
      break;
    default:
      throw new Error('Invalid filter type');
  }
  return false;
}

async function filterWorks(works: UserPageWorksItem[], option: FilterOption): Promise<FilteredIds> {
  const obj: FilteredIds = {
    unavaliable: [],
    avaliable: [],
    invalid: []
  };

  for (const work of works) {
    if (!work.isBookmarkable) {
      obj.unavaliable.push(work.id);
    } else if (option.filterExcludeDownloaded && (await historyDb.has(work.id))) {
      obj.invalid.push(work.id);
    } else if (!isValidIllustType(work.illustType, option)) {
      obj.invalid.push(work.id);
    } else {
      obj.avaliable.push(work.id);
    }
  }

  return obj;
}

export const pixivParser: PixivParser = {
  async parse(illustId: string): Promise<PixivMeta> {
    const htmlText = await api.getArtworkHtml(illustId);

    const preloadDataText = htmlText.match(regexp.preloadData);
    if (!preloadDataText) throw new Error('Fail to parse preload data: ' + illustId);

    const globalDataText = htmlText.match(regexp.globalData);
    if (!globalDataText) throw new Error('Fail to parse global data: ' + illustId);

    const preloadData = JSON.parse(preloadDataText[1]) as PreloadData;
    const globalData = JSON.parse(globalDataText[1]) as GlobalData;
    const illustData = preloadData.illust[illustId];
    const {
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
    const { token } = globalData;

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
      id: illustId,
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
        ugoiraMeta: await api.getUgoiraMeta(illustId)
      };
    } else {
      return {
        ...meta,
        illustType
      };
    }
  },

  async getFollowLatestGenerator(
    filterOption: FilterOption,
    mode: FollowLatestMode,
    page?: number
  ): Promise<chunksGenerator> {
    const MAX_PAGE = 34;
    const MAX_ILLUSTS_PER_PAGE = 60;

    let lastId: number;
    let total: number;
    let data: FollowLatest;
    let cache: FollowLatest;

    function findLastId(ids: string[]): number {
      return Math.min(...ids.map((id) => Number(id)));
    }

    //关注作品少于60的情况,需要提前获得total
    if (page === undefined) {
      data = await api.getFollowLatestWorks(1, mode);
      const ids = data.page.ids;
      total = ids.length;
      lastId = findLastId(ids);

      if (total === MAX_ILLUSTS_PER_PAGE) {
        //可能作品数目刚好是60，所以需要检查第二页是否重复
        const secondPageData = await api.getFollowLatestWorks(2, mode);
        const secondIds = secondPageData.page.ids;
        const secondLastId = findLastId(secondIds);

        if (secondLastId < lastId) {
          //非重复页
          lastId = secondLastId;
          cache = secondPageData;
          total += secondIds.length;
        }
      }
    } else {
      data = await api.getFollowLatestWorks(page, mode);
      total = data.page.ids.length;
    }

    async function* generateIds(): AsyncGenerator<FilteredIds & { total?: number }, void, unknown> {
      yield await filterWorks(data.thumbnails.illust, filterOption);

      if (page === undefined) {
        //第二页无新作品
        if (total === MAX_ILLUSTS_PER_PAGE) return;
        // 只有两页
        if (total < MAX_ILLUSTS_PER_PAGE * 2) {
          yield await filterWorks(cache.thumbnails.illust, filterOption);
          return;
        }

        let currentPage = 3;
        while (currentPage <= MAX_PAGE) {
          const data = await api.getFollowLatestWorks(currentPage, mode);
          const ids = data.page.ids;
          const pageLastId = findLastId(ids);
          if (pageLastId >= lastId) {
            //返回重复数据说明无新作品了
            logger.info('getFollowLatestGenerator: got duplicate works');
            yield await filterWorks(cache.thumbnails.illust, filterOption);
            break;
          }

          lastId = pageLastId;
          total += ids.length;
          //生成前一页数据，保证已知total一直大于已下载作品数，避免判断下载已完成。
          yield { ...(await filterWorks(cache.thumbnails.illust, filterOption)), total };
          cache = data;
          currentPage++;
          await sleep(3000);
        }
      }
    }

    return {
      total,
      generator: generateIds()
    };
  },

  async getChunksGenerator(
    userId: string,
    category: Category,
    tag: string,
    rest: BookmarksRest,
    filterOption: FilterOption
  ): Promise<chunksGenerator> {
    const OFFSET = 48;
    let requestUrl: string;
    if (category === 'bookmarks') {
      requestUrl = `https://www.pixiv.net/ajax/user/${userId}/illusts/bookmarks?tag=${tag}&offset=0&limit=${OFFSET}&rest=${rest}&lang=ja`;
    } else {
      requestUrl = `https://www.pixiv.net/ajax/user/${userId}/${category}/tag?tag=${tag}&offset=0&limit=${OFFSET}&lang=ja`;
    }
    let head = 0;
    const firstPageData = await api.getJson<UserPageData>(requestUrl);
    const total = firstPageData.total;

    async function* generateIds() {
      yield await filterWorks(firstPageData.works, filterOption);
      head += OFFSET;
      while (head < total) {
        const data = await api.getJson<UserPageData>(
          requestUrl.replace('offset=0', 'offset=' + head)
        );
        head += OFFSET;
        await sleep(3000);
        yield await filterWorks(data.works, filterOption);
      }
    }

    return {
      total,
      generator: generateIds()
    };
  },

  async getAllWorksGenerator(userId: string, filterOption: FilterOption): Promise<chunksGenerator> {
    const profile = await api.getUserAllProfile(userId);

    let illustIds: string[] = [];
    let mangaIds: string[] = [];

    if (
      (filterOption.filterIllusts || filterOption.filterUgoira) &&
      typeof profile.illusts === 'object'
    ) {
      illustIds.push(...Object.keys(profile.illusts).reverse());
    }

    if (filterOption.filterManga && typeof profile.manga === 'object') {
      mangaIds.push(...Object.keys(profile.manga).reverse());
    }

    if (filterOption.filterExcludeDownloaded) {
      const filteredIllustIds: string[] = [];
      for (const id of illustIds) {
        const isDownloaded = await historyDb.has(id);
        !isDownloaded && filteredIllustIds.push(id);
      }
      illustIds = filteredIllustIds;

      const filteredMangaIds: string[] = [];
      for (const id of mangaIds) {
        const isDownloaded = await historyDb.has(id);
        !isDownloaded && filteredMangaIds.push(id);
      }
      mangaIds = filteredMangaIds;
    }

    async function* generateIds() {
      const OFFSET = 48;
      const baseUrl = 'https://www.pixiv.net/ajax/user/' + userId + '/profile/illusts';

      let workCategory = 'illust';
      while (illustIds.length > 0) {
        let searchStr = '?';
        const chunk: string[] = illustIds.splice(0, OFFSET);
        searchStr +=
          chunk.map((id) => 'ids[]=' + id).join('&') +
          `&work_category=${workCategory}&is_first_page=0&lang=ja`;
        const data = await api.getJson<UserPageIllustsData>(baseUrl + searchStr);
        await sleep(3000);
        yield await filterWorks(Object.values(data.works).reverse(), filterOption);
      }

      workCategory = 'manga';
      while (mangaIds.length > 0) {
        let searchStr = '?';
        const chunk: string[] = mangaIds.splice(0, OFFSET);
        searchStr +=
          chunk.map((id) => 'ids[]=' + id).join('&') +
          `&work_category=${workCategory}&is_first_page=0&lang=ja`;
        const data = await api.getJson<UserPageIllustsData>(baseUrl + searchStr);
        await sleep(3000);
        yield await filterWorks(Object.values(data.works).reverse(), filterOption);
      }
    }

    return {
      total: illustIds.length + mangaIds.length,
      generator: generateIds()
    };
  },

  async *illustMangaGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
    userId: string
  ) {
    const ARTWORKS_PER_PAGE = 48;
    const profile = await api.getUserAllProfile(userId);
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

    while (selectedIds.length > 0) {
      const chunk: string[] = selectedIds.splice(0, ARTWORKS_PER_PAGE);
      const queryStr =
        chunk.map((id) => 'ids[]=' + id).join('&') +
        `&work_category=illustManga&is_first_page=0&lang=ja`;

      const data = await api.getJson<UserPageIllustsData>(baseUrl + queryStr);
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

      selectedIds.length !== 0 && (await sleep(1500));
      page++;
    }
  },

  async *bookmarkGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
    userId: string,
    bookmarkRest: 'show' | 'hide' = 'show',
    tag: string = ''
  ) {
    const ARTWORKS_PER_PAGE = 48;
    const [startPage = null, endPage = null] = pageRange ?? [];

    if (!userId) throw new Error('Require argument "userId".');

    // TODO: need enhancement
    // get total with offset 0 to prevent `pageStart` from exceeding total.
    const requestUrl = `/ajax/user/${userId}/illusts/bookmarks?tag=${tag}&offset=${0}&limit=${ARTWORKS_PER_PAGE}&rest=${bookmarkRest}&lang=ja`;
    const firstPageData = await api.getJson<UserPageData>(requestUrl);
    const total = firstPageData.total;

    if (!total) throw new Error(`User ${userId} has no bookmarks.`);

    let offsetStart: number;
    let offsetEnd: number;
    let page = startPage ?? 1;

    startPage === null
      ? (offsetStart = 0)
      : (offsetStart =
          (startPage - 1) * ARTWORKS_PER_PAGE > total
            ? total
            : (startPage - 1) * ARTWORKS_PER_PAGE);
    endPage === null
      ? (offsetEnd = total)
      : (offsetEnd = endPage * ARTWORKS_PER_PAGE > total ? total : endPage * ARTWORKS_PER_PAGE);

    if (offsetStart === total) throw new RangeError(`Page ${page} exceeds the limit.`);

    const seleted = offsetEnd - offsetStart;

    for (let head = offsetStart; head < offsetEnd; head += ARTWORKS_PER_PAGE, page++) {
      let workDatas: UserPageData['works'];

      if (head === 0) {
        workDatas = firstPageData.works; // bookmarks are already sorted.
      } else {
        await sleep(1500);
        const requestUrl = `/ajax/user/${userId}/illusts/bookmarks?tag=${tag}&offset=${head}&limit=${ARTWORKS_PER_PAGE}&rest=${bookmarkRest}&lang=ja`;
        workDatas = (await api.getJson<UserPageData>(requestUrl)).works;
      }

      const avaliable: string[] = [];
      const invalid: string[] = [];
      const unavaliable: string[] = [];

      for (let i = 0; i < workDatas.length; i++) {
        const work = workDatas[i];
        const { id, isMasked } = work;

        if (isMasked) {
          unavaliable.push(String(id));
          continue;
        }

        const isValid = await checkValidity(work);
        isValid ? avaliable.push(id) : invalid.push(id);
      }

      yield {
        total: seleted,
        page,
        avaliable,
        invalid,
        unavaliable
      };
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

    function findEarliestId(ids: string[]): number {
      return Math.min(...ids.map((id) => Number(id)));
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

      yield {
        total,
        page,
        avaliable,
        invalid,
        unavaliable
      };
    }

    const data = await api.getFollowLatestWorks(page, mode);
    const ids = data.page.ids;
    total = ids.length;
    earliestId = findEarliestId(ids);

    // download only one page
    if (endPage === startPage) {
      yield* await yieldData(data, startPage);
      return;
    }

    if (total === ARTWORKS_PER_PAGE) {
      // 可能作品数目刚好是60，所以需要检查第二页是否重复
      const secondPageData = await api.getFollowLatestWorks(++page, mode);
      const secondIds = secondPageData.page.ids;
      const secondPageEarliestId = findEarliestId(secondIds);

      if (secondPageEarliestId < earliestId) {
        // 非重复页
        earliestId = secondPageEarliestId;
        cache = secondPageData;
        total += secondIds.length;
      }
    }

    yield* await yieldData(data, startPage);

    // 第二页无新作品
    if (total === ARTWORKS_PER_PAGE) return;
    // 只有两页
    if (total < ARTWORKS_PER_PAGE * 2 || endPage - startPage === 1) {
      yield* await yieldData(cache!, page);
      return;
    }

    while (++page <= endPage) {
      const data = await api.getFollowLatestWorks(page, mode);
      const ids = data.page.ids;
      const pageEarliestId = findEarliestId(ids);

      if (pageEarliestId >= earliestId) {
        // 返回重复数据说明无新作品了
        logger.info('getFollowLatestGenerator: got duplicate works');
        yield* await yieldData(cache!, page - 1);
        break;
      }

      earliestId = pageEarliestId;
      total += ids.length;
      //生成前一页数据，保证已知total一直大于已下载作品数，避免判断下载已完成。
      yield* await yieldData(cache!, page - 1);
      cache = data;
      await sleep(1500);
    }

    // yield last page
    yield* await yieldData(cache!, page - 1);
  },

  async *taggedArtworkGenerator(
    pageRange: [start: number, end: number] | null,
    checkValidity: (meta: Partial<PixivMeta>) => Promise<boolean>,
    userId: string,
    category: Category,
    tag: string,
    bookmarkRest: 'hide' | 'show' = 'show'
  ) {
    if (category === 'bookmarks') {
      yield* await this.bookmarkGenerator(pageRange, checkValidity, userId, bookmarkRest, tag);
      return;
    }

    const ARTWORKS_PER_PAGE = 48;
    const [startPage = null, endPage = null] = pageRange ?? [];

    let offset: number;
    let offsetEnd!: number;
    let total!: number;
    let page = startPage ?? 1;

    startPage === null ? (offset = 0) : (offset = (startPage - 1) * ARTWORKS_PER_PAGE);

    do {
      const url = `/ajax/user/${userId}/${category}/tag?tag=${tag}&offset=${offset}&limit=${ARTWORKS_PER_PAGE}&lang=ja`;
      const userPageData = await api.getJson<UserPageData>(url);
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
  }
};
