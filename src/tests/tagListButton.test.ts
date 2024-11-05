import { expect, test, beforeAll, vi } from 'vitest';
import { TagListButton } from '@/lib/components/Pixiv/tagListButton';

let el: TagListButton;
const downloading = {
  subscribe() {
    return () => {};
  }
};
const handleDownload = () => Promise.resolve();

beforeAll(async () => {
  vi.stubGlobal('unsafeWindow', window);
  vi.stubGlobal('GM_registerMenuCommand', () => {});
  vi.stubGlobal('GM_info', {
    downloadMode: 'browser',
    scriptHandler: 'Tampermonkey',
    version: '5.2.0'
  });

  new (await import('@/sites/pixiv/index')).Pixiv();

  return () => {
    el.remove();
    document.querySelector('pdl-app')?.remove();
    vi.unstubAllGlobals();
  };
});

test('tag button in dom', () => {
  el = new TagListButton(
    'https://www.pixiv.net/en/users/1039353/illustrations/%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB',
    downloading,
    handleDownload
  );

  document.body.appendChild(el);
  expect(el).toBeInTheDocument();
});

test('extract tag props correctly', () => {
  const { userId, category, tag, rest } = el.getTagProps();
  expect(userId).toEqual('1039353');
  expect(category).toEqual('illusts');
  expect(tag).toEqual('%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB');
  expect(rest).toEqual('show');
});

test('handle `disabled` correctly', () => {
  const btn = el.shadowRoot!.querySelector('button');

  el.setAttribute('disabled', '');
  expect(btn).toBeDisabled();

  el.removeAttribute('disabled');
  expect(btn).toBeEnabled();
});
