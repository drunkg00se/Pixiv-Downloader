import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { Moebooru } from '../base/moebooru';
import { MoebooruApi } from '../base/moebooru/api';
import { MoebooruParser, type MoebooruBlacklistItem } from '../base/moebooru/parser';
import { clientSetting } from '@/lib/store/clientSetting.svelte';
import { legacyConfig } from '@/lib/store/legacyConfig';

export class Yande extends Moebooru {
  protected api = new MoebooruApi();
  protected parser = new MoebooruParser();

  constructor() {
    if (clientSetting.version === null) {
      downloadSetting.setDirectoryTemplate(legacyConfig.folderPattern ?? 'yande/{artist}');
      downloadSetting.setFilenameTemplate(
        legacyConfig.filenamePattern ?? '{id}_{artist}_{character}'
      );
    }

    super();
  }

  protected async getBlacklist(): Promise<MoebooruBlacklistItem[]> {
    const doc = await this.api.getBlacklistDoc();
    return this.parser.parseBlacklistByDoc(doc);
  }

  static get hostname(): string {
    return 'yande.re';
  }
}
