<script lang="ts">
  import { userAuthentication, type AuthState } from '@/lib/store/auth.svelte';

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

  const blockClasses = $derived(`${padding} ${margin} ${border} ${bg} ${rounded} ${UlClass}`);

  const enabledAuth = Object.entries(userAuthentication)
    .filter(([_, val]) => val !== null)
    .map(([key, _]) => key);
</script>

<div class={sectionSpace}>
  {#each enabledAuth as key (key)}
    <section>
      <p class={sectionTitle}>{key.toUpperCase()}</p>
      <div class={blockClasses}>
        <div>
          <input
            bind:value={userAuthentication[key as keyof AuthState]}
            type="text"
            class="input"
            name={key}
          />
        </div>
      </div>
    </section>
  {/each}
</div>
