import { type chunksGenerator, pixivParser } from '@/sites/pixiv/parser';
import type { Category, PdlRest } from '../types';
import { config } from '@/lib/config';
import { historyDb } from '@/lib/db';
import {
  updateStatus,
  dlBarRef,
  changeDlbarDisplay,
  type FilterOption
} from '@/sites/pixiv/observerCB/downloadBar';
import type { ProgressData, FailedDownloadResult, FilteredIds } from './downloadByIds';
import { downloadByIds } from './downloadByIds';
import { logger } from '@/lib/logger';
import { downloader } from '@/lib/downloader';
import { ArtworkTagButton } from '@/lib/components/Pixiv/artworkTagButton';

function onProgressCB(progressData: ProgressData | string) {
  if (typeof progressData === 'string') {
    updateStatus(progressData);
  } else {
    logger.info(
      'Update progress by',
      progressData.illustId,
      ', completed: ',
      progressData.completed
    );
    updateStatus(`Downloading: ${progressData.completed} / ${progressData.avaliable}`);
  }
}

async function useDownloadBar(
  chunksGenerators:
    | chunksGenerator
    | Promise<chunksGenerator>
    | (Promise<chunksGenerator> | chunksGenerator)[]
): Promise<string[] | void> {
  if (!dlBarRef.abortBtn) return;

  let total = 0;
  let failedResult: string[] | undefined;
  const idsGenerators: AsyncGenerator<FilteredIds, void, unknown>[] = [];

  !Array.isArray(chunksGenerators) && (chunksGenerators = [chunksGenerators]);

  isDownloading = true;
  changeDlbarDisplay();

  try {
    await Promise.all(chunksGenerators).then((gens) => {
      gens.forEach((val) => {
        total += val.total;
        idsGenerators.push(val.generator);
      });
    });
  } catch (error) {
    logger.error(error);
    updateStatus('Network error, see console');
    changeDlbarDisplay();
    isDownloading = false;
    return;
  }

  if (total === 0) {
    updateStatus('No works');
  } else {
    try {
      logger.info('Total works:', total);

      const controller = new AbortController();
      const signal = controller.signal;
      // polyfill
      !signal.throwIfAborted &&
        (signal.throwIfAborted = function (this: AbortSignal) {
          if (this.aborted) {
            throw this.reason;
          }
        });
      if (!('reason' in signal)) {
        const abort = controller.abort;
        controller.abort = function (this: AbortController, reason?: any) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          this.signal.reason = reason
            ? reason
            : new DOMException('signal is aborted without reason');
          abort.apply(this);
        };
      }

      dlBarRef.abortBtn?.addEventListener(
        'click',
        () => {
          controller.abort();
        },
        { once: true }
      );

      const { failed, unavaliable }: FailedDownloadResult = await downloadByIds(
        total,
        idsGenerators,
        signal,
        onProgressCB
      );

      if (failed.length || unavaliable.length) {
        updateStatus(`Failed: ${failed.length + unavaliable.length}. See console.`);
        console.log('[Pixiv Downloader] Failed: ', failed.join(', '));
        console.log('[Pixiv Downloader] Unavaliable: ', unavaliable.join(', '));
        if (failed.length) failedResult = failed;
      } else {
        console.log('[Pixiv Downloader] Download complete');
        updateStatus('Complete');
      }
    } catch (error) {
      if (error instanceof DOMException) {
        // Abort error
        updateStatus('Stop');
      } else {
        updateStatus('Error, see console');
        logger.error(error);
      }
    }
  }

  changeDlbarDisplay();
  isDownloading = false;
  return failedResult;
}

function getFilterOption(): FilterOption {
  return {
    filterExcludeDownloaded: config.get('filterExcludeDownloaded'),
    filterIllusts: config.get('filterIllusts'),
    filterManga: config.get('filterManga'),
    filterUgoira: config.get('filterUgoira')
  };
}

function downloadAndRetry(
  chunksGenerators:
    | Promise<chunksGenerator>
    | Promise<chunksGenerator>[]
    | chunksGenerator
    | chunksGenerator[]
): void {
  useDownloadBar(chunksGenerators).then((failed) => {
    if (failed instanceof Array && failed.length) {
      const gen = async function* () {
        yield {
          avaliable: failed,
          unavaliable: [],
          invalid: []
        } as FilteredIds;
      };
      console.log('[Pixiv Downloader] Retry...');
      useDownloadBar({ total: failed.length, generator: gen() });
    }
  });
}

export let isDownloading = false;

export function downloadWorks(evt: MouseEvent) {
  evt.preventDefault();
  evt.stopPropagation();
  if (isDownloading) return;
  const btn = evt.target as HTMLButtonElement;
  const userId = btn.getAttribute('pdl-userid') as string;
  const filterOption = getFilterOption();

  downloader.dirHandleCheck();

  const ids = pixivParser.getAllWorksGenerator(userId, filterOption);
  downloadAndRetry(ids);
}

export async function downloadBookmarksOrTags(evt: MouseEvent) {
  evt.preventDefault();
  evt.stopPropagation();
  if (isDownloading) return;

  let userId: string;
  let category: Category;
  let tag: string;
  let rest: PdlRest;

  const btn = evt.target as HTMLButtonElement | ArtworkTagButton;

  if (btn instanceof ArtworkTagButton) {
    userId = btn.dataset.userId!;
    category = btn.dataset.category as Category;
    tag = btn.dataset.tag!;
    rest = btn.dataset.bookmarkRest as PdlRest;
  } else {
    userId = btn.getAttribute('pdl-userid') as string;
    category = btn.getAttribute('category') as Category;
    tag = btn.getAttribute('tag') || '';
    rest = (btn.getAttribute('rest') || 'show') as PdlRest;
  }

  downloader.dirHandleCheck();

  const filterOption = getFilterOption();
  let idsGenerators: Promise<chunksGenerator> | Promise<chunksGenerator>[];

  // rest 为 'all'时， category一定为 bookmarks
  // 此时下载公开，不公开收藏，且不需要tag
  if (rest === 'all') {
    const idsShowPromise = pixivParser.getChunksGenerator(
      userId,
      'bookmarks',
      '',
      'show',
      filterOption
    );
    const idsHidePromise = pixivParser.getChunksGenerator(
      userId,
      'bookmarks',
      '',
      'hide',
      filterOption
    );
    idsGenerators = [idsShowPromise, idsHidePromise];
  } else {
    idsGenerators = pixivParser.getChunksGenerator(userId, category, tag, rest, filterOption);
  }

  downloadAndRetry(idsGenerators);
}

export function downloadFollowLatest(evt: MouseEvent) {
  evt.preventDefault();
  evt.stopPropagation();
  if (isDownloading) return;

  const btn = evt.target as HTMLButtonElement;
  const mode = location.pathname.includes('r18') ? 'r18' : 'all';
  const filterOption = getFilterOption();
  let idsGenerators;

  if (btn.classList.contains('pdl-dl-all')) {
    idsGenerators = pixivParser.getFollowLatestGenerator(filterOption, mode);
  } else {
    const params = new URLSearchParams(location.search);
    const page = Number(params.get('p')) || 1;
    idsGenerators = pixivParser.getFollowLatestGenerator(filterOption, mode, page);
  }

  downloadAndRetry(idsGenerators);
}

export async function downloadSearchResult(evt: MouseEvent) {
  evt.preventDefault();
  evt.stopPropagation();
  if (isDownloading) return;

  const pdlNodes = document.querySelectorAll<HTMLButtonElement>('section ul li button.pdl-btn-sub');
  if (!pdlNodes.length) return;

  let ids = Array.prototype.map.call(pdlNodes, (node: HTMLButtonElement) =>
    node.getAttribute('pdl-id')
  ) as string[];

  if (getFilterOption().filterExcludeDownloaded) {
    const filteredIds: string[] = [];
    for (const id of ids) {
      const isDownloaded = await historyDb.has(id);
      !isDownloaded && filteredIds.push(id);
    }
    ids = filteredIds;
  }

  const idsGenerators: chunksGenerator = {
    total: ids.length,
    generator: (async function* () {
      yield {
        avaliable: ids,
        unavaliable: [],
        invalid: []
      } as FilteredIds;
    })()
  };

  downloadAndRetry(idsGenerators);
}
