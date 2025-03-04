import { ApiBase } from '../base/api';

export class NijieApi extends ApiBase {
  getViewDoc(id: string) {
    return this.getDoc(`/view.php?id=${id}`);
  }

  getViewPopupDoc(id: string) {
    return this.getDoc(`/view_popup.php?id=${id}`);
  }
}
