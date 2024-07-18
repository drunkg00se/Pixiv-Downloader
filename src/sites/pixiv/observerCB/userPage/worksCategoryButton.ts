import { isDownloading, downloadBookmarksOrTags } from '@/sites/pixiv/helpers/batchDownload';
import { getSelfId } from '@/sites/pixiv/helpers/getSelfId';
import { createPdlBtn } from '@/lib/components/Button/pdlButton';
import type { Category, BookmarksRest } from '../../types';
import { regexp } from '@/lib/regExp';
import { logger } from '@/lib/logger';

//根据location.search来判断需要查询的tag种类
export type TagsCategory = 'artworks' | 'illustrations' | 'manga' | 'bookmarks';
export function createTagsBtn(userId: string, category: TagsCategory) {
	const tagsEles = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[status]')).map(
		(el) => el.parentElement!
	);
	if (!tagsEles.length) return;

	let cate: Category;
	if (category === 'illustrations' || category === 'artworks') {
		cate = 'illusts';
	} else {
		cate = category;
	}

	let rest: BookmarksRest = 'show';
	if (userId === getSelfId() && category === 'bookmarks' && location.search.includes('rest=hide'))
		rest = 'hide';

	tagsEles.forEach((ele) => {
		const tagBtn = ele.querySelector('.pdl-btn');
		if (tagBtn) {
			// 个人页面收藏tag，公开，不公开的tag共用，需要重新设置rest
			const btnRest = tagBtn.getAttribute('rest') as BookmarksRest;
			if (rest !== btnRest) tagBtn.setAttribute('rest', rest);
			return;
		}
		let tag;
		const tagLink = ele.querySelector('a');
		//数组末尾可能是更多按钮，更多按钮无a标签
		if (!tagLink) return;

		if (tagLink.getAttribute('status') !== 'active') {
			// 处理个人页面rest为hide时 链接带rest参数的情况
			if (rest === 'hide') {
				tag = tagLink.href.slice(tagLink.href.lastIndexOf('/') + 1, tagLink.href.lastIndexOf('?'));
			} else {
				tag = tagLink.href.slice(tagLink.href.lastIndexOf('/') + 1);
			}
		} else {
			const tagTextEles = ele.querySelectorAll('div[title]');
			if (!tagTextEles.length) return logger.info('No Tags Element found.');
			//忽略开头#
			tag = tagTextEles[tagTextEles.length - 1].getAttribute('title')!.slice(1);
		}

		const attrs = {
			attrs: { 'pdl-userId': userId, category: cate, tag, rest },
			classList: ['pdl-btn', 'pdl-tag']
		};
		//下载时点击tags两次会重新生成其他tag，需要进行识别。收藏页面无此情况
		if (isDownloading) attrs.classList.push('pdl-tag-hide');

		const dlBtn = createPdlBtn(attrs);

		if (!(tagLink.href.includes('bookmarks') && tagLink.getAttribute('status') !== 'active')) {
			//50%透明度
			dlBtn.style.backgroundColor = tagLink.getAttribute('color') + '80';
		}

		dlBtn.addEventListener('click', downloadBookmarksOrTags);
		ele.appendChild(dlBtn);
	});

	//标签搜索对话框
	// const tagFilter = document.querySelector("section .gm-profile-work-list-tag-filter-click");
	// if (tagFilter) return;
	let modalTagsEles: NodeListOf<HTMLAnchorElement>;
	let modal: HTMLDivElement | null;
	if (category === 'bookmarks') {
		modal = document.querySelector('div[role="presentation"]');
		if (!modal) return;
		modalTagsEles = modal.querySelectorAll('a');
	} else {
		const charcoalTokens = document.querySelectorAll<HTMLDivElement>('.charcoal-token');
		modal = charcoalTokens[charcoalTokens.length - 1];
		if (!modal) return;
		modalTagsEles = modal.querySelectorAll<HTMLAnchorElement>('a');
	}

	if (!regexp.userPageTags.exec(modalTagsEles[0]?.href)) return;
	modalTagsEles.forEach((ele) => {
		if (ele.querySelector('.pdl-btn')) return;
		let tag;
		if (rest === 'hide') {
			tag = ele.href.slice(ele.href.lastIndexOf('/') + 1, ele.href.lastIndexOf('?'));
		} else {
			tag = ele.href.slice(ele.href.lastIndexOf('/') + 1);
		}

		// const tag = ele.href.slice(ele.href.lastIndexOf("/") + 1);
		const attrs = {
			attrs: { 'pdl-userId': userId, category: cate, tag, rest },
			classList: ['pdl-btn', 'pdl-modal-tag']
		};
		//如果正在下载，不显示hover样式和屏蔽点击事件
		if (isDownloading) attrs.classList.push('pdl-tag-hide');
		const dlBtn = createPdlBtn(attrs);
		dlBtn.addEventListener('click', (evt) => {
			//关闭modal
			modal!.querySelector('svg')!.parentElement!.click();
			downloadBookmarksOrTags(evt);
		});
		ele.appendChild(dlBtn);
	});
}
