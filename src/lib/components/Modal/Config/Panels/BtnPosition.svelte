<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import t from '@/lib/lang';
  import { env } from '@/lib/env';
  import {
    ThumbnailBtnStatus,
    ThumbnailBtnType,
    ThumbnailButton
  } from '@/lib/components/Button/thumbnailButton';
  import { getContext, onMount } from 'svelte';
  import type { Config } from '@/lib/config';

  type BtnPosProp =
    | 'pdl-btn-self-bookmark-left'
    | 'pdl-btn-self-bookmark-top'
    | 'pdl-btn-left'
    | 'pdl-btn-top';

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

  const configStore: Config = getContext('store');

  const ulClasses = $derived(
    `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${UlClass}`
  );

  const max = 100;
  const step = 4;

  let btnLeft = $state($configStore['pdl-btn-left']);
  let btnTop = $state($configStore['pdl-btn-top']);
  let bookmarkBtnLeft = $state($configStore['pdl-btn-self-bookmark-left']);
  let bookmarkBtnTop = $state($configStore['pdl-btn-self-bookmark-top']);

  $effect(() => changeCssProp('--pdl-btn-left', btnLeft));
  $effect(() => changeCssProp('--pdl-btn-top', btnTop));
  $effect(() => changeCssProp('--pdl-btn-self-bookmark-left', bookmarkBtnLeft));
  $effect(() => changeCssProp('--pdl-btn-self-bookmark-top', bookmarkBtnTop));

  // 预览按钮
  let buttonContainer: HTMLDivElement;

  onMount(() => {
    const sampleBtn = new ThumbnailButton({
      id: '0',
      shouldObserveDb: false,
      onClick: () => void 0
    });
    sampleBtn.setAttribute('disabled', '');

    buttonContainer.appendChild(sampleBtn);

    if (!env.isPixiv()) return;

    const sampleBookmarkBtn = new ThumbnailButton({
      id: '0',
      type: ThumbnailBtnType.PixivMyBookmark,
      shouldObserveDb: false,
      onClick: () => void 0
    });
    sampleBookmarkBtn.setAttribute('disabled', '');
    sampleBookmarkBtn.setStatus(ThumbnailBtnStatus.Complete);

    buttonContainer.appendChild(sampleBookmarkBtn);
  });

  function updateBtnPosConfig(key: BtnPosProp, val: number) {
    $configStore[key] = val;
  }

  function changeCssProp(key: string, value: number) {
    document.documentElement.style.setProperty(key, String(value));
  }
</script>

<div class={sectionSpace}>
  <div class="flex items-center justify-center">
    <div
      bind:this={buttonContainer}
      class="w-48 h-48 backdrop-blur-sm rounded-lg relative {bg}"
    ></div>
  </div>

  <section>
    <p class={sectionTitle}>{t('setting.button_position.label.common')}</p>
    <ul class={ulClasses}>
      <li class="flex-col !items-stretch md:flex-row md:!items-baseline gap-4 *:!m-0">
        <RangeSlider
          name="pdl-btn-left"
          {step}
          {max}
          ticked
          class="flex-grow"
          bind:value={btnLeft}
          on:change={() => updateBtnPosConfig('pdl-btn-left', btnLeft)}
        >
          <div class="flex justify-between items-center">
            <p>{t('setting.button_position.options.horizon_position')}</p>
            <div class="text-xs">{btnLeft} / {max}</div>
          </div>
        </RangeSlider>
        <RangeSlider
          name="pdl-btn-top"
          {step}
          {max}
          ticked
          class="flex-grow"
          bind:value={btnTop}
          on:change={() => updateBtnPosConfig('pdl-btn-top', btnTop)}
        >
          <div class="flex justify-between items-center">
            <p>{t('setting.button_position.options.vertical_position')}</p>
            <div class="text-xs">{btnTop} / {max}</div>
          </div>
        </RangeSlider>
      </li>
    </ul>
  </section>

  {#if env.isPixiv()}
    <section>
      <p class={sectionTitle}>{t('setting.button_position.label.my_bookmark')}</p>
      <ul class={ulClasses}>
        <li class="flex-col !items-stretch md:flex-row md:!items-baseline gap-4 *:!m-0">
          <RangeSlider
            name="pdl-bookmark-btn-left"
            {step}
            {max}
            ticked
            class="flex-grow"
            bind:value={bookmarkBtnLeft}
            on:change={() => updateBtnPosConfig('pdl-btn-self-bookmark-left', bookmarkBtnLeft)}
          >
            <div class="flex justify-between items-center">
              <p>{t('setting.button_position.options.horizon_position')}</p>
              <div class="text-xs">{bookmarkBtnLeft} / {max}</div>
            </div>
          </RangeSlider>
          <RangeSlider
            name="pdl-bookmark-btn-top"
            {step}
            {max}
            ticked
            class="flex-grow"
            bind:value={bookmarkBtnTop}
            on:change={() => updateBtnPosConfig('pdl-btn-self-bookmark-top', bookmarkBtnTop)}
          >
            <div class="flex justify-between items-center">
              <p>{t('setting.button_position.options.vertical_position')}</p>
              <div class="text-xs">{bookmarkBtnTop} / {max}</div>
            </div>
          </RangeSlider>
        </li>
      </ul>
    </section>
  {/if}
</div>
