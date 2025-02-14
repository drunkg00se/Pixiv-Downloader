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

  #fixPoolImageStyle() {
    document.querySelectorAll<HTMLLIElement>('ul#post-list-posts li').forEach((el) => {
      el.style.width = 'auto';
      const innerEl = el.firstElementChild as HTMLDivElement;
      innerEl.style.width = 'auto';
      innerEl.style.height = 'auto';
    });
  }

  public inject() {
    super.inject();

    if (/pool\/show\//.test(location.pathname)) {
      this.#fixPoolImageStyle();
    }
  }
}
