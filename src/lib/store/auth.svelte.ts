import { legacyConfig } from './legacyConfig';
import { createPersistedStore } from './storage.svelte';

export type AuthState = {
  cf_clearance: string | null;
  username: string | null;
  apiKey: string | null;
};

export const userAuthentication = createPersistedStore<AuthState>('pdl-auth-state', {
  cf_clearance: legacyConfig.auth?.cf_clearance ?? null,
  username: legacyConfig.auth?.username ?? null,
  apiKey: legacyConfig.auth?.apiKey ?? null
});
