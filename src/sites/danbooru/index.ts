import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { AbstractDanbooru } from '../base/danbooru';
import { DanbooruApi } from '../base/danbooru/api';
import { DanbooruParser } from '../base/danbooru/parser';
import { clientSetting } from '@/lib/store/clientSetting.svelte';

export class Danbooru extends AbstractDanbooru {
  protected api = new DanbooruApi();
  protected parser = new DanbooruParser();

  static get hostname(): string {
    return 'danbooru.donmai.us';
  }

  constructor() {
    if (clientSetting.current.version === null) {
      downloadSetting.setDirectoryTemplate('danbooru/{artist}');
      downloadSetting.setFilenameTemplate('{id}_{artist}_{character}');
    }

    super();
  }

  protected getAvatar() {
    return '/packs/static/danbooru-logo-128x128-ea111b6658173e847734.png';
  }
}
