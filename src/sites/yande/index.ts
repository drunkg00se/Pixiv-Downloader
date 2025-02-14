import { Moebooru } from '../base/moebooru';
import { MoebooruApi } from '../base/moebooru/api';
import { MoebooruParser, type MoebooruBlacklistItem } from '../base/moebooru/parser';

export class Yande extends Moebooru {
  protected api = new MoebooruApi();
  protected parser = new MoebooruParser();

  protected async getBlacklist(): Promise<MoebooruBlacklistItem[]> {
    const doc = await this.api.getBlacklistDoc();
    return this.parser.parseBlacklistByDoc(doc);
  }

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
