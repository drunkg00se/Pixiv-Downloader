<script lang="ts">
  import { ListBox, ListBoxItem, AppBar } from '@skeletonlabs/skeleton';
  import { env } from '@/lib/env';
  import ModalWrapper from '../ModalWrapper.svelte';
  import SaveTo from './Panels/SaveTo.svelte';
  import UgoiraConvert from './Panels/UgoiraConvert.svelte';
  import DownloadHistory from './Panels/DownloadHistory.svelte';
  import BtnPosition from './Panels/BtnPosition.svelte';
  import Others from './Panels/Others.svelte';
  import FeedBack from './Panels/FeedBack.svelte';
  import Auth from './Panels/Auth.svelte';
  import t from '@/lib/lang';

  import menuOpen from '@/assets/menu-open.svg?src';
  import menuClose from '@/assets/menu-close.svg?src';
  import { getContext } from 'svelte';
  import type { Config } from '@/lib/config';

  interface Props {
    parent: { onClose: () => void };
  }

  let { parent }: Props = $props();

  let slected = $state(0);

  let showListbox = $state(true);

  const configStore: Config = getContext('store');

  const optionList = [
    {
      name: t('setting.save_to.title'),
      component: SaveTo
    },
    {
      name: t('setting.ugoira.title'),
      component: UgoiraConvert,
      show: env.isPixiv()
    },
    {
      name: t('setting.history.title'),
      component: DownloadHistory
    },
    {
      name: t('setting.button_position.title'),
      component: BtnPosition
    },
    {
      name: t('setting.others.title'),
      component: Others
    },
    {
      name: t('setting.authorization.title'),
      component: Auth,
      show: !!$configStore.auth
    },
    {
      name: t('setting.feedback.title'),
      component: FeedBack
    }
  ];

  const OptionComponent = $derived(optionList[slected].component);

  const gridCol = $derived(showListbox ? 'grid-cols-[140px_1fr]' : 'grid-cols-[0px_1fr]');

  const transform = $derived(showListbox ? 'translate-x-0' : '-translate-x-full');

  const sidebarWidth = 'w-[140px]';
</script>

<ModalWrapper
  {parent}
  height="h-screen md:h-[600px]"
  width="w-screen md:max-w-screen-md xl:max-w-screen-lg"
  padding=""
>
  <div
    class="h-full pt-4 pb-6 pl-6 grid grid-rows-[auto_1fr] transition-[grid-template-columns] {gridCol}"
  >
    <ListBox
      class="pt-4 pr-6 row-start-1 row-span-2 {sidebarWidth} transition-[transform] {transform}"
    >
      {#each optionList as option, idx}
        {#if !('show' in option) || option.show}
          <ListBoxItem bind:group={slected} name="option" value={idx} class="rounded-token"
            >{option.name}</ListBoxItem
          >
        {/if}
      {/each}
    </ListBox>

    <AppBar
      padding="py-2"
      background="bg-transparent"
      class="mr-6 border-b border-surface-800-100-token"
    >
      {#snippet lead()}
        <button
          type="button"
          class="btn-icon hover:variant-soft-surface ml-1"
          onclick={() => (showListbox = !showListbox)}
        >
          <i class="w-8 fill-current">
            {#if showListbox}
              {@html menuClose}
            {:else}
              {@html menuOpen}
            {/if}
          </i>
        </button>
      {/snippet}
      <h3 class="h3">{optionList[slected].name || '设置'}</h3>
    </AppBar>

    <div
      class="mt-4 pr-4 scrollbar-track-transparent scrollbar-thumb-slate-400/50 scrollbar-corner-transparent scrollbar-thin overflow-y-auto"
      style="scrollbar-gutter: stable"
    >
      <OptionComponent bg="bg-white/30 dark:bg-surface-500/20 backdrop-blur-sm" />
    </div>
  </div>
</ModalWrapper>
