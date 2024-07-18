export function addBookmark(id: string) {
  (unsafeWindow as any).addFav(id);
}
