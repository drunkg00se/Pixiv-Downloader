import App from './App.svelte';
import { defineBatchDownload, type BatchDownloadConfig } from './Downloader/useBatchDownload';
// @ts-expect-error no-declaration
import { create_custom_element } from 'svelte/internal';

export type PdlApp = HTMLElement & {
  showChangelog(): void;
  showSetting(): void;
};

interface PdlAppProps {
  filenameTemplate: string[];
  updated: boolean;
  downloaderConfig?: BatchDownloadConfig<any>;
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
    downloaderConfig: {}
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
        this.downloaderConfig = props.downloaderConfig;
        props.downloaderConfig && defineBatchDownload(props.downloaderConfig);
      }
    };
  }
);

customElements.define('pdl-app', PdlApp);
