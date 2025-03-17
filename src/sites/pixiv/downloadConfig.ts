import type { PixivMeta } from './parser';
import { type DownloadConfig } from '@/lib/downloader';
import {
  MayBeMultiIllustsConfig,
  SupportedTemplate,
  type OptionBase,
  type TemplateData
} from '@/sites/base/downloadConfig';
import { IllustType, type UgoiraMeta } from './types';
import { type ConvertFormat, converter } from '@/lib/converter';
import { GM_xmlhttpRequest } from '$';
import { historyDb } from '@/lib/db';

interface PixivOptionBase extends OptionBase {
  useTranslatedTags: boolean;
}

interface PixivIndexOption extends PixivOptionBase {
  index: number;
}

interface PixivConvertOption extends PixivOptionBase {
  convertFormat: ConvertFormat;
}

export class PixivDownloadConfig extends MayBeMultiIllustsConfig {
  protected ugoiraMeta: UgoiraMeta | undefined;
  protected illustType: IllustType;
  protected userId: string;
  protected comment: string;
  protected translatedTags: string[];

  constructor(mediaMeta: PixivMeta) {
    super(mediaMeta);

    this.ugoiraMeta = 'ugoiraMeta' in mediaMeta ? mediaMeta.ugoiraMeta : undefined;
    this.illustType = mediaMeta.illustType;
    this.userId = mediaMeta.userId;
    this.comment = mediaMeta.comment;
    this.translatedTags = mediaMeta.tagsTranslated;
  }

  static supportedTemplate(): string[] {
    return ['{artist}', '{artistID}', '{title}', '{id}', '{page}', '{tags}', '{date}'];
  }

  getHeaders() {
    return {
      referer: 'https://www.pixiv.net'
    };
  }

  protected getZipComment(): string | undefined {
    if (!this.ugoiraMeta) return this.comment;

    const delays = this.ugoiraMeta.frames.map(({ delay }) => delay);

    return this.comment + '\n' + JSON.stringify(delays);
  }

  protected renderTemplate(template: string, data: Partial<TemplateData>): string {
    return this.replaceTemplate(template, {
      id: this.id,
      artist: this.normalizeString(this.artist) || this.userId,
      artistID: this.userId,
      date: this.createDate,
      title: this.normalizeString(this.title) || this.id,
      tags: this.tags
        .map((tag) => this.normalizeString(tag))
        .filter(Boolean)
        .join('_'),
      ...data
    });
  }

  protected getSavePath(
    folderTemplate: string,
    filenameTemplate: string,
    ext?: string,
    useTranslatedTags = false,
    index = 0
  ): string {
    const templateData: Partial<TemplateData> = {
      page: String(index)
    };

    useTranslatedTags &&
      (templateData.tags = this.translatedTags
        .map((tag) => this.normalizeString(tag))
        .filter(Boolean)
        .join('_'));

    const path = this.renderTemplate(
      this.getPathTemplate(folderTemplate, filenameTemplate),
      templateData
    );

    return `${path}.${ext || (Array.isArray(this.ext) ? this.ext[index] : this.ext)}`;
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

  create(option: PixivOptionBase | PixivIndexOption): DownloadConfig {
    const { filenameTemplate, folderTemplate, setProgress, useTranslatedTags } = option;
    const index = 'index' in option ? option.index : undefined;
    const headers = this.getHeaders();

    return {
      headers,
      taskId: this.getTaskId(),
      src: this.getSrc(index),
      path: this.getSavePath(folderTemplate, filenameTemplate, undefined, useTranslatedTags, index),
      timeout: this.getDownloadTimeout(index),
      onProgress: setProgress
    };
  }

  createMulti(option: PixivOptionBase): DownloadConfig[] {
    if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);

    const { filenameTemplate, folderTemplate, setProgress, useTranslatedTags } = option;
    const taskId = this.getTaskId();
    const headers = this.getHeaders();

    const onFileSaved = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;

    return this.src.map((src, i) => {
      return {
        headers,
        taskId,
        src,
        path: this.getSavePath(folderTemplate, filenameTemplate, undefined, useTranslatedTags, i),
        timeout: this.getDownloadTimeout(),
        onFileSaved
      };
    });
  }

  createBundle(option: PixivOptionBase): DownloadConfig[] {
    if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);

    const { filenameTemplate, folderTemplate, setProgress, useTranslatedTags } = option;

    const taskId = this.getTaskId();
    const headers = this.getHeaders();

    const onXhrLoaded = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;

    const path = this.getSavePath(
      folderTemplate,
      filenameTemplate,
      'zip',
      useTranslatedTags,
      this.src.length
    );

    // always add {page} when bundling
    const filenameTemplateWithPage = filenameTemplate.includes(`{${SupportedTemplate.PAGE}}`)
      ? filenameTemplate
      : filenameTemplate + `_{${SupportedTemplate.PAGE}}`;

    const filenames = this.src.map((_, i) => {
      return this.getSavePath('', filenameTemplateWithPage, undefined, useTranslatedTags, i);
    });

    return this.src.map((src, i) => {
      return {
        headers,
        taskId,
        src,
        path,
        timeout: this.getDownloadTimeout(i),
        onXhrLoaded,
        beforeFileSave: this.handleBundleFactory(filenames),
        onError: this.handleBundleErrorFactory(),
        onAbort: this.handleBundleAbortFactory()
      };
    });
  }

  createConvert(option: PixivConvertOption): DownloadConfig[] {
    if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);

    const { filenameTemplate, folderTemplate, setProgress, convertFormat, useTranslatedTags } =
      option;

    const taskId = this.getTaskId();
    const headers = this.getHeaders();
    const onXhrLoaded = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;
    const beforeFileSave = this.handleConvertFactory(convertFormat, setProgress);

    const path = this.getSavePath(
      folderTemplate,
      filenameTemplate,
      convertFormat,
      useTranslatedTags
    );

    return this.src.map((src, i) => {
      return {
        headers,
        taskId,
        src,
        path,
        timeout: this.getDownloadTimeout(i),
        onXhrLoaded,
        beforeFileSave
      };
    });
  }

  createSeasonalEffect(
    option: PixivConvertOption | (PixivConvertOption & { index: number })
  ): DownloadConfig {
    const { filenameTemplate, folderTemplate, setProgress, convertFormat, useTranslatedTags } =
      option;

    const index: number | undefined = 'index' in option ? option.index : undefined;

    const path = this.getSavePath(
      folderTemplate,
      filenameTemplate,
      convertFormat,
      useTranslatedTags,
      index
    );

    return {
      headers: this.getHeaders(),
      taskId: this.getTaskId(),
      src: this.getSrc(index),
      path,
      timeout: this.getDownloadTimeout(index),
      onProgress: setProgress,
      beforeFileSave: this.handleSeasonalEffectFactory(convertFormat, setProgress)
    };
  }
}
