import { ThumbnailButton, type ThumbnailBtnProp } from '../Button/thumbnailButton';
import { useBatchDownload } from '../Downloader/useBatchDownload';

type DanbooruPoolButtonProp = Omit<
  ThumbnailBtnProp,
  'onClick' | 'page' | 'type' | 'shouldObserveDb'
>;

export class DanbooruPoolButton extends ThumbnailButton {
  constructor(props: DanbooruPoolButtonProp) {
    super({
      ...props,
      shouldObserveDb: false,
      onClick: (btn) => {
        const poolId = btn.dataset.id!;
        const { batchDownload } = useBatchDownload();
        return batchDownload('pool_button', poolId);
      }
    });
  }

  static get tagNameLowerCase() {
    return 'pdl-danbooru-pool-button';
  }

  connectedCallback() {
    super.connectedCallback();
    const { downloading } = useBatchDownload();
    this.unsubscriber = downloading.subscribe((val) => {
      if (val) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    });
  }
}

customElements.define(DanbooruPoolButton.tagNameLowerCase, DanbooruPoolButton);
