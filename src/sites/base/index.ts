import t from '@/lib/lang';
import { GM_registerMenuCommand } from '$';
import { type ConfigData, loadConfig } from '@/lib/config';
import { type BatchDownloadConfig } from '@/lib/components/Downloader/useBatchDownload';
import { PdlApp } from '@/lib/components/App';
import { useHistoryBackup } from '@/lib/components/Modal/Config/useHistoryBackup';

export abstract class SiteInject {
  protected app: PdlApp;
  protected config: ReturnType<typeof loadConfig>;

  constructor() {
    this.config = loadConfig(this.getCustomConfig() || undefined);
    this.app = this.injectApp();
    this.observeColorScheme();
    this.injectStyle();
    GM_registerMenuCommand(
      t('button.setting'),
      () => {
        if (this.app.shadowRoot?.querySelector('.modal')) {
          return;
        }
        this.app.showSetting();
      },
      's'
    );

    this.inject();
    this.runScheduledTask();
  }

  static get hostname(): string {
    throw new Error('`hostname` should be overwritten by a subclass.');
  }

  private injectApp() {
    const updated = this.config.get('showMsg');
    updated && this.config.set('showMsg', false);

    const app = new PdlApp({
      updated,
      downloaderConfig: this.getBatchDownloadConfig(),
      filenameTemplate: this.getFilenameTemplate()
    });

    document.body.append(app);
    return app;
  }

  private injectStyle() {
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

  protected setAppDarkMode() {
    this.app.setAttribute('dark', '');
  }

  protected setAppLightMode() {
    this.app.removeAttribute('dark');
  }

  protected observeColorScheme() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    query.matches && this.setAppDarkMode();

    query.addEventListener('change', (e) => {
      e.matches ? this.setAppDarkMode() : this.setAppLightMode();
    });
  }

  protected abstract inject(): void;

  protected abstract getBatchDownloadConfig():
    | undefined
    | BatchDownloadConfig<any, true | undefined>;

  protected abstract getCustomConfig(): Partial<ConfigData> | void;

  protected abstract getFilenameTemplate(): string[];
}
