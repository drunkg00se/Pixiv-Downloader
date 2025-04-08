<script lang="ts">
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { env } from '@/lib/env';
  import { t } from '@/lib/i18n.svelte';
  import { siteFeature } from '@/lib/store/siteFeature.svelte';
  import { clientSetting } from '@/lib/store/clientSetting.svelte';

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

  const ulClasses = $derived(
    `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${UlClass}`
  );
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<div class={sectionSpace}>
  <ul class={ulClasses}>
    <li>
      <p class="flex-auto">{t('setting.others.options.show_setting_button')}</p>
      <SlideToggle name="show-popup-button" bind:checked={clientSetting.showPopupButton} size="sm"
      ></SlideToggle>
    </li>

    {#if env.isPixiv() || env.isNijie()}
      <li>
        <p class="flex-auto">{t('setting.others.options.bundle_multipage_illust')}</p>
        <SlideToggle
          name="bundle-illusts"
          bind:checked={siteFeature.compressMultiIllusts!}
          size="sm"
        ></SlideToggle>
      </li>
    {/if}

    {#if env.isPixiv()}
      <li>
        <p class="flex-auto">{t('setting.others.options.bundle_manga')}</p>
        <SlideToggle name="bundle-manga" bind:checked={siteFeature.compressManga!} size="sm"
        ></SlideToggle>
      </li>
      <li>
        <div class="flex-auto">
          <p>{t('setting.others.options.like_illust_when_downloading')}</p>
          <p class={descriptionText}>
            {t('setting.others.options.option_does_not_apply_to_batch_download')}
          </p>
        </div>
        <SlideToggle
          name="like-illust"
          bind:checked={siteFeature.likeIllustWhenDownloading!}
          size="sm"
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
        <SlideToggle name="add-bookmark" bind:checked={siteFeature.addBookmark!} size="sm"
        ></SlideToggle>
      </div>

      {#if siteFeature.addBookmark && (env.isPixiv() || env.isNijie())}
        <ul class="list {border} {rounded} [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4">
          <li>
            <label class="label flex flex-grow items-center justify-center">
              <p class="flex-auto">{t('setting.others.options.add_bookmark_with_tags')}</p>
              <SlideToggle
                name="bookmark-with-tags"
                bind:checked={siteFeature.bookmarkWithTags!}
                size="sm"
              ></SlideToggle>
            </label>
          </li>

          {#if env.isPixiv()}
            <li>
              <label class="label flex flex-grow items-center justify-center">
                <p class="flex-auto">{t('setting.others.options.add_bookmark_private_r18')}</p>
                <SlideToggle
                  name="private-bookmark-if-r18"
                  bind:checked={siteFeature.privateBookmarkIfR18!}
                  size="sm"
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
          <SlideToggle name="mix-effect" bind:checked={siteFeature.mixSeasonalEffect!} size="sm"
          ></SlideToggle>
        </li>
      </ul>
    </section>
  {/if}
</div>
