import type { NijieMeta } from './parser';
import { MediaDownloadConfig } from '../base/downloadConfigBuilder';

export class NijieDownloadConfig extends MediaDownloadConfig {
  protected userId: string;

  constructor(meta: NijieMeta<string | string[]>) {
    super(meta);
    this.userId = meta.userId;
  }

  static supportedTemplate() {
    return ['{artist}', '{artistID}', '{title}', '{id}', '{page}', '{tags}', '{date}'];
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
}
