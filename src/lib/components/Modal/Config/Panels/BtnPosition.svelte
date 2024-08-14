<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import store from '../store';
  import t from '@/lib/lang';
  import { env } from '@/lib/env';
  import { ThumbnailBtnType, ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
  import { onMount, tick } from 'svelte';

  export let bg = 'bg-white/30 dark:bg-black/15';
  export let border = 'divide-y-[1px] *:border-surface-300-600-token';
  export let padding = 'px-4 *:py-4';
  export let margin = 'mt-2 *:!m-0';
  export let rounded = 'rounded-container-token *:!rounded-none';

  $: ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ''}`;

  export let sectionSpace = `space-y-4`;
  export let sectionTitle = 'font-bold';

  const max = 100;
  const step = 4;

  let btnLeft = $store['pdl-btn-left'];
  let btnTop = $store['pdl-btn-top'];
  let bookmarkBtnLeft = $store['pdl-btn-self-bookmark-left'];
  let bookmarkBtnTop = $store['pdl-btn-self-bookmark-top'];

  type BtnPosProp =
    | 'pdl-btn-self-bookmark-left'
    | 'pdl-btn-self-bookmark-top'
    | 'pdl-btn-left'
    | 'pdl-btn-top';
  function updateBtnPosConfig(key: BtnPosProp, val: number) {
    $store[key] = val;
  }

  function changeCssProp(key: string, value: number) {
    document.documentElement.style.setProperty(key, String(value));
  }

  $: changeCssProp('--pdl-btn-left', btnLeft);
  $: changeCssProp('--pdl-btn-top', btnTop);
  $: changeCssProp('--pdl-btn-self-bookmark-left', bookmarkBtnLeft);
  $: changeCssProp('--pdl-btn-self-bookmark-top', bookmarkBtnTop);

  // 预览按钮

  let buttonContainer: HTMLDivElement;
  const sampleBtn = new ThumbnailButton({
    id: '0',
    onClick: () => void 0
  });

  const sampleBookmarkBtn = new ThumbnailButton({
    id: '0',
    type: ThumbnailBtnType.PixivMyBookmark,
    onClick: () => void 0
  });

  sampleBtn.setAttribute('disabled', '');
  sampleBookmarkBtn.setAttribute('disabled', '');

  onMount(async () => {
    buttonContainer.appendChild(sampleBtn);
    if (env.isPixiv()) {
      buttonContainer.appendChild(sampleBookmarkBtn);

      await tick();
      sampleBookmarkBtn.dataset.status = 'complete';
    }
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
