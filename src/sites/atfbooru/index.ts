import { Danbooru } from '../danbooru';
import { danbooruParser } from '../danbooru/parser';
import { danbooruApi } from '../danbooru/api';
import { RequestError } from '@/lib/error';
import { downloader } from '@/lib/downloader';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { DanbooruDownloadConfig } from '../danbooru/downloadConfigBuilder';
import { addBookmark } from '../danbooru/addBookmark';
import { historyDb } from '@/lib/db';

export class ATFbooru extends Danbooru {
  private commentaryAccessible?: Promise<boolean>;

  constructor() {
    super();
    this.useBatchDownload = this.useBatchDownload().overwrite({
      avatar: '/favicon.svg',
      parseMetaByArtworkId: async (id: string) => {
        return await danbooruParser.parse(id, {
          type: (await (this.commentaryAccessible ??= this.isCommentaryAccessible()))
            ? 'api'
            : 'html'
        });
      }
    });
  }

  static get hostname(): string {
    return 'booru.allthefallen.moe';
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'ATFbooru/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  // check if user has permission to access artist commentary.
  private async isCommentaryAccessible() {
    try {
      await danbooruApi.getArtistCommentary('703816');
    } catch (error) {
      if (!(error instanceof RequestError)) return false;
    }

    return true;
  }

  protected async downloadArtwork(btn: ThumbnailButton) {
    downloader.dirHandleCheck();

    const id = btn.dataset.id!;
    const mediaMeta = await danbooruParser.parse(id, {
      type: (await (this.commentaryAccessible ??= this.isCommentaryAccessible())) ? 'api' : 'html'
    });

    const downloadConfigs = new DanbooruDownloadConfig(mediaMeta).getDownloadConfig(btn);

    this.config.get('addBookmark') && addBookmark(id);

    await downloader.download(downloadConfigs);

    const { tags, artist, title, comment, source, rating } = mediaMeta;
    historyDb.add({
      pid: Number(id),
      user: artist,
      title,
      comment,
      tags,
      source,
      rating
    });
  }
}
