<script lang="ts">
  import check from '@/assets/check.svg?src';
  import folderSvg from '@/assets/folder.svg?src';
  import fileSvg from '@/assets/file.svg?src';
  import { RadioGroup, RadioItem, SlideToggle } from '@skeletonlabs/skeleton';
  import { FilenameConfigAction, TagLanguage } from '@/lib/config';
  import { replaceInvalidChar } from '@/lib/util';
  import t from '@/lib/lang';
  import store from '../store';
  import { env } from '@/lib/env';
  import { downloader } from '@/lib/downloader';

  export let bg = 'bg-white/30 dark:bg-black/15';
  export let border = 'divide-y-[1px] *:border-surface-300-600-token';
  export let padding = 'px-4 *:py-4';
  export let margin = 'mt-2 *:!m-0';
  export let rounded = 'rounded-container-token *:!rounded-none';
  export let descritionText = 'text-sm text-surface-400';

  $: ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ''}`;

  export let sectionSpace = `space-y-4`;
  export let sectionTitle = 'font-bold';

  export let pattern: string[] = [];

  let directory = $store.folderPattern;
  let filename = $store.filenamePattern;
  let fsaDirectory = downloader.getCurrentFsaDirName();

  function updateDirectory() {
    const newDirectory = directory
      .split('/')
      .map(replaceInvalidChar)
      .filter((path: string) => !!path)
      .join('/');
    $store.folderPattern = directory = newDirectory;
  }

  function updateFilename() {
    const newFilename = replaceInvalidChar(filename);
    if (newFilename === '') {
      filename = $store.filenamePattern;
    } else {
      $store.filenamePattern = filename = newFilename;
    }
  }

  function resetFolder() {
    directory = $store.folderPattern;
  }

  function resetFilename() {
    filename = $store.filenamePattern;
  }

  async function updatefsaDir() {
    fsaDirectory = await downloader.updateDirHandle();
    console.log(fsaDirectory);
  }

  $: subDirectoryAvailable = $store.useFileSystemAccess || env.isSupportSubpath();
  $: folderBtnDisabled = directory === $store.folderPattern;
  $: filenameBtnDisabled = filename === $store.filenamePattern;

  $: directoryPlaceholder = subDirectoryAvailable
    ? t('setting.save_to.placeholder.sub_directory_unused')
    : env.isViolentmonkey()
      ? t('setting.save_to.placeholder.vm_not_supported')
      : t('setting.save_to.placeholder.need_browser_api');
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
            on:click={resetFolder}
          >
            <i class=" w-6 fill-current">
              {@html folderSvg}
            </i>
          </button>

          {#if subDirectoryAvailable}
            <input type="text" placeholder={directoryPlaceholder} bind:value={directory} />
          {:else}
            <input type="text" disabled placeholder={directoryPlaceholder} />
          {/if}

          <button
            type="button"
            class="variant-soft-surface [&:not([disabled])]:variant-soft-primary"
            disabled={folderBtnDisabled}
            on:click={updateDirectory}
          >
            <i class=" w-6 fill-current">
              {@html check}
            </i>
          </button>
        </div>

        <div class=" self-start space-x-2">
          {#each pattern as p}
            <button
              class="chip variant-soft hover:variant-filled"
              disabled={!subDirectoryAvailable}
              on:click={() => (directory += ' ' + p)}
            >
              <span>{p}</span>
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
          bind:checked={$store.useFileSystemAccess}
        ></SlideToggle>
      </li>

      {#if $store.useFileSystemAccess}
        <li>
          <p class="flex-auto">{t('setting.save_to.options.fsa_directory')}</p>

          <span class="text-sm italic">{fsaDirectory}</span>
          <button class="btn btn-sm variant-filled" on:click={updatefsaDir}
            >{t('setting.save_to.button.choose_fsa_directory')}</button
          >
        </li>

        <li>
          <p class="flex-auto">{t('setting.save_to.options.fsa_filename_conflict')}</p>
          <RadioGroup class="shrink-0">
            <RadioItem
              name="filenameConfigAction"
              class="text-sm"
              bind:group={$store.fileSystemFilenameConflictAction}
              value={FilenameConfigAction.UNIQUIFY}
              >{t('setting.save_to.radio.filename_conflict_option_uniquify')}</RadioItem
            >
            <RadioItem
              name="filenameConfigAction"
              class="text-sm"
              bind:group={$store.fileSystemFilenameConflictAction}
              value={FilenameConfigAction.OVERWRITE}
              >{t('setting.save_to.radio.filename_conflict_option_overwrite')}</RadioItem
            >
            <RadioItem
              name="filenameConfigAction"
              class="text-sm"
              bind:group={$store.fileSystemFilenameConflictAction}
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
            on:click={resetFilename}
          >
            <i class=" w-6 fill-current">
              {@html fileSvg}
            </i>
          </button>

          <input
            type="text"
            required
            placeholder={t('setting.save_to.placeholder.filename_requried')}
            bind:value={filename}
          />

          <button
            type="button"
            class="variant-soft-surface dark:variant-fill-surface [&:not([disabled])]:variant-soft-primary"
            disabled={filenameBtnDisabled}
            on:click={updateFilename}
          >
            <i class=" w-6 fill-current">
              {@html check}
            </i>
          </button>
        </div>

        <div class=" self-start space-x-2">
          {#each pattern as p}
            <button
              class="chip variant-soft hover:variant-filled"
              on:click={() => (filename += ' ' + p)}
            >
              <span>{p}</span>
            </button>
          {/each}
        </div>
      </li>

      <li>
        <div class="flex-auto">
          <p>{t('setting.save_to.options.tag_language')}</p>
          <p class={descritionText}>{t('setting.save_to.options.tag_language_tips')}</p>
        </div>

        <RadioGroup class=" shrink-0">
          <RadioItem
            name="tagLang"
            class="text-sm"
            bind:group={$store.tagLang}
            value={TagLanguage.JAPANESE}>日本語</RadioItem
          >
          <RadioItem
            name="tagLang"
            class="text-sm"
            bind:group={$store.tagLang}
            value={TagLanguage.CHINESE}>简中</RadioItem
          >
          <RadioItem
            name="tagLang"
            class="text-sm"
            bind:group={$store.tagLang}
            value={TagLanguage.TRADITIONAL_CHINESE}>繁中</RadioItem
          >
          <RadioItem
            name="tagLang"
            class="text-sm"
            bind:group={$store.tagLang}
            value={TagLanguage.ENGLISH}>En</RadioItem
          >
        </RadioGroup>
      </li>
    </ul>
  </section>
</div>
