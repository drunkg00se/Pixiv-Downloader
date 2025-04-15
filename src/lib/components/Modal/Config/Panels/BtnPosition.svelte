<script lang="ts">
  import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';
  import { env } from '@/lib/env';
  import {
    ThumbnailBtnStatus,
    ThumbnailBtnType,
    ThumbnailButton
  } from '@/lib/components/Button/thumbnailButton';
  import { onMount } from 'svelte';
  import { t } from '@/lib/i18n.svelte';
  import {
    BtnAlignX,
    BtnAlignY,
    BtnLengthUnit,
    buttonPosition,
    ButtonStyle
  } from '@/lib/store/buttonPosition.svelte';
  import { inputValidation } from '@/lib/components/Actions/inputValidation.svelte';
  import alignLeft from '@/assets/align-left.svg?src';
  import alignRight from '@/assets/align-right.svg?src';
  import alignTop from '@/assets/align-start-horizontal.svg?src';
  import alignBottom from '@/assets/align-end-horizontal.svg?src';

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
      class="w-48 h-48 backdrop-blur-sm rounded-lg relative overflow-hidden {bg}"
    ></div>
  </div>

  <section>
    <p class={sectionTitle}>{t('setting.button_position.label.common')}</p>
    <ul class={ulClasses}>
      <li class="flex-col !items-stretch md:flex-row md:!items-baseline gap-4 *:!m-0">
        <div class=" flex-1">
          <div class="flex justify-between items-center">
            <p>{t('setting.button_position.options.horizontal_position')}</p>
            <RadioGroup>
              <RadioItem
                bind:group={buttonPosition.thumbnailBtnUnitX}
                name="thumbnail-btn-unit-x"
                value={BtnLengthUnit.PERCENT}
                class=" text-xs">%</RadioItem
              >
              <RadioItem
                bind:group={buttonPosition.thumbnailBtnUnitX}
                name="thumbnail-btn-unit-x"
                value={BtnLengthUnit.PX}
                class=" text-xs">px</RadioItem
              >
            </RadioGroup>
          </div>

          <div class="flex flex-row mt-2 gap-1 h-8">
            {#if buttonPosition.thumbnailBtnUnitX === BtnLengthUnit.PX}
              <button
                class="btn variant-filled rounded-r-none text-xl flex-[1]"
                onclick={() => (buttonPosition['--pdl-btn-left-px'] += 1)}>+</button
              >
              <input
                type="number"
                class="input variant-form-material text-sm flex-[3]"
                min="0"
                use:inputValidation={{
                  get() {
                    return buttonPosition['--pdl-btn-left-px'];
                  },
                  set(val) {
                    buttonPosition['--pdl-btn-left-px'] = val;
                  }
                }}
              />
              <button
                class=" btn variant-filled rounded-l-none text-xl flex-[1]"
                onclick={() => (buttonPosition['--pdl-btn-left-px'] -= 1)}
                disabled={buttonPosition['--pdl-btn-left-px'] < 1}>-</button
              >
            {:else}
              <RangeSlider
                name="thumbnail-btn-left"
                {step}
                {max}
                ticked
                class=" flex-grow self-center"
                bind:value={buttonPosition[ButtonStyle.LEFT_PERCENT]}
              ></RangeSlider>
            {/if}
          </div>
        </div>

        <div class=" flex-1">
          <div class="flex justify-between items-center">
            <p>{t('setting.button_position.options.vertical_position')}</p>
            <RadioGroup>
              <RadioItem
                bind:group={buttonPosition.thumbnailBtnUnitY}
                name="thumbnail-btn-unit-y"
                value={BtnLengthUnit.PERCENT}
                class=" text-xs">%</RadioItem
              >
              <RadioItem
                bind:group={buttonPosition.thumbnailBtnUnitY}
                name="thumbnail-btn-unit-y"
                value={BtnLengthUnit.PX}
                class=" text-xs">px</RadioItem
              >
            </RadioGroup>
          </div>

          <div class="flex flex-row mt-2 gap-1 h-8">
            {#if buttonPosition.thumbnailBtnUnitY === BtnLengthUnit.PX}
              <button
                class="btn variant-filled rounded-r-none text-xl flex-[1]"
                onclick={() => (buttonPosition['--pdl-btn-top-px'] += 1)}>+</button
              >
              <input
                type="number"
                class="input variant-form-material text-sm flex-[3]"
                min="0"
                use:inputValidation={{
                  get() {
                    return buttonPosition['--pdl-btn-top-px'];
                  },
                  set(val) {
                    buttonPosition['--pdl-btn-top-px'] = val;
                  }
                }}
              />
              <button
                class=" btn variant-filled rounded-l-none text-xl flex-[1]"
                onclick={() => (buttonPosition['--pdl-btn-top-px'] -= 1)}
                disabled={buttonPosition['--pdl-btn-top-px'] < 1}>-</button
              >
            {:else}
              <RangeSlider
                name="thumbnail-btn-top"
                {step}
                {max}
                ticked
                class=" flex-grow self-center"
                bind:value={buttonPosition[ButtonStyle.TOP_PERCENT]}
              ></RangeSlider>
            {/if}
          </div>
        </div>
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
            bind:value={buttonPosition[ButtonStyle.PIXIV_BOOKMARK_LEFT_PERCENT]}
          >
            <div class="flex justify-between items-center">
              <p>{t('setting.button_position.options.horizontal_position')}</p>
              <div class="text-xs">
                {buttonPosition[ButtonStyle.PIXIV_BOOKMARK_LEFT_PERCENT]} / {max}
              </div>
            </div>
          </RangeSlider>
          <RangeSlider
            name="pdl-bookmark-btn-top"
            {step}
            {max}
            ticked
            class="flex-grow"
            bind:value={buttonPosition[ButtonStyle.PIXIV_BOOKMARK_TOP_PERCENT]}
          >
            <div class="flex justify-between items-center">
              <p>{t('setting.button_position.options.vertical_position')}</p>
              <div class="text-xs">
                {buttonPosition[ButtonStyle.PIXIV_BOOKMARK_TOP_PERCENT]} / {max}
              </div>
            </div>
          </RangeSlider>
        </li>
      </ul>
    </section>
  {/if}

  <section>
    <p class={sectionTitle}>{t('setting.button_position.label.gallery')}</p>
    <ul class={ulClasses}>
      <li class="flex-col !items-stretch md:flex-row md:!items-center gap-4 *:!m-0">
        <div class="flex flex-1 justify-between items-center">
          <p>{t('setting.button_position.options.horizontal_alignment')}</p>
          <RadioGroup>
            <RadioItem
              bind:group={buttonPosition.artworkBtnAlignX}
              name="artwork-align-x"
              value={BtnAlignX.LEFT}
              class=" text-xs"
            >
              <i>{@html alignLeft}</i>
            </RadioItem>
            <RadioItem
              bind:group={buttonPosition.artworkBtnAlignX}
              name="artwork-align-x"
              value={BtnAlignX.RIGHT}
              class=" text-xs"
            >
              <i>{@html alignRight}</i>
            </RadioItem>
          </RadioGroup>
        </div>

        <div class="flex flex-1 justify-between items-center">
          <p>{t('setting.button_position.options.vertical_alignment')}</p>
          <RadioGroup>
            <RadioItem
              bind:group={buttonPosition.artworkBtnAlignY}
              name="artwork-align-y"
              value={BtnAlignY.TOP}
              class=" text-xs"
            >
              <i>{@html alignTop}</i>
            </RadioItem>
            <RadioItem
              bind:group={buttonPosition.artworkBtnAlignY}
              name="artwork-align-y"
              value={BtnAlignY.BOTTOM}
              class=" text-xs"
            >
              <i>{@html alignBottom}</i>
            </RadioItem>
          </RadioGroup>
        </div>
      </li>
    </ul>
  </section>
</div>
