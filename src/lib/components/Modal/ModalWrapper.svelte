<script lang="ts">
  import { getModalStore } from '@skeletonlabs/skeleton';
  import githubMark from '@/assets/github-mark.svg?src';

  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    parent: { onClose: () => void };
    padding?: string;
    width?: string;
    height?: string;
    class?: string;
  }

  let {
    children,
    parent,
    padding = 'py-6 px-8',
    width = 'w-full md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg',
    height = '',
    class: classProp = ''
  }: Props = $props();

  const classes = $derived(`${padding} ${width} ${height} ${classProp}`);

  const modalStore = getModalStore();
</script>

{#if $modalStore[0]}
  <div data-theme="skeleton" class="relative rounded-container-token shadow-xl bg-scroll {classes}">
    <section class="overflow-hidden h-full">
      {@render children()}
    </section>

    <div class="absolute top-2 right-2 z-1 select-none flex items-center gap-1">
      <a
        target="_blank"
        href="https://github.com/drunkg00se/Pixiv-Downloader"
        class="w-5 fill-current"
      >
        {@html githubMark}
      </a>
      <button
        class="btn-icon btn-icon-sm bg-transparent font-bold hover:text-xl"
        onclick={parent.onClose}>✕</button
      >
    </div>
  </div>
{/if}
