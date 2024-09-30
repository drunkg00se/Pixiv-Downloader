<script lang="ts">
  import { type SvelteComponent } from 'svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import githubMark from '@/assets/github-mark.svg?src';

  export let parent: SvelteComponent;
  export let padding = 'py-6 px-8';
  export let width = 'w-full md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg';
  export let height = '';

  $: classes = `${padding} ${width} ${height} ${$$props.class ?? ''}`;

  const modalStore = getModalStore();
</script>

{#if $modalStore[0]}
  <div data-theme="skeleton" class="relative rounded-container-token shadow-xl bg-scroll {classes}">
    <section class="overflow-hidden h-full">
      <slot></slot>
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
        on:click={parent.onClose}>✕</button
      >
    </div>
  </div>
{/if}
