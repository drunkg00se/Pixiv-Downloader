import { ParserBase, type MediaMeta } from '../base/parser';

export interface Rule34PahealMeta extends MediaMeta {
  source: string;
}

export class Rule34PahealParser extends ParserBase {
  buildMetaByDoc(id: string, doc: Document): Rule34PahealMeta {
    const mediaEl = doc.querySelector<HTMLImageElement | HTMLVideoElement>('#main_image');

    if (!mediaEl) throw new Error('Cannot find media element.');

    let src: string;
    let extendName: string;

    if (mediaEl.tagName === 'IMG') {
      const mimeType = mediaEl.getAttribute('data-mime');
      if (!mimeType) throw new Error('Cannot get mimetype.');

      extendName = mimeType.split('/')[1];
      src = mediaEl.src;
    } else {
      const videoSourceEl = mediaEl.querySelector('source');
      if (!videoSourceEl) throw new Error('Cannot get video source.');

      const mimeType = videoSourceEl.getAttribute('type');
      if (!mimeType) throw new Error('Cannot get mimetype.');

      extendName = mimeType.split('/')[1];
      src = videoSourceEl.src;
    }

    const md5 = src.slice(src.lastIndexOf('/') + 1);

    const tags = Array.from(
      doc.querySelectorAll<HTMLAnchorElement>('tr[data-row="Tags"] .tag')
    ).map((el) => el.textContent!.toLowerCase());

    const createDate = doc.querySelector<HTMLTimeElement>('tr[data-row="Uploader"] time')?.dateTime;
    if (!createDate) throw new Error('Cannot get upload date.');

    const sourceEl = doc.querySelector<HTMLAnchorElement>('tr[data-row="Source Link"] td a');
    const source = sourceEl?.href || '';

    return {
      id,
      src,
      extendName,
      artist: '',
      title: md5,
      tags,
      createDate,
      source
    };
  }

  // the thumbnail element does not contain source url.
  #buildMetaByThumbnailEl(el: HTMLDivElement): MediaMeta {
    const imgEl = el.querySelector('img');
    const fileAnchor = el.querySelector<HTMLAnchorElement>('a[href*="r34i.paheal-cdn.net"]');
    if (!imgEl || !fileAnchor) throw new Error('Cannot find image or flie link.');

    const src = fileAnchor.href;
    const md5 = src.slice(src.lastIndexOf('/') + 1);
    const { ext, tags, postId } = el.dataset as { [k: string]: string };

    const imgTitleData = imgEl.title.split('\n');
    const createDate = imgTitleData[imgTitleData.length - 1];

    return {
      id: postId,
      src,
      extendName: ext,
      artist: '',
      title: md5,
      tags: tags.split(' '),
      createDate
    };
  }

  buildMetasByPostsListDoc(doc: Document): MediaMeta[] {
    const thumbnailEls = doc.querySelectorAll<HTMLDivElement>('.shm-image-list  .shm-thumb.thumb');
    if (!thumbnailEls.length) return [];

    return Array.from(thumbnailEls).map((el) => this.#buildMetaByThumbnailEl(el));
  }

  docHasNextPage(doc: Document) {
    return Array.from(doc.querySelectorAll<HTMLAnchorElement>('#paginator a')).some(
      (el) => el.textContent === 'Next'
    );
  }
}
