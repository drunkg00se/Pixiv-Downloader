import { AbstractDanbooru } from '../base/danbooru';
import { DanbooruApi } from '../base/danbooru/api';
import { DanbooruParser } from '../base/danbooru/parser';

export class Danbooru extends AbstractDanbooru {
  protected api = new DanbooruApi();
  protected parser = new DanbooruParser();

  static get hostname(): string {
    return 'danbooru.donmai.us';
  }

  protected getAvatar() {
    return '/packs/static/danbooru-logo-128x128-ea111b6658173e847734.png';
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'danbooru/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }
}
