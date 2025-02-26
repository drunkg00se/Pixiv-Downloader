import t from '@/lib/lang';
import { GM_registerMenuCommand } from '$';
import { type ConfigData, loadConfig } from '@/lib/config';
import { PdlApp } from '@/lib/components/App';
import { useHistoryBackup } from '@/lib/components/Modal/Config/useHistoryBackup';
import type { BatchDownloadDefinition } from '@/lib/components/Downloader/useBatchDownload';
import type { MediaMeta } from './parser';

export abstract class SiteInject {
  protected app: InstanceType<typeof PdlApp>;

  protected config: ReturnType<typeof loadConfig>;

  protected useBatchDownload?: BatchDownloadDefinition<MediaMeta>;

  constructor() {
    this.config = loadConfig(this.getCustomConfig() || undefined);
    this.app = this.createApp();
  }

  static get hostname(): string | string[] {
    throw new Error('`hostname` should be overwritten by a subclass.');
  }

  private createApp() {
    return new PdlApp({
      config: this.config,
      filenameTemplate: this.getFilenameTemplate()
    });
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

  public inject(): void {
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

    document.body.append(this.app);
    this.runScheduledTask();
  }

  protected abstract getCustomConfig(): Partial<ConfigData> | void;

  protected abstract getFilenameTemplate(): string[];
}
