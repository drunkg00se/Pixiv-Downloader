import type { MediaMeta } from '@/sites/base/parser';
import App from './App.svelte';
import {
  defineBatchDownload,
  type BatchDownloadConfig,
  type BatchDownloadDefinition,
  type PageOption
} from './Downloader/useBatchDownload';
import { create_custom_element } from 'svelte/internal/client';
import type { TemplateData } from '@/sites/base/downloadConfig';

type PdlAppProps = {
  supportedTemplate: Partial<TemplateData>;
};

export const PdlApp = create_custom_element(
  App,
  {
    dark: { type: 'Boolean' },
    config: {},
    supportedTemplate: {},
    downloaderConfig: {},
    useBatchDownload: {}
  },
  [],
  ['showChangelog', 'showSetting'],
  true,
  (customElementConstructor) => {
    return class extends customElementConstructor {
      //@ts-expect-error no_unsed_var
      private supportedTemplate: Partial<TemplateData>;

      //@ts-expect-error no_unsed_var
      private downloaderConfig?: BatchDownloadConfig<any, any>;

      //@ts-expect-error no_unsed_var
      private useBatchDownload?: BatchDownloadDefinition<any, any>;

      constructor(props: PdlAppProps) {
        super();

        this.supportedTemplate = props.supportedTemplate;
      }

      initBatchDownloader<T extends MediaMeta<string | string[]>, P extends PageOption<T>>(
        config: BatchDownloadConfig<T, P>
      ): BatchDownloadDefinition<T, P> {
        this.downloaderConfig = config;

        return (this.useBatchDownload = defineBatchDownload(config));
      }
    };
  }
);

customElements.define('pdl-app', PdlApp);
