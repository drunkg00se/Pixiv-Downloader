import { config, type ConfigData } from '@/lib/config';
import { writable, type Writable } from 'svelte/store';

const configStore: Writable<ConfigData> = writable();

export default configStore;

// initialize stores later in `App.svelte` so we have chance to
// modify default config in `siteInject`.
export function initConfigStore() {
  const data = config.getAll();
  configStore.set(data);
  configStore.subscribe(config.update);
  return configStore;
}
