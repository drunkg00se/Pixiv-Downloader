import { Moebooru } from '../base/moebooru';
export class Yande extends Moebooru {
  static get hostname(): string {
    return 'yande.re';
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'yande/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }
}
