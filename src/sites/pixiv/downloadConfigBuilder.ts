import type { PixivMeta, PixivIllustMeta, PixivUgoiraMeta } from './parser';
import { type DownloadConfig, type DownloaderHooks } from '@/lib/downloader';
import {
  MediaDownloadConfig,
  type IndexOption,
  type MultiOption,
  type OptionBase,
  type SingleOption
} from '@/sites/base/downloadConfigBuilder';
import { IllustType, type UgoiraMeta } from './types';
import { compressor } from '@/lib/compressor';
import { type ConvertFormat, converter } from '@/lib/converter';
import { GM_xmlhttpRequest } from '$';
import { historyDb } from '@/lib/db';

interface PixivConvertOption extends OptionBase {
  convertFormat: ConvertFormat;
}

/**
 * TODO:
 * fallback artist / title
 * useTranslatedTags
 * always add {page} when bundling
 * refactor replaceTemplate
 */
export class PixivDownloadConfigNext extends MediaDownloadConfig {
  protected ugoiraMeta: UgoiraMeta | undefined;
  protected illustType: IllustType;
  protected userId: string;
  protected tagsTranslated: string[];

  protected handleBeforeSaveCb: DownloaderHooks['beforeFileSave'] | undefined = undefined;
  protected handleErrorCb: DownloaderHooks['onError'] | undefined = undefined;
  protected handleAbortCb: DownloaderHooks['onAbort'] | undefined = undefined;

  protected constructor(mediaMeta: PixivMeta) {
    super(mediaMeta);

    this.ugoiraMeta = 'ugoiraMeta' in mediaMeta ? mediaMeta.ugoiraMeta : undefined;
    this.illustType = mediaMeta.illustType;
    this.userId = mediaMeta.userId;
    this.tagsTranslated = mediaMeta.tagsTranslated;
  }

  getHeaders() {
    return {
      referer: 'https://www.pixiv.net'
    };
  }

  replaceTemplate(template: string): string[] {
    const artist = this.normalizeString(this.artist);
    const title = this.normalizeString(this.title);
    const tags = this.tags.map((tag) => this.normalizeString(tag));

    const path = template
      .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, this.replaceDateTemplate.bind(this))
      .replaceAll('{artist}', artist)
      .replaceAll('{artistID}', this.userId)
      .replaceAll('{title}', title)
      .replaceAll('{id}', this.id)
      .replaceAll('{tags}', tags.join('_'));

    return Array.from({ length: Array.isArray(this.ext) ? this.ext.length : 1 }, (_, i) =>
      path.replaceAll('{page}', String(i))
    );
  }

  getBundleSavePath(folderTemplate: string, filenameTemplate: string): string {
    const artist = this.normalizeString(this.artist);
    const title = this.normalizeString(this.title);
    const tags = this.tags.map((tag) => this.normalizeString(tag));
    const template = folderTemplate ? `${folderTemplate}/${filenameTemplate}` : filenameTemplate;

    const path = template
      .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, this.replaceDateTemplate.bind(this))
      .replaceAll('{artist}', artist)
      .replaceAll('{artistID}', this.userId)
      .replaceAll('{title}', title)
      .replaceAll('{id}', this.id)
      .replaceAll('{tags}', tags.join('_'))
      .replaceAll('{page}', Array.isArray(this.src) ? `${this.src.length}` : '1');

    return `${path}.zip`;
  }

  getConvertSavePath(
    folderTemplate: string,
    filenameTemplate: string,
    extendName: ConvertFormat
  ): string {
    const artist = this.normalizeString(this.artist);
    const title = this.normalizeString(this.title);
    const tags = this.tags.map((tag) => this.normalizeString(tag));
    const template = folderTemplate ? `${folderTemplate}/${filenameTemplate}` : filenameTemplate;

    const path = template
      .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, this.replaceDateTemplate.bind(this))
      .replaceAll('{artist}', artist)
      .replaceAll('{artistID}', this.userId)
      .replaceAll('{title}', title)
      .replaceAll('{id}', this.id)
      .replaceAll('{tags}', tags.join('_'))
      .replaceAll('{page}', '0');

    return `${path}.${extendName}`;
  }

  handleBundleFactory(filenames: string[]) {
    if (!Array.isArray(this.src)) throw new Error('`src` must be an array.');

    return (this.handleBeforeSaveCb ??= async (
      imgBlob: Blob,
      config: DownloadConfig,
      signal?: AbortSignal
    ): Promise<Blob | void> => {
      signal?.throwIfAborted();

      const { taskId, src } = config;
      const index = (this.src as string[]).indexOf(src);
      if (index === -1) throw new Error('No src matches.');

      compressor.add(taskId, filenames[index], imgBlob);

      if (compressor.fileCount(taskId) !== filenames.length) return;

      let comment: string | undefined;

      if (this.ugoiraMeta) {
        const delays = this.ugoiraMeta.frames.map((frames) => frames.delay);
        comment = JSON.stringify(delays);
      }

      const zipData = await compressor.bundle(taskId, comment);

      signal?.throwIfAborted();

      compressor.remove(taskId);

      return zipData;
    });
  }

  handleBundleErrorFactory() {
    return (this.handleErrorCb ??= () => {
      compressor.remove(this.getTaskId());
    });
  }

  handleBundleAbortFactory() {
    return (this.handleAbortCb ??= () => {
      compressor.remove(this.getTaskId());
    });
  }

  handleConvertFactory(convertFormat: ConvertFormat, setProgress?: (progress: number) => void) {
    return (this.handleBeforeSaveCb ??= async (
      imgBlob: Blob,
      config: DownloadConfig,
      signal?: AbortSignal
    ): Promise<Blob | void> => {
      signal?.throwIfAborted();

      const { taskId, src } = config;
      const index = (this.src as string[]).indexOf(src);
      if (index === -1) throw new Error('No src matches.');

      if (!this.ugoiraMeta) return;

      this.handleAbortCb ??= () => {
        converter.clearFrames(taskId);
      };

      signal?.addEventListener('abort', this.handleAbortCb as () => void, { once: true });

      converter.addFrame({
        id: taskId,
        frame: imgBlob,
        delay: this.ugoiraMeta.frames[index]['delay'],
        order: index
      });

      if (converter.framesCount(taskId) !== this.ugoiraMeta.frames.length) return;

      return await converter.convert({
        id: taskId,
        format: convertFormat,
        onProgress: setProgress,
        signal
      });
    });
  }

  handleSeasonalEffectFactory(
    convertFormat: ConvertFormat,
    onProgress?: (progress: number) => void
  ) {
    return (this.handleBeforeSaveCb ??= async (
      imgBlob: Blob,
      config: DownloadConfig,
      signal?: AbortSignal
    ): Promise<Blob | void> => {
      signal?.throwIfAborted();

      const effectId = 'pixivGlow2024';
      const url = 'https://source.pixiv.net/special/seasonal-effect-tag/pixiv-glow-2024/effect.png';

      const { taskId } = config;
      const effectData = await historyDb.getImageEffect(effectId);

      if (effectData && !('width' in effectData)) {
        const { data } = effectData;
        const blob = await converter.appendPixivEffect({
          id: taskId,
          format: convertFormat,
          illust: imgBlob,
          seasonalEffect: data,
          onProgress,
          signal
        });

        return blob;
      } else {
        const effctBlob = await new Promise<Blob>((resolve, reject) => {
          GM_xmlhttpRequest({
            url,
            headers: {
              referer: 'https://www.pixiv.net'
            },
            responseType: 'blob',
            onload(e) {
              resolve(e.response);
            },
            onerror: reject,
            ontimeout: () => reject(new Error('Timeout'))
          });
        });

        const blob = await converter.appendPixivEffect({
          id: taskId,
          format: convertFormat,
          illust: imgBlob,
          // seasonalEffect will be transfered to worker
          seasonalEffect: await effctBlob.arrayBuffer(),
          onProgress,
          signal
        });

        historyDb.addImageEffect({
          id: effectId,
          data: await effctBlob.arrayBuffer()
        });

        return blob;
      }
    });
  }

  static supportedTemplate(): string[] {
    return ['{artist}', '{artistID}', '{title}', '{id}', '{page}', '{tags}', '{date}'];
  }

  static createBundle<T extends PixivUgoiraMeta | PixivIllustMeta<string[]>, O extends OptionBase>(
    option: MultiOption<T, O>
  ): DownloadConfig[] {
    const { mediaMeta, filenameTemplate, folderTemplate, setProgress } = option;
    const config = new this(mediaMeta);
    const path = config.getBundleSavePath(folderTemplate, filenameTemplate);
    const filenames = config.getAllSavePaths('', filenameTemplate);

    return filenames.map((_, i) => {
      return {
        headers: config.getHeaders(),
        taskId: config.getTaskId(),
        src: config.getSrc(i),
        path,
        timeout: config.getDownloadTimeout(i),
        onXhrLoaded: setProgress ? config.getMultipleMediaDownloadCB(setProgress) : undefined,
        beforeFileSave: config.handleBundleFactory(filenames),
        onError: config.handleBundleErrorFactory(),
        onAbort: config.handleBundleAbortFactory()
      };
    });
  }

  static createConvert<T extends PixivUgoiraMeta, O extends PixivConvertOption>(
    option: MultiOption<T, O>
  ): DownloadConfig[] {
    const { mediaMeta, filenameTemplate, folderTemplate, setProgress, convertFormat } = option;

    console.log('meta', mediaMeta);
    const config = new this(mediaMeta);
    const path = config.getConvertSavePath(folderTemplate, filenameTemplate, convertFormat);

    return mediaMeta.src.map((src, i) => {
      return {
        headers: config.getHeaders(),
        taskId: config.getTaskId(),
        src,
        path,
        timeout: config.getDownloadTimeout(i),
        onXhrLoaded: setProgress ? config.getMultipleMediaDownloadCB(setProgress) : undefined,
        beforeFileSave: config.handleConvertFactory(convertFormat, setProgress)
      };
    });
  }

  static createSeasonalEffect<
    T extends PixivIllustMeta,
    U extends PixivIllustMeta<string[]>,
    O extends PixivConvertOption
  >(option: SingleOption<T, O> | IndexOption<U, O>): DownloadConfig {
    const { mediaMeta, filenameTemplate, folderTemplate, setProgress, convertFormat } = option;
    const config = new this(mediaMeta);

    let index: number | undefined = undefined;
    if ('index' in option) {
      index = option.index;
    }

    const path = config.getSavePath(folderTemplate, filenameTemplate, index, convertFormat);

    return {
      headers: config.getHeaders(),
      taskId: config.getTaskId(),
      src: config.getSrc(index),
      path: path,
      timeout: config.getDownloadTimeout(index),
      onProgress: setProgress,
      beforeFileSave: config.handleSeasonalEffectFactory(convertFormat, setProgress)
    };
  }
}
