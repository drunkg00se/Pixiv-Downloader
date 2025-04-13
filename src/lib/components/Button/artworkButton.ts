import { toStore, type Unsubscriber } from 'svelte/store';
import { ThumbnailButton, ThumbnailBtnType, type ThumbnailBtnProp } from './thumbnailButton';
import wrapperStyle from '@/assets/styles/artworkButton.scss?inline';
import { buttonPosition } from '@/lib/store/buttonPosition.svelte';

type ArtworkButtonProps = Omit<ThumbnailBtnProp, 'type'> & {
  site?:
    | 'pixiv'
    | 'nijie'
    | 'gelbooru'
    | 'moebooru_image'
    | 'native_video'
    | 'vjs_video'
    | 'fluid_video';
};

export class ArtworkButton extends HTMLElement {
  private props: ArtworkButtonProps;

  #stickyContainer?: HTMLDivElement;
  #thumbnailButton?: ThumbnailButton;

  #unsubscribers: Unsubscriber[] = [];

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
    const site = btnProps.site;

    shadowRoot.innerHTML = `<style>${wrapperStyle}</style><div class="button-wrapper${site ? ' ' + site : ''}"></div>`;

    delete btnProps.site;
    const thumbnailButton = new ThumbnailButton({
      type: ThumbnailBtnType.Gallery,
      ...btnProps
    });

    site && thumbnailButton.classList.add(site);

    const stickyContainer = shadowRoot.querySelector<HTMLDivElement>('.button-wrapper')!;
    stickyContainer.appendChild(thumbnailButton);

    this.#thumbnailButton = thumbnailButton;
    this.#stickyContainer = stickyContainer;
  }

  connectedCallback() {
    this.render();

    const unsubscribeLeft = toStore(() => buttonPosition.artworkBtnAlignLeft).subscribe(
      (artworkBtnAlignLeft) => {
        if (artworkBtnAlignLeft) {
          this.#stickyContainer?.classList.remove('rtl');
        } else {
          this.#stickyContainer?.classList.add('rtl');
        }
      }
    );

    const unsbuscribeTop = toStore(() => buttonPosition.artworkBtnAlignTop).subscribe(
      (artworkBtnAlignTop) => {
        if (artworkBtnAlignTop) {
          this.#thumbnailButton?.classList.remove('bottom');
        } else {
          this.#thumbnailButton?.classList.add('bottom');
        }
      }
    );

    this.#unsubscribers.push(unsubscribeLeft, unsbuscribeTop);
  }

  disconnectedCallback() {
    for (const unsubscriber of this.#unsubscribers) {
      unsubscriber();
    }

    this.#unsubscribers.length = 0;
  }
}

customElements.define(ArtworkButton.tagNameLowerCase, ArtworkButton);
