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
        Fix (Pixiv): Tag's properties are not extracted correctly when the language is set to
        English.
      </li>
      <li>修复（Pixiv）: 收藏标签没有正确更新的问题。</li>
      <li>修复（Pixiv）: 批量下载按钮用户头像没有正确显示的问题。</li>
      <li>修复（Yande）: Browse页无法正确显示下载按钮的问题。</li>
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
