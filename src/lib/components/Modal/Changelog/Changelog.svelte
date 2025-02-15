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
    <ul class="list-disc list-inside leading-loose">
      <p>
        <strong>注意：</strong>由于Firefox已于ver.130支持WebCodecs
        API，此次更新更换了Webm依赖库。需要转换Pixiv动图到Webm，Mp4格式的Firefox用户请更新浏览器。
      </p>
      <li>
        新增：现在支持<a class="anchor" href="https://konachan.net/" target="_blank">Konachan</a
        >（.com/.net）。
        <br />
        附注：在konachan.net进行批量下载时，请在下载器中添加标签黑名单"rating:q", "rating:e"，否则批量下载仍将下载NSFW图片。
      </li>
      <li>
        新增：现在支持<a class="anchor" href="https://www.sakugabooru.com/" target="_blank"
          >Sakugabooru</a
        >。
      </li>
      <li>新增：Yande.re现在支持批量下载“人气（按日/周/月）”。</li>
      <li>新增：Yande.re现在支持下载时将图片加入收藏。</li>
      <li>修复：Danbooru视频不显示下载按钮的问题。</li>
      <li>其它：一些重构，迁移到Svelte5。</li>
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
