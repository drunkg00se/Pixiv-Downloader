import { RequestError } from '@/lib/error';
import { ApiBase } from '../base/api';

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
