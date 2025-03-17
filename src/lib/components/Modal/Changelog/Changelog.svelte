<script lang="ts">
  import creditCode from '@/assets/credit.png';
  import ModalWrapper from '../ModalWrapper.svelte';
  import t from '@/lib/lang';

  interface Props {
    parent: { onClose: () => void };
  }

  const { parent }: Props = $props();

  const anchorFocus = `focus:!outline-none focus:decoration-wavy`;
  const anchor = `leading-loose anchor underline-offset-2 ${anchorFocus}`;

  let showCreditCode = $state(false);

  const gridRows = $derived(showCreditCode ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]');
</script>

<ModalWrapper {parent}>
  <header class="modal-header text-2xl font-bold">Pixiv Downloader {__VERSION__}</header>

  <article class="modal-body mt-4">
    <h4 class=" text-xl mt-2">新增</h4>
    <ul class="list-disc list-inside leading-loose">
      <li>支持新网站：Nijie.info。</li>
      <li>
        添加文件名模板：<code class=" code">&#123;score&#125;</code
        >。注：Pixiv中为收藏数，Nijie中为点赞数。
      </li>
    </ul>
    <h4 class=" text-xl mt-2">修复</h4>
    <ul class="list-disc list-inside leading-loose">
      <li>修复未按正确顺序下载E621 pool的问题。</li>
    </ul>
  </article>

  <footer class="modal-footer mt-4">
    <!-- use `<details>` again when `height: calc-size(auto)` is widely supported -->

    <div class="flex justify-between items-center text-sm">
      <button class={anchor} onclick={() => (showCreditCode = !showCreditCode)}
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
