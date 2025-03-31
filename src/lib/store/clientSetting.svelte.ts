import { MediaQuery } from 'svelte/reactivity';
import { LocalStorage } from './storage.svelte';
import { locale, setlocale, type Locale } from '../i18n.svelte';

type ClientSettingState = {
  theme: 'light' | 'dark' | 'auto';
  locale: Locale;
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
      locale: locale.current,
      version: null,
      showPopupButton: true
    });

    this.subscribe((state) => {
      setlocale(state.locale);
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
