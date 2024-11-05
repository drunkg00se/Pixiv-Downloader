import type { Readable } from 'svelte/store';
import { ThumbnailButton, type ThumbnailBtnProp } from '../Button/thumbnailButton';

type DanbooruPoolButtonProp = Omit<ThumbnailBtnProp, 'page' | 'type' | 'shouldObserveDb'> & {
  downloading: Readable<boolean>;
};

export class DanbooruPoolButton extends ThumbnailButton {
  private downloading: Readable<boolean>;

  constructor(props: DanbooruPoolButtonProp) {
    super({
      ...props,
      shouldObserveDb: false
    });

    this.downloading = props.downloading;
  }

  static get tagNameLowerCase() {
    return 'pdl-danbooru-pool-button';
  }

  connectedCallback() {
    super.connectedCallback();
    this.unsubscriber = this.downloading.subscribe((val) => {
      if (val) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    });
  }
}

customElements.define(DanbooruPoolButton.tagNameLowerCase, DanbooruPoolButton);
