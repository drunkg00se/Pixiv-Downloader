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
