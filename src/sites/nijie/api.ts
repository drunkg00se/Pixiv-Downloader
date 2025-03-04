import { RequestError } from '@/lib/error';
import { ApiBase } from '../base/api';

export class NijieApi extends ApiBase {
  getViewDoc(id: string) {
    return this.getDoc(`/view.php?id=${id}`);
  }

  getViewPopupDoc(id: string) {
    return this.getDoc(`/view_popup.php?id=${id}`);
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
