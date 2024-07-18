import { logger } from '@/lib/logger';
import { evalScript } from '@/lib/util';
import { unsafeWindow } from '$';

export async function addBookmark(id: string) {
	// 没有私有favorite_groups和ordfav权限 :(
	try {
		const token = document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
		if (!token) throw new Error('Can not get csrf-token');

		const res = await fetch('/favorites?post_id=' + id, {
			method: 'POST',
			headers: {
				'X-Csrf-Token': token
			}
		});
		if (!res.ok) throw new Error(res.status + ' ' + res.statusText);

		const galleryMatch = /(?<=^\/posts\/)\d+/.exec(location.pathname);

		// 在画廊页下载其它作品时，只显示提示
		if (galleryMatch && id !== galleryMatch[0]) {
			(unsafeWindow as any).Danbooru.Utility.notice('You have favorited ' + id);
		} else {
			const script = await res.text();
			evalScript(script);
		}
	} catch (error) {
		logger.error(error);
	}
}
