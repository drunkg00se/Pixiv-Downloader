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
  import { logger } from '@/lib/logger';

  import downloadSvg from '@/assets/download.svg?src';
  import stopSvg from '@/assets/close.svg?src';
  import playSvg from '@/assets/play-circle-outline.svg?src';
  import stopOutLineSvg from '@/assets/stop-circle-outline.svg?src';
  import downloadMultipleSvg from '@/assets/download-multiple.svg?src';

  import type {
    BatchDownloadConfig,
    BatchDownloadDefinition,
    PageOption
  } from './useBatchDownload.svelte';
  import type { MediaMeta } from '@/sites/base/parser';
  import { t } from '@/lib/i18n.svelte';
  import { inputValidation } from '../Actions/inputValidation.svelte';
  import { batchDownloaderStore } from '@/lib/store/batchDownloader.svelte';
  import { ReactiveValue } from '@/lib/reactiveValue.svelte';

  interface Props {
    downloaderConfig: BatchDownloadConfig<MediaMeta<string | string[]>>;
    useBatchDownload: BatchDownloadDefinition<MediaMeta<string | string[]>>;
  }

  type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T];

  let { downloaderConfig, useBatchDownload }: Props = $props();

  const { artworkCount, successd, failed, excluded, downloading, log, batchDownload, abort } =
    useBatchDownload();

  const reactiveUrl = new ReactiveValue(
    () => location.href,
    (update) => {
      if ('navigation' in window) {
        let prevUrl: string;
        let nextUrl: string;

        //@ts-expect-error navigation
        navigation.addEventListener('navigatesuccess', () => {
          // avoid updating when navigating to the same URL.
          prevUrl !== nextUrl && update();
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

            currentUrl !== navigateUrl && update();

            return res;
          };
        };

        history.pushState = rewrite('pushState');
        history.replaceState = rewrite('replaceState');
      }
    }
  );

  initFilterStore();

  // dom binding
  let startDownloadEl: HTMLDivElement;
  let stopDownloadEl: HTMLDivElement;
  let avatarProgressEl: HTMLDivElement;
  let avatarDownloadIcon: HTMLElement;

  const avatarCache: Record<string, string> = {};
  let avatarSrc: string = $state('');

  let menuTabSet: number = $state(0);

  let showMenu = $state(false);

  const batchDownloadEntries:
    | [string, PageOption<MediaMeta<string | string[]>>['string']][]
    | null = $derived.by(() => {
    if (!downloaderConfig) return null;

    const url = reactiveUrl.current;
    logger.info('Navigating to ', url);

    const { pageOption } = downloaderConfig;
    const generatorOptionEntries: [string, PageOption<MediaMeta<string | string[]>>['string']][] =
      [];

    for (const key in pageOption) {
      const item = pageOption[key];
      const { match: matchPattern } = item;

      if (typeof matchPattern === 'string') {
        url.match(matchPattern) && generatorOptionEntries.push([key, item]);
      } else if (typeof matchPattern === 'function') {
        matchPattern(url) && generatorOptionEntries.push([key, item]);
      } else {
        matchPattern.test(url) && generatorOptionEntries.push([key, item]);
      }
    }

    if (generatorOptionEntries.length) {
      return generatorOptionEntries;
    }

    return null;
  });

  const showDownloader = $derived(downloading.current || !!batchDownloadEntries);

  const processed = $derived(
    successd.current.length + failed.current.length + excluded.current.length
  );

  const downloadProgress = $derived(
    artworkCount.current ? (processed / artworkCount.current) * 100 : undefined
  );

  const downloadResult = $derived(
    !downloading.current && artworkCount.current
      ? `Completed: ${successd.current.length}. Failed: ${failed.current.length}. Excluded: ${excluded.current.length}.`
      : ''
  );

  // update avatar
  $effect(() => {
    if (!downloaderConfig.avatar) return;

    if (typeof downloaderConfig.avatar === 'string') {
      avatarSrc = downloaderConfig.avatar;
      return;
    }

    const url = reactiveUrl.current;

    // Donot update avatar during download.
    if (downloading.current) {
      return;
    }

    if (url in avatarCache) {
      const imageSrc = avatarCache[url];

      if (avatarSrc !== imageSrc) {
        avatarSrc = imageSrc;
      }

      return;
    }

    const urlOrPromise = downloaderConfig.avatar(url);

    if (typeof urlOrPromise === 'string') {
      avatarCache[url] = urlOrPromise;

      if (avatarSrc !== urlOrPromise) {
        avatarSrc = urlOrPromise;
      }

      return;
    }

    urlOrPromise.then((imageSrc) => {
      avatarCache[url] = imageSrc;

      if (avatarSrc !== imageSrc) {
        avatarSrc = imageSrc;
      }
    });
  });

  // prevent the menu from showing again when the avatar appears
  $effect(() => {
    if (!showDownloader) showMenu = false;
  });

  // alert before unload while downloading
  $effect(() => {
    if (downloading.current) {
      window.addEventListener('beforeunload', beforeUnloadHandler);
    } else {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    }
  });

  function initFilterStore() {
    if (batchDownloaderStore.selectedFilters === null) {
      batchDownloaderStore.selectedFilters = downloaderConfig.filterOption.filters
        .filter((filter) => filter.checked)
        .map((filter) => filter.id);
    }
  }

  function beforeUnloadHandler(evt: BeforeUnloadEvent) {
    evt.preventDefault();
    // Included for legacy support, e.g. Chrome/Edge < 119
    evt.returnValue = true;
  }

  function startDownload(id: string) {
    return (batchDownload as any)(id).catch(logger.error);
  }
</script>

{#if showMenu && showDownloader}
  <div
    transition:fly={{ x: 50, opacity: 0 }}
    data-theme="skeleton"
    class="card px-4 fixed right-20 top-36 w-[600px] *:text-sm shadow-xl bg-scroll"
  >
    {#if !downloading.current}
      <div transition:slide class="downloader-filter">
        <TabGroup regionList="text-surface-700-200-token" class="text-sm">
          <Tab bind:group={menuTabSet} name="category" value={0}
            >{t('downloader.category.tab_name')}</Tab
          >
          {#if !!downloaderConfig.filterOption.enableTagFilter}
            <Tab bind:group={menuTabSet} name="tag_filter" value={1}
              >{t('downloader.tag_filter.tab_name')}</Tab
            >
          {/if}
          <Tab bind:group={menuTabSet} name="tag_filter" value={2}
            >{t('downloader.others.tab_name')}</Tab
          >

          <svelte:fragment slot="panel">
            {#if menuTabSet === 0}
              {#if downloaderConfig.filterOption.filters.length}
                <div class="flex justify-end items-center my-4">
                  <div class="btn-group w-full">
                    {#each downloaderConfig.filterOption.filters as { id, name }}
                      <label
                        class="btn !py-2 rounded-none !transform-none cursor-pointer variant-soft-surface has-[:checked]:!variant-filled-primary text-sm w-full"
                      >
                        <!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
                        <div class="w-0 h-0 overflow-hidden hidden">
                          <input
                            type="checkbox"
                            bind:group={batchDownloaderStore.selectedFilters}
                            value={id}
                          />
                        </div>
                        <div class="!m-0">{typeof name === 'function' ? name() : name}</div>
                      </label>
                    {/each}
                  </div>
                </div>
              {/if}

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
                      bind:group={batchDownloaderStore.downloadAllPages}
                      name="justify"
                      value={true}>{t('downloader.category.filter.download_all_pages')}</RadioItem
                    >
                    <RadioItem
                      class="text-sm !py-[7px]"
                      bind:group={batchDownloaderStore.downloadAllPages}
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
                      min="1"
                      step="1"
                      required
                      disabled={batchDownloaderStore.downloadAllPages}
                      use:inputValidation={{
                        get() {
                          return batchDownloaderStore.pageStart;
                        },
                        set(v) {
                          batchDownloaderStore.pageStart = v;
                        }
                      }}
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
                      required
                      disabled={batchDownloaderStore.downloadAllPages}
                      use:inputValidation={{
                        get() {
                          return batchDownloaderStore.pageEnd;
                        },
                        set(v) {
                          batchDownloaderStore.pageEnd = v;
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            {:else if menuTabSet === 1}
              <InputChip
                bind:value={batchDownloaderStore.blacklistTag}
                allowUpperCase
                name="blacklist"
                chips="variant-filled-primary"
                placeholder={t('downloader.tag_filter.placeholder.blacklist_tag')}
              />
              <InputChip
                bind:value={batchDownloaderStore.whitelistTag}
                allowUpperCase
                name="whitelist"
                chips="variant-filled-primary"
                placeholder={t('downloader.tag_filter.placeholder.whitelist_tag')}
                class="my-4"
              />
            {:else if menuTabSet === 2}
              <div class="flex justify-between items-center text-base text-surface-700-200-token">
                <p>{t('downloader.others.options.retry_failed')}</p>
                <SlideToggle
                  size="sm"
                  name="download-retry"
                  bind:checked={batchDownloaderStore.retryFailed}
                ></SlideToggle>
              </div>
            {/if}
          </svelte:fragment>
        </TabGroup>
        <hr class="!border-t-1 my-4" />
      </div>
    {/if}

    <div class="flex relative my-4">
      {#if !downloading.current}
        <div
          bind:this={startDownloadEl}
          transition:fade={{ duration: 250 }}
          onintrostart={() =>
            // required when the transition reverses
            startDownloadEl.classList.remove('absolute')}
          onoutrostart={() => startDownloadEl.classList.add('absolute')}
          class="flex justify-end flex-grow w-full gap-4"
        >
          <div
            class="flex flex-grow flex-col justify-between overflow-hidden text-surface-700-200-token"
          >
            <p class="truncate">
              {downloadResult}
            </p>
            <p class="break-words" class:text-error-500={log.current?.type === 'Error'}>
              {log.current?.message ?? ''}
            </p>
          </div>

          {#if batchDownloadEntries && batchDownloadEntries.length > 1}
            <div class=" flex-none btn-group self-start">
              {#each batchDownloadEntries as [id, item]}
                {#if 'fn' in item}
                  <button
                    class="btn rounded-none !transform-none !variant-filled-primary"
                    onclick={() => {
                      startDownload(id);
                    }}
                  >
                    <i class="w-5">
                      {@html downloadSvg}
                    </i>
                    <span>{typeof item.name === 'function' ? item.name() : item.name}</span>
                  </button>
                {/if}
              {/each}
            </div>
          {:else if batchDownloadEntries && 'fn' in batchDownloadEntries[0][1]}
            <button
              class="btn variant-filled-primary self-start"
              onclick={() => {
                startDownload(batchDownloadEntries?.[0][0] ?? '');
              }}
            >
              <i class="w-5">
                {@html downloadSvg}
              </i>
              <span
                >{typeof batchDownloadEntries[0][1].name === 'function'
                  ? batchDownloadEntries[0][1].name()
                  : batchDownloadEntries[0][1].name}</span
              >
            </button>
          {/if}
        </div>
      {:else}
        <div
          bind:this={stopDownloadEl}
          transition:fade={{ duration: 250 }}
          class="flex flex-grow w-full gap-6 items-center"
          onintrostart={() => stopDownloadEl.classList.remove('absolute')}
          onoutrostart={() => stopDownloadEl.classList.add('absolute')}
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
              <p class="truncate" class:text-error-500={log.current?.type === 'Error'}>
                {log.current?.message ?? ''}
              </p>
              <p class=" flex-none">
                {artworkCount.current ? `${processed} / ${artworkCount.current}` : ''}
              </p>
            </div>
          </div>

          <button
            class="btn variant-filled-primary"
            onclick={() => {
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

{#if showDownloader}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    transition:fly={{ opacity: 0, x: 50 }}
    class="size-14 rounded-full fixed right-4 top-36 drop-shadow-xl cursor-pointer hover:brightness-110 backdrop-blur-sm"
    onclick={() => {
      showMenu = !showMenu;
    }}
  >
    <div
      data-theme="skeleton"
      class="avatar absolute -z-10 size-14 rounded-full overflow-hidden bg-scroll transition-opacity duration-[250ms]"
      class:opacity-70={!showMenu}
      class:blur-[1px]={!showMenu}
    >
      {#if avatarSrc}
        <img src={avatarSrc} alt="batch download" class="object-cover object-center size-full" />
      {/if}
    </div>

    {#if downloading.current && !showMenu}
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
      {#if downloading.current && artworkCount.current && !showMenu}
        <div
          transition:fade={{ duration: 250 }}
          bind:this={avatarProgressEl}
          onintrostart={() => avatarProgressEl.classList.remove('absolute')}
          onoutrostart={() => avatarProgressEl.classList.add('absolute')}
          class="flex flex-col justify-center items-center px-3 font-bold text-[12px] leading-[14px] overflow-hidden text-surface-700-200-token"
        >
          <span class=" truncate max-w-full">{processed}</span>
          <hr
            class="!border-t-1 my-[1px] self-stretch !border-surface-700 dark:!border-surface-200"
          />
          <span class=" truncate max-w-full">{artworkCount.current}</span>
        </div>
      {:else if !showMenu}
        <i
          transition:fade={{ duration: 250 }}
          bind:this={avatarDownloadIcon}
          onintrostart={() => avatarDownloadIcon.classList.remove('absolute')}
          onoutrostart={() => avatarDownloadIcon.classList.add('absolute')}
          class="w-6 fill-slate-700 dark:fill-slate-200 mix-blend-hard-light mt-4"
        >
          {@html downloadMultipleSvg}
        </i>
      {/if}
    </div>
  </div>
{/if}
