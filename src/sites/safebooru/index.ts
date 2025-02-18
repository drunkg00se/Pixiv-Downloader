import { GelbooruV020 } from '../base/gelbooru';
import { GelbooruApiV020 } from '../base/gelbooru/api';
import { GelbooruParserV020 } from '../base/gelbooru/parser';

export class Safebooru extends GelbooruV020 {
  protected api = new GelbooruApiV020();
  protected parser = new GelbooruParserV020();

  static get hostname(): string {
    return 'safebooru.org';
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'safebooru/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  protected getThumbnailSelector(): string {
    return '.thumb:not(.blacklisted-image) > a:first-child';
  }
}
