<script lang="ts">
  import creditCode from '@/assets/credit.png';
  import { t } from '@/lib/i18n.svelte';

  let {
    bg = 'bg-white/30 dark:bg-black/15',
    border = 'divide-y-[1px] *:border-surface-300-600-token',
    padding = 'px-4 *:py-4',
    margin = 'mt-2 *:!m-0',
    rounded = 'rounded-container-token *:!rounded-none',
    sectionSpace = `space-y-4`,
    sectionTitle = 'font-bold',
    class: UlClass = ''
  } = $props();

  const ulClasses = $derived(
    `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${UlClass}`
  );
</script>

<div class={sectionSpace}>
  <section>
    <p class={sectionTitle}>{t('setting.feedback.label.feedback')}</p>
    <ul class={ulClasses}>
      <li>
        <span>
          {@html t('setting.feedback.text.feedback_desc')}
        </span>
      </li>
    </ul>
  </section>

  <section>
    <p class={sectionTitle}>{t('setting.feedback.label.donate')}</p>
    <ul class={ulClasses}>
      <li>
        <p>
          {@html t('setting.feedback.text.give_me_a_star')}
        </p>
      </li>
      <li class=" justify-center">
        <figure>
          <img src={creditCode} alt="credit" class=" rounded-full m-auto" />
          <figcaption class="mt-4">{t('setting.feedback.text.donate_desc')}</figcaption>
        </figure>
      </li>
    </ul>
  </section>
</div>
