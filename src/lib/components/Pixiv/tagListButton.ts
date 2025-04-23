import downloadSvg from '@/assets/download.svg?src';
import { addStyleToShadow } from '@/lib/util';
import type { Category } from '@/sites/pixiv/types';
import type { TagProps } from './artworkTagButton';
import { regexp } from '@/lib/regExp';
import { type Unsubscriber, type Readable, toStore } from 'svelte/store';
import { logger } from '@/lib/logger';

export class TagListButton extends HTMLElement {
  private btn?: HTMLButtonElement;
  private downloadingStore: Readable<boolean>;
  private unsubscriber?: Unsubscriber;

  constructor(
    private tagUrl: string,
    downloading: ReactiveValue<boolean>,
    private handleDownload: (props: TagProps) => Promise<void>
  ) {
    super();

    this.downloadingStore = toStore(() => downloading.current);

    this.dispatchDownload = this.dispatchDownload.bind(this);
  }

  static get tagNameLowerCase() {
    return 'pdl-tag-list-button';
  }

  private async render() {
    if (this.shadowRoot) return;

    const shadowRoot = this.attachShadow({ mode: 'open' });
    addStyleToShadow(shadowRoot);

    shadowRoot.innerHTML = ` 
  <div class=" flex items-center">    
    <hr class="!border-t-0 border-l h-6 ml-4 mr-2" />
    <button class=" h-[38px] w-[38px] btn-icon [&:not([disabled])]:hover:bg-slate-400/30 disabled:cursor-wait disabled:opacity-70">
      <i class="text-sm w-6 fill-current mx-2">
      ${downloadSvg}
      </i>
    </button>
  </div>
  `;
  }

  public getTagProps(): TagProps {
    const url = new URL(this.tagUrl);
    const { searchParams, pathname } = url;

    const extractUrlMatch = regexp.userPageTags.exec(pathname);
    if (!extractUrlMatch) throw new Error(`Could not extract tag props from: ${pathname}`);

    const [, userId, urlCategory, tag] = extractUrlMatch;
    if (!tag) throw new Error(`Could not extract tag from: ${pathname}`);

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
      tag: tag,
      rest: searchParams.get('rest') === 'hide' ? 'hide' : 'show'
    } as TagProps;
  }

  public dispatchDownload(evt?: MouseEvent) {
    // prevent from navigating to specific tag page
    evt?.preventDefault();

    this.handleDownload(this.getTagProps()).catch(logger.error);
  }

  connectedCallback() {
    this.render();
    this.btn ??= this.shadowRoot!.querySelector('button')!;
    this.btn.addEventListener('click', this.dispatchDownload);

    this.unsubscriber = this.downloadingStore.subscribe((val) => {
      if (val) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    });
  }

  disconnectedCallback() {
    this.unsubscriber?.();
    this.btn?.removeEventListener('click', this.dispatchDownload);
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  attributeChangedCallback(name: 'disabled', oldValue: string | null, newValue: string | null) {
    if (typeof newValue === 'string') {
      this.btn?.setAttribute('disabled', '');
    } else {
      this.btn?.removeAttribute('disabled');
    }
  }
}

customElements.define(TagListButton.tagNameLowerCase, TagListButton);
