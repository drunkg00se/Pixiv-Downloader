import { downloader } from '@/lib/downloader/';
import { type HistoryData, historyDb } from '@/lib/db';
import { yandeParser } from './parser';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { YandeDownloadConfig } from './downloadConfigBuilder';

export async function downloadArtwork(btn: ThumbnailButton) {
  downloader.dirHandleCheck();
  const id = btn.dataset.id!;
  const mediaMeta = await yandeParser.parse(id);
  const { tags, artist, title } = mediaMeta;
  const downloadConfigs = new YandeDownloadConfig(mediaMeta).getDownloadConfig(btn);

  await downloader.download(downloadConfigs);

  const historyData: HistoryData = {
    pid: Number(id),
    user: artist,
    title,
    tags
  };
  historyDb.add(historyData);
}
