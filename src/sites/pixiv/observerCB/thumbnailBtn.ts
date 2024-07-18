import { regexp } from '@/lib/regExp';
import { getSelfId } from '@/sites/pixiv/helpers/getSelfId';
import { getIllustId } from '@/sites/pixiv/helpers/getIllustId';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { downloadArtwork } from '../downloadArtwork';

export function createThumbnailBtn(
	nodes: HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement> | NodeListOf<HTMLSpanElement>
): void {
	let isSelfBookmark = false;
	const inBookmarkPage = regexp.bookmarkPage.exec(location.pathname);
	inBookmarkPage && inBookmarkPage[1] === getSelfId() && (isSelfBookmark = true);

	nodes.forEach((e) => {
		let illustId: string;
		let type: ThumbnailBtnType | undefined;

		//  childElementCount检查是否为图片标题节点
		//  个人页面“精选”图片会新增两次
		if (
			(e.childElementCount !== 0 ||
				e.className.includes('_history-item') ||
				e.className.includes('_history-related-item')) &&
			!e.querySelector('pdl-button') &&
			(illustId = getIllustId(e))
		) {
			if (isSelfBookmark) {
				type = ThumbnailBtnType.PixivMyBookmark;
			} else if (e.className.includes('_history-related-item')) {
				// 历史记录相关作品position值为默认
				e.style.position = 'relative';
				type = ThumbnailBtnType.PixivHistory;
			} else if (e.className.includes('_history-item')) {
				type = ThumbnailBtnType.PixivHistory;
			}

			const btn = new ThumbnailButton({
				id: illustId,
				type,
				onClick: downloadArtwork
			});

			e.appendChild(btn);
		}
	});
}
