import type { ConfigData } from '@/lib/config';
import { SiteInject } from '../base';
import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { ArtworkButton } from '@/lib/components/Button/artworkButton';
import { downloader, type DownloadConfig } from '@/lib/downloader';
import { NijieParser, type NijieMeta } from './parser';
import { NijieApi } from './api';
import { NijieDownloadConfig, type NijieDownloaderSource } from './downloadConfigBuilder';
import { historyDb, type HistoryData } from '@/lib/db';
import { logger } from '@/lib/logger';
import t from '@/lib/lang';

export class Nijie extends SiteInject {
  protected parser = new NijieParser();
  protected api = new NijieApi({ rateLimit: 3 });

  #searchParams = new URLSearchParams(location.search);

  static get hostname() {
    return 'nijie.info';
  }

  protected getCustomConfig(): Partial<ConfigData> | void {
    return {
      folderPattern: 'nijie/{artist}',
      filenamePattern: '{artist}_{title}_{id}_p{page}'
    };
  }

  protected getFilenameTemplate(): string[] {
    return ['{artist}', '{artistID}', '{title}', '{id}', '{page}', '{tags}', '{date}'];
  }

  #isViewPage() {
    return location.pathname === '/view.php';
  }

  #isViewPopupPage() {
    return location.pathname === '/view_popup.php';
  }

  #isOkazuPage() {
    return location.pathname === '/okazu.php';
  }

  #isSupportedUserPage(url: string) {
    return /members\.php|members_illust\.php|members_dojin\.php|user_like_illust_view\.php/.test(
      url
    );
  }

  #isSupportedHistoryPage(url: string) {
    return /history_nuita\.php|history_illust\.php/.test(url);
  }

  #getSearchId() {
    return this.#searchParams.get('id');
  }

  protected observeColorScheme() {
    document.querySelector('link[type="text/css"][href*="night_mode"]') && this.setAppDarkMode();
  }

  protected useBatchDownload = this.app.initBatchDownloader({
    metaType: {} as NijieMeta,

    avatar: () => {
      const userAvatarImg = document.querySelector<HTMLImageElement>(
        'a[href*="members.php"].name img'
      );
      return userAvatarImg ? userAvatarImg.src : '/pic/icon/nijie.png';
    },

    filterOption: {
      filters: [
        {
          id: 'exclude_downloaded',
          type: 'exclude',
          name: t('downloader.category.filter.exclude_downloaded'),
          checked: false,
          fn(meta) {
            return !!meta.id && historyDb.has(meta.id);
          }
        },
        {
          id: 'allow_image',
          type: 'include',
          name: t('downloader.category.filter.image'),
          checked: true,
          fn(meta) {
            !!meta.extendName && /bmp|jp(e)?g|png|tif|gif|exif|svg|webp/i.test(meta.extendName);

            return !!meta.tags && !meta.tags.includes('video');
          }
        },
        {
          id: 'allow_video',
          type: 'include',
          name: t('downloader.category.filter.video'),
          checked: true,
          fn(meta) {
            return (
              !!meta.extendName &&
              /mp4|avi|mov|mkv|flv|wmv|webm|mpeg|mpg|m4v/i.test(meta.extendName)
            );
          }
        }
      ],

      enableTagFilter: true
    },

    pageOption: {
      illusts: {
        name: '投稿イラスト',
        match: (url) => this.#isSupportedUserPage(url),
        filterInGenerator: false,
        fn: (pageRange) => {
          const id = this.#getSearchId();
          if (!id) throw new Error('Invalid user ID.');

          const getIllustData = async (page: number) => {
            const doc = await this.api.getUserIllustsDoc(id, page);
            return {
              lastPage: !this.parser.docHasNextPagination(doc),
              data: this.parser.parseUserPageArtworkIdByDoc(doc)
            };
          };

          return this.parser.paginationGenerator(pageRange, getIllustData, (data) => data);
        }
      },

      // dojin only have one page
      dojin: {
        name: '同人',
        match: (url) => this.#isSupportedUserPage(url),
        filterInGenerator: false,
        fn: () => {
          const id = this.#getSearchId();
          if (!id) throw new Error('Invalid user ID.');

          return this.parser.paginationGenerator(
            [1, 1],
            async () => {
              const doc = await this.api.getUserDojinDoc(id);
              return {
                lastPage: true,
                data: this.parser.parseUserPageArtworkIdByDoc(doc)
              };
            },
            (data) => data
          );
        }
      },

      // user_like_illust_view may not always have 48 illusts per page.
      bookmark: {
        name: 'ブックマーク',
        match: (url) => this.#isSupportedUserPage(url),
        filterInGenerator: false,
        fn: (pageRange) => {
          const id = this.#getSearchId();
          if (!id) throw new Error('Invalid user ID.');

          return this.parser.paginationGenerator(
            pageRange,
            async (page: number) => {
              const doc = await this.api.getUserBookmarkDoc(id, page);

              return {
                lastPage: !this.parser.docHasNextPagination(doc),
                data: this.parser.parseUserPageArtworkIdByDoc(doc)
              };
            },
            (data) => data
          );
        }
      },

      feed: {
        name: '新着2次絵',
        match: /like_user_view\.php/,
        filterInGenerator: false,
        fn: (pageRange) => {
          return this.parser.paginationGenerator(
            pageRange,
            async (page: number) => {
              const doc = await this.api.getUserFeedDoc(page);

              return {
                lastPage: !this.parser.docHasNextPagination(doc),
                data: this.parser.parseUserFeedArtworkIdByDoc(doc)
              };
            },
            (data) => data
          );
        }
      },

      nuita: {
        name: '抜いた',
        match: (url: string) => this.#isSupportedHistoryPage(url),
        filterInGenerator: false,
        fn: () => {
          return this.parser.paginationGenerator(
            [1, 1],
            async () => {
              const doc = await this.api.getHistoryNuitaDoc();
              return {
                lastPage: true,
                data: this.parser.parseHistoryNuitaArtworkIdByDoc(doc)
              };
            },
            (data) => data
          );
        }
      },

      history: {
        name: '閲覧',
        match: (url: string) => this.#isSupportedHistoryPage(url),
        filterInGenerator: false,
        fn: () => {
          return this.parser.paginationGenerator(
            [1, 1],
            async () => {
              const doc = await this.api.getHistoryIllustDoc();
              return {
                lastPage: true,
                data: this.parser.parseHistoryIllustArtworkIdByDoc(doc)
              };
            },
            (data) => data
          );
        }
      }
    },

    parseMetaByArtworkId: async (id) => {
      const viewDoc = await this.api.getViewDoc(id);
      const meta = this.parser.buildMetaByView(id, viewDoc);

      if (this.parser.docHasImgDiff(viewDoc)) {
        const popupDoc = await this.api.getViewPopupDoc(id);
        const imgDiffSrcs = this.parser.parseImgDiffSrcByDoc(popupDoc);
        return { ...meta, diff: imgDiffSrcs };
      }

      return meta;
    },

    downloadArtworkByMeta: async (meta, signal) => {
      downloader.dirHandleCheck();

      let downloaderConfig:
        | DownloadConfig<NijieDownloaderSource>
        | DownloadConfig<NijieDownloaderSource>[];

      if (meta.diff) {
        downloaderConfig = new NijieDownloadConfig(meta).generateMultiPageConfig(meta.diff);
      } else {
        downloaderConfig = new NijieDownloadConfig(meta).getDownloadConfig();
      }

      await downloader.download(downloaderConfig, { signal });

      const { id, artist, userId, title, comment, tags } = meta;

      const historyData: HistoryData = {
        pid: Number(id),
        user: artist,
        userId: Number(userId),
        title,
        comment,
        tags
      };

      historyDb.add(historyData);
    }
  });

  async #addBookmark(id: string, tags?: string[]) {
    try {
      await this.api.addBookmark(id, tags);

      if ((this.#isViewPage() || this.#isViewPopupPage()) && this.#getSearchId() === id) {
        const bookmarkBtn = document.querySelector<HTMLAnchorElement>('a#bukuma-do');
        if (!bookmarkBtn) return;

        // change bookmarkBtn's href so illust will not be bookmarked again.
        bookmarkBtn.id = 'bukuma';
        bookmarkBtn.setAttribute(
          'href',
          bookmarkBtn.getAttribute('href')!.replace('bookmark.php', 'bookmark_edit.php')
        );

        // replace text.
        bookmarkBtn.lastChild?.remove();
        const text = document.createElement('span');
        text.textContent = 'ブックマーク編集';
        bookmarkBtn.appendChild(text);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  protected async downloadArtwork(btn: ThumbnailButton) {
    downloader.dirHandleCheck();

    const { id, page } = btn.dataset as { id: string; page?: string };
    const pageNum = page ? +page : undefined;

    let downloaderConfig:
      | DownloadConfig<NijieDownloaderSource>
      | DownloadConfig<NijieDownloaderSource>[];
    let viewDoc: Document;
    let popupDoc: Document;

    if (this.#isViewPage() && id === this.#getSearchId()) {
      viewDoc = document;
    } else {
      viewDoc = await this.api.getViewDoc(id);
    }

    const meta = this.parser.buildMetaByView(id, viewDoc);

    // downloading the first page or illust doesn't have diff
    if (pageNum === 0 || !this.parser.docHasImgDiff(viewDoc)) {
      downloaderConfig = new NijieDownloadConfig(meta).getDownloadConfig(btn);
    } else {
      if (this.#isViewPopupPage() && id === this.#getSearchId()) {
        popupDoc = document;
      } else {
        popupDoc = await this.api.getViewPopupDoc(id);
      }

      const imgDiffSrcs = this.parser.parseImgDiffSrcByDoc(popupDoc);

      downloaderConfig = new NijieDownloadConfig(meta).generateMultiPageConfig(
        imgDiffSrcs,
        pageNum,
        btn
      );
    }

    const { userId, comment, tags, artist, title, isBookmarked } = meta;

    // odai illust will be added every time since we cannot confirm whether it's bookmarked.
    if (!isBookmarked && this.config.get('addBookmark')) {
      this.#addBookmark(id, this.config.get('addBookmarkWithTags') ? tags : undefined);
    }

    await downloader.download(downloaderConfig, { priority: 1 });

    const historyData: HistoryData = {
      pid: Number(id),
      user: artist,
      userId: Number(userId),
      title,
      comment,
      tags
    };

    if (page !== undefined) {
      historyData.page = Number(page);
    }

    historyDb.add(historyData);
  }

  protected createThumbnailBtn() {
    const btnStyle = {
      thumbnails: { selector: 'p.nijiedao:has(> img.ngtag)', setStyle: undefined, diff: undefined },

      memberAndHotImage: {
        selector: 'p.nijiedao > a:has(img.ngtag)',
        setStyle: (el: HTMLElement) => {
          el.style.display = 'inline-block';
        },
        diff: undefined
      },

      imgDiff: {
        selector: 'a[href*="#diff_"]:has(img.ngtag:not([data-original]))', // :not([data-original]): exclude dojin thumbnails
        setStyle: (el: HTMLElement) => {
          const img = el.querySelector('img')!;
          const margin = getComputedStyle(img).margin;

          img.style.margin = '0px';
          el.style.display = 'inline-block';
          el.style.margin = margin;
        },
        diff: (el: HTMLElement) => /(?<=#diff_)[0-9]+$/.exec((el as HTMLAnchorElement).href)?.[0]
      },

      dojinDiff: {
        selector: 'a[href*="#diff_"]:has(img[data-original].ngtag)',
        setStyle: (el: HTMLElement) => {
          const img = el.querySelector('img')!;

          // reset #thumbnail img { width: 70%; }
          img.style.width = 'auto';
          el.style.display = 'inline-block';
        },
        diff: (el: HTMLElement) => /(?<=#diff_)[0-9]+$/.exec((el as HTMLAnchorElement).href)?.[0]
      },

      otherDojin: {
        selector: 'a[href*="id="]:has(>.other_dojin_block)',
        setStyle: (el: HTMLElement) => {
          el.style.display = 'block';
        },
        diff: undefined
      },

      similar: { selector: '#nuitahito li:has(img.ngtag)', setStyle: undefined, diff: undefined }, // nuitahito

      // okazu
      rank: {
        selector: 'p.illust:has(> img.ngtag)',
        setStyle: (el: HTMLElement) => {
          const okazuThumbnailIcon = el.previousElementSibling as HTMLElement;
          if (!okazuThumbnailIcon) return;

          okazuThumbnailIcon.style.zIndex = '1';
        },
        diff: undefined
      },

      dictionary: {
        selector: 'a[href*="id="]:has(> :is(img.tagsimage, img.mozamoza:not([illust_id])))', // .tagsimage: dictionary block in 'search.php'
        setStyle: (el: HTMLElement) => {
          const img = el.querySelector('img')!;
          const width = getComputedStyle(img).width;

          // overwrite #article_body img { width: 40%;} in seiten
          el.style.width = width;
          img.style.width = '100%';

          el.style.display = 'inline-block';
        },
        diff: undefined
      },

      responseOdai: {
        selector: '#response_odai li a[href*="id="]:has(img)',
        setStyle: (el: HTMLElement) => {
          el.style.display = 'inline-block';
        },
        diff: undefined
      },

      historyIllust: {
        selector: '.history_block > .picture > a[href*="id="]:has(img)',
        setStyle: (el: HTMLElement) => {
          el.style.display = 'inline-block';
        },
        diff: undefined
      }
    };

    for (const { selector, setStyle, diff } of Object.values(btnStyle)) {
      const btnContainers = document.querySelectorAll<HTMLElement>(selector);
      if (!btnContainers.length) continue;

      btnContainers.forEach((container) => {
        if (container.querySelector(ThumbnailButton.tagNameLowerCase)) return;

        let id: string;

        if (container instanceof HTMLAnchorElement) {
          id = /(?<=id=)[0-9]+/.exec(container.href)![0];
        } else {
          const img = container.querySelector('img.ngtag')!;
          id = img.getAttribute('illust_id')!;
        }

        const page = diff?.(container);

        setStyle?.(container);
        container.style.position = 'relative';

        container.appendChild(
          new ThumbnailButton({ id, page: page ? +page : undefined, onClick: this.downloadArtwork })
        );
      });
    }
  }

  protected createIllustSettingBtn() {
    const id = this.#getSearchId();
    const container = document.querySelector<HTMLDivElement>('#illust_setting');
    if (!id || !container) return;

    container.appendChild(
      new ThumbnailButton({
        id,
        type: ThumbnailBtnType.NijieIllust,
        onClick: this.downloadArtwork
      })
    );
  }

  // sticky button does not work properly on 'view.php' due to `overflow: hidden` on ancestor `#main-center-none`
  protected createImgFilterBtn() {
    const id = this.#getSearchId();
    const containers = document.querySelectorAll<HTMLAnchorElement>('#img_filter');
    if (!id || !containers.length) return;

    // return if illust does not have diff.
    if (containers.length === 1) {
      if (containers[0].dataset.index) return; // popup
      if (!document.querySelector('#img_diff > a[href*="diff_"]')) return; // view
    }

    containers.forEach((container, idx) => {
      const img = container.querySelector<HTMLImageElement>('img:not(.filter)');
      if (!img) return;

      // img in view.php has 10px margin-bottom;
      const { marginBottom } = getComputedStyle(img);
      container.style.marginBottom = marginBottom;
      img.style.marginBottom = '0px';

      // modify the filter image's z-index so it doen't block the download button.
      const filterImg = container.querySelector<HTMLImageElement>('img.filter');
      filterImg && (filterImg.style.zIndex = 'auto');

      container.appendChild(new ArtworkButton({ id, page: idx, onClick: this.downloadArtwork }));
    });
  }

  protected createDojinHeaderBtn() {
    const container = document.querySelector('#dojin_header > .right > ul');
    const id = this.#getSearchId();
    if (!container || !id) return;

    container.appendChild(
      new ThumbnailButton({ id, type: ThumbnailBtnType.NijieIllust, onClick: this.downloadArtwork })
    );
  }

  protected createDojinCoverBtn() {
    const container = document.querySelector<HTMLAnchorElement>(
      '#dojin_left .image > a[href*="view_popup"]'
    );
    const id = this.#getSearchId();
    if (!container || !id) return;

    container.style.display = 'inline-block';
    container.style.position = 'relative';
    container.style.width = 'fit-content';

    container.appendChild(new ArtworkButton({ id, page: 0, onClick: this.downloadArtwork }));
  }

  protected createOdaiBtn() {
    const id = this.#getSearchId();
    const container = document.querySelector<HTMLAnchorElement>(
      '#gallery_new > p > a:has(img#view_img)'
    );
    if (!id || !container) return;

    const img = container.querySelector<HTMLImageElement>('img:not(.filter)')!;

    const { marginBottom } = getComputedStyle(img);
    img.style.marginBottom = '0px';
    container.style.marginBottom = marginBottom;
    container.style.display = 'inline-block';
    container.style.position = 'relative';

    container.appendChild(new ArtworkButton({ id, page: 0, onClick: this.downloadArtwork }));
  }

  protected observeOzakuListChange() {
    const ozakuList = document.querySelector('#okazu_list');
    if (!ozakuList) return;

    const observer = new MutationObserver(() => this.createThumbnailBtn());
    observer.observe(ozakuList, { subtree: true, childList: true });
  }

  // TODO: https://nijie.info/history_illust.php
  public inject(): void {
    super.inject();

    this.downloadArtwork = this.downloadArtwork.bind(this);

    this.createThumbnailBtn();

    if (this.#isViewPage()) {
      // illust / video
      this.createIllustSettingBtn();
      this.createImgFilterBtn();

      // dojin
      this.createDojinHeaderBtn();
      this.createDojinCoverBtn();

      // odai
      this.createOdaiBtn();
    } else if (this.#isViewPopupPage()) {
      this.createIllustSettingBtn();
      this.createImgFilterBtn();
    } else if (this.#isOkazuPage()) {
      this.observeOzakuListChange();
    }
  }
}
