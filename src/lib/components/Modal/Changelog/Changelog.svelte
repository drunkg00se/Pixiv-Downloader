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
      <li>重写了设置界面，变好看了</li>
      <li>现在可以将动图转换为<strong>MP4</strong>格式（Firefox目前仅Nightly版本支持）</li>
      <li>现在可以设置动图转换的质量</li>
      <li>以Zip格式保存的动图现在会将每帧动画时间添加到注释中</li>
      <li>Firefox现在可以将动图，打包漫画/插画保存到子目录</li>
      <li>不再支持导入txt记录</li>
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
