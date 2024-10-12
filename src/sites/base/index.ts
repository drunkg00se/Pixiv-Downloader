import t from '@/lib/lang';
import { GM_registerMenuCommand } from '$';
import { type ConfigData, loadConfig } from '@/lib/config';
import { type BatchDownloadConfig } from '@/lib/components/Downloader/useBatchDownload';
import { PdlApp } from '@/lib/components/App';
import { useHistoryBackup } from '@/lib/components/Modal/Config/useHistoryBackup';

export abstract class SiteInject {
  private modal!: PdlApp;
  private config: ReturnType<typeof loadConfig>;

  constructor() {
    this.config = loadConfig(this.getCustomConfig() || undefined);
    this.inject();
    this.observeColorScheme();
    this.runScheduledTask();
  }

  static get hostname(): string {
    throw new Error('`hostname` should be overwritten by a subclass.');
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
    const updated = this.config.get('showMsg');
    updated && this.config.set('showMsg', false);

    const downloaderConfig = this.getBatchDownloadConfig();

    const modal = new PdlApp({ updated, downloaderConfig });
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
      if ((val = this.config.get(key)) !== undefined) {
        document.documentElement.style.setProperty('--' + key, val as string);
      }
    });
  }

  protected runScheduledTask() {
    useHistoryBackup().scheduleBackup();
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

  protected abstract getCustomConfig(): Partial<ConfigData> | void;
}
