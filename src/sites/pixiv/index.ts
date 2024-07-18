import { SiteInject } from '../base';
import { observerCallback } from './observerCB';
import { GM_addStyle } from '$';

import downloadBar from '@/assets/styles/downloadBar.scss?inline';
import checkbox from '@/assets/styles/checkbox.scss?inline';

export class Pixiv extends SiteInject {
  public inject(): void {
    super.inject();

    new MutationObserver(observerCallback).observe(document.body, {
      childList: true,
      subtree: true
    });

    // document.addEventListener('keydown', (e) => {
    // 	if (e.ctrlKey && e.key === 'q') {
    // 		const pdlMainBtn = document.querySelector('.pdl-btn-main');
    // 		if (pdlMainBtn) {
    // 			e.preventDefault();
    // 			if (!e.repeat) {
    // 				pdlMainBtn.dispatchEvent(new MouseEvent('click'));
    // 			}
    // 		}
    // 	}
    // });
  }

  protected injectStyle(): void {
    super.injectStyle();

    GM_addStyle(checkbox);
    GM_addStyle(downloadBar);
  }

  protected observeColorScheme() {
    const onThemeChange = () => {
      const sitePreferDark = document.documentElement.getAttribute('data-theme') as
        | 'default'
        | 'dark';

      if (sitePreferDark === 'dark') {
        this.setModalDarkMode();
      } else {
        this.setModalLightMode();
      }
    };
    onThemeChange();

    new MutationObserver(onThemeChange).observe(document.documentElement, {
      attributes: true,
      childList: false,
      subtree: false
    });
  }
}
