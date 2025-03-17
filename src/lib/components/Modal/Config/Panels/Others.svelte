<script lang="ts">
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import t from '@/lib/lang';
  import { env } from '@/lib/env';
  import { getContext } from 'svelte';
  import type { Config } from '@/lib/config';

  let {
    bg = 'bg-white/30 dark:bg-black/15',
    border = 'divide-y-[1px] *:border-surface-300-600-token',
    padding = 'px-4 *:py-4',
    margin = 'mt-2 *:!m-0',
    rounded = 'rounded-container-token *:!rounded-none',
    sectionSpace = `space-y-4`,
    sectionTitle = 'font-bold',
    descriptionText = 'text-sm text-surface-400',
    class: UlClass = ''
  } = $props();

  const configStore: Config = getContext('store');

  const ulClasses = $derived(
    `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${UlClass}`
  );
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<div class={sectionSpace}>
  <ul class={ulClasses}>
    <li>
      <p class="flex-auto">{t('setting.others.options.show_setting_button')}</p>
      <SlideToggle name="show-popup-button" bind:checked={$configStore.showPopupButton} size="sm"
      ></SlideToggle>
    </li>

    {#if env.isPixiv() || env.isNijie()}
      <li>
        <p class="flex-auto">{t('setting.others.options.bundle_multipage_illust')}</p>
        <SlideToggle name="bundle-illusts" bind:checked={$configStore.bundleIllusts} size="sm"
        ></SlideToggle>
      </li>
    {/if}

    {#if env.isPixiv()}
      <li>
        <p class="flex-auto">{t('setting.others.options.bundle_manga')}</p>
        <SlideToggle name="bundle-manga" bind:checked={$configStore.bundleManga} size="sm"
        ></SlideToggle>
      </li>
      <li>
        <div class="flex-auto">
          <p>{t('setting.others.options.like_illust_when_downloading')}</p>
          <p class={descriptionText}>
            {t('setting.others.options.option_does_not_apply_to_batch_download')}
          </p>
        </div>
        <SlideToggle name="bundle-manga" bind:checked={$configStore.likeIllust} size="sm"
        ></SlideToggle>
      </li>
    {/if}

    <li class="flex-col !items-stretch">
      <div class="flex items-center">
        <div class="flex-auto">
          <p>{t('setting.others.options.add_bookmark_when_downloading')}</p>
          <p class={descriptionText}>
            {t('setting.others.options.option_does_not_apply_to_batch_download')}
          </p>
        </div>
        <SlideToggle name="fsa-enable" bind:checked={$configStore.addBookmark} size="sm"
        ></SlideToggle>
      </div>

      {#if $configStore.addBookmark && (env.isPixiv() || env.isNijie())}
        <ul class="list {border} {rounded} [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4">
          <li>
            <label class="label flex flex-grow items-center justify-center">
              <p class="flex-auto">{t('setting.others.options.add_bookmark_with_tags')}</p>
              <SlideToggle
                name="fsa-enable"
                bind:checked={$configStore.addBookmarkWithTags}
                size="sm"
              ></SlideToggle>
            </label>
          </li>

          {#if env.isPixiv()}
            <li>
              <label class="label flex flex-grow items-center justify-center">
                <p class="flex-auto">{t('setting.others.options.add_bookmark_private_r18')}</p>
                <SlideToggle name="fsa-enable" bind:checked={$configStore.privateR18} size="sm"
                ></SlideToggle>
              </label>
            </li>
          {/if}
        </ul>
      {/if}
    </li>
  </ul>

  {#if env.isPixiv()}
    <section>
      <p class={sectionTitle}>实验性功能</p>
      <ul class={ulClasses}>
        <li>
          <div class="flex-auto">
            <p>为单页插图增加 #pixivGlow2024 效果</p>
            <p class="{descriptionText} !text-error-500">
              * 转换至动图格式。如果插图尺寸过大，可能占用大量内存 / 转换失败
            </p>
          </div>
          <SlideToggle name="mix-effect" bind:checked={$configStore.mixEffect} size="sm"
          ></SlideToggle>
        </li>
      </ul>
    </section>
  {/if}
</div>
