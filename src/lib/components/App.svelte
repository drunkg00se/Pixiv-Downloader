<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { Modal, getModalStore, initializeStores } from '@skeletonlabs/skeleton';
  import { addStyleToShadow } from '../util';
  import Changelog from './Modal/Changelog/Changelog.svelte';
  import Downloader from './Downloader/Downloader.svelte';
  import cog from '@/assets/cog.svg?src';
  import type { ModalComponent } from '@skeletonlabs/skeleton';
  import type { BatchDownloadConfig, BatchDownloadDefinition } from './Downloader/useBatchDownload';
  import type { MediaMeta } from '@/sites/base/parser';
  import Config from './Modal/Config/Config.svelte';
  import type { TemplateData } from '@/sites/base/downloadConfig';
  import { t } from '../i18n.svelte';
  import { clientSetting } from '../store/clientSetting.svelte';

  interface Props extends Record<string, unknown> {
    dark?: boolean;
    supportedTemplate?: Partial<TemplateData>;
    downloaderConfig?: BatchDownloadConfig<MediaMeta<string | string[]>>;
    useBatchDownload?: BatchDownloadDefinition<MediaMeta<string | string[]>>;
  }

  let {
    dark = false,
    supportedTemplate = {},
    downloaderConfig,
    useBatchDownload
  }: Props = $props();

  setContext('supportedTemplate', supportedTemplate);

  initializeStores();
  const modalStore = getModalStore();

  let root: HTMLDivElement;

  const components: Record<string, ModalComponent> = {
    changelog: { ref: Changelog },
    setting: { ref: Config }
  };

  export function showChangelog() {
    modalStore.trigger({
      type: 'component',
      component: 'changelog'
    });
  }

  export function showSetting() {
    modalStore.trigger({
      type: 'component',
      component: 'setting'
    });
  }

  /** disable the backdrop's click */
  function preventBackDropClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const classList = event.target.classList;
    if (classList.contains('modal-backdrop') || classList.contains('modal-transition')) {
      event.stopPropagation();
    }
  }

  function modalExist(): boolean {
    return !!root?.querySelector('.modal-backdrop');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!modalExist()) return;

    // closeModal
    if (event.code === 'Escape') {
      modalStore.close();
      return;
    } else if (event.ctrlKey || event.shiftKey) {
      return;
    }

    // stopWebSitePropagation
    if (!event.composedPath().includes(root)) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  onMount(() => {
    const shadow = root.getRootNode() as ShadowRoot;

    addStyleToShadow(shadow);
    shadow.host.setAttribute('style', 'position:fixed; z-index:99999');

    if (clientSetting.current.version !== __VERSION__) {
      clientSetting.current.version = __VERSION__;
      showChangelog();
    }
  });
</script>

<svelte:window onkeydowncapture={handleKeydown} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={root}
  onkeydown={(e) => e.stopImmediatePropagation()}
  onmousedowncapture={preventBackDropClick}
  onmouseupcapture={preventBackDropClick}
  data-theme="skeleton"
  class="contents"
  class:dark
>
  <Modal {components} class="!p-0" />

  {#if downloaderConfig && useBatchDownload}
    <Downloader {downloaderConfig} {useBatchDownload} />
  {/if}

  {#if clientSetting.current.showPopupButton}
    <button
      onclick={showSetting}
      type="button"
      class="btn btn-sm variant-filled fixed bottom-24 rounded-none rounded-s-full opacity-40 hover:opacity-100 right-0 translate-x-[calc(100%-44px)] hover:translate-x-0 delay-100"
    >
      <i class=" text-sm w-6 fill-current">
        {@html cog}
      </i>
      <span class="text-sm">{t('button.setting')}</span>
    </button>
  {/if}
</div>
