import { downloader } from '@/lib/downloader';
import { type HistoryData, historyDb } from '@/lib/db';
import { addBookmark } from './addBookmark';
import { config } from '@/lib/config';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { danbooruParser } from './parser';
import { DanbooruDownloadConfig } from './downloadConfigBuilder';

export async function downloadArtwork(btn: ThumbnailButton) {
  downloader.dirHandleCheck();

  const id = btn.dataset.id!;
  const mediaMeta = await danbooruParser.parse(id, { type: 'api' });

  const downloadConfigs = new DanbooruDownloadConfig(mediaMeta).getDownloadConfig(btn);

  config.get('addBookmark') && addBookmark(id);

  await downloader.download(downloadConfigs);

  const { tags, artist, title, comment } = mediaMeta;
  const historyData: HistoryData = {
    pid: Number(id),
    user: artist,
    title,
    comment,
    tags
  };
  historyDb.add(historyData);
}
