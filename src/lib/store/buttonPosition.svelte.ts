import { legacyConfig } from './legacyConfig';
import { createPersistedStore } from './storage.svelte';

export enum ButtonStyleVariable {
  LEFT = '--pdl-btn-left',
  TOP = '--pdl-btn-top',
  PIXIV_BOOKMARK_LEFT = '--pdl-btn-self-bookmark-left',
  PIXIV_BOOKMARK_TOP = '--pdl-btn-self-bookmark-top'
}

type ButtonPositionState = {
  [k in ButtonStyleVariable]: number;
};

export const buttonPosition = createPersistedStore<ButtonPositionState>('pdl-button-position', {
  [ButtonStyleVariable.PIXIV_BOOKMARK_LEFT]: legacyConfig['pdl-btn-self-bookmark-left'] ?? 100,
  [ButtonStyleVariable.PIXIV_BOOKMARK_TOP]: legacyConfig['pdl-btn-self-bookmark-top'] ?? 76,
  [ButtonStyleVariable.LEFT]: legacyConfig['pdl-btn-left'] ?? 0,
  [ButtonStyleVariable.TOP]: legacyConfig['pdl-btn-top'] ?? 100
});

$effect.root(() => {
  $effect(() => {
    const target = document.documentElement;
    for (const [key, value] of Object.entries(buttonPosition)) {
      const oldValue = getComputedStyle(target).getPropertyValue(key);
      if (!oldValue || +oldValue !== value) {
        document.documentElement.style.setProperty(key, String(value));
      }
    }
  });
});
