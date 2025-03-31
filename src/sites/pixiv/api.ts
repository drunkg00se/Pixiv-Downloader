import type {
  PixivAjaxResponse,
  AddBookmark,
  FollowLatest,
  AllProfile,
  UgoiraMeta,
  ArtworkDetail,
  FollowLatestMode,
  UserData,
  SeriesData,
  LikeIllust
} from './types';
import { BookmarkRestrict } from './types';
import { RequestError, JsonDataError } from '@/lib/error';
import { ApiBase } from '../base/api';
import type { PixivTagLocale } from '@/lib/store/siteFeature.svelte';

class PixivApi extends ApiBase {
  async getJSON<T>(url: string, init?: RequestInit): Promise<T> {
    const data: PixivAjaxResponse<T> = await super.getJSON(url, init);
    if (data.error) throw new JsonDataError(data.message);
    return data.body;
  }

  async getArtworkHtml(illustId: string, lang: PixivTagLocale): Promise<string> {
    const res = await this.fetch(`/artworks/${illustId}?lang=${lang}`);
    if (!res.ok) throw new RequestError(res.url, res.status);
    return await res.text();
  }

  getArtworkDoc(illustId: string, lang: PixivTagLocale): Promise<Document> {
    return this.getDoc(`/artworks/${illustId}?lang=${lang}`);
  }

  getArtworkDetail(illustId: string, lang: PixivTagLocale): Promise<ArtworkDetail> {
    return this.getJSON<ArtworkDetail>(`/ajax/illust/${illustId}?lang=${lang}`);
  }

  getUnlistedArtworkDetail(unlistedId: string, lang: PixivTagLocale): Promise<ArtworkDetail> {
    return this.getJSON<ArtworkDetail>(`/ajax/illust/unlisted/${unlistedId}?lang=${lang}`);
  }

  addBookmark(
    illustId: string,
    token: string,
    tags: string[] = [],
    restrict: BookmarkRestrict = BookmarkRestrict.public
  ): Promise<AddBookmark> {
    return this.getJSON<AddBookmark>('/ajax/illusts/bookmarks/add', {
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
  }

  likeIllust(illustId: string, token: string) {
    return this.getJSON<LikeIllust>('/ajax/illusts/like', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8',
        'x-csrf-token': token
      },
      body: JSON.stringify({
        illust_id: illustId
      })
    });
  }

  getFollowLatestWorks(page: number, mode: FollowLatestMode = 'all'): Promise<FollowLatest> {
    return this.getJSON<FollowLatest>(`/ajax/follow_latest/illust?p=${page}&mode=${mode}&lang=jp`);
  }

  getUserAllProfile(userId: string): Promise<AllProfile> {
    return this.getJSON<AllProfile>('/ajax/user/' + userId + '/profile/all');
  }

  getUgoiraMeta(illustId: string): Promise<UgoiraMeta> {
    return this.getJSON<UgoiraMeta>('/ajax/illust/' + illustId + '/ugoira_meta');
  }

  getUserData(userId: string): Promise<UserData> {
    return this.getJSON<UserData>('/ajax/user/' + userId);
  }

  getSeriesData(seriesId: string, page: number): Promise<SeriesData> {
    return this.getJSON<SeriesData>(`/ajax/series/${seriesId}?p=${page}`);
  }
}

export const pixivApi = new PixivApi();
