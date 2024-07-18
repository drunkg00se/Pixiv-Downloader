import t from '@/lib/lang';
import { GM_addStyle, GM_registerMenuCommand } from '$';
import { type ConfigData, config } from '@/lib/config';

import App from '@/lib/components/App.svelte';
// @ts-expect-error no declare
import { create_custom_element } from 'svelte/internal';

import util from '@/assets/styles/util.scss?inline';
import theme from '@/assets/styles/theme.scss?inline';
import downloadButton from '@/assets/styles/downloadButton.scss?inline';

type AppElement = HTMLElement & {
  dark: boolean;
  updated: boolean;
  showChangelog(): void;
  showSetting(): void;
};

export abstract class SiteInject {
  private modal!: AppElement;

  constructor() {
    this.inject();
    this.observeColorScheme();
  }

  protected inject() {
    this.injectApp();
    this.injectStyle();

    GM_registerMenuCommand(
      t('button.setting'),
      () => {
        if (this.modal.shadowRoot?.querySelector('.modal')) {
          return;
        }
        this.modal.showSetting();
      },
      's'
    );

    if (config.get('showMsg')) {
      this.modal.setAttribute('updated', '');
      config.set('showMsg', false);
    }
  }

  protected injectApp() {
    customElements.define(
      'pdl-app',
      create_custom_element(
        App,
        { dark: { type: 'Boolean' }, updated: { type: 'Boolean' } },
        [],
        ['showChangelog', 'showSetting'],
        true
      )
    );
    const modal = document.createElement('pdl-app') as AppElement;
    modal.setAttribute('style', 'position:fixed; z-index:99999');
    document.body.append(modal);

    this.modal = modal;
  }

  protected injectStyle() {
    [util, theme, downloadButton].forEach((style) => GM_addStyle(style));

    (
      [
        'pdl-btn-self-bookmark-left',
        'pdl-btn-self-bookmark-top',
        'pdl-btn-left',
        'pdl-btn-top'
      ] as (keyof ConfigData)[]
    ).forEach((key) => {
      let val;
      if ((val = config.get(key)) !== undefined) {
        document.documentElement.style.setProperty('--' + key, val as string);
      }
    });
  }

  protected setModalDarkMode() {
    this.modal.setAttribute('dark', '');
  }

  protected setModalLightMode() {
    this.modal.removeAttribute('dark');
  }

  protected abstract observeColorScheme(): void;
}
