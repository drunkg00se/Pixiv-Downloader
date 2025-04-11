import { ApiBase } from '../base/api';

export class Rule34PahealApi extends ApiBase {
  getPostViewDoc(id: string) {
    return this.getDoc(`/post/view/${id}`);
  }

  getPostListDoc(page: number, tag?: string) {
    let url = '/post/list/';
    url += tag !== undefined ? `${tag}/${page}` : String(page);
    return this.getDoc(url);
  }
}
