<script lang="ts">
  import check from '@/assets/check.svg?src';
  import folderSvg from '@/assets/folder.svg?src';
  import fileSvg from '@/assets/file.svg?src';
  import { RadioGroup, RadioItem, SlideToggle } from '@skeletonlabs/skeleton';
  import { FilenameConfigAction, TagLanguage, type Config } from '@/lib/config';
  import { env } from '@/lib/env';
  import { downloader } from '@/lib/downloader';
  import { getContext, tick } from 'svelte';
  import type { TemplateData } from '@/sites/base/downloadConfig';
  import { t } from '@/lib/i18n.svelte';
  import { downloadSetting } from '@/lib/store/downloadSetting.svelte';

  let {
    bg = 'bg-white/30 dark:bg-black/15',
    border = 'divide-y-[1px] *:border-surface-300-600-token',
    padding = 'px-4 *:py-4',
    margin = 'mt-2 *:!m-0',
    rounded = 'rounded-container-token *:!rounded-none',
    sectionSpace = `space-y-4`,
    sectionTitle = 'font-bold',
    class: UlClass = '',

    templates = getContext('supportedTemplate') as Partial<TemplateData>,
    descriptionText = 'text-sm text-surface-400'
  } = $props();

  const configStore: Config = getContext('store');

  const ulClasses = $derived(
    `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${UlClass}`
  );

  let directoryRef: HTMLInputElement;
  let filenameRef: HTMLInputElement;

  let directory = $state(downloadSetting.current.directoryTemplate);
  let filename = $state(downloadSetting.current.filenameTemplate);
  let fsaDirectory = $state(downloader.getCurrentFsaDirName());

  async function resetFolder() {
    directory = downloadSetting.current.directoryTemplate;

    // Chromium sets `selectionStart` and `selectionEnd` to 0 after changing `input.value`
    await tick();
    const pos = directory.length;
    directoryRef.focus();
    directoryRef.setSelectionRange(pos, pos);
  }

  async function resetFilename() {
    filename = downloadSetting.current.filenameTemplate;

    await tick();
    const pos = filename.length;
    filenameRef.focus();
    filenameRef.setSelectionRange(pos, pos);
  }

  // TODO: reactivity
  async function updatefsaDir() {
    fsaDirectory = await downloader.updateDirHandle();
  }

  function insertDirTemplateAtCursor(template: string) {
    return async () => {
      const start = directoryRef.selectionStart!;
      const end = directoryRef.selectionEnd!;
      directory = directory.slice(0, start) + template + directory.slice(end);

      await tick();
      const newStart = start + template.length;
      directoryRef.focus();
      directoryRef.setSelectionRange(newStart, newStart);
    };
  }

  function insertFilenameTemplateAtCursor(template: string) {
    return async () => {
      const start = filenameRef.selectionStart!;
      const end = filenameRef.selectionEnd!;
      filename = filename.slice(0, start) + template + filename.slice(end);

      await tick();
      const newStart = start + template.length;
      filenameRef.focus();
      filenameRef.setSelectionRange(newStart, newStart);
    };
  }

  const folderBtnDisabled = $derived(directory === downloadSetting.current.directoryTemplate);

  const filenameBtnDisabled = $derived(filename === downloadSetting.current.filenameTemplate);

  const directoryPlaceholder = $derived(
    downloadSetting.isSubpathSupported
      ? t('setting.save_to.placeholder.sub_directory_unused')
      : env.isViolentmonkey()
        ? t('setting.save_to.placeholder.vm_not_supported')
        : t('setting.save_to.placeholder.need_browser_api')
  );
</script>

<div class={sectionSpace}>
  <section>
    <p class={sectionTitle}>{t('setting.save_to.label.directory')}</p>

    <ul class={ulClasses}>
      <li class=" flex-col gap-3">
        <div class="input-group input-group-divider grid-cols-[auto_1fr_auto_auto]">
          <button
            type="button"
            class="[&:not([disabled])]:variant-soft-primary"
            disabled={folderBtnDisabled}
            onclick={resetFolder}
          >
            <i class=" w-6 fill-current">
              {@html folderSvg}
            </i>
          </button>

          {#if downloadSetting.isSubpathSupported}
            <input
              type="text"
              placeholder={directoryPlaceholder}
              bind:this={directoryRef}
              bind:value={directory}
            />
          {:else}
            <input type="text" disabled placeholder={directoryPlaceholder} />
          {/if}

          <button
            type="button"
            class="variant-soft-surface [&:not([disabled])]:variant-soft-primary"
            disabled={folderBtnDisabled}
            onclick={() => (directory = downloadSetting.setDirectoryTemplate(directory))}
          >
            <i class=" w-6 fill-current">
              {@html check}
            </i>
          </button>
        </div>

        <div class=" flex flex-wrap self-start gap-y-1 gap-x-2">
          {#each Object.entries(templates) as [template, description]}
            <button
              class="chip variant-soft hover:variant-filled"
              disabled={!downloadSetting.isSubpathSupported}
              onclick={insertDirTemplateAtCursor(`{${template}}`)}
            >
              <span>{description}</span>
            </button>
          {/each}
        </div>
      </li>

      <li>
        <p class="flex-auto">{t('setting.save_to.options.use_fsa')}</p>
        <SlideToggle
          size="sm"
          name="fsa-enable"
          disabled={!env.isFileSystemAccessAvaliable()}
          bind:checked={downloadSetting.current.useFileSystemAccessApi}
        ></SlideToggle>
      </li>

      {#if downloadSetting.current.useFileSystemAccessApi}
        <li>
          <p class="flex-auto">{t('setting.save_to.options.fsa_directory')}</p>

          <span class="text-sm italic">{fsaDirectory}</span>
          <button class="btn btn-sm variant-filled" onclick={updatefsaDir}
            >{t('setting.save_to.button.choose_fsa_directory')}</button
          >
        </li>

        <li>
          <p class="flex-auto">{t('setting.save_to.options.fsa_filename_conflict')}</p>
          <RadioGroup class="shrink-0">
            <RadioItem
              name="filenameConfigAction"
              class="text-sm"
              bind:group={downloadSetting.current.filenameConflictAction}
              value={FilenameConfigAction.UNIQUIFY}
              >{t('setting.save_to.radio.filename_conflict_option_uniquify')}</RadioItem
            >
            <RadioItem
              name="filenameConfigAction"
              class="text-sm"
              bind:group={downloadSetting.current.filenameConflictAction}
              value={FilenameConfigAction.OVERWRITE}
              >{t('setting.save_to.radio.filename_conflict_option_overwrite')}</RadioItem
            >
            <RadioItem
              name="filenameConfigAction"
              class="text-sm"
              bind:group={downloadSetting.current.filenameConflictAction}
              value={FilenameConfigAction.PROMPT}
              >{t('setting.save_to.radio.filename_conflict_option_prompt')}</RadioItem
            >
          </RadioGroup>
        </li>
      {/if}
    </ul>
  </section>

  <section>
    <p class={sectionTitle}>{t('setting.save_to.label.filename')}</p>

    <ul class={ulClasses}>
      <li class=" flex-col gap-3">
        <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
          <button
            type="button"
            class="[&:not([disabled])]:variant-soft-primary"
            disabled={filenameBtnDisabled}
            onclick={resetFilename}
          >
            <i class=" w-6 fill-current">
              {@html fileSvg}
            </i>
          </button>

          <input
            type="text"
            required
            placeholder={t('setting.save_to.placeholder.filename_requried')}
            bind:this={filenameRef}
            bind:value={filename}
          />

          <button
            type="button"
            class="variant-soft-surface dark:variant-fill-surface [&:not([disabled])]:variant-soft-primary"
            disabled={filenameBtnDisabled}
            onclick={() => (filename = downloadSetting.setFilenameTemplate(filename))}
          >
            <i class=" w-6 fill-current">
              {@html check}
            </i>
          </button>
        </div>

        <div class=" flex flex-wrap self-start gap-y-1 gap-x-2">
          {#each Object.entries(templates) as [template, description]}
            <button
              class="chip variant-soft hover:variant-filled"
              onclick={insertFilenameTemplateAtCursor(`{${template}}`)}
            >
              <span>{description}</span>
            </button>
          {/each}
        </div>
      </li>

      {#if env.isPixiv()}
        <li>
          <div class="flex-auto">
            <p>{t('setting.save_to.options.tag_language')}</p>
            <p class={descriptionText}>{t('setting.save_to.options.tag_language_tips')}</p>
          </div>

          <RadioGroup class=" shrink-0">
            <RadioItem
              name="tagLang"
              class="text-sm"
              bind:group={$configStore.tagLang}
              value={TagLanguage.JAPANESE}>日本語</RadioItem
            >
            <RadioItem
              name="tagLang"
              class="text-sm"
              bind:group={$configStore.tagLang}
              value={TagLanguage.CHINESE}>简中</RadioItem
            >
            <RadioItem
              name="tagLang"
              class="text-sm"
              bind:group={$configStore.tagLang}
              value={TagLanguage.TRADITIONAL_CHINESE}>繁中</RadioItem
            >
            <RadioItem
              name="tagLang"
              class="text-sm"
              bind:group={$configStore.tagLang}
              value={TagLanguage.ENGLISH}>En</RadioItem
            >
          </RadioGroup>
        </li>
      {/if}
    </ul>
  </section>
</div>
