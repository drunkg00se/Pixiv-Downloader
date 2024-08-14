<script lang="ts">
  import { historyDb, type HistoryImportObject } from '@/lib/db';
  import { FileButton } from '@skeletonlabs/skeleton';
  import t from '@/lib/lang';

  export let bg = 'bg-white/30 dark:bg-black/15';
  export let border = 'divide-y-[1px] *:border-surface-300-600-token';
  export let padding = 'px-4 *:py-4';
  export let margin = 'mt-2 *:!m-0';
  export let rounded = 'rounded-container-token *:!rounded-none';

  $: ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ''}`;

  export let sectionSpace = `space-y-4`;
  export let sectionTitle = 'font-bold';

  function readHistoryFile(
    type: 'application/json',
    file: File
  ): Promise<Array<HistoryImportObject>> {
    return new Promise((resolve) => {
      if (file.type !== type) throw new Error('Invalid file');
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (readEvt) => {
        const text = readEvt.target?.result;
        if (typeof text !== 'string') throw new Error('Invalid file');

        const history = JSON.parse(text);
        if (!(history instanceof Array)) throw new Error('Invalid file');
        resolve(history);
      };
    });
  }

  function importJSON(evt: Event) {
    const file = (evt.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    readHistoryFile('application/json', file)
      .then((data) => historyDb.import(data))
      .then(() => location.reload())
      .catch((err) => alert(err?.message));
  }

  function exportAsJSON() {
    historyDb.getAll().then((datas) => {
      const str = JSON.stringify(datas);
      const dlEle = document.createElement('a');
      dlEle.href = URL.createObjectURL(new Blob([str], { type: 'application/json' }));
      dlEle.download = 'Pixiv Downloader ' + new Date().toLocaleString() + '.json';
      dlEle.click();
      URL.revokeObjectURL(dlEle.href);
    });
  }

  function exportAsCSV() {
    historyDb.generateCsv().then((csv) => {
      const dlEle = document.createElement('a');
      dlEle.href = URL.createObjectURL(csv);
      dlEle.download = 'Pixiv Downloader ' + new Date().toLocaleString() + '.csv';
      dlEle.click();
      URL.revokeObjectURL(dlEle.href);
    });
  }

  function clearDb() {
    const isConfirm = confirm(t('text.confirm_clear_history'));
    if (!isConfirm) return;
    historyDb.clear().then(() => location.reload());
  }
</script>

<div class={sectionSpace}>
  <section>
    <p class={sectionTitle}>{t('setting.history.label.export')}</p>
    <ul class={ulClasses}>
      <li>
        <p class="flex-auto">{t('setting.history.options.export_as_json')}</p>
        <button class="btn variant-filled" on:click={exportAsJSON}
          >{t('setting.history.button.export')}</button
        >
      </li>
      <li>
        <p class="flex-auto">{t('setting.history.options.export_as_csv')}</p>
        <button class="btn variant-filled" on:click={exportAsCSV}
          >{t('setting.history.button.export')}</button
        >
      </li>
    </ul>
  </section>

  <section>
    <p class={sectionTitle}>{t('setting.history.label.import')}</p>
    <ul class={ulClasses}>
      <li>
        <p class="flex-auto">{t('setting.history.options.import_json')}</p>
        <FileButton name="import-file" accept=".json" on:change={importJSON}
          >{t('setting.history.button.import')}</FileButton
        >
      </li>
    </ul>
  </section>

  <section>
    <p class={sectionTitle}>{t('setting.history.label.clear')}</p>
    <ul class={ulClasses}>
      <li>
        <p class="flex-auto">{t('setting.history.options.clear_history')}</p>
        <button class="btn variant-filled" on:click={clearDb}
          >{t('setting.history.button.clear')}</button
        >
      </li>
    </ul>
  </section>
</div>
