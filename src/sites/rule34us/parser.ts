import { ParserBase, type BooruMeta } from '../base/parser';

export class Rule34UsParser extends ParserBase {
  #getTagsByEL(el: HTMLElement, selector: string) {
    return Array.from(el.querySelectorAll(selector)).map((el) =>
      el.textContent!.replaceAll(' ', '_')
    );
  }

  buildMetaByDoc(id: string, doc: Document): BooruMeta {
    const mediaEl = doc.querySelector<HTMLImageElement | HTMLVideoElement>(
      '.content_push > :is(video, img[width])'
    );
    if (!mediaEl) throw new Error('Cannot find media element.');

    let src: string;

    if (mediaEl.tagName === 'IMG') {
      src = mediaEl.src;
    } else {
      const sourceEl = mediaEl.querySelector('source');
      if (!sourceEl) {
        if (!mediaEl.src) throw new Error('Cannot get src of the video');
        src = mediaEl.src;
      } else {
        src = sourceEl.src;
      }
    }

    const [md5, extendName] = src.slice(src.lastIndexOf('/') + 1).split('.');

    const tagListEl = doc.querySelector<HTMLUListElement>('ul.tag-list-left')!;

    const artists = this.#getTagsByEL(tagListEl, 'ul > .artist-tag > a');
    const characters = this.#getTagsByEL(tagListEl, 'ul > .character-tag > a');
    const copyrights = this.#getTagsByEL(tagListEl, 'ul > .copyright-tag > a');
    const metadatas = this.#getTagsByEL(tagListEl, 'ul > .metadata-tag > a');
    const generals = this.#getTagsByEL(tagListEl, 'ul > .general-tag > a');

    const tags = [...artists, ...characters, ...copyrights, ...metadatas, ...generals];
    const tagsWithType = [
      ...artists.map((v) => 'artist:' + v),
      ...characters.map((v) => 'character:' + v),
      ...copyrights.map((v) => 'copyright:' + v),
      ...metadatas.map((v) => 'metadata:' + v),
      ...generals.map((v) => 'general:' + v)
    ];

    const scoreStr = tagListEl.querySelector('span[id^="psc"]')?.textContent;

    return {
      id,
      src,
      extendName,
      title: md5,
      artist: artists.join(',') || 'UnknownArtist',
      character: characters.join(',') || 'UnknownCharacter',
      tags,
      tagsWithType,
      createDate: '',
      score: scoreStr ? +scoreStr : 0,
      source: ''
    };
  }

  parsePostIdsByDoc(doc: Document): string[] {
    const thumbnailEls = doc.querySelectorAll<HTMLAnchorElement>('a[href*="posts/view&id="]');
    if (!thumbnailEls.length) return [];

    return Array.from(thumbnailEls).map((el) => {
      const idMatch = /(?<=id=)[0-9]+$/.exec(el.href);
      if (!idMatch) throw new Error('Cannot match post id.');
      return idMatch[0];
    });
  }
}
