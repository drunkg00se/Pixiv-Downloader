import { LocalStorage } from './storage.svelte';

type ClientSettingState = {
  // theme: 'light' | 'dark' | 'auto';
  // locale: string;
  version: string | null;
  showPopupButton: boolean;
};

class ClientSettingStore extends LocalStorage<ClientSettingState> {
  constructor() {
    super('pdl-client-state', {
      // theme: 'auto',
      // locale: 'en',
      version: null,
      showPopupButton: true
    });
  }
}

export const clientSetting = new ClientSettingStore();
