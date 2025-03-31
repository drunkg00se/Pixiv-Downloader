import { legacyConfig } from './legacyConfig';
import { LocalStorage } from './storage.svelte';

export const enum BackupInterval {
  NEVER = 0,
  EVERY_DAY = 86_400_000,
  EVERY_7_DAY = 604_800_000,
  EVERY_30_DAY = 2_592_000_000
}

type BackupState = {
  interval: BackupInterval;
  lastTimestamp: number;
};

class BackupSettingStore extends LocalStorage<BackupState> {
  constructor() {
    super('pdl-backup-setting', {
      interval: legacyConfig.historyBackupInterval ?? BackupInterval.NEVER,
      lastTimestamp: legacyConfig.lastHistoryBackup ?? 0
    });
  }
}

export const backupSetting = new BackupSettingStore();
