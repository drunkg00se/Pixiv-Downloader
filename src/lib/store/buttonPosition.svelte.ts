import { legacyConfig } from './legacyConfig';
import { createPersistedStore } from './storage.svelte';

export enum ButtonStyle {
  LEFT_PERCENT = '--pdl-btn-left-percent',
  TOP_PERCENT = '--pdl-btn-top-percent',
  PIXIV_BOOKMARK_LEFT_PERCENT = '--pdl-btn-pixiv-bookmark-left-percent',
  PIXIV_BOOKMARK_TOP_PERCENT = '--pdl-btn-pixiv-bookmark-top-percent',
  LEFT_PX = '--pdl-btn-left-px',
  TOP_PX = '--pdl-btn-top-px',
  PIXIV_BOOKMARK_LEFT_PX = '--pdl-btn-pixiv-bookmark-left-px',
  PIXIV_BOOKMARK_TOP_PX = '--pdl-btn-pixiv-bookmark-top-px'
}

type ButtonPositionState = {
  [k in ButtonStyle]: number;
} & {
  btnLeftUsePx: boolean;
  btnTopUsePx: boolean;
  pixivBtnLeftUsePx: boolean;
  pixivBtnTopUsePx: boolean;
  artworkBtnAlignLeft: boolean;
  artworkBtnAlignTop: boolean;
};

type ButtonPositionProto = {
  setPosition(key: ButtonStyle, value: string): void;
};

export const buttonPosition = createPersistedStore<ButtonPositionState, ButtonPositionProto>(
  'pdl-button-position',
  {
    [ButtonStyle.PIXIV_BOOKMARK_LEFT_PERCENT]: legacyConfig['pdl-btn-self-bookmark-left'] ?? 100,
    [ButtonStyle.PIXIV_BOOKMARK_TOP_PERCENT]: legacyConfig['pdl-btn-self-bookmark-top'] ?? 76,
    [ButtonStyle.LEFT_PERCENT]: legacyConfig['pdl-btn-left'] ?? 0,
    [ButtonStyle.TOP_PERCENT]: legacyConfig['pdl-btn-top'] ?? 100,

    [ButtonStyle.PIXIV_BOOKMARK_LEFT_PX]: 0,
    [ButtonStyle.PIXIV_BOOKMARK_TOP_PX]: 0,
    [ButtonStyle.LEFT_PX]: 0,
    [ButtonStyle.TOP_PX]: 0,

    btnLeftUsePx: false,
    btnTopUsePx: false,
    pixivBtnLeftUsePx: false,
    pixivBtnTopUsePx: false,

    artworkBtnAlignLeft: false,
    artworkBtnAlignTop: true
  },
  {
    setPosition(key: ButtonStyle, value: string) {
      const target = document.documentElement;
      const oldValue = getComputedStyle(target).getPropertyValue(key);
      if (!oldValue || oldValue !== value) {
        target.style.setProperty(key, value);
      }
    }
  }
);

$effect.root(() => {
  const btnPosTypeSelection = [
    [() => buttonPosition.btnLeftUsePx, ButtonStyle.LEFT_PX, ButtonStyle.LEFT_PERCENT],
    [() => buttonPosition.btnTopUsePx, ButtonStyle.TOP_PX, ButtonStyle.TOP_PERCENT],
    [
      () => buttonPosition.pixivBtnLeftUsePx,
      ButtonStyle.PIXIV_BOOKMARK_LEFT_PX,
      ButtonStyle.PIXIV_BOOKMARK_LEFT_PERCENT
    ],
    [
      () => buttonPosition.pixivBtnTopUsePx,
      ButtonStyle.PIXIV_BOOKMARK_TOP_PX,
      ButtonStyle.PIXIV_BOOKMARK_TOP_PERCENT
    ]
  ] as Array<[isUsePxFn: () => boolean, pxKey: ButtonStyle, percentKey: ButtonStyle]>;

  btnPosTypeSelection.forEach(([isUsePxFn, pxKey, percentKey]) => {
    $effect(() => {
      let px: string;
      let percent: string;

      if (isUsePxFn()) {
        px = buttonPosition[pxKey] + 'px';
        percent = '0';
      } else {
        px = '0px';
        percent = String(buttonPosition[percentKey]);
      }

      buttonPosition.setPosition(pxKey, px);
      buttonPosition.setPosition(percentKey, percent);
    });
  });
});
