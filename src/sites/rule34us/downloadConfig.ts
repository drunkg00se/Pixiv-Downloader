import { BooruDownloadConfig, SupportedTemplate, type TemplateData } from '../base/downloadConfig';

export class Rule34UsDownloadConfig extends BooruDownloadConfig {
  static get supportedTemplate(): Partial<TemplateData> {
    return {
      [SupportedTemplate.ID]: '{id}',
      [SupportedTemplate.ARTIST]: '{artist}',
      [SupportedTemplate.CHARACTER]: '{character}',
      [SupportedTemplate.MD5]: '{md5}',
      [SupportedTemplate.SCORE]: '{score}'
    };
  }

  protected getTemplateData(): Partial<TemplateData> {
    return {
      id: this.id,
      artist: this.artist,
      character: this.character,
      md5: this.title,
      title: this.title,
      score: String(this.score)
    };
  }
}
