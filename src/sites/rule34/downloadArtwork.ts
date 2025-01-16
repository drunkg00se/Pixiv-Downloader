import { downloader } from '@/lib/downloader/';
import { historyDb } from '@/lib/db';
import { rule34Parser } from './parser';
import { Rule34DownloadConfig } from './downloadConfigBuilder';
import { addBookmark } from './addBookmark';
import { config } from '@/lib/config';
import { ThumbnailButton } from '../../lib/components/Button/thumbnailButton';

export async function downloadArtwork(btn: ThumbnailButton) {
  downloader.dirHandleCheck();

  const id = btn.dataset.id!;
  const mediaMeta = await rule34Parser.parse(id);
  const { tags, artist, title, source, rating } = mediaMeta;

  const downloadConfigs = new Rule34DownloadConfig(mediaMeta).getDownloadConfig(btn);

  config.get('addBookmark') && addBookmark(id);

  await downloader.download(downloadConfigs, { priority: 1 });

  historyDb.add({
    pid: Number(id),
    user: artist,
    title,
    tags,
    source,
    rating
  });
}
