import { downloader } from '@/lib/downloader/';
import { type HistoryData, historyDb } from '@/lib/db';
import { rule34Parser } from './parser';
import { Rule34DownloadConfig } from './downloadConfigBuilder';
import { addBookmark } from './addBookmark';
import { config } from '@/lib/config';
import { ThumbnailButton } from '../../lib/components/Button/thumbnailButton';

export async function downloadArtwork(btn: ThumbnailButton) {
  downloader.dirHandleCheck();

  const id = btn.dataset.id!;
  const mediaMeta = await rule34Parser.parse(id);
  const { tags, artist, title } = mediaMeta;

  const downloadConfigs = new Rule34DownloadConfig(mediaMeta).getDownloadConfig(btn);

  config.get('addBookmark') && addBookmark(id);

  await downloader.download(downloadConfigs);

  const historyData: HistoryData = {
    pid: Number(id),
    user: artist,
    title,
    tags
  };
  historyDb.add(historyData);
}
