import { regexp } from '@/lib/regExp';

export function getIllustId(node: HTMLAnchorElement | HTMLSpanElement): string {
  const isLinkToArtworksPage = regexp.artworksPage.exec(node.getAttribute('href') || '');

  if (isLinkToArtworksPage) {
    if (
      node.getAttribute('data-gtm-value') ||
      [
        'gtm-illust-recommend-node-node',
        'gtm-discover-user-recommend-node',
        'work',
        '_history-item',
        '_history-related-item'
      ].some((className) => node.classList.contains(className))
    ) {
      return isLinkToArtworksPage[1];
    }
  } else if (node instanceof HTMLSpanElement && node.className.includes('_history-item')) {
    // https://www.pixiv.net/history.php
    // trial item
    const img = node.querySelector('img');
    if (!img) return '';

    const matchPid = regexp.historyThumbnailsId.exec(img.src);
    if (matchPid) return matchPid[0];
  } else {
    // https://www.pixiv.net/stacc?mode=unify
    const isActivityThumb = regexp.activityHref.exec(node.getAttribute('href') || '');
    if (isActivityThumb && node.classList.contains('work')) {
      return isActivityThumb[1];
    }
  }

  return '';
}
