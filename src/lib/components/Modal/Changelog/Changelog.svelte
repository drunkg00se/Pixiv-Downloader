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
      <p>
        重写了批量下载，请在Pixiv【用户页】【已关注用户的新作】点击页面右方头像进行下载。暂未支持下载搜索结果。
      </p>
      <li>新增: 现在批量下载支持自定义下载页数。</li>
      <li>新增: 现在批量下载支持作品标签黑名单，白名单。</li>
      <li>新增: 现在进行中断批量下载的页面跳转时会进行提示。</li>
      <li>修复（Pixiv）: 无法下载【已关注用户的新作】最后一页的问题。</li>
      <li>修复（Pixiv）: 无法正确获得繁体中文标签的问题。</li>
      <li>修复（Pixiv）: 一些特殊字符导致保存失败的问题。</li>
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
