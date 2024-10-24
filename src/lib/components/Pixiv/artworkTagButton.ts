import downloadSvg from '@/assets/download.svg?src';
import { addStyleToShadow } from '@/lib/util';
import type { Category, BookmarksRest } from '@/sites/pixiv/types';
import { useBatchDownload } from '../Downloader/useBatchDownload';
import { regexp } from '@/lib/regExp';
import type { Unsubscriber } from 'svelte/store';

export interface TagProps {
  userId: string;
  category: Category;
  tag: string;
  rest: BookmarksRest;
}

export class ArtworkTagButton extends HTMLElement {
  private ob: MutationObserver;
  private unsubscriber!: Unsubscriber;

  constructor(private tagElement: HTMLAnchorElement) {
    super();

    this.dispatchDownload = this.dispatchDownload.bind(this);

    this.render();
    this.resetTagStyle();

    this.ob = new MutationObserver(() => {
      this.changeBtnColor();
    });
  }

  // 为了美观
  private resetTagStyle() {
    this.tagElement.style.borderTopRightRadius = '0px';
    this.tagElement.style.borderBottomRightRadius = '0px';
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

  public getTagProps(): TagProps {
    // element.href does not include tag when frequent tag is selected
    // first title may be the tranlated one
    const tagTitles = this.tagElement.querySelectorAll('div[title]');
    const tagStr = tagTitles[tagTitles.length - 1].getAttribute('title')!;

    // ignore '#' at the beginning except the first bookmark tag '未分類'
    const tag = tagStr.startsWith('#') ? tagStr.slice(1) : '未分類';

    const url = new URL(this.tagElement.href);
    const { searchParams, pathname } = url;

    const extractUrlMatch = regexp.userPageTags.exec(pathname);
    if (!extractUrlMatch) throw new Error(`Could not extract tag props from: ${pathname}`);

    const [, userId, urlCategory] = extractUrlMatch;

    let category: Category;

    // urlCategory is one of 'artworks' | 'illustrations' | 'manga' | 'bookmarks'
    if (urlCategory === 'illustrations' || urlCategory === 'artworks') {
      category = 'illusts';
    } else {
      category = urlCategory as 'manga' | 'bookmarks';
    }

    return {
      userId,
      category,
      tag,
      rest: searchParams.get('rest') === 'hide' ? 'hide' : 'show'
    } as TagProps;
  }

  public dispatchDownload() {
    const { userId, category, tag, rest } = this.getTagProps();
    const { batchDownload } = useBatchDownload();

    batchDownload('tagged_artwork', userId, category, tag, rest);
  }

  connectedCallback() {
    const { downloading } = useBatchDownload();

    this.unsubscriber = downloading.subscribe((val) => {
      if (val) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    });

    this.addEventListener('click', this.dispatchDownload);

    this.ob.observe(this.tagElement, {
      attributes: true,
      attributeFilter: ['status']
    });
  }

  disconnectedCallback() {
    this.unsubscriber();
    this.removeEventListener('click', this.dispatchDownload);
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
