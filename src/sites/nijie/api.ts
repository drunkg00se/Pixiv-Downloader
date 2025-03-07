import { RequestError } from '@/lib/error';
import { ApiBase } from '../base/api';

export interface IllustSearchParams {
  /**
   * 0: タグ(tag)
   * 1: タイトル・本文(title / text)
   * @default 0
   */
  mode?: 0 | 1;
  /**
   * partial: 部分一致；
   * coincident：完全一致
   * @default partial
   */
  type?: 'partial' | 'coincident';
  /**
   * 0: 最新の投稿順
   * 1: いいねが多い順
   * 2: 抜かれた順
   * 3: 過去の投稿順
   * @default 0
   */
  sort?: 0 | 1 | 2 | 3;
  /**
   * 0: 全て
   * 1: イラスト(illustration)
   * 2: 漫画
   * 3: アニメ (anime)
   * @default 0
   */
  illustType?: 0 | 1 | 2 | 3;
  /**
   * 0: 投稿全期間
   * 1: 1ヶ月以内
   * 2: 3ヶ月以内
   * 3: 6ヶ月以内
   * @default 0
   */
  period?: 0 | 1 | 2 | 3;
  userId?: string;
  word: string;
  page: number;
}

export class NijieApi extends ApiBase {
  getViewDoc(id: string) {
    return this.getDoc(`/view.php?id=${id}`);
  }

  getViewPopupDoc(id: string) {
    return this.getDoc(`/view_popup.php?id=${id}`);
  }

  getUserIllustsDoc(id: string, page: number) {
    return this.getDoc(`/members_illust.php?id=${id}&p=${page}`);
  }

  getUserDojinDoc(id: string) {
    return this.getDoc(`/members_dojin.php?id=${id}`);
  }

  getUserBookmarkDoc(id: string, page: number) {
    return this.getDoc(`/user_like_illust_view.php?p=${page}&id=${id}`);
  }

  getUserFeedDoc(page: number) {
    return this.getDoc(`/like_user_view.php?p=${page}`);
  }

  getHistoryIllustDoc() {
    return this.getDoc('/history_illust.php');
  }

  getHistoryNuitaDoc() {
    return this.getDoc('/history_nuita.php');
  }

  /**
   * @param id - The id of tag.
   * @param page
   * @param sort - 0: 新しくブクマした順; 1: 古くブクマした順
   */
  getOkiniiriDoc(id: string, page: string, sort: '0' | '1') {
    return this.getDoc(`/okiniiri.php?p=${page}&id=${id}&sort=${sort}`);
  }

  getIllustSearchDoc(params: IllustSearchParams) {
    const {
      mode = 0,
      type = 'partial',
      sort = 0,
      illustType = 0,
      period = 0,
      userId = '0',
      word,
      page
    } = params;
    const searchParams = new URLSearchParams();
    searchParams.append('mode', String(mode));
    searchParams.append('type', String(type));
    searchParams.append('sort', String(sort));
    searchParams.append('illust_type', String(illustType));
    searchParams.append('period', String(period));
    searchParams.append('user_id', userId);
    searchParams.append('word', word);
    searchParams.append('p', String(page));

    return this.getDoc(`/search.php?${searchParams.toString()}`);
  }

  async addBookmark(id: string, tags?: string[]) {
    const params = new URLSearchParams();
    params.append('id', id);
    params.append('tag', tags?.join(' ') ?? '');

    const url = '/bookmark_add.php';
    const res = await this.fetch(url, {
      method: 'POST',
      redirect: 'manual',
      body: params
    });

    if (res.type !== 'opaqueredirect') throw new RequestError(url, res.status);
  }
}
