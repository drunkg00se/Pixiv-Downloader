<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { env } from '@/lib/env';
  import {
    ThumbnailBtnStatus,
    ThumbnailBtnType,
    ThumbnailButton
  } from '@/lib/components/Button/thumbnailButton';
  import { onMount } from 'svelte';
  import { t } from '@/lib/i18n.svelte';
  import { buttonPosition, ButtonStyleVariable } from '@/lib/store/buttonPosition.svelte';

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

  const ulClasses = $derived(
    `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${UlClass}`
  );

  const max = 100;
  const step = 4;

  $effect(() =>
    buttonPosition.update(
      ButtonStyleVariable.LEFT,
      buttonPosition.current[ButtonStyleVariable.LEFT]
    )
  );

  $effect(() =>
    buttonPosition.update(ButtonStyleVariable.TOP, buttonPosition.current[ButtonStyleVariable.TOP])
  );

  if (env.isPixiv()) {
    $effect(() =>
      buttonPosition.update(
        ButtonStyleVariable.PIXIV_BOOKMARK_LEFT,
        buttonPosition.current[ButtonStyleVariable.PIXIV_BOOKMARK_LEFT]
      )
    );

    $effect(() =>
      buttonPosition.update(
        ButtonStyleVariable.PIXIV_BOOKMARK_TOP,
        buttonPosition.current[ButtonStyleVariable.PIXIV_BOOKMARK_TOP]
      )
    );
  }

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
          bind:value={buttonPosition.current[ButtonStyleVariable.LEFT]}
        >
          <div class="flex justify-between items-center">
            <p>{t('setting.button_position.options.horizon_position')}</p>
            <div class="text-xs">{buttonPosition.current[ButtonStyleVariable.LEFT]} / {max}</div>
          </div>
        </RangeSlider>
        <RangeSlider
          name="pdl-btn-top"
          {step}
          {max}
          ticked
          class="flex-grow"
          bind:value={buttonPosition.current[ButtonStyleVariable.TOP]}
        >
          <div class="flex justify-between items-center">
            <p>{t('setting.button_position.options.vertical_position')}</p>
            <div class="text-xs">{buttonPosition.current[ButtonStyleVariable.TOP]} / {max}</div>
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
            bind:value={buttonPosition.current[ButtonStyleVariable.PIXIV_BOOKMARK_LEFT]}
          >
            <div class="flex justify-between items-center">
              <p>{t('setting.button_position.options.horizon_position')}</p>
              <div class="text-xs">
                {buttonPosition.current[ButtonStyleVariable.PIXIV_BOOKMARK_LEFT]} / {max}
              </div>
            </div>
          </RangeSlider>
          <RangeSlider
            name="pdl-bookmark-btn-top"
            {step}
            {max}
            ticked
            class="flex-grow"
            bind:value={buttonPosition.current[ButtonStyleVariable.PIXIV_BOOKMARK_TOP]}
          >
            <div class="flex justify-between items-center">
              <p>{t('setting.button_position.options.vertical_position')}</p>
              <div class="text-xs">
                {buttonPosition.current[ButtonStyleVariable.PIXIV_BOOKMARK_TOP]} / {max}
              </div>
            </div>
          </RangeSlider>
        </li>
      </ul>
    </section>
  {/if}
</div>
