import { Danbooru } from '../danbooru';
import { RequestError } from '@/lib/error';
import type { DanbooruMeta } from '../danbooru/parser';

export class ATFbooru extends Danbooru {
  private commentaryAccessible?: boolean;

  static get hostname(): string {
    return 'booru.allthefallen.moe';
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'ATFbooru/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  protected getAvatar() {
    return '/favicon.svg';
  }

  // check if user has permission to access artist commentary.
  private async isCommentaryAccessible() {
    try {
      await this.api.getArtistCommentary('703816');
    } catch (error) {
      if (!(error instanceof RequestError)) return false;
      throw error;
    }

    return true;
  }

  protected async getMetaByPostId(id: string) {
    let mediaMeta: DanbooruMeta;

    if ((this.commentaryAccessible ??= await this.isCommentaryAccessible())) {
      const { post, comment: commentary } = await this.getPostAndComment(id);
      mediaMeta = this.parser.buildMetaByApi(post, commentary);
    } else {
      const doc = await this.api.getPostDoc(id);
      mediaMeta = this.parser.buildMetaByDoc(doc);
    }

    return mediaMeta;
  }
}
