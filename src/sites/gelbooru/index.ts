import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { GelbooruV020 } from '../base/gelbooru';
import { GelbooruParserV020 } from '../base/gelbooru/parser';
import { GelbooruApiV025 } from './api';
import { downloadSetting } from '@/lib/store/downloadSetting.svelte';

export class Gelbooru extends GelbooruV020 {
  protected api = new GelbooruApiV025();
  protected parser = new GelbooruParserV020();

  static get hostname(): string {
    return 'gelbooru.com';
  }

  constructor() {
    downloadSetting.setDirectoryTemplate('gelbooru/{artist}');
    downloadSetting.setFilenameTemplate('{id}_{artist}_{character}');
    super();
  }

  protected getAvatar(): string {
    return '/user_avatars/honkonymous.png';
  }

  protected getThumbnailSelector(): string {
    // favorite
    // post list
    // comment
    // pool
    // post view: more like this
    // acount profile
    return '.thumb > a:first-child, \
    .thumbnail-preview > a[id], \
    .commentThumbnail > a:first-child, \
    .thumbnail-container > span[id] > a, \
    a:has(img[style*="max-height: 100px"]), \
    a:has(div.profileThumbnailPadding)';
  }

  protected setThumbnailStyle(btnContainer: HTMLAnchorElement): void {
    switch (true) {
      case this.isMyfavorites(): {
        btnContainer.setAttribute('style', 'position: relative; display: inline-block;');
        break;
      }
      case this.isPool(): {
        btnContainer.setAttribute(
          'style',
          'position: relative; display: inline-block; margin: 10px;'
        );
        const image = btnContainer.querySelector('img')!;
        image.style.margin = '0px';
        image.style.padding = '0px';
        break;
      }
      case this.isPostsList(): {
        btnContainer.style.position = 'relative';
        break;
      }
      case this.isPostView(): {
        btnContainer.setAttribute(
          'style',
          'position: relative; display: inline-block; margin: 10px;'
        );
        const image = btnContainer.querySelector('img')!;
        image.style.margin = '0px';
        break;
      }
      case this.isAccountProfile(): {
        btnContainer.setAttribute('style', 'position: relative; display: inline-block');
        (btnContainer.firstElementChild as HTMLDivElement).style.padding = '0px';
        break;
      }
      default:
        break;
    }
  }

  protected createArtworkBtn(id: string) {
    let btnContainer = document.querySelector<HTMLDivElement>('.image-container > picture');

    if (btnContainer) {
      btnContainer.setAttribute('style', 'position: relative; display: inline-block;');
    } else {
      // video post, create a wrapper
      const video = document.querySelector('#gelcomVideoPlayer');
      if (!video) return;

      btnContainer = document.createElement('div');
      btnContainer.setAttribute('style', 'position: relative; width: fit-content; font-size: 0px;');

      video.parentElement!.insertBefore(btnContainer, video);
      btnContainer.appendChild(video);
    }

    btnContainer.appendChild(
      new ArtworkButton({
        id,
        site: btnContainer.nodeName === 'DIV' ? 'native_video' : undefined,
        onClick: this.downloadArtwork.bind(this)
      })
    );
  }

  public inject(): void {
    super.inject();

    if (this.isPostView()) this.createThumbnailBtn();
  }
}
