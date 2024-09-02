import App from './App.svelte';
import type { BatchDownloadConfig } from './Downloader/useBatchDownload';
// @ts-expect-error no-declaration
import { create_custom_element } from 'svelte/internal';

export type PdlApp = HTMLElement & {
  showChangelog(): void;
  showSetting(): void;
};

interface PdlAppProps {
  updated: boolean;
  downloaderConfig?: BatchDownloadConfig<any, true | undefined>;
}

interface PdlAppConstructor {
  new (props: PdlAppProps): PdlApp;
}

export const PdlApp: PdlAppConstructor = create_custom_element(
  App,
  { dark: { type: 'Boolean' }, updated: { type: 'Boolean' }, downloaderConfig: {} },
  [],
  ['showChangelog', 'showSetting'],
  true,
  (customElementConstructor: any) => {
    return class extends customElementConstructor {
      constructor(props: {
        updated: boolean;
        downloaderConfig?: BatchDownloadConfig<any, true | undefined>;
      }) {
        super();
        this.updated = props.updated ?? false;
        this.downloaderConfig = props.downloaderConfig;
      }
    };
  }
);

customElements.define('pdl-app', PdlApp);
