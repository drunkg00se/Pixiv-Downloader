import { downloader } from '@/lib/downloader';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { danbooruParser } from './parser';
import { DanbooruDownloadConfig } from './downloadConfigBuilder';
import { historyDb } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function downloadPoolArtwork(btn: ThumbnailButton) {
	downloader.dirHandleCheck();

	const poolId = btn.getAttribute('pdl-id')!;
	const promises: Promise<void>[] = [];

	const postCount = await danbooruParser.getPoolPostCount(poolId);
	let completed = 0;

	const filter = async (id: string) => !(await historyDb.has(id));
	const idGen = danbooruParser.genIdByPool(poolId, filter);

	for await (const id of idGen) {
		const mediaMeta = await danbooruParser.parse(id);
		const downloadConfigs = new DanbooruDownloadConfig(mediaMeta).getDownloadConfig();

		const p = downloader
			.download(downloadConfigs)
			.then(() => {
				completed++;
				btn.setProgress((completed / postCount) * 100);
			})
			.then(() => {
				const { tags, artist, title } = mediaMeta;
				const historyData = {
					pid: Number(id),
					user: artist,
					title,
					tags
				};
				historyDb.add(historyData);
			});
		promises.push(p);
	}

	const results = await Promise.allSettled(promises);
	const rejectedTasks = results.filter(
		(result) => result.status === 'rejected'
	) as PromiseRejectedResult[];
	if (rejectedTasks.length) {
		rejectedTasks.length > 1 && logger.error(rejectedTasks);
		throw rejectedTasks[0].reason;
	}
}
