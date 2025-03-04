import { ParserBase, type MediaMeta } from '../base/parser';

export type NijieMeta = MediaMeta & {
  userId: string;
  comment: string;
  score: number;
};

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
      doc.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content ?? '';

    const src = doc.querySelector<HTMLImageElement | HTMLVideoElement>(
      '#img_filter :is(img, video), p.image img'
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
      score: +goodCount
    };
  }

  parseImgDiffSrcByDoc(doc: Document): NijieDiffSrc[] {
    return Array.from(
      doc.querySelectorAll<HTMLImageElement>('#img_filter img[src*="pic.nijie.net"]')
    ).map((el) => {
      const src = el.src;
      const matchExt = el.src.match(/(?<=\.)[a-z]{3,4}$/i);
      if (!matchExt) throw new Error('Can not parse ext.');

      return {
        src,
        extendName: matchExt[0]
      };
    });
  }

  docHasImgDiff(doc: Document) {
    return !!doc.querySelector('a[href*="#diff_"]');
  }

  docIsDojin(doc: Document) {
    return !!doc.querySelector('#dojin_left');
  }
}
