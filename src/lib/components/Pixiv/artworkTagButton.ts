import downloadSvg from '@/assets/download.svg?src';
import { addStyleToShadow } from '@/lib/util';
import type { Category, BookmarksRest } from '@/sites/pixiv/types';

export interface TagProps {
  userId: string;
  category: Category;
  tag: string;
  rest: BookmarksRest;
}

export class ArtworkTagButton extends HTMLElement {
  private ob: MutationObserver;

  constructor(private tagElement: HTMLAnchorElement) {
    super();

    this.bindValue(this.getTagProps());
    this.render();
    this.resetTagStyle();

    this.ob = new MutationObserver((records) => {
      // observe bookmark rest change when switching between Public and Private
      if (
        records.some((record) => record.type === 'attributes' && record.attributeName === 'href')
      ) {
        this.bindValue(this.getTagProps());
      }

      this.changeBtnColor();
    });
  }

  // 为了美观
  private resetTagStyle() {
    this.tagElement.style.borderTopRightRadius = '0px';
    this.tagElement.style.borderBottomRightRadius = '0px';
  }

  private getTagProps(): TagProps {
    // first title may be the tranlated one
    const tagTitles = this.tagElement.querySelectorAll('div[title]');
    const tagStr = tagTitles[tagTitles.length - 1].getAttribute('title')!;

    // ignore '#' at the beginning except the first bookmark tag '未分類'
    const tag = tagStr.startsWith('#') ? tagStr.slice(1) : '未分類';

    // tagElement.href return full url
    const [, , userId, urlCategory, ...tagAndRest] = this.tagElement
      .getAttribute('href')!
      .split('/');

    let category: Category;

    // urlCategory is one of 'artworks' | 'illustrations' | 'manga' | 'bookmarks'
    if (urlCategory === 'illustrations' || urlCategory === 'artworks') {
      category = 'illusts';
    } else {
      category = urlCategory as 'manga' | 'bookmarks';
    }

    let rest: BookmarksRest;
    if (tagAndRest.length && tagAndRest.join().includes('rest=hide')) {
      rest = 'hide';
    } else {
      rest = 'show';
    }

    return {
      userId,
      category,
      tag,
      rest
    } as TagProps;
  }

  private bindValue(props: TagProps) {
    this.setAttribute('data-user-id', props.userId);
    this.setAttribute('data-category', props.category);
    this.setAttribute('data-tag', props.tag);
    this.setAttribute('data-bookmark-rest', props.rest);
  }

  private changeBtnColor() {
    const { color, backgroundColor } = getComputedStyle(this.tagElement);
    const btn = this.shadowRoot!.querySelector('button')!;
    btn.style.color = color;
    btn.style.backgroundColor = backgroundColor;
  }

  private async render() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    addStyleToShadow(shadowRoot);

    shadowRoot.innerHTML = `  <button class="flex h-full items-center pr-2 rounded-e-[4px] disabled:cursor-wait disabled:opacity-70">
    <hr class="!border-t-0 border-l h-6 pr-2" />
    <i class="text-sm w-6 fill-current">
      ${downloadSvg}
    </i>
  </button>`;

    this.changeBtnColor();
  }

  connectedCallback() {
    this.ob.observe(this.tagElement, {
      attributes: true,
      attributeFilter: ['class', 'status', 'href']
    });
  }

  disconnectedCallback() {
    this.ob.disconnect();
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  attributeChangedCallback(name: 'disabled', oldValue: string | null, newValue: string | null) {
    const btn = this.shadowRoot!.querySelector('button')!;
    if (typeof newValue === 'string') {
      btn.setAttribute('disabled', '');
    } else {
      btn.removeAttribute('disabled');
    }
  }
}

customElements.define('pdl-artwork-tag', ArtworkTagButton);
