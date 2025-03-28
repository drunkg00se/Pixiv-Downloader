import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { GelbooruV020 } from '../base/gelbooru';
import { GelbooruApiV020 } from '../base/gelbooru/api';
import { GelbooruParserV020 } from '../base/gelbooru/parser';

export class Safebooru extends GelbooruV020 {
  protected api = new GelbooruApiV020();
  protected parser = new GelbooruParserV020();

  constructor() {
    downloadSetting.setDirectoryTemplate('safebooru/{artist}');
    downloadSetting.setFilenameTemplate('{id}_{artist}_{character}');
    super();
  }

  static get hostname(): string {
    return 'safebooru.org';
  }

  protected getCustomConfig() {
    return {
      auth: {
        cf_clearance: ''
      }
    };
  }

  protected getThumbnailSelector(): string {
    return '.thumb:not(.blacklisted-image) > a:first-child';
  }
}
