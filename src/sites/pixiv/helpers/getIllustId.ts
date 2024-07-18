import { regexp } from '@/lib/regExp';

export function getIllustId(node: HTMLAnchorElement | HTMLSpanElement): string {
	const isLinkToArtworksPage = regexp.artworksPage.exec(node.getAttribute('href') || '');
	if (isLinkToArtworksPage) {
		if (
			node.getAttribute('data-gtm-value') ||
			[
				'gtm-illust-recommend-node-node',
				'gtm-discover-user-recommend-node',
				'work',
				'_history-item',
				'_history-related-item'
			].some((className) => node.classList.contains(className))
		) {
			return isLinkToArtworksPage[1];
		}
	} else if (node.className.includes('_history-item')) {
		// history页 非会员历史记录预览
		const result = regexp.historyThumbnailsId.exec(node.getAttribute('style') || '');
		if (result) return result[0];
	} else {
		const isActivityThumb = regexp.activityHref.exec(node.getAttribute('href') || '');
		if (isActivityThumb && node.classList.contains('work')) {
			return isActivityThumb[1];
		}
	}

	return '';
}
