import { ThumbnailButton, ThumbnailBtnType, type ThumbnailBtnProp } from './thumbnailButton';
import wrapperStyle from '@/assets/styles/artworkButton.scss?inline';

type ArtworkButtonProps = Omit<ThumbnailBtnProp, 'type'> & { site?: 'rule34' | 'yande' };

export class ArtworkButton extends HTMLElement {
  private props: ArtworkButtonProps;

  constructor(props: ArtworkButtonProps) {
    super();
    this.props = props;
  }

  static get tagNameLowerCase() {
    return 'pdl-artwork-button';
  }

  private render() {
    if (this.shadowRoot) return;

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const btnProps = { ...this.props };

    shadowRoot.innerHTML = `<style>${wrapperStyle}</style><div class="button-wrapper${btnProps.site ? ' ' + btnProps.site : ''}"></div>`;

    delete btnProps.site;
    const thumbnailButton = new ThumbnailButton({
      type: ThumbnailBtnType.Gallery,
      ...btnProps
    });

    const wrapper = shadowRoot.querySelector<HTMLDivElement>('.button-wrapper')!;
    wrapper.appendChild(thumbnailButton);
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define(ArtworkButton.tagNameLowerCase, ArtworkButton);
