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
  series: /\/user\/([0-9]+)\/series\/([0-9]+)/,
  unlisted: /(?<=artworks\/unlisted\/)[A-Za-z0-9]+/,

  imageExt: /bmp|jp(e)?g|jfif|png|tif(f)?|gif|svg|ico|webp|heif|heic|raw|cr2|nef|arw|dng|avif/i,
  videoExt: /mp4|avi|mkv|mov|wmv|flv|webm|mpeg|mpg|3gp|m4v|ts|vob|ogv|rm|rmvb|m2ts|mxf|asf|swf/i
};
