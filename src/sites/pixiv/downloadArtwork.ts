import { addBookmark } from '@/sites/pixiv/helpers/addBookmark';
import { downloader } from '@/lib/downloader';
import { pixivParser, type PixivMeta } from '@/sites/pixiv/parser';
import { type HistoryData, historyDb } from '@/lib/db';
import { PixivDownloadConfig } from '@/sites/pixiv/downloadConfigBuilder';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { config } from '@/lib/config';
import { BookmarkRestrict } from './types';
import { likeIllust } from './helpers/likeIllust';

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
    const shouldAddBookmark = config.get('addBookmark');
    const shouldLikeIllust = config.get('likeIllust');

    if (shouldAddBookmark || shouldLikeIllust) {
      pixivMeta = await pixivParser.parse(id, { tagLang, type: 'html' });
      const { bookmarkData, token, tags, likeData } = pixivMeta;

      if (!bookmarkData && shouldAddBookmark) {
        const addedTags = config.get('addBookmarkWithTags') ? tags : undefined;
        const restrict =
          config.get('privateR18') && tags.includes('R-18')
            ? BookmarkRestrict.private
            : BookmarkRestrict.public;
        addBookmark(id, token, { btn, tags: addedTags, restrict });
      }

      if (!likeData && shouldLikeIllust) {
        likeIllust(id, token);
      }
    } else {
      pixivMeta = await pixivParser.parse(id, { tagLang, type: 'api' });
    }
  } else {
    pixivMeta = await pixivParser.parse(unlistedId, { tagLang, type: 'unlisted' });
  }

  const downloadConfigs = new PixivDownloadConfig(pixivMeta).getDownloadConfig(btn);

  await downloader.download(downloadConfigs, { priority: 1 });

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
