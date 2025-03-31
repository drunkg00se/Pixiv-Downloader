import { legacyConfig } from './legacyConfig';
import { LocalStorage } from './storage.svelte';

export type AuthState = {
  cf_clearance: string | null;
  username: string | null;
  apiKey: string | null;
};

class AuthStore extends LocalStorage<AuthState> {
  constructor() {
    super('pdl-auth-state', {
      cf_clearance: legacyConfig.auth?.cf_clearance ?? null,
      username: legacyConfig.auth?.username ?? null,
      apiKey: legacyConfig.auth?.apiKey ?? null
    });
  }
}

export const userAuthentication = new AuthStore();
