export const regexp = {
	preloadData: /"meta-preload-data" content='(.*?)'>/,
	globalData: /"meta-global-data" content='(.*?)'>/,
	artworksPage: /artworks\/(\d+)$/,
	userPage: /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/,
	bookmarkPage: /users\/(\d+)\/bookmarks\/artworks/,
	userPageTags: /users\/\d+\/(artworks|illustrations|manga|bookmarks(?=\/artworks))/,
	searchPage: /\/tags\/.*\/(artworks|illustrations|manga)/,
	suscribePage: /bookmark_new_illust/,
	activityHref: /illust_id=(\d+)/,
	originSrcPageNum: /(?<=_p)\d+/,
	followLatest: /\/bookmark_new_illust(?:_r18)?\.php/,
	historyPage: /\/history\.php/,
	historyThumbnailsId: /\d+(?=_)/
};
