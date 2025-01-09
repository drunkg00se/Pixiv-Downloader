import type { MediaMeta } from '@/sites/interface';
import App from './App.svelte';
import {
  defineBatchDownload,
  type BatchDownloadConfig,
  type BatchDownloadDefinition,
  type PageOption
} from './Downloader/useBatchDownload';
// @ts-expect-error no-declaration
import { create_custom_element } from 'svelte/internal';

export type PdlApp = HTMLElement & {
  showChangelog(): void;
  showSetting(): void;
  initBatchDownloader<T extends MediaMeta, P extends PageOption<T>>(
    downloaderConfig: BatchDownloadConfig<T, P>
  ): BatchDownloadDefinition<T, P>;
};

interface PdlAppProps {
  filenameTemplate: string[];
  updated: boolean;
}

interface PdlAppConstructor {
  new (props: PdlAppProps): PdlApp;
}

export const PdlApp: PdlAppConstructor = create_custom_element(
  App,
  {
    dark: { type: 'Boolean' },
    updated: { type: 'Boolean' },
    filenameTemplate: {},
    downloaderConfig: {},
    useBatchDownload: {}
  },
  [],
  ['showChangelog', 'showSetting'],
  true,
  (customElementConstructor: any) => {
    return class extends customElementConstructor {
      constructor(props: PdlAppProps) {
        super();
        this.filenameTemplate = props.filenameTemplate;
        this.updated = props.updated ?? false;
      }

      initBatchDownloader<T extends MediaMeta, P extends PageOption<T>>(
        config: BatchDownloadConfig<T, P>
      ) {
        this.downloaderConfig = config;
        const useBatchDownload = (this.useBatchDownload = defineBatchDownload(config));
        return useBatchDownload;
      }
    };
  }
);

customElements.define('pdl-app', PdlApp);
