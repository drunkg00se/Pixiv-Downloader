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
      <p>祝各位假期愉快 ^_^</p>
      <li>
        新增（批量下载）：重新支持批量下载完成后对下载失败的图片进行重试，请在批量下载面板【其它】中启用。
      </li>
      <li>
        新增（下载历史）：现在可以在【设置】【下载历史】中设置定期自动备份下载历史，避免清理浏览器导致记录意外丢失。
      </li>
      <li>调整（批量下载）：不再支持多个标签页同时进行批量下载，以避免过于频繁的网络请求。</li>
      <li>修复（批量下载）：某些情况下批量下载【已关注用户的新作】时无法完成下载的问题。</li>
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
