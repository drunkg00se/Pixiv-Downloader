import { config } from '@/lib/config';
import { writable } from 'svelte/store';

const data = config.getAll();
const configStore = writable(data);

configStore.subscribe(config.update);

export default configStore;
