import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { GelbooruV020 } from '../base/gelbooru';
import { GelbooruApiV020 } from '../base/gelbooru/api';
import { GelbooruParserV020 } from '../base/gelbooru/parser';
import { userAuthentication } from '@/lib/store/auth.svelte';
import { clientSetting } from '@/lib/store/clientSetting.svelte';
import { legacyConfig } from '@/lib/store/legacyConfig';

export class Safebooru extends GelbooruV020 {
  protected api = new GelbooruApiV020();
  protected parser = new GelbooruParserV020();

  constructor() {
    if (clientSetting.version === null) {
      downloadSetting.setDirectoryTemplate(legacyConfig.folderPattern ?? 'safebooru/{artist}');
      downloadSetting.setFilenameTemplate(
        legacyConfig.filenamePattern ?? '{id}_{artist}_{character}'
      );

      userAuthentication.cf_clearance ??= '';
    }

    super();
  }

  static get hostname(): string {
    return 'safebooru.org';
  }

  protected getThumbnailSelector(): string {
    return '.thumb:not(.blacklisted-image) > a:first-child';
  }
}
