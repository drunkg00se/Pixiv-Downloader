import { GM_info, unsafeWindow } from '$';

export const env = {
  isFirefox() {
    return navigator.userAgent.includes('Firefox');
  },

  isViolentmonkey() {
    return GM_info.scriptHandler === 'Violentmonkey';
  },

  isTampermonkey() {
    return GM_info.scriptHandler === 'Tampermonkey';
  },

  isBlobDlAvaliable() {
    return (
      !this.isFirefox() ||
      (this.isFirefox() && this.isTampermonkey() && parseFloat(GM_info.version ?? '') < 4.18)
    );
  },

  // firefox使用tampermonkey，downloadmod为默认时也支持子目录，但GM_info显示为原生的“native”，而“原生”不支持子目录
  isSupportSubpath() {
    return this.isBrowserDownloadMode();
  },

  isBrowserDownloadMode() {
    return GM_info.downloadMode === 'browser';
  },

  isConflictActionEnable() {
    return (
      this.isTampermonkey() &&
      parseFloat(GM_info.version ?? '') >= 4.18 &&
      this.isBrowserDownloadMode()
    );
  },

  isConflictActionPromptEnable() {
    return !this.isFirefox() && this.isConflictActionEnable();
  },

  isFileSystemAccessAvaliable() {
    return (
      typeof unsafeWindow.showDirectoryPicker === 'function' &&
      typeof unsafeWindow.showSaveFilePicker === 'function'
    );
  },

  videoFrameSupported() {
    return typeof unsafeWindow.VideoFrame === 'function';
  },

  isPixiv() {
    return location.hostname === 'www.pixiv.net';
  },

  isYande() {
    return location.hostname === 'yande.re';
  },

  isRule34() {
    return location.hostname === 'rule34.xxx';
  }
};
