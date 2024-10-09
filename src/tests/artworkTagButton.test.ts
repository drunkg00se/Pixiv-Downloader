import { expect, test, beforeAll, vi } from 'vitest';
import { ArtworkTagButton } from '@/lib/components/Pixiv/artworkTagButton';

let el: ArtworkTagButton;

beforeAll(async () => {
  vi.stubGlobal('unsafeWindow', window);
  vi.stubGlobal('GM_registerMenuCommand', () => {});
  vi.stubGlobal('GM_info', {
    downloadMode: 'browser',
    scriptHandler: 'Tampermonkey',
    version: '5.2.0'
  });

  const normalTemplate = `<a class="sc-d98f2c-0 sc-1ij5ui8-1 RICfj sc-1xl36rp-0 jAcrfo" color="#c87e9b" status="normal" href="/en/users/1039353/illustrations/%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB"><div class="sc-1xl36rp-1 iUPWKW"><div class="sc-1xl36rp-3 eKInCf"><div title="original" class="sc-1utla24-0 eePPDm">original</div></div><div title="#オリジナル" class="sc-1utla24-0 sc-1xl36rp-4 iWAyih IsvDH">#オリジナル</div></div></a>`;
  const activeTemplate = `<a class="sc-d98f2c-0 sc-1ij5ui8-1 RICfj sc-1xl36rp-0 lMQiD" color="#c87e9b" status="active" href="/en/users/1039353/illustrations"><div class="sc-1xl36rp-1 cNqEHU"><div class="sc-1xl36rp-3 eKInCf"><div title="original" class="sc-1utla24-0 eePPDm">original</div></div><div title="#オリジナル" class="sc-1utla24-0 sc-1xl36rp-4 iWAyih IsvDH">#オリジナル</div></div><svg viewBox="0 0 16 16" size="16" class="sc-11csm01-0 fiLugu"><path d="M9.41421 8L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071
 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L8 9.41421L5.70711
 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166
 3.90237 10.6834 4.29289 10.2929L6.58579 8L4.29289 5.70711C3.90237 5.31658
 3.90237 4.68342 4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711
 4.29289L8 6.58579L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071
 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L9.41421 8Z" transform=""></path></svg></a>`;
  const privateBookmarkTemplate = `<a class="sc-d98f2c-0 sc-1ij5ui8-1 RICfj sc-1xl36rp-0 kIlOgT" color="#a07ec8" status="inactive" href="/en/users/1234567/bookmarks/artworks/%E6%9C%AA%E5%88%86%E9%A1%9E?rest=hide"><div class="sc-1xl36rp-1 iUPWKW"><div class="sc-1xl36rp-2 bIDszS"><div title="Uncategorized" class="sc-1utla24-0 bTtACY">Uncategorized</div></div></div></a>`;

  document.body.innerHTML += normalTemplate + activeTemplate + privateBookmarkTemplate;

  new (await import('@/sites/pixiv/index')).Pixiv();
});

test('should be in the dom', () => {
  el = new ArtworkTagButton(document.body.querySelector('a[status="normal"]')!);
  document.body.appendChild(el);
  expect(el).toBeInTheDocument();
});

test('handle `disabled` correctly', () => {
  const btn = el.shadowRoot!.querySelector('button');

  el.setAttribute('disabled', '');
  expect(btn).toBeDisabled();

  el.removeAttribute('disabled');
  expect(btn).toBeEnabled();
});

test('should extract tag props correctly', () => {
  [
    [el, '1039353', 'illusts', 'オリジナル', 'show'],
    [
      new ArtworkTagButton(document.body.querySelector('a[status="active"]')!),
      '1039353',
      'illusts',
      'オリジナル',
      'show'
    ],
    [
      new ArtworkTagButton(document.body.querySelector('a[status="inactive"]')!),
      '1234567',
      'bookmarks',
      '未分類',
      'hide'
    ]
  ].forEach(([el, testUserId, testCategory, testTag, testRest]) => {
    const { userId, category, tag, rest } = (el as ArtworkTagButton).getTagProps();
    expect(userId).toEqual(testUserId);
    expect(category).toEqual(testCategory);
    expect(tag).toEqual(testTag);
    expect(rest).toEqual(testRest);
  });
});

test('color changes', async () => {
  const ACTIVE_COLOR = 'rgb(255, 255, 255)';
  const ACTIVE_BG_COLOR = 'rgb(160, 126, 200)';
  const INACTIVE_COLOR = 'rgb(71, 71, 71)';
  const INACITVE_BG_COLOR = 'rgba(0, 0, 0, 0.04)';

  const tagEl = document.body.querySelector('a[status="normal"]') as HTMLAnchorElement;
  const btn = el.shadowRoot!.querySelector('button')!;

  tagEl.style.color = ACTIVE_COLOR;
  tagEl.style.backgroundColor = ACTIVE_BG_COLOR;
  tagEl.setAttribute('status', 'active');

  await Promise.resolve();

  expect(btn.style.color).toEqual(ACTIVE_COLOR);
  expect(btn.style.backgroundColor).toEqual(ACTIVE_BG_COLOR);

  tagEl.style.color = INACTIVE_COLOR;
  tagEl.style.backgroundColor = INACITVE_BG_COLOR;
  tagEl.setAttribute('status', 'inactive');

  await Promise.resolve();

  expect(btn.style.color).toEqual(INACTIVE_COLOR);
  expect(btn.style.backgroundColor).toEqual(INACITVE_BG_COLOR);
});
