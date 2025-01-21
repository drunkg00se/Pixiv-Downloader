import type { MediaMeta } from '@/sites/interface';
import App from './App.svelte';
import {
  defineBatchDownload,
  type BatchDownloadConfig,
  type BatchDownloadDefinition,
  type PageOption
} from './Downloader/useBatchDownload';
import { create_custom_element } from 'svelte/internal/client';

type PdlAppProps = {
  filenameTemplate: string[];
  updated: boolean;
};

export const PdlApp = create_custom_element(
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
  (customElementConstructor) => {
    return class extends customElementConstructor {
      //@ts-expect-error no_unsed_var
      private filenameTemplate: string[];

      //@ts-expect-error no_unsed_var
      private updated: boolean;

      //@ts-expect-error no_unsed_var
      private downloaderConfig?: BatchDownloadConfig<any, any>;

      //@ts-expect-error no_unsed_var
      private useBatchDownload?: BatchDownloadDefinition<any, any>;

      constructor(props: PdlAppProps) {
        super();

        this.filenameTemplate = props.filenameTemplate;

        this.updated = props.updated ?? false;
      }

      initBatchDownloader<T extends MediaMeta, P extends PageOption<T>>(
        config: BatchDownloadConfig<T, P>
      ): BatchDownloadDefinition<T, P> {
        this.downloaderConfig = config;

        return (this.useBatchDownload = defineBatchDownload(config));
      }
    };
  }
);

customElements.define('pdl-app', PdlApp);
