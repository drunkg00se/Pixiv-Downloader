import { toStore, type Readable } from 'svelte/store';
import { ThumbnailButton, type ThumbnailBtnProp } from '../Button/thumbnailButton';

type DanbooruPoolButtonProp = Omit<ThumbnailBtnProp, 'page' | 'type' | 'shouldObserveDb'> & {
  downloading: ReactiveValue<boolean>;
};

export class DanbooruPoolButton extends ThumbnailButton {
  private downloadingStore: Readable<boolean>;

  constructor(props: DanbooruPoolButtonProp) {
    super({
      ...props,
      shouldObserveDb: false
    });

    const { downloading } = props;
    this.downloadingStore = toStore(() => downloading.current);
  }

  static get tagNameLowerCase() {
    return 'pdl-danbooru-pool-button';
  }

  connectedCallback() {
    super.connectedCallback();
    this.unsubscriber = this.downloadingStore.subscribe((val) => {
      if (val) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    });
  }
}

customElements.define(DanbooruPoolButton.tagNameLowerCase, DanbooruPoolButton);
