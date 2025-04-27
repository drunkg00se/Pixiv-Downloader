import { GM_registerMenuCommand } from '$';
import { PdlApp } from '@/lib/components/App';
import { useHistoryBackup } from '@/lib/useHistoryBackup';
import type { BatchDownloadDefinition } from '@/lib/components/Downloader/useBatchDownload.svelte';
import type { MediaMeta } from './parser';
import type { TemplateData } from './downloadConfig';
import { t } from '@/lib/i18n.svelte';
import { BackupInterval, backupSetting } from '@/lib/store/backupSetting.svelte';

export abstract class SiteInject {
  protected app: InstanceType<typeof PdlApp>;

  protected useBatchDownload?: BatchDownloadDefinition<MediaMeta<string | string[]>>;

  constructor() {
    this.app = this.createApp();

    this.backupIfNeeded();
  }

  static get hostname(): string | string[] {
    throw new Error('`hostname` should be overwritten by a subclass.');
  }

  private createApp() {
    return new PdlApp({
      supportedTemplate: this.getSupportedTemplate()
    });
  }

  protected backupIfNeeded() {
    const { interval, lastTimestamp } = backupSetting;

    if (interval === BackupInterval.NEVER) return;

    const timestamp = new Date().getTime();

    if (lastTimestamp + interval > timestamp) return;

    useHistoryBackup().exportAsJSON();

    backupSetting.lastTimestamp = timestamp;
  }

  protected toast(settings: Parameters<typeof this.app.toast>[0]) {
    return this.app.toast(settings);
  }

  public inject(): void {
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
  }

  protected abstract getSupportedTemplate(): Partial<TemplateData>;
}
