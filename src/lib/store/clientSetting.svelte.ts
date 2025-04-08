import { MediaQuery } from 'svelte/reactivity';
import { createPersistedStore } from './storage.svelte';
import { locale, setlocale, type Locale } from '../i18n.svelte';
import { legacyConfig } from './legacyConfig';

type ClientSettingState = {
  theme: 'light' | 'dark' | 'auto';
  locale: Locale;
  version: string | null;
  showPopupButton: boolean;
};

type ReactiveTheme = {
  current: boolean;
};

type ClientSettingProto = {
  readonly autoTheme: 'light' | 'dark';
  setThemeWatcher(watcher: ReactiveTheme): void;
};

let themeWatcher: ReactiveTheme = new MediaQuery('(prefers-color-scheme: dark)');
let themeVersion = $state(0);

export const clientSetting = createPersistedStore<ClientSettingState, ClientSettingProto>(
  'pdl-client-state',
  {
    theme: 'auto',
    locale: locale.current,
    version: null,
    showPopupButton: legacyConfig.showPopupButton ?? true
  },
  {
    get autoTheme(): 'light' | 'dark' {
      themeVersion;
      return themeWatcher.current ? 'dark' : 'light';
    },

    setThemeWatcher(watcher: ReactiveTheme) {
      themeVersion += 1;
      themeWatcher = watcher;
    }
  }
);

$effect.root(() => {
  $effect(() => setlocale(clientSetting.locale));
});
