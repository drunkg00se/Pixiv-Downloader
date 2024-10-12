import { Danbooru } from '../danbooru';

export class ATFbooru extends Danbooru {
  static get hostname(): string {
    return 'booru.allthefallen.moe';
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'ATFbooru/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }
}
