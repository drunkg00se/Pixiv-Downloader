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
    <p>
      本次更新提高了FileSystemAccess
      API保存文件的可用性，现在应该可以替代篡改猴"浏览器API"下载模式，请大家尝试一下，反馈问题。
    </p>
    <h4 class=" text-xl mt-2">新增</h4>
    <ul class="list-disc list-inside leading-loose">
      <li>现在启用“使用FileSystemAccess API”，授予浏览器文件权限后，不需要再次选择文件夹。</li>
      <li>
        启用“使用FileSystemAccess
        API”后，当图片文件名无效时，脚本现在会弹出提示，而不是默认失败（请在文件保存框中修改文件名，直接保存仍然会抛出错误）。
      </li>
      <li>
        启用“使用FileSystemAccess API”后，批量下载时，会列出无法保存的图片，请手动保存或取消。
      </li>
      <li>批量下载完成后，会列出下载失败的图片及其原因。</li>
      <li>为脚本的一些操作增加了提示信息。</li>
    </ul>

    <h4 class=" text-xl mt-2">修复</h4>
    <ul class="list-disc list-inside leading-loose">
      <li>
        Large files throw security error (<a
          href="https://github.com/drunkg00se/Pixiv-Downloader/issues/39"
          target="_blank"
          class="anchor">#39</a
        >)
      </li>
      <li>修复在rule34vault中进行前进/后退导航时，头像/批量下载项未正确更新的问题。</li>
    </ul>

    <h4 class=" text-xl mt-2">已知问题</h4>
    <ul class="list-disc list-inside leading-loose">
      <li>
        使用篡改猴并启用浏览器API时，Firefox
        137下载较大图片会出现下载成功但无法保存的问题。如您在使用中遇到此问题，请回滚到版本136直至篡改猴正式版更新至v5.4或开发版更新至v5.4.6226。
      </li>
      <li>
        使用篡改猴开发版v5.4.6226并启用浏览器API时，无法创建子文件夹，请尝试使用FileSystemAccess
        API。
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
