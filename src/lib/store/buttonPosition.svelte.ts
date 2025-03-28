import { LocalStorage } from './storage.svelte';

export enum ButtonStyleVariable {
  LEFT = '--pdl-btn-left',
  TOP = '--pdl-btn-top',
  PIXIV_BOOKMARK_LEFT = '--pdl-btn-self-bookmark-left',
  PIXIV_BOOKMARK_TOP = '--pdl-btn-self-bookmark-top'
}

type ButtonPositionState = {
  [k in ButtonStyleVariable]: number;
};

class ButtonPositionStore extends LocalStorage<ButtonPositionState> {
  constructor() {
    const storeKey = 'pdl-button-position';
    const initial: ButtonPositionState = {
      [ButtonStyleVariable.PIXIV_BOOKMARK_LEFT]: 100,
      [ButtonStyleVariable.PIXIV_BOOKMARK_TOP]: 76,
      [ButtonStyleVariable.LEFT]: 0,
      [ButtonStyleVariable.TOP]: 100
    };

    super(storeKey, initial);

    for (const [key, value] of Object.entries(initial)) {
      this.update(key as ButtonStyleVariable, value);
    }

    // update position when there is no effect tracking;
    window.addEventListener('storage', (e) => {
      if (e.storageArea !== localStorage || e.key !== this.key) return;
      if (this.listeners > 0) return;

      console.log('update position when there is no effect tracking');
      for (const [key, value] of Object.entries(this.value)) {
        this.update(key as ButtonStyleVariable, value);
      }
    });
  }

  public update(key: ButtonStyleVariable, value: number) {
    document.documentElement.style.setProperty(key, String(value));
  }
}

export const buttonPosition = new ButtonPositionStore();
