import { legacyConfig } from './legacyConfig';
import { createPersistedStore } from './storage.svelte';

type ConvertSettingState = {
  /** Mbps */
  mp4Bitrate: number;
  /** Mbps */
  webmBitrate: number;
  gifQuality: number;
  pngColor: number;
  losslessWebp: boolean;
  webpQuality: number;
  webpMehtod: number;
};

export const convertSetting = createPersistedStore<ConvertSettingState>('pdl-convert-setting', {
  mp4Bitrate: legacyConfig.mp4Bitrate ?? 20,
  webmBitrate: legacyConfig.webmBitrate ?? 20,
  gifQuality: legacyConfig.gifQuality ?? 10,
  pngColor: legacyConfig.pngColor ?? 256,
  losslessWebp: legacyConfig.losslessWebp ?? false,
  webpQuality: legacyConfig.webpQuality ?? 95,
  webpMehtod: legacyConfig.webpMehtod ?? 4
});
