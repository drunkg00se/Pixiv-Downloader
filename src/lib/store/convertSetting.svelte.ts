import { LocalStorage } from './storage.svelte';

interface ConvertSettingState {
  /** Mbps */
  mp4Bitrate: number;
  /** Mbps */
  webmBitrate: number;
  gifQuality: number;
  pngColor: number;
  losslessWebp: boolean;
  webpQuality: number;
  webpMehtod: number;
}

class ConvertSettingStore extends LocalStorage<ConvertSettingState> {
  constructor() {
    super('pdl-convert-setting', {
      mp4Bitrate: 20,
      webmBitrate: 20,
      gifQuality: 10,
      pngColor: 256,
      losslessWebp: false,
      webpQuality: 95,
      webpMehtod: 4
    });
  }
}

export const convertSetting = new ConvertSettingStore();
