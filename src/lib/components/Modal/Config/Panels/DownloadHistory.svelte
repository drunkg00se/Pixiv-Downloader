<script lang="ts">
  import { historyDb } from '@/lib/db';
  import { FileButton, ProgressRadial } from '@skeletonlabs/skeleton';
  import t from '@/lib/lang';
  import { useHistoryBackup } from '../useHistoryBackup';
  import configStore from '../store';
  import { HistoryBackupInterval } from '@/lib/config';
  import { logger } from '@/lib/logger';
  import { writable } from 'svelte/store';

  export let bg = 'bg-white/30 dark:bg-black/15';
  export let border = 'divide-y-[1px] *:border-surface-300-600-token';
  export let padding = 'px-4 *:py-4';
  export let margin = 'mt-2 *:!m-0';
  export let rounded = 'rounded-container-token *:!rounded-none';
  export let inputRounded = 'rounded-full';
  export let inputWidth = 'w-32';

  $: ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ''}`;
  $: inputClasses = `${inputWidth} ${inputRounded} shrink-0`;

  export let sectionSpace = `space-y-4`;
  export let sectionTitle = 'font-bold';

  function usePendingButton<T extends (...args: any[]) => any>(fn: T) {
    const store = writable(false);
    const wrapFn = async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      store.set(true);
      const result = await fn(...args);
      store.set(false);
      return result;
    };

    return {
      store,
      wrapFn
    };
  }

  async function importFromJSON(evt: Event) {
    const file = (evt.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      await importJSON(file);
    } catch (error) {
      logger.error(error);
      alert(error);
    }
  }

  function clearDb() {
    const isConfirm = confirm(t('setting.history.text.confirm_clear_history'));
    if (!isConfirm) return;
    return historyDb.clear();
  }

  const { importJSON, exportAsJSON, exportAsCSV } = useHistoryBackup();

  const { store: importPending, wrapFn: wrapImportFromJSON } = usePendingButton(importFromJSON);
  const { store: clearPending, wrapFn: wrapClearDb } = usePendingButton(clearDb);
  const { store: exportJsonPending, wrapFn: wrapExportAsJSON } = usePendingButton(exportAsJSON);
  const { store: exportCsvPending, wrapFn: wrapExportAsCSV } = usePendingButton(exportAsCSV);
</script>

<div class={sectionSpace}>
  <section>
    <p class={sectionTitle}>{t('setting.history.label.scheduled_backups')}</p>
    <ul class={ulClasses}>
      <li>
        <p class="flex-auto">{t('setting.history.options.scheduled_backups')}</p>
        <select class="select {inputClasses}" bind:value={$configStore.historyBackupInterval}>
          <option value={HistoryBackupInterval.NEVER}
            >{t('setting.history.select.backup_interval_never')}</option
          >
          <option value={HistoryBackupInterval.EVERY_DAY}
            >{t('setting.history.select.backup_interval_every_day')}</option
          >
          <option value={HistoryBackupInterval.EVERY_7_DAY}
            >{t('setting.history.select.backup_interval_every_7_day')}</option
          >
          <option value={HistoryBackupInterval.EVERY_30_DAY}
            >{t('setting.history.select.backup_interval_every_30_day')}</option
          >
        </select>
      </li>
    </ul>
  </section>

  <section>
    <p class={sectionTitle}>{t('setting.history.label.export')}</p>
    <ul class={ulClasses}>
      <li>
        <p class="flex-auto">{t('setting.history.options.export_as_json')}</p>
        <button
          disabled={$exportJsonPending}
          class="btn variant-filled"
          on:click={wrapExportAsJSON}
        >
          {#if $exportJsonPending}
            <ProgressRadial
              stroke={80}
              width="w-5"
              meter="stroke-primary-500"
              track="stroke-primary-500/30"
            />
          {/if}
          <span>
            {t('setting.history.button.export')}
          </span>
        </button>
      </li>
      <li>
        <p class="flex-auto">{t('setting.history.options.export_as_csv')}</p>
        <button disabled={$exportCsvPending} class="btn variant-filled" on:click={wrapExportAsCSV}>
          {#if $exportCsvPending}
            <ProgressRadial
              stroke={80}
              width="w-5"
              meter="stroke-primary-500"
              track="stroke-primary-500/30"
            />
          {/if}
          <span>
            {t('setting.history.button.export')}
          </span>
        </button>
      </li>
    </ul>
  </section>

  <section>
    <p class={sectionTitle}>{t('setting.history.label.import')}</p>
    <ul class={ulClasses}>
      <li>
        <p class="flex-auto">{t('setting.history.options.import_json')}</p>
        <FileButton
          bind:disabled={$importPending}
          name="import-file"
          accept=".json"
          on:change={wrapImportFromJSON}
        >
          {#if $importPending}
            <ProgressRadial
              stroke={80}
              width="w-5"
              meter="stroke-primary-500"
              track="stroke-primary-500/30"
            />
          {/if}
          <span>
            {t('setting.history.button.import')}
          </span>
        </FileButton>
      </li>
    </ul>
  </section>

  <section>
    <p class={sectionTitle}>{t('setting.history.label.clear')}</p>
    <ul class={ulClasses}>
      <li>
        <p class="flex-auto">{t('setting.history.options.clear_history')}</p>
        <button disabled={$clearPending} class="btn variant-filled" on:click={wrapClearDb}>
          {#if $clearPending}
            <ProgressRadial
              stroke={80}
              width="w-5"
              meter="stroke-primary-500"
              track="stroke-primary-500/30"
            />
          {/if}
          <span>
            {t('setting.history.button.clear')}
          </span>
        </button>
      </li>
    </ul>
  </section>
</div>
