<script lang="ts">
  import { RadioGroup, RadioItem, SlideToggle } from '@skeletonlabs/skeleton';
  import { UgoiraFormat } from '@/lib/config';
  import store from '../store';
  import t from '@/lib/lang';
  import { env } from '@/lib/env';
  import { nonNegativeInt } from '@/lib/components/Actions/nonNegativeInt';

  export let bg = 'bg-white/30 dark:bg-black/15';
  export let border = 'divide-y-[1px] *:border-surface-300-600-token';
  export let padding = 'px-4 *:py-4';
  export let margin = 'mt-2 *:!m-0';
  export let rounded = 'rounded-container-token *:!rounded-none';
  export let descriptionText = 'text-sm text-surface-400';
  export let inputRounded = 'rounded-full';
  export let inputWidth = 'w-32';

  $: ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ''}`;
  $: inputClasses = `${inputWidth} ${inputRounded} shrink-0`;

  export let sectionSpace = `space-y-4`;
  export let sectionTitle = 'font-bold';
</script>

<div class={sectionSpace}>
  <section>
    <p class={sectionTitle}>{t('setting.ugoira.label.format')}</p>
    <ul class={ulClasses}>
      <li>
        <p class="flex-auto">{t('setting.ugoira.options.select_format')}</p>
        <RadioGroup class="shrink-0">
          <RadioItem
            name="ugoiraFormat"
            class="text-sm"
            bind:group={$store.ugoiraFormat}
            value={UgoiraFormat.ZIP}>Zip</RadioItem
          >

          <RadioItem
            name="ugoiraFormat"
            class="text-sm"
            bind:group={$store.ugoiraFormat}
            value={UgoiraFormat.WEBM}>Webm</RadioItem
          >
          <RadioItem
            disabled={!env.videoFrameSupported()}
            class="text-sm"
            bind:group={$store.ugoiraFormat}
            name="ugoiraFormat"
            value={UgoiraFormat.MP4}>Mp4</RadioItem
          >
          <RadioItem
            name="ugoiraFormat"
            class="text-sm"
            bind:group={$store.ugoiraFormat}
            value={UgoiraFormat.WEBP}>Webp</RadioItem
          >
          <RadioItem
            name="ugoiraFormat"
            class="text-sm"
            bind:group={$store.ugoiraFormat}
            value={UgoiraFormat.GIF}>Gif</RadioItem
          >
          <RadioItem
            name="ugoiraFormat"
            class="text-sm"
            bind:group={$store.ugoiraFormat}
            value={UgoiraFormat.PNG}>Png</RadioItem
          >
        </RadioGroup>
      </li>
    </ul>
  </section>

  <section>
    <p class={sectionTitle}>{t('setting.ugoira.label.quality')}</p>
    <ul class={ulClasses}>
      <li>
        <div class="flex-auto">
          <p>Webm</p>
          <p class={descriptionText}>Bitrate (Mbps)</p>
        </div>
        <input
          type="number"
          class="input {inputClasses}"
          min="1"
          max="120"
          step="1"
          use:nonNegativeInt={{ store, key: 'webmBitrate' }}
          bind:value={$store.webmBitrate}
        />
      </li>
      <li>
        <div class="flex-auto">
          <p>Mp4</p>
          <p class={descriptionText}>Bitrate (Mbps)</p>
        </div>
        <input
          type="number"
          class="input {inputClasses}"
          min="1"
          max="99"
          step="1"
          use:nonNegativeInt={{ store, key: 'mp4Bitrate' }}
          bind:value={$store.mp4Bitrate}
        />
      </li>
      <li class="flex-col !items-stretch">
        <p>Webp</p>
        <ul class="list {border} {rounded} [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4">
          <li class="items-center">
            <p class="flex-auto">{t('setting.ugoira.options.webp_lossy')}</p>
            <SlideToggle name="lossless-webp" bind:checked={$store.losslessWebp} size="sm"
            ></SlideToggle>
          </li>

          <li class="items-center">
            <div class="flex-auto">
              <p>{t('setting.ugoira.options.webp_quality')}</p>
              <p class={descriptionText}>{t('setting.ugoira.options.webp_quality_tips')}</p>
            </div>
            <input
              type="number"
              class="input {inputClasses}"
              min="0"
              max="100"
              step="1"
              use:nonNegativeInt={{ store, key: 'webpQuality' }}
              bind:value={$store.webpQuality}
            />
          </li>
          <li class="items-center">
            <div class="flex-auto">
              <p>{t('setting.ugoira.options.webp_method')}</p>
              <p class={descriptionText}>{t('setting.ugoira.options.webp_method_tips')}</p>
            </div>

            <select class="select {inputClasses}" bind:value={$store.webpMehtod}>
              {#each Array.from({ length: 7 }, (_, idx) => idx) as quality}
                <option value={quality}>{quality}</option>
              {/each}
            </select>
          </li>
        </ul>
      </li>
      <li>
        <div class="flex-auto">
          <p>Gif</p>
          <p class={descriptionText}>
            {t('setting.ugoira.options.gif_tips')}
          </p>
        </div>
        <select class="select {inputClasses}" bind:value={$store.gifQuality}>
          {#each Array.from({ length: 20 }, (_, idx) => idx) as quality}
            <option value={quality + 1}>{quality + 1}</option>
          {/each}
        </select>
      </li>
      <li>
        <div class="flex-auto">
          <p>Png</p>
          <p class={descriptionText}>{t('setting.ugoira.options.png_tips')}</p>
        </div>
        <input
          type="number"
          class="input {inputClasses}"
          min="0"
          max="256"
          step="1"
          use:nonNegativeInt={{ store, key: 'pngColor' }}
          bind:value={$store.pngColor}
        />
      </li>
    </ul>
  </section>
</div>
