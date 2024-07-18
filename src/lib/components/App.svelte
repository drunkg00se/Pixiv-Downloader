<script lang="ts">
  import { onMount } from 'svelte';
  import { Modal, getModalStore, initializeStores } from '@skeletonlabs/skeleton';
  import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
  import Changelog from './Modal/Changelog/Changelog.svelte';
  import Config from './Modal/Config/Config.svelte';
  import cog from '@/assets/cog.svg?src';
  import store from './Modal/Config/store';
  import t from '../lang';

  initializeStores();

  const modalStore = getModalStore();

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

  export let dark = false;

  export let updated = false;

  export function showChangelog() {
    modalStore.trigger(changelogModal);
  }

  export function showSetting() {
    modalStore.trigger(settingModal);
  }

  let root: HTMLDivElement;
  onMount(async () => {
    const shadow = root.getRootNode() as ShadowRoot;

    // Inject css
    if (import.meta.env.DEV) {
      const modalStyle = (await import('./app.tailwind.css?inline')).default;
      const style = new CSSStyleSheet();
      style.replaceSync(modalStyle);
      shadow.adoptedStyleSheets = [style];
    } else {
      shadow.adoptedStyleSheets = [(window as any)._pdlShadowStyle];
    }

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

    // stopWebSitPropagation
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

<!-- DEV SERVER时注释style -->
<style>
  @import './app.tailwind.css';
</style>
