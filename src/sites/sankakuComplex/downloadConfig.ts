import type { DownloadConfig } from '@/lib/downloader';
import { BooruDownloadConfig, type OptionBase } from '../base/downloadConfig';

export class SankakuDownloadConfig extends BooruDownloadConfig {
  protected getHeaders(): Record<string, string> {
    return {};
  }

  create(option: OptionBase): DownloadConfig {
    return super.create({ ...option, cfClearance: undefined });
  }
}
