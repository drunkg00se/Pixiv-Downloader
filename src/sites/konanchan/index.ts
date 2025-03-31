import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { Moebooru } from '../base/moebooru';
import { MoebooruApi } from '../base/moebooru/api';
import { MoebooruParser, type MoebooruBlacklistItem } from '../base/moebooru/parser';
import { userAuthentication } from '@/lib/store/auth.svelte';

// FIXME: svelte5 is borken in dev server.
export class Konachan extends Moebooru {
  protected api = new MoebooruApi();
  protected parser = new MoebooruParser();

  constructor() {
    downloadSetting.setDirectoryTemplate('konachan/{artist}');
    downloadSetting.setFilenameTemplate('{id}_{artist}_{character}');

    userAuthentication.patch((state) => {
      state.cf_clearance ??= '';
    });

    super();
  }

  protected async getBlacklist(): Promise<MoebooruBlacklistItem[]> {
    return this.parser.parseBlacklistByCookie();
  }

  static get hostname(): string[] {
    return ['konachan.com', 'konachan.net'];
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
