import { regexp } from '@/lib/regExp';
import { expect, test, describe } from 'vitest';

describe('Pixiv work tag', () => {
  const inactiveHrefs = [
    '/users/1234567/artworks/%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3',
    '/users/1234567/illustrations/%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3',
    '/users/1234567/manga/%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB',
    '/users/1234567/bookmarks/artworks/%E4%BB%8A%E6%97%A5%E3%81%AE%E3%81%8A%E3%82%84%E3%81%A4%E3%81%AB%E3%81%97%E3%81%BE%E3%81%99',
    /** private bookmark */
    '/users/1234567/bookmarks/artworks/%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB?rest=hide'
  ];
  const enInactiveHrefs = inactiveHrefs.map((href) => '/en' + href);
  inactiveHrefs.push(...enInactiveHrefs);

  const activeHrefs = [
    '/users/1234567/artworks',
    '/users/1234567/illustrations',
    '/users/1234567/manga',
    '/users/1234567/bookmarks/artworks',
    /** private bookmark */
    '/users/1234567/bookmarks/artworks?rest=hide'
  ];
  const enActiveHrefs = activeHrefs.map((href) => '/en' + href);
  activeHrefs.push(...enActiveHrefs);

  test.each(inactiveHrefs)("inacitve tag's href: %s", (href) => {
    expect(regexp.userPageTags.test(href)).toBe(true);
  });

  test.each(activeHrefs)("acitve tag's href: %s", (href) => {
    expect(regexp.userPageTags.test(href)).toBe(true);
  });
});
