import { Moebooru } from '../base/moebooru';

export class Konachan extends Moebooru {
  static get hostname(): string {
    return 'konachan.com';
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'konachan/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }
}
