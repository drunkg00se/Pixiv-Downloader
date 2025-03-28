import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { Moebooru } from '../base/moebooru';
import { MoebooruApi } from '../base/moebooru/api';
import { MoebooruParser, type MoebooruBlacklistItem } from '../base/moebooru/parser';

export class Sakugabooru extends Moebooru {
  protected api = new MoebooruApi();
  protected parser = new MoebooruParser();

  constructor() {
    downloadSetting.setDirectoryTemplate('sakugabooru/{artist}');
    downloadSetting.setFilenameTemplate('{id}_{artist}_{character}');
    super();
  }

  protected async getBlacklist(): Promise<MoebooruBlacklistItem[]> {
    const doc = await this.api.getBlacklistDoc();
    return this.parser.parseBlacklistByDoc(doc);
  }

  static get hostname(): string {
    return 'www.sakugabooru.com';
  }

  protected getCustomConfig() {
    return undefined;
  }
}
