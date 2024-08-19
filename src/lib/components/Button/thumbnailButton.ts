import { historyDb } from '@/lib/db';
import { logger } from '@/lib/logger';
import btnStyle from '@/assets/styles/thumbnailButton.scss?inline';
import svgGroup from '@/assets/thumbnailButtonIcon.svg?src';

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
  DanbooruPool = 'danbooru-pool',
  YandeBrowse = 'yande-browse'
}

export interface ThumbnailBtnProp {
  id: string | number;
  page?: number;
  type?: ThumbnailBtnType;
  onClick: (btn: ThumbnailButton) => any;
}

export class ThumbnailButton extends HTMLElement {
  private status: ThumbnailBtnStatus;
  private mediaId: number;
  private page?: number;
  private type?: ThumbnailBtnType;
  private onClick: ThumbnailBtnProp['onClick'];

  constructor(props: ThumbnailBtnProp) {
    super();
    this.status = ThumbnailBtnStatus.Init;
    this.mediaId = this.checkNumberValidity(props.id);
    props.page !== undefined && (this.page = this.checkNumberValidity(props.page));
    this.type = props.type;
    this.onClick = props.onClick;

    this.render();
  }

  private checkNumberValidity(num: number | string): number {
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

  static get observedAttributes() {
    return ['data-id', 'data-status', 'data-page', 'data-type', 'disabled'];
  }

  private attributeChangedCallback(
    name: 'data-id' | 'data-status' | 'data-page' | 'data-type' | 'disabled',
    oldValue: string | null,
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
      this.mediaId = this.checkNumberValidity(id);
      this.updateDownloadStatus();
    } catch (error) {
      logger.error(error);
      this.dataset.id = String(this.mediaId);
    }
  }

  private updateDisableStatus(val: string | null) {
    const btn = this.shadowRoot!.querySelector('button')!;
    if (typeof val === 'string') {
      btn.setAttribute('disabled', '');
    } else {
      btn.removeAttribute('disabled');
    }
  }

  private updatePage(page: string | null) {
    try {
      if (page === null) {
        this.page = undefined;
      } else {
        this.page = this.checkNumberValidity(page);
      }

      this.updateDownloadStatus();
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
    if (status === null) {
      status = ThumbnailBtnStatus.Init;
    } else if (status === ThumbnailBtnStatus.Init) {
      delete this.dataset.status;
      return;
    } else if (!(status in iconTypeMap)) {
      this.dataset.status = this.status;
      return;
    }

    const useEl = this.shadowRoot!.querySelector('use')!;

    this.status = status as ThumbnailBtnStatus;
    useEl.setAttribute('xlink:href', iconTypeMap[status]);

    useEl.animate(
      [
        {
          opacity: 0.5
        },
        {
          opactiy: 1
        }
      ],
      {
        duration: 200
      }
    );
  }

  private updateDownloadStatus() {
    // Danbooru pool的id不作记录
    if (this.type !== ThumbnailBtnType.DanbooruPool) {
      if (this.page !== undefined) {
        historyDb.hasPage(this.mediaId, this.page).then((pageDownloaded) => {
          pageDownloaded
            ? this.setStatus(ThumbnailBtnStatus.Complete)
            : this.setStatus(ThumbnailBtnStatus.Init);
        });
      } else {
        historyDb.has(this.mediaId).then((hasId: boolean) => {
          hasId
            ? this.setStatus(ThumbnailBtnStatus.Complete)
            : this.setStatus(ThumbnailBtnStatus.Init);
        });
      }
    }
  }

  private render() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `    <style>${btnStyle}</style>${svgGroup}<button class="pdl-thumbnail">
      <svg xmlns="http://www.w3.org/2000/svg" class="pdl-icon">
        <use xlink:href="#pdl-download"></use>
      </svg>
      <span></span>
    </button>`;

    this.updateDownloadStatus();

    this.dataset.id = String(this.mediaId);
    this.type && (this.dataset.type = this.type);
    this.page !== undefined && (this.dataset.page = String(this.page));
  }

  private connectedCallback() {
    this.shadowRoot!.lastElementChild!.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();

      this.setAttribute('disabled', '');
      this.setStatus(ThumbnailBtnStatus.Loading);

      Promise.resolve(this.onClick(this))
        .then(
          () => {
            this.setStatus(ThumbnailBtnStatus.Complete);
          },
          (err: any) => {
            if (err) logger.error(err);
            this.setStatus(ThumbnailBtnStatus.Error);
          }
        )
        .finally(() => {
          this.removeAttribute('disabled');
        });
    });
  }

  public setProgress(progress: number, updateProgressbar = true) {
    if (progress < 0 || progress > 100) throw new RangeError('Value "progress" must between 0-100');

    const shadowRoot = this.shadowRoot!;
    const span = shadowRoot.querySelector('span')!;

    if (this.status !== ThumbnailBtnStatus.Progress) {
      this.dataset.status = ThumbnailBtnStatus.Progress;
      span.classList.toggle('show');
    }

    span.textContent = String(Math.floor(progress));

    if (!updateProgressbar) return;
    const svg = shadowRoot.querySelector<SVGElement>('svg.pdl-icon')!;

    // circle半径
    const radius = 224;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    svg.style.strokeDashoffset = String(offset);
  }

  public removeProgress() {
    const shadowRoot = this.shadowRoot!;
    const span = shadowRoot.querySelector('span')!;
    const svg = shadowRoot.querySelector<SVGElement>('svg.pdl-icon')!;

    span.classList.toggle('show');
    span.addEventListener(
      'transitionend',
      () => {
        span.textContent = '';
      },
      { once: true }
    );

    svg.style.removeProperty('stroke-dashoffset');
    if (this.status === ThumbnailBtnStatus.Progress) this.dataset.status = ThumbnailBtnStatus.Init;
  }

  public setStatus(status: ThumbnailBtnStatus) {
    if (status !== this.status) {
      if (status === ThumbnailBtnStatus.Init) {
        delete this.dataset.status;
        return;
      }

      if (status === ThumbnailBtnStatus.Progress) {
        this.setProgress(0);
        return;
      }

      if (this.status === ThumbnailBtnStatus.Progress) {
        this.removeProgress();
      }

      this.dataset.status = status;
    }
  }
}

customElements.define('pdl-button', ThumbnailButton);
