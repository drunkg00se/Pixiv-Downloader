/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import monkey, { cdn } from 'vite-plugin-monkey';
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
        description: {
          '': 'Pixiv | Danbooru | Rule34 | Yande. 一键下载各页面原图。批量下载画师作品，按作品标签下载。转换动图格式：Gif | Apng | Webp | Webm | MP4。自定义图片文件名，保存路径。保留 / 导出下载历史。',
          'zh-TW':
            'Pixiv | Danbooru | Rule34 | Yande. 一鍵下載各頁面原圖。批次下載畫師作品，按作品標籤下載。轉換動圖格式：Gif | Apng | Webp | Webm | MP4。自定義圖片檔名，儲存路徑。保留 / 匯出下載歷史。',
          en: 'Pixiv | Danbooru | Rule34 | Yande. Download artworks with one click. Batch download artworks or download by tags. Convert ugoira formats: Gif | Apng | Webp | Webm | MP4. Customize image file name, save path. Save / export download history.'
        },
        match: [
          'https://www.pixiv.net/*',
          'https://rule34.xxx/*',
          'https://danbooru.donmai.us/*',
          'https://yande.re/*'
        ],
        noframes: true,
        connect: ['i.pximg.net', 'source.pixiv.net', 'rule34.xxx', 'donmai.us', 'yande.re']
      },
      build: {
        cssSideEffects: () => {
          return (css: string) => {
            const style = new CSSStyleSheet();
            style.replaceSync(css);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any)._pdlShadowStyle = style;
          };
        },
        externalGlobals: {
          dexie: cdn.unpkg('Dexie', 'dist/dexie.min.js'),
          jszip: cdn.unpkg('JSZip', 'dist/jszip.min.js'),
          'gif.js': cdn.unpkg('GIF', 'dist/gif.js'),
          dayjs: cdn.unpkg('dayjs', 'dayjs.min.js')
        },
        externalResource: {
          'gif.js/dist/gif.worker?raw': {
            resourceUrl: 'https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js',
            //@ts-expect-error no declaration
            loader: () => GM_getResourceText('gif.js/dist/gif.worker?raw')
          },
          'pako/dist/pako.js?raw': {
            resourceUrl: 'https://unpkg.com/pako@2.1.0/dist/pako.min.js',
            //@ts-expect-error no declaration
            loader: () => GM_getResourceText('pako/dist/pako.js?raw')
          },
          'upng-js?raw': {
            resourceUrl: 'https://unpkg.com/upng-js@2.1.0/UPNG.js',
            //@ts-expect-error no declaration
            loader: () => GM_getResourceText('upng-js?raw')
          },
          '../wasm/toWebpWorker?raw': {
            resourceUrl: 'https://update.greasyfork.org/scripts/500281/1409041/libwebp_wasm.js',
            //@ts-expect-error no declaration
            loader: () => GM_getResourceText('../wasm/toWebpWorker?raw')
          }
        }
      }
    })
  ],

  test: {
    environment: 'jsdom'
  }
});
