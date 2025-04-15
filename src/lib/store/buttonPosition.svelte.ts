import { legacyConfig } from './legacyConfig';
import { createPersistedStore } from './storage.svelte';

export const enum ButtonStyle {
  LEFT_PERCENT = '--pdl-btn-left-percent',
  TOP_PERCENT = '--pdl-btn-top-percent',
  PIXIV_BOOKMARK_LEFT_PERCENT = '--pdl-btn-pixiv-bookmark-left-percent',
  PIXIV_BOOKMARK_TOP_PERCENT = '--pdl-btn-pixiv-bookmark-top-percent',
  LEFT_PX = '--pdl-btn-left-px',
  TOP_PX = '--pdl-btn-top-px',
  PIXIV_BOOKMARK_LEFT_PX = '--pdl-btn-pixiv-bookmark-left-px',
  PIXIV_BOOKMARK_TOP_PX = '--pdl-btn-pixiv-bookmark-top-px'
}

export enum BtnLengthUnit {
  PERCENT,
  PX
}

export const enum BtnAlignX {
  LEFT,
  RIGHT
}

export const enum BtnAlignY {
  TOP,
  BOTTOM
}

type ButtonPositionState = {
  [k in ButtonStyle]: number;
} & {
  thumbnailBtnUnitX: BtnLengthUnit;
  thumbnailBtnUnitY: BtnLengthUnit;
  pixivBookmarkBtnUnitX: BtnLengthUnit;
  pixivBookmarkBtnUnitY: BtnLengthUnit;
  artworkBtnAlignX: BtnAlignX;
  artworkBtnAlignY: BtnAlignY;
};

type ButtonPositionProto = {
  setPosition(key: ButtonStyle, value: string): void;
};

export const buttonPosition = createPersistedStore<ButtonPositionState, ButtonPositionProto>(
  'pdl-button-position',
  {
    [ButtonStyle.LEFT_PERCENT]: legacyConfig['pdl-btn-left'] ?? 0,
    [ButtonStyle.LEFT_PX]: 0,
    [ButtonStyle.TOP_PERCENT]: legacyConfig['pdl-btn-top'] ?? 100,
    [ButtonStyle.TOP_PX]: 0,

    [ButtonStyle.PIXIV_BOOKMARK_LEFT_PERCENT]: legacyConfig['pdl-btn-self-bookmark-left'] ?? 100,
    [ButtonStyle.PIXIV_BOOKMARK_LEFT_PX]: 0,
    [ButtonStyle.PIXIV_BOOKMARK_TOP_PERCENT]: legacyConfig['pdl-btn-self-bookmark-top'] ?? 76,
    [ButtonStyle.PIXIV_BOOKMARK_TOP_PX]: 0,

    thumbnailBtnUnitX: BtnLengthUnit.PERCENT,
    thumbnailBtnUnitY: BtnLengthUnit.PERCENT,

    pixivBookmarkBtnUnitX: BtnLengthUnit.PERCENT,
    pixivBookmarkBtnUnitY: BtnLengthUnit.PERCENT,

    artworkBtnAlignX: BtnAlignX.RIGHT,
    artworkBtnAlignY: BtnAlignY.TOP
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
    [() => buttonPosition.thumbnailBtnUnitX, ButtonStyle.LEFT_PX, ButtonStyle.LEFT_PERCENT],
    [() => buttonPosition.thumbnailBtnUnitY, ButtonStyle.TOP_PX, ButtonStyle.TOP_PERCENT],
    [
      () => buttonPosition.pixivBookmarkBtnUnitX,
      ButtonStyle.PIXIV_BOOKMARK_LEFT_PX,
      ButtonStyle.PIXIV_BOOKMARK_LEFT_PERCENT
    ],
    [
      () => buttonPosition.pixivBookmarkBtnUnitY,
      ButtonStyle.PIXIV_BOOKMARK_TOP_PX,
      ButtonStyle.PIXIV_BOOKMARK_TOP_PERCENT
    ]
  ] as Array<[getUnit: () => BtnLengthUnit, pxKey: ButtonStyle, percentKey: ButtonStyle]>;

  btnPosTypeSelection.forEach(([getUnit, pxKey, percentKey]) => {
    $effect(() => {
      let px: string;
      let percent: string;

      if (getUnit() === BtnLengthUnit.PX) {
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
