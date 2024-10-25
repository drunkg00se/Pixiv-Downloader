export const regexp = {
  preloadData: /"meta-preload-data" content='(.*?)'>/,
  globalData: /"meta-global-data" content='(.*?)'>/,
  artworksPage: /artworks\/(\d+)$/,
  userPage: /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/,
  bookmarkPage: /users\/(\d+)\/bookmarks\/artworks/,
  userPageTags:
    /(?<=users\/)([0-9]+)\/(artworks|illustrations|manga|bookmarks(?=\/artworks))(?:\/artworks)?\/?([^?]*)/,
  searchPage: /\/tags\/.*\/(artworks|illustrations|manga)/,
  activityHref: /illust_id=(\d+)/,
  originSrcPageNum: /(?<=_p)\d+/,
  followLatest: /\/bookmark_new_illust(?:_r18)?\.php/,
  historyPage: /\/history\.php/,
  historyThumbnailsId: /\d+(?=_)/,
  series: /(?<=\/user\/[0-9]+\/series\/)[0-9]+/
};
