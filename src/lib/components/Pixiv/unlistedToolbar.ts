import {
  ThumbnailBtnType,
  ThumbnailButton,
  type ThumbnailBtnProp
} from '../Button/thumbnailButton';
import toolbarStyle from '@/assets/styles/unlistedToolbar.scss?inline';

type ToolbarProps = Omit<ThumbnailBtnProp, 'type'>;

export class UnlistedArtworkToolbar extends HTMLElement {
  private props: ToolbarProps;

  constructor(props: ToolbarProps) {
    super();
    this.props = props;
  }

  private render() {
    if (this.shadowRoot) return;

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `<style>${toolbarStyle}</style><div class="button-wrapper"></div>`;

    const thumbnailButton = new ThumbnailButton({
      ...this.props,
      type: ThumbnailBtnType.PixivToolbar
    });

    const wrapper = shadowRoot.querySelector<HTMLDivElement>('.button-wrapper')!;
    wrapper.appendChild(thumbnailButton);
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define('pdl-unlisted-artwork-toolbar', UnlistedArtworkToolbar);
