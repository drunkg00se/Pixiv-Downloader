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

  protected setThumbnailStyle(btnContainer: HTMLAnchorElement) {
    btnContainer.setAttribute(
      'style',
      'position: relative; align-self: center; width: auto; height: auto;'
    );

    const imgEl = btnContainer.querySelector<HTMLImageElement>('img')!;

    const setContainerHeight = () => {
      const aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
      aspectRatio > 1 && (btnContainer.style.height = 'inherit');
    };
    setContainerHeight();

    imgEl.onload = setContainerHeight;
  }

  protected createArtworkBtn(id: string): void {
    let isImage = false;
    let btnContainer = document.querySelector<HTMLDivElement>('#gelcomVideoContainer');

    // post is an image, create a wrapper for the image.
    if (!btnContainer) {
      isImage = true;

      const image = document.querySelector('#image')!;
      btnContainer = document.createElement('div');
      image.parentElement?.insertBefore(btnContainer, image);
      btnContainer.append(image);
    } else {
      btnContainer.style.fontSize = '0px';
    }

    btnContainer.style.position = 'relative';

    btnContainer.appendChild(
      new ArtworkButton({
        id,
        site: isImage ? undefined : 'fluid_video',
        onClick: this.downloadArtwork.bind(this)
      })
    );
  }
}
