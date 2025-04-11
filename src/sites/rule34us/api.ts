import { ApiBase } from '../base/api';

export class Rule34UsApi extends ApiBase {
  getPostViewDoc(id: string) {
    return this.getDoc(`/index.php?r=posts/view&id=${id}`);
  }

  getPostListDoc(page: number, tags = 'all') {
    return this.getDoc(`/index.php?r=posts/index&page=${page}&q=${tags}`);
  }

  getFavoritesDoc(id: string, page: number) {
    return this.getDoc(`/index.php?r=favorites/view&id=${id}&page=${page}`);
  }

  addBookmark(id: string) {
    return this.fetch(`/index.php?r=favorites/create&id=${id}`);
  }
}
