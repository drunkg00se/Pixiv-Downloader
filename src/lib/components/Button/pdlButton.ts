import { logger } from '@/lib/logger';

export type SetBtnProgress = (progress: number | null, updateProgressbar?: boolean) => void;
export interface CreatePdlBtnOption {
	attrs?: Record<string, string>;
	classList?: string[];
	textContent?: string;
	downloadArtwork?(btn: HTMLButtonElement, setProgress: SetBtnProgress): Promise<any>;
}

export function createPdlBtn(option: CreatePdlBtnOption): HTMLButtonElement {
	const { attrs, classList, textContent, downloadArtwork } = option;

	const ele = document.createElement('button');
	textContent && (ele.textContent = textContent);

	if (classList && classList.length > 0) {
		for (const cla of classList) {
			ele.classList.add(cla);
		}
	}

	if (attrs) {
		for (const key in attrs) {
			ele.setAttribute(key, attrs[key]);
		}
	}

	if (downloadArtwork) {
		ele.addEventListener('click', (evt) => {
			//ranking页需要preventDefault否则会跳转页面
			evt.preventDefault();
			evt.stopPropagation();
			const btn = evt.currentTarget as HTMLButtonElement;
			if (!btn.classList.contains('pdl-progress')) {
				btn.classList.add('pdl-progress');

				const setProgress = (progress: number | null, updateProgressbar = true) => {
					if (progress !== null) {
						progress = Math.floor(progress);
						btn.textContent = String(progress);
						updateProgressbar && btn.style.setProperty('--pdl-progress', progress + '%');
					} else {
						btn.textContent = '';
						updateProgressbar && btn.style.removeProperty('--pdl-progress');
					}
				};

				downloadArtwork(btn, setProgress)
					.then(() => {
						// 下载完成，改图标, localStorage增加记录
						btn.classList.remove('pdl-error');
						btn.classList.add('pdl-complete');
					})
					// 图片下载错误，图标改为警告
					.catch((err) => {
						if (err) logger.error(err);
						btn.classList.remove('pdl-complete');
						btn.classList.add('pdl-error');
					})
					.finally(() => {
						btn.innerHTML = '';
						btn.style.removeProperty('--pdl-progress');
						btn.classList.remove('pdl-progress');
					});
			}
		});
	}

	return ele;
}
