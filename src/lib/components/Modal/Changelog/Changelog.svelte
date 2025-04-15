<script lang="ts">
  import creditCode from '@/assets/credit.png';
  import ModalWrapper from '../ModalWrapper.svelte';
  import { t } from '@/lib/i18n.svelte';

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
      <li>支持更多网站：rule34vault, rule34paheal, rule34us。</li>
      <li>现在可以在设置中调整画廊下载按钮的位置。</li>
      <li>支持使用像素值来调整预览按钮的位置，以适应瀑布流布局。</li>
      <li>现在修改设置也会实时反馈到同网站的其它标签页。</li>
    </ul>

    <h4 class=" text-xl mt-2">调整</h4>
    <ul class="list-disc list-inside leading-loose">
      <li>
        Booru站点文件名模板<code class="code">&#123;title&#125;</code>修改为<code class="code"
          >&#123;md5&#125;</code
        >。
      </li>
    </ul>

    <h4 class=" text-xl mt-2">已知问题</h4>
    <ul class="list-disc list-inside leading-loose">
      <li>
        使用篡改猴并启用浏览器API时，Firefox
        137下载较大图片会出现下载成功但无法保存的问题。如您在使用中遇到此问题，请回滚到版本136直至篡改猴正式版更新至v5.4或开发版更新至v5.4.6226。
      </li>
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
