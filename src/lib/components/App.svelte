<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { Modal, getModalStore, initializeStores } from '@skeletonlabs/skeleton';
  import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
  import Changelog from './Modal/Changelog/Changelog.svelte';
  import Config from './Modal/Config/Config.svelte';
  import Downloader from './Downloader/Downloader.svelte';
  import cog from '@/assets/cog.svg?src';
  import { initConfigStore } from './Modal/Config/store';
  import t from '../lang';
  import { addStyleToShadow } from '../util';
  import type { BatchDownloadConfig, BatchDownloadDefinition } from './Downloader/useBatchDownload';
  import type { MediaMeta } from '@/sites/interface';

  export let dark = false;
  export let updated = false;
  export let filenameTemplate: string[] = [];
  export let downloaderConfig: BatchDownloadConfig<MediaMeta> | undefined;
  export let useBatchDownload: BatchDownloadDefinition<MediaMeta> | undefined;

  setContext('filenameTemplate', filenameTemplate);

  initializeStores();
  const store = initConfigStore();
  const modalStore = getModalStore();
  let root: HTMLDivElement;

  const components: Record<string, ModalComponent> = {
    changelog: { ref: Changelog },
    setting: { ref: Config }
  };

  const changelogModal: ModalSettings = {
    type: 'component',
    component: 'changelog'
  };

  const settingModal: ModalSettings = {
    type: 'component',
    component: 'setting'
  };

  export function showChangelog() {
    modalStore.trigger(changelogModal);
  }

  export function showSetting() {
    modalStore.trigger(settingModal);
  }

  onMount(async () => {
    const shadow = root.getRootNode() as ShadowRoot;

    addStyleToShadow(shadow);
    shadow.host.setAttribute('style', 'position:fixed; z-index:99999');

    if (updated) {
      showChangelog();
    }
  });

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

  $: darkMode = dark ? 'dark' : '';
</script>

<svelte:window on:keydown|capture={handleKeydown} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={root}
  on:keydown|stopPropagation
  on:mousedown|capture={preventBackDropClick}
  on:mouseup|capture={preventBackDropClick}
  class="contents {darkMode}"
  data-theme="skeleton"
>
  <Modal {components} class="!p-0" />

  {#if downloaderConfig && useBatchDownload}
    <Downloader {downloaderConfig} {useBatchDownload} />
  {/if}

  {#if $store.showPopupButton}
    <button
      on:click={() => modalStore.trigger(settingModal)}
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
