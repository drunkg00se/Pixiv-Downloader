import { config, HistoryBackupInterval } from '@/lib/config';
import { historyDb, type HistoryImportObject } from '@/lib/db';
import { aDownload } from '@/lib/util';

function readHistoryFile(
  type: 'application/json',
  file: File
): Promise<Array<HistoryImportObject>> {
  return new Promise((resolve) => {
    if (file.type !== type) throw new Error('Invalid file');
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (readEvt) => {
      const text = readEvt.target?.result;
      if (typeof text !== 'string') throw new Error('Invalid file');

      const history = JSON.parse(text);
      if (!(history instanceof Array)) throw new Error('Invalid file');
      resolve(history);
    };
  });
}

function importJSON(file: File) {
  return readHistoryFile('application/json', file).then((data) => historyDb.import(data));
}

function exportAsJSON() {
  return historyDb.getAll().then((datas) => {
    const str = JSON.stringify(datas);
    const blob = new Blob([str], { type: 'application/json' });
    const filename = `Pixiv Downloader_${location.hostname}_${new Date().toLocaleString()}.json`;
    aDownload(blob, filename);
  });
}

function exportAsCSV() {
  return historyDb.generateCsv().then((csv) => {
    const filename = `Pixiv Downloader_${location.hostname}_${new Date().toLocaleString()}.csv`;
    aDownload(csv, filename);
  });
}

function scheduleBackup() {
  const interval = config.get('historyBackupInterval');
  if (interval === HistoryBackupInterval.NEVER) return;

  const lastTimestamp = config.get('lastHistoryBackup');
  const timestamp = new Date().getTime();

  if (!lastTimestamp || lastTimestamp + interval * 1000 < timestamp) {
    exportAsJSON();

    config.update((val) => ({ ...val, lastHistoryBackup: timestamp }));
  }
}

export function useHistoryBackup() {
  return {
    importJSON,
    exportAsJSON,
    exportAsCSV,
    scheduleBackup
  };
}
