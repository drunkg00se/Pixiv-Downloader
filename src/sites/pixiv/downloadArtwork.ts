import { addBookmark } from '@/sites/pixiv/helpers/addBookmark';
import { downloader } from '@/lib/downloader';
import { pixivParser, type PixivMeta } from '@/sites/pixiv/parser';
import { type HistoryData, historyDb } from '@/lib/db';
import { PixivDownloadConfig } from '@/sites/pixiv/downloadConfigBuilder';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { config } from '@/lib/config';

export async function downloadArtwork(btn: ThumbnailButton) {
  downloader.dirHandleCheck();

  const { id, page, unlistedId } = btn.dataset as {
    id: string;
    page?: string;
    unlistedId?: string;
  };
  const tagLang = config.get('tagLang');

  let pixivMeta: PixivMeta;

  if (!unlistedId) {
    pixivMeta = await pixivParser.parse(id, { tagLang, type: 'html' });
    const { bookmarkData, token, tags } = pixivMeta;

    if (!bookmarkData) {
      addBookmark(btn, id, token, tags);
    }
  } else {
    pixivMeta = await pixivParser.parse(unlistedId, { tagLang, type: 'unlisted' });
  }

  const downloadConfigs = new PixivDownloadConfig(pixivMeta).getDownloadConfig(btn);

  await downloader.download(downloadConfigs);

  const { comment, tags, artist, userId, title } = pixivMeta;
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

  if (unlistedId) {
    historyData.unlistedId = unlistedId;
  }

  historyDb.add(historyData);
}
