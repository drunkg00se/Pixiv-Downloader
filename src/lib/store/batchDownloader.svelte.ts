import { createPersistedStore } from './storage.svelte';

export type BatchDownloaderState = {
  selectedFilters: string[] | null;
  blacklistTag: string[];
  whitelistTag: string[];
  downloadAllPages: boolean;
  pageStart: number;
  pageEnd: number;
  retryFailed: boolean;
};

const storeStr = localStorage.getItem('pdl-downloader_option');
if (storeStr) localStorage.removeItem('pdl-downloader_option');
const legacyStore: Partial<BatchDownloaderState> = storeStr ? JSON.parse(storeStr) : {};

export const batchDownloaderStore = createPersistedStore<BatchDownloaderState>(
  'pdl-batch-downloader',
  {
    selectedFilters: legacyStore.selectedFilters ?? null,
    blacklistTag: legacyStore.blacklistTag ?? [],
    whitelistTag: legacyStore.whitelistTag ?? [],
    downloadAllPages: legacyStore.downloadAllPages ?? true,
    pageStart: legacyStore.pageStart ?? 1,
    pageEnd: legacyStore.pageEnd ?? 1,
    retryFailed: legacyStore.retryFailed ?? false
  }
);
