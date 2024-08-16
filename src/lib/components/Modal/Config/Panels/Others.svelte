<script lang="ts">
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import store from '../store';
  import t from '@/lib/lang';
  import { env } from '@/lib/env';

  export let bg = 'bg-white/30 dark:bg-black/15';
  export let border = 'divide-y-[1px] *:border-surface-300-600-token';
  export let padding = 'px-4 *:py-4';
  export let margin = 'mt-2 *:!m-0';
  export let rounded = 'rounded-container-token *:!rounded-none';
  export let descritionText = 'text-sm text-surface-400';

  $: ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ''}`;

  export let sectionSpace = `space-y-4`;
  export let sectionTitle = 'font-bold';
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<div class={sectionSpace}>
  <ul class={ulClasses}>
    <li>
      <p class="flex-auto">{t('setting.others.options.show_setting_button')}</p>
      <SlideToggle name="show-popup-button" bind:checked={$store.showPopupButton} size="sm"
      ></SlideToggle>
    </li>
    {#if env.isPixiv()}
      <li>
        <p class="flex-auto">{t('setting.others.options.bundle_multipage_illust')}</p>
        <SlideToggle name="bundle-illusts" bind:checked={$store.bundleIllusts} size="sm"
        ></SlideToggle>
      </li>
      <li>
        <p class="flex-auto">{t('setting.others.options.bundle_manga')}</p>
        <SlideToggle name="bundle-manga" bind:checked={$store.bundleManga} size="sm"></SlideToggle>
      </li>
    {/if}
    {#if !env.isYande()}
      <li class="flex-col !items-stretch">
        <div class="flex items-center">
          <p class="flex-auto">{t('setting.others.options.add_bookmark_when_download')}</p>
          <SlideToggle name="fsa-enable" bind:checked={$store.addBookmark} size="sm"></SlideToggle>
        </div>
        {#if $store.addBookmark && env.isPixiv()}
          <ul class="list {border} {rounded} [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4">
            <li>
              <label class="label flex flex-grow items-center justify-center">
                <p class="flex-auto">{t('setting.others.options.add_bookmark_with_tags')}</p>
                <SlideToggle name="fsa-enable" bind:checked={$store.addBookmarkWithTags} size="sm"
                ></SlideToggle>
              </label>
            </li>
            <li>
              <label class="label flex flex-grow items-center justify-center">
                <p class="flex-auto">{t('setting.others.options.add_bookmark_private_r18')}</p>
                <SlideToggle name="fsa-enable" bind:checked={$store.privateR18} size="sm"
                ></SlideToggle>
              </label>
            </li>
          </ul>
        {/if}
      </li>
    {/if}
  </ul>
  {#if env.isPixiv()}
    <section>
      <p class={sectionTitle}>实验性功能</p>
      <ul class={ulClasses}>
        <li>
          <div class="flex-auto">
            <p>为单页插图增加 #pixivGlow2024 效果</p>
            <p class="{descritionText} !text-error-500">
              * 根据插图尺寸不同，可能占用大量内存 / 转换失败
            </p>
          </div>
          <SlideToggle name="mix-effect" bind:checked={$store.mixEffect} size="sm"></SlideToggle>
        </li>
      </ul>
    </section>
  {/if}
</div>
