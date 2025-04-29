<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import {
    Modal,
    getModalStore,
    initializeStores,
    Toast,
    getToastStore
  } from '@skeletonlabs/skeleton';
  import { addStyleToShadow } from '../util';
  import Changelog from './Modal/Changelog/Changelog.svelte';
  import Downloader from './Downloader/Downloader.svelte';
  import cog from '@/assets/cog.svg?src';
  import type { ModalComponent, ToastSettings } from '@skeletonlabs/skeleton';
  import type {
    BatchDownloadConfig,
    BatchDownloadDefinition
  } from './Downloader/useBatchDownload.svelte';
  import type { MediaMeta } from '@/sites/base/parser';
  import Config from './Modal/Config/Config.svelte';
  import type { TemplateData } from '@/sites/base/downloadConfig';
  import { t } from '../i18n.svelte';
  import { clientSetting } from '../store/clientSetting.svelte';
  import {
    EVENT_DIR_HANDLE_NOT_FOUND,
    EVENT_FILE_HANDLE_NOT_FOUND,
    EVENT_REQUEST_USER_ACTIVATION,
    type DirHandleNotFoundEventDetail,
    type FileHandleNotFoundEventDetail,
    type RequestUserActivationEventDetail
  } from '../globalEvents';

  interface Props extends Record<string, unknown> {
    supportedTemplate?: Partial<TemplateData>;
    downloaderConfig?: BatchDownloadConfig<MediaMeta<string | string[]>>;
    useBatchDownload?: BatchDownloadDefinition<MediaMeta<string | string[]>>;
  }

  let { supportedTemplate = {}, downloaderConfig, useBatchDownload }: Props = $props();

  setContext('supportedTemplate', supportedTemplate);

  initializeStores();
  const modalStore = getModalStore();
  const toastStore = getToastStore();

  const dark = $derived.by(() => {
    if (clientSetting.theme === 'auto') {
      return clientSetting.autoTheme === 'dark';
    }

    return clientSetting.theme === 'dark';
  });

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

  export function toast(
    settings: Omit<ToastSettings, 'background' | 'classes'> & {
      type?: 'success' | 'warning' | 'error';
    }
  ) {
    let background: string;
    switch (settings.type || 'success') {
      case 'success':
        background = 'variant-filled-primary';
        break;
      case 'warning':
        background = 'variant-filled-warning';
        break;
      case 'error':
        background = 'variant-filled-error';
        break;
      default:
        throw new Error('Unknown toast type.');
    }

    if (settings.type) delete settings.type;
    return toastStore.trigger({ ...settings, background });
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

    if (clientSetting.version !== __VERSION__) {
      clientSetting.version = __VERSION__;
      showChangelog();
    }

    globalThis.addEventListener(EVENT_DIR_HANDLE_NOT_FOUND, (evt) => {
      const customEvent = evt as CustomEvent<DirHandleNotFoundEventDetail>;

      const { getFileHandle, abort } = customEvent.detail;
      let actionIsActive = false;

      toast({
        message: t('toast.message.pick_directory_handle'),
        type: 'warning',
        autohide: false,
        action: {
          label: t('toast.actionLabel.browse'),
          response: () => {
            actionIsActive = true;
            getFileHandle();
          }
        },
        callback({ status }) {
          if (status === 'closed' && !actionIsActive) {
            abort();
          }
        }
      });
    });

    globalThis.addEventListener(EVENT_FILE_HANDLE_NOT_FOUND, (evt) => {
      const customEvent = evt as CustomEvent<FileHandleNotFoundEventDetail>;

      if (useBatchDownload) {
        const { downloading, hasTask } = useBatchDownload();
        const { signal } = customEvent.detail;

        if (signal && downloading.current && hasTask(signal)) {
          return;
        }
      }

      const { getFileHandle, abort } = customEvent.detail;
      let actionIsActive = false;

      toast({
        message: t('toast.message.file_handle_not_found'),
        type: 'warning',
        autohide: false,
        action: {
          label: t('toast.actionLabel.save'),
          response: () => {
            actionIsActive = true;
            getFileHandle();
          }
        },
        callback({ status }) {
          if (status === 'closed' && !actionIsActive) {
            abort();
          }
        }
      });
    });

    globalThis.addEventListener(EVENT_REQUEST_USER_ACTIVATION, (evt) => {
      const customEvent = evt as CustomEvent<RequestUserActivationEventDetail>;
      const { onAction, onClosed } = customEvent.detail;
      let actionIsActive = false;

      toast({
        message: t('toast.message.request_directory_handle_permission'),
        type: 'warning',
        autohide: false,
        action: {
          label: t('toast.actionLabel.allow_permission'),
          response: () => {
            actionIsActive = true;
            onAction();
          }
        },
        callback({ status }) {
          if (status === 'closed' && !actionIsActive) {
            onClosed();
          }
        }
      });
    });
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
  class={{ contents: true, dark }}
>
  <Modal {components} class="!p-0" />

  {#if downloaderConfig && useBatchDownload}
    <Downloader {downloaderConfig} {useBatchDownload} />
  {/if}

  {#if clientSetting.showPopupButton}
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

  <Toast />
</div>
