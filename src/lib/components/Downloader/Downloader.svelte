<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import {
    TabGroup,
    Tab,
    ProgressRadial,
    InputChip,
    RadioGroup,
    RadioItem,
    ProgressBar,
    SlideToggle
  } from '@skeletonlabs/skeleton';
  import optionStore from './store';
  import {
    defineBatchDownload,
    useBatchDownload,
    type BatchDownloadConfig
  } from './useBatchDownload';
  import { logger } from '@/lib/logger';
  import { nonNegativeInt } from '../Actions/nonNegativeInt';
  import t from '@/lib/lang';

  import downloadSvg from '@/assets/download.svg?src';
  import stopSvg from '@/assets/close.svg?src';
  import playSvg from '@/assets/play-circle-outline.svg?src';
  import stopOutLineSvg from '@/assets/stop-circle-outline.svg?src';
  import downloadMultipleSvg from '@/assets/download-multiple.svg?src';

  type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T];

  function initFilterStore() {
    Array.isArray($selectedFilters) ||
      ($selectedFilters = downloaderConfig.filterOption.filters
        .filter((filter) => filter.checked)
        .map((filter) => filter.id));
  }

  async function updateAvatarSrc(url: string) {
    if (!downloaderConfig.avatar) return;

    // don't update avatar during download.
    if ($downloading) {
      updateAvatarAfterDownload = url;
      return;
    }

    let src: string | null;

    if (typeof downloaderConfig.avatar === 'string') {
      src = downloaderConfig.avatar;
    } else {
      if (url in avatarCache) {
        src = avatarCache[url];
      } else {
        src = await downloaderConfig.avatar(url);
        avatarCache[url] = src;
      }
    }

    // only update the avatar if the src has changed.
    if (!src || (avatarEl && avatarEl.src === src)) return;

    let imageLoaded!: (src: string) => void;
    avatarUpdated = new Promise<string>((resolve) => {
      imageLoaded = resolve;
    });

    const el = document.createElement('img');
    el.src = src;

    el.onload = () => {
      imageLoaded(src);
    };
  }

  function onUrlChange(url: string) {
    logger.info('Navigating to ', url);

    if (!downloaderConfig) return;

    const pageConfigs = downloaderConfig.pageMatch;

    for (let i = 0; i < pageConfigs.length; i++) {
      const matchPattern = pageConfigs[i].match;

      if (typeof matchPattern === 'string') {
        if (url.match(matchPattern)) {
          pageConfig = pageConfigs[i];
          updateAvatarSrc(url);
          return;
        }
      } else if (typeof matchPattern === 'function') {
        if (matchPattern(url)) {
          pageConfig = pageConfigs[i];
          updateAvatarSrc(url);
          return;
        }
      } else {
        if (matchPattern.test(url)) {
          pageConfig = pageConfigs[i];
          updateAvatarSrc(url);
          return;
        }
      }
    }

    pageConfig = null;
    updateAvatarAfterDownload = '';
  }

  function watchUrlChange() {
    if ('navigation' in window) {
      let prevUrl: string;
      let nextUrl: string;

      //@ts-expect-error navigation
      navigation.addEventListener('navigatesuccess', () => {
        // avoid updating when navigating to the same URL.
        prevUrl !== nextUrl && onUrlChange(nextUrl);
      });

      //@ts-expect-error navigation
      navigation.addEventListener('navigate', (evt) => {
        prevUrl = location.href;
        nextUrl = evt.destination.url;
      });
    } else {
      const rewrite = (type: FunctionKeys<History>) => {
        const oriHistory = history[type];
        return function (this: History, ...args: any[]) {
          const currentUrl = location.href;
          const res = oriHistory.apply(this, args);
          const navigateUrl = location.href;

          currentUrl !== navigateUrl && onUrlChange(navigateUrl);

          return res;
        };
      };

      history.pushState = rewrite('pushState');
      history.replaceState = rewrite('replaceState');
    }
  }

  function beforeUnloadHandler(evt: BeforeUnloadEvent) {
    evt.preventDefault();
    // Included for legacy support, e.g. Chrome/Edge < 119
    evt.returnValue = true;
  }

  async function startDownload(id?: string) {
    const { genPageId } = pageConfig!;
    if (Array.isArray(genPageId)) {
      id && (await batchDownload(id));
    } else {
      !id && (await batchDownload(genPageId.id));
    }
  }

  export let downloaderConfig: BatchDownloadConfig<any, true | undefined>;

  let pageConfig: BatchDownloadConfig<any, true | undefined>['pageMatch'][number] | null;

  const {
    selectedFilters,
    blacklistTag,
    whitelistTag,
    downloadAllPages,
    pageStart,
    pageEnd,
    retryFailed
  } = optionStore;

  // dom binding
  let startDownloadEl: HTMLDivElement;
  let stopDownloadEl: HTMLDivElement;
  let avatarEl: HTMLImageElement;
  let avatarProgressEl: HTMLDivElement;
  let avatarDownloadIcon: HTMLElement;

  const avatarCache: Record<string, string> = {};
  let avatarUpdated: Promise<string | null>;
  let updateAvatarAfterDownload: string;

  let tabSet: number = 0;
  let showDownloadMenu = false;

  initFilterStore();

  defineBatchDownload(downloaderConfig);
  const { artworkCount, successd, failed, excluded, downloading, log, batchDownload, abort } =
    useBatchDownload();

  watchUrlChange();
  onUrlChange(location.href);

  downloading.subscribe((val) => {
    if (val) {
      // alert before unload while downloading
      window.addEventListener('beforeunload', beforeUnloadHandler);
    } else {
      window.removeEventListener('beforeunload', beforeUnloadHandler);

      // update avatar if downloader still visible after download complete.
      updateAvatarAfterDownload && pageConfig && updateAvatarSrc(updateAvatarAfterDownload);
    }
  });

  $: ifDownloaderCanShow = $downloading || !!pageConfig;
  $: {
    // prevent from showing menu again when avatar shows
    if (!ifDownloaderCanShow) showDownloadMenu = false;
  }

  $: processed = $successd.length + $failed.length + $excluded.length;
  $: downloadProgress = $artworkCount ? (processed / $artworkCount) * 100 : undefined;
  $: downloadResult =
    !$downloading && $artworkCount
      ? `Completed: ${$successd.length}. Failed: ${$failed.length}. Excluded: ${$excluded.length}.`
      : '';
</script>

{#if showDownloadMenu && ifDownloaderCanShow}
  <div
    transition:fly={{ x: 50, opacity: 0 }}
    data-theme="skeleton"
    class="card px-4 fixed right-20 top-36 w-[600px] *:text-sm shadow-xl bg-scroll"
  >
    {#if !$downloading}
      <div transition:slide class="downloader-filter">
        <TabGroup regionList="text-surface-700-200-token" class="text-sm">
          <Tab bind:group={tabSet} name="category" value={0}
            >{t('downloader.category.tab_name')}</Tab
          >
          <Tab bind:group={tabSet} name="tag_filter" value={1}
            >{t('downloader.tag_filter.tab_name')}</Tab
          >
          <Tab bind:group={tabSet} name="tag_filter" value={2}
            >{t('downloader.others.tab_name')}</Tab
          >

          <svelte:fragment slot="panel">
            {#if tabSet === 0}
              <div class="flex justify-end items-center my-4">
                <div class="btn-group w-full">
                  {#each downloaderConfig.filterOption.filters as { id, name }}
                    <label
                      class="btn !py-2 rounded-none !transform-none cursor-pointer variant-soft-surface has-[:checked]:!variant-filled-primary text-sm w-full"
                    >
                      <!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
                      <div class="w-0 h-0 overflow-hidden hidden">
                        <input type="checkbox" bind:group={$selectedFilters} value={id} />
                      </div>
                      <div class="!m-0">{name}</div>
                    </label>
                  {/each}
                </div>
              </div>

              <div class="flex justify-between items-center my-4 gap-4">
                <div class="flex-grow w-full">
                  <RadioGroup
                    regionLabel="text-surface-700-200-token"
                    active="variant-filled-primary"
                    background="bg-surface-400/20 dark:bg-surface-500/20"
                    border=""
                    display="flex"
                  >
                    <RadioItem
                      class="text-sm !py-[7px]"
                      bind:group={$downloadAllPages}
                      name="justify"
                      value={true}>{t('downloader.category.filter.download_all_pages')}</RadioItem
                    >
                    <RadioItem
                      class="text-sm !py-[7px]"
                      bind:group={$downloadAllPages}
                      name="justify"
                      value={false}
                      >{t('downloader.category.filter.download_selected_pages')}</RadioItem
                    >
                  </RadioGroup>
                </div>

                <div class="flex justify-between items-center gap-4 w-full">
                  <label
                    class="input-group input-group-divider flex [&>input]:!min-w-0 [&>input]:!border-transparent border-surface-400/20 dark:border-surface-500/20 bg-surface-400/20 dark:bg-surface-500/20"
                  >
                    <div class="input-group-shim !px-1 flex-none">
                      <i class="w-6 fill-current">
                        {@html playSvg}
                      </i>
                    </div>
                    <input
                      class="w-20 pr-0 text-surface-700-200-token text-sm"
                      type="number"
                      min={1}
                      step="1"
                      disabled={$downloadAllPages}
                      use:nonNegativeInt={pageStart}
                      bind:value={$pageStart}
                    />
                  </label>

                  <label
                    class="input-group input-group-divider flex [&>input]:!min-w-0 [&>input]:!border-transparent border-surface-400/20 dark:border-surface-500/20 bg-surface-400/20 dark:bg-surface-500/20"
                  >
                    <div class="input-group-shim !px-1 flex-none">
                      <i class="w-6 fill-current">
                        {@html stopOutLineSvg}
                      </i>
                    </div>
                    <input
                      class="w-20 pr-0 text-surface-700-200-token text-sm"
                      type="number"
                      min="1"
                      step="1"
                      disabled={$downloadAllPages}
                      use:nonNegativeInt={pageEnd}
                      bind:value={$pageEnd}
                    />
                  </label>
                </div>
              </div>
            {:else if tabSet === 1}
              <InputChip
                bind:value={$blacklistTag}
                allowUpperCase
                name="blacklist"
                chips="variant-filled-primary"
                placeholder={t('downloader.tag_filter.placeholder.blacklist_tag')}
              />
              <InputChip
                bind:value={$whitelistTag}
                allowUpperCase
                name="whitelist"
                chips="variant-filled-primary"
                placeholder={t('downloader.tag_filter.placeholder.whitelist_tag')}
                class="my-4"
              />
            {:else if tabSet === 2}
              <div class="flex justify-between items-center text-base text-surface-700-200-token">
                <p>{t('downloader.others.options.retry_failed')}</p>
                <SlideToggle size="sm" name="download-retry" bind:checked={$retryFailed}
                ></SlideToggle>
              </div>
            {/if}
          </svelte:fragment>
        </TabGroup>
        <hr class="!border-t-1 my-4" />
      </div>
    {/if}

    <div class="flex relative my-4">
      {#if !$downloading}
        <div
          bind:this={startDownloadEl}
          transition:fade={{ duration: 250 }}
          on:introstart={() =>
            // required when the transition reverses
            startDownloadEl.classList.remove('absolute')}
          on:outrostart={() => startDownloadEl.classList.add('absolute')}
          class="flex justify-end flex-grow w-full gap-4"
        >
          <div
            class="flex flex-grow flex-col justify-between overflow-hidden text-surface-700-200-token"
          >
            <p class="truncate">
              {downloadResult}
            </p>
            <p class="break-words" class:text-error-500={$log?.type === 'Error'}>
              {$log?.message ?? ''}
            </p>
          </div>

          {#if pageConfig && Array.isArray(pageConfig.genPageId)}
            <div class=" flex-none btn-group self-start">
              {#each pageConfig.genPageId as { name, id }}
                <button
                  class="btn rounded-none !transform-none !variant-filled-primary"
                  on:click={() => {
                    startDownload(id);
                  }}
                >
                  <i class="w-5">
                    {@html downloadSvg}
                  </i>
                  <span>{name}</span>
                </button>
              {/each}
            </div>
          {:else if pageConfig && !Array.isArray(pageConfig.genPageId)}
            <button
              class="btn variant-filled-primary self-start"
              on:click={() => {
                startDownload();
              }}
            >
              <i class="w-5">
                {@html downloadSvg}
              </i>
              <span>{pageConfig.genPageId.name}</span>
            </button>
          {/if}
        </div>
      {:else}
        <div
          bind:this={stopDownloadEl}
          transition:fade={{ duration: 250 }}
          class="flex flex-grow w-full gap-6 items-center"
          on:introstart={() => stopDownloadEl.classList.remove('absolute')}
          on:outrostart={() => stopDownloadEl.classList.add('absolute')}
        >
          <div class="flex flex-grow flex-col justify-between h-full overflow-hidden">
            <ProgressBar
              height="h-4"
              rounded="rounded-md"
              meter="bg-primary-500"
              track="bg-primary-500/30"
              max={100}
              value={downloadProgress}
            />
            <div class="flex items-center justify-between gap-4 basis-0 text-surface-700-200-token">
              <p class="truncate" class:text-error-500={$log?.type === 'Error'}>
                {$log?.message ?? ''}
              </p>
              <p class=" flex-none">
                {$artworkCount ? `${processed} / ${$artworkCount}` : ''}
              </p>
            </div>
          </div>

          <button
            class="btn variant-filled-primary"
            on:click={() => {
              abort();
            }}
          >
            <i class="w-5">
              {@html stopSvg}
            </i>
            <span>{t('downloader.download_type.stop')}</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if ifDownloaderCanShow}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    transition:fly={{ opacity: 0, x: 50 }}
    class="size-14 rounded-full fixed right-4 top-36 drop-shadow-xl cursor-pointer hover:brightness-110 backdrop-blur-sm"
    on:click={() => {
      showDownloadMenu = !showDownloadMenu;
    }}
  >
    <div
      data-theme="skeleton"
      class="avatar absolute -z-10 size-14 rounded-full overflow-hidden bg-scroll transition-opacity duration-[250ms]"
      class:opacity-70={!showDownloadMenu}
      class:blur-[1px]={!showDownloadMenu}
    >
      {#await avatarUpdated then val}
        {#if val}
          <img
            bind:this={avatarEl}
            src={val}
            alt="batch download"
            class="object-cover object-center size-full"
          />
        {/if}
      {/await}
    </div>

    {#if $downloading && !showDownloadMenu}
      <div
        transition:fade={{ duration: 250 }}
        class="!absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <ProgressRadial
          width="w-16"
          stroke={32}
          meter="stroke-primary-500"
          track="stroke-primary-500/30"
          fill="fill-primary-500"
          strokeLinecap="butt"
          value={downloadProgress}
        ></ProgressRadial>
      </div>
    {/if}

    <div class="size-14 flex justify-center items-center relative">
      <!-- TODO: out-in transition -->
      {#if $downloading && $artworkCount && !showDownloadMenu}
        <div
          transition:fade={{ duration: 250 }}
          bind:this={avatarProgressEl}
          on:introstart={() => avatarProgressEl.classList.remove('absolute')}
          on:outrostart={() => avatarProgressEl.classList.add('absolute')}
          class="flex flex-col justify-center items-center px-3 font-bold text-[12px] leading-[14px] overflow-hidden text-surface-700-200-token"
        >
          <span class=" truncate max-w-full">{processed}</span>
          <hr
            class="!border-t-1 my-[1px] self-stretch !border-surface-700 dark:!border-surface-200"
          />
          <span class=" truncate max-w-full">{$artworkCount}</span>
        </div>
      {:else if !showDownloadMenu}
        <i
          transition:fade={{ duration: 250 }}
          bind:this={avatarDownloadIcon}
          on:introstart={() => avatarDownloadIcon.classList.remove('absolute')}
          on:outrostart={() => avatarDownloadIcon.classList.add('absolute')}
          class="w-6 fill-slate-700 dark:fill-slate-200 mix-blend-hard-light mt-4"
        >
          {@html downloadMultipleSvg}
        </i>
      {/if}
    </div>
  </div>
{/if}
