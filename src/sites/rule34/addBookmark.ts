import { unsafeWindow } from '$';

export function addBookmark(id: string) {
  (unsafeWindow as any).addFav(id);
}
