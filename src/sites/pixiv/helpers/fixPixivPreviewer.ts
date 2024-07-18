import { regexp } from '@/lib/regExp';

//兼容Pixiv Previewer，排序后的搜索结果使用了原来第一个图片作为模板，需要删除复用的pdl按钮
// https://greasyfork.org/zh-CN/scripts/30766-pixiv-previewer
export function fixPixivPreviewer(nodes: HTMLElement[]) {
	const isPpSearchPage = regexp.searchPage.test(location.pathname);
	if (!isPpSearchPage) return;
	nodes.forEach((node) => {
		const pdlEle = node.querySelector('.pdl-btn');
		if (!pdlEle) return false;
		pdlEle.remove();
	});
}
