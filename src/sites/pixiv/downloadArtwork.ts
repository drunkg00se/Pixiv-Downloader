import { addBookmark } from '@/sites/pixiv/helpers/addBookmark';
import { downloader } from '@/lib/downloader';
import { pixivParser } from '@/sites/pixiv/parser';
import { type HistoryData, historyDb } from '@/lib/db';
import { PixivDownloadConfig } from '@/sites/pixiv/downloadConfigBuilder';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';

export async function downloadArtwork(btn: ThumbnailButton) {
  downloader.dirHandleCheck();

  const { id, page } = btn.dataset as { id: string; page?: string };

  const pixivMeta = await pixivParser.parse(id);
  const { comment, bookmarkData, token, tags, artist, userId, title } = pixivMeta;

  if (!bookmarkData) {
    addBookmark(btn, id, token, tags);
  }

  const downloadConfigs = new PixivDownloadConfig(pixivMeta).getDownloadConfig(btn);

  await downloader.download(downloadConfigs);

  const historyData: HistoryData = {
    pid: Number(id),
    user: artist,
    userId: Number(userId),
    title,
    comment,
    tags
  };

  if (page !== undefined) {
    historyData.page = Number(page);
  }

  historyDb.add(historyData);
}
