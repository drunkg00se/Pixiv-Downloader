import { RequestError } from '@/lib/error';
import type { DanbooruMeta } from '../base/danbooru/parser';
import { AbstractDanbooru } from '../base/danbooru';
import { DanbooruApi } from '../base/danbooru/api';
import { DanbooruParser } from '../base/danbooru/parser';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { clientSetting } from '@/lib/store/clientSetting.svelte';
import { legacyConfig } from '@/lib/store/legacyConfig';

export class ATFbooru extends AbstractDanbooru {
  protected api = new DanbooruApi();
  protected parser = new DanbooruParser();

  private commentaryAccessible?: boolean;

  static get hostname(): string {
    return 'booru.allthefallen.moe';
  }

  constructor() {
    if (clientSetting.current.version === null) {
      downloadSetting.setDirectoryTemplate(legacyConfig.folderPattern ?? 'ATFbooru/{artist}');
      downloadSetting.setFilenameTemplate(
        legacyConfig.filenamePattern ?? '{id}_{artist}_{character}'
      );
    }

    super();
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
