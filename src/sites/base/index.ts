import { GM_registerMenuCommand } from '$';
import { type ConfigData, loadConfig } from '@/lib/config';
import { PdlApp } from '@/lib/components/App';
import { useHistoryBackup } from '@/lib/components/Modal/Config/useHistoryBackup';
import type { BatchDownloadDefinition } from '@/lib/components/Downloader/useBatchDownload';
import type { MediaMeta } from './parser';
import type { TemplateData } from './downloadConfig';
import { t } from '@/lib/i18n.svelte';
import { downloader } from '@/lib/downloader';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';

export abstract class SiteInject {
  protected app: InstanceType<typeof PdlApp>;

  protected config: ReturnType<typeof loadConfig>;

  protected useBatchDownload?: BatchDownloadDefinition<MediaMeta<string | string[]>>;

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
      supportedTemplate: this.getSupportedTemplate()
    });
  }

  protected getFileHandleIfNeeded() {
    downloadSetting.current.useFileSystemAccessApi && downloader.dirHandleCheck();
  }

  protected runScheduledTask() {
    const result = useHistoryBackup().backup(
      this.config.get('lastHistoryBackup'),
      this.config.get('historyBackupInterval')
    );

    if (result[0]) {
      this.config.update((val) => ({ ...val, lastHistoryBackup: result[1] }));
    }
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

  protected abstract getSupportedTemplate(): Partial<TemplateData>;
}
