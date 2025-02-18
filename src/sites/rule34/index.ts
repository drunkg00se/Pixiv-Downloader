import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { GelbooruV020 } from '../base/gelbooru';
import { GelbooruApiV020 } from '../base/gelbooru/api';
import { Rule34Parser } from './parser';

export class Rule34 extends GelbooruV020 {
  protected api = new GelbooruApiV020();
  protected parser = new Rule34Parser();

  static get hostname(): string {
    return 'rule34.xxx';
  }

  protected getAvatar(): string {
    return '/images/r34chibi.png';
  }

  protected getThumbnailSelector(): string {
    return '.thumb > a:first-child:not(:has(.blacklist-img))';
  }

  protected getCustomConfig() {
    return {
      folderPattern: 'rule34/{artist}',
      filenamePattern: '{id}_{artist}_{character}'
    };
  }

  protected createArtworkBtn(id: string): void {
    let btnContainer = document.querySelector<HTMLDivElement>('#gelcomVideoContainer');

    // post is an image, create a wrapper for the image.
    if (!btnContainer) {
      const image = document.querySelector('#image')!;
      btnContainer = document.createElement('div');
      image.parentElement?.insertBefore(btnContainer, image);
      btnContainer.append(image);
    }

    btnContainer.style.position = 'relative';

    btnContainer.appendChild(
      new ArtworkButton({
        id,
        onClick: this.downloadArtwork.bind(this)
      })
    );
  }
}
