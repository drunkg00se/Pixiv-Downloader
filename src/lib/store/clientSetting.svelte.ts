import { MediaQuery } from 'svelte/reactivity';
import { LocalStorage } from './storage.svelte';

type ClientSettingState = {
  theme: 'light' | 'dark' | 'auto';
  // locale: string;
  version: string | null;
  showPopupButton: boolean;
};

type ReactiveTheme = {
  current: boolean;
};

class ClientSettingStore extends LocalStorage<ClientSettingState> {
  #themeWatcher: ReactiveTheme = new MediaQuery('(prefers-color-scheme: dark)');
  #themeVersion = $state(0);

  constructor() {
    super('pdl-client-state', {
      theme: 'auto',
      // locale: 'en',
      version: null,
      showPopupButton: true
    });
  }

  get autoTheme(): 'light' | 'dark' {
    this.#themeVersion;
    return this.#themeWatcher.current ? 'dark' : 'light';
  }

  setThemeWatcher(watcher: ReactiveTheme) {
    this.#themeVersion += 1;
    this.#themeWatcher = watcher;
  }
}

export const clientSetting = new ClientSettingStore();
