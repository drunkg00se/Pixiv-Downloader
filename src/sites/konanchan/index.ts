import { Moebooru } from '../base/moebooru';
import { MoebooruApi } from '../base/moebooru/api';
import { MoebooruParser, type MoebooruBlacklistItem } from '../base/moebooru/parser';

export class Konachan extends Moebooru {
  protected api = new MoebooruApi();
  protected parser = new MoebooruParser();

  protected async getBlacklist(): Promise<MoebooruBlacklistItem[]> {
    return this.parser.parseBlacklistByCookie();
  }

  static get hostname(): string[] {
    return ['konachan.com', 'konachan.net'];
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'konachan/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }
}
