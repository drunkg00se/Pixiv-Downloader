import type { PixivMeta, PixivIllustMeta, PixivUgoiraMeta } from './parser';
import type { DownloadConfig } from '@/lib/downloader';
import { DownloadConfigBuilder } from '@/sites/base/downloadConfigBuilder';
import dayjs from 'dayjs';
import { config, type UgoiraFormat } from '@/lib/config';
import { IllustType } from './types';
import { compressor } from '@/lib/compressor';
import { type ConvertFormat, converter } from '@/lib/converter';
import { ThumbnailButton, ThumbnailBtnStatus } from '@/lib/components/Button/thumbnailButton';

interface PixivIllustSource extends PixivIllustMeta {
  filename: string;
  order: number;
}

interface PixivUgoiraSource extends PixivUgoiraMeta {
  filename: string;
  order: number;
}

type PixivSource = PixivIllustSource | PixivUgoiraSource;

const pixivHooks = {
  download: {
    singleArtworkProgressFactory(
      btn?: ThumbnailButton,
      pageCount?: number
    ): DownloadConfig<PixivSource>['onProgress'] | undefined {
      if (!btn || !pageCount) return;

      return function onSingleArtworkProgress(progress) {
        if (pageCount === 1) {
          btn.setProgress(progress);
        }
      };
    },

    mulityArtworksProgressFactory(btn?: ThumbnailButton, pageCount?: number) {
      if (!btn || !pageCount) return;

      let pageComplete = 0;

      return function onMulityArtworksProgress() {
        if (pageCount < 2) return;

        const progress = Math.floor((++pageComplete / pageCount) * 100);
        btn.setProgress(progress);
      };
    }
  },

  bundle: {
    async beforeFileSave(imgBlob: Blob, config: DownloadConfig<PixivSource>): Promise<Blob | void> {
      const { taskId, source } = config;

      compressor.add(taskId, source.filename, imgBlob);

      if (compressor.fileCount(taskId) === source.pageCount) {
        let comment: string | undefined;

        if ('ugoiraMeta' in config.source) {
          const delays = config.source.ugoiraMeta.frames.map((frames) => frames.delay);
          comment = JSON.stringify(delays);
        }

        const zipData = await compressor.bundle(taskId, comment);
        compressor.remove(taskId);
        return zipData;
      }
    },

    onError(err: Error, config: DownloadConfig<PixivSource>) {
      compressor.remove(config.taskId);
    },

    onAbort(config: DownloadConfig<PixivSource>) {
      compressor.remove(config.taskId);
    }
  },

  convert: {
    convertProgressFactory(btn: ThumbnailButton) {
      return function onConvertProgress(progress: number) {
        if (progress > 0) {
          btn.setProgress(progress, false);
        } else {
          btn.setStatus(ThumbnailBtnStatus.Loading);
        }
      };
    },

    beforeFileSaveFactory(btn?: ThumbnailButton) {
      const onProgress = btn ? this.convertProgressFactory(btn) : undefined;

      return async function beforeFileSave(
        imgBlob: Blob,
        config: DownloadConfig<PixivSource>
      ): Promise<Blob | void> {
        const { taskId, source } = config;

        if (source.illustType === IllustType.ugoira) {
          converter.addFrame(
            taskId,
            imgBlob,
            source.ugoiraMeta.frames[source.order]['delay'],
            source.order
          );

          if (converter.framesCount(taskId) === source.pageCount) {
            return await converter.convert(taskId, source.extendName as ConvertFormat, onProgress);
          }
        }
      };
    },

    onError(err: Error, config: DownloadConfig<PixivSource>) {
      converter.del(config.taskId);
    },

    onAbort(config: DownloadConfig<PixivSource>) {
      converter.del(config.taskId);
    }
  }
};

const downloaderHooks = {
  getHooks(
    meta: PixivMeta,
    downloadType: 'download' | 'bundle' | 'convert',
    button?: ThumbnailButton
  ) {
    switch (downloadType) {
      case 'download':
        return {
          onProgress: pixivHooks.download.singleArtworkProgressFactory(button, meta.pageCount),
          onFileSaved: pixivHooks.download.mulityArtworksProgressFactory(button, meta.pageCount)
        };
      case 'bundle':
        return {
          onXhrLoaded: pixivHooks.download.mulityArtworksProgressFactory(button, meta.pageCount),
          beforeFileSave: pixivHooks.bundle.beforeFileSave,
          onError: pixivHooks.bundle.onError
        };
      case 'convert':
        return {
          onXhrLoaded: pixivHooks.download.mulityArtworksProgressFactory(button, meta.pageCount),
          beforeFileSave: pixivHooks.convert.beforeFileSaveFactory(button),
          onError: pixivHooks.convert.onError
        };
    }
  }
};

export class PixivDownloadConfig extends DownloadConfigBuilder<PixivSource> {
  protected downloadAll = true;
  protected headers = {
    referer: 'https://www.pixiv.net'
  };
  protected timeout = 60000;

  protected getImgSrc: (page: number) => string = () => '';

  constructor(protected meta: PixivMeta) {
    super(meta);
    this.getImgSrc =
      this.meta.illustType === IllustType.ugoira
        ? (page: number) => this.meta.src.replace('ugoira0', 'ugoira' + page)
        : (page: number) => this.meta.src.replace('_p0', '_p' + page);
  }

  protected getConvertFormat(): UgoiraFormat {
    return config.get('ugoiraFormat');
  }

  protected needConvert(): boolean {
    return this.meta.illustType === IllustType.ugoira && config.get('ugoiraFormat') !== 'zip';
  }

  protected needBundle(): boolean {
    const { pageCount, illustType } = this.meta;
    return (
      this.downloadAll &&
      ((illustType === IllustType.ugoira && this.getConvertFormat() === 'zip') ||
        (pageCount > 1 &&
          ((illustType === IllustType.manga && config.get('bundleManga')) ||
            (illustType === IllustType.illusts && config.get('bundleIllusts')))))
    );
  }

  protected useTranslatedTags(): boolean {
    return config.get('tagLang') !== 'ja';
  }

  protected supportSubpath(): boolean {
    return this.isBrowserApi() || this.isFsaEnable();
  }

  protected buildPattern(pattern: string, page?: number): string {
    const { id, userId, artist, title, tags, tagsTranslated, createDate, pageCount } = this.meta;
    const currPage = page === undefined ? pageCount : page;
    const useTags = this.useTranslatedTags() ? tagsTranslated : tags;
    const fArtist = this.normalizeString(artist);
    const fTitle = this.normalizeString(title);
    const fTags = this.normalizeString(useTags.join('_'));

    const replaceDate = (match: string, p1: string): string => {
      const format = p1 || 'YYYY-MM-DD';
      return dayjs(createDate).format(format);
    };

    return pattern
      .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, replaceDate)
      .replaceAll('{artist}', fArtist)
      .replaceAll('{artistID}', userId)
      .replaceAll('{title}', fTitle)
      .replaceAll('{tags}', fTags)
      .replaceAll('{page}', String(currPage))
      .replaceAll('{id}', id);
  }

  public getDownloadConfig(btn?: ThumbnailButton): DownloadConfig<PixivSource>[] {
    const { illustType, src, id, pageCount, extendName } = this.meta;
    const pageAttr = btn?.dataset.page;
    const downloadPage = pageAttr ? Number(pageAttr) : undefined;

    if (downloadPage && (downloadPage > pageCount - 1 || downloadPage < 0))
      throw new Error('Invalid downloadPage.');

    if (downloadPage !== undefined) this.downloadAll = false;

    const taskId = id + '_' + Math.random().toString(36).slice(2);
    const headers = this.headers;
    const supportSubPath = this.supportSubpath();
    const downloadConfigs: DownloadConfig<PixivSource>[] = [];

    if ((pageCount === 1 || downloadPage !== undefined) && illustType !== IllustType.ugoira) {
      // 单页插图 || 多图只下载单页

      // src 默认为p0地址，downloadPage为0时不需更改
      const imgSrc = downloadPage ? this.getImgSrc(downloadPage) : src;
      const pathPattern = supportSubPath
        ? this.getFullpathPattern()
        : this.getFilenamePattern() + '.' + extendName;

      const path = this.buildPattern(pathPattern, downloadPage ? downloadPage : 0);
      const filename = path.slice(path.lastIndexOf('/') + 1);
      const hooks = downloaderHooks.getHooks({ ...this.meta, pageCount: 1 }, 'download', btn);

      const source: PixivSource = {
        ...this.meta,
        pageCount: 1,
        filename,
        order: downloadPage ?? 0
      };

      const downloadConfig: DownloadConfig<PixivSource> = {
        taskId,
        src: imgSrc,
        path,
        source,
        headers,
        timeout: this.timeout,
        ...hooks
      };

      downloadConfigs.push(downloadConfig);
    } else {
      const pathPatternNoExt = supportSubPath
        ? this.getFullpathPattern().slice(0, -4)
        : this.getFilenamePattern();

      if (this.needBundle()) {
        const pathPattern = pathPatternNoExt + '.zip';
        const filenamePattern = this.getFilenamePattern().includes('{page}')
          ? this.getFilenamePattern() + '.' + extendName
          : this.getFilenamePattern() + '_{page}' + '.' + extendName;

        let path: string;
        let imgCount: number;

        if (illustType === IllustType.ugoira) {
          path = this.buildPattern(pathPattern, 0);
          imgCount = this.meta.ugoiraMeta.frames.length;
        } else {
          path = this.buildPattern(pathPattern);
          imgCount = pageCount;
        }

        const hooks = downloaderHooks.getHooks(
          { ...this.meta, pageCount: imgCount },
          'bundle',
          btn
        );

        for (let page = 0; page < imgCount; page++) {
          const filename = this.buildPattern(filenamePattern, page);
          const imgSrc = this.getImgSrc(page);

          const source: PixivSource = {
            ...this.meta,
            pageCount: imgCount,
            extendName: 'zip',
            filename,
            order: page
          };

          const downloadConfig: DownloadConfig<PixivSource> = {
            taskId,
            src: imgSrc,
            path,
            source,
            headers,
            timeout: this.timeout,
            ...hooks
          };

          downloadConfigs.push(downloadConfig);
        }
      } else if (this.needConvert()) {
        const ext = this.getConvertFormat();
        const pathPattern = pathPatternNoExt + '.' + ext;
        const path = this.buildPattern(pathPattern, 0);
        const filename = path.slice(path.lastIndexOf('/') + 1);

        const imgCount = (this.meta as PixivUgoiraMeta).ugoiraMeta.frames.length;
        const hooks = downloaderHooks.getHooks(
          { ...this.meta, pageCount: imgCount },
          'convert',
          btn
        );

        for (let page = 0; page < imgCount; page++) {
          const imgSrc = this.getImgSrc(page);

          const source: PixivSource = {
            ...this.meta,
            pageCount: imgCount,
            extendName: ext,
            filename,
            order: page
          };

          const downloadConfig: DownloadConfig<PixivSource> = {
            taskId,
            src: imgSrc,
            path,
            source,
            headers,
            timeout: this.timeout,
            ...hooks
          };

          downloadConfigs.push(downloadConfig);
        }
      } else {
        // 多图下载

        const pathPattern = pathPatternNoExt + '.' + extendName;
        const hooks = downloaderHooks.getHooks(this.meta, 'download', btn);

        for (let page = 0; page < pageCount; page++) {
          const path = this.buildPattern(pathPattern, page);
          const filename = path.slice(path.lastIndexOf('/') + 1);
          const imgSrc = this.getImgSrc(page);

          const source: PixivSource = {
            ...this.meta,
            filename,
            order: page
          };

          const downloadConfig: DownloadConfig<PixivSource> = {
            taskId,
            src: imgSrc,
            path,
            source,
            headers,
            timeout: this.timeout,
            ...hooks
          };

          downloadConfigs.push(downloadConfig);
        }
      }
    }

    !this.downloadAll && (this.downloadAll = true);
    return downloadConfigs;
  }
}
