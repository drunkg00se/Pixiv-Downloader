// ==UserScript==
// @name               Pixiv Downloader
// @namespace          https://greasyfork.org/zh-CN/scripts/432150
// @version            1.8.2
// @author             ruaruarua
// @description        一键下载各页面原图。批量下载画师作品，按作品标签下载。转换动图格式：Gif | Apng | Webp | Webm | MP4。自定义图片文件名，保存路径。保留 / 导出下载历史。Pixiv | Danbooru | ATFbooru | Yande.re | Konachan | Sakugabooru | Rule34 | Gelbooru | Safebooru | E621 | E926 | E6ai | Nijie.info
// @description:zh-TW  一鍵下載各頁面原圖。批次下載畫師作品，按作品標籤下載。轉換動圖格式：Gif | Apng | Webp | Webm | MP4。自定義圖片檔名，儲存路徑。保留 / 匯出下載歷史。Pixiv | Danbooru | ATFbooru | Yande.re | Konachan | Sakugabooru | Rule34 | Gelbooru | Safebooru | E621 | E926 | E6ai | Nijie.info
// @description:en     Download artworks with one click. Batch download artworks or download by tags. Convert ugoira formats: Gif | Apng | Webp | Webm | MP4. Customize image file name, save path. Save / export download history. Pixiv | Danbooru | ATFbooru | Yande.re | Konachan | Sakugabooru | Rule34 | Gelbooru | Safebooru | E621 | E926 | E6ai | Nijie.info
// @license            MIT
// @icon               https://www.pixiv.net/favicon.ico
// @supportURL         https://github.com/drunkg00se/Pixiv-Downloader/issues
// @match              https://www.pixiv.net/*
// @match              https://rule34.xxx/*
// @match              https://danbooru.donmai.us/*
// @match              https://yande.re/*
// @match              https://booru.allthefallen.moe/*
// @match              https://konachan.com/*
// @match              https://konachan.net/*
// @match              https://www.sakugabooru.com/*
// @match              https://safebooru.org/*
// @match              https://gelbooru.com/*
// @match              https://e621.net/*
// @match              https://e926.net/*
// @match              https://e6ai.net/*
// @match              https://nijie.info/*
// @require            https://unpkg.com/dexie@3.2.7/dist/dexie.min.js
// @require            https://unpkg.com/jszip@3.9.1/dist/jszip.min.js
// @require            https://unpkg.com/gif.js@0.2.0/dist/gif.js
// @require            https://unpkg.com/dayjs@1.11.13/dayjs.min.js
// @require            https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.5/build/mp4-muxer.min.js
// @require            https://cdn.jsdelivr.net/npm/webm-muxer@5.0.3/build/webm-muxer.min.js
// @resource           ../wasm/toWebpWorker?raw    https://update.greasyfork.org/scripts/500281/1409041/libwebp_wasm.js
// @resource           gif.js/dist/gif.worker?raw  https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js
// @resource           pako/dist/pako.js?raw       https://unpkg.com/pako@2.1.0/dist/pako.min.js
// @resource           upng-js?raw                 https://unpkg.com/upng-js@2.1.0/UPNG.js
// @connect            i.pximg.net
// @connect            source.pixiv.net
// @connect            rule34.xxx
// @connect            donmai.us
// @connect            yande.re
// @connect            allthefallen.moe
// @connect            konachan.com
// @connect            konachan.net
// @connect            sakugabooru.com
// @connect            safebooru.org
// @connect            gelbooru.com
// @connect            e621.net
// @connect            e926.net
// @connect            e6ai.net
// @connect            nijie.net
// @grant              GM_download
// @grant              GM_getResourceText
// @grant              GM_info
// @grant              GM_registerMenuCommand
// @grant              GM_xmlhttpRequest
// @grant              unsafeWindow
// @noframes
// ==/UserScript==

(t=>{const r=new CSSStyleSheet;r.replaceSync(t),window._pdlShadowStyle=r})(` .anim-indeterminate.svelte-12wvf64{transform-origin:0% 50%;animation:svelte-12wvf64-anim-indeterminate 2s infinite linear}@keyframes svelte-12wvf64-anim-indeterminate{0%{transform:translate(0) scaleX(0)}40%{transform:translate(0) scaleX(.4)}to{transform:translate(100%) scaleX(.5)}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}:host [data-theme=skeleton],:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}:host [data-theme=skeleton]{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h3,h4{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}dl,dd,h1,h3,h4,hr,figure,p{margin:0}fieldset{margin:0;padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}[type=text],input:where(:not([type])),[type=email],[type=url],[type=password],[type=number],[type=date],[type=datetime-local],[type=month],[type=search],[type=tel],[type=time],[type=week],[multiple],textarea,select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff;border-color:#6b7280;border-width:1px;border-radius:0;padding:8px 12px;font-size:16px;line-height:24px;--tw-shadow: 0 0 #0000}[type=text]:focus,input:where(:not([type])):focus,[type=email]:focus,[type=url]:focus,[type=password]:focus,[type=number]:focus,[type=date]:focus,[type=datetime-local]:focus,[type=month]:focus,[type=search]:focus,[type=tel]:focus,[type=time]:focus,[type=week]:focus,[multiple]:focus,textarea:focus,select:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-inset: var(--tw-empty, );--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: #2563eb;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);border-color:#2563eb}input::-moz-placeholder,textarea::-moz-placeholder{color:#6b7280;opacity:1}input::placeholder,textarea::placeholder{color:#6b7280;opacity:1}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-date-and-time-value{min-height:1.5em;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit,::-webkit-datetime-edit-year-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-minute-field,::-webkit-datetime-edit-second-field,::-webkit-datetime-edit-millisecond-field,::-webkit-datetime-edit-meridiem-field{padding-top:0;padding-bottom:0}select{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");background-position:right 8px center;background-repeat:no-repeat;background-size:1.5em 1.5em;padding-right:40px;-webkit-print-color-adjust:exact;print-color-adjust:exact}[multiple],[size]:where(select:not([size="1"])){background-image:initial;background-position:initial;background-repeat:unset;background-size:initial;padding-right:12px;-webkit-print-color-adjust:unset;print-color-adjust:unset}[type=checkbox],[type=radio]{-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;display:inline-block;vertical-align:middle;background-origin:border-box;-webkit-user-select:none;-moz-user-select:none;user-select:none;flex-shrink:0;height:16px;width:16px;color:#2563eb;background-color:#fff;border-color:#6b7280;border-width:1px;--tw-shadow: 0 0 #0000}[type=checkbox]{border-radius:0}[type=radio]{border-radius:100%}[type=checkbox]:focus,[type=radio]:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-inset: var(--tw-empty, );--tw-ring-offset-width: 2px;--tw-ring-offset-color: #fff;--tw-ring-color: #2563eb;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}[type=checkbox]:checked,[type=radio]:checked{border-color:transparent;background-color:currentColor;background-size:100% 100%;background-position:center;background-repeat:no-repeat}[type=checkbox]:checked{background-image:url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")}@media (forced-colors: active){[type=checkbox]:checked{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=radio]:checked{background-image:url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e")}@media (forced-colors: active){[type=radio]:checked{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=checkbox]:checked:hover,[type=checkbox]:checked:focus,[type=radio]:checked:hover,[type=radio]:checked:focus{border-color:transparent;background-color:currentColor}[type=checkbox]:indeterminate{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");border-color:transparent;background-color:currentColor;background-size:100% 100%;background-position:center;background-repeat:no-repeat}@media (forced-colors: active){[type=checkbox]:indeterminate{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=checkbox]:indeterminate:hover,[type=checkbox]:indeterminate:focus{border-color:transparent;background-color:currentColor}[type=file]{background:unset;border-color:inherit;border-width:0;border-radius:0;padding:0;font-size:unset;line-height:inherit}[type=file]:focus{outline:1px solid ButtonText;outline:1px auto -webkit-focus-ring-color}:host [data-theme=skeleton]{background-color:rgb(var(--color-surface-50));font-size:16px;line-height:24px;font-family:var(--theme-font-family-base);color:rgba(var(--theme-font-color-base))}:host .dark [data-theme=skeleton]{background-color:rgb(var(--color-surface-900));color:rgba(var(--theme-font-color-dark))}::-moz-selection{background-color:rgb(var(--color-primary-500) / .3)}::selection{background-color:rgb(var(--color-primary-500) / .3)}:host [data-theme=skeleton]{-webkit-tap-highlight-color:rgba(128,128,128,.5);scrollbar-color:rgba(0,0,0,.2) rgba(255,255,255,.05)}:host [data-theme=skeleton]{scrollbar-color:rgba(128,128,128,.5) rgba(0,0,0,.1);scrollbar-width:thin}:host.dark{scrollbar-color:rgba(255,255,255,.1) rgba(0,0,0,.05)}hr:not(.divider){display:block;border-top-width:1px;border-style:solid;border-color:rgb(var(--color-surface-300))}.dark hr:not(.divider){border-color:rgb(var(--color-surface-600))}fieldset,label{display:block}::-moz-placeholder{color:rgb(var(--color-surface-500))}::placeholder{color:rgb(var(--color-surface-500))}.dark ::-moz-placeholder{color:rgb(var(--color-surface-400))}.dark ::placeholder{color:rgb(var(--color-surface-400))}:is(.dark input::-webkit-calendar-picker-indicator){--tw-invert: invert(100%);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}input[type=search]::-webkit-search-cancel-button{-webkit-appearance:none;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z'/%3E%3C/svg%3E") no-repeat 50% 50%;pointer-events:none;height:16px;width:16px;border-radius:9999px;background-size:contain;opacity:0}input[type=search]:focus::-webkit-search-cancel-button{pointer-events:auto;opacity:1}:is(.dark input[type=search]::-webkit-search-cancel-button){--tw-invert: invert(100%);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}progress{webkit-appearance:none;-moz-appearance:none;-webkit-appearance:none;appearance:none;height:8px;width:100%;overflow:hidden;border-radius:var(--theme-rounded-base);background-color:rgb(var(--color-surface-400))}.dark progress{background-color:rgb(var(--color-surface-500))}progress::-webkit-progress-bar{background-color:rgb(var(--color-surface-400))}.dark progress::-webkit-progress-bar{background-color:rgb(var(--color-surface-500))}progress::-webkit-progress-value{background-color:rgb(var(--color-surface-900))}.dark progress::-webkit-progress-value{background-color:rgb(var(--color-surface-50))}::-moz-progress-bar{background-color:rgb(var(--color-surface-900))}.dark ::-moz-progress-bar{background-color:rgb(var(--color-surface-50))}:indeterminate::-moz-progress-bar{width:0}input[type=file]:not(.file-dropzone-input)::file-selector-button:disabled{cursor:not-allowed;opacity:.5}input[type=file]:not(.file-dropzone-input)::file-selector-button:disabled:hover{--tw-brightness: brightness(1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}input[type=file]:not(.file-dropzone-input)::file-selector-button:disabled:active{--tw-scale-x: 1;--tw-scale-y: 1;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}input[type=file]:not(.file-dropzone-input)::file-selector-button{font-size:14px;line-height:20px;padding:6px 12px;white-space:nowrap;text-align:center;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s;border-radius:var(--theme-rounded-base);background-color:rgb(var(--color-surface-900));color:rgb(var(--color-surface-50));margin-right:8px;border-width:0px}input[type=file]:not(.file-dropzone-input)::file-selector-button>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}input[type=file]:not(.file-dropzone-input)::file-selector-button:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}input[type=file]:not(.file-dropzone-input)::file-selector-button:active{--tw-scale-x: 95%;--tw-scale-y: 95%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));--tw-brightness: brightness(.9);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.dark input[type=file]:not(.file-dropzone-input)::file-selector-button{background-color:rgb(var(--color-surface-50));color:rgb(var(--color-surface-900))}[type=range]{width:100%;accent-color:rgb(var(--color-surface-900) / 1)}:is(.dark [type=range]){accent-color:rgb(var(--color-surface-50) / 1)}[data-sort]{cursor:pointer}[data-sort]:hover:hover,.dark [data-sort]:hover:hover{background-color:rgb(var(--color-primary-500) / .1)}[data-sort]:after{margin-left:8px!important;opacity:0;--tw-content: "\u2193" !important;content:var(--tw-content)!important}[data-popup]{position:absolute;top:0;left:0;display:none;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}:host [data-theme=skeleton]{--theme-font-family-base: system-ui;--theme-font-family-heading: system-ui;--theme-font-color-base: 0 0 0;--theme-font-color-dark: 255 255 255;--theme-rounded-base: 9999px;--theme-rounded-container: 8px;--theme-border-base: 1px;--on-primary: 0 0 0;--on-secondary: 255 255 255;--on-tertiary: 0 0 0;--on-success: 0 0 0;--on-warning: 0 0 0;--on-error: 255 255 255;--on-surface: 255 255 255;--color-primary-50: 219 245 236;--color-primary-100: 207 241 230;--color-primary-200: 195 238 224;--color-primary-300: 159 227 205;--color-primary-400: 87 207 167;--color-primary-500: 15 186 129;--color-primary-600: 14 167 116;--color-primary-700: 11 140 97;--color-primary-800: 9 112 77;--color-primary-900: 7 91 63;--color-secondary-50: 229 227 251;--color-secondary-100: 220 218 250;--color-secondary-200: 211 209 249;--color-secondary-300: 185 181 245;--color-secondary-400: 132 126 237;--color-secondary-500: 79 70 229;--color-secondary-600: 71 63 206;--color-secondary-700: 59 53 172;--color-secondary-800: 47 42 137;--color-secondary-900: 39 34 112;--color-tertiary-50: 219 242 252;--color-tertiary-100: 207 237 251;--color-tertiary-200: 195 233 250;--color-tertiary-300: 159 219 246;--color-tertiary-400: 86 192 240;--color-tertiary-500: 14 165 233;--color-tertiary-600: 13 149 210;--color-tertiary-700: 11 124 175;--color-tertiary-800: 8 99 140;--color-tertiary-900: 7 81 114;--color-success-50: 237 247 220;--color-success-100: 230 245 208;--color-success-200: 224 242 197;--color-success-300: 206 235 162;--color-success-400: 169 219 92;--color-success-500: 132 204 22;--color-success-600: 119 184 20;--color-success-700: 99 153 17;--color-success-800: 79 122 13;--color-success-900: 65 100 11;--color-warning-50: 252 244 218;--color-warning-100: 251 240 206;--color-warning-200: 250 236 193;--color-warning-300: 247 225 156;--color-warning-400: 240 202 82;--color-warning-500: 234 179 8;--color-warning-600: 211 161 7;--color-warning-700: 176 134 6;--color-warning-800: 140 107 5;--color-warning-900: 115 88 4;--color-error-50: 249 221 234;--color-error-100: 246 209 228;--color-error-200: 244 198 221;--color-error-300: 238 163 200;--color-error-400: 225 94 159;--color-error-500: 212 25 118;--color-error-600: 191 23 106;--color-error-700: 159 19 89;--color-error-800: 127 15 71;--color-error-900: 104 12 58;--color-surface-50: 228 230 238;--color-surface-100: 219 222 233;--color-surface-200: 210 214 227;--color-surface-300: 182 189 210;--color-surface-400: 128 140 177;--color-surface-500: 73 90 143;--color-surface-600: 66 81 129;--color-surface-700: 55 68 107;--color-surface-800: 44 54 86;--color-surface-900: 36 44 70}[data-theme=skeleton] h1,[data-theme=skeleton] h3,[data-theme=skeleton] h4{font-weight:700}[data-theme=skeleton]{background-image:radial-gradient(at 0% 0%,rgba(var(--color-secondary-500) / .33) 0px,transparent 50%),radial-gradient(at 98% 1%,rgba(var(--color-error-500) / .33) 0px,transparent 50%);background-attachment:fixed;background-position:center;background-repeat:no-repeat;background-size:cover}*{scrollbar-color:initial;scrollbar-width:initial}.\\!container{width:100%!important}.container{width:100%}@media (min-width: 640px){.\\!container{max-width:640px!important}.container{max-width:640px}}@media (min-width: 768px){.\\!container{max-width:768px!important}.container{max-width:768px}}@media (min-width: 1024px){.\\!container{max-width:1024px!important}.container{max-width:1024px}}@media (min-width: 1280px){.\\!container{max-width:1280px!important}.container{max-width:1280px}}@media (min-width: 1536px){.\\!container{max-width:1536px!important}.container{max-width:1536px}}.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.h3{font-size:20px;line-height:28px;font-family:var(--theme-font-family-heading)}.h4{font-size:18px;line-height:28px;font-family:var(--theme-font-family-heading)}.anchor{--tw-text-opacity: 1;color:rgb(var(--color-primary-700) / var(--tw-text-opacity));text-decoration-line:underline}.anchor:hover{--tw-brightness: brightness(1.1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}:is(.dark .anchor){--tw-text-opacity: 1;color:rgb(var(--color-primary-500) / var(--tw-text-opacity))}.time{font-size:14px;line-height:20px;--tw-text-opacity: 1;color:rgb(var(--color-surface-500) / var(--tw-text-opacity))}:is(.dark .time){--tw-text-opacity: 1;color:rgb(var(--color-surface-400) / var(--tw-text-opacity))}.code{white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:12px;line-height:16px;--tw-text-opacity: 1;color:rgb(var(--color-primary-700) / var(--tw-text-opacity));background-color:rgb(var(--color-primary-500) / .3);border-radius:4px;padding:2px 4px}:is(.dark .code){--tw-text-opacity: 1;color:rgb(var(--color-primary-400) / var(--tw-text-opacity));background-color:rgb(var(--color-primary-500) / .2)}.alert{display:flex;flex-direction:column;align-items:flex-start;padding:16px;color:rgb(var(--color-surface-900));border-radius:var(--theme-rounded-container)}.alert>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(16px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(16px * var(--tw-space-y-reverse))}.dark .alert{color:rgb(var(--color-surface-50))}.\\!btn:disabled{cursor:not-allowed!important;opacity:.5!important}.btn:disabled,.btn-icon:disabled,.btn-group>*:disabled{cursor:not-allowed!important;opacity:.5!important}.\\!btn:disabled:hover{--tw-brightness: brightness(1) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.btn:disabled:hover,.btn-icon:disabled:hover,.btn-group>*:disabled:hover{--tw-brightness: brightness(1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.\\!btn:disabled:active{--tw-scale-x: 1 !important;--tw-scale-y: 1 !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}.btn:disabled:active,.btn-icon:disabled:active,.btn-group>*:disabled:active{--tw-scale-x: 1;--tw-scale-y: 1;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.\\!btn{font-size:16px!important;line-height:24px!important;padding:9px 20px!important;white-space:nowrap!important;text-align:center!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;transition-property:all!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;border-radius:var(--theme-rounded-base)!important}.btn{font-size:16px;line-height:24px;padding:9px 20px;white-space:nowrap;text-align:center;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s;border-radius:var(--theme-rounded-base)}.\\!btn>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0 !important;margin-right:calc(8px * var(--tw-space-x-reverse))!important;margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))!important}.btn>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}.\\!btn:hover{--tw-brightness: brightness(1.15) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.btn:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.\\!btn:active{--tw-scale-x: 95% !important;--tw-scale-y: 95% !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important;--tw-brightness: brightness(.9) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.btn:active{--tw-scale-x: 95%;--tw-scale-y: 95%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));--tw-brightness: brightness(.9);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.btn-sm{padding:6px 12px;font-size:14px;line-height:20px}.btn-icon{font-size:16px;line-height:24px;white-space:nowrap;text-align:center;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s;padding:0;aspect-ratio:1 / 1;width:43px;border-radius:9999px}.btn-icon>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}.btn-icon:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.btn-icon:active{--tw-scale-x: 95%;--tw-scale-y: 95%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));--tw-brightness: brightness(.9);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.btn-icon-sm{aspect-ratio:1 / 1;width:33px;font-size:14px;line-height:20px}.btn-group{display:inline-flex;flex-direction:row;overflow:hidden;border-radius:var(--theme-rounded-base);isolation:isolate}.btn-group>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(0px * var(--tw-space-x-reverse));margin-left:calc(0px * calc(1 - var(--tw-space-x-reverse)))}.btn-group button,.btn-group a{font-size:16px;line-height:24px;padding:9px 20px;white-space:nowrap;text-align:center;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s;color:inherit!important;text-decoration-line:none!important}.btn-group button>:not([hidden])~:not([hidden]),.btn-group a>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}.btn-group button:hover,.btn-group a:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);background-color:rgb(var(--color-surface-50) / 3%)}.btn-group button:active,.btn-group a:active{background-color:rgb(var(--color-surface-900) / 3%)}.btn-group>*+*{border-top-width:0px;border-left-width:1px;border-color:rgb(var(--color-surface-500) / .2)}.card{background-color:rgb(var(--color-surface-100));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000);--tw-ring-inset: inset;--tw-ring-color: rgb(23 23 23 / .05);border-radius:var(--theme-rounded-container)}.dark .card{background-color:rgb(var(--color-surface-800));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000);--tw-ring-inset: inset;--tw-ring-color: rgb(250 250 250 / .05)}a.card{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}a.card:hover{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.\\!chip{cursor:pointer!important;white-space:nowrap!important;padding:6px 12px!important;text-align:center!important;font-size:12px!important;line-height:16px!important;border-radius:4px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;transition-property:all!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.chip{cursor:pointer;white-space:nowrap;padding:6px 12px;text-align:center;font-size:12px;line-height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.\\!chip>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0 !important;margin-right:calc(8px * var(--tw-space-x-reverse))!important;margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))!important}.chip>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}a.chip:hover,button.chip:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}a.\\!chip:hover,button.\\!chip:hover{--tw-brightness: brightness(1.15) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.\\!chip:disabled{cursor:not-allowed!important;opacity:.5!important}.chip:disabled{cursor:not-allowed!important;opacity:.5!important}.\\!chip:disabled:active{--tw-scale-x: 1 !important;--tw-scale-y: 1 !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}.chip:disabled:active{--tw-scale-x: 1;--tw-scale-y: 1;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.label>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.\\!input{width:100%!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.2s!important;background-color:rgb(var(--color-surface-200))!important;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;border-width:var(--theme-border-base)!important;border-color:rgb(var(--color-surface-400))!important}.input,.textarea,.select,.input-group{width:100%;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.2s;background-color:rgb(var(--color-surface-200));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;border-width:var(--theme-border-base);border-color:rgb(var(--color-surface-400))}.dark .input,.dark .textarea,.dark .select,.dark .input-group{background-color:rgb(var(--color-surface-700));border-color:rgb(var(--color-surface-500))}.dark .\\!input{background-color:rgb(var(--color-surface-700))!important;border-color:rgb(var(--color-surface-500))!important}.\\!input:hover{--tw-brightness: brightness(1.05) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.input:hover,.textarea:hover,.select:hover,.input-group:hover{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.\\!input:focus{--tw-brightness: brightness(1.05) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.input:focus,.textarea:focus,.select:focus,.input-group:focus{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.\\!input:focus-within{--tw-border-opacity: 1 !important;border-color:rgb(var(--color-primary-500) / var(--tw-border-opacity))!important}.input:focus-within,.textarea:focus-within,.select:focus-within,.input-group:focus-within{--tw-border-opacity: 1;border-color:rgb(var(--color-primary-500) / var(--tw-border-opacity))}.\\!input{border-radius:var(--theme-rounded-base)!important}.input,.input-group{border-radius:var(--theme-rounded-base)}.textarea,.select{border-radius:var(--theme-rounded-container)}.select>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.select{padding:8px 32px 8px 8px}.select[size]{background-image:none}.select optgroup>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.select optgroup{font-weight:700}.select optgroup option{margin-left:0;padding-left:0}.select optgroup option:first-of-type{margin-top:12px}.select optgroup option:last-child{margin-bottom:12px!important}.select option{cursor:pointer;padding:8px 16px;background-color:rgb(var(--color-surface-200));border-radius:var(--theme-rounded-base)}.dark .select option{background-color:rgb(var(--color-surface-700))}.select option:checked{background:rgb(var(--color-primary-500)) linear-gradient(0deg,rgb(var(--color-primary-500)),rgb(var(--color-primary-500)));color:rgb(var(--on-primary))}.checkbox,.radio{height:20px;width:20px;cursor:pointer;border-radius:4px;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;background-color:rgb(var(--color-surface-200));border-width:var(--theme-border-base);border-color:rgb(var(--color-surface-400))}.dark .checkbox,.dark .radio{background-color:rgb(var(--color-surface-700));border-color:rgb(var(--color-surface-500))}.checkbox:hover,.radio:hover{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.checkbox:focus,.radio:focus{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);--tw-border-opacity: 1;border-color:rgb(var(--color-primary-500) / var(--tw-border-opacity))}.checkbox:checked,.checkbox:indeterminate,.radio:checked{--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity))}.checkbox:checked:hover,.checkbox:indeterminate:hover,.radio:checked:hover{--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity))}.checkbox:checked:focus,.checkbox:indeterminate:focus,.radio:checked:focus{--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.radio{border-radius:var(--theme-rounded-base)}.\\!input[type=file]{padding:4px!important}.input[type=file]{padding:4px}.\\!input[type=color]{height:40px!important;width:40px!important;cursor:pointer!important;overflow:hidden!important;border-style:none!important;border-radius:var(--theme-rounded-base)!important;-webkit-appearance:none!important}.input[type=color]{height:40px;width:40px;cursor:pointer;overflow:hidden;border-style:none;border-radius:var(--theme-rounded-base);-webkit-appearance:none}.\\!input[type=color]::-webkit-color-swatch-wrapper{padding:0!important}.input[type=color]::-webkit-color-swatch-wrapper{padding:0}.\\!input[type=color]::-webkit-color-swatch{border-style:none!important}.input[type=color]::-webkit-color-swatch{border-style:none}.\\!input[type=color]::-webkit-color-swatch:hover{--tw-brightness: brightness(1.1) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.input[type=color]::-webkit-color-swatch:hover{--tw-brightness: brightness(1.1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.\\!input[type=color]::-moz-color-swatch{border-style:none!important}.input[type=color]::-moz-color-swatch{border-style:none}.\\!input:disabled{cursor:not-allowed!important;opacity:.5!important}.input:disabled,.textarea:disabled,.select:disabled,.input-group>input:disabled,.input-group>textarea:disabled,.input-group>select:disabled{cursor:not-allowed!important;opacity:.5!important}.\\!input:disabled:hover{--tw-brightness: brightness(1) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.input:disabled:hover,.textarea:disabled:hover,.select:disabled:hover,.input-group>input:disabled:hover,.input-group>textarea:disabled:hover,.input-group>select:disabled:hover{--tw-brightness: brightness(1) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.\\!input[readonly],.input[readonly],.textarea[readonly],.select[readonly]{cursor:not-allowed!important;border-color:transparent!important}.\\!input[readonly]:hover,.input[readonly]:hover,.textarea[readonly]:hover,.select[readonly]:hover{--tw-brightness: brightness(1) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.input-group{display:grid;overflow:hidden}.input-group input,.input-group select{border-width:0px;background-color:transparent;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important}.input-group select option{background-color:rgb(var(--color-surface-200))}.dark .input-group select option{background-color:rgb(var(--color-surface-700))}.input-group div,.input-group a,.input-group button{display:flex;align-items:center;justify-content:space-between;padding-left:16px;padding-right:16px}.input-group-divider input,.input-group-divider select,.input-group-divider div,.input-group-divider a{border-left-width:1px;border-color:rgb(var(--color-surface-400));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;min-width:-moz-fit-content!important;min-width:fit-content!important}.dark .input-group-divider input,.dark .input-group-divider select,.dark .input-group-divider div,.dark .input-group-divider a{border-color:rgb(var(--color-surface-500))}.input-group-divider input:focus,.input-group-divider select:focus,.input-group-divider div:focus,.input-group-divider a:focus{border-color:rgb(var(--color-surface-400))}.dark .input-group-divider input:focus,.dark .input-group-divider select:focus,.dark .input-group-divider div:focus,.dark .input-group-divider a:focus{border-color:rgb(var(--color-surface-500))}.input-group-divider *:first-child{border-left-width:0px!important}.input-group-shim{background-color:rgb(var(--color-surface-400) / .1);color:rgb(var(--color-surface-600))}.dark .input-group-shim{color:rgb(var(--color-surface-300))}.input-error{--tw-border-opacity: 1;border-color:rgb(var(--color-error-500) / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color:rgb(var(--color-error-200) / var(--tw-bg-opacity));--tw-text-opacity: 1;color:rgb(var(--color-error-500) / var(--tw-text-opacity))}:is(.dark .input-error){--tw-border-opacity: 1;border-color:rgb(var(--color-error-500) / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color:rgb(var(--color-error-200) / var(--tw-bg-opacity));--tw-text-opacity: 1;color:rgb(var(--color-error-500) / var(--tw-text-opacity))}.input-error::-moz-placeholder{--tw-text-opacity: 1;color:rgb(var(--color-error-500) / var(--tw-text-opacity))}.input-error::placeholder{--tw-text-opacity: 1;color:rgb(var(--color-error-500) / var(--tw-text-opacity))}.list{list-style-type:none}.list>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.list li{display:flex;align-items:center;border-radius:var(--theme-rounded-base)}.list li>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(16px * var(--tw-space-x-reverse));margin-left:calc(16px * calc(1 - var(--tw-space-x-reverse)))}.placeholder{height:20px;background-color:rgb(var(--color-surface-300));border-radius:var(--theme-rounded-base)}.dark .placeholder{background-color:rgb(var(--color-surface-600))}.w-modal{width:100%;max-width:640px}.modal *:focus:not([tabindex="-1"]):not(.input):not(.textarea):not(.select):not(.input-group):not(.input-group input){outline-style:auto;outline-color:-webkit-focus-ring-color}.variant-filled{background-color:rgb(var(--color-surface-900));color:rgb(var(--color-surface-50))}.dark .variant-filled{background-color:rgb(var(--color-surface-50));color:rgb(var(--color-surface-900))}.\\!variant-filled-primary{--tw-bg-opacity: 1 !important;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity))!important;color:rgb(var(--on-primary))!important}.variant-filled-primary{--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity));color:rgb(var(--on-primary))}:is(.dark .variant-filled-primary){--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity));color:rgb(var(--on-primary))}:is(.dark .\\!variant-filled-primary){--tw-bg-opacity: 1 !important;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity))!important;color:rgb(var(--on-primary))!important}.variant-ghost-surface{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000);--tw-ring-inset: inset;--tw-ring-opacity: 1;--tw-ring-color: rgb(var(--color-surface-500) / var(--tw-ring-opacity));background-color:rgb(var(--color-surface-500) / .2)}:is(.dark .variant-ghost-surface){--tw-ring-opacity: 1;--tw-ring-color: rgb(var(--color-surface-500) / var(--tw-ring-opacity));background-color:rgb(var(--color-surface-500) / .2)}.variant-soft,.variant-soft-surface{background-color:rgb(var(--color-surface-400) / .2);--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;color:rgb(var(--color-surface-700))}.dark .variant-soft,.dark .variant-soft-surface{color:rgb(var(--color-surface-200))}:is(.dark .variant-soft),:is(.dark .variant-soft-surface){background-color:rgb(var(--color-surface-500) / .2)}@media (min-width: 768px){.h3{font-size:24px;line-height:32px}.h4{font-size:20px;line-height:28px}}@media (min-width: 1024px){.alert{flex-direction:row;align-items:center}.alert>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(0px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(0px * var(--tw-space-y-reverse));--tw-space-x-reverse: 0;margin-right:calc(16px * var(--tw-space-x-reverse));margin-left:calc(16px * calc(1 - var(--tw-space-x-reverse)))}}.modal *:focus:not([tabindex="-1"]):not(.input):not(.textarea):not(.select):not(.input-group):not(.input-group input){outline-width:0px!important}.visible{visibility:visible}.static{position:static}.fixed{position:fixed}.\\!absolute{position:absolute!important}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.bottom-0{bottom:0}.bottom-24{bottom:96px}.left-0{left:0}.left-1\\/2{left:50%}.right-0{right:0}.right-2{right:8px}.right-20{right:80px}.right-4{right:16px}.top-0{top:0}.top-1\\/2{top:50%}.top-2{top:8px}.top-36{top:144px}.-z-10{z-index:-10}.z-\\[999\\]{z-index:999}.row-span-2{grid-row:span 2 / span 2}.row-start-1{grid-row-start:1}.\\!m-0{margin:0!important}.m-auto{margin:auto}.mx-2{margin-left:8px;margin-right:8px}.my-4{margin-top:16px;margin-bottom:16px}.my-\\[1px\\]{margin-top:1px;margin-bottom:1px}.mb-2{margin-bottom:8px}.ml-1{margin-left:4px}.ml-3{margin-left:12px}.ml-4{margin-left:16px}.mr-2{margin-right:8px}.mr-6{margin-right:24px}.mt-2{margin-top:8px}.mt-4{margin-top:16px}.block{display:block}.inline-block{display:inline-block}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.contents{display:contents}.hidden{display:none}.size-14{width:56px;height:56px}.size-full{width:100%;height:100%}.h-0{height:0px}.h-10{height:40px}.h-2{height:8px}.h-4{height:16px}.h-48{height:192px}.h-6{height:24px}.h-8{height:32px}.h-\\[38px\\]{height:38px}.h-auto{height:auto}.h-fit{height:-moz-fit-content;height:fit-content}.h-full{height:100%}.h-screen{height:100vh}.max-h-\\[200px\\]{max-height:200px}.min-h-0{min-height:0px}.min-h-full{min-height:100%}.w-0{width:0px}.w-12{width:48px}.w-16{width:64px}.w-20{width:80px}.w-32{width:128px}.w-36{width:144px}.w-48{width:192px}.w-5{width:20px}.w-6{width:24px}.w-8{width:32px}.w-\\[140px\\]{width:140px}.w-\\[38px\\]{width:38px}.w-\\[50\\%\\]{width:50%}.w-\\[600px\\]{width:600px}.w-full{width:100%}.w-screen{width:100vw}.max-w-full{max-width:100%}.flex-1{flex:1 1 0%}.flex-auto{flex:1 1 auto}.flex-none{flex:none}.shrink-0{flex-shrink:0}.flex-grow{flex-grow:1}.basis-0{flex-basis:0px}.origin-\\[50\\%_50\\%\\]{transform-origin:50% 50%}.-translate-x-1\\/2{--tw-translate-x: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-x-full{--tw-translate-x: -100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-0{--tw-translate-x: 0px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-\\[calc\\(100\\%-44px\\)\\]{--tw-translate-x: calc(100% - 44px) ;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-full{--tw-translate-x: 100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-rotate-90{--tw-rotate: -90deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.scale-\\[0\\.8\\]{--tw-scale-x: .8;--tw-scale-y: .8;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.\\!transform-none{transform:none!important}@keyframes spin{to{transform:rotate(360deg)}}.animate-spin{animation:spin 1s linear infinite}.\\!cursor-default{cursor:default!important}.cursor-not-allowed{cursor:not-allowed}.cursor-pointer{cursor:pointer}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.list-inside{list-style-position:inside}.list-disc{list-style-type:disc}.grid-cols-\\[0px_1fr\\]{grid-template-columns:0px 1fr}.grid-cols-\\[140px_1fr\\]{grid-template-columns:140px 1fr}.grid-cols-\\[auto_1fr_auto\\]{grid-template-columns:auto 1fr auto}.grid-cols-\\[auto_1fr_auto_auto\\]{grid-template-columns:auto 1fr auto auto}.grid-rows-\\[0fr\\]{grid-template-rows:0fr}.grid-rows-\\[1fr\\]{grid-template-rows:1fr}.grid-rows-\\[auto_1fr\\]{grid-template-rows:auto 1fr}.flex-row{flex-direction:row}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.\\!items-stretch{align-items:stretch!important}.justify-start{justify-content:flex-start}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.justify-evenly{justify-content:space-evenly}.gap-1{gap:4px}.gap-14{gap:56px}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}.gap-6{gap:24px}.gap-x-2{-moz-column-gap:8px;column-gap:8px}.gap-y-1{row-gap:4px}.space-x-2>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}.space-x-4>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(16px * var(--tw-space-x-reverse));margin-left:calc(16px * calc(1 - var(--tw-space-x-reverse)))}.space-y-1>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(8px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(8px * var(--tw-space-y-reverse))}.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(16px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(16px * var(--tw-space-y-reverse))}.divide-y-\\[1px\\]>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)));border-bottom-width:calc(1px * var(--tw-divide-y-reverse))}.self-start{align-self:flex-start}.self-stretch{align-self:stretch}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.overflow-y-hidden{overflow-y:hidden}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.break-words{overflow-wrap:break-word}.rounded{border-radius:4px}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:8px}.rounded-md{border-radius:6px}.rounded-none{border-radius:0}.rounded-e-\\[4px\\]{border-start-end-radius:4px;border-end-end-radius:4px}.rounded-s-full{border-start-start-radius:9999px;border-end-start-radius:9999px}.border{border-width:1px}.border-0{border-width:0px}.\\!border-t-0{border-top-width:0px!important}.border-b{border-bottom-width:1px}.border-b-2{border-bottom-width:2px}.border-l{border-left-width:1px}.\\!border-surface-700{--tw-border-opacity: 1 !important;border-color:rgb(var(--color-surface-700) / var(--tw-border-opacity, 1))!important}.border-surface-400\\/20{border-color:rgb(var(--color-surface-400) / .2)}.bg-primary-500{--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity, 1))}.bg-primary-500\\/30{background-color:rgb(var(--color-primary-500) / .3)}.bg-surface-400{--tw-bg-opacity: 1;background-color:rgb(var(--color-surface-400) / var(--tw-bg-opacity, 1))}.bg-surface-400\\/20{background-color:rgb(var(--color-surface-400) / .2)}.bg-surface-900{--tw-bg-opacity: 1;background-color:rgb(var(--color-surface-900) / var(--tw-bg-opacity, 1))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity: 1;background-color:rgb(255 255 255 / var(--tw-bg-opacity, 1))}.bg-white\\/30{background-color:#ffffff4d}.bg-white\\/75{background-color:#ffffffbf}.bg-scroll{background-attachment:scroll}.fill-current{fill:currentColor}.fill-primary-500{fill:rgb(var(--color-primary-500) / 1)}.fill-slate-700{fill:#334155}.fill-transparent{fill:transparent}.stroke-primary-500{stroke:rgb(var(--color-primary-500) / 1)}.stroke-primary-500\\/30{stroke:rgb(var(--color-primary-500) / .3)}.stroke-surface-500\\/30{stroke:rgb(var(--color-surface-500) / .3)}.stroke-surface-900{stroke:rgb(var(--color-surface-900) / 1)}.object-cover{-o-object-fit:cover;object-fit:cover}.object-center{-o-object-position:center;object-position:center}.\\!p-0{padding:0!important}.p-0{padding:0}.p-1{padding:4px}.p-2{padding:8px}.p-4{padding:16px}.\\!px-1{padding-left:4px!important;padding-right:4px!important}.\\!py-2{padding-top:8px!important;padding-bottom:8px!important}.\\!py-\\[7px\\]{padding-top:7px!important;padding-bottom:7px!important}.px-3{padding-left:12px;padding-right:12px}.px-4{padding-left:16px;padding-right:16px}.px-8{padding-left:32px;padding-right:32px}.py-1{padding-top:4px;padding-bottom:4px}.py-2{padding-top:8px;padding-bottom:8px}.py-6{padding-top:24px;padding-bottom:24px}.pb-6{padding-bottom:24px}.pl-6{padding-left:24px}.pr-0{padding-right:0}.pr-2{padding-right:8px}.pr-4{padding-right:16px}.pr-6{padding-right:24px}.pt-4{padding-top:16px}.text-center{text-align:center}.text-2xl{font-size:24px;line-height:32px}.text-\\[12px\\]{font-size:12px}.text-base{font-size:16px;line-height:24px}.text-sm{font-size:14px;line-height:20px}.text-xl{font-size:20px;line-height:28px}.text-xs{font-size:12px;line-height:16px}.font-bold{font-weight:700}.italic{font-style:italic}.leading-\\[14px\\]{line-height:14px}.leading-loose{line-height:2}.\\!text-error-500{--tw-text-opacity: 1 !important;color:rgb(var(--color-error-500) / var(--tw-text-opacity, 1))!important}.text-error-500{--tw-text-opacity: 1;color:rgb(var(--color-error-500) / var(--tw-text-opacity, 1))}.text-surface-400{--tw-text-opacity: 1;color:rgb(var(--color-surface-400) / var(--tw-text-opacity, 1))}.underline-offset-2{text-underline-offset:2px}.accent-surface-900{accent-color:rgb(var(--color-surface-900) / 1)}.opacity-40{opacity:.4}.opacity-50{opacity:.5}.opacity-70{opacity:.7}.mix-blend-hard-light{mix-blend-mode:hard-light}.shadow{--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1);--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-xl{--tw-shadow: 0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1);--tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.-outline-offset-\\[3px\\]{outline-offset:-3px}.\\!ring-0{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important}.blur{--tw-blur: blur(8px);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.blur-\\[1px\\]{--tw-blur: blur(1px);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.drop-shadow-xl{--tw-drop-shadow: drop-shadow(0 20px 13px rgb(0 0 0 / .03)) drop-shadow(0 8px 5px rgb(0 0 0 / .08));filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.backdrop-blur-sm{--tw-backdrop-blur: blur(4px);-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-\\[grid-template-columns\\]{transition-property:grid-template-columns;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-\\[grid-template-rows\\]{transition-property:grid-template-rows;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-\\[stroke-dashoffset\\]{transition-property:stroke-dashoffset;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-\\[transform\\]{transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-\\[width\\]{transition-property:width;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.delay-100{transition-delay:.1s}.duration-100{transition-duration:.1s}.duration-\\[200ms\\]{transition-duration:.2s}.duration-\\[250ms\\]{transition-duration:.25s}.duration-\\[400ms\\]{transition-duration:.4s}.bg-surface-backdrop-token{background-color:rgb(var(--color-surface-400) / .7)}.dark .bg-surface-backdrop-token{background-color:rgb(var(--color-surface-900) / .7)}.bg-surface-100-800-token{background-color:rgb(var(--color-surface-100))}.dark .bg-surface-100-800-token{background-color:rgb(var(--color-surface-800))}.bg-surface-200-700-token{background-color:rgb(var(--color-surface-200))}.dark .bg-surface-200-700-token{background-color:rgb(var(--color-surface-700))}.bg-surface-900-50-token{background-color:rgb(var(--color-surface-900))}.dark .bg-surface-900-50-token{background-color:rgb(var(--color-surface-50))}.border-token{border-width:var(--theme-border-base)}.border-surface-400-500-token{border-color:rgb(var(--color-surface-400))}.dark .border-surface-400-500-token{border-color:rgb(var(--color-surface-500))}.border-surface-900-50-token{border-color:rgb(var(--color-surface-900))}.dark .border-surface-900-50-token{border-color:rgb(var(--color-surface-50))}.border-surface-800-100-token{border-color:rgb(var(--color-surface-800))}.dark .border-surface-800-100-token{border-color:rgb(var(--color-surface-100))}.rounded-token{border-radius:var(--theme-rounded-base)}.rounded-container-token{border-radius:var(--theme-rounded-container)}.rounded-tl-container-token{border-top-left-radius:var(--theme-rounded-container)}.rounded-tr-container-token{border-top-right-radius:var(--theme-rounded-container)}.fill-token{fill:rgba(var(--theme-font-color-base))}.dark .fill-token{fill:rgba(var(--theme-font-color-dark))}.text-surface-700-200-token{color:rgb(var(--color-surface-700))}.dark .text-surface-700-200-token{color:rgb(var(--color-surface-200))}.scrollbar-thin::-webkit-scrollbar-track{background-color:var(--scrollbar-track);border-radius:var(--scrollbar-track-radius)}.scrollbar-thin::-webkit-scrollbar-track:hover{background-color:var(--scrollbar-track-hover, var(--scrollbar-track))}.scrollbar-thin::-webkit-scrollbar-track:active{background-color:var(--scrollbar-track-active, var(--scrollbar-track-hover, var(--scrollbar-track)))}.scrollbar-thin::-webkit-scrollbar-thumb{background-color:var(--scrollbar-thumb);border-radius:var(--scrollbar-thumb-radius)}.scrollbar-thin::-webkit-scrollbar-thumb:hover{background-color:var(--scrollbar-thumb-hover, var(--scrollbar-thumb))}.scrollbar-thin::-webkit-scrollbar-thumb:active{background-color:var(--scrollbar-thumb-active, var(--scrollbar-thumb-hover, var(--scrollbar-thumb)))}.scrollbar-thin::-webkit-scrollbar-corner{background-color:var(--scrollbar-corner);border-radius:var(--scrollbar-corner-radius)}.scrollbar-thin::-webkit-scrollbar-corner:hover{background-color:var(--scrollbar-corner-hover, var(--scrollbar-corner))}.scrollbar-thin::-webkit-scrollbar-corner:active{background-color:var(--scrollbar-corner-active, var(--scrollbar-corner-hover, var(--scrollbar-corner)))}.scrollbar-thin{scrollbar-width:thin;scrollbar-color:var(--scrollbar-thumb, initial) var(--scrollbar-track, initial)}.scrollbar-thin::-webkit-scrollbar{display:block;width:8px;height:8px}.scrollbar-track-transparent{--scrollbar-track: transparent !important}.scrollbar-thumb-slate-400\\/50{--scrollbar-thumb: rgb(148 163 184 / .5) !important}.scrollbar-corner-transparent{--scrollbar-corner: transparent !important}.has-\\[\\:checked\\]\\:\\!variant-filled-primary:has(:checked){--tw-bg-opacity: 1 !important;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity))!important;color:rgb(var(--on-primary))!important}:is(.dark .has-\\[\\:checked\\]\\:\\!variant-filled-primary:has(:checked)){--tw-bg-opacity: 1 !important;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity))!important;color:rgb(var(--on-primary))!important}.hover\\:variant-filled:hover{background-color:rgb(var(--color-surface-900));color:rgb(var(--color-surface-50))}.dark .hover\\:variant-filled:hover{background-color:rgb(var(--color-surface-50));color:rgb(var(--color-surface-900))}.hover\\:variant-soft:hover,.hover\\:variant-soft-surface:hover{background-color:rgb(var(--color-surface-400) / .2);--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;color:rgb(var(--color-surface-700))}.dark .hover\\:variant-soft:hover,.dark .hover\\:variant-soft-surface:hover{color:rgb(var(--color-surface-200))}:is(.dark .hover\\:variant-soft:hover){background-color:rgb(var(--color-surface-500) / .2)}:is(.dark .hover\\:variant-soft-surface:hover){background-color:rgb(var(--color-surface-500) / .2)}.\\[\\&\\:not\\(\\[disabled\\]\\)\\]\\:variant-soft-primary:not([disabled]){background-color:rgb(var(--color-primary-400) / .2);--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;color:rgb(var(--color-primary-700))}.dark .\\[\\&\\:not\\(\\[disabled\\]\\)\\]\\:variant-soft-primary:not([disabled]){color:rgb(var(--color-primary-200))}:is(.dark .\\[\\&\\:not\\(\\[disabled\\]\\)\\]\\:variant-soft-primary:not([disabled])){background-color:rgb(var(--color-primary-500) / .2)}.\\*\\:\\!m-0>*{margin:0!important}.\\*\\:items-center>*{align-items:center}.\\*\\:\\!rounded-none>*{border-radius:0!important}.\\*\\:py-4>*{padding-top:16px;padding-bottom:16px}.\\*\\:text-sm>*{font-size:14px;line-height:20px}.\\*\\:border-surface-300-600-token>*{border-color:rgb(var(--color-surface-300))}.dark .\\*\\:border-surface-300-600-token>*{border-color:rgb(var(--color-surface-600))}.hover\\:translate-x-0:hover{--tw-translate-x: 0px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\\:text-xl:hover{font-size:20px;line-height:28px}.hover\\:opacity-100:hover{opacity:1}.hover\\:brightness-110:hover{--tw-brightness: brightness(1.1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.hover\\:brightness-\\[105\\%\\]:hover{--tw-brightness: brightness(105%);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.focus\\:decoration-wavy:focus{text-decoration-style:wavy}.focus\\:\\!outline-none:focus{outline:2px solid transparent!important;outline-offset:2px!important}.disabled\\:cursor-wait:disabled{cursor:wait}.disabled\\:opacity-70:disabled{opacity:.7}.dark\\:\\!border-surface-200:is(.dark *){--tw-border-opacity: 1 !important;border-color:rgb(var(--color-surface-200) / var(--tw-border-opacity, 1))!important}.dark\\:border-surface-500\\/20:is(.dark *){border-color:rgb(var(--color-surface-500) / .2)}.dark\\:bg-black\\/15:is(.dark *){background-color:#00000026}.dark\\:bg-surface-300:is(.dark *){--tw-bg-opacity: 1;background-color:rgb(var(--color-surface-300) / var(--tw-bg-opacity, 1))}.dark\\:bg-surface-500\\/20:is(.dark *){background-color:rgb(var(--color-surface-500) / .2)}.dark\\:bg-surface-700:is(.dark *){--tw-bg-opacity: 1;background-color:rgb(var(--color-surface-700) / var(--tw-bg-opacity, 1))}.dark\\:fill-slate-200:is(.dark *){fill:#e2e8f0}.dark\\:stroke-surface-50:is(.dark *){stroke:rgb(var(--color-surface-50) / 1)}.dark\\:accent-surface-50:is(.dark *){accent-color:rgb(var(--color-surface-50) / 1)}.dark\\:hover\\:brightness-110:hover:is(.dark *){--tw-brightness: brightness(1.1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}@media (min-width: 768px){.md\\:h-\\[600px\\]{height:600px}.md\\:max-w-screen-md{max-width:768px}.md\\:max-w-screen-sm{max-width:640px}.md\\:flex-row{flex-direction:row}.md\\:\\!items-baseline{align-items:baseline!important}}@media (min-width: 1024px){.lg\\:max-w-screen-md{max-width:768px}}@media (min-width: 1280px){.xl\\:max-w-screen-lg{max-width:1024px}}.\\[\\&\\:last-child\\]\\:\\*\\:pt-4>*:last-child{padding-top:16px}.\\[\\&\\:not\\(\\:last-child\\)\\]\\:\\*\\:py-4>*:not(:last-child){padding-top:16px;padding-bottom:16px}.\\[\\&\\:not\\(\\[disabled\\]\\)\\]\\:hover\\:bg-slate-400\\/30:hover:not([disabled]){background-color:#94a3b84d}.\\[\\&\\>input\\]\\:\\!min-w-0>input{min-width:0px!important}.\\[\\&\\>input\\]\\:\\!border-transparent>input{border-color:transparent!important} `);

(function (Dexie, dayjs, JSZip, GIF, webmMuxer, mp4Muxer) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });
  var _channel, _event, _events, _instance, _FileSystemAccessHandler_instances, addChannelEventListeners_fn, _queue, _carryoverConcurrencyCount, _isIntervalIgnored, _intervalCount, _intervalCap, _interval, _intervalEnd, _intervalId, _timeoutId, _queue2, _queueClass, _pending, _concurrency, _isPaused, _throwOnTimeout, _PQueue_instances, doesIntervalAllowAnother_get, doesConcurrentAllowAnother_get, next_fn, onResumeInterval_fn, isIntervalPaused_get, tryToStartAnother_fn, initializeIntervalIfNeeded_fn, onInterval_fn, processQueue_fn, throwOnAbort_fn, onEvent_fn, _DOWNLOAD_RETRY, _downloadQueue, _Downloader_instances, xhr_fn, dispatchDownload_fn, _MediaDownloadConfig_instances, replaceTemplate_fn, _GelbooruV020_instances, validityCheckFactory_fn, addBookmark_fn, _DanbooruParser_instances, parseBlacklistItem_fn, _AbstractDanbooru_instances, validityCheckFactory_fn2, _ugoiraFramesData, _queue3, _Converter_instances, processConvert_fn, _MoebooruParser_instances, parsePostListData_fn, parseTagListData_fn, parseBlacklist_fn, _Moebooru_instances, validityCallbackFactory_fn, buildMetaByGeneratorData_fn, getPopularDataFactory_fn, downloadArtwork_fn, _Konachan_instances, fixPoolImageStyle_fn, _authParams, _E621ng_instances, notice_fn, noticeError_fn, isPoolGallery_fn, isPoolView_fn, isPostView_fn, isFavoritesPage_fn, isPostsPage_fn, isAuthorized_fn, throwIfNotAuthorized_fn, validityCallbackFactory_fn2, addFavorites_fn, _NijieParser_instances, parseIdByAnchors_fn, _searchParams, _Nijie_instances, isViewPage_fn, isViewPopupPage_fn, isOkazuPage_fn, isSupportedUserPage_fn, isSupportedHistoryPage_fn, getSearchId_fn, addBookmark_fn2;
  (() => {
    if (/\[native code\]/.test(Array.from.toString())) return;
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    Array.from = iframe.contentWindow.Array.from;
    iframe.remove();
  })();
  function getLogger() {
    const methods = ["info", "warn", "error"];
    const style = ["color: green;", "color: orange;", "color: red;"];
    const logLevel = 2;
    const namePrefix = "[Pixiv Downlaoder] ";
    function log(level, args) {
      if (logLevel <= level) console[methods[level]]("%c[Pixiv Downloader]", style[level], ...args);
    }
    return {
      info(...args) {
        log(0, args);
      },
      warn(...args) {
        log(1, args);
      },
      error(...args) {
        log(2, args);
      },
      time(label) {
        console.time(namePrefix + label);
      },
      timeLog(label) {
        console.timeLog(namePrefix + label);
      },
      timeEnd(label) {
        console.timeEnd(namePrefix + label);
      },
      throw(msg, Err) {
        if (Err) {
          throw new Err(`${namePrefix}${msg}`);
        } else {
          throw new Error(`${namePrefix}${msg}`);
        }
      }
    };
  }
  const logger = getLogger();
  function sleep(delay) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }
  function replaceInvalidChar(str) {
    if (typeof str !== "string") throw new TypeError("expect string but got " + typeof str);
    if (!str) return "";
    return str.replace(new RegExp("\\p{C}", "gu"), "").replace(/\\/g, "＼").replace(/\//g, "／").replace(/:/g, "：").replace(/\*/g, "＊").replace(/\?/g, "？").replace(/\|/g, "｜").replace(/"/g, "＂").replace(/</g, "﹤").replace(/>/g, "﹥").replace(/~/g, "～").trim().replace(/^\.|\.$/g, "．");
  }
  function unescapeHtml(str) {
    if (typeof str !== "string") throw new TypeError("expect string but got " + typeof str);
    if (!str) return "";
    const el = document.createElement("p");
    el.innerHTML = str;
    return el.innerText;
  }
  function generateCsv(sheetData) {
    const sheetStr = sheetData.map((row) => {
      return row.map((cell) => {
        return '"' + cell.replace(/"/g, '""') + '"';
      }).join(",");
    }).join("\r\n");
    return new Blob(["\uFEFF" + sheetStr], { type: "text/csv" });
  }
  function evalScript(script) {
    const el = document.createElement("script");
    el.text = script;
    document.head.appendChild(el).parentNode.removeChild(el);
  }
  function readBlobAsDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }
  async function addStyleToShadow(shadowRoot) {
    {
      shadowRoot.adoptedStyleSheets = [window._pdlShadowStyle];
    }
  }
  function getElementText(el) {
    el.normalize();
    if (el.childNodes.length === 0) return "";
    const blockNode = [
      "ADDRESS",
      "ARTICLE",
      "ASIDE",
      "BLOCKQUOTE",
      "DD",
      "DIV",
      "DL",
      "DT",
      "FIELDSET",
      "FIGCAPTION",
      "FIGURE",
      "FOOTER",
      "FORM",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "HEADER",
      "HR",
      "LI",
      "MAIN",
      "NAV",
      "OL",
      "P",
      "PRE",
      "SECTION",
      "TABLE",
      "UL"
    ];
    let str = "";
    for (let i = 0; i < el.childNodes.length; i++) {
      const node = el.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        const val = node.nodeValue;
        (val == null ? undefined : val.trim()) && (str += val);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName === "BR") {
          str += "\n";
          continue;
        }
        if (!blockNode.includes(node.nodeName)) {
          const childText = getElementText(node);
          childText && (str += childText);
        } else {
          const childText = getElementText(node);
          if (childText) {
            str ? str += "\n" + childText : str += childText;
          }
        }
      }
    }
    return str;
  }
  function aDownload$1(blob, filename) {
    const el = document.createElement("a");
    el.href = URL.createObjectURL(blob);
    el.download = filename;
    el.click();
    URL.revokeObjectURL(el.href);
  }
  function intersect(a, b) {
    const set2 = new Set(a);
    const result = [];
    b.forEach((item) => {
      set2.has(item) && result.push(item);
    });
    return result;
  }
  class ChannelEvent {
    constructor(channelName) {
      __privateAdd(this, _channel);
      __privateAdd(this, _event);
      __privateSet(this, _channel, new BroadcastChannel(channelName));
      __privateSet(this, _event, {});
      __privateGet(this, _channel).onmessage = (event2) => {
        const { eventName, args } = event2.data;
        if (!__privateGet(this, _event)[eventName]) return;
        __privateGet(this, _event)[eventName].forEach((callback) => callback(...args));
      };
    }
    on(eventName, callback) {
      var _a;
      (_a = __privateGet(this, _event))[eventName] ?? (_a[eventName] = /* @__PURE__ */ new Set());
      __privateGet(this, _event)[eventName].add(callback);
    }
    off(eventName, callback) {
      if (!__privateGet(this, _event)[eventName]) return;
      __privateGet(this, _event)[eventName].delete(callback);
    }
    emit(eventName, ...args) {
      const data = { eventName, args };
      __privateGet(this, _channel).postMessage(data);
    }
    once(eventName, callback) {
      const onceCallback = (...args) => {
        callback(...args);
        this.off(eventName, onceCallback);
      };
      this.on(eventName, onceCallback);
    }
  }
  _channel = new WeakMap();
  _event = new WeakMap();
  const channelEvent = new ChannelEvent("pixiv-downloader");
  class HistoryDb extends Dexie {
    constructor() {
      super("PdlHistory");
      __publicField(this, "history");
      __publicField(this, "imageEffect");
      this.version(3).stores({
        history: "pid, userId, user, title, *tags",
        imageEffect: "id"
      });
    }
    throwIfInvalidNumber(num) {
      if (typeof num === "string") {
        if (num !== "") {
          num = +num;
        } else {
          return logger.throw('Invalid argument: can not be "".', RangeError);
        }
      }
      if (num < 0 || !Number.isSafeInteger(num)) {
        logger.throw(`Invalid number: ${num}, must be a non-negative integer.`, RangeError);
      }
      return num;
    }
    async add(historyData) {
      const { pid, page } = historyData;
      return this.transaction("rw", this.history, async () => {
        if (page !== undefined) {
          this.throwIfInvalidNumber(page);
          const historyItem = await this.get(pid);
          if (historyItem && historyItem.page === undefined) {
            delete historyData.page;
            this.history.put(historyData);
          } else {
            const u8arr = HistoryDb.updatePageData(page, historyItem == null ? undefined : historyItem.page);
            this.history.put({ ...historyData, page: u8arr });
          }
        } else {
          this.history.put(historyData);
        }
      });
    }
    import(objArr) {
      const historyItems = objArr.map((historyObj) => {
        if (historyObj.page) {
          return { ...historyObj, page: new Uint8Array(Object.values(historyObj.page)) };
        } else {
          return historyObj;
        }
      });
      return this.history.bulkPut(historyItems);
    }
    async has(pid, page) {
      if (page === undefined) {
        return !!await this.get(pid);
      } else {
        this.throwIfInvalidNumber(page);
        const historyItem = await this.get(pid);
        if (!historyItem) return false;
        if (!historyItem.page) return true;
        return HistoryDb.isPageInData(page, historyItem.page);
      }
    }
    get(pid) {
      pid = this.throwIfInvalidNumber(pid);
      return this.history.get(pid);
    }
    getAll() {
      return this.history.toArray();
    }
    generateCsv() {
      return this.getAll().then((datas) => {
        const csvData = datas.map((historyData) => {
          const { pid, userId = "", user = "", title = "", tags = "", comment: comment2 = "" } = historyData;
          return [String(pid), String(userId), user, title, comment2, tags ? tags.join(",") : tags];
        });
        csvData.unshift(["id", "userId", "user", "title", "comment", "tags"]);
        return generateCsv(csvData);
      });
    }
    clear() {
      return this.history.clear();
    }
    // Firefox does not support storing `Arraybuffer`, so it will always return `undefined`.
    async getImageEffect(effectId) {
      return await this.imageEffect.get(effectId);
    }
    addImageEffect(effectData) {
      return this.imageEffect.put(effectData);
    }
    static updatePageData(page, pageData) {
      const byteIndex = Math.floor(page / 8);
      const bitIndex = page % 8;
      if (!pageData) {
        const newArr = new Uint8Array(byteIndex + 1);
        newArr[byteIndex] |= 1 << bitIndex;
        return newArr;
      } else if (byteIndex > pageData.length - 1) {
        const newArr = new Uint8Array(byteIndex + 1);
        newArr.set(pageData);
        newArr[byteIndex] |= 1 << bitIndex;
        return newArr;
      } else {
        pageData[byteIndex] |= 1 << bitIndex;
        return pageData;
      }
    }
    static isPageInData(page, pageData) {
      const byteIndex = Math.floor(page / 8);
      const bitIndex = page % 8;
      return !(byteIndex > pageData.length - 1) && (pageData[byteIndex] & 1 << bitIndex) !== 0;
    }
  }
  class CachedHistoryDb extends HistoryDb {
    constructor() {
      super();
      __publicField(this, "cache", /* @__PURE__ */ new Map());
      __publicField(this, "initCachePromise");
      this.initCachePromise = this.initCache();
      this.initChannel();
    }
    async initCache() {
      logger.time("loadDb");
      const historyItems = await this.getAll();
      let historyItem;
      for (let i = 0; historyItem = historyItems[i++]; ) {
        const { pid, page = null } = historyItem;
        this.cache.set(pid, page);
      }
      logger.timeEnd("loadDb");
    }
    initChannel() {
      channelEvent.on("db.sync", (items) => {
        if (Array.isArray(items)) {
          items.forEach((item) => {
            this.cache.set(item.pid, item.page);
          });
          logger.info("Sync database cache:", items.length);
        } else {
          this.cache.set(items.pid, items.page);
        }
      });
      channelEvent.on("db.clear", () => {
        this.cache.clear();
        logger.info("clear database cache");
      });
    }
    updateCache(item) {
      if (Array.isArray(item)) {
        item.forEach((cache) => {
          this.cache.set(cache.pid, cache.page);
        });
      } else {
        this.cache.set(item.pid, item.page);
      }
      channelEvent.emit("db.sync", item);
    }
    clearCache() {
      this.cache.clear();
      channelEvent.emit(
        "db.clear"
        /* CLEAR */
      );
    }
    async getCache(pid) {
      pid = this.throwIfInvalidNumber(pid);
      await this.initCachePromise;
      return this.cache.get(pid);
    }
    async add(historyData) {
      const { pid, page } = historyData;
      if (page === undefined) {
        !await this.has(pid) && this.updateCache({ pid, page: null });
      } else {
        this.throwIfInvalidNumber(page);
        const pageData = await this.getCache(pid);
        if (pageData !== null) {
          this.updateCache({ pid, page: HistoryDb.updatePageData(page, pageData) });
        } else {
          this.updateCache({ pid, page: null });
        }
      }
      return super.add(historyData);
    }
    import(objArr) {
      const cacheItems = objArr.map((historyObj) => {
        return {
          pid: historyObj.pid,
          page: historyObj.page ? new Uint8Array(Object.values(historyObj.page)) : null
        };
      });
      this.updateCache(cacheItems);
      return super.import(objArr);
    }
    async has(pid, page) {
      pid = this.throwIfInvalidNumber(pid);
      await this.initCachePromise;
      if (page === undefined) {
        return this.cache.has(pid);
      } else {
        this.throwIfInvalidNumber(page);
        const cachesData = await this.getCache(pid);
        if (cachesData === undefined) return false;
        if (cachesData === null) return true;
        return HistoryDb.isPageInData(page, cachesData);
      }
    }
    clear() {
      this.clearCache();
      return super.clear();
    }
  }
  class ReadableHistoryDb extends CachedHistoryDb {
    constructor() {
      super(...arguments);
      __publicField(this, "subscribers", /* @__PURE__ */ new Set());
    }
    runSubscription() {
      logger.info("runSubscription", this.subscribers.size);
      this.subscribers.forEach((subscription) => {
        subscription(this.cache);
      });
    }
    async initCache() {
      await super.initCache();
      this.runSubscription();
    }
    initChannel() {
      super.initChannel();
      const runSubscription = this.runSubscription.bind(this);
      channelEvent.on("db.sync", runSubscription);
      channelEvent.on("db.clear", runSubscription);
    }
    updateCache(item) {
      super.updateCache(item);
      this.runSubscription();
    }
    clearCache() {
      super.clearCache();
      this.runSubscription();
    }
    subscribe(subscription) {
      this.subscribers.add(subscription);
      subscription(this.cache);
      return () => {
        this.subscribers.delete(subscription);
      };
    }
  }
  const historyDb = new ReadableHistoryDb();
  const btnStyle = ".pdl-thumbnail{position:absolute;display:flex;justify-content:center;align-items:center;margin:0;padding:0;height:32px;width:32px;top:calc((100% - 32px) * var(--pdl-btn-top) / 100);left:calc((100% - 32px) * var(--pdl-btn-left) / 100);border:none;border-radius:4px;overflow:hidden;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;user-select:none;font-family:system-ui;font-size:13px;font-weight:700;color:#262626;background-color:#ffffff80;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);z-index:1;cursor:pointer}.pdl-thumbnail:disabled{cursor:not-allowed}.pdl-thumbnail>svg{position:absolute;width:85%;height:85%;fill:currentColor;stroke:currentColor}.pdl-thumbnail>span{opacity:0;transition:opacity .2s}.pdl-thumbnail>span.show{opacity:1}:host([data-type=gallery]) .pdl-thumbnail{position:sticky;top:40px;left:0}:host([data-type=pixiv-my-bookmark]) .pdl-thumbnail{top:calc((100% - 32px) * var(--pdl-btn-self-bookmark-top) / 100);left:calc((100% - 32px) * var(--pdl-btn-self-bookmark-left) / 100)}:host([data-type=pixiv-history]) .pdl-thumbnail{z-index:auto}:host([data-type=pixiv-presentation]) .pdl-thumbnail{position:fixed;top:50px;right:20px;left:auto}:host([data-type=pixiv-toolbar]) .pdl-thumbnail{position:relative;top:auto;left:auto;color:inherit;background-color:transparent}:host([data-type=pixiv-manga-viewer]) .pdl-thumbnail{top:80%;right:4px;left:auto}:host([data-type=yande-browse]) .pdl-thumbnail{top:320px;right:4px;left:auto}:host([data-type=nijie-illust]) .pdl-thumbnail{display:inline-flex;position:static;height:44px;width:44px;top:auto;left:auto;border-radius:8px;margin:0 8px;vertical-align:top}:host([data-type=nijie-illust]) .pdl-thumbnail>svg{width:70%;height:70%}:host([data-status]) .pdl-thumbnail{color:#16a34a}:host([data-status=error]) .pdl-thumbnail{color:#ef4444}";
  const svgGroup = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none">
  <symbol id="pdl-download" viewBox="0 0 512 512">
    <path
      d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z"
    ></path>
  </symbol>

  <symbol id="pdl-loading" viewBox="0 0 512 512">
    <style>
      @keyframes pdl-loading {
        0% {
          transform: rotate3d(0, 0, 1, -90deg) rotate3d(1, 0, 0, 0deg);
          stroke-dashoffset: 1407.43;
        }

        49.99% {
          transform: rotate3d(0, 0, 1, 90deg) rotate3d(1, 0, 0, 0deg);
        }

        50% {
          transform: rotate3d(0, 0, 1, 90deg) rotate3d(1, 0, 0, 180deg);
          stroke-dashoffset: 0;
        }

        100% {
          transform: rotate3d(0, 0, 1, 270deg) rotate3d(1, 0, 0, 180deg);
          stroke-dashoffset: 1407.43;
        }
      }

      circle.rotate {
        transform-origin: 50% 50%;
        animation: 2.5s infinite ease-in-out pdl-loading;
      }
    </style>
    <circle
      class="rotate"
      cx="256"
      cy="256"
      r="224"
      stroke-width="48"
      fill="none"
      stroke-dasharray="1407.43"
      stroke-dashoffset="1055.57"
      stroke-linecap="round"
    ></circle>
  </symbol>

  <symbol id="pdl-progress" viewBox="0 0 512 512">
    <style>
      circle.progress {
        transition: stroke-dashoffset 0.2s ease;
      }
    </style>
    <circle
      class="progress"
      cx="256"
      cy="256"
      r="224"
      stroke-width="48"
      fill="none"
      stroke-dasharray="1407.43"
      stroke-linecap="round"
      transform="rotate(-90 256 256)"
    ></circle>
  </symbol>

  <symbol id="pdl-error" viewBox="0 0 512 512">
    <path
      d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"
    ></path>
  </symbol>

  <symbol id="pdl-complete" viewBox="0 0 512 512">
    <path
      d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"
    ></path>
  </symbol>
</svg>
`;
  const iconTypeMap = {
    init: "#pdl-download",
    loading: "#pdl-loading",
    progress: "#pdl-progress",
    complete: "#pdl-complete",
    error: "#pdl-error"
  };
  var ThumbnailBtnStatus = /* @__PURE__ */ ((ThumbnailBtnStatus2) => {
    ThumbnailBtnStatus2["Init"] = "init";
    ThumbnailBtnStatus2["Loading"] = "loading";
    ThumbnailBtnStatus2["Progress"] = "progress";
    ThumbnailBtnStatus2["Complete"] = "complete";
    ThumbnailBtnStatus2["Error"] = "error";
    return ThumbnailBtnStatus2;
  })(ThumbnailBtnStatus || {});
  var ThumbnailBtnType = /* @__PURE__ */ ((ThumbnailBtnType2) => {
    ThumbnailBtnType2["Gallery"] = "gallery";
    ThumbnailBtnType2["PixivMyBookmark"] = "pixiv-my-bookmark";
    ThumbnailBtnType2["PixivHistory"] = "pixiv-history";
    ThumbnailBtnType2["PixivPresentation"] = "pixiv-presentation";
    ThumbnailBtnType2["PixivToolbar"] = "pixiv-toolbar";
    ThumbnailBtnType2["PixivMangaViewer"] = "pixiv-manga-viewer";
    ThumbnailBtnType2["YandeBrowse"] = "yande-browse";
    ThumbnailBtnType2["NijieIllust"] = "nijie-illust";
    return ThumbnailBtnType2;
  })(ThumbnailBtnType || {});
  class ThumbnailButton extends HTMLElement {
    constructor(props) {
      super();
      __publicField(this, "btn");
      __publicField(this, "status", "init");
      __publicField(this, "mediaId");
      __publicField(this, "page");
      __publicField(this, "type");
      __publicField(this, "onClick");
      __publicField(this, "unsubscriber");
      __publicField(this, "connectedFlag", false);
      __publicField(this, "shouldObserveDb", true);
      __publicField(this, "progress", 0);
      __publicField(this, "dirty", false);
      this.dispatchDownload = this.dispatchDownload.bind(this);
      this.onClick = props.onClick;
      this.mediaId = this.checkNumberValidity(props.id);
      this.dataset.id = String(this.mediaId);
      if (props.type) {
        this.dataset.type = this.type = props.type;
      }
      if (props.page !== undefined) {
        this.page = this.checkNumberValidity(props.page);
        this.dataset.page = String(this.page);
      }
      props.shouldObserveDb !== undefined && (this.shouldObserveDb = props.shouldObserveDb);
      if (props.extraData) {
        for (const key in props.extraData) {
          this.dataset[key] = props.extraData[key];
        }
      }
    }
    static get tagNameLowerCase() {
      return "pdl-button";
    }
    checkNumberValidity(num) {
      if (typeof num === "string") {
        if (num !== "") {
          num = +num;
        } else {
          return logger.throw('Invalid argument: can not be "".', RangeError);
        }
      }
      if (num < 0 || !Number.isSafeInteger(num)) {
        return logger.throw(`Invalid number: ${num}, must be a non-negative integer.`, RangeError);
      }
      return num;
    }
    static get observedAttributes() {
      return ["data-id", "data-status", "data-page", "data-type", "disabled"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case "data-id":
          this.updateId(newValue);
          break;
        case "data-status":
          this.updateIcon(newValue);
          break;
        case "data-page":
          this.updatePage(newValue);
          break;
        case "data-type":
          this.resetType(newValue);
          break;
        case "disabled":
          this.updateDisableStatus(newValue);
          break;
      }
    }
    resetType(newVal) {
      if (newVal === null && this.type === undefined) return;
      if (newVal !== this.type) {
        if (this.type === undefined) {
          delete this.dataset.type;
        } else {
          this.dataset.type = this.type;
        }
        logger.error('Changes to "data-type" is not allowed.');
      }
    }
    updateId(id) {
      try {
        if (id === null) throw new Error('Attribute "data-id" is required.');
        this.mediaId = this.checkNumberValidity(id);
        this.connectedFlag && this.shouldObserveDb && this.observeDb()();
      } catch (error) {
        logger.error(error);
        this.dataset.id = String(this.mediaId);
      }
    }
    updateDisableStatus(val) {
      if (!this.connectedFlag) {
        this.dirty = true;
        return;
      }
      if (typeof val === "string") {
        this.btn.setAttribute("disabled", "");
      } else {
        this.btn.removeAttribute("disabled");
      }
    }
    updatePage(page) {
      try {
        if (page === null) {
          this.page = void 0;
        } else {
          this.page = this.checkNumberValidity(page);
        }
        this.connectedFlag && this.shouldObserveDb && this.observeDb()();
      } catch (error) {
        logger.error(error);
        if (this.page === undefined) {
          delete this.dataset.page;
        } else {
          this.dataset.page = String(this.page);
        }
      }
    }
    updateIcon(status) {
      if (status === null) {
        status = "init";
      } else if (status === "init") {
        delete this.dataset.status;
        return;
      } else if (!(status in iconTypeMap)) {
        this.dataset.status = this.status;
        return;
      }
      this.status = status;
      if (!this.connectedFlag) {
        this.dirty = true;
        return;
      }
      const useEl = this.shadowRoot.querySelector("use");
      useEl.setAttribute("xlink:href", iconTypeMap[status]);
      useEl.animate([{ opacity: 0.5 }, { opactiy: 1 }], { duration: 200 });
    }
    render() {
      let shadowRoot;
      if ((shadowRoot = this.shadowRoot) && !this.dirty) return;
      const statusIsProgress = this.status === "progress";
      shadowRoot ?? (shadowRoot = this.attachShadow({ mode: "open" }));
      shadowRoot.innerHTML = `<style>${btnStyle}</style>${svgGroup}<button class="pdl-thumbnail" ${this.hasAttribute("disabled") ? "disabled" : ""}>
      <svg xmlns="http://www.w3.org/2000/svg" class="pdl-icon" ${statusIsProgress ? `style="stroke-dashoffset: ${this.clacProgressRadial(this.progress)};"` : ""}>
        <use xlink:href="${iconTypeMap[this.status]}"></use>
      </svg>
      ${statusIsProgress ? `<span class="show">${this.progress}</span>` : "<span></span>"}
    </button>`;
    }
    dispatchDownload(evt) {
      evt == null ? undefined : evt.preventDefault();
      evt == null ? undefined : evt.stopPropagation();
      this.setAttribute("disabled", "");
      this.setStatus(
        "loading"
        /* Loading */
      );
      Promise.resolve(this.onClick(this)).then(
        () => {
          this.setStatus(
            "complete"
            /* Complete */
          );
        },
        (err) => {
          if (err) logger.error(err);
          this.setStatus(
            "error"
            /* Error */
          );
        }
      ).finally(() => {
        this.removeAttribute("disabled");
      });
    }
    observeDb() {
      return historyDb.subscribe(async () => {
        const downloaded = await historyDb.has(this.mediaId, this.page);
        if (this.status === "complete") {
          !downloaded && this.setStatus(
            "init"
            /* Init */
          );
        } else {
          downloaded && this.setStatus(
            "complete"
            /* Complete */
          );
        }
      });
    }
    connectedCallback() {
      this.render();
      this.dirty && (this.dirty = false);
      this.connectedFlag = true;
      this.btn = this.shadowRoot.querySelector("button");
      this.btn.addEventListener("click", this.dispatchDownload);
      this.shouldObserveDb && (this.unsubscriber = this.observeDb());
    }
    disconnectedCallback() {
      var _a, _b;
      this.connectedFlag = false;
      (_a = this.btn) == null ? undefined : _a.removeEventListener("click", this.dispatchDownload);
      (_b = this.unsubscriber) == null ? undefined : _b.call(this);
    }
    clacProgressRadial(progress) {
      const radius = 224;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - progress / 100 * circumference;
      return offset;
    }
    setProgress(progress, updateProgressbar = true) {
      if (progress < 0 || progress > 100) throw new RangeError('Value "progress" must between 0-100');
      this.progress = Math.floor(progress);
      if (this.status !== "progress") {
        this.dataset.status = "progress";
      }
      if (!this.connectedFlag) {
        this.dirty = true;
        return;
      }
      const shadowRoot = this.shadowRoot;
      const span = shadowRoot.querySelector("span");
      span.classList.add("show");
      span.textContent = String(this.progress);
      if (!updateProgressbar) return;
      const svg = shadowRoot.querySelector("svg.pdl-icon");
      svg.style.strokeDashoffset = String(this.clacProgressRadial(progress));
    }
    removeProgress() {
      if (this.status === "progress") this.dataset.status = "init";
      this.progress = 0;
      if (!this.connectedFlag) {
        this.dirty = true;
        return;
      }
      const shadowRoot = this.shadowRoot;
      const span = shadowRoot.querySelector("span");
      const svg = shadowRoot.querySelector("svg.pdl-icon");
      span.classList.remove("show");
      span.addEventListener(
        "transitionend",
        () => {
          span.textContent = "";
        },
        { once: true }
      );
      svg.style.removeProperty("stroke-dashoffset");
    }
    setStatus(status) {
      if (status !== this.status) {
        if (status === "init") {
          delete this.dataset.status;
          return;
        }
        if (status === "progress") {
          this.setProgress(0);
          return;
        }
        if (this.status === "progress") {
          this.removeProgress();
        }
        this.dataset.status = status;
      }
    }
  }
  customElements.define(ThumbnailButton.tagNameLowerCase, ThumbnailButton);
  const wrapperStyle = ".button-wrapper{position:absolute;right:8px;top:0;bottom:0;margin-top:40px}.button-wrapper.gelbooru{bottom:calc(1em + 22px)}.button-wrapper.moebooru_image{right:calc(5em + 8px)}.button-wrapper.native_video{bottom:70px}.button-wrapper.vjs_video{bottom:32px}.button-wrapper.fluid_video{bottom:56px}";
  class ArtworkButton extends HTMLElement {
    constructor(props) {
      super();
      __publicField(this, "props");
      this.props = props;
    }
    static get tagNameLowerCase() {
      return "pdl-artwork-button";
    }
    render() {
      if (this.shadowRoot) return;
      const shadowRoot = this.attachShadow({ mode: "open" });
      const btnProps = { ...this.props };
      shadowRoot.innerHTML = `<style>${wrapperStyle}</style><div class="button-wrapper${btnProps.site ? " " + btnProps.site : ""}"></div>`;
      delete btnProps.site;
      const thumbnailButton = new ThumbnailButton({
        type: ThumbnailBtnType.Gallery,
        ...btnProps
      });
      const wrapper = shadowRoot.querySelector(".button-wrapper");
      wrapper.appendChild(thumbnailButton);
    }
    connectedCallback() {
      this.render();
    }
  }
  customElements.define(ArtworkButton.tagNameLowerCase, ArtworkButton);
  const zh = {
    setting: {
      save_to: {
        title: "保存至",
        label: {
          directory: "保存位置",
          filename: "文件名"
        },
        options: {
          use_fsa: "使用FileSystemAccess API",
          fsa_directory: "选择保存文件夹",
          fsa_filename_conflict: "当文件名重复时",
          tag_language: "使用的标签语言",
          tag_language_tips: "无翻译的标签仍可能是其他语言"
        },
        button: {
          choose_fsa_directory: "浏览"
        },
        radio: {
          filename_conflict_option_uniquify: "重命名",
          filename_conflict_option_overwrite: "覆盖",
          filename_conflict_option_prompt: "提示"
        },
        placeholder: {
          sub_directory_unused: "如不需要保存到子目录，此行留空即可",
          vm_not_supported: "Violentmonkey不支持",
          need_browser_api: '请将下载模式设置为"Browser Api"',
          filename_requried: "必填"
        }
      },
      ugoira: {
        title: "动图转换",
        label: {
          format: "动图格式",
          quality: "动图质量"
        },
        options: {
          select_format: "将动图转换到所选格式",
          gif_tips: "数值越低颜色越好，但处理速度显著减慢",
          webm_tips: "0最差，99最好",
          webp_lossy: "无损转换",
          webp_quality: "图片质量",
          webp_quality_tips: "有损：0表示文件最小，100表示文件最大。无损：0最快，但文件较大，100最慢，但质量最好。",
          webp_method: "压缩方法",
          webp_method_tips: "0=快，6=慢但效果更好",
          png_tips: "颜色数量。0：所有颜色（无损PNG）"
        }
      },
      history: {
        title: "下载历史",
        label: {
          scheduled_backups: "定期备份",
          export: "导出",
          import: "导入",
          clear: "清理"
        },
        options: {
          scheduled_backups: "以选定的时间间隔自动备份下载历史",
          export_as_json: "将下载历史导出为JSON文件",
          export_as_csv: "将下载历史导出为CSV文件",
          import_json: "导入JSON格式下载历史",
          clear_history: "清除下载历史"
        },
        button: {
          export: "导出记录",
          import: "导入记录",
          clear: "清除记录"
        },
        select: {
          backup_interval_never: "不备份",
          backup_interval_every_day: "每天",
          backup_interval_every_7_day: "每7天",
          backup_interval_every_30_day: "每30天"
        },
        text: {
          confirm_clear_history: "真的要清除历史记录吗？"
        }
      },
      button_position: {
        title: "按钮位置",
        label: {
          common: "通用",
          my_bookmark: "我的收藏"
        },
        options: {
          horizon_position: "水平位置",
          vertical_position: "垂直位置"
        }
      },
      authorization: {
        title: "网站认证"
      },
      others: {
        title: "其它",
        options: {
          show_setting_button: "显示设置按钮",
          bundle_multipage_illust: "将多页插图打包为zip压缩包",
          bundle_manga: "将漫画作品打包为zip压缩包",
          like_illust_when_downloading: "下载作品时点赞",
          add_bookmark_when_downloading: "下载作品时收藏",
          add_bookmark_with_tags: "收藏时添加作品标签",
          add_bookmark_private_r18: "将R-18作品收藏到不公开类别",
          option_does_not_apply_to_batch_download: "批量下载不适用"
        }
      },
      feedback: {
        title: "反馈 / 赞赏",
        label: {
          feedback: "反馈",
          donate: "赞赏"
        },
        text: {
          feedback_desc: `如果你在使用中发现了问题或有改进建议，欢迎到<a href="https://github.com/drunkg00se/Pixiv-Downloader/issues" target="_blank" class="anchor">此链接</a>反馈。`,
          give_me_a_star: '如果脚本有帮助到你，<a href="https://github.com/drunkg00se/Pixiv-Downloader" target="_blank" class="anchor">欢迎点此在GitHub中给我一个 ⭐Star。</a>',
          donate_desc: "或者，扫码请我喝杯可乐 ^_^"
        }
      }
    },
    downloader: {
      category: {
        tab_name: "类别",
        filter: {
          exclude_downloaded: "排除已下载",
          exclude_blacklist: "排除黑名单",
          image: "图片",
          video: "视频",
          download_all_pages: "下载所有页",
          download_selected_pages: "自定义页数",
          pixiv_illust: "插画",
          pixiv_manga: "漫画",
          pixiv_ugoira: "动图"
        }
      },
      tag_filter: {
        tab_name: "标签",
        placeholder: {
          blacklist_tag: "黑名单，将排除含有以下标签的作品。",
          whitelist_tag: "白名单，只下载包含以下标签的作品。"
        }
      },
      others: {
        tab_name: "其它",
        options: {
          retry_failed: "对首次下载失败的图片进行重试"
        }
      },
      download_type: {
        stop: "停止",
        pixiv_works: "作品",
        pixiv_bookmark: "收藏",
        pixiv_bookmark_public: "公开收藏",
        pixiv_bookmark_private: "不公开收藏",
        pixiv_follow_latest_all: "全部",
        pixiv_follow_latest_r18: "R-18",
        pixiv_series: "系列",
        moebooru_posts: "投稿",
        moebooru_pool: "图集",
        moebooru_popular_1d: "日",
        moebooru_popular_1w: "周",
        moebooru_popular_1m: "月",
        moebooru_popular_1y: "年",
        moebooru_popular_date: "人气"
      }
    },
    button: {
      setting: "设置"
    },
    changelog: {
      feedback: "有问题or想建议？这里反馈",
      credit: "脚本还行？请点这里支持我！",
      give_me_a_star: "在GitHub中给我一个 ⭐Star，",
      buy_me_a_drink: "或者，扫码请我喝杯香草味冰可乐。^_^"
    }
  };
  const en = {
    setting: {
      save_to: {
        title: "Save To",
        label: {
          directory: "Save Path",
          filename: "Filename"
        },
        options: {
          use_fsa: "Use FileSystemAccess API",
          fsa_directory: "Select directory",
          fsa_filename_conflict: "When filename conflicts",
          tag_language: "Tag Language",
          tag_language_tips: "Tags without translation may still be in another language"
        },
        button: {
          choose_fsa_directory: "Browse"
        },
        radio: {
          filename_conflict_option_uniquify: "Uniquify",
          filename_conflict_option_overwrite: "Overwrite",
          filename_conflict_option_prompt: "Prompt"
        },
        placeholder: {
          sub_directory_unused: "Leave folder name blank if not saving to a subdirectory",
          vm_not_supported: "Not supported by Violentmonkey",
          need_browser_api: "Browser API required",
          filename_requried: "Required"
        }
      },
      ugoira: {
        title: "Ugoira",
        label: {
          format: "Ugoira Format",
          quality: "Ugoira Quality"
        },
        options: {
          select_format: "Convert Ugoira to selected format",
          gif_tips: "Lower values produce better colors, but slow processing significantly",
          webm_tips: "0 (worst) to 99 (best)",
          webp_lossy: "Lossless Webp",
          webp_quality: "Image Quality",
          webp_quality_tips: "For lossy, 0 gives the smallest size and 100 the largest. For lossless, 0 is the fastest but gives larger files compared to the slowest, but best, 100.",
          webp_method: "Compression Method",
          webp_method_tips: "Quality/speed trade-off (0=fast, 6=slower-better)",
          png_tips: "Number of colors in the result; 0: all colors (lossless PNG)"
        }
      },
      history: {
        title: "History",
        label: {
          scheduled_backups: "Scheduled Backups",
          export: "Export",
          import: "Import",
          clear: "Clear"
        },
        options: {
          scheduled_backups: "Automatically back up download history at selected intervals.",
          export_as_json: "Export download history as JSON file",
          export_as_csv: "Export download history as CSV file",
          import_json: "Import JSON format download history",
          clear_history: "Clear download history"
        },
        button: {
          export: "Export",
          import: "Import",
          clear: "Clear"
        },
        select: {
          backup_interval_never: "Never",
          backup_interval_every_day: "Every day",
          backup_interval_every_7_day: "7 days",
          backup_interval_every_30_day: "30 days"
        },
        text: {
          confirm_clear_history: "Do you really want to clear history?"
        }
      },
      button_position: {
        title: "Button",
        label: {
          common: "Common",
          my_bookmark: "My Bookmark"
        },
        options: {
          horizon_position: "Horizontal Position",
          vertical_position: "Vertical Position"
        }
      },
      authorization: {
        title: "Auth"
      },
      others: {
        title: "Others",
        options: {
          show_setting_button: "Show Setting Button",
          bundle_multipage_illust: "Bundle multipage illustrations into a zip file",
          bundle_manga: "Bundle manga into a zip file",
          like_illust_when_downloading: "Like the artwork when downloading",
          add_bookmark_when_downloading: "Bookmark artwork when downloading",
          add_bookmark_with_tags: "Add tags when bookmarking",
          add_bookmark_private_r18: "Bookmark R-18 artwork as private",
          option_does_not_apply_to_batch_download: "This option does not apply to batch download"
        }
      },
      feedback: {
        title: "Feedback",
        label: {
          feedback: "Feedback",
          donate: "Donate"
        },
        text: {
          feedback_desc: 'If you encounter any issues or have suggestions for improvements, feel free to provide feedback <a href="https://github.com/drunkg00se/Pixiv-Downloader/issues" target="_blank" class=" anchor">here.</a>',
          give_me_a_star: 'If the script is helpful to you, please <a href="https://github.com/drunkg00se/Pixiv-Downloader" target="_blank" class="anchor">click here and give me a ⭐Star on GitHub.</a>',
          donate_desc: "Or, buy me a cola. ^_^"
        }
      }
    },
    downloader: {
      category: {
        tab_name: "Category",
        filter: {
          exclude_downloaded: "Exclude Downloaded",
          exclude_blacklist: "Exclude Blacklist",
          image: "Image",
          video: "Video",
          download_all_pages: "All Pages",
          download_selected_pages: "Custom Pages",
          pixiv_illust: "Illustration",
          pixiv_manga: "Manga",
          pixiv_ugoira: "Ugoira"
        }
      },
      tag_filter: {
        tab_name: "Tags",
        placeholder: {
          blacklist_tag: "Blacklist: Exclude works with these tags.",
          whitelist_tag: "Whitelist: Only download works with these tags."
        }
      },
      others: {
        tab_name: "others",
        options: {
          retry_failed: "Retry failed image downloads."
        }
      },
      download_type: {
        stop: "Stop",
        pixiv_works: "Works",
        pixiv_bookmark: "Bookmarks",
        pixiv_bookmark_public: "Public",
        pixiv_bookmark_private: "Private",
        pixiv_follow_latest_all: "All",
        pixiv_follow_latest_r18: "R-18",
        pixiv_series: "Series",
        moebooru_posts: "Posts",
        moebooru_pool: "Pool",
        moebooru_popular_1d: "1d",
        moebooru_popular_1w: "1w",
        moebooru_popular_1m: "1m",
        moebooru_popular_1y: "1y",
        moebooru_popular_date: "Popular"
      }
    },
    button: {
      setting: "Setting"
    },
    changelog: {
      feedback: "Feedback / Report an issue",
      credit: "Click here to support me!",
      give_me_a_star: "Give me a ⭐Star on GitHub.",
      buy_me_a_drink: "Or, buy me a vanilla-flavored iced cola. ^_^"
    }
  };
  const messages = {
    "zh-cn": zh,
    "zh-tw": zh,
    zh,
    en
  };
  const curLang = navigator.language.toLowerCase();
  const lang = curLang in messages ? curLang : "en";
  function t(key) {
    const paths = key.split(".");
    let last = messages[lang];
    for (let i = 0; i < paths.length; i++) {
      const value = last[paths[i]];
      if (value === undefined || value === null) return null;
      last = value;
    }
    return last;
  }
  var _GM_download = /* @__PURE__ */ (() => typeof GM_download != "undefined" ? GM_download : undefined)();
  var _GM_info = /* @__PURE__ */ (() => typeof GM_info != "undefined" ? GM_info : undefined)();
  var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : undefined)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : undefined)();
  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();
  var UgoiraFormat = /* @__PURE__ */ ((UgoiraFormat2) => {
    UgoiraFormat2["ZIP"] = "zip";
    UgoiraFormat2["GIF"] = "gif";
    UgoiraFormat2["WEBP"] = "webp";
    UgoiraFormat2["PNG"] = "png";
    UgoiraFormat2["WEBM"] = "webm";
    UgoiraFormat2["MP4"] = "mp4";
    return UgoiraFormat2;
  })(UgoiraFormat || {});
  var FilenameConfigAction = /* @__PURE__ */ ((FilenameConfigAction2) => {
    FilenameConfigAction2["UNIQUIFY"] = "uniquify";
    FilenameConfigAction2["OVERWRITE"] = "overwrite";
    FilenameConfigAction2["PROMPT"] = "prompt";
    return FilenameConfigAction2;
  })(FilenameConfigAction || {});
  var TagLanguage = /* @__PURE__ */ ((TagLanguage2) => {
    TagLanguage2["JAPANESE"] = "ja";
    TagLanguage2["CHINESE"] = "zh";
    TagLanguage2["TRADITIONAL_CHINESE"] = "zh_tw";
    TagLanguage2["ENGLISH"] = "en";
    return TagLanguage2;
  })(TagLanguage || {});
  var HistoryBackupInterval = /* @__PURE__ */ ((HistoryBackupInterval2) => {
    HistoryBackupInterval2[HistoryBackupInterval2["NEVER"] = 0] = "NEVER";
    HistoryBackupInterval2[HistoryBackupInterval2["EVERY_DAY"] = 86400] = "EVERY_DAY";
    HistoryBackupInterval2[HistoryBackupInterval2["EVERY_7_DAY"] = 604800] = "EVERY_7_DAY";
    HistoryBackupInterval2[HistoryBackupInterval2["EVERY_30_DAY"] = 2592e3] = "EVERY_30_DAY";
    return HistoryBackupInterval2;
  })(HistoryBackupInterval || {});
  let config;
  function loadConfig(customConfig = {}) {
    if (config) throw new Error("`config` has already been defined.");
    const defaultConfig = Object.freeze({
      version: "1.8.2",
      ugoiraFormat: "zip",
      folderPattern: "",
      filenamePattern: "{id}",
      tagLang: "ja",
      showMsg: true,
      mixEffect: false,
      bundleIllusts: false,
      bundleManga: false,
      addBookmark: false,
      addBookmarkWithTags: false,
      privateR18: false,
      likeIllust: false,
      useFileSystemAccess: false,
      fileSystemFilenameConflictAction: "uniquify",
      showPopupButton: true,
      gifQuality: 10,
      webmBitrate: 20,
      mp4Bitrate: 20,
      losslessWebp: false,
      webpQuality: 95,
      webpMehtod: 4,
      pngColor: 256,
      historyBackupInterval: 0,
      lastHistoryBackup: 0,
      auth: null,
      "pdl-btn-self-bookmark-left": 100,
      "pdl-btn-self-bookmark-top": 76,
      "pdl-btn-left": 0,
      "pdl-btn-top": 100,
      ...customConfig
    });
    let configData;
    if (!localStorage.pdlSetting) {
      configData = Object.assign({}, defaultConfig);
    } else {
      try {
        configData = JSON.parse(localStorage.pdlSetting);
      } catch (error) {
        logger.error("Use default config because: ", error);
        configData = Object.assign({}, defaultConfig);
      }
    }
    if (configData.version !== defaultConfig.version) {
      configData = {
        ...defaultConfig,
        ...configData,
        version: defaultConfig.version,
        showMsg: true
      };
      localStorage.pdlSetting = JSON.stringify(configData);
    }
    const subscribers = /* @__PURE__ */ new Set();
    const set2 = (newConfig) => {
      configData = newConfig;
      localStorage.pdlSetting = JSON.stringify(configData);
      for (const subscriber of subscribers) {
        subscriber(configData);
      }
    };
    const update2 = (fn) => {
      set2(fn(configData));
    };
    const subscribe = (fn) => {
      subscribers.add(fn);
      fn(configData);
      return () => {
        subscribers.delete(fn);
      };
    };
    config = {
      get(key) {
        return configData[key];
      },
      set: set2,
      update: update2,
      subscribe
    };
    return config;
  }
  const PUBLIC_VERSION = "5";
  if (typeof window !== "undefined")
    (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
  const EACH_ITEM_REACTIVE = 1;
  const EACH_INDEX_REACTIVE = 1 << 1;
  const EACH_IS_CONTROLLED = 1 << 2;
  const EACH_IS_ANIMATED = 1 << 3;
  const EACH_ITEM_IMMUTABLE = 1 << 4;
  const PROPS_IS_IMMUTABLE = 1;
  const PROPS_IS_RUNES = 1 << 1;
  const PROPS_IS_UPDATED = 1 << 2;
  const PROPS_IS_BINDABLE = 1 << 3;
  const PROPS_IS_LAZY_INITIAL = 1 << 4;
  const TRANSITION_IN = 1;
  const TRANSITION_OUT = 1 << 1;
  const TRANSITION_GLOBAL = 1 << 2;
  const TEMPLATE_FRAGMENT = 1;
  const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
  const HYDRATION_START = "[";
  const HYDRATION_START_ELSE = "[!";
  const HYDRATION_END = "]";
  const HYDRATION_ERROR = {};
  const UNINITIALIZED = Symbol();
  function is_capture_event(name) {
    return name.endsWith("capture") && name !== "gotpointercapture" && name !== "lostpointercapture";
  }
  const DELEGATED_EVENTS = [
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart"
  ];
  function is_delegated(event_name) {
    return DELEGATED_EVENTS.includes(event_name);
  }
  const ATTRIBUTE_ALIASES = {
    // no `class: 'className'` because we handle that separately
    formnovalidate: "formNoValidate",
    ismap: "isMap",
    nomodule: "noModule",
    playsinline: "playsInline",
    readonly: "readOnly",
    defaultvalue: "defaultValue",
    defaultchecked: "defaultChecked",
    srcobject: "srcObject"
  };
  function normalize_attribute(name) {
    name = name.toLowerCase();
    return ATTRIBUTE_ALIASES[name] ?? name;
  }
  const PASSIVE_EVENTS = ["touchstart", "touchmove"];
  function is_passive_event(name) {
    return PASSIVE_EVENTS.includes(name);
  }
  const DEV = false;
  var is_array = Array.isArray;
  var index_of = Array.prototype.indexOf;
  var array_from = Array.from;
  var object_keys = Object.keys;
  var define_property = Object.defineProperty;
  var get_descriptor = Object.getOwnPropertyDescriptor;
  var get_descriptors = Object.getOwnPropertyDescriptors;
  var object_prototype = Object.prototype;
  var array_prototype = Array.prototype;
  var get_prototype_of = Object.getPrototypeOf;
  function is_function(thing) {
    return typeof thing === "function";
  }
  const noop = () => {
  };
  function is_promise(value) {
    return typeof (value == null ? undefined : value.then) === "function";
  }
  function run(fn) {
    return fn();
  }
  function run_all(arr) {
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
  const DERIVED = 1 << 1;
  const EFFECT = 1 << 2;
  const RENDER_EFFECT = 1 << 3;
  const BLOCK_EFFECT = 1 << 4;
  const BRANCH_EFFECT = 1 << 5;
  const ROOT_EFFECT = 1 << 6;
  const BOUNDARY_EFFECT = 1 << 7;
  const UNOWNED = 1 << 8;
  const DISCONNECTED = 1 << 9;
  const CLEAN = 1 << 10;
  const DIRTY = 1 << 11;
  const MAYBE_DIRTY = 1 << 12;
  const INERT = 1 << 13;
  const DESTROYED = 1 << 14;
  const EFFECT_RAN = 1 << 15;
  const EFFECT_TRANSPARENT = 1 << 16;
  const LEGACY_DERIVED_PROP = 1 << 17;
  const HEAD_EFFECT = 1 << 19;
  const EFFECT_HAS_DERIVED = 1 << 20;
  const STATE_SYMBOL = Symbol("$state");
  const LEGACY_PROPS = Symbol("legacy props");
  const LOADING_ATTR_SYMBOL = Symbol("");
  function equals(value) {
    return value === this.v;
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
  }
  function not_equal(a, b) {
    return a !== b;
  }
  function safe_equals(value) {
    return !safe_not_equal(value, this.v);
  }
  function effect_in_teardown(rune) {
    {
      throw new Error(`https://svelte.dev/e/effect_in_teardown`);
    }
  }
  function effect_in_unowned_derived() {
    {
      throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
    }
  }
  function effect_orphan(rune) {
    {
      throw new Error(`https://svelte.dev/e/effect_orphan`);
    }
  }
  function effect_update_depth_exceeded() {
    {
      throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
    }
  }
  function hydration_failed() {
    {
      throw new Error(`https://svelte.dev/e/hydration_failed`);
    }
  }
  function lifecycle_legacy_only(name) {
    {
      throw new Error(`https://svelte.dev/e/lifecycle_legacy_only`);
    }
  }
  function props_invalid_value(key) {
    {
      throw new Error(`https://svelte.dev/e/props_invalid_value`);
    }
  }
  function state_descriptors_fixed() {
    {
      throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
    }
  }
  function state_prototype_fixed() {
    {
      throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
    }
  }
  function state_unsafe_local_read() {
    {
      throw new Error(`https://svelte.dev/e/state_unsafe_local_read`);
    }
  }
  function state_unsafe_mutation() {
    {
      throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
    }
  }
  let legacy_mode_flag = false;
  let tracing_mode_flag = false;
  function enable_legacy_mode_flag() {
    legacy_mode_flag = true;
  }
  function source(v, stack) {
    var signal = {
      f: 0,
      // TODO ideally we could skip this altogether, but it causes type errors
      v,
      reactions: null,
      equals,
      rv: 0,
      wv: 0
    };
    return signal;
  }
  function state(v) {
    return /* @__PURE__ */ push_derived_source(source(v));
  }
  // @__NO_SIDE_EFFECTS__
  function mutable_source(initial_value, immutable = false) {
    var _a;
    const s = source(initial_value);
    if (!immutable) {
      s.equals = safe_equals;
    }
    if (legacy_mode_flag && component_context !== null && component_context.l !== null) {
      ((_a = component_context.l).s ?? (_a.s = [])).push(s);
    }
    return s;
  }
  function mutable_state(v, immutable = false) {
    return /* @__PURE__ */ push_derived_source(/* @__PURE__ */ mutable_source(v, immutable));
  }
  // @__NO_SIDE_EFFECTS__
  function push_derived_source(source2) {
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
      if (derived_sources === null) {
        set_derived_sources([source2]);
      } else {
        derived_sources.push(source2);
      }
    }
    return source2;
  }
  function set(source2, value) {
    if (active_reaction !== null && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT)) !== 0 && // If the source was created locally within the current derived, then
    // we allow the mutation.
    (derived_sources === null || !derived_sources.includes(source2))) {
      state_unsafe_mutation();
    }
    return internal_set(source2, value);
  }
  function internal_set(source2, value) {
    if (!source2.equals(value)) {
      source2.v;
      source2.v = value;
      source2.wv = increment_write_version();
      mark_reactions(source2, DIRTY);
      if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
        if (untracked_writes === null) {
          set_untracked_writes([source2]);
        } else {
          untracked_writes.push(source2);
        }
      }
    }
    return value;
  }
  function mark_reactions(signal, status) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    var runes = is_runes();
    var length = reactions.length;
    for (var i = 0; i < length; i++) {
      var reaction = reactions[i];
      var flags = reaction.f;
      if ((flags & DIRTY) !== 0) continue;
      if (!runes && reaction === active_effect) continue;
      set_signal_status(reaction, status);
      if ((flags & (CLEAN | UNOWNED)) !== 0) {
        if ((flags & DERIVED) !== 0) {
          mark_reactions(
            /** @type {Derived} */
            reaction,
            MAYBE_DIRTY
          );
        } else {
          schedule_effect(
            /** @type {Effect} */
            reaction
          );
        }
      }
    }
  }
  function hydration_mismatch(location2) {
    {
      console.warn(`https://svelte.dev/e/hydration_mismatch`);
    }
  }
  let hydrating = false;
  function set_hydrating(value) {
    hydrating = value;
  }
  let hydrate_node;
  function set_hydrate_node(node) {
    if (node === null) {
      hydration_mismatch();
      throw HYDRATION_ERROR;
    }
    return hydrate_node = node;
  }
  function hydrate_next() {
    return set_hydrate_node(
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(hydrate_node)
    );
  }
  function reset(node) {
    if (!hydrating) return;
    if (/* @__PURE__ */ get_next_sibling(hydrate_node) !== null) {
      hydration_mismatch();
      throw HYDRATION_ERROR;
    }
    hydrate_node = node;
  }
  function next(count = 1) {
    if (hydrating) {
      var i = count;
      var node = hydrate_node;
      while (i--) {
        node = /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node);
      }
      hydrate_node = node;
    }
  }
  function remove_nodes() {
    var depth = 0;
    var node = hydrate_node;
    while (true) {
      if (node.nodeType === 8) {
        var data = (
          /** @type {Comment} */
          node.data
        );
        if (data === HYDRATION_END) {
          if (depth === 0) return node;
          depth -= 1;
        } else if (data === HYDRATION_START || data === HYDRATION_START_ELSE) {
          depth += 1;
        }
      }
      var next2 = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node)
      );
      node.remove();
      node = next2;
    }
  }
  function proxy(value, parent = null, prev) {
    if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
      return value;
    }
    const prototype = get_prototype_of(value);
    if (prototype !== object_prototype && prototype !== array_prototype) {
      return value;
    }
    var sources = /* @__PURE__ */ new Map();
    var is_proxied_array = is_array(value);
    var version = source(0);
    if (is_proxied_array) {
      sources.set("length", source(
        /** @type {any[]} */
        value.length
      ));
    }
    var metadata;
    return new Proxy(
      /** @type {any} */
      value,
      {
        defineProperty(_, prop2, descriptor) {
          if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
            state_descriptors_fixed();
          }
          var s = sources.get(prop2);
          if (s === undefined) {
            s = source(descriptor.value);
            sources.set(prop2, s);
          } else {
            set(s, proxy(descriptor.value, metadata));
          }
          return true;
        },
        deleteProperty(target, prop2) {
          var s = sources.get(prop2);
          if (s === undefined) {
            if (prop2 in target) {
              sources.set(prop2, source(UNINITIALIZED));
            }
          } else {
            if (is_proxied_array && typeof prop2 === "string") {
              var ls = (
                /** @type {Source<number>} */
                sources.get("length")
              );
              var n = Number(prop2);
              if (Number.isInteger(n) && n < ls.v) {
                set(ls, n);
              }
            }
            set(s, UNINITIALIZED);
            update_version(version);
          }
          return true;
        },
        get(target, prop2, receiver) {
          var _a;
          if (prop2 === STATE_SYMBOL) {
            return value;
          }
          var s = sources.get(prop2);
          var exists = prop2 in target;
          if (s === undefined && (!exists || ((_a = get_descriptor(target, prop2)) == null ? undefined : _a.writable))) {
            s = source(proxy(exists ? target[prop2] : UNINITIALIZED, metadata));
            sources.set(prop2, s);
          }
          if (s !== undefined) {
            var v = get$1(s);
            return v === UNINITIALIZED ? undefined : v;
          }
          return Reflect.get(target, prop2, receiver);
        },
        getOwnPropertyDescriptor(target, prop2) {
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor && "value" in descriptor) {
            var s = sources.get(prop2);
            if (s) descriptor.value = get$1(s);
          } else if (descriptor === undefined) {
            var source2 = sources.get(prop2);
            var value2 = source2 == null ? undefined : source2.v;
            if (source2 !== undefined && value2 !== UNINITIALIZED) {
              return {
                enumerable: true,
                configurable: true,
                value: value2,
                writable: true
              };
            }
          }
          return descriptor;
        },
        has(target, prop2) {
          var _a;
          if (prop2 === STATE_SYMBOL) {
            return true;
          }
          var s = sources.get(prop2);
          var has = s !== undefined && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
          if (s !== undefined || active_effect !== null && (!has || ((_a = get_descriptor(target, prop2)) == null ? undefined : _a.writable))) {
            if (s === undefined) {
              s = source(has ? proxy(target[prop2], metadata) : UNINITIALIZED);
              sources.set(prop2, s);
            }
            var value2 = get$1(s);
            if (value2 === UNINITIALIZED) {
              return false;
            }
          }
          return has;
        },
        set(target, prop2, value2, receiver) {
          var _a;
          var s = sources.get(prop2);
          var has = prop2 in target;
          if (is_proxied_array && prop2 === "length") {
            for (var i = value2; i < /** @type {Source<number>} */
            s.v; i += 1) {
              var other_s = sources.get(i + "");
              if (other_s !== undefined) {
                set(other_s, UNINITIALIZED);
              } else if (i in target) {
                other_s = source(UNINITIALIZED);
                sources.set(i + "", other_s);
              }
            }
          }
          if (s === undefined) {
            if (!has || ((_a = get_descriptor(target, prop2)) == null ? undefined : _a.writable)) {
              s = source(undefined);
              set(s, proxy(value2, metadata));
              sources.set(prop2, s);
            }
          } else {
            has = s.v !== UNINITIALIZED;
            set(s, proxy(value2, metadata));
          }
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor == null ? undefined : descriptor.set) {
            descriptor.set.call(receiver, value2);
          }
          if (!has) {
            if (is_proxied_array && typeof prop2 === "string") {
              var ls = (
                /** @type {Source<number>} */
                sources.get("length")
              );
              var n = Number(prop2);
              if (Number.isInteger(n) && n >= ls.v) {
                set(ls, n + 1);
              }
            }
            update_version(version);
          }
          return true;
        },
        ownKeys(target) {
          get$1(version);
          var own_keys = Reflect.ownKeys(target).filter((key2) => {
            var source3 = sources.get(key2);
            return source3 === undefined || source3.v !== UNINITIALIZED;
          });
          for (var [key, source2] of sources) {
            if (source2.v !== UNINITIALIZED && !(key in target)) {
              own_keys.push(key);
            }
          }
          return own_keys;
        },
        setPrototypeOf() {
          state_prototype_fixed();
        }
      }
    );
  }
  function update_version(signal, d = 1) {
    set(signal, signal.v + d);
  }
  function get_proxied_value(value) {
    if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
      return value[STATE_SYMBOL];
    }
    return value;
  }
  function is(a, b) {
    return Object.is(get_proxied_value(a), get_proxied_value(b));
  }
  var $window;
  var first_child_getter;
  var next_sibling_getter;
  function init_operations() {
    if ($window !== undefined) {
      return;
    }
    $window = window;
    var element_prototype = Element.prototype;
    var node_prototype = Node.prototype;
    first_child_getter = get_descriptor(node_prototype, "firstChild").get;
    next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
    element_prototype.__click = undefined;
    element_prototype.__className = "";
    element_prototype.__attributes = null;
    element_prototype.__styles = null;
    element_prototype.__e = undefined;
    Text.prototype.__t = undefined;
  }
  function create_text(value = "") {
    return document.createTextNode(value);
  }
  // @__NO_SIDE_EFFECTS__
  function get_first_child(node) {
    return first_child_getter.call(node);
  }
  // @__NO_SIDE_EFFECTS__
  function get_next_sibling(node) {
    return next_sibling_getter.call(node);
  }
  function child(node, is_text) {
    if (!hydrating) {
      return /* @__PURE__ */ get_first_child(node);
    }
    var child2 = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_first_child(hydrate_node)
    );
    if (child2 === null) {
      child2 = hydrate_node.appendChild(create_text());
    } else if (is_text && child2.nodeType !== 3) {
      var text2 = create_text();
      child2 == null ? undefined : child2.before(text2);
      set_hydrate_node(text2);
      return text2;
    }
    set_hydrate_node(child2);
    return child2;
  }
  function first_child(fragment, is_text) {
    if (!hydrating) {
      var first = (
        /** @type {DocumentFragment} */
        /* @__PURE__ */ get_first_child(
          /** @type {Node} */
          fragment
        )
      );
      if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
      return first;
    }
    return hydrate_node;
  }
  function sibling(node, count = 1, is_text = false) {
    let next_sibling = hydrating ? hydrate_node : node;
    var last_sibling;
    while (count--) {
      last_sibling = next_sibling;
      next_sibling = /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(next_sibling);
    }
    if (!hydrating) {
      return next_sibling;
    }
    var type = next_sibling == null ? undefined : next_sibling.nodeType;
    if (is_text && type !== 3) {
      var text2 = create_text();
      if (next_sibling === null) {
        last_sibling == null ? undefined : last_sibling.after(text2);
      } else {
        next_sibling.before(text2);
      }
      set_hydrate_node(text2);
      return text2;
    }
    set_hydrate_node(next_sibling);
    return (
      /** @type {TemplateNode} */
      next_sibling
    );
  }
  function clear_text_content(node) {
    node.textContent = "";
  }
  // @__NO_SIDE_EFFECTS__
  function derived$1(fn) {
    var flags = DERIVED | DIRTY;
    if (active_effect === null) {
      flags |= UNOWNED;
    } else {
      active_effect.f |= EFFECT_HAS_DERIVED;
    }
    var parent_derived = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
      /** @type {Derived} */
      active_reaction
    ) : null;
    const signal = {
      children: null,
      ctx: component_context,
      deps: null,
      equals,
      f: flags,
      fn,
      reactions: null,
      rv: 0,
      v: (
        /** @type {V} */
        null
      ),
      wv: 0,
      parent: parent_derived ?? active_effect
    };
    if (parent_derived !== null) {
      (parent_derived.children ?? (parent_derived.children = [])).push(signal);
    }
    return signal;
  }
  // @__NO_SIDE_EFFECTS__
  function derived_safe_equal(fn) {
    const signal = /* @__PURE__ */ derived$1(fn);
    signal.equals = safe_equals;
    return signal;
  }
  function destroy_derived_children(derived2) {
    var children = derived2.children;
    if (children !== null) {
      derived2.children = null;
      for (var i = 0; i < children.length; i += 1) {
        var child2 = children[i];
        if ((child2.f & DERIVED) !== 0) {
          destroy_derived(
            /** @type {Derived} */
            child2
          );
        } else {
          destroy_effect(
            /** @type {Effect} */
            child2
          );
        }
      }
    }
  }
  function get_derived_parent_effect(derived2) {
    var parent = derived2.parent;
    while (parent !== null) {
      if ((parent.f & DERIVED) === 0) {
        return (
          /** @type {Effect} */
          parent
        );
      }
      parent = parent.parent;
    }
    return null;
  }
  function execute_derived(derived2) {
    var value;
    var prev_active_effect = active_effect;
    set_active_effect(get_derived_parent_effect(derived2));
    {
      try {
        destroy_derived_children(derived2);
        value = update_reaction(derived2);
      } finally {
        set_active_effect(prev_active_effect);
      }
    }
    return value;
  }
  function update_derived(derived2) {
    var value = execute_derived(derived2);
    var status = (skip_reaction || (derived2.f & UNOWNED) !== 0) && derived2.deps !== null ? MAYBE_DIRTY : CLEAN;
    set_signal_status(derived2, status);
    if (!derived2.equals(value)) {
      derived2.v = value;
      derived2.wv = increment_write_version();
    }
  }
  function destroy_derived(derived2) {
    destroy_derived_children(derived2);
    remove_reactions(derived2, 0);
    set_signal_status(derived2, DESTROYED);
    derived2.v = derived2.children = derived2.deps = derived2.ctx = derived2.reactions = null;
  }
  function validate_effect(rune) {
    if (active_effect === null && active_reaction === null) {
      effect_orphan();
    }
    if (active_reaction !== null && (active_reaction.f & UNOWNED) !== 0) {
      effect_in_unowned_derived();
    }
    if (is_destroying_effect) {
      effect_in_teardown();
    }
  }
  function push_effect(effect2, parent_effect) {
    var parent_last = parent_effect.last;
    if (parent_last === null) {
      parent_effect.last = parent_effect.first = effect2;
    } else {
      parent_last.next = effect2;
      effect2.prev = parent_last;
      parent_effect.last = effect2;
    }
  }
  function create_effect(type, fn, sync, push2 = true) {
    var is_root = (type & ROOT_EFFECT) !== 0;
    var parent_effect = active_effect;
    var effect2 = {
      ctx: component_context,
      deps: null,
      deriveds: null,
      nodes_start: null,
      nodes_end: null,
      f: type | DIRTY,
      first: null,
      fn,
      last: null,
      next: null,
      parent: is_root ? null : parent_effect,
      prev: null,
      teardown: null,
      transitions: null,
      wv: 0
    };
    if (sync) {
      var previously_flushing_effect = is_flushing_effect;
      try {
        set_is_flushing_effect(true);
        update_effect(effect2);
        effect2.f |= EFFECT_RAN;
      } catch (e) {
        destroy_effect(effect2);
        throw e;
      } finally {
        set_is_flushing_effect(previously_flushing_effect);
      }
    } else if (fn !== null) {
      schedule_effect(effect2);
    }
    var inert = sync && effect2.deps === null && effect2.first === null && effect2.nodes_start === null && effect2.teardown === null && (effect2.f & (EFFECT_HAS_DERIVED | BOUNDARY_EFFECT)) === 0;
    if (!inert && !is_root && push2) {
      if (parent_effect !== null) {
        push_effect(effect2, parent_effect);
      }
      if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
        var derived2 = (
          /** @type {Derived} */
          active_reaction
        );
        (derived2.children ?? (derived2.children = [])).push(effect2);
      }
    }
    return effect2;
  }
  function teardown(fn) {
    const effect2 = create_effect(RENDER_EFFECT, null, false);
    set_signal_status(effect2, CLEAN);
    effect2.teardown = fn;
    return effect2;
  }
  function user_effect(fn) {
    validate_effect();
    var defer = active_effect !== null && (active_effect.f & BRANCH_EFFECT) !== 0 && component_context !== null && !component_context.m;
    if (defer) {
      var context = (
        /** @type {ComponentContext} */
        component_context
      );
      (context.e ?? (context.e = [])).push({
        fn,
        effect: active_effect,
        reaction: active_reaction
      });
    } else {
      var signal = effect(fn);
      return signal;
    }
  }
  function user_pre_effect(fn) {
    validate_effect();
    return render_effect(fn);
  }
  function effect_root(fn) {
    const effect2 = create_effect(ROOT_EFFECT, fn, true);
    return () => {
      destroy_effect(effect2);
    };
  }
  function component_root(fn) {
    const effect2 = create_effect(ROOT_EFFECT, fn, true);
    return (options = {}) => {
      return new Promise((fulfil) => {
        if (options.outro) {
          pause_effect(effect2, () => {
            destroy_effect(effect2);
            fulfil(undefined);
          });
        } else {
          destroy_effect(effect2);
          fulfil(undefined);
        }
      });
    };
  }
  function effect(fn) {
    return create_effect(EFFECT, fn, false);
  }
  function legacy_pre_effect(deps, fn) {
    var context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    var token = { effect: null, ran: false };
    context.l.r1.push(token);
    token.effect = render_effect(() => {
      deps();
      if (token.ran) return;
      token.ran = true;
      set(context.l.r2, true);
      untrack(fn);
    });
  }
  function legacy_pre_effect_reset() {
    var context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    render_effect(() => {
      if (!get$1(context.l.r2)) return;
      for (var token of context.l.r1) {
        var effect2 = token.effect;
        if ((effect2.f & CLEAN) !== 0) {
          set_signal_status(effect2, MAYBE_DIRTY);
        }
        if (check_dirtiness(effect2)) {
          update_effect(effect2);
        }
        token.ran = false;
      }
      context.l.r2.v = false;
    });
  }
  function render_effect(fn) {
    return create_effect(RENDER_EFFECT, fn, true);
  }
  function template_effect(fn) {
    return block(fn);
  }
  function block(fn, flags = 0) {
    return create_effect(RENDER_EFFECT | BLOCK_EFFECT | flags, fn, true);
  }
  function branch(fn, push2 = true) {
    return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true, push2);
  }
  function execute_effect_teardown(effect2) {
    var teardown2 = effect2.teardown;
    if (teardown2 !== null) {
      const previously_destroying_effect = is_destroying_effect;
      const previous_reaction = active_reaction;
      set_is_destroying_effect(true);
      set_active_reaction(null);
      try {
        teardown2.call(null);
      } finally {
        set_is_destroying_effect(previously_destroying_effect);
        set_active_reaction(previous_reaction);
      }
    }
  }
  function destroy_effect_deriveds(signal) {
    var deriveds = signal.deriveds;
    if (deriveds !== null) {
      signal.deriveds = null;
      for (var i = 0; i < deriveds.length; i += 1) {
        destroy_derived(deriveds[i]);
      }
    }
  }
  function destroy_effect_children(signal, remove_dom = false) {
    var effect2 = signal.first;
    signal.first = signal.last = null;
    while (effect2 !== null) {
      var next2 = effect2.next;
      destroy_effect(effect2, remove_dom);
      effect2 = next2;
    }
  }
  function destroy_block_effect_children(signal) {
    var effect2 = signal.first;
    while (effect2 !== null) {
      var next2 = effect2.next;
      if ((effect2.f & BRANCH_EFFECT) === 0) {
        destroy_effect(effect2);
      }
      effect2 = next2;
    }
  }
  function destroy_effect(effect2, remove_dom = true) {
    var removed = false;
    if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes_start !== null) {
      var node = effect2.nodes_start;
      var end = effect2.nodes_end;
      while (node !== null) {
        var next2 = node === end ? null : (
          /** @type {TemplateNode} */
          /* @__PURE__ */ get_next_sibling(node)
        );
        node.remove();
        node = next2;
      }
      removed = true;
    }
    destroy_effect_children(effect2, remove_dom && !removed);
    destroy_effect_deriveds(effect2);
    remove_reactions(effect2, 0);
    set_signal_status(effect2, DESTROYED);
    var transitions = effect2.transitions;
    if (transitions !== null) {
      for (const transition2 of transitions) {
        transition2.stop();
      }
    }
    execute_effect_teardown(effect2);
    var parent = effect2.parent;
    if (parent !== null && parent.first !== null) {
      unlink_effect(effect2);
    }
    effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes_start = effect2.nodes_end = null;
  }
  function unlink_effect(effect2) {
    var parent = effect2.parent;
    var prev = effect2.prev;
    var next2 = effect2.next;
    if (prev !== null) prev.next = next2;
    if (next2 !== null) next2.prev = prev;
    if (parent !== null) {
      if (parent.first === effect2) parent.first = next2;
      if (parent.last === effect2) parent.last = prev;
    }
  }
  function pause_effect(effect2, callback) {
    var transitions = [];
    pause_children(effect2, transitions, true);
    run_out_transitions(transitions, () => {
      destroy_effect(effect2);
      if (callback) callback();
    });
  }
  function run_out_transitions(transitions, fn) {
    var remaining = transitions.length;
    if (remaining > 0) {
      var check2 = () => --remaining || fn();
      for (var transition2 of transitions) {
        transition2.out(check2);
      }
    } else {
      fn();
    }
  }
  function pause_children(effect2, transitions, local) {
    if ((effect2.f & INERT) !== 0) return;
    effect2.f ^= INERT;
    if (effect2.transitions !== null) {
      for (const transition2 of effect2.transitions) {
        if (transition2.is_global || local) {
          transitions.push(transition2);
        }
      }
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
      pause_children(child2, transitions, transparent ? local : false);
      child2 = sibling2;
    }
  }
  function resume_effect(effect2) {
    resume_children(effect2, true);
  }
  function resume_children(effect2, local) {
    if ((effect2.f & INERT) === 0) return;
    effect2.f ^= INERT;
    if ((effect2.f & CLEAN) === 0) {
      effect2.f ^= CLEAN;
    }
    if (check_dirtiness(effect2)) {
      set_signal_status(effect2, DIRTY);
      schedule_effect(effect2);
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
      resume_children(child2, transparent ? local : false);
      child2 = sibling2;
    }
    if (effect2.transitions !== null) {
      for (const transition2 of effect2.transitions) {
        if (transition2.is_global || local) {
          transition2.in();
        }
      }
    }
  }
  const request_idle_callback = typeof requestIdleCallback === "undefined" ? (cb) => setTimeout(cb, 1) : requestIdleCallback;
  let is_micro_task_queued$1 = false;
  let is_idle_task_queued = false;
  let current_queued_micro_tasks = [];
  let current_queued_idle_tasks = [];
  function process_micro_tasks() {
    is_micro_task_queued$1 = false;
    const tasks = current_queued_micro_tasks.slice();
    current_queued_micro_tasks = [];
    run_all(tasks);
  }
  function process_idle_tasks() {
    is_idle_task_queued = false;
    const tasks = current_queued_idle_tasks.slice();
    current_queued_idle_tasks = [];
    run_all(tasks);
  }
  function queue_micro_task(fn) {
    if (!is_micro_task_queued$1) {
      is_micro_task_queued$1 = true;
      queueMicrotask(process_micro_tasks);
    }
    current_queued_micro_tasks.push(fn);
  }
  function queue_idle_task(fn) {
    if (!is_idle_task_queued) {
      is_idle_task_queued = true;
      request_idle_callback(process_idle_tasks);
    }
    current_queued_idle_tasks.push(fn);
  }
  function flush_tasks() {
    if (is_micro_task_queued$1) {
      process_micro_tasks();
    }
    if (is_idle_task_queued) {
      process_idle_tasks();
    }
  }
  function lifecycle_outside_component(name) {
    {
      throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
    }
  }
  const FLUSH_MICROTASK = 0;
  const FLUSH_SYNC = 1;
  let is_throwing_error = false;
  let scheduler_mode = FLUSH_MICROTASK;
  let is_micro_task_queued = false;
  let last_scheduled_effect = null;
  let is_flushing_effect = false;
  let is_destroying_effect = false;
  function set_is_flushing_effect(value) {
    is_flushing_effect = value;
  }
  function set_is_destroying_effect(value) {
    is_destroying_effect = value;
  }
  let queued_root_effects = [];
  let flush_count = 0;
  let active_reaction = null;
  function set_active_reaction(reaction) {
    active_reaction = reaction;
  }
  let active_effect = null;
  function set_active_effect(effect2) {
    active_effect = effect2;
  }
  let derived_sources = null;
  function set_derived_sources(sources) {
    derived_sources = sources;
  }
  let new_deps = null;
  let skipped_deps = 0;
  let untracked_writes = null;
  function set_untracked_writes(value) {
    untracked_writes = value;
  }
  let write_version = 1;
  let read_version = 0;
  let skip_reaction = false;
  let captured_signals = null;
  let component_context = null;
  function set_component_context(context) {
    component_context = context;
  }
  function increment_write_version() {
    return ++write_version;
  }
  function is_runes() {
    return !legacy_mode_flag || component_context !== null && component_context.l === null;
  }
  function check_dirtiness(reaction) {
    var _a;
    var flags = reaction.f;
    if ((flags & DIRTY) !== 0) {
      return true;
    }
    if ((flags & MAYBE_DIRTY) !== 0) {
      var dependencies = reaction.deps;
      var is_unowned = (flags & UNOWNED) !== 0;
      if (dependencies !== null) {
        var i;
        var dependency;
        var is_disconnected = (flags & DISCONNECTED) !== 0;
        var is_unowned_connected = is_unowned && active_effect !== null && !skip_reaction;
        var length = dependencies.length;
        if (is_disconnected || is_unowned_connected) {
          for (i = 0; i < length; i++) {
            dependency = dependencies[i];
            if (is_disconnected || !((_a = dependency == null ? undefined : dependency.reactions) == null ? undefined : _a.includes(reaction))) {
              (dependency.reactions ?? (dependency.reactions = [])).push(reaction);
            }
          }
          if (is_disconnected) {
            reaction.f ^= DISCONNECTED;
          }
        }
        for (i = 0; i < length; i++) {
          dependency = dependencies[i];
          if (check_dirtiness(
            /** @type {Derived} */
            dependency
          )) {
            update_derived(
              /** @type {Derived} */
              dependency
            );
          }
          if (dependency.wv > reaction.wv) {
            return true;
          }
        }
      }
      if (!is_unowned || active_effect !== null && !skip_reaction) {
        set_signal_status(reaction, CLEAN);
      }
    }
    return false;
  }
  function propagate_error(error, effect2) {
    var current = effect2;
    while (current !== null) {
      if ((current.f & BOUNDARY_EFFECT) !== 0) {
        try {
          current.fn(error);
          return;
        } catch {
          current.f ^= BOUNDARY_EFFECT;
        }
      }
      current = current.parent;
    }
    is_throwing_error = false;
    throw error;
  }
  function should_rethrow_error(effect2) {
    return (effect2.f & DESTROYED) === 0 && (effect2.parent === null || (effect2.parent.f & BOUNDARY_EFFECT) === 0);
  }
  function handle_error(error, effect2, previous_effect, component_context2) {
    if (is_throwing_error) {
      if (previous_effect === null) {
        is_throwing_error = false;
      }
      if (should_rethrow_error(effect2)) {
        throw error;
      }
      return;
    }
    if (previous_effect !== null) {
      is_throwing_error = true;
    }
    {
      propagate_error(error, effect2);
      return;
    }
  }
  function schedule_possible_effect_self_invalidation(signal, effect2, depth = 0) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    for (var i = 0; i < reactions.length; i++) {
      var reaction = reactions[i];
      if ((reaction.f & DERIVED) !== 0) {
        schedule_possible_effect_self_invalidation(
          /** @type {Derived} */
          reaction,
          effect2,
          depth + 1
        );
      } else if (effect2 === reaction) {
        if (depth === 0) {
          set_signal_status(reaction, DIRTY);
        } else if ((reaction.f & CLEAN) !== 0) {
          set_signal_status(reaction, MAYBE_DIRTY);
        }
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
  function update_reaction(reaction) {
    var _a;
    var previous_deps = new_deps;
    var previous_skipped_deps = skipped_deps;
    var previous_untracked_writes = untracked_writes;
    var previous_reaction = active_reaction;
    var previous_skip_reaction = skip_reaction;
    var prev_derived_sources = derived_sources;
    var previous_component_context = component_context;
    var flags = reaction.f;
    new_deps = /** @type {null | Value[]} */
    null;
    skipped_deps = 0;
    untracked_writes = null;
    active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
    skip_reaction = !is_flushing_effect && (flags & UNOWNED) !== 0;
    derived_sources = null;
    component_context = reaction.ctx;
    read_version++;
    try {
      var result = (
        /** @type {Function} */
        (0, reaction.fn)()
      );
      var deps = reaction.deps;
      if (new_deps !== null) {
        var i;
        remove_reactions(reaction, skipped_deps);
        if (deps !== null && skipped_deps > 0) {
          deps.length = skipped_deps + new_deps.length;
          for (i = 0; i < new_deps.length; i++) {
            deps[skipped_deps + i] = new_deps[i];
          }
        } else {
          reaction.deps = deps = new_deps;
        }
        if (!skip_reaction) {
          for (i = skipped_deps; i < deps.length; i++) {
            ((_a = deps[i]).reactions ?? (_a.reactions = [])).push(reaction);
          }
        }
      } else if (deps !== null && skipped_deps < deps.length) {
        remove_reactions(reaction, skipped_deps);
        deps.length = skipped_deps;
      }
      if (is_runes() && untracked_writes !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
        for (i = 0; i < /** @type {Source[]} */
        untracked_writes.length; i++) {
          schedule_possible_effect_self_invalidation(
            untracked_writes[i],
            /** @type {Effect} */
            reaction
          );
        }
      }
      if (previous_reaction !== null) {
        read_version++;
      }
      return result;
    } finally {
      new_deps = previous_deps;
      skipped_deps = previous_skipped_deps;
      untracked_writes = previous_untracked_writes;
      active_reaction = previous_reaction;
      skip_reaction = previous_skip_reaction;
      derived_sources = prev_derived_sources;
      component_context = previous_component_context;
    }
  }
  function remove_reaction(signal, dependency) {
    let reactions = dependency.reactions;
    if (reactions !== null) {
      var index2 = index_of.call(reactions, signal);
      if (index2 !== -1) {
        var new_length = reactions.length - 1;
        if (new_length === 0) {
          reactions = dependency.reactions = null;
        } else {
          reactions[index2] = reactions[new_length];
          reactions.pop();
        }
      }
    }
    if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
    // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
    // allows us to skip the expensive work of disconnecting and immediately reconnecting it
    (new_deps === null || !new_deps.includes(dependency))) {
      set_signal_status(dependency, MAYBE_DIRTY);
      if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
        dependency.f ^= DISCONNECTED;
      }
      remove_reactions(
        /** @type {Derived} **/
        dependency,
        0
      );
    }
  }
  function remove_reactions(signal, start_index) {
    var dependencies = signal.deps;
    if (dependencies === null) return;
    for (var i = start_index; i < dependencies.length; i++) {
      remove_reaction(signal, dependencies[i]);
    }
  }
  function update_effect(effect2) {
    var flags = effect2.f;
    if ((flags & DESTROYED) !== 0) {
      return;
    }
    set_signal_status(effect2, CLEAN);
    var previous_effect = active_effect;
    var previous_component_context = component_context;
    active_effect = effect2;
    try {
      if ((flags & BLOCK_EFFECT) !== 0) {
        destroy_block_effect_children(effect2);
      } else {
        destroy_effect_children(effect2);
      }
      destroy_effect_deriveds(effect2);
      execute_effect_teardown(effect2);
      var teardown2 = update_reaction(effect2);
      effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
      effect2.wv = write_version;
      var deps = effect2.deps;
      var dep;
      if (DEV && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && deps !== null) ;
      if (DEV) ;
    } catch (error) {
      handle_error(error, effect2, previous_effect, previous_component_context || effect2.ctx);
    } finally {
      active_effect = previous_effect;
    }
  }
  function infinite_loop_guard() {
    if (flush_count > 1e3) {
      flush_count = 0;
      try {
        effect_update_depth_exceeded();
      } catch (error) {
        if (last_scheduled_effect !== null) {
          {
            handle_error(error, last_scheduled_effect, null);
          }
        } else {
          throw error;
        }
      }
    }
    flush_count++;
  }
  function flush_queued_root_effects(root_effects) {
    var length = root_effects.length;
    if (length === 0) {
      return;
    }
    infinite_loop_guard();
    var previously_flushing_effect = is_flushing_effect;
    is_flushing_effect = true;
    try {
      for (var i = 0; i < length; i++) {
        var effect2 = root_effects[i];
        if ((effect2.f & CLEAN) === 0) {
          effect2.f ^= CLEAN;
        }
        var collected_effects = [];
        process_effects(effect2, collected_effects);
        flush_queued_effects(collected_effects);
      }
    } finally {
      is_flushing_effect = previously_flushing_effect;
    }
  }
  function flush_queued_effects(effects) {
    var length = effects.length;
    if (length === 0) return;
    for (var i = 0; i < length; i++) {
      var effect2 = effects[i];
      if ((effect2.f & (DESTROYED | INERT)) === 0) {
        try {
          if (check_dirtiness(effect2)) {
            update_effect(effect2);
            if (effect2.deps === null && effect2.first === null && effect2.nodes_start === null) {
              if (effect2.teardown === null) {
                unlink_effect(effect2);
              } else {
                effect2.fn = null;
              }
            }
          }
        } catch (error) {
          handle_error(error, effect2, null, effect2.ctx);
        }
      }
    }
  }
  function process_deferred() {
    is_micro_task_queued = false;
    if (flush_count > 1001) {
      return;
    }
    const previous_queued_root_effects = queued_root_effects;
    queued_root_effects = [];
    flush_queued_root_effects(previous_queued_root_effects);
    if (!is_micro_task_queued) {
      flush_count = 0;
      last_scheduled_effect = null;
    }
  }
  function schedule_effect(signal) {
    if (scheduler_mode === FLUSH_MICROTASK) {
      if (!is_micro_task_queued) {
        is_micro_task_queued = true;
        queueMicrotask(process_deferred);
      }
    }
    last_scheduled_effect = signal;
    var effect2 = signal;
    while (effect2.parent !== null) {
      effect2 = effect2.parent;
      var flags = effect2.f;
      if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
        if ((flags & CLEAN) === 0) return;
        effect2.f ^= CLEAN;
      }
    }
    queued_root_effects.push(effect2);
  }
  function process_effects(effect2, collected_effects) {
    var current_effect = effect2.first;
    var effects = [];
    main_loop: while (current_effect !== null) {
      var flags = current_effect.f;
      var is_branch = (flags & BRANCH_EFFECT) !== 0;
      var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;
      var sibling2 = current_effect.next;
      if (!is_skippable_branch && (flags & INERT) === 0) {
        if ((flags & RENDER_EFFECT) !== 0) {
          if (is_branch) {
            current_effect.f ^= CLEAN;
          } else {
            try {
              if (check_dirtiness(current_effect)) {
                update_effect(current_effect);
              }
            } catch (error) {
              handle_error(error, current_effect, null, current_effect.ctx);
            }
          }
          var child2 = current_effect.first;
          if (child2 !== null) {
            current_effect = child2;
            continue;
          }
        } else if ((flags & EFFECT) !== 0) {
          effects.push(current_effect);
        }
      }
      if (sibling2 === null) {
        let parent = current_effect.parent;
        while (parent !== null) {
          if (effect2 === parent) {
            break main_loop;
          }
          var parent_sibling = parent.next;
          if (parent_sibling !== null) {
            current_effect = parent_sibling;
            continue main_loop;
          }
          parent = parent.parent;
        }
      }
      current_effect = sibling2;
    }
    for (var i = 0; i < effects.length; i++) {
      child2 = effects[i];
      collected_effects.push(child2);
      process_effects(child2, collected_effects);
    }
  }
  function flush_sync(fn) {
    var previous_scheduler_mode = scheduler_mode;
    var previous_queued_root_effects = queued_root_effects;
    try {
      infinite_loop_guard();
      const root_effects = [];
      scheduler_mode = FLUSH_SYNC;
      queued_root_effects = root_effects;
      is_micro_task_queued = false;
      flush_queued_root_effects(previous_queued_root_effects);
      var result = fn == null ? void 0 : fn();
      flush_tasks();
      if (queued_root_effects.length > 0 || root_effects.length > 0) {
        flush_sync();
      }
      flush_count = 0;
      last_scheduled_effect = null;
      if (DEV) ;
      return result;
    } finally {
      scheduler_mode = previous_scheduler_mode;
      queued_root_effects = previous_queued_root_effects;
    }
  }
  async function tick() {
    await Promise.resolve();
    flush_sync();
  }
  function get$1(signal) {
    var _a;
    var flags = signal.f;
    var is_derived = (flags & DERIVED) !== 0;
    if (is_derived && (flags & DESTROYED) !== 0) {
      var value = execute_derived(
        /** @type {Derived} */
        signal
      );
      destroy_derived(
        /** @type {Derived} */
        signal
      );
      return value;
    }
    if (captured_signals !== null) {
      captured_signals.add(signal);
    }
    if (active_reaction !== null) {
      if (derived_sources !== null && derived_sources.includes(signal)) {
        state_unsafe_local_read();
      }
      var deps = active_reaction.deps;
      if (signal.rv < read_version) {
        signal.rv = read_version;
        if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
          skipped_deps++;
        } else if (new_deps === null) {
          new_deps = [signal];
        } else {
          new_deps.push(signal);
        }
      }
    } else if (is_derived && /** @type {Derived} */
    signal.deps === null) {
      var derived2 = (
        /** @type {Derived} */
        signal
      );
      var parent = derived2.parent;
      var target = derived2;
      while (parent !== null) {
        if ((parent.f & DERIVED) !== 0) {
          var parent_derived = (
            /** @type {Derived} */
            parent
          );
          target = parent_derived;
          parent = parent_derived.parent;
        } else {
          var parent_effect = (
            /** @type {Effect} */
            parent
          );
          if (!((_a = parent_effect.deriveds) == null ? undefined : _a.includes(target))) {
            (parent_effect.deriveds ?? (parent_effect.deriveds = [])).push(target);
          }
          break;
        }
      }
    }
    if (is_derived) {
      derived2 = /** @type {Derived} */
      signal;
      if (check_dirtiness(derived2)) {
        update_derived(derived2);
      }
    }
    return signal.v;
  }
  function capture_signals(fn) {
    var previous_captured_signals = captured_signals;
    captured_signals = /* @__PURE__ */ new Set();
    var captured = captured_signals;
    var signal;
    try {
      untrack(fn);
      if (previous_captured_signals !== null) {
        for (signal of captured_signals) {
          previous_captured_signals.add(signal);
        }
      }
    } finally {
      captured_signals = previous_captured_signals;
    }
    return captured;
  }
  function invalidate_inner_signals(fn) {
    var captured = capture_signals(() => untrack(fn));
    for (var signal of captured) {
      if ((signal.f & LEGACY_DERIVED_PROP) !== 0) {
        for (
          const dep of
          /** @type {Derived} */
          signal.deps || []
        ) {
          if ((dep.f & DERIVED) === 0) {
            internal_set(dep, dep.v);
          }
        }
      } else {
        internal_set(signal, signal.v);
      }
    }
  }
  function untrack(fn) {
    const previous_reaction = active_reaction;
    try {
      active_reaction = null;
      return fn();
    } finally {
      active_reaction = previous_reaction;
    }
  }
  const STATUS_MASK = -7169;
  function set_signal_status(signal, status) {
    signal.f = signal.f & STATUS_MASK | status;
  }
  function getContext(key) {
    const context_map = get_or_init_context_map();
    const result = (
      /** @type {T} */
      context_map.get(key)
    );
    return result;
  }
  function setContext(key, context) {
    const context_map = get_or_init_context_map();
    context_map.set(key, context);
    return context;
  }
  function get_or_init_context_map(name) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    return component_context.c ?? (component_context.c = new Map(get_parent_context(component_context) || undefined));
  }
  function get_parent_context(component_context2) {
    let parent = component_context2.p;
    while (parent !== null) {
      const context_map = parent.c;
      if (context_map !== null) {
        return context_map;
      }
      parent = parent.p;
    }
    return null;
  }
  function update(signal, d = 1) {
    var value = get$1(signal);
    var result = d === 1 ? value++ : value--;
    set(signal, value);
    return result;
  }
  function push(props, runes = false, fn) {
    component_context = {
      p: component_context,
      c: null,
      e: null,
      m: false,
      s: props,
      x: null,
      l: null
    };
    if (legacy_mode_flag && !runes) {
      component_context.l = {
        s: null,
        u: null,
        r1: [],
        r2: source(false)
      };
    }
  }
  function pop(component2) {
    const context_stack_item = component_context;
    if (context_stack_item !== null) {
      if (component2 !== undefined) {
        context_stack_item.x = component2;
      }
      const component_effects = context_stack_item.e;
      if (component_effects !== null) {
        var previous_effect = active_effect;
        var previous_reaction = active_reaction;
        context_stack_item.e = null;
        try {
          for (var i = 0; i < component_effects.length; i++) {
            var component_effect = component_effects[i];
            set_active_effect(component_effect.effect);
            set_active_reaction(component_effect.reaction);
            effect(component_effect.fn);
          }
        } finally {
          set_active_effect(previous_effect);
          set_active_reaction(previous_reaction);
        }
      }
      component_context = context_stack_item.p;
      context_stack_item.m = true;
    }
    return component2 || /** @type {T} */
    {};
  }
  function deep_read_state(value) {
    if (typeof value !== "object" || !value || value instanceof EventTarget) {
      return;
    }
    if (STATE_SYMBOL in value) {
      deep_read(value);
    } else if (!Array.isArray(value)) {
      for (let key in value) {
        const prop2 = value[key];
        if (typeof prop2 === "object" && prop2 && STATE_SYMBOL in prop2) {
          deep_read(prop2);
        }
      }
    }
  }
  function deep_read(value, visited = /* @__PURE__ */ new Set()) {
    if (typeof value === "object" && value !== null && // We don't want to traverse DOM elements
    !(value instanceof EventTarget) && !visited.has(value)) {
      visited.add(value);
      if (value instanceof Date) {
        value.getTime();
      }
      for (let key in value) {
        try {
          deep_read(value[key], visited);
        } catch (e) {
        }
      }
      const proto = get_prototype_of(value);
      if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
        const descriptors = get_descriptors(proto);
        for (let key in descriptors) {
          const get2 = descriptors[key].get;
          if (get2) {
            try {
              get2.call(value);
            } catch (e) {
            }
          }
        }
      }
    }
  }
  function autofocus(dom, value) {
    if (value) {
      const body = document.body;
      dom.autofocus = true;
      queue_micro_task(() => {
        if (document.activeElement === body) {
          dom.focus();
        }
      });
    }
  }
  let listening_to_form_reset = false;
  function add_form_reset_listener() {
    if (!listening_to_form_reset) {
      listening_to_form_reset = true;
      document.addEventListener(
        "reset",
        (evt) => {
          Promise.resolve().then(() => {
            var _a;
            if (!evt.defaultPrevented) {
              for (
                const e of
                /**@type {HTMLFormElement} */
                evt.target.elements
              ) {
                (_a = e.__on_r) == null ? undefined : _a.call(e);
              }
            }
          });
        },
        // In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
        { capture: true }
      );
    }
  }
  function listen(target, events, handler, call_handler_immediately = true) {
    if (call_handler_immediately) {
      handler();
    }
    for (var name of events) {
      target.addEventListener(name, handler);
    }
    teardown(() => {
      for (var name2 of events) {
        target.removeEventListener(name2, handler);
      }
    });
  }
  function without_reactive_context(fn) {
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      return fn();
    } finally {
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  function listen_to_event_and_reset_event(element, event2, handler, on_reset = handler) {
    element.addEventListener(event2, () => without_reactive_context(handler));
    const prev = element.__on_r;
    if (prev) {
      element.__on_r = () => {
        prev();
        on_reset(true);
      };
    } else {
      element.__on_r = () => on_reset(true);
    }
    add_form_reset_listener();
  }
  const all_registered_events = /* @__PURE__ */ new Set();
  const root_event_handles = /* @__PURE__ */ new Set();
  function create_event(event_name, dom, handler, options) {
    function target_handler(event2) {
      if (!options.capture) {
        handle_event_propagation.call(dom, event2);
      }
      if (!event2.cancelBubble) {
        return without_reactive_context(() => {
          return handler.call(this, event2);
        });
      }
    }
    if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
      queue_micro_task(() => {
        dom.addEventListener(event_name, target_handler, options);
      });
    } else {
      dom.addEventListener(event_name, target_handler, options);
    }
    return target_handler;
  }
  function event(event_name, dom, handler, capture, passive) {
    var options = { capture, passive };
    var target_handler = create_event(event_name, dom, handler, options);
    if (dom === document.body || dom === window || dom === document) {
      teardown(() => {
        dom.removeEventListener(event_name, target_handler, options);
      });
    }
  }
  function delegate(events) {
    for (var i = 0; i < events.length; i++) {
      all_registered_events.add(events[i]);
    }
    for (var fn of root_event_handles) {
      fn(events);
    }
  }
  function handle_event_propagation(event2) {
    var _a;
    var handler_element = this;
    var owner_document = (
      /** @type {Node} */
      handler_element.ownerDocument
    );
    var event_name = event2.type;
    var path = ((_a = event2.composedPath) == null ? undefined : _a.call(event2)) || [];
    var current_target = (
      /** @type {null | Element} */
      path[0] || event2.target
    );
    var path_idx = 0;
    var handled_at = event2.__root;
    if (handled_at) {
      var at_idx = path.indexOf(handled_at);
      if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
      window)) {
        event2.__root = handler_element;
        return;
      }
      var handler_idx = path.indexOf(handler_element);
      if (handler_idx === -1) {
        return;
      }
      if (at_idx <= handler_idx) {
        path_idx = at_idx;
      }
    }
    current_target = /** @type {Element} */
    path[path_idx] || event2.target;
    if (current_target === handler_element) return;
    define_property(event2, "currentTarget", {
      configurable: true,
      get() {
        return current_target || owner_document;
      }
    });
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      var throw_error;
      var other_errors = [];
      while (current_target !== null) {
        var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
        current_target.host || null;
        try {
          var delegated = current_target["__" + event_name];
          if (delegated !== void 0 && !/** @type {any} */
          current_target.disabled) {
            if (is_array(delegated)) {
              var [fn, ...data] = delegated;
              fn.apply(current_target, [event2, ...data]);
            } else {
              delegated.call(current_target, event2);
            }
          }
        } catch (error) {
          if (throw_error) {
            other_errors.push(error);
          } else {
            throw_error = error;
          }
        }
        if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
          break;
        }
        current_target = parent_element;
      }
      if (throw_error) {
        for (let error of other_errors) {
          queueMicrotask(() => {
            throw error;
          });
        }
        throw throw_error;
      }
    } finally {
      event2.__root = handler_element;
      delete event2.currentTarget;
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  function create_fragment_from_html(html2) {
    var elem = document.createElement("template");
    elem.innerHTML = html2;
    return elem.content;
  }
  function assign_nodes(start, end) {
    var effect2 = (
      /** @type {Effect} */
      active_effect
    );
    if (effect2.nodes_start === null) {
      effect2.nodes_start = start;
      effect2.nodes_end = end;
    }
  }
  // @__NO_SIDE_EFFECTS__
  function template(content, flags) {
    var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
    var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
    var node;
    var has_start = !content.startsWith("<!>");
    return () => {
      if (hydrating) {
        assign_nodes(hydrate_node, null);
        return hydrate_node;
      }
      if (node === undefined) {
        node = create_fragment_from_html(has_start ? content : "<!>" + content);
        if (!is_fragment) node = /** @type {Node} */
        /* @__PURE__ */ get_first_child(node);
      }
      var clone = (
        /** @type {TemplateNode} */
        use_import_node ? document.importNode(node, true) : node.cloneNode(true)
      );
      if (is_fragment) {
        var start = (
          /** @type {TemplateNode} */
          /* @__PURE__ */ get_first_child(clone)
        );
        var end = (
          /** @type {TemplateNode} */
          clone.lastChild
        );
        assign_nodes(start, end);
      } else {
        assign_nodes(clone, clone);
      }
      return clone;
    };
  }
  // @__NO_SIDE_EFFECTS__
  function ns_template(content, flags, ns = "svg") {
    var has_start = !content.startsWith("<!>");
    var wrapped = `<${ns}>${has_start ? content : "<!>" + content}</${ns}>`;
    var node;
    return () => {
      if (hydrating) {
        assign_nodes(hydrate_node, null);
        return hydrate_node;
      }
      if (!node) {
        var fragment = (
          /** @type {DocumentFragment} */
          create_fragment_from_html(wrapped)
        );
        var root2 = (
          /** @type {Element} */
          /* @__PURE__ */ get_first_child(fragment)
        );
        {
          node = /** @type {Element} */
          /* @__PURE__ */ get_first_child(root2);
        }
      }
      var clone = (
        /** @type {TemplateNode} */
        node.cloneNode(true)
      );
      {
        assign_nodes(clone, clone);
      }
      return clone;
    };
  }
  function text(value = "") {
    if (!hydrating) {
      var t2 = create_text(value + "");
      assign_nodes(t2, t2);
      return t2;
    }
    var node = hydrate_node;
    if (node.nodeType !== 3) {
      node.before(node = create_text());
      set_hydrate_node(node);
    }
    assign_nodes(node, node);
    return node;
  }
  function comment() {
    if (hydrating) {
      assign_nodes(hydrate_node, null);
      return hydrate_node;
    }
    var frag = document.createDocumentFragment();
    var start = document.createComment("");
    var anchor = create_text();
    frag.append(start, anchor);
    assign_nodes(start, anchor);
    return frag;
  }
  function append(anchor, dom) {
    if (hydrating) {
      active_effect.nodes_end = hydrate_node;
      hydrate_next();
      return;
    }
    if (anchor === null) {
      return;
    }
    anchor.before(
      /** @type {Node} */
      dom
    );
  }
  let should_intro = true;
  function set_text(text2, value) {
    var str = value == null ? "" : typeof value === "object" ? value + "" : value;
    if (str !== (text2.__t ?? (text2.__t = text2.nodeValue))) {
      text2.__t = str;
      text2.nodeValue = str == null ? "" : str + "";
    }
  }
  function mount(component2, options) {
    return _mount(component2, options);
  }
  function hydrate(component2, options) {
    init_operations();
    options.intro = options.intro ?? false;
    const target = options.target;
    const was_hydrating = hydrating;
    const previous_hydrate_node = hydrate_node;
    try {
      var anchor = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(target)
      );
      while (anchor && (anchor.nodeType !== 8 || /** @type {Comment} */
      anchor.data !== HYDRATION_START)) {
        anchor = /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(anchor);
      }
      if (!anchor) {
        throw HYDRATION_ERROR;
      }
      set_hydrating(true);
      set_hydrate_node(
        /** @type {Comment} */
        anchor
      );
      hydrate_next();
      const instance = _mount(component2, { ...options, anchor });
      if (hydrate_node === null || hydrate_node.nodeType !== 8 || /** @type {Comment} */
      hydrate_node.data !== HYDRATION_END) {
        hydration_mismatch();
        throw HYDRATION_ERROR;
      }
      set_hydrating(false);
      return (
        /**  @type {Exports} */
        instance
      );
    } catch (error) {
      if (error === HYDRATION_ERROR) {
        if (options.recover === false) {
          hydration_failed();
        }
        init_operations();
        clear_text_content(target);
        set_hydrating(false);
        return mount(component2, options);
      }
      throw error;
    } finally {
      set_hydrating(was_hydrating);
      set_hydrate_node(previous_hydrate_node);
    }
  }
  const document_listeners = /* @__PURE__ */ new Map();
  function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
    init_operations();
    var registered_events = /* @__PURE__ */ new Set();
    var event_handle = (events2) => {
      for (var i = 0; i < events2.length; i++) {
        var event_name = events2[i];
        if (registered_events.has(event_name)) continue;
        registered_events.add(event_name);
        var passive = is_passive_event(event_name);
        target.addEventListener(event_name, handle_event_propagation, { passive });
        var n = document_listeners.get(event_name);
        if (n === undefined) {
          document.addEventListener(event_name, handle_event_propagation, { passive });
          document_listeners.set(event_name, 1);
        } else {
          document_listeners.set(event_name, n + 1);
        }
      }
    };
    event_handle(array_from(all_registered_events));
    root_event_handles.add(event_handle);
    var component2 = undefined;
    var unmount2 = component_root(() => {
      var anchor_node = anchor ?? target.appendChild(create_text());
      branch(() => {
        if (context) {
          push({});
          var ctx = (
            /** @type {ComponentContext} */
            component_context
          );
          ctx.c = context;
        }
        if (events) {
          props.$$events = events;
        }
        if (hydrating) {
          assign_nodes(
            /** @type {TemplateNode} */
            anchor_node,
            null
          );
        }
        should_intro = intro;
        component2 = Component(anchor_node, props) || {};
        should_intro = true;
        if (hydrating) {
          active_effect.nodes_end = hydrate_node;
        }
        if (context) {
          pop();
        }
      });
      return () => {
        var _a;
        for (var event_name of registered_events) {
          target.removeEventListener(event_name, handle_event_propagation);
          var n = (
            /** @type {number} */
            document_listeners.get(event_name)
          );
          if (--n === 0) {
            document.removeEventListener(event_name, handle_event_propagation);
            document_listeners.delete(event_name);
          } else {
            document_listeners.set(event_name, n);
          }
        }
        root_event_handles.delete(event_handle);
        if (anchor_node !== anchor) {
          (_a = anchor_node.parentNode) == null ? undefined : _a.removeChild(anchor_node);
        }
      };
    });
    mounted_components.set(component2, unmount2);
    return component2;
  }
  let mounted_components = /* @__PURE__ */ new WeakMap();
  function unmount(component2, options) {
    const fn = mounted_components.get(component2);
    if (fn) {
      mounted_components.delete(component2);
      return fn(options);
    }
    return Promise.resolve();
  }
  const PENDING = 0;
  const THEN = 1;
  const CATCH = 2;
  function await_block(node, get_input, pending_fn, then_fn, catch_fn) {
    if (hydrating) {
      hydrate_next();
    }
    var anchor = node;
    var runes = is_runes();
    var active_component_context = component_context;
    var input = UNINITIALIZED;
    var pending_effect;
    var then_effect;
    var catch_effect;
    var input_source = (runes ? source : mutable_source)(
      /** @type {V} */
      undefined
    );
    var error_source = (runes ? source : mutable_source)(undefined);
    var resolved = false;
    function update2(state2, restore) {
      resolved = true;
      if (restore) {
        set_active_effect(effect2);
        set_active_reaction(effect2);
        set_component_context(active_component_context);
      }
      try {
        if (state2 === PENDING && pending_fn) ;
        if (state2 === THEN && then_fn) {
          if (then_effect) resume_effect(then_effect);
          else then_effect = branch(() => then_fn(anchor, input_source));
        }
        if (state2 === CATCH && catch_fn) ;
        if (state2 !== PENDING && pending_effect) {
          pause_effect(pending_effect, () => pending_effect = null);
        }
        if (state2 !== THEN && then_effect) {
          pause_effect(then_effect, () => then_effect = null);
        }
        if (state2 !== CATCH && catch_effect) {
          pause_effect(catch_effect, () => catch_effect = null);
        }
      } finally {
        if (restore) {
          set_component_context(null);
          set_active_reaction(null);
          set_active_effect(null);
          flush_sync();
        }
      }
    }
    var effect2 = block(() => {
      if (input === (input = get_input())) return;
      if (is_promise(input)) {
        var promise = input;
        resolved = false;
        promise.then(
          (value) => {
            if (promise !== input) return;
            internal_set(input_source, value);
            update2(THEN, true);
          },
          (error) => {
            if (promise !== input) return;
            internal_set(error_source, error);
            update2(CATCH, true);
            {
              throw error_source.v;
            }
          }
        );
        if (hydrating) ;
        else {
          queue_micro_task(() => {
            if (!resolved) update2(PENDING, true);
          });
        }
      } else {
        internal_set(input_source, input);
        update2(THEN, false);
      }
      return () => input = UNINITIALIZED;
    });
    if (hydrating) {
      anchor = hydrate_node;
    }
  }
  function if_block(node, fn, elseif = false) {
    if (hydrating) {
      hydrate_next();
    }
    var anchor = node;
    var consequent_effect = null;
    var alternate_effect = null;
    var condition = UNINITIALIZED;
    var flags = elseif ? EFFECT_TRANSPARENT : 0;
    var has_branch = false;
    const set_branch = (fn2, flag = true) => {
      has_branch = true;
      update_branch(flag, fn2);
    };
    const update_branch = (new_condition, fn2) => {
      if (condition === (condition = new_condition)) return;
      let mismatch = false;
      if (hydrating) {
        const is_else = (
          /** @type {Comment} */
          anchor.data === HYDRATION_START_ELSE
        );
        if (!!condition === is_else) {
          anchor = remove_nodes();
          set_hydrate_node(anchor);
          set_hydrating(false);
          mismatch = true;
        }
      }
      if (condition) {
        if (consequent_effect) {
          resume_effect(consequent_effect);
        } else if (fn2) {
          consequent_effect = branch(() => fn2(anchor));
        }
        if (alternate_effect) {
          pause_effect(alternate_effect, () => {
            alternate_effect = null;
          });
        }
      } else {
        if (alternate_effect) {
          resume_effect(alternate_effect);
        } else if (fn2) {
          alternate_effect = branch(() => fn2(anchor));
        }
        if (consequent_effect) {
          pause_effect(consequent_effect, () => {
            consequent_effect = null;
          });
        }
      }
      if (mismatch) {
        set_hydrating(true);
      }
    };
    block(() => {
      has_branch = false;
      fn(set_branch);
      if (!has_branch) {
        update_branch(null, null);
      }
    }, flags);
    if (hydrating) {
      anchor = hydrate_node;
    }
  }
  function key_block(node, get_key, render_fn) {
    if (hydrating) {
      hydrate_next();
    }
    var anchor = node;
    var key = UNINITIALIZED;
    var effect2;
    var changed = is_runes() ? not_equal : safe_not_equal;
    block(() => {
      if (changed(key, key = get_key())) {
        if (effect2) {
          pause_effect(effect2);
        }
        effect2 = branch(() => render_fn(anchor));
      }
    });
    if (hydrating) {
      anchor = hydrate_node;
    }
  }
  let current_each_item = null;
  function index(_, i) {
    return i;
  }
  function pause_effects(state2, items, controlled_anchor, items_map) {
    var transitions = [];
    var length = items.length;
    for (var i = 0; i < length; i++) {
      pause_children(items[i].e, transitions, true);
    }
    var is_controlled = length > 0 && transitions.length === 0 && controlled_anchor !== null;
    if (is_controlled) {
      var parent_node = (
        /** @type {Element} */
        /** @type {Element} */
        controlled_anchor.parentNode
      );
      clear_text_content(parent_node);
      parent_node.append(
        /** @type {Element} */
        controlled_anchor
      );
      items_map.clear();
      link(state2, items[0].prev, items[length - 1].next);
    }
    run_out_transitions(transitions, () => {
      for (var i2 = 0; i2 < length; i2++) {
        var item = items[i2];
        if (!is_controlled) {
          items_map.delete(item.k);
          link(state2, item.prev, item.next);
        }
        destroy_effect(item.e, !is_controlled);
      }
    });
  }
  function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
    var anchor = node;
    var state2 = { flags, items: /* @__PURE__ */ new Map(), first: null };
    var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
    if (is_controlled) {
      var parent_node = (
        /** @type {Element} */
        node
      );
      anchor = hydrating ? set_hydrate_node(
        /** @type {Comment | Text} */
        /* @__PURE__ */ get_first_child(parent_node)
      ) : parent_node.appendChild(create_text());
    }
    if (hydrating) {
      hydrate_next();
    }
    var fallback = null;
    var was_empty = false;
    var each_array = /* @__PURE__ */ derived_safe_equal(() => {
      var collection = get_collection();
      return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
    });
    block(() => {
      var array = get$1(each_array);
      var length = array.length;
      if (was_empty && length === 0) {
        return;
      }
      was_empty = length === 0;
      let mismatch = false;
      if (hydrating) {
        var is_else = (
          /** @type {Comment} */
          anchor.data === HYDRATION_START_ELSE
        );
        if (is_else !== (length === 0)) {
          anchor = remove_nodes();
          set_hydrate_node(anchor);
          set_hydrating(false);
          mismatch = true;
        }
      }
      if (hydrating) {
        var prev = null;
        var item;
        for (var i = 0; i < length; i++) {
          if (hydrate_node.nodeType === 8 && /** @type {Comment} */
          hydrate_node.data === HYDRATION_END) {
            anchor = /** @type {Comment} */
            hydrate_node;
            mismatch = true;
            set_hydrating(false);
            break;
          }
          var value = array[i];
          var key = get_key(value, i);
          item = create_item(
            hydrate_node,
            state2,
            prev,
            null,
            value,
            key,
            i,
            render_fn,
            flags
          );
          state2.items.set(key, item);
          prev = item;
        }
        if (length > 0) {
          set_hydrate_node(remove_nodes());
        }
      }
      if (!hydrating) {
        var effect2 = (
          /** @type {Effect} */
          active_reaction
        );
        reconcile(
          array,
          state2,
          anchor,
          render_fn,
          flags,
          (effect2.f & INERT) !== 0,
          get_key
        );
      }
      if (fallback_fn !== null) {
        if (length === 0) {
          if (fallback) {
            resume_effect(fallback);
          } else {
            fallback = branch(() => fallback_fn(anchor));
          }
        } else if (fallback !== null) {
          pause_effect(fallback, () => {
            fallback = null;
          });
        }
      }
      if (mismatch) {
        set_hydrating(true);
      }
      get$1(each_array);
    });
    if (hydrating) {
      anchor = hydrate_node;
    }
  }
  function reconcile(array, state2, anchor, render_fn, flags, is_inert, get_key, get_collection) {
    var _a, _b, _c, _d;
    var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
    var should_update = (flags & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0;
    var length = array.length;
    var items = state2.items;
    var first = state2.first;
    var current = first;
    var seen;
    var prev = null;
    var to_animate;
    var matched = [];
    var stashed = [];
    var value;
    var key;
    var item;
    var i;
    if (is_animated) {
      for (i = 0; i < length; i += 1) {
        value = array[i];
        key = get_key(value, i);
        item = items.get(key);
        if (item !== undefined) {
          (_a = item.a) == null ? undefined : _a.measure();
          (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).add(item);
        }
      }
    }
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      item = items.get(key);
      if (item === undefined) {
        var child_anchor = current ? (
          /** @type {TemplateNode} */
          current.e.nodes_start
        ) : anchor;
        prev = create_item(
          child_anchor,
          state2,
          prev,
          prev === null ? state2.first : prev.next,
          value,
          key,
          i,
          render_fn,
          flags
        );
        items.set(key, prev);
        matched = [];
        stashed = [];
        current = prev.next;
        continue;
      }
      if (should_update) {
        update_item(item, value, i, flags);
      }
      if ((item.e.f & INERT) !== 0) {
        resume_effect(item.e);
        if (is_animated) {
          (_b = item.a) == null ? undefined : _b.unfix();
          (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).delete(item);
        }
      }
      if (item !== current) {
        if (seen !== undefined && seen.has(item)) {
          if (matched.length < stashed.length) {
            var start = stashed[0];
            var j;
            prev = start.prev;
            var a = matched[0];
            var b = matched[matched.length - 1];
            for (j = 0; j < matched.length; j += 1) {
              move(matched[j], start, anchor);
            }
            for (j = 0; j < stashed.length; j += 1) {
              seen.delete(stashed[j]);
            }
            link(state2, a.prev, b.next);
            link(state2, prev, a);
            link(state2, b, start);
            current = start;
            prev = b;
            i -= 1;
            matched = [];
            stashed = [];
          } else {
            seen.delete(item);
            move(item, current, anchor);
            link(state2, item.prev, item.next);
            link(state2, item, prev === null ? state2.first : prev.next);
            link(state2, prev, item);
            prev = item;
          }
          continue;
        }
        matched = [];
        stashed = [];
        while (current !== null && current.k !== key) {
          if (is_inert || (current.e.f & INERT) === 0) {
            (seen ?? (seen = /* @__PURE__ */ new Set())).add(current);
          }
          stashed.push(current);
          current = current.next;
        }
        if (current === null) {
          continue;
        }
        item = current;
      }
      matched.push(item);
      prev = item;
      current = item.next;
    }
    if (current !== null || seen !== undefined) {
      var to_destroy = seen === undefined ? [] : array_from(seen);
      while (current !== null) {
        if (is_inert || (current.e.f & INERT) === 0) {
          to_destroy.push(current);
        }
        current = current.next;
      }
      var destroy_length = to_destroy.length;
      if (destroy_length > 0) {
        var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
        if (is_animated) {
          for (i = 0; i < destroy_length; i += 1) {
            (_c = to_destroy[i].a) == null ? undefined : _c.measure();
          }
          for (i = 0; i < destroy_length; i += 1) {
            (_d = to_destroy[i].a) == null ? undefined : _d.fix();
          }
        }
        pause_effects(state2, to_destroy, controlled_anchor, items);
      }
    }
    if (is_animated) {
      queue_micro_task(() => {
        var _a2;
        if (to_animate === undefined) return;
        for (item of to_animate) {
          (_a2 = item.a) == null ? undefined : _a2.apply();
        }
      });
    }
    active_effect.first = state2.first && state2.first.e;
    active_effect.last = prev && prev.e;
  }
  function update_item(item, value, index2, type) {
    if ((type & EACH_ITEM_REACTIVE) !== 0) {
      internal_set(item.v, value);
    }
    if ((type & EACH_INDEX_REACTIVE) !== 0) {
      internal_set(
        /** @type {Value<number>} */
        item.i,
        index2
      );
    } else {
      item.i = index2;
    }
  }
  function create_item(anchor, state2, prev, next2, value, key, index2, render_fn, flags, get_collection) {
    var previous_each_item = current_each_item;
    var reactive = (flags & EACH_ITEM_REACTIVE) !== 0;
    var mutable = (flags & EACH_ITEM_IMMUTABLE) === 0;
    var v = reactive ? mutable ? /* @__PURE__ */ mutable_source(value) : source(value) : value;
    var i = (flags & EACH_INDEX_REACTIVE) === 0 ? index2 : source(index2);
    var item = {
      i,
      v,
      k: key,
      a: null,
      // @ts-expect-error
      e: null,
      prev,
      next: next2
    };
    current_each_item = item;
    try {
      item.e = branch(() => render_fn(anchor, v, i), hydrating);
      item.e.prev = prev && prev.e;
      item.e.next = next2 && next2.e;
      if (prev === null) {
        state2.first = item;
      } else {
        prev.next = item;
        prev.e.next = item.e;
      }
      if (next2 !== null) {
        next2.prev = item;
        next2.e.prev = item.e;
      }
      return item;
    } finally {
      current_each_item = previous_each_item;
    }
  }
  function move(item, next2, anchor) {
    var end = item.next ? (
      /** @type {TemplateNode} */
      item.next.e.nodes_start
    ) : anchor;
    var dest = next2 ? (
      /** @type {TemplateNode} */
      next2.e.nodes_start
    ) : anchor;
    var node = (
      /** @type {TemplateNode} */
      item.e.nodes_start
    );
    while (node !== end) {
      var next_node = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node)
      );
      dest.before(node);
      node = next_node;
    }
  }
  function link(state2, prev, next2) {
    if (prev === null) {
      state2.first = next2;
    } else {
      prev.next = next2;
      prev.e.next = next2 && next2.e;
    }
    if (next2 !== null) {
      next2.prev = prev;
      next2.e.prev = prev && prev.e;
    }
  }
  function html(node, get_value, svg, mathml, skip_warning) {
    var anchor = node;
    var value = "";
    var effect2;
    block(() => {
      if (value === (value = get_value() ?? "")) {
        if (hydrating) {
          hydrate_next();
        }
        return;
      }
      if (effect2 !== undefined) {
        destroy_effect(effect2);
        effect2 = undefined;
      }
      if (value === "") return;
      effect2 = branch(() => {
        if (hydrating) {
          hydrate_node.data;
          var next2 = hydrate_next();
          var last = next2;
          while (next2 !== null && (next2.nodeType !== 8 || /** @type {Comment} */
          next2.data !== "")) {
            last = next2;
            next2 = /** @type {TemplateNode} */
            /* @__PURE__ */ get_next_sibling(next2);
          }
          if (next2 === null) {
            hydration_mismatch();
            throw HYDRATION_ERROR;
          }
          assign_nodes(hydrate_node, last);
          anchor = set_hydrate_node(next2);
          return;
        }
        var html2 = value + "";
        var node2 = create_fragment_from_html(html2);
        assign_nodes(
          /** @type {TemplateNode} */
          /* @__PURE__ */ get_first_child(node2),
          /** @type {TemplateNode} */
          node2.lastChild
        );
        {
          anchor.before(node2);
        }
      });
    });
  }
  function slot(anchor, $$props, name, slot_props, fallback_fn) {
    var _a;
    if (hydrating) {
      hydrate_next();
    }
    var slot_fn = (_a = $$props.$$slots) == null ? undefined : _a[name];
    var is_interop = false;
    if (slot_fn === true) {
      slot_fn = $$props[name === "default" ? "children" : name];
      is_interop = true;
    }
    if (slot_fn === undefined) {
      if (fallback_fn !== null) {
        fallback_fn(anchor);
      }
    } else {
      slot_fn(anchor, is_interop ? () => slot_props : slot_props);
    }
  }
  function sanitize_slots(props) {
    const sanitized = {};
    if (props.children) sanitized.default = true;
    for (const key in props.$$slots) {
      sanitized[key] = true;
    }
    return sanitized;
  }
  function snippet(node, get_snippet, ...args) {
    var anchor = node;
    var snippet2 = noop;
    var snippet_effect;
    block(() => {
      if (snippet2 === (snippet2 = get_snippet())) return;
      if (snippet_effect) {
        destroy_effect(snippet_effect);
        snippet_effect = null;
      }
      snippet_effect = branch(() => (
        /** @type {SnippetFn} */
        snippet2(anchor, ...args)
      ));
    }, EFFECT_TRANSPARENT);
    if (hydrating) {
      anchor = hydrate_node;
    }
  }
  function component(node, get_component, render_fn) {
    if (hydrating) {
      hydrate_next();
    }
    var anchor = node;
    var component2;
    var effect2;
    block(() => {
      if (component2 === (component2 = get_component())) return;
      if (effect2) {
        pause_effect(effect2);
        effect2 = null;
      }
      if (component2) {
        effect2 = branch(() => render_fn(anchor, component2));
      }
    }, EFFECT_TRANSPARENT);
    if (hydrating) {
      anchor = hydrate_node;
    }
  }
  function action(dom, action2, get_value) {
    effect(() => {
      var payload = untrack(() => action2(dom, get_value == null ? void 0 : get_value()) || {});
      if (get_value && (payload == null ? undefined : payload.update)) {
        var inited = false;
        var prev = (
          /** @type {any} */
          {}
        );
        render_effect(() => {
          var value = get_value();
          deep_read_state(value);
          if (inited && safe_not_equal(prev, value)) {
            prev = value;
            payload.update(value);
          }
        });
        inited = true;
      }
      if (payload == null ? undefined : payload.destroy) {
        return () => (
          /** @type {Function} */
          payload.destroy()
        );
      }
    });
  }
  function r(e) {
    var t2, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t2 = 0; t2 < o; t2++) e[t2] && (f = r(e[t2])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx$1() {
    for (var e, t2, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t2 = r(e)) && (n && (n += " "), n += t2);
    return n;
  }
  function clsx(value) {
    if (typeof value === "object") {
      return clsx$1(value);
    } else {
      return value ?? "";
    }
  }
  function remove_input_defaults(input) {
    if (!hydrating) return;
    var already_removed = false;
    var remove_defaults = () => {
      if (already_removed) return;
      already_removed = true;
      if (input.hasAttribute("value")) {
        var value = input.value;
        set_attribute(input, "value", null);
        input.value = value;
      }
      if (input.hasAttribute("checked")) {
        var checked = input.checked;
        set_attribute(input, "checked", null);
        input.checked = checked;
      }
    };
    input.__on_r = remove_defaults;
    queue_idle_task(remove_defaults);
    add_form_reset_listener();
  }
  function set_selected(element, selected) {
    if (selected) {
      if (!element.hasAttribute("selected")) {
        element.setAttribute("selected", "");
      }
    } else {
      element.removeAttribute("selected");
    }
  }
  function set_attribute(element, attribute, value, skip_warning) {
    var attributes = element.__attributes ?? (element.__attributes = {});
    if (hydrating) {
      attributes[attribute] = element.getAttribute(attribute);
      if (attribute === "src" || attribute === "srcset" || attribute === "href" && element.nodeName === "LINK") {
        return;
      }
    }
    if (attributes[attribute] === (attributes[attribute] = value)) return;
    if (attribute === "style" && "__styles" in element) {
      element.__styles = {};
    }
    if (attribute === "loading") {
      element[LOADING_ATTR_SYMBOL] = value;
    }
    if (value == null) {
      element.removeAttribute(attribute);
    } else if (typeof value !== "string" && get_setters(element).includes(attribute)) {
      element[attribute] = value;
    } else {
      element.setAttribute(attribute, value);
    }
  }
  function set_attributes(element, prev, next2, css_hash, preserve_attribute_case = false, is_custom_element = false, skip_warning = false) {
    var current = prev || {};
    var is_option_element = element.tagName === "OPTION";
    for (var key in prev) {
      if (!(key in next2)) {
        next2[key] = null;
      }
    }
    if (next2.class) {
      next2.class = clsx(next2.class);
    }
    var setters = get_setters(element);
    var attributes = (
      /** @type {Record<string, unknown>} **/
      element.__attributes ?? (element.__attributes = {})
    );
    for (const key2 in next2) {
      let value = next2[key2];
      if (is_option_element && key2 === "value" && value == null) {
        element.value = element.__value = "";
        current[key2] = value;
        continue;
      }
      var prev_value = current[key2];
      if (value === prev_value) continue;
      current[key2] = value;
      var prefix = key2[0] + key2[1];
      if (prefix === "$$") continue;
      if (prefix === "on") {
        const opts = {};
        const event_handle_key = "$$" + key2;
        let event_name = key2.slice(2);
        var delegated = is_delegated(event_name);
        if (is_capture_event(event_name)) {
          event_name = event_name.slice(0, -7);
          opts.capture = true;
        }
        if (!delegated && prev_value) {
          if (value != null) continue;
          element.removeEventListener(event_name, current[event_handle_key], opts);
          current[event_handle_key] = null;
        }
        if (value != null) {
          if (!delegated) {
            let handle = function(evt) {
              current[key2].call(this, evt);
            };
            current[event_handle_key] = create_event(event_name, element, handle, opts);
          } else {
            element[`__${event_name}`] = value;
            delegate([event_name]);
          }
        } else if (delegated) {
          element[`__${event_name}`] = undefined;
        }
      } else if (key2 === "style" && value != null) {
        element.style.cssText = value + "";
      } else if (key2 === "autofocus") {
        autofocus(
          /** @type {HTMLElement} */
          element,
          Boolean(value)
        );
      } else if (key2 === "__value" || key2 === "value" && value != null) {
        element.value = element[key2] = element.__value = value;
      } else if (key2 === "selected" && is_option_element) {
        set_selected(
          /** @type {HTMLOptionElement} */
          element,
          value
        );
      } else {
        var name = key2;
        if (!preserve_attribute_case) {
          name = normalize_attribute(name);
        }
        var is_default = name === "defaultValue" || name === "defaultChecked";
        if (value == null && !is_custom_element && !is_default) {
          attributes[key2] = null;
          if (name === "value" || name === "checked") {
            let input = (
              /** @type {HTMLInputElement} */
              element
            );
            if (name === "value") {
              let prev2 = input.defaultValue;
              input.removeAttribute(name);
              input.defaultValue = prev2;
            } else {
              let prev2 = input.defaultChecked;
              input.removeAttribute(name);
              input.defaultChecked = prev2;
            }
          } else {
            element.removeAttribute(key2);
          }
        } else if (is_default || setters.includes(name) && (is_custom_element || typeof value !== "string")) {
          element[name] = value;
        } else if (typeof value !== "function") {
          if (hydrating && (name === "src" || name === "href" || name === "srcset")) ;
          else {
            set_attribute(element, name, value);
          }
        }
      }
      if (key2 === "style" && "__styles" in element) {
        element.__styles = {};
      }
    }
    return current;
  }
  var setters_cache = /* @__PURE__ */ new Map();
  function get_setters(element) {
    var setters = setters_cache.get(element.nodeName);
    if (setters) return setters;
    setters_cache.set(element.nodeName, setters = []);
    var descriptors;
    var proto = element;
    var element_proto = Element.prototype;
    while (element_proto !== proto) {
      descriptors = get_descriptors(proto);
      for (var key in descriptors) {
        if (descriptors[key].set) {
          setters.push(key);
        }
      }
      proto = get_prototype_of(proto);
    }
    return setters;
  }
  function set_svg_class(dom, value, hash) {
    var prev_class_name = dom.__className;
    var next_class_name = to_class(value);
    if (hydrating && dom.getAttribute("class") === next_class_name) {
      dom.__className = next_class_name;
    } else if (prev_class_name !== next_class_name || hydrating && dom.getAttribute("class") !== next_class_name) {
      if (next_class_name === "") {
        dom.removeAttribute("class");
      } else {
        dom.setAttribute("class", next_class_name);
      }
      dom.__className = next_class_name;
    }
  }
  function set_class(dom, value, hash) {
    var prev_class_name = dom.__className;
    var next_class_name = to_class(value);
    if (hydrating && dom.className === next_class_name) {
      dom.__className = next_class_name;
    } else if (prev_class_name !== next_class_name || hydrating && dom.className !== next_class_name) {
      if (value == null && true) {
        dom.removeAttribute("class");
      } else {
        dom.className = next_class_name;
      }
      dom.__className = next_class_name;
    }
  }
  function to_class(value, hash) {
    return (value == null ? "" : value) + "";
  }
  function toggle_class(dom, class_name, value) {
    if (value) {
      if (dom.classList.contains(class_name)) return;
      dom.classList.add(class_name);
    } else {
      if (!dom.classList.contains(class_name)) return;
      dom.classList.remove(class_name);
    }
  }
  function set_style(dom, key, value, important) {
    var styles = dom.__styles ?? (dom.__styles = {});
    if (styles[key] === value) {
      return;
    }
    styles[key] = value;
    if (value == null) {
      dom.style.removeProperty(key);
    } else {
      dom.style.setProperty(key, value, "");
    }
  }
  const now = () => performance.now();
  const raf = {
    // don't access requestAnimationFrame eagerly outside method
    // this allows basic testing of user code without JSDOM
    // bunder will eval and remove ternary when the user's app is built
    tick: (
      /** @param {any} _ */
      (_) => requestAnimationFrame(_)
    ),
    now: () => now(),
    tasks: /* @__PURE__ */ new Set()
  };
  function run_tasks() {
    const now2 = raf.now();
    raf.tasks.forEach((task) => {
      if (!task.c(now2)) {
        raf.tasks.delete(task);
        task.f();
      }
    });
    if (raf.tasks.size !== 0) {
      raf.tick(run_tasks);
    }
  }
  function loop(callback) {
    let task;
    if (raf.tasks.size === 0) {
      raf.tick(run_tasks);
    }
    return {
      promise: new Promise((fulfill) => {
        raf.tasks.add(task = { c: callback, f: fulfill });
      }),
      abort() {
        raf.tasks.delete(task);
      }
    };
  }
  function dispatch_event(element, type) {
    element.dispatchEvent(new CustomEvent(type));
  }
  function css_property_to_camelcase(style) {
    if (style === "float") return "cssFloat";
    if (style === "offset") return "cssOffset";
    if (style.startsWith("--")) return style;
    const parts = style.split("-");
    if (parts.length === 1) return parts[0];
    return parts[0] + parts.slice(1).map(
      /** @param {any} word */
      (word) => word[0].toUpperCase() + word.slice(1)
    ).join("");
  }
  function css_to_keyframe(css) {
    const keyframe = {};
    const parts = css.split(";");
    for (const part of parts) {
      const [property, value] = part.split(":");
      if (!property || value === undefined) break;
      const formatted_property = css_property_to_camelcase(property.trim());
      keyframe[formatted_property] = value.trim();
    }
    return keyframe;
  }
  const linear$1 = (t2) => t2;
  function animation(element, get_fn, get_params) {
    var item = (
      /** @type {EachItem} */
      current_each_item
    );
    var from;
    var to;
    var animation2;
    var original_styles = null;
    item.a ?? (item.a = {
      element,
      measure() {
        from = this.element.getBoundingClientRect();
      },
      apply() {
        animation2 == null ? undefined : animation2.abort();
        to = this.element.getBoundingClientRect();
        if (from.left !== to.left || from.right !== to.right || from.top !== to.top || from.bottom !== to.bottom) {
          const options = get_fn()(this.element, { from, to }, get_params == null ? undefined : get_params());
          animation2 = animate(this.element, options, undefined, 1, () => {
            animation2 == null ? undefined : animation2.abort();
            animation2 = undefined;
          });
        }
      },
      fix() {
        if (element.getAnimations().length) return;
        var { position, width, height } = getComputedStyle(element);
        if (position !== "absolute" && position !== "fixed") {
          var style = (
            /** @type {HTMLElement | SVGElement} */
            element.style
          );
          original_styles = {
            position: style.position,
            width: style.width,
            height: style.height,
            transform: style.transform
          };
          style.position = "absolute";
          style.width = width;
          style.height = height;
          var to2 = element.getBoundingClientRect();
          if (from.left !== to2.left || from.top !== to2.top) {
            var transform = `translate(${from.left - to2.left}px, ${from.top - to2.top}px)`;
            style.transform = style.transform ? `${style.transform} ${transform}` : transform;
          }
        }
      },
      unfix() {
        if (original_styles) {
          var style = (
            /** @type {HTMLElement | SVGElement} */
            element.style
          );
          style.position = original_styles.position;
          style.width = original_styles.width;
          style.height = original_styles.height;
          style.transform = original_styles.transform;
        }
      }
    });
    item.a.element = element;
  }
  function transition(flags, element, get_fn, get_params) {
    var is_intro = (flags & TRANSITION_IN) !== 0;
    var is_outro = (flags & TRANSITION_OUT) !== 0;
    var is_both = is_intro && is_outro;
    var is_global = (flags & TRANSITION_GLOBAL) !== 0;
    var direction = is_both ? "both" : is_intro ? "in" : "out";
    var current_options;
    var inert = element.inert;
    var overflow = element.style.overflow;
    var intro;
    var outro;
    function get_options() {
      var previous_reaction = active_reaction;
      var previous_effect = active_effect;
      set_active_reaction(null);
      set_active_effect(null);
      try {
        return current_options ?? (current_options = get_fn()(element, (get_params == null ? void 0 : get_params()) ?? /** @type {P} */
        {}, {
          direction
        }));
      } finally {
        set_active_reaction(previous_reaction);
        set_active_effect(previous_effect);
      }
    }
    var transition2 = {
      is_global,
      in() {
        var _a;
        element.inert = inert;
        if (!is_intro) {
          outro == null ? undefined : outro.abort();
          (_a = outro == null ? undefined : outro.reset) == null ? undefined : _a.call(outro);
          return;
        }
        if (!is_outro) {
          intro == null ? undefined : intro.abort();
        }
        dispatch_event(element, "introstart");
        intro = animate(element, get_options(), outro, 1, () => {
          dispatch_event(element, "introend");
          intro == null ? undefined : intro.abort();
          intro = current_options = undefined;
          element.style.overflow = overflow;
        });
      },
      out(fn) {
        if (!is_outro) {
          fn == null ? undefined : fn();
          current_options = undefined;
          return;
        }
        element.inert = true;
        dispatch_event(element, "outrostart");
        outro = animate(element, get_options(), intro, 0, () => {
          dispatch_event(element, "outroend");
          fn == null ? undefined : fn();
        });
      },
      stop: () => {
        intro == null ? undefined : intro.abort();
        outro == null ? undefined : outro.abort();
      }
    };
    var e = (
      /** @type {Effect} */
      active_effect
    );
    (e.transitions ?? (e.transitions = [])).push(transition2);
    if (is_intro && should_intro) {
      var run2 = is_global;
      if (!run2) {
        var block2 = (
          /** @type {Effect | null} */
          e.parent
        );
        while (block2 && (block2.f & EFFECT_TRANSPARENT) !== 0) {
          while (block2 = block2.parent) {
            if ((block2.f & BLOCK_EFFECT) !== 0) break;
          }
        }
        run2 = !block2 || (block2.f & EFFECT_RAN) !== 0;
      }
      if (run2) {
        effect(() => {
          untrack(() => transition2.in());
        });
      }
    }
  }
  function animate(element, options, counterpart, t2, on_finish) {
    var is_intro = t2 === 1;
    if (is_function(options)) {
      var a;
      var aborted = false;
      queue_micro_task(() => {
        if (aborted) return;
        var o = options({ direction: is_intro ? "in" : "out" });
        a = animate(element, o, counterpart, t2, on_finish);
      });
      return {
        abort: () => {
          aborted = true;
          a == null ? undefined : a.abort();
        },
        deactivate: () => a.deactivate(),
        reset: () => a.reset(),
        t: () => a.t()
      };
    }
    counterpart == null ? undefined : counterpart.deactivate();
    if (!(options == null ? undefined : options.duration)) {
      on_finish();
      return {
        abort: noop,
        deactivate: noop,
        reset: noop,
        t: () => t2
      };
    }
    const { delay = 0, css, tick: tick2, easing = linear$1 } = options;
    var keyframes = [];
    if (is_intro && counterpart === undefined) {
      if (tick2) {
        tick2(0, 1);
      }
      if (css) {
        var styles = css_to_keyframe(css(0, 1));
        keyframes.push(styles, styles);
      }
    }
    var get_t = () => 1 - t2;
    var animation2 = element.animate(keyframes, { duration: delay });
    animation2.onfinish = () => {
      var t1 = (counterpart == null ? undefined : counterpart.t()) ?? 1 - t2;
      counterpart == null ? undefined : counterpart.abort();
      var delta = t2 - t1;
      var duration = (
        /** @type {number} */
        options.duration * Math.abs(delta)
      );
      var keyframes2 = [];
      if (duration > 0) {
        var needs_overflow_hidden = false;
        if (css) {
          var n = Math.ceil(duration / (1e3 / 60));
          for (var i = 0; i <= n; i += 1) {
            var t3 = t1 + delta * easing(i / n);
            var styles2 = css_to_keyframe(css(t3, 1 - t3));
            keyframes2.push(styles2);
            needs_overflow_hidden || (needs_overflow_hidden = styles2.overflow === "hidden");
          }
        }
        if (needs_overflow_hidden) {
          element.style.overflow = "hidden";
        }
        get_t = () => {
          var time = (
            /** @type {number} */
            /** @type {globalThis.Animation} */
            animation2.currentTime
          );
          return t1 + delta * easing(time / duration);
        };
        if (tick2) {
          loop(() => {
            if (animation2.playState !== "running") return false;
            var t4 = get_t();
            tick2(t4, 1 - t4);
            return true;
          });
        }
      }
      animation2 = element.animate(keyframes2, { duration, fill: "forwards" });
      animation2.onfinish = () => {
        get_t = () => t2;
        tick2 == null ? undefined : tick2(t2, 1 - t2);
        on_finish();
      };
    };
    return {
      abort: () => {
        if (animation2) {
          animation2.cancel();
          animation2.effect = null;
          animation2.onfinish = noop;
        }
      },
      deactivate: () => {
        on_finish = noop;
      },
      reset: () => {
        if (t2 === 0) {
          tick2 == null ? undefined : tick2(1, 0);
        }
      },
      t: () => get_t()
    };
  }
  function bind_value(input, get2, set2 = get2) {
    var runes = is_runes();
    listen_to_event_and_reset_event(input, "input", (is_reset) => {
      var value = is_reset ? input.defaultValue : input.value;
      value = is_numberlike_input(input) ? to_number(value) : value;
      set2(value);
      if (runes && value !== (value = get2())) {
        var start = input.selectionStart;
        var end = input.selectionEnd;
        input.value = value ?? "";
        if (end !== null) {
          input.selectionStart = start;
          input.selectionEnd = Math.min(end, input.value.length);
        }
      }
    });
    if (
      // If we are hydrating and the value has since changed,
      // then use the updated value from the input instead.
      hydrating && input.defaultValue !== input.value || // If defaultValue is set, then value == defaultValue
      // TODO Svelte 6: remove input.value check and set to empty string?
      untrack(get2) == null && input.value
    ) {
      set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
    }
    render_effect(() => {
      var value = get2();
      if (is_numberlike_input(input) && value === to_number(input.value)) {
        return;
      }
      if (input.type === "date" && !value && !input.value) {
        return;
      }
      if (value !== input.value) {
        input.value = value ?? "";
      }
    });
  }
  const pending = /* @__PURE__ */ new Set();
  function bind_group(inputs, group_index, input, get2, set2 = get2) {
    var is_checkbox = input.getAttribute("type") === "checkbox";
    var binding_group = inputs;
    let hydration_mismatch2 = false;
    if (group_index !== null) {
      for (var index2 of group_index) {
        binding_group = binding_group[index2] ?? (binding_group[index2] = []);
      }
    }
    binding_group.push(input);
    listen_to_event_and_reset_event(
      input,
      "change",
      () => {
        var value = input.__value;
        if (is_checkbox) {
          value = get_binding_group_value(binding_group, value, input.checked);
        }
        set2(value);
      },
      // TODO better default value handling
      () => set2(is_checkbox ? [] : null)
    );
    render_effect(() => {
      var value = get2();
      if (hydrating && input.defaultChecked !== input.checked) {
        hydration_mismatch2 = true;
        return;
      }
      if (is_checkbox) {
        value = value || [];
        input.checked = value.includes(input.__value);
      } else {
        input.checked = is(input.__value, value);
      }
    });
    teardown(() => {
      var index3 = binding_group.indexOf(input);
      if (index3 !== -1) {
        binding_group.splice(index3, 1);
      }
    });
    if (!pending.has(binding_group)) {
      pending.add(binding_group);
      queue_micro_task(() => {
        binding_group.sort((a, b) => a.compareDocumentPosition(b) === 4 ? -1 : 1);
        pending.delete(binding_group);
      });
    }
    queue_micro_task(() => {
      if (hydration_mismatch2) {
        var value;
        if (is_checkbox) {
          value = get_binding_group_value(binding_group, value, input.checked);
        } else {
          var hydration_input = binding_group.find((input2) => input2.checked);
          value = hydration_input == null ? undefined : hydration_input.__value;
        }
        set2(value);
      }
    });
  }
  function bind_checked(input, get2, set2 = get2) {
    listen_to_event_and_reset_event(input, "change", (is_reset) => {
      var value = is_reset ? input.defaultChecked : input.checked;
      set2(value);
    });
    if (
      // If we are hydrating and the value has since changed,
      // then use the update value from the input instead.
      hydrating && input.defaultChecked !== input.checked || // If defaultChecked is set, then checked == defaultChecked
      untrack(get2) == null
    ) {
      set2(input.checked);
    }
    render_effect(() => {
      var value = get2();
      input.checked = Boolean(value);
    });
  }
  function get_binding_group_value(group, __value, checked) {
    var value = /* @__PURE__ */ new Set();
    for (var i = 0; i < group.length; i += 1) {
      if (group[i].checked) {
        value.add(group[i].__value);
      }
    }
    if (!checked) {
      value.delete(__value);
    }
    return Array.from(value);
  }
  function is_numberlike_input(input) {
    var type = input.type;
    return type === "number" || type === "range";
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function bind_files(input, get2, set2 = get2) {
    listen_to_event_and_reset_event(input, "change", () => {
      set2(input.files);
    });
    render_effect(() => {
      input.files = get2();
    });
  }
  function bind_prop(props, prop2, value) {
    var desc = get_descriptor(props, prop2);
    if (desc && desc.set) {
      props[prop2] = value;
      teardown(() => {
        props[prop2] = null;
      });
    }
  }
  function select_option(select, value, mounting) {
    if (select.multiple) {
      return select_options(select, value);
    }
    for (var option of select.options) {
      var option_value = get_option_value(option);
      if (is(option_value, value)) {
        option.selected = true;
        return;
      }
    }
    if (!mounting || value !== undefined) {
      select.selectedIndex = -1;
    }
  }
  function init_select(select, get_value) {
    effect(() => {
      var observer2 = new MutationObserver(() => {
        var value = select.__value;
        select_option(select, value);
      });
      observer2.observe(select, {
        // Listen to option element changes
        childList: true,
        subtree: true,
        // because of <optgroup>
        // Listen to option element value attribute changes
        // (doesn't get notified of select value changes,
        // because that property is not reflected as an attribute)
        attributes: true,
        attributeFilter: ["value"]
      });
      return () => {
        observer2.disconnect();
      };
    });
  }
  function bind_select_value(select, get2, set2 = get2) {
    var mounting = true;
    listen_to_event_and_reset_event(select, "change", (is_reset) => {
      var query = is_reset ? "[selected]" : ":checked";
      var value;
      if (select.multiple) {
        value = [].map.call(select.querySelectorAll(query), get_option_value);
      } else {
        var selected_option = select.querySelector(query) ?? // will fall back to first non-disabled option if no option is selected
        select.querySelector("option:not([disabled])");
        value = selected_option && get_option_value(selected_option);
      }
      set2(value);
    });
    effect(() => {
      var value = get2();
      select_option(select, value, mounting);
      if (mounting && value === undefined) {
        var selected_option = select.querySelector(":checked");
        if (selected_option !== null) {
          value = get_option_value(selected_option);
          set2(value);
        }
      }
      select.__value = value;
      mounting = false;
    });
    init_select(select);
  }
  function select_options(select, value) {
    for (var option of select.options) {
      option.selected = ~value.indexOf(get_option_value(option));
    }
  }
  function get_option_value(option) {
    if ("__value" in option) {
      return option.__value;
    } else {
      return option.value;
    }
  }
  function is_bound_this(bound_value, element_or_component) {
    return bound_value === element_or_component || (bound_value == null ? undefined : bound_value[STATE_SYMBOL]) === element_or_component;
  }
  function bind_this(element_or_component = {}, update2, get_value, get_parts) {
    effect(() => {
      var old_parts;
      var parts;
      render_effect(() => {
        old_parts = parts;
        parts = [];
        untrack(() => {
          if (element_or_component !== get_value(...parts)) {
            update2(element_or_component, ...parts);
            if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
              update2(null, ...old_parts);
            }
          }
        });
      });
      return () => {
        queue_micro_task(() => {
          if (parts && is_bound_this(get_value(...parts), element_or_component)) {
            update2(null, ...parts);
          }
        });
      };
    });
    return element_or_component;
  }
  function bind_window_size(type, set2) {
    listen(window, ["resize"], () => without_reactive_context(() => set2(window[type])));
  }
  function init(immutable = false) {
    const context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    const callbacks = context.l.u;
    if (!callbacks) return;
    let props = () => deep_read_state(context.s);
    if (immutable) {
      let version = 0;
      let prev = (
        /** @type {Record<string, any>} */
        {}
      );
      const d = /* @__PURE__ */ derived$1(() => {
        let changed = false;
        const props2 = context.s;
        for (const key in props2) {
          if (props2[key] !== prev[key]) {
            prev[key] = props2[key];
            changed = true;
          }
        }
        if (changed) version++;
        return version;
      });
      props = () => get$1(d);
    }
    if (callbacks.b.length) {
      user_pre_effect(() => {
        observe_all(context, props);
        run_all(callbacks.b);
      });
    }
    user_effect(() => {
      const fns = untrack(() => callbacks.m.map(run));
      return () => {
        for (const fn of fns) {
          if (typeof fn === "function") {
            fn();
          }
        }
      };
    });
    if (callbacks.a.length) {
      user_effect(() => {
        observe_all(context, props);
        run_all(callbacks.a);
      });
    }
  }
  function observe_all(context, props) {
    if (context.l.s) {
      for (const signal of context.l.s) get$1(signal);
    }
    props();
  }
  function bubble_event($$props, event2) {
    var _a;
    var events = (
      /** @type {Record<string, Function[] | Function>} */
      (_a = $$props.$$events) == null ? undefined : _a[event2.type]
    );
    var callbacks = is_array(events) ? events.slice() : events == null ? [] : [events];
    for (var fn of callbacks) {
      fn.call(this, event2);
    }
  }
  function onMount(fn) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    if (legacy_mode_flag && component_context.l !== null) {
      init_update_callbacks(component_context).m.push(fn);
    } else {
      user_effect(() => {
        const cleanup = untrack(fn);
        if (typeof cleanup === "function") return (
          /** @type {() => void} */
          cleanup
        );
      });
    }
  }
  function create_custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    return new CustomEvent(type, { detail, bubbles, cancelable });
  }
  function createEventDispatcher() {
    const active_component_context = component_context;
    if (active_component_context === null) {
      lifecycle_outside_component();
    }
    return (type, detail, options) => {
      var _a;
      const events = (
        /** @type {Record<string, Function | Function[]>} */
        (_a = active_component_context.s.$$events) == null ? undefined : _a[
          /** @type {any} */
          type
        ]
      );
      if (events) {
        const callbacks = is_array(events) ? events.slice() : [events];
        const event2 = create_custom_event(
          /** @type {string} */
          type,
          detail,
          options
        );
        for (const fn of callbacks) {
          fn.call(active_component_context.x, event2);
        }
        return !event2.defaultPrevented;
      }
      return true;
    };
  }
  function afterUpdate(fn) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    if (component_context.l === null) {
      lifecycle_legacy_only();
    }
    init_update_callbacks(component_context).a.push(fn);
  }
  function init_update_callbacks(context) {
    var l = (
      /** @type {ComponentContextLegacy} */
      context.l
    );
    return l.u ?? (l.u = { a: [], b: [], m: [] });
  }
  function subscribe_to_store(store, run2, invalidate) {
    if (store == null) {
      run2(undefined);
      if (invalidate) invalidate(undefined);
      return noop;
    }
    const unsub = untrack(
      () => store.subscribe(
        run2,
        // @ts-expect-error
        invalidate
      )
    );
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  const subscriber_queue = [];
  function readable(value, start) {
    return {
      subscribe: writable(value, start).subscribe
    };
  }
  function writable(value, start = noop) {
    let stop = null;
    const subscribers = /* @__PURE__ */ new Set();
    function set2(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
          const run_queue = !subscriber_queue.length;
          for (const subscriber of subscribers) {
            subscriber[1]();
            subscriber_queue.push(subscriber, value);
          }
          if (run_queue) {
            for (let i = 0; i < subscriber_queue.length; i += 2) {
              subscriber_queue[i][0](subscriber_queue[i + 1]);
            }
            subscriber_queue.length = 0;
          }
        }
      }
    }
    function update2(fn) {
      set2(fn(
        /** @type {T} */
        value
      ));
    }
    function subscribe(run2, invalidate = noop) {
      const subscriber = [run2, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set2, update2) || noop;
      }
      run2(
        /** @type {T} */
        value
      );
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0 && stop) {
          stop();
          stop = null;
        }
      };
    }
    return { set: set2, update: update2, subscribe };
  }
  function derived(stores2, fn, initial_value) {
    const single = !Array.isArray(stores2);
    const stores_array = single ? [stores2] : stores2;
    if (!stores_array.every(Boolean)) {
      throw new Error("derived() expects stores as input, got a falsy value");
    }
    const auto = fn.length < 2;
    return readable(initial_value, (set2, update2) => {
      let started = false;
      const values = [];
      let pending2 = 0;
      let cleanup = noop;
      const sync = () => {
        if (pending2) {
          return;
        }
        cleanup();
        const result = fn(single ? values[0] : values, set2, update2);
        if (auto) {
          set2(result);
        } else {
          cleanup = typeof result === "function" ? result : noop;
        }
      };
      const unsubscribers = stores_array.map(
        (store, i) => subscribe_to_store(
          store,
          (value) => {
            values[i] = value;
            pending2 &= ~(1 << i);
            if (started) {
              sync();
            }
          },
          () => {
            pending2 |= 1 << i;
          }
        )
      );
      started = true;
      sync();
      return function stop() {
        run_all(unsubscribers);
        cleanup();
        started = false;
      };
    });
  }
  function readonly(store) {
    return {
      // @ts-expect-error TODO i suspect the bind is unnecessary
      subscribe: store.subscribe.bind(store)
    };
  }
  function get(store) {
    let value;
    subscribe_to_store(store, (_) => value = _)();
    return value;
  }
  let is_store_binding = false;
  let IS_UNMOUNTED = Symbol();
  function store_get(store, store_name, stores2) {
    const entry = stores2[store_name] ?? (stores2[store_name] = {
      store: null,
      source: /* @__PURE__ */ mutable_source(undefined),
      unsubscribe: noop
    });
    if (entry.store !== store && !(IS_UNMOUNTED in stores2)) {
      entry.unsubscribe();
      entry.store = store ?? null;
      if (store == null) {
        entry.source.v = undefined;
        entry.unsubscribe = noop;
      } else {
        var is_synchronous_callback = true;
        entry.unsubscribe = subscribe_to_store(store, (v) => {
          if (is_synchronous_callback) {
            entry.source.v = v;
          } else {
            set(entry.source, v);
          }
        });
        is_synchronous_callback = false;
      }
    }
    if (store && IS_UNMOUNTED in stores2) {
      return get(store);
    }
    return get$1(entry.source);
  }
  function store_set(store, value) {
    store.set(value);
    return value;
  }
  function setup_stores() {
    const stores2 = {};
    function cleanup() {
      teardown(() => {
        for (var store_name in stores2) {
          const ref = stores2[store_name];
          ref.unsubscribe();
        }
        define_property(stores2, IS_UNMOUNTED, {
          enumerable: false,
          value: true
        });
      });
    }
    return [stores2, cleanup];
  }
  function store_mutate(store, expression, new_value) {
    store.set(new_value);
    return expression;
  }
  function mark_store_binding() {
    is_store_binding = true;
  }
  function capture_store_binding(fn) {
    var previous_is_store_binding = is_store_binding;
    try {
      is_store_binding = false;
      return [fn(), is_store_binding];
    } finally {
      is_store_binding = previous_is_store_binding;
    }
  }
  const legacy_rest_props_handler = {
    get(target, key) {
      if (target.exclude.includes(key)) return;
      get$1(target.version);
      return key in target.special ? target.special[key]() : target.props[key];
    },
    set(target, key, value) {
      if (!(key in target.special)) {
        target.special[key] = prop(
          {
            get [key]() {
              return target.props[key];
            }
          },
          /** @type {string} */
          key,
          PROPS_IS_UPDATED
        );
      }
      target.special[key](value);
      update(target.version);
      return true;
    },
    getOwnPropertyDescriptor(target, key) {
      if (target.exclude.includes(key)) return;
      if (key in target.props) {
        return {
          enumerable: true,
          configurable: true,
          value: target.props[key]
        };
      }
    },
    deleteProperty(target, key) {
      if (target.exclude.includes(key)) return true;
      target.exclude.push(key);
      update(target.version);
      return true;
    },
    has(target, key) {
      if (target.exclude.includes(key)) return false;
      return key in target.props;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target.props).filter((key) => !target.exclude.includes(key));
    }
  };
  function legacy_rest_props(props, exclude) {
    return new Proxy({ props, exclude, special: {}, version: source(0) }, legacy_rest_props_handler);
  }
  const spread_props_handler = {
    get(target, key) {
      let i = target.props.length;
      while (i--) {
        let p = target.props[i];
        if (is_function(p)) p = p();
        if (typeof p === "object" && p !== null && key in p) return p[key];
      }
    },
    set(target, key, value) {
      let i = target.props.length;
      while (i--) {
        let p = target.props[i];
        if (is_function(p)) p = p();
        const desc = get_descriptor(p, key);
        if (desc && desc.set) {
          desc.set(value);
          return true;
        }
      }
      return false;
    },
    getOwnPropertyDescriptor(target, key) {
      let i = target.props.length;
      while (i--) {
        let p = target.props[i];
        if (is_function(p)) p = p();
        if (typeof p === "object" && p !== null && key in p) {
          const descriptor = get_descriptor(p, key);
          if (descriptor && !descriptor.configurable) {
            descriptor.configurable = true;
          }
          return descriptor;
        }
      }
    },
    has(target, key) {
      if (key === STATE_SYMBOL || key === LEGACY_PROPS) return false;
      for (let p of target.props) {
        if (is_function(p)) p = p();
        if (p != null && key in p) return true;
      }
      return false;
    },
    ownKeys(target) {
      const keys = [];
      for (let p of target.props) {
        if (is_function(p)) p = p();
        for (const key in p) {
          if (!keys.includes(key)) keys.push(key);
        }
      }
      return keys;
    }
  };
  function spread_props(...props) {
    return new Proxy({ props }, spread_props_handler);
  }
  function with_parent_branch(fn) {
    var effect2 = active_effect;
    var previous_effect = active_effect;
    while (effect2 !== null && (effect2.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
      effect2 = effect2.parent;
    }
    try {
      set_active_effect(effect2);
      return fn();
    } finally {
      set_active_effect(previous_effect);
    }
  }
  function prop(props, key, flags, fallback) {
    var _a;
    var immutable = (flags & PROPS_IS_IMMUTABLE) !== 0;
    var runes = !legacy_mode_flag || (flags & PROPS_IS_RUNES) !== 0;
    var bindable = (flags & PROPS_IS_BINDABLE) !== 0;
    var lazy = (flags & PROPS_IS_LAZY_INITIAL) !== 0;
    var is_store_sub = false;
    var prop_value;
    if (bindable) {
      [prop_value, is_store_sub] = capture_store_binding(() => (
        /** @type {V} */
        props[key]
      ));
    } else {
      prop_value = /** @type {V} */
      props[key];
    }
    var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
    var setter = bindable && (((_a = get_descriptor(props, key)) == null ? undefined : _a.set) ?? (is_entry_props && key in props && ((v) => props[key] = v))) || undefined;
    var fallback_value = (
      /** @type {V} */
      fallback
    );
    var fallback_dirty = true;
    var fallback_used = false;
    var get_fallback = () => {
      fallback_used = true;
      if (fallback_dirty) {
        fallback_dirty = false;
        if (lazy) {
          fallback_value = untrack(
            /** @type {() => V} */
            fallback
          );
        } else {
          fallback_value = /** @type {V} */
          fallback;
        }
      }
      return fallback_value;
    };
    if (prop_value === undefined && fallback !== undefined) {
      if (setter && runes) {
        props_invalid_value();
      }
      prop_value = get_fallback();
      if (setter) setter(prop_value);
    }
    var getter;
    if (runes) {
      getter = () => {
        var value = (
          /** @type {V} */
          props[key]
        );
        if (value === undefined) return get_fallback();
        fallback_dirty = true;
        fallback_used = false;
        return value;
      };
    } else {
      var derived_getter = with_parent_branch(
        () => (immutable ? derived$1 : derived_safe_equal)(() => (
          /** @type {V} */
          props[key]
        ))
      );
      derived_getter.f |= LEGACY_DERIVED_PROP;
      getter = () => {
        var value = get$1(derived_getter);
        if (value !== undefined) fallback_value = /** @type {V} */
        undefined;
        return value === undefined ? fallback_value : value;
      };
    }
    if ((flags & PROPS_IS_UPDATED) === 0) {
      return getter;
    }
    if (setter) {
      var legacy_parent = props.$$legacy;
      return function(value, mutation) {
        if (arguments.length > 0) {
          if (!runes || !mutation || legacy_parent || is_store_sub) {
            setter(mutation ? getter() : value);
          }
          return value;
        } else {
          return getter();
        }
      };
    }
    var from_child = false;
    var was_from_child = false;
    var inner_current_value = /* @__PURE__ */ mutable_source(prop_value);
    var current_value = with_parent_branch(
      () => /* @__PURE__ */ derived$1(() => {
        var parent_value = getter();
        var child_value = get$1(inner_current_value);
        if (from_child) {
          from_child = false;
          was_from_child = true;
          return child_value;
        }
        was_from_child = false;
        return inner_current_value.v = parent_value;
      })
    );
    if (!immutable) current_value.equals = safe_equals;
    return function(value, mutation) {
      if (captured_signals !== null) {
        from_child = was_from_child;
        getter();
        get$1(inner_current_value);
      }
      if (arguments.length > 0) {
        const new_value = mutation ? get$1(current_value) : runes && bindable ? proxy(value) : value;
        if (!current_value.equals(new_value)) {
          from_child = true;
          set(inner_current_value, new_value);
          if (fallback_used && fallback_value !== undefined) {
            fallback_value = new_value;
          }
          untrack(() => get$1(current_value));
        }
        return value;
      }
      return get$1(current_value);
    };
  }
  function createClassComponent(options) {
    return new Svelte4Component(options);
  }
  class Svelte4Component {
    /**
     * @param {ComponentConstructorOptions & {
     *  component: any;
     * }} options
     */
    constructor(options) {
      /** @type {any} */
      __privateAdd(this, _events);
      /** @type {Record<string, any>} */
      __privateAdd(this, _instance);
      var _a;
      var sources = /* @__PURE__ */ new Map();
      var add_source = (key, value) => {
        var s = /* @__PURE__ */ mutable_source(value);
        sources.set(key, s);
        return s;
      };
      const props = new Proxy(
        { ...options.props || {}, $$events: {} },
        {
          get(target, prop2) {
            return get$1(sources.get(prop2) ?? add_source(prop2, Reflect.get(target, prop2)));
          },
          has(target, prop2) {
            if (prop2 === LEGACY_PROPS) return true;
            get$1(sources.get(prop2) ?? add_source(prop2, Reflect.get(target, prop2)));
            return Reflect.has(target, prop2);
          },
          set(target, prop2, value) {
            set(sources.get(prop2) ?? add_source(prop2, value), value);
            return Reflect.set(target, prop2, value);
          }
        }
      );
      __privateSet(this, _instance, (options.hydrate ? hydrate : mount)(options.component, {
        target: options.target,
        anchor: options.anchor,
        props,
        context: options.context,
        intro: options.intro ?? false,
        recover: options.recover
      }));
      if (!((_a = options == null ? undefined : options.props) == null ? undefined : _a.$$host) || options.sync === false) {
        flush_sync();
      }
      __privateSet(this, _events, props.$$events);
      for (const key of Object.keys(__privateGet(this, _instance))) {
        if (key === "$set" || key === "$destroy" || key === "$on") continue;
        define_property(this, key, {
          get() {
            return __privateGet(this, _instance)[key];
          },
          /** @param {any} value */
          set(value) {
            __privateGet(this, _instance)[key] = value;
          },
          enumerable: true
        });
      }
      __privateGet(this, _instance).$set = /** @param {Record<string, any>} next */
      (next2) => {
        Object.assign(props, next2);
      };
      __privateGet(this, _instance).$destroy = () => {
        unmount(__privateGet(this, _instance));
      };
    }
    /** @param {Record<string, any>} props */
    $set(props) {
      __privateGet(this, _instance).$set(props);
    }
    /**
     * @param {string} event
     * @param {(...args: any[]) => any} callback
     * @returns {any}
     */
    $on(event2, callback) {
      __privateGet(this, _events)[event2] = __privateGet(this, _events)[event2] || [];
      const cb = (...args) => callback.call(this, ...args);
      __privateGet(this, _events)[event2].push(cb);
      return () => {
        __privateGet(this, _events)[event2] = __privateGet(this, _events)[event2].filter(
          /** @param {any} fn */
          (fn) => fn !== cb
        );
      };
    }
    $destroy() {
      __privateGet(this, _instance).$destroy();
    }
  }
  _events = new WeakMap();
  _instance = new WeakMap();
  let SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      /**
       * @param {*} $$componentCtor
       * @param {*} $$slots
       * @param {*} use_shadow_dom
       */
      constructor($$componentCtor, $$slots, use_shadow_dom) {
        super();
        /** The Svelte component constructor */
        __publicField(this, "$$ctor");
        /** Slots */
        __publicField(this, "$$s");
        /** @type {any} The Svelte component instance */
        __publicField(this, "$$c");
        /** Whether or not the custom element is connected */
        __publicField(this, "$$cn", false);
        /** @type {Record<string, any>} Component props data */
        __publicField(this, "$$d", {});
        /** `true` if currently in the process of reflecting component props back to attributes */
        __publicField(this, "$$r", false);
        /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
        __publicField(this, "$$p_d", {});
        /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
        __publicField(this, "$$l", {});
        /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
        __publicField(this, "$$l_u", /* @__PURE__ */ new Map());
        /** @type {any} The managed render effect for reflecting attributes */
        __publicField(this, "$$me");
        this.$$ctor = $$componentCtor;
        this.$$s = $$slots;
        if (use_shadow_dom) {
          this.attachShadow({ mode: "open" });
        }
      }
      /**
       * @param {string} type
       * @param {EventListenerOrEventListenerObject} listener
       * @param {boolean | AddEventListenerOptions} [options]
       */
      addEventListener(type, listener, options) {
        this.$$l[type] = this.$$l[type] || [];
        this.$$l[type].push(listener);
        if (this.$$c) {
          const unsub = this.$$c.$on(type, listener);
          this.$$l_u.set(listener, unsub);
        }
        super.addEventListener(type, listener, options);
      }
      /**
       * @param {string} type
       * @param {EventListenerOrEventListenerObject} listener
       * @param {boolean | AddEventListenerOptions} [options]
       */
      removeEventListener(type, listener, options) {
        super.removeEventListener(type, listener, options);
        if (this.$$c) {
          const unsub = this.$$l_u.get(listener);
          if (unsub) {
            unsub();
            this.$$l_u.delete(listener);
          }
        }
      }
      async connectedCallback() {
        this.$$cn = true;
        if (!this.$$c) {
          let create_slot = function(name) {
            return (anchor) => {
              const slot2 = document.createElement("slot");
              if (name !== "default") slot2.name = name;
              append(anchor, slot2);
            };
          };
          await Promise.resolve();
          if (!this.$$cn || this.$$c) {
            return;
          }
          const $$slots = {};
          const existing_slots = get_custom_elements_slots(this);
          for (const name of this.$$s) {
            if (name in existing_slots) {
              if (name === "default" && !this.$$d.children) {
                this.$$d.children = create_slot(name);
                $$slots.default = true;
              } else {
                $$slots[name] = create_slot(name);
              }
            }
          }
          for (const attribute of this.attributes) {
            const name = this.$$g_p(attribute.name);
            if (!(name in this.$$d)) {
              this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
            }
          }
          for (const key in this.$$p_d) {
            if (!(key in this.$$d) && this[key] !== undefined) {
              this.$$d[key] = this[key];
              delete this[key];
            }
          }
          this.$$c = createClassComponent({
            component: this.$$ctor,
            target: this.shadowRoot || this,
            props: {
              ...this.$$d,
              $$slots,
              $$host: this
            }
          });
          this.$$me = effect_root(() => {
            render_effect(() => {
              var _a;
              this.$$r = true;
              for (const key of object_keys(this.$$c)) {
                if (!((_a = this.$$p_d[key]) == null ? undefined : _a.reflect)) continue;
                this.$$d[key] = this.$$c[key];
                const attribute_value = get_custom_element_value(
                  key,
                  this.$$d[key],
                  this.$$p_d,
                  "toAttribute"
                );
                if (attribute_value == null) {
                  this.removeAttribute(this.$$p_d[key].attribute || key);
                } else {
                  this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
                }
              }
              this.$$r = false;
            });
          });
          for (const type in this.$$l) {
            for (const listener of this.$$l[type]) {
              const unsub = this.$$c.$on(type, listener);
              this.$$l_u.set(listener, unsub);
            }
          }
          this.$$l = {};
        }
      }
      // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
      // and setting attributes through setAttribute etc, this is helpful
      /**
       * @param {string} attr
       * @param {string} _oldValue
       * @param {string} newValue
       */
      attributeChangedCallback(attr, _oldValue, newValue) {
        var _a;
        if (this.$$r) return;
        attr = this.$$g_p(attr);
        this.$$d[attr] = get_custom_element_value(attr, newValue, this.$$p_d, "toProp");
        (_a = this.$$c) == null ? undefined : _a.$set({ [attr]: this.$$d[attr] });
      }
      disconnectedCallback() {
        this.$$cn = false;
        Promise.resolve().then(() => {
          if (!this.$$cn && this.$$c) {
            this.$$c.$destroy();
            this.$$me();
            this.$$c = undefined;
          }
        });
      }
      /**
       * @param {string} attribute_name
       */
      $$g_p(attribute_name) {
        return object_keys(this.$$p_d).find(
          (key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name
        ) || attribute_name;
      }
    };
  }
  function get_custom_element_value(prop2, value, props_definition, transform) {
    var _a;
    const type = (_a = props_definition[prop2]) == null ? undefined : _a.type;
    value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
    if (!transform || !props_definition[prop2]) {
      return value;
    } else if (transform === "toAttribute") {
      switch (type) {
        case "Object":
        case "Array":
          return value == null ? null : JSON.stringify(value);
        case "Boolean":
          return value ? "" : null;
        case "Number":
          return value == null ? null : value;
        default:
          return value;
      }
    } else {
      switch (type) {
        case "Object":
        case "Array":
          return value && JSON.parse(value);
        case "Boolean":
          return value;
        case "Number":
          return value != null ? +value : value;
        default:
          return value;
      }
    }
  }
  function get_custom_elements_slots(element) {
    const result = {};
    element.childNodes.forEach((node) => {
      result[
        /** @type {Element} node */
        node.slot || "default"
      ] = true;
    });
    return result;
  }
  function create_custom_element(Component, props_definition, slots, exports, use_shadow_dom, extend) {
    let Class = class extends SvelteElement {
      constructor() {
        super(Component, slots, use_shadow_dom);
        this.$$p_d = props_definition;
      }
      static get observedAttributes() {
        return object_keys(props_definition).map(
          (key) => (props_definition[key].attribute || key).toLowerCase()
        );
      }
    };
    object_keys(props_definition).forEach((prop2) => {
      define_property(Class.prototype, prop2, {
        get() {
          return this.$$c && prop2 in this.$$c ? this.$$c[prop2] : this.$$d[prop2];
        },
        set(value) {
          var _a;
          value = get_custom_element_value(prop2, value, props_definition);
          this.$$d[prop2] = value;
          var component2 = this.$$c;
          if (component2) {
            var setter = (_a = get_descriptor(component2, prop2)) == null ? undefined : _a.get;
            if (setter) {
              component2[prop2] = value;
            } else {
              component2.$set({ [prop2]: value });
            }
          }
        }
      });
    });
    exports.forEach((property) => {
      define_property(Class.prototype, property, {
        get() {
          var _a;
          return (_a = this.$$c) == null ? undefined : _a[property];
        }
      });
    });
    {
      Class = extend(Class);
    }
    Component.element = /** @type {any} */
    Class;
    return Class;
  }
  const DRAWER_STORE_KEY = "drawerStore";
  function initializeDrawerStore() {
    const drawerStore = drawerService();
    return setContext(DRAWER_STORE_KEY, drawerStore);
  }
  function drawerService() {
    const { subscribe, set: set2, update: update2 } = writable({});
    return {
      subscribe,
      set: set2,
      update: update2,
      /** Open the drawer. */
      open: (newSettings) => update2(() => {
        return { open: true, ...newSettings };
      }),
      /** Close the drawer. */
      close: () => update2((d) => {
        d.open = false;
        return d;
      })
    };
  }
  const MODAL_STORE_KEY = "modalStore";
  function getModalStore() {
    const modalStore = getContext(MODAL_STORE_KEY);
    if (!modalStore)
      throw new Error("modalStore is not initialized. Please ensure that `initializeStores()` is invoked in the root layout file of this app!");
    return modalStore;
  }
  function initializeModalStore() {
    const modalStore = modalService();
    return setContext(MODAL_STORE_KEY, modalStore);
  }
  function modalService() {
    const { subscribe, set: set2, update: update2 } = writable([]);
    return {
      subscribe,
      set: set2,
      update: update2,
      /** Append to end of queue. */
      trigger: (modal) => update2((mStore) => {
        mStore.push(modal);
        return mStore;
      }),
      /**  Remove first item in queue. */
      close: () => update2((mStore) => {
        if (mStore.length > 0)
          mStore.shift();
        return mStore;
      }),
      /** Remove all items from queue. */
      clear: () => set2([])
    };
  }
  const toastDefaults = { message: "Missing Toast Message", autohide: true, timeout: 5e3 };
  const TOAST_STORE_KEY = "toastStore";
  function initializeToastStore() {
    const toastStore = toastService();
    return setContext(TOAST_STORE_KEY, toastStore);
  }
  function randomUUID() {
    const random = Math.random();
    return Number(random).toString(32);
  }
  function toastService() {
    const { subscribe, set: set2, update: update2 } = writable([]);
    const close = (id) => update2((tStore) => {
      if (tStore.length > 0) {
        const index2 = tStore.findIndex((t2) => t2.id === id);
        const selectedToast = tStore[index2];
        if (selectedToast) {
          if (selectedToast.callback)
            selectedToast.callback({ id, status: "closed" });
          if (selectedToast.timeoutId)
            clearTimeout(selectedToast.timeoutId);
          tStore.splice(index2, 1);
        }
      }
      return tStore;
    });
    function handleAutoHide(toast) {
      if (toast.autohide === true) {
        return setTimeout(() => {
          close(toast.id);
        }, toast.timeout);
      }
    }
    return {
      subscribe,
      close,
      /** Add a new toast to the queue. */
      trigger: (toast) => {
        const id = randomUUID();
        update2((tStore) => {
          if (toast && toast.callback)
            toast.callback({ id, status: "queued" });
          if (toast.hideDismiss)
            toast.autohide = true;
          const tMerged = { ...toastDefaults, ...toast, id };
          tMerged.timeoutId = handleAutoHide(tMerged);
          tStore.push(tMerged);
          return tStore;
        });
        return id;
      },
      /** Remain visible on hover */
      freeze: (index2) => update2((tStore) => {
        if (tStore.length > 0)
          clearTimeout(tStore[index2].timeoutId);
        return tStore;
      }),
      /** Cancel remain visible on leave */
      unfreeze: (index2) => update2((tStore) => {
        if (tStore.length > 0)
          tStore[index2].timeoutId = handleAutoHide(tStore[index2]);
        return tStore;
      }),
      /** Remove all toasts from queue */
      clear: () => set2([])
    };
  }
  function initializeStores() {
    initializeModalStore();
    initializeToastStore();
    initializeDrawerStore();
  }
  const stores = {};
  function getStorage(type) {
    return type === "local" ? localStorage : sessionStorage;
  }
  function localStorageStore(key, initialValue, options) {
    const serializer = JSON;
    const storageType = "local";
    function updateStorage(key2, value) {
      getStorage(storageType).setItem(key2, serializer.stringify(value));
    }
    if (!stores[key]) {
      const store = writable(initialValue, (set3) => {
        const json = getStorage(storageType).getItem(key);
        if (json) {
          set3(serializer.parse(json));
        }
        {
          const handleStorage = (event2) => {
            if (event2.key === key)
              set3(event2.newValue ? serializer.parse(event2.newValue) : null);
          };
          window.addEventListener("storage", handleStorage);
          return () => window.removeEventListener("storage", handleStorage);
        }
      });
      const { subscribe, set: set2 } = store;
      stores[key] = {
        set(value) {
          updateStorage(key, value);
          set2(value);
        },
        update(updater) {
          const value = updater(get(store));
          updateStorage(key, value);
          set2(value);
        },
        subscribe
      };
    }
    return stores[key];
  }
  localStorageStore("modeOsPrefers", false);
  localStorageStore("modeUserPrefers", undefined);
  localStorageStore("modeCurrent", false);
  const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
  function prefersReducedMotion() {
    return window.matchMedia(reducedMotionQuery).matches;
  }
  const prefersReducedMotionStore = readable(prefersReducedMotion(), (set2) => {
    {
      const setReducedMotion = (event2) => {
        set2(event2.matches);
      };
      const mediaQueryList = window.matchMedia(reducedMotionQuery);
      mediaQueryList.addEventListener("change", setReducedMotion);
      return () => {
        mediaQueryList.removeEventListener("change", setReducedMotion);
      };
    }
  });
  function focusTrap(node, enabled) {
    const elemWhitelist = 'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]), input:not([tabindex="-1"]), textarea:not([tabindex="-1"]), select:not([tabindex="-1"]), details:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';
    let elemFirst;
    let elemLast;
    function onFirstElemKeydown(e) {
      if (e.shiftKey && e.code === "Tab") {
        e.preventDefault();
        elemLast.focus();
      }
    }
    function onLastElemKeydown(e) {
      if (!e.shiftKey && e.code === "Tab") {
        e.preventDefault();
        elemFirst.focus();
      }
    }
    const sortByTabIndex = (focusableElems) => {
      return focusableElems.filter((elem) => elem.tabIndex >= 0).sort((a, b) => {
        if (a.tabIndex === 0 && b.tabIndex > 0)
          return 1;
        else if (a.tabIndex > 0 && b.tabIndex === 0)
          return -1;
        else
          return a.tabIndex - b.tabIndex;
      });
    };
    const getFocusTrapTarget = (elemFirst2) => {
      const focusindexElements = [...node.querySelectorAll("[data-focusindex]")];
      if (!focusindexElements || focusindexElements.length === 0)
        return elemFirst2;
      return focusindexElements.sort((a, b) => {
        return +a.dataset.focusindex - +b.dataset.focusindex;
      })[0] || elemFirst2;
    };
    const onScanElements = (fromObserver) => {
      if (enabled === false)
        return;
      const focusableElems = sortByTabIndex(Array.from(node.querySelectorAll(elemWhitelist)));
      if (focusableElems.length) {
        elemFirst = focusableElems[0];
        elemLast = focusableElems[focusableElems.length - 1];
        if (!fromObserver)
          getFocusTrapTarget(elemFirst).focus();
        elemFirst.addEventListener("keydown", onFirstElemKeydown);
        elemLast.addEventListener("keydown", onLastElemKeydown);
      }
    };
    onScanElements(false);
    function onCleanUp() {
      if (elemFirst)
        elemFirst.removeEventListener("keydown", onFirstElemKeydown);
      if (elemLast)
        elemLast.removeEventListener("keydown", onLastElemKeydown);
    }
    const onObservationChange = (mutationRecords, observer3) => {
      if (mutationRecords.length) {
        onCleanUp();
        onScanElements(true);
      }
      return observer3;
    };
    const observer2 = new MutationObserver(onObservationChange);
    observer2.observe(node, { childList: true, subtree: true });
    return {
      update(newArgs) {
        enabled = newArgs;
        newArgs ? onScanElements(false) : onCleanUp();
      },
      destroy() {
        onCleanUp();
        observer2.disconnect();
      }
    };
  }
  enable_legacy_mode_flag();
  const linear = (x) => x;
  function cubic_out(t2) {
    const f = t2 - 1;
    return f * f * f + 1;
  }
  function split_css_unit(value) {
    const split = typeof value === "string" && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
    return split ? [parseFloat(split[1]), split[2] || "px"] : [
      /** @type {number} */
      value,
      "px"
    ];
  }
  function fade(node, { delay = 0, duration = 400, easing = linear } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
      delay,
      duration,
      easing,
      css: (t2) => `opacity: ${t2 * o}`
    };
  }
  function fly(node, { delay = 0, duration = 400, easing = cubic_out, x = 0, y = 0, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === "none" ? "" : style.transform;
    const od = target_opacity * (1 - opacity);
    const [x_value, x_unit] = split_css_unit(x);
    const [y_value, y_unit] = split_css_unit(y);
    return {
      delay,
      duration,
      easing,
      css: (t2, u) => `
			transform: ${transform} translate(${(1 - t2) * x_value}${x_unit}, ${(1 - t2) * y_value}${y_unit});
			opacity: ${target_opacity - od * u}`
    };
  }
  function slide(node, { delay = 0, duration = 400, easing = cubic_out, axis = "y" } = {}) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const primary_property = axis === "y" ? "height" : "width";
    const primary_property_value = parseFloat(style[primary_property]);
    const secondary_properties = axis === "y" ? ["top", "bottom"] : ["left", "right"];
    const capitalized_secondary_properties = secondary_properties.map(
      (e) => (
        /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
        `${e[0].toUpperCase()}${e.slice(1)}`
      )
    );
    const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
    const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
    const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
    const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
    const border_width_start_value = parseFloat(
      style[`border${capitalized_secondary_properties[0]}Width`]
    );
    const border_width_end_value = parseFloat(
      style[`border${capitalized_secondary_properties[1]}Width`]
    );
    return {
      delay,
      duration,
      easing,
      css: (t2) => `overflow: hidden;opacity: ${Math.min(t2 * 20, 1) * opacity};${primary_property}: ${t2 * primary_property_value}px;padding-${secondary_properties[0]}: ${t2 * padding_start_value}px;padding-${secondary_properties[1]}: ${t2 * padding_end_value}px;margin-${secondary_properties[0]}: ${t2 * margin_start_value}px;margin-${secondary_properties[1]}: ${t2 * margin_end_value}px;border-${secondary_properties[0]}-width: ${t2 * border_width_start_value}px;border-${secondary_properties[1]}-width: ${t2 * border_width_end_value}px;min-${primary_property}: 0`
    };
  }
  function scale(node, { delay = 0, duration = 400, easing = cubic_out, start = 0, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === "none" ? "" : style.transform;
    const sd = 1 - start;
    const od = target_opacity * (1 - opacity);
    return {
      delay,
      duration,
      easing,
      css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
    };
  }
  function dynamicTransition(node, dynParams) {
    const { transition: transition2, params, enabled } = dynParams;
    if (enabled)
      return transition2(node, params);
    if ("duration" in params)
      return transition2(node, { duration: 0 });
    return { duration: 0 };
  }
  var root_1$g = /* @__PURE__ */ template(`<div><!></div>`);
  var root_2$9 = /* @__PURE__ */ template(`<div><!></div>`);
  var root_3$a = /* @__PURE__ */ template(`<div><!></div>`);
  var root$k = /* @__PURE__ */ template(`<div data-testid="app-bar" role="toolbar"><div><!> <div><!></div> <!></div> <!></div>`);
  function AppBar($$anchor, $$props) {
    const $$slots = sanitize_slots($$props);
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    push($$props, false);
    const classesBase = mutable_state();
    const classesRowMain = mutable_state();
    const classesRowHeadline = mutable_state();
    const classesSlotLead = mutable_state();
    const classesSlotDefault = mutable_state();
    const classesSlotTrail = mutable_state();
    let background = prop($$props, "background", 8, "bg-surface-100-800-token");
    let border = prop($$props, "border", 8, "");
    let padding = prop($$props, "padding", 8, "p-4");
    let shadow = prop($$props, "shadow", 8, "");
    let spacing = prop($$props, "spacing", 8, "space-y-4");
    let gridColumns = prop($$props, "gridColumns", 8, "grid-cols-[auto_1fr_auto]");
    let gap = prop($$props, "gap", 8, "gap-4");
    let regionRowMain = prop($$props, "regionRowMain", 8, "");
    let regionRowHeadline = prop($$props, "regionRowHeadline", 8, "");
    let slotLead = prop($$props, "slotLead", 8, "");
    let slotDefault = prop($$props, "slotDefault", 8, "");
    let slotTrail = prop($$props, "slotTrail", 8, "");
    let label = prop($$props, "label", 8, "");
    let labelledby = prop($$props, "labelledby", 8, "");
    const cBase = "flex flex-col";
    const cRowMain = "grid items-center";
    const cRowHeadline = "";
    const cSlotLead = "flex-none flex justify-between items-center";
    const cSlotDefault = "flex-auto";
    const cSlotTrail = "flex-none flex items-center space-x-4";
    legacy_pre_effect(
      () => (deep_read_state(background()), deep_read_state(border()), deep_read_state(spacing()), deep_read_state(padding()), deep_read_state(shadow()), deep_read_state($$sanitized_props)),
      () => {
        set(classesBase, `${cBase} ${background()} ${border()} ${spacing()} ${padding()} ${shadow()} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(gridColumns()), deep_read_state(gap()), deep_read_state(regionRowMain())),
      () => {
        set(classesRowMain, `${cRowMain} ${gridColumns()} ${gap()} ${regionRowMain()}`);
      }
    );
    legacy_pre_effect(() => deep_read_state(regionRowHeadline()), () => {
      set(classesRowHeadline, `${cRowHeadline} ${regionRowHeadline()}`);
    });
    legacy_pre_effect(() => deep_read_state(slotLead()), () => {
      set(classesSlotLead, `${cSlotLead} ${slotLead()}`);
    });
    legacy_pre_effect(() => deep_read_state(slotDefault()), () => {
      set(classesSlotDefault, `${cSlotDefault} ${slotDefault()}`);
    });
    legacy_pre_effect(() => deep_read_state(slotTrail()), () => {
      set(classesSlotTrail, `${cSlotTrail} ${slotTrail()}`);
    });
    legacy_pre_effect_reset();
    init();
    var div = root$k();
    var div_1 = child(div);
    var node = child(div_1);
    {
      var consequent = ($$anchor2) => {
        var div_2 = root_1$g();
        var node_1 = child(div_2);
        slot(node_1, $$props, "lead", {}, null);
        reset(div_2);
        template_effect(() => set_class(div_2, `app-bar-slot-lead ${get$1(classesSlotLead) ?? ""}`));
        append($$anchor2, div_2);
      };
      if_block(node, ($$render) => {
        if ($$slots.lead) $$render(consequent);
      });
    }
    var div_3 = sibling(node, 2);
    var node_2 = child(div_3);
    slot(node_2, $$props, "default", {}, null);
    reset(div_3);
    var node_3 = sibling(div_3, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var div_4 = root_2$9();
        var node_4 = child(div_4);
        slot(node_4, $$props, "trail", {}, null);
        reset(div_4);
        template_effect(() => set_class(div_4, `app-bar-slot-trail ${get$1(classesSlotTrail) ?? ""}`));
        append($$anchor2, div_4);
      };
      if_block(node_3, ($$render) => {
        if ($$slots.trail) $$render(consequent_1);
      });
    }
    reset(div_1);
    var node_5 = sibling(div_1, 2);
    {
      var consequent_2 = ($$anchor2) => {
        var div_5 = root_3$a();
        var node_6 = child(div_5);
        slot(node_6, $$props, "headline", {}, null);
        reset(div_5);
        template_effect(() => set_class(div_5, `app-bar-row-headline ${get$1(classesRowHeadline) ?? ""}`));
        append($$anchor2, div_5);
      };
      if_block(node_5, ($$render) => {
        if ($$slots.headline) $$render(consequent_2);
      });
    }
    reset(div);
    template_effect(() => {
      set_class(div, `app-bar ${get$1(classesBase) ?? ""}`);
      set_attribute(div, "aria-label", label());
      set_attribute(div, "aria-labelledby", labelledby());
      set_class(div_1, `app-bar-row-main ${get$1(classesRowMain) ?? ""}`);
      set_class(div_3, `app-bar-slot-default ${get$1(classesSlotDefault) ?? ""}`);
    });
    append($$anchor, div);
    pop();
  }
  var root$j = /* @__PURE__ */ template(`<div data-testid="file-button"><div class="w-0 h-0 overflow-hidden"><input></div> <button type="button"><!></button></div>`);
  function FileButton($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "files",
      "fileInput",
      "name",
      "width",
      "button"
    ]);
    push($$props, false);
    const classesBase = mutable_state();
    const classesButton = mutable_state();
    let files = prop($$props, "files", 28, () => undefined);
    let fileInput = prop($$props, "fileInput", 28, () => undefined);
    let name = prop($$props, "name", 8);
    let width = prop($$props, "width", 8, "");
    let button = prop($$props, "button", 8, "btn variant-filled");
    function onButtonClick() {
      if (fileInput()) fileInput().click();
    }
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    legacy_pre_effect(() => deep_read_state($$sanitized_props), () => {
      set(classesBase, `${$$sanitized_props.class ?? ""}`);
    });
    legacy_pre_effect(
      () => (deep_read_state(button()), deep_read_state(width())),
      () => {
        set(classesButton, `${button()} ${width()}`);
      }
    );
    legacy_pre_effect_reset();
    init();
    var div = root$j();
    var div_1 = child(div);
    var input = child(div_1);
    remove_input_defaults(input);
    const spread_with_call = /* @__PURE__ */ derived_safe_equal(prunedRestProps);
    let attributes;
    bind_this(input, ($$value) => fileInput($$value), () => fileInput());
    reset(div_1);
    var button_1 = sibling(div_1, 2);
    var node = child(button_1);
    slot(node, $$props, "default", {}, ($$anchor2) => {
      var text$1 = text("Select a File");
      append($$anchor2, text$1);
    });
    reset(button_1);
    reset(div);
    template_effect(() => {
      set_class(div, `file-button ${get$1(classesBase) ?? ""}`);
      attributes = set_attributes(input, attributes, {
        type: "file",
        name: name(),
        ...get$1(spread_with_call)
      });
      set_class(button_1, `file-button-btn ${get$1(classesButton) ?? ""}`);
      button_1.disabled = $$restProps.disabled;
    });
    bind_files(input, files);
    event("change", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("click", button_1, onButtonClick);
    event("keydown", button_1, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keyup", button_1, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keypress", button_1, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    append($$anchor, div);
    pop();
  }
  function cubicOut(t2) {
    const f = t2 - 1;
    return f * f * f + 1;
  }
  function flip(node, { from, to }, params = {}) {
    var { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
    var style = getComputedStyle(node);
    var transform = style.transform === "none" ? "" : style.transform;
    var [ox, oy] = style.transformOrigin.split(" ").map(parseFloat);
    ox /= node.clientWidth;
    oy /= node.clientHeight;
    var zoom = get_zoom(node);
    var sx = node.clientWidth / to.width / zoom;
    var sy = node.clientHeight / to.height / zoom;
    var fx = from.left + from.width * ox;
    var fy = from.top + from.height * oy;
    var tx = to.left + to.width * ox;
    var ty = to.top + to.height * oy;
    var dx = (fx - tx) * sx;
    var dy = (fy - ty) * sy;
    var dsx = from.width / to.width;
    var dsy = from.height / to.height;
    return {
      delay,
      duration: typeof duration === "function" ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
      easing,
      css: (t2, u) => {
        var x = u * dx;
        var y = u * dy;
        var sx2 = t2 + u * dsx;
        var sy2 = t2 + u * dsy;
        return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx2}, ${sy2});`;
      }
    };
  }
  function get_zoom(element) {
    if ("currentCSSZoom" in element) {
      return (
        /** @type {number} */
        element.currentCSSZoom
      );
    }
    var current = element;
    var zoom = 1;
    while (current !== null) {
      zoom *= +getComputedStyle(current).zoom;
      current = /** @type {Element | null} */
      current.parentElement;
    }
    return zoom;
  }
  var root_1$f = /* @__PURE__ */ template(`<option> </option>`);
  var root_3$9 = /* @__PURE__ */ template(`<div><button type="button"><span> </span> <span>✕</span></button></div>`);
  var root_2$8 = /* @__PURE__ */ template(`<div></div>`);
  var root$i = /* @__PURE__ */ template(`<div><div class="h-0 overflow-hidden"><select multiple tabindex="-1"></select></div> <div><input> <!></div></div>`);
  function InputChip($$anchor, $$props) {
    var _a;
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "addChip",
      "removeChip",
      "input",
      "name",
      "value",
      "whitelist",
      "max",
      "minlength",
      "maxlength",
      "allowUpperCase",
      "allowDuplicates",
      "validation",
      "duration",
      "required",
      "chips",
      "invalid",
      "padding",
      "rounded",
      "regionChipWrapper",
      "regionChipList",
      "regionInput",
      "label",
      "transitions",
      "listTransitionIn",
      "listTransitionInParams",
      "listTransitionOut",
      "listTransitionOutParams",
      "chipTransitionIn",
      "chipTransitionInParams",
      "chipTransitionOut",
      "chipTransitionOutParams"
    ]);
    push($$props, false);
    const [$$stores, $$cleanup] = setup_stores();
    const $prefersReducedMotionStore = () => store_get(prefersReducedMotionStore, "$prefersReducedMotionStore", $$stores);
    const classesInvalid = mutable_state();
    const classesBase = mutable_state();
    const classesChipWrapper = mutable_state();
    const classesChipList = mutable_state();
    const classesInput = mutable_state();
    const dispatch = createEventDispatcher();
    let input = prop($$props, "input", 12, "");
    let name = prop($$props, "name", 8);
    let value = prop($$props, "value", 28, () => []);
    let whitelist = prop($$props, "whitelist", 24, () => []);
    let max = prop($$props, "max", 24, () => -1);
    let minlength = prop($$props, "minlength", 24, () => -1);
    let maxlength = prop($$props, "maxlength", 24, () => -1);
    let allowUpperCase = prop($$props, "allowUpperCase", 8, false);
    let allowDuplicates = prop($$props, "allowDuplicates", 8, false);
    let validation = prop($$props, "validation", 8, () => true);
    let duration = prop($$props, "duration", 8, 150);
    let required = prop($$props, "required", 8, false);
    let chips = prop($$props, "chips", 8, "variant-filled");
    let invalid = prop($$props, "invalid", 8, "input-error");
    let padding = prop($$props, "padding", 8, "p-2");
    let rounded = prop($$props, "rounded", 8, "rounded-container-token");
    let regionChipWrapper = prop($$props, "regionChipWrapper", 8, "");
    let regionChipList = prop($$props, "regionChipList", 8, "");
    let regionInput = prop($$props, "regionInput", 8, "");
    let label = prop($$props, "label", 8, "Chips select");
    let transitions = prop($$props, "transitions", 24, () => !$prefersReducedMotionStore());
    let listTransitionIn = prop($$props, "listTransitionIn", 8, fly);
    let listTransitionInParams = prop($$props, "listTransitionInParams", 24, () => ({ duration: 150, opacity: 0, y: -20 }));
    let listTransitionOut = prop($$props, "listTransitionOut", 8, fly);
    let listTransitionOutParams = prop($$props, "listTransitionOutParams", 24, () => ({ duration: 150, opacity: 0, y: -20 }));
    let chipTransitionIn = prop($$props, "chipTransitionIn", 8, scale);
    let chipTransitionInParams = prop($$props, "chipTransitionInParams", 24, () => ({ duration: 150, opacity: 0 }));
    let chipTransitionOut = prop($$props, "chipTransitionOut", 8, scale);
    let chipTransitionOutParams = prop($$props, "chipTransitionOutParams", 24, () => ({ duration: 150, opacity: 0 }));
    const cBase = "textarea cursor-pointer";
    const cChipWrapper = "space-y-4";
    const cChipList = "flex flex-wrap gap-2";
    const cInputField = "unstyled bg-transparent border-0 !ring-0 p-0 w-full";
    let inputValid = mutable_state(true);
    let chipValues = mutable_state(((_a = value()) == null ? undefined : _a.map((val) => {
      return { val, id: Math.random() };
    })) || []);
    function resetFormHandler() {
      value([]);
    }
    let selectElement = mutable_state();
    onMount(() => {
      if (!get$1(selectElement).form) return;
      const externalForm = get$1(selectElement).form;
      externalForm.addEventListener("reset", resetFormHandler);
      return () => {
        externalForm.removeEventListener("reset", resetFormHandler);
      };
    });
    function validateCustom(chip) {
      return validation() === undefined || validation()(chip);
    }
    function validateCount() {
      return max() === -1 || value().length < max();
    }
    function validateLength(chip) {
      return (minlength() === -1 || chip.length >= minlength()) && (maxlength() === -1 || chip.length <= maxlength());
    }
    function validateWhiteList(chip) {
      return whitelist().length === 0 || whitelist().includes(chip);
    }
    function validateDuplicates(chip) {
      return allowDuplicates() || !value().includes(chip);
    }
    function validate(chip = "") {
      if (!chip && !input()) return false;
      chip = chip !== "" ? chip.trim() : input().trim();
      return validateCustom(chip) && validateCount() && validateLength(chip) && validateWhiteList(chip) && validateDuplicates(chip);
    }
    function addChipCommon(chip) {
      chip = allowUpperCase() ? chip : chip.toLowerCase();
      value().push(chip);
      value(value());
      get$1(chipValues).push({ val: chip, id: Math.random() });
      set(chipValues, get$1(chipValues));
    }
    function removeChipCommon(chip) {
      let chipIndex = value().indexOf(chip);
      value().splice(chipIndex, 1);
      value(value());
      get$1(chipValues).splice(chipIndex, 1);
      set(chipValues, get$1(chipValues));
    }
    function onKeyHandler(event2) {
      if (event2.key !== "Enter") return;
      event2.preventDefault();
      set(inputValid, validate());
      if (get$1(inputValid) === false) {
        dispatch("invalid", { event: event2, input: input() });
        return;
      }
      addChipCommon(input());
      dispatch("add", {
        event: event2,
        chipIndex: value().length - 1,
        chipValue: input()
      });
      input("");
    }
    function removeChipInternally(event2, chipIndex, chipValue) {
      if ($$restProps.disabled) return;
      removeChipCommon(chipValue);
      dispatch("remove", { event: event2, chipIndex, chipValue });
    }
    function addChip(chip) {
      set(inputValid, validate(chip));
      if (get$1(inputValid) === false) {
        dispatch("invalidManually", { input: chip });
        return;
      }
      addChipCommon(chip);
      dispatch("addManually", {
        chipIndex: value().length - 1,
        chipValue: chip
      });
    }
    function removeChip(chip) {
      if ($$restProps.disabled) return;
      removeChipCommon(chip);
      dispatch("removeManually", { chipValue: chip });
    }
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    legacy_pre_effect(
      () => (get$1(inputValid), deep_read_state(invalid())),
      () => {
        set(classesInvalid, get$1(inputValid) === false ? invalid() : "");
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(padding()), deep_read_state(rounded()), deep_read_state($$sanitized_props), get$1(classesInvalid)),
      () => {
        set(classesBase, `${cBase} ${padding()} ${rounded()} ${$$sanitized_props.class ?? ""} ${get$1(classesInvalid)}`);
      }
    );
    legacy_pre_effect(() => deep_read_state(regionChipWrapper()), () => {
      set(classesChipWrapper, `${cChipWrapper} ${regionChipWrapper()}`);
    });
    legacy_pre_effect(() => deep_read_state(regionChipList()), () => {
      set(classesChipList, `${cChipList} ${regionChipList()}`);
    });
    legacy_pre_effect(() => deep_read_state(regionInput()), () => {
      set(classesInput, `${cInputField} ${regionInput()}`);
    });
    legacy_pre_effect(
      () => (get$1(chipValues), deep_read_state(value())),
      () => {
        var _a2;
        set(chipValues, ((_a2 = value()) == null ? undefined : _a2.map((val, i) => {
          var _a3;
          if (((_a3 = get$1(chipValues)[i]) == null ? undefined : _a3.val) === val) return get$1(chipValues)[i];
          return { id: Math.random(), val };
        })) || []);
      }
    );
    legacy_pre_effect_reset();
    init();
    var div = root$i();
    var div_1 = child(div);
    var select = child(div_1);
    template_effect(() => {
      value();
      invalidate_inner_signals(() => {
        get$1(selectElement);
        name();
        required();
        label();
      });
    });
    each(select, 5, value, index, ($$anchor2, option) => {
      var option_1 = root_1$f();
      var option_1_value = {};
      var text2 = child(option_1, true);
      reset(option_1);
      template_effect(() => {
        if (option_1_value !== (option_1_value = get$1(option))) {
          option_1.value = null == (option_1.__value = get$1(option)) ? "" : get$1(option);
        }
        set_text(text2, get$1(option));
      });
      append($$anchor2, option_1);
    });
    reset(select);
    bind_this(select, ($$value) => set(selectElement, $$value), () => get$1(selectElement));
    reset(div_1);
    var div_2 = sibling(div_1, 2);
    var input_1 = child(div_2);
    remove_input_defaults(input_1);
    const spread_with_call = /* @__PURE__ */ derived_safe_equal(prunedRestProps);
    let attributes;
    var node = sibling(input_1, 2);
    {
      var consequent = ($$anchor2) => {
        var div_3 = root_2$8();
        each(div_3, 15, () => get$1(chipValues), ({ id, val }) => id, ($$anchor3, $$item, i) => {
          let val = () => get$1($$item).val;
          var div_4 = root_3$9();
          var button = child(div_4);
          var span = child(button);
          var text_1 = child(span, true);
          reset(span);
          next(2);
          reset(button);
          reset(div_4);
          template_effect(() => {
            set_class(button, `chip ${chips() ?? ""}`);
            set_text(text_1, val());
          });
          event("click", button, (e) => removeChipInternally(e, get$1(i), val()));
          event("click", button, function($$arg) {
            bubble_event.call(this, $$props, $$arg);
          });
          event("keypress", button, function($$arg) {
            bubble_event.call(this, $$props, $$arg);
          });
          event("keydown", button, function($$arg) {
            bubble_event.call(this, $$props, $$arg);
          });
          event("keyup", button, function($$arg) {
            bubble_event.call(this, $$props, $$arg);
          });
          transition(1, button, () => dynamicTransition, () => ({
            transition: chipTransitionIn(),
            params: chipTransitionInParams(),
            enabled: transitions()
          }));
          transition(2, button, () => dynamicTransition, () => ({
            transition: chipTransitionOut(),
            params: chipTransitionOutParams(),
            enabled: transitions()
          }));
          animation(div_4, () => flip, () => ({ duration: duration() }));
          append($$anchor3, div_4);
        });
        reset(div_3);
        template_effect(() => set_class(div_3, `input-chip-list ${get$1(classesChipList) ?? ""}`));
        transition(1, div_3, () => dynamicTransition, () => ({
          transition: listTransitionIn(),
          params: listTransitionInParams(),
          enabled: transitions()
        }));
        transition(2, div_3, () => dynamicTransition, () => ({
          transition: listTransitionOut(),
          params: listTransitionOutParams(),
          enabled: transitions()
        }));
        append($$anchor2, div_3);
      };
      if_block(node, ($$render) => {
        if (get$1(chipValues).length) $$render(consequent);
      });
    }
    reset(div_2);
    reset(div);
    template_effect(() => {
      set_class(div, `input-chip ${get$1(classesBase) ?? ""}`);
      toggle_class(div, "opacity-50", $$restProps.disabled);
      set_attribute(select, "name", name());
      select.required = required();
      set_attribute(select, "aria-label", label());
      set_class(div_2, `input-chip-wrapper ${get$1(classesChipWrapper) ?? ""}`);
      attributes = set_attributes(input_1, attributes, {
        type: "text",
        placeholder: $$restProps.placeholder ?? "Enter values...",
        class: `input-chip-field ${get$1(classesInput) ?? ""}`,
        disabled: $$restProps.disabled,
        ...get$1(spread_with_call)
      });
    });
    bind_select_value(select, value);
    bind_value(input_1, input);
    event("keydown", input_1, onKeyHandler);
    event("input", input_1, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("focus", input_1, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("blur", input_1, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    append($$anchor, div);
    bind_prop($$props, "addChip", addChip);
    bind_prop($$props, "removeChip", removeChip);
    var $$pop = pop({ addChip, removeChip });
    $$cleanup();
    return $$pop;
  }
  var root$h = /* @__PURE__ */ template(`<div role="listbox" data-testid="listbox"><!></div>`);
  function ListBox($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    push($$props, false);
    const classesBase = mutable_state();
    let multiple = prop($$props, "multiple", 8, false);
    let disabled = prop($$props, "disabled", 8, false);
    let spacing = prop($$props, "spacing", 8, "space-y-1");
    let rounded = prop($$props, "rounded", 8, "rounded-token");
    let active = prop($$props, "active", 8, "variant-filled");
    let hover = prop($$props, "hover", 8, "hover:variant-soft");
    let padding = prop($$props, "padding", 8, "px-4 py-2");
    let regionLead = prop($$props, "regionLead", 8, "");
    let regionDefault = prop($$props, "regionDefault", 8, "");
    let regionTrail = prop($$props, "regionTrail", 8, "");
    let labelledby = prop($$props, "labelledby", 8, "");
    setContext("disabled", disabled());
    setContext("multiple", multiple());
    setContext("rounded", rounded());
    setContext("active", active());
    setContext("hover", hover());
    setContext("padding", padding());
    setContext("regionLead", regionLead());
    setContext("regionDefault", regionDefault());
    setContext("regionTrail", regionTrail());
    const cBase = "";
    legacy_pre_effect(
      () => (deep_read_state(spacing()), deep_read_state(rounded()), deep_read_state($$sanitized_props)),
      () => {
        set(classesBase, `${cBase} ${spacing()} ${rounded()} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect_reset();
    init();
    var div = root$h();
    var node = child(div);
    slot(node, $$props, "default", {}, null);
    reset(div);
    template_effect(() => {
      set_class(div, `listbox ${get$1(classesBase) ?? ""}`);
      set_attribute(div, "aria-labelledby", labelledby());
    });
    append($$anchor, div);
    pop();
  }
  var root_1$e = /* @__PURE__ */ template(`<input type="checkbox" tabindex="-1">`);
  var root_2$7 = /* @__PURE__ */ template(`<input type="radio" tabindex="-1">`);
  var root_3$8 = /* @__PURE__ */ template(`<div><!></div>`);
  var root_4$5 = /* @__PURE__ */ template(`<div><!></div>`);
  var root$g = /* @__PURE__ */ template(`<label><div data-testid="listbox-item" role="option" tabindex="0"><div class="h-0 w-0 overflow-hidden"><!></div> <div><!> <div><!></div> <!></div></div></label>`);
  function ListBoxItem($$anchor, $$props) {
    const $$slots = sanitize_slots($$props);
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    push($$props, false);
    const selected = mutable_state();
    const classesActive = mutable_state();
    const classesDisabled = mutable_state();
    const classesBase = mutable_state();
    const classesLabel = mutable_state();
    const classesRegionLead = mutable_state();
    const classesRegionDefault = mutable_state();
    const classesRegionTrail = mutable_state();
    const binding_group = [];
    let group = prop($$props, "group", 12);
    let name = prop($$props, "name", 8);
    let value = prop($$props, "value", 8);
    let disabled = prop($$props, "disabled", 24, () => getContext("disabled"));
    let multiple = prop($$props, "multiple", 24, () => getContext("multiple"));
    let rounded = prop($$props, "rounded", 24, () => getContext("rounded"));
    let active = prop($$props, "active", 24, () => getContext("active"));
    let hover = prop($$props, "hover", 24, () => getContext("hover"));
    let padding = prop($$props, "padding", 24, () => getContext("padding"));
    let regionLead = prop($$props, "regionLead", 24, () => getContext("regionLead"));
    let regionDefault = prop($$props, "regionDefault", 24, () => getContext("regionDefault"));
    let regionTrail = prop($$props, "regionTrail", 24, () => getContext("regionTrail"));
    const cBase = "cursor-pointer -outline-offset-[3px]";
    const cDisabled = "opacity-50 !cursor-default";
    const cLabel = "flex items-center space-x-4";
    let checked = mutable_state();
    let elemInput = mutable_state();
    function areDeeplyEqual(param1, param2) {
      if (param1 === param2) return true;
      if (!(param1 instanceof Object) || !(param2 instanceof Object)) return false;
      const keys1 = Object.keys(param1);
      const keys2 = Object.keys(param2);
      if (keys1.length !== keys2.length) return false;
      for (const key of keys1) {
        const value1 = param1[key];
        const value2 = param2[key];
        if (!areDeeplyEqual(value1, value2)) return false;
      }
      return true;
    }
    function updateCheckbox(group2) {
      set(checked, group2.indexOf(value()) >= 0);
    }
    function updateGroup(checked2) {
      const index2 = group().indexOf(value());
      if (checked2) {
        if (index2 < 0) {
          group().push(value());
          group(group());
        }
      } else {
        if (index2 >= 0) {
          group().splice(index2, 1);
          group(group());
        }
      }
    }
    function onKeyDown(event2) {
      if (["Enter", "Space"].includes(event2.code)) {
        event2.preventDefault();
        get$1(elemInput).click();
      }
    }
    const cRegionLead = "";
    const cRegionDefault = "flex-1";
    const cRegionTrail = "";
    legacy_pre_effect(
      () => (deep_read_state(multiple()), deep_read_state(group())),
      () => {
        if (multiple()) updateCheckbox(group());
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(multiple()), get$1(checked)),
      () => {
        if (multiple()) updateGroup(get$1(checked));
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(multiple()), deep_read_state(group()), deep_read_state(value())),
      () => {
        set(selected, multiple() ? group().some((groupVal) => areDeeplyEqual(value(), groupVal)) : areDeeplyEqual(group(), value()));
      }
    );
    legacy_pre_effect(
      () => (get$1(selected), deep_read_state(active()), deep_read_state(disabled()), deep_read_state(hover())),
      () => {
        set(classesActive, get$1(selected) ? active() : !disabled() ? hover() : "");
      }
    );
    legacy_pre_effect(() => deep_read_state(disabled()), () => {
      set(classesDisabled, disabled() ? cDisabled : "");
    });
    legacy_pre_effect(
      () => (get$1(classesDisabled), deep_read_state(rounded()), deep_read_state(padding()), get$1(classesActive), deep_read_state($$sanitized_props)),
      () => {
        set(classesBase, `${cBase} ${get$1(classesDisabled)} ${rounded()} ${padding()} ${get$1(classesActive)} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect(() => {
    }, () => {
      set(classesLabel, `${cLabel}`);
    });
    legacy_pre_effect(() => deep_read_state(regionLead()), () => {
      set(classesRegionLead, `${cRegionLead} ${regionLead()}`);
    });
    legacy_pre_effect(() => deep_read_state(regionDefault()), () => {
      set(classesRegionDefault, `${cRegionDefault} ${regionDefault()}`);
    });
    legacy_pre_effect(() => deep_read_state(regionTrail()), () => {
      set(classesRegionTrail, `${cRegionTrail} ${regionTrail()}`);
    });
    legacy_pre_effect_reset();
    init();
    var label = root$g();
    var div = child(label);
    var div_1 = child(div);
    var node = child(div_1);
    {
      var consequent = ($$anchor2) => {
        var input = root_1$e();
        remove_input_defaults(input);
        var input_value;
        bind_this(input, ($$value) => set(elemInput, $$value), () => get$1(elemInput));
        template_effect(() => {
          input.disabled = disabled();
          set_attribute(input, "name", name());
          if (input_value !== (input_value = value())) {
            input.value = null == (input.__value = value()) ? "" : value();
          }
        });
        bind_checked(input, () => get$1(checked), ($$value) => set(checked, $$value));
        event("click", input, function($$arg) {
          bubble_event.call(this, $$props, $$arg);
        });
        event("change", input, function($$arg) {
          bubble_event.call(this, $$props, $$arg);
        });
        append($$anchor2, input);
      };
      var alternate = ($$anchor2) => {
        var input_1 = root_2$7();
        remove_input_defaults(input_1);
        var input_1_value;
        bind_this(input_1, ($$value) => set(elemInput, $$value), () => get$1(elemInput));
        template_effect(() => {
          input_1.disabled = disabled();
          set_attribute(input_1, "name", name());
          if (input_1_value !== (input_1_value = value())) {
            input_1.value = null == (input_1.__value = value()) ? "" : value();
          }
        });
        bind_group(
          binding_group,
          [],
          input_1,
          () => {
            value();
            return group();
          },
          group
        );
        event("click", input_1, function($$arg) {
          bubble_event.call(this, $$props, $$arg);
        });
        event("change", input_1, function($$arg) {
          bubble_event.call(this, $$props, $$arg);
        });
        append($$anchor2, input_1);
      };
      if_block(node, ($$render) => {
        if (multiple()) $$render(consequent);
        else $$render(alternate, false);
      });
    }
    reset(div_1);
    var div_2 = sibling(div_1, 2);
    var node_1 = child(div_2);
    {
      var consequent_1 = ($$anchor2) => {
        var div_3 = root_3$8();
        var node_2 = child(div_3);
        slot(node_2, $$props, "lead", {}, null);
        reset(div_3);
        template_effect(() => set_class(div_3, `listbox-label-lead ${get$1(classesRegionLead) ?? ""}`));
        append($$anchor2, div_3);
      };
      if_block(node_1, ($$render) => {
        if ($$slots.lead) $$render(consequent_1);
      });
    }
    var div_4 = sibling(node_1, 2);
    var node_3 = child(div_4);
    slot(node_3, $$props, "default", {}, null);
    reset(div_4);
    var node_4 = sibling(div_4, 2);
    {
      var consequent_2 = ($$anchor2) => {
        var div_5 = root_4$5();
        var node_5 = child(div_5);
        slot(node_5, $$props, "trail", {}, null);
        reset(div_5);
        template_effect(() => set_class(div_5, `listbox-label-trail ${get$1(classesRegionTrail) ?? ""}`));
        append($$anchor2, div_5);
      };
      if_block(node_4, ($$render) => {
        if ($$slots.trail) $$render(consequent_2);
      });
    }
    reset(div_2);
    reset(div);
    reset(label);
    template_effect(() => {
      set_class(div, `listbox-item ${get$1(classesBase) ?? ""}`);
      set_attribute(div, "aria-selected", get$1(selected));
      set_class(div_2, `listbox-label ${get$1(classesLabel) ?? ""}`);
      set_class(div_4, `listbox-label-content ${get$1(classesRegionDefault) ?? ""}`);
    });
    event("keydown", div, onKeyDown);
    event("keydown", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keyup", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keypress", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    append($$anchor, label);
    pop();
  }
  var root$f = /* @__PURE__ */ template(`<div data-testid="progress-bar" role="progressbar"><div></div></div>`);
  function ProgressBar($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    push($$props, false);
    const fillPercent = mutable_state();
    const indeterminate = mutable_state();
    const classesIndeterminate = mutable_state();
    const classesTrack = mutable_state();
    const classesMeter = mutable_state();
    let value = prop($$props, "value", 24, () => undefined);
    let min = prop($$props, "min", 8, 0);
    let max = prop($$props, "max", 8, 100);
    let height = prop($$props, "height", 8, "h-2");
    let rounded = prop($$props, "rounded", 8, "rounded-token");
    let transition2 = prop($$props, "transition", 8, "transition-[width]");
    let animIndeterminate = prop($$props, "animIndeterminate", 8, "anim-indeterminate");
    let meter = prop($$props, "meter", 8, "bg-surface-900-50-token");
    let track = prop($$props, "track", 8, "bg-surface-200-700-token");
    let labelledby = prop($$props, "labelledby", 8, "");
    const cTrack = "w-full overflow-hidden";
    const cMeter = "h-full";
    legacy_pre_effect(
      () => (deep_read_state(value()), deep_read_state(min()), deep_read_state(max())),
      () => {
        set(fillPercent, value() ? 100 * (value() - min()) / (max() - min()) : 0);
      }
    );
    legacy_pre_effect(() => deep_read_state(value()), () => {
      set(indeterminate, value() === undefined || value() < 0);
    });
    legacy_pre_effect(
      () => (get$1(indeterminate), deep_read_state(animIndeterminate())),
      () => {
        set(classesIndeterminate, get$1(indeterminate) ? animIndeterminate() : "");
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(track()), deep_read_state(height()), deep_read_state(rounded()), deep_read_state($$sanitized_props)),
      () => {
        set(classesTrack, `${cTrack} ${track()} ${height()} ${rounded()} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(meter()), deep_read_state(rounded()), get$1(classesIndeterminate), deep_read_state(transition2())),
      () => {
        set(classesMeter, `${cMeter} ${meter()} ${rounded()} ${get$1(classesIndeterminate)} ${transition2()}`);
      }
    );
    legacy_pre_effect_reset();
    init();
    var div = root$f();
    var div_1 = child(div);
    reset(div);
    template_effect(() => {
      set_class(div, `progress-bar ${get$1(classesTrack) ?? ""} svelte-12wvf64`);
      set_attribute(div, "aria-labelledby", labelledby());
      set_attribute(div, "aria-valuenow", value());
      set_attribute(div, "aria-valuemin", min());
      set_attribute(div, "aria-valuemax", max() - min());
      set_class(div_1, `progress-bar-meter ${get$1(classesMeter) ?? ""} svelte-12wvf64`);
      set_style(div_1, "width", `${(get$1(indeterminate) ? 100 : get$1(fillPercent)) ?? ""}%`);
    });
    append($$anchor, div);
    pop();
  }
  var root_1$d = /* @__PURE__ */ ns_template(`<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-weight="bold"><!></text>`);
  var root$e = /* @__PURE__ */ template(`<figure data-testid="progress-radial" role="meter"><svg class="rounded-full"><circle cx="50%" cy="50%"></circle><circle cx="50%" cy="50%"></circle><!></svg></figure>`);
  function ProgressRadial($$anchor, $$props) {
    const $$slots = sanitize_slots($$props);
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    push($$props, false);
    const classesBase = mutable_state();
    let value = prop($$props, "value", 24, () => undefined);
    let stroke = prop($$props, "stroke", 8, 40);
    let font = prop($$props, "font", 8, 56);
    let strokeLinecap = prop($$props, "strokeLinecap", 8, "butt");
    let transition2 = prop($$props, "transition", 8, "transition-[stroke-dashoffset]");
    let width = prop($$props, "width", 8, "w-36");
    let meter = prop($$props, "meter", 8, "stroke-surface-900 dark:stroke-surface-50");
    let track = prop($$props, "track", 8, "stroke-surface-500/30");
    let fill = prop($$props, "fill", 8, "fill-token");
    let labelledby = prop($$props, "labelledby", 8, "");
    const cBase = "progress-radial relative overflow-hidden";
    const cBaseTrack = "fill-transparent";
    const cBaseMeter = "fill-transparent -rotate-90 origin-[50%_50%]";
    const baseSize = 512;
    const radius = baseSize / 2 - stroke() / 2;
    let circumference = mutable_state(radius);
    let dashoffset = mutable_state();
    function setProgress(percent) {
      set(circumference, radius * 2 * Math.PI);
      set(dashoffset, get$1(circumference) - percent / 100 * get$1(circumference));
    }
    setProgress(0);
    afterUpdate(() => {
      setProgress(value() === undefined ? 25 : value());
    });
    legacy_pre_effect(
      () => (deep_read_state(width()), deep_read_state($$sanitized_props)),
      () => {
        set(classesBase, `${cBase} ${width()} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect_reset();
    init();
    var figure = root$e();
    set_attribute(figure, "aria-valuemin", 0);
    set_attribute(figure, "aria-valuemax", 100);
    var svg = child(figure);
    set_attribute(svg, "viewBox", `0 0 ${baseSize} ${baseSize}`);
    var circle = child(svg);
    set_attribute(circle, "r", radius);
    var circle_1 = sibling(circle);
    set_attribute(circle_1, "r", radius);
    var node = sibling(circle_1);
    {
      var consequent = ($$anchor2) => {
        var text2 = root_1$d();
        var node_1 = child(text2);
        slot(node_1, $$props, "default", {}, null);
        reset(text2);
        template_effect(() => {
          set_attribute(text2, "font-size", font());
          set_svg_class(text2, `progress-radial-text ${fill() ?? ""}`);
        });
        append($$anchor2, text2);
      };
      if_block(node, ($$render) => {
        if (value() != undefined && value() >= 0 && $$slots.default) $$render(consequent);
      });
    }
    reset(svg);
    reset(figure);
    template_effect(() => {
      set_class(figure, `progress-radial ${get$1(classesBase) ?? ""}`);
      set_attribute(figure, "aria-labelledby", labelledby());
      set_attribute(figure, "aria-valuenow", value() || 0);
      set_attribute(figure, "aria-valuetext", value() ? `${value()}%` : "Indeterminate Spinner");
      toggle_class(svg, "animate-spin", value() === undefined);
      set_svg_class(circle, `progress-radial-track ${cBaseTrack} ${track() ?? ""}`);
      set_attribute(circle, "stroke-width", stroke());
      set_svg_class(circle_1, `progress-radial-meter ${cBaseMeter} ${meter() ?? ""} ${transition2() ?? ""}`);
      set_attribute(circle_1, "stroke-width", stroke());
      set_attribute(circle_1, "stroke-linecap", strokeLinecap());
      set_style(circle_1, "stroke-dasharray", `${get$1(circumference) ?? ""}
			${get$1(circumference) ?? ""}`);
      set_style(circle_1, "stroke-dashoffset", get$1(dashoffset));
    });
    append($$anchor, figure);
    pop();
  }
  var root$d = /* @__PURE__ */ template(`<div data-testid="radio-group" role="radiogroup"><!></div>`);
  function RadioGroup($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    push($$props, false);
    const classesBase = mutable_state();
    let display = prop($$props, "display", 8, "inline-flex");
    let flexDirection = prop($$props, "flexDirection", 8, "flex-row");
    let gap = prop($$props, "gap", 8, "gap-1");
    let background = prop($$props, "background", 8, "bg-surface-200-700-token");
    let border = prop($$props, "border", 8, "border-token border-surface-400-500-token");
    let rounded = prop($$props, "rounded", 8, "rounded-token");
    let padding = prop($$props, "padding", 8, "px-4 py-1");
    let active = prop($$props, "active", 8, "variant-filled");
    let hover = prop($$props, "hover", 8, "hover:variant-soft");
    let color = prop($$props, "color", 8, "");
    let fill = prop($$props, "fill", 8, "");
    let regionLabel = prop($$props, "regionLabel", 8, "");
    let labelledby = prop($$props, "labelledby", 8, "");
    setContext("rounded", rounded());
    setContext("padding", padding());
    setContext("active", active());
    setContext("hover", hover());
    setContext("color", color());
    setContext("fill", fill());
    setContext("regionLabel", regionLabel());
    const cBase = "p-1";
    legacy_pre_effect(
      () => (deep_read_state(display()), deep_read_state(flexDirection()), deep_read_state(gap()), deep_read_state(background()), deep_read_state(border()), deep_read_state(rounded()), deep_read_state($$sanitized_props)),
      () => {
        set(classesBase, `${cBase} ${display()} ${flexDirection()} ${gap()} ${background()} ${border()} ${rounded()} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect_reset();
    init();
    var div = root$d();
    var node = child(div);
    slot(node, $$props, "default", {}, null);
    reset(div);
    template_effect(() => {
      set_class(div, `radio-group ${get$1(classesBase) ?? ""}`);
      set_attribute(div, "aria-labelledby", labelledby());
    });
    append($$anchor, div);
    pop();
  }
  var root$c = /* @__PURE__ */ template(`<label><div data-testid="radio-item" role="radio" tabindex="0"><div class="h-0 w-0 overflow-hidden"><input></div> <!></div></label>`);
  function RadioItem($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "group",
      "name",
      "value",
      "title",
      "label",
      "rounded",
      "padding",
      "active",
      "hover",
      "color",
      "fill",
      "regionLabel"
    ]);
    push($$props, false);
    const checked = mutable_state();
    const classesActive = mutable_state();
    const classesDisabled = mutable_state();
    const classsBase = mutable_state();
    const classesWrapper = mutable_state();
    const binding_group = [];
    let group = prop($$props, "group", 12);
    let name = prop($$props, "name", 8);
    let value = prop($$props, "value", 8);
    let title = prop($$props, "title", 8, "");
    let label = prop($$props, "label", 8, "");
    let rounded = prop($$props, "rounded", 24, () => getContext("rounded"));
    let padding = prop($$props, "padding", 24, () => getContext("padding"));
    let active = prop($$props, "active", 24, () => getContext("active"));
    let hover = prop($$props, "hover", 24, () => getContext("hover"));
    let color = prop($$props, "color", 24, () => getContext("color"));
    let fill = prop($$props, "fill", 24, () => getContext("fill"));
    let regionLabel = prop($$props, "regionLabel", 24, () => getContext("regionLabel"));
    const cBase = "flex-auto";
    const cWrapper = "text-base text-center cursor-pointer";
    const cDisabled = "opacity-50 cursor-not-allowed";
    let elemInput = mutable_state();
    function onKeyDown(event2) {
      if (["Enter", "Space"].includes(event2.code)) {
        event2.preventDefault();
        get$1(elemInput).click();
      }
    }
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    legacy_pre_effect(
      () => (deep_read_state(value()), deep_read_state(group())),
      () => {
        set(checked, value() === group());
      }
    );
    legacy_pre_effect(
      () => (get$1(checked), deep_read_state(active()), deep_read_state(color()), deep_read_state(fill()), deep_read_state(hover())),
      () => {
        set(classesActive, get$1(checked) ? `${active()} ${color()} ${fill()}` : hover());
      }
    );
    legacy_pre_effect(() => deep_read_state($$sanitized_props), () => {
      set(classesDisabled, $$sanitized_props.disabled ? cDisabled : "");
    });
    legacy_pre_effect(() => {
    }, () => {
      set(classsBase, `${cBase}`);
    });
    legacy_pre_effect(
      () => (deep_read_state(padding()), deep_read_state(rounded()), get$1(classesActive), get$1(classesDisabled), deep_read_state($$sanitized_props)),
      () => {
        set(classesWrapper, `${cWrapper} ${padding()} ${rounded()} ${get$1(classesActive)} ${get$1(classesDisabled)} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect_reset();
    init();
    var label_1 = root$c();
    var div = child(label_1);
    var div_1 = child(div);
    var input = child(div_1);
    remove_input_defaults(input);
    const spread_with_call = /* @__PURE__ */ derived_safe_equal(prunedRestProps);
    let attributes;
    bind_this(input, ($$value) => set(elemInput, $$value), () => get$1(elemInput));
    reset(div_1);
    var node = sibling(div_1, 2);
    slot(node, $$props, "default", {}, null);
    reset(div);
    reset(label_1);
    template_effect(() => {
      set_class(label_1, `radio-label ${get$1(classsBase) ?? ""} ${regionLabel() ?? ""}`);
      set_class(div, `radio-item ${get$1(classesWrapper) ?? ""}`);
      set_attribute(div, "aria-checked", get$1(checked));
      set_attribute(div, "aria-label", label());
      set_attribute(div, "title", title());
      attributes = set_attributes(input, attributes, {
        type: "radio",
        name: name(),
        value: value(),
        ...get$1(spread_with_call),
        tabindex: "-1"
      });
    });
    bind_group(
      binding_group,
      [],
      input,
      () => {
        value();
        return group();
      },
      group
    );
    event("click", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("change", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keydown", div, onKeyDown);
    event("keydown", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keyup", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keypress", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    append($$anchor, label_1);
    pop();
  }
  var root_1$c = /* @__PURE__ */ template(`<label><!></label>`);
  var root_3$7 = /* @__PURE__ */ template(`<option></option>`);
  var root_2$6 = /* @__PURE__ */ template(`<datalist class="range-slider-ticks"></datalist>`);
  var root_4$4 = /* @__PURE__ */ template(`<div class="range-slider-trail"><!></div>`);
  var root$b = /* @__PURE__ */ template(`<div data-testid="range-slider"><!> <div><input> <!></div> <!></div>`);
  function RangeSlider($$anchor, $$props) {
    const $$slots = sanitize_slots($$props);
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "name",
      "id",
      "value",
      "min",
      "max",
      "step",
      "ticked",
      "accent",
      "label"
    ]);
    push($$props, false);
    const classesBase = mutable_state();
    const classesInput = mutable_state();
    let name = prop($$props, "name", 8);
    let id = prop($$props, "id", 24, () => String(Math.random()));
    let value = prop($$props, "value", 12, 0);
    let min = prop($$props, "min", 8, 0);
    let max = prop($$props, "max", 8, 100);
    let step = prop($$props, "step", 8, 1);
    let ticked = prop($$props, "ticked", 8, false);
    let accent = prop($$props, "accent", 8, "accent-surface-900 dark:accent-surface-50");
    let label = prop($$props, "label", 8, "");
    const cBase = "space-y-2";
    const cBaseLabel = "";
    const cBaseContent = "flex justify-center py-2";
    const cBaseInput = "w-full h-2";
    let tickmarks = mutable_state();
    function setTicks() {
      if (ticked() == false) return;
      set(tickmarks, Array.from({ length: max() - min() + 1 }, (_, i) => i + min()));
    }
    if (ticked()) setTicks();
    afterUpdate(() => {
      setTicks();
    });
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    legacy_pre_effect(() => deep_read_state($$sanitized_props), () => {
      set(classesBase, `${cBase} ${$$sanitized_props.class ?? ""}`);
    });
    legacy_pre_effect(() => deep_read_state(accent()), () => {
      set(classesInput, `${cBaseInput} ${accent()}`);
    });
    legacy_pre_effect_reset();
    init();
    var div = root$b();
    var node = child(div);
    {
      var consequent = ($$anchor2) => {
        var label_1 = root_1$c();
        set_class(label_1, `range-slider-label ${cBaseLabel}`);
        var node_1 = child(label_1);
        slot(node_1, $$props, "default", {}, null);
        reset(label_1);
        template_effect(() => set_attribute(label_1, "for", id()));
        append($$anchor2, label_1);
      };
      if_block(node, ($$render) => {
        if ($$slots.default) $$render(consequent);
      });
    }
    var div_1 = sibling(node, 2);
    set_class(div_1, `range-content ${cBaseContent}`);
    var input = child(div_1);
    remove_input_defaults(input);
    const spread_with_call = /* @__PURE__ */ derived_safe_equal(prunedRestProps);
    let attributes;
    var node_2 = sibling(input, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var datalist = root_2$6();
        each(datalist, 5, () => get$1(tickmarks), index, ($$anchor3, tm) => {
          var option = root_3$7();
          var option_value = {};
          template_effect(() => {
            if (option_value !== (option_value = get$1(tm))) {
              option.value = null == (option.__value = get$1(tm)) ? "" : get$1(tm);
            }
            set_attribute(option, "label", get$1(tm));
          });
          append($$anchor3, option);
        });
        reset(datalist);
        template_effect(() => set_attribute(datalist, "id", `tickmarks-${id() ?? ""}`));
        append($$anchor2, datalist);
      };
      if_block(node_2, ($$render) => {
        if (ticked() && get$1(tickmarks) && get$1(tickmarks).length) $$render(consequent_1);
      });
    }
    reset(div_1);
    var node_3 = sibling(div_1, 2);
    {
      var consequent_2 = ($$anchor2) => {
        var div_2 = root_4$4();
        var node_4 = child(div_2);
        slot(node_4, $$props, "trail", {}, null);
        reset(div_2);
        append($$anchor2, div_2);
      };
      if_block(node_3, ($$render) => {
        if ($$slots.trail) $$render(consequent_2);
      });
    }
    reset(div);
    template_effect(() => {
      set_class(div, `range-slider ${get$1(classesBase) ?? ""}`);
      attributes = set_attributes(input, attributes, {
        type: "range",
        id: id(),
        name: name(),
        class: `range-slider-input ${get$1(classesInput) ?? ""}`,
        list: `tickmarks-${id() ?? ""}`,
        "aria-label": label(),
        min: min(),
        max: max(),
        step: step(),
        ...get$1(spread_with_call)
      });
    });
    bind_value(input, value);
    event("click", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("change", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("blur", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    append($$anchor, div);
    pop();
  }
  var root_1$b = /* @__PURE__ */ template(`<div class="slide-toggle-text ml-3"><!></div>`);
  var root$a = /* @__PURE__ */ template(`<div data-testid="slide-toggle" role="switch" tabindex="0"><label><input> <div><div></div></div> <!></label></div>`);
  function SlideToggle($$anchor, $$props) {
    const $$slots = sanitize_slots($$props);
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "name",
      "checked",
      "size",
      "background",
      "active",
      "border",
      "rounded",
      "label"
    ]);
    push($$props, false);
    const cTrackActive = mutable_state();
    const cThumbBackground = mutable_state();
    const cThumbPos = mutable_state();
    const classesDisabled = mutable_state();
    const classesBase = mutable_state();
    const classesLabel = mutable_state();
    const classesTrack = mutable_state();
    const classesThumb = mutable_state();
    const dispatch = createEventDispatcher();
    let name = prop($$props, "name", 8);
    let checked = prop($$props, "checked", 12, false);
    let size = prop($$props, "size", 8, "md");
    let background = prop($$props, "background", 8, "bg-surface-400 dark:bg-surface-700");
    let active = prop($$props, "active", 8, "bg-surface-900 dark:bg-surface-300");
    let border = prop($$props, "border", 8, "");
    let rounded = prop($$props, "rounded", 8, "rounded-full");
    let label = prop($$props, "label", 8, "");
    const cBase = "inline-block";
    const cLabel = "unstyled flex items-center";
    const cTrack = "flex transition-all duration-[200ms] cursor-pointer";
    const cThumb = "w-[50%] h-full scale-[0.8] transition-all duration-[200ms] shadow";
    let trackSize = mutable_state();
    switch (size()) {
      case "sm":
        set(trackSize, "w-12 h-6");
        break;
      case "lg":
        set(trackSize, "w-20 h-10");
        break;
      default:
        set(trackSize, "w-16 h-8");
    }
    function onKeyDown(event2) {
      if (["Enter", "Space"].includes(event2.code)) {
        event2.preventDefault();
        dispatch("keyup", event2);
        const inputElem = event2.currentTarget.firstChild;
        inputElem.click();
      }
    }
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    legacy_pre_effect(
      () => (deep_read_state(checked()), deep_read_state(active()), deep_read_state(background())),
      () => {
        set(cTrackActive, checked() ? active() : `${background()} cursor-pointer`);
      }
    );
    legacy_pre_effect(() => deep_read_state(checked()), () => {
      set(cThumbBackground, checked() ? "bg-white/75" : "bg-white");
    });
    legacy_pre_effect(() => deep_read_state(checked()), () => {
      set(cThumbPos, checked() ? "translate-x-full" : "");
    });
    legacy_pre_effect(() => deep_read_state($$sanitized_props), () => {
      set(classesDisabled, $$sanitized_props.disabled === true ? "opacity-50" : "hover:brightness-[105%] dark:hover:brightness-110 cursor-pointer");
    });
    legacy_pre_effect(
      () => (deep_read_state(rounded()), get$1(classesDisabled), deep_read_state($$sanitized_props)),
      () => {
        set(classesBase, `${cBase} ${rounded()} ${get$1(classesDisabled)} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect(() => {
    }, () => {
      set(classesLabel, `${cLabel}`);
    });
    legacy_pre_effect(
      () => (deep_read_state(border()), deep_read_state(rounded()), get$1(trackSize), get$1(cTrackActive)),
      () => {
        set(classesTrack, `${cTrack} ${border()} ${rounded()} ${get$1(trackSize)} ${get$1(cTrackActive)}`);
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(rounded()), get$1(cThumbBackground), get$1(cThumbPos)),
      () => {
        set(classesThumb, `${cThumb} ${rounded()} ${get$1(cThumbBackground)} ${get$1(cThumbPos)}`);
      }
    );
    legacy_pre_effect_reset();
    init();
    var div = root$a();
    var label_1 = child(div);
    var input = child(label_1);
    remove_input_defaults(input);
    const spread_with_call = /* @__PURE__ */ derived_safe_equal(prunedRestProps);
    let attributes;
    var div_1 = sibling(input, 2);
    var div_2 = child(div_1);
    reset(div_1);
    var node = sibling(div_1, 2);
    {
      var consequent = ($$anchor2) => {
        var div_3 = root_1$b();
        var node_1 = child(div_3);
        slot(node_1, $$props, "default", {}, null);
        reset(div_3);
        append($$anchor2, div_3);
      };
      if_block(node, ($$render) => {
        if ($$slots.default) $$render(consequent);
      });
    }
    reset(label_1);
    reset(div);
    template_effect(() => {
      set_attribute(div, "id", label());
      set_class(div, `slide-toggle ${get$1(classesBase) ?? ""}`);
      set_attribute(div, "aria-label", label());
      set_attribute(div, "aria-checked", checked());
      set_class(label_1, `slide-toggle-label ${get$1(classesLabel) ?? ""}`);
      attributes = set_attributes(input, attributes, {
        type: "checkbox",
        class: "slide-toggle-input hidden",
        name: name(),
        ...get$1(spread_with_call),
        disabled: $$sanitized_props.disabled
      });
      set_class(div_1, `slide-toggle-track ${get$1(classesTrack) ?? ""}`);
      toggle_class(div_1, "cursor-not-allowed", $$sanitized_props.disabled);
      set_class(div_2, `slide-toggle-thumb ${get$1(classesThumb) ?? ""}`);
      toggle_class(div_2, "cursor-not-allowed", $$sanitized_props.disabled);
    });
    bind_checked(input, checked);
    event("click", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keydown", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keyup", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keypress", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("mouseover", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("change", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("focus", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("blur", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keydown", div, onKeyDown);
    append($$anchor, div);
    pop();
  }
  var root_1$a = /* @__PURE__ */ template(`<div role="tabpanel" tabindex="0"><!></div>`);
  var root$9 = /* @__PURE__ */ template(`<div data-testid="tab-group"><div role="tablist"><!></div> <!></div>`);
  function TabGroup($$anchor, $$props) {
    const $$slots = sanitize_slots($$props);
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    push($$props, false);
    const classesBase = mutable_state();
    const classesList = mutable_state();
    const classesPanel = mutable_state();
    let justify = prop($$props, "justify", 8, "justify-start");
    let border = prop($$props, "border", 8, "border-b border-surface-400-500-token");
    let active = prop($$props, "active", 8, "border-b-2 border-surface-900-50-token");
    let hover = prop($$props, "hover", 8, "hover:variant-soft");
    let flex = prop($$props, "flex", 8, "flex-none");
    let padding = prop($$props, "padding", 8, "px-4 py-2");
    let rounded = prop($$props, "rounded", 8, "rounded-tl-container-token rounded-tr-container-token");
    let spacing = prop($$props, "spacing", 8, "space-y-1");
    let regionList = prop($$props, "regionList", 8, "");
    let regionPanel = prop($$props, "regionPanel", 8, "");
    let labelledby = prop($$props, "labelledby", 8, "");
    let panel = prop($$props, "panel", 8, "");
    setContext("active", active());
    setContext("hover", hover());
    setContext("flex", flex());
    setContext("padding", padding());
    setContext("rounded", rounded());
    setContext("spacing", spacing());
    const cBase = "space-y-4";
    const cList = "flex overflow-x-auto hide-scrollbar";
    const cPanel = "";
    legacy_pre_effect(() => deep_read_state($$sanitized_props), () => {
      set(classesBase, `${cBase} ${$$sanitized_props.class ?? ""}`);
    });
    legacy_pre_effect(
      () => (deep_read_state(justify()), deep_read_state(border()), deep_read_state(regionList())),
      () => {
        set(classesList, `${cList} ${justify()} ${border()} ${regionList()}`);
      }
    );
    legacy_pre_effect(() => deep_read_state(regionPanel()), () => {
      set(classesPanel, `${cPanel} ${regionPanel()}`);
    });
    legacy_pre_effect_reset();
    init();
    var div = root$9();
    var div_1 = child(div);
    var node = child(div_1);
    slot(node, $$props, "default", {}, null);
    reset(div_1);
    var node_1 = sibling(div_1, 2);
    {
      var consequent = ($$anchor2) => {
        var div_2 = root_1$a();
        var node_2 = child(div_2);
        slot(node_2, $$props, "panel", {}, null);
        reset(div_2);
        template_effect(() => {
          set_class(div_2, `tab-panel ${get$1(classesPanel) ?? ""}`);
          set_attribute(div_2, "aria-labelledby", panel());
        });
        append($$anchor2, div_2);
      };
      if_block(node_1, ($$render) => {
        if ($$slots.panel) $$render(consequent);
      });
    }
    reset(div);
    template_effect(() => {
      set_class(div, `tab-group ${get$1(classesBase) ?? ""}`);
      set_class(div_1, `tab-list ${get$1(classesList) ?? ""}`);
      set_attribute(div_1, "aria-labelledby", labelledby());
    });
    append($$anchor, div);
    pop();
  }
  var root_1$9 = /* @__PURE__ */ template(`<div class="tab-lead"><!></div>`);
  var root$8 = /* @__PURE__ */ template(`<label><div data-testid="tab" role="tab"><div class="h-0 w-0 overflow-hidden"><input></div> <div><!> <div class="tab-label"><!></div></div></div></label>`);
  function Tab($$anchor, $$props) {
    const $$slots = sanitize_slots($$props);
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "group",
      "name",
      "value",
      "title",
      "controls",
      "regionTab",
      "active",
      "hover",
      "flex",
      "padding",
      "rounded",
      "spacing"
    ]);
    push($$props, false);
    const selected = mutable_state();
    const classesActive = mutable_state();
    const classesBase = mutable_state();
    const classesInterface = mutable_state();
    const classesTab = mutable_state();
    const binding_group = [];
    let group = prop($$props, "group", 12);
    let name = prop($$props, "name", 8);
    let value = prop($$props, "value", 8);
    let title = prop($$props, "title", 8, "");
    let controls = prop($$props, "controls", 8, "");
    let regionTab = prop($$props, "regionTab", 8, "");
    let active = prop($$props, "active", 24, () => getContext("active"));
    let hover = prop($$props, "hover", 24, () => getContext("hover"));
    let flex = prop($$props, "flex", 24, () => getContext("flex"));
    let padding = prop($$props, "padding", 24, () => getContext("padding"));
    let rounded = prop($$props, "rounded", 24, () => getContext("rounded"));
    let spacing = prop($$props, "spacing", 24, () => getContext("spacing"));
    const cBase = "text-center cursor-pointer transition-colors duration-100";
    const cInterface = "";
    let elemInput = mutable_state();
    function onKeyDown(event2) {
      if (["Enter", "Space"].includes(event2.code)) {
        event2.preventDefault();
        get$1(elemInput).click();
      } else if (event2.code === "ArrowRight") {
        const tabList = get$1(elemInput).closest(".tab-list");
        if (!tabList) return;
        const tabs = Array.from(tabList.querySelectorAll(".tab"));
        const currTab = get$1(elemInput).closest(".tab");
        if (!currTab) return;
        const currIndex = tabs.indexOf(currTab);
        const nextIndex = currIndex + 1 >= tabs.length ? 0 : currIndex + 1;
        const nextTab = tabs[nextIndex];
        const nextTabInput = nextTab == null ? undefined : nextTab.querySelector("input");
        if (nextTab && nextTabInput) {
          nextTabInput.click();
          nextTab.focus();
        }
      } else if (event2.code === "ArrowLeft") {
        const tabList = get$1(elemInput).closest(".tab-list");
        if (!tabList) return;
        const tabs = Array.from(tabList.querySelectorAll(".tab"));
        const currTab = get$1(elemInput).closest(".tab");
        if (!currTab) return;
        const currIndex = tabs.indexOf(currTab);
        const nextIndex = currIndex - 1 < 0 ? tabs.length - 1 : currIndex - 1;
        const nextTab = tabs[nextIndex];
        const nextTabInput = nextTab == null ? undefined : nextTab.querySelector("input");
        if (nextTab && nextTabInput) {
          nextTabInput.click();
          nextTab.focus();
        }
      }
    }
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    legacy_pre_effect(
      () => (deep_read_state(value()), deep_read_state(group())),
      () => {
        set(selected, value() === group());
      }
    );
    legacy_pre_effect(
      () => (get$1(selected), deep_read_state(active()), deep_read_state(hover())),
      () => {
        set(classesActive, get$1(selected) ? active() : hover());
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(flex()), deep_read_state(padding()), deep_read_state(rounded()), get$1(classesActive), deep_read_state($$sanitized_props)),
      () => {
        set(classesBase, `${cBase} ${flex()} ${padding()} ${rounded()} ${get$1(classesActive)} ${$$sanitized_props.class ?? ""}`);
      }
    );
    legacy_pre_effect(() => deep_read_state(spacing()), () => {
      set(classesInterface, `${cInterface} ${spacing()}`);
    });
    legacy_pre_effect(() => deep_read_state(regionTab()), () => {
      set(classesTab, `${regionTab()}`);
    });
    legacy_pre_effect_reset();
    init();
    var label = root$8();
    var div = child(label);
    var div_1 = child(div);
    var input = child(div_1);
    remove_input_defaults(input);
    const spread_with_call = /* @__PURE__ */ derived_safe_equal(prunedRestProps);
    let attributes;
    bind_this(input, ($$value) => set(elemInput, $$value), () => get$1(elemInput));
    reset(div_1);
    var div_2 = sibling(div_1, 2);
    var node = child(div_2);
    {
      var consequent = ($$anchor2) => {
        var div_3 = root_1$9();
        var node_1 = child(div_3);
        slot(node_1, $$props, "lead", {}, null);
        reset(div_3);
        append($$anchor2, div_3);
      };
      if_block(node, ($$render) => {
        if ($$slots.lead) $$render(consequent);
      });
    }
    var div_4 = sibling(node, 2);
    var node_2 = child(div_4);
    slot(node_2, $$props, "default", {}, null);
    reset(div_4);
    reset(div_2);
    reset(div);
    reset(label);
    template_effect(() => {
      set_class(label, clsx(get$1(classesBase)));
      set_attribute(label, "title", title());
      set_class(div, `tab ${get$1(classesTab) ?? ""}`);
      set_attribute(div, "aria-controls", controls());
      set_attribute(div, "aria-selected", get$1(selected));
      set_attribute(div, "tabindex", get$1(selected) ? 0 : -1);
      attributes = set_attributes(input, attributes, {
        type: "radio",
        name: name(),
        value: value(),
        ...get$1(spread_with_call),
        tabindex: "-1"
      });
      set_class(div_2, `tab-interface ${get$1(classesInterface) ?? ""}`);
    });
    bind_group(
      binding_group,
      [],
      input,
      () => {
        value();
        return group();
      },
      group
    );
    event("click", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("change", input, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keydown", div, onKeyDown);
    event("keydown", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keyup", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    event("keypress", div, function($$arg) {
      bubble_event.call(this, $$props, $$arg);
    });
    append($$anchor, label);
    pop();
  }
  var root_4$3 = /* @__PURE__ */ template(`<header><!></header>`);
  var root_5$3 = /* @__PURE__ */ template(`<article><!></article>`);
  var root_6$1 = /* @__PURE__ */ template(`<img alt="Modal">`);
  var root_7 = /* @__PURE__ */ template(`<footer><button type="button"> </button></footer>`);
  var root_9$3 = /* @__PURE__ */ template(`<footer><button type="button"> </button> <button type="button"> </button></footer>`);
  var root_11$2 = /* @__PURE__ */ template(`<form class="space-y-4"><input> <footer><button type="button"> </button> <button type="submit"> </button></footer></form>`);
  var root_3$6 = /* @__PURE__ */ template(`<div data-testid="modal" role="dialog" aria-modal="true"><!> <!> <!> <!></div>`);
  var root_12$1 = /* @__PURE__ */ template(`<div data-testid="modal-component" role="dialog" aria-modal="true"><!></div>`);
  var root_2$5 = /* @__PURE__ */ template(`<div data-testid="modal-backdrop"><div><!></div></div>`);
  function Modal($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, [
      "children",
      "$$slots",
      "$$events",
      "$$legacy"
    ]);
    push($$props, false);
    const [$$stores, $$cleanup] = setup_stores();
    const $prefersReducedMotionStore = () => store_get(prefersReducedMotionStore, "$prefersReducedMotionStore", $$stores);
    const $modalStore = () => store_get(modalStore, "$modalStore", $$stores);
    const cPosition = mutable_state();
    const classesBackdrop = mutable_state();
    const classesTransitionLayer = mutable_state();
    const classesModal = mutable_state();
    const parent = mutable_state();
    const dispatch = createEventDispatcher();
    let components = prop($$props, "components", 24, () => ({}));
    let position = prop($$props, "position", 8, "items-center");
    let background = prop($$props, "background", 8, "bg-surface-100-800-token");
    let width = prop($$props, "width", 8, "w-modal");
    let height = prop($$props, "height", 8, "h-auto");
    let padding = prop($$props, "padding", 8, "p-4");
    let spacing = prop($$props, "spacing", 8, "space-y-4");
    let rounded = prop($$props, "rounded", 8, "rounded-container-token");
    let shadow = prop($$props, "shadow", 8, "shadow-xl");
    let zIndex = prop($$props, "zIndex", 8, "z-[999]");
    let buttonNeutral = prop($$props, "buttonNeutral", 8, "variant-ghost-surface");
    let buttonPositive = prop($$props, "buttonPositive", 8, "variant-filled");
    let buttonTextCancel = prop($$props, "buttonTextCancel", 12, "Cancel");
    let buttonTextConfirm = prop($$props, "buttonTextConfirm", 12, "Confirm");
    let buttonTextSubmit = prop($$props, "buttonTextSubmit", 12, "Submit");
    let regionBackdrop = prop($$props, "regionBackdrop", 8, "");
    let regionHeader = prop($$props, "regionHeader", 8, "text-2xl font-bold");
    let regionBody = prop($$props, "regionBody", 8, "max-h-[200px] overflow-hidden");
    let regionFooter = prop($$props, "regionFooter", 8, "flex justify-end space-x-2");
    let transitions = prop($$props, "transitions", 24, () => !$prefersReducedMotionStore());
    let transitionIn = prop($$props, "transitionIn", 8, fly);
    let transitionInParams = prop($$props, "transitionInParams", 24, () => ({ duration: 150, opacity: 0, x: 0, y: 100 }));
    let transitionOut = prop($$props, "transitionOut", 8, fly);
    let transitionOutParams = prop($$props, "transitionOutParams", 24, () => ({ duration: 150, opacity: 0, x: 0, y: 100 }));
    const cBackdrop = "fixed top-0 left-0 right-0 bottom-0 bg-surface-backdrop-token p-4";
    const cTransitionLayer = "w-full h-fit min-h-full overflow-y-auto flex justify-center";
    const cModal = "block overflow-y-auto";
    const cModalImage = "w-full h-auto";
    let promptValue = mutable_state();
    const buttonTextDefaults = {
      buttonTextCancel: buttonTextCancel(),
      buttonTextConfirm: buttonTextConfirm(),
      buttonTextSubmit: buttonTextSubmit()
    };
    let currentComponent = mutable_state();
    let registeredInteractionWithBackdrop = false;
    let modalElement = mutable_state();
    let windowHeight = mutable_state();
    let backdropOverflow = mutable_state("overflow-y-hidden");
    const modalStore = getModalStore();
    function handleModals(modals) {
      if (modals[0].type === "prompt") set(promptValue, modals[0].value);
      buttonTextCancel(modals[0].buttonTextCancel || buttonTextDefaults.buttonTextCancel);
      buttonTextConfirm(modals[0].buttonTextConfirm || buttonTextDefaults.buttonTextConfirm);
      buttonTextSubmit(modals[0].buttonTextSubmit || buttonTextDefaults.buttonTextSubmit);
      set(currentComponent, typeof modals[0].component === "string" ? components()[modals[0].component] : modals[0].component);
    }
    function onModalHeightChange(modal) {
      var _a;
      let modalHeight = modal == null ? undefined : modal.clientHeight;
      if (!modalHeight) modalHeight = (_a = modal == null ? undefined : modal.firstChild) == null ? undefined : _a.clientHeight;
      if (!modalHeight) return;
      if (modalHeight > get$1(windowHeight)) {
        set(backdropOverflow, "overflow-y-auto");
      } else {
        set(backdropOverflow, "overflow-y-hidden");
      }
    }
    function onBackdropInteractionBegin(event2) {
      if (!(event2.target instanceof Element)) return;
      const classList = event2.target.classList;
      if (classList.contains("modal-backdrop") || classList.contains("modal-transition")) {
        registeredInteractionWithBackdrop = true;
      }
    }
    function onBackdropInteractionEnd(event2) {
      if (!(event2.target instanceof Element)) return;
      const classList = event2.target.classList;
      if ((classList.contains("modal-backdrop") || classList.contains("modal-transition")) && registeredInteractionWithBackdrop) {
        if ($modalStore()[0].response) $modalStore()[0].response(undefined);
        modalStore.close();
        dispatch("backdrop", event2);
      }
      registeredInteractionWithBackdrop = false;
    }
    function onClose() {
      if ($modalStore()[0].response) $modalStore()[0].response(false);
      modalStore.close();
    }
    function onConfirm() {
      if ($modalStore()[0].response) $modalStore()[0].response(true);
      modalStore.close();
    }
    function onPromptSubmit(event2) {
      event2.preventDefault();
      if ($modalStore()[0].response) {
        if ($modalStore()[0].valueAttr !== undefined && "type" in $modalStore()[0].valueAttr && $modalStore()[0].valueAttr.type === "number") $modalStore()[0].response(parseInt(get$1(promptValue)));
        else $modalStore()[0].response(get$1(promptValue));
      }
      modalStore.close();
    }
    function onKeyDown(event2) {
      if (!$modalStore().length) return;
      if (event2.code === "Escape") onClose();
    }
    legacy_pre_effect(() => $modalStore(), () => {
      if ($modalStore().length) handleModals($modalStore());
    });
    legacy_pre_effect(() => get$1(modalElement), () => {
      onModalHeightChange(get$1(modalElement));
    });
    legacy_pre_effect(
      () => ($modalStore(), deep_read_state(position())),
      () => {
        var _a;
        set(cPosition, ((_a = $modalStore()[0]) == null ? undefined : _a.position) ?? position());
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(regionBackdrop()), deep_read_state(zIndex()), deep_read_state($$sanitized_props), $modalStore()),
      () => {
        var _a;
        set(classesBackdrop, `${cBackdrop} ${regionBackdrop()} ${zIndex()} ${$$sanitized_props.class ?? ""} ${((_a = $modalStore()[0]) == null ? undefined : _a.backdropClasses) ?? ""}`);
      }
    );
    legacy_pre_effect(() => get$1(cPosition), () => {
      set(classesTransitionLayer, `${cTransitionLayer} ${get$1(cPosition) ?? ""}`);
    });
    legacy_pre_effect(
      () => (deep_read_state(background()), deep_read_state(width()), deep_read_state(height()), deep_read_state(padding()), deep_read_state(spacing()), deep_read_state(rounded()), deep_read_state(shadow()), $modalStore()),
      () => {
        var _a;
        set(classesModal, `${cModal} ${background()} ${width()} ${height()} ${padding()} ${spacing()} ${rounded()} ${shadow()} ${((_a = $modalStore()[0]) == null ? undefined : _a.modalClasses) ?? ""}`);
      }
    );
    legacy_pre_effect(
      () => (deep_read_state(position()), deep_read_state(background()), deep_read_state(width()), deep_read_state(height()), deep_read_state(padding()), deep_read_state(spacing()), deep_read_state(rounded()), deep_read_state(shadow()), deep_read_state(buttonNeutral()), deep_read_state(buttonPositive()), deep_read_state(buttonTextCancel()), deep_read_state(buttonTextConfirm()), deep_read_state(buttonTextSubmit()), deep_read_state(regionBackdrop()), deep_read_state(regionHeader()), deep_read_state(regionBody()), deep_read_state(regionFooter())),
      () => {
        set(parent, {
          position: position(),
          // ---
          background: background(),
          width: width(),
          height: height(),
          padding: padding(),
          spacing: spacing(),
          rounded: rounded(),
          shadow: shadow(),
          // ---
          buttonNeutral: buttonNeutral(),
          buttonPositive: buttonPositive(),
          buttonTextCancel: buttonTextCancel(),
          buttonTextConfirm: buttonTextConfirm(),
          buttonTextSubmit: buttonTextSubmit(),
          // ---
          regionBackdrop: regionBackdrop(),
          regionHeader: regionHeader(),
          regionBody: regionBody(),
          regionFooter: regionFooter(),
          // ---
          onClose
        });
      }
    );
    legacy_pre_effect_reset();
    init();
    var fragment = comment();
    event("keydown", $window, onKeyDown);
    var node = first_child(fragment);
    {
      var consequent_8 = ($$anchor2) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        key_block(node_1, $modalStore, ($$anchor3) => {
          var div = root_2$5();
          var div_1 = child(div);
          var node_2 = child(div_1);
          {
            var consequent_6 = ($$anchor4) => {
              var div_2 = root_3$6();
              var node_3 = child(div_2);
              {
                var consequent = ($$anchor5) => {
                  var header = root_4$3();
                  var node_4 = child(header);
                  html(node_4, () => $modalStore()[0].title);
                  reset(header);
                  template_effect(() => set_class(header, `modal-header ${regionHeader() ?? ""}`));
                  append($$anchor5, header);
                };
                if_block(node_3, ($$render) => {
                  var _a;
                  if ((_a = $modalStore()[0]) == null ? undefined : _a.title) $$render(consequent);
                });
              }
              var node_5 = sibling(node_3, 2);
              {
                var consequent_1 = ($$anchor5) => {
                  var article = root_5$3();
                  var node_6 = child(article);
                  html(node_6, () => $modalStore()[0].body);
                  reset(article);
                  template_effect(() => set_class(article, `modal-body ${regionBody() ?? ""}`));
                  append($$anchor5, article);
                };
                if_block(node_5, ($$render) => {
                  var _a;
                  if ((_a = $modalStore()[0]) == null ? undefined : _a.body) $$render(consequent_1);
                });
              }
              var node_7 = sibling(node_5, 2);
              {
                var consequent_2 = ($$anchor5) => {
                  var img = root_6$1();
                  set_class(img, `modal-image ${cModalImage}`);
                  template_effect(() => {
                    var _a;
                    return set_attribute(img, "src", (_a = $modalStore()[0]) == null ? undefined : _a.image);
                  });
                  append($$anchor5, img);
                };
                if_block(node_7, ($$render) => {
                  var _a, _b;
                  if (((_a = $modalStore()[0]) == null ? undefined : _a.image) && typeof ((_b = $modalStore()[0]) == null ? undefined : _b.image) === "string") $$render(consequent_2);
                });
              }
              var node_8 = sibling(node_7, 2);
              {
                var consequent_3 = ($$anchor5) => {
                  var footer = root_7();
                  var button = child(footer);
                  var text2 = child(button, true);
                  reset(button);
                  reset(footer);
                  template_effect(() => {
                    set_class(footer, `modal-footer ${regionFooter() ?? ""}`);
                    set_class(button, `btn ${buttonNeutral() ?? ""}`);
                    set_text(text2, buttonTextCancel());
                  });
                  event("click", button, onClose);
                  append($$anchor5, footer);
                };
                var alternate_1 = ($$anchor5) => {
                  var fragment_2 = comment();
                  var node_9 = first_child(fragment_2);
                  {
                    var consequent_4 = ($$anchor6) => {
                      var footer_1 = root_9$3();
                      var button_1 = child(footer_1);
                      var text_1 = child(button_1, true);
                      reset(button_1);
                      var button_2 = sibling(button_1, 2);
                      var text_2 = child(button_2, true);
                      reset(button_2);
                      reset(footer_1);
                      template_effect(() => {
                        set_class(footer_1, `modal-footer ${regionFooter() ?? ""}`);
                        set_class(button_1, `btn ${buttonNeutral() ?? ""}`);
                        set_text(text_1, buttonTextCancel());
                        set_class(button_2, `btn ${buttonPositive() ?? ""}`);
                        set_text(text_2, buttonTextConfirm());
                      });
                      event("click", button_1, onClose);
                      event("click", button_2, onConfirm);
                      append($$anchor6, footer_1);
                    };
                    var alternate = ($$anchor6) => {
                      var fragment_3 = comment();
                      var node_10 = first_child(fragment_3);
                      {
                        var consequent_5 = ($$anchor7) => {
                          var form = root_11$2();
                          var input = child(form);
                          remove_input_defaults(input);
                          let attributes;
                          var footer_2 = sibling(input, 2);
                          var button_3 = child(footer_2);
                          var text_3 = child(button_3, true);
                          reset(button_3);
                          var button_4 = sibling(button_3, 2);
                          var text_4 = child(button_4, true);
                          reset(button_4);
                          reset(footer_2);
                          reset(form);
                          template_effect(() => {
                            attributes = set_attributes(input, attributes, {
                              class: "modal-prompt-input input",
                              name: "prompt",
                              type: "text",
                              ...$modalStore()[0].valueAttr
                            });
                            set_class(footer_2, `modal-footer ${regionFooter() ?? ""}`);
                            set_class(button_3, `btn ${buttonNeutral() ?? ""}`);
                            set_text(text_3, buttonTextCancel());
                            set_class(button_4, `btn ${buttonPositive() ?? ""}`);
                            set_text(text_4, buttonTextSubmit());
                          });
                          bind_value(input, () => get$1(promptValue), ($$value) => set(promptValue, $$value));
                          event("click", button_3, onClose);
                          event("submit", form, onPromptSubmit);
                          append($$anchor7, form);
                        };
                        if_block(
                          node_10,
                          ($$render) => {
                            if ($modalStore()[0].type === "prompt") $$render(consequent_5);
                          },
                          true
                        );
                      }
                      append($$anchor6, fragment_3);
                    };
                    if_block(
                      node_9,
                      ($$render) => {
                        if ($modalStore()[0].type === "confirm") $$render(consequent_4);
                        else $$render(alternate, false);
                      },
                      true
                    );
                  }
                  append($$anchor5, fragment_2);
                };
                if_block(node_8, ($$render) => {
                  if ($modalStore()[0].type === "alert") $$render(consequent_3);
                  else $$render(alternate_1, false);
                });
              }
              reset(div_2);
              bind_this(div_2, ($$value) => set(modalElement, $$value), () => get$1(modalElement));
              template_effect(() => {
                set_class(div_2, `modal ${get$1(classesModal) ?? ""}`);
                set_attribute(div_2, "aria-label", $modalStore()[0].title ?? "");
              });
              append($$anchor4, div_2);
            };
            var alternate_3 = ($$anchor4) => {
              var div_3 = root_12$1();
              var node_11 = child(div_3);
              {
                var consequent_7 = ($$anchor5) => {
                  var fragment_4 = comment();
                  var node_12 = first_child(fragment_4);
                  component(node_12, () => {
                    var _a;
                    return (_a = get$1(currentComponent)) == null ? undefined : _a.ref;
                  }, ($$anchor6, $$component) => {
                    $$component($$anchor6, spread_props(() => {
                      var _a;
                      return (_a = get$1(currentComponent)) == null ? undefined : _a.props;
                    }, {
                      get parent() {
                        return get$1(parent);
                      },
                      children: ($$anchor7, $$slotProps) => {
                        var fragment_5 = comment();
                        var node_13 = first_child(fragment_5);
                        html(node_13, () => {
                          var _a;
                          return (_a = get$1(currentComponent)) == null ? undefined : _a.slot;
                        });
                        append($$anchor7, fragment_5);
                      },
                      $$slots: { default: true }
                    }));
                  });
                  append($$anchor5, fragment_4);
                };
                var alternate_2 = ($$anchor5) => {
                  var fragment_6 = comment();
                  var node_14 = first_child(fragment_6);
                  component(node_14, () => {
                    var _a;
                    return (_a = get$1(currentComponent)) == null ? undefined : _a.ref;
                  }, ($$anchor6, $$component) => {
                    $$component($$anchor6, spread_props(() => {
                      var _a;
                      return (_a = get$1(currentComponent)) == null ? undefined : _a.props;
                    }, {
                      get parent() {
                        return get$1(parent);
                      }
                    }));
                  });
                  append($$anchor5, fragment_6);
                };
                if_block(node_11, ($$render) => {
                  var _a;
                  if ((_a = get$1(currentComponent)) == null ? undefined : _a.slot) $$render(consequent_7);
                  else $$render(alternate_2, false);
                });
              }
              reset(div_3);
              bind_this(div_3, ($$value) => set(modalElement, $$value), () => get$1(modalElement));
              template_effect(() => {
                var _a;
                set_class(div_3, `modal contents ${((_a = $modalStore()[0]) == null ? undefined : _a.modalClasses) ?? "" ?? ""}`);
                set_attribute(div_3, "aria-label", $modalStore()[0].title ?? "");
              });
              append($$anchor4, div_3);
            };
            if_block(node_2, ($$render) => {
              if ($modalStore()[0].type !== "component") $$render(consequent_6);
              else $$render(alternate_3, false);
            });
          }
          reset(div_1);
          reset(div);
          effect(() => event("mousedown", div, onBackdropInteractionBegin));
          effect(() => event("mouseup", div, onBackdropInteractionEnd));
          effect(() => event(
            "touchstart",
            div,
            function($$arg) {
              bubble_event.call(this, $$props, $$arg);
            },
            undefined,
            true
          ));
          effect(() => event(
            "touchend",
            div,
            function($$arg) {
              bubble_event.call(this, $$props, $$arg);
            },
            undefined,
            true
          ));
          action(div, ($$node, $$action_arg) => focusTrap == null ? undefined : focusTrap($$node, $$action_arg), () => true);
          template_effect(() => {
            set_class(div, `modal-backdrop ${get$1(classesBackdrop) ?? ""} ${get$1(backdropOverflow) ?? ""}`);
            set_class(div_1, `modal-transition ${get$1(classesTransitionLayer) ?? ""}`);
          });
          transition(5, div_1, () => dynamicTransition, () => ({
            transition: transitionIn(),
            params: transitionInParams(),
            enabled: transitions()
          }));
          transition(6, div_1, () => dynamicTransition, () => ({
            transition: transitionOut(),
            params: transitionOutParams(),
            enabled: transitions()
          }));
          transition(7, div, () => dynamicTransition, () => ({
            transition: fade,
            params: { duration: 150 },
            enabled: transitions()
          }));
          append($$anchor3, div);
        });
        append($$anchor2, fragment_1);
      };
      if_block(node, ($$render) => {
        if ($modalStore().length > 0) $$render(consequent_8);
      });
    }
    bind_window_size("innerHeight", ($$value) => set(windowHeight, $$value));
    append($$anchor, fragment);
    pop();
    $$cleanup();
  }
  const creditCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAADzWSURBVHhe7Z0HnBRF9sdrMyxZoiCegKCCOZ3xzKcCgp56CoqKohj+6pmznBGMGM+cQDALBgwneuZ4nieGU5KKIoqAIrCEDf1/3zddQ29vd09P2oD++BQzW93TXV316uWqLvhZUCowv8P8+OOP5uOPPzY9evQwvXr1MoWFhe6RYDiOY2bPnm2+/vprs+WWW5p27dq5R37bWCEwNTU1K6WDfvNYvny5M2LECKd58+bOjjvu6Hz77bfukXB88803zuabb+60aNHCueqqq5xVq1a5R+JB+t79tmZBnms5U7IqQWdrHhYvXmymTZvm/hWNlStXmpkzZxohMOVCcK9UKCkpMT/88INZtmyZqa6uNgUFBe6RaHzxxRdm6dKl7l9rJKqieX0Txi+//GKGDh1qhKOYs846y1RVRc+fsrIy0759eyWOyspK2Ll7JBxrr722ef31182ECRPMyJEjTXFxsXskHOeee67p27ev+b//+79Y92iqWGMJCy4yb9481YNeeOGFlBwINbNbt26qV8G94g567969lYDXWmsttyYatIM2iWqLGuLWrnlYYwmrdevWyoHATz/9ZL777jv9HgYIqmPHjqaoqEg5FmIUAsg1xo4dax588EFz/fXXm/Lycrd2zUOTIiy4CDqNKMluTThatmxpNt54YxVPiMXvv/8+JaF07dpVCYvrw1nywVHatm1rDjvsMLU64+hk6G60Jc4zNyY0GcJCPI0ePdoMGjTIiAWmXCUKDNr+++9vNthgA7PeeuupmEs1kB06dFDCgqDgcg0tqrj/zTffbAYPHmzGjRuXUk9sVJDGL5OZ3OghHMfZZpttYDmO6DXOl19+6R4JhwyEI7PdmTNnjn5PhX/9619Oq1at9B4nn3yyuiDiQvrR/ZY7VFRUOMJFtT177723s2TJEvdI44b0xZImw7FQjvv166cc5auvvjJTp05VMREFzu3UqZPp3r27fk8FxJQ9LxXH4t633Xab2XrrrVVfSsVBM0GzZs3MlVdeaf70pz+Z4cOHm+bNm7tHmgCaCscC77//vtOmTRudwZtuuqkjg+8eiQYz/7PPPnNk8N2aYMyePdvp3LmzXn+PPfZwfv31V/dIXcyfP9/Zbrvt9Ny+ffsqV4xC3DYEAU4lhOz+1fjRpDiWtNdstdVWZt9999W/P/30UzNlyhT9ngrXXHON2XHHHdWHFAUh2mRYZtGiRZEcCwcnliOAy6XyYV133XXahlGjRrk18dGiRYuU4aVGh8bAscTaiz0jZ8yYoSEUabrqWmLxuUfCIaJEzxcCcObNm+fW1gXtsHrcH/7wh0iO+MUXXzg9evTQc//4xz86QojukbrgulZXEmPCrQ0HoaFrr73WkYngiBUcW3+jD9PRC/OFRsGx3nvvPXPUUUeZ++67L5aesv7665tjjjlGvwuRmXvuuUe/R0EGXj/Ri15++WX9HgS87zvttJN+h3NFcSFcHzhhgYjPSP1HjAJ1kwARsfoZhaefflq565gxY8xTTz0Vyy1BKOqGG25QVwb6Z4OjoTnWgQce6EjHafD3zTffdGuj8c477ziiaMfiFkBEpiNEo+eLEhzKHeEMIt6cCy+8UC3EKC767rvvOq1bt9ZrCqG7tcE47rjj9DzKs88+69YGg/tvttlmei5t5j5xMHPmTGejjTbSvtxnn30y0uVyhUbBsbB40FGYccOGDdMwTCrgm8IaYyb/73//M//+97/dI8HgfOl09XSjR4VxAOrx2F922WVm1113jeQUePJFIdfv1sMfBvxjOGy32GILs+2227q1wXj44YfNl19+qd+HDBlixEjR76lAG0jd6dmzp+qhcazgvKKhORbWkrDv5Iw++OCDI60xi0cffVR1LazEl156ya0NBj6s//znP8ot0tFZoiDErHqTEIxytygsXLjQefHFF9UqTKVL3nXXXcq9hRidV155Ja22LliwQP176HQNCThWAYQlM7NBg1b//e9/zX777adcoFWrVkaIxuy99956LIxr4IV+5plnVNfBw17fPh70tY8++kitVThFrjgEz/PEE08ohxswYECsjInGBumTpQ3OsZiRzOKLLrrIKSkpUa5Fot3PP//snpFbYOkxo9PhBL8jPcCxGlzHgiPhozn99NONKPJah2ed2GBcEGT+8MMPk7E0eTb99IPcKeJuf//732OnxdQnPvnkkzUnAbChOZYX0qnO3/72N+eBBx5QX04criImv3PEEUeolYjfB+4X9jtSj+WRndLSUmfatGlubV288MILzvHHH+98+umnbk1dfPzxx3rOk08+6dZkDtorBoM+A5xbJpV7JByiPqi1+fLLL6fU2+obcKx6JSzcAjgWGRQGdvr06UlXgZ8Y+NtfFwQcntapKRaRI1aie6QurrvuOj2Pcs0117i1tcEg9evXT88R68qtrYujjz5az0HRZkJkA4wL3CZcb+DAgSmDzfRfly5d9Pw999yzjrGDGuHtZxR6FPv6Qr0RFlzl/vvvVw/4euutp51CWX/99bVu/Pjxah1mAjgbXE6UXC1XXHFF6KIGvPbWn7XTTju5tbUBMW+88cZ6Dt73MO7x8MMPKzFw7ziZE6mAxSgi2nn77bcjORA6IgQv6oOW8847L9lGnnvixIka5yQqYPuZCcfz3n333VlPgjioF8KCqE488UQ1yxmsoIKjcezYsaEEkQrMTBuchtuEKf4MWJ8+ffQ8wjuk4gRh11131XNoc1AICOLDAYkzkxAKf+cCccT/PffcoxOI9jEx4UwAg+Tss89OOm2DCu6ZSy+9NJaozQb1QljEvNBpmF277LKLM2HCBEcUbc1UuOOOO3TWYw3SWRCXv2MhTEQmeVVRIH/KdiDXCcMJJ5yQPI+2BAHvPMchrKBlYLkiJIAYw7cWR0/6/PPP1b9F2+C89957r3vEce68804VyxzDqkZPxdf2wQcf6HnUWW6NHpdPz3zeCeutt97SGSSWn3POOedoqokfyP4zzzxTCYuO8TobETFXX321cpn99tsvMjUFztKtWzftOJTgr7/+2j1SGyjbEDrnocwHEQmDwbH77rsvp0TkB4P717/+VScXYaooMLG22morbTflggsuSIpgOHb79u21HukQxGXh4qNGjdJnp6+feeYZ90jukXfC2n///fVhIYoovxQEs+WWW+q5WHh2MGHvgwYN0npEFwp31ExD3+BcyujRo93a2hCT3llnnXX0HJT+oDgj3AOdLxe6UxQgcjg5bbnkkkvc2mCghNv46IABA2q121q7iPCojAw44/bbb6/nDh48OG8iMa+EhQhBcYT9ouhaYqFDCFs8+OCDSUWSY6eddprOJBL46ACLJ554wmnXrp12BmIgKigL6+/YsaOeS/JdkBjj2tYC6969u5rtuQTPgni76aabnIsvvtj57rvv3CO1AQFsuOGG2g7SoVHao4D+dfvtt2vA25uWzb1IxaHvUC3sZCCdCIMJkYiVafsfAkb1IGAdxtWzhdwrf4SFlcMMo7z66qturePceuutTrNmzVTZJhZmgV4EEdLZX331lVubEBdXXnmlDgAF300YUKSJO8IFYPnoUH7dhQEaMmRIMqMCrmE7PR0Q+8O1EfRbYpLoZ3BZxGmQ/mSfl2fCH5Yqj8rex3+tuXPn6gTmfvjfLCAqng+F3VuP8k99r169Yq0byAQQVt487zbGJ/eBePU7YMMNmV0aE/RuoiEzzf1WG5x7xhlnmIMOOkhz0v/85z+7R+qCHHEbNxQCMo899phmTXjBsvjttttOc684hrc77N5heOihh7Q95JHZLFIvyEiQCaLrFMmqEEJ3jyRApECIT6ML9ANtpu1BIDfrueeeS7bRfy3bz/SxEJ1+B6xMsv3sXUyb7rNmDGlQxhwLvQmrLQhE9FG6mbU4Jr26EfqC15GJrB82bJhyGnSAIH2MGY0Ca2duGGjPzjvvrJyA602ePNk9shrc34pXIdRY2RReYFDAdfEVhek0tCNsYxE4NeKP+2OtBel5cNbLL79cuRoqQFiuGn2HaIcD+732WJFED+gzCmOAcs+YbLHFFrVUDgvOoz+ycajKNTIXhVgiuA8OPfTQ0Ie2IgxHY5QO8c9//jO5iIFdW3i4bADRwu65HjqbX8xgFDCgHIfArC8oLvBfCTdUq9fqNOlg6NChem+K12XgBVaiTWfu1KlTpG6JbsV5iET6Mgy011rOGDpBbcdyx92CQzVu4qUfWREWpisNhCvgUkCx9DeUAcSJx3kQznvvveceWQ3ypNZdd12dcXRgutwjDFhO3Jfr4o32gyxRe/y2225za+MD4s9kAjAhbRYHHC/MMkNXpG2c95e//CVSB+Ma1qpGd33ttdfcI6vB5EHJ55pw2zDnMD5G67o49dRT3dr0kBVhwWZRtLFGaASNxfloRZztdIKkmPc8EIo8pjFugzFjxqgSDavnGGIzlWWUDlCurbd/9913rxN/gwMgEuzABSGKG2XCqRBvpGJzT4jr8ccfd4/UhSUULNco6832M8+DQk5fMtFF/1PuT0HNKC8v1+sxib3KvB+I9iOPPFJVklS+tTBkRVhg1qxZGiuzDkcKK2fGjRuXtF6Q6zg9Ca7C3ex53oJPhZkSZD1lAjobcxuuRUfjR/MTFoNswzvMUL+uRGQAfQQrystVaCOW3imnnJK2CBVFPKlbsbI5ijvDdYh7wtHjgHZBCGJUJCe7vxBj5JxU/YwbKM7qpzBkRVgMHgUWjb6BGLMPwEJOq4Db8xhYTHs8zdtuu62zww476KyaNGmSPgjn5Ar2WiwwIPCK+yLo+taxSPHOYgiJFGk4GlyZkJIFDlbEOoOHcg2BesHAMeH89+OaPDuEznW9ky8I/N5/7ShwPoW+xKuONGAc6OfDDz9cU7m9/qx8Qu6RHcfygswBvOTIcYKhYbpDYwLOQ8tF4by20xkAVrpQj0IM97J46qmnkusa0UHQIy2YONQj+ukPLyBIxBDHcd6y6npNBYSVMz8W6/3YEQWfCxmaIh61njVud955p5HB0r8bAiKOjYgUXYfoxSabbKJ7OwAhnqRPCh8XPighOv2tTBKtB8uWLUtmqLL6hnOA6Fzm1ltv1e8iVutkggrRJffoEp3OiKWs3+sTCxcuNP/4xz/Uh5Z35Ipj2dnuBWwZ5RPFHo97QwGzGW6BCEM8WmAZ2cAuFhoGCeBZTj/9dBV3KL1wKft8N998sz4Pv7nhhhuSSjz6ls08QPx4fXH49KzrAA7pbUN9ggwI2o5Rw8a8+UJOOZboDu631aBOxIYWy8HSBVxERJaZOHFich1fupBO1PWKcBUv58Tzzzo82sl36XSt52/pfOVG1Nl6AAezx+E6lmNNmzZNPd88p+hSetxCLDYjirpywvPOO083XWsIcH/WVvKsoue5tflB3pd/CRfQDTZYrAmBEUZ59dVXVQSxbIpBigJiVPQfHdzJkyfrAtd0wY54hEZE/9Ml9JYYAEvPWGQh5nWtZVxz5swxzz//vIpElqLRdgCBIu7FpDeih2nIBPCMr7zyihIQCza8i1h5ZlQCjrGki9BUQ4BJxZI1Fu1uttlmbm3uIUwr3vKvVOZpOsCRinkv+k2sICieZEx0RBnOxUwR5ndCxIUdoz7o2cPqo67FsVz2Y0PBa6yEQZ41tShkI1Z2BmbZuVeJzRTsBcoMRrn1K7hB2GuvvXRp10svvaTB3UwRxvrhmGHHqPdyN4uw+qhrcSzoN00BGCMywZVzY6RhAAj9uEdDkIpj4c+R0yI3ImM2xgWBz4ceekgDsXGoPwjc77dUGhKkPBET9ubS9+/fP9LHJm1O7cciRIMjU/SNJJvHYUhiHp7hTKLgiIRMO4zf8fvfUmlIEKYTTpskKpyuXr9eECCsSOVdzqmjXFN34oknmrvuukutIPKNjjjiCM0pItcKq8j/m7hAuUXZR/ENe0kS96f8lhAmQul/Xs8iUkDfduE1GDIBfi728kL1wcfHfTFszj//fLUoMaLYyYY8ryjI+GS2dwMhHGKCXMMWUmPI7iQ9OFOwrg6Wy7VZphQketc0jhXnecLAWgF8ZkQCiAJwrTgIO48FL/ju8O15Y4Xki5EqBOLcQ87JzI8Fd3rzzTd11znMboCviN312LFu7ty5WpcuRNQq18JDfvnll5vDDz9clf01DdL37rfa39MFv8WFQDQgHcMKicJvRcetdf+uXbvqGODn8nJJ/rbjHFsaCXVl7HmHeslKIDYIl8FLjXfbG7TFAw21x6F0YnRwPa+iiEwn9cbmI3GdoFm9JpcwcIwsCBZuBGWDekG/UcjiQCE/5JBDNCrCekw7Nnzi3onzSr0oyHVyG4QmDZjovm0oYQNyobAsUy04tWDZFYl5drtECnlchE+4LsXf8WtyCfOLxYEdB0BYiUxTxsOuGqeQiMl9cgm5b+4Iyw66Fyz7ovFYFXGT+LgGnQmns2sKKaxRpJ7j/s7PZeEeQfUNUWhLNoQFcOmMGzdOtx4gXVtEmfYnn7vttlvGyXxRkDHK745+ONZ4Lx8ymh2ACWWgCxBWwAIhrIBcD7N6iBPy9gfOP+WUU3SfdGl3VnpJKnDt2HpEPYD20D/ptgldVcSkZlywU7QQqF6DscDJecIJJ2hMk9hhriFtzv+OfswYrzONhDoi/cweXnvLnlbkKsGJwkAWqkW6HCtzDiS/q1klpTLgWP2WqL4Jw4033phMzabwna2Xpk6dqmIxn5D21rUKpdLMnz/f/St74P9gLZ8Ff2PJENYhAMwbGwjbXHLJJWrdAGmbflqk8ptEISvuY4elnuB/7mxAaAkuxSf7u+KPuuWWW4zoWLFf2ulHUPuQPGR81IEQUpJjsfSH/HCsO5TnkSNHqnwmryqXIJzDEiiyM2Xg7fApJwtaB+hFuhwru8K96u9+Ydw1DFjK+JuCOBpGEH3JHveZ7j0WBO7JIhCW+rM2EQuexReso7SAY9UiLHLD7W52tuAwI7aXa9BAQgM4Re0eBhQWMEShfgmrcRQ/ICYWZrCmkxhuPhRwwBiRwOhVRQjtwXi8NMKCWetABXUIi4dgcQPuAbuAlJJqH/VsgP6FW+L888/XZUreFdJwNlH+nTfeeMOt+Z2wRKSpNUcqEdY240O2az7A/hIiNtUjb4HfUsSr3pdjLGfzv8WjDmF5gVh87rnnMl4NmwvYvUVpvMVvnbDsNpYU0VdVZWGFcz7AUjLuwzI5LyAumE2YbxLCKho1atQFoues1q5dkDFJMHLdddd1a+ofdvHBWWedpQHu+gDKfqYlX/BeG2WcV+rheqFfLr74Yg1A5+P+bCxCYJut0vlusfbaa2tKt82qDcCqenszxbfffmtEXus7cPClACFu/QzrFHxeIir1Aayvi9/Y32UK+2vvXblmJv4iP6Q/3W+5g9fPhwVG/JQ+pF/CEgu94NlEnVCfIT6suOB33A+rPp1+kd8trRfCEr1JXQoEp8l1J/cc5xyvhyOXPc1Ga4kDrht0rpiiUmTAalYf41wyVVmmhSPXO2Ac81/L2w7Meghq+PDhOptzTVxewvKC+8fpO17/izuHxR/k66dDXJlA2rU0uMU5Bg9vBwofGbPniiuu0L2pbMcsWLDAvP322xlnRgTBSwheFDAgvmO0A9FL+8hx+uyzz8z06dM1a4M2UViUAbfgO2/P4DhiyZ5HpCGX8BJvEGzf0Sbe++hdgeSFPY9P+z3fqBeOxQxGDLIRGoslCdEgEh9//HGzzjrraIeMGDHCvPjii7qChNxqVuPwySoZL1J1dqagwy2h3HTTTZpSUlpSagqLCk1hgZRCGRQpYjvo89AGUaz1O8mNJD+i93Tr1i1nHMs+pxXR/G0Jg1VB9BeFkA0hHPqQCetdrgZ4lhdeeEH7mpVIYRwwV5B21o8o9IJOZ3azitgunWLGsWTK/95BiIz3+9FhiE5A59oOzyUYMJZ2jRs3TnfsIwpguaxTzf3kvgWO1BXrM9iBBhDWcccdZ0aOHKmRhVwRloWXEPCe83Ywoha//PKLW5vALrvsom9Es/3aUICw6kUUekEnYeF5Hx69i2X5EBAWjg0BEYRmdQ5rAusDtA2FGEsIwiGURCkpKzGlzcrke4mGQyAerXfbybNQ5yW2fIFkStZlWqKiDeisRx99tK6kykdQORPUO8cKA7McKxCxyMphcq9ZAAo3YJb+0X2vcz45FiutH3roYfPIow+br0WHKi0tc48m2oeIsZmacDPqsFoRfyeddJI54IADIsWMbTf3Sgfea7IqnMxdOD5xP3LQt9lmGyWodA2hfAGOpYQlnKH8wgsvVKUUC4IFEoAAI0vH6RAsJWYlM4TBZmbzcPl8EKwt7m05A+BvO0C5BgM4ZcpzZuzY682cb78xRYWY2QlCIGi+1VZbqdKOmKTO1tNfo0aNUr0xCrbd6faZn1jRr0gVziY4nwq01bYTyYFhw8TjO/dFV7Ppyh988IG59NJL1beF5BFaSaTNkPpLiEAupPtJ4e0lIMrWPgQZOcb+6WzPw65xbMPDjm9kevo9w4AwDd5gPPd4aYVg1WOeCnHPsR7pXBeuzersQYMGO336bKDP2r37OhrL5JlZvY2neyP5m33S+/btp3t6EoTlGUHQdbMpjEOcfkkF0pdYqkcCZdj1OM7e9GzvJJxZ60hAYMdDxp4QDuk3ZKCSDm1jiKSmC7E5a6+9ti6mkesnQjqswmBzLgKadscVHoj9x4XlM80CC7sTB2U+EOPjJrYRNIo1iF6Qo024iMal03GcGzQAuShcm8Ar+6uutVZ7JZ6BA/dTwiI9muwLCIy3aXXp3MVp224tp43UswEbgeGga+aiZAN2BCT2y9oB0cU0yYB9vILAjkAiHXQLBLs9JWEb/vaPPVt9WsIiCG430oOWIKxIHQufDoozPh18NBSheGX/cj3N6kTh9rNqdobBWYj+YYHoxA/Ep9xT91qHhY4ePVp1BsC1zznnHDX7cTNgFaIsH3roocp6Afel5AOwfgrPjIXYv/8AEcPF5pJLLhXrdBszc+YsscgeN7379DEbbriBaVHeQp2OGB/sP+91qoaBtlsRExfe/sVtgO6J8o5IZIwIt+Bm6N69u3vWatAuDCAvcOWQXeoHm6CQWUoYD1eQ3TsMp/H999+fHA+2OmCPLxtB8UOeMX4GKRyMvB5YKWyfV3kwwyl+2MR99ulk91/y1WGvdvbxG1ItpMOU8i14vQnt8hdmnAW/9c/oXBauz7ORUcGMRKwjIsjLYoXLpElP6r5anEtfIO6pz2e7vPCnNdkiBo57Rm3Qv0Igym0JYLM6x/umEC+4F/vCs0rHP66IRmjAC/85FlKfu8UUftAI5DoJYIhLf6NYbEmaLMdsA8moYBWJcLVanebdtI1z/R2f68I9yBVj52UL2g/BkdYDwTHJSKJjEzXOz2e7vDj22GNr9Q3qBmLIvzWlBWPAtpSoHkwExsO2N1+Qa+d3MUVcSFuS4kE6Utk7bgdEJ+IFJ6m1gDiXkm8gfnDYYgnh6uCeDzwwzgwdOkSPsfWkjfJ7258PeEUhHnYWC+M769Kli4on1IZ07p/v9sr169/zni3oFEoYctlpDCjuBfZGwJWAzgjBE/bBKUm2QD4HyMJLWE0BayRh5RLch0HFyBArSTmY6Clmzz33VG5VX+34nbBiQHQVLcx+0VWSn3i0bYHd45wV/UstUbZXJNQD6pOwLMfCInrkkUe0TbRj6NCh5sADD8x4tUu68BIWFiEE3rlzZxWHhJ9wVOJExvNundh84tSuD47qR84JC4Ih/QXPNCID/YTBgDggFnQmvmMm48H1EhMuDM6H0IjG84m+RcHdQGAY1Cdh4WYhc4ClU7SfZyNhEZcJbcLVEie3ifZmM8BewmKRL9EQdE8KBARBEQ0hrMMr9ajjk3DPmWeemdRP6XtcOUQQvBkQjBt9znPlghCThCXfy1NdMFXnQCxnn322+kzgNBAEv5HrJ9NL7Cf1lLi45pprtINAur/NBDznO++8o23Ff0a7AUSF4swxJsbAgQPNzjvvrMTFuUH9Y9uazYB5CYsdeCZMmOD+FQ2IDX2QFHPAPmZPPfWUxjUJ3QEmMz5H6zvEF0Z6DRyR52Iz4HQD2/LMCcKSL+XsEmw38YJImJ1QOE5Lsj+HDBlSi8r9INGMLYzgVn7QqcwuZg7FsmquR6P5zmwh9oiVA3u3qbcoydzfxgvzTVi0FQIitYedlO1sDwJcmb05xdxXCy1f7fISFuNBFqiVAvxtvzNu9L/l+JtvvrmKcUQm4HnQF8lzmzJlitaRgsNLPYPAfSFGlukzTkiWcePGaUYw3JoYKf2FtIF24JI4a6UuQViffPJJOWkX/IAf2xlqgUlNQzbccEO3pi4gyAsuuECzQvHYQiA8ELMAIkHeU4c+YIkKwuFvGkRhhkGA3o70I5+EZbkKxIKLgfYG3cuexycDChfbbbfd9Lks+J09L134fxvVHwBuafVWOBAF4iIqQL9aoJuRZLnrrrsmuRjjduqpp5qPP/44SZzQgAWrqImktGzZUrkfHBqvP4s4GG/G7I477lAOSJYH2RfC6RKed2J7BJrlOoGFhZE416Ig11HnGzEzmcn6nbibNFIdikKssZ1yUedxjGvlo3DtefPm6Tq5uPcBeLL5XdDxTIoQiRb7t0Xc/guDfSY/GCvGl4iKcDR9EwfbphPfxfFq7yuEp0vx8OITcbDXsjsBeoPQyrHkIcqR21A04oiCOQ17t7JWfp/xDEwXzD5mDso+XBRRg9wHtIOSD/B8KOtwUmKZce4DN0HJ5zeIAelP90jmsPe1/W05FvUo7l9++aXp16+fSgPUBrh8fQKOhQSiPbSRlJq7775b9TN0QOFi9e9uSAX0luuvv15zuWUGKatGzrOZLuBh4gx4phg/frym+CJG4tyHQaed6GSIz3xMPq8oRE/C68+EZ7IdfPDBmm/vFcMNDem3+k9NToVZs2bpBvVYXhgU6A1ePSFfgCCw9CBsBi0dwDHgriIa3Jr8gb6gTzAw6CN2NIZjeAGhc05Dot4IC2sFpTIVYO2kZcBW4QBXXXWVZidmg7gcDhYPkaRDyFwbyxGCRAzmg2N5wUZ0p512mvqiSG+BuyKWAAo71nufPn00BMUCj4cffjjQUs838ioK4QDobTgY+cRkJXUV/SAMDBQzEB0LPc8fYOV4XEJJB9yDJWoUcte99wi6n7dNDByWJA5JrN1cty/IKsTFgJqABU4fcQ7EjW7IXvkW9DmWGvlT9jo2Lw5LLx+Q58/Pjn7PPvus7p9ExiLWJlmJ3E8erNY7/jKBtDdpLeWycF32SSUtJl3wW3aBsa/sDbp+NiUuuDdWGTlXZLzS56J76V6wtl2kILEnP3u5X3LJJWoBC6dzr5C95QnkGrlPm2EpN1zJC2YKMwSF+MYbb1Sfj3fG+yFtc7/V5gyAY97juQJtnPTkk+app59WHw/3QCxyf45R+C69ZqTrTZVTY5xqKfwtBb2G/VZ5owN/5xLcG9Am2sD1bV0YSD1ipRN+Jl5/h3iHs7I+EwerF1izOLeJydpzgb2f/YwLOX9p6G4zFuledNKkSeqF5zc4VskEOOqoozSNmbRXYl12kMLAMQpeYgiRB0f3yivkfhXLl5v5IiYYDPQm66y17bFt5rOQIsdsQWzjPIyKTsSFv8+998UdIlxfnZhMAO4dBCYymRh4x23UgmfCIY3IpBB6A+iWOE4J96CmWFUFAwDXBvflemlgVSxRiJMTJ+B0z4sBwoCz7d5779WEfTJCyRDFQZoJeOsUjjc2ZbWQ9tYRFbkqlSKiEQs8byYlX23zYtttt9UFLjLQzuDBg9Wh6T8nCqghQlS6eyNikRU4pC4LMWjhhQQWvKZYJrTuBX/SSSfpixzijKX0Q+3UZDpGFG71wHr1IGS0zETVl0hzzTW4ryiUqqMwQBZ0XIcOHXQZmkW+Bs8W//X52xZvfapjuSxeDBw4UPUmSwiinCtxsHUkfWjbkw7EEHBIw2ZFjxd42e19KBD0+PHj3aMJiAFRZ6WW3L82YYkl5owYMUIVu0cffdStdXQzU3KrcdnbZUG5BB3CggmUfdY1WpDUzxIxOJ9FPgeRyRRU39DFC/Lu77vvPkdUjFqve2N8WOI1evTorF9ZYgE3ZEnXpptuqoyFezzyyCPuUUdz/uGgbKlO+M6iDmFhEYk+ow0dMmSI1jGQFRUVujUgaw75O9dgA1XW6nFf1jdGIZ+E1ViLH0wA4nZMeAZddKAkgYl+qGsfWSic7VjZsSf+i/WImPRakMSQuScLe2FKFvK72ltFEhbAmkBpJeJt37aO8oci7vcpZQIi6Dj5ePk2KTH4UlAMpT2qoLP9ITHK37Ea/j5HYWesyGY97LDDNGcMZRwl3Gbd4mAmxspYZgruy9hjkGBAYdVjAFiQ80/KNpYmhovn2OqtIhlYYNOEbQ5PrsHiR2J/WBy8b5pYFw/A/WV21mp4EDjPtvW3gjDLzwsIi9QX8qvI2uWllVtssUXWjCAMjAHXxoUBkXvHTY7VfxAaz/agQYN0ZrHiONVGGn40NsKyHZwO0v1NHMKygCkwQeEy3CPoPpm0OR3I9es/CE2yIHt9UtIlqsaKdAk900HFz4QD9thjj03uAuQH3IMwDsQYdR8kBqEz4ovptj8OckpYiNE4jUTM4lBcExDGFfIBUonI4iT3Ca7Pe4jQWdMF7RXLUrND2b4qL0AUCjFkDRyivDHhjDPOCLRkcgUsFWsteb83tKsgn/e3IJuTHXBk2LTgzyImi1M6XfTv31+vgaPVe49cQMYlu70bcGby4vF99tkn+bAUNpbIBOxNxbt0uGaYhzcXxNSYCDJO8YINSXBcQhC2v/E74nNKB7zejxeN3nPPPW6No+nVV111lboW6JdMkTVhsSEGr8OwD4iX/IQTTtCQQSYgbMB18M3gOwmClygaY8kHofpBfjoSgk3gbN/jU6Jv4oJz8Ul5f8M7ebgWu9KkWuMQBblm/LfYy/nut9XAB0V+PCBjgb2bSCumPgpcK+h6LEvCl8UqEpTQ3xEMEvv2339/8+ijj2pWAjor+2Clo+txLn3s/Q3LxQBrHGzgOlOkdDfIDNQ0WJyjQQSDQ5WEM6w9sgLiAKLCGmHPd3wuhxxySHITL/6mo8KuFUaUDQ3bJjtQfOaqnVHuBtwLJFTaTdKyBYtXWMZFFoQfrGEkAZPjUVkc8typE/2IgKMw8to3bzwoWxByIHJOO3jNbDqAfTe24hVdYfX+Y0El6LzGAFQTm7zJsrAoHUzanFoUwm6hYkxdZke2kPvqJ9yPBaGAUEE6gBs0tgJXsSWs3n8sqASdFwekFlaLupX4lH6m0gfq7HE+00lHhFPxShrys1B5kGRRSCkKyVVnn1A2wSAXPFXIJQy8fYIYFkRkCYpl2YQEWDyRLeQ5VCQgRjNtY2MGkQry6nnO/v37qxPUC1EQEp+Vy82qioVm1YpfTOWyn0xNNe9rdkxRSUtT2rKDKW3W1hRLKShupr8REtbfpQIOVfxn7FNKuAjdLgzCPOKFdHB8MlhxZ48XNAiud/PNN2vAkpUjOOVyqZzDBdlfgA1Zhw8froFZL3Ghz/GKEN6I4V/ahY6I0xGPNnqkBdz5/fffV+OELEwL6lnXhw7iXxTCwlUIgBid1RFpG/02Y8YM3eOA32QSGGZBMesHuRbxVl4e4MWqigXmp88nm4q575jlC6YbZ+UvcnN4E0LJ5V8Fxaa4RWdTttb6plXPvUz73nuZ4tL0FlTw/KnGDsKKZRVmSlSA1OKTTz5ZB4lBZDdiZl0csHSJVGcIOwoQ77XXXqs7AU+ePLmOyIZw2M8KTzOeaiuOAS9k4hhhEq8Xm5Ut1BMk9656oT1wbgoEZkG2BlYt9exhZe9BvxEfJUUbTsNayUxgNx0hH71lqwQx2FWMi2a9Yr58/Ejz/WuXmyVfv2mcFUuED5WYgsIyEavFUkq0SGNM5dIfzOJZU82cF880s6acZpb+9IWSHYINDpbgfKv7xwvuH5chxCKsdIlKlE/lEOxiwtZGpHMwS1kDx5q4OOv2kOeskeMabLoRBR6W+/DqD5Y5+R+eTSsQxeTQs8DAPg8ZAeTn0z6OzZw5U+sBxIAVBKeBsCyhsOLZ1vMbO0m4PvVMHF6U5CVuFpYSl2PBBZtneAk7LhA977z9jnle9BsbY61e9qOZPfUCM2PS0WbVohmmtEUHU9SstSkoEm4pBAWHqqpxzMqqai1VMi4FUl/SvI0pLW9rfv1qqvl84gFm3gd3moJVdu2hFap1kQ4dxCKsdEGHQxCwbMDCyquvvlo3T4taU+gFsUQWXtCJ5P2kwvHHH69KJcToFTWIJ3bjA+SUsce5BVs1MdgA0WYXbKCYwr0gGnLFEIe2U2mXFbMQkiUsBt6KUjiWl/vRF4haQKoQ7wrKBP027mc2ZzFKQaFZsWSucJxTzC+fPiL6luiVQlAgQbSJUlW5zJS27Wm6/+l8s96frzRt199XdC72KBMCk39l5e1N85JCM+/ta8yc10ebmiomA8+ZHiMJQl4Ii8FEMech2V8AgmKVTtzAM78jsYwVKWyfxMreVMCSYutGv9geM2aMcibAu429m94jmuE0AOK3viAIC0OAdthENwsIzV4fw8MSFsRvX3LAJmb0gQUGBaIWoO8hZjPhWoBfVS5faGZPOdlUfPu+KS5ra5zCZkoo/EMZr5GzqqtXiKgsNt33uMx02vSvpkOfAWa93S4wrXvsaqqEO+lbZrleYbkpKW1tFnw03nzz2hVSw++zR04IC7bP4NnOQuQhkthzi1egkcnIgHMOBIf7goJYsYPu7Wg7cHAQ69nPBIgg+0o6xCQ7oXgBZ4WAADvXWRGNTod4pE2IVa8FBvFCxIBzLGHRZvQrQB2rv71A/4IDcy0v4acLp3ql+fbN64Wo3jMl5WvJjWsPIb3I1WsqV5hW62xjWnfpZ37874Pm8ydHCrdaaTpscqj8pLm00aO3FhSJGG1nFvz7djP/v+NMgXC0bJE1YeGOgIAYNPQqBoOQACyfHWJIb0bn4u2qpLDaRZEsR+c7BIhC7PeLeDvfPxCcm8oIgNjZXAQrDQsNa9QfOfC+CgTl2oLfYsEBfuvV2XCVWMLCt+NtA8q5nQgYEd7JgkVKqgrqwUUXXZQWcSlnSXw1i4Wgfv7iGVPaMvFOxdVHErBXdZwaIbz2xhECWv7jf8yCjx80i6Y/b5p37Guate8hs2eFnGt/K5ar6F7NW3U0c9/9h1m+aLZb6796fGRFWKyoxb+F9YbCyiy1HY34YAAYJNwLI0aMUB0IpRjLCG6FuMCa4hjbB0Ew3sEIA0SK7sW+pGHnoyxjidIe8r/RrfxmvrXQEGPepEMmgrVE+Y03bublOP4kOTis3d3Z7mNlwXVwQ8C54uiMXnifcP7HE02BU2lqCspEZAUTJ+o377wuKipTAnOkD0plclQvX2AKy1qK+GxjatQVsRrco1rEorNqsfl55vNKkNkgY8JC/yEQyrZDDB6ciY6zs9mCWYrLAWWW3WPwN+EW4PfsJINegkhhw1V0jzgzGQJFN2J/TfScIEDoWG4An49dGOIFjj7ENi4HL/F4OZaa9x5OB0ey23AT1/RzTd4LDahHiQ8C4p+Vx8Rg48D2yK/zPjSLv3rVFJag8wnxJKp9gERExxLCKm3dVURnlalZ9av0a6EQS5VwJplcxeWmGiuxcqXUJQiMa2kpKjE/f/mcqVqxOFmXCVIusQ8D3Am2DmfCEhs7dqzOei9hocMMHz5cOxJfFk5SBhnvO6KBQSATEuLgXAaCzAY4TBT4PVYcyjhWpp8Y8WsdeeSRKqpoH2LZq6tZLoOlRgAcz7/3GhAZ+7tjMSLiyRywz8X14KxMKByxPIOXE/KdfqENXAdR7+eUqAhwaYgfP5nfix4EWvzjh3eYiu8+EI7TWgacfxC1o9ZctViANdWr5PsKU7VymSnvurVZZ4dTVdea/5/7jVNVYYqEU7Xtubtp3W1r0w7naMsupmL+Z/qbQghOrojFWbl0vilbq6cp75Sw4DMgrtWrdNyK2GBWw2Gw9EiZCcp8QKdCbMH+2SA1bMN9PPJwP1aZoK8ROojiXBCGHTg/hwRwSPxlnAeBwTWjrucHv0PMwUlps1fH4hhiEg6Mtef3meELQ3fEMoRgibH6l7OhGvAaOODdajwMENVKEWPTHx1qqhfPMUWldgWVcB2x8ApL25jmbbooR0KZb9ahr+m8zfGmebse5vuPJph5b44xJcVFprKmwHTa+gTTfoOBpqxNV1Mo5y+Y8az5+oVzTVmpcMHCRLRg1bIFpnXvP5veg+7Qe6cr1qSPMl9MQYeiEOPNDiIqRNVbb72lyu+wYcOSm4NhhUFkzGq7ERscCJHEzGaRBTHFKEAk3D+IqOAyiFgIAPcBg+gnKtqAbgeXDPLqcz4ikEnjJxyO8UxwQP8xgJ5ldSivn8wLDAWblkKohvOiQOsrF8811UvnSh+tTieCQzXr+kfT+6CJZoMhk80GQ5/Rsu6eo01hcXOxBseZH96+NsExC4pNUYFjfnjrWjN9Yn/zxcRBpmLRLNNxwwNEod9IRPdq46mwuMRULf5Kro+CnxkyJqxUYPAgHNg8+TuWCFD08ekgChhYwGBBXLgk4IRxdv7zA0Ki8JZ3dB9wzDHHqH/KC85BbBOuQcx5wzW5AFYjnIpnwU8GF/brYezGh74JmIBej38YVi37yTiiExV4JhNKeefNDjEt2vcyi2b80/z40QMi9u4zc1670syYNMLMff0qUyzEVFhULM9dJdytwrTrtYtp1WUTs+z7j8yyH7DiRbFvs45cbLUyX4jHvmKRqVq+yK1JH3kjLAsG0gvEAoSErhLE6TIF14TTodgjJhFhiGAbDLZAn8O/hShD1FklPVdgAkE4iGl0MZR02uMFInTkyJHqbIUrxnIcJ/vR8hA+xfIrFq4pX38UPeqbqRebb4WoFk0bb1b+MlvaUmCcQmmHcOUVi380HfodaNr3PcAs/1msYRR4wjhCWMWlLTzXF0hfJqKGtccuHeSNsAhvIBYYSILA1k81ePBgdZpCANZTjTjiHD6Z8Tatht/ce++9mjLL3lreMEkQEKOY+QAL1abaeoFCjw8M0Ea7zXeuwETCALHPQJwziAPDMXnZAr40uHVK1BljKshSTXDDwpLmpqRZay2kyJS139CUdugnivxSU1DWzvQYcJMQ1UHmuzeuFm40XwiyNGEh6jXIwNDLJJG4XSMkLHQQRA3EgTLtFTlYj15LjEAwSi4iA8XX6mN0PLsDIk5wTyBaooDVad0PKO92cL1ARFudho3L0t0h2QJxCyHbCWPBM2HV8vJOgGESJtqxjL2pOlEguFwoCrglpNVI9CH3JUyjnyLWSsrbmV4DbzI9B99lNjjwPrEIW5lZz55sKpctNMUlhICE27WQe4uyj9jzOi/4Pek0q42E9JFXUcgGH3AETHPCHXAlP9Av0LfgIhAC/ixLcKNGjUpuNc3udOhqYcBQsJ50fFaIwSAgduBkED7iyOu/Sge4Ogg833LLLW7NatB+tsmmvbzIyRufzATwjZIWHeS/lkm/U11In2m3FahOtfjr183MZ/9m2v5hB1Mx/1Mz+7nTTM2qJeoDSwi5QlNW3onGCrHNl4/VpFBTXWWKytsLcdXNe4+LvO/dQBAZFwLchsHErwWnwLsNR8LHhIhjluPwxM8FFyAcw443gAF64403dIaHAX8UCYVYaoRTCBuFAQ6C3mM5Y7pAdGAUQPToUxghdjJ4wX1Q4i3xBp0TBxAWsb3Zz55olsx8WdSjRBYGvqv1Btxo2vXc00yfdIxZ8t17ci/inRAOBLPQtOy2uan8VSxK0acKSsqlvsY4K381JW16mt5/ud9Urlxs/vfQX00ZUrEQK9cRQ2Gh6bTdiab7jmfpvdPlPtI/+d+7AecifilCKogg/DZwCrIhIR6ICmIiAwLdBLBjCi8BArgMMMmjiAoQZEanY79TXBdRwFLNlKgABGIzIbDqwkQd98F44PwoorIGDiEm/GdBIFGv7fp7m6qaKiUOMhjcI/o/3MhZschUr1go5WdTI9+LigrNsu/e1+Q+p3q5qVm+wFRjXRaVm7V3OMUUCxec/+G9ouRWqJIPOdaI9VjcqrPpsMEgZYCZTYV64Fh0GoVgMHlRcBXEHtYTSiued+KNWEjUsQc53mosN3532WWXmXPOOSelyMJNAQdBZwlaupRrMAkITdFm9KhU0YJUuP3221Wf5FnZfdn7vJaEqqsqzKcPDFACKSJnXYipx363mTY9djPfvD7aLP/hE9HDiA/S5wmvvCUM5WFCPM3ar286bnygad6ut1k04znz1T/PEQJM+AQ5t7JypWn1hx1Nr33HihGQGVnI/RvmXTpYf8xgxIQfODfPO+887Rx8PXjusx20dMG9QRSX4ZVqcFzENMYHEyNToBbwrBgD6GRwb68rhtZQ4E3ff3iP+f6ta01JaQvjVC0z7Tc/yqy9zfEarllNROFwCPmsWGyWzP1AXRNO5ZIEkeoz18jYrDK99rvFtFtvF/mL/K700WCEFQb0Md63jHhEV8IStEHd+gSZFliicA4SDv1gELAKMUYwTkgTyhZwaJzHcHC4oT++aLFSRNmMycea6oWfmQKx3ETNNq26bqOcKEEcQl7JCSGfLpVRhbW3aslcs2LBdP0slIOFbhiHE6ukrnW/Q0yPva7MmFuBRkVYiBP0MBvxv/zyy9WyAlGcIy4QlXfeeafqPYSY/I5TC9wRiGjcFhAWXno/GMA4bUoMdCLDA2OBuGVYvj/n0kbahVgKAyJt0eyXzcwnjjKlzRPLuKoqlwsnWmUcaRLpMom7EqTWHySBO6KosEh+wz0SmbaJs0TRX77QOCWtzSZHTjGlrbomfpshIKy8K+9xgPebmB5xNR6WiD8pLfrgMQYwDnAL4P4499xzNTkxDOSIQVxYpnwGIW6bOA8LlbRsAs24Qyyx+cG5NocNfTTMIEBrWkuswJ4Db9I3ZJCwV1ZSZsqatzTNm7U0zZq3ksJba/mUv8vlU0oZn/J3aVlz4Ybe9O0asRiXmpK2PUyfg+5XovJ7yjJBoyAsMkhJIRbuqdwCIstGZ/EDSws/lw2thA0uwMqziPKbxQX6E4AD0oagoLcXED3qAItDrA/PCxybkFfHjf5ieg64yRQ0byNGnVh6Ul0jYrFGh7RIzqAUu5+I1UThu8vLDKnKlUu+N2UdN5Jr3Whad95UjwQL4fTQ4IRFh+NasLnvOEtxhuYSrKbBlIegcDNEbaDh9e7HCrWkABEGK3bRo8LcCRbkaBHuIgOEpWpMtrpA3NWYdmIN9trvH6a02w5m+a/zVSRCesKOEp8BJcGpakSB/9WsWlFhWvUbYnrvf5dp0amvHOZYbtDghEX+N555wNvqsQijdAzA4OCURGxZjhAFjAFihABlOyroi1UGMWA0RDlZ44IoAIsoAOnYqTgWDlf0QJ4LhzGTwovE0CeIpLqg0LTovJnpd8gjwnFuMM1If6mGaJaqeMOB6lRWmBopfKeucuVS5Wwt19vZbHjQA6b3vteY4uZrCaHmjqgUKO8ykxsM7FwiFpBuM8n7XeKAjfOF6zjdu3d33n//fbc2HMINdbecPfbYw+HVHmGQvtBP0fV0dzv7d7bgdXX77ruvM2bMmFob8AdB9E1n+PDhKu+Ki4udCRMmuEeiUSP/VlUsdJb+MM354ZOJzjf/GuXMnHKCM+PpEVpmP3+KM+eNK52F059zlv30P6dqZWab48WB9Ft2O/rlAnQkb70QURV7IHfYYYeEoiFl6tSpbm00uI9wLt0iqL7Bc0HcYvW5NdFgr1EmG8/32GOPubXR4Klq5H96sKamyqmuWuFUV1Y41auWJYp8r6mS+0tb9Bz33HwAwmpUfqw4YGUQGRAA0YnvK9NAcrawS+rJkCCclEuQWoT4RjSHuUa8gAot+B4m2PzHciwAFUJb+XnDar6wYMGC5L6bLVu2dN599133SDTGjx+v4qgqiw1b/UCknXzyyc66667rDBs2LON9V4MQl3M3VsCxGoW7IS7Ym8ku6SItJs4+ECQKEvQmP9+mLOcCGAS4BrA22YuBGGeusNrHlAAuEH/eV2NHkyEsnIbE0HCm4uMiiTCVrwsLDG87zkb2SQ1zOmYCnJn2/vjHaFeuITNfExYJGRFDtX64poAmQ1gQCcQlnFY5VZwYIu4Iy+FI7gtbfpYJ0HtI4IO7MOCEY3INuBS+L4iW5WRNiWs1GcLCscmsxStPVgFJg36R4QdZB5ZLkQ4Nl8kVMBggLHxuEFYqx2cm4B7kopFJSygqzr5ijQVNhrAgou22207zs3AipiIqHIzsuAeng7vAsVJZj+hNbBHOmsNUhAJBYQnyybn8Ni6wJmkX3DcVcLCSp8V2lameuTGhSSnv6YDBs555uBvp0KkGhjAKcTrep8jOOamAaIWwEIO4HdCJUsFuNYnul0q0NSVC8mONJSxEoOUicZZ5McjsTkPs0pZUIFMVwoJ4SbuOQ1iIczJPCdfk0phobFhjCQsuxSoaRCB5VamWWaEnseAV8USSIfG6VEDvg6vwG/9eWWFgFRLrKVlX2JR0prQhndFkHKTpQjiCviFfntGtCcfixYud3XffXZ2vOD2nTZvmHgnH66+/7gjX0t/wginCRnGAozdueKcpQvq7aTlI0wUcgRSZOLoKy95JC4ZTbb/99roRbiqwKJVd/BCJrDSKE3oBKP1xz22qaHKxwnwDJRyxGbTQIwzkcEXleP3WIExraYEorVVFYZn7v+N3ZABoCo7FZlS58xz+jt9hTMX/A/eR72+RaQ9jAAAAAElFTkSuQmCC";
  const githubMark = `<svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>`;
  var root_1$8 = /* @__PURE__ */ template(`<div data-theme="skeleton"><section class="overflow-hidden h-full"><!></section> <div class="absolute top-2 right-2 z-1 select-none flex items-center gap-1"><a target="_blank" href="https://github.com/drunkg00se/Pixiv-Downloader" class="w-5 fill-current"><!></a> <button class="btn-icon btn-icon-sm bg-transparent font-bold hover:text-xl">✕</button></div></div>`);
  function ModalWrapper($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $modalStore = () => store_get(modalStore, "$modalStore", $$stores);
    let padding = prop($$props, "padding", 3, "py-6 px-8"), width = prop($$props, "width", 3, "w-full md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg"), height = prop($$props, "height", 3, ""), classProp = prop($$props, "class", 3, "");
    const classes = /* @__PURE__ */ derived$1(() => `${padding()} ${width()} ${height()} ${classProp()}`);
    const modalStore = getModalStore();
    var fragment = comment();
    var node = first_child(fragment);
    {
      var consequent = ($$anchor2) => {
        var div = root_1$8();
        var section = child(div);
        var node_1 = child(section);
        snippet(node_1, () => $$props.children);
        reset(section);
        var div_1 = sibling(section, 2);
        var a = child(div_1);
        var node_2 = child(a);
        html(node_2, () => githubMark);
        reset(a);
        var button = sibling(a, 2);
        button.__click = function(...$$args) {
          var _a;
          (_a = $$props.parent.onClose) == null ? undefined : _a.apply(this, $$args);
        };
        reset(div_1);
        reset(div);
        template_effect(() => set_class(div, `relative rounded-container-token shadow-xl bg-scroll ${get$1(classes) ?? ""}`));
        append($$anchor2, div);
      };
      if_block(node, ($$render) => {
        if ($modalStore()[0]) $$render(consequent);
      });
    }
    append($$anchor, fragment);
    pop();
    $$cleanup();
  }
  delegate(["click"]);
  var on_click$2 = (_, showCreditCode) => set(showCreditCode, !get$1(showCreditCode));
  var root_1$7 = /* @__PURE__ */ template(`<header class="modal-header text-2xl font-bold"></header> <article class="modal-body mt-4"><p class="mb-2">本次更新修复了测试版Pixiv中的几个问题。</p> <h4 class=" text-xl mt-2">修复</h4> <ul class="list-disc list-inside leading-loose"><li>测试版Pixiv中，开启“下载作品时点赞 / 下载作品时收藏”功能时无法下载作品的问题。</li> <li>测试版Pixiv中，预览原图时下载按钮不显示的问题。</li> <li>测试版Pixiv中，仅可由链接浏览作品不显示下载按钮的问题。</li></ul></article> <footer class="modal-footer mt-4"><div class="flex justify-between items-center text-sm"><button> </button> <a target="_blank" href="https://github.com/drunkg00se/Pixiv-Downloader/issues"> </a></div> <div><div class="flex justify-center items-center min-h-0 gap-14 overflow-hidden"><img alt="credit" class="rounded-full"> <p class="flex flex-col h-full justify-evenly"><a href="https://github.com/drunkg00se/Pixiv-Downloader" target="_blank" class="anchor"> </a> <span> </span></p></div></div></footer>`, 1);
  function Changelog($$anchor, $$props) {
    push($$props, true);
    const anchorFocus = `focus:!outline-none focus:decoration-wavy`;
    const anchor = `leading-loose anchor underline-offset-2 ${anchorFocus}`;
    let showCreditCode = state(false);
    const gridRows = /* @__PURE__ */ derived$1(() => get$1(showCreditCode) ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]");
    ModalWrapper($$anchor, {
      get parent() {
        return $$props.parent;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = root_1$7();
        var header = first_child(fragment_1);
        header.textContent = `Pixiv Downloader ${"1.8.2"}`;
        var footer = sibling(header, 4);
        var div = child(footer);
        var button = child(div);
        set_class(button, clsx(anchor));
        button.__click = [on_click$2, showCreditCode];
        var text2 = child(button, true);
        template_effect(() => set_text(text2, t("changelog.credit")));
        reset(button);
        var a = sibling(button, 2);
        set_class(a, clsx(anchor));
        var text_1 = child(a, true);
        template_effect(() => set_text(text_1, t("changelog.feedback")));
        reset(a);
        reset(div);
        var div_1 = sibling(div, 2);
        var div_2 = child(div_1);
        var img = child(div_2);
        set_attribute(img, "src", creditCode);
        var p = sibling(img, 2);
        var a_1 = child(p);
        var text_2 = child(a_1, true);
        template_effect(() => set_text(text_2, t("changelog.give_me_a_star")));
        reset(a_1);
        var span = sibling(a_1, 2);
        var text_3 = child(span, true);
        template_effect(() => set_text(text_3, t("changelog.buy_me_a_drink")));
        reset(span);
        reset(p);
        reset(div_2);
        reset(div_1);
        reset(footer);
        template_effect(() => set_class(div_1, `grid transition-[grid-template-rows] duration-[400ms] ${get$1(gridRows) ?? ""}`));
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    });
    pop();
  }
  delegate(["click"]);
  const nonNegativeInt = (node, params) => {
    if (!(node instanceof HTMLInputElement) || node.type !== "number")
      throw new Error('Node should be an HTMLInputElement with a `type` of "number".');
    const resetStore = (newVal) => {
      if ("key" in params) {
        const { key, store } = params;
        store.update((currentVal) => {
          if (typeof newVal === "number") {
            return { ...currentVal, [key]: newVal };
          } else {
            return currentVal;
          }
        });
      } else {
        params.update((currentVal) => {
          if (typeof newVal === "number") {
            if (currentVal === newVal) {
              node.value = "" + newVal;
            }
            return newVal;
          } else {
            const nodeValToNumber = node.value === "" ? null : +node.value;
            nodeValToNumber !== currentVal && (node.value = typeof currentVal === "number" ? "" + currentVal : "");
            return currentVal;
          }
        });
      }
    };
    node.addEventListener("input", (evt) => {
      const el = evt.currentTarget;
      const { min, max, value } = el;
      const minVal = min === "" ? 0 : +min;
      const maxVal = max === "" ? null : +max;
      if (!el.checkValidity()) {
        if (/^[0-9]+$/.test(value)) {
          const numVal = +value;
          if (numVal < minVal) {
            resetStore(minVal);
          } else if (maxVal && numVal > maxVal) {
            resetStore(maxVal);
          }
        } else {
          resetStore();
        }
      }
    });
    node.addEventListener("blur", (evt) => {
      const el = evt.currentTarget;
      const { min, value } = el;
      const minVal = min === "" ? 0 : +min;
      if (value === "") {
        resetStore(minVal);
      }
    });
    return {};
  };
  const defaultData = {
    selectedFilters: null,
    blacklistTag: [],
    whitelistTag: [],
    downloadAllPages: true,
    pageStart: 1,
    pageEnd: 1,
    retryFailed: false
  };
  const STORAGE_KEY = "pdl-downloader_option";
  const saveData = localStorage.getItem(STORAGE_KEY);
  const storeData = saveData ? JSON.parse(saveData) : defaultData;
  function storeBuilder(data) {
    const obj = {};
    for (const key in defaultData) {
      if (!(key in data)) {
        obj[key] = writable(defaultData[key]);
      } else {
        obj[key] = writable(data[key]);
      }
    }
    return obj;
  }
  const optionStore = storeBuilder(storeData);
  const watchStoreData = derived(Object.values(optionStore), (data) => {
    const obj = {};
    Object.keys(optionStore).forEach((key, idx) => {
      obj[key] = data[idx];
    });
    return obj;
  });
  watchStoreData.subscribe((val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  });
  const downloadSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z"></path></svg>`;
  const stopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"></path></svg>
`;
  const playSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,16.5L16,12L10,7.5V16.5Z" /></svg>`;
  const stopOutLineSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M9,9V15H15V9" /></svg>`;
  const downloadMultipleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9,1V7H5L12,14L19,7H15V1H9M5,16V18H19V16H5M5,20V22H19V20H5Z" /></svg>`;
  var root_3$5 = /* @__PURE__ */ template(`<!> <!> <!>`, 1);
  var root_12 = /* @__PURE__ */ template(`<label class="btn !py-2 rounded-none !transform-none cursor-pointer variant-soft-surface has-[:checked]:!variant-filled-primary text-sm w-full"><div class="w-0 h-0 overflow-hidden hidden"><input type="checkbox"></div> <div class="!m-0"> </div></label>`);
  var root_11$1 = /* @__PURE__ */ template(`<div class="flex justify-end items-center my-4"><div class="btn-group w-full"></div></div>`);
  var root_13 = /* @__PURE__ */ template(`<!> <!>`, 1);
  var root_10$1 = /* @__PURE__ */ template(`<!> <div class="flex justify-between items-center my-4 gap-4"><div class="flex-grow w-full"><!></div> <div class="flex justify-between items-center gap-4 w-full"><label class="input-group input-group-divider flex [&amp;>input]:!min-w-0 [&amp;>input]:!border-transparent border-surface-400/20 dark:border-surface-500/20 bg-surface-400/20 dark:bg-surface-500/20"><div class="input-group-shim !px-1 flex-none"><i class="w-6 fill-current"><!></i></div> <input class="w-20 pr-0 text-surface-700-200-token text-sm" type="number" min="1" step="1"></label> <label class="input-group input-group-divider flex [&amp;>input]:!min-w-0 [&amp;>input]:!border-transparent border-surface-400/20 dark:border-surface-500/20 bg-surface-400/20 dark:bg-surface-500/20"><div class="input-group-shim !px-1 flex-none"><i class="w-6 fill-current"><!></i></div> <input class="w-20 pr-0 text-surface-700-200-token text-sm" type="number" min="1" step="1"></label></div></div>`, 1);
  var root_17 = /* @__PURE__ */ template(`<!> <!>`, 1);
  var root_19 = /* @__PURE__ */ template(`<div class="flex justify-between items-center text-base text-surface-700-200-token"><p> </p> <!></div>`);
  var root_2$4 = /* @__PURE__ */ template(`<div class="downloader-filter"><!> <hr class="!border-t-1 my-4"></div>`);
  var on_click$1 = (_, startDownload, id) => {
    startDownload(id());
  };
  var root_23 = /* @__PURE__ */ template(`<button class="btn rounded-none !transform-none !variant-filled-primary"><i class="w-5"><!></i> <span> </span></button>`);
  var root_21 = /* @__PURE__ */ template(`<div class=" flex-none btn-group self-start"></div>`);
  var on_click_1 = (__1, startDownload, batchDownloadEntries) => {
    var _a;
    startDownload(((_a = get$1(batchDownloadEntries)) == null ? undefined : _a[0][0]) ?? "");
  };
  var root_25 = /* @__PURE__ */ template(`<button class="btn variant-filled-primary self-start"><i class="w-5"><!></i> <span> </span></button>`);
  var root_20 = /* @__PURE__ */ template(`<div class="flex justify-end flex-grow w-full gap-4"><div class="flex flex-grow flex-col justify-between overflow-hidden text-surface-700-200-token"><p class="truncate"> </p> <p class="break-words"> </p></div> <!></div>`);
  var on_click_2 = (__2, abort) => {
    abort();
  };
  var root_26 = /* @__PURE__ */ template(`<div class="flex flex-grow w-full gap-6 items-center"><div class="flex flex-grow flex-col justify-between h-full overflow-hidden"><!> <div class="flex items-center justify-between gap-4 basis-0 text-surface-700-200-token"><p class="truncate"> </p> <p class=" flex-none"> </p></div></div> <button class="btn variant-filled-primary"><i class="w-5"><!></i> <span> </span></button></div>`);
  var root_1$6 = /* @__PURE__ */ template(`<div data-theme="skeleton" class="card px-4 fixed right-20 top-36 w-[600px] *:text-sm shadow-xl bg-scroll"><!> <div class="flex relative my-4"><!></div></div>`);
  var on_click_3 = (__3, showMenu) => {
    set(showMenu, !get$1(showMenu));
  };
  var root_29 = /* @__PURE__ */ template(`<img alt="batch download" class="object-cover object-center size-full">`);
  var root_30 = /* @__PURE__ */ template(`<div class="!absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><!></div>`);
  var root_31 = /* @__PURE__ */ template(`<div class="flex flex-col justify-center items-center px-3 font-bold text-[12px] leading-[14px] overflow-hidden text-surface-700-200-token"><span class=" truncate max-w-full"> </span> <hr class="!border-t-1 my-[1px] self-stretch !border-surface-700 dark:!border-surface-200"> <span class=" truncate max-w-full"> </span></div>`);
  var root_33 = /* @__PURE__ */ template(`<i class="w-6 fill-slate-700 dark:fill-slate-200 mix-blend-hard-light mt-4"><!></i>`);
  var root_27 = /* @__PURE__ */ template(`<div class="size-14 rounded-full fixed right-4 top-36 drop-shadow-xl cursor-pointer hover:brightness-110 backdrop-blur-sm"><div data-theme="skeleton" class="avatar absolute -z-10 size-14 rounded-full overflow-hidden bg-scroll transition-opacity duration-[250ms]"><!></div> <!> <div class="size-14 flex justify-center items-center relative"><!></div></div>`);
  var root$7 = /* @__PURE__ */ template(`<!> <!>`, 1);
  function Downloader$1($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $downloading = () => store_get(downloading, "$downloading", $$stores);
    const $successd = () => store_get(successd, "$successd", $$stores);
    const $failed = () => store_get(failed, "$failed", $$stores);
    const $excluded = () => store_get(excluded, "$excluded", $$stores);
    const $artworkCount = () => store_get(artworkCount, "$artworkCount", $$stores);
    const $selectedFilters = () => store_get(selectedFilters, "$selectedFilters", $$stores);
    const $downloadAllPages = () => store_get(downloadAllPages, "$downloadAllPages", $$stores);
    const $pageStart = () => store_get(pageStart, "$pageStart", $$stores);
    const $pageEnd = () => store_get(pageEnd, "$pageEnd", $$stores);
    const $blacklistTag = () => store_get(blacklistTag, "$blacklistTag", $$stores);
    const $whitelistTag = () => store_get(whitelistTag, "$whitelistTag", $$stores);
    const $retryFailed = () => store_get(retryFailed, "$retryFailed", $$stores);
    const $log = () => store_get(log, "$log", $$stores);
    const binding_group_1 = [];
    const {
      artworkCount,
      successd,
      failed,
      excluded,
      downloading,
      log,
      batchDownload,
      abort
    } = $$props.useBatchDownload();
    const {
      selectedFilters,
      blacklistTag,
      whitelistTag,
      downloadAllPages,
      pageStart,
      pageEnd,
      retryFailed
    } = optionStore;
    initFilterStore();
    let batchDownloadEntries = state(null);
    let startDownloadEl;
    let stopDownloadEl;
    let avatarEl;
    let avatarProgressEl;
    let avatarDownloadIcon;
    const avatarCache = {};
    let nextAvatarUrl;
    let avatarUpdated = state(undefined);
    let menuTabSet = state(0);
    let showMenu = state(false);
    watchUrlChange();
    onUrlChange(location.href);
    downloading.subscribe((val) => {
      if (val) {
        if (!get$1(avatarUpdated)) updateAvatarSrc(location.href);
        window.addEventListener("beforeunload", beforeUnloadHandler);
      } else {
        window.removeEventListener("beforeunload", beforeUnloadHandler);
        nextAvatarUrl && get$1(batchDownloadEntries) && updateAvatarSrc(nextAvatarUrl);
      }
    });
    const showDownloader = /* @__PURE__ */ derived$1(() => $downloading() || !!get$1(batchDownloadEntries));
    const processed = /* @__PURE__ */ derived$1(() => $successd().length + $failed().length + $excluded().length);
    const downloadProgress = /* @__PURE__ */ derived$1(() => $artworkCount() ? get$1(processed) / $artworkCount() * 100 : undefined);
    const downloadResult = /* @__PURE__ */ derived$1(() => !$downloading() && $artworkCount() ? `Completed: ${$successd().length}. Failed: ${$failed().length}. Excluded: ${$excluded().length}.` : "");
    user_effect(() => {
      if (!get$1(showDownloader)) set(showMenu, false);
    });
    function initFilterStore() {
      Array.isArray($selectedFilters()) || store_set(selectedFilters, proxy($$props.downloaderConfig.filterOption.filters.filter((filter) => filter.checked).map((filter) => filter.id)));
    }
    async function updateAvatarSrc(url) {
      if (!$$props.downloaderConfig.avatar) return;
      if ($downloading() && get$1(avatarUpdated) !== undefined) {
        nextAvatarUrl = url;
        return;
      }
      let src;
      if (typeof $$props.downloaderConfig.avatar === "string") {
        src = $$props.downloaderConfig.avatar;
      } else {
        if (url in avatarCache) {
          src = avatarCache[url];
        } else {
          src = await $$props.downloaderConfig.avatar(url);
          avatarCache[url] = src;
        }
      }
      if (!src || avatarEl && avatarEl.src === src) return;
      let imageLoaded;
      set(avatarUpdated, proxy(new Promise((resolve) => {
        imageLoaded = resolve;
      })));
      const el = document.createElement("img");
      el.src = src;
      el.onload = () => {
        imageLoaded(src);
      };
    }
    function onUrlChange(url) {
      logger.info("Navigating to ", url);
      if (!$$props.downloaderConfig) return;
      const { pageOption } = $$props.downloaderConfig;
      const generatorOptionEntries = [];
      for (const key in pageOption) {
        const item = pageOption[key];
        const { match: matchPattern } = item;
        if (typeof matchPattern === "string") {
          url.match(matchPattern) && generatorOptionEntries.push([key, item]);
        } else if (typeof matchPattern === "function") {
          matchPattern(url) && generatorOptionEntries.push([key, item]);
        } else {
          matchPattern.test(url) && generatorOptionEntries.push([key, item]);
        }
      }
      if (generatorOptionEntries.length) {
        set(batchDownloadEntries, proxy(generatorOptionEntries));
        updateAvatarSrc(url);
      } else {
        set(batchDownloadEntries, null);
        nextAvatarUrl = "";
      }
    }
    function watchUrlChange() {
      if ("navigation" in window) {
        let prevUrl;
        let nextUrl;
        navigation.addEventListener("navigatesuccess", () => {
          prevUrl !== nextUrl && onUrlChange(nextUrl);
        });
        navigation.addEventListener("navigate", (evt) => {
          prevUrl = location.href;
          nextUrl = evt.destination.url;
        });
      } else {
        const rewrite = (type) => {
          const oriHistory = history[type];
          return function(...args) {
            const currentUrl = location.href;
            const res = oriHistory.apply(this, args);
            const navigateUrl = location.href;
            currentUrl !== navigateUrl && onUrlChange(navigateUrl);
            return res;
          };
        };
        history.pushState = rewrite("pushState");
        history.replaceState = rewrite("replaceState");
      }
    }
    function beforeUnloadHandler(evt) {
      evt.preventDefault();
      evt.returnValue = true;
    }
    async function startDownload(id) {
      try {
        await batchDownload(id);
      } catch (error) {
        logger.error(error);
      }
    }
    var fragment = root$7();
    var node = first_child(fragment);
    {
      var consequent_10 = ($$anchor2) => {
        var div = root_1$6();
        var node_1 = child(div);
        {
          var consequent_5 = ($$anchor3) => {
            var div_1 = root_2$4();
            var node_2 = child(div_1);
            TabGroup(node_2, {
              regionList: "text-surface-700-200-token",
              class: "text-sm",
              children: ($$anchor4, $$slotProps) => {
                var fragment_1 = root_3$5();
                var node_3 = first_child(fragment_1);
                Tab(node_3, {
                  name: "category",
                  value: 0,
                  get group() {
                    return get$1(menuTabSet);
                  },
                  set group($$value) {
                    set(menuTabSet, proxy($$value));
                  },
                  children: ($$anchor5, $$slotProps2) => {
                    next();
                    var text$1 = text();
                    template_effect(() => set_text(text$1, t("downloader.category.tab_name")));
                    append($$anchor5, text$1);
                  },
                  $$slots: { default: true }
                });
                var node_4 = sibling(node_3, 2);
                {
                  var consequent = ($$anchor5) => {
                    Tab($$anchor5, {
                      name: "tag_filter",
                      value: 1,
                      get group() {
                        return get$1(menuTabSet);
                      },
                      set group($$value) {
                        set(menuTabSet, proxy($$value));
                      },
                      children: ($$anchor6, $$slotProps2) => {
                        next();
                        var text_1 = text();
                        template_effect(() => set_text(text_1, t("downloader.tag_filter.tab_name")));
                        append($$anchor6, text_1);
                      },
                      $$slots: { default: true }
                    });
                  };
                  if_block(node_4, ($$render) => {
                    if (!!$$props.downloaderConfig.filterOption.enableTagFilter) $$render(consequent);
                  });
                }
                var node_5 = sibling(node_4, 2);
                Tab(node_5, {
                  name: "tag_filter",
                  value: 2,
                  get group() {
                    return get$1(menuTabSet);
                  },
                  set group($$value) {
                    set(menuTabSet, proxy($$value));
                  },
                  children: ($$anchor5, $$slotProps2) => {
                    next();
                    var text_2 = text();
                    template_effect(() => set_text(text_2, t("downloader.others.tab_name")));
                    append($$anchor5, text_2);
                  },
                  $$slots: { default: true }
                });
                append($$anchor4, fragment_1);
              },
              $$slots: {
                default: true,
                panel: ($$anchor4, $$slotProps) => {
                  var fragment_6 = comment();
                  var node_6 = first_child(fragment_6);
                  {
                    var consequent_2 = ($$anchor5) => {
                      var fragment_7 = root_10$1();
                      var node_7 = first_child(fragment_7);
                      {
                        var consequent_1 = ($$anchor6) => {
                          var div_2 = root_11$1();
                          var div_3 = child(div_2);
                          each(div_3, 21, () => $$props.downloaderConfig.filterOption.filters, index, ($$anchor7, $$item) => {
                            let id = () => get$1($$item).id;
                            let name = () => get$1($$item).name;
                            var label = root_12();
                            var div_4 = child(label);
                            var input = child(div_4);
                            remove_input_defaults(input);
                            var input_value;
                            reset(div_4);
                            var div_5 = sibling(div_4, 2);
                            var text_3 = child(div_5, true);
                            reset(div_5);
                            reset(label);
                            template_effect(() => {
                              if (input_value !== (input_value = id())) {
                                input.value = null == (input.__value = id()) ? "" : id();
                              }
                              set_text(text_3, name());
                            });
                            bind_group(
                              binding_group_1,
                              [],
                              input,
                              () => {
                                id();
                                return $selectedFilters();
                              },
                              ($$value) => store_set(selectedFilters, $$value)
                            );
                            append($$anchor7, label);
                          });
                          reset(div_3);
                          reset(div_2);
                          append($$anchor6, div_2);
                        };
                        if_block(node_7, ($$render) => {
                          if ($$props.downloaderConfig.filterOption.filters.length) $$render(consequent_1);
                        });
                      }
                      var div_6 = sibling(node_7, 2);
                      var div_7 = child(div_6);
                      var node_8 = child(div_7);
                      RadioGroup(node_8, {
                        regionLabel: "text-surface-700-200-token",
                        active: "variant-filled-primary",
                        background: "bg-surface-400/20 dark:bg-surface-500/20",
                        border: "",
                        display: "flex",
                        children: ($$anchor6, $$slotProps2) => {
                          var fragment_8 = root_13();
                          var node_9 = first_child(fragment_8);
                          RadioItem(node_9, {
                            class: "text-sm !py-[7px]",
                            name: "justify",
                            value: true,
                            get group() {
                              mark_store_binding();
                              return $downloadAllPages();
                            },
                            set group($$value) {
                              store_set(downloadAllPages, proxy($$value));
                            },
                            children: ($$anchor7, $$slotProps3) => {
                              next();
                              var text_4 = text();
                              template_effect(() => set_text(text_4, t("downloader.category.filter.download_all_pages")));
                              append($$anchor7, text_4);
                            },
                            $$slots: { default: true }
                          });
                          var node_10 = sibling(node_9, 2);
                          RadioItem(node_10, {
                            class: "text-sm !py-[7px]",
                            name: "justify",
                            value: false,
                            get group() {
                              mark_store_binding();
                              return $downloadAllPages();
                            },
                            set group($$value) {
                              store_set(downloadAllPages, proxy($$value));
                            },
                            children: ($$anchor7, $$slotProps3) => {
                              next();
                              var text_5 = text();
                              template_effect(() => set_text(text_5, t("downloader.category.filter.download_selected_pages")));
                              append($$anchor7, text_5);
                            },
                            $$slots: { default: true }
                          });
                          append($$anchor6, fragment_8);
                        },
                        $$slots: { default: true }
                      });
                      reset(div_7);
                      var div_8 = sibling(div_7, 2);
                      var label_1 = child(div_8);
                      var div_9 = child(label_1);
                      var i = child(div_9);
                      var node_11 = child(i);
                      html(node_11, () => playSvg);
                      reset(i);
                      reset(div_9);
                      var input_1 = sibling(div_9, 2);
                      remove_input_defaults(input_1);
                      action(input_1, ($$node, $$action_arg) => nonNegativeInt == null ? undefined : nonNegativeInt($$node, $$action_arg), () => pageStart);
                      effect(() => bind_value(input_1, $pageStart, ($$value) => store_set(pageStart, $$value)));
                      reset(label_1);
                      var label_2 = sibling(label_1, 2);
                      var div_10 = child(label_2);
                      var i_1 = child(div_10);
                      var node_12 = child(i_1);
                      html(node_12, () => stopOutLineSvg);
                      reset(i_1);
                      reset(div_10);
                      var input_2 = sibling(div_10, 2);
                      remove_input_defaults(input_2);
                      action(input_2, ($$node, $$action_arg) => nonNegativeInt == null ? undefined : nonNegativeInt($$node, $$action_arg), () => pageEnd);
                      effect(() => bind_value(input_2, $pageEnd, ($$value) => store_set(pageEnd, $$value)));
                      reset(label_2);
                      reset(div_8);
                      reset(div_6);
                      template_effect(() => {
                        input_1.disabled = $downloadAllPages();
                        input_2.disabled = $downloadAllPages();
                      });
                      append($$anchor5, fragment_7);
                    };
                    var alternate_1 = ($$anchor5) => {
                      var fragment_11 = comment();
                      var node_13 = first_child(fragment_11);
                      {
                        var consequent_3 = ($$anchor6) => {
                          var fragment_12 = root_17();
                          var node_14 = first_child(fragment_12);
                          var placeholder = /* @__PURE__ */ derived$1(() => t("downloader.tag_filter.placeholder.blacklist_tag"));
                          InputChip(node_14, {
                            allowUpperCase: true,
                            name: "blacklist",
                            chips: "variant-filled-primary",
                            get placeholder() {
                              return get$1(placeholder);
                            },
                            get value() {
                              mark_store_binding();
                              return $blacklistTag();
                            },
                            set value($$value) {
                              store_set(blacklistTag, proxy($$value));
                            }
                          });
                          var node_15 = sibling(node_14, 2);
                          var placeholder_1 = /* @__PURE__ */ derived$1(() => t("downloader.tag_filter.placeholder.whitelist_tag"));
                          InputChip(node_15, {
                            allowUpperCase: true,
                            name: "whitelist",
                            chips: "variant-filled-primary",
                            get placeholder() {
                              return get$1(placeholder_1);
                            },
                            class: "my-4",
                            get value() {
                              mark_store_binding();
                              return $whitelistTag();
                            },
                            set value($$value) {
                              store_set(whitelistTag, proxy($$value));
                            }
                          });
                          append($$anchor6, fragment_12);
                        };
                        var alternate = ($$anchor6) => {
                          var fragment_13 = comment();
                          var node_16 = first_child(fragment_13);
                          {
                            var consequent_4 = ($$anchor7) => {
                              var div_11 = root_19();
                              var p = child(div_11);
                              var text_6 = child(p, true);
                              template_effect(() => set_text(text_6, t("downloader.others.options.retry_failed")));
                              reset(p);
                              var node_17 = sibling(p, 2);
                              SlideToggle(node_17, {
                                size: "sm",
                                name: "download-retry",
                                get checked() {
                                  mark_store_binding();
                                  return $retryFailed();
                                },
                                set checked($$value) {
                                  store_set(retryFailed, proxy($$value));
                                }
                              });
                              reset(div_11);
                              append($$anchor7, div_11);
                            };
                            if_block(
                              node_16,
                              ($$render) => {
                                if (get$1(menuTabSet) === 2) $$render(consequent_4);
                              },
                              true
                            );
                          }
                          append($$anchor6, fragment_13);
                        };
                        if_block(
                          node_13,
                          ($$render) => {
                            if (get$1(menuTabSet) === 1) $$render(consequent_3);
                            else $$render(alternate, false);
                          },
                          true
                        );
                      }
                      append($$anchor5, fragment_11);
                    };
                    if_block(node_6, ($$render) => {
                      if (get$1(menuTabSet) === 0) $$render(consequent_2);
                      else $$render(alternate_1, false);
                    });
                  }
                  append($$anchor4, fragment_6);
                }
              }
            });
            next(2);
            reset(div_1);
            transition(3, div_1, () => slide);
            append($$anchor3, div_1);
          };
          if_block(node_1, ($$render) => {
            if (!$downloading()) $$render(consequent_5);
          });
        }
        var div_12 = sibling(node_1, 2);
        var node_18 = child(div_12);
        {
          var consequent_9 = ($$anchor3) => {
            var div_13 = root_20();
            var div_14 = child(div_13);
            var p_1 = child(div_14);
            var text_7 = child(p_1, true);
            reset(p_1);
            var p_2 = sibling(p_1, 2);
            var text_8 = child(p_2, true);
            reset(p_2);
            reset(div_14);
            var node_19 = sibling(div_14, 2);
            {
              var consequent_7 = ($$anchor4) => {
                var div_15 = root_21();
                each(div_15, 21, () => get$1(batchDownloadEntries), index, ($$anchor5, $$item) => {
                  let id = () => get$1($$item)[0];
                  let item = () => get$1($$item)[1];
                  var fragment_14 = comment();
                  var node_20 = first_child(fragment_14);
                  {
                    var consequent_6 = ($$anchor6) => {
                      var button = root_23();
                      button.__click = [on_click$1, startDownload, id];
                      var i_2 = child(button);
                      var node_21 = child(i_2);
                      html(node_21, () => downloadSvg);
                      reset(i_2);
                      var span = sibling(i_2, 2);
                      var text_9 = child(span, true);
                      reset(span);
                      reset(button);
                      template_effect(() => set_text(text_9, item().name));
                      append($$anchor6, button);
                    };
                    if_block(node_20, ($$render) => {
                      if ("fn" in item()) $$render(consequent_6);
                    });
                  }
                  append($$anchor5, fragment_14);
                });
                reset(div_15);
                append($$anchor4, div_15);
              };
              var alternate_2 = ($$anchor4) => {
                var fragment_15 = comment();
                var node_22 = first_child(fragment_15);
                {
                  var consequent_8 = ($$anchor5) => {
                    var button_1 = root_25();
                    button_1.__click = [
                      on_click_1,
                      startDownload,
                      batchDownloadEntries
                    ];
                    var i_3 = child(button_1);
                    var node_23 = child(i_3);
                    html(node_23, () => downloadSvg);
                    reset(i_3);
                    var span_1 = sibling(i_3, 2);
                    var text_10 = child(span_1, true);
                    reset(span_1);
                    reset(button_1);
                    template_effect(() => set_text(text_10, get$1(batchDownloadEntries)[0][1].name));
                    append($$anchor5, button_1);
                  };
                  if_block(
                    node_22,
                    ($$render) => {
                      if (get$1(batchDownloadEntries) && "fn" in get$1(batchDownloadEntries)[0][1]) $$render(consequent_8);
                    },
                    true
                  );
                }
                append($$anchor4, fragment_15);
              };
              if_block(node_19, ($$render) => {
                if (get$1(batchDownloadEntries) && get$1(batchDownloadEntries).length > 1) $$render(consequent_7);
                else $$render(alternate_2, false);
              });
            }
            reset(div_13);
            bind_this(div_13, ($$value) => startDownloadEl = $$value, () => startDownloadEl);
            template_effect(() => {
              var _a, _b;
              set_text(text_7, get$1(downloadResult));
              toggle_class(p_2, "text-error-500", ((_a = $log()) == null ? undefined : _a.type) === "Error");
              set_text(text_8, ((_b = $log()) == null ? undefined : _b.message) ?? "");
            });
            event("introstart", div_13, () => (
              // required when the transition reverses
              startDownloadEl.classList.remove("absolute")
            ));
            event("outrostart", div_13, () => startDownloadEl.classList.add("absolute"));
            transition(3, div_13, () => fade, () => ({ duration: 250 }));
            append($$anchor3, div_13);
          };
          var alternate_3 = ($$anchor3) => {
            var div_16 = root_26();
            var div_17 = child(div_16);
            var node_24 = child(div_17);
            ProgressBar(node_24, {
              height: "h-4",
              rounded: "rounded-md",
              meter: "bg-primary-500",
              track: "bg-primary-500/30",
              max: 100,
              get value() {
                return get$1(downloadProgress);
              }
            });
            var div_18 = sibling(node_24, 2);
            var p_3 = child(div_18);
            var text_11 = child(p_3, true);
            reset(p_3);
            var p_4 = sibling(p_3, 2);
            var text_12 = child(p_4, true);
            reset(p_4);
            reset(div_18);
            reset(div_17);
            var button_2 = sibling(div_17, 2);
            button_2.__click = [on_click_2, abort];
            var i_4 = child(button_2);
            var node_25 = child(i_4);
            html(node_25, () => stopSvg);
            reset(i_4);
            var span_2 = sibling(i_4, 2);
            var text_13 = child(span_2, true);
            template_effect(() => set_text(text_13, t("downloader.download_type.stop")));
            reset(span_2);
            reset(button_2);
            reset(div_16);
            bind_this(div_16, ($$value) => stopDownloadEl = $$value, () => stopDownloadEl);
            template_effect(() => {
              var _a, _b;
              toggle_class(p_3, "text-error-500", ((_a = $log()) == null ? undefined : _a.type) === "Error");
              set_text(text_11, ((_b = $log()) == null ? undefined : _b.message) ?? "");
              set_text(text_12, $artworkCount() ? `${get$1(processed)} / ${$artworkCount()}` : "");
            });
            event("introstart", div_16, () => stopDownloadEl.classList.remove("absolute"));
            event("outrostart", div_16, () => stopDownloadEl.classList.add("absolute"));
            transition(3, div_16, () => fade, () => ({ duration: 250 }));
            append($$anchor3, div_16);
          };
          if_block(node_18, ($$render) => {
            if (!$downloading()) $$render(consequent_9);
            else $$render(alternate_3, false);
          });
        }
        reset(div_12);
        reset(div);
        transition(3, div, () => fly, () => ({ x: 50, opacity: 0 }));
        append($$anchor2, div);
      };
      if_block(node, ($$render) => {
        if (get$1(showMenu) && get$1(showDownloader)) $$render(consequent_10);
      });
    }
    var node_26 = sibling(node, 2);
    {
      var consequent_15 = ($$anchor2) => {
        var div_19 = root_27();
        div_19.__click = [on_click_3, showMenu];
        var div_20 = child(div_19);
        var node_27 = child(div_20);
        await_block(node_27, () => get$1(avatarUpdated), null, ($$anchor3, val) => {
          var fragment_16 = comment();
          var node_28 = first_child(fragment_16);
          {
            var consequent_11 = ($$anchor4) => {
              var img = root_29();
              bind_this(img, ($$value) => avatarEl = $$value, () => avatarEl);
              template_effect(() => set_attribute(img, "src", get$1(val)));
              append($$anchor4, img);
            };
            if_block(node_28, ($$render) => {
              if (get$1(val)) $$render(consequent_11);
            });
          }
          append($$anchor3, fragment_16);
        });
        reset(div_20);
        var node_29 = sibling(div_20, 2);
        {
          var consequent_12 = ($$anchor3) => {
            var div_21 = root_30();
            var node_30 = child(div_21);
            ProgressRadial(node_30, {
              width: "w-16",
              stroke: 32,
              meter: "stroke-primary-500",
              track: "stroke-primary-500/30",
              fill: "fill-primary-500",
              strokeLinecap: "butt",
              get value() {
                return get$1(downloadProgress);
              }
            });
            reset(div_21);
            transition(3, div_21, () => fade, () => ({ duration: 250 }));
            append($$anchor3, div_21);
          };
          if_block(node_29, ($$render) => {
            if ($downloading() && !get$1(showMenu)) $$render(consequent_12);
          });
        }
        var div_22 = sibling(node_29, 2);
        var node_31 = child(div_22);
        {
          var consequent_13 = ($$anchor3) => {
            var div_23 = root_31();
            var span_3 = child(div_23);
            var text_14 = child(span_3, true);
            reset(span_3);
            var span_4 = sibling(span_3, 4);
            var text_15 = child(span_4, true);
            reset(span_4);
            reset(div_23);
            bind_this(div_23, ($$value) => avatarProgressEl = $$value, () => avatarProgressEl);
            template_effect(() => {
              set_text(text_14, get$1(processed));
              set_text(text_15, $artworkCount());
            });
            event("introstart", div_23, () => avatarProgressEl.classList.remove("absolute"));
            event("outrostart", div_23, () => avatarProgressEl.classList.add("absolute"));
            transition(3, div_23, () => fade, () => ({ duration: 250 }));
            append($$anchor3, div_23);
          };
          var alternate_4 = ($$anchor3) => {
            var fragment_17 = comment();
            var node_32 = first_child(fragment_17);
            {
              var consequent_14 = ($$anchor4) => {
                var i_5 = root_33();
                var node_33 = child(i_5);
                html(node_33, () => downloadMultipleSvg);
                reset(i_5);
                bind_this(i_5, ($$value) => avatarDownloadIcon = $$value, () => avatarDownloadIcon);
                event("introstart", i_5, () => avatarDownloadIcon.classList.remove("absolute"));
                event("outrostart", i_5, () => avatarDownloadIcon.classList.add("absolute"));
                transition(3, i_5, () => fade, () => ({ duration: 250 }));
                append($$anchor4, i_5);
              };
              if_block(
                node_32,
                ($$render) => {
                  if (!get$1(showMenu)) $$render(consequent_14);
                },
                true
              );
            }
            append($$anchor3, fragment_17);
          };
          if_block(node_31, ($$render) => {
            if ($downloading() && $artworkCount() && !get$1(showMenu)) $$render(consequent_13);
            else $$render(alternate_4, false);
          });
        }
        reset(div_22);
        reset(div_19);
        template_effect(() => {
          toggle_class(div_20, "opacity-70", !get$1(showMenu));
          toggle_class(div_20, "blur-[1px]", !get$1(showMenu));
        });
        transition(3, div_19, () => fly, () => ({ opacity: 0, x: 50 }));
        append($$anchor2, div_19);
      };
      if_block(node_26, ($$render) => {
        if (get$1(showDownloader)) $$render(consequent_15);
      });
    }
    append($$anchor, fragment);
    pop();
    $$cleanup();
  }
  delegate(["click"]);
  const cog = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>`;
  const env = {
    isFirefox() {
      return navigator.userAgent.includes("Firefox");
    },
    isViolentmonkey() {
      return _GM_info.scriptHandler === "Violentmonkey";
    },
    isTampermonkey() {
      return _GM_info.scriptHandler === "Tampermonkey";
    },
    isBlobDlAvaliable() {
      return !this.isFirefox() || this.isFirefox() && this.isTampermonkey() && parseFloat(_GM_info.version ?? "") < 4.18;
    },
    // firefox使用tampermonkey，downloadmod为默认时也支持子目录，但GM_info显示为原生的“native”，而“原生”不支持子目录
    isSupportSubpath() {
      return this.isBrowserDownloadMode();
    },
    isBrowserDownloadMode() {
      return _GM_info.downloadMode === "browser";
    },
    isConflictActionEnable() {
      return this.isTampermonkey() && parseFloat(_GM_info.version ?? "") >= 4.18 && this.isBrowserDownloadMode();
    },
    isConflictActionPromptEnable() {
      return !this.isFirefox() && this.isConflictActionEnable();
    },
    isFileSystemAccessAvaliable() {
      return typeof _unsafeWindow.showDirectoryPicker === "function" && typeof _unsafeWindow.showSaveFilePicker === "function";
    },
    videoFrameSupported() {
      return typeof _unsafeWindow.VideoFrame === "function";
    },
    isPixiv() {
      return location.hostname === "www.pixiv.net";
    },
    isYande() {
      return location.hostname === "yande.re";
    },
    isRule34() {
      return location.hostname === "rule34.xxx";
    },
    isNijie() {
      return location.hostname === "nijie.info";
    }
  };
  const check = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>check</title><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>`;
  const folderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" /></svg>`;
  const fileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" /></svg>`;
  class RequestError extends Error {
    constructor(url, status) {
      super(status + " " + url);
      __publicField(this, "url");
      __publicField(this, "status");
      this.name = "RequestError";
      this.url = url;
      this.status = status;
    }
  }
  class CancelError extends Error {
    constructor() {
      super("User aborted.");
      this.name = "CancelError";
    }
  }
  class JsonDataError extends Error {
    constructor(msg) {
      super(msg);
      this.name = "JsonDataError";
    }
  }
  class TimoutError extends Error {
    constructor(msg) {
      super(msg);
      this.name = "TimoutError";
    }
  }
  class FileSystemAccessHandler {
    constructor() {
      __privateAdd(this, _FileSystemAccessHandler_instances);
      __publicField(this, "filenameConflictAction", "uniquify");
      __publicField(this, "dirHandle");
      __publicField(this, "dirHandleStatus", "dirHandle.unpick");
      __publicField(this, "cachedTasks", []);
      __publicField(this, "duplicateFilenameCached", {});
      __privateMethod(this, _FileSystemAccessHandler_instances, addChannelEventListeners_fn).call(this);
      channelEvent.emit(
        "dirHandle.request"
        /* REQUEST */
      );
    }
    async getDirHandleRecursive(dirs) {
      if (!this.dirHandle) throw new Error("未选择保存文件夹");
      let handler = this.dirHandle;
      if (typeof dirs === "string") {
        if (dirs.indexOf("/") === -1) return await handler.getDirectoryHandle(dirs, { create: true });
        dirs = dirs.split("/").filter((dir) => !!dir);
      }
      for await (const dir of dirs) {
        handler = await handler.getDirectoryHandle(dir, { create: true });
      }
      return handler;
    }
    processCachedTasks() {
      const { length } = this.cachedTasks;
      for (let i = 0; i < length; i++) {
        const [blob, path, signal, onSaveFullfilled, onSaveRejected] = this.cachedTasks[i];
        this.saveFile(blob, path, signal).then(onSaveFullfilled, onSaveRejected);
      }
      logger.info(`执行${length}个缓存任务`);
      if (this.cachedTasks.length > length) {
        this.cachedTasks = this.cachedTasks.slice(length);
      } else {
        this.cachedTasks.length = 0;
      }
    }
    rejectCachedTasks() {
      this.cachedTasks.forEach(([, , , , onSaveRejected]) => onSaveRejected(new CancelError()));
      this.cachedTasks.length = 0;
      logger.info(`取消${this.cachedTasks.length}个缓存任务`);
    }
    async getFilenameHandle(dirHandle, filename) {
      if (this.filenameConflictAction === "overwrite")
        return await dirHandle.getFileHandle(filename, { create: true });
      if (!(filename in this.duplicateFilenameCached)) {
        this.duplicateFilenameCached[filename] = [];
        try {
          await dirHandle.getFileHandle(filename);
          logger.warn("存在同名文件", filename);
        } catch (error) {
          return await dirHandle.getFileHandle(filename, { create: true });
        }
      }
      const extIndex = filename.lastIndexOf(".");
      const ext = filename.slice(extIndex + 1);
      const name = filename.slice(0, extIndex);
      if (this.filenameConflictAction === "prompt") {
        return await _unsafeWindow.showSaveFilePicker({
          suggestedName: filename,
          // @ts-expect-error accept MIMEType & FileExtension
          types: [{ description: "Image file", accept: { ["image/" + ext]: "." + ext } }]
        });
      } else {
        for (let suffix = 1; suffix < 1e3; suffix++) {
          const newName = `${name} (${suffix}).${ext}`;
          try {
            await dirHandle.getFileHandle(newName);
          } catch (error) {
            if (this.duplicateFilenameCached[filename].includes(newName)) {
              continue;
            } else {
              this.duplicateFilenameCached[filename].push(newName);
            }
            logger.info("使用文件名:", newName);
            return await dirHandle.getFileHandle(newName, { create: true });
          }
        }
        throw new RangeError("Oops, you have too many duplicate files.");
      }
    }
    clearFilenameCached(duplicateName, actualName) {
      if (!(duplicateName in this.duplicateFilenameCached)) return;
      const usedNameArr = this.duplicateFilenameCached[duplicateName];
      logger.info("清理重名文件名", usedNameArr, actualName);
      if (usedNameArr.length === 0) {
        delete this.duplicateFilenameCached[duplicateName];
        return;
      }
      const index2 = usedNameArr.indexOf(actualName);
      if (index2 === -1) return;
      usedNameArr.splice(index2, 1);
      if (usedNameArr.length === 0) delete this.duplicateFilenameCached[duplicateName];
    }
    async updateDirHandle() {
      try {
        this.dirHandleStatus = "dirHandle.picking";
        channelEvent.emit(
          "dirHandle.picking"
          /* PICKING */
        );
        this.dirHandle = await _unsafeWindow.showDirectoryPicker({ id: "pdl", mode: "readwrite" });
        logger.info("更新dirHandle", this.dirHandle);
        this.dirHandleStatus = "dirHandle.picked";
        channelEvent.emit(
          "dirHandle.picked",
          this.dirHandle
        );
        this.processCachedTasks();
        return true;
      } catch (error) {
        logger.warn(error);
        channelEvent.emit(
          "dirHandle.unpick"
          /* UNPICK */
        );
        if (this.dirHandle) {
          this.dirHandleStatus = "dirHandle.picked";
          this.processCachedTasks();
        } else {
          this.dirHandleStatus = "dirHandle.unpick";
          this.rejectCachedTasks();
        }
        return false;
      }
    }
    getCurrentDirName() {
      var _a;
      return ((_a = this.dirHandle) == null ? undefined : _a.name) ?? "";
    }
    isDirHandleNotSet() {
      return this.dirHandleStatus === "dirHandle.unpick";
    }
    setFilenameConflictAction(action2) {
      this.filenameConflictAction = action2;
    }
    async saveFile(blob, path, signal) {
      signal == null ? undefined : signal.throwIfAborted();
      if (this.dirHandleStatus === "dirHandle.picking") {
        let onSaveFullfilled;
        let onSaveRejected;
        const promiseExcutor = new Promise((resolve, reject) => {
          onSaveFullfilled = resolve;
          onSaveRejected = reject;
        });
        this.cachedTasks.push([blob, path, signal, onSaveFullfilled, onSaveRejected]);
        return promiseExcutor;
      }
      if (this.dirHandleStatus === "dirHandle.unpick") {
        const isSuccess = await this.updateDirHandle();
        if (!isSuccess) throw new TypeError("Failed to get dir handle.");
      }
      let currenDirHandle;
      let filename;
      const index2 = path.lastIndexOf("/");
      if (index2 === -1) {
        filename = path;
        currenDirHandle = this.dirHandle;
      } else {
        filename = path.slice(index2 + 1);
        currenDirHandle = await this.getDirHandleRecursive(path.slice(0, index2));
      }
      signal == null ? undefined : signal.throwIfAborted();
      const fileHandle = await this.getFilenameHandle(currenDirHandle, filename);
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
      this.clearFilenameCached(filename, fileHandle.name);
    }
  }
  _FileSystemAccessHandler_instances = new WeakSet();
  addChannelEventListeners_fn = function() {
    channelEvent.on("dirHandle.request", () => {
      if (!this.dirHandle) return;
      channelEvent.emit(
        "dirHandle.response",
        this.dirHandle
      );
      logger.info("响应请求dirHandle");
    });
    channelEvent.on(
      "dirHandle.response",
      (handler) => {
        if (this.dirHandle) return;
        if (this.dirHandleStatus === "dirHandle.unpick")
          this.dirHandleStatus = "dirHandle.picked";
        this.dirHandle = handler;
        logger.info("首次获取dirHandle", this.dirHandle);
      }
    );
    channelEvent.on("dirHandle.picking", () => {
      this.dirHandleStatus = "dirHandle.picking";
      logger.info("正在选择目录");
    });
    channelEvent.on("dirHandle.unpick", () => {
      logger.warn("取消更新dirHandle");
      if (this.dirHandle) {
        this.dirHandleStatus = "dirHandle.picked";
        this.processCachedTasks();
      } else {
        this.dirHandleStatus = "dirHandle.unpick";
        this.rejectCachedTasks();
      }
    });
    channelEvent.on(
      "dirHandle.picked",
      (handler) => {
        this.dirHandleStatus = "dirHandle.picked";
        this.dirHandle = handler;
        logger.info("更新dirHandle", this.dirHandle);
        this.processCachedTasks();
      }
    );
  };
  const fsaHandler = new FileSystemAccessHandler();
  function gmDownload(blob, path, signal) {
    return new Promise((resolve, reject) => {
      signal == null ? undefined : signal.throwIfAborted();
      const imgUrl = URL.createObjectURL(blob);
      const abortObj = _GM_download({
        url: URL.createObjectURL(blob),
        name: path,
        onerror: (error) => {
          URL.revokeObjectURL(imgUrl);
          if (signal == null ? undefined : signal.aborted) {
            resolve();
          } else {
            logger.error(error);
            reject(new Error(`FileSave error: ${path}`));
          }
        },
        onload: () => {
          URL.revokeObjectURL(imgUrl);
          resolve();
        }
      });
      signal == null ? undefined : signal.addEventListener("abort", () => abortObj.abort(), { once: true });
    });
  }
  function aDownload(blob, path) {
    const separaterIndex = path.lastIndexOf("/");
    if (separaterIndex !== -1) path = path.slice(separaterIndex + 1);
    const dlEle = document.createElement("a");
    dlEle.href = URL.createObjectURL(blob);
    dlEle.download = path;
    dlEle.click();
    URL.revokeObjectURL(dlEle.href);
  }
  function gmDownloadDataUrl(blob, path, signal) {
    return readBlobAsDataUrl(blob).then((dataUrl) => {
      signal == null ? undefined : signal.throwIfAborted();
      return new Promise((resolve, reject) => {
        const abortObj = _GM_download({
          url: dataUrl,
          name: path,
          onerror: (error) => {
            if (signal == null ? undefined : signal.aborted) {
              resolve();
            } else {
              logger.error(error);
              reject(new Error(`FileSave error: ${path}`));
            }
          },
          onload: () => {
            resolve();
          }
        });
        signal == null ? undefined : signal.addEventListener("abort", () => abortObj.abort(), { once: true });
      });
    });
  }
  let saveFile;
  const blobAvaliable = env.isBlobDlAvaliable();
  const subPathAvaliable = env.isSupportSubpath();
  if (subPathAvaliable) {
    if (!blobAvaliable) {
      saveFile = gmDownloadDataUrl;
    } else {
      saveFile = gmDownload;
    }
  } else {
    saveFile = aDownload;
    logger.warn("Download function is not fully supported:", _GM_info.scriptHandler, _GM_info.version);
  }
  const fileSaveAdapters = {
    getAdapter() {
      if (this.isFileSystemAccessEnable()) {
        fsaHandler.setFilenameConflictAction(config.get("fileSystemFilenameConflictAction"));
        return fsaHandler.saveFile.bind(fsaHandler);
      } else {
        return saveFile;
      }
    },
    isFileSystemAccessEnable() {
      return env.isFileSystemAccessAvaliable() && config.get("useFileSystemAccess");
    },
    dirHandleCheck() {
      if (this.isFileSystemAccessEnable() && fsaHandler.isDirHandleNotSet())
        fsaHandler.updateDirHandle();
    },
    async updateDirHandle() {
      if (this.isFileSystemAccessEnable()) {
        await fsaHandler.updateDirHandle();
        return fsaHandler.getCurrentDirName();
      }
      return "";
    },
    getFsaDirName() {
      if (this.isFileSystemAccessEnable()) {
        return fsaHandler.getCurrentDirName();
      } else {
        return "";
      }
    }
  };
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var eventemitter3 = { exports: {} };
  (function(module) {
    var has = Object.prototype.hasOwnProperty, prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__) prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event2, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event2 : event2;
      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }
    function EventEmitter2() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter2.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0) return names;
      for (name in events = this._events) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter2.prototype.listeners = function listeners(event2) {
      var evt = prefix ? prefix + event2 : event2, handlers = this._events[evt];
      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    };
    EventEmitter2.prototype.listenerCount = function listenerCount(event2) {
      var evt = prefix ? prefix + event2 : event2, listeners = this._events[evt];
      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };
    EventEmitter2.prototype.emit = function emit(event2, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event2 : event2;
      if (!this._events[evt]) return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once) this.removeListener(event2, listeners.fn, undefined, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event2, listeners[i].fn, undefined, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter2.prototype.on = function on(event2, fn, context) {
      return addListener(this, event2, fn, context, false);
    };
    EventEmitter2.prototype.once = function once(event2, fn, context) {
      return addListener(this, event2, fn, context, true);
    };
    EventEmitter2.prototype.removeListener = function removeListener(event2, fn, context, once) {
      var evt = prefix ? prefix + event2 : event2;
      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event2) {
      var evt;
      if (event2) {
        evt = prefix ? prefix + event2 : event2;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
    EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
    EventEmitter2.prefixed = prefix;
    EventEmitter2.EventEmitter = EventEmitter2;
    {
      module.exports = EventEmitter2;
    }
  })(eventemitter3);
  var eventemitter3Exports = eventemitter3.exports;
  const EventEmitter = /* @__PURE__ */ getDefaultExportFromCjs(eventemitter3Exports);
  class TimeoutError extends Error {
    constructor(message) {
      super(message);
      this.name = "TimeoutError";
    }
  }
  class AbortError extends Error {
    constructor(message) {
      super();
      this.name = "AbortError";
      this.message = message;
    }
  }
  const getDOMException = (errorMessage) => globalThis.DOMException === undefined ? new AbortError(errorMessage) : new DOMException(errorMessage);
  const getAbortedReason = (signal) => {
    const reason = signal.reason === undefined ? getDOMException("This operation was aborted.") : signal.reason;
    return reason instanceof Error ? reason : getDOMException(reason);
  };
  function pTimeout(promise, options) {
    const {
      milliseconds,
      fallback,
      message,
      customTimers = { setTimeout, clearTimeout }
    } = options;
    let timer;
    let abortHandler;
    const wrappedPromise = new Promise((resolve, reject) => {
      if (typeof milliseconds !== "number" || Math.sign(milliseconds) !== 1) {
        throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
      }
      if (options.signal) {
        const { signal } = options;
        if (signal.aborted) {
          reject(getAbortedReason(signal));
        }
        abortHandler = () => {
          reject(getAbortedReason(signal));
        };
        signal.addEventListener("abort", abortHandler, { once: true });
      }
      if (milliseconds === Number.POSITIVE_INFINITY) {
        promise.then(resolve, reject);
        return;
      }
      const timeoutError = new TimeoutError();
      timer = customTimers.setTimeout.call(undefined, () => {
        if (fallback) {
          try {
            resolve(fallback());
          } catch (error) {
            reject(error);
          }
          return;
        }
        if (typeof promise.cancel === "function") {
          promise.cancel();
        }
        if (message === false) {
          resolve();
        } else if (message instanceof Error) {
          reject(message);
        } else {
          timeoutError.message = message ?? `Promise timed out after ${milliseconds} milliseconds`;
          reject(timeoutError);
        }
      }, milliseconds);
      (async () => {
        try {
          resolve(await promise);
        } catch (error) {
          reject(error);
        }
      })();
    });
    const cancelablePromise = wrappedPromise.finally(() => {
      cancelablePromise.clear();
      if (abortHandler && options.signal) {
        options.signal.removeEventListener("abort", abortHandler);
      }
    });
    cancelablePromise.clear = () => {
      customTimers.clearTimeout.call(undefined, timer);
      timer = undefined;
    };
    return cancelablePromise;
  }
  function lowerBound(array, value, comparator) {
    let first = 0;
    let count = array.length;
    while (count > 0) {
      const step = Math.trunc(count / 2);
      let it = first + step;
      if (comparator(array[it], value) <= 0) {
        first = ++it;
        count -= step + 1;
      } else {
        count = step;
      }
    }
    return first;
  }
  class PriorityQueue {
    constructor() {
      __privateAdd(this, _queue, []);
    }
    enqueue(run2, options) {
      options = {
        priority: 0,
        ...options
      };
      const element = {
        priority: options.priority,
        run: run2
      };
      if (this.size && __privateGet(this, _queue)[this.size - 1].priority >= options.priority) {
        __privateGet(this, _queue).push(element);
        return;
      }
      const index2 = lowerBound(__privateGet(this, _queue), element, (a, b) => b.priority - a.priority);
      __privateGet(this, _queue).splice(index2, 0, element);
    }
    dequeue() {
      const item = __privateGet(this, _queue).shift();
      return item == null ? undefined : item.run;
    }
    filter(options) {
      return __privateGet(this, _queue).filter((element) => element.priority === options.priority).map((element) => element.run);
    }
    get size() {
      return __privateGet(this, _queue).length;
    }
  }
  _queue = new WeakMap();
  class PQueue extends EventEmitter {
    // TODO: The `throwOnTimeout` option should affect the return types of `add()` and `addAll()`
    constructor(options) {
      var _a, _b;
      super();
      __privateAdd(this, _PQueue_instances);
      __privateAdd(this, _carryoverConcurrencyCount);
      __privateAdd(this, _isIntervalIgnored);
      __privateAdd(this, _intervalCount, 0);
      __privateAdd(this, _intervalCap);
      __privateAdd(this, _interval);
      __privateAdd(this, _intervalEnd, 0);
      __privateAdd(this, _intervalId);
      __privateAdd(this, _timeoutId);
      __privateAdd(this, _queue2);
      __privateAdd(this, _queueClass);
      __privateAdd(this, _pending, 0);
      // The `!` is needed because of https://github.com/microsoft/TypeScript/issues/32194
      __privateAdd(this, _concurrency);
      __privateAdd(this, _isPaused);
      __privateAdd(this, _throwOnTimeout);
      /**
          Per-operation timeout in milliseconds. Operations fulfill once `timeout` elapses if they haven't already.
      
          Applies to each future operation.
          */
      __publicField(this, "timeout");
      options = {
        carryoverConcurrencyCount: false,
        intervalCap: Number.POSITIVE_INFINITY,
        interval: 0,
        concurrency: Number.POSITIVE_INFINITY,
        autoStart: true,
        queueClass: PriorityQueue,
        ...options
      };
      if (!(typeof options.intervalCap === "number" && options.intervalCap >= 1)) {
        throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${((_a = options.intervalCap) == null ? undefined : _a.toString()) ?? ""}\` (${typeof options.intervalCap})`);
      }
      if (options.interval === undefined || !(Number.isFinite(options.interval) && options.interval >= 0)) {
        throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${((_b = options.interval) == null ? undefined : _b.toString()) ?? ""}\` (${typeof options.interval})`);
      }
      __privateSet(this, _carryoverConcurrencyCount, options.carryoverConcurrencyCount);
      __privateSet(this, _isIntervalIgnored, options.intervalCap === Number.POSITIVE_INFINITY || options.interval === 0);
      __privateSet(this, _intervalCap, options.intervalCap);
      __privateSet(this, _interval, options.interval);
      __privateSet(this, _queue2, new options.queueClass());
      __privateSet(this, _queueClass, options.queueClass);
      this.concurrency = options.concurrency;
      this.timeout = options.timeout;
      __privateSet(this, _throwOnTimeout, options.throwOnTimeout === true);
      __privateSet(this, _isPaused, options.autoStart === false);
    }
    get concurrency() {
      return __privateGet(this, _concurrency);
    }
    set concurrency(newConcurrency) {
      if (!(typeof newConcurrency === "number" && newConcurrency >= 1)) {
        throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
      }
      __privateSet(this, _concurrency, newConcurrency);
      __privateMethod(this, _PQueue_instances, processQueue_fn).call(this);
    }
    async add(function_, options = {}) {
      options = {
        timeout: this.timeout,
        throwOnTimeout: __privateGet(this, _throwOnTimeout),
        ...options
      };
      return new Promise((resolve, reject) => {
        __privateGet(this, _queue2).enqueue(async () => {
          var _a;
          __privateWrapper(this, _pending)._++;
          __privateWrapper(this, _intervalCount)._++;
          try {
            (_a = options.signal) == null ? void 0 : _a.throwIfAborted();
            let operation = function_({ signal: options.signal });
            if (options.timeout) {
              operation = pTimeout(Promise.resolve(operation), { milliseconds: options.timeout });
            }
            if (options.signal) {
              operation = Promise.race([operation, __privateMethod(this, _PQueue_instances, throwOnAbort_fn).call(this, options.signal)]);
            }
            const result = await operation;
            resolve(result);
            this.emit("completed", result);
          } catch (error) {
            if (error instanceof TimeoutError && !options.throwOnTimeout) {
              resolve();
              return;
            }
            reject(error);
            this.emit("error", error);
          } finally {
            __privateMethod(this, _PQueue_instances, next_fn).call(this);
          }
        }, options);
        this.emit("add");
        __privateMethod(this, _PQueue_instances, tryToStartAnother_fn).call(this);
      });
    }
    async addAll(functions, options) {
      return Promise.all(functions.map(async (function_) => this.add(function_, options)));
    }
    /**
    Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
    */
    start() {
      if (!__privateGet(this, _isPaused)) {
        return this;
      }
      __privateSet(this, _isPaused, false);
      __privateMethod(this, _PQueue_instances, processQueue_fn).call(this);
      return this;
    }
    /**
    Put queue execution on hold.
    */
    pause() {
      __privateSet(this, _isPaused, true);
    }
    /**
    Clear the queue.
    */
    clear() {
      __privateSet(this, _queue2, new (__privateGet(this, _queueClass))());
    }
    /**
        Can be called multiple times. Useful if you for example add additional items at a later time.
    
        @returns A promise that settles when the queue becomes empty.
        */
    async onEmpty() {
      if (__privateGet(this, _queue2).size === 0) {
        return;
      }
      await __privateMethod(this, _PQueue_instances, onEvent_fn).call(this, "empty");
    }
    /**
        @returns A promise that settles when the queue size is less than the given limit: `queue.size < limit`.
    
        If you want to avoid having the queue grow beyond a certain size you can `await queue.onSizeLessThan()` before adding a new item.
    
        Note that this only limits the number of items waiting to start. There could still be up to `concurrency` jobs already running that this call does not include in its calculation.
        */
    async onSizeLessThan(limit) {
      if (__privateGet(this, _queue2).size < limit) {
        return;
      }
      await __privateMethod(this, _PQueue_instances, onEvent_fn).call(this, "next", () => __privateGet(this, _queue2).size < limit);
    }
    /**
        The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.
    
        @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
        */
    async onIdle() {
      if (__privateGet(this, _pending) === 0 && __privateGet(this, _queue2).size === 0) {
        return;
      }
      await __privateMethod(this, _PQueue_instances, onEvent_fn).call(this, "idle");
    }
    /**
    Size of the queue, the number of queued items waiting to run.
    */
    get size() {
      return __privateGet(this, _queue2).size;
    }
    /**
        Size of the queue, filtered by the given options.
    
        For example, this can be used to find the number of items remaining in the queue with a specific priority level.
        */
    sizeBy(options) {
      return __privateGet(this, _queue2).filter(options).length;
    }
    /**
    Number of running items (no longer in the queue).
    */
    get pending() {
      return __privateGet(this, _pending);
    }
    /**
    Whether the queue is currently paused.
    */
    get isPaused() {
      return __privateGet(this, _isPaused);
    }
  }
  _carryoverConcurrencyCount = new WeakMap();
  _isIntervalIgnored = new WeakMap();
  _intervalCount = new WeakMap();
  _intervalCap = new WeakMap();
  _interval = new WeakMap();
  _intervalEnd = new WeakMap();
  _intervalId = new WeakMap();
  _timeoutId = new WeakMap();
  _queue2 = new WeakMap();
  _queueClass = new WeakMap();
  _pending = new WeakMap();
  _concurrency = new WeakMap();
  _isPaused = new WeakMap();
  _throwOnTimeout = new WeakMap();
  _PQueue_instances = new WeakSet();
  doesIntervalAllowAnother_get = function() {
    return __privateGet(this, _isIntervalIgnored) || __privateGet(this, _intervalCount) < __privateGet(this, _intervalCap);
  };
  doesConcurrentAllowAnother_get = function() {
    return __privateGet(this, _pending) < __privateGet(this, _concurrency);
  };
  next_fn = function() {
    __privateWrapper(this, _pending)._--;
    __privateMethod(this, _PQueue_instances, tryToStartAnother_fn).call(this);
    this.emit("next");
  };
  onResumeInterval_fn = function() {
    __privateMethod(this, _PQueue_instances, onInterval_fn).call(this);
    __privateMethod(this, _PQueue_instances, initializeIntervalIfNeeded_fn).call(this);
    __privateSet(this, _timeoutId, undefined);
  };
  isIntervalPaused_get = function() {
    const now2 = Date.now();
    if (__privateGet(this, _intervalId) === undefined) {
      const delay = __privateGet(this, _intervalEnd) - now2;
      if (delay < 0) {
        __privateSet(this, _intervalCount, __privateGet(this, _carryoverConcurrencyCount) ? __privateGet(this, _pending) : 0);
      } else {
        if (__privateGet(this, _timeoutId) === undefined) {
          __privateSet(this, _timeoutId, setTimeout(() => {
            __privateMethod(this, _PQueue_instances, onResumeInterval_fn).call(this);
          }, delay));
        }
        return true;
      }
    }
    return false;
  };
  tryToStartAnother_fn = function() {
    if (__privateGet(this, _queue2).size === 0) {
      if (__privateGet(this, _intervalId)) {
        clearInterval(__privateGet(this, _intervalId));
      }
      __privateSet(this, _intervalId, undefined);
      this.emit("empty");
      if (__privateGet(this, _pending) === 0) {
        this.emit("idle");
      }
      return false;
    }
    if (!__privateGet(this, _isPaused)) {
      const canInitializeInterval = !__privateGet(this, _PQueue_instances, isIntervalPaused_get);
      if (__privateGet(this, _PQueue_instances, doesIntervalAllowAnother_get) && __privateGet(this, _PQueue_instances, doesConcurrentAllowAnother_get)) {
        const job = __privateGet(this, _queue2).dequeue();
        if (!job) {
          return false;
        }
        this.emit("active");
        job();
        if (canInitializeInterval) {
          __privateMethod(this, _PQueue_instances, initializeIntervalIfNeeded_fn).call(this);
        }
        return true;
      }
    }
    return false;
  };
  initializeIntervalIfNeeded_fn = function() {
    if (__privateGet(this, _isIntervalIgnored) || __privateGet(this, _intervalId) !== undefined) {
      return;
    }
    __privateSet(this, _intervalId, setInterval(() => {
      __privateMethod(this, _PQueue_instances, onInterval_fn).call(this);
    }, __privateGet(this, _interval)));
    __privateSet(this, _intervalEnd, Date.now() + __privateGet(this, _interval));
  };
  onInterval_fn = function() {
    if (__privateGet(this, _intervalCount) === 0 && __privateGet(this, _pending) === 0 && __privateGet(this, _intervalId)) {
      clearInterval(__privateGet(this, _intervalId));
      __privateSet(this, _intervalId, undefined);
    }
    __privateSet(this, _intervalCount, __privateGet(this, _carryoverConcurrencyCount) ? __privateGet(this, _pending) : 0);
    __privateMethod(this, _PQueue_instances, processQueue_fn).call(this);
  };
  /**
  Executes all queued functions until it reaches the limit.
  */
  processQueue_fn = function() {
    while (__privateMethod(this, _PQueue_instances, tryToStartAnother_fn).call(this)) {
    }
  };
  throwOnAbort_fn = async function(signal) {
    return new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => {
        reject(signal.reason);
      }, { once: true });
    });
  };
  onEvent_fn = async function(event2, filter) {
    return new Promise((resolve) => {
      const listener = () => {
        if (filter && !filter()) {
          return;
        }
        this.off(event2, listener);
        resolve();
      };
      this.on(event2, listener);
    });
  };
  class Downloader {
    constructor() {
      __privateAdd(this, _Downloader_instances);
      __privateAdd(this, _DOWNLOAD_RETRY, 3);
      __privateAdd(this, _downloadQueue, new PQueue({ concurrency: 5, interval: 1e3, intervalCap: 4 }));
    }
    get fileSystemAccessEnabled() {
      return fileSaveAdapters.isFileSystemAccessEnable();
    }
    /**
     * 下载触发后应该先弹窗选择文件保存位置，避免下载/转换用时过长导致错误
     * Must be handling a user gesture to show a file picker.
     * https://bugs.chromium.org/p/chromium/issues/detail?id=1193489
     */
    dirHandleCheck() {
      fileSaveAdapters.dirHandleCheck();
    }
    updateDirHandle() {
      return fileSaveAdapters.updateDirHandle();
    }
    getCurrentFsaDirName() {
      return fileSaveAdapters.getFsaDirName();
    }
    async download(configs, option = {}) {
      const { signal, priority } = option;
      signal == null ? undefined : signal.throwIfAborted();
      logger.info("Downloader add:", configs);
      if (!Array.isArray(configs)) configs = [configs];
      if (configs.length < 1) return;
      const downloads = configs.map((config2) => {
        return __privateMethod(this, _Downloader_instances, dispatchDownload_fn).call(this, config2, priority, signal);
      });
      const downloadResult = await Promise.allSettled(downloads);
      for (const result of downloadResult) {
        if (result.status === "rejected") throw result.reason;
      }
    }
  }
  _DOWNLOAD_RETRY = new WeakMap();
  _downloadQueue = new WeakMap();
  _Downloader_instances = new WeakSet();
  xhr_fn = function(config2, signal) {
    if (signal == null ? undefined : signal.aborted) return Promise.resolve([signal.reason, null]);
    const { src, onProgress, timeout, taskId, headers } = config2;
    return new Promise((resolve) => {
      const abortObj = _GM_xmlhttpRequest({
        url: src,
        method: "GET",
        responseType: "blob",
        timeout,
        headers,
        ontimeout() {
          resolve([new TimoutError(`${taskId} | ${src}`), null]);
        },
        onerror(error) {
          let err;
          if (error.status === 429) {
            err = new RequestError(config2.src, error.status);
          } else {
            err = new Error(`Download failed. ID: ${taskId}.`);
          }
          resolve([err, null]);
        },
        onprogress(res) {
          if (res.loaded > 0 && res.total > 0) {
            const progress = Math.floor(res.loaded / res.total * 100);
            onProgress == null ? undefined : onProgress(progress, config2);
          }
        },
        onload(res) {
          const { status, statusText, finalUrl } = res;
          if (status < 200 || status > 299) {
            resolve([new RequestError(statusText + " " + finalUrl, status), null]);
            return;
          }
          resolve([null, res.response]);
        }
      });
      signal == null ? undefined : signal.addEventListener(
        "abort",
        () => {
          abortObj.abort();
          resolve([signal.reason, null]);
        },
        { once: true }
      );
    });
  };
  dispatchDownload_fn = async function(config2, priority = 0, signal) {
    var _a, _b, _c, _d;
    try {
      const { src, taskId, path } = config2;
      const result = await __privateGet(this, _downloadQueue).add(
        async ({ signal: signal2 }) => {
          signal2 == null ? void 0 : signal2.throwIfAborted();
          logger.info("Download start:", src);
          let result2;
          let retryCount = 0;
          do {
            const xhrResult = await __privateMethod(this, _Downloader_instances, xhr_fn).call(this, config2, signal2);
            signal2 == null ? void 0 : signal2.throwIfAborted();
            if (xhrResult[0] === null) {
              result2 = xhrResult[1];
              break;
            } else {
              const err = xhrResult[0];
              if (!(err instanceof TimoutError) || ++retryCount > __privateGet(this, _DOWNLOAD_RETRY)) {
                throw err;
              } else {
                logger.error(`Download will be retried. Count: ${retryCount}.`, err);
              }
            }
          } while (retryCount <= __privateGet(this, _DOWNLOAD_RETRY));
          return result2;
        },
        { signal, priority }
      );
      if (!result) throw new TimoutError(`${taskId} | ${src}`);
      logger.info("Xhr complete:", src);
      (_a = config2.onXhrLoaded) == null ? void 0 : _a.call(config2, config2);
      const saveFile2 = fileSaveAdapters.getAdapter();
      if (typeof config2.beforeFileSave === "function") {
        const modifiedResult = await config2.beforeFileSave(result, config2);
        signal == null ? void 0 : signal.throwIfAborted();
        if (!modifiedResult) return;
        await saveFile2(modifiedResult, path, signal);
      } else {
        await saveFile2(result, path, signal);
      }
      (_b = config2.onFileSaved) == null ? void 0 : _b.call(config2, config2);
      logger.info("Download complete:", path);
    } catch (error) {
      if (error instanceof CancelError) {
        (_c = config2.onAbort) == null ? undefined : _c.call(config2, config2);
      } else {
        (_d = config2.onError) == null ? undefined : _d.call(config2, error, config2);
      }
      throw error;
    }
  };
  const downloader = new Downloader();
  function updateDirectory(_, directory, $configStore, configStore) {
    const newDirectory = get$1(directory).split("/").map(replaceInvalidChar).filter((path) => !!path).join("/");
    store_mutate(configStore, untrack($configStore).folderPattern = set(directory, proxy(newDirectory)), untrack($configStore));
  }
  function updateFilename(__1, filename, $configStore, configStore) {
    const newFilename = replaceInvalidChar(get$1(filename));
    if (newFilename === "") {
      set(filename, proxy($configStore().filenamePattern));
    } else {
      store_mutate(configStore, untrack($configStore).filenamePattern = set(filename, proxy(newFilename)), untrack($configStore));
    }
  }
  async function updatefsaDir(__2, fsaDirectory) {
    set(fsaDirectory, proxy(await downloader.updateDirHandle()));
  }
  var root_1$5 = /* @__PURE__ */ template(`<input type="text">`);
  var root_2$3 = /* @__PURE__ */ template(`<input type="text" disabled>`);
  var root_3$4 = /* @__PURE__ */ template(`<button class="chip variant-soft hover:variant-filled"><span> </span></button>`);
  var root_5$2 = /* @__PURE__ */ template(`<!> <!> <!>`, 1);
  var root_4$2 = /* @__PURE__ */ template(`<li><p class="flex-auto"> </p> <span class="text-sm italic"> </span> <button class="btn btn-sm variant-filled"> </button></li> <li><p class="flex-auto"> </p> <!></li>`, 1);
  var root_9$2 = /* @__PURE__ */ template(`<button class="chip variant-soft hover:variant-filled"><span> </span></button>`);
  var root_11 = /* @__PURE__ */ template(`<!> <!> <!> <!>`, 1);
  var root_10 = /* @__PURE__ */ template(`<li><div class="flex-auto"><p> </p> <p> </p></div> <!></li>`);
  var root$6 = /* @__PURE__ */ template(`<div><section><p> </p> <ul><li class=" flex-col gap-3"><div class="input-group input-group-divider grid-cols-[auto_1fr_auto_auto]"><button type="button" class="[&amp;:not([disabled])]:variant-soft-primary"><i class=" w-6 fill-current"><!></i></button> <!> <button type="button" class="variant-soft-surface [&amp;:not([disabled])]:variant-soft-primary"><i class=" w-6 fill-current"><!></i></button></div> <div class=" flex flex-wrap self-start gap-y-1 gap-x-2"></div></li> <li><p class="flex-auto"> </p> <!></li> <!></ul></section> <section><p> </p> <ul><li class=" flex-col gap-3"><div class="input-group input-group-divider grid-cols-[auto_1fr_auto]"><button type="button" class="[&amp;:not([disabled])]:variant-soft-primary"><i class=" w-6 fill-current"><!></i></button> <input type="text" required> <button type="button" class="variant-soft-surface dark:variant-fill-surface [&amp;:not([disabled])]:variant-soft-primary"><i class=" w-6 fill-current"><!></i></button></div> <div class=" flex flex-wrap self-start gap-y-1 gap-x-2"></div></li> <!></ul></section></div>`);
  function SaveTo($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $configStore = () => store_get(configStore, "$configStore", $$stores);
    let bg = prop($$props, "bg", 3, "bg-white/30 dark:bg-black/15"), border = prop($$props, "border", 3, "divide-y-[1px] *:border-surface-300-600-token"), padding = prop($$props, "padding", 3, "px-4 *:py-4"), margin = prop($$props, "margin", 3, "mt-2 *:!m-0"), rounded = prop($$props, "rounded", 3, "rounded-container-token *:!rounded-none"), sectionSpace = prop($$props, "sectionSpace", 19, () => `space-y-4`), sectionTitle = prop($$props, "sectionTitle", 3, "font-bold"), UlClass = prop($$props, "class", 3, ""), templates = prop($$props, "templates", 19, () => getContext("supportedTemplate")), descriptionText = prop($$props, "descriptionText", 3, "text-sm text-surface-400");
    const configStore = getContext("store");
    const ulClasses = /* @__PURE__ */ derived$1(() => `list *:items-center ${padding()} ${margin()} ${border()} ${bg()} ${rounded()} ${UlClass()}`);
    let directoryRef;
    let filenameRef;
    let directory = state(proxy($configStore().folderPattern));
    let filename = state(proxy($configStore().filenamePattern));
    let fsaDirectory = state(proxy(downloader.getCurrentFsaDirName()));
    async function resetFolder() {
      set(directory, proxy($configStore().folderPattern));
      await tick();
      const pos = get$1(directory).length;
      directoryRef.focus();
      directoryRef.setSelectionRange(pos, pos);
    }
    async function resetFilename() {
      set(filename, proxy($configStore().filenamePattern));
      await tick();
      const pos = get$1(filename).length;
      filenameRef.focus();
      filenameRef.setSelectionRange(pos, pos);
    }
    function insertDirTemplateAtCursor(template2) {
      return async () => {
        const start = directoryRef.selectionStart;
        const end = directoryRef.selectionEnd;
        set(directory, get$1(directory).slice(0, start) + template2 + get$1(directory).slice(end));
        await tick();
        const newStart = start + template2.length;
        directoryRef.focus();
        directoryRef.setSelectionRange(newStart, newStart);
      };
    }
    function insertFilenameTemplateAtCursor(template2) {
      return async () => {
        const start = filenameRef.selectionStart;
        const end = filenameRef.selectionEnd;
        set(filename, get$1(filename).slice(0, start) + template2 + get$1(filename).slice(end));
        await tick();
        const newStart = start + template2.length;
        filenameRef.focus();
        filenameRef.setSelectionRange(newStart, newStart);
      };
    }
    const subDirectoryAvailable = /* @__PURE__ */ derived$1(() => $configStore().useFileSystemAccess || env.isSupportSubpath());
    const folderBtnDisabled = /* @__PURE__ */ derived$1(() => get$1(directory) === $configStore().folderPattern);
    const filenameBtnDisabled = /* @__PURE__ */ derived$1(() => get$1(filename) === $configStore().filenamePattern);
    const directoryPlaceholder = /* @__PURE__ */ derived$1(() => get$1(subDirectoryAvailable) ? t("setting.save_to.placeholder.sub_directory_unused") : env.isViolentmonkey() ? t("setting.save_to.placeholder.vm_not_supported") : t("setting.save_to.placeholder.need_browser_api"));
    var div = root$6();
    var section = child(div);
    var p = child(section);
    var text$1 = child(p, true);
    template_effect(() => set_text(text$1, t("setting.save_to.label.directory")));
    reset(p);
    var ul = sibling(p, 2);
    var li = child(ul);
    var div_1 = child(li);
    var button = child(div_1);
    button.__click = resetFolder;
    var i = child(button);
    var node = child(i);
    html(node, () => folderSvg);
    reset(i);
    reset(button);
    var node_1 = sibling(button, 2);
    {
      var consequent = ($$anchor2) => {
        var input = root_1$5();
        remove_input_defaults(input);
        bind_this(input, ($$value) => directoryRef = $$value, () => directoryRef);
        template_effect(() => set_attribute(input, "placeholder", get$1(directoryPlaceholder)));
        bind_value(input, () => get$1(directory), ($$value) => set(directory, $$value));
        append($$anchor2, input);
      };
      var alternate = ($$anchor2) => {
        var input_1 = root_2$3();
        template_effect(() => set_attribute(input_1, "placeholder", get$1(directoryPlaceholder)));
        append($$anchor2, input_1);
      };
      if_block(node_1, ($$render) => {
        if (get$1(subDirectoryAvailable)) $$render(consequent);
        else $$render(alternate, false);
      });
    }
    var button_1 = sibling(node_1, 2);
    button_1.__click = [
      updateDirectory,
      directory,
      $configStore,
      configStore
    ];
    var i_1 = child(button_1);
    var node_2 = child(i_1);
    html(node_2, () => check);
    reset(i_1);
    reset(button_1);
    reset(div_1);
    var div_2 = sibling(div_1, 2);
    each(div_2, 21, () => Object.entries(templates()), index, ($$anchor2, $$item) => {
      let template2 = () => get$1($$item)[0];
      let description = () => get$1($$item)[1];
      var button_2 = root_3$4();
      var event_handler = /* @__PURE__ */ derived$1(() => insertDirTemplateAtCursor(`{${template2()}}`));
      button_2.__click = function(...$$args) {
        var _a;
        (_a = get$1(event_handler)) == null ? undefined : _a.apply(this, $$args);
      };
      var span = child(button_2);
      var text_1 = child(span, true);
      reset(span);
      reset(button_2);
      template_effect(() => {
        button_2.disabled = !get$1(subDirectoryAvailable);
        set_text(text_1, description());
      });
      append($$anchor2, button_2);
    });
    reset(div_2);
    reset(li);
    var li_1 = sibling(li, 2);
    var p_1 = child(li_1);
    var text_2 = child(p_1, true);
    template_effect(() => set_text(text_2, t("setting.save_to.options.use_fsa")));
    reset(p_1);
    var node_3 = sibling(p_1, 2);
    var disabled = /* @__PURE__ */ derived$1(() => !env.isFileSystemAccessAvaliable());
    SlideToggle(node_3, {
      size: "sm",
      name: "fsa-enable",
      get disabled() {
        return get$1(disabled);
      },
      get checked() {
        return $configStore().useFileSystemAccess;
      },
      set checked($$value) {
        store_mutate(configStore, untrack($configStore).useFileSystemAccess = $$value, untrack($configStore));
      }
    });
    reset(li_1);
    var node_4 = sibling(li_1, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var fragment = root_4$2();
        var li_2 = first_child(fragment);
        var p_2 = child(li_2);
        var text_3 = child(p_2, true);
        template_effect(() => set_text(text_3, t("setting.save_to.options.fsa_directory")));
        reset(p_2);
        var span_1 = sibling(p_2, 2);
        var text_4 = child(span_1, true);
        reset(span_1);
        var button_3 = sibling(span_1, 2);
        button_3.__click = [updatefsaDir, fsaDirectory];
        var text_5 = child(button_3, true);
        template_effect(() => set_text(text_5, t("setting.save_to.button.choose_fsa_directory")));
        reset(button_3);
        reset(li_2);
        var li_3 = sibling(li_2, 2);
        var p_3 = child(li_3);
        var text_6 = child(p_3, true);
        template_effect(() => set_text(text_6, t("setting.save_to.options.fsa_filename_conflict")));
        reset(p_3);
        var node_5 = sibling(p_3, 2);
        RadioGroup(node_5, {
          class: "shrink-0",
          children: ($$anchor3, $$slotProps) => {
            var fragment_1 = root_5$2();
            var node_6 = first_child(fragment_1);
            RadioItem(node_6, {
              name: "filenameConfigAction",
              class: "text-sm",
              get value() {
                return FilenameConfigAction.UNIQUIFY;
              },
              get group() {
                return $configStore().fileSystemFilenameConflictAction;
              },
              set group($$value) {
                store_mutate(configStore, untrack($configStore).fileSystemFilenameConflictAction = $$value, untrack($configStore));
              },
              children: ($$anchor4, $$slotProps2) => {
                next();
                var text_7 = text();
                template_effect(() => set_text(text_7, t("setting.save_to.radio.filename_conflict_option_uniquify")));
                append($$anchor4, text_7);
              },
              $$slots: { default: true }
            });
            var node_7 = sibling(node_6, 2);
            RadioItem(node_7, {
              name: "filenameConfigAction",
              class: "text-sm",
              get value() {
                return FilenameConfigAction.OVERWRITE;
              },
              get group() {
                return $configStore().fileSystemFilenameConflictAction;
              },
              set group($$value) {
                store_mutate(configStore, untrack($configStore).fileSystemFilenameConflictAction = $$value, untrack($configStore));
              },
              children: ($$anchor4, $$slotProps2) => {
                next();
                var text_8 = text();
                template_effect(() => set_text(text_8, t("setting.save_to.radio.filename_conflict_option_overwrite")));
                append($$anchor4, text_8);
              },
              $$slots: { default: true }
            });
            var node_8 = sibling(node_7, 2);
            RadioItem(node_8, {
              name: "filenameConfigAction",
              class: "text-sm",
              get value() {
                return FilenameConfigAction.PROMPT;
              },
              get group() {
                return $configStore().fileSystemFilenameConflictAction;
              },
              set group($$value) {
                store_mutate(configStore, untrack($configStore).fileSystemFilenameConflictAction = $$value, untrack($configStore));
              },
              children: ($$anchor4, $$slotProps2) => {
                next();
                var text_9 = text();
                template_effect(() => set_text(text_9, t("setting.save_to.radio.filename_conflict_option_prompt")));
                append($$anchor4, text_9);
              },
              $$slots: { default: true }
            });
            append($$anchor3, fragment_1);
          },
          $$slots: { default: true }
        });
        reset(li_3);
        template_effect(() => set_text(text_4, get$1(fsaDirectory)));
        append($$anchor2, fragment);
      };
      if_block(node_4, ($$render) => {
        if ($configStore().useFileSystemAccess) $$render(consequent_1);
      });
    }
    reset(ul);
    reset(section);
    var section_1 = sibling(section, 2);
    var p_4 = child(section_1);
    var text_10 = child(p_4, true);
    template_effect(() => set_text(text_10, t("setting.save_to.label.filename")));
    reset(p_4);
    var ul_1 = sibling(p_4, 2);
    var li_4 = child(ul_1);
    var div_3 = child(li_4);
    var button_4 = child(div_3);
    button_4.__click = resetFilename;
    var i_2 = child(button_4);
    var node_9 = child(i_2);
    html(node_9, () => fileSvg);
    reset(i_2);
    reset(button_4);
    var input_2 = sibling(button_4, 2);
    remove_input_defaults(input_2);
    template_effect(() => set_attribute(input_2, "placeholder", t("setting.save_to.placeholder.filename_requried")));
    bind_this(input_2, ($$value) => filenameRef = $$value, () => filenameRef);
    var button_5 = sibling(input_2, 2);
    button_5.__click = [
      updateFilename,
      filename,
      $configStore,
      configStore
    ];
    var i_3 = child(button_5);
    var node_10 = child(i_3);
    html(node_10, () => check);
    reset(i_3);
    reset(button_5);
    reset(div_3);
    var div_4 = sibling(div_3, 2);
    each(div_4, 21, () => Object.entries(templates()), index, ($$anchor2, $$item) => {
      let template2 = () => get$1($$item)[0];
      let description = () => get$1($$item)[1];
      var button_6 = root_9$2();
      var event_handler_1 = /* @__PURE__ */ derived$1(() => insertFilenameTemplateAtCursor(`{${template2()}}`));
      button_6.__click = function(...$$args) {
        var _a;
        (_a = get$1(event_handler_1)) == null ? undefined : _a.apply(this, $$args);
      };
      var span_2 = child(button_6);
      var text_11 = child(span_2, true);
      reset(span_2);
      reset(button_6);
      template_effect(() => set_text(text_11, description()));
      append($$anchor2, button_6);
    });
    reset(div_4);
    reset(li_4);
    var node_11 = sibling(li_4, 2);
    {
      var consequent_2 = ($$anchor2) => {
        var li_5 = root_10();
        var div_5 = child(li_5);
        var p_5 = child(div_5);
        var text_12 = child(p_5, true);
        template_effect(() => set_text(text_12, t("setting.save_to.options.tag_language")));
        reset(p_5);
        var p_6 = sibling(p_5, 2);
        var text_13 = child(p_6, true);
        template_effect(() => set_text(text_13, t("setting.save_to.options.tag_language_tips")));
        reset(p_6);
        reset(div_5);
        var node_12 = sibling(div_5, 2);
        RadioGroup(node_12, {
          class: " shrink-0",
          children: ($$anchor3, $$slotProps) => {
            var fragment_5 = root_11();
            var node_13 = first_child(fragment_5);
            RadioItem(node_13, {
              name: "tagLang",
              class: "text-sm",
              get value() {
                return TagLanguage.JAPANESE;
              },
              get group() {
                return $configStore().tagLang;
              },
              set group($$value) {
                store_mutate(configStore, untrack($configStore).tagLang = $$value, untrack($configStore));
              },
              children: ($$anchor4, $$slotProps2) => {
                next();
                var text_14 = text("日本語");
                append($$anchor4, text_14);
              },
              $$slots: { default: true }
            });
            var node_14 = sibling(node_13, 2);
            RadioItem(node_14, {
              name: "tagLang",
              class: "text-sm",
              get value() {
                return TagLanguage.CHINESE;
              },
              get group() {
                return $configStore().tagLang;
              },
              set group($$value) {
                store_mutate(configStore, untrack($configStore).tagLang = $$value, untrack($configStore));
              },
              children: ($$anchor4, $$slotProps2) => {
                next();
                var text_15 = text("简中");
                append($$anchor4, text_15);
              },
              $$slots: { default: true }
            });
            var node_15 = sibling(node_14, 2);
            RadioItem(node_15, {
              name: "tagLang",
              class: "text-sm",
              get value() {
                return TagLanguage.TRADITIONAL_CHINESE;
              },
              get group() {
                return $configStore().tagLang;
              },
              set group($$value) {
                store_mutate(configStore, untrack($configStore).tagLang = $$value, untrack($configStore));
              },
              children: ($$anchor4, $$slotProps2) => {
                next();
                var text_16 = text("繁中");
                append($$anchor4, text_16);
              },
              $$slots: { default: true }
            });
            var node_16 = sibling(node_15, 2);
            RadioItem(node_16, {
              name: "tagLang",
              class: "text-sm",
              get value() {
                return TagLanguage.ENGLISH;
              },
              get group() {
                return $configStore().tagLang;
              },
              set group($$value) {
                store_mutate(configStore, untrack($configStore).tagLang = $$value, untrack($configStore));
              },
              children: ($$anchor4, $$slotProps2) => {
                next();
                var text_17 = text("En");
                append($$anchor4, text_17);
              },
              $$slots: { default: true }
            });
            append($$anchor3, fragment_5);
          },
          $$slots: { default: true }
        });
        reset(li_5);
        template_effect(() => set_class(p_6, clsx(descriptionText())));
        append($$anchor2, li_5);
      };
      if_block(node_11, ($$render) => {
        if (env.isPixiv()) $$render(consequent_2);
      });
    }
    reset(ul_1);
    reset(section_1);
    reset(div);
    template_effect(() => {
      set_class(div, clsx(sectionSpace()));
      set_class(p, clsx(sectionTitle()));
      set_class(ul, clsx(get$1(ulClasses)));
      button.disabled = get$1(folderBtnDisabled);
      button_1.disabled = get$1(folderBtnDisabled);
      set_class(p_4, clsx(sectionTitle()));
      set_class(ul_1, clsx(get$1(ulClasses)));
      button_4.disabled = get$1(filenameBtnDisabled);
      button_5.disabled = get$1(filenameBtnDisabled);
    });
    bind_value(input_2, () => get$1(filename), ($$value) => set(filename, $$value));
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["click"]);
  var root_1$4 = /* @__PURE__ */ template(`<!> <!> <!> <!> <!> <!>`, 1);
  var root_8 = /* @__PURE__ */ template(`<option> </option>`);
  var root_9$1 = /* @__PURE__ */ template(`<option> </option>`);
  var root$5 = /* @__PURE__ */ template(`<div><section><p> </p> <ul><li><p class="flex-auto"> </p> <!></li></ul></section> <section><p> </p> <ul><li><div class="flex-auto"><p>Webm</p> <p>Bitrate (Mbps)</p></div> <input type="number" min="1" max="120" step="1"></li> <li><div class="flex-auto"><p>Mp4</p> <p>Bitrate (Mbps)</p></div> <input type="number" min="1" max="99" step="1"></li> <li class="flex-col !items-stretch"><p>Webp</p> <ul><li class="items-center"><p class="flex-auto"> </p> <!></li> <li class="items-center"><div class="flex-auto"><p> </p> <p> </p></div> <input type="number" min="0" max="100" step="1"></li> <li class="items-center"><div class="flex-auto"><p> </p> <p> </p></div> <select></select></li></ul></li> <li><div class="flex-auto"><p>Gif</p> <p> </p></div> <select></select></li> <li><div class="flex-auto"><p>Png</p> <p> </p></div> <input type="number" min="0" max="256" step="1"></li></ul></section></div>`);
  function UgoiraConvert($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $configStore = () => store_get(configStore, "$configStore", $$stores);
    let bg = prop($$props, "bg", 3, "bg-white/30 dark:bg-black/15"), border = prop($$props, "border", 3, "divide-y-[1px] *:border-surface-300-600-token"), padding = prop($$props, "padding", 3, "px-4 *:py-4"), margin = prop($$props, "margin", 3, "mt-2 *:!m-0"), rounded = prop($$props, "rounded", 3, "rounded-container-token *:!rounded-none"), sectionSpace = prop($$props, "sectionSpace", 19, () => `space-y-4`), sectionTitle = prop($$props, "sectionTitle", 3, "font-bold"), UlClass = prop($$props, "class", 3, ""), descriptionText = prop($$props, "descriptionText", 3, "text-sm text-surface-400"), inputRounded = prop($$props, "inputRounded", 3, "rounded-full"), inputWidth = prop($$props, "inputWidth", 3, "w-32");
    const configStore = getContext("store");
    const ulClasses = /* @__PURE__ */ derived$1(() => `list *:items-center ${padding()} ${margin()} ${border()} ${bg()} ${rounded()} ${UlClass()}`);
    const inputClasses = /* @__PURE__ */ derived$1(() => `${inputWidth()} ${inputRounded()} shrink-0`);
    var div = root$5();
    var section = child(div);
    var p = child(section);
    var text$1 = child(p, true);
    template_effect(() => set_text(text$1, t("setting.ugoira.label.format")));
    reset(p);
    var ul = sibling(p, 2);
    var li = child(ul);
    var p_1 = child(li);
    var text_1 = child(p_1, true);
    template_effect(() => set_text(text_1, t("setting.ugoira.options.select_format")));
    reset(p_1);
    var node = sibling(p_1, 2);
    RadioGroup(node, {
      class: "shrink-0",
      children: ($$anchor2, $$slotProps) => {
        var fragment = root_1$4();
        var node_1 = first_child(fragment);
        RadioItem(node_1, {
          name: "ugoiraFormat",
          class: "text-sm",
          get value() {
            return UgoiraFormat.ZIP;
          },
          get group() {
            return $configStore().ugoiraFormat;
          },
          set group($$value) {
            store_mutate(configStore, untrack($configStore).ugoiraFormat = $$value, untrack($configStore));
          },
          children: ($$anchor3, $$slotProps2) => {
            next();
            var text_2 = text("Zip");
            append($$anchor3, text_2);
          },
          $$slots: { default: true }
        });
        var node_2 = sibling(node_1, 2);
        RadioItem(node_2, {
          name: "ugoiraFormat",
          class: "text-sm",
          get value() {
            return UgoiraFormat.WEBM;
          },
          get group() {
            return $configStore().ugoiraFormat;
          },
          set group($$value) {
            store_mutate(configStore, untrack($configStore).ugoiraFormat = $$value, untrack($configStore));
          },
          children: ($$anchor3, $$slotProps2) => {
            next();
            var text_3 = text("Webm");
            append($$anchor3, text_3);
          },
          $$slots: { default: true }
        });
        var node_3 = sibling(node_2, 2);
        var disabled = /* @__PURE__ */ derived$1(() => !env.videoFrameSupported());
        RadioItem(node_3, {
          get disabled() {
            return get$1(disabled);
          },
          class: "text-sm",
          name: "ugoiraFormat",
          get value() {
            return UgoiraFormat.MP4;
          },
          get group() {
            return $configStore().ugoiraFormat;
          },
          set group($$value) {
            store_mutate(configStore, untrack($configStore).ugoiraFormat = $$value, untrack($configStore));
          },
          children: ($$anchor3, $$slotProps2) => {
            next();
            var text_4 = text("Mp4");
            append($$anchor3, text_4);
          },
          $$slots: { default: true }
        });
        var node_4 = sibling(node_3, 2);
        RadioItem(node_4, {
          name: "ugoiraFormat",
          class: "text-sm",
          get value() {
            return UgoiraFormat.WEBP;
          },
          get group() {
            return $configStore().ugoiraFormat;
          },
          set group($$value) {
            store_mutate(configStore, untrack($configStore).ugoiraFormat = $$value, untrack($configStore));
          },
          children: ($$anchor3, $$slotProps2) => {
            next();
            var text_5 = text("Webp");
            append($$anchor3, text_5);
          },
          $$slots: { default: true }
        });
        var node_5 = sibling(node_4, 2);
        RadioItem(node_5, {
          name: "ugoiraFormat",
          class: "text-sm",
          get value() {
            return UgoiraFormat.GIF;
          },
          get group() {
            return $configStore().ugoiraFormat;
          },
          set group($$value) {
            store_mutate(configStore, untrack($configStore).ugoiraFormat = $$value, untrack($configStore));
          },
          children: ($$anchor3, $$slotProps2) => {
            next();
            var text_6 = text("Gif");
            append($$anchor3, text_6);
          },
          $$slots: { default: true }
        });
        var node_6 = sibling(node_5, 2);
        RadioItem(node_6, {
          name: "ugoiraFormat",
          class: "text-sm",
          get value() {
            return UgoiraFormat.PNG;
          },
          get group() {
            return $configStore().ugoiraFormat;
          },
          set group($$value) {
            store_mutate(configStore, untrack($configStore).ugoiraFormat = $$value, untrack($configStore));
          },
          children: ($$anchor3, $$slotProps2) => {
            next();
            var text_7 = text("Png");
            append($$anchor3, text_7);
          },
          $$slots: { default: true }
        });
        append($$anchor2, fragment);
      },
      $$slots: { default: true }
    });
    reset(li);
    reset(ul);
    reset(section);
    var section_1 = sibling(section, 2);
    var p_2 = child(section_1);
    var text_8 = child(p_2, true);
    template_effect(() => set_text(text_8, t("setting.ugoira.label.quality")));
    reset(p_2);
    var ul_1 = sibling(p_2, 2);
    var li_1 = child(ul_1);
    var div_1 = child(li_1);
    var p_3 = sibling(child(div_1), 2);
    reset(div_1);
    var input = sibling(div_1, 2);
    remove_input_defaults(input);
    action(input, ($$node, $$action_arg) => nonNegativeInt == null ? undefined : nonNegativeInt($$node, $$action_arg), () => ({ store: configStore, key: "webmBitrate" }));
    effect(() => bind_value(input, () => $configStore().webmBitrate, ($$value) => store_mutate(configStore, untrack($configStore).webmBitrate = $$value, untrack($configStore))));
    reset(li_1);
    var li_2 = sibling(li_1, 2);
    var div_2 = child(li_2);
    var p_4 = sibling(child(div_2), 2);
    reset(div_2);
    var input_1 = sibling(div_2, 2);
    remove_input_defaults(input_1);
    action(input_1, ($$node, $$action_arg) => nonNegativeInt == null ? undefined : nonNegativeInt($$node, $$action_arg), () => ({ store: configStore, key: "mp4Bitrate" }));
    effect(() => bind_value(input_1, () => $configStore().mp4Bitrate, ($$value) => store_mutate(configStore, untrack($configStore).mp4Bitrate = $$value, untrack($configStore))));
    reset(li_2);
    var li_3 = sibling(li_2, 2);
    var ul_2 = sibling(child(li_3), 2);
    var li_4 = child(ul_2);
    var p_5 = child(li_4);
    var text_9 = child(p_5, true);
    template_effect(() => set_text(text_9, t("setting.ugoira.options.webp_lossy")));
    reset(p_5);
    var node_7 = sibling(p_5, 2);
    SlideToggle(node_7, {
      name: "lossless-webp",
      size: "sm",
      get checked() {
        return $configStore().losslessWebp;
      },
      set checked($$value) {
        store_mutate(configStore, untrack($configStore).losslessWebp = $$value, untrack($configStore));
      }
    });
    reset(li_4);
    var li_5 = sibling(li_4, 2);
    var div_3 = child(li_5);
    var p_6 = child(div_3);
    var text_10 = child(p_6, true);
    template_effect(() => set_text(text_10, t("setting.ugoira.options.webp_quality")));
    reset(p_6);
    var p_7 = sibling(p_6, 2);
    var text_11 = child(p_7, true);
    template_effect(() => set_text(text_11, t("setting.ugoira.options.webp_quality_tips")));
    reset(p_7);
    reset(div_3);
    var input_2 = sibling(div_3, 2);
    remove_input_defaults(input_2);
    action(input_2, ($$node, $$action_arg) => nonNegativeInt == null ? undefined : nonNegativeInt($$node, $$action_arg), () => ({ store: configStore, key: "webpQuality" }));
    effect(() => bind_value(input_2, () => $configStore().webpQuality, ($$value) => store_mutate(configStore, untrack($configStore).webpQuality = $$value, untrack($configStore))));
    reset(li_5);
    var li_6 = sibling(li_5, 2);
    var div_4 = child(li_6);
    var p_8 = child(div_4);
    var text_12 = child(p_8, true);
    template_effect(() => set_text(text_12, t("setting.ugoira.options.webp_method")));
    reset(p_8);
    var p_9 = sibling(p_8, 2);
    var text_13 = child(p_9, true);
    template_effect(() => set_text(text_13, t("setting.ugoira.options.webp_method_tips")));
    reset(p_9);
    reset(div_4);
    var select = sibling(div_4, 2);
    each(select, 20, () => Array.from({ length: 7 }, (_, idx) => idx), index, ($$anchor2, quality) => {
      var option = root_8();
      var option_value = {};
      var text_14 = child(option, true);
      reset(option);
      template_effect(() => {
        if (option_value !== (option_value = quality)) {
          option.value = null == (option.__value = quality) ? "" : quality;
        }
        set_text(text_14, quality);
      });
      append($$anchor2, option);
    });
    reset(select);
    reset(li_6);
    reset(ul_2);
    reset(li_3);
    var li_7 = sibling(li_3, 2);
    var div_5 = child(li_7);
    var p_10 = sibling(child(div_5), 2);
    var text_15 = child(p_10, true);
    template_effect(() => set_text(text_15, t("setting.ugoira.options.gif_tips")));
    reset(p_10);
    reset(div_5);
    var select_1 = sibling(div_5, 2);
    each(select_1, 20, () => Array.from({ length: 20 }, (_, idx) => idx), index, ($$anchor2, quality) => {
      var option_1 = root_9$1();
      var option_1_value = {};
      var text_16 = child(option_1, true);
      reset(option_1);
      template_effect(() => {
        if (option_1_value !== (option_1_value = quality + 1)) {
          option_1.value = null == (option_1.__value = quality + 1) ? "" : quality + 1;
        }
        set_text(text_16, quality + 1);
      });
      append($$anchor2, option_1);
    });
    reset(select_1);
    reset(li_7);
    var li_8 = sibling(li_7, 2);
    var div_6 = child(li_8);
    var p_11 = sibling(child(div_6), 2);
    var text_17 = child(p_11, true);
    template_effect(() => set_text(text_17, t("setting.ugoira.options.png_tips")));
    reset(p_11);
    reset(div_6);
    var input_3 = sibling(div_6, 2);
    remove_input_defaults(input_3);
    action(input_3, ($$node, $$action_arg) => nonNegativeInt == null ? undefined : nonNegativeInt($$node, $$action_arg), () => ({ store: configStore, key: "pngColor" }));
    effect(() => bind_value(input_3, () => $configStore().pngColor, ($$value) => store_mutate(configStore, untrack($configStore).pngColor = $$value, untrack($configStore))));
    reset(li_8);
    reset(ul_1);
    reset(section_1);
    reset(div);
    template_effect(() => {
      set_class(div, clsx(sectionSpace()));
      set_class(p, clsx(sectionTitle()));
      set_class(ul, clsx(get$1(ulClasses)));
      set_class(p_2, clsx(sectionTitle()));
      set_class(ul_1, clsx(get$1(ulClasses)));
      set_class(p_3, clsx(descriptionText()));
      set_class(input, `input ${get$1(inputClasses) ?? ""}`);
      set_class(p_4, clsx(descriptionText()));
      set_class(input_1, `input ${get$1(inputClasses) ?? ""}`);
      set_class(ul_2, `list ${border() ?? ""} ${rounded() ?? ""} [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4`);
      set_class(p_7, clsx(descriptionText()));
      set_class(input_2, `input ${get$1(inputClasses) ?? ""}`);
      set_class(p_9, clsx(descriptionText()));
      set_class(select, `select ${get$1(inputClasses) ?? ""}`);
      set_class(p_10, clsx(descriptionText()));
      set_class(select_1, `select ${get$1(inputClasses) ?? ""}`);
      set_class(p_11, clsx(descriptionText()));
      set_class(input_3, `input ${get$1(inputClasses) ?? ""}`);
    });
    bind_select_value(select, () => $configStore().webpMehtod, ($$value) => store_mutate(configStore, untrack($configStore).webpMehtod = $$value, untrack($configStore)));
    bind_select_value(select_1, () => $configStore().gifQuality, ($$value) => store_mutate(configStore, untrack($configStore).gifQuality = $$value, untrack($configStore)));
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  function readHistoryFile(type, file) {
    return new Promise((resolve) => {
      if (file.type !== type) throw new Error("Invalid file");
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (readEvt) => {
        var _a;
        const text2 = (_a = readEvt.target) == null ? undefined : _a.result;
        if (typeof text2 !== "string") throw new Error("Invalid file");
        const history2 = JSON.parse(text2);
        if (!(history2 instanceof Array)) throw new Error("Invalid file");
        resolve(history2);
      };
    });
  }
  function importJSON(file) {
    return readHistoryFile("application/json", file).then((data) => historyDb.import(data));
  }
  function exportAsJSON() {
    return historyDb.getAll().then((datas) => {
      const str = JSON.stringify(datas);
      const blob = new Blob([str], { type: "application/json" });
      const filename = `Pixiv Downloader_${location.hostname}_${(/* @__PURE__ */ new Date()).toLocaleString()}.json`;
      aDownload$1(blob, filename);
    });
  }
  function exportAsCSV() {
    return historyDb.generateCsv().then((csv) => {
      const filename = `Pixiv Downloader_${location.hostname}_${(/* @__PURE__ */ new Date()).toLocaleString()}.csv`;
      aDownload$1(csv, filename);
    });
  }
  function scheduleBackup() {
    const interval = config.get("historyBackupInterval");
    if (interval === HistoryBackupInterval.NEVER) return;
    const lastTimestamp = config.get("lastHistoryBackup");
    const timestamp = (/* @__PURE__ */ new Date()).getTime();
    if (!lastTimestamp || lastTimestamp + interval * 1e3 < timestamp) {
      exportAsJSON();
      config.update((val) => ({ ...val, lastHistoryBackup: timestamp }));
    }
  }
  function useHistoryBackup() {
    return {
      importJSON,
      exportAsJSON,
      exportAsCSV,
      scheduleBackup
    };
  }
  var root_3$3 = /* @__PURE__ */ template(`<!> <span> </span>`, 1);
  var root$4 = /* @__PURE__ */ template(`<div><section><p> </p> <ul><li><p class="flex-auto"> </p> <select><option> </option><option> </option><option> </option><option> </option></select></li></ul></section> <section><p> </p> <ul><li><p class="flex-auto"> </p> <button class="btn variant-filled"><!> <span> </span></button></li> <li><p class="flex-auto"> </p> <button class="btn variant-filled"><!> <span> </span></button></li></ul></section> <section><p> </p> <ul><li><p class="flex-auto"> </p> <!></li></ul></section> <section><p> </p> <ul><li><p class="flex-auto"> </p> <button class="btn variant-filled"><!> <span> </span></button></li></ul></section></div>`);
  function DownloadHistory($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $configStore = () => store_get(configStore, "$configStore", $$stores);
    const $exportJsonPending = () => store_get(exportJsonPending, "$exportJsonPending", $$stores);
    const $exportCsvPending = () => store_get(exportCsvPending, "$exportCsvPending", $$stores);
    const $importPending = () => store_get(importPending, "$importPending", $$stores);
    const $clearPending = () => store_get(clearPending, "$clearPending", $$stores);
    let bg = prop($$props, "bg", 3, "bg-white/30 dark:bg-black/15"), border = prop($$props, "border", 3, "divide-y-[1px] *:border-surface-300-600-token"), padding = prop($$props, "padding", 3, "px-4 *:py-4"), margin = prop($$props, "margin", 3, "mt-2 *:!m-0"), rounded = prop($$props, "rounded", 3, "rounded-container-token *:!rounded-none"), sectionSpace = prop($$props, "sectionSpace", 19, () => `space-y-4`), sectionTitle = prop($$props, "sectionTitle", 3, "font-bold"), inputRounded = prop($$props, "inputRounded", 3, "rounded-full"), inputWidth = prop($$props, "inputWidth", 3, "w-32"), UlClass = prop($$props, "class", 3, "");
    const configStore = getContext("store");
    const ulClasses = /* @__PURE__ */ derived$1(() => `list *:items-center ${padding()} ${margin()} ${border()} ${bg()} ${rounded()} ${UlClass()}`);
    const inputClasses = /* @__PURE__ */ derived$1(() => `${inputWidth()} ${inputRounded()} shrink-0`);
    function usePendingButton(fn) {
      const store = writable(false);
      return {
        store,
        async wrapFn(...args) {
          store.set(true);
          const result = await fn(...args);
          store.set(false);
          return result;
        }
      };
    }
    async function importFromJSON(evt) {
      var _a;
      const file = (_a = evt.currentTarget.files) == null ? undefined : _a[0];
      if (!file) return;
      try {
        await importJSON2(file);
      } catch (error) {
        logger.error(error);
        alert(error);
      }
    }
    function clearDb() {
      const isConfirm = confirm(t("setting.history.text.confirm_clear_history"));
      if (!isConfirm) return;
      return historyDb.clear();
    }
    const { importJSON: importJSON2, exportAsJSON: exportAsJSON2, exportAsCSV: exportAsCSV2 } = useHistoryBackup();
    const {
      store: importPending,
      wrapFn: wrapImportFromJSON
    } = usePendingButton(importFromJSON);
    const { store: clearPending, wrapFn: wrapClearDb } = usePendingButton(clearDb);
    const {
      store: exportJsonPending,
      wrapFn: wrapExportAsJSON
    } = usePendingButton(exportAsJSON2);
    const {
      store: exportCsvPending,
      wrapFn: wrapExportAsCSV
    } = usePendingButton(exportAsCSV2);
    var div = root$4();
    var section = child(div);
    var p = child(section);
    var text2 = child(p, true);
    template_effect(() => set_text(text2, t("setting.history.label.scheduled_backups")));
    reset(p);
    var ul = sibling(p, 2);
    var li = child(ul);
    var p_1 = child(li);
    var text_1 = child(p_1, true);
    template_effect(() => set_text(text_1, t("setting.history.options.scheduled_backups")));
    reset(p_1);
    var select = sibling(p_1, 2);
    var option = child(select);
    var option_value = {};
    var text_2 = child(option, true);
    template_effect(() => set_text(text_2, t("setting.history.select.backup_interval_never")));
    reset(option);
    var option_1 = sibling(option);
    var option_1_value = {};
    var text_3 = child(option_1, true);
    template_effect(() => set_text(text_3, t("setting.history.select.backup_interval_every_day")));
    reset(option_1);
    var option_2 = sibling(option_1);
    var option_2_value = {};
    var text_4 = child(option_2, true);
    template_effect(() => set_text(text_4, t("setting.history.select.backup_interval_every_7_day")));
    reset(option_2);
    var option_3 = sibling(option_2);
    var option_3_value = {};
    var text_5 = child(option_3, true);
    template_effect(() => set_text(text_5, t("setting.history.select.backup_interval_every_30_day")));
    reset(option_3);
    reset(select);
    reset(li);
    reset(ul);
    reset(section);
    var section_1 = sibling(section, 2);
    var p_2 = child(section_1);
    var text_6 = child(p_2, true);
    template_effect(() => set_text(text_6, t("setting.history.label.export")));
    reset(p_2);
    var ul_1 = sibling(p_2, 2);
    var li_1 = child(ul_1);
    var p_3 = child(li_1);
    var text_7 = child(p_3, true);
    template_effect(() => set_text(text_7, t("setting.history.options.export_as_json")));
    reset(p_3);
    var button = sibling(p_3, 2);
    button.__click = wrapExportAsJSON;
    var node = child(button);
    {
      var consequent = ($$anchor2) => {
        ProgressRadial($$anchor2, {
          stroke: 80,
          width: "w-5",
          meter: "stroke-primary-500",
          track: "stroke-primary-500/30"
        });
      };
      if_block(node, ($$render) => {
        if ($exportJsonPending()) $$render(consequent);
      });
    }
    var span = sibling(node, 2);
    var text_8 = child(span, true);
    template_effect(() => set_text(text_8, t("setting.history.button.export")));
    reset(span);
    reset(button);
    reset(li_1);
    var li_2 = sibling(li_1, 2);
    var p_4 = child(li_2);
    var text_9 = child(p_4, true);
    template_effect(() => set_text(text_9, t("setting.history.options.export_as_csv")));
    reset(p_4);
    var button_1 = sibling(p_4, 2);
    button_1.__click = wrapExportAsCSV;
    var node_1 = child(button_1);
    {
      var consequent_1 = ($$anchor2) => {
        ProgressRadial($$anchor2, {
          stroke: 80,
          width: "w-5",
          meter: "stroke-primary-500",
          track: "stroke-primary-500/30"
        });
      };
      if_block(node_1, ($$render) => {
        if ($exportCsvPending()) $$render(consequent_1);
      });
    }
    var span_1 = sibling(node_1, 2);
    var text_10 = child(span_1, true);
    template_effect(() => set_text(text_10, t("setting.history.button.export")));
    reset(span_1);
    reset(button_1);
    reset(li_2);
    reset(ul_1);
    reset(section_1);
    var section_2 = sibling(section_1, 2);
    var p_5 = child(section_2);
    var text_11 = child(p_5, true);
    template_effect(() => set_text(text_11, t("setting.history.label.import")));
    reset(p_5);
    var ul_2 = sibling(p_5, 2);
    var li_3 = child(ul_2);
    var p_6 = child(li_3);
    var text_12 = child(p_6, true);
    template_effect(() => set_text(text_12, t("setting.history.options.import_json")));
    reset(p_6);
    var node_2 = sibling(p_6, 2);
    FileButton(node_2, {
      name: "import-file",
      accept: ".json",
      get disabled() {
        mark_store_binding();
        return $importPending();
      },
      set disabled($$value) {
        store_set(importPending, proxy($$value));
      },
      $$events: { change: wrapImportFromJSON },
      children: ($$anchor2, $$slotProps) => {
        var fragment_2 = root_3$3();
        var node_3 = first_child(fragment_2);
        {
          var consequent_2 = ($$anchor3) => {
            ProgressRadial($$anchor3, {
              stroke: 80,
              width: "w-5",
              meter: "stroke-primary-500",
              track: "stroke-primary-500/30"
            });
          };
          if_block(node_3, ($$render) => {
            if ($importPending()) $$render(consequent_2);
          });
        }
        var span_2 = sibling(node_3, 2);
        var text_13 = child(span_2, true);
        template_effect(() => set_text(text_13, t("setting.history.button.import")));
        reset(span_2);
        append($$anchor2, fragment_2);
      },
      $$slots: { default: true }
    });
    reset(li_3);
    reset(ul_2);
    reset(section_2);
    var section_3 = sibling(section_2, 2);
    var p_7 = child(section_3);
    var text_14 = child(p_7, true);
    template_effect(() => set_text(text_14, t("setting.history.label.clear")));
    reset(p_7);
    var ul_3 = sibling(p_7, 2);
    var li_4 = child(ul_3);
    var p_8 = child(li_4);
    var text_15 = child(p_8, true);
    template_effect(() => set_text(text_15, t("setting.history.options.clear_history")));
    reset(p_8);
    var button_2 = sibling(p_8, 2);
    button_2.__click = wrapClearDb;
    var node_4 = child(button_2);
    {
      var consequent_3 = ($$anchor2) => {
        ProgressRadial($$anchor2, {
          stroke: 80,
          width: "w-5",
          meter: "stroke-primary-500",
          track: "stroke-primary-500/30"
        });
      };
      if_block(node_4, ($$render) => {
        if ($clearPending()) $$render(consequent_3);
      });
    }
    var span_3 = sibling(node_4, 2);
    var text_16 = child(span_3, true);
    template_effect(() => set_text(text_16, t("setting.history.button.clear")));
    reset(span_3);
    reset(button_2);
    reset(li_4);
    reset(ul_3);
    reset(section_3);
    reset(div);
    template_effect(() => {
      set_class(div, clsx(sectionSpace()));
      set_class(p, clsx(sectionTitle()));
      set_class(ul, clsx(get$1(ulClasses)));
      set_class(select, `select ${get$1(inputClasses) ?? ""}`);
      if (option_value !== (option_value = HistoryBackupInterval.NEVER)) {
        option.value = null == (option.__value = HistoryBackupInterval.NEVER) ? "" : HistoryBackupInterval.NEVER;
      }
      if (option_1_value !== (option_1_value = HistoryBackupInterval.EVERY_DAY)) {
        option_1.value = null == (option_1.__value = HistoryBackupInterval.EVERY_DAY) ? "" : HistoryBackupInterval.EVERY_DAY;
      }
      if (option_2_value !== (option_2_value = HistoryBackupInterval.EVERY_7_DAY)) {
        option_2.value = null == (option_2.__value = HistoryBackupInterval.EVERY_7_DAY) ? "" : HistoryBackupInterval.EVERY_7_DAY;
      }
      if (option_3_value !== (option_3_value = HistoryBackupInterval.EVERY_30_DAY)) {
        option_3.value = null == (option_3.__value = HistoryBackupInterval.EVERY_30_DAY) ? "" : HistoryBackupInterval.EVERY_30_DAY;
      }
      set_class(p_2, clsx(sectionTitle()));
      set_class(ul_1, clsx(get$1(ulClasses)));
      button.disabled = $exportJsonPending();
      button_1.disabled = $exportCsvPending();
      set_class(p_5, clsx(sectionTitle()));
      set_class(ul_2, clsx(get$1(ulClasses)));
      set_class(p_7, clsx(sectionTitle()));
      set_class(ul_3, clsx(get$1(ulClasses)));
      button_2.disabled = $clearPending();
    });
    bind_select_value(select, () => $configStore().historyBackupInterval, ($$value) => store_mutate(configStore, untrack($configStore).historyBackupInterval = $$value, untrack($configStore)));
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["click"]);
  var root_1$3 = /* @__PURE__ */ template(`<div class="flex justify-between items-center"><p> </p> <div class="text-xs"> </div></div>`);
  var root_2$2 = /* @__PURE__ */ template(`<div class="flex justify-between items-center"><p> </p> <div class="text-xs"> </div></div>`);
  var root_4$1 = /* @__PURE__ */ template(`<div class="flex justify-between items-center"><p> </p> <div class="text-xs"> </div></div>`);
  var root_5$1 = /* @__PURE__ */ template(`<div class="flex justify-between items-center"><p> </p> <div class="text-xs"> </div></div>`);
  var root_3$2 = /* @__PURE__ */ template(`<section><p> </p> <ul><li class="flex-col !items-stretch md:flex-row md:!items-baseline gap-4 *:!m-0"><!> <!></li></ul></section>`);
  var root$3 = /* @__PURE__ */ template(`<div><div class="flex items-center justify-center"><div></div></div> <section><p> </p> <ul><li class="flex-col !items-stretch md:flex-row md:!items-baseline gap-4 *:!m-0"><!> <!></li></ul></section> <!></div>`);
  function BtnPosition($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $configStore = () => store_get(configStore, "$configStore", $$stores);
    let bg = prop($$props, "bg", 3, "bg-white/30 dark:bg-black/15"), border = prop($$props, "border", 3, "divide-y-[1px] *:border-surface-300-600-token"), padding = prop($$props, "padding", 3, "px-4 *:py-4"), margin = prop($$props, "margin", 3, "mt-2 *:!m-0"), rounded = prop($$props, "rounded", 3, "rounded-container-token *:!rounded-none"), sectionSpace = prop($$props, "sectionSpace", 19, () => `space-y-4`), sectionTitle = prop($$props, "sectionTitle", 3, "font-bold"), UlClass = prop($$props, "class", 3, "");
    const configStore = getContext("store");
    const ulClasses = /* @__PURE__ */ derived$1(() => `list *:items-center ${padding()} ${margin()} ${border()} ${bg()} ${rounded()} ${UlClass()}`);
    const max = 100;
    const step = 4;
    let btnLeft = state(proxy($configStore()["pdl-btn-left"]));
    let btnTop = state(proxy($configStore()["pdl-btn-top"]));
    let bookmarkBtnLeft = state(proxy($configStore()["pdl-btn-self-bookmark-left"]));
    let bookmarkBtnTop = state(proxy($configStore()["pdl-btn-self-bookmark-top"]));
    user_effect(() => changeCssProp("--pdl-btn-left", get$1(btnLeft)));
    user_effect(() => changeCssProp("--pdl-btn-top", get$1(btnTop)));
    user_effect(() => changeCssProp("--pdl-btn-self-bookmark-left", get$1(bookmarkBtnLeft)));
    user_effect(() => changeCssProp("--pdl-btn-self-bookmark-top", get$1(bookmarkBtnTop)));
    let buttonContainer;
    onMount(() => {
      const sampleBtn = new ThumbnailButton({
        id: "0",
        shouldObserveDb: false,
        onClick: () => undefined
      });
      sampleBtn.setAttribute("disabled", "");
      buttonContainer.appendChild(sampleBtn);
      if (!env.isPixiv()) return;
      const sampleBookmarkBtn = new ThumbnailButton({
        id: "0",
        type: ThumbnailBtnType.PixivMyBookmark,
        shouldObserveDb: false,
        onClick: () => undefined
      });
      sampleBookmarkBtn.setAttribute("disabled", "");
      sampleBookmarkBtn.setStatus(ThumbnailBtnStatus.Complete);
      buttonContainer.appendChild(sampleBookmarkBtn);
    });
    function updateBtnPosConfig(key, val) {
      store_mutate(configStore, untrack($configStore)[key] = val, untrack($configStore));
    }
    function changeCssProp(key, value) {
      document.documentElement.style.setProperty(key, String(value));
    }
    var div = root$3();
    var div_1 = child(div);
    var div_2 = child(div_1);
    bind_this(div_2, ($$value) => buttonContainer = $$value, () => buttonContainer);
    reset(div_1);
    var section = sibling(div_1, 2);
    var p = child(section);
    var text2 = child(p, true);
    template_effect(() => set_text(text2, t("setting.button_position.label.common")));
    reset(p);
    var ul = sibling(p, 2);
    var li = child(ul);
    var node = child(li);
    RangeSlider(node, {
      name: "pdl-btn-left",
      step,
      max,
      ticked: true,
      class: "flex-grow",
      get value() {
        return get$1(btnLeft);
      },
      set value($$value) {
        set(btnLeft, proxy($$value));
      },
      $$events: {
        change: () => updateBtnPosConfig("pdl-btn-left", get$1(btnLeft))
      },
      children: ($$anchor2, $$slotProps) => {
        var div_3 = root_1$3();
        var p_1 = child(div_3);
        var text_1 = child(p_1, true);
        template_effect(() => set_text(text_1, t("setting.button_position.options.horizon_position")));
        reset(p_1);
        var div_4 = sibling(p_1, 2);
        var text_2 = child(div_4);
        reset(div_4);
        reset(div_3);
        template_effect(() => set_text(text_2, `${get$1(btnLeft) ?? ""} / ${max}`));
        append($$anchor2, div_3);
      },
      $$slots: { default: true }
    });
    var node_1 = sibling(node, 2);
    RangeSlider(node_1, {
      name: "pdl-btn-top",
      step,
      max,
      ticked: true,
      class: "flex-grow",
      get value() {
        return get$1(btnTop);
      },
      set value($$value) {
        set(btnTop, proxy($$value));
      },
      $$events: {
        change: () => updateBtnPosConfig("pdl-btn-top", get$1(btnTop))
      },
      children: ($$anchor2, $$slotProps) => {
        var div_5 = root_2$2();
        var p_2 = child(div_5);
        var text_3 = child(p_2, true);
        template_effect(() => set_text(text_3, t("setting.button_position.options.vertical_position")));
        reset(p_2);
        var div_6 = sibling(p_2, 2);
        var text_4 = child(div_6);
        reset(div_6);
        reset(div_5);
        template_effect(() => set_text(text_4, `${get$1(btnTop) ?? ""} / ${max}`));
        append($$anchor2, div_5);
      },
      $$slots: { default: true }
    });
    reset(li);
    reset(ul);
    reset(section);
    var node_2 = sibling(section, 2);
    {
      var consequent = ($$anchor2) => {
        var section_1 = root_3$2();
        var p_3 = child(section_1);
        var text_5 = child(p_3, true);
        template_effect(() => set_text(text_5, t("setting.button_position.label.my_bookmark")));
        reset(p_3);
        var ul_1 = sibling(p_3, 2);
        var li_1 = child(ul_1);
        var node_3 = child(li_1);
        RangeSlider(node_3, {
          name: "pdl-bookmark-btn-left",
          step,
          max,
          ticked: true,
          class: "flex-grow",
          get value() {
            return get$1(bookmarkBtnLeft);
          },
          set value($$value) {
            set(bookmarkBtnLeft, proxy($$value));
          },
          $$events: {
            change: () => updateBtnPosConfig("pdl-btn-self-bookmark-left", get$1(bookmarkBtnLeft))
          },
          children: ($$anchor3, $$slotProps) => {
            var div_7 = root_4$1();
            var p_4 = child(div_7);
            var text_6 = child(p_4, true);
            template_effect(() => set_text(text_6, t("setting.button_position.options.horizon_position")));
            reset(p_4);
            var div_8 = sibling(p_4, 2);
            var text_7 = child(div_8);
            reset(div_8);
            reset(div_7);
            template_effect(() => set_text(text_7, `${get$1(bookmarkBtnLeft) ?? ""} / ${max}`));
            append($$anchor3, div_7);
          },
          $$slots: { default: true }
        });
        var node_4 = sibling(node_3, 2);
        RangeSlider(node_4, {
          name: "pdl-bookmark-btn-top",
          step,
          max,
          ticked: true,
          class: "flex-grow",
          get value() {
            return get$1(bookmarkBtnTop);
          },
          set value($$value) {
            set(bookmarkBtnTop, proxy($$value));
          },
          $$events: {
            change: () => updateBtnPosConfig("pdl-btn-self-bookmark-top", get$1(bookmarkBtnTop))
          },
          children: ($$anchor3, $$slotProps) => {
            var div_9 = root_5$1();
            var p_5 = child(div_9);
            var text_8 = child(p_5, true);
            template_effect(() => set_text(text_8, t("setting.button_position.options.vertical_position")));
            reset(p_5);
            var div_10 = sibling(p_5, 2);
            var text_9 = child(div_10);
            reset(div_10);
            reset(div_9);
            template_effect(() => set_text(text_9, `${get$1(bookmarkBtnTop) ?? ""} / ${max}`));
            append($$anchor3, div_9);
          },
          $$slots: { default: true }
        });
        reset(li_1);
        reset(ul_1);
        reset(section_1);
        template_effect(() => {
          set_class(p_3, clsx(sectionTitle()));
          set_class(ul_1, clsx(get$1(ulClasses)));
        });
        append($$anchor2, section_1);
      };
      if_block(node_2, ($$render) => {
        if (env.isPixiv()) $$render(consequent);
      });
    }
    reset(div);
    template_effect(() => {
      set_class(div, clsx(sectionSpace()));
      set_class(div_2, `w-48 h-48 backdrop-blur-sm rounded-lg relative ${bg() ?? ""}`);
      set_class(p, clsx(sectionTitle()));
      set_class(ul, clsx(get$1(ulClasses)));
    });
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  var root_1$2 = /* @__PURE__ */ template(`<li><p class="flex-auto"> </p> <!></li>`);
  var root_2$1 = /* @__PURE__ */ template(`<li><p class="flex-auto"> </p> <!></li> <li><div class="flex-auto"><p> </p> <p> </p></div> <!></li>`, 1);
  var root_4 = /* @__PURE__ */ template(`<li><label class="label flex flex-grow items-center justify-center"><p class="flex-auto"> </p> <!></label></li>`);
  var root_3$1 = /* @__PURE__ */ template(`<ul><li><label class="label flex flex-grow items-center justify-center"><p class="flex-auto"> </p> <!></label></li> <!></ul>`);
  var root_5 = /* @__PURE__ */ template(`<section><p>实验性功能</p> <ul><li><div class="flex-auto"><p>为单页插图增加 #pixivGlow2024 效果</p> <p>* 转换至动图格式。如果插图尺寸过大，可能占用大量内存 / 转换失败</p></div> <!></li></ul></section>`);
  var root$2 = /* @__PURE__ */ template(`<div><ul><li><p class="flex-auto"> </p> <!></li> <!> <!> <li class="flex-col !items-stretch"><div class="flex items-center"><div class="flex-auto"><p> </p> <p> </p></div> <!></div> <!></li></ul> <!></div>`);
  function Others($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $configStore = () => store_get(configStore, "$configStore", $$stores);
    let bg = prop($$props, "bg", 3, "bg-white/30 dark:bg-black/15"), border = prop($$props, "border", 3, "divide-y-[1px] *:border-surface-300-600-token"), padding = prop($$props, "padding", 3, "px-4 *:py-4"), margin = prop($$props, "margin", 3, "mt-2 *:!m-0"), rounded = prop($$props, "rounded", 3, "rounded-container-token *:!rounded-none"), sectionSpace = prop($$props, "sectionSpace", 19, () => `space-y-4`), sectionTitle = prop($$props, "sectionTitle", 3, "font-bold"), descriptionText = prop($$props, "descriptionText", 3, "text-sm text-surface-400"), UlClass = prop($$props, "class", 3, "");
    const configStore = getContext("store");
    const ulClasses = /* @__PURE__ */ derived$1(() => `list *:items-center ${padding()} ${margin()} ${border()} ${bg()} ${rounded()} ${UlClass()}`);
    var div = root$2();
    var ul = child(div);
    var li = child(ul);
    var p = child(li);
    var text2 = child(p, true);
    template_effect(() => set_text(text2, t("setting.others.options.show_setting_button")));
    reset(p);
    var node = sibling(p, 2);
    SlideToggle(node, {
      name: "show-popup-button",
      size: "sm",
      get checked() {
        return $configStore().showPopupButton;
      },
      set checked($$value) {
        store_mutate(configStore, untrack($configStore).showPopupButton = $$value, untrack($configStore));
      }
    });
    reset(li);
    var node_1 = sibling(li, 2);
    {
      var consequent = ($$anchor2) => {
        var li_1 = root_1$2();
        var p_1 = child(li_1);
        var text_1 = child(p_1, true);
        template_effect(() => set_text(text_1, t("setting.others.options.bundle_multipage_illust")));
        reset(p_1);
        var node_2 = sibling(p_1, 2);
        SlideToggle(node_2, {
          name: "bundle-illusts",
          size: "sm",
          get checked() {
            return $configStore().bundleIllusts;
          },
          set checked($$value) {
            store_mutate(configStore, untrack($configStore).bundleIllusts = $$value, untrack($configStore));
          }
        });
        reset(li_1);
        append($$anchor2, li_1);
      };
      if_block(node_1, ($$render) => {
        if (env.isPixiv() || env.isNijie()) $$render(consequent);
      });
    }
    var node_3 = sibling(node_1, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var fragment = root_2$1();
        var li_2 = first_child(fragment);
        var p_2 = child(li_2);
        var text_2 = child(p_2, true);
        template_effect(() => set_text(text_2, t("setting.others.options.bundle_manga")));
        reset(p_2);
        var node_4 = sibling(p_2, 2);
        SlideToggle(node_4, {
          name: "bundle-manga",
          size: "sm",
          get checked() {
            return $configStore().bundleManga;
          },
          set checked($$value) {
            store_mutate(configStore, untrack($configStore).bundleManga = $$value, untrack($configStore));
          }
        });
        reset(li_2);
        var li_3 = sibling(li_2, 2);
        var div_1 = child(li_3);
        var p_3 = child(div_1);
        var text_3 = child(p_3, true);
        template_effect(() => set_text(text_3, t("setting.others.options.like_illust_when_downloading")));
        reset(p_3);
        var p_4 = sibling(p_3, 2);
        var text_4 = child(p_4, true);
        template_effect(() => set_text(text_4, t("setting.others.options.option_does_not_apply_to_batch_download")));
        reset(p_4);
        reset(div_1);
        var node_5 = sibling(div_1, 2);
        SlideToggle(node_5, {
          name: "bundle-manga",
          size: "sm",
          get checked() {
            return $configStore().likeIllust;
          },
          set checked($$value) {
            store_mutate(configStore, untrack($configStore).likeIllust = $$value, untrack($configStore));
          }
        });
        reset(li_3);
        template_effect(() => set_class(p_4, clsx(descriptionText())));
        append($$anchor2, fragment);
      };
      if_block(node_3, ($$render) => {
        if (env.isPixiv()) $$render(consequent_1);
      });
    }
    var li_4 = sibling(node_3, 2);
    var div_2 = child(li_4);
    var div_3 = child(div_2);
    var p_5 = child(div_3);
    var text_5 = child(p_5, true);
    template_effect(() => set_text(text_5, t("setting.others.options.add_bookmark_when_downloading")));
    reset(p_5);
    var p_6 = sibling(p_5, 2);
    var text_6 = child(p_6, true);
    template_effect(() => set_text(text_6, t("setting.others.options.option_does_not_apply_to_batch_download")));
    reset(p_6);
    reset(div_3);
    var node_6 = sibling(div_3, 2);
    SlideToggle(node_6, {
      name: "fsa-enable",
      size: "sm",
      get checked() {
        return $configStore().addBookmark;
      },
      set checked($$value) {
        store_mutate(configStore, untrack($configStore).addBookmark = $$value, untrack($configStore));
      }
    });
    reset(div_2);
    var node_7 = sibling(div_2, 2);
    {
      var consequent_3 = ($$anchor2) => {
        var ul_1 = root_3$1();
        var li_5 = child(ul_1);
        var label = child(li_5);
        var p_7 = child(label);
        var text_7 = child(p_7, true);
        template_effect(() => set_text(text_7, t("setting.others.options.add_bookmark_with_tags")));
        reset(p_7);
        var node_8 = sibling(p_7, 2);
        SlideToggle(node_8, {
          name: "fsa-enable",
          size: "sm",
          get checked() {
            return $configStore().addBookmarkWithTags;
          },
          set checked($$value) {
            store_mutate(configStore, untrack($configStore).addBookmarkWithTags = $$value, untrack($configStore));
          }
        });
        reset(label);
        reset(li_5);
        var node_9 = sibling(li_5, 2);
        {
          var consequent_2 = ($$anchor3) => {
            var li_6 = root_4();
            var label_1 = child(li_6);
            var p_8 = child(label_1);
            var text_8 = child(p_8, true);
            template_effect(() => set_text(text_8, t("setting.others.options.add_bookmark_private_r18")));
            reset(p_8);
            var node_10 = sibling(p_8, 2);
            SlideToggle(node_10, {
              name: "fsa-enable",
              size: "sm",
              get checked() {
                return $configStore().privateR18;
              },
              set checked($$value) {
                store_mutate(configStore, untrack($configStore).privateR18 = $$value, untrack($configStore));
              }
            });
            reset(label_1);
            reset(li_6);
            append($$anchor3, li_6);
          };
          if_block(node_9, ($$render) => {
            if (env.isPixiv()) $$render(consequent_2);
          });
        }
        reset(ul_1);
        template_effect(() => set_class(ul_1, `list ${border() ?? ""} ${rounded() ?? ""} [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4`));
        append($$anchor2, ul_1);
      };
      if_block(node_7, ($$render) => {
        if ($configStore().addBookmark && (env.isPixiv() || env.isNijie())) $$render(consequent_3);
      });
    }
    reset(li_4);
    reset(ul);
    var node_11 = sibling(ul, 2);
    {
      var consequent_4 = ($$anchor2) => {
        var section = root_5();
        var p_9 = child(section);
        var ul_2 = sibling(p_9, 2);
        var li_7 = child(ul_2);
        var div_4 = child(li_7);
        var p_10 = sibling(child(div_4), 2);
        reset(div_4);
        var node_12 = sibling(div_4, 2);
        SlideToggle(node_12, {
          name: "mix-effect",
          size: "sm",
          get checked() {
            return $configStore().mixEffect;
          },
          set checked($$value) {
            store_mutate(configStore, untrack($configStore).mixEffect = $$value, untrack($configStore));
          }
        });
        reset(li_7);
        reset(ul_2);
        reset(section);
        template_effect(() => {
          set_class(p_9, clsx(sectionTitle()));
          set_class(ul_2, clsx(get$1(ulClasses)));
          set_class(p_10, `${descriptionText() ?? ""} !text-error-500`);
        });
        append($$anchor2, section);
      };
      if_block(node_11, ($$render) => {
        if (env.isPixiv()) $$render(consequent_4);
      });
    }
    reset(div);
    template_effect(() => {
      set_class(div, clsx(sectionSpace()));
      set_class(ul, clsx(get$1(ulClasses)));
      set_class(p_6, clsx(descriptionText()));
    });
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  var root$1 = /* @__PURE__ */ template(`<div><section><p> </p> <ul><li><span><!></span></li></ul></section> <section><p> </p> <ul><li><p><!></p></li> <li class=" justify-center"><figure><img alt="credit" class=" rounded-full m-auto"> <figcaption class="mt-4"> </figcaption></figure></li></ul></section></div>`);
  function FeedBack($$anchor, $$props) {
    push($$props, true);
    let bg = prop($$props, "bg", 3, "bg-white/30 dark:bg-black/15"), border = prop($$props, "border", 3, "divide-y-[1px] *:border-surface-300-600-token"), padding = prop($$props, "padding", 3, "px-4 *:py-4"), margin = prop($$props, "margin", 3, "mt-2 *:!m-0"), rounded = prop($$props, "rounded", 3, "rounded-container-token *:!rounded-none"), sectionSpace = prop($$props, "sectionSpace", 19, () => `space-y-4`), sectionTitle = prop($$props, "sectionTitle", 3, "font-bold"), UlClass = prop($$props, "class", 3, "");
    const ulClasses = /* @__PURE__ */ derived$1(() => `list *:items-center ${padding()} ${margin()} ${border()} ${bg()} ${rounded()} ${UlClass()}`);
    var div = root$1();
    var section = child(div);
    var p = child(section);
    var text2 = child(p, true);
    template_effect(() => set_text(text2, t("setting.feedback.label.feedback")));
    reset(p);
    var ul = sibling(p, 2);
    var li = child(ul);
    var span = child(li);
    var node = child(span);
    html(node, () => t("setting.feedback.text.feedback_desc"));
    reset(span);
    reset(li);
    reset(ul);
    reset(section);
    var section_1 = sibling(section, 2);
    var p_1 = child(section_1);
    var text_1 = child(p_1, true);
    template_effect(() => set_text(text_1, t("setting.feedback.label.donate")));
    reset(p_1);
    var ul_1 = sibling(p_1, 2);
    var li_1 = child(ul_1);
    var p_2 = child(li_1);
    var node_1 = child(p_2);
    html(node_1, () => t("setting.feedback.text.give_me_a_star"));
    reset(p_2);
    reset(li_1);
    var li_2 = sibling(li_1, 2);
    var figure = child(li_2);
    var img = child(figure);
    set_attribute(img, "src", creditCode);
    var figcaption = sibling(img, 2);
    var text_2 = child(figcaption, true);
    template_effect(() => set_text(text_2, t("setting.feedback.text.donate_desc")));
    reset(figcaption);
    reset(figure);
    reset(li_2);
    reset(ul_1);
    reset(section_1);
    reset(div);
    template_effect(() => {
      set_class(div, clsx(sectionSpace()));
      set_class(p, clsx(sectionTitle()));
      set_class(ul, clsx(get$1(ulClasses)));
      set_class(p_1, clsx(sectionTitle()));
      set_class(ul_1, clsx(get$1(ulClasses)));
    });
    append($$anchor, div);
    pop();
  }
  var root_2 = /* @__PURE__ */ template(`<section><p> </p> <div><div><input type="text" class="input" name="key"></div></div></section>`);
  var root = /* @__PURE__ */ template(`<div><!></div>`);
  function Auth($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $store = () => store_get(store, "$store", $$stores);
    let bg = prop($$props, "bg", 3, "bg-white/30 dark:bg-black/15"), border = prop($$props, "border", 3, "divide-y-[1px] *:border-surface-300-600-token"), padding = prop($$props, "padding", 3, "px-4 *:py-4"), margin = prop($$props, "margin", 3, "mt-2 *:!m-0"), rounded = prop($$props, "rounded", 3, "rounded-container-token *:!rounded-none"), sectionSpace = prop($$props, "sectionSpace", 19, () => `space-y-4`), sectionTitle = prop($$props, "sectionTitle", 3, "font-bold"), UlClass = prop($$props, "class", 3, "");
    const store = getContext("store");
    const blockClasses = /* @__PURE__ */ derived$1(() => `${padding()} ${margin()} ${border()} ${bg()} ${rounded()} ${UlClass()}`);
    var div = root();
    var node = child(div);
    {
      var consequent = ($$anchor2) => {
        var fragment = comment();
        var node_1 = first_child(fragment);
        each(node_1, 1, () => Object.keys($store().auth), (key) => key, ($$anchor3, key) => {
          var section = root_2();
          var p = child(section);
          var text2 = child(p, true);
          template_effect(() => set_text(text2, get$1(key).toUpperCase()));
          reset(p);
          var div_1 = sibling(p, 2);
          var div_2 = child(div_1);
          var input = child(div_2);
          remove_input_defaults(input);
          reset(div_2);
          reset(div_1);
          reset(section);
          template_effect(() => {
            set_class(p, clsx(sectionTitle()));
            set_class(div_1, clsx(get$1(blockClasses)));
          });
          bind_value(input, () => $store().auth[get$1(key)], ($$value) => store_mutate(store, untrack($store).auth[get$1(key)] = $$value, untrack($store)));
          append($$anchor3, section);
        });
        append($$anchor2, fragment);
      };
      if_block(node, ($$render) => {
        if ($store().auth) $$render(consequent);
      });
    }
    reset(div);
    template_effect(() => set_class(div, clsx(sectionSpace())));
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  const menuOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,15.61L19.59,17L14.58,12L19.59,7L21,8.39L17.44,12L21,15.61M3,6H16V8H3V6M3,13V11H13V13H3M3,18V16H16V18H3Z" /></svg>`;
  const menuClose = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 6H13V8H3V6M3 16H13V18H3V16M3 11H15V13H3V11M16 7L14.58 8.39L18.14 12L14.58 15.61L16 17L21 12L16 7Z" /></svg>`;
  var on_click = (_, showListbox) => set(showListbox, !get$1(showListbox));
  var root_6 = /* @__PURE__ */ template(`<button type="button" class="btn-icon hover:variant-soft-surface ml-1"><i class="w-8 fill-current"><!></i></button>`);
  var root_9 = /* @__PURE__ */ template(`<h3 class="h3"> </h3>`);
  var root_1$1 = /* @__PURE__ */ template(`<div><!> <!> <div class="mt-4 pr-4 scrollbar-track-transparent scrollbar-thumb-slate-400/50 scrollbar-corner-transparent scrollbar-thin overflow-y-auto" style="scrollbar-gutter: stable"><!></div></div>`);
  function Config($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $configStore = () => store_get(configStore, "$configStore", $$stores);
    let slected = state(0);
    let showListbox = state(true);
    const configStore = getContext("store");
    const optionList = [
      {
        name: t("setting.save_to.title"),
        component: SaveTo
      },
      {
        name: t("setting.ugoira.title"),
        component: UgoiraConvert,
        show: env.isPixiv()
      },
      {
        name: t("setting.history.title"),
        component: DownloadHistory
      },
      {
        name: t("setting.button_position.title"),
        component: BtnPosition
      },
      {
        name: t("setting.others.title"),
        component: Others
      },
      {
        name: t("setting.authorization.title"),
        component: Auth,
        show: !!$configStore().auth
      },
      {
        name: t("setting.feedback.title"),
        component: FeedBack
      }
    ];
    const OptionComponent = /* @__PURE__ */ derived$1(() => optionList[get$1(slected)].component);
    const gridCol = /* @__PURE__ */ derived$1(() => get$1(showListbox) ? "grid-cols-[140px_1fr]" : "grid-cols-[0px_1fr]");
    const transform = /* @__PURE__ */ derived$1(() => get$1(showListbox) ? "translate-x-0" : "-translate-x-full");
    const sidebarWidth = "w-[140px]";
    ModalWrapper($$anchor, {
      get parent() {
        return $$props.parent;
      },
      height: "h-screen md:h-[600px]",
      width: "w-screen md:max-w-screen-md xl:max-w-screen-lg",
      padding: "",
      children: ($$anchor2, $$slotProps) => {
        var div = root_1$1();
        var node = child(div);
        ListBox(node, {
          get class() {
            return `pt-4 pr-6 row-start-1 row-span-2 ${sidebarWidth} transition-[transform] ${get$1(transform) ?? ""}`;
          },
          children: ($$anchor3, $$slotProps2) => {
            var fragment_1 = comment();
            var node_1 = first_child(fragment_1);
            each(node_1, 17, () => optionList, index, ($$anchor4, option, idx) => {
              var fragment_2 = comment();
              var node_2 = first_child(fragment_2);
              {
                var consequent = ($$anchor5) => {
                  ListBoxItem($$anchor5, {
                    name: "option",
                    value: idx,
                    class: "rounded-token",
                    get group() {
                      return get$1(slected);
                    },
                    set group($$value) {
                      set(slected, proxy($$value));
                    },
                    children: ($$anchor6, $$slotProps3) => {
                      next();
                      var text$1 = text();
                      template_effect(() => set_text(text$1, get$1(option).name));
                      append($$anchor6, text$1);
                    },
                    $$slots: { default: true }
                  });
                };
                if_block(node_2, ($$render) => {
                  if (!("show" in get$1(option)) || get$1(option).show) $$render(consequent);
                });
              }
              append($$anchor4, fragment_2);
            });
            append($$anchor3, fragment_1);
          },
          $$slots: { default: true }
        });
        var node_3 = sibling(node, 2);
        {
          const lead = ($$anchor3) => {
            var button = root_6();
            button.__click = [on_click, showListbox];
            var i = child(button);
            var node_4 = child(i);
            {
              var consequent_1 = ($$anchor4) => {
                var fragment_5 = comment();
                var node_5 = first_child(fragment_5);
                html(node_5, () => menuClose);
                append($$anchor4, fragment_5);
              };
              var alternate = ($$anchor4) => {
                var fragment_6 = comment();
                var node_6 = first_child(fragment_6);
                html(node_6, () => menuOpen);
                append($$anchor4, fragment_6);
              };
              if_block(node_4, ($$render) => {
                if (get$1(showListbox)) $$render(consequent_1);
                else $$render(alternate, false);
              });
            }
            reset(i);
            reset(button);
            append($$anchor3, button);
          };
          AppBar(node_3, {
            padding: "py-2",
            background: "bg-transparent",
            class: "mr-6 border-b border-surface-800-100-token",
            lead,
            children: ($$anchor3, $$slotProps2) => {
              var h3 = root_9();
              var text_1 = child(h3, true);
              reset(h3);
              template_effect(() => set_text(text_1, optionList[get$1(slected)].name || "设置"));
              append($$anchor3, h3);
            },
            $$slots: { lead: true, default: true }
          });
        }
        var div_1 = sibling(node_3, 2);
        var node_7 = child(div_1);
        component(node_7, () => get$1(OptionComponent), ($$anchor3, $$component) => {
          $$component($$anchor3, {
            bg: "bg-white/30 dark:bg-surface-500/20 backdrop-blur-sm"
          });
        });
        reset(div_1);
        reset(div);
        template_effect(() => set_class(div, `h-full pt-4 pb-6 pl-6 grid grid-rows-[auto_1fr] transition-[grid-template-columns] ${get$1(gridCol) ?? ""}`));
        append($$anchor2, div);
      },
      $$slots: { default: true }
    });
    pop();
    $$cleanup();
  }
  delegate(["click"]);
  var on_keydown = (e) => e.stopImmediatePropagation();
  var root_3 = /* @__PURE__ */ template(`<button type="button" class="btn btn-sm variant-filled fixed bottom-24 rounded-none rounded-s-full opacity-40 hover:opacity-100 right-0 translate-x-[calc(100%-44px)] hover:translate-x-0 delay-100"><i class=" text-sm w-6 fill-current"><!></i> <span class="text-sm"> </span></button>`);
  var root_1 = /* @__PURE__ */ template(`<div data-theme="skeleton" class="contents"><!> <!> <!></div>`);
  function App($$anchor, $$props) {
    push($$props, true);
    const [$$stores, $$cleanup] = setup_stores();
    const $config = () => store_get($$props.config, "$config", $$stores);
    let dark = prop($$props, "dark", 3, false), supportedTemplate = prop($$props, "supportedTemplate", 19, () => ({}));
    setContext("supportedTemplate", supportedTemplate());
    setContext("store", $$props.config);
    initializeStores();
    const modalStore = getModalStore();
    let root2;
    const components = {
      changelog: { ref: Changelog },
      setting: { ref: Config }
    };
    function showChangelog() {
      modalStore.trigger({ type: "component", component: "changelog" });
    }
    function showSetting() {
      modalStore.trigger({ type: "component", component: "setting" });
    }
    function preventBackDropClick(event2) {
      if (!(event2.target instanceof Element)) return;
      const classList = event2.target.classList;
      if (classList.contains("modal-backdrop") || classList.contains("modal-transition")) {
        event2.stopPropagation();
      }
    }
    function modalExist() {
      return !!(root2 == null ? undefined : root2.querySelector(".modal-backdrop"));
    }
    function handleKeydown(event2) {
      if (!modalExist()) return;
      if (event2.code === "Escape") {
        modalStore.close();
        return;
      } else if (event2.ctrlKey || event2.shiftKey) {
        return;
      }
      if (!event2.composedPath().includes(root2)) {
        event2.stopImmediatePropagation();
        event2.preventDefault();
      }
    }
    onMount(() => {
      const shadow = root2.getRootNode();
      addStyleToShadow(shadow);
      shadow.host.setAttribute("style", "position:fixed; z-index:99999");
      if ($config().showMsg) {
        store_mutate($$props.config, untrack($config).showMsg = false, untrack($config));
        showChangelog();
      }
    });
    var div = root_1();
    event("keydown", $window, handleKeydown, true);
    div.__keydown = [on_keydown];
    var node = child(div);
    Modal(node, { components, class: "!p-0" });
    var node_1 = sibling(node, 2);
    {
      var consequent = ($$anchor2) => {
        Downloader$1($$anchor2, {
          get downloaderConfig() {
            return $$props.downloaderConfig;
          },
          get useBatchDownload() {
            return $$props.useBatchDownload;
          }
        });
      };
      if_block(node_1, ($$render) => {
        if ($$props.downloaderConfig && $$props.useBatchDownload) $$render(consequent);
      });
    }
    var node_2 = sibling(node_1, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var button = root_3();
        button.__click = showSetting;
        var i = child(button);
        var node_3 = child(i);
        html(node_3, () => cog);
        reset(i);
        var span = sibling(i, 2);
        var text2 = child(span, true);
        template_effect(() => set_text(text2, t("button.setting")));
        reset(span);
        reset(button);
        append($$anchor2, button);
      };
      if_block(node_2, ($$render) => {
        if ($config().showPopupButton) $$render(consequent_1);
      });
    }
    reset(div);
    bind_this(div, ($$value) => root2 = $$value, () => root2);
    template_effect(() => toggle_class(div, "dark", dark()));
    event("mousedown", div, preventBackDropClick, true);
    event("mouseup", div, preventBackDropClick, true);
    append($$anchor, div);
    var $$pop = pop({ showChangelog, showSetting });
    $$cleanup();
    return $$pop;
  }
  delegate(["keydown", "click"]);
  function useChannel() {
    const TAB_ID = String(Math.random());
    const queue = [];
    let downloading = false;
    let pending2 = false;
    let onFullfilled;
    let onRejected;
    channelEvent.on(
      "batchdownload.query",
      () => {
        downloading && channelEvent.emit(
          "batchdownload.set-pending"
          /* SET_PENDING */
        );
      }
    );
    channelEvent.on(
      "batchdownload.set-pending",
      () => {
        !pending2 && (pending2 = true);
      }
    );
    channelEvent.on(
      "batchdownload.set-idle",
      () => {
        pending2 && (pending2 = false);
      }
    );
    channelEvent.on(
      "batchdownload.add-queue",
      (tabId) => {
        downloading && queue.push(tabId);
      }
    );
    channelEvent.on(
      "batchdownload.remove-queue",
      (tabId) => {
        if (!downloading) return;
        const idx = queue.findIndex((id) => id === tabId);
        idx !== -1 && queue.splice(idx, 1);
      }
    );
    channelEvent.on(
      "batchdownload.process-next",
      (tabIds) => {
        if (tabIds[0] !== TAB_ID) return;
        queue.push(...tabIds.slice(1));
        pending2 = false;
        downloading = true;
        onFullfilled();
      }
    );
    window.addEventListener("unload", () => {
      if (pending2) {
        channelEvent.emit(
          "batchdownload.remove-queue",
          TAB_ID
        );
        return;
      }
      if (downloading) {
        queue.length ? channelEvent.emit(
          "batchdownload.process-next",
          queue
        ) : channelEvent.emit(
          "batchdownload.set-idle"
          /* SET_IDLE */
        );
      }
    });
    channelEvent.emit(
      "batchdownload.query"
      /* QUERY */
    );
    return {
      async requestDownload() {
        if (!pending2) {
          downloading = true;
          channelEvent.emit(
            "batchdownload.set-pending"
            /* SET_PENDING */
          );
          logger.info("channel post: SET_PENDING");
          return;
        }
        const waitUntilIdle = new Promise((resolve, reject) => {
          onFullfilled = resolve;
          onRejected = reject;
        });
        channelEvent.emit(
          "batchdownload.add-queue",
          TAB_ID
        );
        logger.info("channel post: ADD_QUEUE", TAB_ID);
        return waitUntilIdle;
      },
      cancelDownloadRequest(reason) {
        if (!pending2) return;
        channelEvent.emit(
          "batchdownload.remove-queue",
          TAB_ID
        );
        logger.info("channel post: REMOVE_QUEUE", TAB_ID);
        onRejected(reason);
      },
      processNextDownload() {
        if (!downloading) return;
        downloading = false;
        if (queue.length) {
          pending2 = true;
          channelEvent.emit(
            "batchdownload.process-next",
            queue
          );
          queue.length = 0;
          logger.info("channel post: PROCESS_NEXT");
        } else {
          channelEvent.emit(
            "batchdownload.set-idle"
            /* SET_IDLE */
          );
          logger.info("channel post: SET_IDLE");
        }
      }
    };
  }
  const ERROR_MASKED = "Masked.";
  function defineBatchDownload(downloaderConfig) {
    const { requestDownload, cancelDownloadRequest, processNextDownload } = useChannel();
    const artworkCount = writable(0);
    const successd = writable([]);
    const failed = writable([]);
    const excluded = writable([]);
    const downloading = writable(false);
    const log = writable();
    const failedIdTasks = [];
    const unavaliableIdTasks = [];
    const failedMetaTasks = [];
    const unavaliableMetaTasks = [];
    let controller;
    const taskControllers = /* @__PURE__ */ new Set();
    const downloadQueue = new PQueue({ concurrency: 5, interval: 1100, intervalCap: 1 });
    let resolveDownload;
    let rejectDownload;
    let $pageStart;
    let $pageEnd;
    let $downloadAllPages;
    let $blacklistTag = [];
    let $whitelistTag = [];
    let $retryFailed = false;
    const includeFilters = [];
    const excludeFilters = [];
    const {
      selectedFilters,
      blacklistTag,
      whitelistTag,
      downloadAllPages,
      pageStart,
      pageEnd,
      retryFailed
    } = optionStore;
    const watchPageRange = derived([downloadAllPages, pageStart, pageEnd], (data) => data);
    watchPageRange.subscribe(([downloadAllPages2, pageStart2, pageEnd2]) => {
      $downloadAllPages = downloadAllPages2;
      $pageStart = pageStart2;
      $pageEnd = pageEnd2;
    });
    selectedFilters.subscribe((selected) => {
      if (!selected) return;
      includeFilters.length = 0;
      excludeFilters.length = 0;
      selected.forEach((id) => {
        const filter = downloaderConfig.filterOption.filters.find((filter2) => filter2.id === id);
        if (filter) {
          if (filter.type === "include") {
            includeFilters.push(filter.fn);
          } else {
            excludeFilters.push(filter.fn);
          }
        }
      });
    });
    blacklistTag.subscribe((val) => {
      $blacklistTag = [...val];
    });
    whitelistTag.subscribe((val) => {
      $whitelistTag = [...val];
    });
    retryFailed.subscribe((val) => {
      $retryFailed = val;
    });
    const checkIfDownloadCompleted = derived(
      [artworkCount, successd, failed, excluded],
      ([$artworkCount, $successd, $failed, $excluded]) => $artworkCount === $successd.length + $failed.length + $excluded.length
    );
    checkIfDownloadCompleted.subscribe((isDone) => {
      isDone && (resolveDownload == null ? undefined : resolveDownload());
    });
    function isStringArray(arr) {
      return typeof arr[0] === "string";
    }
    function reset2() {
      artworkCount.set(0);
      successd.set([]);
      failed.set([]);
      excluded.set([]);
      failedIdTasks.length = 0;
      unavaliableIdTasks.length = 0;
      failedMetaTasks.length = 0;
      unavaliableMetaTasks.length = 0;
      controller = null;
      downloadQueue.size !== 0 && downloadQueue.clear();
      taskControllers.size !== 0 && taskControllers.clear();
      downloadQueue.start();
      resolveDownload = () => {
      };
      rejectDownload = () => {
      };
      writeLog("Info", "Reset store.");
    }
    function setDownloading(isDownloading) {
      downloading.update((val) => {
        if (val && isDownloading) throw new Error("Already downloading.");
        return isDownloading;
      });
    }
    function setArtworkCount(num) {
      artworkCount.set(num);
    }
    function addSuccessd(id) {
      successd.update((val) => {
        if (Array.isArray(id)) {
          val.push(...id);
          writeLog("Complete", id[id.length - 1]);
        } else {
          val.push(id);
          writeLog("Complete", id);
        }
        return val;
      });
    }
    function addFailed(item) {
      failed.update((val) => {
        let id;
        let reason;
        if (Array.isArray(item)) {
          val.push(...item);
          const lastItem = item[item.length - 1];
          id = lastItem.id;
          reason = lastItem.reason;
        } else {
          val.push(item);
          id = item.id;
          reason = item.reason;
        }
        if (reason instanceof Error || typeof reason === "string") {
          writeLog("Fail", id, reason);
        }
        return val;
      });
    }
    function addExcluded(idOrMeta) {
      excluded.update((val) => {
        if (Array.isArray(idOrMeta)) {
          isStringArray(idOrMeta) ? val.push(...idOrMeta) : val.push(...idOrMeta.map((meta) => meta.id));
          writeLog(
            "Info",
            `${idOrMeta.length + " task" + (idOrMeta.length > 1 ? "s were" : " was")} excluded...`
          );
        } else {
          const id = typeof idOrMeta === "string" ? idOrMeta : idOrMeta.id;
          val.push(id);
          writeLog("Info", `${id} was excluded...`);
        }
        return val;
      });
    }
    function writeLog(type, arg, error) {
      const item = {
        type,
        message: ""
      };
      switch (type) {
        case "Error":
          if (!(arg instanceof Error))
            throw new TypeError("error` is expected to be error, but got " + typeof arg);
          item.message = `[${arg.name}] ${arg.message}`;
          break;
        case "Fail":
          if (typeof arg !== "string")
            throw new TypeError("`id` is expected to be string, but got " + typeof arg);
          typeof error === "string" ? item.message = `[Fail] ${arg}...${error}` : item.message = `[Fail] ${arg}...${error ? error.name + ":" + error.message : ""}`;
          break;
        default:
          item.message = `[${type}] ${arg}`;
          break;
      }
      log.set(item);
    }
    function filterTag(partialMeta, customTagFilter) {
      if (!("tags" in partialMeta) || !Array.isArray(partialMeta.tags)) return true;
      const defaultTagFilter = (userTags, metaTags) => userTags.some((tag) => metaTags.includes(tag));
      customTagFilter ?? (customTagFilter = defaultTagFilter);
      if ($whitelistTag.length) {
        return customTagFilter($whitelistTag, partialMeta.tags);
      }
      if ($blacklistTag.length) {
        return !customTagFilter($blacklistTag, partialMeta.tags);
      }
      return true;
    }
    async function checkValidity(partialMeta) {
      try {
        const { enableTagFilter } = downloaderConfig.filterOption;
        if (enableTagFilter === true) {
          if (!filterTag(partialMeta)) return false;
        } else if (enableTagFilter) {
          if (!filterTag(partialMeta, enableTagFilter)) return false;
        }
        if (!includeFilters.length) return false;
        for (let i = 0; i < excludeFilters.length; i++) {
          const fn = excludeFilters[i];
          const isExcluded = await fn(partialMeta);
          if (isExcluded) return false;
        }
        for (let i = 0; i < includeFilters.length; i++) {
          const fn = includeFilters[i];
          const isValid = await fn(partialMeta);
          if (isValid) return true;
        }
      } catch (error) {
        console.error(error);
      }
      return false;
    }
    async function batchDownload(fnId, ...restArgs) {
      setDownloading(true);
      writeLog("Info", "Download start...");
      reset2();
      const { beforeDownload, afterDownload } = downloaderConfig;
      let generatorAfterDownloadCb = undefined;
      let downloadError = null;
      let generator;
      controller = new AbortController();
      const signal = controller.signal;
      signal.addEventListener(
        "abort",
        () => {
          var _a;
          downloadQueue.size !== 0 && downloadQueue.clear();
          taskControllers.forEach((controller2) => controller2.abort(signal.reason));
          taskControllers.clear();
          cancelDownloadRequest(signal.reason);
          rejectDownload == null ? undefined : rejectDownload(signal.reason);
          (_a = downloaderConfig.onDownloadAbort) == null ? undefined : _a.call(downloaderConfig);
        },
        { once: true }
      );
      try {
        const pageIdItem = getGenPageIdItem(fnId);
        if (!pageIdItem || !("fn" in pageIdItem))
          throw new Error("Invalid generator id: " + fnId);
        const {
          filterInGenerator,
          beforeDownload: generaotrBeforeDownloadCb,
          afterDownload: afterDownload2
        } = pageIdItem;
        generatorAfterDownloadCb = afterDownload2;
        typeof beforeDownload === "function" && await beforeDownload();
        typeof generaotrBeforeDownloadCb === "function" && await generaotrBeforeDownloadCb();
        generator = getGenerator(pageIdItem, ...restArgs);
        writeLog("Info", "Waiting for other downloads to finish...");
        await requestDownload();
        writeLog("Info", "Starting...");
        await dispatchDownload(generator, filterInGenerator, signal);
        if ($retryFailed && (failedIdTasks.length || failedMetaTasks.length)) {
          if (failedIdTasks.length) {
            generator = getIdRetryGenerator(
              get(artworkCount),
              failedIdTasks.slice(),
              unavaliableIdTasks.slice()
            );
            failedIdTasks.length = 0;
            unavaliableIdTasks.length = 0;
          } else if (failedMetaTasks.length) {
            generator = getMetaRetryGenerator(
              get(artworkCount),
              failedMetaTasks.slice(),
              unavaliableMetaTasks.slice()
            );
            failedMetaTasks.length = 0;
            unavaliableMetaTasks.length = 0;
          }
          failed.set([]);
          writeLog("Info", "Retry...");
          await dispatchDownload(generator, filterInGenerator, signal);
        }
        writeLog("Info", "Download complete.");
      } catch (error) {
        downloadError = error;
        generator == null ? undefined : generator.return();
        if (!signal.aborted) {
          controller.abort(error);
        }
        if (error instanceof Error) {
          writeLog("Error", error);
        }
      }
      typeof generatorAfterDownloadCb === "function" && generatorAfterDownloadCb();
      typeof afterDownload === "function" && afterDownload();
      setDownloading(false);
      processNextDownload();
      if (downloadError) throw downloadError;
    }
    function getGenPageIdItem(fnId) {
      const { pageOption } = downloaderConfig;
      for (const key in pageOption) {
        if (key === fnId) {
          return pageOption[key];
        }
      }
    }
    function getGenerator(item, ...restArgs) {
      let generator;
      if (!$downloadAllPages && $pageEnd < $pageStart)
        throw new Error("End page must not be less than the start page.");
      const pageRange = $downloadAllPages ? null : [$pageStart, $pageEnd];
      if ("filterInGenerator" in item && !item.filterInGenerator) {
        generator = item.fn(pageRange, ...restArgs);
      } else {
        generator = item.fn(pageRange, checkValidity, ...restArgs);
      }
      return generator;
    }
    function* getIdRetryGenerator(total, failedArtworks, unavaliableTasks) {
      yield {
        total,
        page: 0,
        avaliable: failedArtworks,
        invalid: [],
        unavaliable: unavaliableTasks
      };
    }
    function* getMetaRetryGenerator(total, failedArtworks, unavaliableTasks) {
      yield {
        total,
        page: 0,
        avaliable: failedArtworks,
        invalid: [],
        unavaliable: unavaliableTasks
      };
    }
    async function dispatchDownload(generator, filterInGenerator, batchDownloadSignal) {
      batchDownloadSignal.throwIfAborted();
      const waitUntilDownloadComplete = new Promise((resolve, reject) => {
        resolveDownload = resolve;
        rejectDownload = reject;
      });
      const { parseMetaByArtworkId, downloadArtworkByMeta } = downloaderConfig;
      let result;
      while ((result = await Promise.race([generator.next(), waitUntilDownloadComplete])) && !result.done) {
        batchDownloadSignal.throwIfAborted();
        const { total, avaliable, invalid, unavaliable } = result.value;
        logger.info(total, avaliable, invalid, unavaliable);
        setArtworkCount(total);
        invalid.length && addExcluded(invalid);
        if (unavaliable.length) {
          if (isStringArray(unavaliable)) {
            addFailed(unavaliable.map((id) => ({ id, reason: ERROR_MASKED })));
            unavaliableIdTasks.push(...unavaliable);
          } else {
            addFailed(unavaliable.map((meta) => ({ id: meta.id, reason: ERROR_MASKED })));
            unavaliableMetaTasks.push(...unavaliable);
          }
        }
        if (!avaliable.length) {
          await Promise.race([sleep(1500), waitUntilDownloadComplete]);
          continue;
        }
        for (const idOrMeta of avaliable) {
          const taskController = new AbortController();
          const taskSingal = taskController.signal;
          taskControllers.add(taskController);
          downloadQueue.add(
            async ({ signal: taskSingal2 }) => {
              if (!taskSingal2)
                throw new Error(
                  "Expect `QueueAddOptions.signal` to be a AbortSignal but got undefined."
                );
              try {
                taskSingal2.throwIfAborted();
                let artworkMeta;
                let metaId;
                if (typeof idOrMeta !== "string") {
                  artworkMeta = idOrMeta;
                  metaId = artworkMeta.id;
                } else {
                  metaId = idOrMeta;
                  artworkMeta = await parseMetaByArtworkId(metaId);
                  taskSingal2.throwIfAborted();
                  if (!filterInGenerator && !await checkValidity(artworkMeta)) {
                    addExcluded(metaId);
                    return;
                  }
                }
                writeLog("Add", metaId);
                await downloadArtworkByMeta(artworkMeta, taskSingal2);
                !taskSingal2.aborted && addSuccessd(metaId);
              } catch (error) {
                if (taskSingal2.aborted) return;
                const isFailedTask = error !== ERROR_MASKED;
                if (typeof idOrMeta === "string") {
                  addFailed({ id: idOrMeta, reason: error });
                  isFailedTask && failedIdTasks.push(idOrMeta);
                } else {
                  addFailed({ id: idOrMeta.id, reason: error });
                  isFailedTask && failedMetaTasks.push(idOrMeta);
                }
                if (error instanceof RequestError && error.status === 429 && !downloadQueue.isPaused) {
                  downloadQueue.pause();
                  setTimeout(() => {
                    !batchDownloadSignal.aborted && downloadQueue.start();
                  }, 3e4);
                  writeLog("Error", new Error("Http status: 429, wait for 30 seconds."));
                }
                logger.error(error);
              }
            },
            { signal: taskSingal }
          ).catch(logger.warn).finally(() => {
            taskControllers.delete(taskController);
          });
        }
        await downloadQueue.onEmpty();
      }
      return waitUntilDownloadComplete;
    }
    function abort() {
      controller && controller.abort(new CancelError());
    }
    function batchDownloadDefinition() {
      return batchDownloadStore;
    }
    const batchDownloadStore = {
      artworkCount: readonly(artworkCount),
      successd: readonly(successd),
      failed: readonly(failed),
      excluded: readonly(excluded),
      downloading: readonly(downloading),
      log: readonly(log),
      batchDownload,
      abort
    };
    return batchDownloadDefinition;
  }
  const PdlApp = create_custom_element(
    App,
    {
      dark: { type: "Boolean" },
      config: {},
      supportedTemplate: {},
      downloaderConfig: {},
      useBatchDownload: {}
    },
    [],
    ["showChangelog", "showSetting"],
    true,
    (customElementConstructor) => {
      return class extends customElementConstructor {
        constructor(props) {
          super();
          //@ts-expect-error no_unsed_var
          __publicField(this, "supportedTemplate");
          //@ts-expect-error no_unsed_var
          __publicField(this, "config");
          //@ts-expect-error no_unsed_var
          __publicField(this, "downloaderConfig");
          //@ts-expect-error no_unsed_var
          __publicField(this, "useBatchDownload");
          this.supportedTemplate = props.supportedTemplate;
          this.config = props.config;
        }
        initBatchDownloader(config2) {
          this.downloaderConfig = config2;
          return this.useBatchDownload = defineBatchDownload(config2);
        }
      };
    }
  );
  customElements.define("pdl-app", PdlApp);
  class SiteInject {
    constructor() {
      __publicField(this, "app");
      __publicField(this, "config");
      __publicField(this, "useBatchDownload");
      this.config = loadConfig(this.getCustomConfig() || undefined);
      this.app = this.createApp();
    }
    static get hostname() {
      throw new Error("`hostname` should be overwritten by a subclass.");
    }
    createApp() {
      return new PdlApp({
        config: this.config,
        supportedTemplate: this.getSupportedTemplate()
      });
    }
    injectStyle() {
      [
        "pdl-btn-self-bookmark-left",
        "pdl-btn-self-bookmark-top",
        "pdl-btn-left",
        "pdl-btn-top"
      ].forEach((key) => {
        let val;
        if ((val = this.config.get(key)) !== undefined) {
          document.documentElement.style.setProperty("--" + key, val);
        }
      });
    }
    runScheduledTask() {
      useHistoryBackup().scheduleBackup();
    }
    setAppDarkMode() {
      this.app.setAttribute("dark", "");
    }
    setAppLightMode() {
      this.app.removeAttribute("dark");
    }
    observeColorScheme() {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      query.matches && this.setAppDarkMode();
      query.addEventListener("change", (e) => {
        e.matches ? this.setAppDarkMode() : this.setAppLightMode();
      });
    }
    inject() {
      this.observeColorScheme();
      this.injectStyle();
      _GM_registerMenuCommand(
        t("button.setting"),
        () => {
          var _a;
          if ((_a = this.app.shadowRoot) == null ? undefined : _a.querySelector(".modal")) {
            return;
          }
          this.app.showSetting();
        },
        "s"
      );
      document.body.append(this.app);
      this.runScheduledTask();
    }
  }
  var PostValidState = /* @__PURE__ */ ((PostValidState2) => {
    PostValidState2[PostValidState2["VALID"] = 0] = "VALID";
    PostValidState2[PostValidState2["INVALID"] = 1] = "INVALID";
    PostValidState2[PostValidState2["UNAVAILABLE"] = 2] = "UNAVAILABLE";
    return PostValidState2;
  })(PostValidState || {});
  class ParserBase {
    async *paginationGenerator(pageRange, getPostData, buildMeta, isValid) {
      const [pageStart = 1, pageEnd = 0] = pageRange ?? [];
      let page = pageStart;
      let { lastPage, data: postDatas } = await getPostData(page);
      if (!postDatas || !postDatas.length) throw new Error(`There is no post in page ${page}.`);
      let total = postDatas.length;
      let fetchError = null;
      do {
        let nextPageData = undefined;
        let nextPageIsLast = true;
        if (page !== pageEnd && !lastPage) {
          try {
            const { lastPage: lastPage2, data } = await getPostData(page + 1);
            const dataLen = (data == null ? void 0 : data.length) ?? 0;
            if (dataLen) {
              total += dataLen;
              nextPageData = data;
              nextPageIsLast = lastPage2;
            }
          } catch (error) {
            fetchError = error;
          }
        }
        const avaliable = [];
        const invalid = [];
        const unavaliable = [];
        if (typeof isValid === "function") {
          for (const data of postDatas) {
            const isPostValid = await isValid(data);
            const idOrMeta = buildMeta(data);
            if (isPostValid === 0) {
              avaliable.push(idOrMeta);
            } else if (isPostValid === 1) {
              invalid.push(idOrMeta);
            } else {
              unavaliable.push(idOrMeta);
            }
          }
        } else {
          for (const data of postDatas) {
            avaliable.push(buildMeta(data));
          }
        }
        yield {
          total,
          page,
          avaliable,
          invalid,
          unavaliable
        };
        page++;
        postDatas = nextPageData;
        lastPage = nextPageIsLast;
      } while (postDatas);
      if (fetchError) throw fetchError;
    }
  }
  class GelbooruParserV020 extends ParserBase {
    parseArtworkSrc(doc) {
      return doc.querySelector('meta[property="og:image"]').getAttribute("content");
    }
    parseArtworkNameBySrc(src) {
      const imageNameMatch = new RegExp("(?<=\\/)\\w+\\.\\w+(?=\\?|$)").exec(src);
      if (!imageNameMatch) throw new Error("Can not parse image name from src.");
      const imageName = imageNameMatch[0];
      return imageName.split(".");
    }
    parseTags(doc) {
      const artist = [];
      const character = [];
      const tags = [];
      const tagEls = doc.querySelectorAll('li[class*="tag-type"]');
      tagEls.forEach((tagEl) => {
        var _a;
        const tagTypeMatch = new RegExp("(?<=tag-type-)\\w+").exec(tagEl.className);
        if (!tagTypeMatch) throw new Error("Unknown tag: " + tagEl.className);
        const tagType = tagTypeMatch[0];
        const tag = (((_a = tagEl.querySelector('a[href*="page=post"]')) == null ? undefined : _a.textContent) || "").replaceAll(" ", "_");
        if (tagType === "artist") {
          artist.push(tag);
        } else if (tagType === "character") {
          character.push(tag);
        }
        tags.push(tagType + ":" + tag);
      });
      return {
        artist,
        character,
        tags
      };
    }
    parseStatistics(doc) {
      var _a, _b, _c, _d, _e, _f;
      const uploaderEl = doc.querySelector('a[href*="page=account&s=profile"]');
      const postDateStr = (_b = (_a = uploaderEl == null ? undefined : uploaderEl.parentElement) == null ? undefined : _a.firstChild) == null ? undefined : _b.nodeValue;
      const postDate = postDateStr ? postDateStr.split(": ")[1] : "";
      let source2 = "";
      const sourceEl = (_d = (_c = uploaderEl == null ? undefined : uploaderEl.parentElement) == null ? undefined : _c.nextElementSibling) == null ? undefined : _d.nextElementSibling;
      if (sourceEl && /^source:/i.test(sourceEl.textContent ?? "")) {
        const sourceLink = sourceEl.querySelector("a");
        if (sourceLink) {
          source2 = sourceLink.href;
        } else {
          source2 = ((_e = sourceEl.textContent) == null ? undefined : _e.replace(/^source: ?/i, "")) ?? "";
        }
      }
      const rating = /Rating: ?(General|Explicit|Questionable|Safe|Sensitive)/.exec(doc.documentElement.innerHTML)[1].toLowerCase();
      const score = (_f = doc.querySelector("span[id^=psc]")) == null ? undefined : _f.textContent;
      if (!score) throw new Error("Cannot parse score");
      return {
        postDate,
        score: +score,
        source: source2,
        rating
      };
    }
    buildMeta(id, doc) {
      const src = this.parseArtworkSrc(doc);
      const [title, extendName] = this.parseArtworkNameBySrc(src);
      const { artist, character, tags } = this.parseTags(doc);
      const { postDate, source: source2, rating, score } = this.parseStatistics(doc);
      return {
        id,
        src,
        extendName,
        artist: artist.join(",") || "UnknownArtist",
        character: character.join(",") || "UnknownCharacter",
        title,
        tags,
        createDate: postDate,
        score,
        source: source2,
        rating
      };
    }
    parseBlacklistTags() {
      const [tagsStr] = new RegExp("(?<=tag_blacklist=).*?(?=;|$)").exec(document.cookie) ?? [];
      if (!tagsStr) return [];
      const tags = decodeURIComponent(decodeURIComponent(tagsStr));
      return tags.split(" ");
    }
    parseFavoriteByDoc(doc) {
      const favDataScripts = doc.querySelectorAll("span + script");
      const favData = Array.from(favDataScripts).map((el) => {
        const content = el.textContent;
        const [id] = new RegExp("(?<=posts\\[)[0-9]+?(?=\\])").exec(content);
        const [dataStr] = content.match(/{.+}/);
        const { tags, rating, score, user } = JSON.parse(
          dataStr.replace(".split(/ /g)", "").replaceAll("'", '"')
        );
        return {
          id,
          tags: decodeURIComponent(tags).split(/\s/g),
          rating: rating.toLowerCase(),
          score: +score,
          user
        };
      });
      return favData;
    }
    parsePostsByDoc(doc) {
      const imageItems = Array.from(
        doc.querySelectorAll(
          "span[id]:has(a > img), .thumbnail-preview > a[id]:has(img)"
        )
      );
      const postData = imageItems.map((el) => {
        const image = el.querySelector("img");
        const fullTags = image.title.trim().replaceAll(/ +/g, " ").split(" ");
        const id = el.id.slice(1);
        const tags = [];
        let rating = "";
        let score = 0;
        let user = "";
        for (let i = 0; i < fullTags.length; i++) {
          const tag = fullTags[i];
          if (tag.startsWith("rating:")) {
            rating = tag.slice(7);
          } else if (tag.startsWith("score:")) {
            score = +tag.slice(6);
          } else if (tag.startsWith("user:")) {
            user = tag.slice(5);
          } else {
            tags.push(tag);
          }
        }
        return {
          id,
          tags,
          rating,
          score: +score,
          user
        };
      });
      logger.info(`Parse posts in ${doc.URL}:`, postData);
      return postData;
    }
  }
  const regexp = {
    preloadData: /"meta-preload-data" content='(.*?)'>/,
    globalData: /"meta-global-data" content='(.*?)'>/,
    artworksPage: /artworks\/(\d+)$/,
    userPage: /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/,
    bookmarkPage: /users\/(\d+)\/bookmarks\/artworks/,
    userPageTags: new RegExp("(?<=users\\/)([0-9]+)\\/(artworks|illustrations|manga|bookmarks(?=\\/artworks))(?:\\/artworks)?\\/?([^?]*)"),
    searchPage: /\/tags\/.*\/(artworks|illustrations|manga)/,
    activityHref: /illust_id=(\d+)/,
    originSrcPageNum: new RegExp("(?<=_p)\\d+"),
    followLatest: /\/bookmark_new_illust(?:_r18)?\.php/,
    historyPage: /\/history\.php/,
    historyThumbnailsId: /\d+(?=_)/,
    series: /\/user\/([0-9]+)\/series\/([0-9]+)/,
    unlisted: new RegExp("(?<=artworks\\/unlisted\\/)[A-Za-z0-9]+"),
    imageExt: /bmp|jp(e)?g|jfif|png|tif(f)?|gif|svg|ico|webp|heif|heic|raw|cr2|nef|arw|dng|avif/i,
    videoExt: /mp4|avi|mkv|mov|wmv|flv|webm|mpeg|mpg|3gp|m4v|ts|vob|ogv|rm|rmvb|m2ts|mxf|asf|swf/i
  };
  function createCompressor() {
    const zip = new JSZip();
    return {
      add(id, name, data) {
        var _a;
        (_a = zip.folder(id)) == null ? undefined : _a.file(name, data);
      },
      bundle(id, comment2) {
        const folder = zip.folder(id);
        if (!folder) throw new TypeError("no such folder:" + id);
        return folder.generateAsync({ type: "blob", comment: comment2 });
      },
      remove(ids) {
        zip.remove(ids);
      },
      fileCount(id) {
        var _a;
        let count = 0;
        (_a = zip.folder(id)) == null ? undefined : _a.forEach(() => count++);
        return count;
      },
      async unzip(data) {
        const id = Math.random().toString(36);
        let folder = zip.folder(id);
        if (!folder) throw TypeError("Can not get new root folder");
        const filesPromises = [];
        folder = await folder.loadAsync(data);
        folder.forEach((_, file) => {
          filesPromises.push(file.async("blob"));
        });
        const files = await Promise.all(filesPromises);
        zip.remove(id);
        return files;
      }
    };
  }
  const compressor = createCompressor();
  var SupportedTemplate = /* @__PURE__ */ ((SupportedTemplate2) => {
    SupportedTemplate2["ID"] = "id";
    SupportedTemplate2["ARTIST"] = "artist";
    SupportedTemplate2["ARTISTID"] = "artistID";
    SupportedTemplate2["CHARACTER"] = "character";
    SupportedTemplate2["DATE"] = "date";
    SupportedTemplate2["SCORE"] = "score";
    SupportedTemplate2["TAGS"] = "tags";
    SupportedTemplate2["TITLE"] = "title";
    SupportedTemplate2["PAGE"] = "page";
    return SupportedTemplate2;
  })(SupportedTemplate || {});
  class MediaDownloadConfig {
    constructor(mediaMeta) {
      __privateAdd(this, _MediaDownloadConfig_instances);
      __publicField(this, "id");
      __publicField(this, "src");
      __publicField(this, "ext");
      __publicField(this, "artist");
      __publicField(this, "title");
      __publicField(this, "tags");
      __publicField(this, "createDate");
      __publicField(this, "imageTimeout", 6e4);
      __publicField(this, "videoTimeout");
      __publicField(this, "taskId");
      __publicField(this, "downloaded");
      __publicField(this, "total");
      __publicField(this, "onDownloadCompleted");
      const { id, src, extendName, artist, title, tags, createDate } = mediaMeta;
      this.id = id;
      this.src = src;
      this.ext = extendName;
      this.artist = artist;
      this.title = title;
      this.tags = tags;
      this.createDate = createDate;
      this.total = Array.isArray(src) ? src.length : 1;
      this.downloaded = 0;
    }
    static get supportedTemplate() {
      throw new Error("Should be overwritten by a subclass");
    }
    normalizeString(str) {
      return replaceInvalidChar(unescapeHtml(str));
    }
    isStringArray(val) {
      return Array.isArray(val);
    }
    isImageExt(ext) {
      return regexp.imageExt.test(ext);
    }
    getTaskId() {
      return this.taskId ?? (this.taskId = this.id + "_" + Math.random().toString(36).slice(2));
    }
    getSrc(idx = 0) {
      return Array.isArray(this.src) ? this.src[idx] : this.src;
    }
    getExt(idx = 0) {
      return Array.isArray(this.ext) ? this.ext[idx] : this.ext;
    }
    getDownloadTimeout(idx = 0) {
      return this.isImageExt(Array.isArray(this.ext) ? this.ext[idx] : this.ext) ? this.imageTimeout : this.videoTimeout;
    }
    getMultipleMediaDownloadCB(setProgress) {
      return this.onDownloadCompleted ?? (this.onDownloadCompleted = () => {
        setProgress(++this.downloaded / this.total * 100);
      });
    }
    getPathTemplate(folderTemplate, filenameTemplate) {
      return folderTemplate ? `${folderTemplate}/${filenameTemplate}` : filenameTemplate;
    }
    getSavePath(folderTemplate, filenameTemplate, ext, templateData) {
      const path = __privateMethod(this, _MediaDownloadConfig_instances, replaceTemplate_fn).call(this, this.getPathTemplate(folderTemplate, filenameTemplate), templateData);
      return `${path}.${ext}`;
    }
  }
  _MediaDownloadConfig_instances = new WeakSet();
  replaceTemplate_fn = function(template2, data) {
    const re = new RegExp(
      `{(${"artist"}|${"artistID"}|${"character"}|${"id"}|${"page"}|${"score"}|${"tags"}|${"title"})}`,
      "g"
    );
    const path = template2.replace(
      re,
      (match, templateName) => {
        if (!(templateName in data)) return match;
        const val = data[templateName];
        return !val ? match : val;
      }
    );
    const dateRe = new RegExp(`{(${"date"})(\\((.+?)\\))?}`, "g");
    return path.replace(
      dateRe,
      (match, _templateName, _formatMatch, formatValue) => {
        if (!data.date) return match;
        const format = formatValue || "YYYY-MM-DD";
        const date = data.date;
        return dayjs(date).format(format);
      }
    );
  };
  class MayBeMultiIllustsConfig extends MediaDownloadConfig {
    constructor() {
      super(...arguments);
      __publicField(this, "handleBeforeSaveCb");
      __publicField(this, "handleErrorCb");
      __publicField(this, "handleAbortCb");
      __publicField(this, "filenames");
    }
    handleBundleFactory(filenames) {
      this.filenames ?? (this.filenames = filenames);
      return this.handleBeforeSaveCb ?? (this.handleBeforeSaveCb = async (imgBlob, config2, signal) => {
        signal == null ? undefined : signal.throwIfAborted();
        const { taskId, src } = config2;
        const index2 = this.src.indexOf(src);
        if (index2 === -1) throw new Error("No src matches.");
        compressor.add(taskId, this.filenames[index2], imgBlob);
        if (compressor.fileCount(taskId) !== filenames.length) return;
        const zipData = await compressor.bundle(taskId, this.getZipComment());
        signal == null ? undefined : signal.throwIfAborted();
        compressor.remove(taskId);
        return zipData;
      });
    }
    handleBundleErrorFactory() {
      return this.handleErrorCb ?? (this.handleErrorCb = () => {
        compressor.remove(this.getTaskId());
      });
    }
    handleBundleAbortFactory() {
      return this.handleAbortCb ?? (this.handleAbortCb = () => {
        compressor.remove(this.getTaskId());
      });
    }
  }
  class BooruDownloadConfig extends MediaDownloadConfig {
    constructor(meta) {
      super(meta);
      __publicField(this, "character");
      __publicField(this, "score");
      this.character = meta.character;
      this.score = meta.score;
    }
    static get supportedTemplate() {
      return {
        [
          "id"
          /* ID */
        ]: "{id}",
        [
          "artist"
          /* ARTIST */
        ]: "{artist}",
        [
          "character"
          /* CHARACTER */
        ]: "{character}",
        [
          "date"
          /* DATE */
        ]: "{date}, {date(YYYY-MM-DD)}",
        [
          "title"
          /* TITLE */
        ]: "{title}",
        [
          "score"
          /* SCORE */
        ]: "{score}"
      };
    }
    getHeaders(cfClearance) {
      return {
        cookie: `cf_clearance=${cfClearance}`
      };
    }
    getTemplateData() {
      return {
        id: this.id,
        artist: this.artist,
        character: this.character,
        date: this.createDate,
        title: this.title,
        score: String(this.score)
      };
    }
    create(option) {
      const { filenameTemplate, folderTemplate, setProgress, cfClearance } = option;
      return {
        headers: cfClearance ? this.getHeaders(cfClearance) : undefined,
        taskId: this.getTaskId(),
        src: this.getSrc(),
        path: this.getSavePath(
          folderTemplate,
          filenameTemplate,
          this.getExt(),
          this.getTemplateData()
        ),
        timeout: this.getDownloadTimeout(),
        onProgress: setProgress
      };
    }
  }
  class GelbooruV020 extends SiteInject {
    constructor() {
      super(...arguments);
      __privateAdd(this, _GelbooruV020_instances);
      __publicField(this, "searchParams", new URLSearchParams(location.search));
      __publicField(this, "useBatchDownload", this.app.initBatchDownloader({
        metaType: {},
        avatar: this.getAvatar.bind(this),
        filterOption: {
          filters: [
            {
              id: "exclude_downloaded",
              type: "exclude",
              name: t("downloader.category.filter.exclude_downloaded"),
              checked: false,
              fn(meta) {
                return !!meta.id && historyDb.has(meta.id);
              }
            },
            {
              id: "allow_image",
              type: "include",
              name: t("downloader.category.filter.image"),
              checked: true,
              fn(meta) {
                return !!meta.tags && !meta.tags.includes("video");
              }
            },
            // Safebooru doesn't really have videos, although it has about 73 GIFs tagged with 'video'
            {
              id: "allow_video",
              type: "include",
              name: t("downloader.category.filter.video"),
              checked: true,
              fn(meta) {
                return !!meta.tags && meta.tags.includes("video");
              }
            }
          ],
          enableTagFilter: true
        },
        pageOption: {
          favorites: {
            name: "Favorites",
            match: /(?=.*page=favorites)(?=.*s=view)(?=.*id=[0-9]+)/,
            filterInGenerator: true,
            fn: (pageRange, checkValidity, userId) => {
              userId ?? (userId = new RegExp("(?<=id=)[0-9]+").exec(location.search)[0]);
              const getFavoriteByPage = async (page) => {
                const THUMBS_PER_PAGE = 50;
                const pid = (page - 1) * THUMBS_PER_PAGE;
                const doc = await this.api.getFavoriteDoc(userId, pid);
                const data = this.parser.parseFavoriteByDoc(doc);
                return {
                  lastPage: data.length < THUMBS_PER_PAGE,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getFavoriteByPage,
                (post) => post.id,
                __privateMethod(this, _GelbooruV020_instances, validityCheckFactory_fn).call(this, checkValidity)
              );
            }
          },
          pools: {
            name: "Pools",
            match: /(?=.*page=pool)(?=.*s=show)(?=.*id=[0-9]+)/,
            filterInGenerator: true,
            fn: (_, checkValidity, poolId) => {
              poolId ?? (poolId = new RegExp("(?<=id=)[0-9]+").exec(location.search)[0]);
              const getPoolData = async () => {
                const doc = await this.api.getPoolDoc(poolId);
                return {
                  lastPage: true,
                  data: this.parser.parsePostsByDoc(doc)
                };
              };
              return this.parser.paginationGenerator(
                [1, 1],
                getPoolData,
                (post) => post.id,
                __privateMethod(this, _GelbooruV020_instances, validityCheckFactory_fn).call(this, checkValidity)
              );
            }
          },
          posts: {
            name: "Posts",
            match: /(?=.*page=post)(?=.*s=list)/,
            filterInGenerator: true,
            fn: (pageRange, checkValidity, tags) => {
              tags ?? (tags = new URLSearchParams(location.search).get("tags") ?? "all");
              const getPostsByPage = async (page) => {
                const THUMBS_PER_PAGE = 42;
                const pid = (page - 1) * THUMBS_PER_PAGE;
                const doc = await this.api.getPostsDoc(pid, tags);
                const data = this.parser.parsePostsByDoc(doc);
                return {
                  lastPage: data.length < THUMBS_PER_PAGE,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostsByPage,
                (post) => post.id,
                __privateMethod(this, _GelbooruV020_instances, validityCheckFactory_fn).call(this, checkValidity)
              );
            }
          }
        },
        parseMetaByArtworkId: async (id) => {
          const doc = await this.api.getPostDoc(id);
          return this.parser.buildMeta(id, doc);
        },
        downloadArtworkByMeta: async (meta, signal) => {
          var _a;
          downloader.dirHandleCheck();
          const downloadConfigs = new BooruDownloadConfig(meta).create({
            folderTemplate: this.config.get("folderPattern"),
            filenameTemplate: this.config.get("filenamePattern"),
            cfClearance: (_a = this.config.get("auth")) == null ? undefined : _a.cf_clearance
          });
          await downloader.download(downloadConfigs, { signal });
          const { id, tags, artist, title, source: source2, rating } = meta;
          historyDb.add({
            pid: Number(id),
            user: artist,
            title,
            tags,
            source: source2,
            rating
          });
        }
      }));
    }
    getSupportedTemplate() {
      return BooruDownloadConfig.supportedTemplate;
    }
    getAvatar() {
      return "/favicon.ico";
    }
    async downloadArtwork(btn2) {
      var _a;
      downloader.dirHandleCheck();
      const id = btn2.dataset.id;
      const doc = await this.api.getPostDoc(id);
      const mediaMeta = this.parser.buildMeta(id, doc);
      const downloadConfig = new BooruDownloadConfig(mediaMeta).create({
        folderTemplate: this.config.get("folderPattern"),
        filenameTemplate: this.config.get("filenamePattern"),
        cfClearance: (_a = this.config.get("auth")) == null ? undefined : _a.cf_clearance,
        setProgress: (progress) => {
          btn2.setProgress(progress);
        }
      });
      this.config.get("addBookmark") && __privateMethod(this, _GelbooruV020_instances, addBookmark_fn).call(this, id);
      await downloader.download(downloadConfig, { priority: 1 });
      const { tags, artist, title, source: source2, rating } = mediaMeta;
      historyDb.add({
        pid: Number(id),
        user: artist,
        title,
        tags,
        source: source2,
        rating
      });
    }
    setThumbnailStyle(btnContainer) {
      btnContainer.style.position = "relative";
    }
    createThumbnailBtn() {
      const btnContainers = document.querySelectorAll(this.getThumbnailSelector());
      if (!btnContainers.length) return;
      btnContainers.forEach((el) => {
        this.setThumbnailStyle(el);
        const idMathch = new RegExp("(?<=&id=)\\d+").exec(el.href);
        if (!idMathch) return;
        const id = idMathch[0];
        el.appendChild(
          new ThumbnailButton({
            id,
            onClick: this.downloadArtwork.bind(this)
          })
        );
      });
    }
    createArtworkBtn(id) {
      const btnContainer = document.querySelector("div.flexi > div");
      btnContainer.style.position = "relative";
      btnContainer.appendChild(
        new ArtworkButton({
          id,
          site: "gelbooru",
          onClick: this.downloadArtwork.bind(this)
        })
      );
    }
    isPostsList() {
      return this.searchParams.get("page") === "post" && this.searchParams.get("s") === "list";
    }
    isPostView() {
      return this.searchParams.get("page") === "post" && this.searchParams.get("s") === "view";
    }
    isPool() {
      return this.searchParams.get("page") === "pool" && this.searchParams.get("s") === "show";
    }
    isMyfavorites() {
      return this.searchParams.get("page") === "favorites" && this.searchParams.get("s") === "view";
    }
    isAccountProfile() {
      return this.searchParams.get("page") === "account" && this.searchParams.get("s") === "profile";
    }
    inject() {
      super.inject();
      if (this.searchParams.size === 0) return;
      if (this.isPostView()) {
        if (!document.querySelector("#image, #gelcomVideoPlayer")) return;
        const id = this.searchParams.get("id");
        this.createArtworkBtn(id);
      } else {
        this.createThumbnailBtn();
      }
    }
  }
  _GelbooruV020_instances = new WeakSet();
  validityCheckFactory_fn = function(checkValidity) {
    return async (post) => {
      const { id, tags } = post;
      return await checkValidity({ id, tags }) ? PostValidState.VALID : PostValidState.INVALID;
    };
  };
  addBookmark_fn = function(id) {
    _unsafeWindow.addFav(id);
  };
  class ApiBase {
    constructor(option = { rateLimit: 4 }) {
      __publicField(this, "queue");
      __publicField(this, "fetch");
      const { rateLimit } = option;
      this.queue = new PQueue({ interval: 1e3, intervalCap: rateLimit });
      this.fetch = (input, init2) => {
        return this.queue.add(() => fetch(input, init2), { throwOnTimeout: true });
      };
    }
    async getHtml(url) {
      logger.info("Fetch url:", url);
      const res = await this.fetch(url);
      if (!res.ok) throw new RequestError(res.url, res.status);
      return await res.text();
    }
    async getDoc(url) {
      const html2 = await this.getHtml(url);
      return new DOMParser().parseFromString(html2, "text/html");
    }
    async getJSON(url, init2) {
      logger.info("Fetch url:", url);
      const res = await this.fetch(url, init2);
      if (!res.ok) throw new RequestError(res.url, res.status);
      return await res.json();
    }
  }
  class GelbooruApiV020 extends ApiBase {
    async getPosts(params) {
      let url = "/index.php?page=dapi&s=post&q=index&json=1";
      Object.entries(params).forEach(([key, val]) => {
        if (typeof val === "number") {
          val = String(val);
        } else if (Array.isArray(val)) {
          val = val.join("+");
        }
        url += `&${key}=${val}`;
      });
      const res = await this.fetch(url);
      if (!res.ok) throw new RequestError(url, res.status);
      try {
        return await res.json();
      } catch (error) {
        if (error instanceof SyntaxError) {
          return [];
        } else {
          throw error;
        }
      }
    }
    getPostDoc(id) {
      return this.getDoc("index.php?page=post&s=view&id=" + id);
    }
    // Does not include blacklisted images(unless you search the blacklisted tag), making it
    // more suitable for batch downloads that need to handle page ranges.
    getPostsDoc(pid = 0, tags = "all") {
      if (Array.isArray(tags)) tags = tags.join("+");
      return this.getDoc(`/index.php?page=post&s=list&tags=${tags}&pid=${pid}`);
    }
    getFavoriteDoc(userId, pid = 0) {
      return this.getDoc(`/index.php?page=favorites&s=view&id=${userId}&pid=${pid}`);
    }
    getPoolDoc(poolId) {
      return this.getDoc(`/index.php?page=pool&s=show&id=${poolId}`);
    }
  }
  class Rule34Parser extends GelbooruParserV020 {
    parseArtworkSrc(doc) {
      var _a;
      return ((_a = doc.querySelector("#gelcomVideoPlayer > source")) == null ? undefined : _a.src) || doc.querySelector('meta[property="og:image"]').getAttribute("content");
    }
    parseFavoriteByDoc(doc) {
      const favDataScripts = doc.querySelectorAll(".image-list > span + script");
      const favData = Array.from(favDataScripts).map((el) => {
        const content = el.textContent;
        const [id] = new RegExp("(?<=posts\\[)[0-9]+?(?=\\])").exec(content);
        const [tags] = new RegExp(`(?<=tags: ["']).*?(?=["']\\.)`).exec(content);
        const [rating] = new RegExp(`(?<=rating: ["']).*?(?=["'],)`).exec(content);
        const [score] = new RegExp(`(?<=score: ["'])[0-9]+(?=["'],)`).exec(content);
        const [user] = new RegExp(`(?<=user: ["']).*?(?=["']\\s+})`).exec(content);
        return {
          id,
          tags: tags.split(/\s/g),
          rating: rating.toLowerCase(),
          score: +score,
          user
        };
      });
      return favData;
    }
  }
  class Rule34 extends GelbooruV020 {
    constructor() {
      super(...arguments);
      __publicField(this, "api", new GelbooruApiV020());
      __publicField(this, "parser", new Rule34Parser());
    }
    static get hostname() {
      return "rule34.xxx";
    }
    getAvatar() {
      return "/images/r34chibi.png";
    }
    getThumbnailSelector() {
      return ".thumb > a:first-child:not(:has(.blacklist-img))";
    }
    getCustomConfig() {
      return {
        folderPattern: "rule34/{artist}",
        filenamePattern: "{id}_{artist}_{character}",
        auth: {
          cf_clearance: ""
        }
      };
    }
    setThumbnailStyle(btnContainer) {
      btnContainer.setAttribute(
        "style",
        "position: relative; align-self: center; width: auto; height: auto;"
      );
      const imgEl = btnContainer.querySelector("img");
      const setContainerHeight = () => {
        const aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
        aspectRatio > 1 && (btnContainer.style.height = "inherit");
      };
      setContainerHeight();
      imgEl.onload = setContainerHeight;
    }
    createArtworkBtn(id) {
      var _a;
      let isImage = false;
      let btnContainer = document.querySelector("#gelcomVideoContainer");
      if (!btnContainer) {
        isImage = true;
        const image = document.querySelector("#image");
        btnContainer = document.createElement("div");
        (_a = image.parentElement) == null ? undefined : _a.insertBefore(btnContainer, image);
        btnContainer.append(image);
      } else {
        btnContainer.style.fontSize = "0px";
      }
      btnContainer.style.position = "relative";
      btnContainer.appendChild(
        new ArtworkButton({
          id,
          site: isImage ? undefined : "fluid_video",
          onClick: this.downloadArtwork.bind(this)
        })
      );
    }
  }
  class DanbooruParser extends ParserBase {
    constructor() {
      super(...arguments);
      __privateAdd(this, _DanbooruParser_instances);
    }
    getBlacklistValidationTags(data) {
      const { tag_string, rating, uploader_id, is_deleted, is_flagged, is_pending } = data;
      const matchTags = tag_string.match(/\S+/g) ?? [];
      matchTags.push("rating:" + rating);
      matchTags.push("uploaderid:" + uploader_id);
      is_deleted && matchTags.push("status:deleted");
      is_flagged && matchTags.push("status:flagged");
      is_pending && matchTags.push("status:pending");
      return matchTags;
    }
    parseCsrfToken() {
      var _a;
      const token = (_a = document.head.querySelector('meta[name="csrf-token"]')) == null ? undefined : _a.content;
      return token || null;
    }
    getBlacklistByHtml() {
      var _a;
      return ((_a = document.querySelector('meta[name="blacklisted-tags"]')) == null ? undefined : _a.content) ?? "";
    }
    getBlacklistItem(blacklistTags, source2 = "api") {
      let separator;
      if (source2 === "html") {
        separator = /,/;
      } else {
        separator = /\n+/;
      }
      const tags = blacklistTags.replace(/(rating:\w)\w+/gi, "$1").toLowerCase().split(separator).filter((tag) => tag.trim() !== "");
      return tags.map(__privateMethod(this, _DanbooruParser_instances, parseBlacklistItem_fn));
    }
    isBlacklisted(matchTags, blacklist) {
      const scoreRe = /score:(-?[0-9]+)/;
      const scoreMatch = (matchTags.find((tag) => scoreRe.test(tag)) ?? "").match(scoreRe);
      const score = scoreMatch ? +scoreMatch[1] : scoreMatch;
      return blacklist.some((blacklistItem) => {
        const { require: require2, exclude, optional, min_score } = blacklistItem;
        const hasTag = (tag) => matchTags.includes(tag);
        const scoreTest = min_score === null || score === null || score < min_score;
        return require2.every(hasTag) && scoreTest && (!optional.length || intersect(matchTags, optional).length) && !exclude.some(hasTag);
      });
    }
    buildMetaByDoc(doc) {
      var _a, _b;
      const src = (_a = doc.querySelector("a[download]")) == null ? undefined : _a.href;
      if (!src) throw new Error("Can not get media src");
      const ogImageMeta = doc.querySelector('meta[property="og:image"]');
      const mediaSrc = ogImageMeta.getAttribute("content");
      const title = mediaSrc.slice(mediaSrc.lastIndexOf("/") + 1).split(".")[0];
      const ogTypeMeta = doc.querySelector('meta[property="og:video:type"]') || doc.querySelector('meta[property="og:image:type"]');
      const mimeType = ogTypeMeta.getAttribute("content");
      const extendName = mimeType.slice(mimeType.lastIndexOf("/") + 1);
      const artists = [];
      const characters = [];
      const tags = [];
      const tagLists = doc.querySelectorAll(
        'section#tag-list  ul[class*="-tag-list"]'
      );
      if (tagLists.length) {
        tagLists.forEach((ul) => {
          const tagTypeMatch = /[a-zA-Z]+(?=-tag-list)/.exec(ul.className);
          if (!tagTypeMatch) throw new Error("Unknown tag: " + ul.className);
          const tagType = tagTypeMatch[0];
          const liEls = ul.children;
          let tagRef;
          if (tagType === "artist") {
            tagRef = artists;
          } else if (tagType === "character") {
            tagRef = characters;
          }
          for (let i = 0; i < liEls.length; i++) {
            const tag = liEls[i].getAttribute("data-tag-name");
            if (!tag) continue;
            tagRef && tagRef.push(tag);
            tags.push(tagType + ":" + tag);
          }
        });
      }
      const postDate = ((_b = doc.querySelector("time")) == null ? undefined : _b.getAttribute("datetime")) ?? "";
      let comment2 = "";
      const commentEl = doc.querySelector("#original-artist-commentary");
      commentEl && (comment2 = getElementText(commentEl));
      const imageContainer = doc.querySelector("section.image-container");
      const {
        score = "0",
        source: source2 = "",
        rating = "",
        id
      } = imageContainer.dataset;
      if (!id) throw new Error("Can not parse post id.");
      return {
        id,
        src,
        extendName,
        artist: artists.join(",") || "UnknownArtist",
        character: characters.join(",") || "UnknownCharacter",
        title,
        comment: comment2,
        tags,
        createDate: postDate,
        score: +score,
        source: source2,
        rating
      };
    }
    buildMetaByApi(post, artistCommentary) {
      const {
        id,
        created_at,
        file_ext,
        file_url,
        md5,
        tag_string_artist,
        tag_string_character,
        tag_string_copyright,
        tag_string_general,
        tag_string_meta,
        score,
        source: source2,
        rating
      } = post;
      const { original_title = "", original_description = "" } = artistCommentary ?? {};
      const addTypeToTag = (type, tag) => tag.split(" ").map((tag2) => type + ":" + tag2);
      const tags = [
        ...addTypeToTag("artist", tag_string_artist),
        ...addTypeToTag("character", tag_string_character),
        ...addTypeToTag("copyright", tag_string_copyright),
        ...addTypeToTag("general", tag_string_general),
        ...addTypeToTag("meta", tag_string_meta)
      ];
      const comment2 = original_title && original_description ? original_title + "\n" + original_description : original_title || original_description;
      return {
        id: String(id),
        src: file_url ?? "",
        extendName: file_ext,
        artist: tag_string_artist.replaceAll(" ", ",") || "UnknownArtist",
        character: tag_string_character.replaceAll(" ", ",") || "UnknownCharacter",
        title: md5,
        comment: comment2,
        tags,
        createDate: created_at,
        rating: rating ?? "",
        score,
        source: source2
      };
    }
  }
  _DanbooruParser_instances = new WeakSet();
  /**
   * https://github.com/danbooru/danbooru/blob/master/app/javascript/src/javascripts/blacklists.js
   */
  parseBlacklistItem_fn = function(tags) {
    const tagsArr = tags.split(" ");
    const require2 = [];
    const exclude = [];
    const optional = [];
    let min_score = null;
    tagsArr.forEach((tag) => {
      if (tag.charAt(0) === "-") {
        exclude.push(tag.slice(1));
      } else if (tag.charAt(0) === "~") {
        optional.push(tag.slice(1));
      } else if (tag.match(/^score:<.+/)) {
        const score = tag.match(/^score:<(.+)/)[1];
        min_score = Number.parseInt(score);
      } else {
        require2.push(tag);
      }
    });
    return { tags, require: require2, exclude, optional, min_score };
  };
  class DanbooruPoolButton extends ThumbnailButton {
    constructor(props) {
      super({
        ...props,
        shouldObserveDb: false
      });
      __publicField(this, "downloading");
      this.downloading = props.downloading;
    }
    static get tagNameLowerCase() {
      return "pdl-danbooru-pool-button";
    }
    connectedCallback() {
      super.connectedCallback();
      this.unsubscriber = this.downloading.subscribe((val) => {
        if (val) {
          this.setAttribute("disabled", "");
        } else {
          this.removeAttribute("disabled");
        }
      });
    }
  }
  customElements.define(DanbooruPoolButton.tagNameLowerCase, DanbooruPoolButton);
  class DanbooruApi extends ApiBase {
    // Danbooru uses some custom status codes in the 4xx and 5xx range:
    // 200 OK: Request was successful
    // 204 No Content: Request was successful (returned by create actions)
    // 400 Bad Request: The given parameters could not be parsed
    // 401 Unauthorized: Authentication failed
    // 403 Forbidden: Access denied (see help:users for permissions information)
    // 404 Not Found: Not found
    // 410 Gone: Pagination limit (see help:users for pagination limits)
    // 420 Invalid Record: Record could not be saved
    // 422 Locked: The resource is locked and cannot be modified
    // 423 Already Exists: Resource already exists
    // 424 Invalid Parameters: The given parameters were invalid
    // 429 User Throttled: User is throttled, try again later (see help:users for API limits)
    // 500 Internal Server Error: A database timeout, or some unknown error occurred on the server
    // 502 Bad Gateway: Server cannot currently handle the request, try again later (returned during heavy load)
    // 503 Service Unavailable: Server cannot currently handle the request, try again later (returned during downbooru)
    async getJSON(url, init2) {
      logger.info("Fetch url:", url);
      const res = await this.fetch(url, init2);
      if (res.status >= 500) throw new RequestError(res.url, res.status);
      const data = await res.json();
      if ("success" in data && !data.success) {
        const { error, message } = data;
        throw new JsonDataError(error + ", " + message);
      }
      return data;
    }
    getPool(id) {
      return this.getJSON(`/pools/${id}.json`);
    }
    getPost(id) {
      return this.getJSON(`/posts/${id}.json`);
    }
    getPostDoc(id) {
      return this.getDoc("/posts/" + id);
    }
    getPostList(param) {
      const { tags = [], limit = 0, page = 0 } = param ?? {};
      const searchParam = new URLSearchParams();
      (tags == null ? undefined : tags.length) && searchParam.append("tags", tags.join(" "));
      limit && searchParam.append("limit", String(limit));
      page && searchParam.append("page", String(page));
      return this.getJSON(`/posts.json?${searchParam.toString()}`);
    }
    /**
     * In aftbooru, account needs to be over a week old to get commentary.
     */
    getArtistCommentary(id) {
      return this.getJSON(`/posts/${id}/artist_commentary.json`);
    }
    getFavoriteGroups(id) {
      return this.getJSON(`/favorite_groups/${id}.json`);
    }
    getProfile() {
      return this.getJSON(`/profile.json`);
    }
    async addFavorite(id, token) {
      const res = await this.fetch(`/favorites?post_id=${id}`, {
        method: "POST",
        headers: {
          "X-Csrf-Token": token
        }
      });
      if (!res.ok) throw new RequestError(res.url, res.status);
      return await res.text();
    }
  }
  class AbstractDanbooru extends SiteInject {
    constructor() {
      super(...arguments);
      __privateAdd(this, _AbstractDanbooru_instances);
      __publicField(this, "profile", null);
      __publicField(this, "blacklist", null);
      __publicField(this, "useBatchDownload", this.app.initBatchDownloader({
        metaType: {},
        avatar: () => this.getAvatar(),
        filterOption: {
          filters: [
            {
              id: "exclude_downloaded",
              type: "exclude",
              name: t("downloader.category.filter.exclude_downloaded"),
              checked: false,
              fn(meta) {
                return !!meta.id && historyDb.has(meta.id);
              }
            },
            {
              id: "exclude_blacklist",
              type: "exclude",
              name: t("downloader.category.filter.exclude_blacklist"),
              checked: true,
              fn: async (meta) => {
                return !!meta.blacklistValidationTags && this.parser.isBlacklisted(meta.blacklistValidationTags, this.blacklist);
              }
            },
            {
              id: "allow_image",
              type: "include",
              name: t("downloader.category.filter.image"),
              checked: true,
              fn(meta) {
                return !!meta.extendName && /bmp|jp(e)?g|png|tif|gif|exif|svg|webp/i.test(meta.extendName);
              }
            },
            {
              id: "allow_video",
              type: "include",
              name: t("downloader.category.filter.video"),
              checked: true,
              fn(meta) {
                return !!meta.extendName && /mp4|avi|mov|mkv|flv|wmv|webm|mpeg|mpg|m4v/i.test(meta.extendName);
              }
            }
          ],
          enableTagFilter: true
        },
        pageOption: {
          pool: {
            name: "Pool",
            match: new RegExp("(?<=\\/pools\\/)[0-9]+"),
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              var _a;
              const poolId = (_a = new RegExp("(?<=\\/pools\\/)[0-9]+").exec(location.pathname)) == null ? undefined : _a[0];
              if (!poolId) throw new Error("Invalid pool id");
              const perPage = this.profile.per_page;
              const getPostDataByPage = async (page) => {
                const data = await this.api.getPostList({
                  tags: [`ordpool:${poolId}`],
                  limit: perPage,
                  page
                });
                return {
                  lastPage: data.length < perPage,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostDataByPage,
                (post) => String(post.id),
                __privateMethod(this, _AbstractDanbooru_instances, validityCheckFactory_fn2).call(this, checkValidity)
              );
            }
          },
          favorite_groups: {
            name: "FavoriteGroups",
            match: new RegExp("(?<=\\/favorite_groups\\/)[0-9]+"),
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              var _a;
              const groupId = (_a = new RegExp("(?<=\\/favorite_groups\\/)[0-9]+").exec(location.pathname)) == null ? undefined : _a[0];
              if (!groupId) throw new Error("Invalid pool id");
              const perPage = this.profile.per_page;
              const getPostDataByPage = async (page) => {
                const data = await this.api.getPostList({
                  tags: [`ordfavgroup:${groupId}`],
                  limit: perPage,
                  page
                });
                return {
                  lastPage: data.length < perPage,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostDataByPage,
                (post) => String(post.id),
                __privateMethod(this, _AbstractDanbooru_instances, validityCheckFactory_fn2).call(this, checkValidity)
              );
            }
          },
          post_list: {
            name: "Post",
            match: () => location.pathname === "/" || location.pathname === "/posts",
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              var _a;
              const perPage = this.profile.per_page;
              const searchParam = new URLSearchParams(location.search);
              const tags = ((_a = searchParam.get("tags")) == null ? undefined : _a.split(" ")) ?? [];
              const limit = searchParam.get("limit");
              const limitParam = limit ? Number(limit) : perPage;
              const getPostDataByPage = async (page) => {
                const data = await this.api.getPostList({
                  tags,
                  limit: limitParam,
                  page
                });
                return {
                  lastPage: data.length < limitParam,
                  data
                };
              };
              const showDeletedPosts = (tags == null ? undefined : tags.includes("status:deleted")) || this.profile.show_deleted_posts;
              return this.parser.paginationGenerator(
                pageRange,
                getPostDataByPage,
                (post) => String(post.id),
                __privateMethod(this, _AbstractDanbooru_instances, validityCheckFactory_fn2).call(this, checkValidity, showDeletedPosts)
              );
            }
          },
          pool_gallery_button: {
            name: "pool_gallery_button",
            match: () => false,
            filterInGenerator: true,
            fn: (pageRange, checkValidity, poolId) => {
              if (!poolId) throw new Error("Invalid pool id");
              const perPage = this.profile.per_page;
              const getPostDataByPage = async (page) => {
                const data = await this.api.getPostList({
                  tags: [`ordpool:${poolId}`],
                  limit: perPage,
                  page
                });
                return {
                  lastPage: data.length < perPage,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostDataByPage,
                (post) => String(post.id),
                __privateMethod(this, _AbstractDanbooru_instances, validityCheckFactory_fn2).call(this, checkValidity)
              );
            }
          },
          show_downloader_in_pool_gallery: {
            name: "pool_gallery",
            match: /\/pools\/gallery/
          }
        },
        parseMetaByArtworkId: async (id) => {
          return this.getMetaByPostId(id);
        },
        downloadArtworkByMeta: async (meta, signal) => {
          downloader.dirHandleCheck();
          const downloadConfig = new BooruDownloadConfig(meta).create({
            folderTemplate: this.config.get("folderPattern"),
            filenameTemplate: this.config.get("filenamePattern")
          });
          await downloader.download(downloadConfig, { signal });
          const { id, tags, artist, title, comment: comment2, source: source2, rating } = meta;
          historyDb.add({
            pid: Number(id),
            user: artist,
            title,
            comment: comment2,
            tags,
            source: source2,
            rating
          });
        },
        beforeDownload: async () => {
          this.profile = await this.api.getProfile();
          const blacklistTags = this.profile.blacklisted_tags;
          this.blacklist = blacklistTags ? this.parser.getBlacklistItem(blacklistTags) : null;
        },
        afterDownload: () => {
          this.profile = null;
          this.blacklist = null;
        }
      }));
    }
    getSupportedTemplate() {
      return BooruDownloadConfig.supportedTemplate;
    }
    async getPostAndComment(id) {
      const [postResult, commentResult] = await Promise.allSettled([
        this.api.getPost(id),
        this.api.getArtistCommentary(id)
      ]);
      if (postResult.status === "rejected") throw postResult.reason;
      let comment2 = undefined;
      if (commentResult.status === "rejected") {
        if (!(commentResult.reason instanceof JsonDataError)) {
          throw commentResult.reason;
        }
      } else {
        comment2 = commentResult.value;
      }
      return { post: postResult.value, comment: comment2 };
    }
    async getMetaByPostId(id) {
      const { post, comment: commentary } = await this.getPostAndComment(id);
      return this.parser.buildMetaByApi(post, commentary);
    }
    observeColorScheme() {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      let uaPreferDark = query.matches;
      const siteSetting = document.body.getAttribute("data-current-user-theme");
      const sitePreferDark = siteSetting === "dark";
      if (sitePreferDark || siteSetting === "auto" && uaPreferDark) {
        this.setAppDarkMode();
      }
      if (siteSetting === "auto") {
        query.addEventListener("change", (e) => {
          uaPreferDark = e.matches;
          uaPreferDark ? this.setAppDarkMode() : this.setAppLightMode();
        });
      }
    }
    async addBookmark(id) {
      try {
        const token = this.parser.parseCsrfToken();
        if (!token) throw new Error("Can not get csrf-token");
        const script = await this.api.addFavorite(id, token);
        const galleryMatch = new RegExp("(?<=^\\/posts\\/)\\d+").exec(location.pathname);
        if (galleryMatch && id !== galleryMatch[0]) {
          _unsafeWindow.Danbooru.Utility.notice("You have favorited " + id);
        } else {
          evalScript(script);
        }
      } catch (error) {
        logger.error(error);
      }
    }
    async downloadArtwork(btn2) {
      downloader.dirHandleCheck();
      const id = btn2.dataset.id;
      const mediaMeta = await this.getMetaByPostId(id);
      const downloadConfig = new BooruDownloadConfig(mediaMeta).create({
        folderTemplate: this.config.get("folderPattern"),
        filenameTemplate: this.config.get("filenamePattern"),
        setProgress: (progress) => {
          btn2.setProgress(progress);
        }
      });
      this.config.get("addBookmark") && this.addBookmark(id);
      await downloader.download(downloadConfig, { priority: 1 });
      const { tags, artist, title, comment: comment2, source: source2, rating } = mediaMeta;
      historyDb.add({
        pid: Number(id),
        user: artist,
        title,
        comment: comment2,
        tags,
        source: source2,
        rating
      });
    }
    createThumbnailBtn() {
      const btnContainers = document.querySelectorAll(
        "article a.post-preview-link"
      );
      if (!btnContainers.length) return;
      btnContainers.forEach((el) => {
        var _a;
        const id = (_a = new RegExp("(?<=\\/posts\\/)\\d+").exec(el.href)) == null ? undefined : _a[0];
        if (!id) return;
        const btn2 = new ThumbnailButton({
          id,
          onClick: this.downloadArtwork
        });
        el.appendChild(btn2);
      });
    }
    createArtworkBtn() {
      const btnContainer = document.querySelector(
        "section.image-container:has(:is(picture, video))"
      );
      if (!btnContainer) return;
      const id = btnContainer.getAttribute("data-id");
      btnContainer.appendChild(
        new ArtworkButton({
          id,
          site: btnContainer.querySelector("video") ? "native_video" : undefined,
          onClick: this.downloadArtwork
        })
      );
    }
    createPoolThumbnailBtn() {
      const btnContainers = document.querySelectorAll(
        "article a.post-preview-link"
      );
      if (!btnContainers.length) return;
      const { downloading, batchDownload } = this.useBatchDownload();
      const onClick = (btn2) => {
        const poolId = btn2.dataset.id;
        return batchDownload("pool_gallery_button", poolId);
      };
      btnContainers.forEach((el) => {
        var _a;
        const poolId = (_a = new RegExp("(?<=\\/pools\\/)\\d+").exec(el.href)) == null ? undefined : _a[0];
        if (!poolId) return;
        const btn2 = new DanbooruPoolButton({ id: poolId, downloading, onClick });
        el.appendChild(btn2);
      });
    }
    inject() {
      super.inject();
      this.downloadArtwork = this.downloadArtwork.bind(this);
      const path = location.pathname;
      if (/^\/posts\/\d+/.test(path)) {
        this.createArtworkBtn();
        this.createThumbnailBtn();
      } else if (/^\/pools\/gallery/.test(path)) {
        this.createPoolThumbnailBtn();
      } else {
        this.createThumbnailBtn();
      }
    }
  }
  _AbstractDanbooru_instances = new WeakSet();
  validityCheckFactory_fn2 = function(checkValidity, showDeletedPosts = true) {
    return async (post) => {
      const { id, is_deleted, file_ext, file_url, tag_string } = post;
      if (!file_url) return PostValidState.UNAVAILABLE;
      if (is_deleted && !showDeletedPosts) return PostValidState.INVALID;
      const blacklistValidationTags = this.parser.getBlacklistValidationTags(post);
      return await checkValidity({
        id: String(id),
        extendName: file_ext,
        tags: tag_string.split(" "),
        blacklistValidationTags
      }) ? PostValidState.VALID : PostValidState.INVALID;
    };
  };
  class Danbooru extends AbstractDanbooru {
    constructor() {
      super(...arguments);
      __publicField(this, "api", new DanbooruApi());
      __publicField(this, "parser", new DanbooruParser());
    }
    static get hostname() {
      return "danbooru.donmai.us";
    }
    getAvatar() {
      return "/packs/static/danbooru-logo-128x128-ea111b6658173e847734.png";
    }
    getCustomConfig() {
      return {
        folderPattern: "danbooru/{artist}",
        filenamePattern: "{id}_{artist}_{character}"
      };
    }
  }
  var IllustType = /* @__PURE__ */ ((IllustType2) => {
    IllustType2[IllustType2["illusts"] = 0] = "illusts";
    IllustType2[IllustType2["manga"] = 1] = "manga";
    IllustType2[IllustType2["ugoira"] = 2] = "ugoira";
    return IllustType2;
  })(IllustType || {});
  var BookmarkRestrict = /* @__PURE__ */ ((BookmarkRestrict2) => {
    BookmarkRestrict2[BookmarkRestrict2["public"] = 0] = "public";
    BookmarkRestrict2[BookmarkRestrict2["private"] = 1] = "private";
    return BookmarkRestrict2;
  })(BookmarkRestrict || {});
  class PixivApi extends ApiBase {
    async getJSON(url, init2) {
      const data = await super.getJSON(url, init2);
      if (data.error) throw new JsonDataError(data.message);
      return data.body;
    }
    async getArtworkHtml(illustId, lang2) {
      const res = await this.fetch(`/artworks/${illustId}?lang=${lang2}`);
      if (!res.ok) throw new RequestError(res.url, res.status);
      return await res.text();
    }
    getArtworkDoc(illustId, lang2) {
      return this.getDoc(`/artworks/${illustId}?lang=${lang2}`);
    }
    getArtworkDetail(illustId, lang2) {
      return this.getJSON(`/ajax/illust/${illustId}?lang=${lang2}`);
    }
    getUnlistedArtworkDetail(unlistedId, lang2) {
      return this.getJSON(`/ajax/illust/unlisted/${unlistedId}?lang=${lang2}`);
    }
    addBookmark(illustId, token, tags = [], restrict = BookmarkRestrict.public) {
      return this.getJSON("/ajax/illusts/bookmarks/add", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json; charset=utf-8",
          "x-csrf-token": token
        },
        body: JSON.stringify({
          illust_id: illustId,
          restrict,
          comment: "",
          tags
        })
      });
    }
    likeIllust(illustId, token) {
      return this.getJSON("/ajax/illusts/like", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json; charset=utf-8",
          "x-csrf-token": token
        },
        body: JSON.stringify({
          illust_id: illustId
        })
      });
    }
    getFollowLatestWorks(page, mode = "all") {
      return this.getJSON(`/ajax/follow_latest/illust?p=${page}&mode=${mode}&lang=jp`);
    }
    getUserAllProfile(userId) {
      return this.getJSON("/ajax/user/" + userId + "/profile/all");
    }
    getUgoiraMeta(illustId) {
      return this.getJSON("/ajax/illust/" + illustId + "/ugoira_meta");
    }
    getUserData(userId) {
      return this.getJSON("/ajax/user/" + userId);
    }
    getSeriesData(seriesId, page) {
      return this.getJSON(`/ajax/series/${seriesId}?p=${page}`);
    }
  }
  const pixivApi = new PixivApi();
  const pixivParser = {
    async parse(illustId, param) {
      let illustData;
      let token;
      const { tagLang, type } = param;
      if (type === "api") {
        illustData = await pixivApi.getArtworkDetail(illustId, tagLang);
        token = "";
      } else if (type === "unlisted") {
        illustData = await pixivApi.getUnlistedArtworkDetail(illustId, tagLang);
        token = "";
      } else {
        const doc = await pixivApi.getArtworkDoc(illustId, tagLang);
        const preloadDataEl = doc.querySelector('meta[name="preload-data"]');
        const globalDataEl = doc.querySelector('meta[name="global-data"]');
        if (preloadDataEl && globalDataEl) {
          illustData = JSON.parse(preloadDataEl.content).illust[illustId];
          token = JSON.parse(globalDataEl.content).token;
        } else {
          const nextDataEL = doc.querySelector("script#__NEXT_DATA__");
          if (!nextDataEL) throw new Error("Cannot get csrf token.");
          const nextData = JSON.parse(nextDataEL.textContent);
          const preloadState = JSON.parse(
            nextData.props.pageProps.serverSerializedPreloadedState
          );
          token = preloadState.api.token;
          illustData = await pixivApi.getArtworkDetail(illustId, tagLang);
        }
      }
      const {
        id,
        illustType,
        userName,
        userId,
        illustTitle,
        illustComment,
        tags,
        pageCount,
        createDate,
        urls,
        bookmarkData,
        likeData,
        bookmarkCount
      } = illustData;
      const tagsArr = [];
      const tagsTranslatedArr = [];
      tags.tags.forEach((tagData) => {
        var _a;
        tagsArr.push(tagData.tag);
        tagsTranslatedArr.push(((_a = tagData.translation) == null ? undefined : _a.en) || tagData.tag);
      });
      const unescapeComment = illustComment.replaceAll(/&lt;|&amp;lt;/g, "<").replaceAll(/&gt;|&amp;gt;/g, ">");
      const p = document.createElement("p");
      p.innerHTML = unescapeComment;
      const comment2 = getElementText(p);
      const meta = {
        id,
        src: urls.original,
        extendName: urls.original.slice(-3),
        artist: userName,
        title: illustTitle,
        tags: tagsArr,
        tagsTranslated: tagsTranslatedArr,
        userId,
        comment: comment2,
        bookmarkData,
        createDate,
        likeData,
        token,
        bookmarkCount
      };
      if (illustType === IllustType.ugoira) {
        const ugoiraMeta = await pixivApi.getUgoiraMeta(illustId);
        const pageCount2 = ugoiraMeta.frames.length;
        const src = Array.from(
          { length: pageCount2 },
          (_, i) => meta.src.replace("ugoira0", "ugoira" + i)
        );
        const extendName = Array.from({ length: pageCount2 }).fill(meta.extendName);
        return {
          ...meta,
          src,
          extendName,
          illustType,
          ugoiraMeta
        };
      } else if (pageCount > 1) {
        const src = Array.from({ length: pageCount }, (_, i) => meta.src.replace("_p0", "_p" + i));
        const extendName = Array.from({ length: pageCount }).fill(meta.extendName);
        return {
          ...meta,
          src,
          extendName,
          illustType
        };
      } else {
        return {
          ...meta,
          illustType
        };
      }
    },
    async *illustMangaGenerator(pageRange, checkValidity, userId) {
      const ARTWORKS_PER_PAGE = 48;
      const profile = await pixivApi.getUserAllProfile(userId);
      let ids = [];
      typeof profile.illusts === "object" && ids.push(...Object.keys(profile.illusts));
      typeof profile.manga === "object" && ids.push(...Object.keys(profile.manga));
      if (!ids.length) throw new Error(`User ${userId} has no illusts or mangas.`);
      ids = ids.sort((a, b) => Number(b) - Number(a));
      let sliceStart;
      let sliceEnd;
      const [startPage = null, endPage = null] = pageRange ?? [];
      let page = startPage ?? 1;
      startPage === null ? sliceStart = 0 : sliceStart = (startPage - 1) * ARTWORKS_PER_PAGE;
      endPage === null ? sliceEnd = ids.length : sliceEnd = endPage * ARTWORKS_PER_PAGE;
      const selectedIds = ids.slice(sliceStart, sliceEnd);
      if (!selectedIds.length) throw new RangeError(`Page ${page} exceeds the limit.`);
      const baseUrl = `https://www.pixiv.net/ajax/user/${userId}/profile/illusts?`;
      const total = selectedIds.length;
      do {
        const chunk = selectedIds.splice(0, ARTWORKS_PER_PAGE);
        const queryStr = chunk.map((id) => "ids[]=" + id).join("&") + `&work_category=illustManga&is_first_page=0&lang=ja`;
        const data = await pixivApi.getJSON(baseUrl + queryStr);
        const workDatas = Object.values(data.works).sort((a, b) => Number(b.id) - Number(a.id));
        const avaliable = [];
        const invalid = [];
        const unavaliable = [];
        for (let i = 0; i < workDatas.length; i++) {
          const work = workDatas[i];
          const { id, isMasked } = work;
          if (isMasked) {
            unavaliable.push(String(id));
            continue;
          }
          const isValid = await checkValidity(work);
          isValid ? avaliable.push(id) : invalid.push(id);
        }
        yield {
          total,
          page,
          avaliable,
          invalid,
          unavaliable
        };
        page++;
      } while (selectedIds.length > 0);
    },
    async *chunkGenerator(pageRange, checkValidity, userId, category, tag, bookmarkRest = "show") {
      const ARTWORKS_PER_PAGE = 48;
      const [startPage = null, endPage = null] = pageRange ?? [];
      if (!userId) throw new Error('Require argument "userId".');
      let offset;
      let offsetEnd;
      let total;
      let page = startPage ?? 1;
      startPage === null ? offset = 0 : offset = (startPage - 1) * ARTWORKS_PER_PAGE;
      do {
        let requestUrl;
        if (category === "bookmarks") {
          requestUrl = `/ajax/user/${userId}/illusts/bookmarks?tag=${tag}&offset=${offset}&limit=${ARTWORKS_PER_PAGE}&rest=${bookmarkRest}&lang=ja`;
        } else {
          requestUrl = `/ajax/user/${userId}/${category}/tag?tag=${tag}&offset=${offset}&limit=${ARTWORKS_PER_PAGE}&lang=ja`;
        }
        const userPageData = await pixivApi.getJSON(requestUrl);
        const { works, total: totalArtwork } = userPageData;
        if (totalArtwork === 0)
          throw new Error(`User ${userId} has no ${category} tagged with ${tag}.`);
        if (!offsetEnd) {
          endPage === null ? offsetEnd = totalArtwork : offsetEnd = endPage * ARTWORKS_PER_PAGE > totalArtwork ? totalArtwork : endPage * ARTWORKS_PER_PAGE;
          if (offsetEnd <= offset) throw new RangeError(`Page ${page} exceeds the limit.`);
          total = offsetEnd - offset;
        }
        const avaliable = [];
        const invalid = [];
        const unavaliable = [];
        for (let i = 0; i < works.length; i++) {
          const work = works[i];
          const { id, isMasked } = work;
          if (isMasked) {
            unavaliable.push(String(id));
            continue;
          }
          const isValid = await checkValidity(work);
          isValid ? avaliable.push(id) : invalid.push(id);
        }
        yield {
          total,
          page,
          avaliable,
          invalid,
          unavaliable
        };
        page++;
      } while ((offset += ARTWORKS_PER_PAGE) < offsetEnd);
    },
    async *bookmarkGenerator(pageRange, checkValidity, userId, bookmarkRest = "show", tag = "") {
      yield* this.chunkGenerator(pageRange, checkValidity, userId, "bookmarks", tag, bookmarkRest);
    },
    async *taggedArtworkGenerator(pageRange, checkValidity, userId, category, tag, bookmarkRest = "show") {
      if (category === "bookmarks") {
        yield* this.bookmarkGenerator(pageRange, checkValidity, userId, bookmarkRest, tag);
      } else {
        yield* this.chunkGenerator(pageRange, checkValidity, userId, category, tag);
      }
    },
    async *followLatestGenerator(pageRange, checkValidity, mode = "all") {
      const PAGE_LIMIT = 34;
      const ARTWORKS_PER_PAGE = 60;
      let [startPage = null, endPage = null] = pageRange ?? [];
      startPage === null && (startPage = 1);
      (endPage === null || endPage > PAGE_LIMIT) && (endPage = PAGE_LIMIT);
      if (startPage > PAGE_LIMIT) throw new RangeError(`Page ${startPage} exceeds the limit.`);
      let earliestId;
      let total;
      let cache;
      let page = startPage;
      function findEarliestId(ids2) {
        return Math.min(...ids2);
      }
      async function* yieldData(data2, page2) {
        const avaliable = [];
        const invalid = [];
        const unavaliable = [];
        const { illust } = data2.thumbnails;
        for (let i = 0; i < illust.length; i++) {
          const work = illust[i];
          const { id, isMasked } = work;
          if (isMasked) {
            unavaliable.push(String(id));
            continue;
          }
          const isValid = await checkValidity(work);
          isValid ? avaliable.push(id) : invalid.push(id);
        }
        const { ids: ids2 } = data2.page;
        if (ids2.length !== illust.length) {
          const idDiff = ids2.filter((id) => !illust.some((item) => +item.id === id));
          unavaliable.push(...idDiff.map((id) => String(id)));
        }
        yield {
          total,
          page: page2,
          avaliable,
          invalid,
          unavaliable
        };
      }
      const data = await pixivApi.getFollowLatestWorks(page, mode);
      const ids = data.page.ids;
      total = ids.length;
      earliestId = findEarliestId(ids);
      if (endPage === startPage) {
        yield* yieldData(data, startPage);
        return;
      }
      if (total === ARTWORKS_PER_PAGE) {
        const secondPageData = await pixivApi.getFollowLatestWorks(++page, mode);
        const secondIds = secondPageData.page.ids;
        const secondPageEarliestId = findEarliestId(secondIds);
        if (secondPageEarliestId < earliestId) {
          earliestId = secondPageEarliestId;
          cache = secondPageData;
          total += secondIds.length;
        }
      }
      yield* yieldData(data, startPage);
      if (total === ARTWORKS_PER_PAGE) return;
      if (total < ARTWORKS_PER_PAGE * 2 || endPage - startPage === 1) {
        yield* yieldData(cache, page);
        return;
      }
      while (++page <= endPage) {
        const data2 = await pixivApi.getFollowLatestWorks(page, mode);
        const ids2 = data2.page.ids;
        const pageEarliestId = findEarliestId(ids2);
        if (pageEarliestId >= earliestId) {
          logger.info("getFollowLatestGenerator: got duplicate works");
          yield* yieldData(cache, page - 1);
          break;
        }
        earliestId = pageEarliestId;
        total += ids2.length;
        yield* yieldData(cache, page - 1);
        cache = data2;
      }
      yield* yieldData(cache, page - 1);
    },
    async *seriesGenerator(pageRange, checkValidity, seriesId) {
      const [startPage = 1, endPage = 0] = pageRange ?? [];
      let yieldedId = 0;
      let total = 0;
      let currentPage = startPage;
      do {
        const seriesData = await pixivApi.getSeriesData(seriesId, currentPage);
        const { series } = seriesData.page;
        if (!series.length) throw new Error(`Invalid page: ${currentPage}`);
        const { illust } = seriesData.thumbnails;
        if (!total) {
          const isLastPage = series.some(({ order }) => order === 1);
          const totalWorkCount = seriesData.page.total;
          if (isLastPage) {
            total = series.length;
          } else if (endPage === 0) {
            total = totalWorkCount;
          } else {
            const artworksPerPage = series.length;
            const lastPage = Math.ceil(totalWorkCount / artworksPerPage);
            if (endPage >= lastPage) {
              const lastPageWorkCount = totalWorkCount % artworksPerPage || artworksPerPage;
              total = (lastPage - startPage) * artworksPerPage + lastPageWorkCount;
            } else {
              total = (endPage - startPage + 1) * artworksPerPage;
            }
          }
        }
        const avaliable = [];
        const invalid = [];
        const unavaliable = [];
        for (let i = 0; i < series.length; i++) {
          const { workId } = series[i];
          const thumbnail = illust.find((thumbnail2) => thumbnail2.id === workId);
          if (!thumbnail || thumbnail.isMasked) {
            unavaliable.push(workId);
            continue;
          }
          const isValid = await checkValidity(thumbnail);
          isValid ? avaliable.push(workId) : invalid.push(workId);
        }
        yield {
          total,
          page: currentPage,
          avaliable,
          invalid,
          unavaliable
        };
        yieldedId += series.length;
        currentPage++;
      } while (yieldedId < total);
    }
  };
  function getSelfId() {
    var _a, _b;
    return ((_b = (_a = _unsafeWindow.dataLayer) == null ? undefined : _a[0]) == null ? undefined : _b.user_id) ?? "";
  }
  function getIllustId(node) {
    const isLinkToArtworksPage = regexp.artworksPage.exec(node.getAttribute("href") || "");
    if (isLinkToArtworksPage) {
      if (node.getAttribute("data-gtm-value") || [
        "gtm-illust-recommend-node-node",
        "gtm-discover-user-recommend-node",
        "work",
        "_history-item",
        "_history-related-item"
      ].some((className) => node.classList.contains(className))) {
        return isLinkToArtworksPage[1];
      }
    } else if (node instanceof HTMLSpanElement && node.className.includes("_history-item")) {
      const img = node.querySelector("img");
      if (!img) return "";
      const matchPid = regexp.historyThumbnailsId.exec(img.src);
      if (matchPid) return matchPid[0];
    } else {
      const isActivityThumb = regexp.activityHref.exec(node.getAttribute("href") || "");
      if (isActivityThumb && node.classList.contains("work")) {
        return isActivityThumb[1];
      }
    }
    return "";
  }
  function createThumbnailBtn(nodes, downloadArtwork) {
    let isSelfBookmark = false;
    const inBookmarkPage = regexp.bookmarkPage.exec(location.pathname);
    inBookmarkPage && inBookmarkPage[1] === getSelfId() && (isSelfBookmark = true);
    nodes.forEach((e) => {
      let illustId;
      let type;
      if ((e.childElementCount !== 0 || e.className.includes("_history-item") || e.className.includes("_history-related-item")) && !e.querySelector(ThumbnailButton.tagNameLowerCase) && (illustId = getIllustId(e))) {
        if (isSelfBookmark) {
          type = ThumbnailBtnType.PixivMyBookmark;
        } else if (e.className.includes("_history-related-item")) {
          e.style.position = "relative";
          type = ThumbnailBtnType.PixivHistory;
        } else if (e.className.includes("_history-item")) {
          type = ThumbnailBtnType.PixivHistory;
        }
        const btn2 = new ThumbnailButton({
          id: illustId,
          type,
          onClick: downloadArtwork
        });
        e.appendChild(btn2);
      }
    });
  }
  function fixPixivPreviewer(nodes) {
    if (!regexp.searchPage.test(location.pathname)) return;
    nodes.forEach((node) => {
      var _a;
      (_a = node.querySelector(ThumbnailButton.tagNameLowerCase)) == null ? undefined : _a.remove();
    });
  }
  function createToolbarBtn(id, downloadArtwork) {
    const toolbar = document.querySelector("main section section");
    if (!toolbar || toolbar.querySelector(ThumbnailButton.tagNameLowerCase)) return;
    const btn2 = new ThumbnailButton({
      id,
      type: ThumbnailBtnType.PixivToolbar,
      onClick: downloadArtwork
    });
    const pdlBtnWrap = toolbar.lastElementChild.cloneNode();
    pdlBtnWrap.appendChild(btn2);
    toolbar.appendChild(pdlBtnWrap);
  }
  function createWorkExpanedViewBtn(id, downloadArtwork, unlistedId) {
    const works = document.querySelectorAll(
      "figure a.gtm-expand-full-size-illust"
    );
    if (works.length < 2) return;
    works.forEach((work, idx) => {
      var _a;
      const container = (_a = work.parentElement) == null ? undefined : _a.parentElement;
      if (!container || container.querySelector(ArtworkButton.tagNameLowerCase)) return;
      container.appendChild(
        new ArtworkButton({
          id,
          page: idx,
          extraData: unlistedId ? { unlistedId } : undefined,
          onClick: downloadArtwork
        })
      );
    });
  }
  let observer;
  let btn;
  function createPresentationBtn(id, downloadArtwork, unlistedId) {
    const containers = document.querySelector("body > [role='presentation'] div[class]");
    if (!containers) {
      if (observer) {
        observer.disconnect();
        observer = null;
        btn = null;
      }
      return;
    }
    if (containers.querySelector(ThumbnailButton.tagNameLowerCase)) return;
    const img = containers.querySelector("div > img");
    if (!img) return;
    const isOriginImg = regexp.originSrcPageNum.exec(img.src);
    if (!isOriginImg) return;
    const [pageNum] = isOriginImg;
    btn = new ThumbnailButton({
      id,
      type: ThumbnailBtnType.PixivPresentation,
      page: Number(pageNum),
      extraData: unlistedId ? { unlistedId } : undefined,
      onClick: downloadArtwork
    });
    containers.appendChild(btn);
    observer = new MutationObserver((mutationList) => {
      const newImg = mutationList[1]["addedNodes"][0];
      const [pageNum2] = regexp.originSrcPageNum.exec(newImg.src) ?? [];
      if (!pageNum2) return logger.throw("Invalid image element.");
      btn == null ? undefined : btn.remove();
      btn = new ThumbnailButton({
        id,
        type: ThumbnailBtnType.PixivPresentation,
        page: Number(pageNum2),
        extraData: unlistedId ? { unlistedId } : undefined,
        onClick: downloadArtwork
      });
      containers.appendChild(btn);
    });
    observer.observe(img.parentElement, { childList: true, subtree: true });
  }
  function createPreviewModalBtn(id, downloadArtwork, unlistedId) {
    var _a;
    const illustModalBtn = document.querySelector(
      ".gtm-manga-viewer-preview-modal-open:not(.pdl-listened)"
    );
    const mangaModalBtn = document.querySelector(".gtm-manga-viewer-open-preview:not(.pdl-listened)");
    const mangaViewerModalBtn = (_a = document.querySelectorAll(
      ".gtm-manga-viewer-close-icon:not(.pdl-listened)"
    )) == null ? undefined : _a[1];
    if (!illustModalBtn && !mangaModalBtn && !mangaViewerModalBtn) return;
    [illustModalBtn, mangaModalBtn, mangaViewerModalBtn].forEach((node) => {
      if (node) {
        node.classList.add("pdl-listened");
        node.addEventListener("click", () => {
          handleModalClick(id, downloadArtwork, unlistedId);
        });
      }
    });
  }
  function handleModalClick(id, downloadArtwork, unlistedId) {
    const timer = setInterval(() => {
      logger.info("Start to find modal.");
      const ulList = document.querySelectorAll("ul");
      const previewList = ulList[ulList.length - 1];
      if (getComputedStyle(previewList).display !== "grid") return;
      clearInterval(timer);
      previewList.childNodes.forEach((node, idx) => {
        node.style.position = "relative";
        node.appendChild(
          new ThumbnailButton({
            id,
            page: idx,
            extraData: unlistedId ? { unlistedId } : undefined,
            onClick: downloadArtwork
          })
        );
      });
    }, 300);
  }
  function createMangaViewerBtn(id, downloadArtwork, unlistedId) {
    const mangaViewerBackBtn = document.querySelector(".gtm-manga-viewer-close-icon");
    if (!mangaViewerBackBtn) return;
    const container = mangaViewerBackBtn.parentElement;
    if (!container || container.querySelector(ThumbnailButton.tagNameLowerCase)) return;
    container.appendChild(
      new ThumbnailButton({
        id,
        type: ThumbnailBtnType.PixivMangaViewer,
        extraData: unlistedId ? { unlistedId } : undefined,
        onClick: downloadArtwork
      })
    );
  }
  const toolbarStyle = ".button-wrapper{display:flex;justify-content:flex-end;align-items:center;height:32px;padding:8px 12px}";
  class UnlistedArtworkToolbar extends HTMLElement {
    constructor(props) {
      super();
      __publicField(this, "props");
      this.props = props;
    }
    static get tagNameLowerCase() {
      return "pdl-unlisted-artwork-toolbar";
    }
    render() {
      if (this.shadowRoot) return;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `<style>${toolbarStyle}</style><div class="button-wrapper"></div>`;
      const thumbnailButton = new ThumbnailButton({
        ...this.props,
        type: ThumbnailBtnType.PixivToolbar
      });
      const wrapper = shadowRoot.querySelector(".button-wrapper");
      wrapper.appendChild(thumbnailButton);
    }
    connectedCallback() {
      this.render();
    }
  }
  customElements.define(UnlistedArtworkToolbar.tagNameLowerCase, UnlistedArtworkToolbar);
  function createUnlistedToolbar(id, downloadArtwork, unlistedId) {
    const toolbar = document.querySelector(UnlistedArtworkToolbar.tagNameLowerCase);
    if (toolbar) return;
    const container = document.querySelector('div[style^="transform: translateY"]');
    if (!container) return;
    const el = new UnlistedArtworkToolbar({
      id,
      onClick: downloadArtwork,
      extraData: {
        unlistedId
      }
    });
    container.appendChild(el);
    const showAllBtn = container.querySelector(
      'button[type="button"]:not([style])'
    );
    showAllBtn && (showAllBtn.style.bottom = "48px");
  }
  class TagListButton extends HTMLElement {
    constructor(tagUrl, downloading, handleDownload) {
      super();
      __publicField(this, "btn");
      __publicField(this, "unsubscriber");
      this.tagUrl = tagUrl;
      this.downloading = downloading;
      this.handleDownload = handleDownload;
      this.dispatchDownload = this.dispatchDownload.bind(this);
    }
    static get tagNameLowerCase() {
      return "pdl-tag-list-button";
    }
    async render() {
      if (this.shadowRoot) return;
      const shadowRoot = this.attachShadow({ mode: "open" });
      addStyleToShadow(shadowRoot);
      shadowRoot.innerHTML = ` 
  <div class=" flex items-center">    
    <hr class="!border-t-0 border-l h-6 ml-4 mr-2" />
    <button class=" h-[38px] w-[38px] btn-icon [&:not([disabled])]:hover:bg-slate-400/30 disabled:cursor-wait disabled:opacity-70">
      <i class="text-sm w-6 fill-current mx-2">
      ${downloadSvg}
      </i>
    </button>
  </div>
  `;
    }
    getTagProps() {
      const url = new URL(this.tagUrl);
      const { searchParams, pathname } = url;
      const extractUrlMatch = regexp.userPageTags.exec(pathname);
      if (!extractUrlMatch) throw new Error(`Could not extract tag props from: ${pathname}`);
      const [, userId, urlCategory, tag] = extractUrlMatch;
      if (!tag) throw new Error(`Could not extract tag from: ${pathname}`);
      let category;
      if (urlCategory === "illustrations" || urlCategory === "artworks") {
        category = "illusts";
      } else {
        category = urlCategory;
      }
      return {
        userId,
        category,
        tag,
        rest: searchParams.get("rest") === "hide" ? "hide" : "show"
      };
    }
    dispatchDownload(evt) {
      evt == null ? undefined : evt.preventDefault();
      this.handleDownload(this.getTagProps()).catch(logger.error);
    }
    connectedCallback() {
      this.render();
      this.btn ?? (this.btn = this.shadowRoot.querySelector("button"));
      this.btn.addEventListener("click", this.dispatchDownload);
      this.unsubscriber = this.downloading.subscribe((val) => {
        if (val) {
          this.setAttribute("disabled", "");
        } else {
          this.removeAttribute("disabled");
        }
      });
    }
    disconnectedCallback() {
      var _a, _b;
      (_a = this.unsubscriber) == null ? undefined : _a.call(this);
      (_b = this.btn) == null ? undefined : _b.removeEventListener("click", this.dispatchDownload);
    }
    static get observedAttributes() {
      return ["disabled"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      var _a, _b;
      if (typeof newValue === "string") {
        (_a = this.btn) == null ? undefined : _a.setAttribute("disabled", "");
      } else {
        (_b = this.btn) == null ? undefined : _b.removeAttribute("disabled");
      }
    }
  }
  customElements.define(TagListButton.tagNameLowerCase, TagListButton);
  function createTagListBtn(downloading, handleDownload) {
    var _a;
    const listContainer = document.querySelector('div[style*="position: relative"]');
    if (!listContainer) return;
    const modalRoot = listContainer == null ? undefined : listContainer.closest('div[role="presentation"], div[class="charcoal-token"]');
    const closeBtn = (_a = modalRoot == null ? undefined : modalRoot.querySelector("svg")) == null ? undefined : _a.parentElement;
    const tagElements = listContainer.querySelectorAll(
      'div[style*="position: absolute"] a'
    );
    tagElements.forEach((ele) => {
      if (ele.querySelector(TagListButton.tagNameLowerCase)) return;
      const btn2 = new TagListButton(ele.href, downloading, (props) => {
        closeBtn == null ? undefined : closeBtn.click();
        return handleDownload(props);
      });
      ele.appendChild(btn2);
    });
  }
  class ArtworkTagButton extends HTMLElement {
    constructor(tagElement, downloading, handleDownload) {
      super();
      __publicField(this, "btn");
      __publicField(this, "ob");
      __publicField(this, "unsubscriber");
      this.tagElement = tagElement;
      this.downloading = downloading;
      this.handleDownload = handleDownload;
      this.dispatchDownload = this.dispatchDownload.bind(this);
      this.ob = new MutationObserver(() => {
        this.changeBtnColor();
      });
    }
    static get tagNameLowerCase() {
      return "pdl-artwork-tag";
    }
    // 为了美观
    resetTagStyle() {
      this.tagElement.style.borderTopRightRadius = "0px";
      this.tagElement.style.borderBottomRightRadius = "0px";
    }
    changeBtnColor() {
      if (!this.btn) return;
      const { color, backgroundColor } = getComputedStyle(this.tagElement);
      this.btn.style.color = color;
      this.btn.style.backgroundColor = backgroundColor;
    }
    async render() {
      if (this.shadowRoot) return;
      const shadowRoot = this.attachShadow({ mode: "open" });
      addStyleToShadow(shadowRoot);
      shadowRoot.innerHTML = `  <button class="flex h-full items-center pr-2 rounded-e-[4px] disabled:cursor-wait disabled:opacity-70">
    <hr class="!border-t-0 border-l h-6 pr-2" />
    <i class="text-sm w-6 fill-current">
      ${downloadSvg}
    </i>
  </button>`;
      this.resetTagStyle();
    }
    getTagProps() {
      const tagTitles = this.tagElement.querySelectorAll("div[title]");
      const tagStr = tagTitles[tagTitles.length - 1].getAttribute("title");
      const tag = tagStr.startsWith("#") ? tagStr.slice(1) : "未分類";
      const url = new URL(this.tagElement.href);
      const { searchParams, pathname } = url;
      const extractUrlMatch = regexp.userPageTags.exec(pathname);
      if (!extractUrlMatch) throw new Error(`Could not extract tag props from: ${pathname}`);
      const [, userId, urlCategory] = extractUrlMatch;
      let category;
      if (urlCategory === "illustrations" || urlCategory === "artworks") {
        category = "illusts";
      } else {
        category = urlCategory;
      }
      return {
        userId,
        category,
        tag,
        rest: searchParams.get("rest") === "hide" ? "hide" : "show"
      };
    }
    dispatchDownload() {
      this.handleDownload(this.getTagProps()).catch(logger.error);
    }
    connectedCallback() {
      this.render();
      this.btn ?? (this.btn = this.shadowRoot.querySelector("button"));
      this.changeBtnColor();
      this.btn.addEventListener("click", this.dispatchDownload);
      this.unsubscriber = this.downloading.subscribe((val) => {
        if (val) {
          this.setAttribute("disabled", "");
        } else {
          this.removeAttribute("disabled");
        }
      });
      this.ob.observe(this.tagElement, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }
    disconnectedCallback() {
      var _a, _b;
      (_a = this.unsubscriber) == null ? undefined : _a.call(this);
      (_b = this.btn) == null ? undefined : _b.removeEventListener("click", this.dispatchDownload);
      this.ob.disconnect();
    }
    static get observedAttributes() {
      return ["disabled"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      var _a, _b;
      if (typeof newValue === "string") {
        (_a = this.btn) == null ? undefined : _a.setAttribute("disabled", "");
      } else {
        (_b = this.btn) == null ? undefined : _b.removeAttribute("disabled");
      }
    }
  }
  customElements.define(ArtworkTagButton.tagNameLowerCase, ArtworkTagButton);
  function createFrequentTagBtn(downloading, handleDownload) {
    const tagsEles = Array.from(document.querySelectorAll("a[status]"));
    if (!tagsEles.length) return;
    tagsEles.forEach((ele) => {
      var _a;
      if (((_a = ele.nextElementSibling) == null ? undefined : _a.tagName.toLowerCase()) === ArtworkTagButton.tagNameLowerCase) return;
      const artworkTagBtn = new ArtworkTagButton(ele, downloading, handleDownload);
      ele.parentElement.appendChild(artworkTagBtn);
    });
  }
  const gifWorker = (() => GM_getResourceText("gif.js/dist/gif.worker?raw"))();
  const workerUrl$2 = URL.createObjectURL(new Blob([gifWorker], { type: "text/javascript" }));
  function isBlobArray$2(frames2) {
    return frames2[0] instanceof Blob;
  }
  async function gif(frames2, delays, signal, onProgress) {
    signal == null ? undefined : signal.throwIfAborted();
    if (isBlobArray$2(frames2)) {
      frames2 = await Promise.all(frames2.map((frame) => createImageBitmap(frame)));
    }
    signal == null ? undefined : signal.throwIfAborted();
    const canvas = document.createElement("canvas");
    const width = canvas.width = frames2[0].width;
    const height = canvas.height = frames2[0].height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let resolveConvert;
    let rejectConvert;
    const convertPromise = new Promise((resolve, reject) => {
      resolveConvert = resolve;
      rejectConvert = reject;
    });
    const gif2 = new GIF({
      workers: 2,
      quality: config.get("gifQuality"),
      width,
      height,
      workerScript: workerUrl$2
    });
    gif2.on("progress", (progress) => {
      onProgress == null ? undefined : onProgress(progress * 100);
    });
    gif2.on("abort", () => {
      rejectConvert(signal == null ? undefined : signal.reason);
    });
    gif2.on("finished", (gifBlob) => {
      resolveConvert(gifBlob);
    });
    signal == null ? undefined : signal.addEventListener(
      "abort",
      () => {
        gif2.abort();
      },
      { once: true }
    );
    frames2.forEach((bitmap, i) => {
      ctx.drawImage(bitmap, 0, 0);
      gif2.addFrame(ctx, {
        copy: true,
        delay: delays[i]
      });
      bitmap.close();
    });
    gif2.render();
    return convertPromise;
  }
  const pngWorkerFragment = 'function isBlobArray(frames) {\n    return frames[0] instanceof Blob;\n}\nasync function encodeAPNG(frames, delays, cnum) {\n    if (isBlobArray(frames)) {\n        frames = await Promise.all(frames.map((frame) => createImageBitmap(frame)));\n    }\n    const width = frames[0].width;\n    const height = frames[0].height;\n    const canvas = new OffscreenCanvas(width, height);\n    const ctx = canvas.getContext("2d", { willReadFrequently: true });\n    const u8arrs = [];\n    for (const frame of frames) {\n        ctx.drawImage(frame, 0, 0);\n        frame.close();\n        u8arrs.push(ctx.getImageData(0, 0, width, height).data);\n    }\n    const png = UPNG.encode(u8arrs, width, height, cnum, delays, { loop: 0 });\n    if (!png)\n        throw new Error("Failed to encode apng.");\n    return png;\n}\nfunction decodeApng(ab) {\n    const img = UPNG.decode(ab);\n    const rgba = UPNG.toRGBA8(img);\n    const { width, height } = img;\n    const delays = img.frames.map((frame) => frame.delay);\n    return { frames: rgba, delays, width, height };\n}\nasync function appendEffect(illustBlob, effect) {\n    const illustBitmap = await createImageBitmap(illustBlob);\n    const { frames: effectFrames, delays, width, height } = decodeApng(effect);\n    const effectBitmaps = await Promise.all(effectFrames.map((buf) => createImageBitmap(new ImageData(new Uint8ClampedArray(buf), width, height))));\n    const { width: illustWidth, height: illustHeight } = illustBitmap;\n    const illustAspectRatio = illustWidth / illustHeight;\n    const effectAspectRatio = width / height;\n    let dx;\n    let dy;\n    let dWidth;\n    let dHeight;\n    if (effectAspectRatio > illustAspectRatio) {\n        dWidth = illustHeight * effectAspectRatio;\n        dHeight = illustHeight;\n        dx = (illustWidth - dWidth) / 2;\n        dy = 0;\n    }\n    else {\n        dWidth = illustWidth;\n        dHeight = illustWidth / effectAspectRatio;\n        dx = 0;\n        dy = (illustHeight - dHeight) / 2;\n    }\n    const canvas = new OffscreenCanvas(illustWidth, illustHeight);\n    const ctx = canvas.getContext("2d", { willReadFrequently: true });\n    const finalDatas = [];\n    for (const effectBitmap of effectBitmaps) {\n        ctx.drawImage(illustBitmap, 0, 0);\n        ctx.drawImage(effectBitmap, dx, dy, dWidth, dHeight);\n        finalDatas.push(ctx.getImageData(0, 0, illustWidth, illustHeight));\n        effectBitmap.close();\n    }\n    illustBitmap.close();\n    const result = finalDatas.map((data) => createImageBitmap(data));\n    return {\n        frames: await Promise.all(result),\n        delays\n    };\n}\nself.onmessage = async (evt) => {\n    try {\n        const data = evt.data;\n        if ("effect" in data) {\n            const { illust, effect } = data;\n            const result = await appendEffect(illust, effect);\n            self.postMessage(result, [...result.frames]);\n        }\n        else {\n            const { frames, delays, cnum = 256 } = data;\n            const apng = await encodeAPNG(frames, delays, cnum);\n            self.postMessage(apng, [apng]);\n        }\n    }\n    catch (error) {\n        console.error(error);\n        self.postMessage(void 0);\n    }\n};\n';
  const UPNG = (() => GM_getResourceText("upng-js?raw"))();
  const pako = (() => GM_getResourceText("pako/dist/pako.js?raw"))();
  const workerUrl$1 = URL.createObjectURL(
    new Blob(
      [
        pngWorkerFragment + pako + UPNG.replace("window.UPNG", "self.UPNG").replace("window.pako", "self.pako")
      ],
      {
        type: "text/javascript"
      }
    )
  );
  const freeApngWorkers = [];
  async function png(frames2, delays, signal) {
    signal == null ? undefined : signal.throwIfAborted();
    let resolveConvert;
    let rejectConvert;
    const convertPromise = new Promise((resolve, reject) => {
      resolveConvert = resolve;
      rejectConvert = reject;
    });
    let worker;
    if (freeApngWorkers.length) {
      worker = freeApngWorkers.shift();
      logger.info("Reuse apng workers.");
    } else {
      worker = new Worker(workerUrl$1);
    }
    signal == null ? undefined : signal.addEventListener(
      "abort",
      () => {
        worker.terminate();
        rejectConvert(signal == null ? undefined : signal.reason);
      },
      { once: true }
    );
    worker.onmessage = function(e) {
      freeApngWorkers.push(worker);
      if (signal == null ? undefined : signal.aborted) return;
      if (!e.data) {
        return rejectConvert(new TypeError("Failed to get png data."));
      }
      const pngBlob = new Blob([e.data], { type: "image/png" });
      resolveConvert(pngBlob);
    };
    const cfg = { frames: frames2, delays, cnum: config.get("pngColor") };
    worker.postMessage(
      cfg,
      cfg.frames[0] instanceof ImageBitmap ? cfg.frames : []
    );
    return convertPromise;
  }
  function mixPngEffect(illust, seasonalEffect, signal) {
    signal == null ? undefined : signal.throwIfAborted();
    let resolveConvert;
    let rejectConvert;
    const convertPromise = new Promise((resolve, reject) => {
      resolveConvert = resolve;
      rejectConvert = reject;
    });
    let worker;
    if (freeApngWorkers.length) {
      worker = freeApngWorkers.shift();
      logger.info("Reuse apng workers.");
    } else {
      worker = new Worker(workerUrl$1);
    }
    signal == null ? undefined : signal.addEventListener("abort", () => {
      worker.terminate();
      rejectConvert(signal == null ? undefined : signal.reason);
    });
    worker.onmessage = function(e) {
      worker.terminate();
      if (!e.data) {
        return rejectConvert(new Error("Mix Effect convert Failed."));
      }
      resolveConvert(e.data);
    };
    const cfg = { illust, effect: seasonalEffect };
    worker.postMessage(cfg, [seasonalEffect]);
    return convertPromise;
  }
  const webpWorkerFragment = 'let resolveModule;\nconst moduleLoaded = new Promise((resolve) => {\n    resolveModule = resolve;\n});\nlet webpApi = {};\nModule.onRuntimeInitialized = () => {\n    webpApi = {\n        init: Module.cwrap("init", "", ["number", "number", "number"]),\n        createBuffer: Module.cwrap("createBuffer", "number", ["number"]),\n        addFrame: Module.cwrap("addFrame", "number", ["number", "number", "number"]),\n        generate: Module.cwrap("generate", "number", []),\n        freeResult: Module.cwrap("freeResult", "", []),\n        getResultPointer: Module.cwrap("getResultPointer", "number", []),\n        getResultSize: Module.cwrap("getResultSize", "number", [])\n    };\n    resolveModule();\n};\nfunction isBlobArray(frames) {\n    return frames[0] instanceof Blob;\n}\nonmessage = async (evt) => {\n    await moduleLoaded;\n    const { frames, delays, lossless = 0, quality = 95, method = 4 } = evt.data;\n    webpApi.init(lossless, quality, method);\n    const bitmaps = isBlobArray(frames) ? await Promise.all(frames.map((frame) => createImageBitmap(frame))) : frames;\n    const width = bitmaps[0].width;\n    const height = bitmaps[0].height;\n    const canvas = new OffscreenCanvas(width, height);\n    const ctx = canvas.getContext("2d");\n    for (let i = 0; i < bitmaps.length; i++) {\n        ctx?.drawImage(bitmaps[i], 0, 0);\n        bitmaps[i].close();\n        const webpBlob = await canvas.convertToBlob({\n            type: "image/webp",\n            quality: lossless ? 1 : quality / 100\n        });\n        const buffer = await webpBlob.arrayBuffer();\n        const u8a = new Uint8Array(buffer);\n        const pointer = webpApi.createBuffer(u8a.length);\n        Module.HEAPU8.set(u8a, pointer);\n        webpApi.addFrame(pointer, u8a.length, delays[i]);\n        postMessage((i + 1) / bitmaps.length * 100);\n    }\n    webpApi.generate();\n    const resultPointer = webpApi.getResultPointer();\n    const resultSize = webpApi.getResultSize();\n    const result = new Uint8Array(Module.HEAP8.buffer, resultPointer, resultSize);\n    postMessage(result);\n    webpApi.freeResult();\n};\n';
  const webpWasm = (() => GM_getResourceText("../wasm/toWebpWorker?raw"))();
  const workerUrl = URL.createObjectURL(
    new Blob([webpWasm + webpWorkerFragment], { type: "text/javascript" })
  );
  const freeWebpWorkers = [];
  async function webp(frames2, delays, signal, onProgress) {
    signal == null ? undefined : signal.throwIfAborted();
    let worker;
    if (freeWebpWorkers.length) {
      worker = freeWebpWorkers.shift();
      logger.info("Reuse webp workers.");
    } else {
      worker = new Worker(workerUrl);
    }
    let resolveConvert;
    let rejectConvert;
    const convertPromise = new Promise((resolve, reject) => {
      resolveConvert = resolve;
      rejectConvert = reject;
    });
    signal == null ? undefined : signal.addEventListener(
      "abort",
      () => {
        worker.terminate();
        rejectConvert(signal == null ? undefined : signal.reason);
      },
      { once: true }
    );
    worker.onmessage = (evt) => {
      if (signal == null ? undefined : signal.aborted) return;
      const data = evt.data;
      if (typeof data !== "object") {
        onProgress == null ? undefined : onProgress(evt.data);
      } else {
        freeWebpWorkers.push(worker);
        resolveConvert(new Blob([evt.data], { type: "image/webp" }));
      }
    };
    worker.postMessage(
      {
        frames: frames2,
        delays,
        lossless: Number(config.get("losslessWebp")),
        quality: config.get("webpQuality"),
        method: config.get("webpMehtod")
      },
      frames2[0] instanceof ImageBitmap ? frames2 : []
    );
    return convertPromise;
  }
  function isBlobArray$1(frames2) {
    return frames2[0] instanceof Blob;
  }
  async function webm(frames2, delays, signal) {
    signal == null ? undefined : signal.throwIfAborted();
    if (isBlobArray$1(frames2)) {
      frames2 = await Promise.all(frames2.map((frame) => createImageBitmap(frame)));
    }
    signal == null ? undefined : signal.throwIfAborted();
    const width = frames2[0].width;
    const height = frames2[0].height;
    const muxer = new webmMuxer.Muxer({
      target: new webmMuxer.ArrayBufferTarget(),
      video: {
        codec: "V_VP9",
        width,
        height
      }
    });
    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => logger.error(e)
    });
    videoEncoder.configure({
      codec: "vp09.00.51.08.01.01.01.01.00",
      width,
      height,
      bitrate: config.get("webmBitrate") * 1e6
    });
    let timestamp = 0;
    delays = delays.map((delay) => delay *= 1e3);
    const videoFrames = [];
    signal == null ? undefined : signal.addEventListener(
      "abort",
      () => {
        videoFrames.forEach((frame) => frame.close());
      },
      { once: true }
    );
    for (const [i, frame] of frames2.entries()) {
      const videoFrame = new VideoFrame(frame, { duration: delays[i], timestamp });
      videoEncoder.encode(videoFrame);
      videoFrames.push(videoFrame);
      frame.close();
      timestamp += delays[i];
    }
    await videoEncoder.flush();
    videoEncoder.close();
    videoFrames.forEach((frame) => frame.close());
    signal == null ? undefined : signal.throwIfAborted();
    muxer.finalize();
    const { buffer } = muxer.target;
    return new Blob([buffer], { type: "video/webm" });
  }
  function isBlobArray(frames2) {
    return frames2[0] instanceof Blob;
  }
  async function mp4(frames2, delays, signal) {
    signal == null ? undefined : signal.throwIfAborted();
    if (isBlobArray(frames2)) {
      frames2 = await Promise.all(frames2.map((frame) => createImageBitmap(frame)));
    }
    signal == null ? undefined : signal.throwIfAborted();
    let width = frames2[0].width;
    let height = frames2[0].height;
    if (width % 2 !== 0) width += 1;
    if (height % 2 !== 0) height += 1;
    const muxer = new mp4Muxer.Muxer({
      target: new mp4Muxer.ArrayBufferTarget(),
      video: {
        codec: "avc",
        width,
        height
      },
      fastStart: "in-memory"
    });
    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => logger.error(e)
    });
    videoEncoder.configure({
      codec: "avc1.420034",
      width,
      height,
      bitrate: config.get("mp4Bitrate") * 1e6
    });
    let timestamp = 0;
    delays = delays.map((delay) => delay *= 1e3);
    const videoFrames = [];
    signal == null ? undefined : signal.addEventListener(
      "abort",
      () => {
        videoFrames.forEach((frame) => frame.close());
      },
      { once: true }
    );
    for (const [i, frame] of frames2.entries()) {
      const videoFrame = new VideoFrame(frame, { duration: delays[i], timestamp });
      videoEncoder.encode(videoFrame);
      videoFrames.push(videoFrame);
      frame.close();
      timestamp += delays[i];
    }
    await videoEncoder.flush();
    videoEncoder.close();
    videoFrames.forEach((frame) => frame.close());
    signal == null ? undefined : signal.throwIfAborted();
    muxer.finalize();
    const { buffer } = muxer.target;
    return new Blob([buffer], { type: "video/mp4" });
  }
  const adapter = {
    gif,
    png,
    webp,
    webm,
    mp4
  };
  const convertAdapter = {
    getAdapter(format) {
      return adapter[format];
    },
    getMixEffectFn() {
      return mixPngEffect;
    }
  };
  class Converter {
    constructor() {
      __privateAdd(this, _Converter_instances);
      __privateAdd(this, _ugoiraFramesData, {});
      __privateAdd(this, _queue3, new PQueue({ concurrency: 2 }));
    }
    addFrame(addFrameOptions) {
      var _a;
      const { id, frame, delay, order } = addFrameOptions;
      (_a = __privateGet(this, _ugoiraFramesData))[id] ?? (_a[id] = {
        ugoiraFrames: [],
        delays: []
      });
      const { ugoiraFrames, delays } = __privateGet(this, _ugoiraFramesData)[id];
      if (order === undefined) {
        const length = frames.length;
        ugoiraFrames[length] = frame;
        delays[length] = delay;
      } else {
        ugoiraFrames[order] = frame;
        delays[order] = delay;
      }
    }
    clearFrames(taskId) {
      taskId in __privateGet(this, _ugoiraFramesData) && delete __privateGet(this, _ugoiraFramesData)[taskId];
    }
    framesCount(taskId) {
      return taskId in __privateGet(this, _ugoiraFramesData) ? __privateGet(this, _ugoiraFramesData)[taskId]["ugoiraFrames"].filter(Boolean).length : 0;
    }
    async convert(convertOptions) {
      const { id, signal, onProgress } = convertOptions;
      signal == null ? undefined : signal.throwIfAborted();
      const result = await __privateGet(this, _queue3).add(
        ({ signal: signal2 }) => {
          signal2 == null ? undefined : signal2.throwIfAborted();
          if (!(id in __privateGet(this, _ugoiraFramesData))) {
            throw new Error("No frame data matched with taskId: " + id);
          }
          const { ugoiraFrames, delays } = __privateGet(this, _ugoiraFramesData)[id];
          if (!ugoiraFrames.length || !delays.length) {
            throw new Error("No frame data found in taskId: " + id);
          }
          this.clearFrames(id);
          onProgress == null ? undefined : onProgress(0);
          return __privateMethod(this, _Converter_instances, processConvert_fn).call(this, {
            ...convertOptions,
            frames: ugoiraFrames,
            delays
          });
        },
        { signal }
      );
      if (!result) throw new Error(`Task ${id} has no result returned.`);
      return result;
    }
    async appendPixivEffect(options) {
      const { id, signal, illust, seasonalEffect, onProgress } = options;
      signal == null ? undefined : signal.throwIfAborted();
      const result = await __privateGet(this, _queue3).add(
        async ({ signal: signal2 }) => {
          signal2 == null ? undefined : signal2.throwIfAborted();
          logger.info("Append Effect:", id);
          onProgress == null ? undefined : onProgress(0);
          const mixEffect = convertAdapter.getMixEffectFn();
          const t0 = performance.now();
          const { frames: frames2, delays } = await mixEffect(illust, seasonalEffect, signal2);
          const t1 = performance.now();
          logger.info(`Effect appended: ${id} ${t1 - t0}ms.`);
          return __privateMethod(this, _Converter_instances, processConvert_fn).call(this, {
            ...options,
            frames: frames2,
            delays,
            signal: signal2
          });
        },
        { signal }
      );
      if (!result) throw new Error(`Task ${id} has no result returned.`);
      return result;
    }
  }
  _ugoiraFramesData = new WeakMap();
  _queue3 = new WeakMap();
  _Converter_instances = new WeakSet();
  processConvert_fn = async function(processConvertOptions) {
    const { id, format, frames: frames2, delays, signal, onProgress } = processConvertOptions;
    logger.info("Start convert:", id);
    const adapter2 = convertAdapter.getAdapter(format);
    const t0 = performance.now();
    const result = await adapter2(frames2, delays, signal, onProgress);
    const t1 = performance.now();
    logger.info(`Convert finished: ${id} ${t1 - t0}ms.`);
    return result;
  };
  const converter = new Converter();
  class PixivDownloadConfig extends MayBeMultiIllustsConfig {
    constructor(mediaMeta) {
      super(mediaMeta);
      __publicField(this, "ugoiraMeta");
      __publicField(this, "illustType");
      __publicField(this, "userId");
      __publicField(this, "comment");
      __publicField(this, "translatedTags");
      __publicField(this, "bookmarkCount");
      this.ugoiraMeta = "ugoiraMeta" in mediaMeta ? mediaMeta.ugoiraMeta : undefined;
      this.illustType = mediaMeta.illustType;
      this.userId = mediaMeta.userId;
      this.comment = mediaMeta.comment;
      this.translatedTags = mediaMeta.tagsTranslated;
      this.bookmarkCount = mediaMeta.bookmarkCount;
    }
    static get supportedTemplate() {
      return {
        [SupportedTemplate.ID]: "{id}",
        [SupportedTemplate.ARTIST]: "{artist}",
        [SupportedTemplate.ARTISTID]: "{artistID}",
        [SupportedTemplate.DATE]: "{date} {date(YYYY-MM-DD)}",
        [SupportedTemplate.PAGE]: "{page}",
        [SupportedTemplate.SCORE]: "{score}: bookmarkCount",
        [SupportedTemplate.TAGS]: "{tags}",
        [SupportedTemplate.TITLE]: "{title}"
      };
    }
    getHeaders() {
      return {
        referer: "https://www.pixiv.net"
      };
    }
    getZipComment() {
      if (!this.ugoiraMeta) return this.comment;
      const delays = this.ugoiraMeta.frames.map(({ delay }) => delay);
      return this.comment + "\n" + JSON.stringify(delays);
    }
    getTemplateData(data) {
      return {
        id: this.id,
        artist: this.normalizeString(this.artist) || this.userId,
        artistID: this.userId,
        date: this.createDate,
        score: String(this.bookmarkCount),
        title: this.normalizeString(this.title) || this.id,
        tags: this.tags.map((tag) => this.normalizeString(tag)).filter(Boolean).join("_"),
        ...data
      };
    }
    handleConvertFactory(convertFormat, setProgress) {
      return this.handleBeforeSaveCb ?? (this.handleBeforeSaveCb = async (imgBlob, config2, signal) => {
        signal == null ? undefined : signal.throwIfAborted();
        const { taskId, src } = config2;
        const index2 = this.src.indexOf(src);
        if (index2 === -1) throw new Error("No src matches.");
        if (!this.ugoiraMeta) return;
        this.handleAbortCb ?? (this.handleAbortCb = () => {
          converter.clearFrames(taskId);
        });
        signal == null ? undefined : signal.addEventListener("abort", this.handleAbortCb, { once: true });
        converter.addFrame({
          id: taskId,
          frame: imgBlob,
          delay: this.ugoiraMeta.frames[index2]["delay"],
          order: index2
        });
        if (converter.framesCount(taskId) !== this.ugoiraMeta.frames.length) return;
        return await converter.convert({
          id: taskId,
          format: convertFormat,
          onProgress: setProgress,
          signal
        });
      });
    }
    handleSeasonalEffectFactory(convertFormat, onProgress) {
      return this.handleBeforeSaveCb ?? (this.handleBeforeSaveCb = async (imgBlob, config2, signal) => {
        signal == null ? undefined : signal.throwIfAborted();
        const effectId = "pixivGlow2024";
        const url = "https://source.pixiv.net/special/seasonal-effect-tag/pixiv-glow-2024/effect.png";
        const { taskId } = config2;
        const effectData = await historyDb.getImageEffect(effectId);
        if (effectData && !("width" in effectData)) {
          const { data } = effectData;
          const blob = await converter.appendPixivEffect({
            id: taskId,
            format: convertFormat,
            illust: imgBlob,
            seasonalEffect: data,
            onProgress,
            signal
          });
          return blob;
        } else {
          const effctBlob = await new Promise((resolve, reject) => {
            _GM_xmlhttpRequest({
              url,
              headers: {
                referer: "https://www.pixiv.net"
              },
              responseType: "blob",
              onload(e) {
                resolve(e.response);
              },
              onerror: reject,
              ontimeout: () => reject(new Error("Timeout"))
            });
          });
          const blob = await converter.appendPixivEffect({
            id: taskId,
            format: convertFormat,
            illust: imgBlob,
            // seasonalEffect will be transfered to worker
            seasonalEffect: await effctBlob.arrayBuffer(),
            onProgress,
            signal
          });
          historyDb.addImageEffect({
            id: effectId,
            data: await effctBlob.arrayBuffer()
          });
          return blob;
        }
      });
    }
    create(option) {
      const { filenameTemplate, folderTemplate, setProgress, useTranslatedTags } = option;
      const index2 = "index" in option ? option.index : 0;
      const headers = this.getHeaders();
      const templateData = this.getTemplateData(
        useTranslatedTags ? {
          tags: this.translatedTags.map((tag) => this.normalizeString(tag)).filter(Boolean).join("_"),
          page: String(index2)
        } : {
          page: String(index2)
        }
      );
      return {
        headers,
        taskId: this.getTaskId(),
        src: this.getSrc(index2),
        path: this.getSavePath(folderTemplate, filenameTemplate, this.getExt(index2), templateData),
        timeout: this.getDownloadTimeout(index2),
        onProgress: setProgress
      };
    }
    createMulti(option) {
      if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);
      const { filenameTemplate, folderTemplate, setProgress, useTranslatedTags } = option;
      const taskId = this.getTaskId();
      const headers = this.getHeaders();
      const onFileSaved = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;
      const overwriteData = useTranslatedTags ? {
        tags: this.translatedTags.map((tag) => this.normalizeString(tag)).filter(Boolean).join("_")
      } : {};
      return this.src.map((src, i) => {
        return {
          headers,
          taskId,
          src,
          path: this.getSavePath(
            folderTemplate,
            filenameTemplate,
            this.getExt(i),
            this.getTemplateData({
              ...overwriteData,
              page: String(i)
            })
          ),
          timeout: this.getDownloadTimeout(),
          onFileSaved
        };
      });
    }
    createBundle(option) {
      if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);
      const { filenameTemplate, folderTemplate, setProgress, useTranslatedTags } = option;
      const taskId = this.getTaskId();
      const headers = this.getHeaders();
      const onXhrLoaded = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;
      const overwriteData = useTranslatedTags ? {
        tags: this.translatedTags.map((tag) => this.normalizeString(tag)).filter(Boolean).join("_")
      } : {};
      const path = this.getSavePath(
        folderTemplate,
        filenameTemplate,
        "zip",
        this.getTemplateData({ ...overwriteData, page: String(this.src.length) })
      );
      const filenameTemplateWithPage = filenameTemplate.includes(`{${SupportedTemplate.PAGE}}`) ? filenameTemplate : filenameTemplate + `_{${SupportedTemplate.PAGE}}`;
      const filenames = this.src.map((_, i) => {
        return this.getSavePath(
          "",
          filenameTemplateWithPage,
          this.getExt(i),
          this.getTemplateData({
            ...overwriteData,
            page: String(i)
          })
        );
      });
      return this.src.map((src, i) => {
        return {
          headers,
          taskId,
          src,
          path,
          timeout: this.getDownloadTimeout(i),
          onXhrLoaded,
          beforeFileSave: this.handleBundleFactory(filenames),
          onError: this.handleBundleErrorFactory(),
          onAbort: this.handleBundleAbortFactory()
        };
      });
    }
    createConvert(option) {
      if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);
      const { filenameTemplate, folderTemplate, setProgress, convertFormat, useTranslatedTags } = option;
      const taskId = this.getTaskId();
      const headers = this.getHeaders();
      const onXhrLoaded = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;
      const beforeFileSave = this.handleConvertFactory(convertFormat, setProgress);
      const templateData = this.getTemplateData(
        useTranslatedTags ? {
          tags: this.translatedTags.map((tag) => this.normalizeString(tag)).filter(Boolean).join("_"),
          page: String(0)
        } : {
          page: String(0)
        }
      );
      const path = this.getSavePath(folderTemplate, filenameTemplate, convertFormat, templateData);
      return this.src.map((src, i) => {
        return {
          headers,
          taskId,
          src,
          path,
          timeout: this.getDownloadTimeout(i),
          onXhrLoaded,
          beforeFileSave
        };
      });
    }
    createSeasonalEffect(option) {
      const { filenameTemplate, folderTemplate, setProgress, convertFormat, useTranslatedTags } = option;
      const index2 = "index" in option ? option.index : 0;
      const templateData = this.getTemplateData(
        useTranslatedTags ? {
          tags: this.translatedTags.map((tag) => this.normalizeString(tag)).filter(Boolean).join("_"),
          page: String(index2)
        } : {
          page: String(index2)
        }
      );
      return {
        headers: this.getHeaders(),
        taskId: this.getTaskId(),
        src: this.getSrc(index2),
        path: this.getSavePath(folderTemplate, filenameTemplate, convertFormat, templateData),
        timeout: this.getDownloadTimeout(index2),
        onProgress: setProgress,
        beforeFileSave: this.handleSeasonalEffectFactory(convertFormat, setProgress)
      };
    }
  }
  async function addBookmark(illustId, token, optionalParams) {
    const { btn: btn2, tags, restrict } = optionalParams;
    try {
      await pixivApi.addBookmark(illustId, token, tags, restrict);
      if (!btn2) return;
      const bookmarkBtnRef = findBookmarkBtn(btn2);
      if (!bookmarkBtnRef) return;
      switch (bookmarkBtnRef.kind) {
        case "main": {
          const pathBorder = bookmarkBtnRef.button.querySelector("svg g path");
          pathBorder && (pathBorder.style.color = "rgb(255, 64, 96)");
          break;
        }
        case "sub": {
          const pathBorder = bookmarkBtnRef.button.querySelector("path");
          pathBorder && (pathBorder.style.color = "rgb(255, 64, 96)");
          break;
        }
        case "rank": {
          bookmarkBtnRef.button.style.backgroundColor = "rgb(255, 64, 96)";
          break;
        }
        default:
          break;
      }
    } catch (error) {
      logger.error(error);
    }
  }
  function findBookmarkBtn(btn2) {
    var _a, _b, _c, _d, _e;
    const bookmarkBtnRef = {};
    if (!btn2.dataset.type) {
      const favBtn = (_b = (_a = btn2.parentElement) == null ? undefined : _a.nextElementSibling) == null ? undefined : _b.querySelector(
        'button[type="button"]'
      );
      if (favBtn) {
        bookmarkBtnRef.kind = "sub";
        bookmarkBtnRef.button = favBtn;
      } else {
        const favBtn2 = (_c = btn2.parentElement) == null ? undefined : _c.querySelector("div._one-click-bookmark");
        if (favBtn2) {
          bookmarkBtnRef.kind = "rank";
          bookmarkBtnRef.button = favBtn2;
        }
      }
    } else if (btn2.dataset.type === ThumbnailBtnType.PixivToolbar) {
      const favBtn = (_e = (_d = btn2.parentElement) == null ? undefined : _d.parentElement) == null ? undefined : _e.querySelector(
        "button.gtm-main-bookmark"
      );
      if (favBtn) {
        bookmarkBtnRef.kind = "main";
        bookmarkBtnRef.button = favBtn;
      }
    } else {
      return logger.warn(new Error("Can not find bookmark button."));
    }
    return bookmarkBtnRef;
  }
  function isArtworkPage(illustId) {
    return location.pathname.includes(`/artworks/${illustId}`);
  }
  async function likeIllust(illustId, token) {
    var _a, _b, _c;
    await pixivApi.likeIllust(illustId, token);
    if (!isArtworkPage(illustId)) return;
    const likeBtn = (_c = (_b = (_a = document.querySelector(
      `${ThumbnailButton.tagNameLowerCase}[data-type="pixiv-toolbar"]`
    )) == null ? undefined : _a.parentElement) == null ? undefined : _b.previousElementSibling) == null ? undefined : _c.firstElementChild;
    if (!likeBtn) return;
    likeBtn.disabled = true;
    likeBtn.style.color = "#0096fa";
    likeBtn.style.cursor = "default";
  }
  class Pixiv extends SiteInject {
    constructor() {
      super(...arguments);
      __publicField(this, "firstObserverCbRunFlag", true);
      __publicField(this, "useBatchDownload", this.app.initBatchDownloader({
        metaType: {},
        async avatar(url) {
          let userId;
          let matchReg;
          if (matchReg = regexp.series.exec(url)) {
            userId = matchReg[1];
          } else if (matchReg = regexp.userPage.exec(url)) {
            userId = matchReg[1] || matchReg[2];
          } else {
            userId = getSelfId() ?? "";
          }
          if (!userId) return "";
          try {
            const userData = await pixivApi.getUserData(userId);
            return userData.imageBig;
          } catch (error) {
            logger.error(error);
            return "";
          }
        },
        filterOption: {
          filters: [
            {
              id: "exclude_downloaded",
              type: "exclude",
              name: t("downloader.category.filter.exclude_downloaded"),
              checked: false,
              fn(meta) {
                return !!meta.id && historyDb.has(meta.id);
              }
            },
            {
              id: "illust",
              type: "include",
              name: t("downloader.category.filter.pixiv_illust"),
              checked: true,
              fn(meta) {
                return meta.illustType === IllustType.illusts;
              }
            },
            {
              id: "manga",
              type: "include",
              name: t("downloader.category.filter.pixiv_manga"),
              checked: true,
              fn(meta) {
                return meta.illustType === IllustType.manga;
              }
            },
            {
              id: "ugoira",
              type: "include",
              name: t("downloader.category.filter.pixiv_ugoira"),
              checked: true,
              fn(meta) {
                return meta.illustType === IllustType.ugoira;
              }
            }
          ],
          enableTagFilter: true
        },
        pageOption: {
          self_bookmark_public: {
            name: t("downloader.download_type.pixiv_bookmark_public"),
            match(url) {
              const userIdMatch = regexp.userPage.exec(url);
              if (!userIdMatch) return false;
              const userId = userIdMatch[1] || userIdMatch[2];
              return userId === getSelfId();
            },
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              return pixivParser.bookmarkGenerator(pageRange, checkValidity, getSelfId());
            }
          },
          self_bookmark_private: {
            name: t("downloader.download_type.pixiv_bookmark_private"),
            match(url) {
              const userIdMatch = regexp.userPage.exec(url);
              if (!userIdMatch) return false;
              const userId = userIdMatch[1] || userIdMatch[2];
              return userId === getSelfId();
            },
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              return pixivParser.bookmarkGenerator(pageRange, checkValidity, getSelfId(), "hide");
            }
          },
          user_page_works: {
            name: t("downloader.download_type.pixiv_works"),
            match: regexp.userPage,
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              const userIdMatch = regexp.userPage.exec(location.href);
              const userId = userIdMatch[1] || userIdMatch[2];
              return pixivParser.illustMangaGenerator(pageRange, checkValidity, userId);
            }
          },
          user_page_bookmark: {
            name: t("downloader.download_type.pixiv_bookmark"),
            match: regexp.userPage,
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              const userIdMatch = regexp.userPage.exec(location.href);
              const userId = userIdMatch[1] || userIdMatch[2];
              return pixivParser.bookmarkGenerator(pageRange, checkValidity, userId);
            }
          },
          follow_latest_all: {
            name: t("downloader.download_type.pixiv_follow_latest_all"),
            match: regexp.followLatest,
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              return pixivParser.followLatestGenerator(pageRange, checkValidity, "all");
            }
          },
          follow_latest_r18: {
            name: t("downloader.download_type.pixiv_follow_latest_r18"),
            match: regexp.followLatest,
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              return pixivParser.followLatestGenerator(pageRange, checkValidity, "r18");
            }
          },
          series: {
            name: t("downloader.download_type.pixiv_series"),
            match: regexp.series,
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              const matchSeries = regexp.series.exec(location.pathname);
              return pixivParser.seriesGenerator(pageRange, checkValidity, matchSeries[2]);
            }
          },
          tagged_artwork: {
            name: "tagged_artwork",
            match: () => false,
            // use for user tag download
            filterInGenerator: true,
            fn: (pageRange, checkValidity, userId, category, tag, bookmarkRest = "show") => {
              if (category === "bookmarks") {
                return pixivParser.taggedArtworkGenerator(
                  pageRange,
                  checkValidity,
                  userId,
                  category,
                  tag,
                  bookmarkRest
                );
              } else {
                return pixivParser.taggedArtworkGenerator(
                  pageRange,
                  checkValidity,
                  userId,
                  category,
                  tag
                );
              }
            }
          }
        },
        parseMetaByArtworkId: (id) => {
          return pixivParser.parse(id, { tagLang: this.config.get("tagLang"), type: "api" });
        },
        downloadArtworkByMeta: async (meta, signal) => {
          downloader.dirHandleCheck();
          const downloadConfigs = this.getDownloadConfig(meta);
          await downloader.download(downloadConfigs, { signal });
          const { comment: comment2, id, tags, artist, userId, title } = meta;
          const historyData = {
            pid: Number(id),
            user: artist,
            userId: Number(userId),
            title,
            comment: comment2,
            tags
          };
          historyDb.add(historyData);
        }
      }));
    }
    static get hostname() {
      return "www.pixiv.net";
    }
    inject() {
      super.inject();
      this.downloadArtwork = this.downloadArtwork.bind(this);
      new MutationObserver((records) => {
        this.injectThumbnailButtons(records);
        this.pageActions();
      }).observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    getCustomConfig() {
      return {
        folderPattern: "pixiv/{artist}",
        filenamePattern: "{artist}_{title}_{id}_p{page}"
      };
    }
    getSupportedTemplate() {
      return PixivDownloadConfig.supportedTemplate;
    }
    observeColorScheme() {
      const onThemeChange = () => {
        const sitePreferDark = document.documentElement.getAttribute("data-theme");
        sitePreferDark === "dark" ? this.setAppDarkMode() : this.setAppLightMode();
      };
      new MutationObserver(onThemeChange).observe(document.documentElement, {
        attributes: true,
        childList: false,
        subtree: false
      });
      onThemeChange();
    }
    injectThumbnailButtons(records) {
      const addedNodes = [];
      records.forEach((record) => {
        if (!record.addedNodes.length) return;
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() !== ThumbnailButton.tagNameLowerCase && node.tagName !== "IMG") {
            addedNodes.push(node);
          }
        });
      });
      if (!addedNodes.length) return;
      if (this.firstObserverCbRunFlag) {
        createThumbnailBtn(document.querySelectorAll("a"), this.downloadArtwork);
        this.firstObserverCbRunFlag = false;
      } else {
        fixPixivPreviewer(addedNodes);
        const thumbnails = addedNodes.reduce((prev, current) => {
          return prev.concat(
            current instanceof HTMLAnchorElement ? [current] : Array.from(current.querySelectorAll("a"))
          );
        }, []);
        createThumbnailBtn(thumbnails, this.downloadArtwork);
      }
    }
    pageActions() {
      var _a;
      const pathname = location.pathname;
      let param;
      switch (true) {
        case !!(param = regexp.artworksPage.exec(pathname)): {
          const id = param[1];
          createToolbarBtn(id, this.downloadArtwork);
          createWorkExpanedViewBtn(id, this.downloadArtwork);
          createPresentationBtn(id, this.downloadArtwork);
          createPreviewModalBtn(id, this.downloadArtwork);
          createMangaViewerBtn(id, this.downloadArtwork);
          break;
        }
        case regexp.userPageTags.test(pathname): {
          const { downloading, batchDownload } = this.useBatchDownload();
          const handleDownload = (props) => {
            const { userId, category, tag, rest } = props;
            return batchDownload("tagged_artwork", userId, category, tag, rest);
          };
          createFrequentTagBtn(downloading, handleDownload);
          createTagListBtn(downloading, handleDownload);
          break;
        }
        case regexp.historyPage.test(pathname): {
          createThumbnailBtn(
            document.querySelectorAll("span[style]._history-item"),
            this.downloadArtwork
          );
          break;
        }
        case !!(param = regexp.unlisted.exec(pathname)): {
          const unlistedId = param[0];
          const canonicalUrlEL = document.head.querySelector('link[rel="canonical"]') || document.head.querySelector(
            'link[data-next-head][href^="https://www.pixiv.net/artworks/"]'
          );
          const canonicalUrl = canonicalUrlEL == null ? undefined : canonicalUrlEL.getAttribute("href");
          if (!canonicalUrl) throw new Error(`Cannot get canonical url for ${unlistedId}`);
          const id = (_a = regexp.artworksPage.exec(canonicalUrl)) == null ? undefined : _a[1];
          if (!id) throw new Error(`Cannot get artwork id for ${unlistedId}`);
          createUnlistedToolbar(id, this.downloadArtwork, unlistedId);
          createWorkExpanedViewBtn(id, this.downloadArtwork, unlistedId);
          createPresentationBtn(id, this.downloadArtwork, unlistedId);
          createPreviewModalBtn(id, this.downloadArtwork, unlistedId);
          createMangaViewerBtn(id, this.downloadArtwork, unlistedId);
          break;
        }
      }
    }
    isMultiImageMeta(meta) {
      return Array.isArray(meta.src) && meta.src.length > 1;
    }
    getDownloadConfig(meta, setProgress, page) {
      const folderTemplate = this.config.get("folderPattern");
      const filenameTemplate = this.config.get("filenamePattern");
      const ugoiraFormat = this.config.get("ugoiraFormat");
      const bundleManga = this.config.get("bundleManga");
      const bundleIllust = this.config.get("bundleIllusts");
      const mixEffect = this.config.get("mixEffect");
      const mixEffectFormat = ugoiraFormat === UgoiraFormat.ZIP ? UgoiraFormat.MP4 : ugoiraFormat;
      const useTranslatedTags = this.config.get("tagLang") !== TagLanguage.JAPANESE;
      const option = {
        folderTemplate,
        filenameTemplate,
        useTranslatedTags,
        setProgress
      };
      if ("ugoiraMeta" in meta) {
        if (ugoiraFormat !== UgoiraFormat.ZIP) {
          return new PixivDownloadConfig(meta).createConvert({
            ...option,
            convertFormat: ugoiraFormat
          });
        }
        return new PixivDownloadConfig(meta).createBundle(option);
      }
      if (this.isMultiImageMeta(meta)) {
        if (page !== undefined) {
          if (mixEffect) {
            return new PixivDownloadConfig(meta).createSeasonalEffect({
              ...option,
              index: page,
              convertFormat: mixEffectFormat
            });
          }
          return new PixivDownloadConfig(meta).create({
            ...option,
            index: page
          });
        }
        if (meta.illustType === IllustType.manga && bundleManga || meta.illustType === IllustType.illusts && bundleIllust) {
          return new PixivDownloadConfig(meta).createBundle(option);
        }
        return new PixivDownloadConfig(meta).createMulti(option);
      }
      if (mixEffect) {
        return new PixivDownloadConfig(meta).createSeasonalEffect({
          ...option,
          convertFormat: mixEffectFormat
        });
      }
      return new PixivDownloadConfig(meta).create(option);
    }
    async downloadArtwork(btn2) {
      downloader.dirHandleCheck();
      const { id, page, unlistedId } = btn2.dataset;
      const pageNum = page !== undefined ? +page : undefined;
      const tagLang = this.config.get("tagLang");
      let pixivMeta;
      if (!unlistedId) {
        const shouldAddBookmark = this.config.get("addBookmark");
        const shouldLikeIllust = this.config.get("likeIllust");
        if (shouldAddBookmark || shouldLikeIllust) {
          pixivMeta = await pixivParser.parse(id, { tagLang, type: "html" });
          const { bookmarkData, token, tags: tags2, likeData } = pixivMeta;
          if (!bookmarkData && shouldAddBookmark) {
            const addedTags = this.config.get("addBookmarkWithTags") ? tags2 : undefined;
            const restrict = this.config.get("privateR18") && tags2.includes("R-18") ? BookmarkRestrict.private : BookmarkRestrict.public;
            addBookmark(id, token, { btn: btn2, tags: addedTags, restrict });
          }
          if (!likeData && shouldLikeIllust) {
            likeIllust(id, token);
          }
        } else {
          pixivMeta = await pixivParser.parse(id, { tagLang, type: "api" });
        }
      } else {
        pixivMeta = await pixivParser.parse(unlistedId, { tagLang, type: "unlisted" });
      }
      const downloadConfigs = this.getDownloadConfig(
        pixivMeta,
        (progress) => {
          if (progress > 0) {
            btn2.setProgress(progress);
          } else {
            btn2.setStatus(ThumbnailBtnStatus.Loading);
          }
        },
        pageNum
      );
      await downloader.download(downloadConfigs, { priority: 1 });
      const { comment: comment2, tags, artist, userId, title } = pixivMeta;
      const historyData = {
        pid: Number(id),
        user: artist,
        userId: Number(userId),
        title,
        comment: comment2,
        tags
      };
      if (page !== undefined) {
        historyData.page = Number(page);
      }
      if (unlistedId) {
        historyData.unlistedId = unlistedId;
      }
      historyDb.add(historyData);
    }
  }
  class MoebooruParser extends ParserBase {
    constructor() {
      super(...arguments);
      __privateAdd(this, _MoebooruParser_instances);
    }
    parseCsrfToken() {
      const el = document.querySelector('meta[name="csrf-token"]');
      if (!el) throw new Error("Can not find csrf-token element.");
      return el.content;
    }
    isLatestData(data) {
      return "file_ext" in data;
    }
    buildMeta(data, tagType) {
      if (data.status === "deleted") throw new Error(`Post ${data.id} is deleted.`);
      const { id, file_url, md5, created_at, source: source2, rating, score } = data;
      const file_ext = this.isLatestData(data) ? data.file_ext : file_url.match(/\.(\w+)$/)[1];
      const artists = [];
      const characters = [];
      const tags = data.tags.split(" ").map((tag) => {
        const type = tagType[tag] ?? "unknown";
        if (type === "artist") {
          artists.push(tag);
        } else if (type === "character") {
          characters.push(tag);
        }
        return type + ":" + tag;
      });
      return {
        id: String(id),
        src: file_url,
        extendName: file_ext,
        artist: artists.join(",") || "UnknownArtist",
        character: characters.join(",") || "UnknownCharacter",
        title: md5,
        tags,
        createDate: new Date(created_at * 1e3).toISOString(),
        rating,
        score,
        source: source2
      };
    }
    isFavorite(id, votesData) {
      return id in votesData && votesData[id] === 3;
    }
    /**
     * for post_list, popular
     */
    parsePostsList(htmlText) {
      return {
        posts: __privateMethod(this, _MoebooruParser_instances, parsePostListData_fn).call(this, htmlText),
        tags: __privateMethod(this, _MoebooruParser_instances, parseTagListData_fn).call(this, htmlText)
      };
    }
    /**
     *  for post/show, pool
     */
    parsePostAndPool(htmlText) {
      const [dataStr] = new RegExp("(?<=Post\\.register_resp\\().+(?=\\);)").exec(htmlText);
      return JSON.parse(dataStr);
    }
    parseBlacklistByDoc(doc) {
      const el = doc.querySelector("script#user-blacklisted-tags");
      if (!el) throw new Error("Can not get blacklist.");
      const blacklistArr = JSON.parse(el.textContent ?? "[]");
      return __privateMethod(this, _MoebooruParser_instances, parseBlacklist_fn).call(this, blacklistArr);
    }
    // konachan stores blacklist as `blacklisted_tags` cookies
    parseBlacklistByCookie() {
      const blacklistMatch = document.cookie.match(new RegExp("(?<=blacklisted_tags=).+?(?=;)"));
      let blacklistStr = blacklistMatch ? decodeURIComponent(blacklistMatch[0]) : "[]";
      if (blacklistStr === '[""]') blacklistStr = "[]";
      return __privateMethod(this, _MoebooruParser_instances, parseBlacklist_fn).call(this, JSON.parse(blacklistStr));
    }
    /**
     * is_blacklisted
     * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L315
     */
    isBlacklisted(matchTags, blacklist) {
      return blacklist.some((blacklistItem) => {
        const { require: require2, exclude } = blacklistItem;
        const hasTag = (tag) => matchTags.includes(tag);
        return require2.every(hasTag) && !exclude.some(hasTag);
      });
    }
  }
  _MoebooruParser_instances = new WeakSet();
  parsePostListData_fn = function(docText) {
    const matchData = docText.match(new RegExp("(?<=Post\\.register\\().+(?=\\))", "g"));
    return matchData.map((dataStr) => JSON.parse(dataStr));
  };
  parseTagListData_fn = function(docText) {
    const [tagStr] = docText.match(new RegExp("(?<=Post\\.register_tags\\().+(?=\\))"));
    return JSON.parse(tagStr);
  };
  /**
   * init_blacklisted
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L429
   */
  parseBlacklist_fn = function(blacklist) {
    return blacklist.map((blacklist2) => {
      const matchRatingTag = blacklist2.replace(/(rating:[qes])\w+/, "$1");
      const tags = matchRatingTag.split(" ");
      const require2 = [];
      const exclude = [];
      tags.forEach((tag) => {
        if (tag.charAt(0) === "-") {
          exclude.push(tag.slice(1));
        } else {
          require2.push(tag);
        }
      });
      return {
        tags,
        original_tag_string: blacklist2,
        require: require2,
        exclude
      };
    });
  };
  class MoebooruApi extends ApiBase {
    isBadResponse(obj) {
      return "success" in obj && !obj.success;
    }
    async getJSON(url, init2) {
      const json = await super.getJSON(url, init2);
      if (this.isBadResponse(json)) {
        throw new JsonDataError(json.reason);
      }
      return json;
    }
    async getPost(id) {
      const [data] = await this.getJSON(
        `/post.json?tags=id:${id}`
      );
      return data;
    }
    async getPosts(params) {
      let url = "/post.json?";
      Object.entries(params).forEach(([key, val]) => {
        if (typeof val === "number") {
          val = String(val);
        } else if (Array.isArray(val)) {
          val = val.join("+");
        }
        url += `&${key}=${val}`;
      });
      return this.getJSON(url);
    }
    // pool only have one page
    async getPool(poolId, page = 1) {
      return this.getJSON(
        `/pool/show.json?id=${poolId}&page=${page}`
      );
    }
    async getPopularByDate(params) {
      let url;
      const { month = "", year = "" } = params;
      if (params.period === "month") {
        url = `/post/popular_by_month.json?month=${month}&year=${year}`;
      } else {
        url = `/post/popular_by_${params.period}.json?day=${params.day ?? ""}&month=${month}&year=${year}`;
      }
      return this.getJSON(url);
    }
    async getPostHtml(id) {
      return this.getHtml(`/post/show/${id}`);
    }
    async getPostsHtml(tags, page) {
      Array.isArray(tags) && tags.join("+");
      return this.getHtml(`/post?page=${page}&tags=${tags}`);
    }
    async getPopularHtmlByPeriod(period) {
      return this.getHtml(`/post/popular_recent?period=${period}`);
    }
    async getPoolHtml(poolId) {
      return this.getHtml(`/pool/show/${poolId}`);
    }
    // blacklist can be updated via ajax so we shouldn't get blacklist from current document.
    async getBlacklistDoc() {
      return this.getDoc("/static/more");
    }
    async getPopularHtmlByDate(params) {
      let url;
      const { month = "", year = "" } = params;
      if (params.period === "month") {
        url = `/post/popular_by_month?month=${month}&year=${year}`;
      } else {
        url = `/post/popular_by_${params.period}?day=${params.day ?? ""}&month=${month}&year=${year}`;
      }
      return this.getHtml(url);
    }
    async addFavorite(id, token) {
      const res = await this.fetch("/post/vote.json", {
        method: "POST",
        headers: {
          "x-csrf-token": token,
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: `id=${id}&score=3`
      });
      if (!res.ok) throw new RequestError(res.url, res.status);
    }
  }
  class Moebooru extends SiteInject {
    constructor() {
      super(...arguments);
      __privateAdd(this, _Moebooru_instances);
      __publicField(this, "blacklist", null);
      __publicField(this, "useBatchDownload", this.app.initBatchDownloader({
        metaType: {},
        avatar: "/favicon.ico",
        filterOption: {
          filters: [
            {
              id: "exclude_downloaded",
              type: "exclude",
              name: t("downloader.category.filter.exclude_downloaded"),
              checked: false,
              fn(meta) {
                return !!meta.id && historyDb.has(meta.id);
              }
            },
            {
              id: "exclude_blacklist",
              type: "exclude",
              name: t("downloader.category.filter.exclude_blacklist"),
              checked: true,
              fn: async (meta) => {
                if (!meta.tags) return false;
                this.blacklist ?? (this.blacklist = await this.getBlacklist());
                return this.parser.isBlacklisted(meta.tags, this.blacklist);
              }
            },
            {
              id: "allow_image",
              type: "include",
              name: t("downloader.category.filter.image"),
              checked: true,
              fn() {
                return true;
              }
            }
          ],
          enableTagFilter: true
        },
        pageOption: {
          posts: {
            name: t("downloader.download_type.moebooru_posts"),
            match: () => location.pathname === "/post",
            filterInGenerator: true,
            fn: (pageRange, checkValidity, tags) => {
              tags ?? (tags = new URLSearchParams(location.search).get("tags") ?? "");
              const getPostData = async (page) => {
                const POSTS_PER_PAGE = 40;
                const htmlText = await this.api.getPostsHtml(tags, page);
                const { posts, tags: tagType } = this.parser.parsePostsList(htmlText);
                const data = posts.map((post) => ({ ...post, tagType }));
                return {
                  lastPage: data.length < POSTS_PER_PAGE,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostData,
                __privateMethod(this, _Moebooru_instances, buildMetaByGeneratorData_fn).bind(this),
                __privateMethod(this, _Moebooru_instances, validityCallbackFactory_fn).call(this, checkValidity)
              );
            }
          },
          popular_1d: {
            name: t("downloader.download_type.moebooru_popular_1d"),
            match: () => location.pathname === "/post/popular_recent",
            filterInGenerator: true,
            fn: (_, checkValidity) => {
              return this.parser.paginationGenerator(
                [1, 1],
                __privateMethod(this, _Moebooru_instances, getPopularDataFactory_fn).call(this, "1d"),
                __privateMethod(this, _Moebooru_instances, buildMetaByGeneratorData_fn).bind(this),
                __privateMethod(this, _Moebooru_instances, validityCallbackFactory_fn).call(this, checkValidity)
              );
            }
          },
          popular_1w: {
            name: t("downloader.download_type.moebooru_popular_1w"),
            match: () => location.pathname === "/post/popular_recent",
            filterInGenerator: true,
            fn: (_, checkValidity) => {
              return this.parser.paginationGenerator(
                [1, 1],
                __privateMethod(this, _Moebooru_instances, getPopularDataFactory_fn).call(this, "1w"),
                __privateMethod(this, _Moebooru_instances, buildMetaByGeneratorData_fn).bind(this),
                __privateMethod(this, _Moebooru_instances, validityCallbackFactory_fn).call(this, checkValidity)
              );
            }
          },
          popular_1m: {
            name: t("downloader.download_type.moebooru_popular_1m"),
            match: () => location.pathname === "/post/popular_recent",
            filterInGenerator: true,
            fn: (_, checkValidity) => {
              return this.parser.paginationGenerator(
                [1, 1],
                __privateMethod(this, _Moebooru_instances, getPopularDataFactory_fn).call(this, "1m"),
                __privateMethod(this, _Moebooru_instances, buildMetaByGeneratorData_fn).bind(this),
                __privateMethod(this, _Moebooru_instances, validityCallbackFactory_fn).call(this, checkValidity)
              );
            }
          },
          popular_1y: {
            name: t("downloader.download_type.moebooru_popular_1y"),
            match: () => location.pathname === "/post/popular_recent",
            filterInGenerator: true,
            fn: (_, checkValidity) => {
              return this.parser.paginationGenerator(
                [1, 1],
                __privateMethod(this, _Moebooru_instances, getPopularDataFactory_fn).call(this, "1y"),
                __privateMethod(this, _Moebooru_instances, buildMetaByGeneratorData_fn).bind(this),
                __privateMethod(this, _Moebooru_instances, validityCallbackFactory_fn).call(this, checkValidity)
              );
            }
          },
          popular_by_date: {
            name: t("downloader.download_type.moebooru_popular_date"),
            match: /\/post\/popular_by_(day|week|month)/,
            filterInGenerator: true,
            fn: (_, checkValidity) => {
              const period = new RegExp("(?<=popular_by_)day|week|month").exec(location.pathname)[0];
              const searchParams = new URLSearchParams(location.search);
              let params;
              if (searchParams.size === 0) {
                params = { period };
              } else {
                params = {
                  period,
                  month: searchParams.get("month") || undefined,
                  year: searchParams.get("year") || undefined
                };
                if (params.period !== "month") {
                  params.day = searchParams.get("day") || undefined;
                }
              }
              const getPopularData = async () => {
                const htmlText = await this.api.getPopularHtmlByDate(params);
                const { posts, tags: tagType } = this.parser.parsePostsList(htmlText);
                const data = posts.map((post) => ({ ...post, tagType }));
                return {
                  lastPage: true,
                  data
                };
              };
              return this.parser.paginationGenerator(
                [1, 1],
                getPopularData,
                __privateMethod(this, _Moebooru_instances, buildMetaByGeneratorData_fn).bind(this),
                __privateMethod(this, _Moebooru_instances, validityCallbackFactory_fn).call(this, checkValidity)
              );
            }
          },
          pool: {
            name: t("downloader.download_type.moebooru_pool"),
            match: /\/pool\/show\//,
            filterInGenerator: true,
            fn: (_, checkValidity, poolId) => {
              poolId ?? (poolId = new RegExp("(?<=show\\/)[0-9]+").exec(location.pathname)[0]);
              const getPoolData = async () => {
                const htmlText = await this.api.getPoolHtml(poolId);
                const { posts, tags: tagType } = this.parser.parsePostAndPool(htmlText);
                const data = posts.map((post) => ({ ...post, tagType }));
                return {
                  lastPage: true,
                  data
                };
              };
              return this.parser.paginationGenerator(
                [1, 1],
                getPoolData,
                __privateMethod(this, _Moebooru_instances, buildMetaByGeneratorData_fn).bind(this),
                __privateMethod(this, _Moebooru_instances, validityCallbackFactory_fn).call(this, checkValidity)
              );
            }
          }
        },
        parseMetaByArtworkId: async (id) => {
          const htmlText = await this.api.getPostHtml(id);
          const { posts, tags } = this.parser.parsePostAndPool(htmlText);
          return this.parser.buildMeta(posts[0], tags);
        },
        downloadArtworkByMeta: async (meta, signal) => {
          var _a;
          downloader.dirHandleCheck();
          const downloadConfig = new BooruDownloadConfig(meta).create({
            folderTemplate: this.config.get("folderPattern"),
            filenameTemplate: this.config.get("filenamePattern"),
            cfClearance: (_a = this.config.get("auth")) == null ? undefined : _a.cf_clearance
          });
          await downloader.download(downloadConfig, { signal });
          const { id, tags, artist, title, rating, source: source2 } = meta;
          historyDb.add({
            pid: Number(id),
            user: artist,
            title,
            tags,
            rating,
            source: source2
          });
        },
        afterDownload: () => {
          this.blacklist && (this.blacklist = null);
        }
      }));
    }
    getSupportedTemplate() {
      return BooruDownloadConfig.supportedTemplate;
    }
    createThumbnailBtn(containers) {
      if (!containers.length) return;
      containers.forEach((el) => {
        const idMathch = new RegExp("(?<=\\/post\\/show\\/)\\d+|(?<=\\/post\\/browse#)\\d+").exec(el.href);
        if (!idMathch) return;
        const id = idMathch[0];
        const oldBtn = el.querySelector(ThumbnailButton.tagNameLowerCase);
        if (oldBtn) {
          if (oldBtn.dataset.id === id) return;
          oldBtn.remove();
        } else {
          if (el.href.includes("/post/show")) {
            el.style.height = "fit-content";
            if (!el.classList.contains("thumb")) {
              const image = el.querySelector("img");
              if (image.src.includes("blacklisted-preview.png")) return;
              image.onload = () => {
                if (image.src.includes("blacklisted-preview.png") && image.nextElementSibling) {
                  image.nextElementSibling.remove();
                }
              };
              el.style.marginBottom = "1em";
              image.style.marginBottom = "0px";
            }
          }
          el.parentElement.style.display = "flex";
          el.style.position = "relative";
        }
        el.appendChild(
          new ThumbnailButton({
            id,
            onClick: __privateMethod(this, _Moebooru_instances, downloadArtwork_fn).bind(this)
          })
        );
      });
    }
    createArtworkBtn(id) {
      const btnContainer = document.querySelector(
        "#post-view > .content > div:has(:is(img, video))"
      );
      if (!btnContainer) throw new Error("Can not find button container");
      btnContainer.style.position = "relative";
      btnContainer.style.width = "max-content";
      btnContainer.appendChild(
        new ArtworkButton({
          id,
          site: btnContainer.querySelector("video") ? "vjs_video" : "moebooru_image",
          onClick: __privateMethod(this, _Moebooru_instances, downloadArtwork_fn).bind(this)
        })
      );
    }
    createScrollerBtn() {
      const scrollerList = document.querySelector("ul.post-browser-posts");
      if (!scrollerList) return;
      const ob = new MutationObserver((records) => {
        const containers = [];
        records.forEach((record) => {
          if (!record.addedNodes.length) return;
          record.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            const thumbs = node.querySelectorAll("a.thumb");
            if (thumbs.length) containers.push(...thumbs);
          });
        });
        this.createThumbnailBtn(containers);
      });
      ob.observe(scrollerList, { subtree: true, childList: true });
    }
    createImageBrowseBtn() {
      const postId = document.querySelector("span.post-id");
      if (!postId) return;
      const createBtn = () => {
        var _a;
        (_a = document.querySelector(
          `${ThumbnailButton.tagNameLowerCase}[data-type="${ThumbnailBtnType.YandeBrowse}"]`
        )) == null ? undefined : _a.remove();
        const id = postId.textContent;
        if (!id) return;
        document.body.appendChild(
          new ThumbnailButton({
            id,
            type: ThumbnailBtnType.YandeBrowse,
            onClick: __privateMethod(this, _Moebooru_instances, downloadArtwork_fn).bind(this)
          })
        );
      };
      createBtn();
      new MutationObserver(createBtn).observe(postId, { childList: true });
    }
    inject() {
      super.inject();
      const pathname = location.pathname;
      const galleryMatch = pathname.match(new RegExp("(?<=\\/post\\/show\\/)\\d+"));
      if (galleryMatch) {
        this.createArtworkBtn(galleryMatch[0]);
      } else if (pathname === "/post/browse") {
        this.createScrollerBtn();
        this.createImageBrowseBtn();
      } else {
        const btnContainers = document.querySelectorAll(
          "a.thumb, div.post div.col1 a"
        );
        this.createThumbnailBtn(Array.from(btnContainers));
      }
    }
  }
  _Moebooru_instances = new WeakSet();
  /**
   * register
   * https://github.com/moebooru/moebooru/blob/master/app/javascript/src/legacy/post.coffee#L286
   */
  validityCallbackFactory_fn = function(checkValidity) {
    return async (data) => {
      const tags = data.tags.split(" ");
      tags.push("rating:" + data.rating.charAt(0));
      tags.push("status:" + data.status);
      return await checkValidity({ id: String(data.id), tags }) ? PostValidState.VALID : PostValidState.INVALID;
    };
  };
  buildMetaByGeneratorData_fn = function(data) {
    return this.parser.buildMeta(data, data.tagType);
  };
  getPopularDataFactory_fn = function(period) {
    return async () => {
      const htmlText = await this.api.getPopularHtmlByPeriod(period);
      const { posts, tags: tagType } = this.parser.parsePostsList(htmlText);
      const data = posts.map((post) => ({ ...post, tagType }));
      return {
        lastPage: true,
        data
      };
    };
  };
  downloadArtwork_fn = async function(btn2) {
    var _a;
    downloader.dirHandleCheck();
    const id = btn2.dataset.id;
    const htmlText = await this.api.getPostHtml(id);
    const { posts, tags: tagType, votes } = this.parser.parsePostAndPool(htmlText);
    const mediaMeta = this.parser.buildMeta(posts[0], tagType);
    const downloadConfig = new BooruDownloadConfig(mediaMeta).create({
      folderTemplate: this.config.get("folderPattern"),
      filenameTemplate: this.config.get("filenamePattern"),
      cfClearance: (_a = this.config.get("auth")) == null ? undefined : _a.cf_clearance,
      setProgress: (progress) => {
        btn2.setProgress(progress);
      }
    });
    if (this.config.get("addBookmark") && !this.parser.isFavorite(id, votes)) {
      const token = this.parser.parseCsrfToken();
      this.api.addFavorite(id, token).catch(logger.error);
    }
    await downloader.download(downloadConfig, { priority: 1 });
    const { tags, artist, title, rating, source: source2 } = mediaMeta;
    historyDb.add({
      pid: Number(id),
      user: artist,
      title,
      tags,
      rating,
      source: source2
    });
  };
  class Yande extends Moebooru {
    constructor() {
      super(...arguments);
      __publicField(this, "api", new MoebooruApi());
      __publicField(this, "parser", new MoebooruParser());
    }
    async getBlacklist() {
      const doc = await this.api.getBlacklistDoc();
      return this.parser.parseBlacklistByDoc(doc);
    }
    static get hostname() {
      return "yande.re";
    }
    getCustomConfig() {
      return {
        folderPattern: "yande/{artist}",
        filenamePattern: "{id}_{artist}_{character}"
      };
    }
  }
  class ATFbooru extends AbstractDanbooru {
    constructor() {
      super(...arguments);
      __publicField(this, "api", new DanbooruApi());
      __publicField(this, "parser", new DanbooruParser());
      __publicField(this, "commentaryAccessible");
    }
    static get hostname() {
      return "booru.allthefallen.moe";
    }
    getCustomConfig() {
      return {
        folderPattern: "ATFbooru/{artist}",
        filenamePattern: "{id}_{artist}_{character}"
      };
    }
    getAvatar() {
      return "/favicon.svg";
    }
    // check if user has permission to access artist commentary.
    async isCommentaryAccessible() {
      try {
        await this.api.getArtistCommentary("703816");
      } catch (error) {
        if (!(error instanceof RequestError)) return false;
        throw error;
      }
      return true;
    }
    async getMetaByPostId(id) {
      let mediaMeta;
      if (this.commentaryAccessible ?? (this.commentaryAccessible = await this.isCommentaryAccessible())) {
        const { post, comment: commentary } = await this.getPostAndComment(id);
        mediaMeta = this.parser.buildMetaByApi(post, commentary);
      } else {
        const doc = await this.api.getPostDoc(id);
        mediaMeta = this.parser.buildMetaByDoc(doc);
      }
      return mediaMeta;
    }
  }
  class Konachan extends Moebooru {
    constructor() {
      super(...arguments);
      __privateAdd(this, _Konachan_instances);
      __publicField(this, "api", new MoebooruApi());
      __publicField(this, "parser", new MoebooruParser());
    }
    async getBlacklist() {
      return this.parser.parseBlacklistByCookie();
    }
    static get hostname() {
      return ["konachan.com", "konachan.net"];
    }
    getCustomConfig() {
      return {
        folderPattern: "konachan/{artist}",
        filenamePattern: "{id}_{artist}_{character}",
        auth: {
          cf_clearance: ""
        }
      };
    }
    inject() {
      super.inject();
      if (/pool\/show\//.test(location.pathname)) {
        __privateMethod(this, _Konachan_instances, fixPoolImageStyle_fn).call(this);
      }
    }
  }
  _Konachan_instances = new WeakSet();
  fixPoolImageStyle_fn = function() {
    document.querySelectorAll("ul#post-list-posts li").forEach((el) => {
      el.style.width = "auto";
      const innerEl = el.firstElementChild;
      innerEl.style.width = "auto";
      innerEl.style.height = "auto";
    });
  };
  class Sakugabooru extends Moebooru {
    constructor() {
      super(...arguments);
      __publicField(this, "api", new MoebooruApi());
      __publicField(this, "parser", new MoebooruParser());
    }
    async getBlacklist() {
      const doc = await this.api.getBlacklistDoc();
      return this.parser.parseBlacklistByDoc(doc);
    }
    static get hostname() {
      return "www.sakugabooru.com";
    }
    getCustomConfig() {
      return {
        folderPattern: "sakugabooru/{artist}",
        filenamePattern: "{id}_{artist}_{character}"
      };
    }
  }
  class Safebooru extends GelbooruV020 {
    constructor() {
      super(...arguments);
      __publicField(this, "api", new GelbooruApiV020());
      __publicField(this, "parser", new GelbooruParserV020());
    }
    static get hostname() {
      return "safebooru.org";
    }
    getCustomConfig() {
      return {
        folderPattern: "safebooru/{artist}",
        filenamePattern: "{id}_{artist}_{character}",
        auth: {
          cf_clearance: ""
        }
      };
    }
    getThumbnailSelector() {
      return ".thumb:not(.blacklisted-image) > a:first-child";
    }
  }
  class GelbooruApiV025 extends GelbooruApiV020 {
    async getPosts() {
      throw new Error("This is a Gelbooru v0.2.0 method, do not use.");
    }
    async getPostsV025(params) {
      let url = "/index.php?page=dapi&s=post&q=index&json=1";
      Object.entries(params).forEach(([key, val]) => {
        if (typeof val === "number") {
          val = String(val);
        } else if (Array.isArray(val)) {
          val = val.join("+");
        }
        url += `&${key}=${val}`;
      });
      const res = await this.fetch(url);
      if (!res.ok) throw new RequestError(url, res.status);
      const postsListData = await res.json();
      if (postsListData.post) {
        return postsListData.post;
      } else {
        return [];
      }
    }
  }
  class Gelbooru extends GelbooruV020 {
    constructor() {
      super(...arguments);
      __publicField(this, "api", new GelbooruApiV025());
      __publicField(this, "parser", new GelbooruParserV020());
    }
    static get hostname() {
      return "gelbooru.com";
    }
    getCustomConfig() {
      return {
        folderPattern: "gelbooru/{artist}",
        filenamePattern: "{id}_{artist}_{character}"
      };
    }
    getAvatar() {
      return "/user_avatars/honkonymous.png";
    }
    getThumbnailSelector() {
      return '.thumb > a:first-child,     .thumbnail-preview > a[id],     .commentThumbnail > a:first-child,     .thumbnail-container > span[id] > a,     a:has(img[style*="max-height: 100px"]),     a:has(div.profileThumbnailPadding)';
    }
    setThumbnailStyle(btnContainer) {
      switch (true) {
        case this.isMyfavorites(): {
          btnContainer.setAttribute("style", "position: relative; display: inline-block;");
          break;
        }
        case this.isPool(): {
          btnContainer.setAttribute(
            "style",
            "position: relative; display: inline-block; margin: 10px;"
          );
          const image = btnContainer.querySelector("img");
          image.style.margin = "0px";
          image.style.padding = "0px";
          break;
        }
        case this.isPostsList(): {
          btnContainer.style.position = "relative";
          break;
        }
        case this.isPostView(): {
          btnContainer.setAttribute(
            "style",
            "position: relative; display: inline-block; margin: 10px;"
          );
          const image = btnContainer.querySelector("img");
          image.style.margin = "0px";
          break;
        }
        case this.isAccountProfile(): {
          btnContainer.setAttribute("style", "position: relative; display: inline-block");
          btnContainer.firstElementChild.style.padding = "0px";
          break;
        }
      }
    }
    createArtworkBtn(id) {
      let btnContainer = document.querySelector(".image-container > picture");
      if (btnContainer) {
        btnContainer.setAttribute("style", "position: relative; display: inline-block;");
      } else {
        const video = document.querySelector("#gelcomVideoPlayer");
        if (!video) return;
        btnContainer = document.createElement("div");
        btnContainer.setAttribute("style", "position: relative; width: fit-content; font-size: 0px;");
        video.parentElement.insertBefore(btnContainer, video);
        btnContainer.appendChild(video);
      }
      btnContainer.appendChild(
        new ArtworkButton({
          id,
          site: btnContainer.nodeName === "DIV" ? "native_video" : undefined,
          onClick: this.downloadArtwork.bind(this)
        })
      );
    }
    inject() {
      super.inject();
      if (this.isPostView()) this.createThumbnailBtn();
    }
  }
  class E621ngApi extends ApiBase {
    constructor(option) {
      super(option);
      __privateAdd(this, _authParams);
      const [username, apiKey] = option.authorization;
      const UA = `Pixiv Downloader/${"1.8.2"} (by drunkg00se on e621)`;
      __privateSet(this, _authParams, new URLSearchParams({ username, apiKey, _client: UA }));
    }
    updateAuthIfNeeded(username, apiKey) {
      username !== __privateGet(this, _authParams).get("username") && __privateGet(this, _authParams).set("username", username);
      apiKey !== __privateGet(this, _authParams).get("apiKey") && __privateGet(this, _authParams).set("apiKey", apiKey);
    }
    async getJSON(url, init2) {
      const fullUrl = new URL(url, location.origin);
      url += fullUrl.search === "" ? "?" : "&";
      url += __privateGet(this, _authParams).toString();
      logger.info("Fetch url:", url);
      const res = await this.fetch(url, init2);
      if (!res.ok) throw new RequestError(res.url, res.status);
      return await res.json();
    }
    getFavorites(params) {
      const searchParams = new URLSearchParams(
        Object.entries(params).map(([key, val]) => [key, String(val)])
      );
      return this.getJSON(`/favorites.json?${searchParams.toString()}`);
    }
    getPool(poolId) {
      return this.getJSON(`/pools/${poolId}.json`);
    }
    getPosts(params) {
      const { limit, page } = params;
      if (limit < 0 || limit > 320) throw new RangeError("limit should between 0 and 320.");
      if (page < 1 || page > 750) throw new RangeError("Page should between 1 and 750.");
      const searchParams = new URLSearchParams(
        Object.entries(params).map(
          ([key, val]) => typeof val === "string" ? [key, val] : [key, String(val)]
        )
      );
      return this.getJSON(`/posts.json?${searchParams.toString()}`);
    }
    getPost(id) {
      return this.getJSON(`/posts/${id}.json`);
    }
    getCurrentUserProfile(userId) {
      return this.getJSON(`/users/${userId}.json`);
    }
    async addFavorites(postId, token) {
      const res = await this.fetch(`/favorites.json?${__privateGet(this, _authParams).toString()}`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-csrf-token": token
        },
        body: `post_id=${postId}`
      });
      if (!res.ok) throw new RequestError("/favorites.json", res.status);
      return res.json();
    }
  }
  _authParams = new WeakMap();
  class E621ngParser extends ParserBase {
    buildMeta(postData) {
      const {
        id,
        file,
        tags: fullTags,
        description,
        created_at,
        rating,
        sources,
        score,
        is_favorited: isFavorited
      } = postData;
      const { ext, url, md5 } = file;
      if (!url) throw new Error(`Url can not be null: Post ${id}`);
      const tags = [];
      for (const [type, tagArr] of Object.entries(fullTags)) {
        tagArr.forEach((tag) => tags.push(`${type}:${tag}`));
      }
      return {
        id: String(id),
        src: url,
        extendName: ext,
        artist: ("artist" in fullTags ? fullTags.artist : fullTags.director).join(",") || "UnknownArtist",
        character: fullTags.character.join(",") || "UnknownCharacter",
        title: md5,
        comment: description,
        tags,
        createDate: created_at,
        score: score.total,
        source: sources.join("\n"),
        rating,
        isFavorited
      };
    }
    parseCsrfToken() {
      var _a;
      return (_a = document.head.querySelector('meta[name="csrf-token"]')) == null ? undefined : _a.content;
    }
    parseCurrentUserId() {
      var _a;
      return (_a = document.head.querySelector('meta[name="current-user-id"]')) == null ? undefined : _a.content;
    }
  }
  class E621ng extends SiteInject {
    constructor() {
      super();
      __privateAdd(this, _E621ng_instances);
      __publicField(this, "api");
      __publicField(this, "parser");
      __publicField(this, "profile");
      __publicField(this, "useBatchDownload", this.app.initBatchDownloader({
        metaType: {},
        avatar: "/packs/static/main-logo-2653c015c5870ec4ff08.svg",
        filterOption: {
          filters: [
            {
              id: "exclude_downloaded",
              type: "exclude",
              name: t("downloader.category.filter.exclude_downloaded"),
              checked: false,
              fn(meta) {
                return !!meta.id && historyDb.has(meta.id);
              }
            },
            {
              id: "allow_image",
              type: "include",
              name: t("downloader.category.filter.image"),
              checked: true,
              fn(meta) {
                return (
                  // https://e621.net/help/supported_filetypes
                  !!meta.extendName && /bmp|jp(e)?g|png|tif|gif|exif|svg|webp/i.test(meta.extendName)
                );
              }
            },
            {
              id: "allow_video",
              type: "include",
              name: t("downloader.category.filter.video"),
              checked: true,
              fn(meta) {
                return !!meta.extendName && /mp4|avi|mov|mkv|flv|wmv|webm|mpeg|mpg|m4v/i.test(meta.extendName);
              }
            }
          ],
          enableTagFilter: true
        },
        pageOption: {
          pool: {
            name: "Pool",
            match: () => __privateMethod(this, _E621ng_instances, isPoolView_fn).call(this),
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              var _a;
              const poolId = (_a = new RegExp("(?<=\\/pools\\/)[0-9]+").exec(location.pathname)) == null ? undefined : _a[0];
              if (!poolId) throw new Error("Invalid pool id");
              const postsPerPage = this.profile.per_page;
              const getPostsMetaByPage = async (page) => {
                const data = (await this.api.getPosts({
                  limit: postsPerPage,
                  page,
                  tags: `pool:${poolId} order:id`
                })).posts;
                return {
                  lastPage: data.length < postsPerPage,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostsMetaByPage,
                (data) => this.parser.buildMeta(data),
                __privateMethod(this, _E621ng_instances, validityCallbackFactory_fn2).call(this, checkValidity)
              );
            }
          },
          post_list: {
            name: "Posts",
            match: () => __privateMethod(this, _E621ng_instances, isPostsPage_fn).call(this),
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              const searchParam = new URLSearchParams(new URL(location.href).search);
              const tags = searchParam.get("tags") || "";
              const limit = +(searchParam.get("limit") || this.profile.per_page);
              const getPostsMetaByPage = async (page) => {
                const data = (await this.api.getPosts({
                  limit,
                  page,
                  tags
                })).posts;
                return {
                  lastPage: data.length < limit,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostsMetaByPage,
                (data) => this.parser.buildMeta(data),
                __privateMethod(this, _E621ng_instances, validityCallbackFactory_fn2).call(this, checkValidity)
              );
            }
          },
          favorites: {
            name: "Favorites",
            match: () => __privateMethod(this, _E621ng_instances, isFavoritesPage_fn).call(this),
            filterInGenerator: true,
            fn: (pageRange, checkValidity) => {
              const searchParam = new URLSearchParams(new URL(location.href).search);
              const limit = +(searchParam.get("limit") || this.profile.per_page);
              const userId = +(searchParam.get("user_id") || this.profile.id);
              if (!userId) throw new Error("Cannot get user id.");
              const getPostsMetaByPage = async (page) => {
                const data = (await this.api.getFavorites({
                  limit,
                  page,
                  user_id: userId
                })).posts;
                return {
                  lastPage: data.length < limit,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostsMetaByPage,
                (data) => this.parser.buildMeta(data),
                __privateMethod(this, _E621ng_instances, validityCallbackFactory_fn2).call(this, checkValidity)
              );
            }
          },
          pool_gallery_button: {
            name: "pool_gallery_button",
            match: () => false,
            filterInGenerator: true,
            fn: (pageRange, checkValidity, poolId) => {
              if (!poolId) throw new Error("Invalid pool id");
              const getPostsMetaByPage = async (page) => {
                const limit = this.profile.per_page;
                const data = (await this.api.getPosts({
                  limit,
                  page,
                  tags: `pool:${poolId}`
                })).posts;
                return {
                  lastPage: data.length < limit,
                  data
                };
              };
              return this.parser.paginationGenerator(
                pageRange,
                getPostsMetaByPage,
                (data) => this.parser.buildMeta(data),
                __privateMethod(this, _E621ng_instances, validityCallbackFactory_fn2).call(this, checkValidity)
              );
            }
          },
          show_downloader_in_pool_gallery: {
            name: "pool_gallery",
            match: /\/pools\/gallery/
          }
        },
        parseMetaByArtworkId: async (id) => {
          const { post } = await this.api.getPost(+id);
          return this.parser.buildMeta(post);
        },
        downloadArtworkByMeta: async (meta, signal) => {
          downloader.dirHandleCheck();
          const downloadConfig = new BooruDownloadConfig(meta).create({
            folderTemplate: this.config.get("folderPattern"),
            filenameTemplate: this.config.get("filenamePattern")
          });
          await downloader.download(downloadConfig, { priority: 1, signal });
          const { tags, artist, title, comment: comment2, source: source2, rating } = meta;
          historyDb.add({
            pid: Number(meta.id),
            user: artist,
            title,
            comment: comment2,
            tags,
            source: source2,
            rating
          });
        },
        beforeDownload: async () => {
          __privateMethod(this, _E621ng_instances, throwIfNotAuthorized_fn).call(this);
          const userId = this.parser.parseCurrentUserId();
          if (!userId) throw new Error("Cannot get user id.");
          this.profile = await this.api.getCurrentUserProfile(+userId);
        },
        afterDownload: () => {
          this.profile = null;
        }
      }));
      const { username, apiKey } = this.config.get("auth");
      this.api = new E621ngApi({
        rateLimit: 2,
        authorization: [username, apiKey]
      });
      this.parser = new E621ngParser();
      this.profile = null;
      this.config.subscribe((configData) => {
        const { username: username2, apiKey: apiKey2 } = configData.auth;
        this.api.updateAuthIfNeeded(username2, apiKey2);
      });
    }
    static get hostname() {
      return ["e621.net", "e926.net", "e6ai.net"];
    }
    getSupportedTemplate() {
      return BooruDownloadConfig.supportedTemplate;
    }
    getCustomConfig() {
      return {
        folderPattern: "e621/{artist}",
        filenamePattern: "{id}_{artist}_{character}",
        auth: {
          username: "",
          apiKey: ""
        }
      };
    }
    async downloadArtwork(btn2) {
      __privateMethod(this, _E621ng_instances, throwIfNotAuthorized_fn).call(this);
      downloader.dirHandleCheck();
      const id = +btn2.dataset.id;
      const { post } = await this.api.getPost(id);
      const mediaMeta = this.parser.buildMeta(post);
      const downloadConfig = new BooruDownloadConfig(mediaMeta).create({
        folderTemplate: this.config.get("folderPattern"),
        filenameTemplate: this.config.get("filenamePattern"),
        setProgress: (progress) => {
          btn2.setProgress(progress);
        }
      });
      if (this.config.get("addBookmark") && !post.is_favorited) {
        __privateMethod(this, _E621ng_instances, addFavorites_fn).call(this, id);
      }
      await downloader.download(downloadConfig, { priority: 1 });
      const { tags, artist, title, comment: comment2, source: source2, rating } = mediaMeta;
      historyDb.add({
        pid: id,
        user: artist,
        title,
        comment: comment2,
        tags,
        source: source2,
        rating
      });
    }
    createArtworkBtn() {
      const btnContainer = document.querySelector("#image-container");
      if (!btnContainer) return;
      btnContainer.style.width = "fit-content";
      btnContainer.style.position = "relative";
      const id = btnContainer.dataset.id;
      btnContainer.appendChild(
        new ArtworkButton({
          id,
          site: btnContainer.querySelector("video") ? "native_video" : undefined,
          onClick: this.downloadArtwork
        })
      );
    }
    createPoolThumbnailBtn() {
      const btnContainers = document.querySelectorAll("article.thumbnail > a");
      if (!btnContainers.length) return;
      btnContainers.forEach((el) => {
        var _a;
        const poolId = (_a = new RegExp("(?<=\\/pools\\/)[0-9]+").exec(el.href)) == null ? undefined : _a[0];
        if (!poolId) return;
        const { downloading, batchDownload } = this.useBatchDownload();
        const onClick = (btn22) => {
          const poolId2 = btn22.dataset.id;
          return batchDownload("pool_gallery_button", poolId2);
        };
        const btn2 = new DanbooruPoolButton({ id: poolId, downloading, onClick });
        el.style.position = "relative";
        el.appendChild(btn2);
      });
    }
    createThumbnailBtn() {
      const btnContainers = document.querySelectorAll("article.thumbnail > a");
      if (!btnContainers.length) return;
      btnContainers.forEach((el) => {
        var _a;
        const id = (_a = new RegExp("(?<=\\/posts\\/)[0-9]+").exec(el.href)) == null ? undefined : _a[0];
        if (!id) return;
        el.style.position = "relative";
        const btn2 = new ThumbnailButton({
          id,
          onClick: this.downloadArtwork
        });
        el.appendChild(btn2);
      });
    }
    inject() {
      super.inject();
      this.downloadArtwork = this.downloadArtwork.bind(this);
      if (__privateMethod(this, _E621ng_instances, isPostView_fn).call(this)) {
        this.createArtworkBtn();
      } else if (__privateMethod(this, _E621ng_instances, isPoolGallery_fn).call(this)) {
        this.createPoolThumbnailBtn();
      } else {
        this.createThumbnailBtn();
      }
    }
  }
  _E621ng_instances = new WeakSet();
  notice_fn = function(msg) {
    _unsafeWindow.Danbooru.Utility.notice(msg);
  };
  noticeError_fn = function(msg) {
    _unsafeWindow.Danbooru.Utility.error(msg);
  };
  isPoolGallery_fn = function() {
    return location.pathname === "/pools/gallery";
  };
  isPoolView_fn = function() {
    return /\/pools\/[0-9]+/.test(location.pathname);
  };
  isPostView_fn = function() {
    return /\/posts\/[0-9]+/.test(location.pathname);
  };
  isFavoritesPage_fn = function() {
    return location.pathname === "/favorites";
  };
  isPostsPage_fn = function() {
    return location.pathname === "/posts";
  };
  isAuthorized_fn = function() {
    const auth = this.config.get("auth");
    return auth && auth.username && auth.apiKey;
  };
  throwIfNotAuthorized_fn = function() {
    if (!__privateMethod(this, _E621ng_instances, isAuthorized_fn).call(this)) {
      const msg = "Please input your username and apiKey in setting.";
      __privateMethod(this, _E621ng_instances, noticeError_fn).call(this, msg);
      throw new Error(msg);
    }
  };
  validityCallbackFactory_fn2 = function(checkValidity) {
    return async (data) => {
      const { id, file, tags: fullTags } = data;
      const tags = [];
      for (const tagArr of Object.values(fullTags)) {
        tagArr.forEach((tag) => {
          tags.push(tag);
        });
      }
      return await checkValidity({
        id: String(id),
        extendName: file.ext,
        tags
      }) ? PostValidState.VALID : PostValidState.INVALID;
    };
  };
  addFavorites_fn = async function(id) {
    const csrfToken = this.parser.parseCsrfToken();
    if (!csrfToken) throw new Error("Cannot parse csrf-token.");
    try {
      __privateMethod(this, _E621ng_instances, notice_fn).call(this, `Updating posts: ${id}`);
      await this.api.addFavorites(id, csrfToken);
      __privateMethod(this, _E621ng_instances, notice_fn).call(this, `Favorite added: ${id}`);
    } catch (error) {
      __privateMethod(this, _E621ng_instances, noticeError_fn).call(this, `Failed to add favorite: ${id}. Reason: ${error}`);
      logger.error(error);
    }
  };
  class NijieParser extends ParserBase {
    constructor() {
      super(...arguments);
      __privateAdd(this, _NijieParser_instances);
    }
    buildMetaByView(id, doc) {
      var _a, _b, _c, _d;
      const [title, artist] = (((_a = doc.querySelector('meta[property="og:title"]')) == null ? undefined : _a.content) ?? "").split(" | ");
      const comment2 = ((_b = doc.querySelector(
        "#illust_text p, #dojin_text p:not(.title), #view-honbun > p.m-bottom15:not(.gray)"
      )) == null ? undefined : _b.textContent) ?? "";
      const src = doc.querySelector(
        "#img_filter :is(img, video), p.image img, #gallery_new img#view_img"
      ).src;
      const userId = (_d = (_c = doc.querySelector('a[href*="members_illust"]')) == null ? undefined : _c.href.match(new RegExp("(?<=id=)[0-9]+$"))) == null ? undefined : _d[0];
      if (!title || !artist || !src || !userId) throw new Error("Can not parse necessary data");
      const matchExt = src.match(new RegExp("(?<=\\.)[a-z0-9]{3,4}$", "i"));
      if (!matchExt) throw new Error("Can not parse ext.");
      const postDateMatch = /[0-9:\- ]+$/.exec(
        doc.querySelector("#view-honbun > p, #created").textContent
      );
      const goodCount = doc.querySelector("#good_cnt").textContent ?? 0;
      const tags = Array.from(doc.querySelectorAll("[tag_id].tag .tag_name")).map(
        (el) => el.textContent
      );
      const isBookmarked = !!doc.querySelector('a[href*="bookmark_edit"]');
      return {
        id,
        userId,
        src,
        extendName: matchExt[0],
        artist,
        title,
        tags,
        createDate: postDateMatch[0],
        comment: comment2,
        score: +goodCount,
        isBookmarked
      };
    }
    parseDiffSrcByDoc(doc) {
      return Array.from(
        doc.querySelectorAll(
          '#img_filter :is(img[src*="pic.nijie.net"], video)'
        )
      ).map((el) => {
        const src = el.src;
        const matchExt = src.match(new RegExp("(?<=\\.)[a-z0-9]{3,4}$", "i"));
        if (!matchExt) throw new Error("Can not parse ext.");
        return {
          src,
          extendName: matchExt[0]
        };
      });
    }
    mergeImageDiff(meta, diffs) {
      const src = [];
      const extendName = [];
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
    parseUserPageArtworkIdByDoc(doc) {
      const thumbnails = doc.querySelectorAll(
        '.mem-index .nijiedao > a[href^="/view.php?id="]'
      );
      return __privateMethod(this, _NijieParser_instances, parseIdByAnchors_fn).call(this, Array.from(thumbnails));
    }
    parseUserFeedArtworkIdByDoc(doc) {
      const thumbnails = doc.querySelectorAll(
        '#main-left-main [illust_id] .picture > a[href^="/view.php?id="]'
      );
      return __privateMethod(this, _NijieParser_instances, parseIdByAnchors_fn).call(this, Array.from(thumbnails));
    }
    parseHistoryIllustArtworkIdByDoc(doc) {
      const thumbnails = doc.querySelectorAll(
        '.history_block > .picture > a[href*="id="]:has(img)'
      );
      return __privateMethod(this, _NijieParser_instances, parseIdByAnchors_fn).call(this, Array.from(thumbnails));
    }
    parseHistoryNuitaArtworkIdByDoc(doc) {
      const thumbnails = doc.querySelectorAll(
        '#center_column div[illust_id].illust_list .picture a[href*="id="]:has(img)'
      );
      return __privateMethod(this, _NijieParser_instances, parseIdByAnchors_fn).call(this, Array.from(thumbnails));
    }
    parseOkiniiriArtworkIdByDoc(doc) {
      const thumbnails = doc.querySelectorAll(
        '#content_delete .picture a[href*="id="]:has(img)'
      );
      return __privateMethod(this, _NijieParser_instances, parseIdByAnchors_fn).call(this, Array.from(thumbnails));
    }
    parseSearchArtworkIdByDoc(doc) {
      const thumbnails = doc.querySelectorAll(
        '#main-left-main [illust_id] .picture a[href*="id="]:has(img)'
      );
      return __privateMethod(this, _NijieParser_instances, parseIdByAnchors_fn).call(this, Array.from(thumbnails));
    }
    docHasDiff(doc) {
      return !!doc.querySelector('a[href*="#diff_"]');
    }
    docIsDojin(doc) {
      return !!doc.querySelector("#dojin_left");
    }
    docHasNextPagination(doc) {
      return !!doc.querySelector('.page_button > a[rel="next"]');
    }
  }
  _NijieParser_instances = new WeakSet();
  parseIdByAnchors_fn = function(elems) {
    if (!elems.length) return [];
    return elems.map((el) => {
      const idMatch = new RegExp("(?<=id=)[0-9]+$").exec(el.href);
      return idMatch[0];
    });
  };
  class NijieApi extends ApiBase {
    getViewDoc(id) {
      return this.getDoc(`/view.php?id=${id}`);
    }
    getViewPopupDoc(id) {
      return this.getDoc(`/view_popup.php?id=${id}`);
    }
    getUserIllustsDoc(id, page) {
      return this.getDoc(`/members_illust.php?id=${id}&p=${page}`);
    }
    getUserDojinDoc(id) {
      return this.getDoc(`/members_dojin.php?id=${id}`);
    }
    getUserBookmarkDoc(id, page) {
      return this.getDoc(`/user_like_illust_view.php?p=${page}&id=${id}`);
    }
    getUserFeedDoc(page) {
      return this.getDoc(`/like_user_view.php?p=${page}`);
    }
    getHistoryIllustDoc() {
      return this.getDoc("/history_illust.php");
    }
    getHistoryNuitaDoc() {
      return this.getDoc("/history_nuita.php");
    }
    /**
     * @param id - The id of tag.
     * @param page
     * @param sort - 0: 新しくブクマした順; 1: 古くブクマした順
     */
    getOkiniiriDoc(id, page, sort) {
      return this.getDoc(`/okiniiri.php?p=${page}&id=${id}&sort=${sort}`);
    }
    getIllustSearchDoc(params) {
      const {
        mode = 0,
        type = "partial",
        sort = 0,
        illustType = 0,
        period = 0,
        userId = "0",
        word,
        page
      } = params;
      const searchParams = new URLSearchParams();
      searchParams.append("mode", String(mode));
      searchParams.append("type", String(type));
      searchParams.append("sort", String(sort));
      searchParams.append("illust_type", String(illustType));
      searchParams.append("period", String(period));
      searchParams.append("user_id", userId);
      searchParams.append("word", word);
      searchParams.append("p", String(page));
      return this.getDoc(`/search.php?${searchParams.toString()}`);
    }
    async addBookmark(id, tags) {
      const params = new URLSearchParams();
      params.append("id", id);
      params.append("tag", (tags == null ? undefined : tags.join(" ")) ?? "");
      const url = "/bookmark_add.php";
      const res = await this.fetch(url, {
        method: "POST",
        redirect: "manual",
        body: params
      });
      if (res.type !== "opaqueredirect") throw new RequestError(url, res.status);
    }
  }
  class NijieDownloadConfig extends MayBeMultiIllustsConfig {
    constructor(meta) {
      super(meta);
      __publicField(this, "userId");
      __publicField(this, "comment");
      __publicField(this, "score");
      this.userId = meta.userId;
      this.comment = meta.comment;
      this.score = meta.score;
    }
    static get supportedTemplate() {
      return {
        [SupportedTemplate.ID]: "{id}",
        [SupportedTemplate.ARTIST]: "{artist}",
        [SupportedTemplate.ARTISTID]: "{artistID}",
        [SupportedTemplate.DATE]: "{date} {date(YYYY-MM-DD)}",
        [SupportedTemplate.PAGE]: "{page}",
        [SupportedTemplate.SCORE]: "{score}: likeCount",
        [SupportedTemplate.TAGS]: "{tags}",
        [SupportedTemplate.TITLE]: "{title}"
      };
    }
    getZipComment() {
      return this.comment;
    }
    getTemplateData(data) {
      return {
        id: this.id,
        artist: this.normalizeString(this.artist) || this.userId,
        artistID: this.userId,
        date: this.createDate,
        score: String(this.score),
        title: this.normalizeString(this.title) || this.id,
        tags: this.tags.map((tag) => this.normalizeString(tag)).filter(Boolean).join("_"),
        ...data
      };
    }
    create(option) {
      const { filenameTemplate, folderTemplate, setProgress } = option;
      const index2 = "index" in option ? option.index : 0;
      return {
        taskId: this.getTaskId(),
        src: this.getSrc(index2),
        path: this.getSavePath(
          folderTemplate,
          filenameTemplate,
          this.getExt(index2),
          this.getTemplateData({ page: String(index2) })
        ),
        timeout: this.getDownloadTimeout(index2),
        onProgress: setProgress
      };
    }
    createMulti(option) {
      if (!this.isStringArray(this.src)) throw new Error(`Artwork ${this.id} only have one media.`);
      const { filenameTemplate, folderTemplate, setProgress } = option;
      const taskId = this.getTaskId();
      const onFileSaved = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;
      return this.src.map((src, i) => {
        return {
          taskId,
          src,
          path: this.getSavePath(
            folderTemplate,
            filenameTemplate,
            this.getExt(i),
            this.getTemplateData({ page: String(i) })
          ),
          timeout: this.getDownloadTimeout(),
          onFileSaved
        };
      });
    }
    createBundle(option) {
      if (!this.isStringArray(this.src) || !this.isStringArray(this.ext))
        throw new Error(`Artwork ${this.id} only have one media.`);
      const { filenameTemplate, folderTemplate, setProgress } = option;
      const taskId = this.getTaskId();
      const onXhrLoaded = setProgress ? this.getMultipleMediaDownloadCB(setProgress) : undefined;
      const path = this.getSavePath(
        folderTemplate,
        filenameTemplate,
        "zip",
        this.getTemplateData({
          page: String(this.src.length)
        })
      );
      const filenameTemplateWithPage = filenameTemplate.includes(`{${SupportedTemplate.PAGE}}`) ? filenameTemplate : filenameTemplate + `_{${SupportedTemplate.PAGE}}`;
      const filenames = this.src.map((_, i) => {
        return this.getSavePath(
          "",
          filenameTemplateWithPage,
          this.getExt(i),
          this.getTemplateData({ page: String(i) })
        );
      });
      return this.src.map((src, i) => {
        return {
          taskId,
          src,
          path,
          timeout: this.getDownloadTimeout(i),
          onXhrLoaded,
          beforeFileSave: this.handleBundleFactory(filenames),
          onError: this.handleBundleErrorFactory(),
          onAbort: this.handleBundleAbortFactory()
        };
      });
    }
  }
  class Nijie extends SiteInject {
    constructor() {
      super(...arguments);
      __privateAdd(this, _Nijie_instances);
      __publicField(this, "parser", new NijieParser());
      __publicField(this, "api", new NijieApi({ rateLimit: 3 }));
      __privateAdd(this, _searchParams, new URLSearchParams(location.search));
      __publicField(this, "useBatchDownload", this.app.initBatchDownloader({
        metaType: {},
        avatar: () => {
          const userAvatarImg = document.querySelector(
            'a[href*="members.php"].name img'
          );
          return userAvatarImg ? userAvatarImg.src : "/pic/icon/nijie.png";
        },
        filterOption: {
          filters: [
            {
              id: "exclude_downloaded",
              type: "exclude",
              name: t("downloader.category.filter.exclude_downloaded"),
              checked: false,
              fn(meta) {
                return !!meta.id && historyDb.has(meta.id);
              }
            },
            // nijie post may contain both image and video.
            {
              id: "allow_image",
              type: "include",
              name: t("downloader.category.filter.image"),
              checked: true,
              fn(meta) {
                if (meta.extendName === undefined) return false;
                if (Array.isArray(meta.extendName)) {
                  return meta.extendName.some((extendName) => regexp.imageExt.test(extendName));
                }
                return regexp.imageExt.test(meta.extendName);
              }
            },
            {
              id: "allow_video",
              type: "include",
              name: t("downloader.category.filter.video"),
              checked: true,
              fn(meta) {
                if (meta.extendName === undefined) return false;
                if (Array.isArray(meta.extendName)) {
                  return meta.extendName.some((extendName) => regexp.videoExt.test(extendName));
                }
                return regexp.videoExt.test(meta.extendName);
              }
            }
          ],
          enableTagFilter: true
        },
        pageOption: {
          illusts: {
            name: "投稿イラスト",
            match: (url) => __privateMethod(this, _Nijie_instances, isSupportedUserPage_fn).call(this, url),
            filterInGenerator: false,
            fn: (pageRange) => {
              const id = __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this);
              if (!id) throw new Error("Invalid user ID.");
              const getIllustData = async (page) => {
                const doc = await this.api.getUserIllustsDoc(id, page);
                return {
                  lastPage: !this.parser.docHasNextPagination(doc),
                  data: this.parser.parseUserPageArtworkIdByDoc(doc)
                };
              };
              return this.parser.paginationGenerator(pageRange, getIllustData, (data) => data);
            }
          },
          // dojin only have one page
          dojin: {
            name: "同人",
            match: (url) => __privateMethod(this, _Nijie_instances, isSupportedUserPage_fn).call(this, url),
            filterInGenerator: false,
            fn: () => {
              const id = __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this);
              if (!id) throw new Error("Invalid user ID.");
              return this.parser.paginationGenerator(
                [1, 1],
                async () => {
                  const doc = await this.api.getUserDojinDoc(id);
                  return {
                    lastPage: true,
                    data: this.parser.parseUserPageArtworkIdByDoc(doc)
                  };
                },
                (data) => data
              );
            }
          },
          // user_like_illust_view may not always have 48 illusts per page.
          bookmark: {
            name: "ブックマーク",
            match: (url) => __privateMethod(this, _Nijie_instances, isSupportedUserPage_fn).call(this, url),
            filterInGenerator: false,
            fn: (pageRange) => {
              const id = __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this);
              if (!id) throw new Error("Invalid user ID.");
              return this.parser.paginationGenerator(
                pageRange,
                async (page) => {
                  const doc = await this.api.getUserBookmarkDoc(id, page);
                  return {
                    lastPage: !this.parser.docHasNextPagination(doc),
                    data: this.parser.parseUserPageArtworkIdByDoc(doc)
                  };
                },
                (data) => data
              );
            }
          },
          feed: {
            name: "新着2次絵",
            match: /like_user_view\.php/,
            filterInGenerator: false,
            fn: (pageRange) => {
              return this.parser.paginationGenerator(
                pageRange,
                async (page) => {
                  const doc = await this.api.getUserFeedDoc(page);
                  return {
                    lastPage: !this.parser.docHasNextPagination(doc),
                    data: this.parser.parseUserFeedArtworkIdByDoc(doc)
                  };
                },
                (data) => data
              );
            }
          },
          nuita: {
            name: "抜いた",
            match: (url) => __privateMethod(this, _Nijie_instances, isSupportedHistoryPage_fn).call(this, url),
            filterInGenerator: false,
            fn: () => {
              return this.parser.paginationGenerator(
                [1, 1],
                async () => {
                  const doc = await this.api.getHistoryNuitaDoc();
                  return {
                    lastPage: true,
                    data: this.parser.parseHistoryNuitaArtworkIdByDoc(doc)
                  };
                },
                (data) => data
              );
            }
          },
          history: {
            name: "閲覧",
            match: (url) => __privateMethod(this, _Nijie_instances, isSupportedHistoryPage_fn).call(this, url),
            filterInGenerator: false,
            fn: () => {
              return this.parser.paginationGenerator(
                [1, 1],
                async () => {
                  const doc = await this.api.getHistoryIllustDoc();
                  return {
                    lastPage: true,
                    data: this.parser.parseHistoryIllustArtworkIdByDoc(doc)
                  };
                },
                (data) => data
              );
            }
          },
          okiniiri: {
            name: "お気に入り",
            match: /okiniiri\.php/,
            filterInGenerator: false,
            fn: (pageRange) => {
              const tagId = __privateGet(this, _searchParams).get("id") ?? "0";
              const sort = __privateGet(this, _searchParams).get("sort") ?? "0";
              if (sort !== "0" && sort !== "1")
                throw new RangeError('Invalid sort params, must be "0" or "1"');
              return this.parser.paginationGenerator(
                pageRange,
                async (page) => {
                  const doc = await this.api.getOkiniiriDoc(tagId, String(page), sort);
                  return {
                    lastPage: !this.parser.docHasNextPagination(doc),
                    data: this.parser.parseOkiniiriArtworkIdByDoc(doc)
                  };
                },
                (data) => data
              );
            }
          },
          userIllustTagSearch: {
            name: "イラスト検索",
            match: /search\.php.+user_id=[0-9]+/,
            filterInGenerator: false,
            fn: (pageRange) => {
              const mode = Number(__privateGet(this, _searchParams).get("mode"));
              const type = __privateGet(this, _searchParams).get("type") || undefined;
              const sort = Number(__privateGet(this, _searchParams).get("sort"));
              const illustType = Number(
                __privateGet(this, _searchParams).get("illust_type")
              );
              const period = Number(__privateGet(this, _searchParams).get("p"));
              const userId = __privateGet(this, _searchParams).get("user_id");
              const word = __privateGet(this, _searchParams).get("word") ?? "";
              if (!userId) throw new Error("User id is required.");
              return this.parser.paginationGenerator(
                pageRange,
                async (page) => {
                  const doc = await this.api.getIllustSearchDoc({
                    mode,
                    type,
                    sort,
                    illustType,
                    period,
                    userId,
                    word,
                    page
                  });
                  return {
                    lastPage: !this.parser.docHasNextPagination(doc),
                    data: this.parser.parseSearchArtworkIdByDoc(doc)
                  };
                },
                (data) => data
              );
            }
          }
        },
        parseMetaByArtworkId: async (id) => {
          const viewDoc = await this.api.getViewDoc(id);
          const meta = this.parser.buildMetaByView(id, viewDoc);
          if (this.parser.docHasDiff(viewDoc)) {
            const popupDoc = await this.api.getViewPopupDoc(id);
            const imgDiffSrcs = this.parser.parseDiffSrcByDoc(popupDoc);
            return this.parser.mergeImageDiff(meta, imgDiffSrcs);
          }
          return meta;
        },
        downloadArtworkByMeta: async (meta, signal) => {
          downloader.dirHandleCheck();
          const folderTemplate = this.config.get("folderPattern");
          const filenameTemplate = this.config.get("filenamePattern");
          const bundleIllusts = this.config.get("bundleIllusts");
          let downloadConfig;
          const option = { folderTemplate, filenameTemplate };
          if (Array.isArray(meta.src)) {
            downloadConfig = bundleIllusts ? new NijieDownloadConfig(meta).createBundle(option) : new NijieDownloadConfig(meta).createMulti(option);
          } else {
            downloadConfig = new NijieDownloadConfig(meta).create(option);
          }
          await downloader.download(downloadConfig, { signal });
          const { id, artist, userId, title, comment: comment2, tags } = meta;
          const historyData = {
            pid: Number(id),
            user: artist,
            userId: Number(userId),
            title,
            comment: comment2,
            tags
          };
          historyDb.add(historyData);
        }
      }));
    }
    static get hostname() {
      return "nijie.info";
    }
    getCustomConfig() {
      return {
        folderPattern: "nijie/{artist}",
        filenamePattern: "{artist}_{title}_{id}_p{page}"
      };
    }
    getSupportedTemplate() {
      return NijieDownloadConfig.supportedTemplate;
    }
    observeColorScheme() {
      document.querySelector('link[type="text/css"][href*="night_mode"]') && this.setAppDarkMode();
    }
    async downloadArtwork(btn2) {
      downloader.dirHandleCheck();
      const { id, page } = btn2.dataset;
      let viewDoc;
      let popupDoc;
      if (__privateMethod(this, _Nijie_instances, isViewPage_fn).call(this) && id === __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this)) {
        viewDoc = document;
      } else {
        viewDoc = await this.api.getViewDoc(id);
      }
      const meta = this.parser.buildMetaByView(id, viewDoc);
      const { userId, comment: comment2, tags, artist, title, isBookmarked } = meta;
      if (!isBookmarked && this.config.get("addBookmark")) {
        __privateMethod(this, _Nijie_instances, addBookmark_fn2).call(this, id, this.config.get("addBookmarkWithTags") ? tags : undefined);
      }
      let downloadConfig;
      const folderTemplate = this.config.get("folderPattern");
      const filenameTemplate = this.config.get("filenamePattern");
      const bundleIllusts = this.config.get("bundleIllusts");
      const pageNum = page ? +page : undefined;
      const setProgress = (progress) => {
        btn2.setProgress(progress);
      };
      const option = { folderTemplate, filenameTemplate, setProgress };
      if (pageNum === 0 || !this.parser.docHasDiff(viewDoc)) {
        downloadConfig = new NijieDownloadConfig(meta).create(option);
      } else {
        if (__privateMethod(this, _Nijie_instances, isViewPopupPage_fn).call(this) && id === __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this)) {
          popupDoc = document;
        } else {
          popupDoc = await this.api.getViewPopupDoc(id);
        }
        const imgDiffSrcs = this.parser.parseDiffSrcByDoc(popupDoc);
        const diffMeta = this.parser.mergeImageDiff(meta, imgDiffSrcs);
        if (pageNum) {
          downloadConfig = new NijieDownloadConfig(diffMeta).create({
            ...option,
            index: pageNum
          });
        } else {
          downloadConfig = bundleIllusts ? new NijieDownloadConfig(diffMeta).createBundle(option) : new NijieDownloadConfig(diffMeta).createMulti(option);
        }
      }
      await downloader.download(downloadConfig, { priority: 1 });
      const historyData = {
        pid: Number(id),
        user: artist,
        userId: Number(userId),
        title,
        comment: comment2,
        tags
      };
      if (page !== undefined) {
        historyData.page = Number(page);
      }
      historyDb.add(historyData);
    }
    createThumbnailBtn() {
      const btnStyle2 = {
        thumbnails: { selector: "p.nijiedao:has(> img.ngtag)", setStyle: undefined, diff: undefined },
        memberAndHotImage: {
          selector: "p.nijiedao > a:has(img.ngtag)",
          setStyle: (el) => {
            el.style.display = "inline-block";
          },
          diff: undefined
        },
        imgDiff: {
          selector: 'a[href*="#diff_"]:has(img.ngtag:not([data-original]))',
          // :not([data-original]): exclude dojin thumbnails
          setStyle: (el) => {
            const img = el.querySelector("img");
            const margin = getComputedStyle(img).margin;
            img.style.margin = "0px";
            el.style.display = "inline-block";
            el.style.margin = margin;
          },
          diff: (el) => {
            var _a;
            return (_a = new RegExp("(?<=#diff_)[0-9]+$").exec(el.href)) == null ? undefined : _a[0];
          }
        },
        dojinDiff: {
          selector: 'a[href*="#diff_"]:has(img[data-original].ngtag)',
          setStyle: (el) => {
            const img = el.querySelector("img");
            img.style.width = "auto";
            el.style.display = "inline-block";
          },
          diff: (el) => {
            var _a;
            return (_a = new RegExp("(?<=#diff_)[0-9]+$").exec(el.href)) == null ? undefined : _a[0];
          }
        },
        otherDojin: {
          selector: 'a[href*="id="]:has(>.other_dojin_block)',
          setStyle: (el) => {
            el.style.display = "block";
          },
          diff: undefined
        },
        similar: { selector: "#nuitahito li:has(img.ngtag)", setStyle: undefined, diff: undefined },
        // nuitahito
        // okazu
        rank: {
          selector: "p.illust:has(> img.ngtag)",
          setStyle: (el) => {
            const okazuThumbnailIcon = el.previousElementSibling;
            if (!okazuThumbnailIcon) return;
            okazuThumbnailIcon.style.zIndex = "1";
          },
          diff: undefined
        },
        dictionary: {
          selector: 'a[href*="id="]:has(> :is(img.tagsimage, img.mozamoza:not([illust_id])))',
          // .tagsimage: dictionary block in 'search.php'
          setStyle: (el) => {
            const img = el.querySelector("img");
            const width = getComputedStyle(img).width;
            el.style.width = width;
            img.style.width = "100%";
            el.style.display = "inline-block";
          },
          diff: undefined
        },
        responseOdai: {
          selector: '#response_odai li a[href*="id="]:has(img)',
          setStyle: (el) => {
            el.style.display = "inline-block";
          },
          diff: undefined
        },
        historyIllust: {
          selector: '.history_block > .picture > a[href*="id="]:has(img)',
          setStyle: (el) => {
            el.style.display = "inline-block";
          },
          diff: undefined
        }
      };
      for (const { selector, setStyle, diff } of Object.values(btnStyle2)) {
        const btnContainers = document.querySelectorAll(selector);
        if (!btnContainers.length) continue;
        btnContainers.forEach((container) => {
          if (container.querySelector(ThumbnailButton.tagNameLowerCase)) return;
          let id;
          if (container instanceof HTMLAnchorElement) {
            id = new RegExp("(?<=id=)[0-9]+").exec(container.href)[0];
          } else {
            const img = container.querySelector("img.ngtag");
            id = img.getAttribute("illust_id");
          }
          const page = diff == null ? undefined : diff(container);
          setStyle == null ? undefined : setStyle(container);
          container.style.position = "relative";
          container.appendChild(
            new ThumbnailButton({ id, page: page ? +page : undefined, onClick: this.downloadArtwork })
          );
        });
      }
    }
    createIllustSettingBtn() {
      const id = __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this);
      const container = document.querySelector("#illust_setting");
      if (!id || !container) return;
      container.appendChild(
        new ThumbnailButton({
          id,
          type: ThumbnailBtnType.NijieIllust,
          onClick: this.downloadArtwork
        })
      );
    }
    // sticky button does not work properly on 'view.php' due to `overflow: hidden` on ancestor `#main-center-none`
    createImgFilterBtn() {
      const id = __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this);
      const containers = document.querySelectorAll("#img_filter");
      if (!id || !containers.length) return;
      if (containers.length === 1) {
        if (containers[0].dataset.index) return;
        if (!document.querySelector('#img_diff > a[href*="diff_"]')) return;
      }
      containers.forEach((container, idx) => {
        const media = container.querySelector(
          'img[src*="pic.nijie.net"], video'
        );
        if (!media) return;
        const { marginBottom } = getComputedStyle(media);
        container.style.marginBottom = marginBottom;
        media.style.marginBottom = "0px";
        const filterImg = container.querySelector("img.filter");
        filterImg && (filterImg.style.zIndex = "auto");
        container.appendChild(new ArtworkButton({ id, page: idx, onClick: this.downloadArtwork }));
      });
    }
    createDojinHeaderBtn() {
      const container = document.querySelector("#dojin_header > .right > ul");
      const id = __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this);
      if (!container || !id) return;
      container.appendChild(
        new ThumbnailButton({ id, type: ThumbnailBtnType.NijieIllust, onClick: this.downloadArtwork })
      );
    }
    createDojinCoverBtn() {
      const container = document.querySelector(
        '#dojin_left .image > a[href*="view_popup"]'
      );
      const id = __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this);
      if (!container || !id) return;
      container.style.display = "inline-block";
      container.style.position = "relative";
      container.style.width = "fit-content";
      container.appendChild(new ArtworkButton({ id, page: 0, onClick: this.downloadArtwork }));
    }
    createOdaiBtn() {
      const id = __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this);
      const container = document.querySelector(
        "#gallery_new > p > a:has(img#view_img)"
      );
      if (!id || !container) return;
      const img = container.querySelector("img:not(.filter)");
      const { marginBottom } = getComputedStyle(img);
      img.style.marginBottom = "0px";
      container.style.marginBottom = marginBottom;
      container.style.display = "inline-block";
      container.style.position = "relative";
      container.appendChild(new ArtworkButton({ id, page: 0, onClick: this.downloadArtwork }));
    }
    observeOzakuListChange() {
      const ozakuList = document.querySelector("#okazu_list");
      if (!ozakuList) return;
      const observer2 = new MutationObserver(() => this.createThumbnailBtn());
      observer2.observe(ozakuList, { subtree: true, childList: true });
    }
    inject() {
      super.inject();
      this.downloadArtwork = this.downloadArtwork.bind(this);
      this.createThumbnailBtn();
      if (__privateMethod(this, _Nijie_instances, isViewPage_fn).call(this)) {
        this.createIllustSettingBtn();
        this.createImgFilterBtn();
        this.createDojinHeaderBtn();
        this.createDojinCoverBtn();
        this.createOdaiBtn();
      } else if (__privateMethod(this, _Nijie_instances, isViewPopupPage_fn).call(this)) {
        this.createIllustSettingBtn();
        this.createImgFilterBtn();
      } else if (__privateMethod(this, _Nijie_instances, isOkazuPage_fn).call(this)) {
        this.observeOzakuListChange();
      }
    }
  }
  _searchParams = new WeakMap();
  _Nijie_instances = new WeakSet();
  isViewPage_fn = function() {
    return location.pathname === "/view.php";
  };
  isViewPopupPage_fn = function() {
    return location.pathname === "/view_popup.php";
  };
  isOkazuPage_fn = function() {
    return location.pathname === "/okazu.php";
  };
  isSupportedUserPage_fn = function(url) {
    return /members\.php|members_illust\.php|members_dojin\.php|user_like_illust_view\.php/.test(
      url
    );
  };
  isSupportedHistoryPage_fn = function(url) {
    return /history_nuita\.php|history_illust\.php/.test(url);
  };
  getSearchId_fn = function() {
    return __privateGet(this, _searchParams).get("id");
  };
  addBookmark_fn2 = async function(id, tags) {
    var _a;
    try {
      await this.api.addBookmark(id, tags);
      if ((__privateMethod(this, _Nijie_instances, isViewPage_fn).call(this) || __privateMethod(this, _Nijie_instances, isViewPopupPage_fn).call(this)) && __privateMethod(this, _Nijie_instances, getSearchId_fn).call(this) === id) {
        const bookmarkBtn = document.querySelector("a#bukuma-do");
        if (!bookmarkBtn) return;
        bookmarkBtn.id = "bukuma";
        bookmarkBtn.setAttribute(
          "href",
          bookmarkBtn.getAttribute("href").replace("bookmark.php", "bookmark_edit.php")
        );
        (_a = bookmarkBtn.lastChild) == null ? void 0 : _a.remove();
        const text2 = document.createElement("span");
        text2.textContent = "ブックマーク編集";
        bookmarkBtn.appendChild(text2);
      }
    } catch (error) {
      logger.error(error);
    }
  };
  function getSiteInjector() {
    const sitesAdapters = [
      Pixiv,
      Danbooru,
      Rule34,
      Yande,
      ATFbooru,
      Konachan,
      Sakugabooru,
      Safebooru,
      Gelbooru,
      E621ng,
      Nijie
    ];
    const hostname = location.hostname;
    for (const sites of sitesAdapters) {
      if (typeof sites.hostname === "string") {
        if (hostname === sites.hostname) {
          return sites;
        }
      } else {
        if (sites.hostname.includes(hostname)) {
          return sites;
        }
      }
    }
  }
  const siteInject = getSiteInjector();
  siteInject && new siteInject().inject();

})(Dexie, dayjs, JSZip, GIF, WebMMuxer, Mp4Muxer);