import { historyDb } from '@/lib/db';
import { logger } from '@/lib/logger';
import btnStyle from '@/assets/styles/thumbnailButton.scss?inline';
import svgGroup from '@/assets/thumbnailButtonIcon.svg?src';
import type { Unsubscriber } from 'svelte/store';

const iconTypeMap: Record<string, string> = {
  init: '#pdl-download',
  loading: '#pdl-loading',
  progress: '#pdl-progress',
  complete: '#pdl-complete',
  error: '#pdl-error'
};

export const enum ThumbnailBtnStatus {
  Init = 'init',
  Loading = 'loading',
  Progress = 'progress',
  Complete = 'complete',
  Error = 'error'
}

export const enum ThumbnailBtnType {
  Gallery = 'gallery',
  PixivMyBookmark = 'pixiv-my-bookmark',
  PixivHistory = 'pixiv-history',
  PixivPresentation = 'pixiv-presentation',
  PixivToolbar = 'pixiv-toolbar',
  PixivMangaViewer = 'pixiv-manga-viewer',
  YandeBrowse = 'yande-browse',
  NijieIllust = 'nijie-illust',
  Rule34VaultPostAction = 'rule34vault-post-action'
}

export interface ThumbnailBtnProp {
  id: string | number;
  onClick: (btn: ThumbnailButton) => any;
  page?: number;
  type?: ThumbnailBtnType;
  shouldObserveDb?: boolean;
  extraData?: Record<string, string> & {
    [K in keyof ThumbnailBtnProp]?: never;
  };
}

export class ThumbnailButton extends HTMLElement {
  private btn?: HTMLButtonElement;
  private status: ThumbnailBtnStatus = ThumbnailBtnStatus.Init;
  private mediaId: number;
  private page?: number;
  private type?: ThumbnailBtnType;
  private onClick: ThumbnailBtnProp['onClick'];
  protected unsubscriber?: Unsubscriber;
  private connectedFlag = false;
  private shouldObserveDb = true;
  private progress = 0;
  private dirty = false;

  #downloadingId: number | null = null;
  #downloadingPage: number | undefined | null = null;

  constructor(props: ThumbnailBtnProp) {
    super();
    this.dispatchDownload = this.dispatchDownload.bind(this);
    this.onClick = props.onClick;

    // modifying `dataset` triggers `attributeChangedCallback`, so we should assign private value before dataset.
    this.mediaId = this.toValidatedNumber(props.id);
    this.dataset.id = String(this.mediaId);

    if (props.type) {
      this.dataset.type = this.type = props.type;
    }

    if (props.page !== undefined) {
      this.page = this.toValidatedNumber(props.page);
      this.dataset.page = String(this.page);
    }

    props.shouldObserveDb !== undefined && (this.shouldObserveDb = props.shouldObserveDb);

    if (props.extraData) {
      for (const key in props.extraData) {
        this.dataset[key] = props.extraData[key];
      }
    }
  }

  static get tagNameLowerCase() {
    return 'pdl-button';
  }

  static get observedAttributes() {
    return ['data-id', 'data-status', 'data-page', 'data-type', 'disabled'];
  }

  attributeChangedCallback(
    name: 'data-id' | 'data-status' | 'data-page' | 'data-type' | 'disabled',
    _oldValue: string | null,
    newValue: string | null
  ) {
    switch (name) {
      case 'data-id':
        this.updateId(newValue);
        break;
      case 'data-status':
        this.updateIcon(newValue);
        break;
      case 'data-page':
        this.updatePage(newValue);
        break;
      case 'data-type':
        this.resetType(newValue);
        break;
      case 'disabled':
        this.updateDisableStatus(newValue);
        break;
      default:
        break;
    }
  }

  #resetStatus() {
    this.hasAttribute('disabled') && this.removeAttribute('disabled');
    this.setStatus(ThumbnailBtnStatus.Init);
  }

  private toValidatedNumber(num: number | string): number {
    if (typeof num === 'string') {
      if (num !== '') {
        num = +num;
      } else {
        return logger.throw('Invalid argument: can not be "".', RangeError);
      }
    }

    if (num < 0 || !Number.isSafeInteger(num)) {
      return logger.throw(`Invalid number: ${num}, must be a non-negative integer.`, RangeError);
    }

    return num;
  }

  private resetType(newVal: string | null) {
    if (newVal === null && this.type === undefined) return;

    if (newVal !== this.type) {
      if (this.type === undefined) {
        delete this.dataset.type;
      } else {
        this.dataset.type = this.type;
      }
      logger.error('Changes to "data-type" is not allowed.');
    }
  }

  private updateId(id: string | null) {
    try {
      if (id === null) throw new Error('Attribute "data-id" is required.');

      this.mediaId = this.toValidatedNumber(id);

      this.#resetStatus();
      this.#downloadingId && (this.#downloadingId = null);

      this.connectedFlag && this.shouldObserveDb && this.observeDb()();
    } catch (error) {
      logger.error(error);
      this.dataset.id = String(this.mediaId);
    }
  }

  private updateDisableStatus(val: string | null) {
    if (!this.connectedFlag) {
      this.dirty = true;
      return;
    }

    if (typeof val === 'string') {
      this.btn!.setAttribute('disabled', '');
    } else {
      this.btn!.removeAttribute('disabled');
    }
  }

  private updatePage(page: string | null) {
    try {
      this.page = page === null ? undefined : this.toValidatedNumber(page);

      this.#downloadingPage && (this.#downloadingPage = null);

      this.#resetStatus();

      this.connectedFlag && this.shouldObserveDb && this.observeDb()();
    } catch (error) {
      logger.error(error);
      if (this.page === undefined) {
        delete this.dataset.page;
      } else {
        this.dataset.page = String(this.page);
      }
    }
  }

  private updateIcon(status: string | null) {
    // update status
    if (status === null) {
      status = ThumbnailBtnStatus.Init;
    } else if (status === ThumbnailBtnStatus.Init) {
      delete this.dataset.status;
      return;
    } else if (!(status in iconTypeMap)) {
      this.dataset.status = this.status;
      return;
    }
    this.status = status as ThumbnailBtnStatus;

    if (!this.connectedFlag) {
      this.dirty = true;
      return;
    }

    // update dom
    const useEl = this.shadowRoot!.querySelector('use')!;
    useEl.setAttribute('xlink:href', iconTypeMap[status]);
    useEl.animate([{ opacity: 0.5 }, { opactiy: 1 }], { duration: 200 });
  }

  private render() {
    let shadowRoot: ShadowRoot | null;
    if ((shadowRoot = this.shadowRoot) && !this.dirty) return;

    const statusIsProgress = this.status === ThumbnailBtnStatus.Progress;

    shadowRoot ??= this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `<style>${btnStyle}</style>${svgGroup}<button class="pdl-thumbnail" ${this.hasAttribute('disabled') ? 'disabled' : ''}>
      <svg xmlns="http://www.w3.org/2000/svg" class="pdl-icon" ${statusIsProgress ? `style="stroke-dashoffset: ${this.clacProgressRadial(this.progress)};"` : ''}>
        <use xlink:href="${iconTypeMap[this.status]}"></use>
      </svg>
      ${statusIsProgress ? `<span class="show">${this.progress}</span>` : '<span></span>'}
    </button>`;
  }

  public dispatchDownload(evt?: MouseEvent) {
    evt?.preventDefault();
    evt?.stopPropagation();

    this.setAttribute('disabled', '');
    this.setStatus(ThumbnailBtnStatus.Loading);

    const id = (this.#downloadingId = this.mediaId);
    const page = (this.#downloadingPage = this.page);

    Promise.resolve(this.onClick(this))
      .then(
        () => {
          if (id === this.#downloadingId && page === this.#downloadingPage) {
            this.setStatus(ThumbnailBtnStatus.Complete);
            this.removeAttribute('disabled');
          }
        },
        (err: unknown) => {
          if (err) logger.error(err);

          if (id === this.#downloadingId && page === this.#downloadingPage) {
            this.setStatus(ThumbnailBtnStatus.Error);
            this.removeAttribute('disabled');
          }
        }
      )
      .finally(() => {
        id === this.#downloadingId && (this.#downloadingId = null);
        page === this.#downloadingPage && (this.#downloadingPage = null);
      });
  }

  private observeDb() {
    return historyDb.subscribe(async () => {
      const id = this.mediaId;
      const page = this.page;

      const downloaded = await historyDb.has(id, page);

      // id or page may change during query.
      if (id !== this.mediaId || page !== this.page) return;

      if (this.status === ThumbnailBtnStatus.Complete) {
        !downloaded && this.setStatus(ThumbnailBtnStatus.Init);
      } else {
        downloaded && this.setStatus(ThumbnailBtnStatus.Complete);
      }
    });
  }

  connectedCallback() {
    this.render();
    this.dirty && (this.dirty = false);
    this.connectedFlag = true;
    this.btn = this.shadowRoot!.querySelector('button')!;
    this.btn.addEventListener('click', this.dispatchDownload);
    this.shouldObserveDb && (this.unsubscriber = this.observeDb());
  }

  disconnectedCallback() {
    this.connectedFlag = false;
    this.btn?.removeEventListener('click', this.dispatchDownload);
    this.unsubscriber?.();
  }

  private clacProgressRadial(progress: number) {
    const radius = 224;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return offset;
  }

  public setProgress(progress: number, updateProgressbar = true) {
    if (progress < 0 || progress > 100) throw new RangeError('Value "progress" must between 0-100');
    if (this.mediaId !== this.#downloadingId || this.page !== this.#downloadingPage) return;

    this.progress = Math.floor(progress);

    if (this.status !== ThumbnailBtnStatus.Progress) {
      this.dataset.status = ThumbnailBtnStatus.Progress;
    }

    if (!this.connectedFlag) {
      this.dirty = true;
      return;
    }

    // update dom
    const shadowRoot = this.shadowRoot!;
    const span = shadowRoot.querySelector('span')!;
    span.classList.add('show');
    span.textContent = String(this.progress);

    if (!updateProgressbar) return;

    const svg = shadowRoot.querySelector<SVGElement>('svg.pdl-icon')!;
    svg.style.strokeDashoffset = String(this.clacProgressRadial(progress));
  }

  public removeProgress() {
    this.progress = 0;

    if (!this.connectedFlag) {
      this.dirty = true;
      return;
    }

    // update dom
    const shadowRoot = this.shadowRoot!;
    const span = shadowRoot.querySelector('span')!;
    const svg = shadowRoot.querySelector<SVGElement>('svg.pdl-icon')!;

    if (!span.classList.contains('show')) return;

    span.classList.remove('show');
    span.addEventListener(
      'transitionend',
      () => {
        span.textContent = '';
      },
      { once: true }
    );
    svg.style.removeProperty('stroke-dashoffset');
  }

  public setStatus(newStatus: ThumbnailBtnStatus) {
    if (newStatus !== this.status) {
      if (newStatus === ThumbnailBtnStatus.Init) {
        delete this.dataset.status;
        return;
      }

      if (newStatus === ThumbnailBtnStatus.Progress) {
        this.setProgress(0);
        return;
      }

      this.removeProgress();
      this.dataset.status = newStatus;
    }
  }
}

customElements.define(ThumbnailButton.tagNameLowerCase, ThumbnailButton);
