import { LocalStorage } from './storage.svelte';

export type AuthState = {
  cf_clearance: string | null;
  username: string | null;
  apiKey: string | null;
};

class AuthStore extends LocalStorage<AuthState> {
  constructor() {
    super('pdl-auth-state', {
      cf_clearance: null,
      username: null,
      apiKey: null
    });
  }
}

export const userAuthentication = new AuthStore();
