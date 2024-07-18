<script lang="ts">
	import creditCode from '@/assets/credit.png';
	import t from '@/lib/lang';

	export let bg = 'bg-white/30 dark:bg-black/15';
	export let border = 'divide-y-[1px] *:border-surface-300-600-token';
	export let padding = 'px-4 *:py-4';
	export let margin = 'mt-2 *:!m-0';
	export let rounded = 'rounded-container-token *:!rounded-none';

	$: ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ''}`;

	export let sectionSpace = `space-y-4`;
	export let sectionTitle = 'font-bold';
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
			<li class=" justify-center">
				<figure>
					<img src={creditCode} alt="credit" class=" rounded-full m-auto" />
					<figcaption class="mt-4">{t('setting.feedback.text.donate_desc')}</figcaption>
				</figure>
			</li>
		</ul>
	</section>
</div>
