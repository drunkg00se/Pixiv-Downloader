<script lang="ts">
  import type { Config } from '@/lib/config';
  import { getContext } from 'svelte';

  let {
    bg = 'bg-white/30 dark:bg-black/15',
    border = 'divide-y-[1px] *:border-surface-300-600-token',
    padding = 'px-4 *:py-4',
    margin = 'mt-2 *:!m-0',
    rounded = 'rounded-container-token *:!rounded-none',
    sectionSpace = `space-y-4`,
    sectionTitle = 'font-bold',
    class: UlClass = ''
  } = $props();

  const store: Config = getContext('store');

  const blockClasses = $derived(`${padding} ${margin} ${border} ${bg} ${rounded} ${UlClass}`);
</script>

<div class={sectionSpace}>
  {#if $store.auth}
    {#each Object.keys($store.auth) as key (key)}
      <section>
        <p class={sectionTitle}>{key.toUpperCase()}</p>
        <div class={blockClasses}>
          <div>
            <input bind:value={$store.auth[key]} type="text" class="input" name="key" />
          </div>
        </div>
      </section>
    {/each}
  {/if}
</div>
