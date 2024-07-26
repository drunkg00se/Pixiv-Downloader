import downloadSvg from '@/assets/download.svg?src';
import { addStyleToShadow } from '@/lib/util';
import type { Category } from '@/sites/pixiv/types';
import type { TagProps } from './artworkTagButton';

export class TagListButton extends HTMLElement {
  constructor(
    private tagUrl: string,
    private onClick?: (evt: MouseEvent) => void
  ) {
    super();

    this.render();
  }

  private getTagProps(): TagProps {
    const url = new URL(this.tagUrl);
    const { searchParams, pathname } = url;

    const pathComponent = pathname.split('/');
    const [, , userId, urlCategory] = pathComponent;

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
      tag: pathComponent[pathComponent.length - 1],
      rest: searchParams.get('rest') === 'hide' ? 'hide' : 'show'
    } as TagProps;
  }

  private bindValue(btn: HTMLButtonElement, props: TagProps) {
    btn.setAttribute('data-user-id', props.userId);
    btn.setAttribute('data-category', props.category);
    btn.setAttribute('data-tag', props.tag);
    btn.setAttribute('data-bookmark-rest', props.rest);
  }

  private async render() {
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

    const btn = shadowRoot.querySelector('button')!;
    this.bindValue(btn, this.getTagProps());
    this.onClick && btn.addEventListener('click', this.onClick);
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

customElements.define('pdl-tag-list-button', TagListButton);
