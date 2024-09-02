import t from '@/lib/lang';
import { GM_registerMenuCommand } from '$';
import { type ConfigData, config } from '@/lib/config';
import App from '@/lib/components/App.svelte';
import { type BatchDownloadConfig } from '@/lib/components/Downloader/useBatchDownload';

// @ts-expect-error no-declaration
import { create_custom_element } from 'svelte/internal';

type AppElement = HTMLElement & {
  dark: boolean;
  downloaderConfig?: BatchDownloadConfig<any, true | undefined>;
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
  }

  protected injectApp() {
    const PdlApp = create_custom_element(
      App,
      { dark: { type: 'Boolean' }, updated: { type: 'Boolean' }, downloaderConfig: {} },
      [],
      ['showChangelog', 'showSetting'],
      true,
      (customElementConstructor: any) => {
        return class extends customElementConstructor {
          constructor(props: {
            updated: boolean;
            downloaderConfig?: BatchDownloadConfig<any, true | undefined>;
          }) {
            super();
            this.updated = props.updated ?? false;
            this.downloaderConfig = props.downloaderConfig;
          }
        };
      }
    );
    customElements.define('pdl-app', PdlApp);

    const updated = config.get('showMsg');
    updated && config.set('showMsg', false);

    const downloaderConfig = this.getBatchDownloadConfig();

    const modal = new PdlApp({ updated, downloaderConfig }) as AppElement;
    document.body.append(modal);

    this.modal = modal;
  }

  protected injectStyle() {
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

  protected abstract getBatchDownloadConfig():
    | undefined
    | BatchDownloadConfig<any, true | undefined>;
}
