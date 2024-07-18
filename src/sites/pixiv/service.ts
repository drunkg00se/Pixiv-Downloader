import type {
  PixivAjaxResponse,
  AddBookmark,
  FollowLatest,
  AllProfile,
  UgoiraMeta,
  ArtworkDetail,
  FollowLatestMode
} from './types';
import { BookmarkRestrict } from './types';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';
import { RequestError, JsonDataError } from '@/lib/error';

/**
 * Get sentry-release
 * window.__SENTRY__.hub._stack[0].scope._session.release;
 */

function createService() {
  async function _requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    logger.info('fetch url:', url);
    const res = await fetch(url, init);
    if (!res.ok)
      throw new RequestError('Request ' + url + ' failed with status code ' + res.status, res);

    const data: PixivAjaxResponse<T> = await res.json();
    if (data.error) throw new JsonDataError(data.message);
    return data.body;
  }

  return {
    async getJson<T>(url: string): Promise<T> {
      return await _requestJson<T>(url);
    },

    async getArtworkHtml(illustId: string): Promise<string> {
      logger.info('Fetch illust:', illustId);
      let params = '';
      const tagLang = config.get('tagLang');
      if (tagLang !== 'ja') params = '?lang=' + tagLang;

      const res = await fetch('https://www.pixiv.net/artworks/' + illustId + params);
      if (!res.ok) throw new RequestError('Request failed with status code ' + res.status, res);
      return await res.text();
    },

    addBookmark(
      illustId: string,
      token: string,
      tags: string[] = [],
      restrict: BookmarkRestrict = BookmarkRestrict.public
    ): Promise<AddBookmark> {
      return _requestJson<AddBookmark>('/ajax/illusts/bookmarks/add', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json; charset=utf-8',
          'x-csrf-token': token
        },
        body: JSON.stringify({
          illust_id: illustId,
          restrict,
          comment: '',
          tags
        })
      });
    },

    getFollowLatestWorks(page: number, mode: FollowLatestMode = 'all'): Promise<FollowLatest> {
      return _requestJson<FollowLatest>(
        `/ajax/follow_latest/illust?p=${page}&mode=${mode}&lang=jp`
      );
    },

    getUserAllProfile(userId: string): Promise<AllProfile> {
      return _requestJson<AllProfile>('/ajax/user/' + userId + '/profile/all');
    },

    getUgoiraMeta(illustId: string): Promise<UgoiraMeta> {
      return _requestJson<UgoiraMeta>('/ajax/illust/' + illustId + '/ugoira_meta');
    },

    getArtworkDetail(illustId: string): Promise<ArtworkDetail> {
      let params = '';
      const tagLang = config.get('tagLang');
      if (tagLang !== 'ja') params = '?lang=' + tagLang;
      return _requestJson<ArtworkDetail>('/ajax/illust/' + illustId + params);
    }
  };
}

export const api = createService();
