import { downloadSetting } from '@/lib/store/downloadSetting.svelte';
import { Moebooru } from '../base/moebooru';
import { MoebooruApi } from '../base/moebooru/api';
import { MoebooruParser, type MoebooruBlacklistItem } from '../base/moebooru/parser';
import { userAuthentication } from '@/lib/store/auth.svelte';
import { clientSetting } from '@/lib/store/clientSetting.svelte';
import { legacyConfig } from '@/lib/store/legacyConfig';

// FIXME: svelte5 is borken in dev server.
export class Konachan extends Moebooru {
  protected api = new MoebooruApi();
  protected parser = new MoebooruParser();

  constructor() {
    if (clientSetting.version === null) {
      downloadSetting.setDirectoryTemplate(legacyConfig.folderPattern ?? 'konachan/{artist}');
      downloadSetting.setFilenameTemplate(
        legacyConfig.filenamePattern ?? '{id}_{artist}_{character}'
      );

      userAuthentication.cf_clearance ??= '';
    }

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
