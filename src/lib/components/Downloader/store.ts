import { derived, writable, type Writable } from 'svelte/store';

interface StoreData {
  selectedFilters: string[] | null;
  blacklistTag: string[];
  whitelistTag: string[];
  downloadAllPages: boolean;
  pageStart: number;
  pageEnd: number;
  retryFailed: boolean;
}

const defaultData: StoreData = {
  selectedFilters: null,
  blacklistTag: [],
  whitelistTag: [],
  downloadAllPages: true,
  pageStart: 1,
  pageEnd: 1,
  retryFailed: false
};

const STORAGE_KEY = 'pdl-downloader_option';
const saveData = localStorage.getItem(STORAGE_KEY);
const storeData = (saveData ? JSON.parse(saveData) : defaultData) as StoreData;

function storeBuilder<T extends StoreData>(data: T): { [K in keyof T]: Writable<T[K]> } {
  const obj: ReturnType<typeof storeBuilder> = {};

  for (const key in defaultData) {
    if (!(key in data)) {
      // assign new key
      obj[key] = writable(defaultData[key as keyof StoreData]);
    } else {
      obj[key] = writable(data[key as keyof StoreData]);
    }
  }

  return obj;
}

const optionStore = storeBuilder(storeData);

const watchStoreData = derived(Object.values(optionStore), (data) => {
  const obj = {};

  Object.keys(optionStore).forEach((key, idx) => {
    //@ts-expect-error obj
    obj[key] = data[idx];
  });

  return obj;
});

watchStoreData.subscribe((val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
});

export default optionStore;
