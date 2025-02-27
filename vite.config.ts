/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import monkey from 'vite-plugin-monkey';
import svg from '@poppanator/sveltekit-svg';
import ts from 'typescript';
import { version } from './package.json';
import path from 'path';

const __dirname = import.meta.dirname;

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(version)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    svelte(),
    {
      name: 'compile-raw-ts',
      transform(code, id) {
        if (id.endsWith('?rawjs')) {
          const jsCode = ts.transpileModule(code, {
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext }
          }).outputText;
          return `export default ${JSON.stringify(jsCode)}`;
        }
      }
    },
    svg({
      svgoOptions: false
    }),
    purgeCss({ debug: false }),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Pixiv Downloader',
        author: 'ruaruarua',
        namespace: 'https://greasyfork.org/zh-CN/scripts/432150',
        icon: 'https://www.pixiv.net/favicon.ico',
        license: 'MIT',
        version,
        supportURL: 'https://github.com/drunkg00se/Pixiv-Downloader/issues',
        description: {
          '': '一键下载各页面原图。批量下载画师作品，按作品标签下载。转换动图格式：Gif | Apng | Webp | Webm | MP4。自定义图片文件名，保存路径。保留 / 导出下载历史。Pixiv | Danbooru | ATFbooru | Yande.re | Konachan | Sakugabooru | Rule34 | Gelbooru | Safebooru | E621 | E926 | E6ai',
          'zh-TW':
            '一鍵下載各頁面原圖。批次下載畫師作品，按作品標籤下載。轉換動圖格式：Gif | Apng | Webp | Webm | MP4。自定義圖片檔名，儲存路徑。保留 / 匯出下載歷史。Pixiv | Danbooru | ATFbooru | Yande.re | Konachan | Sakugabooru | Rule34 | Gelbooru | Safebooru | E621 | E926 | E6ai',
          en: 'Download artworks with one click. Batch download artworks or download by tags. Convert ugoira formats: Gif | Apng | Webp | Webm | MP4. Customize image file name, save path. Save / export download history. Pixiv | Danbooru | ATFbooru | Yande.re | Konachan | Sakugabooru | Rule34 | Gelbooru | Safebooru | E621 | E926 | E6ai'
        },
        match: [
          'https://www.pixiv.net/*',
          'https://rule34.xxx/*',
          'https://danbooru.donmai.us/*',
          'https://yande.re/*',
          'https://booru.allthefallen.moe/*',
          'https://konachan.com/*',
          'https://konachan.net/*',
          'https://www.sakugabooru.com/*',
          'https://safebooru.org/*',
          'https://gelbooru.com/*',
          'https://e621.net/*',
          'https://e926.net/*',
          'https://e6ai.net/*'
        ],
        noframes: true,
        connect: [
          'i.pximg.net',
          'source.pixiv.net',
          'rule34.xxx',
          'donmai.us',
          'yande.re',
          'allthefallen.moe',
          'konachan.com',
          'konachan.net',
          'sakugabooru.com',
          'safebooru.org',
          'gelbooru.com',
          'e621.net',
          'e926.net',
          'e6ai.net'
        ],
        require: [
          'https://unpkg.com/dexie@3.2.7/dist/dexie.min.js',
          'https://unpkg.com/jszip@3.9.1/dist/jszip.min.js',
          'https://unpkg.com/gif.js@0.2.0/dist/gif.js',
          'https://unpkg.com/dayjs@1.11.13/dayjs.min.js',
          // mp4-muxer and webm-muxer deps from unpkg are missing a ";" at the end of the code:
          // `if (typeof module === "object" && typeof module.exports === "object") Object.assign(module.exports, WebMMuxer)`.
          // This makes CSS side effects not run in Tampermonkey.
          // So, we use the jsdelivr CDN instead.
          // By the way, Violentmonkey automatically adds a ";". Well done, Violentmonkey!
          'https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.5/build/mp4-muxer.min.js',
          'https://cdn.jsdelivr.net/npm/webm-muxer@5.0.3/build/webm-muxer.min.js'
        ]
      },
      build: {
        cssSideEffects: () => {
          return (css: string) => {
            const style = new CSSStyleSheet();
            style.replaceSync(css);
            (window as any)._pdlShadowStyle = style;
          };
        },
        externalGlobals: {
          dexie: 'Dexie',
          jszip: 'JSZip',
          'gif.js': 'GIF',
          dayjs: 'dayjs',
          'mp4-muxer': 'Mp4Muxer',
          'webm-muxer': 'WebMMuxer'
        },
        externalResource: {
          'gif.js/dist/gif.worker?raw': {
            resourceUrl: 'https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js',
            //@ts-expect-error GM_getResourceText_missing_declaration
            loader: () => GM_getResourceText('gif.js/dist/gif.worker?raw')
          },
          'pako/dist/pako.js?raw': {
            resourceUrl: 'https://unpkg.com/pako@2.1.0/dist/pako.min.js',
            //@ts-expect-error GM_getResourceText_missing_declaration
            loader: () => GM_getResourceText('pako/dist/pako.js?raw')
          },
          'upng-js?raw': {
            resourceUrl: 'https://unpkg.com/upng-js@2.1.0/UPNG.js',
            //@ts-expect-error GM_getResourceText_missing_declaration
            loader: () => GM_getResourceText('upng-js?raw')
          },
          '../wasm/toWebpWorker?raw': {
            resourceUrl: 'https://update.greasyfork.org/scripts/500281/1409041/libwebp_wasm.js',
            //@ts-expect-error GM_getResourceText_missing_declaration
            loader: () => GM_getResourceText('../wasm/toWebpWorker?raw')
          }
        }
      }
    })
  ],

  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // https://playwright.dev
      providerOptions: {}
    }
  }
});
