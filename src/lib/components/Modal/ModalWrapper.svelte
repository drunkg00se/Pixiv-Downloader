<script lang="ts">
  import { type SvelteComponent } from 'svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';

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
    <button
      class="absolute top-2 right-2 z-1 btn-icon btn-icon-sm select-none bg-transparent font-bold hover:text-xl"
      on:click={parent.onClose}>✕</button
    >
  </div>
{/if}
