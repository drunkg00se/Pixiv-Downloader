import { ParserBase, type MediaMeta } from '../base/parser';

export interface NijieMeta<T extends string | string[] = string> extends MediaMeta<T> {
  userId: string;
  comment: string;
  score: number;
  isBookmarked: boolean;
}

export type NijieDiffSrc = {
  src: string;
  extendName: string;
};

export class NijieParser extends ParserBase {
  buildMetaByView(id: string, doc: Document): NijieMeta {
    const [title, artist] = (
      doc.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content ?? ''
    ).split(' | ');

    const comment =
      doc.querySelector<HTMLParagraphElement>(
        '#illust_text p, #dojin_text p:not(.title), #view-honbun > p.m-bottom15:not(.gray)'
      )?.textContent ?? '';

    // illust / video, dojin, odai
    const src = doc.querySelector<HTMLImageElement | HTMLVideoElement>(
      '#img_filter :is(img, video), p.image img, #gallery_new img#view_img'
    )!.src;

    const userId = doc
      .querySelector<HTMLAnchorElement>('a[href*="members_illust"]')
      ?.href.match(/(?<=id=)[0-9]+$/)?.[0];

    if (!title || !artist || !src || !userId) throw new Error('Can not parse necessary data');

    const matchExt = src.match(/(?<=\.)[a-z0-9]{3,4}$/i);
    if (!matchExt) throw new Error('Can not parse ext.');

    const postDateMatch = /[0-9:\- ]+$/.exec(
      doc.querySelector('#view-honbun > p, #created')!.textContent!
    );

    const goodCount = doc.querySelector('#good_cnt')!.textContent ?? 0;

    const tags = Array.from(doc.querySelectorAll<HTMLSpanElement>('[tag_id].tag .tag_name')).map(
      (el) => el.textContent!
    );

    // odai view does not contain the bookmark button so we cannot confirm whether the illust is bookmarked.
    const isBookmarked = !!doc.querySelector('a[href*="bookmark_edit"]');

    return {
      id,
      userId,
      src,
      extendName: matchExt[0],
      artist,
      title,
      tags,
      createDate: postDateMatch![0],
      comment,
      score: +goodCount,
      isBookmarked
    };
  }

  parseDiffSrcByDoc(doc: Document): NijieDiffSrc[] {
    return Array.from(
      doc.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
        '#img_filter :is(img[src*="pic.nijie.net"], video)'
      )
    ).map((el) => {
      const src = el.src;
      const matchExt = src.match(/(?<=\.)[a-z0-9]{3,4}$/i);
      if (!matchExt) throw new Error('Can not parse ext.');

      return {
        src,
        extendName: matchExt[0]
      };
    });
  }

  mergeImageDiff(meta: NijieMeta, diffs: NijieDiffSrc[]): NijieMeta<string[]> {
    const src: string[] = [];
    const extendName: string[] = [];

    for (const diff of diffs) {
      src.push(diff.src);
      extendName.push(diff.extendName);
    }

    return {
      ...meta,
      src,
      extendName
    };
  }

  #parseIdByAnchors(elems: HTMLAnchorElement[]): string[] {
    if (!elems.length) return [];

    return elems.map((el) => {
      const idMatch = /(?<=id=)[0-9]+$/.exec(el.href);
      return idMatch![0];
    });
  }

  parseUserPageArtworkIdByDoc(doc: Document): string[] {
    const thumbnails = doc.querySelectorAll<HTMLAnchorElement>(
      '.mem-index .nijiedao > a[href^="/view.php?id="]'
    );
    return this.#parseIdByAnchors(Array.from(thumbnails));
  }

  parseUserFeedArtworkIdByDoc(doc: Document): string[] {
    const thumbnails = doc.querySelectorAll<HTMLAnchorElement>(
      '#main-left-main [illust_id] .picture > a[href^="/view.php?id="]'
    );
    return this.#parseIdByAnchors(Array.from(thumbnails));
  }

  parseHistoryIllustArtworkIdByDoc(doc: Document): string[] {
    const thumbnails = doc.querySelectorAll<HTMLAnchorElement>(
      '.history_block > .picture > a[href*="id="]:has(img)'
    );
    return this.#parseIdByAnchors(Array.from(thumbnails));
  }

  parseHistoryNuitaArtworkIdByDoc(doc: Document): string[] {
    const thumbnails = doc.querySelectorAll<HTMLAnchorElement>(
      '#center_column div[illust_id].illust_list .picture a[href*="id="]:has(img)'
    );
    return this.#parseIdByAnchors(Array.from(thumbnails));
  }

  parseOkiniiriArtworkIdByDoc(doc: Document): string[] {
    const thumbnails = doc.querySelectorAll<HTMLAnchorElement>(
      '#content_delete .picture a[href*="id="]:has(img)'
    );
    return this.#parseIdByAnchors(Array.from(thumbnails));
  }

  parseSearchArtworkIdByDoc(doc: Document): string[] {
    const thumbnails = doc.querySelectorAll<HTMLAnchorElement>(
      '#main-left-main [illust_id] .picture a[href*="id="]:has(img)'
    );
    return this.#parseIdByAnchors(Array.from(thumbnails));
  }

  docHasDiff(doc: Document) {
    return !!doc.querySelector('a[href*="#diff_"]');
  }

  docIsDojin(doc: Document) {
    return !!doc.querySelector('#dojin_left');
  }

  docHasNextPagination(doc: Document) {
    return !!doc.querySelector('.page_button > a[rel="next"]');
  }
}
