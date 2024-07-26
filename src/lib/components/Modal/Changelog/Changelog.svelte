<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import creditCode from '@/assets/credit.png';
  import ModalWrapper from '../ModalWrapper.svelte';

  const anchorFocus = `focus:!outline-none focus:decoration-wavy`;
  const anchor = `leading-loose anchor underline-offset-2 ${anchorFocus}`;

  export let parent: SvelteComponent;
</script>

<ModalWrapper {parent}>
  <!-- svelte-ignore missing-declaration -->
  <header class="modal-header text-2xl font-bold">Pixiv Downloader {__VERSION__}</header>
  <article class="modal-body mt-4">
    <ul class="list-disc list-inside leading-loose">
      <li>Pixiv作品标签下载按钮调整，现在会跟踪标签颜色变化。</li>
      <li>修复无法批量下载搜索结果的问题。</li>
      <li>修复滚动页面时设置背景改变的问题。</li>
      <li>重新适配Pixiv Previewer。</li>
    </ul>
  </article>
  <footer class="modal-footer relative mt-4 text-sm">
    <details>
      <summary class="inline-block cursor-pointer {anchor}"> 脚本还行？请我喝杯可乐吧！ </summary>
      <div class="text-center truncate flex flex-col items-center mt-4">
        <img src={creditCode} alt="credit" class=" rounded-full" />
        <p class="mt-2">想喝香草味冰可乐</p>
      </div>
    </details>
    <a
      class=" absolute right-0 top-0 {anchor}"
      target="_blank"
      href="https://sleazyfork.org/zh-CN/scripts/432150-pixiv-downloader/feedback"
      >有问题or想建议？这里反馈</a
    >
  </footer>
</ModalWrapper>
