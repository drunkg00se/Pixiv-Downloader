<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import creditCode from '@/assets/credit.png';
  import ModalWrapper from '../ModalWrapper.svelte';
  import t from '@/lib/lang';

  const anchorFocus = `focus:!outline-none focus:decoration-wavy`;
  const anchor = `leading-loose anchor underline-offset-2 ${anchorFocus}`;

  export let parent: SvelteComponent;

  let showCreditCode: boolean = false;

  $: gridRows = showCreditCode ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]';
</script>

<ModalWrapper {parent}>
  <!-- svelte-ignore missing-declaration -->
  <header class="modal-header text-2xl font-bold">Pixiv Downloader {__VERSION__}</header>
  <article class="modal-body mt-4">
    <ul class="list-disc list-inside leading-loose">
      <li>
        新增: 支持新网站：<a class={anchor} href="https://yande.re/post" target="_blank">Yande.re</a
        >。
      </li>
      <li>新增（Pixiv, Danbooru）: 现在会将作品简介保存到历史记录中。</li>
      <li>新增（Pixiv）: 现在会单独记录多页插图每一页是否已下载。</li>
      <li>新增（设置）: 现在可以调整Mp4格式动图的码率。</li>
      <li>优化（设置）: 现在会在光标处插入文件名模板。</li>
      <li>
        <strong>实验性功能（Pixiv）：</strong>下载单页插图时为插图添加<a
          class={anchor}
          target="_blank"
          href="https://www.pixiv.net/tags/pixivGlow2024">#pixivGlow2024</a
        >动态效果，可在【设置】【其它】中开启。
      </li>
    </ul>
  </article>
  <footer class="modal-footer mt-4 text-sm">
    <!-- use `<details>` again when `height: calc-size(auto)` is widely supported -->

    <div class="flex justify-between items-center">
      <button class={anchor} on:click={() => (showCreditCode = !showCreditCode)}
        >脚本还行？请我喝杯可乐吧！</button
      >
      <a
        class={anchor}
        target="_blank"
        href="https://sleazyfork.org/zh-CN/scripts/432150-pixiv-downloader/feedback"
        >{t('text.feedback')}</a
      >
    </div>

    <div class="grid transition-[grid-template-rows] duration-[400ms] {gridRows}">
      <div class="flex flex-col items-center gap-2 min-h-0">
        <img src={creditCode} alt="credit" class="rounded-full" />
        <p>想喝香草味冰可乐</p>
      </div>
    </div>
  </footer>
</ModalWrapper>
