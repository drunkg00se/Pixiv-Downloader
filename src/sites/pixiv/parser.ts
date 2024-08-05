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
    if (!preloadDataText) throw new Error('Fail to parse preload data.');

    const globalDataText = htmlText.match(regexp.globalData);
    if (!globalDataText) throw new Error('Fail to parse global data.');

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
  }
};
