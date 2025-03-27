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
    <p class="mb-2">本次更新修复了测试版Pixiv中的几个问题。</p>
    <h4 class=" text-xl mt-2">修复</h4>
    <ul class="list-disc list-inside leading-loose">
      <li>测试版Pixiv中，开启“下载作品时点赞 / 下载作品时收藏”功能时无法下载作品的问题。</li>
      <li>测试版Pixiv中，预览原图时下载按钮不显示的问题。</li>
      <li>测试版Pixiv中，仅可由链接浏览作品不显示下载按钮的问题。</li>
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
