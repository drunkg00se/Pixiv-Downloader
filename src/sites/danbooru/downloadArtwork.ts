import { downloader } from '@/lib/downloader';
import { type HistoryData, historyDb } from '@/lib/db';
import { addBookmark } from './addBookmark';
import { config } from '@/lib/config';
import { ThumbnailButton } from '@/lib/components/Button/thumbnailButton';
import { danbooruParser } from './parser';
import { DanbooruDownloadConfig } from './downloadConfigBuilder';

export async function downloadArtwork(btn: ThumbnailButton) {
	downloader.dirHandleCheck();

	const id = btn.getAttribute('pdl-id')!;
	const mediaMeta = await danbooruParser.parse(id);
	const { tags, artist, title } = mediaMeta;

	const downloadConfigs = new DanbooruDownloadConfig(mediaMeta).getDownloadConfig(btn);

	config.get('addBookmark') && addBookmark(id);

	await downloader.download(downloadConfigs);

	const historyData: HistoryData = {
		pid: Number(id),
		user: artist,
		title,
		tags
	};
	historyDb.add(historyData);
}
