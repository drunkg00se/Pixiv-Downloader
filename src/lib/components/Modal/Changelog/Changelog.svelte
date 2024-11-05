<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import creditCode from '@/assets/credit.png';
  import ModalWrapper from '../ModalWrapper.svelte';
  import t from '@/lib/lang';

  const anchorFocus = `focus:!outline-none focus:decoration-wavy`;
  const anchor = `leading-loose anchor underline-offset-2 ${anchorFocus}`;

  export let parent: SvelteComponent;

  let showCreditCode: boolean = false;

  $: gridRows = showCreditCode ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]';
</script>

<ModalWrapper {parent}>
  <!-- svelte-ignore missing-declaration -->
  <header class="modal-header text-2xl font-bold">Pixiv Downloader {__VERSION__}</header>
  <article class="modal-body mt-4">
    <ul class="list-disc list-inside leading-loose">
      <li>
        新增：现在可以批量下载pixiv<a
          href="https://www.pixiv.net/user/3617446/series/136196"
          target="_blank"
          class="anchor">漫画系列</a
        >。
      </li>
      <li>新增：现在可以批量下载Danbooru: posts, pools, favorite groups。</li>
      <li>
        新增：现在可以在【设置】【其它】中填入cf_clearance cookie（rule34无法正常下载图片时）。
      </li>
      <li>修复：Pixiv多图预览按钮被遮挡的问题。</li>
      <li>修复：切换主题时Pixiv收藏标签按钮颜色不改变的问题。</li>
    </ul>
  </article>
  <footer class="modal-footer mt-4">
    <!-- use `<details>` again when `height: calc-size(auto)` is widely supported -->

    <div class="flex justify-between items-center text-sm">
      <button class={anchor} on:click={() => (showCreditCode = !showCreditCode)}
        >{t('changelog.credit')}</button
      >
      <a class={anchor} target="_blank" href="https://github.com/drunkg00se/Pixiv-Downloader/issues"
        >{t('changelog.feedback')}</a
      >
    </div>

    <div class="grid transition-[grid-template-rows] duration-[400ms] {gridRows}">
      <div class="flex justify-center items-center min-h-0 gap-14 overflow-hidden">
        <img src={creditCode} alt="credit" class="rounded-full" />
        <p class="flex flex-col h-full justify-evenly">
          <a href="https://github.com/drunkg00se/Pixiv-Downloader" target="_blank" class="anchor"
            >{t('changelog.give_me_a_star')}</a
          >
          <span>{t('changelog.buy_me_a_drink')}</span>
        </p>
      </div>
    </div>
  </footer>
</ModalWrapper>
