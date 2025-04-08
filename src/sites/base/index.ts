import { GM_registerMenuCommand } from '$';
import { PdlApp } from '@/lib/components/App';
import { useHistoryBackup } from '@/lib/useHistoryBackup';
import type { BatchDownloadDefinition } from '@/lib/components/Downloader/useBatchDownload';
import type { MediaMeta } from './parser';
import type { TemplateData } from './downloadConfig';
import { t } from '@/lib/i18n.svelte';
import { downloader } from '@/lib/downloader';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
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

  protected getFileHandleIfNeeded() {
    downloadSetting.useFileSystemAccessApi && downloader.dirHandleCheck();
  }

  protected backupIfNeeded() {
    const { interval, lastTimestamp } = backupSetting;

    if (interval === BackupInterval.NEVER) return;

    const timestamp = new Date().getTime();

    if (lastTimestamp + interval > timestamp) return;

    useHistoryBackup().exportAsJSON();

    backupSetting.lastTimestamp = timestamp;
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
