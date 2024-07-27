// ==UserScript==
// @name               Pixiv Downloader
// @namespace          https://greasyfork.org/zh-CN/scripts/432150
// @version            1.0.2
// @author             ruaruarua
// @description        Pixiv | Danbooru | Rule34. 一键下载各页面原图。批量下载画师作品，按作品标签下载。转换动图格式：Gif | Apng | Webp | Webm | MP4。自定义图片文件名，保存路径。保留 / 导出下载历史。
// @description:zh-TW  Pixiv | Danbooru | Rule34. 一鍵下載各頁面原圖。批次下載畫師作品，按作品標籤下載。轉換動圖格式：Gif | Apng | Webp | Webm | MP4。自定義圖片檔名，儲存路徑。保留 / 匯出下載歷史。
// @description:en     Pixiv | Danbooru | Rule34. Download artworks with one click. Batch download artworks or download by tags. Convert ugoira formats: Gif | Apng | Webp | Webm | MP4. Customize image file name, save path. Save / export download history.
// @icon               https://www.pixiv.net/favicon.ico
// @match              https://www.pixiv.net/*
// @match              https://rule34.xxx/*
// @match              https://danbooru.donmai.us/*
// @require            https://unpkg.com/dexie@3.2.7/dist/dexie.min.js
// @require            https://unpkg.com/jszip@3.9.1/dist/jszip.min.js
// @require            https://unpkg.com/gif.js@0.2.0/dist/gif.js
// @require            https://unpkg.com/dayjs@1.11.11/dayjs.min.js
// @resource           ../wasm/toWebpWorker?raw    https://update.greasyfork.org/scripts/500281/1409041/libwebp_wasm.js
// @resource           gif.js/dist/gif.worker?raw  https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js
// @resource           pako?raw                    https://unpkg.com/pako@2.0.4/dist/pako.min.js
// @resource           upng-js?raw                 https://unpkg.com/upng-js@2.1.0/UPNG.js
// @connect            i.pximg.net
// @connect            rule34.xxx
// @connect            donmai.us
// @grant              GM_addStyle
// @grant              GM_download
// @grant              GM_getResourceText
// @grant              GM_info
// @grant              GM_registerMenuCommand
// @grant              GM_xmlhttpRequest
// @grant              unsafeWindow
// @noframes
// ==/UserScript==

(t=>{const r=new CSSStyleSheet;r.replaceSync(t),window._pdlShadowStyle=r})(` .anim-indeterminate.svelte-12wvf64{transform-origin:0% 50%;animation:svelte-12wvf64-anim-indeterminate 2s infinite linear}@keyframes svelte-12wvf64-anim-indeterminate{0%{transform:translate(0) scaleX(0)}40%{transform:translate(0) scaleX(.4)}to{transform:translate(100%) scaleX(.5)}}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}:host [data-theme=skeleton],:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}:host [data-theme=skeleton]{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h3{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}button,input,optgroup,select{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}dl,dd,h1,h3,hr,figure,p{margin:0}fieldset{margin:0;padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}input::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}[type=text],input:where(:not([type])),[type=email],[type=url],[type=password],[type=number],[type=date],[type=datetime-local],[type=month],[type=search],[type=tel],[type=time],[type=week],[multiple],select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff;border-color:#6b7280;border-width:1px;border-radius:0;padding:8px 12px;font-size:16px;line-height:24px;--tw-shadow: 0 0 #0000}[type=text]:focus,input:where(:not([type])):focus,[type=email]:focus,[type=url]:focus,[type=password]:focus,[type=number]:focus,[type=date]:focus,[type=datetime-local]:focus,[type=month]:focus,[type=search]:focus,[type=tel]:focus,[type=time]:focus,[type=week]:focus,[multiple]:focus,select:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-inset: var(--tw-empty, );--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: #2563eb;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);border-color:#2563eb}input::-moz-placeholder{color:#6b7280;opacity:1}input::placeholder{color:#6b7280;opacity:1}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-date-and-time-value{min-height:1.5em;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit,::-webkit-datetime-edit-year-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-minute-field,::-webkit-datetime-edit-second-field,::-webkit-datetime-edit-millisecond-field,::-webkit-datetime-edit-meridiem-field{padding-top:0;padding-bottom:0}select{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");background-position:right 8px center;background-repeat:no-repeat;background-size:1.5em 1.5em;padding-right:40px;-webkit-print-color-adjust:exact;print-color-adjust:exact}[multiple],[size]:where(select:not([size="1"])){background-image:initial;background-position:initial;background-repeat:unset;background-size:initial;padding-right:12px;-webkit-print-color-adjust:unset;print-color-adjust:unset}[type=checkbox],[type=radio]{-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;display:inline-block;vertical-align:middle;background-origin:border-box;-webkit-user-select:none;-moz-user-select:none;user-select:none;flex-shrink:0;height:16px;width:16px;color:#2563eb;background-color:#fff;border-color:#6b7280;border-width:1px;--tw-shadow: 0 0 #0000}[type=checkbox]{border-radius:0}[type=radio]{border-radius:100%}[type=checkbox]:focus,[type=radio]:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-inset: var(--tw-empty, );--tw-ring-offset-width: 2px;--tw-ring-offset-color: #fff;--tw-ring-color: #2563eb;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}[type=checkbox]:checked,[type=radio]:checked{border-color:transparent;background-color:currentColor;background-size:100% 100%;background-position:center;background-repeat:no-repeat}[type=checkbox]:checked{background-image:url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")}@media (forced-colors: active){[type=checkbox]:checked{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=radio]:checked{background-image:url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e")}@media (forced-colors: active){[type=radio]:checked{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=checkbox]:checked:hover,[type=checkbox]:checked:focus,[type=radio]:checked:hover,[type=radio]:checked:focus{border-color:transparent;background-color:currentColor}[type=checkbox]:indeterminate{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");border-color:transparent;background-color:currentColor;background-size:100% 100%;background-position:center;background-repeat:no-repeat}@media (forced-colors: active){[type=checkbox]:indeterminate{-webkit-appearance:auto;-moz-appearance:auto;appearance:auto}}[type=checkbox]:indeterminate:hover,[type=checkbox]:indeterminate:focus{border-color:transparent;background-color:currentColor}[type=file]{background:unset;border-color:inherit;border-width:0;border-radius:0;padding:0;font-size:unset;line-height:inherit}[type=file]:focus{outline:1px solid ButtonText;outline:1px auto -webkit-focus-ring-color}:host [data-theme=skeleton]{background-color:rgb(var(--color-surface-50));font-size:16px;line-height:24px;font-family:var(--theme-font-family-base);color:rgba(var(--theme-font-color-base))}:host .dark [data-theme=skeleton]{background-color:rgb(var(--color-surface-900));color:rgba(var(--theme-font-color-dark))}::-moz-selection{background-color:rgb(var(--color-primary-500) / .3)}::selection{background-color:rgb(var(--color-primary-500) / .3)}:host [data-theme=skeleton]{-webkit-tap-highlight-color:rgba(128,128,128,.5);scrollbar-color:rgba(0,0,0,.2) rgba(255,255,255,.05)}:host [data-theme=skeleton]{scrollbar-color:rgba(128,128,128,.5) rgba(0,0,0,.1);scrollbar-width:thin}:host.dark{scrollbar-color:rgba(255,255,255,.1) rgba(0,0,0,.05)}hr:not(.divider){display:block;border-top-width:1px;border-style:solid;border-color:rgb(var(--color-surface-300))}.dark hr:not(.divider){border-color:rgb(var(--color-surface-600))}fieldset,label{display:block}::-moz-placeholder{color:rgb(var(--color-surface-500))}::placeholder{color:rgb(var(--color-surface-500))}.dark ::-moz-placeholder{color:rgb(var(--color-surface-400))}.dark ::placeholder{color:rgb(var(--color-surface-400))}:is(.dark input::-webkit-calendar-picker-indicator){--tw-invert: invert(100%);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}input[type=search]::-webkit-search-cancel-button{-webkit-appearance:none;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z'/%3E%3C/svg%3E") no-repeat 50% 50%;pointer-events:none;height:16px;width:16px;border-radius:9999px;background-size:contain;opacity:0}input[type=search]:focus::-webkit-search-cancel-button{pointer-events:auto;opacity:1}:is(.dark input[type=search]::-webkit-search-cancel-button){--tw-invert: invert(100%);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}progress{webkit-appearance:none;-moz-appearance:none;-webkit-appearance:none;appearance:none;height:8px;width:100%;overflow:hidden;border-radius:var(--theme-rounded-base);background-color:rgb(var(--color-surface-400))}.dark progress{background-color:rgb(var(--color-surface-500))}progress::-webkit-progress-bar{background-color:rgb(var(--color-surface-400))}.dark progress::-webkit-progress-bar{background-color:rgb(var(--color-surface-500))}progress::-webkit-progress-value{background-color:rgb(var(--color-surface-900))}.dark progress::-webkit-progress-value{background-color:rgb(var(--color-surface-50))}::-moz-progress-bar{background-color:rgb(var(--color-surface-900))}.dark ::-moz-progress-bar{background-color:rgb(var(--color-surface-50))}:indeterminate::-moz-progress-bar{width:0}input[type=file]:not(.file-dropzone-input)::file-selector-button:disabled{cursor:not-allowed;opacity:.5}input[type=file]:not(.file-dropzone-input)::file-selector-button:disabled:hover{--tw-brightness: brightness(1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}input[type=file]:not(.file-dropzone-input)::file-selector-button:disabled:active{--tw-scale-x: 1;--tw-scale-y: 1;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}input[type=file]:not(.file-dropzone-input)::file-selector-button{font-size:14px;line-height:20px;padding:6px 12px;white-space:nowrap;text-align:center;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s;border-radius:var(--theme-rounded-base);background-color:rgb(var(--color-surface-900));color:rgb(var(--color-surface-50));margin-right:8px;border-width:0px}input[type=file]:not(.file-dropzone-input)::file-selector-button>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}input[type=file]:not(.file-dropzone-input)::file-selector-button:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}input[type=file]:not(.file-dropzone-input)::file-selector-button:active{--tw-scale-x: 95%;--tw-scale-y: 95%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));--tw-brightness: brightness(.9);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.dark input[type=file]:not(.file-dropzone-input)::file-selector-button{background-color:rgb(var(--color-surface-50));color:rgb(var(--color-surface-900))}[type=range]{width:100%;accent-color:rgb(var(--color-surface-900) / 1)}:is(.dark [type=range]){accent-color:rgb(var(--color-surface-50) / 1)}[data-sort]{cursor:pointer}[data-sort]:hover:hover,.dark [data-sort]:hover:hover{background-color:rgb(var(--color-primary-500) / .1)}[data-sort]:after{margin-left:8px!important;opacity:0;--tw-content: "\u2193" !important;content:var(--tw-content)!important}[data-popup]{position:absolute;top:0;left:0;display:none;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}:host [data-theme=skeleton]{--theme-font-family-base: system-ui;--theme-font-family-heading: system-ui;--theme-font-color-base: 0 0 0;--theme-font-color-dark: 255 255 255;--theme-rounded-base: 9999px;--theme-rounded-container: 8px;--theme-border-base: 1px;--on-primary: 0 0 0;--on-secondary: 255 255 255;--on-tertiary: 0 0 0;--on-success: 0 0 0;--on-warning: 0 0 0;--on-error: 255 255 255;--on-surface: 255 255 255;--color-primary-50: 219 245 236;--color-primary-100: 207 241 230;--color-primary-200: 195 238 224;--color-primary-300: 159 227 205;--color-primary-400: 87 207 167;--color-primary-500: 15 186 129;--color-primary-600: 14 167 116;--color-primary-700: 11 140 97;--color-primary-800: 9 112 77;--color-primary-900: 7 91 63;--color-secondary-50: 229 227 251;--color-secondary-100: 220 218 250;--color-secondary-200: 211 209 249;--color-secondary-300: 185 181 245;--color-secondary-400: 132 126 237;--color-secondary-500: 79 70 229;--color-secondary-600: 71 63 206;--color-secondary-700: 59 53 172;--color-secondary-800: 47 42 137;--color-secondary-900: 39 34 112;--color-tertiary-50: 219 242 252;--color-tertiary-100: 207 237 251;--color-tertiary-200: 195 233 250;--color-tertiary-300: 159 219 246;--color-tertiary-400: 86 192 240;--color-tertiary-500: 14 165 233;--color-tertiary-600: 13 149 210;--color-tertiary-700: 11 124 175;--color-tertiary-800: 8 99 140;--color-tertiary-900: 7 81 114;--color-success-50: 237 247 220;--color-success-100: 230 245 208;--color-success-200: 224 242 197;--color-success-300: 206 235 162;--color-success-400: 169 219 92;--color-success-500: 132 204 22;--color-success-600: 119 184 20;--color-success-700: 99 153 17;--color-success-800: 79 122 13;--color-success-900: 65 100 11;--color-warning-50: 252 244 218;--color-warning-100: 251 240 206;--color-warning-200: 250 236 193;--color-warning-300: 247 225 156;--color-warning-400: 240 202 82;--color-warning-500: 234 179 8;--color-warning-600: 211 161 7;--color-warning-700: 176 134 6;--color-warning-800: 140 107 5;--color-warning-900: 115 88 4;--color-error-50: 249 221 234;--color-error-100: 246 209 228;--color-error-200: 244 198 221;--color-error-300: 238 163 200;--color-error-400: 225 94 159;--color-error-500: 212 25 118;--color-error-600: 191 23 106;--color-error-700: 159 19 89;--color-error-800: 127 15 71;--color-error-900: 104 12 58;--color-surface-50: 228 230 238;--color-surface-100: 219 222 233;--color-surface-200: 210 214 227;--color-surface-300: 182 189 210;--color-surface-400: 128 140 177;--color-surface-500: 73 90 143;--color-surface-600: 66 81 129;--color-surface-700: 55 68 107;--color-surface-800: 44 54 86;--color-surface-900: 36 44 70}[data-theme=skeleton] h1,[data-theme=skeleton] h3{font-weight:700}[data-theme=skeleton]{background-image:radial-gradient(at 0% 0%,rgba(var(--color-secondary-500) / .33) 0px,transparent 50%),radial-gradient(at 98% 1%,rgba(var(--color-error-500) / .33) 0px,transparent 50%);background-attachment:fixed;background-position:center;background-repeat:no-repeat;background-size:cover}*{scrollbar-color:initial;scrollbar-width:initial}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }.container{width:100%}@media (min-width: 640px){.container{max-width:640px}}@media (min-width: 768px){.container{max-width:768px}}@media (min-width: 1024px){.container{max-width:1024px}}@media (min-width: 1280px){.container{max-width:1280px}}@media (min-width: 1536px){.container{max-width:1536px}}.h3{font-size:20px;line-height:28px;font-family:var(--theme-font-family-heading)}.anchor{--tw-text-opacity: 1;color:rgb(var(--color-primary-700) / var(--tw-text-opacity));text-decoration-line:underline}.anchor:hover{--tw-brightness: brightness(1.1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}:is(.dark .anchor){--tw-text-opacity: 1;color:rgb(var(--color-primary-500) / var(--tw-text-opacity))}.time{font-size:14px;line-height:20px;--tw-text-opacity: 1;color:rgb(var(--color-surface-500) / var(--tw-text-opacity))}:is(.dark .time){--tw-text-opacity: 1;color:rgb(var(--color-surface-400) / var(--tw-text-opacity))}.code{white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:12px;line-height:16px;--tw-text-opacity: 1;color:rgb(var(--color-primary-700) / var(--tw-text-opacity));background-color:rgb(var(--color-primary-500) / .3);border-radius:4px;padding:2px 4px}:is(.dark .code){--tw-text-opacity: 1;color:rgb(var(--color-primary-400) / var(--tw-text-opacity));background-color:rgb(var(--color-primary-500) / .2)}.del{position:relative;display:block;padding:2px 2px 2px 20px;text-decoration:none}.del:before{position:absolute;left:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.del:before{content:"\u2212"}.del{--tw-bg-opacity: 1;background-color:rgb(var(--color-error-500) / var(--tw-bg-opacity));font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;color:rgb(var(--on-error))}.alert{display:flex;flex-direction:column;align-items:flex-start;padding:16px;color:rgb(var(--color-surface-900));border-radius:var(--theme-rounded-container)}.alert>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(16px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(16px * var(--tw-space-y-reverse))}.dark .alert{color:rgb(var(--color-surface-50))}.\\!btn:disabled{cursor:not-allowed!important;opacity:.5!important}.btn:disabled,.btn-icon:disabled{cursor:not-allowed!important;opacity:.5!important}.\\!btn:disabled:hover{--tw-brightness: brightness(1) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.btn:disabled:hover,.btn-icon:disabled:hover{--tw-brightness: brightness(1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.\\!btn:disabled:active{--tw-scale-x: 1 !important;--tw-scale-y: 1 !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}.btn:disabled:active,.btn-icon:disabled:active{--tw-scale-x: 1;--tw-scale-y: 1;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.\\!btn{font-size:16px!important;line-height:24px!important;padding:9px 20px!important;white-space:nowrap!important;text-align:center!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;transition-property:all!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important;border-radius:var(--theme-rounded-base)!important}.btn{font-size:16px;line-height:24px;padding:9px 20px;white-space:nowrap;text-align:center;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s;border-radius:var(--theme-rounded-base)}.\\!btn>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0 !important;margin-right:calc(8px * var(--tw-space-x-reverse))!important;margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))!important}.btn>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}.\\!btn:hover{--tw-brightness: brightness(1.15) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.btn:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.\\!btn:active{--tw-scale-x: 95% !important;--tw-scale-y: 95% !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important;--tw-brightness: brightness(.9) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.btn:active{--tw-scale-x: 95%;--tw-scale-y: 95%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));--tw-brightness: brightness(.9);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.btn-sm{padding:6px 12px;font-size:14px;line-height:20px}.btn-icon{font-size:16px;line-height:24px;white-space:nowrap;text-align:center;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s;padding:0;aspect-ratio:1 / 1;width:43px;border-radius:9999px}.btn-icon>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}.btn-icon:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.btn-icon:active{--tw-scale-x: 95%;--tw-scale-y: 95%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));--tw-brightness: brightness(.9);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.btn-icon-sm{aspect-ratio:1 / 1;width:33px;font-size:14px;line-height:20px}.card{background-color:rgb(var(--color-surface-100));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000);--tw-ring-inset: inset;--tw-ring-color: rgb(23 23 23 / .05);border-radius:var(--theme-rounded-container)}.dark .card{background-color:rgb(var(--color-surface-800));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000);--tw-ring-inset: inset;--tw-ring-color: rgb(250 250 250 / .05)}a.card{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}a.card:hover{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.chip{cursor:pointer;white-space:nowrap;padding:6px 12px;text-align:center;font-size:12px;line-height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.chip>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}a.chip:hover,button.chip:hover{--tw-brightness: brightness(1.15);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.chip:disabled{cursor:not-allowed!important;opacity:.5!important}.chip:disabled:active{--tw-scale-x: 1;--tw-scale-y: 1;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.label>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.input,.select,.input-group{width:100%;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.2s;background-color:rgb(var(--color-surface-200));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;border-width:var(--theme-border-base);border-color:rgb(var(--color-surface-400))}.dark .input,.dark .select,.dark .input-group{background-color:rgb(var(--color-surface-700));border-color:rgb(var(--color-surface-500))}.input:hover,.select:hover,.input-group:hover{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.input:focus,.select:focus,.input-group:focus{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.input:focus-within,.select:focus-within,.input-group:focus-within{--tw-border-opacity: 1;border-color:rgb(var(--color-primary-500) / var(--tw-border-opacity))}.input,.input-group{border-radius:var(--theme-rounded-base)}.select{border-radius:var(--theme-rounded-container)}.select>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.select{padding:8px 32px 8px 8px}.select[size]{background-image:none}.select optgroup>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.select optgroup{font-weight:700}.select optgroup option{margin-left:0;padding-left:0}.select optgroup option:first-of-type{margin-top:12px}.select optgroup option:last-child{margin-bottom:12px!important}.select option{cursor:pointer;padding:8px 16px;background-color:rgb(var(--color-surface-200));border-radius:var(--theme-rounded-base)}.dark .select option{background-color:rgb(var(--color-surface-700))}.select option:checked{background:rgb(var(--color-primary-500)) linear-gradient(0deg,rgb(var(--color-primary-500)),rgb(var(--color-primary-500)));color:rgb(var(--on-primary))}.checkbox,.radio{height:20px;width:20px;cursor:pointer;border-radius:4px;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;background-color:rgb(var(--color-surface-200));border-width:var(--theme-border-base);border-color:rgb(var(--color-surface-400))}.dark .checkbox,.dark .radio{background-color:rgb(var(--color-surface-700));border-color:rgb(var(--color-surface-500))}.checkbox:hover,.radio:hover{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.checkbox:focus,.radio:focus{--tw-brightness: brightness(1.05);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);--tw-border-opacity: 1;border-color:rgb(var(--color-primary-500) / var(--tw-border-opacity))}.checkbox:checked,.checkbox:indeterminate,.radio:checked{--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity))}.checkbox:checked:hover,.checkbox:indeterminate:hover,.radio:checked:hover{--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity))}.checkbox:checked:focus,.checkbox:indeterminate:focus,.radio:checked:focus{--tw-bg-opacity: 1;background-color:rgb(var(--color-primary-500) / var(--tw-bg-opacity));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.radio{border-radius:var(--theme-rounded-base)}.input[type=file]{padding:4px}.input[type=color]{height:40px;width:40px;cursor:pointer;overflow:hidden;border-style:none;border-radius:var(--theme-rounded-base);-webkit-appearance:none}.input[type=color]::-webkit-color-swatch-wrapper{padding:0}.input[type=color]::-webkit-color-swatch{border-style:none}.input[type=color]::-webkit-color-swatch:hover{--tw-brightness: brightness(1.1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.input[type=color]::-moz-color-swatch{border-style:none}.input:disabled,.select:disabled,.input-group>input:disabled,.input-group>select:disabled{cursor:not-allowed!important;opacity:.5!important}.input:disabled:hover,.select:disabled:hover,.input-group>input:disabled:hover,.input-group>select:disabled:hover{--tw-brightness: brightness(1) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.input[readonly],.select[readonly]{cursor:not-allowed!important;border-color:transparent!important}.input[readonly]:hover,.select[readonly]:hover{--tw-brightness: brightness(1) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}.input-group{display:grid;overflow:hidden}.input-group input,.input-group select{border-width:0px;background-color:transparent;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important}.input-group select option{background-color:rgb(var(--color-surface-200))}.dark .input-group select option{background-color:rgb(var(--color-surface-700))}.input-group div,.input-group a,.input-group button{display:flex;align-items:center;justify-content:space-between;padding-left:16px;padding-right:16px}.input-group-divider input,.input-group-divider select,.input-group-divider div,.input-group-divider a{border-left-width:1px;border-color:rgb(var(--color-surface-400));--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;min-width:-moz-fit-content!important;min-width:fit-content!important}.dark .input-group-divider input,.dark .input-group-divider select,.dark .input-group-divider div,.dark .input-group-divider a{border-color:rgb(var(--color-surface-500))}.input-group-divider input:focus,.input-group-divider select:focus,.input-group-divider div:focus,.input-group-divider a:focus{border-color:rgb(var(--color-surface-400))}.dark .input-group-divider input:focus,.dark .input-group-divider select:focus,.dark .input-group-divider div:focus,.dark .input-group-divider a:focus{border-color:rgb(var(--color-surface-500))}.input-group-divider *:first-child{border-left-width:0px!important}.list{list-style-type:none}.list>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.list li{display:flex;align-items:center;border-radius:var(--theme-rounded-base)}.list li>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(16px * var(--tw-space-x-reverse));margin-left:calc(16px * calc(1 - var(--tw-space-x-reverse)))}.placeholder{height:20px;background-color:rgb(var(--color-surface-300));border-radius:var(--theme-rounded-base)}.dark .placeholder{background-color:rgb(var(--color-surface-600))}.w-modal{width:100%;max-width:640px}.modal *:focus:not([tabindex="-1"]):not(.input):not(.textarea):not(.select):not(.input-group):not(.input-group input){outline-style:auto;outline-color:-webkit-focus-ring-color}.variant-filled{background-color:rgb(var(--color-surface-900));color:rgb(var(--color-surface-50))}.dark .variant-filled{background-color:rgb(var(--color-surface-50));color:rgb(var(--color-surface-900))}.variant-ghost-surface{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000);--tw-ring-inset: inset;--tw-ring-opacity: 1;--tw-ring-color: rgb(var(--color-surface-500) / var(--tw-ring-opacity));background-color:rgb(var(--color-surface-500) / .2)}:is(.dark .variant-ghost-surface){--tw-ring-opacity: 1;--tw-ring-color: rgb(var(--color-surface-500) / var(--tw-ring-opacity));background-color:rgb(var(--color-surface-500) / .2)}.variant-soft,.variant-soft-surface{background-color:rgb(var(--color-surface-400) / .2);--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;color:rgb(var(--color-surface-700))}.dark .variant-soft,.dark .variant-soft-surface{color:rgb(var(--color-surface-200))}:is(.dark .variant-soft),:is(.dark .variant-soft-surface){background-color:rgb(var(--color-surface-500) / .2)}@media (min-width: 768px){.h3{font-size:24px;line-height:32px}}@media (min-width: 1024px){.alert{flex-direction:row;align-items:center}.alert>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(0px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(0px * var(--tw-space-y-reverse));--tw-space-x-reverse: 0;margin-right:calc(16px * var(--tw-space-x-reverse));margin-left:calc(16px * calc(1 - var(--tw-space-x-reverse)))}}.modal *:focus:not([tabindex="-1"]):not(.input):not(.textarea):not(.select):not(.input-group):not(.input-group input){outline-style:solid;outline-width:1px;outline-color:rgb(var(--color-surface-900) / 1)}.dark .modal *:focus:not([tabindex="-1"]):not(.input):not(.textarea):not(.select):not(.input-group):not(.input-group input){outline-color:rgb(var(--color-surface-50) / 1)}.visible{visibility:visible}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.bottom-0{bottom:0}.bottom-24{bottom:96px}.left-0{left:0}.right-0{right:0}.right-2{right:8px}.top-0{top:0}.top-2{top:8px}.z-\\[999\\]{z-index:999}.row-span-2{grid-row:span 2 / span 2}.row-start-1{grid-row-start:1}.m-auto{margin:auto}.mx-2{margin-left:8px;margin-right:8px}.ml-1{margin-left:4px}.ml-3{margin-left:12px}.ml-4{margin-left:16px}.mr-2{margin-right:8px}.mr-6{margin-right:24px}.mt-2{margin-top:8px}.mt-4{margin-top:16px}.block{display:block}.inline-block{display:inline-block}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.contents{display:contents}.hidden{display:none}.h-0{height:0px}.h-10{height:40px}.h-2{height:8px}.h-48{height:192px}.h-6{height:24px}.h-8{height:32px}.h-\\[38px\\]{height:38px}.h-auto{height:auto}.h-fit{height:-moz-fit-content;height:fit-content}.h-full{height:100%}.h-screen{height:100vh}.max-h-\\[200px\\]{max-height:200px}.min-h-full{min-height:100%}.w-0{width:0px}.w-12{width:48px}.w-16{width:64px}.w-20{width:80px}.w-32{width:128px}.w-48{width:192px}.w-6{width:24px}.w-8{width:32px}.w-\\[140px\\]{width:140px}.w-\\[38px\\]{width:38px}.w-\\[50\\%\\]{width:50%}.w-full{width:100%}.w-screen{width:100vw}.flex-1{flex:1 1 0%}.flex-auto{flex:1 1 auto}.flex-none{flex:none}.shrink-0{flex-shrink:0}.flex-grow{flex-grow:1}.-translate-x-full{--tw-translate-x: -100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-0{--tw-translate-x: 0px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-\\[calc\\(100\\%-44px\\)\\]{--tw-translate-x: calc(100% - 44px) ;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-full{--tw-translate-x: 100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.scale-\\[0\\.8\\]{--tw-scale-x: .8;--tw-scale-y: .8;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes spin{to{transform:rotate(360deg)}}.\\!cursor-default{cursor:default!important}.cursor-not-allowed{cursor:not-allowed}.cursor-pointer{cursor:pointer}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.list-inside{list-style-position:inside}.list-disc{list-style-type:disc}.grid-cols-\\[0px_1fr\\]{grid-template-columns:0px 1fr}.grid-cols-\\[140px_1fr\\]{grid-template-columns:140px 1fr}.grid-cols-\\[auto_1fr_auto\\]{grid-template-columns:auto 1fr auto}.grid-cols-\\[auto_1fr_auto_auto\\]{grid-template-columns:auto 1fr auto auto}.grid-rows-\\[auto_1fr\\]{grid-template-rows:auto 1fr}.flex-row{flex-direction:row}.flex-col{flex-direction:column}.items-center{align-items:center}.\\!items-stretch{align-items:stretch!important}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:4px}.gap-3{gap:12px}.gap-4{gap:16px}.space-x-2>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(8px * var(--tw-space-x-reverse));margin-left:calc(8px * calc(1 - var(--tw-space-x-reverse)))}.space-x-4>:not([hidden])~:not([hidden]){--tw-space-x-reverse: 0;margin-right:calc(16px * var(--tw-space-x-reverse));margin-left:calc(16px * calc(1 - var(--tw-space-x-reverse)))}.space-y-1>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(4px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(4px * var(--tw-space-y-reverse))}.space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(8px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(8px * var(--tw-space-y-reverse))}.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(16px * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(16px * var(--tw-space-y-reverse))}.divide-y-\\[1px\\]>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)));border-bottom-width:calc(1px * var(--tw-divide-y-reverse))}.self-start{align-self:flex-start}.overflow-hidden{overflow:hidden}.overflow-y-auto{overflow-y:auto}.overflow-y-hidden{overflow-y:hidden}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rounded{border-radius:4px}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:8px}.rounded-none{border-radius:0}.rounded-e-\\[4px\\]{border-start-end-radius:4px;border-end-end-radius:4px}.rounded-s-full{border-start-start-radius:9999px;border-end-start-radius:9999px}.border{border-width:1px}.\\!border-t-0{border-top-width:0px!important}.border-b{border-bottom-width:1px}.border-l{border-left-width:1px}.bg-surface-400{--tw-bg-opacity: 1;background-color:rgb(var(--color-surface-400) / var(--tw-bg-opacity))}.bg-surface-900{--tw-bg-opacity: 1;background-color:rgb(var(--color-surface-900) / var(--tw-bg-opacity))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity: 1;background-color:rgb(255 255 255 / var(--tw-bg-opacity))}.bg-white\\/30{background-color:#ffffff4d}.bg-white\\/75{background-color:#ffffffbf}.bg-scroll{background-attachment:scroll}.fill-current{fill:currentColor}.\\!p-0{padding:0!important}.p-1{padding:4px}.p-4{padding:16px}.px-4{padding-left:16px;padding-right:16px}.px-8{padding-left:32px;padding-right:32px}.py-1{padding-top:4px;padding-bottom:4px}.py-2{padding-top:8px;padding-bottom:8px}.py-6{padding-top:24px;padding-bottom:24px}.pb-6{padding-bottom:24px}.pl-6{padding-left:24px}.pr-2{padding-right:8px}.pr-4{padding-right:16px}.pr-6{padding-right:24px}.pt-4{padding-top:16px}.text-center{text-align:center}.text-2xl{font-size:24px;line-height:32px}.text-base{font-size:16px;line-height:24px}.text-sm{font-size:14px;line-height:20px}.text-xs{font-size:12px;line-height:16px}.font-bold{font-weight:700}.italic{font-style:italic}.leading-loose{line-height:2}.text-surface-400{--tw-text-opacity: 1;color:rgb(var(--color-surface-400) / var(--tw-text-opacity))}.underline-offset-2{text-underline-offset:2px}.accent-surface-900{accent-color:rgb(var(--color-surface-900) / 1)}.opacity-40{opacity:.4}.opacity-50{opacity:.5}.shadow{--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1);--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-xl{--tw-shadow: 0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1);--tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.-outline-offset-\\[3px\\]{outline-offset:-3px}.blur{--tw-blur: blur(8px);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.backdrop-blur-sm{--tw-backdrop-blur: blur(4px);-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-\\[grid-template-columns\\]{transition-property:grid-template-columns;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-\\[transform\\]{transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.delay-100{transition-delay:.1s}.duration-\\[200ms\\]{transition-duration:.2s}.bg-surface-backdrop-token{background-color:rgb(var(--color-surface-400) / .7)}.dark .bg-surface-backdrop-token{background-color:rgb(var(--color-surface-900) / .7)}.bg-surface-100-800-token{background-color:rgb(var(--color-surface-100))}.dark .bg-surface-100-800-token{background-color:rgb(var(--color-surface-800))}.bg-surface-200-700-token{background-color:rgb(var(--color-surface-200))}.dark .bg-surface-200-700-token{background-color:rgb(var(--color-surface-700))}.border-token{border-width:var(--theme-border-base)}.border-surface-400-500-token{border-color:rgb(var(--color-surface-400))}.dark .border-surface-400-500-token{border-color:rgb(var(--color-surface-500))}.border-surface-800-100-token{border-color:rgb(var(--color-surface-800))}.dark .border-surface-800-100-token{border-color:rgb(var(--color-surface-100))}.rounded-token{border-radius:var(--theme-rounded-base)}.rounded-container-token{border-radius:var(--theme-rounded-container)}.scrollbar-thin::-webkit-scrollbar-track{background-color:var(--scrollbar-track);border-radius:var(--scrollbar-track-radius)}.scrollbar-thin::-webkit-scrollbar-track:hover{background-color:var(--scrollbar-track-hover, var(--scrollbar-track))}.scrollbar-thin::-webkit-scrollbar-track:active{background-color:var(--scrollbar-track-active, var(--scrollbar-track-hover, var(--scrollbar-track)))}.scrollbar-thin::-webkit-scrollbar-thumb{background-color:var(--scrollbar-thumb);border-radius:var(--scrollbar-thumb-radius)}.scrollbar-thin::-webkit-scrollbar-thumb:hover{background-color:var(--scrollbar-thumb-hover, var(--scrollbar-thumb))}.scrollbar-thin::-webkit-scrollbar-thumb:active{background-color:var(--scrollbar-thumb-active, var(--scrollbar-thumb-hover, var(--scrollbar-thumb)))}.scrollbar-thin::-webkit-scrollbar-corner{background-color:var(--scrollbar-corner);border-radius:var(--scrollbar-corner-radius)}.scrollbar-thin::-webkit-scrollbar-corner:hover{background-color:var(--scrollbar-corner-hover, var(--scrollbar-corner))}.scrollbar-thin::-webkit-scrollbar-corner:active{background-color:var(--scrollbar-corner-active, var(--scrollbar-corner-hover, var(--scrollbar-corner)))}.scrollbar-thin{scrollbar-width:thin;scrollbar-color:var(--scrollbar-thumb, initial) var(--scrollbar-track, initial)}.scrollbar-thin::-webkit-scrollbar{display:block;width:8px;height:8px}.scrollbar-track-transparent{--scrollbar-track: transparent !important}.scrollbar-thumb-slate-400\\/50{--scrollbar-thumb: rgb(148 163 184 / .5) !important}.scrollbar-corner-transparent{--scrollbar-corner: transparent !important}.hover\\:variant-filled:hover{background-color:rgb(var(--color-surface-900));color:rgb(var(--color-surface-50))}.dark .hover\\:variant-filled:hover{background-color:rgb(var(--color-surface-50));color:rgb(var(--color-surface-900))}.hover\\:variant-soft:hover,.hover\\:variant-soft-surface:hover{background-color:rgb(var(--color-surface-400) / .2);--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;color:rgb(var(--color-surface-700))}.dark .hover\\:variant-soft:hover,.dark .hover\\:variant-soft-surface:hover{color:rgb(var(--color-surface-200))}:is(.dark .hover\\:variant-soft:hover){background-color:rgb(var(--color-surface-500) / .2)}:is(.dark .hover\\:variant-soft-surface:hover){background-color:rgb(var(--color-surface-500) / .2)}.\\[\\&\\:not\\(\\[disabled\\]\\)\\]\\:variant-soft-primary:not([disabled]){background-color:rgb(var(--color-primary-400) / .2);--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important;color:rgb(var(--color-primary-700))}.dark .\\[\\&\\:not\\(\\[disabled\\]\\)\\]\\:variant-soft-primary:not([disabled]){color:rgb(var(--color-primary-200))}:is(.dark .\\[\\&\\:not\\(\\[disabled\\]\\)\\]\\:variant-soft-primary:not([disabled])){background-color:rgb(var(--color-primary-500) / .2)}.\\*\\:\\!m-0>*{margin:0!important}.\\*\\:items-center>*{align-items:center}.\\*\\:\\!rounded-none>*{border-radius:0!important}.\\*\\:py-4>*{padding-top:16px;padding-bottom:16px}.\\*\\:border-surface-300-600-token>*{border-color:rgb(var(--color-surface-300))}.dark .\\*\\:border-surface-300-600-token>*{border-color:rgb(var(--color-surface-600))}.hover\\:translate-x-0:hover{--tw-translate-x: 0px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\\:text-xl:hover{font-size:20px;line-height:28px}.hover\\:opacity-100:hover{opacity:1}.hover\\:brightness-\\[105\\%\\]:hover{--tw-brightness: brightness(105%);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.focus\\:decoration-wavy:focus{text-decoration-style:wavy}.focus\\:\\!outline-none:focus{outline:2px solid transparent!important;outline-offset:2px!important}.disabled\\:cursor-wait:disabled{cursor:wait}.disabled\\:opacity-70:disabled{opacity:.7}.dark\\:bg-black\\/15:is(.dark *){background-color:#00000026}.dark\\:bg-surface-300:is(.dark *){--tw-bg-opacity: 1;background-color:rgb(var(--color-surface-300) / var(--tw-bg-opacity))}.dark\\:bg-surface-500\\/20:is(.dark *){background-color:rgb(var(--color-surface-500) / .2)}.dark\\:bg-surface-700:is(.dark *){--tw-bg-opacity: 1;background-color:rgb(var(--color-surface-700) / var(--tw-bg-opacity))}.dark\\:accent-surface-50:is(.dark *){accent-color:rgb(var(--color-surface-50) / 1)}.dark\\:hover\\:brightness-110:hover:is(.dark *){--tw-brightness: brightness(1.1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}@media (min-width: 768px){.md\\:h-\\[600px\\]{height:600px}.md\\:max-w-screen-md{max-width:768px}.md\\:max-w-screen-sm{max-width:640px}.md\\:flex-row{flex-direction:row}.md\\:\\!items-baseline{align-items:baseline!important}}@media (min-width: 1024px){.lg\\:max-w-screen-md{max-width:768px}}@media (min-width: 1280px){.xl\\:max-w-screen-lg{max-width:1024px}}.\\[\\&\\:last-child\\]\\:\\*\\:pt-4>*:last-child{padding-top:16px}.\\[\\&\\:not\\(\\:last-child\\)\\]\\:\\*\\:py-4>*:not(:last-child){padding-top:16px;padding-bottom:16px}.\\[\\&\\:not\\(\\[disabled\\]\\)\\]\\:hover\\:bg-slate-400\\/30:hover:not([disabled]){background-color:#94a3b84d} `);

(function (Dexie, dayjs, JSZip, GIF) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
  var _GM_download = /* @__PURE__ */ (() => typeof GM_download != "undefined" ? GM_download : void 0)();
  var _GM_info = /* @__PURE__ */ (() => typeof GM_info != "undefined" ? GM_info : void 0)();
  var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
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
      }
    };
  }
  const logger = getLogger();
  function sleep(delay) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }
  function wakeableSleep(delay) {
    let wake = () => void 0;
    const sleep2 = new Promise((r) => {
      setTimeout(r, delay);
      wake = r;
    });
    return {
      wake,
      sleep: sleep2
    };
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
  class RequestError extends Error {
    constructor(message, response) {
      super(message);
      __publicField(this, "response");
      this.name = "RequestError";
      this.response = response;
    }
  }
  class CancelError extends Error {
    constructor() {
      super("User aborted");
      this.name = "CancelError";
    }
  }
  class JsonDataError extends Error {
    constructor(msg) {
      super(msg);
      this.name = "JsonDataError";
    }
  }
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
    }
  };
  class FileSystemAccessHandler {
    constructor(channelName) {
      __publicField(this, "filenameConflictAction", "uniquify");
      __publicField(this, "updateDirHandleChannel");
      __publicField(this, "dirHandle");
      __publicField(this, "dirHandleStatus", 0);
      __publicField(this, "cachedTasks", []);
      __publicField(this, "duplicateFilenameCached", {});
      this.updateDirHandleChannel = new BroadcastChannel(channelName);
      this.updateDirHandleChannel.onmessage = (evt) => {
        const data2 = evt.data;
        switch (data2.kind) {
          case 1:
            this.dirHandleStatus = 1;
            logger.info("正在选择目录");
            break;
          case 0:
            logger.warn("取消更新dirHandle");
            if (this.dirHandle) {
              this.dirHandleStatus = 2;
              this.processCachedTasks();
            } else {
              this.dirHandleStatus = 0;
              this.rejectCachedTasks();
            }
            break;
          case 2:
            this.dirHandleStatus = 2;
            this.dirHandle = data2.handle;
            logger.info("更新dirHandle", this.dirHandle);
            this.processCachedTasks();
            break;
          case "request":
            if (this.dirHandle) {
              this.updateDirHandleChannel.postMessage({
                kind: "response",
                handle: this.dirHandle
              });
              logger.info("响应请求dirHandle");
            }
            break;
          case "response":
            if (!this.dirHandle) {
              if (this.dirHandleStatus === 0)
                this.dirHandleStatus = 2;
              this.dirHandle = data2.handle;
              logger.info("首次获取dirHandle", this.dirHandle);
            }
            break;
          default:
            throw new Error("Invalid data kind.");
        }
      };
      this.updateDirHandleChannel.postMessage({ kind: "request" });
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
        const [blob, downloadMeta, onSaveFullfilled, onSaveRejected] = this.cachedTasks[i];
        this.saveFile(blob, downloadMeta).then(onSaveFullfilled, onSaveRejected);
      }
      logger.info(`执行${length}个缓存任务`);
      if (this.cachedTasks.length > length) {
        this.cachedTasks = this.cachedTasks.slice(length);
      } else {
        this.cachedTasks.length = 0;
      }
    }
    rejectCachedTasks() {
      this.cachedTasks.forEach(([, , , onSaveRejected]) => onSaveRejected(new CancelError()));
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          types: [{ description: "Image file", accept: { ["image/" + ext]: ["." + ext] } }]
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
      const index = usedNameArr.indexOf(actualName);
      if (index === -1) return;
      usedNameArr.splice(index, 1);
      if (usedNameArr.length === 0) delete this.duplicateFilenameCached[duplicateName];
    }
    async updateDirHandle() {
      try {
        this.dirHandleStatus = 1;
        this.updateDirHandleChannel.postMessage({
          kind: 1
          /* picking */
        });
        this.dirHandle = await _unsafeWindow.showDirectoryPicker({ id: "pdl", mode: "readwrite" });
        logger.info("更新dirHandle", this.dirHandle);
        this.dirHandleStatus = 2;
        this.updateDirHandleChannel.postMessage({
          kind: 2,
          handle: this.dirHandle
        });
        this.processCachedTasks();
        return true;
      } catch (error) {
        logger.warn(error);
        this.updateDirHandleChannel.postMessage({
          kind: 0
          /* unpick */
        });
        if (this.dirHandle) {
          this.dirHandleStatus = 2;
          this.processCachedTasks();
        } else {
          this.dirHandleStatus = 0;
          this.rejectCachedTasks();
        }
        return false;
      }
    }
    getCurrentDirName() {
      var _a;
      return ((_a = this.dirHandle) == null ? void 0 : _a.name) ?? "";
    }
    isDirHandleNotSet() {
      return this.dirHandleStatus === 0;
    }
    setFilenameConflictAction(action) {
      this.filenameConflictAction = action;
    }
    async saveFile(blob, downloadMeta) {
      if (downloadMeta.isAborted) throw new CancelError();
      if (this.dirHandleStatus === 1) {
        let onSaveFullfilled;
        let onSaveRejected;
        const promiseExcutor = new Promise((resolve, reject) => {
          onSaveFullfilled = resolve;
          onSaveRejected = reject;
        });
        this.cachedTasks.push([blob, downloadMeta, onSaveFullfilled, onSaveRejected]);
        return promiseExcutor;
      }
      if (this.dirHandleStatus === 0) {
        const isSuccess = await this.updateDirHandle();
        if (!isSuccess) throw new TypeError("Failed to get dir handle.");
      }
      let currenDirHandle;
      let filename;
      const path = downloadMeta.config.path;
      const index = path.lastIndexOf("/");
      if (index === -1) {
        filename = path;
        currenDirHandle = this.dirHandle;
      } else {
        filename = path.slice(index + 1);
        currenDirHandle = await this.getDirHandleRecursive(path.slice(0, index));
      }
      if (downloadMeta.isAborted) throw new CancelError();
      const fileHandle = await this.getFilenameHandle(currenDirHandle, filename);
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
      this.clearFilenameCached(filename, fileHandle.name);
    }
  }
  const fsaHandler = new FileSystemAccessHandler("update_dir_channel");
  function gmDownload(blob, downloadMeta) {
    return new Promise((resolve, reject) => {
      if (downloadMeta.isAborted) return reject(new CancelError());
      const imgUrl = URL.createObjectURL(blob);
      const request = {
        url: URL.createObjectURL(blob),
        name: downloadMeta.config.path,
        onerror: (error) => {
          URL.revokeObjectURL(imgUrl);
          if (downloadMeta.isAborted) {
            resolve();
          } else {
            reject(
              new Error(
                `FileSave error: ${downloadMeta.config.path} because ${error.error} ${error.details ?? ""} `
              )
            );
          }
        },
        onload: () => {
          URL.revokeObjectURL(imgUrl);
          resolve();
        }
      };
      downloadMeta.abort = _GM_download(request).abort;
    });
  }
  function aDownload(blob, downloadMeta) {
    if (downloadMeta.isAborted) return Promise.reject(new CancelError());
    let path = downloadMeta.config.path;
    const separaterIndex = path.lastIndexOf("/");
    if (separaterIndex !== -1) path = path.slice(separaterIndex + 1);
    const dlEle = document.createElement("a");
    dlEle.href = URL.createObjectURL(blob);
    dlEle.download = path;
    dlEle.click();
    URL.revokeObjectURL(dlEle.href);
    return Promise.resolve();
  }
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
    TagLanguage2["TRADITIONAL_CHINESE"] = "zh-tw";
    TagLanguage2["ENGLISH"] = "en";
    return TagLanguage2;
  })(TagLanguage || {});
  function loadConfig(siteConfig2) {
    const defaultConfig = Object.freeze({
      version: "1.0.2",
      ugoiraFormat: "zip",
      folderPattern: "pixiv/{artist}",
      filenamePattern: "{artist}_{title}_{id}_p{page}",
      tagLang: "ja",
      showMsg: true,
      filterExcludeDownloaded: false,
      filterIllusts: true,
      filterManga: true,
      filterUgoira: true,
      bundleIllusts: false,
      bundleManga: false,
      addBookmark: false,
      addBookmarkWithTags: false,
      privateR18: false,
      useFileSystemAccess: false,
      fileSystemFilenameConflictAction: "uniquify",
      showPopupButton: true,
      gifQuality: 10,
      webmQuality: 95,
      losslessWebp: false,
      webpQuality: 95,
      webpMehtod: 4,
      pngColor: 256,
      "pdl-btn-self-bookmark-left": 100,
      "pdl-btn-self-bookmark-top": 76,
      "pdl-btn-left": 0,
      "pdl-btn-top": 100,
      ...siteConfig2
    });
    let config2;
    if (!localStorage.pdlSetting) {
      config2 = Object.assign({}, defaultConfig);
    } else {
      try {
        config2 = JSON.parse(localStorage.pdlSetting);
      } catch (error) {
        logger.error("Use default config because: ", error);
        config2 = Object.assign({}, defaultConfig);
      }
    }
    if (config2.version !== defaultConfig.version) {
      config2 = {
        ...defaultConfig,
        ...config2,
        version: defaultConfig.version,
        showMsg: true
      };
      localStorage.pdlSetting = JSON.stringify(config2);
    }
    return {
      get(key) {
        return config2[key] ?? defaultConfig[key];
      },
      set(key, value) {
        if (config2[key] !== value) {
          config2[key] = value;
          localStorage.pdlSetting = JSON.stringify(config2);
          logger.info("Config set:", key, value);
        }
      },
      getAll() {
        return config2;
      },
      update(newConfig) {
        config2 = newConfig;
        localStorage.pdlSetting = JSON.stringify(config2);
      }
    };
  }
  const hostname = location.hostname;
  let siteConfig;
  if (hostname === "rule34.xxx") {
    siteConfig = {
      folderPattern: "rule34/{artist}",
      filenamePattern: "{id}_{artist}_{character}"
    };
  } else if (hostname === "danbooru.donmai.us") {
    siteConfig = {
      folderPattern: "danbooru/{artist}",
      filenamePattern: "{id}_{artist}_{character}"
    };
  }
  const config = loadConfig(siteConfig);
  function gmDownloadDataUrl(blob, downloadMeta) {
    return readBlobAsDataUrl(blob).then((dataUrl) => {
      return new Promise((resolve, reject) => {
        if (downloadMeta.isAborted) return reject(new CancelError());
        const request = {
          url: dataUrl,
          name: downloadMeta.config.path,
          onerror: (error) => {
            if (downloadMeta.isAborted) {
              resolve();
            } else {
              reject(
                new Error(
                  `FileSave error: ${downloadMeta.config.path} because ${error.error} ${error.details ?? ""} `
                )
              );
            }
          },
          onload: () => {
            resolve();
          }
        };
        downloadMeta.abort = _GM_download(request).abort;
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
  function createDownloader() {
    const MAX_DOWNLOAD = 5;
    const MAX_RETRY = 3;
    const DOWNLOAD_INTERVAL = 500;
    let queue = [];
    let active2 = [];
    const cleanAndStartNext = (removeMeta, nextMeta) => {
      sleep(DOWNLOAD_INTERVAL).then(() => {
        active2.splice(active2.indexOf(removeMeta), 1);
        if (nextMeta) {
          active2.push(nextMeta);
          dispatchDownload(nextMeta);
        } else if (queue.length) {
          const meta = queue.shift();
          active2.push(meta);
          dispatchDownload(meta);
        }
      });
    };
    const errorHandlerFactory = (downloadMeta) => {
      return {
        ontimeout() {
          var _a;
          const { taskId, config: config2, isAborted } = downloadMeta;
          if (isAborted) return;
          downloadMeta.retry++;
          logger.error("Download timeout", downloadMeta.retry, ":", config2.src);
          if (downloadMeta.retry > MAX_RETRY) {
            const err = new Error(`Download failed: ${taskId} | ${config2.src}`);
            (_a = config2.onError) == null ? void 0 : _a.call(config2, err, config2);
            downloadMeta.reject(err);
            cleanAndStartNext(downloadMeta);
          } else {
            logger.info("Download retry:", downloadMeta.retry, config2.src);
            cleanAndStartNext(downloadMeta, downloadMeta);
          }
        },
        /* GM_download().abort() 会触发 onerror */
        onerror(error) {
          var _a;
          const { taskId, config: config2, isAborted } = downloadMeta;
          if (isAborted) return;
          let err;
          if ("status" in error && error.status === 429) {
            err = new RequestError("Too many request", error);
          } else {
            err = new Error(`Download failed. ID: ${taskId}. Reason: ${error.error}.`);
            logger.error(error);
          }
          (_a = config2.onError) == null ? void 0 : _a.call(config2, err, config2);
          downloadMeta.reject(err);
          cleanAndStartNext(downloadMeta);
        }
      };
    };
    const gmDownload2 = (downloadMeta, errHandler) => {
      const { taskId, config: config2 } = downloadMeta;
      const { ontimeout, onerror } = errHandler;
      return _GM_download({
        url: config2.src,
        name: config2.path,
        headers: config2.headers,
        ontimeout,
        onerror,
        // Firefox 参数只包含loaded, toal, estimatedEndTime(Chrome没有此参数), 且触发次数非常少
        onprogress(res) {
          var _a;
          if (res.loaded > 0 && res.total > 0) {
            const progress = Math.floor(res.loaded / res.total * 100);
            (_a = config2.onProgress) == null ? void 0 : _a.call(config2, progress, config2);
          }
        },
        onload() {
          var _a;
          cleanAndStartNext(downloadMeta);
          (_a = config2.onFileSaved) == null ? void 0 : _a.call(config2, config2);
          downloadMeta.resolve(taskId);
          logger.info("Download complete:", taskId, config2.path);
        }
      });
    };
    const xhr = (downloadMeta, errHandler) => {
      const { taskId, config: config2, timeout } = downloadMeta;
      const { ontimeout, onerror } = errHandler;
      const saveFile2 = fileSaveAdapters.getAdapter();
      return _GM_xmlhttpRequest({
        url: config2.src,
        timeout,
        method: "GET",
        headers: config2.headers,
        responseType: "blob",
        ontimeout,
        onerror,
        onprogress: (res) => {
          var _a;
          if (res.loaded > 0 && res.total > 0) {
            const progress = Math.floor(res.loaded / res.total * 100);
            (_a = config2.onProgress) == null ? void 0 : _a.call(config2, progress, config2);
          }
        },
        onload: async (e) => {
          var _a, _b, _c, _d;
          logger.info("Xhr complete:", config2.src);
          cleanAndStartNext(downloadMeta);
          if (downloadMeta.isAborted)
            return logger.warn("Download was canceled.", taskId, config2.path);
          (_a = config2.onXhrLoaded) == null ? void 0 : _a.call(config2, config2);
          try {
            let modRes;
            if (typeof config2.beforeFileSave === "function") {
              modRes = await config2.beforeFileSave(e.response, config2);
              if (modRes && !downloadMeta.isAborted) {
                await saveFile2(modRes, downloadMeta);
                (_b = config2.onFileSaved) == null ? void 0 : _b.call(config2, config2);
                logger.info("Download complete:", config2.path);
              }
            } else {
              await saveFile2(e.response, downloadMeta);
              (_c = config2.onFileSaved) == null ? void 0 : _c.call(config2, config2);
              logger.info("Download complete:", config2.path);
            }
            downloadMeta.resolve(downloadMeta.taskId);
          } catch (error) {
            (_d = config2.onError) == null ? void 0 : _d.call(config2, error, config2);
            downloadMeta.reject(error);
          }
        }
      });
    };
    const isDirectSaveConfig = (downloadMeta) => {
      return !!downloadMeta.config.directSave;
    };
    const dispatchDownload = (downloadMeta) => {
      logger.info("Start download:", downloadMeta.config.src);
      let abortObj;
      const errHandler = errorHandlerFactory(downloadMeta);
      if (isDirectSaveConfig(downloadMeta)) {
        abortObj = gmDownload2(downloadMeta, errHandler);
      } else {
        abortObj = xhr(downloadMeta, errHandler);
      }
      downloadMeta.abort = abortObj.abort;
    };
    return {
      get fileSystemAccessEnabled() {
        return fileSaveAdapters.isFileSystemAccessEnable();
      },
      /**
       * 下载触发后应该先弹窗选择文件保存位置，避免下载/转换用时过长导致错误
       * Must be handling a user gesture to show a file picker.
       * https://bugs.chromium.org/p/chromium/issues/detail?id=1193489
       */
      dirHandleCheck() {
        fileSaveAdapters.dirHandleCheck();
      },
      updateDirHandle() {
        return fileSaveAdapters.updateDirHandle();
      },
      getCurrentFsaDirName() {
        return fileSaveAdapters.getFsaDirName();
      },
      async download(configs) {
        logger.info("Downloader add:", configs);
        if (!Array.isArray(configs)) configs = [configs];
        if (configs.length < 1) return Promise.resolve([]);
        const promises = [];
        configs.forEach((config2) => {
          promises.push(
            new Promise((resolve, reject) => {
              const downloadMeta = {
                taskId: config2.taskId,
                config: config2,
                isAborted: false,
                retry: 0,
                timeout: config2.timeout,
                resolve,
                reject
              };
              queue.push(downloadMeta);
            })
          );
        });
        while (active2.length < MAX_DOWNLOAD && queue.length) {
          const meta = queue.shift();
          active2.push(meta);
          dispatchDownload(meta);
        }
        const results = await Promise.allSettled(promises);
        const resultIds = [];
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === "rejected") throw result.reason;
          resultIds.push(result.value);
        }
        return resultIds;
      },
      abort(taskIds) {
        if (typeof taskIds === "string") taskIds = [taskIds];
        if (!taskIds.length) return;
        logger.info("Downloader delete, active:", active2.length, "queue", queue.length);
        active2 = active2.filter((downloadMeta) => {
          var _a, _b, _c;
          if (taskIds.includes(downloadMeta.taskId) && !downloadMeta.isAborted) {
            downloadMeta.isAborted = true;
            (_a = downloadMeta.abort) == null ? void 0 : _a.call(downloadMeta);
            (_c = (_b = downloadMeta.config).onAbort) == null ? void 0 : _c.call(_b, downloadMeta.config);
            downloadMeta.reject(new CancelError());
            logger.warn("Download aborted:", downloadMeta.config.path);
          } else {
            return true;
          }
        });
        queue = queue.filter((downloadMeta) => !taskIds.includes(downloadMeta.taskId));
        while (active2.length < MAX_DOWNLOAD && queue.length) {
          const meta = queue.shift();
          active2.push(meta);
          dispatchDownload(meta);
        }
      }
    };
  }
  const downloader = createDownloader();
  class HistoryDb extends Dexie {
    constructor() {
      super("PdlHistory");
      __publicField(this, "history");
      this.version(2).stores({
        history: "pid, userId, user, title, *tags"
      });
    }
  }
  function createHistoryDb() {
    const db = new HistoryDb();
    let record;
    logger.time("loadDb");
    db.history.toArray().then((datas) => {
      record = new Set(datas.map((data2) => data2.pid));
      logger.timeEnd("loadDb");
    });
    return {
      async add(historyData) {
        if (!await this.has(historyData.pid)) {
          db.history.put(historyData);
          record.add(historyData.pid);
        }
      },
      bulkAdd(historyDatas) {
        const result = db.history.bulkPut(historyDatas);
        historyDatas.forEach((data2) => {
          record.add(data2.pid);
        });
        return result;
      },
      async has(pid) {
        if (typeof pid === "string") pid = Number(pid);
        if (record) {
          return record.has(pid);
        } else {
          return !!await db.history.get(pid);
        }
      },
      getAll() {
        return db.history.toArray();
      },
      clear() {
        record && (record = /* @__PURE__ */ new Set());
        return db.history.clear();
      }
    };
  }
  const historyDb = createHistoryDb();
  const rule34Parser = {
    async parse(id) {
      var _a, _b, _c, _d, _e, _f;
      const res = await fetch("index.php?page=post&s=view&id=" + id);
      if (!res.ok) throw new RequestError("Request failed with status code " + res.status, res);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const src = ((_a = doc.querySelector("#gelcomVideoPlayer > source")) == null ? void 0 : _a.src) || doc.querySelector('meta[property="og:image"]').getAttribute("content");
      const imageNameMatch = new RegExp("(?<=\\/)\\w+\\.\\w+(?=\\?)").exec(src);
      if (!imageNameMatch) throw new Error("Can not parse image name from src.");
      const imageName = imageNameMatch[0];
      const [title, extendName] = imageName.split(".");
      const artists = [];
      const characters = [];
      const tags = [];
      const tagEls = doc.querySelectorAll('li[class*="tag-type"]');
      tagEls.forEach((tagEl) => {
        var _a2;
        const tagTypeMatch = new RegExp("(?<=tag-type-)\\w+").exec(tagEl.className);
        if (!tagTypeMatch) throw new Error("Unknown tag: " + tagEl.className);
        const tagType = tagTypeMatch[0];
        const tag = ((_a2 = tagEl.querySelector('a[href*="page=post"]')) == null ? void 0 : _a2.textContent) || "";
        if (tagType === "artist") {
          artists.push(tag);
        } else if (tagType === "character") {
          characters.push(tag);
        }
        tags.push(tagType + ":" + tag);
      });
      const uploaderEl = doc.querySelector('a[href*="page=account&s=profile"]');
      const postDateStr = (_c = (_b = uploaderEl == null ? void 0 : uploaderEl.parentElement) == null ? void 0 : _b.firstChild) == null ? void 0 : _c.nodeValue;
      const postDate = postDateStr ? postDateStr.split(": ")[1] : "";
      const sourceEl = (_e = (_d = uploaderEl == null ? void 0 : uploaderEl.parentElement) == null ? void 0 : _d.nextElementSibling) == null ? void 0 : _e.nextElementSibling;
      if (sourceEl && ((_f = sourceEl.textContent) == null ? void 0 : _f.toLowerCase().includes("source"))) {
        const sourceLink = sourceEl.querySelector("a");
        if (sourceLink) {
          tags.push("source:" + sourceLink.href);
        } else {
          tags.push("source:" + sourceEl.textContent.replace("Source: ", ""));
        }
      }
      return {
        id,
        src,
        extendName,
        artist: artists.join(",") || "UnknownArtist",
        character: characters.join(",") || "UnknownCharacter",
        title,
        tags,
        createDate: postDate
      };
    }
  };
  const btnStyle = `.pdl-thumbnail{position:absolute;display:flex;justify-content:center;align-items:center;margin:0;padding:0;height:32px;width:32px;border:none;border-radius:4px;overflow:hidden;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;user-select:none;font-family:'win-bug-omega, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif';font-size:13px;font-weight:700;color:var(--pdl-green1);background-color:#ffffff80;top:calc((100% - 32px) * var(--pdl-btn-top) / 100);left:calc((100% - 32px) * var(--pdl-btn-left) / 100);z-index:1;cursor:pointer}.pdl-thumbnail:disabled{cursor:default}.pdl-thumbnail>svg{position:absolute;width:85%;height:85%;fill:var(--pdl-fill-svg);stroke:var(--pdl-fill-svg)}.pdl-thumbnail>span{opacity:0;transition:opacity .2s}.pdl-thumbnail>span.show{opacity:1}:host([type=gallery])::part(button){position:sticky;top:40px;left:0}:host([type=pixiv-my-bookmark])::part(button){top:calc((100% - 32px) * var(--pdl-btn-self-bookmark-top) / 100);left:calc((100% - 32px) * var(--pdl-btn-self-bookmark-left) / 100)}:host([type=pixiv-history])::part(button){z-index:auto}:host([type=pixiv-presentation])::part(button){position:fixed;top:50px;right:20px;left:auto}:host([type=pixiv-toolbar])::part(button){position:relative;top:auto;left:auto;background-color:transparent}:host([type=pixiv-manga-viewer])::part(button){top:80%;right:4px;left:auto}`;
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
    ThumbnailBtnType2["DanbooruPool"] = "danbooru-pool";
    return ThumbnailBtnType2;
  })(ThumbnailBtnType || {});
  class ThumbnailButton extends HTMLElement {
    constructor(props) {
      super();
      __publicField(this, "status");
      __publicField(this, "mediaId");
      __publicField(this, "page");
      __publicField(this, "type");
      __publicField(this, "onClick");
      this.status = "init";
      this.mediaId = props.id;
      this.page = props.page;
      this.type = props.type;
      this.onClick = props.onClick;
      this.render();
    }
    static get observedAttributes() {
      return ["status", "page", "disabled"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "status") {
        this.updateIcon(newValue);
      } else if (name === "page") {
        this.updatePage(newValue);
      } else {
        this.updateDisableStatus(newValue);
      }
    }
    updateDisableStatus(val) {
      const btn = this.shadowRoot.querySelector("button");
      if (typeof val === "string") {
        btn.setAttribute("disabled", "");
      } else {
        btn.removeAttribute("disabled");
      }
    }
    updatePage(page) {
      const pageNum = Number(page);
      if (!Number.isNaN(pageNum) && pageNum >= 0) {
        this.page = pageNum;
      }
    }
    updateIcon(status) {
      if (status === null || !(status in iconTypeMap)) return;
      const useEl = this.shadowRoot.querySelector("use");
      this.status = status;
      useEl.setAttribute("xlink:href", iconTypeMap[status]);
      useEl.animate(
        [
          {
            opacity: 0.5
          },
          {
            opactiy: 1
          }
        ],
        {
          duration: 200
        }
      );
    }
    render() {
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `    <style>${btnStyle}</style>${svgGroup}<button part="button" class="pdl-thumbnail">
      <svg xmlns="http://www.w3.org/2000/svg" class="pdl-icon">
        <use xlink:href="#pdl-download"></use>
      </svg>
      <span></span>
    </button>`;
      this.type !== "danbooru-pool" && historyDb.has(this.mediaId).then((downloaded) => {
        downloaded && this.setStatus(
          "complete"
          /* Complete */
        );
      });
      this.setAttribute("pdl-id", this.mediaId);
      this.page !== void 0 && !Number.isNaN(this.page) && this.setAttribute("page", String(this.page));
      this.type && this.setAttribute("type", this.type);
    }
    connectedCallback() {
      this.shadowRoot.lastElementChild.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
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
      });
    }
    setProgress(progress, updateProgressbar = true) {
      if (progress < 0 || progress > 100) throw new RangeError('Value "progress" must between 0-100');
      const shadowRoot = this.shadowRoot;
      const span = shadowRoot.querySelector("span");
      if (this.status !== "progress") {
        this.setAttribute(
          "status",
          "progress"
          /* Progress */
        );
        span.classList.toggle("show");
      }
      span.textContent = String(Math.floor(progress));
      if (!updateProgressbar) return;
      const svg = shadowRoot.querySelector("svg.pdl-icon");
      const radius = 224;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - progress / 100 * circumference;
      svg.style.strokeDashoffset = String(offset);
    }
    removeProgress() {
      const shadowRoot = this.shadowRoot;
      const span = shadowRoot.querySelector("span");
      const svg = shadowRoot.querySelector("svg.pdl-icon");
      span.classList.toggle("show");
      span.addEventListener(
        "transitionend",
        () => {
          span.textContent = "";
        },
        { once: true }
      );
      svg.style.removeProperty("stroke-dashoffset");
      if (this.status === "progress")
        this.setAttribute(
          "status",
          "init"
          /* Init */
        );
    }
    setStatus(status) {
      if (status !== this.status) {
        if (status === "progress") {
          this.setProgress(0);
          return;
        }
        if (this.status === "progress") {
          this.removeProgress();
        }
        this.setAttribute("status", status);
      }
    }
  }
  customElements.define("pdl-button", ThumbnailButton);
  class DownloadConfigBuilder {
    constructor(meta) {
      this.meta = meta;
    }
    normalizeString(str) {
      return replaceInvalidChar(unescapeHtml(str));
    }
    getFolderPattern() {
      return config.get("folderPattern");
    }
    getFilenamePattern() {
      return config.get("filenamePattern");
    }
    getFullpathPattern() {
      const folder = this.getFolderPattern();
      const filename = this.getFilenamePattern() + "." + this.meta.extendName;
      return folder ? folder + "/" + filename : filename;
    }
    isBrowserApi() {
      return env.isBrowserDownloadMode();
    }
    isFsaEnable() {
      return downloader.fileSystemAccessEnabled;
    }
    supportSubpath() {
      return this.isBrowserApi() || this.isFsaEnable();
    }
    isImage() {
      return /bmp|jp(e)?g|png|tif|gif|exif|svg|webp/i.test(this.meta.extendName);
    }
    buildFilePath() {
      const path = this.getFullpathPattern();
      const { id, createDate } = this.meta;
      let { artist, title, tags } = this.meta;
      artist = this.normalizeString(artist);
      title = this.normalizeString(title);
      tags = tags.map((tag) => this.normalizeString(tag));
      const replaceDate = (match, p1) => {
        const format = p1 || "YYYY-MM-DD";
        return dayjs(createDate).format(format);
      };
      return path.replaceAll(/\{date\((.*?)\)\}|\{date\}/g, replaceDate).replaceAll("{artist}", artist).replaceAll("{title}", title).replaceAll("{tags}", tags.join("_")).replaceAll("{id}", id);
    }
  }
  function artworkProgressFactory$1(btn) {
    if (!btn) return;
    return function onArtworkProgress(progress) {
      btn.setProgress(progress);
    };
  }
  class Rule34DownloadConfig extends DownloadConfigBuilder {
    constructor(meta) {
      super(meta);
      this.meta = meta;
    }
    getDownloadConfig(btn) {
      return {
        taskId: Math.random().toString(36).slice(2),
        src: this.meta.src,
        path: this.buildFilePath(),
        source: this.meta,
        timeout: this.isImage() ? 6e4 : void 0,
        // GM_download下载带cf_clearance cookie
        directSave: downloader.fileSystemAccessEnabled ? false : true,
        onProgress: artworkProgressFactory$1(btn)
      };
    }
    buildFilePath() {
      const path = super.buildFilePath();
      return path.replaceAll("{character}", this.normalizeString(this.meta.character));
    }
  }
  function addBookmark$2(id) {
    _unsafeWindow.addFav(id);
  }
  async function downloadArtwork$2(btn) {
    downloader.dirHandleCheck();
    const id = btn.getAttribute("pdl-id");
    const mediaMeta = await rule34Parser.parse(id);
    const { tags, artist, title } = mediaMeta;
    const downloadConfigs = new Rule34DownloadConfig(mediaMeta).getDownloadConfig(btn);
    config.get("addBookmark") && addBookmark$2(id);
    await downloader.download(downloadConfigs);
    const historyData = {
      pid: Number(id),
      user: artist,
      title,
      tags
    };
    historyDb.add(historyData);
  }
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
          export: "导出",
          import: "导入",
          clear: "清理"
        },
        options: {
          export_as_json: "将下载历史导出为JSON文件",
          export_as_csv: "将下载历史导出为CSV文件",
          import_json: "导入JSON格式下载历史",
          clear_history: "清除下载历史"
        },
        button: {
          export: "导出记录",
          import: "导入记录",
          clear: "清除记录"
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
      others: {
        title: "其它",
        options: {
          show_setting_button: "显示设置按钮",
          bundle_multipage_illust: "将多页插图打包为zip压缩包",
          bundle_manga: "将漫画作品打包为zip压缩包",
          add_bookmark_when_download: "下载单个作品时收藏作品",
          add_bookmark_with_tags: "收藏时添加作品标签",
          add_bookmark_private_r18: "将R-18作品收藏到不公开类别"
        }
      },
      feedback: {
        title: "反馈 / 赞赏",
        label: {
          feedback: "反馈",
          donate: "赞赏"
        },
        text: {
          feedback_desc: `				如果你在使用中发现了问题或有改进建议，欢迎到<a
					href="https://sleazyfork.org/zh-CN/scripts/432150-pixiv-downloader/feedback"
					target="_blank"
					class=" anchor">此链接</a
				>反馈。`,
          donate_desc: "如果脚本有帮助到你，欢迎扫码请我喝杯可乐 ^_^"
        }
      }
    },
    button: {
      setting: "设置",
      download_stop: "停止",
      download_works: "作品",
      download_bookmarks: "收藏",
      download_bookmarks_public: "公开",
      download_bookmarks_private: "不公开",
      download_all_one_page: "全部（单页）",
      download_all: "全部（批量）",
      download_r18_one_page: "R-18（单页）",
      download_r18: "R-18（批量）"
    },
    checkbox: {
      filter_exclude_downloaded: "排除已下载图片",
      filter_illusts: "插画",
      filter_manga: "漫画",
      filter_ugoira: "动图"
    },
    text: {
      confirm_clear_history: "真的要清除历史记录吗？"
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
          export: "Export",
          import: "Import",
          clear: "Clear"
        },
        options: {
          export_as_json: "Export download history as JSON file",
          export_as_csv: "Export download history as CSV file",
          import_json: "Import JSON format download history",
          clear_history: "Clear download history"
        },
        button: {
          export: "Export",
          import: "Import",
          clear: "Clear"
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
      others: {
        title: "Others",
        options: {
          show_setting_button: "Show Setting Button",
          bundle_multipage_illust: "Bundle multipage illustrations into a zip file",
          bundle_manga: "Bundle manga into a zip file",
          add_bookmark_when_download: "Bookmark artwork when downloading",
          add_bookmark_with_tags: "Add tags when bookmarking",
          add_bookmark_private_r18: "Bookmark R-18 artwork as private"
        }
      },
      feedback: {
        title: "Feedback",
        label: {
          feedback: "Feedback",
          donate: "Donate"
        },
        text: {
          feedback_desc: `If you encounter any issues or have suggestions for improvements, feel free to provide feedback <a href="https://sleazyfork.org/zh-CN/scripts/432150-pixiv-downloader/feedback" target="_blank" class=" anchor">here</a>.`,
          donate_desc: "如果脚本有帮助到你，欢迎扫码请我喝杯可乐 ^_^"
        }
      }
    },
    button: {
      setting: "Setting",
      download_stop: "Stop",
      download_works: "Works",
      download_bookmarks: "Bookmarks",
      download_bookmarks_public: "Public",
      download_bookmarks_private: "Private",
      download_all_one_page: "All (one page)",
      download_all: "All",
      download_r18_one_page: "R-18 (one page)",
      download_r18: "R-18"
    },
    checkbox: {
      filter_exclude_downloaded: "Exclude downloaded",
      filter_illusts: "Illustrations",
      filter_manga: "Manga",
      filter_ugoira: "Ugoira"
    },
    text: {
      confirm_clear_history: "Do you really want to clear history?"
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
    let last2 = messages[lang];
    for (let i = 0; i < paths.length; i++) {
      const value = last2[paths[i]];
      if (value === void 0 || value === null) return null;
      last2 = value;
    }
    return last2;
  }
  function noop() {
  }
  const identity = (x) => x;
  function assign(tar, src) {
    for (const k in src) tar[k] = src[k];
    return (
      /** @type {T & S} */
      tar
    );
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a && typeof a === "object" || typeof a === "function";
  }
  let src_url_equal_anchor;
  function src_url_equal(element_src, url2) {
    if (element_src === url2) return true;
    if (!src_url_equal_anchor) {
      src_url_equal_anchor = document.createElement("a");
    }
    src_url_equal_anchor.href = url2;
    return element_src === src_url_equal_anchor.href;
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function subscribe(store, ...callbacks) {
    if (store == null) {
      for (const callback of callbacks) {
        callback(void 0);
      }
      return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function get_store_value(store) {
    let value;
    subscribe(store, (_) => value = _)();
    return value;
  }
  function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
  }
  function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
      const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
      return definition[0](slot_ctx);
    }
  }
  function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
  }
  function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
      const lets = definition[2](fn(dirty));
      if ($$scope.dirty === void 0) {
        return lets;
      }
      if (typeof lets === "object") {
        const merged = [];
        const len = Math.max($$scope.dirty.length, lets.length);
        for (let i = 0; i < len; i += 1) {
          merged[i] = $$scope.dirty[i] | lets[i];
        }
        return merged;
      }
      return $$scope.dirty | lets;
    }
    return $$scope.dirty;
  }
  function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
      const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
      slot.p(slot_context, slot_changes);
    }
  }
  function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
      const dirty = [];
      const length = $$scope.ctx.length / 32;
      for (let i = 0; i < length; i++) {
        dirty[i] = -1;
      }
      return dirty;
    }
    return -1;
  }
  function exclude_internal_props(props) {
    const result = {};
    for (const k in props) if (k[0] !== "$") result[k] = props[k];
    return result;
  }
  function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props) if (!keys.has(k) && k[0] !== "$") rest[k] = props[k];
    return rest;
  }
  function compute_slots(slots) {
    const result = {};
    for (const key in slots) {
      result[key] = true;
    }
    return result;
  }
  function set_store_value(store, ret, value) {
    store.set(value);
    return ret;
  }
  function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
  }
  function split_css_unit(value) {
    const split = typeof value === "string" && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
    return split ? [parseFloat(split[1]), split[2] || "px"] : [
      /** @type {number} */
      value,
      "px"
    ];
  }
  const is_client = typeof window !== "undefined";
  let now = is_client ? () => window.performance.now() : () => Date.now();
  let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
  const tasks = /* @__PURE__ */ new Set();
  function run_tasks(now2) {
    tasks.forEach((task) => {
      if (!task.c(now2)) {
        tasks.delete(task);
        task.f();
      }
    });
    if (tasks.size !== 0) raf(run_tasks);
  }
  function loop(callback) {
    let task;
    if (tasks.size === 0) raf(run_tasks);
    return {
      promise: new Promise((fulfill) => {
        tasks.add(task = { c: callback, f: fulfill });
      }),
      abort() {
        tasks.delete(task);
      }
    };
  }
  function append(target, node) {
    target.appendChild(node);
  }
  function get_root_for_style(node) {
    if (!node) return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && /** @type {ShadowRoot} */
    root.host) {
      return (
        /** @type {ShadowRoot} */
        root
      );
    }
    return node.ownerDocument;
  }
  function append_empty_stylesheet(node) {
    const style_element = element("style");
    style_element.textContent = "/* empty */";
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
  }
  function append_stylesheet(node, style) {
    append(
      /** @type {Document} */
      node.head || node,
      style
    );
    return style.sheet;
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
      if (iterations[i]) iterations[i].d(detaching);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function svg_element(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }
  function text(data2) {
    return document.createTextNode(data2);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function stop_propagation(fn) {
    return function(event) {
      event.stopPropagation();
      return fn.call(this, event);
    };
  }
  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }
  const always_set_through_set_attribute = ["width", "height"];
  function set_attributes(node, attributes) {
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
      if (attributes[key] == null) {
        node.removeAttribute(key);
      } else if (key === "style") {
        node.style.cssText = attributes[key];
      } else if (key === "__value") {
        node.value = node[key] = attributes[key];
      } else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
        node[key] = attributes[key];
      } else {
        attr(node, key, attributes[key]);
      }
    }
  }
  function init_binding_group(group) {
    let _inputs;
    return {
      /* push */
      p(...inputs) {
        _inputs = inputs;
        _inputs.forEach((input) => group.push(input));
      },
      /* remove */
      r() {
        _inputs.forEach((input) => group.splice(group.indexOf(input), 1));
      }
    };
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_data(text2, data2) {
    data2 = "" + data2;
    if (text2.data === data2) return;
    text2.data = /** @type {string} */
    data2;
  }
  function set_input_value(input, value) {
    input.value = value == null ? "" : value;
  }
  function set_style(node, key, value, important) {
    {
      node.style.setProperty(key, value, "");
    }
  }
  function select_option(select, value, mounting) {
    for (let i = 0; i < select.options.length; i += 1) {
      const option = select.options[i];
      if (option.__value === value) {
        option.selected = true;
        return;
      }
    }
    if (!mounting || value !== void 0) {
      select.selectedIndex = -1;
    }
  }
  function select_value(select) {
    const selected_option = select.querySelector(":checked");
    return selected_option && selected_option.__value;
  }
  function toggle_class(element2, name, toggle) {
    element2.classList.toggle(name, !!toggle);
  }
  function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    return new CustomEvent(type, { detail, bubbles, cancelable });
  }
  class HtmlTag {
    constructor(is_svg = false) {
      /**
       * @private
       * @default false
       */
      __publicField(this, "is_svg", false);
      /** parent for creating node */
      __publicField(this, "e");
      /** html tag nodes */
      __publicField(this, "n");
      /** target */
      __publicField(this, "t");
      /** anchor */
      __publicField(this, "a");
      this.is_svg = is_svg;
      this.e = this.n = null;
    }
    /**
     * @param {string} html
     * @returns {void}
     */
    c(html) {
      this.h(html);
    }
    /**
     * @param {string} html
     * @param {HTMLElement | SVGElement} target
     * @param {HTMLElement | SVGElement} anchor
     * @returns {void}
     */
    m(html, target, anchor = null) {
      if (!this.e) {
        if (this.is_svg)
          this.e = svg_element(
            /** @type {keyof SVGElementTagNameMap} */
            target.nodeName
          );
        else
          this.e = element(
            /** @type {keyof HTMLElementTagNameMap} */
            target.nodeType === 11 ? "TEMPLATE" : target.nodeName
          );
        this.t = target.tagName !== "TEMPLATE" ? target : (
          /** @type {HTMLTemplateElement} */
          target.content
        );
        this.c(html);
      }
      this.i(anchor);
    }
    /**
     * @param {string} html
     * @returns {void}
     */
    h(html) {
      this.e.innerHTML = html;
      this.n = Array.from(
        this.e.nodeName === "TEMPLATE" ? this.e.content.childNodes : this.e.childNodes
      );
    }
    /**
     * @returns {void} */
    i(anchor) {
      for (let i = 0; i < this.n.length; i += 1) {
        insert(this.t, this.n[i], anchor);
      }
    }
    /**
     * @param {string} html
     * @returns {void}
     */
    p(html) {
      this.d();
      this.h(html);
      this.i(this.a);
    }
    /**
     * @returns {void} */
    d() {
      this.n.forEach(detach);
    }
  }
  function get_custom_elements_slots(element2) {
    const result = {};
    element2.childNodes.forEach(
      /** @param {Element} node */
      (node) => {
        result[node.slot || "default"] = true;
      }
    );
    return result;
  }
  function construct_svelte_component(component, props) {
    return new component(props);
  }
  const managed_styles = /* @__PURE__ */ new Map();
  let active = 0;
  function hash(str) {
    let hash2 = 5381;
    let i = str.length;
    while (i--) hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
    return hash2 >>> 0;
  }
  function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
  }
  function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step2 = 16.666 / duration;
    let keyframes = "{\n";
    for (let p = 0; p <= 1; p += step2) {
      const t2 = a + (b - a) * ease(p);
      keyframes += p * 100 + `%{${fn(t2, 1 - t2)}}
`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
      rules[name] = true;
      stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || "";
    node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
  }
  function delete_rule(node, name) {
    const previous = (node.style.animation || "").split(", ");
    const next = previous.filter(
      name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
      // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
      node.style.animation = next.join(", ");
      active -= deleted;
      if (!active) clear_rules();
    }
  }
  function clear_rules() {
    raf(() => {
      if (active) return;
      managed_styles.forEach((info) => {
        const { ownerNode } = info.stylesheet;
        if (ownerNode) detach(ownerNode);
      });
      managed_styles.clear();
    });
  }
  let current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component) throw new Error("Function called outside component initialization");
    return current_component;
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
  }
  function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
  }
  function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
      const callbacks = component.$$.callbacks[type];
      if (callbacks) {
        const event = custom_event(
          /** @type {string} */
          type,
          detail,
          { cancelable }
        );
        callbacks.slice().forEach((fn) => {
          fn.call(component, event);
        });
        return !event.defaultPrevented;
      }
      return true;
    };
  }
  function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
    return context;
  }
  function getContext(key) {
    return get_current_component().$$.context.get(key);
  }
  function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
      callbacks.slice().forEach((fn) => fn.call(this, event));
    }
  }
  const dirty_components = [];
  const binding_callbacks = [];
  let render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = /* @__PURE__ */ Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  function add_flush_callback(fn) {
    flush_callbacks.push(fn);
  }
  const seen_callbacks = /* @__PURE__ */ new Set();
  let flushidx = 0;
  function flush() {
    if (flushidx !== 0) {
      return;
    }
    const saved_component = current_component;
    do {
      try {
        while (flushidx < dirty_components.length) {
          const component = dirty_components[flushidx];
          flushidx++;
          set_current_component(component);
          update(component.$$);
        }
      } catch (e) {
        dirty_components.length = 0;
        flushidx = 0;
        throw e;
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length) binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
  }
  let promise;
  function wait() {
    if (!promise) {
      promise = Promise.resolve();
      promise.then(() => {
        promise = null;
      });
    }
    return promise;
  }
  function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
  }
  const outroing = /* @__PURE__ */ new Set();
  let outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros
      // parent group
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2) block.d(1);
          callback();
        }
      });
      block.o(local);
    } else if (callback) {
      callback();
    }
  }
  const null_transition = { duration: 0 };
  function create_in_transition(node, fn, params) {
    const options = { direction: "in" };
    let config2 = fn(node, params, options);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
      if (animation_name) delete_rule(node, animation_name);
    }
    function go() {
      const {
        delay = 0,
        duration = 300,
        easing = identity,
        tick = noop,
        css
      } = config2 || null_transition;
      if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
      tick(0, 1);
      const start_time = now() + delay;
      const end_time = start_time + duration;
      if (task) task.abort();
      running = true;
      add_render_callback(() => dispatch(node, true, "start"));
      task = loop((now2) => {
        if (running) {
          if (now2 >= end_time) {
            tick(1, 0);
            dispatch(node, true, "end");
            cleanup();
            return running = false;
          }
          if (now2 >= start_time) {
            const t2 = easing((now2 - start_time) / duration);
            tick(t2, 1 - t2);
          }
        }
        return running;
      });
    }
    let started = false;
    return {
      start() {
        if (started) return;
        started = true;
        delete_rule(node);
        if (is_function(config2)) {
          config2 = config2(options);
          wait().then(go);
        } else {
          go();
        }
      },
      invalidate() {
        started = false;
      },
      end() {
        if (running) {
          cleanup();
          running = false;
        }
      }
    };
  }
  function create_out_transition(node, fn, params) {
    const options = { direction: "out" };
    let config2 = fn(node, params, options);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    let original_inert_value;
    function go() {
      const {
        delay = 0,
        duration = 300,
        easing = identity,
        tick = noop,
        css
      } = config2 || null_transition;
      if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
      const start_time = now() + delay;
      const end_time = start_time + duration;
      add_render_callback(() => dispatch(node, false, "start"));
      if ("inert" in node) {
        original_inert_value = /** @type {HTMLElement} */
        node.inert;
        node.inert = true;
      }
      loop((now2) => {
        if (running) {
          if (now2 >= end_time) {
            tick(0, 1);
            dispatch(node, false, "end");
            if (!--group.r) {
              run_all(group.c);
            }
            return false;
          }
          if (now2 >= start_time) {
            const t2 = easing((now2 - start_time) / duration);
            tick(1 - t2, t2);
          }
        }
        return running;
      });
    }
    if (is_function(config2)) {
      wait().then(() => {
        config2 = config2(options);
        go();
      });
    } else {
      go();
    }
    return {
      end(reset) {
        if (reset && "inert" in node) {
          node.inert = original_inert_value;
        }
        if (reset && config2.tick) {
          config2.tick(1, 0);
        }
        if (running) {
          if (animation_name) delete_rule(node, animation_name);
          running = false;
        }
      }
    };
  }
  function create_bidirectional_transition(node, fn, params, intro) {
    const options = { direction: "both" };
    let config2 = fn(node, params, options);
    let t2 = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    let original_inert_value;
    function clear_animation() {
      if (animation_name) delete_rule(node, animation_name);
    }
    function init2(program, duration) {
      const d = (
        /** @type {Program['d']} */
        program.b - t2
      );
      duration *= Math.abs(d);
      return {
        a: t2,
        b: program.b,
        d,
        duration,
        start: program.start,
        end: program.start + duration,
        group: program.group
      };
    }
    function go(b) {
      const {
        delay = 0,
        duration = 300,
        easing = identity,
        tick = noop,
        css
      } = config2 || null_transition;
      const program = {
        start: now() + delay,
        b
      };
      if (!b) {
        program.group = outros;
        outros.r += 1;
      }
      if ("inert" in node) {
        if (b) {
          if (original_inert_value !== void 0) {
            node.inert = original_inert_value;
          }
        } else {
          original_inert_value = /** @type {HTMLElement} */
          node.inert;
          node.inert = true;
        }
      }
      if (running_program || pending_program) {
        pending_program = program;
      } else {
        if (css) {
          clear_animation();
          animation_name = create_rule(node, t2, b, duration, delay, easing, css);
        }
        if (b) tick(0, 1);
        running_program = init2(program, duration);
        add_render_callback(() => dispatch(node, b, "start"));
        loop((now2) => {
          if (pending_program && now2 > pending_program.start) {
            running_program = init2(pending_program, duration);
            pending_program = null;
            dispatch(node, running_program.b, "start");
            if (css) {
              clear_animation();
              animation_name = create_rule(
                node,
                t2,
                running_program.b,
                running_program.duration,
                0,
                easing,
                config2.css
              );
            }
          }
          if (running_program) {
            if (now2 >= running_program.end) {
              tick(t2 = running_program.b, 1 - t2);
              dispatch(node, running_program.b, "end");
              if (!pending_program) {
                if (running_program.b) {
                  clear_animation();
                } else {
                  if (!--running_program.group.r) run_all(running_program.group.c);
                }
              }
              running_program = null;
            } else if (now2 >= running_program.start) {
              const p = now2 - running_program.start;
              t2 = running_program.a + running_program.d * easing(p / running_program.duration);
              tick(t2, 1 - t2);
            }
          }
          return !!(running_program || pending_program);
        });
      }
    }
    return {
      run(b) {
        if (is_function(config2)) {
          wait().then(() => {
            const opts = { direction: b ? "in" : "out" };
            config2 = config2(opts);
            go(b);
          });
        } else {
          go(b);
        }
      },
      end() {
        clear_animation();
        running_program = pending_program = null;
      }
    };
  }
  function ensure_array_like(array_like_or_iterator) {
    return (array_like_or_iterator == null ? void 0 : array_like_or_iterator.length) !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
  }
  function get_spread_update(levels, updates) {
    const update2 = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
      const o = levels[i];
      const n = updates[i];
      if (n) {
        for (const key in o) {
          if (!(key in n)) to_null_out[key] = 1;
        }
        for (const key in n) {
          if (!accounted_for[key]) {
            update2[key] = n[key];
            accounted_for[key] = 1;
          }
        }
        levels[i] = n;
      } else {
        for (const key in o) {
          accounted_for[key] = 1;
        }
      }
    }
    for (const key in to_null_out) {
      if (!(key in update2)) update2[key] = void 0;
    }
    return update2;
  }
  function get_spread_object(spread_props) {
    return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
  }
  function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== void 0) {
      component.$$.bound[index] = callback;
      callback(component.$$.ctx[index]);
    }
  }
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      flush_render_callbacks($$.after_update);
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance2, create_fragment2, not_equal, props, append_styles = null, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: [],
      // state
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      // everything else
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      flush();
    }
    set_current_component(parent_component);
  }
  let SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor($$componentCtor, $$slots, use_shadow_dom) {
        super();
        /** The Svelte component constructor */
        __publicField(this, "$$ctor");
        /** Slots */
        __publicField(this, "$$s");
        /** The Svelte component instance */
        __publicField(this, "$$c");
        /** Whether or not the custom element is connected */
        __publicField(this, "$$cn", false);
        /** Component props data */
        __publicField(this, "$$d", {});
        /** `true` if currently in the process of reflecting component props back to attributes */
        __publicField(this, "$$r", false);
        /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
        __publicField(this, "$$p_d", {});
        /** @type {Record<string, Function[]>} Event listeners */
        __publicField(this, "$$l", {});
        /** @type {Map<Function, Function>} Event listener unsubscribe functions */
        __publicField(this, "$$l_u", /* @__PURE__ */ new Map());
        this.$$ctor = $$componentCtor;
        this.$$s = $$slots;
        if (use_shadow_dom) {
          this.attachShadow({ mode: "open" });
        }
      }
      addEventListener(type, listener, options) {
        this.$$l[type] = this.$$l[type] || [];
        this.$$l[type].push(listener);
        if (this.$$c) {
          const unsub = this.$$c.$on(type, listener);
          this.$$l_u.set(listener, unsub);
        }
        super.addEventListener(type, listener, options);
      }
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
          let create_slot2 = function(name) {
            return () => {
              let node;
              const obj = {
                c: function create() {
                  node = element("slot");
                  if (name !== "default") {
                    attr(node, "name", name);
                  }
                },
                /**
                 * @param {HTMLElement} target
                 * @param {HTMLElement} [anchor]
                 */
                m: function mount(target, anchor) {
                  insert(target, node, anchor);
                },
                d: function destroy(detaching) {
                  if (detaching) {
                    detach(node);
                  }
                }
              };
              return obj;
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
              $$slots[name] = [create_slot2(name)];
            }
          }
          for (const attribute of this.attributes) {
            const name = this.$$g_p(attribute.name);
            if (!(name in this.$$d)) {
              this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
            }
          }
          for (const key in this.$$p_d) {
            if (!(key in this.$$d) && this[key] !== void 0) {
              this.$$d[key] = this[key];
              delete this[key];
            }
          }
          this.$$c = new this.$$ctor({
            target: this.shadowRoot || this,
            props: {
              ...this.$$d,
              $$slots,
              $$scope: {
                ctx: []
              }
            }
          });
          const reflect_attributes = () => {
            this.$$r = true;
            for (const key in this.$$p_d) {
              this.$$d[key] = this.$$c.$$.ctx[this.$$c.$$.props[key]];
              if (this.$$p_d[key].reflect) {
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
            }
            this.$$r = false;
          };
          this.$$c.$$.after_update.push(reflect_attributes);
          reflect_attributes();
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
      attributeChangedCallback(attr2, _oldValue, newValue) {
        var _a;
        if (this.$$r) return;
        attr2 = this.$$g_p(attr2);
        this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
        (_a = this.$$c) == null ? void 0 : _a.$set({ [attr2]: this.$$d[attr2] });
      }
      disconnectedCallback() {
        this.$$cn = false;
        Promise.resolve().then(() => {
          if (!this.$$cn && this.$$c) {
            this.$$c.$destroy();
            this.$$c = void 0;
          }
        });
      }
      $$g_p(attribute_name) {
        return Object.keys(this.$$p_d).find(
          (key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name
        ) || attribute_name;
      }
    };
  }
  function get_custom_element_value(prop, value, props_definition, transform) {
    var _a;
    const type = (_a = props_definition[prop]) == null ? void 0 : _a.type;
    value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
    if (!transform || !props_definition[prop]) {
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
  function create_custom_element(Component, props_definition, slots, accessors, use_shadow_dom, extend) {
    let Class = class extends SvelteElement {
      constructor() {
        super(Component, slots, use_shadow_dom);
        this.$$p_d = props_definition;
      }
      static get observedAttributes() {
        return Object.keys(props_definition).map(
          (key) => (props_definition[key].attribute || key).toLowerCase()
        );
      }
    };
    Object.keys(props_definition).forEach((prop) => {
      Object.defineProperty(Class.prototype, prop, {
        get() {
          return this.$$c && prop in this.$$c ? this.$$c[prop] : this.$$d[prop];
        },
        set(value) {
          var _a;
          value = get_custom_element_value(prop, value, props_definition);
          this.$$d[prop] = value;
          (_a = this.$$c) == null ? void 0 : _a.$set({ [prop]: value });
        }
      });
    });
    accessors.forEach((accessor) => {
      Object.defineProperty(Class.prototype, accessor, {
        get() {
          var _a;
          return (_a = this.$$c) == null ? void 0 : _a[accessor];
        }
      });
    });
    Component.element = /** @type {any} */
    Class;
    return Class;
  }
  class SvelteComponent {
    constructor() {
      /**
       * ### PRIVATE API
       *
       * Do not use, may change at any time
       *
       * @type {any}
       */
      __publicField(this, "$$");
      /**
       * ### PRIVATE API
       *
       * Do not use, may change at any time
       *
       * @type {any}
       */
      __publicField(this, "$$set");
    }
    /** @returns {void} */
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    /**
     * @template {Extract<keyof Events, string>} K
     * @param {K} type
     * @param {((e: Events[K]) => void) | null | undefined} callback
     * @returns {() => void}
     */
    $on(type, callback) {
      if (!is_function(callback)) {
        return noop;
      }
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    }
    /**
     * @param {Partial<Props>} props
     * @returns {void}
     */
    $set(props) {
      if (this.$$set && !is_empty(props)) {
        this.$$.skip_bound = true;
        this.$$set(props);
        this.$$.skip_bound = false;
      }
    }
  }
  const PUBLIC_VERSION = "4";
  if (typeof window !== "undefined")
    (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
  const subscriber_queue = [];
  function readable(value, start) {
    return {
      subscribe: writable(value, start).subscribe
    };
  }
  function writable(value, start = noop) {
    let stop;
    const subscribers = /* @__PURE__ */ new Set();
    function set(new_value) {
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
      set(fn(value));
    }
    function subscribe2(run2, invalidate = noop) {
      const subscriber = [run2, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set, update2) || noop;
      }
      run2(value);
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0 && stop) {
          stop();
          stop = null;
        }
      };
    }
    return { set, update: update2, subscribe: subscribe2 };
  }
  const DRAWER_STORE_KEY = "drawerStore";
  function initializeDrawerStore() {
    const drawerStore = drawerService();
    return setContext(DRAWER_STORE_KEY, drawerStore);
  }
  function drawerService() {
    const { subscribe: subscribe2, set, update: update2 } = writable({});
    return {
      subscribe: subscribe2,
      set,
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
    const { subscribe: subscribe2, set, update: update2 } = writable([]);
    return {
      subscribe: subscribe2,
      set,
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
      clear: () => set([])
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
    const { subscribe: subscribe2, set, update: update2 } = writable([]);
    const close = (id) => update2((tStore) => {
      if (tStore.length > 0) {
        const index = tStore.findIndex((t2) => t2.id === id);
        const selectedToast = tStore[index];
        if (selectedToast) {
          if (selectedToast.callback)
            selectedToast.callback({ id, status: "closed" });
          if (selectedToast.timeoutId)
            clearTimeout(selectedToast.timeoutId);
          tStore.splice(index, 1);
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
      subscribe: subscribe2,
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
      freeze: (index) => update2((tStore) => {
        if (tStore.length > 0)
          clearTimeout(tStore[index].timeoutId);
        return tStore;
      }),
      /** Cancel remain visible on leave */
      unfreeze: (index) => update2((tStore) => {
        if (tStore.length > 0)
          tStore[index].timeoutId = handleAutoHide(tStore[index]);
        return tStore;
      }),
      /** Remove all toasts from queue */
      clear: () => set([])
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
      const store = writable(initialValue, (set2) => {
        const json = getStorage(storageType).getItem(key);
        if (json) {
          set2(serializer.parse(json));
        }
        {
          const handleStorage = (event) => {
            if (event.key === key)
              set2(event.newValue ? serializer.parse(event.newValue) : null);
          };
          window.addEventListener("storage", handleStorage);
          return () => window.removeEventListener("storage", handleStorage);
        }
      });
      const { subscribe: subscribe2, set } = store;
      stores[key] = {
        set(value) {
          updateStorage(key, value);
          set(value);
        },
        update(updater) {
          const value = updater(get_store_value(store));
          updateStorage(key, value);
          set(value);
        },
        subscribe: subscribe2
      };
    }
    return stores[key];
  }
  localStorageStore("modeOsPrefers", false);
  localStorageStore("modeUserPrefers", void 0);
  localStorageStore("modeCurrent", false);
  const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
  function prefersReducedMotion() {
    return window.matchMedia(reducedMotionQuery).matches;
  }
  const prefersReducedMotionStore = readable(prefersReducedMotion(), (set) => {
    {
      const setReducedMotion = (event) => {
        set(event.matches);
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
    const onObservationChange = (mutationRecords, observer2) => {
      if (mutationRecords.length) {
        onCleanUp();
        onScanElements(true);
      }
      return observer2;
    };
    const observer = new MutationObserver(onObservationChange);
    observer.observe(node, { childList: true, subtree: true });
    return {
      update(newArgs) {
        enabled = newArgs;
        newArgs ? onScanElements(false) : onCleanUp();
      },
      destroy() {
        onCleanUp();
        observer.disconnect();
      }
    };
  }
  function cubicOut(t2) {
    const f = t2 - 1;
    return f * f * f + 1;
  }
  function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
      delay,
      duration,
      easing,
      css: (t2) => `opacity: ${t2 * o}`
    };
  }
  function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === "none" ? "" : style.transform;
    const od = target_opacity * (1 - opacity);
    const [xValue, xUnit] = split_css_unit(x);
    const [yValue, yUnit] = split_css_unit(y);
    return {
      delay,
      duration,
      easing,
      css: (t2, u) => `
			transform: ${transform} translate(${(1 - t2) * xValue}${xUnit}, ${(1 - t2) * yValue}${yUnit});
			opacity: ${target_opacity - od * u}`
    };
  }
  function dynamicTransition(node, dynParams) {
    const { transition, params, enabled } = dynParams;
    if (enabled)
      return transition(node, params);
    if ("duration" in params)
      return transition(node, { duration: 0 });
    return { duration: 0 };
  }
  const get_headline_slot_changes = (dirty) => ({});
  const get_headline_slot_context = (ctx) => ({});
  const get_trail_slot_changes$2 = (dirty) => ({});
  const get_trail_slot_context$2 = (ctx) => ({});
  const get_lead_slot_changes$1 = (dirty) => ({});
  const get_lead_slot_context$1 = (ctx) => ({});
  function create_if_block_2$3(ctx) {
    let div;
    let div_class_value;
    let current;
    const lead_slot_template = (
      /*#slots*/
      ctx[22].lead
    );
    const lead_slot = create_slot(
      lead_slot_template,
      ctx,
      /*$$scope*/
      ctx[21],
      get_lead_slot_context$1
    );
    return {
      c() {
        div = element("div");
        if (lead_slot) lead_slot.c();
        attr(div, "class", div_class_value = "app-bar-slot-lead " + /*classesSlotLead*/
        ctx[4]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (lead_slot) {
          lead_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (lead_slot) {
          if (lead_slot.p && (!current || dirty & /*$$scope*/
          2097152)) {
            update_slot_base(
              lead_slot,
              lead_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[21],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[21]
              ) : get_slot_changes(
                lead_slot_template,
                /*$$scope*/
                ctx2[21],
                dirty,
                get_lead_slot_changes$1
              ),
              get_lead_slot_context$1
            );
          }
        }
        if (!current || dirty & /*classesSlotLead*/
        16 && div_class_value !== (div_class_value = "app-bar-slot-lead " + /*classesSlotLead*/
        ctx2[4])) {
          attr(div, "class", div_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(lead_slot, local);
        current = true;
      },
      o(local) {
        transition_out(lead_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (lead_slot) lead_slot.d(detaching);
      }
    };
  }
  function create_if_block_1$4(ctx) {
    let div;
    let div_class_value;
    let current;
    const trail_slot_template = (
      /*#slots*/
      ctx[22].trail
    );
    const trail_slot = create_slot(
      trail_slot_template,
      ctx,
      /*$$scope*/
      ctx[21],
      get_trail_slot_context$2
    );
    return {
      c() {
        div = element("div");
        if (trail_slot) trail_slot.c();
        attr(div, "class", div_class_value = "app-bar-slot-trail " + /*classesSlotTrail*/
        ctx[2]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (trail_slot) {
          trail_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (trail_slot) {
          if (trail_slot.p && (!current || dirty & /*$$scope*/
          2097152)) {
            update_slot_base(
              trail_slot,
              trail_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[21],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[21]
              ) : get_slot_changes(
                trail_slot_template,
                /*$$scope*/
                ctx2[21],
                dirty,
                get_trail_slot_changes$2
              ),
              get_trail_slot_context$2
            );
          }
        }
        if (!current || dirty & /*classesSlotTrail*/
        4 && div_class_value !== (div_class_value = "app-bar-slot-trail " + /*classesSlotTrail*/
        ctx2[2])) {
          attr(div, "class", div_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(trail_slot, local);
        current = true;
      },
      o(local) {
        transition_out(trail_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (trail_slot) trail_slot.d(detaching);
      }
    };
  }
  function create_if_block$a(ctx) {
    let div;
    let div_class_value;
    let current;
    const headline_slot_template = (
      /*#slots*/
      ctx[22].headline
    );
    const headline_slot = create_slot(
      headline_slot_template,
      ctx,
      /*$$scope*/
      ctx[21],
      get_headline_slot_context
    );
    return {
      c() {
        div = element("div");
        if (headline_slot) headline_slot.c();
        attr(div, "class", div_class_value = "app-bar-row-headline " + /*classesRowHeadline*/
        ctx[5]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (headline_slot) {
          headline_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (headline_slot) {
          if (headline_slot.p && (!current || dirty & /*$$scope*/
          2097152)) {
            update_slot_base(
              headline_slot,
              headline_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[21],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[21]
              ) : get_slot_changes(
                headline_slot_template,
                /*$$scope*/
                ctx2[21],
                dirty,
                get_headline_slot_changes
              ),
              get_headline_slot_context
            );
          }
        }
        if (!current || dirty & /*classesRowHeadline*/
        32 && div_class_value !== (div_class_value = "app-bar-row-headline " + /*classesRowHeadline*/
        ctx2[5])) {
          attr(div, "class", div_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(headline_slot, local);
        current = true;
      },
      o(local) {
        transition_out(headline_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (headline_slot) headline_slot.d(detaching);
      }
    };
  }
  function create_fragment$i(ctx) {
    let div2;
    let div1;
    let t0;
    let div0;
    let div0_class_value;
    let t1;
    let div1_class_value;
    let t2;
    let div2_class_value;
    let current;
    let if_block0 = (
      /*$$slots*/
      ctx[8].lead && create_if_block_2$3(ctx)
    );
    const default_slot_template = (
      /*#slots*/
      ctx[22].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[21],
      null
    );
    let if_block1 = (
      /*$$slots*/
      ctx[8].trail && create_if_block_1$4(ctx)
    );
    let if_block2 = (
      /*$$slots*/
      ctx[8].headline && create_if_block$a(ctx)
    );
    return {
      c() {
        div2 = element("div");
        div1 = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        div0 = element("div");
        if (default_slot) default_slot.c();
        t1 = space();
        if (if_block1) if_block1.c();
        t2 = space();
        if (if_block2) if_block2.c();
        attr(div0, "class", div0_class_value = "app-bar-slot-default " + /*classesSlotDefault*/
        ctx[3]);
        attr(div1, "class", div1_class_value = "app-bar-row-main " + /*classesRowMain*/
        ctx[6]);
        attr(div2, "class", div2_class_value = "app-bar " + /*classesBase*/
        ctx[7]);
        attr(div2, "data-testid", "app-bar");
        attr(div2, "role", "toolbar");
        attr(
          div2,
          "aria-label",
          /*label*/
          ctx[0]
        );
        attr(
          div2,
          "aria-labelledby",
          /*labelledby*/
          ctx[1]
        );
      },
      m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, div1);
        if (if_block0) if_block0.m(div1, null);
        append(div1, t0);
        append(div1, div0);
        if (default_slot) {
          default_slot.m(div0, null);
        }
        append(div1, t1);
        if (if_block1) if_block1.m(div1, null);
        append(div2, t2);
        if (if_block2) if_block2.m(div2, null);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*$$slots*/
          ctx2[8].lead
        ) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
            if (dirty & /*$$slots*/
            256) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_2$3(ctx2);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(div1, t0);
          }
        } else if (if_block0) {
          group_outros();
          transition_out(if_block0, 1, 1, () => {
            if_block0 = null;
          });
          check_outros();
        }
        if (default_slot) {
          if (default_slot.p && (!current || dirty & /*$$scope*/
          2097152)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[21],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[21]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx2[21],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty & /*classesSlotDefault*/
        8 && div0_class_value !== (div0_class_value = "app-bar-slot-default " + /*classesSlotDefault*/
        ctx2[3])) {
          attr(div0, "class", div0_class_value);
        }
        if (
          /*$$slots*/
          ctx2[8].trail
        ) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
            if (dirty & /*$$slots*/
            256) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_1$4(ctx2);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(div1, null);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if (!current || dirty & /*classesRowMain*/
        64 && div1_class_value !== (div1_class_value = "app-bar-row-main " + /*classesRowMain*/
        ctx2[6])) {
          attr(div1, "class", div1_class_value);
        }
        if (
          /*$$slots*/
          ctx2[8].headline
        ) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty & /*$$slots*/
            256) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block$a(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(div2, null);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
        if (!current || dirty & /*classesBase*/
        128 && div2_class_value !== (div2_class_value = "app-bar " + /*classesBase*/
        ctx2[7])) {
          attr(div2, "class", div2_class_value);
        }
        if (!current || dirty & /*label*/
        1) {
          attr(
            div2,
            "aria-label",
            /*label*/
            ctx2[0]
          );
        }
        if (!current || dirty & /*labelledby*/
        2) {
          attr(
            div2,
            "aria-labelledby",
            /*labelledby*/
            ctx2[1]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block0);
        transition_in(default_slot, local);
        transition_in(if_block1);
        transition_in(if_block2);
        current = true;
      },
      o(local) {
        transition_out(if_block0);
        transition_out(default_slot, local);
        transition_out(if_block1);
        transition_out(if_block2);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div2);
        }
        if (if_block0) if_block0.d();
        if (default_slot) default_slot.d(detaching);
        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
      }
    };
  }
  const cBase$6 = "flex flex-col";
  const cRowMain = "grid items-center";
  const cRowHeadline = "";
  const cSlotLead = "flex-none flex justify-between items-center";
  const cSlotDefault = "flex-auto";
  const cSlotTrail = "flex-none flex items-center space-x-4";
  function instance$i($$self, $$props, $$invalidate) {
    let classesBase;
    let classesRowMain;
    let classesRowHeadline;
    let classesSlotLead;
    let classesSlotDefault;
    let classesSlotTrail;
    let { $$slots: slots = {}, $$scope } = $$props;
    const $$slots = compute_slots(slots);
    let { background = "bg-surface-100-800-token" } = $$props;
    let { border = "" } = $$props;
    let { padding = "p-4" } = $$props;
    let { shadow = "" } = $$props;
    let { spacing = "space-y-4" } = $$props;
    let { gridColumns = "grid-cols-[auto_1fr_auto]" } = $$props;
    let { gap = "gap-4" } = $$props;
    let { regionRowMain = "" } = $$props;
    let { regionRowHeadline = "" } = $$props;
    let { slotLead = "" } = $$props;
    let { slotDefault = "" } = $$props;
    let { slotTrail = "" } = $$props;
    let { label = "" } = $$props;
    let { labelledby = "" } = $$props;
    $$self.$$set = ($$new_props) => {
      $$invalidate(23, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("background" in $$new_props) $$invalidate(9, background = $$new_props.background);
      if ("border" in $$new_props) $$invalidate(10, border = $$new_props.border);
      if ("padding" in $$new_props) $$invalidate(11, padding = $$new_props.padding);
      if ("shadow" in $$new_props) $$invalidate(12, shadow = $$new_props.shadow);
      if ("spacing" in $$new_props) $$invalidate(13, spacing = $$new_props.spacing);
      if ("gridColumns" in $$new_props) $$invalidate(14, gridColumns = $$new_props.gridColumns);
      if ("gap" in $$new_props) $$invalidate(15, gap = $$new_props.gap);
      if ("regionRowMain" in $$new_props) $$invalidate(16, regionRowMain = $$new_props.regionRowMain);
      if ("regionRowHeadline" in $$new_props) $$invalidate(17, regionRowHeadline = $$new_props.regionRowHeadline);
      if ("slotLead" in $$new_props) $$invalidate(18, slotLead = $$new_props.slotLead);
      if ("slotDefault" in $$new_props) $$invalidate(19, slotDefault = $$new_props.slotDefault);
      if ("slotTrail" in $$new_props) $$invalidate(20, slotTrail = $$new_props.slotTrail);
      if ("label" in $$new_props) $$invalidate(0, label = $$new_props.label);
      if ("labelledby" in $$new_props) $$invalidate(1, labelledby = $$new_props.labelledby);
      if ("$$scope" in $$new_props) $$invalidate(21, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      $$invalidate(7, classesBase = `${cBase$6} ${background} ${border} ${spacing} ${padding} ${shadow} ${$$props.class ?? ""}`);
      if ($$self.$$.dirty & /*gridColumns, gap, regionRowMain*/
      114688) {
        $$invalidate(6, classesRowMain = `${cRowMain} ${gridColumns} ${gap} ${regionRowMain}`);
      }
      if ($$self.$$.dirty & /*regionRowHeadline*/
      131072) {
        $$invalidate(5, classesRowHeadline = `${cRowHeadline} ${regionRowHeadline}`);
      }
      if ($$self.$$.dirty & /*slotLead*/
      262144) {
        $$invalidate(4, classesSlotLead = `${cSlotLead} ${slotLead}`);
      }
      if ($$self.$$.dirty & /*slotDefault*/
      524288) {
        $$invalidate(3, classesSlotDefault = `${cSlotDefault} ${slotDefault}`);
      }
      if ($$self.$$.dirty & /*slotTrail*/
      1048576) {
        $$invalidate(2, classesSlotTrail = `${cSlotTrail} ${slotTrail}`);
      }
    };
    $$props = exclude_internal_props($$props);
    return [
      label,
      labelledby,
      classesSlotTrail,
      classesSlotDefault,
      classesSlotLead,
      classesRowHeadline,
      classesRowMain,
      classesBase,
      $$slots,
      background,
      border,
      padding,
      shadow,
      spacing,
      gridColumns,
      gap,
      regionRowMain,
      regionRowHeadline,
      slotLead,
      slotDefault,
      slotTrail,
      $$scope,
      slots
    ];
  }
  class AppBar extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$i, create_fragment$i, safe_not_equal, {
        background: 9,
        border: 10,
        padding: 11,
        shadow: 12,
        spacing: 13,
        gridColumns: 14,
        gap: 15,
        regionRowMain: 16,
        regionRowHeadline: 17,
        slotLead: 18,
        slotDefault: 19,
        slotTrail: 20,
        label: 0,
        labelledby: 1
      });
    }
  }
  function fallback_block(ctx) {
    let t2;
    return {
      c() {
        t2 = text("Select a File");
      },
      m(target, anchor) {
        insert(target, t2, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t2);
        }
      }
    };
  }
  function create_fragment$h(ctx) {
    let div1;
    let div0;
    let input;
    let t2;
    let button_1;
    let button_1_class_value;
    let button_1_disabled_value;
    let div1_class_value;
    let current;
    let mounted;
    let dispose;
    let input_levels = [
      { type: "file" },
      { name: (
        /*name*/
        ctx[2]
      ) },
      /*prunedRestProps*/
      ctx[6]()
    ];
    let input_data = {};
    for (let i = 0; i < input_levels.length; i += 1) {
      input_data = assign(input_data, input_levels[i]);
    }
    const default_slot_template = (
      /*#slots*/
      ctx[11].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[10],
      null
    );
    const default_slot_or_fallback = default_slot || fallback_block();
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        input = element("input");
        t2 = space();
        button_1 = element("button");
        if (default_slot_or_fallback) default_slot_or_fallback.c();
        set_attributes(input, input_data);
        attr(div0, "class", "w-0 h-0 overflow-hidden");
        attr(button_1, "type", "button");
        attr(button_1, "class", button_1_class_value = "file-button-btn " + /*classesButton*/
        ctx[3]);
        button_1.disabled = button_1_disabled_value = /*$$restProps*/
        ctx[7].disabled;
        attr(div1, "class", div1_class_value = "file-button " + /*classesBase*/
        ctx[4]);
        attr(div1, "data-testid", "file-button");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, input);
        if (input.autofocus) input.focus();
        ctx[16](input);
        append(div1, t2);
        append(div1, button_1);
        if (default_slot_or_fallback) {
          default_slot_or_fallback.m(button_1, null);
        }
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              input,
              "change",
              /*input_change_handler*/
              ctx[17]
            ),
            listen(
              input,
              "change",
              /*change_handler*/
              ctx[15]
            ),
            listen(
              button_1,
              "click",
              /*onButtonClick*/
              ctx[5]
            ),
            listen(
              button_1,
              "keydown",
              /*keydown_handler*/
              ctx[12]
            ),
            listen(
              button_1,
              "keyup",
              /*keyup_handler*/
              ctx[13]
            ),
            listen(
              button_1,
              "keypress",
              /*keypress_handler*/
              ctx[14]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        set_attributes(input, input_data = get_spread_update(input_levels, [
          { type: "file" },
          (!current || dirty & /*name*/
          4) && { name: (
            /*name*/
            ctx2[2]
          ) },
          /*prunedRestProps*/
          ctx2[6]()
        ]));
        if (default_slot) {
          if (default_slot.p && (!current || dirty & /*$$scope*/
          1024)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[10],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[10]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx2[10],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty & /*classesButton*/
        8 && button_1_class_value !== (button_1_class_value = "file-button-btn " + /*classesButton*/
        ctx2[3])) {
          attr(button_1, "class", button_1_class_value);
        }
        if (!current || dirty & /*$$restProps*/
        128 && button_1_disabled_value !== (button_1_disabled_value = /*$$restProps*/
        ctx2[7].disabled)) {
          button_1.disabled = button_1_disabled_value;
        }
        if (!current || dirty & /*classesBase*/
        16 && div1_class_value !== (div1_class_value = "file-button " + /*classesBase*/
        ctx2[4])) {
          attr(div1, "class", div1_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(default_slot_or_fallback, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot_or_fallback, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        ctx[16](null);
        if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance$h($$self, $$props, $$invalidate) {
    let classesBase;
    let classesButton;
    const omit_props_names = ["files", "fileInput", "name", "width", "button"];
    let $$restProps = compute_rest_props($$props, omit_props_names);
    let { $$slots: slots = {}, $$scope } = $$props;
    let { files = void 0 } = $$props;
    let { fileInput = void 0 } = $$props;
    let { name } = $$props;
    let { width = "" } = $$props;
    let { button = "btn variant-filled" } = $$props;
    function onButtonClick() {
      if (fileInput) fileInput.click();
    }
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    function keydown_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler(event) {
      bubble.call(this, $$self, event);
    }
    function change_handler(event) {
      bubble.call(this, $$self, event);
    }
    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        fileInput = $$value;
        $$invalidate(1, fileInput);
      });
    }
    function input_change_handler() {
      files = this.files;
      $$invalidate(0, files);
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      $$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
      if ("files" in $$new_props) $$invalidate(0, files = $$new_props.files);
      if ("fileInput" in $$new_props) $$invalidate(1, fileInput = $$new_props.fileInput);
      if ("name" in $$new_props) $$invalidate(2, name = $$new_props.name);
      if ("width" in $$new_props) $$invalidate(8, width = $$new_props.width);
      if ("button" in $$new_props) $$invalidate(9, button = $$new_props.button);
      if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      $$invalidate(4, classesBase = `${$$props.class ?? ""}`);
      if ($$self.$$.dirty & /*button, width*/
      768) {
        $$invalidate(3, classesButton = `${button} ${width}`);
      }
    };
    $$props = exclude_internal_props($$props);
    return [
      files,
      fileInput,
      name,
      classesButton,
      classesBase,
      onButtonClick,
      prunedRestProps,
      $$restProps,
      width,
      button,
      $$scope,
      slots,
      keydown_handler,
      keyup_handler,
      keypress_handler,
      change_handler,
      input_binding,
      input_change_handler
    ];
  }
  class FileButton extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$h, create_fragment$h, safe_not_equal, {
        files: 0,
        fileInput: 1,
        name: 2,
        width: 8,
        button: 9
      });
    }
  }
  function create_fragment$g(ctx) {
    let div;
    let div_class_value;
    let current;
    const default_slot_template = (
      /*#slots*/
      ctx[13].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[12],
      null
    );
    return {
      c() {
        div = element("div");
        if (default_slot) default_slot.c();
        attr(div, "class", div_class_value = "listbox " + /*classesBase*/
        ctx[1]);
        attr(div, "role", "listbox");
        attr(
          div,
          "aria-labelledby",
          /*labelledby*/
          ctx[0]
        );
        attr(div, "data-testid", "listbox");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (default_slot) {
          default_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        if (default_slot) {
          if (default_slot.p && (!current || dirty & /*$$scope*/
          4096)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[12],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[12]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx2[12],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty & /*classesBase*/
        2 && div_class_value !== (div_class_value = "listbox " + /*classesBase*/
        ctx2[1])) {
          attr(div, "class", div_class_value);
        }
        if (!current || dirty & /*labelledby*/
        1) {
          attr(
            div,
            "aria-labelledby",
            /*labelledby*/
            ctx2[0]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (default_slot) default_slot.d(detaching);
      }
    };
  }
  const cBase$5 = "";
  function instance$g($$self, $$props, $$invalidate) {
    let classesBase;
    let { $$slots: slots = {}, $$scope } = $$props;
    let { multiple = false } = $$props;
    let { disabled = false } = $$props;
    let { spacing = "space-y-1" } = $$props;
    let { rounded = "rounded-token" } = $$props;
    let { active: active2 = "variant-filled" } = $$props;
    let { hover = "hover:variant-soft" } = $$props;
    let { padding = "px-4 py-2" } = $$props;
    let { regionLead = "" } = $$props;
    let { regionDefault = "" } = $$props;
    let { regionTrail = "" } = $$props;
    let { labelledby = "" } = $$props;
    setContext("disabled", disabled);
    setContext("multiple", multiple);
    setContext("rounded", rounded);
    setContext("active", active2);
    setContext("hover", hover);
    setContext("padding", padding);
    setContext("regionLead", regionLead);
    setContext("regionDefault", regionDefault);
    setContext("regionTrail", regionTrail);
    $$self.$$set = ($$new_props) => {
      $$invalidate(14, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("multiple" in $$new_props) $$invalidate(2, multiple = $$new_props.multiple);
      if ("disabled" in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
      if ("spacing" in $$new_props) $$invalidate(4, spacing = $$new_props.spacing);
      if ("rounded" in $$new_props) $$invalidate(5, rounded = $$new_props.rounded);
      if ("active" in $$new_props) $$invalidate(6, active2 = $$new_props.active);
      if ("hover" in $$new_props) $$invalidate(7, hover = $$new_props.hover);
      if ("padding" in $$new_props) $$invalidate(8, padding = $$new_props.padding);
      if ("regionLead" in $$new_props) $$invalidate(9, regionLead = $$new_props.regionLead);
      if ("regionDefault" in $$new_props) $$invalidate(10, regionDefault = $$new_props.regionDefault);
      if ("regionTrail" in $$new_props) $$invalidate(11, regionTrail = $$new_props.regionTrail);
      if ("labelledby" in $$new_props) $$invalidate(0, labelledby = $$new_props.labelledby);
      if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      $$invalidate(1, classesBase = `${cBase$5} ${spacing} ${rounded} ${$$props.class ?? ""}`);
    };
    $$props = exclude_internal_props($$props);
    return [
      labelledby,
      classesBase,
      multiple,
      disabled,
      spacing,
      rounded,
      active2,
      hover,
      padding,
      regionLead,
      regionDefault,
      regionTrail,
      $$scope,
      slots
    ];
  }
  class ListBox extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$g, create_fragment$g, safe_not_equal, {
        multiple: 2,
        disabled: 3,
        spacing: 4,
        rounded: 5,
        active: 6,
        hover: 7,
        padding: 8,
        regionLead: 9,
        regionDefault: 10,
        regionTrail: 11,
        labelledby: 0
      });
    }
  }
  const get_trail_slot_changes$1 = (dirty) => ({});
  const get_trail_slot_context$1 = (ctx) => ({});
  const get_lead_slot_changes = (dirty) => ({});
  const get_lead_slot_context = (ctx) => ({});
  function create_else_block$3(ctx) {
    let input;
    let value_has_changed = false;
    let binding_group;
    let mounted;
    let dispose;
    binding_group = init_binding_group(
      /*$$binding_groups*/
      ctx[37][0]
    );
    return {
      c() {
        input = element("input");
        input.disabled = /*disabled*/
        ctx[3];
        attr(input, "type", "radio");
        attr(
          input,
          "name",
          /*name*/
          ctx[1]
        );
        input.__value = /*value*/
        ctx[2];
        set_input_value(input, input.__value);
        attr(input, "tabindex", "-1");
        binding_group.p(input);
      },
      m(target, anchor) {
        insert(target, input, anchor);
        ctx[35](input);
        input.checked = input.__value === /*group*/
        ctx[0];
        if (!mounted) {
          dispose = [
            listen(
              input,
              "change",
              /*input_change_handler_1*/
              ctx[36]
            ),
            listen(
              input,
              "click",
              /*click_handler_1*/
              ctx[31]
            ),
            listen(
              input,
              "change",
              /*change_handler_1*/
              ctx[32]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*disabled*/
        8) {
          input.disabled = /*disabled*/
          ctx2[3];
        }
        if (dirty[0] & /*name*/
        2) {
          attr(
            input,
            "name",
            /*name*/
            ctx2[1]
          );
        }
        if (dirty[0] & /*value*/
        4) {
          input.__value = /*value*/
          ctx2[2];
          set_input_value(input, input.__value);
          value_has_changed = true;
        }
        if (value_has_changed || dirty[0] & /*group*/
        1) {
          input.checked = input.__value === /*group*/
          ctx2[0];
        }
      },
      d(detaching) {
        if (detaching) {
          detach(input);
        }
        ctx[35](null);
        binding_group.r();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_2$2(ctx) {
    let input;
    let mounted;
    let dispose;
    return {
      c() {
        input = element("input");
        input.disabled = /*disabled*/
        ctx[3];
        attr(input, "type", "checkbox");
        attr(
          input,
          "name",
          /*name*/
          ctx[1]
        );
        input.__value = /*value*/
        ctx[2];
        set_input_value(input, input.__value);
        attr(input, "tabindex", "-1");
      },
      m(target, anchor) {
        insert(target, input, anchor);
        ctx[33](input);
        input.checked = /*checked*/
        ctx[5];
        if (!mounted) {
          dispose = [
            listen(
              input,
              "change",
              /*input_change_handler*/
              ctx[34]
            ),
            listen(
              input,
              "click",
              /*click_handler*/
              ctx[29]
            ),
            listen(
              input,
              "change",
              /*change_handler*/
              ctx[30]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*disabled*/
        8) {
          input.disabled = /*disabled*/
          ctx2[3];
        }
        if (dirty[0] & /*name*/
        2) {
          attr(
            input,
            "name",
            /*name*/
            ctx2[1]
          );
        }
        if (dirty[0] & /*value*/
        4) {
          input.__value = /*value*/
          ctx2[2];
          set_input_value(input, input.__value);
        }
        if (dirty[0] & /*checked*/
        32) {
          input.checked = /*checked*/
          ctx2[5];
        }
      },
      d(detaching) {
        if (detaching) {
          detach(input);
        }
        ctx[33](null);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_1$3(ctx) {
    let div;
    let div_class_value;
    let current;
    const lead_slot_template = (
      /*#slots*/
      ctx[25].lead
    );
    const lead_slot = create_slot(
      lead_slot_template,
      ctx,
      /*$$scope*/
      ctx[24],
      get_lead_slot_context
    );
    return {
      c() {
        div = element("div");
        if (lead_slot) lead_slot.c();
        attr(div, "class", div_class_value = "listbox-label-lead " + /*classesRegionLead*/
        ctx[10]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (lead_slot) {
          lead_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (lead_slot) {
          if (lead_slot.p && (!current || dirty[0] & /*$$scope*/
          16777216)) {
            update_slot_base(
              lead_slot,
              lead_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[24],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[24]
              ) : get_slot_changes(
                lead_slot_template,
                /*$$scope*/
                ctx2[24],
                dirty,
                get_lead_slot_changes
              ),
              get_lead_slot_context
            );
          }
        }
        if (!current || dirty[0] & /*classesRegionLead*/
        1024 && div_class_value !== (div_class_value = "listbox-label-lead " + /*classesRegionLead*/
        ctx2[10])) {
          attr(div, "class", div_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(lead_slot, local);
        current = true;
      },
      o(local) {
        transition_out(lead_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (lead_slot) lead_slot.d(detaching);
      }
    };
  }
  function create_if_block$9(ctx) {
    let div;
    let div_class_value;
    let current;
    const trail_slot_template = (
      /*#slots*/
      ctx[25].trail
    );
    const trail_slot = create_slot(
      trail_slot_template,
      ctx,
      /*$$scope*/
      ctx[24],
      get_trail_slot_context$1
    );
    return {
      c() {
        div = element("div");
        if (trail_slot) trail_slot.c();
        attr(div, "class", div_class_value = "listbox-label-trail " + /*classesRegionTrail*/
        ctx[8]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (trail_slot) {
          trail_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (trail_slot) {
          if (trail_slot.p && (!current || dirty[0] & /*$$scope*/
          16777216)) {
            update_slot_base(
              trail_slot,
              trail_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[24],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[24]
              ) : get_slot_changes(
                trail_slot_template,
                /*$$scope*/
                ctx2[24],
                dirty,
                get_trail_slot_changes$1
              ),
              get_trail_slot_context$1
            );
          }
        }
        if (!current || dirty[0] & /*classesRegionTrail*/
        256 && div_class_value !== (div_class_value = "listbox-label-trail " + /*classesRegionTrail*/
        ctx2[8])) {
          attr(div, "class", div_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(trail_slot, local);
        current = true;
      },
      o(local) {
        transition_out(trail_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (trail_slot) trail_slot.d(detaching);
      }
    };
  }
  function create_fragment$f(ctx) {
    let label;
    let div3;
    let div0;
    let t0;
    let div2;
    let t1;
    let div1;
    let div1_class_value;
    let t2;
    let div2_class_value;
    let div3_class_value;
    let current;
    let mounted;
    let dispose;
    function select_block_type(ctx2, dirty) {
      if (
        /*multiple*/
        ctx2[4]
      ) return create_if_block_2$2;
      return create_else_block$3;
    }
    let current_block_type = select_block_type(ctx);
    let if_block0 = current_block_type(ctx);
    let if_block1 = (
      /*$$slots*/
      ctx[14].lead && create_if_block_1$3(ctx)
    );
    const default_slot_template = (
      /*#slots*/
      ctx[25].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[24],
      null
    );
    let if_block2 = (
      /*$$slots*/
      ctx[14].trail && create_if_block$9(ctx)
    );
    return {
      c() {
        label = element("label");
        div3 = element("div");
        div0 = element("div");
        if_block0.c();
        t0 = space();
        div2 = element("div");
        if (if_block1) if_block1.c();
        t1 = space();
        div1 = element("div");
        if (default_slot) default_slot.c();
        t2 = space();
        if (if_block2) if_block2.c();
        attr(div0, "class", "h-0 w-0 overflow-hidden");
        attr(div1, "class", div1_class_value = "listbox-label-content " + /*classesRegionDefault*/
        ctx[9]);
        attr(div2, "class", div2_class_value = "listbox-label " + /*classesLabel*/
        ctx[11]);
        attr(div3, "class", div3_class_value = "listbox-item " + /*classesBase*/
        ctx[12]);
        attr(div3, "data-testid", "listbox-item");
        attr(div3, "role", "option");
        attr(
          div3,
          "aria-selected",
          /*selected*/
          ctx[6]
        );
        attr(div3, "tabindex", "0");
      },
      m(target, anchor) {
        insert(target, label, anchor);
        append(label, div3);
        append(div3, div0);
        if_block0.m(div0, null);
        append(div3, t0);
        append(div3, div2);
        if (if_block1) if_block1.m(div2, null);
        append(div2, t1);
        append(div2, div1);
        if (default_slot) {
          default_slot.m(div1, null);
        }
        append(div2, t2);
        if (if_block2) if_block2.m(div2, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              div3,
              "keydown",
              /*onKeyDown*/
              ctx[13]
            ),
            listen(
              div3,
              "keydown",
              /*keydown_handler*/
              ctx[26]
            ),
            listen(
              div3,
              "keyup",
              /*keyup_handler*/
              ctx[27]
            ),
            listen(
              div3,
              "keypress",
              /*keypress_handler*/
              ctx[28]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0.d(1);
          if_block0 = current_block_type(ctx2);
          if (if_block0) {
            if_block0.c();
            if_block0.m(div0, null);
          }
        }
        if (
          /*$$slots*/
          ctx2[14].lead
        ) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
            if (dirty[0] & /*$$slots*/
            16384) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_1$3(ctx2);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(div2, t1);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if (default_slot) {
          if (default_slot.p && (!current || dirty[0] & /*$$scope*/
          16777216)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[24],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[24]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx2[24],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty[0] & /*classesRegionDefault*/
        512 && div1_class_value !== (div1_class_value = "listbox-label-content " + /*classesRegionDefault*/
        ctx2[9])) {
          attr(div1, "class", div1_class_value);
        }
        if (
          /*$$slots*/
          ctx2[14].trail
        ) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty[0] & /*$$slots*/
            16384) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block$9(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(div2, null);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
        if (!current || dirty[0] & /*classesLabel*/
        2048 && div2_class_value !== (div2_class_value = "listbox-label " + /*classesLabel*/
        ctx2[11])) {
          attr(div2, "class", div2_class_value);
        }
        if (!current || dirty[0] & /*classesBase*/
        4096 && div3_class_value !== (div3_class_value = "listbox-item " + /*classesBase*/
        ctx2[12])) {
          attr(div3, "class", div3_class_value);
        }
        if (!current || dirty[0] & /*selected*/
        64) {
          attr(
            div3,
            "aria-selected",
            /*selected*/
            ctx2[6]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block1);
        transition_in(default_slot, local);
        transition_in(if_block2);
        current = true;
      },
      o(local) {
        transition_out(if_block1);
        transition_out(default_slot, local);
        transition_out(if_block2);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(label);
        }
        if_block0.d();
        if (if_block1) if_block1.d();
        if (default_slot) default_slot.d(detaching);
        if (if_block2) if_block2.d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  const cBase$4 = "cursor-pointer -outline-offset-[3px]";
  const cDisabled$1 = "opacity-50 !cursor-default";
  const cLabel$1 = "flex items-center space-x-4";
  const cRegionLead = "";
  const cRegionDefault = "flex-1";
  const cRegionTrail = "";
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
  function instance$f($$self, $$props, $$invalidate) {
    let selected;
    let classesActive;
    let classesDisabled;
    let classesBase;
    let classesLabel;
    let classesRegionLead;
    let classesRegionDefault;
    let classesRegionTrail;
    let { $$slots: slots = {}, $$scope } = $$props;
    const $$slots = compute_slots(slots);
    let { group } = $$props;
    let { name } = $$props;
    let { value } = $$props;
    let { disabled = getContext("disabled") } = $$props;
    let { multiple = getContext("multiple") } = $$props;
    let { rounded = getContext("rounded") } = $$props;
    let { active: active2 = getContext("active") } = $$props;
    let { hover = getContext("hover") } = $$props;
    let { padding = getContext("padding") } = $$props;
    let { regionLead = getContext("regionLead") } = $$props;
    let { regionDefault = getContext("regionDefault") } = $$props;
    let { regionTrail = getContext("regionTrail") } = $$props;
    let checked;
    let elemInput;
    function updateCheckbox(group2) {
      $$invalidate(5, checked = group2.indexOf(value) >= 0);
    }
    function updateGroup(checked2) {
      const index = group.indexOf(value);
      if (checked2) {
        if (index < 0) {
          group.push(value);
          $$invalidate(0, group);
        }
      } else {
        if (index >= 0) {
          group.splice(index, 1);
          $$invalidate(0, group);
        }
      }
    }
    function onKeyDown(event) {
      if (["Enter", "Space"].includes(event.code)) {
        event.preventDefault();
        elemInput.click();
      }
    }
    const $$binding_groups = [[]];
    function keydown_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler(event) {
      bubble.call(this, $$self, event);
    }
    function click_handler(event) {
      bubble.call(this, $$self, event);
    }
    function change_handler(event) {
      bubble.call(this, $$self, event);
    }
    function click_handler_1(event) {
      bubble.call(this, $$self, event);
    }
    function change_handler_1(event) {
      bubble.call(this, $$self, event);
    }
    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        elemInput = $$value;
        $$invalidate(7, elemInput);
      });
    }
    function input_change_handler() {
      checked = this.checked;
      $$invalidate(5, checked);
    }
    function input_binding_1($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        elemInput = $$value;
        $$invalidate(7, elemInput);
      });
    }
    function input_change_handler_1() {
      group = this.__value;
      $$invalidate(0, group);
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(40, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("group" in $$new_props) $$invalidate(0, group = $$new_props.group);
      if ("name" in $$new_props) $$invalidate(1, name = $$new_props.name);
      if ("value" in $$new_props) $$invalidate(2, value = $$new_props.value);
      if ("disabled" in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
      if ("multiple" in $$new_props) $$invalidate(4, multiple = $$new_props.multiple);
      if ("rounded" in $$new_props) $$invalidate(15, rounded = $$new_props.rounded);
      if ("active" in $$new_props) $$invalidate(16, active2 = $$new_props.active);
      if ("hover" in $$new_props) $$invalidate(17, hover = $$new_props.hover);
      if ("padding" in $$new_props) $$invalidate(18, padding = $$new_props.padding);
      if ("regionLead" in $$new_props) $$invalidate(19, regionLead = $$new_props.regionLead);
      if ("regionDefault" in $$new_props) $$invalidate(20, regionDefault = $$new_props.regionDefault);
      if ("regionTrail" in $$new_props) $$invalidate(21, regionTrail = $$new_props.regionTrail);
      if ("$$scope" in $$new_props) $$invalidate(24, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty[0] & /*multiple, group*/
      17) {
        if (multiple) updateCheckbox(group);
      }
      if ($$self.$$.dirty[0] & /*multiple, checked*/
      48) {
        if (multiple) updateGroup(checked);
      }
      if ($$self.$$.dirty[0] & /*multiple, group, value*/
      21) {
        $$invalidate(6, selected = multiple ? group.some((groupVal) => areDeeplyEqual(value, groupVal)) : areDeeplyEqual(group, value));
      }
      if ($$self.$$.dirty[0] & /*selected, active, disabled, hover*/
      196680) {
        $$invalidate(22, classesActive = selected ? active2 : !disabled ? hover : "");
      }
      if ($$self.$$.dirty[0] & /*disabled*/
      8) {
        $$invalidate(23, classesDisabled = disabled ? cDisabled$1 : "");
      }
      $$invalidate(12, classesBase = `${cBase$4} ${classesDisabled} ${rounded} ${padding} ${classesActive} ${$$props.class ?? ""}`);
      if ($$self.$$.dirty[0] & /*regionLead*/
      524288) {
        $$invalidate(10, classesRegionLead = `${cRegionLead} ${regionLead}`);
      }
      if ($$self.$$.dirty[0] & /*regionDefault*/
      1048576) {
        $$invalidate(9, classesRegionDefault = `${cRegionDefault} ${regionDefault}`);
      }
      if ($$self.$$.dirty[0] & /*regionTrail*/
      2097152) {
        $$invalidate(8, classesRegionTrail = `${cRegionTrail} ${regionTrail}`);
      }
    };
    $$invalidate(11, classesLabel = `${cLabel$1}`);
    $$props = exclude_internal_props($$props);
    return [
      group,
      name,
      value,
      disabled,
      multiple,
      checked,
      selected,
      elemInput,
      classesRegionTrail,
      classesRegionDefault,
      classesRegionLead,
      classesLabel,
      classesBase,
      onKeyDown,
      $$slots,
      rounded,
      active2,
      hover,
      padding,
      regionLead,
      regionDefault,
      regionTrail,
      classesActive,
      classesDisabled,
      $$scope,
      slots,
      keydown_handler,
      keyup_handler,
      keypress_handler,
      click_handler,
      change_handler,
      click_handler_1,
      change_handler_1,
      input_binding,
      input_change_handler,
      input_binding_1,
      input_change_handler_1,
      $$binding_groups
    ];
  }
  class ListBoxItem extends SvelteComponent {
    constructor(options) {
      super();
      init(
        this,
        options,
        instance$f,
        create_fragment$f,
        safe_not_equal,
        {
          group: 0,
          name: 1,
          value: 2,
          disabled: 3,
          multiple: 4,
          rounded: 15,
          active: 16,
          hover: 17,
          padding: 18,
          regionLead: 19,
          regionDefault: 20,
          regionTrail: 21
        },
        null,
        [-1, -1]
      );
    }
  }
  function create_fragment$e(ctx) {
    let div;
    let div_class_value;
    let current;
    const default_slot_template = (
      /*#slots*/
      ctx[15].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[14],
      null
    );
    return {
      c() {
        div = element("div");
        if (default_slot) default_slot.c();
        attr(div, "class", div_class_value = "radio-group " + /*classesBase*/
        ctx[1]);
        attr(div, "data-testid", "radio-group");
        attr(div, "role", "radiogroup");
        attr(
          div,
          "aria-labelledby",
          /*labelledby*/
          ctx[0]
        );
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (default_slot) {
          default_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        if (default_slot) {
          if (default_slot.p && (!current || dirty & /*$$scope*/
          16384)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[14],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[14]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx2[14],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty & /*classesBase*/
        2 && div_class_value !== (div_class_value = "radio-group " + /*classesBase*/
        ctx2[1])) {
          attr(div, "class", div_class_value);
        }
        if (!current || dirty & /*labelledby*/
        1) {
          attr(
            div,
            "aria-labelledby",
            /*labelledby*/
            ctx2[0]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (default_slot) default_slot.d(detaching);
      }
    };
  }
  const cBase$3 = "p-1";
  function instance$e($$self, $$props, $$invalidate) {
    let classesBase;
    let { $$slots: slots = {}, $$scope } = $$props;
    let { display = "inline-flex" } = $$props;
    let { flexDirection = "flex-row" } = $$props;
    let { gap = "gap-1" } = $$props;
    let { background = "bg-surface-200-700-token" } = $$props;
    let { border = "border-token border-surface-400-500-token" } = $$props;
    let { rounded = "rounded-token" } = $$props;
    let { padding = "px-4 py-1" } = $$props;
    let { active: active2 = "variant-filled" } = $$props;
    let { hover = "hover:variant-soft" } = $$props;
    let { color = "" } = $$props;
    let { fill = "" } = $$props;
    let { regionLabel = "" } = $$props;
    let { labelledby = "" } = $$props;
    setContext("rounded", rounded);
    setContext("padding", padding);
    setContext("active", active2);
    setContext("hover", hover);
    setContext("color", color);
    setContext("fill", fill);
    setContext("regionLabel", regionLabel);
    $$self.$$set = ($$new_props) => {
      $$invalidate(16, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("display" in $$new_props) $$invalidate(2, display = $$new_props.display);
      if ("flexDirection" in $$new_props) $$invalidate(3, flexDirection = $$new_props.flexDirection);
      if ("gap" in $$new_props) $$invalidate(4, gap = $$new_props.gap);
      if ("background" in $$new_props) $$invalidate(5, background = $$new_props.background);
      if ("border" in $$new_props) $$invalidate(6, border = $$new_props.border);
      if ("rounded" in $$new_props) $$invalidate(7, rounded = $$new_props.rounded);
      if ("padding" in $$new_props) $$invalidate(8, padding = $$new_props.padding);
      if ("active" in $$new_props) $$invalidate(9, active2 = $$new_props.active);
      if ("hover" in $$new_props) $$invalidate(10, hover = $$new_props.hover);
      if ("color" in $$new_props) $$invalidate(11, color = $$new_props.color);
      if ("fill" in $$new_props) $$invalidate(12, fill = $$new_props.fill);
      if ("regionLabel" in $$new_props) $$invalidate(13, regionLabel = $$new_props.regionLabel);
      if ("labelledby" in $$new_props) $$invalidate(0, labelledby = $$new_props.labelledby);
      if ("$$scope" in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      $$invalidate(1, classesBase = `${cBase$3} ${display} ${flexDirection} ${gap} ${background} ${border} ${rounded} ${$$props.class ?? ""}`);
    };
    $$props = exclude_internal_props($$props);
    return [
      labelledby,
      classesBase,
      display,
      flexDirection,
      gap,
      background,
      border,
      rounded,
      padding,
      active2,
      hover,
      color,
      fill,
      regionLabel,
      $$scope,
      slots
    ];
  }
  class RadioGroup extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$e, create_fragment$e, safe_not_equal, {
        display: 2,
        flexDirection: 3,
        gap: 4,
        background: 5,
        border: 6,
        rounded: 7,
        padding: 8,
        active: 9,
        hover: 10,
        color: 11,
        fill: 12,
        regionLabel: 13,
        labelledby: 0
      });
    }
  }
  function create_fragment$d(ctx) {
    let label_1;
    let div1;
    let div0;
    let input;
    let t2;
    let div1_class_value;
    let label_1_class_value;
    let current;
    let binding_group;
    let mounted;
    let dispose;
    let input_levels = [
      { type: "radio" },
      { name: (
        /*name*/
        ctx[1]
      ) },
      { __value: (
        /*value*/
        ctx[2]
      ) },
      /*prunedRestProps*/
      ctx[11](),
      { tabindex: "-1" }
    ];
    let input_data = {};
    for (let i = 0; i < input_levels.length; i += 1) {
      input_data = assign(input_data, input_levels[i]);
    }
    const default_slot_template = (
      /*#slots*/
      ctx[21].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[20],
      null
    );
    binding_group = init_binding_group(
      /*$$binding_groups*/
      ctx[29][0]
    );
    return {
      c() {
        label_1 = element("label");
        div1 = element("div");
        div0 = element("div");
        input = element("input");
        t2 = space();
        if (default_slot) default_slot.c();
        set_attributes(input, input_data);
        attr(div0, "class", "h-0 w-0 overflow-hidden");
        attr(div1, "class", div1_class_value = "radio-item " + /*classesWrapper*/
        ctx[8]);
        attr(div1, "data-testid", "radio-item");
        attr(div1, "role", "radio");
        attr(
          div1,
          "aria-checked",
          /*checked*/
          ctx[6]
        );
        attr(
          div1,
          "aria-label",
          /*label*/
          ctx[4]
        );
        attr(div1, "tabindex", "0");
        attr(
          div1,
          "title",
          /*title*/
          ctx[3]
        );
        attr(label_1, "class", label_1_class_value = "radio-label " + /*classsBase*/
        ctx[9] + " " + /*regionLabel*/
        ctx[5]);
        binding_group.p(input);
      },
      m(target, anchor) {
        insert(target, label_1, anchor);
        append(label_1, div1);
        append(div1, div0);
        append(div0, input);
        if (input.autofocus) input.focus();
        ctx[27](input);
        input.checked = input.__value === /*group*/
        ctx[0];
        append(div1, t2);
        if (default_slot) {
          default_slot.m(div1, null);
        }
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              input,
              "change",
              /*input_change_handler*/
              ctx[28]
            ),
            listen(
              input,
              "click",
              /*click_handler*/
              ctx[25]
            ),
            listen(
              input,
              "change",
              /*change_handler*/
              ctx[26]
            ),
            listen(
              div1,
              "keydown",
              /*onKeyDown*/
              ctx[10]
            ),
            listen(
              div1,
              "keydown",
              /*keydown_handler*/
              ctx[22]
            ),
            listen(
              div1,
              "keyup",
              /*keyup_handler*/
              ctx[23]
            ),
            listen(
              div1,
              "keypress",
              /*keypress_handler*/
              ctx[24]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        set_attributes(input, input_data = get_spread_update(input_levels, [
          { type: "radio" },
          (!current || dirty[0] & /*name*/
          2) && { name: (
            /*name*/
            ctx2[1]
          ) },
          (!current || dirty[0] & /*value*/
          4) && { __value: (
            /*value*/
            ctx2[2]
          ) },
          /*prunedRestProps*/
          ctx2[11](),
          { tabindex: "-1" }
        ]));
        if (dirty[0] & /*group*/
        1) {
          input.checked = input.__value === /*group*/
          ctx2[0];
        }
        if (default_slot) {
          if (default_slot.p && (!current || dirty[0] & /*$$scope*/
          1048576)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[20],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[20]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx2[20],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty[0] & /*classesWrapper*/
        256 && div1_class_value !== (div1_class_value = "radio-item " + /*classesWrapper*/
        ctx2[8])) {
          attr(div1, "class", div1_class_value);
        }
        if (!current || dirty[0] & /*checked*/
        64) {
          attr(
            div1,
            "aria-checked",
            /*checked*/
            ctx2[6]
          );
        }
        if (!current || dirty[0] & /*label*/
        16) {
          attr(
            div1,
            "aria-label",
            /*label*/
            ctx2[4]
          );
        }
        if (!current || dirty[0] & /*title*/
        8) {
          attr(
            div1,
            "title",
            /*title*/
            ctx2[3]
          );
        }
        if (!current || dirty[0] & /*classsBase, regionLabel*/
        544 && label_1_class_value !== (label_1_class_value = "radio-label " + /*classsBase*/
        ctx2[9] + " " + /*regionLabel*/
        ctx2[5])) {
          attr(label_1, "class", label_1_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(label_1);
        }
        ctx[27](null);
        if (default_slot) default_slot.d(detaching);
        binding_group.r();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  const cBase$2 = "flex-auto";
  const cWrapper = "text-base text-center cursor-pointer";
  const cDisabled = "opacity-50 cursor-not-allowed";
  function instance$d($$self, $$props, $$invalidate) {
    let checked;
    let classesActive;
    let classesDisabled;
    let classsBase;
    let classesWrapper;
    const omit_props_names = [
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
    ];
    let $$restProps = compute_rest_props($$props, omit_props_names);
    let { $$slots: slots = {}, $$scope } = $$props;
    let { group } = $$props;
    let { name } = $$props;
    let { value } = $$props;
    let { title = "" } = $$props;
    let { label = "" } = $$props;
    let { rounded = getContext("rounded") } = $$props;
    let { padding = getContext("padding") } = $$props;
    let { active: active2 = getContext("active") } = $$props;
    let { hover = getContext("hover") } = $$props;
    let { color = getContext("color") } = $$props;
    let { fill = getContext("fill") } = $$props;
    let { regionLabel = getContext("regionLabel") } = $$props;
    let elemInput;
    function onKeyDown(event) {
      if (["Enter", "Space"].includes(event.code)) {
        event.preventDefault();
        elemInput.click();
      }
    }
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    const $$binding_groups = [[]];
    function keydown_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler(event) {
      bubble.call(this, $$self, event);
    }
    function click_handler(event) {
      bubble.call(this, $$self, event);
    }
    function change_handler(event) {
      bubble.call(this, $$self, event);
    }
    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        elemInput = $$value;
        $$invalidate(7, elemInput);
      });
    }
    function input_change_handler() {
      group = this.__value;
      $$invalidate(0, group);
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(31, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      $$invalidate(30, $$restProps = compute_rest_props($$props, omit_props_names));
      if ("group" in $$new_props) $$invalidate(0, group = $$new_props.group);
      if ("name" in $$new_props) $$invalidate(1, name = $$new_props.name);
      if ("value" in $$new_props) $$invalidate(2, value = $$new_props.value);
      if ("title" in $$new_props) $$invalidate(3, title = $$new_props.title);
      if ("label" in $$new_props) $$invalidate(4, label = $$new_props.label);
      if ("rounded" in $$new_props) $$invalidate(12, rounded = $$new_props.rounded);
      if ("padding" in $$new_props) $$invalidate(13, padding = $$new_props.padding);
      if ("active" in $$new_props) $$invalidate(14, active2 = $$new_props.active);
      if ("hover" in $$new_props) $$invalidate(15, hover = $$new_props.hover);
      if ("color" in $$new_props) $$invalidate(16, color = $$new_props.color);
      if ("fill" in $$new_props) $$invalidate(17, fill = $$new_props.fill);
      if ("regionLabel" in $$new_props) $$invalidate(5, regionLabel = $$new_props.regionLabel);
      if ("$$scope" in $$new_props) $$invalidate(20, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty[0] & /*value, group*/
      5) {
        $$invalidate(6, checked = value === group);
      }
      if ($$self.$$.dirty[0] & /*checked, active, color, fill, hover*/
      245824) {
        $$invalidate(19, classesActive = checked ? `${active2} ${color} ${fill}` : hover);
      }
      $$invalidate(18, classesDisabled = $$props.disabled ? cDisabled : "");
      $$invalidate(8, classesWrapper = `${cWrapper} ${padding} ${rounded} ${classesActive} ${classesDisabled} ${$$props.class ?? ""}`);
    };
    $$invalidate(9, classsBase = `${cBase$2}`);
    $$props = exclude_internal_props($$props);
    return [
      group,
      name,
      value,
      title,
      label,
      regionLabel,
      checked,
      elemInput,
      classesWrapper,
      classsBase,
      onKeyDown,
      prunedRestProps,
      rounded,
      padding,
      active2,
      hover,
      color,
      fill,
      classesDisabled,
      classesActive,
      $$scope,
      slots,
      keydown_handler,
      keyup_handler,
      keypress_handler,
      click_handler,
      change_handler,
      input_binding,
      input_change_handler,
      $$binding_groups
    ];
  }
  class RadioItem extends SvelteComponent {
    constructor(options) {
      super();
      init(
        this,
        options,
        instance$d,
        create_fragment$d,
        safe_not_equal,
        {
          group: 0,
          name: 1,
          value: 2,
          title: 3,
          label: 4,
          rounded: 12,
          padding: 13,
          active: 14,
          hover: 15,
          color: 16,
          fill: 17,
          regionLabel: 5
        },
        null,
        [-1, -1]
      );
    }
  }
  const get_trail_slot_changes = (dirty) => ({});
  const get_trail_slot_context = (ctx) => ({});
  function get_each_context$3(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[23] = list[i];
    return child_ctx;
  }
  function create_if_block_2$1(ctx) {
    let label_1;
    let current;
    const default_slot_template = (
      /*#slots*/
      ctx[15].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[14],
      null
    );
    return {
      c() {
        label_1 = element("label");
        if (default_slot) default_slot.c();
        attr(label_1, "class", "range-slider-label " + cBaseLabel);
        attr(
          label_1,
          "for",
          /*id*/
          ctx[2]
        );
      },
      m(target, anchor) {
        insert(target, label_1, anchor);
        if (default_slot) {
          default_slot.m(label_1, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (default_slot) {
          if (default_slot.p && (!current || dirty & /*$$scope*/
          16384)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[14],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[14]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx2[14],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty & /*id*/
        4) {
          attr(
            label_1,
            "for",
            /*id*/
            ctx2[2]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(label_1);
        }
        if (default_slot) default_slot.d(detaching);
      }
    };
  }
  function create_if_block_1$2(ctx) {
    let datalist;
    let datalist_id_value;
    let each_value = ensure_array_like(
      /*tickmarks*/
      ctx[8]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    }
    return {
      c() {
        datalist = element("datalist");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(datalist, "id", datalist_id_value = "tickmarks-" + /*id*/
        ctx[2]);
        attr(datalist, "class", "range-slider-ticks");
      },
      m(target, anchor) {
        insert(target, datalist, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(datalist, null);
          }
        }
      },
      p(ctx2, dirty) {
        if (dirty & /*tickmarks*/
        256) {
          each_value = ensure_array_like(
            /*tickmarks*/
            ctx2[8]
          );
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context$3(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block$3(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(datalist, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
        if (dirty & /*id*/
        4 && datalist_id_value !== (datalist_id_value = "tickmarks-" + /*id*/
        ctx2[2])) {
          attr(datalist, "id", datalist_id_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(datalist);
        }
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_each_block$3(ctx) {
    let option;
    let option_value_value;
    let option_label_value;
    return {
      c() {
        option = element("option");
        option.__value = option_value_value = /*tm*/
        ctx[23];
        set_input_value(option, option.__value);
        attr(option, "label", option_label_value = /*tm*/
        ctx[23]);
      },
      m(target, anchor) {
        insert(target, option, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & /*tickmarks*/
        256 && option_value_value !== (option_value_value = /*tm*/
        ctx2[23])) {
          option.__value = option_value_value;
          set_input_value(option, option.__value);
        }
        if (dirty & /*tickmarks*/
        256 && option_label_value !== (option_label_value = /*tm*/
        ctx2[23])) {
          attr(option, "label", option_label_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(option);
        }
      }
    };
  }
  function create_if_block$8(ctx) {
    let div;
    let current;
    const trail_slot_template = (
      /*#slots*/
      ctx[15].trail
    );
    const trail_slot = create_slot(
      trail_slot_template,
      ctx,
      /*$$scope*/
      ctx[14],
      get_trail_slot_context
    );
    return {
      c() {
        div = element("div");
        if (trail_slot) trail_slot.c();
        attr(div, "class", "range-slider-trail");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (trail_slot) {
          trail_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (trail_slot) {
          if (trail_slot.p && (!current || dirty & /*$$scope*/
          16384)) {
            update_slot_base(
              trail_slot,
              trail_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[14],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[14]
              ) : get_slot_changes(
                trail_slot_template,
                /*$$scope*/
                ctx2[14],
                dirty,
                get_trail_slot_changes
              ),
              get_trail_slot_context
            );
          }
        }
      },
      i(local) {
        if (current) return;
        transition_in(trail_slot, local);
        current = true;
      },
      o(local) {
        transition_out(trail_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (trail_slot) trail_slot.d(detaching);
      }
    };
  }
  function create_fragment$c(ctx) {
    let div1;
    let t0;
    let div0;
    let input;
    let input_class_value;
    let input_list_value;
    let t1;
    let t2;
    let div1_class_value;
    let current;
    let mounted;
    let dispose;
    let if_block0 = (
      /*$$slots*/
      ctx[12].default && create_if_block_2$1(ctx)
    );
    let input_levels = [
      { type: "range" },
      { id: (
        /*id*/
        ctx[2]
      ) },
      { name: (
        /*name*/
        ctx[1]
      ) },
      {
        class: input_class_value = "range-slider-input " + /*classesInput*/
        ctx[9]
      },
      {
        list: input_list_value = "tickmarks-" + /*id*/
        ctx[2]
      },
      { "aria-label": (
        /*label*/
        ctx[7]
      ) },
      { min: (
        /*min*/
        ctx[3]
      ) },
      { max: (
        /*max*/
        ctx[4]
      ) },
      { step: (
        /*step*/
        ctx[5]
      ) },
      /*prunedRestProps*/
      ctx[11]()
    ];
    let input_data = {};
    for (let i = 0; i < input_levels.length; i += 1) {
      input_data = assign(input_data, input_levels[i]);
    }
    let if_block1 = (
      /*ticked*/
      ctx[6] && /*tickmarks*/
      ctx[8] && /*tickmarks*/
      ctx[8].length && create_if_block_1$2(ctx)
    );
    let if_block2 = (
      /*$$slots*/
      ctx[12].trail && create_if_block$8(ctx)
    );
    return {
      c() {
        div1 = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        div0 = element("div");
        input = element("input");
        t1 = space();
        if (if_block1) if_block1.c();
        t2 = space();
        if (if_block2) if_block2.c();
        set_attributes(input, input_data);
        attr(div0, "class", "range-content " + cBaseContent);
        attr(div1, "class", div1_class_value = "range-slider " + /*classesBase*/
        ctx[10]);
        attr(div1, "data-testid", "range-slider");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        if (if_block0) if_block0.m(div1, null);
        append(div1, t0);
        append(div1, div0);
        append(div0, input);
        if (input.autofocus) input.focus();
        set_input_value(
          input,
          /*value*/
          ctx[0]
        );
        append(div0, t1);
        if (if_block1) if_block1.m(div0, null);
        append(div1, t2);
        if (if_block2) if_block2.m(div1, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              input,
              "change",
              /*input_change_input_handler*/
              ctx[19]
            ),
            listen(
              input,
              "input",
              /*input_change_input_handler*/
              ctx[19]
            ),
            listen(
              input,
              "click",
              /*click_handler*/
              ctx[16]
            ),
            listen(
              input,
              "change",
              /*change_handler*/
              ctx[17]
            ),
            listen(
              input,
              "blur",
              /*blur_handler*/
              ctx[18]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (
          /*$$slots*/
          ctx2[12].default
        ) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
            if (dirty & /*$$slots*/
            4096) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_2$1(ctx2);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(div1, t0);
          }
        } else if (if_block0) {
          group_outros();
          transition_out(if_block0, 1, 1, () => {
            if_block0 = null;
          });
          check_outros();
        }
        set_attributes(input, input_data = get_spread_update(input_levels, [
          { type: "range" },
          (!current || dirty & /*id*/
          4) && { id: (
            /*id*/
            ctx2[2]
          ) },
          (!current || dirty & /*name*/
          2) && { name: (
            /*name*/
            ctx2[1]
          ) },
          (!current || dirty & /*classesInput*/
          512 && input_class_value !== (input_class_value = "range-slider-input " + /*classesInput*/
          ctx2[9])) && { class: input_class_value },
          (!current || dirty & /*id*/
          4 && input_list_value !== (input_list_value = "tickmarks-" + /*id*/
          ctx2[2])) && { list: input_list_value },
          (!current || dirty & /*label*/
          128) && { "aria-label": (
            /*label*/
            ctx2[7]
          ) },
          (!current || dirty & /*min*/
          8) && { min: (
            /*min*/
            ctx2[3]
          ) },
          (!current || dirty & /*max*/
          16) && { max: (
            /*max*/
            ctx2[4]
          ) },
          (!current || dirty & /*step*/
          32) && { step: (
            /*step*/
            ctx2[5]
          ) },
          /*prunedRestProps*/
          ctx2[11]()
        ]));
        if (dirty & /*value*/
        1) {
          set_input_value(
            input,
            /*value*/
            ctx2[0]
          );
        }
        if (
          /*ticked*/
          ctx2[6] && /*tickmarks*/
          ctx2[8] && /*tickmarks*/
          ctx2[8].length
        ) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block_1$2(ctx2);
            if_block1.c();
            if_block1.m(div0, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
        if (
          /*$$slots*/
          ctx2[12].trail
        ) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty & /*$$slots*/
            4096) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block$8(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(div1, null);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
        if (!current || dirty & /*classesBase*/
        1024 && div1_class_value !== (div1_class_value = "range-slider " + /*classesBase*/
        ctx2[10])) {
          attr(div1, "class", div1_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block0);
        transition_in(if_block2);
        current = true;
      },
      o(local) {
        transition_out(if_block0);
        transition_out(if_block2);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  const cBase$1 = "space-y-2";
  const cBaseLabel = "";
  const cBaseContent = "flex justify-center py-2";
  const cBaseInput = "w-full h-2";
  function instance$c($$self, $$props, $$invalidate) {
    let classesBase;
    let classesInput;
    const omit_props_names = ["name", "id", "value", "min", "max", "step", "ticked", "accent", "label"];
    let $$restProps = compute_rest_props($$props, omit_props_names);
    let { $$slots: slots = {}, $$scope } = $$props;
    const $$slots = compute_slots(slots);
    let { name } = $$props;
    let { id = String(Math.random()) } = $$props;
    let { value = 0 } = $$props;
    let { min = 0 } = $$props;
    let { max: max2 = 100 } = $$props;
    let { step: step2 = 1 } = $$props;
    let { ticked = false } = $$props;
    let { accent = "accent-surface-900 dark:accent-surface-50" } = $$props;
    let { label = "" } = $$props;
    let tickmarks;
    function setTicks() {
      if (ticked == false) return;
      $$invalidate(8, tickmarks = Array.from({ length: max2 - min + 1 }, (_, i) => i + min));
    }
    if (ticked) setTicks();
    afterUpdate(() => {
      setTicks();
    });
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    function click_handler(event) {
      bubble.call(this, $$self, event);
    }
    function change_handler(event) {
      bubble.call(this, $$self, event);
    }
    function blur_handler(event) {
      bubble.call(this, $$self, event);
    }
    function input_change_input_handler() {
      value = to_number(this.value);
      $$invalidate(0, value);
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(22, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      $$invalidate(21, $$restProps = compute_rest_props($$props, omit_props_names));
      if ("name" in $$new_props) $$invalidate(1, name = $$new_props.name);
      if ("id" in $$new_props) $$invalidate(2, id = $$new_props.id);
      if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
      if ("min" in $$new_props) $$invalidate(3, min = $$new_props.min);
      if ("max" in $$new_props) $$invalidate(4, max2 = $$new_props.max);
      if ("step" in $$new_props) $$invalidate(5, step2 = $$new_props.step);
      if ("ticked" in $$new_props) $$invalidate(6, ticked = $$new_props.ticked);
      if ("accent" in $$new_props) $$invalidate(13, accent = $$new_props.accent);
      if ("label" in $$new_props) $$invalidate(7, label = $$new_props.label);
      if ("$$scope" in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      $$invalidate(10, classesBase = `${cBase$1} ${$$props.class ?? ""}`);
      if ($$self.$$.dirty & /*accent*/
      8192) {
        $$invalidate(9, classesInput = `${cBaseInput} ${accent}`);
      }
    };
    $$props = exclude_internal_props($$props);
    return [
      value,
      name,
      id,
      min,
      max2,
      step2,
      ticked,
      label,
      tickmarks,
      classesInput,
      classesBase,
      prunedRestProps,
      $$slots,
      accent,
      $$scope,
      slots,
      click_handler,
      change_handler,
      blur_handler,
      input_change_input_handler
    ];
  }
  class RangeSlider extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$c, create_fragment$c, safe_not_equal, {
        name: 1,
        id: 2,
        value: 0,
        min: 3,
        max: 4,
        step: 5,
        ticked: 6,
        accent: 13,
        label: 7
      });
    }
  }
  function create_if_block$7(ctx) {
    let div;
    let current;
    const default_slot_template = (
      /*#slots*/
      ctx[22].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[21],
      null
    );
    return {
      c() {
        div = element("div");
        if (default_slot) default_slot.c();
        attr(div, "class", "slide-toggle-text ml-3");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (default_slot) {
          default_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (default_slot) {
          if (default_slot.p && (!current || dirty[0] & /*$$scope*/
          2097152)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx2,
              /*$$scope*/
              ctx2[21],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx2[21]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx2[21],
                dirty,
                null
              ),
              null
            );
          }
        }
      },
      i(local) {
        if (current) return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (default_slot) default_slot.d(detaching);
      }
    };
  }
  function create_fragment$b(ctx) {
    let div2;
    let label_1;
    let input;
    let input_disabled_value;
    let t0;
    let div1;
    let div0;
    let div0_class_value;
    let div1_class_value;
    let t1;
    let label_1_class_value;
    let div2_class_value;
    let current;
    let mounted;
    let dispose;
    let input_levels = [
      { type: "checkbox" },
      { class: "slide-toggle-input hidden" },
      { name: (
        /*name*/
        ctx[1]
      ) },
      /*prunedRestProps*/
      ctx[8](),
      {
        disabled: input_disabled_value = /*$$props*/
        ctx[9].disabled
      }
    ];
    let input_data = {};
    for (let i = 0; i < input_levels.length; i += 1) {
      input_data = assign(input_data, input_levels[i]);
    }
    let if_block = (
      /*$$slots*/
      ctx[10].default && create_if_block$7(ctx)
    );
    return {
      c() {
        div2 = element("div");
        label_1 = element("label");
        input = element("input");
        t0 = space();
        div1 = element("div");
        div0 = element("div");
        t1 = space();
        if (if_block) if_block.c();
        set_attributes(input, input_data);
        attr(div0, "class", div0_class_value = "slide-toggle-thumb " + /*classesThumb*/
        ctx[3]);
        toggle_class(
          div0,
          "cursor-not-allowed",
          /*$$props*/
          ctx[9].disabled
        );
        attr(div1, "class", div1_class_value = "slide-toggle-track " + /*classesTrack*/
        ctx[4]);
        toggle_class(
          div1,
          "cursor-not-allowed",
          /*$$props*/
          ctx[9].disabled
        );
        attr(label_1, "class", label_1_class_value = "slide-toggle-label " + /*classesLabel*/
        ctx[5]);
        attr(
          div2,
          "id",
          /*label*/
          ctx[2]
        );
        attr(div2, "class", div2_class_value = "slide-toggle " + /*classesBase*/
        ctx[6]);
        attr(div2, "data-testid", "slide-toggle");
        attr(div2, "role", "switch");
        attr(
          div2,
          "aria-label",
          /*label*/
          ctx[2]
        );
        attr(
          div2,
          "aria-checked",
          /*checked*/
          ctx[0]
        );
        attr(div2, "tabindex", "0");
      },
      m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, label_1);
        append(label_1, input);
        if (input.autofocus) input.focus();
        input.checked = /*checked*/
        ctx[0];
        append(label_1, t0);
        append(label_1, div1);
        append(div1, div0);
        append(label_1, t1);
        if (if_block) if_block.m(label_1, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              input,
              "change",
              /*input_change_handler*/
              ctx[31]
            ),
            listen(
              input,
              "click",
              /*click_handler*/
              ctx[23]
            ),
            listen(
              input,
              "keydown",
              /*keydown_handler*/
              ctx[24]
            ),
            listen(
              input,
              "keyup",
              /*keyup_handler*/
              ctx[25]
            ),
            listen(
              input,
              "keypress",
              /*keypress_handler*/
              ctx[26]
            ),
            listen(
              input,
              "mouseover",
              /*mouseover_handler*/
              ctx[27]
            ),
            listen(
              input,
              "change",
              /*change_handler*/
              ctx[28]
            ),
            listen(
              input,
              "focus",
              /*focus_handler*/
              ctx[29]
            ),
            listen(
              input,
              "blur",
              /*blur_handler*/
              ctx[30]
            ),
            listen(
              div2,
              "keydown",
              /*onKeyDown*/
              ctx[7]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        set_attributes(input, input_data = get_spread_update(input_levels, [
          { type: "checkbox" },
          { class: "slide-toggle-input hidden" },
          (!current || dirty[0] & /*name*/
          2) && { name: (
            /*name*/
            ctx2[1]
          ) },
          /*prunedRestProps*/
          ctx2[8](),
          (!current || dirty[0] & /*$$props*/
          512 && input_disabled_value !== (input_disabled_value = /*$$props*/
          ctx2[9].disabled)) && { disabled: input_disabled_value }
        ]));
        if (dirty[0] & /*checked*/
        1) {
          input.checked = /*checked*/
          ctx2[0];
        }
        if (!current || dirty[0] & /*classesThumb*/
        8 && div0_class_value !== (div0_class_value = "slide-toggle-thumb " + /*classesThumb*/
        ctx2[3])) {
          attr(div0, "class", div0_class_value);
        }
        if (!current || dirty[0] & /*classesThumb, $$props*/
        520) {
          toggle_class(
            div0,
            "cursor-not-allowed",
            /*$$props*/
            ctx2[9].disabled
          );
        }
        if (!current || dirty[0] & /*classesTrack*/
        16 && div1_class_value !== (div1_class_value = "slide-toggle-track " + /*classesTrack*/
        ctx2[4])) {
          attr(div1, "class", div1_class_value);
        }
        if (!current || dirty[0] & /*classesTrack, $$props*/
        528) {
          toggle_class(
            div1,
            "cursor-not-allowed",
            /*$$props*/
            ctx2[9].disabled
          );
        }
        if (
          /*$$slots*/
          ctx2[10].default
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty[0] & /*$$slots*/
            1024) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$7(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(label_1, null);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
        if (!current || dirty[0] & /*classesLabel*/
        32 && label_1_class_value !== (label_1_class_value = "slide-toggle-label " + /*classesLabel*/
        ctx2[5])) {
          attr(label_1, "class", label_1_class_value);
        }
        if (!current || dirty[0] & /*label*/
        4) {
          attr(
            div2,
            "id",
            /*label*/
            ctx2[2]
          );
        }
        if (!current || dirty[0] & /*classesBase*/
        64 && div2_class_value !== (div2_class_value = "slide-toggle " + /*classesBase*/
        ctx2[6])) {
          attr(div2, "class", div2_class_value);
        }
        if (!current || dirty[0] & /*label*/
        4) {
          attr(
            div2,
            "aria-label",
            /*label*/
            ctx2[2]
          );
        }
        if (!current || dirty[0] & /*checked*/
        1) {
          attr(
            div2,
            "aria-checked",
            /*checked*/
            ctx2[0]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div2);
        }
        if (if_block) if_block.d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  const cBase = "inline-block";
  const cLabel = "unstyled flex items-center";
  const cTrack = "flex transition-all duration-[200ms] cursor-pointer";
  const cThumb = "w-[50%] h-full scale-[0.8] transition-all duration-[200ms] shadow";
  function instance$b($$self, $$props, $$invalidate) {
    let cTrackActive;
    let cThumbBackground;
    let cThumbPos;
    let classesDisabled;
    let classesBase;
    let classesLabel;
    let classesTrack;
    let classesThumb;
    const omit_props_names = ["name", "checked", "size", "background", "active", "border", "rounded", "label"];
    let $$restProps = compute_rest_props($$props, omit_props_names);
    let { $$slots: slots = {}, $$scope } = $$props;
    const $$slots = compute_slots(slots);
    const dispatch2 = createEventDispatcher();
    let { name } = $$props;
    let { checked = false } = $$props;
    let { size = "md" } = $$props;
    let { background = "bg-surface-400 dark:bg-surface-700" } = $$props;
    let { active: active2 = "bg-surface-900 dark:bg-surface-300" } = $$props;
    let { border = "" } = $$props;
    let { rounded = "rounded-full" } = $$props;
    let { label = "" } = $$props;
    let trackSize;
    switch (size) {
      case "sm":
        trackSize = "w-12 h-6";
        break;
      case "lg":
        trackSize = "w-20 h-10";
        break;
      default:
        trackSize = "w-16 h-8";
    }
    function onKeyDown(event) {
      if (["Enter", "Space"].includes(event.code)) {
        event.preventDefault();
        dispatch2("keyup", event);
        const inputElem = event.currentTarget.firstChild;
        inputElem.click();
      }
    }
    function prunedRestProps() {
      delete $$restProps.class;
      return $$restProps;
    }
    function click_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keydown_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler(event) {
      bubble.call(this, $$self, event);
    }
    function mouseover_handler(event) {
      bubble.call(this, $$self, event);
    }
    function change_handler(event) {
      bubble.call(this, $$self, event);
    }
    function focus_handler(event) {
      bubble.call(this, $$self, event);
    }
    function blur_handler(event) {
      bubble.call(this, $$self, event);
    }
    function input_change_handler() {
      checked = this.checked;
      $$invalidate(0, checked);
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(9, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      $$invalidate(33, $$restProps = compute_rest_props($$props, omit_props_names));
      if ("name" in $$new_props) $$invalidate(1, name = $$new_props.name);
      if ("checked" in $$new_props) $$invalidate(0, checked = $$new_props.checked);
      if ("size" in $$new_props) $$invalidate(11, size = $$new_props.size);
      if ("background" in $$new_props) $$invalidate(12, background = $$new_props.background);
      if ("active" in $$new_props) $$invalidate(13, active2 = $$new_props.active);
      if ("border" in $$new_props) $$invalidate(14, border = $$new_props.border);
      if ("rounded" in $$new_props) $$invalidate(15, rounded = $$new_props.rounded);
      if ("label" in $$new_props) $$invalidate(2, label = $$new_props.label);
      if ("$$scope" in $$new_props) $$invalidate(21, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty[0] & /*checked, active, background*/
      12289) {
        $$invalidate(19, cTrackActive = checked ? active2 : `${background} cursor-pointer`);
      }
      if ($$self.$$.dirty[0] & /*checked*/
      1) {
        $$invalidate(18, cThumbBackground = checked ? "bg-white/75" : "bg-white");
      }
      if ($$self.$$.dirty[0] & /*checked*/
      1) {
        $$invalidate(17, cThumbPos = checked ? "translate-x-full" : "");
      }
      $$invalidate(20, classesDisabled = $$props.disabled === true ? "opacity-50" : "hover:brightness-[105%] dark:hover:brightness-110 cursor-pointer");
      $$invalidate(6, classesBase = `${cBase} ${rounded} ${classesDisabled} ${$$props.class ?? ""}`);
      if ($$self.$$.dirty[0] & /*border, rounded, trackSize, cTrackActive*/
      638976) {
        $$invalidate(4, classesTrack = `${cTrack} ${border} ${rounded} ${trackSize} ${cTrackActive}`);
      }
      if ($$self.$$.dirty[0] & /*rounded, cThumbBackground, cThumbPos*/
      425984) {
        $$invalidate(3, classesThumb = `${cThumb} ${rounded} ${cThumbBackground} ${cThumbPos}`);
      }
    };
    $$invalidate(5, classesLabel = `${cLabel}`);
    $$props = exclude_internal_props($$props);
    return [
      checked,
      name,
      label,
      classesThumb,
      classesTrack,
      classesLabel,
      classesBase,
      onKeyDown,
      prunedRestProps,
      $$props,
      $$slots,
      size,
      background,
      active2,
      border,
      rounded,
      trackSize,
      cThumbPos,
      cThumbBackground,
      cTrackActive,
      classesDisabled,
      $$scope,
      slots,
      click_handler,
      keydown_handler,
      keyup_handler,
      keypress_handler,
      mouseover_handler,
      change_handler,
      focus_handler,
      blur_handler,
      input_change_handler
    ];
  }
  class SlideToggle extends SvelteComponent {
    constructor(options) {
      super();
      init(
        this,
        options,
        instance$b,
        create_fragment$b,
        safe_not_equal,
        {
          name: 1,
          checked: 0,
          size: 11,
          background: 12,
          active: 13,
          border: 14,
          rounded: 15,
          label: 2
        },
        null,
        [-1, -1]
      );
    }
  }
  function create_if_block$6(ctx) {
    let previous_key = (
      /*$modalStore*/
      ctx[14]
    );
    let key_block_anchor;
    let current;
    let key_block = create_key_block(ctx);
    return {
      c() {
        key_block.c();
        key_block_anchor = empty();
      },
      m(target, anchor) {
        key_block.m(target, anchor);
        insert(target, key_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*$modalStore*/
        16384 && safe_not_equal(previous_key, previous_key = /*$modalStore*/
        ctx2[14])) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block(ctx2);
          key_block.c();
          transition_in(key_block, 1);
          key_block.m(key_block_anchor.parentNode, key_block_anchor);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current) return;
        transition_in(key_block);
        current = true;
      },
      o(local) {
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(key_block_anchor);
        }
        key_block.d(detaching);
      }
    };
  }
  function create_else_block$2(ctx) {
    let div;
    let current_block_type_index;
    let if_block;
    let div_class_value;
    let div_aria_label_value;
    let current;
    const if_block_creators = [create_if_block_8, create_else_block_1];
    const if_blocks = [];
    function select_block_type_2(ctx2, dirty) {
      var _a;
      if (
        /*currentComponent*/
        (_a = ctx2[16]) == null ? void 0 : _a.slot
      ) return 0;
      return 1;
    }
    current_block_type_index = select_block_type_2(ctx);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        var _a;
        div = element("div");
        if_block.c();
        attr(div, "class", div_class_value = "modal contents " + /*$modalStore*/
        (((_a = ctx[14][0]) == null ? void 0 : _a.modalClasses) ?? ""));
        attr(div, "data-testid", "modal-component");
        attr(div, "role", "dialog");
        attr(div, "aria-modal", "true");
        attr(div, "aria-label", div_aria_label_value = /*$modalStore*/
        ctx[14][0].title ?? "");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if_blocks[current_block_type_index].m(div, null);
        ctx[47](div);
        current = true;
      },
      p(ctx2, dirty) {
        var _a;
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type_2(ctx2);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
        if (!current || dirty[0] & /*$modalStore*/
        16384 && div_class_value !== (div_class_value = "modal contents " + /*$modalStore*/
        (((_a = ctx2[14][0]) == null ? void 0 : _a.modalClasses) ?? ""))) {
          attr(div, "class", div_class_value);
        }
        if (!current || dirty[0] & /*$modalStore*/
        16384 && div_aria_label_value !== (div_aria_label_value = /*$modalStore*/
        ctx2[14][0].title ?? "")) {
          attr(div, "aria-label", div_aria_label_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if_blocks[current_block_type_index].d();
        ctx[47](null);
      }
    };
  }
  function create_if_block_1$1(ctx) {
    var _a, _b, _c, _d;
    let div;
    let t0;
    let t1;
    let t2;
    let div_class_value;
    let div_aria_label_value;
    let if_block0 = (
      /*$modalStore*/
      ((_a = ctx[14][0]) == null ? void 0 : _a.title) && create_if_block_7(ctx)
    );
    let if_block1 = (
      /*$modalStore*/
      ((_b = ctx[14][0]) == null ? void 0 : _b.body) && create_if_block_6(ctx)
    );
    let if_block2 = (
      /*$modalStore*/
      ((_c = ctx[14][0]) == null ? void 0 : _c.image) && typeof /*$modalStore*/
      ((_d = ctx[14][0]) == null ? void 0 : _d.image) === "string" && create_if_block_5(ctx)
    );
    function select_block_type_1(ctx2, dirty) {
      if (
        /*$modalStore*/
        ctx2[14][0].type === "alert"
      ) return create_if_block_2;
      if (
        /*$modalStore*/
        ctx2[14][0].type === "confirm"
      ) return create_if_block_3;
      if (
        /*$modalStore*/
        ctx2[14][0].type === "prompt"
      ) return create_if_block_4;
    }
    let current_block_type = select_block_type_1(ctx);
    let if_block3 = current_block_type && current_block_type(ctx);
    return {
      c() {
        div = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        if (if_block1) if_block1.c();
        t1 = space();
        if (if_block2) if_block2.c();
        t2 = space();
        if (if_block3) if_block3.c();
        attr(div, "class", div_class_value = "modal " + /*classesModal*/
        ctx[20]);
        attr(div, "data-testid", "modal");
        attr(div, "role", "dialog");
        attr(div, "aria-modal", "true");
        attr(div, "aria-label", div_aria_label_value = /*$modalStore*/
        ctx[14][0].title ?? "");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (if_block0) if_block0.m(div, null);
        append(div, t0);
        if (if_block1) if_block1.m(div, null);
        append(div, t1);
        if (if_block2) if_block2.m(div, null);
        append(div, t2);
        if (if_block3) if_block3.m(div, null);
        ctx[46](div);
      },
      p(ctx2, dirty) {
        var _a2, _b2, _c2, _d2;
        if (
          /*$modalStore*/
          (_a2 = ctx2[14][0]) == null ? void 0 : _a2.title
        ) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_7(ctx2);
            if_block0.c();
            if_block0.m(div, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (
          /*$modalStore*/
          (_b2 = ctx2[14][0]) == null ? void 0 : _b2.body
        ) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block_6(ctx2);
            if_block1.c();
            if_block1.m(div, t1);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
        if (
          /*$modalStore*/
          ((_c2 = ctx2[14][0]) == null ? void 0 : _c2.image) && typeof /*$modalStore*/
          ((_d2 = ctx2[14][0]) == null ? void 0 : _d2.image) === "string"
        ) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
          } else {
            if_block2 = create_if_block_5(ctx2);
            if_block2.c();
            if_block2.m(div, t2);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }
        if (current_block_type === (current_block_type = select_block_type_1(ctx2)) && if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if (if_block3) if_block3.d(1);
          if_block3 = current_block_type && current_block_type(ctx2);
          if (if_block3) {
            if_block3.c();
            if_block3.m(div, null);
          }
        }
        if (dirty[0] & /*classesModal*/
        1048576 && div_class_value !== (div_class_value = "modal " + /*classesModal*/
        ctx2[20])) {
          attr(div, "class", div_class_value);
        }
        if (dirty[0] & /*$modalStore*/
        16384 && div_aria_label_value !== (div_aria_label_value = /*$modalStore*/
        ctx2[14][0].title ?? "")) {
          attr(div, "aria-label", div_aria_label_value);
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
        if (if_block3) {
          if_block3.d();
        }
        ctx[46](null);
      }
    };
  }
  function create_else_block_1(ctx) {
    var _a, _b;
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [
      /*currentComponent*/
      (_a = ctx[16]) == null ? void 0 : _a.props,
      { parent: (
        /*parent*/
        ctx[19]
      ) }
    ];
    var switch_value = (
      /*currentComponent*/
      (_b = ctx[16]) == null ? void 0 : _b.ref
    );
    function switch_props(ctx2, dirty) {
      var _a2;
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      if (dirty !== void 0 && dirty[0] & /*currentComponent, parent*/
      589824) {
        switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [
          dirty[0] & /*currentComponent*/
          65536 && get_spread_object(
            /*currentComponent*/
            (_a2 = ctx2[16]) == null ? void 0 : _a2.props
          ),
          dirty[0] & /*parent*/
          524288 && { parent: (
            /*parent*/
            ctx2[19]
          ) }
        ]));
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance) create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) mount_component(switch_instance, target, anchor);
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        var _a2, _b2;
        if (dirty[0] & /*currentComponent*/
        65536 && switch_value !== (switch_value = /*currentComponent*/
        (_a2 = ctx2[16]) == null ? void 0 : _a2.ref)) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = construct_svelte_component(switch_value, switch_props(ctx2, dirty));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          const switch_instance_changes = dirty[0] & /*currentComponent, parent*/
          589824 ? get_spread_update(switch_instance_spread_levels, [
            dirty[0] & /*currentComponent*/
            65536 && get_spread_object(
              /*currentComponent*/
              (_b2 = ctx2[16]) == null ? void 0 : _b2.props
            ),
            dirty[0] & /*parent*/
            524288 && { parent: (
              /*parent*/
              ctx2[19]
            ) }
          ]) : {};
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current) return;
        if (switch_instance) transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance) transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(switch_instance_anchor);
        }
        if (switch_instance) destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_if_block_8(ctx) {
    var _a, _b;
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [
      /*currentComponent*/
      (_a = ctx[16]) == null ? void 0 : _a.props,
      { parent: (
        /*parent*/
        ctx[19]
      ) }
    ];
    var switch_value = (
      /*currentComponent*/
      (_b = ctx[16]) == null ? void 0 : _b.ref
    );
    function switch_props(ctx2, dirty) {
      var _a2;
      let switch_instance_props = {
        $$slots: { default: [create_default_slot$6] },
        $$scope: { ctx: ctx2 }
      };
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      if (dirty !== void 0 && dirty[0] & /*currentComponent, parent*/
      589824) {
        switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [
          dirty[0] & /*currentComponent*/
          65536 && get_spread_object(
            /*currentComponent*/
            (_a2 = ctx2[16]) == null ? void 0 : _a2.props
          ),
          dirty[0] & /*parent*/
          524288 && { parent: (
            /*parent*/
            ctx2[19]
          ) }
        ]));
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance) create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) mount_component(switch_instance, target, anchor);
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        var _a2, _b2;
        if (dirty[0] & /*currentComponent*/
        65536 && switch_value !== (switch_value = /*currentComponent*/
        (_a2 = ctx2[16]) == null ? void 0 : _a2.ref)) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = construct_svelte_component(switch_value, switch_props(ctx2, dirty));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          const switch_instance_changes = dirty[0] & /*currentComponent, parent*/
          589824 ? get_spread_update(switch_instance_spread_levels, [
            dirty[0] & /*currentComponent*/
            65536 && get_spread_object(
              /*currentComponent*/
              (_b2 = ctx2[16]) == null ? void 0 : _b2.props
            ),
            dirty[0] & /*parent*/
            524288 && { parent: (
              /*parent*/
              ctx2[19]
            ) }
          ]) : {};
          if (dirty[0] & /*currentComponent*/
          65536 | dirty[1] & /*$$scope*/
          16777216) {
            switch_instance_changes.$$scope = { dirty, ctx: ctx2 };
          }
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current) return;
        if (switch_instance) transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance) transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(switch_instance_anchor);
        }
        if (switch_instance) destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_default_slot$6(ctx) {
    var _a;
    let html_tag;
    let raw_value = (
      /*currentComponent*/
      ((_a = ctx[16]) == null ? void 0 : _a.slot) + ""
    );
    let html_anchor;
    return {
      c() {
        html_tag = new HtmlTag(false);
        html_anchor = empty();
        html_tag.a = html_anchor;
      },
      m(target, anchor) {
        html_tag.m(raw_value, target, anchor);
        insert(target, html_anchor, anchor);
      },
      p(ctx2, dirty) {
        var _a2;
        if (dirty[0] & /*currentComponent*/
        65536 && raw_value !== (raw_value = /*currentComponent*/
        ((_a2 = ctx2[16]) == null ? void 0 : _a2.slot) + "")) html_tag.p(raw_value);
      },
      d(detaching) {
        if (detaching) {
          detach(html_anchor);
          html_tag.d();
        }
      }
    };
  }
  function create_if_block_7(ctx) {
    let header;
    let raw_value = (
      /*$modalStore*/
      ctx[14][0].title + ""
    );
    let header_class_value;
    return {
      c() {
        header = element("header");
        attr(header, "class", header_class_value = "modal-header " + /*regionHeader*/
        ctx[5]);
      },
      m(target, anchor) {
        insert(target, header, anchor);
        header.innerHTML = raw_value;
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*$modalStore*/
        16384 && raw_value !== (raw_value = /*$modalStore*/
        ctx2[14][0].title + "")) header.innerHTML = raw_value;
        if (dirty[0] & /*regionHeader*/
        32 && header_class_value !== (header_class_value = "modal-header " + /*regionHeader*/
        ctx2[5])) {
          attr(header, "class", header_class_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(header);
        }
      }
    };
  }
  function create_if_block_6(ctx) {
    let article;
    let raw_value = (
      /*$modalStore*/
      ctx[14][0].body + ""
    );
    let article_class_value;
    return {
      c() {
        article = element("article");
        attr(article, "class", article_class_value = "modal-body " + /*regionBody*/
        ctx[6]);
      },
      m(target, anchor) {
        insert(target, article, anchor);
        article.innerHTML = raw_value;
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*$modalStore*/
        16384 && raw_value !== (raw_value = /*$modalStore*/
        ctx2[14][0].body + "")) article.innerHTML = raw_value;
        if (dirty[0] & /*regionBody*/
        64 && article_class_value !== (article_class_value = "modal-body " + /*regionBody*/
        ctx2[6])) {
          attr(article, "class", article_class_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(article);
        }
      }
    };
  }
  function create_if_block_5(ctx) {
    let img;
    let img_src_value;
    return {
      c() {
        var _a;
        img = element("img");
        attr(img, "class", "modal-image " + cModalImage);
        if (!src_url_equal(img.src, img_src_value = /*$modalStore*/
        (_a = ctx[14][0]) == null ? void 0 : _a.image)) attr(img, "src", img_src_value);
        attr(img, "alt", "Modal");
      },
      m(target, anchor) {
        insert(target, img, anchor);
      },
      p(ctx2, dirty) {
        var _a;
        if (dirty[0] & /*$modalStore*/
        16384 && !src_url_equal(img.src, img_src_value = /*$modalStore*/
        (_a = ctx2[14][0]) == null ? void 0 : _a.image)) {
          attr(img, "src", img_src_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(img);
        }
      }
    };
  }
  function create_if_block_4(ctx) {
    let form;
    let input;
    let t0;
    let footer;
    let button0;
    let t1;
    let button0_class_value;
    let t2;
    let button1;
    let t3;
    let button1_class_value;
    let footer_class_value;
    let mounted;
    let dispose;
    let input_levels = [
      { class: "modal-prompt-input input" },
      { name: "prompt" },
      { type: "text" },
      /*$modalStore*/
      ctx[14][0].valueAttr
    ];
    let input_data = {};
    for (let i = 0; i < input_levels.length; i += 1) {
      input_data = assign(input_data, input_levels[i]);
    }
    return {
      c() {
        form = element("form");
        input = element("input");
        t0 = space();
        footer = element("footer");
        button0 = element("button");
        t1 = text(
          /*buttonTextCancel*/
          ctx[0]
        );
        t2 = space();
        button1 = element("button");
        t3 = text(
          /*buttonTextSubmit*/
          ctx[2]
        );
        set_attributes(input, input_data);
        attr(button0, "type", "button");
        attr(button0, "class", button0_class_value = "btn " + /*buttonNeutral*/
        ctx[3]);
        attr(button1, "type", "submit");
        attr(button1, "class", button1_class_value = "btn " + /*buttonPositive*/
        ctx[4]);
        attr(footer, "class", footer_class_value = "modal-footer " + /*regionFooter*/
        ctx[7]);
        attr(form, "class", "space-y-4");
      },
      m(target, anchor) {
        insert(target, form, anchor);
        append(form, input);
        if (input.autofocus) input.focus();
        set_input_value(
          input,
          /*promptValue*/
          ctx[15]
        );
        append(form, t0);
        append(form, footer);
        append(footer, button0);
        append(button0, t1);
        append(footer, t2);
        append(footer, button1);
        append(button1, t3);
        if (!mounted) {
          dispose = [
            listen(
              input,
              "input",
              /*input_input_handler*/
              ctx[45]
            ),
            listen(
              button0,
              "click",
              /*onClose*/
              ctx[26]
            ),
            listen(
              form,
              "submit",
              /*onPromptSubmit*/
              ctx[28]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        set_attributes(input, input_data = get_spread_update(input_levels, [
          { class: "modal-prompt-input input" },
          { name: "prompt" },
          { type: "text" },
          dirty[0] & /*$modalStore*/
          16384 && /*$modalStore*/
          ctx2[14][0].valueAttr
        ]));
        if (dirty[0] & /*promptValue*/
        32768 && input.value !== /*promptValue*/
        ctx2[15]) {
          set_input_value(
            input,
            /*promptValue*/
            ctx2[15]
          );
        }
        if (dirty[0] & /*buttonTextCancel*/
        1) set_data(
          t1,
          /*buttonTextCancel*/
          ctx2[0]
        );
        if (dirty[0] & /*buttonNeutral*/
        8 && button0_class_value !== (button0_class_value = "btn " + /*buttonNeutral*/
        ctx2[3])) {
          attr(button0, "class", button0_class_value);
        }
        if (dirty[0] & /*buttonTextSubmit*/
        4) set_data(
          t3,
          /*buttonTextSubmit*/
          ctx2[2]
        );
        if (dirty[0] & /*buttonPositive*/
        16 && button1_class_value !== (button1_class_value = "btn " + /*buttonPositive*/
        ctx2[4])) {
          attr(button1, "class", button1_class_value);
        }
        if (dirty[0] & /*regionFooter*/
        128 && footer_class_value !== (footer_class_value = "modal-footer " + /*regionFooter*/
        ctx2[7])) {
          attr(footer, "class", footer_class_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(form);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_3(ctx) {
    let footer;
    let button0;
    let t0;
    let button0_class_value;
    let t1;
    let button1;
    let t2;
    let button1_class_value;
    let footer_class_value;
    let mounted;
    let dispose;
    return {
      c() {
        footer = element("footer");
        button0 = element("button");
        t0 = text(
          /*buttonTextCancel*/
          ctx[0]
        );
        t1 = space();
        button1 = element("button");
        t2 = text(
          /*buttonTextConfirm*/
          ctx[1]
        );
        attr(button0, "type", "button");
        attr(button0, "class", button0_class_value = "btn " + /*buttonNeutral*/
        ctx[3]);
        attr(button1, "type", "button");
        attr(button1, "class", button1_class_value = "btn " + /*buttonPositive*/
        ctx[4]);
        attr(footer, "class", footer_class_value = "modal-footer " + /*regionFooter*/
        ctx[7]);
      },
      m(target, anchor) {
        insert(target, footer, anchor);
        append(footer, button0);
        append(button0, t0);
        append(footer, t1);
        append(footer, button1);
        append(button1, t2);
        if (!mounted) {
          dispose = [
            listen(
              button0,
              "click",
              /*onClose*/
              ctx[26]
            ),
            listen(
              button1,
              "click",
              /*onConfirm*/
              ctx[27]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*buttonTextCancel*/
        1) set_data(
          t0,
          /*buttonTextCancel*/
          ctx2[0]
        );
        if (dirty[0] & /*buttonNeutral*/
        8 && button0_class_value !== (button0_class_value = "btn " + /*buttonNeutral*/
        ctx2[3])) {
          attr(button0, "class", button0_class_value);
        }
        if (dirty[0] & /*buttonTextConfirm*/
        2) set_data(
          t2,
          /*buttonTextConfirm*/
          ctx2[1]
        );
        if (dirty[0] & /*buttonPositive*/
        16 && button1_class_value !== (button1_class_value = "btn " + /*buttonPositive*/
        ctx2[4])) {
          attr(button1, "class", button1_class_value);
        }
        if (dirty[0] & /*regionFooter*/
        128 && footer_class_value !== (footer_class_value = "modal-footer " + /*regionFooter*/
        ctx2[7])) {
          attr(footer, "class", footer_class_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(footer);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_2(ctx) {
    let footer;
    let button;
    let t2;
    let button_class_value;
    let footer_class_value;
    let mounted;
    let dispose;
    return {
      c() {
        footer = element("footer");
        button = element("button");
        t2 = text(
          /*buttonTextCancel*/
          ctx[0]
        );
        attr(button, "type", "button");
        attr(button, "class", button_class_value = "btn " + /*buttonNeutral*/
        ctx[3]);
        attr(footer, "class", footer_class_value = "modal-footer " + /*regionFooter*/
        ctx[7]);
      },
      m(target, anchor) {
        insert(target, footer, anchor);
        append(footer, button);
        append(button, t2);
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*onClose*/
            ctx[26]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*buttonTextCancel*/
        1) set_data(
          t2,
          /*buttonTextCancel*/
          ctx2[0]
        );
        if (dirty[0] & /*buttonNeutral*/
        8 && button_class_value !== (button_class_value = "btn " + /*buttonNeutral*/
        ctx2[3])) {
          attr(button, "class", button_class_value);
        }
        if (dirty[0] & /*regionFooter*/
        128 && footer_class_value !== (footer_class_value = "modal-footer " + /*regionFooter*/
        ctx2[7])) {
          attr(footer, "class", footer_class_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(footer);
        }
        mounted = false;
        dispose();
      }
    };
  }
  function create_key_block(ctx) {
    let div1;
    let div0;
    let current_block_type_index;
    let if_block;
    let div0_class_value;
    let div0_intro;
    let div0_outro;
    let div1_class_value;
    let div1_transition;
    let current;
    let mounted;
    let dispose;
    const if_block_creators = [create_if_block_1$1, create_else_block$2];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (
        /*$modalStore*/
        ctx2[14][0].type !== "component"
      ) return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        if_block.c();
        attr(div0, "class", div0_class_value = "modal-transition " + /*classesTransitionLayer*/
        ctx[21]);
        attr(div1, "class", div1_class_value = "modal-backdrop " + /*classesBackdrop*/
        ctx[22] + " " + /*backdropOverflow*/
        ctx[18]);
        attr(div1, "data-testid", "modal-backdrop");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        if_blocks[current_block_type_index].m(div0, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              div1,
              "mousedown",
              /*onBackdropInteractionBegin*/
              ctx[24]
            ),
            listen(
              div1,
              "mouseup",
              /*onBackdropInteractionEnd*/
              ctx[25]
            ),
            listen(
              div1,
              "touchstart",
              /*touchstart_handler*/
              ctx[42],
              { passive: true }
            ),
            listen(
              div1,
              "touchend",
              /*touchend_handler*/
              ctx[43],
              { passive: true }
            ),
            action_destroyer(focusTrap.call(null, div1, true))
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
            if_block.c();
          } else {
            if_block.p(ctx, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(div0, null);
        }
        if (!current || dirty[0] & /*classesTransitionLayer*/
        2097152 && div0_class_value !== (div0_class_value = "modal-transition " + /*classesTransitionLayer*/
        ctx[21])) {
          attr(div0, "class", div0_class_value);
        }
        if (!current || dirty[0] & /*classesBackdrop, backdropOverflow*/
        4456448 && div1_class_value !== (div1_class_value = "modal-backdrop " + /*classesBackdrop*/
        ctx[22] + " " + /*backdropOverflow*/
        ctx[18])) {
          attr(div1, "class", div1_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block);
        add_render_callback(() => {
          if (!current) return;
          if (div0_outro) div0_outro.end(1);
          div0_intro = create_in_transition(div0, dynamicTransition, {
            transition: (
              /*transitionIn*/
              ctx[9]
            ),
            params: (
              /*transitionInParams*/
              ctx[10]
            ),
            enabled: (
              /*transitions*/
              ctx[8]
            )
          });
          div0_intro.start();
        });
        add_render_callback(() => {
          if (!current) return;
          if (!div1_transition) div1_transition = create_bidirectional_transition(
            div1,
            dynamicTransition,
            {
              transition: fade,
              params: { duration: 150 },
              enabled: (
                /*transitions*/
                ctx[8]
              )
            },
            true
          );
          div1_transition.run(1);
        });
        current = true;
      },
      o(local) {
        transition_out(if_block);
        if (div0_intro) div0_intro.invalidate();
        div0_outro = create_out_transition(div0, dynamicTransition, {
          transition: (
            /*transitionOut*/
            ctx[11]
          ),
          params: (
            /*transitionOutParams*/
            ctx[12]
          ),
          enabled: (
            /*transitions*/
            ctx[8]
          )
        });
        if (!div1_transition) div1_transition = create_bidirectional_transition(
          div1,
          dynamicTransition,
          {
            transition: fade,
            params: { duration: 150 },
            enabled: (
              /*transitions*/
              ctx[8]
            )
          },
          false
        );
        div1_transition.run(0);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        if_blocks[current_block_type_index].d();
        if (detaching && div0_outro) div0_outro.end();
        if (detaching && div1_transition) div1_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_fragment$a(ctx) {
    let if_block_anchor;
    let current;
    let mounted;
    let dispose;
    add_render_callback(
      /*onwindowresize*/
      ctx[44]
    );
    let if_block = (
      /*$modalStore*/
      ctx[14].length > 0 && create_if_block$6(ctx)
    );
    return {
      c() {
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              window,
              "keydown",
              /*onKeyDown*/
              ctx[29]
            ),
            listen(
              window,
              "resize",
              /*onwindowresize*/
              ctx[44]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (
          /*$modalStore*/
          ctx2[14].length > 0
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty[0] & /*$modalStore*/
            16384) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$6(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(if_block_anchor);
        }
        if (if_block) if_block.d(detaching);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  const cBackdrop = "fixed top-0 left-0 right-0 bottom-0 bg-surface-backdrop-token p-4";
  const cTransitionLayer = "w-full h-fit min-h-full overflow-y-auto flex justify-center";
  const cModal = "block overflow-y-auto";
  const cModalImage = "w-full h-auto";
  function instance$a($$self, $$props, $$invalidate) {
    let cPosition;
    let classesBackdrop;
    let classesTransitionLayer;
    let classesModal;
    let parent;
    let $modalStore;
    let $prefersReducedMotionStore;
    component_subscribe($$self, prefersReducedMotionStore, ($$value) => $$invalidate(49, $prefersReducedMotionStore = $$value));
    const dispatch2 = createEventDispatcher();
    let { components = {} } = $$props;
    let { position = "items-center" } = $$props;
    let { background = "bg-surface-100-800-token" } = $$props;
    let { width = "w-modal" } = $$props;
    let { height = "h-auto" } = $$props;
    let { padding = "p-4" } = $$props;
    let { spacing = "space-y-4" } = $$props;
    let { rounded = "rounded-container-token" } = $$props;
    let { shadow = "shadow-xl" } = $$props;
    let { zIndex = "z-[999]" } = $$props;
    let { buttonNeutral = "variant-ghost-surface" } = $$props;
    let { buttonPositive = "variant-filled" } = $$props;
    let { buttonTextCancel = "Cancel" } = $$props;
    let { buttonTextConfirm = "Confirm" } = $$props;
    let { buttonTextSubmit = "Submit" } = $$props;
    let { regionBackdrop = "" } = $$props;
    let { regionHeader = "text-2xl font-bold" } = $$props;
    let { regionBody = "max-h-[200px] overflow-hidden" } = $$props;
    let { regionFooter = "flex justify-end space-x-2" } = $$props;
    let { transitions = !$prefersReducedMotionStore } = $$props;
    let { transitionIn = fly } = $$props;
    let { transitionInParams = { duration: 150, opacity: 0, x: 0, y: 100 } } = $$props;
    let { transitionOut = fly } = $$props;
    let { transitionOutParams = { duration: 150, opacity: 0, x: 0, y: 100 } } = $$props;
    let promptValue;
    const buttonTextDefaults = {
      buttonTextCancel,
      buttonTextConfirm,
      buttonTextSubmit
    };
    let currentComponent;
    let registeredInteractionWithBackdrop = false;
    let modalElement;
    let windowHeight;
    let backdropOverflow = "overflow-y-hidden";
    const modalStore = getModalStore();
    component_subscribe($$self, modalStore, (value) => $$invalidate(14, $modalStore = value));
    function handleModals(modals) {
      if (modals[0].type === "prompt") $$invalidate(15, promptValue = modals[0].value);
      $$invalidate(0, buttonTextCancel = modals[0].buttonTextCancel || buttonTextDefaults.buttonTextCancel);
      $$invalidate(1, buttonTextConfirm = modals[0].buttonTextConfirm || buttonTextDefaults.buttonTextConfirm);
      $$invalidate(2, buttonTextSubmit = modals[0].buttonTextSubmit || buttonTextDefaults.buttonTextSubmit);
      $$invalidate(16, currentComponent = typeof modals[0].component === "string" ? components[modals[0].component] : modals[0].component);
    }
    function onModalHeightChange(modal) {
      var _a;
      let modalHeight = modal == null ? void 0 : modal.clientHeight;
      if (!modalHeight) modalHeight = (_a = modal == null ? void 0 : modal.firstChild) == null ? void 0 : _a.clientHeight;
      if (!modalHeight) return;
      if (modalHeight > windowHeight) {
        $$invalidate(18, backdropOverflow = "overflow-y-auto");
      } else {
        $$invalidate(18, backdropOverflow = "overflow-y-hidden");
      }
    }
    function onBackdropInteractionBegin(event) {
      if (!(event.target instanceof Element)) return;
      const classList = event.target.classList;
      if (classList.contains("modal-backdrop") || classList.contains("modal-transition")) {
        registeredInteractionWithBackdrop = true;
      }
    }
    function onBackdropInteractionEnd(event) {
      if (!(event.target instanceof Element)) return;
      const classList = event.target.classList;
      if ((classList.contains("modal-backdrop") || classList.contains("modal-transition")) && registeredInteractionWithBackdrop) {
        if ($modalStore[0].response) $modalStore[0].response(void 0);
        modalStore.close();
        dispatch2("backdrop", event);
      }
      registeredInteractionWithBackdrop = false;
    }
    function onClose() {
      if ($modalStore[0].response) $modalStore[0].response(false);
      modalStore.close();
    }
    function onConfirm() {
      if ($modalStore[0].response) $modalStore[0].response(true);
      modalStore.close();
    }
    function onPromptSubmit(event) {
      event.preventDefault();
      if ($modalStore[0].response) {
        if ($modalStore[0].valueAttr !== void 0 && "type" in $modalStore[0].valueAttr && $modalStore[0].valueAttr.type === "number") $modalStore[0].response(parseInt(promptValue));
        else $modalStore[0].response(promptValue);
      }
      modalStore.close();
    }
    function onKeyDown(event) {
      if (!$modalStore.length) return;
      if (event.code === "Escape") onClose();
    }
    function touchstart_handler(event) {
      bubble.call(this, $$self, event);
    }
    function touchend_handler(event) {
      bubble.call(this, $$self, event);
    }
    function onwindowresize() {
      $$invalidate(17, windowHeight = window.innerHeight);
    }
    function input_input_handler() {
      promptValue = this.value;
      $$invalidate(15, promptValue);
    }
    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        modalElement = $$value;
        $$invalidate(13, modalElement);
      });
    }
    function div_binding_1($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        modalElement = $$value;
        $$invalidate(13, modalElement);
      });
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(54, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("components" in $$new_props) $$invalidate(30, components = $$new_props.components);
      if ("position" in $$new_props) $$invalidate(31, position = $$new_props.position);
      if ("background" in $$new_props) $$invalidate(32, background = $$new_props.background);
      if ("width" in $$new_props) $$invalidate(33, width = $$new_props.width);
      if ("height" in $$new_props) $$invalidate(34, height = $$new_props.height);
      if ("padding" in $$new_props) $$invalidate(35, padding = $$new_props.padding);
      if ("spacing" in $$new_props) $$invalidate(36, spacing = $$new_props.spacing);
      if ("rounded" in $$new_props) $$invalidate(37, rounded = $$new_props.rounded);
      if ("shadow" in $$new_props) $$invalidate(38, shadow = $$new_props.shadow);
      if ("zIndex" in $$new_props) $$invalidate(39, zIndex = $$new_props.zIndex);
      if ("buttonNeutral" in $$new_props) $$invalidate(3, buttonNeutral = $$new_props.buttonNeutral);
      if ("buttonPositive" in $$new_props) $$invalidate(4, buttonPositive = $$new_props.buttonPositive);
      if ("buttonTextCancel" in $$new_props) $$invalidate(0, buttonTextCancel = $$new_props.buttonTextCancel);
      if ("buttonTextConfirm" in $$new_props) $$invalidate(1, buttonTextConfirm = $$new_props.buttonTextConfirm);
      if ("buttonTextSubmit" in $$new_props) $$invalidate(2, buttonTextSubmit = $$new_props.buttonTextSubmit);
      if ("regionBackdrop" in $$new_props) $$invalidate(40, regionBackdrop = $$new_props.regionBackdrop);
      if ("regionHeader" in $$new_props) $$invalidate(5, regionHeader = $$new_props.regionHeader);
      if ("regionBody" in $$new_props) $$invalidate(6, regionBody = $$new_props.regionBody);
      if ("regionFooter" in $$new_props) $$invalidate(7, regionFooter = $$new_props.regionFooter);
      if ("transitions" in $$new_props) $$invalidate(8, transitions = $$new_props.transitions);
      if ("transitionIn" in $$new_props) $$invalidate(9, transitionIn = $$new_props.transitionIn);
      if ("transitionInParams" in $$new_props) $$invalidate(10, transitionInParams = $$new_props.transitionInParams);
      if ("transitionOut" in $$new_props) $$invalidate(11, transitionOut = $$new_props.transitionOut);
      if ("transitionOutParams" in $$new_props) $$invalidate(12, transitionOutParams = $$new_props.transitionOutParams);
    };
    $$self.$$.update = () => {
      var _a, _b, _c;
      if ($$self.$$.dirty[0] & /*$modalStore*/
      16384) {
        if ($modalStore.length) handleModals($modalStore);
      }
      if ($$self.$$.dirty[0] & /*modalElement*/
      8192) {
        onModalHeightChange(modalElement);
      }
      if ($$self.$$.dirty[0] & /*$modalStore*/
      16384 | $$self.$$.dirty[1] & /*position*/
      1) {
        $$invalidate(41, cPosition = ((_a = $modalStore[0]) == null ? void 0 : _a.position) ?? position);
      }
      $$invalidate(22, classesBackdrop = `${cBackdrop} ${regionBackdrop} ${zIndex} ${$$props.class ?? ""} ${((_b = $modalStore[0]) == null ? void 0 : _b.backdropClasses) ?? ""}`);
      if ($$self.$$.dirty[1] & /*cPosition*/
      1024) {
        $$invalidate(21, classesTransitionLayer = `${cTransitionLayer} ${cPosition ?? ""}`);
      }
      if ($$self.$$.dirty[0] & /*$modalStore*/
      16384 | $$self.$$.dirty[1] & /*background, width, height, padding, spacing, rounded, shadow*/
      254) {
        $$invalidate(20, classesModal = `${cModal} ${background} ${width} ${height} ${padding} ${spacing} ${rounded} ${shadow} ${((_c = $modalStore[0]) == null ? void 0 : _c.modalClasses) ?? ""}`);
      }
      if ($$self.$$.dirty[0] & /*buttonNeutral, buttonPositive, buttonTextCancel, buttonTextConfirm, buttonTextSubmit, regionHeader, regionBody, regionFooter*/
      255 | $$self.$$.dirty[1] & /*position, background, width, height, padding, spacing, rounded, shadow, regionBackdrop*/
      767) {
        $$invalidate(19, parent = {
          position,
          // ---
          background,
          width,
          height,
          padding,
          spacing,
          rounded,
          shadow,
          // ---
          buttonNeutral,
          buttonPositive,
          buttonTextCancel,
          buttonTextConfirm,
          buttonTextSubmit,
          // ---
          regionBackdrop,
          regionHeader,
          regionBody,
          regionFooter,
          // ---
          onClose
        });
      }
    };
    $$props = exclude_internal_props($$props);
    return [
      buttonTextCancel,
      buttonTextConfirm,
      buttonTextSubmit,
      buttonNeutral,
      buttonPositive,
      regionHeader,
      regionBody,
      regionFooter,
      transitions,
      transitionIn,
      transitionInParams,
      transitionOut,
      transitionOutParams,
      modalElement,
      $modalStore,
      promptValue,
      currentComponent,
      windowHeight,
      backdropOverflow,
      parent,
      classesModal,
      classesTransitionLayer,
      classesBackdrop,
      modalStore,
      onBackdropInteractionBegin,
      onBackdropInteractionEnd,
      onClose,
      onConfirm,
      onPromptSubmit,
      onKeyDown,
      components,
      position,
      background,
      width,
      height,
      padding,
      spacing,
      rounded,
      shadow,
      zIndex,
      regionBackdrop,
      cPosition,
      touchstart_handler,
      touchend_handler,
      onwindowresize,
      input_input_handler,
      div_binding,
      div_binding_1
    ];
  }
  class Modal extends SvelteComponent {
    constructor(options) {
      super();
      init(
        this,
        options,
        instance$a,
        create_fragment$a,
        safe_not_equal,
        {
          components: 30,
          position: 31,
          background: 32,
          width: 33,
          height: 34,
          padding: 35,
          spacing: 36,
          rounded: 37,
          shadow: 38,
          zIndex: 39,
          buttonNeutral: 3,
          buttonPositive: 4,
          buttonTextCancel: 0,
          buttonTextConfirm: 1,
          buttonTextSubmit: 2,
          regionBackdrop: 40,
          regionHeader: 5,
          regionBody: 6,
          regionFooter: 7,
          transitions: 8,
          transitionIn: 9,
          transitionInParams: 10,
          transitionOut: 11,
          transitionOutParams: 12
        },
        null,
        [-1, -1]
      );
    }
  }
  const creditCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAADzWSURBVHhe7Z0HnBRF9sdrMyxZoiCegKCCOZ3xzKcCgp56CoqKohj+6pmznBGMGM+cQDALBgwneuZ4nieGU5KKIoqAIrCEDf1/3zddQ29vd09P2oD++BQzW93TXV316uWqLvhZUCowv8P8+OOP5uOPPzY9evQwvXr1MoWFhe6RYDiOY2bPnm2+/vprs+WWW5p27dq5R37bWCEwNTU1K6WDfvNYvny5M2LECKd58+bOjjvu6Hz77bfukXB88803zuabb+60aNHCueqqq5xVq1a5R+JB+t79tmZBnms5U7IqQWdrHhYvXmymTZvm/hWNlStXmpkzZxohMOVCcK9UKCkpMT/88INZtmyZqa6uNgUFBe6RaHzxxRdm6dKl7l9rJKqieX0Txi+//GKGDh1qhKOYs846y1RVRc+fsrIy0759eyWOyspK2Ll7JBxrr722ef31182ECRPMyJEjTXFxsXskHOeee67p27ev+b//+79Y92iqWGMJCy4yb9481YNeeOGFlBwINbNbt26qV8G94g567969lYDXWmsttyYatIM2iWqLGuLWrnlYYwmrdevWyoHATz/9ZL777jv9HgYIqmPHjqaoqEg5FmIUAsg1xo4dax588EFz/fXXm/Lycrd2zUOTIiy4CDqNKMluTThatmxpNt54YxVPiMXvv/8+JaF07dpVCYvrw1nywVHatm1rDjvsMLU64+hk6G60Jc4zNyY0GcJCPI0ePdoMGjTIiAWmXCUKDNr+++9vNthgA7PeeuupmEs1kB06dFDCgqDgcg0tqrj/zTffbAYPHmzGjRuXUk9sVJDGL5OZ3OghHMfZZpttYDmO6DXOl19+6R4JhwyEI7PdmTNnjn5PhX/9619Oq1at9B4nn3yyuiDiQvrR/ZY7VFRUOMJFtT177723s2TJEvdI44b0xZImw7FQjvv166cc5auvvjJTp05VMREFzu3UqZPp3r27fk8FxJQ9LxXH4t633Xab2XrrrVVfSsVBM0GzZs3MlVdeaf70pz+Z4cOHm+bNm7tHmgCaCscC77//vtOmTRudwZtuuqkjg+8eiQYz/7PPPnNk8N2aYMyePdvp3LmzXn+PPfZwfv31V/dIXcyfP9/Zbrvt9Ny+ffsqV4xC3DYEAU4lhOz+1fjRpDiWtNdstdVWZt9999W/P/30UzNlyhT9ngrXXHON2XHHHdWHFAUh2mRYZtGiRZEcCwcnliOAy6XyYV133XXahlGjRrk18dGiRYuU4aVGh8bAscTaiz0jZ8yYoSEUabrqWmLxuUfCIaJEzxcCcObNm+fW1gXtsHrcH/7wh0iO+MUXXzg9evTQc//4xz86QojukbrgulZXEmPCrQ0HoaFrr73WkYngiBUcW3+jD9PRC/OFRsGx3nvvPXPUUUeZ++67L5aesv7665tjjjlGvwuRmXvuuUe/R0EGXj/Ri15++WX9HgS87zvttJN+h3NFcSFcHzhhgYjPSP1HjAJ1kwARsfoZhaefflq565gxY8xTTz0Vyy1BKOqGG25QVwb6Z4OjoTnWgQce6EjHafD3zTffdGuj8c477ziiaMfiFkBEpiNEo+eLEhzKHeEMIt6cCy+8UC3EKC767rvvOq1bt9ZrCqG7tcE47rjj9DzKs88+69YGg/tvttlmei5t5j5xMHPmTGejjTbSvtxnn30y0uVyhUbBsbB40FGYccOGDdMwTCrgm8IaYyb/73//M//+97/dI8HgfOl09XSjR4VxAOrx2F922WVm1113jeQUePJFIdfv1sMfBvxjOGy32GILs+2227q1wXj44YfNl19+qd+HDBlixEjR76lAG0jd6dmzp+qhcazgvKKhORbWkrDv5Iw++OCDI60xi0cffVR1LazEl156ya0NBj6s//znP8ot0tFZoiDErHqTEIxytygsXLjQefHFF9UqTKVL3nXXXcq9hRidV155Ja22LliwQP176HQNCThWAYQlM7NBg1b//e9/zX777adcoFWrVkaIxuy99956LIxr4IV+5plnVNfBw17fPh70tY8++kitVThFrjgEz/PEE08ohxswYECsjInGBumTpQ3OsZiRzOKLLrrIKSkpUa5Fot3PP//snpFbYOkxo9PhBL8jPcCxGlzHgiPhozn99NONKPJah2ed2GBcEGT+8MMPk7E0eTb99IPcKeJuf//732OnxdQnPvnkkzUnAbChOZYX0qnO3/72N+eBBx5QX04criImv3PEEUeolYjfB+4X9jtSj+WRndLSUmfatGlubV288MILzvHHH+98+umnbk1dfPzxx3rOk08+6dZkDtorBoM+A5xbJpV7JByiPqi1+fLLL6fU2+obcKx6JSzcAjgWGRQGdvr06UlXgZ8Y+NtfFwQcntapKRaRI1aie6QurrvuOj2Pcs0117i1tcEg9evXT88R68qtrYujjz5az0HRZkJkA4wL3CZcb+DAgSmDzfRfly5d9Pw999yzjrGDGuHtZxR6FPv6Qr0RFlzl/vvvVw/4euutp51CWX/99bVu/Pjxah1mAjgbXE6UXC1XXHFF6KIGvPbWn7XTTju5tbUBMW+88cZ6Dt73MO7x8MMPKzFw7ziZE6mAxSgi2nn77bcjORA6IgQv6oOW8847L9lGnnvixIka5yQqYPuZCcfz3n333VlPgjioF8KCqE488UQ1yxmsoIKjcezYsaEEkQrMTBuchtuEKf4MWJ8+ffQ8wjuk4gRh11131XNoc1AICOLDAYkzkxAKf+cCccT/PffcoxOI9jEx4UwAg+Tss89OOm2DCu6ZSy+9NJaozQb1QljEvNBpmF277LKLM2HCBEcUbc1UuOOOO3TWYw3SWRCXv2MhTEQmeVVRIH/KdiDXCcMJJ5yQPI+2BAHvPMchrKBlYLkiJIAYw7cWR0/6/PPP1b9F2+C89957r3vEce68804VyxzDqkZPxdf2wQcf6HnUWW6NHpdPz3zeCeutt97SGSSWn3POOedoqokfyP4zzzxTCYuO8TobETFXX321cpn99tsvMjUFztKtWzftOJTgr7/+2j1SGyjbEDrnocwHEQmDwbH77rsvp0TkB4P717/+VScXYaooMLG22morbTflggsuSIpgOHb79u21HukQxGXh4qNGjdJnp6+feeYZ90jukXfC2n///fVhIYoovxQEs+WWW+q5WHh2MGHvgwYN0npEFwp31ExD3+BcyujRo93a2hCT3llnnXX0HJT+oDgj3AOdLxe6UxQgcjg5bbnkkkvc2mCghNv46IABA2q121q7iPCojAw44/bbb6/nDh48OG8iMa+EhQhBcYT9ouhaYqFDCFs8+OCDSUWSY6eddprOJBL46ACLJ554wmnXrp12BmIgKigL6+/YsaOeS/JdkBjj2tYC6969u5rtuQTPgni76aabnIsvvtj57rvv3CO1AQFsuOGG2g7SoVHao4D+dfvtt2vA25uWzb1IxaHvUC3sZCCdCIMJkYiVafsfAkb1IGAdxtWzhdwrf4SFlcMMo7z66qturePceuutTrNmzVTZJhZmgV4EEdLZX331lVubEBdXXnmlDgAF300YUKSJO8IFYPnoUH7dhQEaMmRIMqMCrmE7PR0Q+8O1EfRbYpLoZ3BZxGmQ/mSfl2fCH5Yqj8rex3+tuXPn6gTmfvjfLCAqng+F3VuP8k99r169Yq0byAQQVt487zbGJ/eBePU7YMMNmV0aE/RuoiEzzf1WG5x7xhlnmIMOOkhz0v/85z+7R+qCHHEbNxQCMo899phmTXjBsvjttttOc684hrc77N5heOihh7Q95JHZLFIvyEiQCaLrFMmqEEJ3jyRApECIT6ML9ANtpu1BIDfrueeeS7bRfy3bz/SxEJ1+B6xMsv3sXUyb7rNmDGlQxhwLvQmrLQhE9FG6mbU4Jr26EfqC15GJrB82bJhyGnSAIH2MGY0Ca2duGGjPzjvvrJyA602ePNk9shrc34pXIdRY2RReYFDAdfEVhek0tCNsYxE4NeKP+2OtBel5cNbLL79cuRoqQFiuGn2HaIcD+732WJFED+gzCmOAcs+YbLHFFrVUDgvOoz+ycajKNTIXhVgiuA8OPfTQ0Ie2IgxHY5QO8c9//jO5iIFdW3i4bADRwu65HjqbX8xgFDCgHIfArC8oLvBfCTdUq9fqNOlg6NChem+K12XgBVaiTWfu1KlTpG6JbsV5iET6Mgy011rOGDpBbcdyx92CQzVu4qUfWREWpisNhCvgUkCx9DeUAcSJx3kQznvvveceWQ3ypNZdd12dcXRgutwjDFhO3Jfr4o32gyxRe/y2225za+MD4s9kAjAhbRYHHC/MMkNXpG2c95e//CVSB+Ma1qpGd33ttdfcI6vB5EHJ55pw2zDnMD5G67o49dRT3dr0kBVhwWZRtLFGaASNxfloRZztdIKkmPc8EIo8pjFugzFjxqgSDavnGGIzlWWUDlCurbd/9913rxN/gwMgEuzABSGKG2XCqRBvpGJzT4jr8ccfd4/UhSUULNco6832M8+DQk5fMtFF/1PuT0HNKC8v1+sxib3KvB+I9iOPPFJVklS+tTBkRVhg1qxZGiuzDkcKK2fGjRuXtF6Q6zg9Ca7C3ex53oJPhZkSZD1lAjobcxuuRUfjR/MTFoNswzvMUL+uRGQAfQQrystVaCOW3imnnJK2CBVFPKlbsbI5ijvDdYh7wtHjgHZBCGJUJCe7vxBj5JxU/YwbKM7qpzBkRVgMHgUWjb6BGLMPwEJOq4Db8xhYTHs8zdtuu62zww476KyaNGmSPgjn5Ar2WiwwIPCK+yLo+taxSPHOYgiJFGk4GlyZkJIFDlbEOoOHcg2BesHAMeH89+OaPDuEznW9ky8I/N5/7ShwPoW+xKuONGAc6OfDDz9cU7m9/qx8Qu6RHcfygswBvOTIcYKhYbpDYwLOQ8tF4by20xkAVrpQj0IM97J46qmnkusa0UHQIy2YONQj+ukPLyBIxBDHcd6y6npNBYSVMz8W6/3YEQWfCxmaIh61njVud955p5HB0r8bAiKOjYgUXYfoxSabbKJ7OwAhnqRPCh8XPighOv2tTBKtB8uWLUtmqLL6hnOA6Fzm1ltv1e8iVutkggrRJffoEp3OiKWs3+sTCxcuNP/4xz/Uh5Z35Ipj2dnuBWwZ5RPFHo97QwGzGW6BCEM8WmAZ2cAuFhoGCeBZTj/9dBV3KL1wKft8N998sz4Pv7nhhhuSSjz6ls08QPx4fXH49KzrAA7pbUN9ggwI2o5Rw8a8+UJOOZboDu631aBOxIYWy8HSBVxERJaZOHFich1fupBO1PWKcBUv58Tzzzo82sl36XSt52/pfOVG1Nl6AAezx+E6lmNNmzZNPd88p+hSetxCLDYjirpywvPOO083XWsIcH/WVvKsoue5tflB3pd/CRfQDTZYrAmBEUZ59dVXVQSxbIpBigJiVPQfHdzJkyfrAtd0wY54hEZE/9Ml9JYYAEvPWGQh5nWtZVxz5swxzz//vIpElqLRdgCBIu7FpDeih2nIBPCMr7zyihIQCza8i1h5ZlQCjrGki9BUQ4BJxZI1Fu1uttlmbm3uIUwr3vKvVOZpOsCRinkv+k2sICieZEx0RBnOxUwR5ndCxIUdoz7o2cPqo67FsVz2Y0PBa6yEQZ41tShkI1Z2BmbZuVeJzRTsBcoMRrn1K7hB2GuvvXRp10svvaTB3UwRxvrhmGHHqPdyN4uw+qhrcSzoN00BGCMywZVzY6RhAAj9uEdDkIpj4c+R0yI3ImM2xgWBz4ceekgDsXGoPwjc77dUGhKkPBET9ubS9+/fP9LHJm1O7cciRIMjU/SNJJvHYUhiHp7hTKLgiIRMO4zf8fvfUmlIEKYTTpskKpyuXr9eECCsSOVdzqmjXFN34oknmrvuukutIPKNjjjiCM0pItcKq8j/m7hAuUXZR/ENe0kS96f8lhAmQul/Xs8iUkDfduE1GDIBfi728kL1wcfHfTFszj//fLUoMaLYyYY8ryjI+GS2dwMhHGKCXMMWUmPI7iQ9OFOwrg6Wy7VZphQketc0jhXnecLAWgF8ZkQCiAJwrTgIO48FL/ju8O15Y4Xki5EqBOLcQ87JzI8Fd3rzzTd11znMboCviN312LFu7ty5WpcuRNQq18JDfvnll5vDDz9clf01DdL37rfa39MFv8WFQDQgHcMKicJvRcetdf+uXbvqGODn8nJJ/rbjHFsaCXVl7HmHeslKIDYIl8FLjXfbG7TFAw21x6F0YnRwPa+iiEwn9cbmI3GdoFm9JpcwcIwsCBZuBGWDekG/UcjiQCE/5JBDNCrCekw7Nnzi3onzSr0oyHVyG4QmDZjovm0oYQNyobAsUy04tWDZFYl5drtECnlchE+4LsXf8WtyCfOLxYEdB0BYiUxTxsOuGqeQiMl9cgm5b+4Iyw66Fyz7ovFYFXGT+LgGnQmns2sKKaxRpJ7j/s7PZeEeQfUNUWhLNoQFcOmMGzdOtx4gXVtEmfYnn7vttlvGyXxRkDHK745+ONZ4Lx8ymh2ACWWgCxBWwAIhrIBcD7N6iBPy9gfOP+WUU3SfdGl3VnpJKnDt2HpEPYD20D/ptgldVcSkZlywU7QQqF6DscDJecIJJ2hMk9hhriFtzv+OfswYrzONhDoi/cweXnvLnlbkKsGJwkAWqkW6HCtzDiS/q1klpTLgWP2WqL4Jw4033phMzabwna2Xpk6dqmIxn5D21rUKpdLMnz/f/St74P9gLZ8Ff2PJENYhAMwbGwjbXHLJJWrdAGmbflqk8ptEISvuY4elnuB/7mxAaAkuxSf7u+KPuuWWW4zoWLFf2ulHUPuQPGR81IEQUpJjsfSH/HCsO5TnkSNHqnwmryqXIJzDEiiyM2Xg7fApJwtaB+hFuhwru8K96u9+Ydw1DFjK+JuCOBpGEH3JHveZ7j0WBO7JIhCW+rM2EQuexReso7SAY9UiLHLD7W52tuAwI7aXa9BAQgM4Re0eBhQWMEShfgmrcRQ/ICYWZrCmkxhuPhRwwBiRwOhVRQjtwXi8NMKCWetABXUIi4dgcQPuAbuAlJJqH/VsgP6FW+L888/XZUreFdJwNlH+nTfeeMOt+Z2wRKSpNUcqEdY240O2az7A/hIiNtUjb4HfUsSr3pdjLGfzv8WjDmF5gVh87rnnMl4NmwvYvUVpvMVvnbDsNpYU0VdVZWGFcz7AUjLuwzI5LyAumE2YbxLCKho1atQFoues1q5dkDFJMHLdddd1a+ofdvHBWWedpQHu+gDKfqYlX/BeG2WcV+rheqFfLr74Yg1A5+P+bCxCYJut0vlusfbaa2tKt82qDcCqenszxbfffmtEXus7cPClACFu/QzrFHxeIir1Aayvi9/Y32UK+2vvXblmJv4iP6Q/3W+5g9fPhwVG/JQ+pF/CEgu94NlEnVCfIT6suOB33A+rPp1+kd8trRfCEr1JXQoEp8l1J/cc5xyvhyOXPc1Ga4kDrht0rpiiUmTAalYf41wyVVmmhSPXO2Ac81/L2w7Meghq+PDhOptzTVxewvKC+8fpO17/izuHxR/k66dDXJlA2rU0uMU5Bg9vBwofGbPniiuu0L2pbMcsWLDAvP322xlnRgTBSwheFDAgvmO0A9FL+8hx+uyzz8z06dM1a4M2UViUAbfgO2/P4DhiyZ5HpCGX8BJvEGzf0Sbe++hdgeSFPY9P+z3fqBeOxQxGDLIRGoslCdEgEh9//HGzzjrraIeMGDHCvPjii7qChNxqVuPwySoZL1J1dqagwy2h3HTTTZpSUlpSagqLCk1hgZRCGRQpYjvo89AGUaz1O8mNJD+i93Tr1i1nHMs+pxXR/G0Jg1VB9BeFkA0hHPqQCetdrgZ4lhdeeEH7mpVIYRwwV5B21o8o9IJOZ3azitgunWLGsWTK/95BiIz3+9FhiE5A59oOzyUYMJZ2jRs3TnfsIwpguaxTzf3kvgWO1BXrM9iBBhDWcccdZ0aOHKmRhVwRloWXEPCe83Ywoha//PKLW5vALrvsom9Es/3aUICw6kUUekEnYeF5Hx69i2X5EBAWjg0BEYRmdQ5rAusDtA2FGEsIwiGURCkpKzGlzcrke4mGQyAerXfbybNQ5yW2fIFkStZlWqKiDeisRx99tK6kykdQORPUO8cKA7McKxCxyMphcq9ZAAo3YJb+0X2vcz45FiutH3roYfPIow+br0WHKi0tc48m2oeIsZmacDPqsFoRfyeddJI54IADIsWMbTf3Sgfea7IqnMxdOD5xP3LQt9lmGyWodA2hfAGOpYQlnKH8wgsvVKUUC4IFEoAAI0vH6RAsJWYlM4TBZmbzcPl8EKwt7m05A+BvO0C5BgM4ZcpzZuzY682cb78xRYWY2QlCIGi+1VZbqdKOmKTO1tNfo0aNUr0xCrbd6faZn1jRr0gVziY4nwq01bYTyYFhw8TjO/dFV7Ppyh988IG59NJL1beF5BFaSaTNkPpLiEAupPtJ4e0lIMrWPgQZOcb+6WzPw65xbMPDjm9kevo9w4AwDd5gPPd4aYVg1WOeCnHPsR7pXBeuzersQYMGO336bKDP2r37OhrL5JlZvY2neyP5m33S+/btp3t6EoTlGUHQdbMpjEOcfkkF0pdYqkcCZdj1OM7e9GzvJJxZ60hAYMdDxp4QDuk3ZKCSDm1jiKSmC7E5a6+9ti6mkesnQjqswmBzLgKadscVHoj9x4XlM80CC7sTB2U+EOPjJrYRNIo1iF6Qo024iMal03GcGzQAuShcm8Ar+6uutVZ7JZ6BA/dTwiI9muwLCIy3aXXp3MVp224tp43UswEbgeGga+aiZAN2BCT2y9oB0cU0yYB9vILAjkAiHXQLBLs9JWEb/vaPPVt9WsIiCG430oOWIKxIHQufDoozPh18NBSheGX/cj3N6kTh9rNqdobBWYj+YYHoxA/Ep9xT91qHhY4ePVp1BsC1zznnHDX7cTNgFaIsH3roocp6Afel5AOwfgrPjIXYv/8AEcPF5pJLLhXrdBszc+YsscgeN7379DEbbriBaVHeQp2OGB/sP+91qoaBtlsRExfe/sVtgO6J8o5IZIwIt+Bm6N69u3vWatAuDCAvcOWQXeoHm6CQWUoYD1eQ3TsMp/H999+fHA+2OmCPLxtB8UOeMX4GKRyMvB5YKWyfV3kwwyl+2MR99ulk91/y1WGvdvbxG1ItpMOU8i14vQnt8hdmnAW/9c/oXBauz7ORUcGMRKwjIsjLYoXLpElP6r5anEtfIO6pz2e7vPCnNdkiBo57Rm3Qv0Igym0JYLM6x/umEC+4F/vCs0rHP66IRmjAC/85FlKfu8UUftAI5DoJYIhLf6NYbEmaLMdsA8moYBWJcLVanebdtI1z/R2f68I9yBVj52UL2g/BkdYDwTHJSKJjEzXOz2e7vDj22GNr9Q3qBmLIvzWlBWPAtpSoHkwExsO2N1+Qa+d3MUVcSFuS4kE6Utk7bgdEJ+IFJ6m1gDiXkm8gfnDYYgnh6uCeDzwwzgwdOkSPsfWkjfJ7258PeEUhHnYWC+M769Kli4on1IZ07p/v9sr169/zni3oFEoYctlpDCjuBfZGwJWAzgjBE/bBKUm2QD4HyMJLWE0BayRh5RLch0HFyBArSTmY6Clmzz33VG5VX+34nbBiQHQVLcx+0VWSn3i0bYHd45wV/UstUbZXJNQD6pOwLMfCInrkkUe0TbRj6NCh5sADD8x4tUu68BIWFiEE3rlzZxWHhJ9wVOJExvNundh84tSuD47qR84JC4Ih/QXPNCID/YTBgDggFnQmvmMm48H1EhMuDM6H0IjG84m+RcHdQGAY1Cdh4WYhc4ClU7SfZyNhEZcJbcLVEie3ifZmM8BewmKRL9EQdE8KBARBEQ0hrMMr9ajjk3DPmWeemdRP6XtcOUQQvBkQjBt9znPlghCThCXfy1NdMFXnQCxnn322+kzgNBAEv5HrJ9NL7Cf1lLi45pprtINAur/NBDznO++8o23Ff0a7AUSF4swxJsbAgQPNzjvvrMTFuUH9Y9uazYB5CYsdeCZMmOD+FQ2IDX2QFHPAPmZPPfWUxjUJ3QEmMz5H6zvEF0Z6DRyR52Iz4HQD2/LMCcKSL+XsEmw38YJImJ1QOE5Lsj+HDBlSi8r9INGMLYzgVn7QqcwuZg7FsmquR6P5zmwh9oiVA3u3qbcoydzfxgvzTVi0FQIitYedlO1sDwJcmb05xdxXCy1f7fISFuNBFqiVAvxtvzNu9L/l+JtvvrmKcUQm4HnQF8lzmzJlitaRgsNLPYPAfSFGlukzTkiWcePGaUYw3JoYKf2FtIF24JI4a6UuQViffPJJOWkX/IAf2xlqgUlNQzbccEO3pi4gyAsuuECzQvHYQiA8ELMAIkHeU4c+YIkKwuFvGkRhhkGA3o70I5+EZbkKxIKLgfYG3cuexycDChfbbbfd9Lks+J09L134fxvVHwBuafVWOBAF4iIqQL9aoJuRZLnrrrsmuRjjduqpp5qPP/44SZzQgAWrqImktGzZUrkfHBqvP4s4GG/G7I477lAOSJYH2RfC6RKed2J7BJrlOoGFhZE416Ig11HnGzEzmcn6nbibNFIdikKssZ1yUedxjGvlo3DtefPm6Tq5uPcBeLL5XdDxTIoQiRb7t0Xc/guDfSY/GCvGl4iKcDR9EwfbphPfxfFq7yuEp0vx8OITcbDXsjsBeoPQyrHkIcqR21A04oiCOQ17t7JWfp/xDEwXzD5mDso+XBRRg9wHtIOSD/B8KOtwUmKZce4DN0HJ5zeIAelP90jmsPe1/W05FvUo7l9++aXp16+fSgPUBrh8fQKOhQSiPbSRlJq7775b9TN0QOFi9e9uSAX0luuvv15zuWUGKatGzrOZLuBh4gx4phg/frym+CJG4tyHQaed6GSIz3xMPq8oRE/C68+EZ7IdfPDBmm/vFcMNDem3+k9NToVZs2bpBvVYXhgU6A1ePSFfgCCw9CBsBi0dwDHgriIa3Jr8gb6gTzAw6CN2NIZjeAGhc05Dot4IC2sFpTIVYO2kZcBW4QBXXXWVZidmg7gcDhYPkaRDyFwbyxGCRAzmg2N5wUZ0p512mvqiSG+BuyKWAAo71nufPn00BMUCj4cffjjQUs838ioK4QDobTgY+cRkJXUV/SAMDBQzEB0LPc8fYOV4XEJJB9yDJWoUcte99wi6n7dNDByWJA5JrN1cty/IKsTFgJqABU4fcQ7EjW7IXvkW9DmWGvlT9jo2Lw5LLx+Q58/Pjn7PPvus7p9ExiLWJlmJ3E8erNY7/jKBtDdpLeWycF32SSUtJl3wW3aBsa/sDbp+NiUuuDdWGTlXZLzS56J76V6wtl2kILEnP3u5X3LJJWoBC6dzr5C95QnkGrlPm2EpN1zJC2YKMwSF+MYbb1Sfj3fG+yFtc7/V5gyAY97juQJtnPTkk+app59WHw/3QCxyf45R+C69ZqTrTZVTY5xqKfwtBb2G/VZ5owN/5xLcG9Am2sD1bV0YSD1ipRN+Jl5/h3iHs7I+EwerF1izOLeJydpzgb2f/YwLOX9p6G4zFuledNKkSeqF5zc4VskEOOqoozSNmbRXYl12kMLAMQpeYgiRB0f3yivkfhXLl5v5IiYYDPQm66y17bFt5rOQIsdsQWzjPIyKTsSFv8+998UdIlxfnZhMAO4dBCYymRh4x23UgmfCIY3IpBB6A+iWOE4J96CmWFUFAwDXBvflemlgVSxRiJMTJ+B0z4sBwoCz7d5779WEfTJCyRDFQZoJeOsUjjc2ZbWQ9tYRFbkqlSKiEQs8byYlX23zYtttt9UFLjLQzuDBg9Wh6T8nCqghQlS6eyNikRU4pC4LMWjhhQQWvKZYJrTuBX/SSSfpixzijKX0Q+3UZDpGFG71wHr1IGS0zETVl0hzzTW4ryiUqqMwQBZ0XIcOHXQZmkW+Bs8W//X52xZvfapjuSxeDBw4UPUmSwiinCtxsHUkfWjbkw7EEHBIw2ZFjxd42e19KBD0+PHj3aMJiAFRZ6WW3L82YYkl5owYMUIVu0cffdStdXQzU3KrcdnbZUG5BB3CggmUfdY1WpDUzxIxOJ9FPgeRyRRU39DFC/Lu77vvPkdUjFqve2N8WOI1evTorF9ZYgE3ZEnXpptuqoyFezzyyCPuUUdz/uGgbKlO+M6iDmFhEYk+ow0dMmSI1jGQFRUVujUgaw75O9dgA1XW6nFf1jdGIZ+E1ViLH0wA4nZMeAZddKAkgYl+qGsfWSic7VjZsSf+i/WImPRakMSQuScLe2FKFvK72ltFEhbAmkBpJeJt37aO8oci7vcpZQIi6Dj5ePk2KTH4UlAMpT2qoLP9ITHK37Ea/j5HYWesyGY97LDDNGcMZRwl3Gbd4mAmxspYZgruy9hjkGBAYdVjAFiQ80/KNpYmhovn2OqtIhlYYNOEbQ5PrsHiR2J/WBy8b5pYFw/A/WV21mp4EDjPtvW3gjDLzwsIi9QX8qvI2uWllVtssUXWjCAMjAHXxoUBkXvHTY7VfxAaz/agQYN0ZrHiONVGGn40NsKyHZwO0v1NHMKygCkwQeEy3CPoPpm0OR3I9es/CE2yIHt9UtIlqsaKdAk900HFz4QD9thjj03uAuQH3IMwDsQYdR8kBqEz4ovptj8OckpYiNE4jUTM4lBcExDGFfIBUonI4iT3Ca7Pe4jQWdMF7RXLUrND2b4qL0AUCjFkDRyivDHhjDPOCLRkcgUsFWsteb83tKsgn/e3IJuTHXBk2LTgzyImi1M6XfTv31+vgaPVe49cQMYlu70bcGby4vF99tkn+bAUNpbIBOxNxbt0uGaYhzcXxNSYCDJO8YINSXBcQhC2v/E74nNKB7zejxeN3nPPPW6No+nVV111lboW6JdMkTVhsSEGr8OwD4iX/IQTTtCQQSYgbMB18M3gOwmClygaY8kHofpBfjoSgk3gbN/jU6Jv4oJz8Ul5f8M7ebgWu9KkWuMQBblm/LfYy/nut9XAB0V+PCBjgb2bSCumPgpcK+h6LEvCl8UqEpTQ3xEMEvv2339/8+ijj2pWAjor+2Clo+txLn3s/Q3LxQBrHGzgOlOkdDfIDNQ0WJyjQQSDQ5WEM6w9sgLiAKLCGmHPd3wuhxxySHITL/6mo8KuFUaUDQ3bJjtQfOaqnVHuBtwLJFTaTdKyBYtXWMZFFoQfrGEkAZPjUVkc8typE/2IgKMw8to3bzwoWxByIHJOO3jNbDqAfTe24hVdYfX+Y0El6LzGAFQTm7zJsrAoHUzanFoUwm6hYkxdZke2kPvqJ9yPBaGAUEE6gBs0tgJXsSWs3n8sqASdFwekFlaLupX4lH6m0gfq7HE+00lHhFPxShrys1B5kGRRSCkKyVVnn1A2wSAXPFXIJQy8fYIYFkRkCYpl2YQEWDyRLeQ5VCQgRjNtY2MGkQry6nnO/v37qxPUC1EQEp+Vy82qioVm1YpfTOWyn0xNNe9rdkxRSUtT2rKDKW3W1hRLKShupr8REtbfpQIOVfxn7FNKuAjdLgzCPOKFdHB8MlhxZ48XNAiud/PNN2vAkpUjOOVyqZzDBdlfgA1Zhw8froFZL3Ghz/GKEN6I4V/ahY6I0xGPNnqkBdz5/fffV+OELEwL6lnXhw7iXxTCwlUIgBid1RFpG/02Y8YM3eOA32QSGGZBMesHuRbxVl4e4MWqigXmp88nm4q575jlC6YbZ+UvcnN4E0LJ5V8Fxaa4RWdTttb6plXPvUz73nuZ4tL0FlTw/KnGDsKKZRVmSlSA1OKTTz5ZB4lBZDdiZl0csHSJVGcIOwoQ77XXXqs7AU+ePLmOyIZw2M8KTzOeaiuOAS9k4hhhEq8Xm5Ut1BMk9656oT1wbgoEZkG2BlYt9exhZe9BvxEfJUUbTsNayUxgNx0hH71lqwQx2FWMi2a9Yr58/Ejz/WuXmyVfv2mcFUuED5WYgsIyEavFUkq0SGNM5dIfzOJZU82cF880s6acZpb+9IWSHYINDpbgfKv7xwvuH5chxCKsdIlKlE/lEOxiwtZGpHMwS1kDx5q4OOv2kOeskeMabLoRBR6W+/DqD5Y5+R+eTSsQxeTQs8DAPg8ZAeTn0z6OzZw5U+sBxIAVBKeBsCyhsOLZ1vMbO0m4PvVMHF6U5CVuFpYSl2PBBZtneAk7LhA977z9jnle9BsbY61e9qOZPfUCM2PS0WbVohmmtEUHU9SstSkoEm4pBAWHqqpxzMqqai1VMi4FUl/SvI0pLW9rfv1qqvl84gFm3gd3moJVdu2hFap1kQ4dxCKsdEGHQxCwbMDCyquvvlo3T4taU+gFsUQWXtCJ5P2kwvHHH69KJcToFTWIJ3bjA+SUsce5BVs1MdgA0WYXbKCYwr0gGnLFEIe2U2mXFbMQkiUsBt6KUjiWl/vRF4haQKoQ7wrKBP027mc2ZzFKQaFZsWSucJxTzC+fPiL6luiVQlAgQbSJUlW5zJS27Wm6/+l8s96frzRt199XdC72KBMCk39l5e1N85JCM+/ta8yc10ebmiomA8+ZHiMJQl4Ii8FEMech2V8AgmKVTtzAM78jsYwVKWyfxMreVMCSYutGv9geM2aMcibAu429m94jmuE0AOK3viAIC0OAdthENwsIzV4fw8MSFsRvX3LAJmb0gQUGBaIWoO8hZjPhWoBfVS5faGZPOdlUfPu+KS5ra5zCZkoo/EMZr5GzqqtXiKgsNt33uMx02vSvpkOfAWa93S4wrXvsaqqEO+lbZrleYbkpKW1tFnw03nzz2hVSw++zR04IC7bP4NnOQuQhkthzi1egkcnIgHMOBIf7goJYsYPu7Wg7cHAQ69nPBIgg+0o6xCQ7oXgBZ4WAADvXWRGNTod4pE2IVa8FBvFCxIBzLGHRZvQrQB2rv71A/4IDcy0v4acLp3ql+fbN64Wo3jMl5WvJjWsPIb3I1WsqV5hW62xjWnfpZ37874Pm8ydHCrdaaTpscqj8pLm00aO3FhSJGG1nFvz7djP/v+NMgXC0bJE1YeGOgIAYNPQqBoOQACyfHWJIb0bn4u2qpLDaRZEsR+c7BIhC7PeLeDvfPxCcm8oIgNjZXAQrDQsNa9QfOfC+CgTl2oLfYsEBfuvV2XCVWMLCt+NtA8q5nQgYEd7JgkVKqgrqwUUXXZQWcSlnSXw1i4Wgfv7iGVPaMvFOxdVHErBXdZwaIbz2xhECWv7jf8yCjx80i6Y/b5p37Guate8hs2eFnGt/K5ar6F7NW3U0c9/9h1m+aLZb6796fGRFWKyoxb+F9YbCyiy1HY34YAAYJNwLI0aMUB0IpRjLCG6FuMCa4hjbB0Ew3sEIA0SK7sW+pGHnoyxjidIe8r/RrfxmvrXQEGPepEMmgrVE+Y03bublOP4kOTis3d3Z7mNlwXVwQ8C54uiMXnifcP7HE02BU2lqCspEZAUTJ+o377wuKipTAnOkD0plclQvX2AKy1qK+GxjatQVsRrco1rEorNqsfl55vNKkNkgY8JC/yEQyrZDDB6ciY6zs9mCWYrLAWWW3WPwN+EW4PfsJINegkhhw1V0jzgzGQJFN2J/TfScIEDoWG4An49dGOIFjj7ENi4HL/F4OZaa9x5OB0ey23AT1/RzTd4LDahHiQ8C4p+Vx8Rg48D2yK/zPjSLv3rVFJag8wnxJKp9gERExxLCKm3dVURnlalZ9av0a6EQS5VwJplcxeWmGiuxcqXUJQiMa2kpKjE/f/mcqVqxOFmXCVIusQ8D3Am2DmfCEhs7dqzOei9hocMMHz5cOxJfFk5SBhnvO6KBQSATEuLgXAaCzAY4TBT4PVYcyjhWpp8Y8WsdeeSRKqpoH2LZq6tZLoOlRgAcz7/3GhAZ+7tjMSLiyRywz8X14KxMKByxPIOXE/KdfqENXAdR7+eUqAhwaYgfP5nfix4EWvzjh3eYiu8+EI7TWgacfxC1o9ZctViANdWr5PsKU7VymSnvurVZZ4dTVdea/5/7jVNVYYqEU7Xtubtp3W1r0w7naMsupmL+Z/qbQghOrojFWbl0vilbq6cp75Sw4DMgrtWrdNyK2GBWw2Gw9EiZCcp8QKdCbMH+2SA1bMN9PPJwP1aZoK8ROojiXBCGHTg/hwRwSPxlnAeBwTWjrucHv0PMwUlps1fH4hhiEg6Mtef3meELQ3fEMoRgibH6l7OhGvAaOODdajwMENVKEWPTHx1qqhfPMUWldgWVcB2x8ApL25jmbbooR0KZb9ahr+m8zfGmebse5vuPJph5b44xJcVFprKmwHTa+gTTfoOBpqxNV1Mo5y+Y8az5+oVzTVmpcMHCRLRg1bIFpnXvP5veg+7Qe6cr1qSPMl9MQYeiEOPNDiIqRNVbb72lyu+wYcOSm4NhhUFkzGq7ERscCJHEzGaRBTHFKEAk3D+IqOAyiFgIAPcBg+gnKtqAbgeXDPLqcz4ikEnjJxyO8UxwQP8xgJ5ldSivn8wLDAWblkKohvOiQOsrF8811UvnSh+tTieCQzXr+kfT+6CJZoMhk80GQ5/Rsu6eo01hcXOxBseZH96+NsExC4pNUYFjfnjrWjN9Yn/zxcRBpmLRLNNxwwNEod9IRPdq46mwuMRULf5Kro+CnxkyJqxUYPAgHNg8+TuWCFD08ekgChhYwGBBXLgk4IRxdv7zA0Ki8JZ3dB9wzDHHqH/KC85BbBOuQcx5wzW5AFYjnIpnwU8GF/brYezGh74JmIBej38YVi37yTiiExV4JhNKeefNDjEt2vcyi2b80/z40QMi9u4zc1670syYNMLMff0qUyzEVFhULM9dJdytwrTrtYtp1WUTs+z7j8yyH7DiRbFvs45cbLUyX4jHvmKRqVq+yK1JH3kjLAsG0gvEAoSErhLE6TIF14TTodgjJhFhiGAbDLZAn8O/hShD1FklPVdgAkE4iGl0MZR02uMFInTkyJHqbIUrxnIcJ/vR8hA+xfIrFq4pX38UPeqbqRebb4WoFk0bb1b+MlvaUmCcQmmHcOUVi380HfodaNr3PcAs/1msYRR4wjhCWMWlLTzXF0hfJqKGtccuHeSNsAhvIBYYSILA1k81ePBgdZpCANZTjTjiHD6Z8Tatht/ce++9mjLL3lreMEkQEKOY+QAL1abaeoFCjw8M0Ea7zXeuwETCALHPQJwziAPDMXnZAr40uHVK1BljKshSTXDDwpLmpqRZay2kyJS139CUdugnivxSU1DWzvQYcJMQ1UHmuzeuFm40XwiyNGEh6jXIwNDLJJG4XSMkLHQQRA3EgTLtFTlYj15LjEAwSi4iA8XX6mN0PLsDIk5wTyBaooDVad0PKO92cL1ARFudho3L0t0h2QJxCyHbCWPBM2HV8vJOgGESJtqxjL2pOlEguFwoCrglpNVI9CH3JUyjnyLWSsrbmV4DbzI9B99lNjjwPrEIW5lZz55sKpctNMUlhICE27WQe4uyj9jzOi/4Pek0q42E9JFXUcgGH3AETHPCHXAlP9Av0LfgIhAC/ixLcKNGjUpuNc3udOhqYcBQsJ50fFaIwSAgduBkED7iyOu/Sge4Ogg833LLLW7NatB+tsmmvbzIyRufzATwjZIWHeS/lkm/U11In2m3FahOtfjr183MZ/9m2v5hB1Mx/1Mz+7nTTM2qJeoDSwi5QlNW3onGCrHNl4/VpFBTXWWKytsLcdXNe4+LvO/dQBAZFwLchsHErwWnwLsNR8LHhIhjluPwxM8FFyAcw443gAF64403dIaHAX8UCYVYaoRTCBuFAQ6C3mM5Y7pAdGAUQPToUxghdjJ4wX1Q4i3xBp0TBxAWsb3Zz55olsx8WdSjRBYGvqv1Btxo2vXc00yfdIxZ8t17ci/inRAOBLPQtOy2uan8VSxK0acKSsqlvsY4K381JW16mt5/ud9Urlxs/vfQX00ZUrEQK9cRQ2Gh6bTdiab7jmfpvdPlPtI/+d+7AecifilCKogg/DZwCrIhIR6ICmIiAwLdBLBjCi8BArgMMMmjiAoQZEanY79TXBdRwFLNlKgABGIzIbDqwkQd98F44PwoorIGDiEm/GdBIFGv7fp7m6qaKiUOMhjcI/o/3MhZschUr1go5WdTI9+LigrNsu/e1+Q+p3q5qVm+wFRjXRaVm7V3OMUUCxec/+G9ouRWqJIPOdaI9VjcqrPpsMEgZYCZTYV64Fh0GoVgMHlRcBXEHtYTSiued+KNWEjUsQc53mosN3532WWXmXPOOSelyMJNAQdBZwlaupRrMAkITdFm9KhU0YJUuP3221Wf5FnZfdn7vJaEqqsqzKcPDFACKSJnXYipx363mTY9djPfvD7aLP/hE9HDiA/S5wmvvCUM5WFCPM3ar286bnygad6ut1k04znz1T/PEQJM+AQ5t7JypWn1hx1Nr33HihGQGVnI/RvmXTpYf8xgxIQfODfPO+887Rx8PXjusx20dMG9QRSX4ZVqcFzENMYHEyNToBbwrBgD6GRwb68rhtZQ4E3ff3iP+f6ta01JaQvjVC0z7Tc/yqy9zfEarllNROFwCPmsWGyWzP1AXRNO5ZIEkeoz18jYrDK99rvFtFtvF/mL/K700WCEFQb0Md63jHhEV8IStEHd+gSZFliicA4SDv1gELAKMUYwTkgTyhZwaJzHcHC4oT++aLFSRNmMycea6oWfmQKx3ETNNq26bqOcKEEcQl7JCSGfLpVRhbW3aslcs2LBdP0slIOFbhiHE6ukrnW/Q0yPva7MmFuBRkVYiBP0MBvxv/zyy9WyAlGcIy4QlXfeeafqPYSY/I5TC9wRiGjcFhAWXno/GMA4bUoMdCLDA2OBuGVYvj/n0kbahVgKAyJt0eyXzcwnjjKlzRPLuKoqlwsnWmUcaRLpMom7EqTWHySBO6KosEh+wz0SmbaJs0TRX77QOCWtzSZHTjGlrbomfpshIKy8K+9xgPebmB5xNR6WiD8pLfrgMQYwDnAL4P4499xzNTkxDOSIQVxYpnwGIW6bOA8LlbRsAs24Qyyx+cG5NocNfTTMIEBrWkuswJ4Db9I3ZJCwV1ZSZsqatzTNm7U0zZq3ksJba/mUv8vlU0oZn/J3aVlz4Ybe9O0asRiXmpK2PUyfg+5XovJ7yjJBoyAsMkhJIRbuqdwCIstGZ/EDSws/lw2thA0uwMqziPKbxQX6E4AD0oagoLcXED3qAItDrA/PCxybkFfHjf5ieg64yRQ0byNGnVh6Ul0jYrFGh7RIzqAUu5+I1UThu8vLDKnKlUu+N2UdN5Jr3Whad95UjwQL4fTQ4IRFh+NasLnvOEtxhuYSrKbBlIegcDNEbaDh9e7HCrWkABEGK3bRo8LcCRbkaBHuIgOEpWpMtrpA3NWYdmIN9trvH6a02w5m+a/zVSRCesKOEp8BJcGpakSB/9WsWlFhWvUbYnrvf5dp0amvHOZYbtDghEX+N555wNvqsQijdAzA4OCURGxZjhAFjAFihABlOyroi1UGMWA0RDlZ44IoAIsoAOnYqTgWDlf0QJ4LhzGTwovE0CeIpLqg0LTovJnpd8gjwnFuMM1If6mGaJaqeMOB6lRWmBopfKeucuVS5Wwt19vZbHjQA6b3vteY4uZrCaHmjqgUKO8ykxsM7FwiFpBuM8n7XeKAjfOF6zjdu3d33n//fbc2HMINdbecPfbYw+HVHmGQvtBP0fV0dzv7d7bgdXX77ruvM2bMmFob8AdB9E1n+PDhKu+Ki4udCRMmuEeiUSP/VlUsdJb+MM354ZOJzjf/GuXMnHKCM+PpEVpmP3+KM+eNK52F059zlv30P6dqZWab48WB9Ft2O/rlAnQkb70QURV7IHfYYYeEoiFl6tSpbm00uI9wLt0iqL7Bc0HcYvW5NdFgr1EmG8/32GOPubXR4Klq5H96sKamyqmuWuFUV1Y41auWJYp8r6mS+0tb9Bz33HwAwmpUfqw4YGUQGRAA0YnvK9NAcrawS+rJkCCclEuQWoT4RjSHuUa8gAot+B4m2PzHciwAFUJb+XnDar6wYMGC5L6bLVu2dN599133SDTGjx+v4qgqiw1b/UCknXzyyc66667rDBs2LON9V4MQl3M3VsCxGoW7IS7Ym8ku6SItJs4+ECQKEvQmP9+mLOcCGAS4BrA22YuBGGeusNrHlAAuEH/eV2NHkyEsnIbE0HCm4uMiiTCVrwsLDG87zkb2SQ1zOmYCnJn2/vjHaFeuITNfExYJGRFDtX64poAmQ1gQCcQlnFY5VZwYIu4Iy+FI7gtbfpYJ0HtI4IO7MOCEY3INuBS+L4iW5WRNiWs1GcLCscmsxStPVgFJg36R4QdZB5ZLkQ4Nl8kVMBggLHxuEFYqx2cm4B7kopFJSygqzr5ijQVNhrAgou22207zs3AipiIqHIzsuAeng7vAsVJZj+hNbBHOmsNUhAJBYQnyybn8Ni6wJmkX3DcVcLCSp8V2lameuTGhSSnv6YDBs555uBvp0KkGhjAKcTrep8jOOamAaIWwEIO4HdCJUsFuNYnul0q0NSVC8mONJSxEoOUicZZ5McjsTkPs0pZUIFMVwoJ4SbuOQ1iIczJPCdfk0phobFhjCQsuxSoaRCB5VamWWaEnseAV8USSIfG6VEDvg6vwG/9eWWFgFRLrKVlX2JR0prQhndFkHKTpQjiCviFfntGtCcfixYud3XffXZ2vOD2nTZvmHgnH66+/7gjX0t/wginCRnGAozdueKcpQvq7aTlI0wUcgRSZOLoKy95JC4ZTbb/99roRbiqwKJVd/BCJrDSKE3oBKP1xz22qaHKxwnwDJRyxGbTQIwzkcEXleP3WIExraYEorVVFYZn7v+N3ZABoCo7FZlS58xz+jt9hTMX/A/eR72+RaQ9jAAAAAElFTkSuQmCC";
  function create_if_block$5(ctx) {
    let div;
    let section;
    let t0;
    let button;
    let div_class_value;
    let current;
    let mounted;
    let dispose;
    const default_slot_template = (
      /*#slots*/
      ctx[9].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[8],
      null
    );
    return {
      c() {
        div = element("div");
        section = element("section");
        if (default_slot) default_slot.c();
        t0 = space();
        button = element("button");
        button.textContent = "✕";
        attr(section, "class", "overflow-hidden h-full");
        attr(button, "class", "absolute top-2 right-2 z-1 btn-icon btn-icon-sm select-none bg-transparent font-bold hover:text-xl");
        attr(div, "data-theme", "skeleton");
        attr(div, "class", div_class_value = "relative rounded-container-token shadow-xl bg-scroll " + /*classes*/
        ctx[2]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, section);
        if (default_slot) {
          default_slot.m(section, null);
        }
        ctx[10](section);
        append(div, t0);
        append(div, button);
        current = true;
        if (!mounted) {
          dispose = listen(button, "click", function() {
            if (is_function(
              /*parent*/
              ctx[0].onClose
            )) ctx[0].onClose.apply(this, arguments);
          });
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (default_slot) {
          if (default_slot.p && (!current || dirty & /*$$scope*/
          256)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx,
              /*$$scope*/
              ctx[8],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx[8]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx[8],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty & /*classes*/
        4 && div_class_value !== (div_class_value = "relative rounded-container-token shadow-xl bg-scroll " + /*classes*/
        ctx[2])) {
          attr(div, "class", div_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (default_slot) default_slot.d(detaching);
        ctx[10](null);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment$9(ctx) {
    let if_block_anchor;
    let current;
    let if_block = (
      /*$modalStore*/
      ctx[3][0] && create_if_block$5(ctx)
    );
    return {
      c() {
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*$modalStore*/
          ctx2[3][0]
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*$modalStore*/
            8) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$5(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(if_block_anchor);
        }
        if (if_block) if_block.d(detaching);
      }
    };
  }
  function instance$9($$self, $$props, $$invalidate) {
    let classes;
    let $modalStore;
    let { $$slots: slots = {}, $$scope } = $$props;
    let { parent } = $$props;
    let { padding = "py-6 px-8" } = $$props;
    let { width = "w-full md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg" } = $$props;
    let { height = "" } = $$props;
    const modalStore = getModalStore();
    component_subscribe($$self, modalStore, (value) => $$invalidate(3, $modalStore = value));
    let content;
    let lastHeight;
    let inAnimation = false;
    const ob = new ResizeObserver(() => {
      if (!content) return;
      const curHeight = content.offsetHeight;
      if (curHeight === lastHeight || inAnimation) return;
      inAnimation = true;
      const animation = content.animate([{ height: lastHeight + "px" }, { height: curHeight + "px" }], { duration: 100 });
      lastHeight = curHeight;
      animation.finished.then(() => {
        inAnimation = false;
      });
    });
    onMount(() => {
      lastHeight = content.offsetHeight;
      ob.observe(content);
    });
    onDestroy(() => {
      ob.disconnect();
    });
    function section_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        content = $$value;
        $$invalidate(1, content);
      });
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(14, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("parent" in $$new_props) $$invalidate(0, parent = $$new_props.parent);
      if ("padding" in $$new_props) $$invalidate(5, padding = $$new_props.padding);
      if ("width" in $$new_props) $$invalidate(6, width = $$new_props.width);
      if ("height" in $$new_props) $$invalidate(7, height = $$new_props.height);
      if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    };
    $$self.$$.update = () => {
      $$invalidate(2, classes = `${padding} ${width} ${height} ${$$props.class ?? ""}`);
    };
    $$props = exclude_internal_props($$props);
    return [
      parent,
      content,
      classes,
      $modalStore,
      modalStore,
      padding,
      width,
      height,
      $$scope,
      slots,
      section_binding
    ];
  }
  class ModalWrapper extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$9, create_fragment$9, safe_not_equal, {
        parent: 0,
        padding: 5,
        width: 6,
        height: 7
      });
    }
  }
  function create_default_slot$5(ctx) {
    let header;
    let t2;
    let article;
    let t4;
    let footer;
    let details;
    let summary;
    let t5;
    let t6;
    let div;
    let t9;
    let a;
    let t10;
    return {
      c() {
        header = element("header");
        header.textContent = `Pixiv Downloader ${"1.0.2"}`;
        t2 = space();
        article = element("article");
        article.innerHTML = `<ul class="list-disc list-inside leading-loose"><li>Danbooru：修复Firefox下载图片时请求被cf拒绝的问题。</li></ul>`;
        t4 = space();
        footer = element("footer");
        details = element("details");
        summary = element("summary");
        t5 = text("脚本还行？请我喝杯可乐吧！");
        t6 = space();
        div = element("div");
        div.innerHTML = `<img src="${creditCode}" alt="credit" class="rounded-full"/> <p class="mt-2">想喝香草味冰可乐</p>`;
        t9 = space();
        a = element("a");
        t10 = text("有问题or想建议？这里反馈");
        attr(header, "class", "modal-header text-2xl font-bold");
        attr(article, "class", "modal-body mt-4");
        attr(summary, "class", "inline-block cursor-pointer " + /*anchor*/
        ctx[1]);
        attr(div, "class", "text-center truncate flex flex-col items-center mt-4");
        attr(a, "class", "absolute right-0 top-0 " + /*anchor*/
        ctx[1]);
        attr(a, "target", "_blank");
        attr(a, "href", "https://sleazyfork.org/zh-CN/scripts/432150-pixiv-downloader/feedback");
        attr(footer, "class", "modal-footer relative mt-4 text-sm");
      },
      m(target, anchor) {
        insert(target, header, anchor);
        insert(target, t2, anchor);
        insert(target, article, anchor);
        insert(target, t4, anchor);
        insert(target, footer, anchor);
        append(footer, details);
        append(details, summary);
        append(summary, t5);
        append(details, t6);
        append(details, div);
        append(footer, t9);
        append(footer, a);
        append(a, t10);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(header);
          detach(t2);
          detach(article);
          detach(t4);
          detach(footer);
        }
      }
    };
  }
  function create_fragment$8(ctx) {
    let modalwrapper;
    let current;
    modalwrapper = new ModalWrapper({
      props: {
        parent: (
          /*parent*/
          ctx[0]
        ),
        $$slots: { default: [create_default_slot$5] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        create_component(modalwrapper.$$.fragment);
      },
      m(target, anchor) {
        mount_component(modalwrapper, target, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        const modalwrapper_changes = {};
        if (dirty & /*parent*/
        1) modalwrapper_changes.parent = /*parent*/
        ctx2[0];
        if (dirty & /*$$scope*/
        8) {
          modalwrapper_changes.$$scope = { dirty, ctx: ctx2 };
        }
        modalwrapper.$set(modalwrapper_changes);
      },
      i(local) {
        if (current) return;
        transition_in(modalwrapper.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(modalwrapper.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(modalwrapper, detaching);
      }
    };
  }
  function instance$8($$self, $$props, $$invalidate) {
    const anchorFocus = `focus:!outline-none focus:decoration-wavy`;
    const anchor = `leading-loose anchor underline-offset-2 ${anchorFocus}`;
    let { parent } = $$props;
    $$self.$$set = ($$props2) => {
      if ("parent" in $$props2) $$invalidate(0, parent = $$props2.parent);
    };
    return [parent, anchor];
  }
  class Changelog extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$8, create_fragment$8, safe_not_equal, { parent: 0 });
    }
  }
  const check = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>check</title><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>`;
  const folderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" /></svg>`;
  const fileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" /></svg>`;
  const data = config.getAll();
  const configStore = writable(data);
  configStore.subscribe(config.update);
  function get_each_context$2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[36] = list[i];
    return child_ctx;
  }
  function get_each_context_1$1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[36] = list[i];
    return child_ctx;
  }
  function create_else_block$1(ctx) {
    let input;
    return {
      c() {
        input = element("input");
        attr(input, "type", "text");
        input.disabled = true;
        attr(
          input,
          "placeholder",
          /*directoryPlaceholder*/
          ctx[9]
        );
      },
      m(target, anchor) {
        insert(target, input, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*directoryPlaceholder*/
        512) {
          attr(
            input,
            "placeholder",
            /*directoryPlaceholder*/
            ctx2[9]
          );
        }
      },
      d(detaching) {
        if (detaching) {
          detach(input);
        }
      }
    };
  }
  function create_if_block_1(ctx) {
    let input;
    let mounted;
    let dispose;
    return {
      c() {
        input = element("input");
        attr(input, "type", "text");
        attr(
          input,
          "placeholder",
          /*directoryPlaceholder*/
          ctx[9]
        );
      },
      m(target, anchor) {
        insert(target, input, anchor);
        set_input_value(
          input,
          /*directory*/
          ctx[4]
        );
        if (!mounted) {
          dispose = listen(
            input,
            "input",
            /*input_input_handler*/
            ctx[23]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty[0] & /*directoryPlaceholder*/
        512) {
          attr(
            input,
            "placeholder",
            /*directoryPlaceholder*/
            ctx2[9]
          );
        }
        if (dirty[0] & /*directory*/
        16 && input.value !== /*directory*/
        ctx2[4]) {
          set_input_value(
            input,
            /*directory*/
            ctx2[4]
          );
        }
      },
      d(detaching) {
        if (detaching) {
          detach(input);
        }
        mounted = false;
        dispose();
      }
    };
  }
  function create_each_block_1$1(ctx) {
    let button;
    let span;
    let t0_value = (
      /*p*/
      ctx[36] + ""
    );
    let t0;
    let t1;
    let button_disabled_value;
    let mounted;
    let dispose;
    function click_handler() {
      return (
        /*click_handler*/
        ctx[24](
          /*p*/
          ctx[36]
        )
      );
    }
    return {
      c() {
        button = element("button");
        span = element("span");
        t0 = text(t0_value);
        t1 = space();
        attr(button, "class", "chip variant-soft hover:variant-filled");
        button.disabled = button_disabled_value = !/*subDirectoryAvailable*/
        ctx[6];
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, span);
        append(span, t0);
        append(button, t1);
        if (!mounted) {
          dispose = listen(button, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty[0] & /*pattern*/
        8 && t0_value !== (t0_value = /*p*/
        ctx[36] + "")) set_data(t0, t0_value);
        if (dirty[0] & /*subDirectoryAvailable*/
        64 && button_disabled_value !== (button_disabled_value = !/*subDirectoryAvailable*/
        ctx[6])) {
          button.disabled = button_disabled_value;
        }
      },
      d(detaching) {
        if (detaching) {
          detach(button);
        }
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block$4(ctx) {
    let li0;
    let p0;
    let t1;
    let span;
    let t2;
    let t3;
    let button;
    let t5;
    let li1;
    let p1;
    let t7;
    let radiogroup;
    let current;
    let mounted;
    let dispose;
    radiogroup = new RadioGroup({
      props: {
        class: "shrink-0",
        $$slots: { default: [create_default_slot_5$1] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        li0 = element("li");
        p0 = element("p");
        p0.textContent = `${t("setting.save_to.options.fsa_directory")}`;
        t1 = space();
        span = element("span");
        t2 = text(
          /*fsaDirectory*/
          ctx[8]
        );
        t3 = space();
        button = element("button");
        button.textContent = `${t("setting.save_to.button.choose_fsa_directory")}`;
        t5 = space();
        li1 = element("li");
        p1 = element("p");
        p1.textContent = `${t("setting.save_to.options.fsa_filename_conflict")}`;
        t7 = space();
        create_component(radiogroup.$$.fragment);
        attr(p0, "class", "flex-auto");
        attr(span, "class", "text-sm italic");
        attr(button, "class", "btn btn-sm variant-filled");
        attr(p1, "class", "flex-auto");
      },
      m(target, anchor) {
        insert(target, li0, anchor);
        append(li0, p0);
        append(li0, t1);
        append(li0, span);
        append(span, t2);
        append(li0, t3);
        append(li0, button);
        insert(target, t5, anchor);
        insert(target, li1, anchor);
        append(li1, p1);
        append(li1, t7);
        mount_component(radiogroup, li1, null);
        current = true;
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*updatefsaDir*/
            ctx[17]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (!current || dirty[0] & /*fsaDirectory*/
        256) set_data(
          t2,
          /*fsaDirectory*/
          ctx2[8]
        );
        const radiogroup_changes = {};
        if (dirty[0] & /*$store*/
        128 | dirty[1] & /*$$scope*/
        1024) {
          radiogroup_changes.$$scope = { dirty, ctx: ctx2 };
        }
        radiogroup.$set(radiogroup_changes);
      },
      i(local) {
        if (current) return;
        transition_in(radiogroup.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(radiogroup.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(li0);
          detach(t5);
          detach(li1);
        }
        destroy_component(radiogroup);
        mounted = false;
        dispose();
      }
    };
  }
  function create_default_slot_8(ctx) {
    let t_1_value = t("setting.save_to.radio.filename_conflict_option_uniquify") + "";
    let t_1;
    return {
      c() {
        t_1 = text(t_1_value);
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_7(ctx) {
    let t_1_value = t("setting.save_to.radio.filename_conflict_option_overwrite") + "";
    let t_1;
    return {
      c() {
        t_1 = text(t_1_value);
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_6$1(ctx) {
    let t_1_value = t("setting.save_to.radio.filename_conflict_option_prompt") + "";
    let t_1;
    return {
      c() {
        t_1 = text(t_1_value);
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_5$1(ctx) {
    let radioitem0;
    let updating_group;
    let t0;
    let radioitem1;
    let updating_group_1;
    let t1;
    let radioitem2;
    let updating_group_2;
    let current;
    function radioitem0_group_binding(value) {
      ctx[26](value);
    }
    let radioitem0_props = {
      name: "filenameConfigAction",
      class: "text-sm",
      value: FilenameConfigAction.UNIQUIFY,
      $$slots: { default: [create_default_slot_8] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].fileSystemFilenameConflictAction !== void 0
    ) {
      radioitem0_props.group = /*$store*/
      ctx[7].fileSystemFilenameConflictAction;
    }
    radioitem0 = new RadioItem({ props: radioitem0_props });
    binding_callbacks.push(() => bind(radioitem0, "group", radioitem0_group_binding));
    function radioitem1_group_binding(value) {
      ctx[27](value);
    }
    let radioitem1_props = {
      name: "filenameConfigAction",
      class: "text-sm",
      value: FilenameConfigAction.OVERWRITE,
      $$slots: { default: [create_default_slot_7] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].fileSystemFilenameConflictAction !== void 0
    ) {
      radioitem1_props.group = /*$store*/
      ctx[7].fileSystemFilenameConflictAction;
    }
    radioitem1 = new RadioItem({ props: radioitem1_props });
    binding_callbacks.push(() => bind(radioitem1, "group", radioitem1_group_binding));
    function radioitem2_group_binding(value) {
      ctx[28](value);
    }
    let radioitem2_props = {
      name: "filenameConfigAction",
      class: "text-sm",
      value: FilenameConfigAction.PROMPT,
      $$slots: { default: [create_default_slot_6$1] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].fileSystemFilenameConflictAction !== void 0
    ) {
      radioitem2_props.group = /*$store*/
      ctx[7].fileSystemFilenameConflictAction;
    }
    radioitem2 = new RadioItem({ props: radioitem2_props });
    binding_callbacks.push(() => bind(radioitem2, "group", radioitem2_group_binding));
    return {
      c() {
        create_component(radioitem0.$$.fragment);
        t0 = space();
        create_component(radioitem1.$$.fragment);
        t1 = space();
        create_component(radioitem2.$$.fragment);
      },
      m(target, anchor) {
        mount_component(radioitem0, target, anchor);
        insert(target, t0, anchor);
        mount_component(radioitem1, target, anchor);
        insert(target, t1, anchor);
        mount_component(radioitem2, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const radioitem0_changes = {};
        if (dirty[1] & /*$$scope*/
        1024) {
          radioitem0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group && dirty[0] & /*$store*/
        128) {
          updating_group = true;
          radioitem0_changes.group = /*$store*/
          ctx2[7].fileSystemFilenameConflictAction;
          add_flush_callback(() => updating_group = false);
        }
        radioitem0.$set(radioitem0_changes);
        const radioitem1_changes = {};
        if (dirty[1] & /*$$scope*/
        1024) {
          radioitem1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_1 && dirty[0] & /*$store*/
        128) {
          updating_group_1 = true;
          radioitem1_changes.group = /*$store*/
          ctx2[7].fileSystemFilenameConflictAction;
          add_flush_callback(() => updating_group_1 = false);
        }
        radioitem1.$set(radioitem1_changes);
        const radioitem2_changes = {};
        if (dirty[1] & /*$$scope*/
        1024) {
          radioitem2_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_2 && dirty[0] & /*$store*/
        128) {
          updating_group_2 = true;
          radioitem2_changes.group = /*$store*/
          ctx2[7].fileSystemFilenameConflictAction;
          add_flush_callback(() => updating_group_2 = false);
        }
        radioitem2.$set(radioitem2_changes);
      },
      i(local) {
        if (current) return;
        transition_in(radioitem0.$$.fragment, local);
        transition_in(radioitem1.$$.fragment, local);
        transition_in(radioitem2.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(radioitem0.$$.fragment, local);
        transition_out(radioitem1.$$.fragment, local);
        transition_out(radioitem2.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(t0);
          detach(t1);
        }
        destroy_component(radioitem0, detaching);
        destroy_component(radioitem1, detaching);
        destroy_component(radioitem2, detaching);
      }
    };
  }
  function create_each_block$2(ctx) {
    let button;
    let span;
    let t0_value = (
      /*p*/
      ctx[36] + ""
    );
    let t0;
    let t1;
    let mounted;
    let dispose;
    function click_handler_1() {
      return (
        /*click_handler_1*/
        ctx[30](
          /*p*/
          ctx[36]
        )
      );
    }
    return {
      c() {
        button = element("button");
        span = element("span");
        t0 = text(t0_value);
        t1 = space();
        attr(button, "class", "chip variant-soft hover:variant-filled");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, span);
        append(span, t0);
        append(button, t1);
        if (!mounted) {
          dispose = listen(button, "click", click_handler_1);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty[0] & /*pattern*/
        8 && t0_value !== (t0_value = /*p*/
        ctx[36] + "")) set_data(t0, t0_value);
      },
      d(detaching) {
        if (detaching) {
          detach(button);
        }
        mounted = false;
        dispose();
      }
    };
  }
  function create_default_slot_4$1(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("日本語");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_3$3(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("简中");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_2$3(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("繁中");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_1$3(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("En");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot$4(ctx) {
    let radioitem0;
    let updating_group;
    let t0;
    let radioitem1;
    let updating_group_1;
    let t1;
    let radioitem2;
    let updating_group_2;
    let t2;
    let radioitem3;
    let updating_group_3;
    let current;
    function radioitem0_group_binding_1(value) {
      ctx[31](value);
    }
    let radioitem0_props = {
      name: "tagLang",
      class: "text-sm",
      value: TagLanguage.JAPANESE,
      $$slots: { default: [create_default_slot_4$1] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].tagLang !== void 0
    ) {
      radioitem0_props.group = /*$store*/
      ctx[7].tagLang;
    }
    radioitem0 = new RadioItem({ props: radioitem0_props });
    binding_callbacks.push(() => bind(radioitem0, "group", radioitem0_group_binding_1));
    function radioitem1_group_binding_1(value) {
      ctx[32](value);
    }
    let radioitem1_props = {
      name: "tagLang",
      class: "text-sm",
      value: TagLanguage.CHINESE,
      $$slots: { default: [create_default_slot_3$3] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].tagLang !== void 0
    ) {
      radioitem1_props.group = /*$store*/
      ctx[7].tagLang;
    }
    radioitem1 = new RadioItem({ props: radioitem1_props });
    binding_callbacks.push(() => bind(radioitem1, "group", radioitem1_group_binding_1));
    function radioitem2_group_binding_1(value) {
      ctx[33](value);
    }
    let radioitem2_props = {
      name: "tagLang",
      class: "text-sm",
      value: TagLanguage.TRADITIONAL_CHINESE,
      $$slots: { default: [create_default_slot_2$3] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].tagLang !== void 0
    ) {
      radioitem2_props.group = /*$store*/
      ctx[7].tagLang;
    }
    radioitem2 = new RadioItem({ props: radioitem2_props });
    binding_callbacks.push(() => bind(radioitem2, "group", radioitem2_group_binding_1));
    function radioitem3_group_binding(value) {
      ctx[34](value);
    }
    let radioitem3_props = {
      name: "tagLang",
      class: "text-sm",
      value: TagLanguage.ENGLISH,
      $$slots: { default: [create_default_slot_1$3] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].tagLang !== void 0
    ) {
      radioitem3_props.group = /*$store*/
      ctx[7].tagLang;
    }
    radioitem3 = new RadioItem({ props: radioitem3_props });
    binding_callbacks.push(() => bind(radioitem3, "group", radioitem3_group_binding));
    return {
      c() {
        create_component(radioitem0.$$.fragment);
        t0 = space();
        create_component(radioitem1.$$.fragment);
        t1 = space();
        create_component(radioitem2.$$.fragment);
        t2 = space();
        create_component(radioitem3.$$.fragment);
      },
      m(target, anchor) {
        mount_component(radioitem0, target, anchor);
        insert(target, t0, anchor);
        mount_component(radioitem1, target, anchor);
        insert(target, t1, anchor);
        mount_component(radioitem2, target, anchor);
        insert(target, t2, anchor);
        mount_component(radioitem3, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const radioitem0_changes = {};
        if (dirty[1] & /*$$scope*/
        1024) {
          radioitem0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group && dirty[0] & /*$store*/
        128) {
          updating_group = true;
          radioitem0_changes.group = /*$store*/
          ctx2[7].tagLang;
          add_flush_callback(() => updating_group = false);
        }
        radioitem0.$set(radioitem0_changes);
        const radioitem1_changes = {};
        if (dirty[1] & /*$$scope*/
        1024) {
          radioitem1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_1 && dirty[0] & /*$store*/
        128) {
          updating_group_1 = true;
          radioitem1_changes.group = /*$store*/
          ctx2[7].tagLang;
          add_flush_callback(() => updating_group_1 = false);
        }
        radioitem1.$set(radioitem1_changes);
        const radioitem2_changes = {};
        if (dirty[1] & /*$$scope*/
        1024) {
          radioitem2_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_2 && dirty[0] & /*$store*/
        128) {
          updating_group_2 = true;
          radioitem2_changes.group = /*$store*/
          ctx2[7].tagLang;
          add_flush_callback(() => updating_group_2 = false);
        }
        radioitem2.$set(radioitem2_changes);
        const radioitem3_changes = {};
        if (dirty[1] & /*$$scope*/
        1024) {
          radioitem3_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_3 && dirty[0] & /*$store*/
        128) {
          updating_group_3 = true;
          radioitem3_changes.group = /*$store*/
          ctx2[7].tagLang;
          add_flush_callback(() => updating_group_3 = false);
        }
        radioitem3.$set(radioitem3_changes);
      },
      i(local) {
        if (current) return;
        transition_in(radioitem0.$$.fragment, local);
        transition_in(radioitem1.$$.fragment, local);
        transition_in(radioitem2.$$.fragment, local);
        transition_in(radioitem3.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(radioitem0.$$.fragment, local);
        transition_out(radioitem1.$$.fragment, local);
        transition_out(radioitem2.$$.fragment, local);
        transition_out(radioitem3.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(t0);
          detach(t1);
          detach(t2);
        }
        destroy_component(radioitem0, detaching);
        destroy_component(radioitem1, detaching);
        destroy_component(radioitem2, detaching);
        destroy_component(radioitem3, detaching);
      }
    };
  }
  function create_fragment$7(ctx) {
    let div5;
    let section0;
    let p0;
    let t0_value = t("setting.save_to.label.directory") + "";
    let t0;
    let t1;
    let ul0;
    let li0;
    let div0;
    let button0;
    let i0;
    let t2;
    let t3;
    let button1;
    let i1;
    let t4;
    let div1;
    let t5;
    let li1;
    let p1;
    let t7;
    let slidetoggle;
    let updating_checked;
    let t8;
    let t9;
    let section1;
    let p2;
    let t10_value = t("setting.save_to.label.filename") + "";
    let t10;
    let t11;
    let ul1;
    let li2;
    let div2;
    let button2;
    let i2;
    let t12;
    let input;
    let t13;
    let button3;
    let i3;
    let t14;
    let div3;
    let t15;
    let li3;
    let div4;
    let p3;
    let t17;
    let p4;
    let t18_value = t("setting.save_to.options.tag_language_tips") + "";
    let t18;
    let t19;
    let radiogroup;
    let current;
    let mounted;
    let dispose;
    function select_block_type(ctx2, dirty) {
      if (
        /*subDirectoryAvailable*/
        ctx2[6]
      ) return create_if_block_1;
      return create_else_block$1;
    }
    let current_block_type = select_block_type(ctx);
    let if_block0 = current_block_type(ctx);
    let each_value_1 = ensure_array_like(
      /*pattern*/
      ctx[3]
    );
    let each_blocks_1 = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    }
    function slidetoggle_checked_binding(value) {
      ctx[25](value);
    }
    let slidetoggle_props = {
      size: "sm",
      name: "fsa-enable",
      disabled: !env.isFileSystemAccessAvaliable()
    };
    if (
      /*$store*/
      ctx[7].useFileSystemAccess !== void 0
    ) {
      slidetoggle_props.checked = /*$store*/
      ctx[7].useFileSystemAccess;
    }
    slidetoggle = new SlideToggle({ props: slidetoggle_props });
    binding_callbacks.push(() => bind(slidetoggle, "checked", slidetoggle_checked_binding));
    let if_block1 = (
      /*$store*/
      ctx[7].useFileSystemAccess && create_if_block$4(ctx)
    );
    let each_value = ensure_array_like(
      /*pattern*/
      ctx[3]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    }
    radiogroup = new RadioGroup({
      props: {
        class: " shrink-0",
        $$slots: { default: [create_default_slot$4] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        div5 = element("div");
        section0 = element("section");
        p0 = element("p");
        t0 = text(t0_value);
        t1 = space();
        ul0 = element("ul");
        li0 = element("li");
        div0 = element("div");
        button0 = element("button");
        i0 = element("i");
        t2 = space();
        if_block0.c();
        t3 = space();
        button1 = element("button");
        i1 = element("i");
        t4 = space();
        div1 = element("div");
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].c();
        }
        t5 = space();
        li1 = element("li");
        p1 = element("p");
        p1.textContent = `${t("setting.save_to.options.use_fsa")}`;
        t7 = space();
        create_component(slidetoggle.$$.fragment);
        t8 = space();
        if (if_block1) if_block1.c();
        t9 = space();
        section1 = element("section");
        p2 = element("p");
        t10 = text(t10_value);
        t11 = space();
        ul1 = element("ul");
        li2 = element("li");
        div2 = element("div");
        button2 = element("button");
        i2 = element("i");
        t12 = space();
        input = element("input");
        t13 = space();
        button3 = element("button");
        i3 = element("i");
        t14 = space();
        div3 = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t15 = space();
        li3 = element("li");
        div4 = element("div");
        p3 = element("p");
        p3.textContent = `${t("setting.save_to.options.tag_language")}`;
        t17 = space();
        p4 = element("p");
        t18 = text(t18_value);
        t19 = space();
        create_component(radiogroup.$$.fragment);
        attr(
          p0,
          "class",
          /*sectionTitle*/
          ctx[2]
        );
        attr(i0, "class", "w-6 fill-current");
        attr(button0, "type", "button");
        attr(button0, "class", "[&:not([disabled])]:variant-soft-primary");
        button0.disabled = /*folderBtnDisabled*/
        ctx[11];
        attr(i1, "class", "w-6 fill-current");
        attr(button1, "type", "button");
        attr(button1, "class", "variant-soft-surface [&:not([disabled])]:variant-soft-primary");
        button1.disabled = /*folderBtnDisabled*/
        ctx[11];
        attr(div0, "class", "input-group input-group-divider grid-cols-[auto_1fr_auto_auto]");
        attr(div1, "class", "self-start space-x-2");
        attr(li0, "class", "flex-col gap-3");
        attr(p1, "class", "flex-auto");
        attr(
          ul0,
          "class",
          /*ulClasses*/
          ctx[12]
        );
        attr(
          p2,
          "class",
          /*sectionTitle*/
          ctx[2]
        );
        attr(i2, "class", "w-6 fill-current");
        attr(button2, "type", "button");
        attr(button2, "class", "[&:not([disabled])]:variant-soft-primary");
        button2.disabled = /*filenameBtnDisabled*/
        ctx[10];
        attr(input, "type", "text");
        input.required = true;
        attr(input, "placeholder", t("setting.save_to.placeholder.filename_requried"));
        attr(i3, "class", "w-6 fill-current");
        attr(button3, "type", "button");
        attr(button3, "class", "variant-soft-surface dark:variant-fill-surface [&:not([disabled])]:variant-soft-primary");
        button3.disabled = /*filenameBtnDisabled*/
        ctx[10];
        attr(div2, "class", "input-group input-group-divider grid-cols-[auto_1fr_auto]");
        attr(div3, "class", "self-start space-x-2");
        attr(li2, "class", "flex-col gap-3");
        attr(
          p4,
          "class",
          /*descritionText*/
          ctx[0]
        );
        attr(div4, "class", "flex-auto");
        attr(
          ul1,
          "class",
          /*ulClasses*/
          ctx[12]
        );
        attr(
          div5,
          "class",
          /*sectionSpace*/
          ctx[1]
        );
      },
      m(target, anchor) {
        insert(target, div5, anchor);
        append(div5, section0);
        append(section0, p0);
        append(p0, t0);
        append(section0, t1);
        append(section0, ul0);
        append(ul0, li0);
        append(li0, div0);
        append(div0, button0);
        append(button0, i0);
        i0.innerHTML = folderSvg;
        append(div0, t2);
        if_block0.m(div0, null);
        append(div0, t3);
        append(div0, button1);
        append(button1, i1);
        i1.innerHTML = check;
        append(li0, t4);
        append(li0, div1);
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          if (each_blocks_1[i]) {
            each_blocks_1[i].m(div1, null);
          }
        }
        append(ul0, t5);
        append(ul0, li1);
        append(li1, p1);
        append(li1, t7);
        mount_component(slidetoggle, li1, null);
        append(ul0, t8);
        if (if_block1) if_block1.m(ul0, null);
        append(div5, t9);
        append(div5, section1);
        append(section1, p2);
        append(p2, t10);
        append(section1, t11);
        append(section1, ul1);
        append(ul1, li2);
        append(li2, div2);
        append(div2, button2);
        append(button2, i2);
        i2.innerHTML = fileSvg;
        append(div2, t12);
        append(div2, input);
        set_input_value(
          input,
          /*filename*/
          ctx[5]
        );
        append(div2, t13);
        append(div2, button3);
        append(button3, i3);
        i3.innerHTML = check;
        append(li2, t14);
        append(li2, div3);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div3, null);
          }
        }
        append(ul1, t15);
        append(ul1, li3);
        append(li3, div4);
        append(div4, p3);
        append(div4, t17);
        append(div4, p4);
        append(p4, t18);
        append(li3, t19);
        mount_component(radiogroup, li3, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              button0,
              "click",
              /*resetFolder*/
              ctx[15]
            ),
            listen(
              button1,
              "click",
              /*updateDirectory*/
              ctx[13]
            ),
            listen(
              button2,
              "click",
              /*resetFilename*/
              ctx[16]
            ),
            listen(
              input,
              "input",
              /*input_input_handler_1*/
              ctx[29]
            ),
            listen(
              button3,
              "click",
              /*updateFilename*/
              ctx[14]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (!current || dirty[0] & /*sectionTitle*/
        4) {
          attr(
            p0,
            "class",
            /*sectionTitle*/
            ctx2[2]
          );
        }
        if (!current || dirty[0] & /*folderBtnDisabled*/
        2048) {
          button0.disabled = /*folderBtnDisabled*/
          ctx2[11];
        }
        if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0.d(1);
          if_block0 = current_block_type(ctx2);
          if (if_block0) {
            if_block0.c();
            if_block0.m(div0, t3);
          }
        }
        if (!current || dirty[0] & /*folderBtnDisabled*/
        2048) {
          button1.disabled = /*folderBtnDisabled*/
          ctx2[11];
        }
        if (dirty[0] & /*subDirectoryAvailable, directory, pattern*/
        88) {
          each_value_1 = ensure_array_like(
            /*pattern*/
            ctx2[3]
          );
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_1$1(ctx2, each_value_1, i);
            if (each_blocks_1[i]) {
              each_blocks_1[i].p(child_ctx, dirty);
            } else {
              each_blocks_1[i] = create_each_block_1$1(child_ctx);
              each_blocks_1[i].c();
              each_blocks_1[i].m(div1, null);
            }
          }
          for (; i < each_blocks_1.length; i += 1) {
            each_blocks_1[i].d(1);
          }
          each_blocks_1.length = each_value_1.length;
        }
        const slidetoggle_changes = {};
        if (!updating_checked && dirty[0] & /*$store*/
        128) {
          updating_checked = true;
          slidetoggle_changes.checked = /*$store*/
          ctx2[7].useFileSystemAccess;
          add_flush_callback(() => updating_checked = false);
        }
        slidetoggle.$set(slidetoggle_changes);
        if (
          /*$store*/
          ctx2[7].useFileSystemAccess
        ) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
            if (dirty[0] & /*$store*/
            128) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block$4(ctx2);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(ul0, null);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if (!current || dirty[0] & /*ulClasses*/
        4096) {
          attr(
            ul0,
            "class",
            /*ulClasses*/
            ctx2[12]
          );
        }
        if (!current || dirty[0] & /*sectionTitle*/
        4) {
          attr(
            p2,
            "class",
            /*sectionTitle*/
            ctx2[2]
          );
        }
        if (!current || dirty[0] & /*filenameBtnDisabled*/
        1024) {
          button2.disabled = /*filenameBtnDisabled*/
          ctx2[10];
        }
        if (dirty[0] & /*filename*/
        32 && input.value !== /*filename*/
        ctx2[5]) {
          set_input_value(
            input,
            /*filename*/
            ctx2[5]
          );
        }
        if (!current || dirty[0] & /*filenameBtnDisabled*/
        1024) {
          button3.disabled = /*filenameBtnDisabled*/
          ctx2[10];
        }
        if (dirty[0] & /*filename, pattern*/
        40) {
          each_value = ensure_array_like(
            /*pattern*/
            ctx2[3]
          );
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context$2(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block$2(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(div3, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
        if (!current || dirty[0] & /*descritionText*/
        1) {
          attr(
            p4,
            "class",
            /*descritionText*/
            ctx2[0]
          );
        }
        const radiogroup_changes = {};
        if (dirty[0] & /*$store*/
        128 | dirty[1] & /*$$scope*/
        1024) {
          radiogroup_changes.$$scope = { dirty, ctx: ctx2 };
        }
        radiogroup.$set(radiogroup_changes);
        if (!current || dirty[0] & /*ulClasses*/
        4096) {
          attr(
            ul1,
            "class",
            /*ulClasses*/
            ctx2[12]
          );
        }
        if (!current || dirty[0] & /*sectionSpace*/
        2) {
          attr(
            div5,
            "class",
            /*sectionSpace*/
            ctx2[1]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(slidetoggle.$$.fragment, local);
        transition_in(if_block1);
        transition_in(radiogroup.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(slidetoggle.$$.fragment, local);
        transition_out(if_block1);
        transition_out(radiogroup.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div5);
        }
        if_block0.d();
        destroy_each(each_blocks_1, detaching);
        destroy_component(slidetoggle);
        if (if_block1) if_block1.d();
        destroy_each(each_blocks, detaching);
        destroy_component(radiogroup);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance$7($$self, $$props, $$invalidate) {
    let ulClasses;
    let subDirectoryAvailable;
    let folderBtnDisabled;
    let filenameBtnDisabled;
    let directoryPlaceholder;
    let $store;
    component_subscribe($$self, configStore, ($$value) => $$invalidate(7, $store = $$value));
    let { bg = "bg-white/30 dark:bg-black/15" } = $$props;
    let { border = "divide-y-[1px] *:border-surface-300-600-token" } = $$props;
    let { padding = "px-4 *:py-4" } = $$props;
    let { margin = "mt-2 *:!m-0" } = $$props;
    let { rounded = "rounded-container-token *:!rounded-none" } = $$props;
    let { descritionText = "text-sm text-surface-400" } = $$props;
    let { sectionSpace = `space-y-4` } = $$props;
    let { sectionTitle = "font-bold" } = $$props;
    let { pattern = [] } = $$props;
    let directory = $store.folderPattern;
    let filename = $store.filenamePattern;
    let fsaDirectory = downloader.getCurrentFsaDirName();
    function updateDirectory() {
      const newDirectory = directory.split("/").map(replaceInvalidChar).filter((path) => !!path).join("/");
      set_store_value(configStore, $store.folderPattern = $$invalidate(4, directory = newDirectory), $store);
    }
    function updateFilename() {
      const newFilename = replaceInvalidChar(filename);
      if (newFilename === "") {
        $$invalidate(5, filename = $store.filenamePattern);
      } else {
        set_store_value(configStore, $store.filenamePattern = $$invalidate(5, filename = newFilename), $store);
      }
    }
    function resetFolder() {
      $$invalidate(4, directory = $store.folderPattern);
    }
    function resetFilename() {
      $$invalidate(5, filename = $store.filenamePattern);
    }
    async function updatefsaDir() {
      $$invalidate(8, fsaDirectory = await downloader.updateDirHandle());
      console.log(fsaDirectory);
    }
    function input_input_handler() {
      directory = this.value;
      $$invalidate(4, directory);
    }
    const click_handler = (p) => $$invalidate(4, directory += " " + p);
    function slidetoggle_checked_binding(value) {
      if ($$self.$$.not_equal($store.useFileSystemAccess, value)) {
        $store.useFileSystemAccess = value;
        configStore.set($store);
      }
    }
    function radioitem0_group_binding(value) {
      if ($$self.$$.not_equal($store.fileSystemFilenameConflictAction, value)) {
        $store.fileSystemFilenameConflictAction = value;
        configStore.set($store);
      }
    }
    function radioitem1_group_binding(value) {
      if ($$self.$$.not_equal($store.fileSystemFilenameConflictAction, value)) {
        $store.fileSystemFilenameConflictAction = value;
        configStore.set($store);
      }
    }
    function radioitem2_group_binding(value) {
      if ($$self.$$.not_equal($store.fileSystemFilenameConflictAction, value)) {
        $store.fileSystemFilenameConflictAction = value;
        configStore.set($store);
      }
    }
    function input_input_handler_1() {
      filename = this.value;
      $$invalidate(5, filename);
    }
    const click_handler_1 = (p) => $$invalidate(5, filename += " " + p);
    function radioitem0_group_binding_1(value) {
      if ($$self.$$.not_equal($store.tagLang, value)) {
        $store.tagLang = value;
        configStore.set($store);
      }
    }
    function radioitem1_group_binding_1(value) {
      if ($$self.$$.not_equal($store.tagLang, value)) {
        $store.tagLang = value;
        configStore.set($store);
      }
    }
    function radioitem2_group_binding_1(value) {
      if ($$self.$$.not_equal($store.tagLang, value)) {
        $store.tagLang = value;
        configStore.set($store);
      }
    }
    function radioitem3_group_binding(value) {
      if ($$self.$$.not_equal($store.tagLang, value)) {
        $store.tagLang = value;
        configStore.set($store);
      }
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(35, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("bg" in $$new_props) $$invalidate(18, bg = $$new_props.bg);
      if ("border" in $$new_props) $$invalidate(19, border = $$new_props.border);
      if ("padding" in $$new_props) $$invalidate(20, padding = $$new_props.padding);
      if ("margin" in $$new_props) $$invalidate(21, margin = $$new_props.margin);
      if ("rounded" in $$new_props) $$invalidate(22, rounded = $$new_props.rounded);
      if ("descritionText" in $$new_props) $$invalidate(0, descritionText = $$new_props.descritionText);
      if ("sectionSpace" in $$new_props) $$invalidate(1, sectionSpace = $$new_props.sectionSpace);
      if ("sectionTitle" in $$new_props) $$invalidate(2, sectionTitle = $$new_props.sectionTitle);
      if ("pattern" in $$new_props) $$invalidate(3, pattern = $$new_props.pattern);
    };
    $$self.$$.update = () => {
      $$invalidate(12, ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ""}`);
      if ($$self.$$.dirty[0] & /*$store*/
      128) {
        $$invalidate(6, subDirectoryAvailable = $store.useFileSystemAccess || env.isSupportSubpath());
      }
      if ($$self.$$.dirty[0] & /*directory, $store*/
      144) {
        $$invalidate(11, folderBtnDisabled = directory === $store.folderPattern);
      }
      if ($$self.$$.dirty[0] & /*filename, $store*/
      160) {
        $$invalidate(10, filenameBtnDisabled = filename === $store.filenamePattern);
      }
      if ($$self.$$.dirty[0] & /*subDirectoryAvailable*/
      64) {
        $$invalidate(9, directoryPlaceholder = subDirectoryAvailable ? t("setting.save_to.placeholder.sub_directory_unused") : env.isViolentmonkey() ? t("setting.save_to.placeholder.vm_not_supported") : t("setting.save_to.placeholder.need_browser_api"));
      }
    };
    $$props = exclude_internal_props($$props);
    return [
      descritionText,
      sectionSpace,
      sectionTitle,
      pattern,
      directory,
      filename,
      subDirectoryAvailable,
      $store,
      fsaDirectory,
      directoryPlaceholder,
      filenameBtnDisabled,
      folderBtnDisabled,
      ulClasses,
      updateDirectory,
      updateFilename,
      resetFolder,
      resetFilename,
      updatefsaDir,
      bg,
      border,
      padding,
      margin,
      rounded,
      input_input_handler,
      click_handler,
      slidetoggle_checked_binding,
      radioitem0_group_binding,
      radioitem1_group_binding,
      radioitem2_group_binding,
      input_input_handler_1,
      click_handler_1,
      radioitem0_group_binding_1,
      radioitem1_group_binding_1,
      radioitem2_group_binding_1,
      radioitem3_group_binding
    ];
  }
  class SaveTo extends SvelteComponent {
    constructor(options) {
      super();
      init(
        this,
        options,
        instance$7,
        create_fragment$7,
        safe_not_equal,
        {
          bg: 18,
          border: 19,
          padding: 20,
          margin: 21,
          rounded: 22,
          descritionText: 0,
          sectionSpace: 1,
          sectionTitle: 2,
          pattern: 3
        },
        null,
        [-1, -1]
      );
    }
  }
  function get_each_context$1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[26] = list[i];
    return child_ctx;
  }
  function get_each_context_1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[26] = list[i];
    return child_ctx;
  }
  function create_default_slot_6(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("Zip");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_5(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("Webm");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_4(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("Mp4");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_3$2(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("Webp");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_2$2(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("Gif");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot_1$2(ctx) {
    let t_1;
    return {
      c() {
        t_1 = text("Png");
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_default_slot$3(ctx) {
    let radioitem0;
    let updating_group;
    let t0;
    let radioitem1;
    let updating_group_1;
    let t1;
    let radioitem2;
    let updating_group_2;
    let t2;
    let radioitem3;
    let updating_group_3;
    let t3;
    let radioitem4;
    let updating_group_4;
    let t4;
    let radioitem5;
    let updating_group_5;
    let current;
    function radioitem0_group_binding(value) {
      ctx[13](value);
    }
    let radioitem0_props = {
      name: "ugoiraFormat",
      class: "text-sm",
      value: UgoiraFormat.ZIP,
      $$slots: { default: [create_default_slot_6] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].ugoiraFormat !== void 0
    ) {
      radioitem0_props.group = /*$store*/
      ctx[7].ugoiraFormat;
    }
    radioitem0 = new RadioItem({ props: radioitem0_props });
    binding_callbacks.push(() => bind(radioitem0, "group", radioitem0_group_binding));
    function radioitem1_group_binding(value) {
      ctx[14](value);
    }
    let radioitem1_props = {
      name: "ugoiraFormat",
      class: "text-sm",
      value: UgoiraFormat.WEBM,
      $$slots: { default: [create_default_slot_5] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].ugoiraFormat !== void 0
    ) {
      radioitem1_props.group = /*$store*/
      ctx[7].ugoiraFormat;
    }
    radioitem1 = new RadioItem({ props: radioitem1_props });
    binding_callbacks.push(() => bind(radioitem1, "group", radioitem1_group_binding));
    function radioitem2_group_binding(value) {
      ctx[15](value);
    }
    let radioitem2_props = {
      disabled: !env.videoFrameSupported(),
      class: "text-sm",
      name: "ugoiraFormat",
      value: UgoiraFormat.MP4,
      $$slots: { default: [create_default_slot_4] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].ugoiraFormat !== void 0
    ) {
      radioitem2_props.group = /*$store*/
      ctx[7].ugoiraFormat;
    }
    radioitem2 = new RadioItem({ props: radioitem2_props });
    binding_callbacks.push(() => bind(radioitem2, "group", radioitem2_group_binding));
    function radioitem3_group_binding(value) {
      ctx[16](value);
    }
    let radioitem3_props = {
      name: "ugoiraFormat",
      class: "text-sm",
      value: UgoiraFormat.WEBP,
      $$slots: { default: [create_default_slot_3$2] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].ugoiraFormat !== void 0
    ) {
      radioitem3_props.group = /*$store*/
      ctx[7].ugoiraFormat;
    }
    radioitem3 = new RadioItem({ props: radioitem3_props });
    binding_callbacks.push(() => bind(radioitem3, "group", radioitem3_group_binding));
    function radioitem4_group_binding(value) {
      ctx[17](value);
    }
    let radioitem4_props = {
      name: "ugoiraFormat",
      class: "text-sm",
      value: UgoiraFormat.GIF,
      $$slots: { default: [create_default_slot_2$2] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].ugoiraFormat !== void 0
    ) {
      radioitem4_props.group = /*$store*/
      ctx[7].ugoiraFormat;
    }
    radioitem4 = new RadioItem({ props: radioitem4_props });
    binding_callbacks.push(() => bind(radioitem4, "group", radioitem4_group_binding));
    function radioitem5_group_binding(value) {
      ctx[18](value);
    }
    let radioitem5_props = {
      name: "ugoiraFormat",
      class: "text-sm",
      value: UgoiraFormat.PNG,
      $$slots: { default: [create_default_slot_1$2] },
      $$scope: { ctx }
    };
    if (
      /*$store*/
      ctx[7].ugoiraFormat !== void 0
    ) {
      radioitem5_props.group = /*$store*/
      ctx[7].ugoiraFormat;
    }
    radioitem5 = new RadioItem({ props: radioitem5_props });
    binding_callbacks.push(() => bind(radioitem5, "group", radioitem5_group_binding));
    return {
      c() {
        create_component(radioitem0.$$.fragment);
        t0 = space();
        create_component(radioitem1.$$.fragment);
        t1 = space();
        create_component(radioitem2.$$.fragment);
        t2 = space();
        create_component(radioitem3.$$.fragment);
        t3 = space();
        create_component(radioitem4.$$.fragment);
        t4 = space();
        create_component(radioitem5.$$.fragment);
      },
      m(target, anchor) {
        mount_component(radioitem0, target, anchor);
        insert(target, t0, anchor);
        mount_component(radioitem1, target, anchor);
        insert(target, t1, anchor);
        mount_component(radioitem2, target, anchor);
        insert(target, t2, anchor);
        mount_component(radioitem3, target, anchor);
        insert(target, t3, anchor);
        mount_component(radioitem4, target, anchor);
        insert(target, t4, anchor);
        mount_component(radioitem5, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const radioitem0_changes = {};
        if (dirty[1] & /*$$scope*/
        1) {
          radioitem0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group && dirty[0] & /*$store*/
        128) {
          updating_group = true;
          radioitem0_changes.group = /*$store*/
          ctx2[7].ugoiraFormat;
          add_flush_callback(() => updating_group = false);
        }
        radioitem0.$set(radioitem0_changes);
        const radioitem1_changes = {};
        if (dirty[1] & /*$$scope*/
        1) {
          radioitem1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_1 && dirty[0] & /*$store*/
        128) {
          updating_group_1 = true;
          radioitem1_changes.group = /*$store*/
          ctx2[7].ugoiraFormat;
          add_flush_callback(() => updating_group_1 = false);
        }
        radioitem1.$set(radioitem1_changes);
        const radioitem2_changes = {};
        if (dirty[1] & /*$$scope*/
        1) {
          radioitem2_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_2 && dirty[0] & /*$store*/
        128) {
          updating_group_2 = true;
          radioitem2_changes.group = /*$store*/
          ctx2[7].ugoiraFormat;
          add_flush_callback(() => updating_group_2 = false);
        }
        radioitem2.$set(radioitem2_changes);
        const radioitem3_changes = {};
        if (dirty[1] & /*$$scope*/
        1) {
          radioitem3_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_3 && dirty[0] & /*$store*/
        128) {
          updating_group_3 = true;
          radioitem3_changes.group = /*$store*/
          ctx2[7].ugoiraFormat;
          add_flush_callback(() => updating_group_3 = false);
        }
        radioitem3.$set(radioitem3_changes);
        const radioitem4_changes = {};
        if (dirty[1] & /*$$scope*/
        1) {
          radioitem4_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_4 && dirty[0] & /*$store*/
        128) {
          updating_group_4 = true;
          radioitem4_changes.group = /*$store*/
          ctx2[7].ugoiraFormat;
          add_flush_callback(() => updating_group_4 = false);
        }
        radioitem4.$set(radioitem4_changes);
        const radioitem5_changes = {};
        if (dirty[1] & /*$$scope*/
        1) {
          radioitem5_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group_5 && dirty[0] & /*$store*/
        128) {
          updating_group_5 = true;
          radioitem5_changes.group = /*$store*/
          ctx2[7].ugoiraFormat;
          add_flush_callback(() => updating_group_5 = false);
        }
        radioitem5.$set(radioitem5_changes);
      },
      i(local) {
        if (current) return;
        transition_in(radioitem0.$$.fragment, local);
        transition_in(radioitem1.$$.fragment, local);
        transition_in(radioitem2.$$.fragment, local);
        transition_in(radioitem3.$$.fragment, local);
        transition_in(radioitem4.$$.fragment, local);
        transition_in(radioitem5.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(radioitem0.$$.fragment, local);
        transition_out(radioitem1.$$.fragment, local);
        transition_out(radioitem2.$$.fragment, local);
        transition_out(radioitem3.$$.fragment, local);
        transition_out(radioitem4.$$.fragment, local);
        transition_out(radioitem5.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(t0);
          detach(t1);
          detach(t2);
          detach(t3);
          detach(t4);
        }
        destroy_component(radioitem0, detaching);
        destroy_component(radioitem1, detaching);
        destroy_component(radioitem2, detaching);
        destroy_component(radioitem3, detaching);
        destroy_component(radioitem4, detaching);
        destroy_component(radioitem5, detaching);
      }
    };
  }
  function create_each_block_1(ctx) {
    let option;
    let t_1_value = (
      /*quality*/
      ctx[26] + 1 + ""
    );
    let t_1;
    return {
      c() {
        option = element("option");
        t_1 = text(t_1_value);
        option.__value = /*quality*/
        ctx[26] + 1;
        set_input_value(option, option.__value);
      },
      m(target, anchor) {
        insert(target, option, anchor);
        append(option, t_1);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(option);
        }
      }
    };
  }
  function create_each_block$1(ctx) {
    let option;
    let t_1_value = (
      /*quality*/
      ctx[26] + ""
    );
    let t_1;
    return {
      c() {
        option = element("option");
        t_1 = text(t_1_value);
        option.__value = /*quality*/
        ctx[26];
        set_input_value(option, option.__value);
      },
      m(target, anchor) {
        insert(target, option, anchor);
        append(option, t_1);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(option);
        }
      }
    };
  }
  function create_fragment$6(ctx) {
    let div5;
    let section0;
    let p0;
    let t0_value = t("setting.ugoira.label.format") + "";
    let t0;
    let t1;
    let ul0;
    let li0;
    let p1;
    let t3;
    let radiogroup;
    let t4;
    let section1;
    let p2;
    let t5_value = t("setting.ugoira.label.quality") + "";
    let t5;
    let t6;
    let ul2;
    let li1;
    let div0;
    let p3;
    let t8;
    let p4;
    let t9_value = t("setting.ugoira.options.gif_tips") + "";
    let t9;
    let t10;
    let select0;
    let select0_class_value;
    let t11;
    let li2;
    let div1;
    let p5;
    let t13;
    let p6;
    let t14_value = t("setting.ugoira.options.webm_tips") + "";
    let t14;
    let t15;
    let input0;
    let input0_class_value;
    let t16;
    let li6;
    let p7;
    let t18;
    let ul1;
    let li3;
    let p8;
    let t20;
    let slidetoggle;
    let updating_checked;
    let t21;
    let li4;
    let div2;
    let p9;
    let t23;
    let p10;
    let t24_value = t("setting.ugoira.options.webp_quality_tips") + "";
    let t24;
    let t25;
    let input1;
    let input1_class_value;
    let t26;
    let li5;
    let div3;
    let p11;
    let t28;
    let p12;
    let t29_value = t("setting.ugoira.options.webp_method_tips") + "";
    let t29;
    let t30;
    let select1;
    let select1_class_value;
    let ul1_class_value;
    let t31;
    let li7;
    let div4;
    let p13;
    let t33;
    let p14;
    let t34_value = t("setting.ugoira.options.png_tips") + "";
    let t34;
    let t35;
    let input2;
    let input2_class_value;
    let current;
    let mounted;
    let dispose;
    radiogroup = new RadioGroup({
      props: {
        class: "shrink-0",
        $$slots: { default: [create_default_slot$3] },
        $$scope: { ctx }
      }
    });
    let each_value_1 = ensure_array_like(Array.from({ length: 20 }, func));
    let each_blocks_1 = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    }
    function slidetoggle_checked_binding(value) {
      ctx[21](value);
    }
    let slidetoggle_props = { name: "fsa-enable", size: "sm" };
    if (
      /*$store*/
      ctx[7].losslessWebp !== void 0
    ) {
      slidetoggle_props.checked = /*$store*/
      ctx[7].losslessWebp;
    }
    slidetoggle = new SlideToggle({ props: slidetoggle_props });
    binding_callbacks.push(() => bind(slidetoggle, "checked", slidetoggle_checked_binding));
    let each_value = ensure_array_like(Array.from({ length: 7 }, func_1));
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    }
    return {
      c() {
        div5 = element("div");
        section0 = element("section");
        p0 = element("p");
        t0 = text(t0_value);
        t1 = space();
        ul0 = element("ul");
        li0 = element("li");
        p1 = element("p");
        p1.textContent = `${t("setting.ugoira.options.select_format")}`;
        t3 = space();
        create_component(radiogroup.$$.fragment);
        t4 = space();
        section1 = element("section");
        p2 = element("p");
        t5 = text(t5_value);
        t6 = space();
        ul2 = element("ul");
        li1 = element("li");
        div0 = element("div");
        p3 = element("p");
        p3.textContent = "Gif";
        t8 = space();
        p4 = element("p");
        t9 = text(t9_value);
        t10 = space();
        select0 = element("select");
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].c();
        }
        t11 = space();
        li2 = element("li");
        div1 = element("div");
        p5 = element("p");
        p5.textContent = "Webm";
        t13 = space();
        p6 = element("p");
        t14 = text(t14_value);
        t15 = space();
        input0 = element("input");
        t16 = space();
        li6 = element("li");
        p7 = element("p");
        p7.textContent = "Webp";
        t18 = space();
        ul1 = element("ul");
        li3 = element("li");
        p8 = element("p");
        p8.textContent = `${t("setting.ugoira.options.webp_lossy")}`;
        t20 = space();
        create_component(slidetoggle.$$.fragment);
        t21 = space();
        li4 = element("li");
        div2 = element("div");
        p9 = element("p");
        p9.textContent = `${t("setting.ugoira.options.webp_quality")}`;
        t23 = space();
        p10 = element("p");
        t24 = text(t24_value);
        t25 = space();
        input1 = element("input");
        t26 = space();
        li5 = element("li");
        div3 = element("div");
        p11 = element("p");
        p11.textContent = `${t("setting.ugoira.options.webp_method")}`;
        t28 = space();
        p12 = element("p");
        t29 = text(t29_value);
        t30 = space();
        select1 = element("select");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t31 = space();
        li7 = element("li");
        div4 = element("div");
        p13 = element("p");
        p13.textContent = "Png";
        t33 = space();
        p14 = element("p");
        t34 = text(t34_value);
        t35 = space();
        input2 = element("input");
        attr(
          p0,
          "class",
          /*sectionTitle*/
          ctx[4]
        );
        attr(p1, "class", "flex-auto");
        attr(
          ul0,
          "class",
          /*ulClasses*/
          ctx[6]
        );
        attr(
          p2,
          "class",
          /*sectionTitle*/
          ctx[4]
        );
        attr(
          p4,
          "class",
          /*descritionText*/
          ctx[2]
        );
        attr(div0, "class", "flex-auto");
        attr(select0, "class", select0_class_value = "select " + /*inputClasses*/
        ctx[5]);
        if (
          /*$store*/
          ctx[7].gifQuality === void 0
        ) add_render_callback(() => (
          /*select0_change_handler*/
          ctx[19].call(select0)
        ));
        attr(
          p6,
          "class",
          /*descritionText*/
          ctx[2]
        );
        attr(div1, "class", "flex-auto");
        attr(input0, "type", "number");
        attr(input0, "class", input0_class_value = "input " + /*inputClasses*/
        ctx[5]);
        attr(input0, "min", "0");
        attr(input0, "max", "99");
        attr(input0, "step", "1");
        attr(p8, "class", "flex-auto");
        attr(li3, "class", "items-center");
        attr(
          p10,
          "class",
          /*descritionText*/
          ctx[2]
        );
        attr(div2, "class", "flex-auto");
        attr(input1, "type", "number");
        attr(input1, "class", input1_class_value = "input " + /*inputClasses*/
        ctx[5]);
        attr(input1, "min", "0");
        attr(input1, "max", "100");
        attr(input1, "step", "1");
        attr(li4, "class", "items-center");
        attr(
          p12,
          "class",
          /*descritionText*/
          ctx[2]
        );
        attr(div3, "class", "flex-auto");
        attr(select1, "class", select1_class_value = "select " + /*inputClasses*/
        ctx[5]);
        if (
          /*$store*/
          ctx[7].webpMehtod === void 0
        ) add_render_callback(() => (
          /*select1_change_handler*/
          ctx[23].call(select1)
        ));
        attr(li5, "class", "items-center");
        attr(ul1, "class", ul1_class_value = "list " + /*border*/
        ctx[0] + " " + /*rounded*/
        ctx[1] + " [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4");
        attr(li6, "class", "flex-col !items-stretch");
        attr(
          p14,
          "class",
          /*descritionText*/
          ctx[2]
        );
        attr(div4, "class", "flex-auto");
        attr(input2, "type", "number");
        attr(input2, "class", input2_class_value = "input " + /*inputClasses*/
        ctx[5]);
        attr(input2, "min", "0");
        attr(input2, "max", "256");
        attr(input2, "step", "1");
        attr(
          ul2,
          "class",
          /*ulClasses*/
          ctx[6]
        );
        attr(
          div5,
          "class",
          /*sectionSpace*/
          ctx[3]
        );
      },
      m(target, anchor) {
        insert(target, div5, anchor);
        append(div5, section0);
        append(section0, p0);
        append(p0, t0);
        append(section0, t1);
        append(section0, ul0);
        append(ul0, li0);
        append(li0, p1);
        append(li0, t3);
        mount_component(radiogroup, li0, null);
        append(div5, t4);
        append(div5, section1);
        append(section1, p2);
        append(p2, t5);
        append(section1, t6);
        append(section1, ul2);
        append(ul2, li1);
        append(li1, div0);
        append(div0, p3);
        append(div0, t8);
        append(div0, p4);
        append(p4, t9);
        append(li1, t10);
        append(li1, select0);
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          if (each_blocks_1[i]) {
            each_blocks_1[i].m(select0, null);
          }
        }
        select_option(
          select0,
          /*$store*/
          ctx[7].gifQuality,
          true
        );
        append(ul2, t11);
        append(ul2, li2);
        append(li2, div1);
        append(div1, p5);
        append(div1, t13);
        append(div1, p6);
        append(p6, t14);
        append(li2, t15);
        append(li2, input0);
        set_input_value(
          input0,
          /*$store*/
          ctx[7].webmQuality
        );
        append(ul2, t16);
        append(ul2, li6);
        append(li6, p7);
        append(li6, t18);
        append(li6, ul1);
        append(ul1, li3);
        append(li3, p8);
        append(li3, t20);
        mount_component(slidetoggle, li3, null);
        append(ul1, t21);
        append(ul1, li4);
        append(li4, div2);
        append(div2, p9);
        append(div2, t23);
        append(div2, p10);
        append(p10, t24);
        append(li4, t25);
        append(li4, input1);
        set_input_value(
          input1,
          /*$store*/
          ctx[7].webpQuality
        );
        append(ul1, t26);
        append(ul1, li5);
        append(li5, div3);
        append(div3, p11);
        append(div3, t28);
        append(div3, p12);
        append(p12, t29);
        append(li5, t30);
        append(li5, select1);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(select1, null);
          }
        }
        select_option(
          select1,
          /*$store*/
          ctx[7].webpMehtod,
          true
        );
        append(ul2, t31);
        append(ul2, li7);
        append(li7, div4);
        append(div4, p13);
        append(div4, t33);
        append(div4, p14);
        append(p14, t34);
        append(li7, t35);
        append(li7, input2);
        set_input_value(
          input2,
          /*$store*/
          ctx[7].pngColor
        );
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              select0,
              "change",
              /*select0_change_handler*/
              ctx[19]
            ),
            listen(
              input0,
              "input",
              /*input0_input_handler*/
              ctx[20]
            ),
            listen(
              input1,
              "input",
              /*input1_input_handler*/
              ctx[22]
            ),
            listen(
              select1,
              "change",
              /*select1_change_handler*/
              ctx[23]
            ),
            listen(
              input2,
              "input",
              /*input2_input_handler*/
              ctx[24]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (!current || dirty[0] & /*sectionTitle*/
        16) {
          attr(
            p0,
            "class",
            /*sectionTitle*/
            ctx2[4]
          );
        }
        const radiogroup_changes = {};
        if (dirty[0] & /*$store*/
        128 | dirty[1] & /*$$scope*/
        1) {
          radiogroup_changes.$$scope = { dirty, ctx: ctx2 };
        }
        radiogroup.$set(radiogroup_changes);
        if (!current || dirty[0] & /*ulClasses*/
        64) {
          attr(
            ul0,
            "class",
            /*ulClasses*/
            ctx2[6]
          );
        }
        if (!current || dirty[0] & /*sectionTitle*/
        16) {
          attr(
            p2,
            "class",
            /*sectionTitle*/
            ctx2[4]
          );
        }
        if (!current || dirty[0] & /*descritionText*/
        4) {
          attr(
            p4,
            "class",
            /*descritionText*/
            ctx2[2]
          );
        }
        if (dirty & /*Array*/
        0) {
          each_value_1 = ensure_array_like(Array.from({ length: 20 }, func));
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_1(ctx2, each_value_1, i);
            if (each_blocks_1[i]) {
              each_blocks_1[i].p(child_ctx, dirty);
            } else {
              each_blocks_1[i] = create_each_block_1(child_ctx);
              each_blocks_1[i].c();
              each_blocks_1[i].m(select0, null);
            }
          }
          for (; i < each_blocks_1.length; i += 1) {
            each_blocks_1[i].d(1);
          }
          each_blocks_1.length = each_value_1.length;
        }
        if (!current || dirty[0] & /*inputClasses*/
        32 && select0_class_value !== (select0_class_value = "select " + /*inputClasses*/
        ctx2[5])) {
          attr(select0, "class", select0_class_value);
        }
        if (dirty[0] & /*$store*/
        128) {
          select_option(
            select0,
            /*$store*/
            ctx2[7].gifQuality
          );
        }
        if (!current || dirty[0] & /*descritionText*/
        4) {
          attr(
            p6,
            "class",
            /*descritionText*/
            ctx2[2]
          );
        }
        if (!current || dirty[0] & /*inputClasses*/
        32 && input0_class_value !== (input0_class_value = "input " + /*inputClasses*/
        ctx2[5])) {
          attr(input0, "class", input0_class_value);
        }
        if (dirty[0] & /*$store*/
        128 && to_number(input0.value) !== /*$store*/
        ctx2[7].webmQuality) {
          set_input_value(
            input0,
            /*$store*/
            ctx2[7].webmQuality
          );
        }
        const slidetoggle_changes = {};
        if (!updating_checked && dirty[0] & /*$store*/
        128) {
          updating_checked = true;
          slidetoggle_changes.checked = /*$store*/
          ctx2[7].losslessWebp;
          add_flush_callback(() => updating_checked = false);
        }
        slidetoggle.$set(slidetoggle_changes);
        if (!current || dirty[0] & /*descritionText*/
        4) {
          attr(
            p10,
            "class",
            /*descritionText*/
            ctx2[2]
          );
        }
        if (!current || dirty[0] & /*inputClasses*/
        32 && input1_class_value !== (input1_class_value = "input " + /*inputClasses*/
        ctx2[5])) {
          attr(input1, "class", input1_class_value);
        }
        if (dirty[0] & /*$store*/
        128 && to_number(input1.value) !== /*$store*/
        ctx2[7].webpQuality) {
          set_input_value(
            input1,
            /*$store*/
            ctx2[7].webpQuality
          );
        }
        if (!current || dirty[0] & /*descritionText*/
        4) {
          attr(
            p12,
            "class",
            /*descritionText*/
            ctx2[2]
          );
        }
        if (dirty & /*Array*/
        0) {
          each_value = ensure_array_like(Array.from({ length: 7 }, func_1));
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context$1(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block$1(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(select1, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
        if (!current || dirty[0] & /*inputClasses*/
        32 && select1_class_value !== (select1_class_value = "select " + /*inputClasses*/
        ctx2[5])) {
          attr(select1, "class", select1_class_value);
        }
        if (dirty[0] & /*$store*/
        128) {
          select_option(
            select1,
            /*$store*/
            ctx2[7].webpMehtod
          );
        }
        if (!current || dirty[0] & /*border, rounded*/
        3 && ul1_class_value !== (ul1_class_value = "list " + /*border*/
        ctx2[0] + " " + /*rounded*/
        ctx2[1] + " [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4")) {
          attr(ul1, "class", ul1_class_value);
        }
        if (!current || dirty[0] & /*descritionText*/
        4) {
          attr(
            p14,
            "class",
            /*descritionText*/
            ctx2[2]
          );
        }
        if (!current || dirty[0] & /*inputClasses*/
        32 && input2_class_value !== (input2_class_value = "input " + /*inputClasses*/
        ctx2[5])) {
          attr(input2, "class", input2_class_value);
        }
        if (dirty[0] & /*$store*/
        128 && to_number(input2.value) !== /*$store*/
        ctx2[7].pngColor) {
          set_input_value(
            input2,
            /*$store*/
            ctx2[7].pngColor
          );
        }
        if (!current || dirty[0] & /*ulClasses*/
        64) {
          attr(
            ul2,
            "class",
            /*ulClasses*/
            ctx2[6]
          );
        }
        if (!current || dirty[0] & /*sectionSpace*/
        8) {
          attr(
            div5,
            "class",
            /*sectionSpace*/
            ctx2[3]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(radiogroup.$$.fragment, local);
        transition_in(slidetoggle.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(radiogroup.$$.fragment, local);
        transition_out(slidetoggle.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div5);
        }
        destroy_component(radiogroup);
        destroy_each(each_blocks_1, detaching);
        destroy_component(slidetoggle);
        destroy_each(each_blocks, detaching);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  const func = (_, idx) => idx;
  const func_1 = (_, idx) => idx;
  function instance$6($$self, $$props, $$invalidate) {
    let ulClasses;
    let inputClasses;
    let $store;
    component_subscribe($$self, configStore, ($$value) => $$invalidate(7, $store = $$value));
    let { bg = "bg-white/30 dark:bg-black/15" } = $$props;
    let { border = "divide-y-[1px] *:border-surface-300-600-token" } = $$props;
    let { padding = "px-4 *:py-4" } = $$props;
    let { margin = "mt-2 *:!m-0" } = $$props;
    let { rounded = "rounded-container-token *:!rounded-none" } = $$props;
    let { descritionText = "text-sm text-surface-400" } = $$props;
    let { inputRounded = "rounded-full" } = $$props;
    let { inputWidth = "w-32" } = $$props;
    let { sectionSpace = `space-y-4` } = $$props;
    let { sectionTitle = "font-bold" } = $$props;
    function radioitem0_group_binding(value) {
      if ($$self.$$.not_equal($store.ugoiraFormat, value)) {
        $store.ugoiraFormat = value;
        configStore.set($store);
      }
    }
    function radioitem1_group_binding(value) {
      if ($$self.$$.not_equal($store.ugoiraFormat, value)) {
        $store.ugoiraFormat = value;
        configStore.set($store);
      }
    }
    function radioitem2_group_binding(value) {
      if ($$self.$$.not_equal($store.ugoiraFormat, value)) {
        $store.ugoiraFormat = value;
        configStore.set($store);
      }
    }
    function radioitem3_group_binding(value) {
      if ($$self.$$.not_equal($store.ugoiraFormat, value)) {
        $store.ugoiraFormat = value;
        configStore.set($store);
      }
    }
    function radioitem4_group_binding(value) {
      if ($$self.$$.not_equal($store.ugoiraFormat, value)) {
        $store.ugoiraFormat = value;
        configStore.set($store);
      }
    }
    function radioitem5_group_binding(value) {
      if ($$self.$$.not_equal($store.ugoiraFormat, value)) {
        $store.ugoiraFormat = value;
        configStore.set($store);
      }
    }
    function select0_change_handler() {
      $store.gifQuality = select_value(this);
      configStore.set($store);
    }
    function input0_input_handler() {
      $store.webmQuality = to_number(this.value);
      configStore.set($store);
    }
    function slidetoggle_checked_binding(value) {
      if ($$self.$$.not_equal($store.losslessWebp, value)) {
        $store.losslessWebp = value;
        configStore.set($store);
      }
    }
    function input1_input_handler() {
      $store.webpQuality = to_number(this.value);
      configStore.set($store);
    }
    function select1_change_handler() {
      $store.webpMehtod = select_value(this);
      configStore.set($store);
    }
    function input2_input_handler() {
      $store.pngColor = to_number(this.value);
      configStore.set($store);
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(25, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("bg" in $$new_props) $$invalidate(8, bg = $$new_props.bg);
      if ("border" in $$new_props) $$invalidate(0, border = $$new_props.border);
      if ("padding" in $$new_props) $$invalidate(9, padding = $$new_props.padding);
      if ("margin" in $$new_props) $$invalidate(10, margin = $$new_props.margin);
      if ("rounded" in $$new_props) $$invalidate(1, rounded = $$new_props.rounded);
      if ("descritionText" in $$new_props) $$invalidate(2, descritionText = $$new_props.descritionText);
      if ("inputRounded" in $$new_props) $$invalidate(11, inputRounded = $$new_props.inputRounded);
      if ("inputWidth" in $$new_props) $$invalidate(12, inputWidth = $$new_props.inputWidth);
      if ("sectionSpace" in $$new_props) $$invalidate(3, sectionSpace = $$new_props.sectionSpace);
      if ("sectionTitle" in $$new_props) $$invalidate(4, sectionTitle = $$new_props.sectionTitle);
    };
    $$self.$$.update = () => {
      $$invalidate(6, ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ""}`);
      if ($$self.$$.dirty[0] & /*inputWidth, inputRounded*/
      6144) {
        $$invalidate(5, inputClasses = `${inputWidth} ${inputRounded} shrink-0`);
      }
    };
    $$props = exclude_internal_props($$props);
    return [
      border,
      rounded,
      descritionText,
      sectionSpace,
      sectionTitle,
      inputClasses,
      ulClasses,
      $store,
      bg,
      padding,
      margin,
      inputRounded,
      inputWidth,
      radioitem0_group_binding,
      radioitem1_group_binding,
      radioitem2_group_binding,
      radioitem3_group_binding,
      radioitem4_group_binding,
      radioitem5_group_binding,
      select0_change_handler,
      input0_input_handler,
      slidetoggle_checked_binding,
      input1_input_handler,
      select1_change_handler,
      input2_input_handler
    ];
  }
  class UgoiraConvert extends SvelteComponent {
    constructor(options) {
      super();
      init(
        this,
        options,
        instance$6,
        create_fragment$6,
        safe_not_equal,
        {
          bg: 8,
          border: 0,
          padding: 9,
          margin: 10,
          rounded: 1,
          descritionText: 2,
          inputRounded: 11,
          inputWidth: 12,
          sectionSpace: 3,
          sectionTitle: 4
        },
        null,
        [-1, -1]
      );
    }
  }
  function create_default_slot$2(ctx) {
    let t_1_value = t("setting.history.button.import") + "";
    let t_1;
    return {
      c() {
        t_1 = text(t_1_value);
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_fragment$5(ctx) {
    let div;
    let section0;
    let p0;
    let t0_value = t("setting.history.label.export") + "";
    let t0;
    let t1;
    let ul0;
    let li0;
    let p1;
    let t3;
    let button0;
    let t5;
    let li1;
    let p2;
    let t7;
    let button1;
    let t9;
    let section1;
    let p3;
    let t10_value = t("setting.history.label.import") + "";
    let t10;
    let t11;
    let ul1;
    let li2;
    let p4;
    let t13;
    let filebutton;
    let t14;
    let section2;
    let p5;
    let t15_value = t("setting.history.label.clear") + "";
    let t15;
    let t16;
    let ul2;
    let li3;
    let p6;
    let t18;
    let button2;
    let current;
    let mounted;
    let dispose;
    filebutton = new FileButton({
      props: {
        name: "import-file",
        accept: ".json",
        $$slots: { default: [create_default_slot$2] },
        $$scope: { ctx }
      }
    });
    filebutton.$on(
      "change",
      /*importJSON*/
      ctx[3]
    );
    return {
      c() {
        div = element("div");
        section0 = element("section");
        p0 = element("p");
        t0 = text(t0_value);
        t1 = space();
        ul0 = element("ul");
        li0 = element("li");
        p1 = element("p");
        p1.textContent = `${t("setting.history.options.export_as_json")}`;
        t3 = space();
        button0 = element("button");
        button0.textContent = `${t("setting.history.button.export")}`;
        t5 = space();
        li1 = element("li");
        p2 = element("p");
        p2.textContent = `${t("setting.history.options.export_as_csv")}`;
        t7 = space();
        button1 = element("button");
        button1.textContent = `${t("setting.history.button.export")}`;
        t9 = space();
        section1 = element("section");
        p3 = element("p");
        t10 = text(t10_value);
        t11 = space();
        ul1 = element("ul");
        li2 = element("li");
        p4 = element("p");
        p4.textContent = `${t("setting.history.options.import_json")}`;
        t13 = space();
        create_component(filebutton.$$.fragment);
        t14 = space();
        section2 = element("section");
        p5 = element("p");
        t15 = text(t15_value);
        t16 = space();
        ul2 = element("ul");
        li3 = element("li");
        p6 = element("p");
        p6.textContent = `${t("setting.history.options.clear_history")}`;
        t18 = space();
        button2 = element("button");
        button2.textContent = `${t("setting.history.button.clear")}`;
        attr(
          p0,
          "class",
          /*sectionTitle*/
          ctx[1]
        );
        attr(p1, "class", "flex-auto");
        attr(button0, "class", "btn variant-filled");
        attr(p2, "class", "flex-auto");
        attr(button1, "class", "btn variant-filled");
        attr(
          ul0,
          "class",
          /*ulClasses*/
          ctx[2]
        );
        attr(
          p3,
          "class",
          /*sectionTitle*/
          ctx[1]
        );
        attr(p4, "class", "flex-auto");
        attr(
          ul1,
          "class",
          /*ulClasses*/
          ctx[2]
        );
        attr(
          p5,
          "class",
          /*sectionTitle*/
          ctx[1]
        );
        attr(p6, "class", "flex-auto");
        attr(button2, "class", "btn variant-filled");
        attr(
          ul2,
          "class",
          /*ulClasses*/
          ctx[2]
        );
        attr(
          div,
          "class",
          /*sectionSpace*/
          ctx[0]
        );
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, section0);
        append(section0, p0);
        append(p0, t0);
        append(section0, t1);
        append(section0, ul0);
        append(ul0, li0);
        append(li0, p1);
        append(li0, t3);
        append(li0, button0);
        append(ul0, t5);
        append(ul0, li1);
        append(li1, p2);
        append(li1, t7);
        append(li1, button1);
        append(div, t9);
        append(div, section1);
        append(section1, p3);
        append(p3, t10);
        append(section1, t11);
        append(section1, ul1);
        append(ul1, li2);
        append(li2, p4);
        append(li2, t13);
        mount_component(filebutton, li2, null);
        append(div, t14);
        append(div, section2);
        append(section2, p5);
        append(p5, t15);
        append(section2, t16);
        append(section2, ul2);
        append(ul2, li3);
        append(li3, p6);
        append(li3, t18);
        append(li3, button2);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              button0,
              "click",
              /*exportAsJSON*/
              ctx[4]
            ),
            listen(
              button1,
              "click",
              /*exportAsCSV*/
              ctx[5]
            ),
            listen(
              button2,
              "click",
              /*clearDb*/
              ctx[6]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (!current || dirty & /*sectionTitle*/
        2) {
          attr(
            p0,
            "class",
            /*sectionTitle*/
            ctx2[1]
          );
        }
        if (!current || dirty & /*ulClasses*/
        4) {
          attr(
            ul0,
            "class",
            /*ulClasses*/
            ctx2[2]
          );
        }
        if (!current || dirty & /*sectionTitle*/
        2) {
          attr(
            p3,
            "class",
            /*sectionTitle*/
            ctx2[1]
          );
        }
        const filebutton_changes = {};
        if (dirty & /*$$scope*/
        8192) {
          filebutton_changes.$$scope = { dirty, ctx: ctx2 };
        }
        filebutton.$set(filebutton_changes);
        if (!current || dirty & /*ulClasses*/
        4) {
          attr(
            ul1,
            "class",
            /*ulClasses*/
            ctx2[2]
          );
        }
        if (!current || dirty & /*sectionTitle*/
        2) {
          attr(
            p5,
            "class",
            /*sectionTitle*/
            ctx2[1]
          );
        }
        if (!current || dirty & /*ulClasses*/
        4) {
          attr(
            ul2,
            "class",
            /*ulClasses*/
            ctx2[2]
          );
        }
        if (!current || dirty & /*sectionSpace*/
        1) {
          attr(
            div,
            "class",
            /*sectionSpace*/
            ctx2[0]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(filebutton.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(filebutton.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_component(filebutton);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function readHistoryFile(type, file) {
    return new Promise((resolve) => {
      if (file.type !== type) throw new Error("Invalid file");
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (readEvt) => {
        var _a;
        const text2 = (_a = readEvt.target) == null ? void 0 : _a.result;
        if (typeof text2 !== "string") throw new Error("Invalid file");
        const history = JSON.parse(text2);
        if (!(history instanceof Array)) throw new Error("Invalid file");
        resolve(history);
      };
    });
  }
  function instance$5($$self, $$props, $$invalidate) {
    let ulClasses;
    let { bg = "bg-white/30 dark:bg-black/15" } = $$props;
    let { border = "divide-y-[1px] *:border-surface-300-600-token" } = $$props;
    let { padding = "px-4 *:py-4" } = $$props;
    let { margin = "mt-2 *:!m-0" } = $$props;
    let { rounded = "rounded-container-token *:!rounded-none" } = $$props;
    let { sectionSpace = `space-y-4` } = $$props;
    let { sectionTitle = "font-bold" } = $$props;
    function importJSON(evt) {
      var _a;
      const file = (_a = evt.currentTarget.files) == null ? void 0 : _a[0];
      if (!file) return;
      readHistoryFile("application/json", file).then((data2) => historyDb.bulkAdd(data2)).then(() => location.reload()).catch((err) => alert(err == null ? void 0 : err.message));
    }
    function exportAsJSON() {
      historyDb.getAll().then((datas) => {
        const str = JSON.stringify(datas);
        const dlEle = document.createElement("a");
        dlEle.href = URL.createObjectURL(new Blob([str], { type: "application/json" }));
        dlEle.download = "Pixiv Downloader " + (/* @__PURE__ */ new Date()).toLocaleString() + ".json";
        dlEle.click();
        URL.revokeObjectURL(dlEle.href);
      });
    }
    function exportAsCSV() {
      historyDb.getAll().then((datas) => {
        const csvData = datas.map((historyData) => {
          const { pid, userId = "", user = "", title = "", tags = "" } = historyData;
          return [String(pid), String(userId), user, title, tags ? tags.join(",") : tags];
        });
        csvData.unshift(["id", "userId", "user", "title", "tags"]);
        const csv = generateCsv(csvData);
        const dlEle = document.createElement("a");
        dlEle.href = URL.createObjectURL(csv);
        dlEle.download = "Pixiv Downloader " + (/* @__PURE__ */ new Date()).toLocaleString() + ".csv";
        dlEle.click();
        URL.revokeObjectURL(dlEle.href);
      });
    }
    function clearDb() {
      const isConfirm = confirm(t("text.confirm_clear_history"));
      if (!isConfirm) return;
      historyDb.clear().then(() => location.reload());
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("bg" in $$new_props) $$invalidate(7, bg = $$new_props.bg);
      if ("border" in $$new_props) $$invalidate(8, border = $$new_props.border);
      if ("padding" in $$new_props) $$invalidate(9, padding = $$new_props.padding);
      if ("margin" in $$new_props) $$invalidate(10, margin = $$new_props.margin);
      if ("rounded" in $$new_props) $$invalidate(11, rounded = $$new_props.rounded);
      if ("sectionSpace" in $$new_props) $$invalidate(0, sectionSpace = $$new_props.sectionSpace);
      if ("sectionTitle" in $$new_props) $$invalidate(1, sectionTitle = $$new_props.sectionTitle);
    };
    $$self.$$.update = () => {
      $$invalidate(2, ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ""}`);
    };
    $$props = exclude_internal_props($$props);
    return [
      sectionSpace,
      sectionTitle,
      ulClasses,
      importJSON,
      exportAsJSON,
      exportAsCSV,
      clearDb,
      bg,
      border,
      padding,
      margin,
      rounded
    ];
  }
  class DownloadHistory extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$5, create_fragment$5, safe_not_equal, {
        bg: 7,
        border: 8,
        padding: 9,
        margin: 10,
        rounded: 11,
        sectionSpace: 0,
        sectionTitle: 1
      });
    }
  }
  function create_default_slot_3$1(ctx) {
    let div1;
    let p;
    let t1;
    let div0;
    let t2;
    let t3;
    let t4;
    return {
      c() {
        div1 = element("div");
        p = element("p");
        p.textContent = `${t("setting.button_position.options.horizon_position")}`;
        t1 = space();
        div0 = element("div");
        t2 = text(
          /*btnLeft*/
          ctx[3]
        );
        t3 = text(" / ");
        t4 = text(max);
        attr(div0, "class", "text-xs");
        attr(div1, "class", "flex justify-between items-center");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, p);
        append(div1, t1);
        append(div1, div0);
        append(div0, t2);
        append(div0, t3);
        append(div0, t4);
      },
      p(ctx2, dirty) {
        if (dirty & /*btnLeft*/
        8) set_data(
          t2,
          /*btnLeft*/
          ctx2[3]
        );
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
      }
    };
  }
  function create_default_slot_2$1(ctx) {
    let div1;
    let p;
    let t1;
    let div0;
    let t2;
    let t3;
    let t4;
    return {
      c() {
        div1 = element("div");
        p = element("p");
        p.textContent = `${t("setting.button_position.options.vertical_position")}`;
        t1 = space();
        div0 = element("div");
        t2 = text(
          /*btnTop*/
          ctx[4]
        );
        t3 = text(" / ");
        t4 = text(max);
        attr(div0, "class", "text-xs");
        attr(div1, "class", "flex justify-between items-center");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, p);
        append(div1, t1);
        append(div1, div0);
        append(div0, t2);
        append(div0, t3);
        append(div0, t4);
      },
      p(ctx2, dirty) {
        if (dirty & /*btnTop*/
        16) set_data(
          t2,
          /*btnTop*/
          ctx2[4]
        );
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
      }
    };
  }
  function create_if_block$3(ctx) {
    let section;
    let p;
    let t0_value = t("setting.button_position.label.my_bookmark") + "";
    let t0;
    let t1;
    let ul;
    let li;
    let rangeslider0;
    let updating_value;
    let t2;
    let rangeslider1;
    let updating_value_1;
    let current;
    function rangeslider0_value_binding_1(value) {
      ctx[19](value);
    }
    let rangeslider0_props = {
      name: "pdl-bookmark-btn-left",
      step,
      max,
      ticked: true,
      class: "flex-grow",
      $$slots: { default: [create_default_slot_1$1] },
      $$scope: { ctx }
    };
    if (
      /*bookmarkBtnLeft*/
      ctx[5] !== void 0
    ) {
      rangeslider0_props.value = /*bookmarkBtnLeft*/
      ctx[5];
    }
    rangeslider0 = new RangeSlider({ props: rangeslider0_props });
    binding_callbacks.push(() => bind(rangeslider0, "value", rangeslider0_value_binding_1));
    rangeslider0.$on(
      "change",
      /*change_handler_2*/
      ctx[20]
    );
    function rangeslider1_value_binding_1(value) {
      ctx[21](value);
    }
    let rangeslider1_props = {
      name: "pdl-bookmark-btn-top",
      step,
      max,
      ticked: true,
      class: "flex-grow",
      $$slots: { default: [create_default_slot$1] },
      $$scope: { ctx }
    };
    if (
      /*bookmarkBtnTop*/
      ctx[6] !== void 0
    ) {
      rangeslider1_props.value = /*bookmarkBtnTop*/
      ctx[6];
    }
    rangeslider1 = new RangeSlider({ props: rangeslider1_props });
    binding_callbacks.push(() => bind(rangeslider1, "value", rangeslider1_value_binding_1));
    rangeslider1.$on(
      "change",
      /*change_handler_3*/
      ctx[22]
    );
    return {
      c() {
        section = element("section");
        p = element("p");
        t0 = text(t0_value);
        t1 = space();
        ul = element("ul");
        li = element("li");
        create_component(rangeslider0.$$.fragment);
        t2 = space();
        create_component(rangeslider1.$$.fragment);
        attr(
          p,
          "class",
          /*sectionTitle*/
          ctx[2]
        );
        attr(li, "class", "flex-col !items-stretch md:flex-row md:!items-baseline gap-4 *:!m-0");
        attr(
          ul,
          "class",
          /*ulClasses*/
          ctx[8]
        );
      },
      m(target, anchor) {
        insert(target, section, anchor);
        append(section, p);
        append(p, t0);
        append(section, t1);
        append(section, ul);
        append(ul, li);
        mount_component(rangeslider0, li, null);
        append(li, t2);
        mount_component(rangeslider1, li, null);
        current = true;
      },
      p(ctx2, dirty) {
        if (!current || dirty & /*sectionTitle*/
        4) {
          attr(
            p,
            "class",
            /*sectionTitle*/
            ctx2[2]
          );
        }
        const rangeslider0_changes = {};
        if (dirty & /*$$scope, bookmarkBtnLeft*/
        134217760) {
          rangeslider0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_value && dirty & /*bookmarkBtnLeft*/
        32) {
          updating_value = true;
          rangeslider0_changes.value = /*bookmarkBtnLeft*/
          ctx2[5];
          add_flush_callback(() => updating_value = false);
        }
        rangeslider0.$set(rangeslider0_changes);
        const rangeslider1_changes = {};
        if (dirty & /*$$scope, bookmarkBtnTop*/
        134217792) {
          rangeslider1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_value_1 && dirty & /*bookmarkBtnTop*/
        64) {
          updating_value_1 = true;
          rangeslider1_changes.value = /*bookmarkBtnTop*/
          ctx2[6];
          add_flush_callback(() => updating_value_1 = false);
        }
        rangeslider1.$set(rangeslider1_changes);
        if (!current || dirty & /*ulClasses*/
        256) {
          attr(
            ul,
            "class",
            /*ulClasses*/
            ctx2[8]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(rangeslider0.$$.fragment, local);
        transition_in(rangeslider1.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(rangeslider0.$$.fragment, local);
        transition_out(rangeslider1.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(section);
        }
        destroy_component(rangeslider0);
        destroy_component(rangeslider1);
      }
    };
  }
  function create_default_slot_1$1(ctx) {
    let div1;
    let p;
    let t1;
    let div0;
    let t2;
    let t3;
    let t4;
    return {
      c() {
        div1 = element("div");
        p = element("p");
        p.textContent = `${t("setting.button_position.options.horizon_position")}`;
        t1 = space();
        div0 = element("div");
        t2 = text(
          /*bookmarkBtnLeft*/
          ctx[5]
        );
        t3 = text(" / ");
        t4 = text(max);
        attr(div0, "class", "text-xs");
        attr(div1, "class", "flex justify-between items-center");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, p);
        append(div1, t1);
        append(div1, div0);
        append(div0, t2);
        append(div0, t3);
        append(div0, t4);
      },
      p(ctx2, dirty) {
        if (dirty & /*bookmarkBtnLeft*/
        32) set_data(
          t2,
          /*bookmarkBtnLeft*/
          ctx2[5]
        );
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
      }
    };
  }
  function create_default_slot$1(ctx) {
    let div1;
    let p;
    let t1;
    let div0;
    let t2;
    let t3;
    let t4;
    return {
      c() {
        div1 = element("div");
        p = element("p");
        p.textContent = `${t("setting.button_position.options.vertical_position")}`;
        t1 = space();
        div0 = element("div");
        t2 = text(
          /*bookmarkBtnTop*/
          ctx[6]
        );
        t3 = text(" / ");
        t4 = text(max);
        attr(div0, "class", "text-xs");
        attr(div1, "class", "flex justify-between items-center");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, p);
        append(div1, t1);
        append(div1, div0);
        append(div0, t2);
        append(div0, t3);
        append(div0, t4);
      },
      p(ctx2, dirty) {
        if (dirty & /*bookmarkBtnTop*/
        64) set_data(
          t2,
          /*bookmarkBtnTop*/
          ctx2[6]
        );
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
      }
    };
  }
  function create_fragment$4(ctx) {
    let div2;
    let div1;
    let div0;
    let div0_class_value;
    let t0;
    let section;
    let p;
    let t1_value = t("setting.button_position.label.common") + "";
    let t1;
    let t2;
    let ul;
    let li;
    let rangeslider0;
    let updating_value;
    let t3;
    let rangeslider1;
    let updating_value_1;
    let t4;
    let show_if = env.isPixiv();
    let current;
    function rangeslider0_value_binding(value) {
      ctx[15](value);
    }
    let rangeslider0_props = {
      name: "pdl-btn-left",
      step,
      max,
      ticked: true,
      class: "flex-grow",
      $$slots: { default: [create_default_slot_3$1] },
      $$scope: { ctx }
    };
    if (
      /*btnLeft*/
      ctx[3] !== void 0
    ) {
      rangeslider0_props.value = /*btnLeft*/
      ctx[3];
    }
    rangeslider0 = new RangeSlider({ props: rangeslider0_props });
    binding_callbacks.push(() => bind(rangeslider0, "value", rangeslider0_value_binding));
    rangeslider0.$on(
      "change",
      /*change_handler*/
      ctx[16]
    );
    function rangeslider1_value_binding(value) {
      ctx[17](value);
    }
    let rangeslider1_props = {
      name: "pdl-btn-top",
      step,
      max,
      ticked: true,
      class: "flex-grow",
      $$slots: { default: [create_default_slot_2$1] },
      $$scope: { ctx }
    };
    if (
      /*btnTop*/
      ctx[4] !== void 0
    ) {
      rangeslider1_props.value = /*btnTop*/
      ctx[4];
    }
    rangeslider1 = new RangeSlider({ props: rangeslider1_props });
    binding_callbacks.push(() => bind(rangeslider1, "value", rangeslider1_value_binding));
    rangeslider1.$on(
      "change",
      /*change_handler_1*/
      ctx[18]
    );
    let if_block = show_if && create_if_block$3(ctx);
    return {
      c() {
        div2 = element("div");
        div1 = element("div");
        div0 = element("div");
        t0 = space();
        section = element("section");
        p = element("p");
        t1 = text(t1_value);
        t2 = space();
        ul = element("ul");
        li = element("li");
        create_component(rangeslider0.$$.fragment);
        t3 = space();
        create_component(rangeslider1.$$.fragment);
        t4 = space();
        if (if_block) if_block.c();
        attr(div0, "class", div0_class_value = "w-48 h-48 backdrop-blur-sm rounded-lg relative " + /*bg*/
        ctx[0]);
        attr(div1, "class", "flex items-center justify-center");
        attr(
          p,
          "class",
          /*sectionTitle*/
          ctx[2]
        );
        attr(li, "class", "flex-col !items-stretch md:flex-row md:!items-baseline gap-4 *:!m-0");
        attr(
          ul,
          "class",
          /*ulClasses*/
          ctx[8]
        );
        attr(
          div2,
          "class",
          /*sectionSpace*/
          ctx[1]
        );
      },
      m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, div1);
        append(div1, div0);
        ctx[14](div0);
        append(div2, t0);
        append(div2, section);
        append(section, p);
        append(p, t1);
        append(section, t2);
        append(section, ul);
        append(ul, li);
        mount_component(rangeslider0, li, null);
        append(li, t3);
        mount_component(rangeslider1, li, null);
        append(div2, t4);
        if (if_block) if_block.m(div2, null);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (!current || dirty & /*bg*/
        1 && div0_class_value !== (div0_class_value = "w-48 h-48 backdrop-blur-sm rounded-lg relative " + /*bg*/
        ctx2[0])) {
          attr(div0, "class", div0_class_value);
        }
        if (!current || dirty & /*sectionTitle*/
        4) {
          attr(
            p,
            "class",
            /*sectionTitle*/
            ctx2[2]
          );
        }
        const rangeslider0_changes = {};
        if (dirty & /*$$scope, btnLeft*/
        134217736) {
          rangeslider0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_value && dirty & /*btnLeft*/
        8) {
          updating_value = true;
          rangeslider0_changes.value = /*btnLeft*/
          ctx2[3];
          add_flush_callback(() => updating_value = false);
        }
        rangeslider0.$set(rangeslider0_changes);
        const rangeslider1_changes = {};
        if (dirty & /*$$scope, btnTop*/
        134217744) {
          rangeslider1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_value_1 && dirty & /*btnTop*/
        16) {
          updating_value_1 = true;
          rangeslider1_changes.value = /*btnTop*/
          ctx2[4];
          add_flush_callback(() => updating_value_1 = false);
        }
        rangeslider1.$set(rangeslider1_changes);
        if (!current || dirty & /*ulClasses*/
        256) {
          attr(
            ul,
            "class",
            /*ulClasses*/
            ctx2[8]
          );
        }
        if (show_if) if_block.p(ctx2, dirty);
        if (!current || dirty & /*sectionSpace*/
        2) {
          attr(
            div2,
            "class",
            /*sectionSpace*/
            ctx2[1]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(rangeslider0.$$.fragment, local);
        transition_in(rangeslider1.$$.fragment, local);
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(rangeslider0.$$.fragment, local);
        transition_out(rangeslider1.$$.fragment, local);
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div2);
        }
        ctx[14](null);
        destroy_component(rangeslider0);
        destroy_component(rangeslider1);
        if (if_block) if_block.d();
      }
    };
  }
  const max = 100;
  const step = 4;
  function changeCssProp(key, value) {
    document.documentElement.style.setProperty(key, String(value));
  }
  function instance$4($$self, $$props, $$invalidate) {
    let ulClasses;
    let $store;
    component_subscribe($$self, configStore, ($$value) => $$invalidate(23, $store = $$value));
    let { bg = "bg-white/30 dark:bg-black/15" } = $$props;
    let { border = "divide-y-[1px] *:border-surface-300-600-token" } = $$props;
    let { padding = "px-4 *:py-4" } = $$props;
    let { margin = "mt-2 *:!m-0" } = $$props;
    let { rounded = "rounded-container-token *:!rounded-none" } = $$props;
    let { sectionSpace = `space-y-4` } = $$props;
    let { sectionTitle = "font-bold" } = $$props;
    let btnLeft = $store["pdl-btn-left"];
    let btnTop = $store["pdl-btn-top"];
    let bookmarkBtnLeft = $store["pdl-btn-self-bookmark-left"];
    let bookmarkBtnTop = $store["pdl-btn-self-bookmark-top"];
    function updateBtnPosConfig(key, val) {
      set_store_value(configStore, $store[key] = val, $store);
    }
    let buttonContainer;
    const sampleBtn = new ThumbnailButton({ id: "sample", onClick: () => void 0 });
    const sampleBookmarkBtn = new ThumbnailButton({
      id: "sample-bookmark",
      type: ThumbnailBtnType.PixivMyBookmark,
      onClick: () => void 0
    });
    sampleBtn.setAttribute("disabled", "");
    sampleBookmarkBtn.setAttribute("disabled", "");
    sampleBookmarkBtn.setAttribute("status", "complete");
    onMount(() => {
      buttonContainer.appendChild(sampleBtn);
      if (env.isPixiv()) {
        buttonContainer.appendChild(sampleBookmarkBtn);
      }
    });
    function div0_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        buttonContainer = $$value;
        $$invalidate(7, buttonContainer);
      });
    }
    function rangeslider0_value_binding(value) {
      btnLeft = value;
      $$invalidate(3, btnLeft);
    }
    const change_handler = () => updateBtnPosConfig("pdl-btn-left", btnLeft);
    function rangeslider1_value_binding(value) {
      btnTop = value;
      $$invalidate(4, btnTop);
    }
    const change_handler_1 = () => updateBtnPosConfig("pdl-btn-top", btnTop);
    function rangeslider0_value_binding_1(value) {
      bookmarkBtnLeft = value;
      $$invalidate(5, bookmarkBtnLeft);
    }
    const change_handler_2 = () => updateBtnPosConfig("pdl-btn-self-bookmark-left", bookmarkBtnLeft);
    function rangeslider1_value_binding_1(value) {
      bookmarkBtnTop = value;
      $$invalidate(6, bookmarkBtnTop);
    }
    const change_handler_3 = () => updateBtnPosConfig("pdl-btn-self-bookmark-top", bookmarkBtnTop);
    $$self.$$set = ($$new_props) => {
      $$invalidate(26, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("bg" in $$new_props) $$invalidate(0, bg = $$new_props.bg);
      if ("border" in $$new_props) $$invalidate(10, border = $$new_props.border);
      if ("padding" in $$new_props) $$invalidate(11, padding = $$new_props.padding);
      if ("margin" in $$new_props) $$invalidate(12, margin = $$new_props.margin);
      if ("rounded" in $$new_props) $$invalidate(13, rounded = $$new_props.rounded);
      if ("sectionSpace" in $$new_props) $$invalidate(1, sectionSpace = $$new_props.sectionSpace);
      if ("sectionTitle" in $$new_props) $$invalidate(2, sectionTitle = $$new_props.sectionTitle);
    };
    $$self.$$.update = () => {
      $$invalidate(8, ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ""}`);
      if ($$self.$$.dirty & /*btnLeft*/
      8) {
        changeCssProp("--pdl-btn-left", btnLeft);
      }
      if ($$self.$$.dirty & /*btnTop*/
      16) {
        changeCssProp("--pdl-btn-top", btnTop);
      }
      if ($$self.$$.dirty & /*bookmarkBtnLeft*/
      32) {
        changeCssProp("--pdl-btn-self-bookmark-left", bookmarkBtnLeft);
      }
      if ($$self.$$.dirty & /*bookmarkBtnTop*/
      64) {
        changeCssProp("--pdl-btn-self-bookmark-top", bookmarkBtnTop);
      }
    };
    $$props = exclude_internal_props($$props);
    return [
      bg,
      sectionSpace,
      sectionTitle,
      btnLeft,
      btnTop,
      bookmarkBtnLeft,
      bookmarkBtnTop,
      buttonContainer,
      ulClasses,
      updateBtnPosConfig,
      border,
      padding,
      margin,
      rounded,
      div0_binding,
      rangeslider0_value_binding,
      change_handler,
      rangeslider1_value_binding,
      change_handler_1,
      rangeslider0_value_binding_1,
      change_handler_2,
      rangeslider1_value_binding_1,
      change_handler_3
    ];
  }
  class BtnPosition extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$4, create_fragment$4, safe_not_equal, {
        bg: 0,
        border: 10,
        padding: 11,
        margin: 12,
        rounded: 13,
        sectionSpace: 1,
        sectionTitle: 2
      });
    }
  }
  function create_if_block$2(ctx) {
    let ul;
    let li0;
    let label0;
    let p0;
    let t1;
    let slidetoggle0;
    let updating_checked;
    let t2;
    let li1;
    let label1;
    let p1;
    let t4;
    let slidetoggle1;
    let updating_checked_1;
    let ul_class_value;
    let current;
    function slidetoggle0_checked_binding_1(value) {
      ctx[12](value);
    }
    let slidetoggle0_props = { name: "fsa-enable", size: "sm" };
    if (
      /*$store*/
      ctx[4].addBookmarkWithTags !== void 0
    ) {
      slidetoggle0_props.checked = /*$store*/
      ctx[4].addBookmarkWithTags;
    }
    slidetoggle0 = new SlideToggle({ props: slidetoggle0_props });
    binding_callbacks.push(() => bind(slidetoggle0, "checked", slidetoggle0_checked_binding_1));
    function slidetoggle1_checked_binding_1(value) {
      ctx[13](value);
    }
    let slidetoggle1_props = { name: "fsa-enable", size: "sm" };
    if (
      /*$store*/
      ctx[4].privateR18 !== void 0
    ) {
      slidetoggle1_props.checked = /*$store*/
      ctx[4].privateR18;
    }
    slidetoggle1 = new SlideToggle({ props: slidetoggle1_props });
    binding_callbacks.push(() => bind(slidetoggle1, "checked", slidetoggle1_checked_binding_1));
    return {
      c() {
        ul = element("ul");
        li0 = element("li");
        label0 = element("label");
        p0 = element("p");
        p0.textContent = `${t("setting.others.options.add_bookmark_with_tags")}`;
        t1 = space();
        create_component(slidetoggle0.$$.fragment);
        t2 = space();
        li1 = element("li");
        label1 = element("label");
        p1 = element("p");
        p1.textContent = `${t("setting.others.options.add_bookmark_private_r18")}`;
        t4 = space();
        create_component(slidetoggle1.$$.fragment);
        attr(p0, "class", "flex-auto");
        attr(label0, "class", "label flex flex-grow items-center justify-center");
        attr(p1, "class", "flex-auto");
        attr(label1, "class", "label flex flex-grow items-center justify-center");
        attr(ul, "class", ul_class_value = "list " + /*border*/
        ctx[0] + " " + /*rounded*/
        ctx[1] + " [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4");
      },
      m(target, anchor) {
        insert(target, ul, anchor);
        append(ul, li0);
        append(li0, label0);
        append(label0, p0);
        append(label0, t1);
        mount_component(slidetoggle0, label0, null);
        append(ul, t2);
        append(ul, li1);
        append(li1, label1);
        append(label1, p1);
        append(label1, t4);
        mount_component(slidetoggle1, label1, null);
        current = true;
      },
      p(ctx2, dirty) {
        const slidetoggle0_changes = {};
        if (!updating_checked && dirty & /*$store*/
        16) {
          updating_checked = true;
          slidetoggle0_changes.checked = /*$store*/
          ctx2[4].addBookmarkWithTags;
          add_flush_callback(() => updating_checked = false);
        }
        slidetoggle0.$set(slidetoggle0_changes);
        const slidetoggle1_changes = {};
        if (!updating_checked_1 && dirty & /*$store*/
        16) {
          updating_checked_1 = true;
          slidetoggle1_changes.checked = /*$store*/
          ctx2[4].privateR18;
          add_flush_callback(() => updating_checked_1 = false);
        }
        slidetoggle1.$set(slidetoggle1_changes);
        if (!current || dirty & /*border, rounded*/
        3 && ul_class_value !== (ul_class_value = "list " + /*border*/
        ctx2[0] + " " + /*rounded*/
        ctx2[1] + " [&:not(:last-child)]:*:py-4 [&:last-child]:*:pt-4")) {
          attr(ul, "class", ul_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(slidetoggle0.$$.fragment, local);
        transition_in(slidetoggle1.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(slidetoggle0.$$.fragment, local);
        transition_out(slidetoggle1.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(ul);
        }
        destroy_component(slidetoggle0);
        destroy_component(slidetoggle1);
      }
    };
  }
  function create_fragment$3(ctx) {
    let div1;
    let ul;
    let li0;
    let p0;
    let t1;
    let slidetoggle0;
    let updating_checked;
    let t2;
    let li1;
    let p1;
    let t4;
    let slidetoggle1;
    let updating_checked_1;
    let t5;
    let li2;
    let p2;
    let t7;
    let slidetoggle2;
    let updating_checked_2;
    let t8;
    let li3;
    let div0;
    let p3;
    let t10;
    let slidetoggle3;
    let updating_checked_3;
    let t11;
    let show_if = (
      /*$store*/
      ctx[4].addBookmark && env.isPixiv()
    );
    let current;
    function slidetoggle0_checked_binding(value) {
      ctx[8](value);
    }
    let slidetoggle0_props = { name: "fsa-enable", size: "sm" };
    if (
      /*$store*/
      ctx[4].showPopupButton !== void 0
    ) {
      slidetoggle0_props.checked = /*$store*/
      ctx[4].showPopupButton;
    }
    slidetoggle0 = new SlideToggle({ props: slidetoggle0_props });
    binding_callbacks.push(() => bind(slidetoggle0, "checked", slidetoggle0_checked_binding));
    function slidetoggle1_checked_binding(value) {
      ctx[9](value);
    }
    let slidetoggle1_props = { name: "fsa-enable", size: "sm" };
    if (
      /*$store*/
      ctx[4].bundleIllusts !== void 0
    ) {
      slidetoggle1_props.checked = /*$store*/
      ctx[4].bundleIllusts;
    }
    slidetoggle1 = new SlideToggle({ props: slidetoggle1_props });
    binding_callbacks.push(() => bind(slidetoggle1, "checked", slidetoggle1_checked_binding));
    function slidetoggle2_checked_binding(value) {
      ctx[10](value);
    }
    let slidetoggle2_props = { name: "fsa-enable", size: "sm" };
    if (
      /*$store*/
      ctx[4].bundleManga !== void 0
    ) {
      slidetoggle2_props.checked = /*$store*/
      ctx[4].bundleManga;
    }
    slidetoggle2 = new SlideToggle({ props: slidetoggle2_props });
    binding_callbacks.push(() => bind(slidetoggle2, "checked", slidetoggle2_checked_binding));
    function slidetoggle3_checked_binding(value) {
      ctx[11](value);
    }
    let slidetoggle3_props = { name: "fsa-enable", size: "sm" };
    if (
      /*$store*/
      ctx[4].addBookmark !== void 0
    ) {
      slidetoggle3_props.checked = /*$store*/
      ctx[4].addBookmark;
    }
    slidetoggle3 = new SlideToggle({ props: slidetoggle3_props });
    binding_callbacks.push(() => bind(slidetoggle3, "checked", slidetoggle3_checked_binding));
    let if_block = show_if && create_if_block$2(ctx);
    return {
      c() {
        div1 = element("div");
        ul = element("ul");
        li0 = element("li");
        p0 = element("p");
        p0.textContent = `${t("setting.others.options.show_setting_button")}`;
        t1 = space();
        create_component(slidetoggle0.$$.fragment);
        t2 = space();
        li1 = element("li");
        p1 = element("p");
        p1.textContent = `${t("setting.others.options.bundle_multipage_illust")}`;
        t4 = space();
        create_component(slidetoggle1.$$.fragment);
        t5 = space();
        li2 = element("li");
        p2 = element("p");
        p2.textContent = `${t("setting.others.options.bundle_manga")}`;
        t7 = space();
        create_component(slidetoggle2.$$.fragment);
        t8 = space();
        li3 = element("li");
        div0 = element("div");
        p3 = element("p");
        p3.textContent = `${t("setting.others.options.add_bookmark_when_download")}`;
        t10 = space();
        create_component(slidetoggle3.$$.fragment);
        t11 = space();
        if (if_block) if_block.c();
        attr(p0, "class", "flex-auto");
        attr(p1, "class", "flex-auto");
        attr(p2, "class", "flex-auto");
        attr(p3, "class", "flex-auto");
        attr(div0, "class", "flex items-center");
        attr(li3, "class", "flex-col !items-stretch");
        attr(
          ul,
          "class",
          /*ulClasses*/
          ctx[3]
        );
        attr(
          div1,
          "class",
          /*sectionSpace*/
          ctx[2]
        );
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, ul);
        append(ul, li0);
        append(li0, p0);
        append(li0, t1);
        mount_component(slidetoggle0, li0, null);
        append(ul, t2);
        append(ul, li1);
        append(li1, p1);
        append(li1, t4);
        mount_component(slidetoggle1, li1, null);
        append(ul, t5);
        append(ul, li2);
        append(li2, p2);
        append(li2, t7);
        mount_component(slidetoggle2, li2, null);
        append(ul, t8);
        append(ul, li3);
        append(li3, div0);
        append(div0, p3);
        append(div0, t10);
        mount_component(slidetoggle3, div0, null);
        append(li3, t11);
        if (if_block) if_block.m(li3, null);
        current = true;
      },
      p(ctx2, [dirty]) {
        const slidetoggle0_changes = {};
        if (!updating_checked && dirty & /*$store*/
        16) {
          updating_checked = true;
          slidetoggle0_changes.checked = /*$store*/
          ctx2[4].showPopupButton;
          add_flush_callback(() => updating_checked = false);
        }
        slidetoggle0.$set(slidetoggle0_changes);
        const slidetoggle1_changes = {};
        if (!updating_checked_1 && dirty & /*$store*/
        16) {
          updating_checked_1 = true;
          slidetoggle1_changes.checked = /*$store*/
          ctx2[4].bundleIllusts;
          add_flush_callback(() => updating_checked_1 = false);
        }
        slidetoggle1.$set(slidetoggle1_changes);
        const slidetoggle2_changes = {};
        if (!updating_checked_2 && dirty & /*$store*/
        16) {
          updating_checked_2 = true;
          slidetoggle2_changes.checked = /*$store*/
          ctx2[4].bundleManga;
          add_flush_callback(() => updating_checked_2 = false);
        }
        slidetoggle2.$set(slidetoggle2_changes);
        const slidetoggle3_changes = {};
        if (!updating_checked_3 && dirty & /*$store*/
        16) {
          updating_checked_3 = true;
          slidetoggle3_changes.checked = /*$store*/
          ctx2[4].addBookmark;
          add_flush_callback(() => updating_checked_3 = false);
        }
        slidetoggle3.$set(slidetoggle3_changes);
        if (dirty & /*$store*/
        16) show_if = /*$store*/
        ctx2[4].addBookmark && env.isPixiv();
        if (show_if) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*$store*/
            16) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$2(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(li3, null);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
        if (!current || dirty & /*ulClasses*/
        8) {
          attr(
            ul,
            "class",
            /*ulClasses*/
            ctx2[3]
          );
        }
        if (!current || dirty & /*sectionSpace*/
        4) {
          attr(
            div1,
            "class",
            /*sectionSpace*/
            ctx2[2]
          );
        }
      },
      i(local) {
        if (current) return;
        transition_in(slidetoggle0.$$.fragment, local);
        transition_in(slidetoggle1.$$.fragment, local);
        transition_in(slidetoggle2.$$.fragment, local);
        transition_in(slidetoggle3.$$.fragment, local);
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(slidetoggle0.$$.fragment, local);
        transition_out(slidetoggle1.$$.fragment, local);
        transition_out(slidetoggle2.$$.fragment, local);
        transition_out(slidetoggle3.$$.fragment, local);
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        destroy_component(slidetoggle0);
        destroy_component(slidetoggle1);
        destroy_component(slidetoggle2);
        destroy_component(slidetoggle3);
        if (if_block) if_block.d();
      }
    };
  }
  function instance$3($$self, $$props, $$invalidate) {
    let ulClasses;
    let $store;
    component_subscribe($$self, configStore, ($$value) => $$invalidate(4, $store = $$value));
    let { bg = "bg-white/30 dark:bg-black/15" } = $$props;
    let { border = "divide-y-[1px] *:border-surface-300-600-token" } = $$props;
    let { padding = "px-4 *:py-4" } = $$props;
    let { margin = "mt-2 *:!m-0" } = $$props;
    let { rounded = "rounded-container-token *:!rounded-none" } = $$props;
    let { sectionSpace = `space-y-4` } = $$props;
    function slidetoggle0_checked_binding(value) {
      if ($$self.$$.not_equal($store.showPopupButton, value)) {
        $store.showPopupButton = value;
        configStore.set($store);
      }
    }
    function slidetoggle1_checked_binding(value) {
      if ($$self.$$.not_equal($store.bundleIllusts, value)) {
        $store.bundleIllusts = value;
        configStore.set($store);
      }
    }
    function slidetoggle2_checked_binding(value) {
      if ($$self.$$.not_equal($store.bundleManga, value)) {
        $store.bundleManga = value;
        configStore.set($store);
      }
    }
    function slidetoggle3_checked_binding(value) {
      if ($$self.$$.not_equal($store.addBookmark, value)) {
        $store.addBookmark = value;
        configStore.set($store);
      }
    }
    function slidetoggle0_checked_binding_1(value) {
      if ($$self.$$.not_equal($store.addBookmarkWithTags, value)) {
        $store.addBookmarkWithTags = value;
        configStore.set($store);
      }
    }
    function slidetoggle1_checked_binding_1(value) {
      if ($$self.$$.not_equal($store.privateR18, value)) {
        $store.privateR18 = value;
        configStore.set($store);
      }
    }
    $$self.$$set = ($$new_props) => {
      $$invalidate(14, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("bg" in $$new_props) $$invalidate(5, bg = $$new_props.bg);
      if ("border" in $$new_props) $$invalidate(0, border = $$new_props.border);
      if ("padding" in $$new_props) $$invalidate(6, padding = $$new_props.padding);
      if ("margin" in $$new_props) $$invalidate(7, margin = $$new_props.margin);
      if ("rounded" in $$new_props) $$invalidate(1, rounded = $$new_props.rounded);
      if ("sectionSpace" in $$new_props) $$invalidate(2, sectionSpace = $$new_props.sectionSpace);
    };
    $$self.$$.update = () => {
      $$invalidate(3, ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ""}`);
    };
    $$props = exclude_internal_props($$props);
    return [
      border,
      rounded,
      sectionSpace,
      ulClasses,
      $store,
      bg,
      padding,
      margin,
      slidetoggle0_checked_binding,
      slidetoggle1_checked_binding,
      slidetoggle2_checked_binding,
      slidetoggle3_checked_binding,
      slidetoggle0_checked_binding_1,
      slidetoggle1_checked_binding_1
    ];
  }
  class Others extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$3, create_fragment$3, safe_not_equal, {
        bg: 5,
        border: 0,
        padding: 6,
        margin: 7,
        rounded: 1,
        sectionSpace: 2
      });
    }
  }
  function create_fragment$2(ctx) {
    let div;
    let section0;
    let p0;
    let t0_value = t("setting.feedback.label.feedback") + "";
    let t0;
    let t1;
    let ul0;
    let li0;
    let span;
    let raw_value = t("setting.feedback.text.feedback_desc") + "";
    let t2;
    let section1;
    let p1;
    let t3_value = t("setting.feedback.label.donate") + "";
    let t3;
    let t4;
    let ul1;
    let li1;
    let figure;
    let img;
    let img_src_value;
    let t5;
    let figcaption;
    return {
      c() {
        div = element("div");
        section0 = element("section");
        p0 = element("p");
        t0 = text(t0_value);
        t1 = space();
        ul0 = element("ul");
        li0 = element("li");
        span = element("span");
        t2 = space();
        section1 = element("section");
        p1 = element("p");
        t3 = text(t3_value);
        t4 = space();
        ul1 = element("ul");
        li1 = element("li");
        figure = element("figure");
        img = element("img");
        t5 = space();
        figcaption = element("figcaption");
        figcaption.textContent = `${t("setting.feedback.text.donate_desc")}`;
        attr(
          p0,
          "class",
          /*sectionTitle*/
          ctx[1]
        );
        attr(
          ul0,
          "class",
          /*ulClasses*/
          ctx[2]
        );
        attr(
          p1,
          "class",
          /*sectionTitle*/
          ctx[1]
        );
        if (!src_url_equal(img.src, img_src_value = creditCode)) attr(img, "src", img_src_value);
        attr(img, "alt", "credit");
        attr(img, "class", "rounded-full m-auto");
        attr(figcaption, "class", "mt-4");
        attr(li1, "class", "justify-center");
        attr(
          ul1,
          "class",
          /*ulClasses*/
          ctx[2]
        );
        attr(
          div,
          "class",
          /*sectionSpace*/
          ctx[0]
        );
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, section0);
        append(section0, p0);
        append(p0, t0);
        append(section0, t1);
        append(section0, ul0);
        append(ul0, li0);
        append(li0, span);
        span.innerHTML = raw_value;
        append(div, t2);
        append(div, section1);
        append(section1, p1);
        append(p1, t3);
        append(section1, t4);
        append(section1, ul1);
        append(ul1, li1);
        append(li1, figure);
        append(figure, img);
        append(figure, t5);
        append(figure, figcaption);
      },
      p(ctx2, [dirty]) {
        if (dirty & /*sectionTitle*/
        2) {
          attr(
            p0,
            "class",
            /*sectionTitle*/
            ctx2[1]
          );
        }
        if (dirty & /*ulClasses*/
        4) {
          attr(
            ul0,
            "class",
            /*ulClasses*/
            ctx2[2]
          );
        }
        if (dirty & /*sectionTitle*/
        2) {
          attr(
            p1,
            "class",
            /*sectionTitle*/
            ctx2[1]
          );
        }
        if (dirty & /*ulClasses*/
        4) {
          attr(
            ul1,
            "class",
            /*ulClasses*/
            ctx2[2]
          );
        }
        if (dirty & /*sectionSpace*/
        1) {
          attr(
            div,
            "class",
            /*sectionSpace*/
            ctx2[0]
          );
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div);
        }
      }
    };
  }
  function instance$2($$self, $$props, $$invalidate) {
    let ulClasses;
    let { bg = "bg-white/30 dark:bg-black/15" } = $$props;
    let { border = "divide-y-[1px] *:border-surface-300-600-token" } = $$props;
    let { padding = "px-4 *:py-4" } = $$props;
    let { margin = "mt-2 *:!m-0" } = $$props;
    let { rounded = "rounded-container-token *:!rounded-none" } = $$props;
    let { sectionSpace = `space-y-4` } = $$props;
    let { sectionTitle = "font-bold" } = $$props;
    $$self.$$set = ($$new_props) => {
      $$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
      if ("bg" in $$new_props) $$invalidate(3, bg = $$new_props.bg);
      if ("border" in $$new_props) $$invalidate(4, border = $$new_props.border);
      if ("padding" in $$new_props) $$invalidate(5, padding = $$new_props.padding);
      if ("margin" in $$new_props) $$invalidate(6, margin = $$new_props.margin);
      if ("rounded" in $$new_props) $$invalidate(7, rounded = $$new_props.rounded);
      if ("sectionSpace" in $$new_props) $$invalidate(0, sectionSpace = $$new_props.sectionSpace);
      if ("sectionTitle" in $$new_props) $$invalidate(1, sectionTitle = $$new_props.sectionTitle);
    };
    $$self.$$.update = () => {
      $$invalidate(2, ulClasses = `list *:items-center ${padding} ${margin} ${border} ${bg} ${rounded} ${$$props.class ?? ""}`);
    };
    $$props = exclude_internal_props($$props);
    return [sectionSpace, sectionTitle, ulClasses, bg, border, padding, margin, rounded];
  }
  class FeedBack extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$2, create_fragment$2, safe_not_equal, {
        bg: 3,
        border: 4,
        padding: 5,
        margin: 6,
        rounded: 7,
        sectionSpace: 0,
        sectionTitle: 1
      });
    }
  }
  const menuOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,15.61L19.59,17L14.58,12L19.59,7L21,8.39L17.44,12L21,15.61M3,6H16V8H3V6M3,13V11H13V13H3M3,18V16H16V18H3Z" /></svg>`;
  const menuClose = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 6H13V8H3V6M3 16H13V18H3V16M3 11H15V13H3V11M16 7L14.58 8.39L18.14 12L14.58 15.61L16 17L21 12L16 7Z" /></svg>`;
  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[9] = list[i].name;
    child_ctx[11] = i;
    return child_ctx;
  }
  function create_default_slot_3(ctx) {
    let t_1_value = (
      /*name*/
      ctx[9] + ""
    );
    let t_1;
    return {
      c() {
        t_1 = text(t_1_value);
      },
      m(target, anchor) {
        insert(target, t_1, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(t_1);
        }
      }
    };
  }
  function create_each_block(ctx) {
    let listboxitem;
    let updating_group;
    let current;
    function listboxitem_group_binding(value) {
      ctx[6](value);
    }
    let listboxitem_props = {
      name: "option",
      value: (
        /*idx*/
        ctx[11]
      ),
      class: "rounded-token",
      $$slots: { default: [create_default_slot_3] },
      $$scope: { ctx }
    };
    if (
      /*slected*/
      ctx[2] !== void 0
    ) {
      listboxitem_props.group = /*slected*/
      ctx[2];
    }
    listboxitem = new ListBoxItem({ props: listboxitem_props });
    binding_callbacks.push(() => bind(listboxitem, "group", listboxitem_group_binding));
    return {
      c() {
        create_component(listboxitem.$$.fragment);
      },
      m(target, anchor) {
        mount_component(listboxitem, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const listboxitem_changes = {};
        if (dirty & /*$$scope*/
        4096) {
          listboxitem_changes.$$scope = { dirty, ctx: ctx2 };
        }
        if (!updating_group && dirty & /*slected*/
        4) {
          updating_group = true;
          listboxitem_changes.group = /*slected*/
          ctx2[2];
          add_flush_callback(() => updating_group = false);
        }
        listboxitem.$set(listboxitem_changes);
      },
      i(local) {
        if (current) return;
        transition_in(listboxitem.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(listboxitem.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(listboxitem, detaching);
      }
    };
  }
  function create_default_slot_2(ctx) {
    let each_1_anchor;
    let current;
    let each_value = ensure_array_like(
      /*optionList*/
      ctx[5]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(target, anchor);
          }
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & /*slected, optionList*/
        36) {
          each_value = ensure_array_like(
            /*optionList*/
            ctx2[5]
          );
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current) return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(each_1_anchor);
        }
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_default_slot_1(ctx) {
    let h3;
    let t_1_value = (
      /*optionList*/
      (ctx[5][
        /*slected*/
        ctx[2]
      ].name || "设置") + ""
    );
    let t_1;
    return {
      c() {
        h3 = element("h3");
        t_1 = text(t_1_value);
        attr(h3, "class", "h3");
      },
      m(target, anchor) {
        insert(target, h3, anchor);
        append(h3, t_1);
      },
      p(ctx2, dirty) {
        if (dirty & /*slected*/
        4 && t_1_value !== (t_1_value = /*optionList*/
        (ctx2[5][
          /*slected*/
          ctx2[2]
        ].name || "设置") + "")) set_data(t_1, t_1_value);
      },
      d(detaching) {
        if (detaching) {
          detach(h3);
        }
      }
    };
  }
  function create_else_block(ctx) {
    let html_tag;
    let html_anchor;
    return {
      c() {
        html_tag = new HtmlTag(false);
        html_anchor = empty();
        html_tag.a = html_anchor;
      },
      m(target, anchor) {
        html_tag.m(menuOpen, target, anchor);
        insert(target, html_anchor, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(html_anchor);
          html_tag.d();
        }
      }
    };
  }
  function create_if_block$1(ctx) {
    let html_tag;
    let html_anchor;
    return {
      c() {
        html_tag = new HtmlTag(false);
        html_anchor = empty();
        html_tag.a = html_anchor;
      },
      m(target, anchor) {
        html_tag.m(menuClose, target, anchor);
        insert(target, html_anchor, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(html_anchor);
          html_tag.d();
        }
      }
    };
  }
  function create_lead_slot(ctx) {
    let button;
    let i;
    let mounted;
    let dispose;
    function select_block_type(ctx2, dirty) {
      if (
        /*showListbox*/
        ctx2[1]
      ) return create_if_block$1;
      return create_else_block;
    }
    let current_block_type = select_block_type(ctx);
    let if_block = current_block_type(ctx);
    return {
      c() {
        button = element("button");
        i = element("i");
        if_block.c();
        attr(i, "class", "w-8 fill-current");
        attr(button, "type", "button");
        attr(button, "class", "btn-icon hover:variant-soft-surface ml-1");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, i);
        if_block.m(i, null);
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*click_handler*/
            ctx[7]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (current_block_type !== (current_block_type = select_block_type(ctx2))) {
          if_block.d(1);
          if_block = current_block_type(ctx2);
          if (if_block) {
            if_block.c();
            if_block.m(i, null);
          }
        }
      },
      d(detaching) {
        if (detaching) {
          detach(button);
        }
        if_block.d();
        mounted = false;
        dispose();
      }
    };
  }
  function create_default_slot(ctx) {
    let div1;
    let listbox;
    let t0;
    let appbar;
    let t1;
    let div0;
    let switch_instance;
    let div1_class_value;
    let current;
    listbox = new ListBox({
      props: {
        class: "pt-4 pr-6 row-start-1 row-span-2 " + sidebarWidth + " transition-[transform] " + /*transform*/
        ctx[3],
        $$slots: { default: [create_default_slot_2] },
        $$scope: { ctx }
      }
    });
    appbar = new AppBar({
      props: {
        padding: "py-2",
        background: "bg-transparent",
        class: "mr-6 border-b border-surface-800-100-token",
        $$slots: {
          lead: [create_lead_slot],
          default: [create_default_slot_1]
        },
        $$scope: { ctx }
      }
    });
    const switch_instance_spread_levels = [
      /*optionList*/
      ctx[5][
        /*slected*/
        ctx[2]
      ].props,
      {
        bg: "bg-white/30 dark:bg-surface-500/20 backdrop-blur-sm"
      }
    ];
    var switch_value = (
      /*optionList*/
      ctx[5][
        /*slected*/
        ctx[2]
      ].component
    );
    function switch_props(ctx2, dirty) {
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      if (dirty !== void 0 && dirty & /*optionList, slected*/
      36) {
        switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [
          get_spread_object(
            /*optionList*/
            ctx2[5][
              /*slected*/
              ctx2[2]
            ].props
          ),
          switch_instance_spread_levels[1]
        ]));
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    }
    return {
      c() {
        div1 = element("div");
        create_component(listbox.$$.fragment);
        t0 = space();
        create_component(appbar.$$.fragment);
        t1 = space();
        div0 = element("div");
        if (switch_instance) create_component(switch_instance.$$.fragment);
        attr(div0, "class", "mt-4 pr-4 scrollbar-track-transparent scrollbar-thumb-slate-400/50 scrollbar-corner-transparent scrollbar-thin overflow-y-auto");
        set_style(div0, "scrollbar-gutter", "stable");
        attr(div1, "class", div1_class_value = "h-full pt-4 pb-6 pl-6 grid grid-rows-[auto_1fr] transition-[grid-template-columns] " + /*gridCol*/
        ctx[4]);
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        mount_component(listbox, div1, null);
        append(div1, t0);
        mount_component(appbar, div1, null);
        append(div1, t1);
        append(div1, div0);
        if (switch_instance) mount_component(switch_instance, div0, null);
        current = true;
      },
      p(ctx2, dirty) {
        const listbox_changes = {};
        if (dirty & /*transform*/
        8) listbox_changes.class = "pt-4 pr-6 row-start-1 row-span-2 " + sidebarWidth + " transition-[transform] " + /*transform*/
        ctx2[3];
        if (dirty & /*$$scope, slected*/
        4100) {
          listbox_changes.$$scope = { dirty, ctx: ctx2 };
        }
        listbox.$set(listbox_changes);
        const appbar_changes = {};
        if (dirty & /*$$scope, showListbox, slected*/
        4102) {
          appbar_changes.$$scope = { dirty, ctx: ctx2 };
        }
        appbar.$set(appbar_changes);
        if (dirty & /*slected*/
        4 && switch_value !== (switch_value = /*optionList*/
        ctx2[5][
          /*slected*/
          ctx2[2]
        ].component)) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = construct_svelte_component(switch_value, switch_props(ctx2, dirty));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, div0, null);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          const switch_instance_changes = dirty & /*optionList, slected*/
          36 ? get_spread_update(switch_instance_spread_levels, [
            get_spread_object(
              /*optionList*/
              ctx2[5][
                /*slected*/
                ctx2[2]
              ].props
            ),
            switch_instance_spread_levels[1]
          ]) : {};
          switch_instance.$set(switch_instance_changes);
        }
        if (!current || dirty & /*gridCol*/
        16 && div1_class_value !== (div1_class_value = "h-full pt-4 pb-6 pl-6 grid grid-rows-[auto_1fr] transition-[grid-template-columns] " + /*gridCol*/
        ctx2[4])) {
          attr(div1, "class", div1_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(listbox.$$.fragment, local);
        transition_in(appbar.$$.fragment, local);
        if (switch_instance) transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(listbox.$$.fragment, local);
        transition_out(appbar.$$.fragment, local);
        if (switch_instance) transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        destroy_component(listbox);
        destroy_component(appbar);
        if (switch_instance) destroy_component(switch_instance);
      }
    };
  }
  function create_fragment$1(ctx) {
    let modalwrapper;
    let current;
    modalwrapper = new ModalWrapper({
      props: {
        parent: (
          /*parent*/
          ctx[0]
        ),
        height: "h-screen md:h-[600px]",
        width: "w-screen md:max-w-screen-md xl:max-w-screen-lg",
        padding: "",
        $$slots: { default: [create_default_slot] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        create_component(modalwrapper.$$.fragment);
      },
      m(target, anchor) {
        mount_component(modalwrapper, target, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        const modalwrapper_changes = {};
        if (dirty & /*parent*/
        1) modalwrapper_changes.parent = /*parent*/
        ctx2[0];
        if (dirty & /*$$scope, gridCol, slected, showListbox, transform*/
        4126) {
          modalwrapper_changes.$$scope = { dirty, ctx: ctx2 };
        }
        modalwrapper.$set(modalwrapper_changes);
      },
      i(local) {
        if (current) return;
        transition_in(modalwrapper.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(modalwrapper.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(modalwrapper, detaching);
      }
    };
  }
  const sidebarWidth = "w-[140px]";
  function instance$1($$self, $$props, $$invalidate) {
    let gridCol;
    let transform;
    let { parent } = $$props;
    const pattern = env.isPixiv() ? ["{artist}", "{artistID}", "{title}", "{id}", "{page}", "{tags}", "{date}"] : ["{artist}", "{character}", "{id}", "{date}"];
    let slected = 0;
    const optionList = [
      {
        name: t("setting.save_to.title"),
        component: SaveTo,
        props: { pattern }
      },
      {
        name: t("setting.ugoira.title"),
        component: UgoiraConvert
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
        name: t("setting.feedback.title"),
        component: FeedBack
      }
    ];
    let showListbox = true;
    function listboxitem_group_binding(value) {
      slected = value;
      $$invalidate(2, slected);
    }
    const click_handler = () => $$invalidate(1, showListbox = !showListbox);
    $$self.$$set = ($$props2) => {
      if ("parent" in $$props2) $$invalidate(0, parent = $$props2.parent);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*showListbox*/
      2) {
        $$invalidate(4, gridCol = showListbox ? "grid-cols-[140px_1fr]" : "grid-cols-[0px_1fr]");
      }
      if ($$self.$$.dirty & /*showListbox*/
      2) {
        $$invalidate(3, transform = showListbox ? "translate-x-0" : "-translate-x-full");
      }
    };
    return [
      parent,
      showListbox,
      slected,
      transform,
      gridCol,
      optionList,
      listboxitem_group_binding,
      click_handler
    ];
  }
  class Config extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$1, create_fragment$1, safe_not_equal, { parent: 0 });
    }
  }
  const cog = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>`;
  function create_if_block(ctx) {
    let button;
    let i;
    let t0;
    let span;
    let mounted;
    let dispose;
    return {
      c() {
        button = element("button");
        i = element("i");
        t0 = space();
        span = element("span");
        span.textContent = `${t("button.setting")}`;
        attr(i, "class", "text-sm w-6 fill-current");
        attr(span, "class", "text-sm");
        attr(button, "type", "button");
        attr(button, "class", "btn btn-sm variant-filled fixed bottom-24 rounded-none rounded-s-full opacity-40 hover:opacity-100 right-0 translate-x-[calc(100%-44px)] hover:translate-x-0 delay-100");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, i);
        i.innerHTML = cog;
        append(button, t0);
        append(button, span);
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*click_handler*/
            ctx[12]
          );
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(button);
        }
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment(ctx) {
    let div;
    let modal;
    let t_1;
    let div_class_value;
    let current;
    let mounted;
    let dispose;
    modal = new Modal({
      props: {
        components: (
          /*components*/
          ctx[4]
        ),
        class: "!p-0"
      }
    });
    let if_block = (
      /*$store*/
      ctx[2].showPopupButton && create_if_block(ctx)
    );
    return {
      c() {
        div = element("div");
        create_component(modal.$$.fragment);
        t_1 = space();
        if (if_block) if_block.c();
        attr(div, "class", div_class_value = "contents " + /*darkMode*/
        ctx[1]);
        attr(div, "data-theme", "skeleton");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(modal, div, null);
        append(div, t_1);
        if (if_block) if_block.m(div, null);
        ctx[13](div);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              window,
              "keydown",
              /*handleKeydown*/
              ctx[6],
              true
            ),
            listen(div, "keydown", stop_propagation(
              /*keydown_handler*/
              ctx[11]
            )),
            listen(div, "mousedown", preventBackDropClick, true),
            listen(div, "mouseup", preventBackDropClick, true)
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (
          /*$store*/
          ctx2[2].showPopupButton
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block(ctx2);
            if_block.c();
            if_block.m(div, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (!current || dirty & /*darkMode*/
        2 && div_class_value !== (div_class_value = "contents " + /*darkMode*/
        ctx2[1])) {
          attr(div, "class", div_class_value);
        }
      },
      i(local) {
        if (current) return;
        transition_in(modal.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(modal.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_component(modal);
        if (if_block) if_block.d();
        ctx[13](null);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function preventBackDropClick(event) {
    if (!(event.target instanceof Element)) return;
    const classList = event.target.classList;
    if (classList.contains("modal-backdrop") || classList.contains("modal-transition")) {
      event.stopPropagation();
    }
  }
  function instance($$self, $$props, $$invalidate) {
    let darkMode;
    let $store;
    component_subscribe($$self, configStore, ($$value) => $$invalidate(2, $store = $$value));
    initializeStores();
    const modalStore = getModalStore();
    const components = {
      changelog: { ref: Changelog },
      setting: { ref: Config }
    };
    const changelogModal = {
      type: "component",
      component: "changelog"
    };
    const settingModal = { type: "component", component: "setting" };
    let { dark = false } = $$props;
    let { updated = false } = $$props;
    function showChangelog() {
      modalStore.trigger(changelogModal);
    }
    function showSetting() {
      modalStore.trigger(settingModal);
    }
    let root;
    onMount(async () => {
      const shadow = root.getRootNode();
      addStyleToShadow(shadow);
      if (updated) {
        showChangelog();
      }
    });
    function modalExist() {
      return !!(root == null ? void 0 : root.querySelector(".modal-backdrop"));
    }
    function handleKeydown(event) {
      if (!modalExist()) return;
      if (event.code === "Escape") {
        modalStore.close();
        return;
      } else if (event.ctrlKey || event.shiftKey) {
        return;
      }
      if (!event.composedPath().includes(root)) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }
    function keydown_handler(event) {
      bubble.call(this, $$self, event);
    }
    const click_handler = () => modalStore.trigger(settingModal);
    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        root = $$value;
        $$invalidate(0, root);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("dark" in $$props2) $$invalidate(7, dark = $$props2.dark);
      if ("updated" in $$props2) $$invalidate(8, updated = $$props2.updated);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*dark*/
      128) {
        $$invalidate(1, darkMode = dark ? "dark" : "");
      }
    };
    return [
      root,
      darkMode,
      $store,
      modalStore,
      components,
      settingModal,
      handleKeydown,
      dark,
      updated,
      showChangelog,
      showSetting,
      keydown_handler,
      click_handler,
      div_binding
    ];
  }
  class App extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, {
        dark: 7,
        updated: 8,
        showChangelog: 9,
        showSetting: 10
      });
    }
    get showChangelog() {
      return this.$$.ctx[9];
    }
    get showSetting() {
      return this.$$.ctx[10];
    }
  }
  const util = ".pdl-hide{display:none!important}.pdl-unavailable{pointer-events:none!important;opacity:.5!important;cursor:not-allowed!important}.pdl-spacer{margin:0;padding:0;flex:1}";
  const theme = ":root{--pdl-bg1: #fff;--pdl-bg2-hover: rgba(0, 0, 0, .05);--pdl-bg3-hover: rgb(31, 31, 31);--pdl-btn1: rgba(0, 0, 0, .04);--pdl-btn1-hover: rgba(0, 0, 0, .12);--pdl-border1: rgba(0, 0, 0, .1);--pdl-text1: rgb(31, 31, 31)}:root[data-theme=default],:root body[data-current-user-theme=light]{--pdl-bg1: #fff;--pdl-bg2-hover: rgba(0, 0, 0, .05);--pdl-bg3-hover: rgb(31, 31, 31);--pdl-btn1: rgba(0, 0, 0, .04);--pdl-btn1-hover: rgba(0, 0, 0, .12);--pdl-border1: rgba(0, 0, 0, .1);--pdl-text1: rgb(31, 31, 31)}@media (prefers-color-scheme: light){:root{--pdl-bg1: #fff;--pdl-bg2-hover: rgba(0, 0, 0, .05);--pdl-bg3-hover: rgb(31, 31, 31);--pdl-btn1: rgba(0, 0, 0, .04);--pdl-btn1-hover: rgba(0, 0, 0, .12);--pdl-border1: rgba(0, 0, 0, .1);--pdl-text1: rgb(31, 31, 31)}}:root[data-theme=dark],:root body[data-current-user-theme=dark]{--pdl-bg1: rgb(31, 31, 31);--pdl-bg2-hover: rgba(255, 255, 255, .1);--pdl-bg3-hover: rgb(155, 155, 155);--pdl-btn1: rgba(255, 255, 255, .4);--pdl-btn1-hover: rgba(255, 255, 255, .6);--pdl-border1: rgba(255, 255, 255, .3);--pdl-text1: rgb(245, 245, 245)}@media (prefers-color-scheme: dark){:root{--pdl-bg1: rgb(31, 31, 31);--pdl-bg2-hover: rgba(255, 255, 255, .1);--pdl-bg3-hover: rgb(155, 155, 155);--pdl-btn1: rgba(255, 255, 255, .4);--pdl-btn1-hover: rgba(255, 255, 255, .6);--pdl-border1: rgba(255, 255, 255, .3);--pdl-text1: rgb(245, 245, 245)}}pdl-button{--pdl-green1: #01b468;--pdl-black1: #3c3c3c;--pdl-red1: #ea0000;--pdl-fill-svg: var(--pdl-black1)}pdl-button[status=init]{--pdl-fill-svg: var(--pdl-black1)}pdl-button[type=pixiv-toolbar]{--pdl-fill-svg: var(--pdl-text1)}pdl-button[status]{--pdl-fill-svg: var(--pdl-green1)}pdl-button[status=error]{--pdl-fill-svg: var(--pdl-red1)}";
  const downloadButton = `@charset "UTF-8";@property --pdl-progress{syntax: "<percentage>"; inherits: true; initial-value: 0%;}@keyframes pdl_loading{to{transform:translate(-50%,-50%) rotate(360deg)}}.pdl-btn{font-family:'win-bug-omega, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif';position:relative;border-radius:4px;background:no-repeat center/85%;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%233C3C3C' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E");color:#01b468;display:inline-block;font-size:13px;font-weight:700;height:32px;line-height:32px;margin:0;overflow:hidden;padding:0;border:none;text-decoration:none!important;text-align:center;text-overflow:ellipsis;-webkit-user-select:none;-moz-user-select:none;user-select:none;white-space:nowrap;width:32px;cursor:pointer}.pdl-btn.pdl-btn-main{margin:0 0 0 10px}.pdl-btn.pdl-btn-sub{position:absolute;background-color:#ffffff80;top:calc((100% - 32px) * var(--pdl-btn-top) / 100);left:calc((100% - 32px) * var(--pdl-btn-left) / 100);z-index:1}.pdl-btn.pdl-btn-sub.presentation{position:fixed;top:50px;right:20px;left:auto;border-radius:8px}.pdl-btn.pdl-btn-sub.manga-viewer{top:80%;right:4px;left:auto;border-radius:8px}.pdl-btn.pdl-btn-sub.self-bookmark{top:calc((100% - 32px) * var(--pdl-btn-self-bookmark-top) / 100);left:calc((100% - 32px) * var(--pdl-btn-self-bookmark-left) / 100)}._history-item>.pdl-btn.pdl-btn-sub{z-index:auto}.pdl-btn.pdl-error{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23EA0000' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")!important}.pdl-btn.pdl-complete{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%2301B468' d='M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z'%3E%3C/path%3E %3C/svg%3E")!important}.pdl-btn.pdl-progress{background-image:none!important;cursor:default!important}.pdl-btn.pdl-progress:after{content:"";display:inline-block;position:absolute;top:50%;left:50%;width:27px;height:27px;transform:translate(-50%,-50%);-webkit-mask:radial-gradient(transparent,transparent 54%,#000 57%,#000);mask:radial-gradient(transparent,transparent 54%,#000 57%,#000);border-radius:50%}.pdl-btn.pdl-progress:not(:empty):after{background:conic-gradient(#01b468 0,#01b468 var(--pdl-progress),transparent var(--pdl-progress),transparent);transition:--pdl-progress .2s ease}.pdl-btn.pdl-progress:empty:after{background:conic-gradient(#01b468 0,#01b468 25%,#01b46833 25%,#01b46833);animation:1.5s infinite linear pdl_loading}.pdl-btn.pdl-tag{height:auto;border-top-right-radius:4px;border-bottom-right-radius:4px;left:-1px;background-color:var(--pdl-btn1);transition:background-image .5s}.pdl-btn.pdl-tag:hover{background-color:var(--pdl-btn1-hover)}.pdl-btn.pdl-modal-tag{position:absolute;right:65px;top:6px;background-origin:content-box;border-radius:4px;padding:5px;width:42px;height:50px;background-color:var(--pdl-btn1);transition:.25s background-color}.pdl-btn.pdl-modal-tag:hover{background-color:var(--pdl-btn1-hover)}.pdl-btn.pdl-tag-hide{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E  %3C/svg%3E")!important;pointer-events:none!important}.pdl-wrap-artworks{position:absolute;right:8px;top:0;bottom:0;margin-top:40px;z-index:1}.pdl-wrap-artworks.rule34{bottom:calc(22px + 1em)}.pdl-wrap-artworks .pdl-btn-sub.artworks{position:sticky;top:40px;left:0}:root .pdl-btn-main{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%233C3C3C' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root[data-theme=default] .pdl-btn-main{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%233C3C3C' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}@media (prefers-color-scheme: light){:root .pdl-btn-main{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%233C3C3C' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}}:root[data-theme=dark] .pdl-btn-main{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}@media (prefers-color-scheme: dark){:root .pdl-btn-main{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}}`;
  class SiteInject {
    constructor() {
      __publicField(this, "modal");
      this.inject();
      this.observeColorScheme();
    }
    inject() {
      this.injectApp();
      this.injectStyle();
      _GM_registerMenuCommand(
        t("button.setting"),
        () => {
          var _a;
          if ((_a = this.modal.shadowRoot) == null ? void 0 : _a.querySelector(".modal")) {
            return;
          }
          this.modal.showSetting();
        },
        "s"
      );
      if (config.get("showMsg")) {
        this.modal.setAttribute("updated", "");
        config.set("showMsg", false);
      }
    }
    injectApp() {
      customElements.define(
        "pdl-app",
        create_custom_element(
          App,
          { dark: { type: "Boolean" }, updated: { type: "Boolean" } },
          [],
          ["showChangelog", "showSetting"],
          true
        )
      );
      const modal = document.createElement("pdl-app");
      modal.setAttribute("style", "position:fixed; z-index:99999");
      document.body.append(modal);
      this.modal = modal;
    }
    injectStyle() {
      [util, theme, downloadButton].forEach((style) => _GM_addStyle(style));
      [
        "pdl-btn-self-bookmark-left",
        "pdl-btn-self-bookmark-top",
        "pdl-btn-left",
        "pdl-btn-top"
      ].forEach((key) => {
        let val;
        if ((val = config.get(key)) !== void 0) {
          document.documentElement.style.setProperty("--" + key, val);
        }
      });
    }
    setModalDarkMode() {
      this.modal.setAttribute("dark", "");
    }
    setModalLightMode() {
      this.modal.removeAttribute("dark");
    }
  }
  class Rule34 extends SiteInject {
    inject() {
      super.inject();
      this.pageAction();
    }
    createThumbnailBtn() {
      const btnContainers = document.querySelectorAll(
        ".thumb:not(.blacklisted-image) > a:first-child"
      );
      if (!btnContainers.length) return;
      btnContainers.forEach((el) => {
        el.style.display = "inline-block";
        el.style.position = "relative";
        const imgEl = el.querySelector("img");
        imgEl.style.boxSizing = "border-box";
        let aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
        aspectRatio > 1 && (el.style.height = "inherit");
        imgEl.onload = () => {
          aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
          aspectRatio > 1 && (el.style.height = "inherit");
        };
        const idMathch = new RegExp("(?<=&id=)\\d+").exec(el.href);
        if (!idMathch) return;
        const id = idMathch[0];
        el.appendChild(
          new ThumbnailButton({
            id,
            onClick: downloadArtwork$2
          })
        );
      });
    }
    createArtworkBtn(id) {
      const btnContainer = document.querySelector("div.flexi > div");
      btnContainer.style.position = "relative";
      const wrapper = document.createElement("div");
      wrapper.classList.add("pdl-wrap-artworks", "rule34");
      const btn = new ThumbnailButton({
        id,
        type: ThumbnailBtnType.Gallery,
        onClick: downloadArtwork$2
      });
      wrapper.appendChild(btn);
      btnContainer.appendChild(wrapper);
    }
    pageAction() {
      const query = location.search;
      if (!query) return;
      const searchParams = new URLSearchParams(query);
      const page = searchParams.get("page");
      const s = searchParams.get("s");
      if (page === "post" && s === "view") {
        if (!document.querySelector("#image, #gelcomVideoPlayer")) return;
        const id = searchParams.get("id");
        this.createArtworkBtn(id);
      } else {
        this.createThumbnailBtn();
      }
    }
    observeColorScheme() {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      if (query.matches) {
        this.setModalDarkMode();
      }
      query.addEventListener("change", (e) => {
        e.matches ? this.setModalDarkMode() : this.setModalLightMode();
      });
    }
  }
  async function addBookmark$1(id) {
    var _a;
    try {
      const token = (_a = document.head.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content;
      if (!token) throw new Error("Can not get csrf-token");
      const res = await fetch("/favorites?post_id=" + id, {
        method: "POST",
        headers: {
          "X-Csrf-Token": token
        }
      });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const galleryMatch = new RegExp("(?<=^\\/posts\\/)\\d+").exec(location.pathname);
      if (galleryMatch && id !== galleryMatch[0]) {
        _unsafeWindow.Danbooru.Utility.notice("You have favorited " + id);
      } else {
        const script = await res.text();
        evalScript(script);
      }
    } catch (error) {
      logger.error(error);
    }
  }
  const danbooruParser = {
    async getDoc(url2) {
      const res = await fetch(url2);
      if (!res.ok) throw new RequestError("Request failed with status code " + res.status, res);
      const html = await res.text();
      return new DOMParser().parseFromString(html, "text/html");
    },
    async parse(id) {
      var _a, _b, _c;
      const doc = await this.getDoc("/posts/" + id);
      const src = (_a = doc.querySelector("a[download]")) == null ? void 0 : _a.href;
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
      const postDate = ((_b = doc.querySelector("time")) == null ? void 0 : _b.getAttribute("datetime")) ?? "";
      const source = (_c = doc.querySelector("li#post-info-source > a")) == null ? void 0 : _c.href;
      if (source) tags.push("source:" + source);
      return {
        id,
        src,
        extendName,
        artist: artists.join(",") || "UnknownArtist",
        character: characters.join(",") || "UnknownCharacter",
        title,
        tags,
        createDate: postDate
      };
    },
    async getPoolPostCount(poolId) {
      const doc = await this.getDoc(`/pools/${poolId}`);
      const nextEl = doc.querySelector("a.paginator-next");
      if (nextEl) {
        const lastPageEl = nextEl.previousElementSibling;
        const poolPageCount = Number(lastPageEl.textContent);
        const lastPageDoc = await this.getDoc(lastPageEl.href);
        const postPerPage = Number(lastPageDoc.body.getAttribute("data-current-user-per-page"));
        const lastPagePostCount = lastPageDoc.querySelectorAll(
          ".posts-container article"
        ).length;
        return (poolPageCount - 1) * postPerPage + lastPagePostCount;
      } else {
        const imageContainers = doc.querySelectorAll(".posts-container article");
        return imageContainers.length;
      }
    },
    async *genIdByPool(poolId, filter) {
      let page = 0;
      let nextUrl;
      do {
        ++page > 1 && await sleep(1e3);
        const doc = await this.getDoc(`/pools/${poolId}?page=${page}`);
        const nextEl = doc.querySelector("a.paginator-next");
        nextUrl = (nextEl == null ? void 0 : nextEl.getAttribute("href")) ?? "";
        const imageContainers = doc.querySelectorAll(".posts-container article");
        const ids = Array.from(imageContainers).map((el) => el.getAttribute("data-id"));
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          const isValid = await (filter == null ? void 0 : filter(id)) ?? true;
          if (isValid) {
            yield id;
            i !== id.length - 1 && await sleep(1e3);
          }
        }
      } while (nextUrl);
    }
  };
  function artworkProgressFactory(btn) {
    if (!btn) return;
    return function onArtworkProgress(progress) {
      btn.setProgress(progress);
    };
  }
  class DanbooruDownloadConfig extends DownloadConfigBuilder {
    constructor(meta) {
      super(meta);
      this.meta = meta;
    }
    getDownloadConfig(btn) {
      return {
        taskId: Math.random().toString(36).slice(2),
        src: this.meta.src,
        path: this.buildFilePath(),
        source: this.meta,
        timeout: this.isImage() ? 6e4 : void 0,
        onProgress: artworkProgressFactory(btn)
      };
    }
    buildFilePath() {
      const path = super.buildFilePath();
      return path.replaceAll("{character}", this.normalizeString(this.meta.character));
    }
  }
  async function downloadArtwork$1(btn) {
    downloader.dirHandleCheck();
    const id = btn.getAttribute("pdl-id");
    const mediaMeta = await danbooruParser.parse(id);
    const { tags, artist, title } = mediaMeta;
    const downloadConfigs = new DanbooruDownloadConfig(mediaMeta).getDownloadConfig(btn);
    config.get("addBookmark") && addBookmark$1(id);
    await downloader.download(downloadConfigs);
    const historyData = {
      pid: Number(id),
      user: artist,
      title,
      tags
    };
    historyDb.add(historyData);
  }
  async function downloadPoolArtwork(btn) {
    downloader.dirHandleCheck();
    const poolId = btn.getAttribute("pdl-id");
    const promises = [];
    const postCount = await danbooruParser.getPoolPostCount(poolId);
    let completed = 0;
    const filter = async (id) => !await historyDb.has(id);
    const idGen = danbooruParser.genIdByPool(poolId, filter);
    for await (const id of idGen) {
      const mediaMeta = await danbooruParser.parse(id);
      const downloadConfigs = new DanbooruDownloadConfig(mediaMeta).getDownloadConfig();
      const p = downloader.download(downloadConfigs).then(() => {
        completed++;
        btn.setProgress(completed / postCount * 100);
      }).then(() => {
        const { tags, artist, title } = mediaMeta;
        const historyData = {
          pid: Number(id),
          user: artist,
          title,
          tags
        };
        historyDb.add(historyData);
      });
      promises.push(p);
    }
    const results = await Promise.allSettled(promises);
    const rejectedTasks = results.filter(
      (result) => result.status === "rejected"
    );
    if (rejectedTasks.length) {
      rejectedTasks.length > 1 && logger.error(rejectedTasks);
      throw rejectedTasks[0].reason;
    }
  }
  class Danbooru extends SiteInject {
    inject() {
      super.inject();
      this.pageAction();
    }
    createThumbnailBtn() {
      const btnContainers = document.querySelectorAll(
        "article a.post-preview-link"
      );
      if (!btnContainers.length) return;
      btnContainers.forEach((el) => {
        var _a;
        const id = (_a = new RegExp("(?<=\\/posts\\/)\\d+").exec(el.href)) == null ? void 0 : _a[0];
        if (!id) return;
        const btn = new ThumbnailButton({
          id,
          onClick: downloadArtwork$1
        });
        el.appendChild(btn);
      });
    }
    createArtworkBtn(id) {
      const btnContainer = document.querySelector("section.image-container");
      const btn = new ThumbnailButton({
        id,
        type: ThumbnailBtnType.Gallery,
        onClick: downloadArtwork$1
      });
      const wrapper = document.createElement("div");
      wrapper.classList.add("pdl-wrap-artworks");
      wrapper.appendChild(btn);
      btnContainer.appendChild(wrapper);
    }
    createPoolThumbnailBtn() {
      const btnContainers = document.querySelectorAll(
        "article a.post-preview-link"
      );
      if (!btnContainers.length) return;
      btnContainers.forEach((el) => {
        var _a;
        const poolId = (_a = new RegExp("(?<=\\/pools\\/)\\d+").exec(el.href)) == null ? void 0 : _a[0];
        if (!poolId) return;
        const btn = new ThumbnailButton({
          id: poolId,
          type: ThumbnailBtnType.DanbooruPool,
          onClick: downloadPoolArtwork
        });
        el.appendChild(btn);
      });
    }
    pageAction() {
      const path = location.pathname;
      if (/^\/posts\/\d+/.test(path)) {
        const imageContainer = document.querySelector(
          "section.image-container:not(.blacklisted-active)"
        );
        if (!imageContainer) return;
        const id = imageContainer.getAttribute("data-id");
        this.createArtworkBtn(id);
        this.createThumbnailBtn();
      } else if (/^\/pools\/gallery/.test(path)) {
        this.createPoolThumbnailBtn();
      } else {
        this.createThumbnailBtn();
      }
    }
    observeColorScheme() {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      let uaPreferDark = query.matches;
      const siteSetting = document.body.getAttribute("data-current-user-theme");
      const sitePreferDark = siteSetting === "dark";
      if (sitePreferDark || siteSetting === "auto" && uaPreferDark) {
        this.setModalDarkMode();
      }
      if (siteSetting === "auto") {
        query.addEventListener("change", (e) => {
          uaPreferDark = e.matches;
          uaPreferDark ? this.setModalDarkMode() : this.setModalLightMode();
        });
      }
    }
  }
  const regexp = {
    preloadData: /"meta-preload-data" content='(.*?)'>/,
    globalData: /"meta-global-data" content='(.*?)'>/,
    artworksPage: /artworks\/(\d+)$/,
    userPage: /\/users\/(\d+)$|\/users\/(\d+)\/(?!following|mypixiv|followers)/,
    bookmarkPage: /users\/(\d+)\/bookmarks\/artworks/,
    userPageTags: /users\/\d+\/(artworks|illustrations|manga|bookmarks(?=\/artworks))/,
    searchPage: /\/tags\/.*\/(artworks|illustrations|manga)/,
    suscribePage: /bookmark_new_illust/,
    activityHref: /illust_id=(\d+)/,
    originSrcPageNum: new RegExp("(?<=_p)\\d+"),
    followLatest: /\/bookmark_new_illust(?:_r18)?\.php/,
    historyPage: /\/history\.php/,
    historyThumbnailsId: /\d+(?=_)/
  };
  function getSelfId() {
    var _a, _b;
    return ((_b = (_a = _unsafeWindow.dataLayer) == null ? void 0 : _a[0]) == null ? void 0 : _b.user_id) ?? "";
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
    } else if (node.className.includes("_history-item")) {
      const result = regexp.historyThumbnailsId.exec(node.getAttribute("style") || "");
      if (result) return result[0];
    } else {
      const isActivityThumb = regexp.activityHref.exec(node.getAttribute("href") || "");
      if (isActivityThumb && node.classList.contains("work")) {
        return isActivityThumb[1];
      }
    }
    return "";
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
  function createService() {
    async function _requestJson(url2, init2) {
      logger.info("fetch url:", url2);
      const res = await fetch(url2, init2);
      if (!res.ok)
        throw new RequestError("Request " + url2 + " failed with status code " + res.status, res);
      const data2 = await res.json();
      if (data2.error) throw new JsonDataError(data2.message);
      return data2.body;
    }
    return {
      async getJson(url2) {
        return await _requestJson(url2);
      },
      async getArtworkHtml(illustId) {
        logger.info("Fetch illust:", illustId);
        let params = "";
        const tagLang = config.get("tagLang");
        if (tagLang !== "ja") params = "?lang=" + tagLang;
        const res = await fetch("https://www.pixiv.net/artworks/" + illustId + params);
        if (!res.ok) throw new RequestError("Request failed with status code " + res.status, res);
        return await res.text();
      },
      addBookmark(illustId, token, tags = [], restrict = BookmarkRestrict.public) {
        return _requestJson("/ajax/illusts/bookmarks/add", {
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
      },
      getFollowLatestWorks(page, mode = "all") {
        return _requestJson(
          `/ajax/follow_latest/illust?p=${page}&mode=${mode}&lang=jp`
        );
      },
      getUserAllProfile(userId) {
        return _requestJson("/ajax/user/" + userId + "/profile/all");
      },
      getUgoiraMeta(illustId) {
        return _requestJson("/ajax/illust/" + illustId + "/ugoira_meta");
      },
      getArtworkDetail(illustId) {
        let params = "";
        const tagLang = config.get("tagLang");
        if (tagLang !== "ja") params = "?lang=" + tagLang;
        return _requestJson("/ajax/illust/" + illustId + params);
      }
    };
  }
  const api = createService();
  function addBookmark(btn, illustId, token, tags) {
    if (!config.get("addBookmark")) return;
    api.addBookmark(
      illustId,
      token,
      config.get("addBookmarkWithTags") ? tags : [],
      config.get("privateR18") && tags.includes("R-18") ? BookmarkRestrict.private : BookmarkRestrict.public
    ).then(() => {
      const bookmarkBtnRef = findBookmarkBtn(btn);
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
      }
    }).catch((reason) => {
      logger.error(reason.message);
    });
  }
  function findBookmarkBtn(btn) {
    var _a, _b, _c, _d, _e;
    const bookmarkBtnRef = {};
    if (!btn.getAttribute("type")) {
      const favBtn = (_b = (_a = btn.parentElement) == null ? void 0 : _a.nextElementSibling) == null ? void 0 : _b.querySelector(
        'button[type="button"]'
      );
      if (favBtn) {
        bookmarkBtnRef.kind = "sub";
        bookmarkBtnRef.button = favBtn;
      } else {
        const favBtn2 = (_c = btn.parentElement) == null ? void 0 : _c.querySelector("div._one-click-bookmark");
        if (favBtn2) {
          bookmarkBtnRef.kind = "rank";
          bookmarkBtnRef.button = favBtn2;
        }
      }
    } else if (btn.getAttribute("type") === ThumbnailBtnType.PixivToolbar) {
      const favBtn = (_e = (_d = btn.parentElement) == null ? void 0 : _d.parentElement) == null ? void 0 : _e.querySelector(
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
  function isValidIllustType(illustType, option) {
    switch (illustType) {
      case IllustType.illusts:
        if (option.filterIllusts) return true;
        break;
      case IllustType.manga:
        if (option.filterManga) return true;
        break;
      case IllustType.ugoira:
        if (option.filterUgoira) return true;
        break;
      default:
        throw new Error("Invalid filter type");
    }
    return false;
  }
  async function filterWorks(works, option) {
    const obj = {
      unavaliable: [],
      avaliable: [],
      invalid: []
    };
    for (const work of works) {
      if (!work.isBookmarkable) {
        obj.unavaliable.push(work.id);
      } else if (option.filterExcludeDownloaded && await historyDb.has(work.id)) {
        obj.invalid.push(work.id);
      } else if (!isValidIllustType(work.illustType, option)) {
        obj.invalid.push(work.id);
      } else {
        obj.avaliable.push(work.id);
      }
    }
    return obj;
  }
  const pixivParser = {
    async parse(illustId) {
      const htmlText = await api.getArtworkHtml(illustId);
      const preloadDataText = htmlText.match(regexp.preloadData);
      if (!preloadDataText) throw new Error("Fail to parse preload data.");
      const globalDataText = htmlText.match(regexp.globalData);
      if (!globalDataText) throw new Error("Fail to parse global data.");
      const preloadData = JSON.parse(preloadDataText[1]);
      const globalData = JSON.parse(globalDataText[1]);
      const illustData = preloadData.illust[illustId];
      const {
        illustType,
        userName,
        userId,
        illustTitle,
        tags,
        pageCount,
        createDate,
        urls,
        bookmarkData
      } = illustData;
      const { token } = globalData;
      const tagsArr = [];
      const tagsTranslatedArr = [];
      tags.tags.forEach((tagData) => {
        var _a;
        tagsArr.push(tagData.tag);
        tagsTranslatedArr.push(((_a = tagData.translation) == null ? void 0 : _a.en) || tagData.tag);
      });
      const meta = {
        id: illustId,
        src: urls.original,
        extendName: urls.original.slice(-3),
        artist: userName,
        title: illustTitle,
        tags: tagsArr,
        tagsTranslated: tagsTranslatedArr,
        userId,
        pageCount,
        bookmarkData,
        createDate,
        token
      };
      if (illustType === IllustType.ugoira) {
        return {
          ...meta,
          illustType,
          ugoiraMeta: await api.getUgoiraMeta(illustId)
        };
      } else {
        return {
          ...meta,
          illustType
        };
      }
    },
    async getFollowLatestGenerator(filterOption, mode, page) {
      const MAX_PAGE = 34;
      const MAX_ILLUSTS_PER_PAGE = 60;
      let lastId;
      let total;
      let data2;
      let cache;
      function findLastId(ids) {
        return Math.min(...ids.map((id) => Number(id)));
      }
      if (page === void 0) {
        data2 = await api.getFollowLatestWorks(1, mode);
        const ids = data2.page.ids;
        total = ids.length;
        lastId = findLastId(ids);
        if (total === MAX_ILLUSTS_PER_PAGE) {
          const secondPageData = await api.getFollowLatestWorks(2, mode);
          const secondIds = secondPageData.page.ids;
          const secondLastId = findLastId(secondIds);
          if (secondLastId < lastId) {
            lastId = secondLastId;
            cache = secondPageData;
            total += secondIds.length;
          }
        }
      } else {
        data2 = await api.getFollowLatestWorks(page, mode);
        total = data2.page.ids.length;
      }
      async function* generateIds() {
        yield await filterWorks(data2.thumbnails.illust, filterOption);
        if (page === void 0) {
          if (total === MAX_ILLUSTS_PER_PAGE) return;
          if (total < MAX_ILLUSTS_PER_PAGE * 2) {
            yield await filterWorks(cache.thumbnails.illust, filterOption);
            return;
          }
          let currentPage = 3;
          while (currentPage <= MAX_PAGE) {
            const data22 = await api.getFollowLatestWorks(currentPage, mode);
            const ids = data22.page.ids;
            const pageLastId = findLastId(ids);
            if (pageLastId >= lastId) {
              logger.info("getFollowLatestGenerator: got duplicate works");
              yield await filterWorks(cache.thumbnails.illust, filterOption);
              break;
            }
            lastId = pageLastId;
            total += ids.length;
            yield { ...await filterWorks(cache.thumbnails.illust, filterOption), total };
            cache = data22;
            currentPage++;
            await sleep(3e3);
          }
        }
      }
      return {
        total,
        generator: generateIds()
      };
    },
    async getChunksGenerator(userId, category, tag, rest, filterOption) {
      const OFFSET = 48;
      let requestUrl;
      if (category === "bookmarks") {
        requestUrl = `https://www.pixiv.net/ajax/user/${userId}/illusts/bookmarks?tag=${tag}&offset=0&limit=${OFFSET}&rest=${rest}&lang=ja`;
      } else {
        requestUrl = `https://www.pixiv.net/ajax/user/${userId}/${category}/tag?tag=${tag}&offset=0&limit=${OFFSET}&lang=ja`;
      }
      let head = 0;
      const firstPageData = await api.getJson(requestUrl);
      const total = firstPageData.total;
      async function* generateIds() {
        yield await filterWorks(firstPageData.works, filterOption);
        head += OFFSET;
        while (head < total) {
          const data2 = await api.getJson(
            requestUrl.replace("offset=0", "offset=" + head)
          );
          head += OFFSET;
          await sleep(3e3);
          yield await filterWorks(data2.works, filterOption);
        }
      }
      return {
        total,
        generator: generateIds()
      };
    },
    async getAllWorksGenerator(userId, filterOption) {
      const profile = await api.getUserAllProfile(userId);
      let illustIds = [];
      let mangaIds = [];
      if ((filterOption.filterIllusts || filterOption.filterUgoira) && typeof profile.illusts === "object") {
        illustIds.push(...Object.keys(profile.illusts).reverse());
      }
      if (filterOption.filterManga && typeof profile.manga === "object") {
        mangaIds.push(...Object.keys(profile.manga).reverse());
      }
      if (filterOption.filterExcludeDownloaded) {
        const filteredIllustIds = [];
        for (const id of illustIds) {
          const isDownloaded = await historyDb.has(id);
          !isDownloaded && filteredIllustIds.push(id);
        }
        illustIds = filteredIllustIds;
        const filteredMangaIds = [];
        for (const id of mangaIds) {
          const isDownloaded = await historyDb.has(id);
          !isDownloaded && filteredMangaIds.push(id);
        }
        mangaIds = filteredMangaIds;
      }
      async function* generateIds() {
        const OFFSET = 48;
        const baseUrl = "https://www.pixiv.net/ajax/user/" + userId + "/profile/illusts";
        let workCategory = "illust";
        while (illustIds.length > 0) {
          let searchStr = "?";
          const chunk = illustIds.splice(0, OFFSET);
          searchStr += chunk.map((id) => "ids[]=" + id).join("&") + `&work_category=${workCategory}&is_first_page=0&lang=ja`;
          const data2 = await api.getJson(baseUrl + searchStr);
          await sleep(3e3);
          yield await filterWorks(Object.values(data2.works).reverse(), filterOption);
        }
        workCategory = "manga";
        while (mangaIds.length > 0) {
          let searchStr = "?";
          const chunk = mangaIds.splice(0, OFFSET);
          searchStr += chunk.map((id) => "ids[]=" + id).join("&") + `&work_category=${workCategory}&is_first_page=0&lang=ja`;
          const data2 = await api.getJson(baseUrl + searchStr);
          await sleep(3e3);
          yield await filterWorks(Object.values(data2.works).reverse(), filterOption);
        }
      }
      return {
        total: illustIds.length + mangaIds.length,
        generator: generateIds()
      };
    }
  };
  function createCompressor() {
    const zip = new JSZip();
    return {
      add(id, name, data2) {
        var _a;
        (_a = zip.folder(id)) == null ? void 0 : _a.file(name, data2);
      },
      bundle(id, comment) {
        const folder = zip.folder(id);
        if (!folder) throw new TypeError("no such folder:" + id);
        return folder.generateAsync({ type: "blob", comment });
      },
      remove(ids) {
        if (typeof ids === "string") {
          zip.remove(ids);
        } else {
          const dirs = zip.filter((_, file) => file.dir).map((dir) => dir.name);
          const dirsToDel = ids.filter((id) => dirs.some((dir) => dir.includes(id)));
          dirsToDel.forEach((dir) => zip.remove(dir));
          logger.info("Compressor: Remove", zip);
        }
      },
      fileCount(id) {
        var _a;
        let count = 0;
        (_a = zip.folder(id)) == null ? void 0 : _a.forEach(() => count++);
        return count;
      },
      async unzip(data2) {
        const id = Math.random().toString(36);
        let folder = zip.folder(id);
        if (!folder) throw TypeError("Can not get new root folder");
        const filesPromises = [];
        folder = await folder.loadAsync(data2);
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
  const gifWorker = (() => GM_getResourceText("gif.js/dist/gif.worker?raw"))();
  const workerUrl$2 = URL.createObjectURL(new Blob([gifWorker], { type: "text/javascript" }));
  function gif(frames, convertMeta) {
    return Promise.all(frames.map((frame) => createImageBitmap(frame))).then(
      (bitmaps) => {
        return new Promise((resolve, reject) => {
          logger.info("Start convert:", convertMeta.id);
          logger.time(convertMeta.id);
          const canvas = document.createElement("canvas");
          const width = canvas.width = bitmaps[0].width;
          const height = canvas.height = bitmaps[0].height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          const gif2 = new GIF({
            workers: 2,
            quality: config.get("gifQuality"),
            width,
            height,
            workerScript: workerUrl$2
          });
          convertMeta.abort = () => {
            gif2.abort();
          };
          bitmaps.forEach((bitmap, i) => {
            ctx.drawImage(bitmap, 0, 0);
            gif2.addFrame(ctx, {
              copy: true,
              delay: convertMeta.source.delays[i]
            });
          });
          gif2.on("progress", (progress) => {
            var _a;
            (_a = convertMeta.onProgress) == null ? void 0 : _a.call(convertMeta, progress * 100);
          });
          gif2.on("finished", (gifBlob) => {
            logger.timeEnd(convertMeta.id);
            resolve(gifBlob);
          });
          gif2.on("abort", () => {
            logger.timeEnd(convertMeta.id);
            logger.warn("Convert stop manually. " + convertMeta.id);
            convertMeta.isAborted = true;
            reject(new CancelError());
          });
          gif2.render();
        });
      }
    );
  }
  const pngWorkerFragment = "onmessage = async (evt) => {\n  const { frames, delay, cnum = 256 } = evt.data;\n  const bitmaps = await Promise.all(frames.map((blob) => createImageBitmap(blob)));\n\n  const width = bitmaps[0].width;\n  const height = bitmaps[0].height;\n  const canvas = new OffscreenCanvas(width, height);\n  const ctx = canvas.getContext('2d', { willReadFrequently: true });\n  const u8arrs = [];\n\n  for (let i = 0; i < bitmaps.length; i++) {\n    ctx?.drawImage(bitmaps[i], 0, 0);\n    u8arrs.push(ctx?.getImageData(0, 0, width, height).data);\n  }\n\n  const png = UPNG.encode(u8arrs, width, height, cnum, delay, { loop: 0 });\n  if (!png) console.error('Convert Apng failed.');\n  postMessage(png, [png]);\n};\n";
  const UPNG = (() => GM_getResourceText("upng-js?raw"))();
  const pako = (() => GM_getResourceText("pako?raw"))();
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
  function png(frames, convertMeta) {
    return new Promise((resolve, reject) => {
      logger.info("Start convert:", convertMeta.id);
      logger.time(convertMeta.id);
      let worker;
      if (freeApngWorkers.length) {
        worker = freeApngWorkers.shift();
        logger.info("Reuse apng workers.");
      } else {
        worker = new Worker(workerUrl$1);
      }
      convertMeta.abort = () => {
        logger.timeEnd(convertMeta.id);
        logger.warn("Convert stop manually. " + convertMeta.id);
        reject(new CancelError());
        convertMeta.isAborted = true;
        worker.terminate();
      };
      worker.onmessage = function(e) {
        freeApngWorkers.push(worker);
        logger.timeEnd(convertMeta.id);
        if (!e.data) {
          return reject(new TypeError("Failed to get png data. " + convertMeta.id));
        }
        const pngBlob = new Blob([e.data], { type: "image/png" });
        resolve(pngBlob);
      };
      const delay = convertMeta.source.delays;
      const cfg = { frames, delay, cnum: config.get("pngColor") };
      worker.postMessage(cfg);
    });
  }
  const webpWorkerFragment = "// Lossless encoding (0=lossy(default), 1=lossless).\n// quality: between 0 and 100. For lossy, 0 gives the smallest\n// size and 100 the largest. For lossless, this\n// parameter is the amount of effort put into the\n// compression: 0 is the fastest but gives larger\n// files compared to the slowest, but best, 100.\n// method: quality/speed trade-off (0=fast, 6=slower-better)\n\nlet webpApi = {};\nModule.onRuntimeInitialized = () => {\n  webpApi = {\n    init: Module.cwrap('init', '', ['number', 'number', 'number']),\n    createBuffer: Module.cwrap('createBuffer', 'number', ['number']),\n    addFrame: Module.cwrap('addFrame', 'number', ['number', 'number', 'number']),\n    generate: Module.cwrap('generate', 'number', []),\n    freeResult: Module.cwrap('freeResult', '', []),\n    getResultPointer: Module.cwrap('getResultPointer', 'number', []),\n    getResultSize: Module.cwrap('getResultSize', 'number', [])\n  };\n\n  postMessage('ok');\n};\n\nonmessage = async (evt) => {\n  const { frames, delays, lossless = 0, quality = 95, method = 4 } = evt.data;\n\n  webpApi.init(lossless, quality, method);\n\n  const bitmaps = await Promise.all(frames.map((blob) => createImageBitmap(blob)));\n  const width = bitmaps[0].width;\n  const height = bitmaps[0].height;\n  const canvas = new OffscreenCanvas(width, height);\n  const ctx = canvas.getContext('2d');\n\n  for (let i = 0; i < bitmaps.length; i++) {\n    ctx?.drawImage(bitmaps[i], 0, 0);\n    const webpBlob = await canvas.convertToBlob({\n      type: 'image/webp',\n      quality: lossless ? 1 : quality / 100\n    });\n    const buffer = await webpBlob.arrayBuffer();\n    const u8a = new Uint8Array(buffer);\n    const pointer = webpApi.createBuffer(u8a.length);\n\n    Module.HEAPU8.set(u8a, pointer);\n    webpApi.addFrame(pointer, u8a.length, delays[i]);\n    postMessage(((i + 1) / bitmaps.length) * 100);\n  }\n\n  webpApi.generate();\n  const resultPointer = webpApi.getResultPointer();\n  const resultSize = webpApi.getResultSize();\n  const result = new Uint8Array(Module.HEAP8.buffer, resultPointer, resultSize);\n  postMessage(result);\n  webpApi.freeResult();\n};\n";
  const webpWasm = (() => GM_getResourceText("../wasm/toWebpWorker?raw"))();
  const workerUrl = URL.createObjectURL(
    new Blob([webpWasm + webpWorkerFragment], { type: "text/javascript" })
  );
  const freeWebpWorkers = [];
  function webp(frames, convertMeta) {
    return new Promise((resolve, reject) => {
      logger.time(convertMeta.id);
      let worker;
      if (freeWebpWorkers.length) {
        logger.info("Reuse webp workers.");
        worker = freeWebpWorkers.shift();
        resolve(worker);
      } else {
        worker = new Worker(workerUrl);
        worker.onmessage = (evt) => {
          if (evt.data === "ok") {
            logger.info("Webp worker loaded.");
            resolve(worker);
          } else {
            reject(evt.data);
          }
        };
      }
    }).then((worker) => {
      if (convertMeta.isAborted) {
        freeWebpWorkers.push(worker);
        logger.timeEnd(convertMeta.id);
        logger.warn("Convert stop manually." + convertMeta.id);
        throw new CancelError();
      }
      return new Promise((resolve, reject) => {
        worker.onmessage = (evt) => {
          var _a;
          if (convertMeta.isAborted) {
            worker.terminate();
            logger.timeEnd(convertMeta.id);
            logger.warn("Convert stop manually." + convertMeta.id);
            reject(new CancelError());
          } else {
            const data2 = evt.data;
            if (typeof data2 !== "object") {
              (_a = convertMeta.onProgress) == null ? void 0 : _a.call(convertMeta, evt.data);
            } else {
              logger.timeEnd(convertMeta.id);
              freeWebpWorkers.push(worker);
              resolve(new Blob([evt.data], { type: "image/webp" }));
            }
          }
        };
        const delays = convertMeta.source.delays;
        worker.postMessage({
          frames,
          delays,
          lossless: Number(config.get("losslessWebp")),
          quality: config.get("webpQuality"),
          method: config.get("webpMehtod")
        });
      });
    });
  }
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var WebMWriter$1 = { exports: {} };
  (function(module) {
    (function() {
      function extend(base, top) {
        let target = {};
        [base, top].forEach(function(obj) {
          for (let prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
              target[prop] = obj[prop];
            }
          }
        });
        return target;
      }
      function decodeBase64WebPDataURL(url2) {
        if (typeof url2 !== "string" || !url2.match(/^data:image\/webp;base64,/i)) {
          throw new Error("Failed to decode WebP Base64 URL");
        }
        return window.atob(url2.substring("data:image/webp;base64,".length));
      }
      function renderAsWebP(canvas, quality) {
        let frame = typeof canvas === "string" && /^data:image\/webp/.test(canvas) ? canvas : canvas.toDataURL("image/webp", quality);
        return decodeBase64WebPDataURL(frame);
      }
      function byteStringToUint32LE(string) {
        let a = string.charCodeAt(0), b = string.charCodeAt(1), c = string.charCodeAt(2), d = string.charCodeAt(3);
        return (a | b << 8 | c << 16 | d << 24) >>> 0;
      }
      function extractKeyframeFromWebP(webP) {
        let cursor = webP.indexOf("VP8", 12);
        if (cursor === -1) {
          throw new Error("Bad image format, does this browser support WebP?");
        }
        let hasAlpha = false;
        while (cursor < webP.length - 8) {
          let chunkLength, fourCC;
          fourCC = webP.substring(cursor, cursor + 4);
          cursor += 4;
          chunkLength = byteStringToUint32LE(webP.substring(cursor, cursor + 4));
          cursor += 4;
          switch (fourCC) {
            case "VP8 ":
              return {
                frame: webP.substring(cursor, cursor + chunkLength),
                hasAlpha
              };
            case "ALPH":
              hasAlpha = true;
              break;
          }
          cursor += chunkLength;
          if ((chunkLength & 1) !== 0) {
            cursor++;
          }
        }
        throw new Error("Failed to find VP8 keyframe in WebP image, is this image mistakenly encoded in the Lossless WebP format?");
      }
      const EBML_SIZE_UNKNOWN = -1, EBML_SIZE_UNKNOWN_5_BYTES = -2;
      function EBMLFloat32(value) {
        this.value = value;
      }
      function EBMLFloat64(value) {
        this.value = value;
      }
      function writeEBML(buffer, bufferFileOffset, ebml) {
        if (Array.isArray(ebml)) {
          for (let i = 0; i < ebml.length; i++) {
            writeEBML(buffer, bufferFileOffset, ebml[i]);
          }
        } else if (typeof ebml === "string") {
          buffer.writeString(ebml);
        } else if (ebml instanceof Uint8Array) {
          buffer.writeBytes(ebml);
        } else if (ebml.id) {
          ebml.offset = buffer.pos + bufferFileOffset;
          buffer.writeUnsignedIntBE(ebml.id);
          if (Array.isArray(ebml.data)) {
            let sizePos, dataBegin, dataEnd;
            if (ebml.size === EBML_SIZE_UNKNOWN) {
              buffer.writeByte(255);
            } else if (ebml.size === EBML_SIZE_UNKNOWN_5_BYTES) {
              sizePos = buffer.pos;
              buffer.writeBytes([15, 255, 255, 255, 255]);
            } else {
              sizePos = buffer.pos;
              buffer.writeBytes([0, 0, 0, 0]);
            }
            dataBegin = buffer.pos;
            ebml.dataOffset = dataBegin + bufferFileOffset;
            writeEBML(buffer, bufferFileOffset, ebml.data);
            if (ebml.size !== EBML_SIZE_UNKNOWN && ebml.size !== EBML_SIZE_UNKNOWN_5_BYTES) {
              dataEnd = buffer.pos;
              ebml.size = dataEnd - dataBegin;
              buffer.seek(sizePos);
              buffer.writeEBMLVarIntWidth(ebml.size, 4);
              buffer.seek(dataEnd);
            }
          } else if (typeof ebml.data === "string") {
            buffer.writeEBMLVarInt(ebml.data.length);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeString(ebml.data);
          } else if (typeof ebml.data === "number") {
            if (!ebml.size) {
              ebml.size = buffer.measureUnsignedInt(ebml.data);
            }
            buffer.writeEBMLVarInt(ebml.size);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeUnsignedIntBE(ebml.data, ebml.size);
          } else if (ebml.data instanceof EBMLFloat64) {
            buffer.writeEBMLVarInt(8);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeDoubleBE(ebml.data.value);
          } else if (ebml.data instanceof EBMLFloat32) {
            buffer.writeEBMLVarInt(4);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeFloatBE(ebml.data.value);
          } else if (ebml.data instanceof Uint8Array) {
            buffer.writeEBMLVarInt(ebml.data.byteLength);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeBytes(ebml.data);
          } else {
            throw new Error("Bad EBML datatype " + typeof ebml.data);
          }
        } else {
          throw new Error("Bad EBML datatype " + typeof ebml.data);
        }
      }
      let WebMWriter2 = function(ArrayBufferDataStream2, BlobBuffer2) {
        return function(options) {
          let MAX_CLUSTER_DURATION_MSEC = 5e3, DEFAULT_TRACK_NUMBER = 1, writtenHeader = false, videoWidth = 0, videoHeight = 0, alphaBuffer = null, alphaBufferContext = null, alphaBufferData = null, clusterFrameBuffer = [], clusterStartTime = 0, clusterDuration = 0, optionDefaults = {
            quality: 0.95,
            // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (WebP lossless) is not supported
            transparent: false,
            // True if an alpha channel should be included in the video
            alphaQuality: void 0,
            // Allows you to set the quality level of the alpha channel separately.
            // If not specified this defaults to the same value as `quality`.
            fileWriter: null,
            // Chrome FileWriter in order to stream to a file instead of buffering to memory (optional)
            fd: null,
            // Node.JS file descriptor to write to instead of buffering (optional)
            // You must supply one of:
            frameDuration: null,
            // Duration of frames in milliseconds
            frameRate: null
            // Number of frames per second
          }, seekPoints = {
            Cues: { id: new Uint8Array([28, 83, 187, 107]), positionEBML: null },
            SegmentInfo: { id: new Uint8Array([21, 73, 169, 102]), positionEBML: null },
            Tracks: { id: new Uint8Array([22, 84, 174, 107]), positionEBML: null }
          }, ebmlSegment, segmentDuration = {
            "id": 17545,
            // Duration
            "data": new EBMLFloat64(0)
          }, seekHead, cues = [], blobBuffer = new BlobBuffer2(options.fileWriter || options.fd);
          function fileOffsetToSegmentRelative(fileOffset) {
            return fileOffset - ebmlSegment.dataOffset;
          }
          function convertAlphaToGrayscaleImage(source) {
            if (alphaBuffer === null || alphaBuffer.width !== source.width || alphaBuffer.height !== source.height) {
              alphaBuffer = document.createElement("canvas");
              alphaBuffer.width = source.width;
              alphaBuffer.height = source.height;
              alphaBufferContext = alphaBuffer.getContext("2d");
              alphaBufferData = alphaBufferContext.createImageData(alphaBuffer.width, alphaBuffer.height);
            }
            let sourceContext = source.getContext("2d"), sourceData = sourceContext.getImageData(0, 0, source.width, source.height).data, destData = alphaBufferData.data, dstCursor = 0, srcEnd = source.width * source.height * 4;
            for (let srcCursor = 3; srcCursor < srcEnd; srcCursor += 4) {
              let alpha = sourceData[srcCursor];
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = 255;
            }
            alphaBufferContext.putImageData(alphaBufferData, 0, 0);
            return alphaBuffer;
          }
          function createSeekHead() {
            let seekPositionEBMLTemplate = {
              "id": 21420,
              // SeekPosition
              "size": 5,
              // Allows for 32GB video files
              "data": 0
              // We'll overwrite this when the file is complete
            }, result = {
              "id": 290298740,
              // SeekHead
              "data": []
            };
            for (let name in seekPoints) {
              let seekPoint = seekPoints[name];
              seekPoint.positionEBML = Object.create(seekPositionEBMLTemplate);
              result.data.push({
                "id": 19899,
                // Seek
                "data": [
                  {
                    "id": 21419,
                    // SeekID
                    "data": seekPoint.id
                  },
                  seekPoint.positionEBML
                ]
              });
            }
            return result;
          }
          function writeHeader() {
            seekHead = createSeekHead();
            let ebmlHeader = {
              "id": 440786851,
              // EBML
              "data": [
                {
                  "id": 17030,
                  // EBMLVersion
                  "data": 1
                },
                {
                  "id": 17143,
                  // EBMLReadVersion
                  "data": 1
                },
                {
                  "id": 17138,
                  // EBMLMaxIDLength
                  "data": 4
                },
                {
                  "id": 17139,
                  // EBMLMaxSizeLength
                  "data": 8
                },
                {
                  "id": 17026,
                  // DocType
                  "data": "webm"
                },
                {
                  "id": 17031,
                  // DocTypeVersion
                  "data": 2
                },
                {
                  "id": 17029,
                  // DocTypeReadVersion
                  "data": 2
                }
              ]
            }, segmentInfo = {
              "id": 357149030,
              // Info
              "data": [
                {
                  "id": 2807729,
                  // TimecodeScale
                  "data": 1e6
                  // Times will be in miliseconds (1e6 nanoseconds per step = 1ms)
                },
                {
                  "id": 19840,
                  // MuxingApp
                  "data": "webm-writer-js"
                },
                {
                  "id": 22337,
                  // WritingApp
                  "data": "webm-writer-js"
                },
                segmentDuration
                // To be filled in later
              ]
            }, videoProperties = [
              {
                "id": 176,
                // PixelWidth
                "data": videoWidth
              },
              {
                "id": 186,
                // PixelHeight
                "data": videoHeight
              }
            ];
            if (options.transparent) {
              videoProperties.push(
                {
                  "id": 21440,
                  // AlphaMode
                  "data": 1
                }
              );
            }
            let tracks = {
              "id": 374648427,
              // Tracks
              "data": [
                {
                  "id": 174,
                  // TrackEntry
                  "data": [
                    {
                      "id": 215,
                      // TrackNumber
                      "data": DEFAULT_TRACK_NUMBER
                    },
                    {
                      "id": 29637,
                      // TrackUID
                      "data": DEFAULT_TRACK_NUMBER
                    },
                    {
                      "id": 156,
                      // FlagLacing
                      "data": 0
                    },
                    {
                      "id": 2274716,
                      // Language
                      "data": "und"
                    },
                    {
                      "id": 134,
                      // CodecID
                      "data": "V_VP8"
                    },
                    {
                      "id": 2459272,
                      // CodecName
                      "data": "VP8"
                    },
                    {
                      "id": 131,
                      // TrackType
                      "data": 1
                    },
                    {
                      "id": 224,
                      // Video
                      "data": videoProperties
                    }
                  ]
                }
              ]
            };
            ebmlSegment = {
              "id": 408125543,
              // Segment
              "size": EBML_SIZE_UNKNOWN_5_BYTES,
              // We'll seek back and fill this in at completion
              "data": [
                seekHead,
                segmentInfo,
                tracks
              ]
            };
            let bufferStream = new ArrayBufferDataStream2(256);
            writeEBML(bufferStream, blobBuffer.pos, [ebmlHeader, ebmlSegment]);
            blobBuffer.write(bufferStream.getAsDataArray());
            seekPoints.SegmentInfo.positionEBML.data = fileOffsetToSegmentRelative(segmentInfo.offset);
            seekPoints.Tracks.positionEBML.data = fileOffsetToSegmentRelative(tracks.offset);
            writtenHeader = true;
          }
          function createBlockGroupForTransparentKeyframe(keyframe) {
            let block, blockAdditions, bufferStream = new ArrayBufferDataStream2(1 + 2 + 1);
            if (!(keyframe.trackNumber > 0 && keyframe.trackNumber < 127)) {
              throw new Error("TrackNumber must be > 0 and < 127");
            }
            bufferStream.writeEBMLVarInt(keyframe.trackNumber);
            bufferStream.writeU16BE(keyframe.timecode);
            bufferStream.writeByte(0);
            block = {
              "id": 161,
              // Block
              "data": [
                bufferStream.getAsDataArray(),
                keyframe.frame
              ]
            };
            blockAdditions = {
              "id": 30113,
              // BlockAdditions
              "data": [
                {
                  "id": 166,
                  // BlockMore
                  "data": [
                    {
                      "id": 238,
                      // BlockAddID
                      "data": 1
                      // Means "BlockAdditional has a codec-defined meaning, pass it to the codec"
                    },
                    {
                      "id": 165,
                      // BlockAdditional
                      "data": keyframe.alpha
                      // The actual alpha channel image
                    }
                  ]
                }
              ]
            };
            return {
              "id": 160,
              // BlockGroup
              "data": [
                block,
                blockAdditions
              ]
            };
          }
          function createSimpleBlockForKeyframe(keyframe) {
            let bufferStream = new ArrayBufferDataStream2(1 + 2 + 1);
            if (!(keyframe.trackNumber > 0 && keyframe.trackNumber < 127)) {
              throw new Error("TrackNumber must be > 0 and < 127");
            }
            bufferStream.writeEBMLVarInt(keyframe.trackNumber);
            bufferStream.writeU16BE(keyframe.timecode);
            bufferStream.writeByte(
              1 << 7
              // Keyframe
            );
            return {
              "id": 163,
              // SimpleBlock
              "data": [
                bufferStream.getAsDataArray(),
                keyframe.frame
              ]
            };
          }
          function createContainerForKeyframe(keyframe) {
            if (keyframe.alpha) {
              return createBlockGroupForTransparentKeyframe(keyframe);
            }
            return createSimpleBlockForKeyframe(keyframe);
          }
          function createCluster(cluster) {
            return {
              "id": 524531317,
              "data": [
                {
                  "id": 231,
                  // Timecode
                  "data": Math.round(cluster.timecode)
                }
              ]
            };
          }
          function addCuePoint(trackIndex, clusterTime, clusterFileOffset) {
            cues.push({
              "id": 187,
              // Cue
              "data": [
                {
                  "id": 179,
                  // CueTime
                  "data": clusterTime
                },
                {
                  "id": 183,
                  // CueTrackPositions
                  "data": [
                    {
                      "id": 247,
                      // CueTrack
                      "data": trackIndex
                    },
                    {
                      "id": 241,
                      // CueClusterPosition
                      "data": fileOffsetToSegmentRelative(clusterFileOffset)
                    }
                  ]
                }
              ]
            });
          }
          function writeCues() {
            let ebml = {
              "id": 475249515,
              "data": cues
            }, cuesBuffer = new ArrayBufferDataStream2(16 + cues.length * 32);
            writeEBML(cuesBuffer, blobBuffer.pos, ebml);
            blobBuffer.write(cuesBuffer.getAsDataArray());
            seekPoints.Cues.positionEBML.data = fileOffsetToSegmentRelative(ebml.offset);
          }
          function flushClusterFrameBuffer() {
            if (clusterFrameBuffer.length === 0) {
              return;
            }
            let rawImageSize = 0;
            for (let i = 0; i < clusterFrameBuffer.length; i++) {
              rawImageSize += clusterFrameBuffer[i].frame.length + (clusterFrameBuffer[i].alpha ? clusterFrameBuffer[i].alpha.length : 0);
            }
            let buffer = new ArrayBufferDataStream2(rawImageSize + clusterFrameBuffer.length * 64), cluster = createCluster({
              timecode: Math.round(clusterStartTime)
            });
            for (let i = 0; i < clusterFrameBuffer.length; i++) {
              cluster.data.push(createContainerForKeyframe(clusterFrameBuffer[i]));
            }
            writeEBML(buffer, blobBuffer.pos, cluster);
            blobBuffer.write(buffer.getAsDataArray());
            addCuePoint(DEFAULT_TRACK_NUMBER, Math.round(clusterStartTime), cluster.offset);
            clusterFrameBuffer = [];
            clusterStartTime += clusterDuration;
            clusterDuration = 0;
          }
          function validateOptions() {
            if (!options.frameDuration) {
              if (options.frameRate) {
                options.frameDuration = 1e3 / options.frameRate;
              } else {
                throw new Error("Missing required frameDuration or frameRate setting");
              }
            }
            options.quality = Math.max(Math.min(options.quality, 0.99999), 0);
            if (options.alphaQuality === void 0) {
              options.alphaQuality = options.quality;
            } else {
              options.alphaQuality = Math.max(Math.min(options.alphaQuality, 0.99999), 0);
            }
          }
          function addFrameToCluster(frame) {
            frame.trackNumber = DEFAULT_TRACK_NUMBER;
            frame.timecode = Math.round(clusterDuration);
            clusterFrameBuffer.push(frame);
            clusterDuration += frame.duration;
            if (clusterDuration >= MAX_CLUSTER_DURATION_MSEC) {
              flushClusterFrameBuffer();
            }
          }
          function rewriteSeekHead() {
            let seekHeadBuffer = new ArrayBufferDataStream2(seekHead.size), oldPos = blobBuffer.pos;
            writeEBML(seekHeadBuffer, seekHead.dataOffset, seekHead.data);
            blobBuffer.seek(seekHead.dataOffset);
            blobBuffer.write(seekHeadBuffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          function rewriteDuration() {
            let buffer = new ArrayBufferDataStream2(8), oldPos = blobBuffer.pos;
            buffer.writeDoubleBE(clusterStartTime);
            blobBuffer.seek(segmentDuration.dataOffset);
            blobBuffer.write(buffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          function rewriteSegmentLength() {
            let buffer = new ArrayBufferDataStream2(10), oldPos = blobBuffer.pos;
            buffer.writeUnsignedIntBE(ebmlSegment.id);
            buffer.writeEBMLVarIntWidth(blobBuffer.pos - ebmlSegment.dataOffset, 5);
            blobBuffer.seek(ebmlSegment.offset);
            blobBuffer.write(buffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          this.addFrame = function(frame, alpha, overrideFrameDuration) {
            if (!writtenHeader) {
              videoWidth = frame.width || 0;
              videoHeight = frame.height || 0;
              writeHeader();
            }
            let keyframe = extractKeyframeFromWebP(renderAsWebP(frame, options.quality)), frameDuration, frameAlpha = null;
            if (overrideFrameDuration) {
              frameDuration = overrideFrameDuration;
            } else if (typeof alpha == "number") {
              frameDuration = alpha;
            } else {
              frameDuration = options.frameDuration;
            }
            if (options.transparent) {
              if (alpha instanceof HTMLCanvasElement || typeof alpha === "string") {
                frameAlpha = alpha;
              } else if (keyframe.hasAlpha) {
                frameAlpha = convertAlphaToGrayscaleImage(frame);
              }
            }
            addFrameToCluster({
              frame: keyframe.frame,
              duration: frameDuration,
              alpha: frameAlpha ? extractKeyframeFromWebP(renderAsWebP(frameAlpha, options.alphaQuality)).frame : null
            });
          };
          this.complete = function() {
            if (!writtenHeader) {
              writeHeader();
            }
            flushClusterFrameBuffer();
            writeCues();
            rewriteSeekHead();
            rewriteDuration();
            rewriteSegmentLength();
            return blobBuffer.complete("video/webm");
          };
          this.getWrittenSize = function() {
            return blobBuffer.length;
          };
          options = extend(optionDefaults, options || {});
          validateOptions();
        };
      };
      {
        module.exports = WebMWriter2;
      }
    })();
  })(WebMWriter$1);
  var WebMWriterExports = WebMWriter$1.exports;
  var ArrayBufferDataStream = { exports: {} };
  (function(module) {
    (function() {
      let ArrayBufferDataStream2 = function(length) {
        this.data = new Uint8Array(length);
        this.pos = 0;
      };
      ArrayBufferDataStream2.prototype.seek = function(toOffset) {
        this.pos = toOffset;
      };
      ArrayBufferDataStream2.prototype.writeBytes = function(arr) {
        for (let i = 0; i < arr.length; i++) {
          this.data[this.pos++] = arr[i];
        }
      };
      ArrayBufferDataStream2.prototype.writeByte = function(b) {
        this.data[this.pos++] = b;
      };
      ArrayBufferDataStream2.prototype.writeU8 = ArrayBufferDataStream2.prototype.writeByte;
      ArrayBufferDataStream2.prototype.writeU16BE = function(u) {
        this.data[this.pos++] = u >> 8;
        this.data[this.pos++] = u;
      };
      ArrayBufferDataStream2.prototype.writeDoubleBE = function(d) {
        let bytes2 = new Uint8Array(new Float64Array([d]).buffer);
        for (let i = bytes2.length - 1; i >= 0; i--) {
          this.writeByte(bytes2[i]);
        }
      };
      ArrayBufferDataStream2.prototype.writeFloatBE = function(d) {
        let bytes2 = new Uint8Array(new Float32Array([d]).buffer);
        for (let i = bytes2.length - 1; i >= 0; i--) {
          this.writeByte(bytes2[i]);
        }
      };
      ArrayBufferDataStream2.prototype.writeString = function(s) {
        for (let i = 0; i < s.length; i++) {
          this.data[this.pos++] = s.charCodeAt(i);
        }
      };
      ArrayBufferDataStream2.prototype.writeEBMLVarIntWidth = function(i, width) {
        switch (width) {
          case 1:
            this.writeU8(1 << 7 | i);
            break;
          case 2:
            this.writeU8(1 << 6 | i >> 8);
            this.writeU8(i);
            break;
          case 3:
            this.writeU8(1 << 5 | i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          case 4:
            this.writeU8(1 << 4 | i >> 24);
            this.writeU8(i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          case 5:
            this.writeU8(1 << 3 | i / 4294967296 & 7);
            this.writeU8(i >> 24);
            this.writeU8(i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          default:
            throw new Error("Bad EBML VINT size " + width);
        }
      };
      ArrayBufferDataStream2.prototype.measureEBMLVarInt = function(val) {
        if (val < (1 << 7) - 1) {
          return 1;
        } else if (val < (1 << 14) - 1) {
          return 2;
        } else if (val < (1 << 21) - 1) {
          return 3;
        } else if (val < (1 << 28) - 1) {
          return 4;
        } else if (val < 34359738367) {
          return 5;
        } else {
          throw new Error("EBML VINT size not supported " + val);
        }
      };
      ArrayBufferDataStream2.prototype.writeEBMLVarInt = function(i) {
        this.writeEBMLVarIntWidth(i, this.measureEBMLVarInt(i));
      };
      ArrayBufferDataStream2.prototype.writeUnsignedIntBE = function(u, width) {
        if (width === void 0) {
          width = this.measureUnsignedInt(u);
        }
        switch (width) {
          case 5:
            this.writeU8(Math.floor(u / 4294967296));
          case 4:
            this.writeU8(u >> 24);
          case 3:
            this.writeU8(u >> 16);
          case 2:
            this.writeU8(u >> 8);
          case 1:
            this.writeU8(u);
            break;
          default:
            throw new Error("Bad UINT size " + width);
        }
      };
      ArrayBufferDataStream2.prototype.measureUnsignedInt = function(val) {
        if (val < 1 << 8) {
          return 1;
        } else if (val < 1 << 16) {
          return 2;
        } else if (val < 1 << 24) {
          return 3;
        } else if (val < 4294967296) {
          return 4;
        } else {
          return 5;
        }
      };
      ArrayBufferDataStream2.prototype.getAsDataArray = function() {
        if (this.pos < this.data.byteLength) {
          return this.data.subarray(0, this.pos);
        } else if (this.pos == this.data.byteLength) {
          return this.data;
        } else {
          throw new Error("ArrayBufferDataStream's pos lies beyond end of buffer");
        }
      };
      {
        module.exports = ArrayBufferDataStream2;
      }
    })();
  })(ArrayBufferDataStream);
  var ArrayBufferDataStreamExports = ArrayBufferDataStream.exports;
  var BlobBuffer = { exports: {} };
  (function(module) {
    (function() {
      let BlobBuffer2 = function(fs) {
        return function(destination) {
          let buffer = [], writePromise = Promise.resolve(), fileWriter = null, fd = null;
          if (destination && destination.constructor.name === "FileWriter") {
            fileWriter = destination;
          } else if (fs && destination) {
            fd = destination;
          }
          this.pos = 0;
          this.length = 0;
          function readBlobAsBuffer(blob) {
            return new Promise(function(resolve, reject) {
              let reader = new FileReader();
              reader.addEventListener("loadend", function() {
                resolve(reader.result);
              });
              reader.readAsArrayBuffer(blob);
            });
          }
          function convertToUint8Array(thing) {
            return new Promise(function(resolve, reject) {
              if (thing instanceof Uint8Array) {
                resolve(thing);
              } else if (thing instanceof ArrayBuffer || ArrayBuffer.isView(thing)) {
                resolve(new Uint8Array(thing));
              } else if (thing instanceof Blob) {
                resolve(readBlobAsBuffer(thing).then(function(buffer2) {
                  return new Uint8Array(buffer2);
                }));
              } else {
                resolve(readBlobAsBuffer(new Blob([thing])).then(function(buffer2) {
                  return new Uint8Array(buffer2);
                }));
              }
            });
          }
          function measureData(data2) {
            let result = data2.byteLength || data2.length || data2.size;
            if (!Number.isInteger(result)) {
              throw new Error("Failed to determine size of element");
            }
            return result;
          }
          this.seek = function(offset) {
            if (offset < 0) {
              throw new Error("Offset may not be negative");
            }
            if (isNaN(offset)) {
              throw new Error("Offset may not be NaN");
            }
            if (offset > this.length) {
              throw new Error("Seeking beyond the end of file is not allowed");
            }
            this.pos = offset;
          };
          this.write = function(data2) {
            let newEntry = {
              offset: this.pos,
              data: data2,
              length: measureData(data2)
            }, isAppend = newEntry.offset >= this.length;
            this.pos += newEntry.length;
            this.length = Math.max(this.length, this.pos);
            writePromise = writePromise.then(function() {
              if (fd) {
                return new Promise(function(resolve, reject) {
                  convertToUint8Array(newEntry.data).then(function(dataArray) {
                    let totalWritten = 0, buffer2 = Buffer.from(dataArray.buffer), handleWriteComplete = function(err, written, buffer3) {
                      totalWritten += written;
                      if (totalWritten >= buffer3.length) {
                        resolve();
                      } else {
                        fs.write(fd, buffer3, totalWritten, buffer3.length - totalWritten, newEntry.offset + totalWritten, handleWriteComplete);
                      }
                    };
                    fs.write(fd, buffer2, 0, buffer2.length, newEntry.offset, handleWriteComplete);
                  });
                });
              } else if (fileWriter) {
                return new Promise(function(resolve, reject) {
                  fileWriter.onwriteend = resolve;
                  fileWriter.seek(newEntry.offset);
                  fileWriter.write(new Blob([newEntry.data]));
                });
              } else if (!isAppend) {
                for (let i = 0; i < buffer.length; i++) {
                  let entry = buffer[i];
                  if (!(newEntry.offset + newEntry.length <= entry.offset || newEntry.offset >= entry.offset + entry.length)) {
                    if (newEntry.offset < entry.offset || newEntry.offset + newEntry.length > entry.offset + entry.length) {
                      throw new Error("Overwrite crosses blob boundaries");
                    }
                    if (newEntry.offset == entry.offset && newEntry.length == entry.length) {
                      entry.data = newEntry.data;
                      return;
                    } else {
                      return convertToUint8Array(entry.data).then(function(entryArray) {
                        entry.data = entryArray;
                        return convertToUint8Array(newEntry.data);
                      }).then(function(newEntryArray) {
                        newEntry.data = newEntryArray;
                        entry.data.set(newEntry.data, newEntry.offset - entry.offset);
                      });
                    }
                  }
                }
              }
              buffer.push(newEntry);
            });
          };
          this.complete = function(mimeType) {
            if (fd || fileWriter) {
              writePromise = writePromise.then(function() {
                return null;
              });
            } else {
              writePromise = writePromise.then(function() {
                let result = [];
                for (let i = 0; i < buffer.length; i++) {
                  result.push(buffer[i].data);
                }
                return new Blob(result, { type: mimeType });
              });
            }
            return writePromise;
          };
        };
      };
      {
        module.exports = BlobBuffer2;
      }
    })();
  })(BlobBuffer);
  var BlobBufferExports = BlobBuffer.exports;
  var browser = WebMWriterExports(ArrayBufferDataStreamExports, BlobBufferExports(null));
  const WebMWriter = /* @__PURE__ */ getDefaultExportFromCjs(browser);
  function webm(frames, convertMeta) {
    const quality = config.get("webmQuality") / 100;
    return Promise.all(frames.map((frame) => createImageBitmap(frame))).then((bitmaps) => {
      if (convertMeta.isAborted) throw new CancelError();
      const width = bitmaps[0].width;
      const height = bitmaps[0].height;
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");
      const dataUrls = [];
      for (let i = 0; i < frames.length; i++) {
        ctx.drawImage(bitmaps[i], 0, 0);
        const url2 = canvas.convertToBlob({ type: "image/webp", quality }).then(readBlobAsDataUrl);
        dataUrls.push(url2);
      }
      return Promise.all(dataUrls);
    }).then((dataUrls) => {
      if (convertMeta.isAborted) throw new CancelError();
      const videoWriter = new WebMWriter({
        quality,
        // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
        frameRate: 30,
        // Number of frames per second
        transparent: false
        // True if an alpha channel should be included in the video
      });
      const delays = convertMeta.source.delays;
      for (let i = 0; i < dataUrls.length; i++) {
        videoWriter.addFrame(dataUrls[i], delays[i]);
      }
      return videoWriter.complete();
    }).then((blob) => {
      if (convertMeta.isAborted) throw new CancelError();
      return blob;
    });
  }
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    member.set(obj, value);
    return value;
  };
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };
  var bytes = new Uint8Array(8);
  var view = new DataView(bytes.buffer);
  var u8 = (value) => {
    return [(value % 256 + 256) % 256];
  };
  var u16 = (value) => {
    view.setUint16(0, value, false);
    return [bytes[0], bytes[1]];
  };
  var i16 = (value) => {
    view.setInt16(0, value, false);
    return [bytes[0], bytes[1]];
  };
  var u24 = (value) => {
    view.setUint32(0, value, false);
    return [bytes[1], bytes[2], bytes[3]];
  };
  var u32 = (value) => {
    view.setUint32(0, value, false);
    return [bytes[0], bytes[1], bytes[2], bytes[3]];
  };
  var i32 = (value) => {
    view.setInt32(0, value, false);
    return [bytes[0], bytes[1], bytes[2], bytes[3]];
  };
  var u64 = (value) => {
    view.setUint32(0, Math.floor(value / 2 ** 32), false);
    view.setUint32(4, value, false);
    return [bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]];
  };
  var fixed_8_8 = (value) => {
    view.setInt16(0, 2 ** 8 * value, false);
    return [bytes[0], bytes[1]];
  };
  var fixed_16_16 = (value) => {
    view.setInt32(0, 2 ** 16 * value, false);
    return [bytes[0], bytes[1], bytes[2], bytes[3]];
  };
  var fixed_2_30 = (value) => {
    view.setInt32(0, 2 ** 30 * value, false);
    return [bytes[0], bytes[1], bytes[2], bytes[3]];
  };
  var ascii = (text2, nullTerminated = false) => {
    let bytes2 = Array(text2.length).fill(null).map((_, i) => text2.charCodeAt(i));
    if (nullTerminated)
      bytes2.push(0);
    return bytes2;
  };
  var last = (arr) => {
    return arr && arr[arr.length - 1];
  };
  var lastPresentedSample = (samples) => {
    let result = void 0;
    for (let sample of samples) {
      if (!result || sample.presentationTimestamp > result.presentationTimestamp) {
        result = sample;
      }
    }
    return result;
  };
  var intoTimescale = (timeInSeconds, timescale, round = true) => {
    let value = timeInSeconds * timescale;
    return round ? Math.round(value) : value;
  };
  var rotationMatrix = (rotationInDegrees) => {
    let theta = rotationInDegrees * (Math.PI / 180);
    let cosTheta = Math.cos(theta);
    let sinTheta = Math.sin(theta);
    return [
      cosTheta,
      sinTheta,
      0,
      -sinTheta,
      cosTheta,
      0,
      0,
      0,
      1
    ];
  };
  var IDENTITY_MATRIX = rotationMatrix(0);
  var matrixToBytes = (matrix) => {
    return [
      fixed_16_16(matrix[0]),
      fixed_16_16(matrix[1]),
      fixed_2_30(matrix[2]),
      fixed_16_16(matrix[3]),
      fixed_16_16(matrix[4]),
      fixed_2_30(matrix[5]),
      fixed_16_16(matrix[6]),
      fixed_16_16(matrix[7]),
      fixed_2_30(matrix[8])
    ];
  };
  var deepClone = (x) => {
    if (!x)
      return x;
    if (typeof x !== "object")
      return x;
    if (Array.isArray(x))
      return x.map(deepClone);
    return Object.fromEntries(Object.entries(x).map(([key, value]) => [key, deepClone(value)]));
  };
  var isU32 = (value) => {
    return value >= 0 && value < 2 ** 32;
  };
  var box = (type, contents, children2) => ({
    type,
    contents: contents && new Uint8Array(contents.flat(10)),
    children: children2
  });
  var fullBox = (type, version, flags, contents, children2) => box(
    type,
    [u8(version), u24(flags), contents ?? []],
    children2
  );
  var ftyp = (details) => {
    let minorVersion = 512;
    if (details.fragmented)
      return box("ftyp", [
        ascii("iso5"),
        // Major brand
        u32(minorVersion),
        // Minor version
        // Compatible brands
        ascii("iso5"),
        ascii("iso6"),
        ascii("mp41")
      ]);
    return box("ftyp", [
      ascii("isom"),
      // Major brand
      u32(minorVersion),
      // Minor version
      // Compatible brands
      ascii("isom"),
      details.holdsAvc ? ascii("avc1") : [],
      ascii("mp41")
    ]);
  };
  var mdat = (reserveLargeSize) => ({ type: "mdat", largeSize: reserveLargeSize });
  var free = (size) => ({ type: "free", size });
  var moov = (tracks, creationTime, fragmented = false) => box("moov", null, [
    mvhd(creationTime, tracks),
    ...tracks.map((x) => trak(x, creationTime)),
    fragmented ? mvex(tracks) : null
  ]);
  var mvhd = (creationTime, tracks) => {
    let duration = intoTimescale(Math.max(
      0,
      ...tracks.filter((x) => x.samples.length > 0).map((x) => {
        const lastSample = lastPresentedSample(x.samples);
        return lastSample.presentationTimestamp + lastSample.duration;
      })
    ), GLOBAL_TIMESCALE);
    let nextTrackId = Math.max(...tracks.map((x) => x.id)) + 1;
    let needsU64 = !isU32(creationTime) || !isU32(duration);
    let u32OrU64 = needsU64 ? u64 : u32;
    return fullBox("mvhd", +needsU64, 0, [
      u32OrU64(creationTime),
      // Creation time
      u32OrU64(creationTime),
      // Modification time
      u32(GLOBAL_TIMESCALE),
      // Timescale
      u32OrU64(duration),
      // Duration
      fixed_16_16(1),
      // Preferred rate
      fixed_8_8(1),
      // Preferred volume
      Array(10).fill(0),
      // Reserved
      matrixToBytes(IDENTITY_MATRIX),
      // Matrix
      Array(24).fill(0),
      // Pre-defined
      u32(nextTrackId)
      // Next track ID
    ]);
  };
  var trak = (track, creationTime) => box("trak", null, [
    tkhd(track, creationTime),
    mdia(track, creationTime)
  ]);
  var tkhd = (track, creationTime) => {
    let lastSample = lastPresentedSample(track.samples);
    let durationInGlobalTimescale = intoTimescale(
      lastSample ? lastSample.presentationTimestamp + lastSample.duration : 0,
      GLOBAL_TIMESCALE
    );
    let needsU64 = !isU32(creationTime) || !isU32(durationInGlobalTimescale);
    let u32OrU64 = needsU64 ? u64 : u32;
    let matrix;
    if (track.info.type === "video") {
      matrix = typeof track.info.rotation === "number" ? rotationMatrix(track.info.rotation) : track.info.rotation;
    } else {
      matrix = IDENTITY_MATRIX;
    }
    return fullBox("tkhd", +needsU64, 3, [
      u32OrU64(creationTime),
      // Creation time
      u32OrU64(creationTime),
      // Modification time
      u32(track.id),
      // Track ID
      u32(0),
      // Reserved
      u32OrU64(durationInGlobalTimescale),
      // Duration
      Array(8).fill(0),
      // Reserved
      u16(0),
      // Layer
      u16(0),
      // Alternate group
      fixed_8_8(track.info.type === "audio" ? 1 : 0),
      // Volume
      u16(0),
      // Reserved
      matrixToBytes(matrix),
      // Matrix
      fixed_16_16(track.info.type === "video" ? track.info.width : 0),
      // Track width
      fixed_16_16(track.info.type === "video" ? track.info.height : 0)
      // Track height
    ]);
  };
  var mdia = (track, creationTime) => box("mdia", null, [
    mdhd(track, creationTime),
    hdlr(track.info.type === "video" ? "vide" : "soun"),
    minf(track)
  ]);
  var mdhd = (track, creationTime) => {
    let lastSample = lastPresentedSample(track.samples);
    let localDuration = intoTimescale(
      lastSample ? lastSample.presentationTimestamp + lastSample.duration : 0,
      track.timescale
    );
    let needsU64 = !isU32(creationTime) || !isU32(localDuration);
    let u32OrU64 = needsU64 ? u64 : u32;
    return fullBox("mdhd", +needsU64, 0, [
      u32OrU64(creationTime),
      // Creation time
      u32OrU64(creationTime),
      // Modification time
      u32(track.timescale),
      // Timescale
      u32OrU64(localDuration),
      // Duration
      u16(21956),
      // Language ("und", undetermined)
      u16(0)
      // Quality
    ]);
  };
  var hdlr = (componentSubtype) => fullBox("hdlr", 0, 0, [
    ascii("mhlr"),
    // Component type
    ascii(componentSubtype),
    // Component subtype
    u32(0),
    // Component manufacturer
    u32(0),
    // Component flags
    u32(0),
    // Component flags mask
    ascii("mp4-muxer-hdlr", true)
    // Component name
  ]);
  var minf = (track) => box("minf", null, [
    track.info.type === "video" ? vmhd() : smhd(),
    dinf(),
    stbl(track)
  ]);
  var vmhd = () => fullBox("vmhd", 0, 1, [
    u16(0),
    // Graphics mode
    u16(0),
    // Opcolor R
    u16(0),
    // Opcolor G
    u16(0)
    // Opcolor B
  ]);
  var smhd = () => fullBox("smhd", 0, 0, [
    u16(0),
    // Balance
    u16(0)
    // Reserved
  ]);
  var dinf = () => box("dinf", null, [
    dref()
  ]);
  var dref = () => fullBox("dref", 0, 0, [
    u32(1)
    // Entry count
  ], [
    url()
  ]);
  var url = () => fullBox("url ", 0, 1);
  var stbl = (track) => {
    const needsCtts = track.compositionTimeOffsetTable.length > 1 || track.compositionTimeOffsetTable.some((x) => x.sampleCompositionTimeOffset !== 0);
    return box("stbl", null, [
      stsd(track),
      stts(track),
      stss(track),
      stsc(track),
      stsz(track),
      stco(track),
      needsCtts ? ctts(track) : null
    ]);
  };
  var stsd = (track) => fullBox("stsd", 0, 0, [
    u32(1)
    // Entry count
  ], [
    track.info.type === "video" ? videoSampleDescription(
      VIDEO_CODEC_TO_BOX_NAME[track.info.codec],
      track
    ) : soundSampleDescription(
      AUDIO_CODEC_TO_BOX_NAME[track.info.codec],
      track
    )
  ]);
  var videoSampleDescription = (compressionType, track) => box(compressionType, [
    Array(6).fill(0),
    // Reserved
    u16(1),
    // Data reference index
    u16(0),
    // Pre-defined
    u16(0),
    // Reserved
    Array(12).fill(0),
    // Pre-defined
    u16(track.info.width),
    // Width
    u16(track.info.height),
    // Height
    u32(4718592),
    // Horizontal resolution
    u32(4718592),
    // Vertical resolution
    u32(0),
    // Reserved
    u16(1),
    // Frame count
    Array(32).fill(0),
    // Compressor name
    u16(24),
    // Depth
    i16(65535)
    // Pre-defined
  ], [
    VIDEO_CODEC_TO_CONFIGURATION_BOX[track.info.codec](track)
  ]);
  var avcC = (track) => track.info.decoderConfig && box("avcC", [
    // For AVC, description is an AVCDecoderConfigurationRecord, so nothing else to do here
    ...new Uint8Array(track.info.decoderConfig.description)
  ]);
  var hvcC = (track) => track.info.decoderConfig && box("hvcC", [
    // For HEVC, description is a HEVCDecoderConfigurationRecord, so nothing else to do here
    ...new Uint8Array(track.info.decoderConfig.description)
  ]);
  var vpcC = (track) => {
    if (!track.info.decoderConfig) {
      return null;
    }
    let decoderConfig = track.info.decoderConfig;
    if (!decoderConfig.colorSpace) {
      throw new Error(`'colorSpace' is required in the decoder config for VP9.`);
    }
    let parts = decoderConfig.codec.split(".");
    let profile = Number(parts[1]);
    let level = Number(parts[2]);
    let bitDepth = Number(parts[3]);
    let chromaSubsampling = 0;
    let thirdByte = (bitDepth << 4) + (chromaSubsampling << 1) + Number(decoderConfig.colorSpace.fullRange);
    let colourPrimaries = 2;
    let transferCharacteristics = 2;
    let matrixCoefficients = 2;
    return fullBox("vpcC", 1, 0, [
      u8(profile),
      // Profile
      u8(level),
      // Level
      u8(thirdByte),
      // Bit depth, chroma subsampling, full range
      u8(colourPrimaries),
      // Colour primaries
      u8(transferCharacteristics),
      // Transfer characteristics
      u8(matrixCoefficients),
      // Matrix coefficients
      u16(0)
      // Codec initialization data size
    ]);
  };
  var av1C = () => {
    let marker = 1;
    let version = 1;
    let firstByte = (marker << 7) + version;
    return box("av1C", [
      firstByte,
      0,
      0,
      0
    ]);
  };
  var soundSampleDescription = (compressionType, track) => box(compressionType, [
    Array(6).fill(0),
    // Reserved
    u16(1),
    // Data reference index
    u16(0),
    // Version
    u16(0),
    // Revision level
    u32(0),
    // Vendor
    u16(track.info.numberOfChannels),
    // Number of channels
    u16(16),
    // Sample size (bits)
    u16(0),
    // Compression ID
    u16(0),
    // Packet size
    fixed_16_16(track.info.sampleRate)
    // Sample rate
  ], [
    AUDIO_CODEC_TO_CONFIGURATION_BOX[track.info.codec](track)
  ]);
  var esds = (track) => {
    let description = new Uint8Array(track.info.decoderConfig.description);
    return fullBox("esds", 0, 0, [
      // https://stackoverflow.com/a/54803118
      u32(58753152),
      // TAG(3) = Object Descriptor ([2])
      u8(32 + description.byteLength),
      // length of this OD (which includes the next 2 tags)
      u16(1),
      // ES_ID = 1
      u8(0),
      // flags etc = 0
      u32(75530368),
      // TAG(4) = ES Descriptor ([2]) embedded in above OD
      u8(18 + description.byteLength),
      // length of this ESD
      u8(64),
      // MPEG-4 Audio
      u8(21),
      // stream type(6bits)=5 audio, flags(2bits)=1
      u24(0),
      // 24bit buffer size
      u32(130071),
      // max bitrate
      u32(130071),
      // avg bitrate
      u32(92307584),
      // TAG(5) = ASC ([2],[3]) embedded in above OD
      u8(description.byteLength),
      // length
      ...description,
      u32(109084800),
      // TAG(6)
      u8(1),
      // length
      u8(2)
      // data
    ]);
  };
  var dOps = (track) => box("dOps", [
    u8(0),
    // Version
    u8(track.info.numberOfChannels),
    // OutputChannelCount
    u16(3840),
    // PreSkip, should be at least 80 milliseconds worth of playback, measured in 48000 Hz samples
    u32(track.info.sampleRate),
    // InputSampleRate
    fixed_8_8(0),
    // OutputGain
    u8(0)
    // ChannelMappingFamily
  ]);
  var stts = (track) => {
    return fullBox("stts", 0, 0, [
      u32(track.timeToSampleTable.length),
      // Number of entries
      track.timeToSampleTable.map((x) => [
        // Time-to-sample table
        u32(x.sampleCount),
        // Sample count
        u32(x.sampleDelta)
        // Sample duration
      ])
    ]);
  };
  var stss = (track) => {
    if (track.samples.every((x) => x.type === "key"))
      return null;
    let keySamples = [...track.samples.entries()].filter(([, sample]) => sample.type === "key");
    return fullBox("stss", 0, 0, [
      u32(keySamples.length),
      // Number of entries
      keySamples.map(([index]) => u32(index + 1))
      // Sync sample table
    ]);
  };
  var stsc = (track) => {
    return fullBox("stsc", 0, 0, [
      u32(track.compactlyCodedChunkTable.length),
      // Number of entries
      track.compactlyCodedChunkTable.map((x) => [
        // Sample-to-chunk table
        u32(x.firstChunk),
        // First chunk
        u32(x.samplesPerChunk),
        // Samples per chunk
        u32(1)
        // Sample description index
      ])
    ]);
  };
  var stsz = (track) => fullBox("stsz", 0, 0, [
    u32(0),
    // Sample size (0 means non-constant size)
    u32(track.samples.length),
    // Number of entries
    track.samples.map((x) => u32(x.size))
    // Sample size table
  ]);
  var stco = (track) => {
    if (track.finalizedChunks.length > 0 && last(track.finalizedChunks).offset >= 2 ** 32) {
      return fullBox("co64", 0, 0, [
        u32(track.finalizedChunks.length),
        // Number of entries
        track.finalizedChunks.map((x) => u64(x.offset))
        // Chunk offset table
      ]);
    }
    return fullBox("stco", 0, 0, [
      u32(track.finalizedChunks.length),
      // Number of entries
      track.finalizedChunks.map((x) => u32(x.offset))
      // Chunk offset table
    ]);
  };
  var ctts = (track) => {
    return fullBox("ctts", 0, 0, [
      u32(track.compositionTimeOffsetTable.length),
      // Number of entries
      track.compositionTimeOffsetTable.map((x) => [
        // Time-to-sample table
        u32(x.sampleCount),
        // Sample count
        u32(x.sampleCompositionTimeOffset)
        // Sample offset
      ])
    ]);
  };
  var mvex = (tracks) => {
    return box("mvex", null, tracks.map(trex));
  };
  var trex = (track) => {
    return fullBox("trex", 0, 0, [
      u32(track.id),
      // Track ID
      u32(1),
      // Default sample description index
      u32(0),
      // Default sample duration
      u32(0),
      // Default sample size
      u32(0)
      // Default sample flags
    ]);
  };
  var moof = (sequenceNumber, tracks) => {
    return box("moof", null, [
      mfhd(sequenceNumber),
      ...tracks.map(traf)
    ]);
  };
  var mfhd = (sequenceNumber) => {
    return fullBox("mfhd", 0, 0, [
      u32(sequenceNumber)
      // Sequence number
    ]);
  };
  var fragmentSampleFlags = (sample) => {
    let byte1 = 0;
    let byte2 = 0;
    let byte3 = 0;
    let byte4 = 0;
    let sampleIsDifferenceSample = sample.type === "delta";
    byte2 |= +sampleIsDifferenceSample;
    if (sampleIsDifferenceSample) {
      byte1 |= 1;
    } else {
      byte1 |= 2;
    }
    return byte1 << 24 | byte2 << 16 | byte3 << 8 | byte4;
  };
  var traf = (track) => {
    return box("traf", null, [
      tfhd(track),
      tfdt(track),
      trun(track)
    ]);
  };
  var tfhd = (track) => {
    let tfFlags = 0;
    tfFlags |= 8;
    tfFlags |= 16;
    tfFlags |= 32;
    tfFlags |= 131072;
    let referenceSample = track.currentChunk.samples[1] ?? track.currentChunk.samples[0];
    let referenceSampleInfo = {
      duration: referenceSample.timescaleUnitsToNextSample,
      size: referenceSample.size,
      flags: fragmentSampleFlags(referenceSample)
    };
    return fullBox("tfhd", 0, tfFlags, [
      u32(track.id),
      // Track ID
      u32(referenceSampleInfo.duration),
      // Default sample duration
      u32(referenceSampleInfo.size),
      // Default sample size
      u32(referenceSampleInfo.flags)
      // Default sample flags
    ]);
  };
  var tfdt = (track) => {
    return fullBox("tfdt", 1, 0, [
      u64(intoTimescale(track.currentChunk.startTimestamp, track.timescale))
      // Base Media Decode Time
    ]);
  };
  var trun = (track) => {
    let allSampleDurations = track.currentChunk.samples.map((x) => x.timescaleUnitsToNextSample);
    let allSampleSizes = track.currentChunk.samples.map((x) => x.size);
    let allSampleFlags = track.currentChunk.samples.map(fragmentSampleFlags);
    let allSampleCompositionTimeOffsets = track.currentChunk.samples.map((x) => intoTimescale(x.presentationTimestamp - x.decodeTimestamp, track.timescale));
    let uniqueSampleDurations = new Set(allSampleDurations);
    let uniqueSampleSizes = new Set(allSampleSizes);
    let uniqueSampleFlags = new Set(allSampleFlags);
    let uniqueSampleCompositionTimeOffsets = new Set(allSampleCompositionTimeOffsets);
    let firstSampleFlagsPresent = uniqueSampleFlags.size === 2 && allSampleFlags[0] !== allSampleFlags[1];
    let sampleDurationPresent = uniqueSampleDurations.size > 1;
    let sampleSizePresent = uniqueSampleSizes.size > 1;
    let sampleFlagsPresent = !firstSampleFlagsPresent && uniqueSampleFlags.size > 1;
    let sampleCompositionTimeOffsetsPresent = uniqueSampleCompositionTimeOffsets.size > 1 || [...uniqueSampleCompositionTimeOffsets].some((x) => x !== 0);
    let flags = 0;
    flags |= 1;
    flags |= 4 * +firstSampleFlagsPresent;
    flags |= 256 * +sampleDurationPresent;
    flags |= 512 * +sampleSizePresent;
    flags |= 1024 * +sampleFlagsPresent;
    flags |= 2048 * +sampleCompositionTimeOffsetsPresent;
    return fullBox("trun", 1, flags, [
      u32(track.currentChunk.samples.length),
      // Sample count
      u32(track.currentChunk.offset - track.currentChunk.moofOffset || 0),
      // Data offset
      firstSampleFlagsPresent ? u32(allSampleFlags[0]) : [],
      track.currentChunk.samples.map((_, i) => [
        sampleDurationPresent ? u32(allSampleDurations[i]) : [],
        // Sample duration
        sampleSizePresent ? u32(allSampleSizes[i]) : [],
        // Sample size
        sampleFlagsPresent ? u32(allSampleFlags[i]) : [],
        // Sample flags
        // Sample composition time offsets
        sampleCompositionTimeOffsetsPresent ? i32(allSampleCompositionTimeOffsets[i]) : []
      ])
    ]);
  };
  var mfra = (tracks) => {
    return box("mfra", null, [
      ...tracks.map(tfra),
      mfro()
    ]);
  };
  var tfra = (track, trackIndex) => {
    let version = 1;
    return fullBox("tfra", version, 0, [
      u32(track.id),
      // Track ID
      u32(63),
      // This specifies that traf number, trun number and sample number are 32-bit ints
      u32(track.finalizedChunks.length),
      // Number of entries
      track.finalizedChunks.map((chunk) => [
        u64(intoTimescale(chunk.startTimestamp, track.timescale)),
        // Time
        u64(chunk.moofOffset),
        // moof offset
        u32(trackIndex + 1),
        // traf number
        u32(1),
        // trun number
        u32(1)
        // Sample number
      ])
    ]);
  };
  var mfro = () => {
    return fullBox("mfro", 0, 0, [
      // This value needs to be overwritten manually from the outside, where the actual size of the enclosing mfra box
      // is known
      u32(0)
      // Size
    ]);
  };
  var VIDEO_CODEC_TO_BOX_NAME = {
    "avc": "avc1",
    "hevc": "hvc1",
    "vp9": "vp09",
    "av1": "av01"
  };
  var VIDEO_CODEC_TO_CONFIGURATION_BOX = {
    "avc": avcC,
    "hevc": hvcC,
    "vp9": vpcC,
    "av1": av1C
  };
  var AUDIO_CODEC_TO_BOX_NAME = {
    "aac": "mp4a",
    "opus": "Opus"
  };
  var AUDIO_CODEC_TO_CONFIGURATION_BOX = {
    "aac": esds,
    "opus": dOps
  };
  var ArrayBufferTarget = class {
    constructor() {
      this.buffer = null;
    }
  };
  var StreamTarget = class {
    constructor(options) {
      this.options = options;
    }
  };
  var FileSystemWritableFileStreamTarget = class {
    constructor(stream, options) {
      this.stream = stream;
      this.options = options;
    }
  };
  var _helper, _helperView;
  var Writer = class {
    constructor() {
      this.pos = 0;
      __privateAdd(this, _helper, new Uint8Array(8));
      __privateAdd(this, _helperView, new DataView(__privateGet(this, _helper).buffer));
      this.offsets = /* @__PURE__ */ new WeakMap();
    }
    /** Sets the current position for future writes to a new one. */
    seek(newPos) {
      this.pos = newPos;
    }
    writeU32(value) {
      __privateGet(this, _helperView).setUint32(0, value, false);
      this.write(__privateGet(this, _helper).subarray(0, 4));
    }
    writeU64(value) {
      __privateGet(this, _helperView).setUint32(0, Math.floor(value / 2 ** 32), false);
      __privateGet(this, _helperView).setUint32(4, value, false);
      this.write(__privateGet(this, _helper).subarray(0, 8));
    }
    writeAscii(text2) {
      for (let i = 0; i < text2.length; i++) {
        __privateGet(this, _helperView).setUint8(i % 8, text2.charCodeAt(i));
        if (i % 8 === 7)
          this.write(__privateGet(this, _helper));
      }
      if (text2.length % 8 !== 0) {
        this.write(__privateGet(this, _helper).subarray(0, text2.length % 8));
      }
    }
    writeBox(box2) {
      this.offsets.set(box2, this.pos);
      if (box2.contents && !box2.children) {
        this.writeBoxHeader(box2, box2.size ?? box2.contents.byteLength + 8);
        this.write(box2.contents);
      } else {
        let startPos = this.pos;
        this.writeBoxHeader(box2, 0);
        if (box2.contents)
          this.write(box2.contents);
        if (box2.children) {
          for (let child of box2.children)
            if (child)
              this.writeBox(child);
        }
        let endPos = this.pos;
        let size = box2.size ?? endPos - startPos;
        this.seek(startPos);
        this.writeBoxHeader(box2, size);
        this.seek(endPos);
      }
    }
    writeBoxHeader(box2, size) {
      this.writeU32(box2.largeSize ? 1 : size);
      this.writeAscii(box2.type);
      if (box2.largeSize)
        this.writeU64(size);
    }
    measureBoxHeader(box2) {
      return 8 + (box2.largeSize ? 8 : 0);
    }
    patchBox(box2) {
      let endPos = this.pos;
      this.seek(this.offsets.get(box2));
      this.writeBox(box2);
      this.seek(endPos);
    }
    measureBox(box2) {
      if (box2.contents && !box2.children) {
        let headerSize = this.measureBoxHeader(box2);
        return headerSize + box2.contents.byteLength;
      } else {
        let result = this.measureBoxHeader(box2);
        if (box2.contents)
          result += box2.contents.byteLength;
        if (box2.children) {
          for (let child of box2.children)
            if (child)
              result += this.measureBox(child);
        }
        return result;
      }
    }
  };
  _helper = /* @__PURE__ */ new WeakMap();
  _helperView = /* @__PURE__ */ new WeakMap();
  var _target, _buffer, _bytes, _maxPos, _ensureSize, ensureSize_fn;
  var ArrayBufferTargetWriter = class extends Writer {
    constructor(target) {
      super();
      __privateAdd(this, _ensureSize);
      __privateAdd(this, _target, void 0);
      __privateAdd(this, _buffer, new ArrayBuffer(2 ** 16));
      __privateAdd(this, _bytes, new Uint8Array(__privateGet(this, _buffer)));
      __privateAdd(this, _maxPos, 0);
      __privateSet(this, _target, target);
    }
    write(data2) {
      __privateMethod(this, _ensureSize, ensureSize_fn).call(this, this.pos + data2.byteLength);
      __privateGet(this, _bytes).set(data2, this.pos);
      this.pos += data2.byteLength;
      __privateSet(this, _maxPos, Math.max(__privateGet(this, _maxPos), this.pos));
    }
    finalize() {
      __privateMethod(this, _ensureSize, ensureSize_fn).call(this, this.pos);
      __privateGet(this, _target).buffer = __privateGet(this, _buffer).slice(0, Math.max(__privateGet(this, _maxPos), this.pos));
    }
  };
  _target = /* @__PURE__ */ new WeakMap();
  _buffer = /* @__PURE__ */ new WeakMap();
  _bytes = /* @__PURE__ */ new WeakMap();
  _maxPos = /* @__PURE__ */ new WeakMap();
  _ensureSize = /* @__PURE__ */ new WeakSet();
  ensureSize_fn = function(size) {
    let newLength = __privateGet(this, _buffer).byteLength;
    while (newLength < size)
      newLength *= 2;
    if (newLength === __privateGet(this, _buffer).byteLength)
      return;
    let newBuffer = new ArrayBuffer(newLength);
    let newBytes = new Uint8Array(newBuffer);
    newBytes.set(__privateGet(this, _bytes), 0);
    __privateSet(this, _buffer, newBuffer);
    __privateSet(this, _bytes, newBytes);
  };
  var _target2, _sections;
  var StreamTargetWriter = class extends Writer {
    constructor(target) {
      super();
      __privateAdd(this, _target2, void 0);
      __privateAdd(this, _sections, []);
      __privateSet(this, _target2, target);
    }
    write(data2) {
      __privateGet(this, _sections).push({
        data: data2.slice(),
        start: this.pos
      });
      this.pos += data2.byteLength;
    }
    flush() {
      var _a, _b;
      if (__privateGet(this, _sections).length === 0)
        return;
      let chunks = [];
      let sorted = [...__privateGet(this, _sections)].sort((a, b) => a.start - b.start);
      chunks.push({
        start: sorted[0].start,
        size: sorted[0].data.byteLength
      });
      for (let i = 1; i < sorted.length; i++) {
        let lastChunk = chunks[chunks.length - 1];
        let section = sorted[i];
        if (section.start <= lastChunk.start + lastChunk.size) {
          lastChunk.size = Math.max(lastChunk.size, section.start + section.data.byteLength - lastChunk.start);
        } else {
          chunks.push({
            start: section.start,
            size: section.data.byteLength
          });
        }
      }
      for (let chunk of chunks) {
        chunk.data = new Uint8Array(chunk.size);
        for (let section of __privateGet(this, _sections)) {
          if (chunk.start <= section.start && section.start < chunk.start + chunk.size) {
            chunk.data.set(section.data, section.start - chunk.start);
          }
        }
        (_b = (_a = __privateGet(this, _target2).options).onData) == null ? void 0 : _b.call(_a, chunk.data, chunk.start);
      }
      __privateGet(this, _sections).length = 0;
    }
    finalize() {
    }
  };
  _target2 = /* @__PURE__ */ new WeakMap();
  _sections = /* @__PURE__ */ new WeakMap();
  var DEFAULT_CHUNK_SIZE = 2 ** 24;
  var MAX_CHUNKS_AT_ONCE = 2;
  var _target3, _chunkSize, _chunks, _writeDataIntoChunks, writeDataIntoChunks_fn, _insertSectionIntoChunk, insertSectionIntoChunk_fn, _createChunk, createChunk_fn, _flushChunks, flushChunks_fn;
  var ChunkedStreamTargetWriter = class extends Writer {
    constructor(target) {
      var _a;
      super();
      __privateAdd(this, _writeDataIntoChunks);
      __privateAdd(this, _insertSectionIntoChunk);
      __privateAdd(this, _createChunk);
      __privateAdd(this, _flushChunks);
      __privateAdd(this, _target3, void 0);
      __privateAdd(this, _chunkSize, void 0);
      __privateAdd(this, _chunks, []);
      __privateSet(this, _target3, target);
      __privateSet(this, _chunkSize, ((_a = target.options) == null ? void 0 : _a.chunkSize) ?? DEFAULT_CHUNK_SIZE);
      if (!Number.isInteger(__privateGet(this, _chunkSize)) || __privateGet(this, _chunkSize) < 2 ** 10) {
        throw new Error("Invalid StreamTarget options: chunkSize must be an integer not smaller than 1024.");
      }
    }
    write(data2) {
      __privateMethod(this, _writeDataIntoChunks, writeDataIntoChunks_fn).call(this, data2, this.pos);
      __privateMethod(this, _flushChunks, flushChunks_fn).call(this);
      this.pos += data2.byteLength;
    }
    finalize() {
      __privateMethod(this, _flushChunks, flushChunks_fn).call(this, true);
    }
  };
  _target3 = /* @__PURE__ */ new WeakMap();
  _chunkSize = /* @__PURE__ */ new WeakMap();
  _chunks = /* @__PURE__ */ new WeakMap();
  _writeDataIntoChunks = /* @__PURE__ */ new WeakSet();
  writeDataIntoChunks_fn = function(data2, position) {
    let chunkIndex = __privateGet(this, _chunks).findIndex((x) => x.start <= position && position < x.start + __privateGet(this, _chunkSize));
    if (chunkIndex === -1)
      chunkIndex = __privateMethod(this, _createChunk, createChunk_fn).call(this, position);
    let chunk = __privateGet(this, _chunks)[chunkIndex];
    let relativePosition = position - chunk.start;
    let toWrite = data2.subarray(0, Math.min(__privateGet(this, _chunkSize) - relativePosition, data2.byteLength));
    chunk.data.set(toWrite, relativePosition);
    let section = {
      start: relativePosition,
      end: relativePosition + toWrite.byteLength
    };
    __privateMethod(this, _insertSectionIntoChunk, insertSectionIntoChunk_fn).call(this, chunk, section);
    if (chunk.written[0].start === 0 && chunk.written[0].end === __privateGet(this, _chunkSize)) {
      chunk.shouldFlush = true;
    }
    if (__privateGet(this, _chunks).length > MAX_CHUNKS_AT_ONCE) {
      for (let i = 0; i < __privateGet(this, _chunks).length - 1; i++) {
        __privateGet(this, _chunks)[i].shouldFlush = true;
      }
      __privateMethod(this, _flushChunks, flushChunks_fn).call(this);
    }
    if (toWrite.byteLength < data2.byteLength) {
      __privateMethod(this, _writeDataIntoChunks, writeDataIntoChunks_fn).call(this, data2.subarray(toWrite.byteLength), position + toWrite.byteLength);
    }
  };
  _insertSectionIntoChunk = /* @__PURE__ */ new WeakSet();
  insertSectionIntoChunk_fn = function(chunk, section) {
    let low = 0;
    let high = chunk.written.length - 1;
    let index = -1;
    while (low <= high) {
      let mid = Math.floor(low + (high - low + 1) / 2);
      if (chunk.written[mid].start <= section.start) {
        low = mid + 1;
        index = mid;
      } else {
        high = mid - 1;
      }
    }
    chunk.written.splice(index + 1, 0, section);
    if (index === -1 || chunk.written[index].end < section.start)
      index++;
    while (index < chunk.written.length - 1 && chunk.written[index].end >= chunk.written[index + 1].start) {
      chunk.written[index].end = Math.max(chunk.written[index].end, chunk.written[index + 1].end);
      chunk.written.splice(index + 1, 1);
    }
  };
  _createChunk = /* @__PURE__ */ new WeakSet();
  createChunk_fn = function(includesPosition) {
    let start = Math.floor(includesPosition / __privateGet(this, _chunkSize)) * __privateGet(this, _chunkSize);
    let chunk = {
      start,
      data: new Uint8Array(__privateGet(this, _chunkSize)),
      written: [],
      shouldFlush: false
    };
    __privateGet(this, _chunks).push(chunk);
    __privateGet(this, _chunks).sort((a, b) => a.start - b.start);
    return __privateGet(this, _chunks).indexOf(chunk);
  };
  _flushChunks = /* @__PURE__ */ new WeakSet();
  flushChunks_fn = function(force = false) {
    var _a, _b;
    for (let i = 0; i < __privateGet(this, _chunks).length; i++) {
      let chunk = __privateGet(this, _chunks)[i];
      if (!chunk.shouldFlush && !force)
        continue;
      for (let section of chunk.written) {
        (_b = (_a = __privateGet(this, _target3).options).onData) == null ? void 0 : _b.call(
          _a,
          chunk.data.subarray(section.start, section.end),
          chunk.start + section.start
        );
      }
      __privateGet(this, _chunks).splice(i--, 1);
    }
  };
  var FileSystemWritableFileStreamTargetWriter = class extends ChunkedStreamTargetWriter {
    constructor(target) {
      var _a;
      super(new StreamTarget({
        onData: (data2, position) => target.stream.write({
          type: "write",
          data: data2,
          position
        }),
        chunkSize: (_a = target.options) == null ? void 0 : _a.chunkSize
      }));
    }
  };
  var GLOBAL_TIMESCALE = 1e3;
  var SUPPORTED_VIDEO_CODECS2 = ["avc", "hevc", "vp9", "av1"];
  var SUPPORTED_AUDIO_CODECS2 = ["aac", "opus"];
  var TIMESTAMP_OFFSET = 2082844800;
  var FIRST_TIMESTAMP_BEHAVIORS = ["strict", "offset", "cross-track-offset"];
  var _options, _writer, _ftypSize, _mdat, _videoTrack, _audioTrack, _creationTime, _finalizedChunks, _nextFragmentNumber, _videoSampleQueue, _audioSampleQueue, _finalized, _validateOptions, validateOptions_fn, _writeHeader, writeHeader_fn, _computeMoovSizeUpperBound, computeMoovSizeUpperBound_fn, _prepareTracks, prepareTracks_fn, _generateMpeg4AudioSpecificConfig, generateMpeg4AudioSpecificConfig_fn, _createSampleForTrack, createSampleForTrack_fn, _addSampleToTrack, addSampleToTrack_fn, _validateTimestamp, validateTimestamp_fn, _finalizeCurrentChunk, finalizeCurrentChunk_fn, _finalizeFragment, finalizeFragment_fn, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn, _ensureNotFinalized, ensureNotFinalized_fn;
  var Muxer = class {
    constructor(options) {
      var _a;
      __privateAdd(this, _validateOptions);
      __privateAdd(this, _writeHeader);
      __privateAdd(this, _computeMoovSizeUpperBound);
      __privateAdd(this, _prepareTracks);
      __privateAdd(this, _generateMpeg4AudioSpecificConfig);
      __privateAdd(this, _createSampleForTrack);
      __privateAdd(this, _addSampleToTrack);
      __privateAdd(this, _validateTimestamp);
      __privateAdd(this, _finalizeCurrentChunk);
      __privateAdd(this, _finalizeFragment);
      __privateAdd(this, _maybeFlushStreamingTargetWriter);
      __privateAdd(this, _ensureNotFinalized);
      __privateAdd(this, _options, void 0);
      __privateAdd(this, _writer, void 0);
      __privateAdd(this, _ftypSize, void 0);
      __privateAdd(this, _mdat, void 0);
      __privateAdd(this, _videoTrack, null);
      __privateAdd(this, _audioTrack, null);
      __privateAdd(this, _creationTime, Math.floor(Date.now() / 1e3) + TIMESTAMP_OFFSET);
      __privateAdd(this, _finalizedChunks, []);
      __privateAdd(this, _nextFragmentNumber, 1);
      __privateAdd(this, _videoSampleQueue, []);
      __privateAdd(this, _audioSampleQueue, []);
      __privateAdd(this, _finalized, false);
      __privateMethod(this, _validateOptions, validateOptions_fn).call(this, options);
      options.video = deepClone(options.video);
      options.audio = deepClone(options.audio);
      options.fastStart = deepClone(options.fastStart);
      this.target = options.target;
      __privateSet(this, _options, {
        firstTimestampBehavior: "strict",
        ...options
      });
      if (options.target instanceof ArrayBufferTarget) {
        __privateSet(this, _writer, new ArrayBufferTargetWriter(options.target));
      } else if (options.target instanceof StreamTarget) {
        __privateSet(this, _writer, ((_a = options.target.options) == null ? void 0 : _a.chunked) ? new ChunkedStreamTargetWriter(options.target) : new StreamTargetWriter(options.target));
      } else if (options.target instanceof FileSystemWritableFileStreamTarget) {
        __privateSet(this, _writer, new FileSystemWritableFileStreamTargetWriter(options.target));
      } else {
        throw new Error(`Invalid target: ${options.target}`);
      }
      __privateMethod(this, _prepareTracks, prepareTracks_fn).call(this);
      __privateMethod(this, _writeHeader, writeHeader_fn).call(this);
    }
    addVideoChunk(sample, meta, timestamp, compositionTimeOffset) {
      let data2 = new Uint8Array(sample.byteLength);
      sample.copyTo(data2);
      this.addVideoChunkRaw(
        data2,
        sample.type,
        timestamp ?? sample.timestamp,
        sample.duration,
        meta,
        compositionTimeOffset
      );
    }
    addVideoChunkRaw(data2, type, timestamp, duration, meta, compositionTimeOffset) {
      __privateMethod(this, _ensureNotFinalized, ensureNotFinalized_fn).call(this);
      if (!__privateGet(this, _options).video)
        throw new Error("No video track declared.");
      if (typeof __privateGet(this, _options).fastStart === "object" && __privateGet(this, _videoTrack).samples.length === __privateGet(this, _options).fastStart.expectedVideoChunks) {
        throw new Error(`Cannot add more video chunks than specified in 'fastStart' (${__privateGet(this, _options).fastStart.expectedVideoChunks}).`);
      }
      let videoSample = __privateMethod(this, _createSampleForTrack, createSampleForTrack_fn).call(this, __privateGet(this, _videoTrack), data2, type, timestamp, duration, meta, compositionTimeOffset);
      if (__privateGet(this, _options).fastStart === "fragmented" && __privateGet(this, _audioTrack)) {
        while (__privateGet(this, _audioSampleQueue).length > 0 && __privateGet(this, _audioSampleQueue)[0].decodeTimestamp <= videoSample.decodeTimestamp) {
          let audioSample = __privateGet(this, _audioSampleQueue).shift();
          __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
        }
        if (videoSample.decodeTimestamp <= __privateGet(this, _audioTrack).lastDecodeTimestamp) {
          __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
        } else {
          __privateGet(this, _videoSampleQueue).push(videoSample);
        }
      } else {
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
      }
    }
    addAudioChunk(sample, meta, timestamp) {
      let data2 = new Uint8Array(sample.byteLength);
      sample.copyTo(data2);
      this.addAudioChunkRaw(data2, sample.type, timestamp ?? sample.timestamp, sample.duration, meta);
    }
    addAudioChunkRaw(data2, type, timestamp, duration, meta) {
      __privateMethod(this, _ensureNotFinalized, ensureNotFinalized_fn).call(this);
      if (!__privateGet(this, _options).audio)
        throw new Error("No audio track declared.");
      if (typeof __privateGet(this, _options).fastStart === "object" && __privateGet(this, _audioTrack).samples.length === __privateGet(this, _options).fastStart.expectedAudioChunks) {
        throw new Error(`Cannot add more audio chunks than specified in 'fastStart' (${__privateGet(this, _options).fastStart.expectedAudioChunks}).`);
      }
      let audioSample = __privateMethod(this, _createSampleForTrack, createSampleForTrack_fn).call(this, __privateGet(this, _audioTrack), data2, type, timestamp, duration, meta);
      if (__privateGet(this, _options).fastStart === "fragmented" && __privateGet(this, _videoTrack)) {
        while (__privateGet(this, _videoSampleQueue).length > 0 && __privateGet(this, _videoSampleQueue)[0].decodeTimestamp <= audioSample.decodeTimestamp) {
          let videoSample = __privateGet(this, _videoSampleQueue).shift();
          __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
        }
        if (audioSample.decodeTimestamp <= __privateGet(this, _videoTrack).lastDecodeTimestamp) {
          __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
        } else {
          __privateGet(this, _audioSampleQueue).push(audioSample);
        }
      } else {
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
      }
    }
    /** Finalizes the file, making it ready for use. Must be called after all video and audio chunks have been added. */
    finalize() {
      if (__privateGet(this, _finalized)) {
        throw new Error("Cannot finalize a muxer more than once.");
      }
      if (__privateGet(this, _options).fastStart === "fragmented") {
        for (let videoSample of __privateGet(this, _videoSampleQueue))
          __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
        for (let audioSample of __privateGet(this, _audioSampleQueue))
          __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
        __privateMethod(this, _finalizeFragment, finalizeFragment_fn).call(this, false);
      } else {
        if (__privateGet(this, _videoTrack))
          __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, __privateGet(this, _videoTrack));
        if (__privateGet(this, _audioTrack))
          __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, __privateGet(this, _audioTrack));
      }
      let tracks = [__privateGet(this, _videoTrack), __privateGet(this, _audioTrack)].filter(Boolean);
      if (__privateGet(this, _options).fastStart === "in-memory") {
        let mdatSize;
        for (let i = 0; i < 2; i++) {
          let movieBox2 = moov(tracks, __privateGet(this, _creationTime));
          let movieBoxSize = __privateGet(this, _writer).measureBox(movieBox2);
          mdatSize = __privateGet(this, _writer).measureBox(__privateGet(this, _mdat));
          let currentChunkPos = __privateGet(this, _writer).pos + movieBoxSize + mdatSize;
          for (let chunk of __privateGet(this, _finalizedChunks)) {
            chunk.offset = currentChunkPos;
            for (let { data: data2 } of chunk.samples) {
              currentChunkPos += data2.byteLength;
              mdatSize += data2.byteLength;
            }
          }
          if (currentChunkPos < 2 ** 32)
            break;
          if (mdatSize >= 2 ** 32)
            __privateGet(this, _mdat).largeSize = true;
        }
        let movieBox = moov(tracks, __privateGet(this, _creationTime));
        __privateGet(this, _writer).writeBox(movieBox);
        __privateGet(this, _mdat).size = mdatSize;
        __privateGet(this, _writer).writeBox(__privateGet(this, _mdat));
        for (let chunk of __privateGet(this, _finalizedChunks)) {
          for (let sample of chunk.samples) {
            __privateGet(this, _writer).write(sample.data);
            sample.data = null;
          }
        }
      } else if (__privateGet(this, _options).fastStart === "fragmented") {
        let startPos = __privateGet(this, _writer).pos;
        let mfraBox = mfra(tracks);
        __privateGet(this, _writer).writeBox(mfraBox);
        let mfraBoxSize = __privateGet(this, _writer).pos - startPos;
        __privateGet(this, _writer).seek(__privateGet(this, _writer).pos - 4);
        __privateGet(this, _writer).writeU32(mfraBoxSize);
      } else {
        let mdatPos = __privateGet(this, _writer).offsets.get(__privateGet(this, _mdat));
        let mdatSize = __privateGet(this, _writer).pos - mdatPos;
        __privateGet(this, _mdat).size = mdatSize;
        __privateGet(this, _mdat).largeSize = mdatSize >= 2 ** 32;
        __privateGet(this, _writer).patchBox(__privateGet(this, _mdat));
        let movieBox = moov(tracks, __privateGet(this, _creationTime));
        if (typeof __privateGet(this, _options).fastStart === "object") {
          __privateGet(this, _writer).seek(__privateGet(this, _ftypSize));
          __privateGet(this, _writer).writeBox(movieBox);
          let remainingBytes = mdatPos - __privateGet(this, _writer).pos;
          __privateGet(this, _writer).writeBox(free(remainingBytes));
        } else {
          __privateGet(this, _writer).writeBox(movieBox);
        }
      }
      __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
      __privateGet(this, _writer).finalize();
      __privateSet(this, _finalized, true);
    }
  };
  _options = /* @__PURE__ */ new WeakMap();
  _writer = /* @__PURE__ */ new WeakMap();
  _ftypSize = /* @__PURE__ */ new WeakMap();
  _mdat = /* @__PURE__ */ new WeakMap();
  _videoTrack = /* @__PURE__ */ new WeakMap();
  _audioTrack = /* @__PURE__ */ new WeakMap();
  _creationTime = /* @__PURE__ */ new WeakMap();
  _finalizedChunks = /* @__PURE__ */ new WeakMap();
  _nextFragmentNumber = /* @__PURE__ */ new WeakMap();
  _videoSampleQueue = /* @__PURE__ */ new WeakMap();
  _audioSampleQueue = /* @__PURE__ */ new WeakMap();
  _finalized = /* @__PURE__ */ new WeakMap();
  _validateOptions = /* @__PURE__ */ new WeakSet();
  validateOptions_fn = function(options) {
    if (options.video) {
      if (!SUPPORTED_VIDEO_CODECS2.includes(options.video.codec)) {
        throw new Error(`Unsupported video codec: ${options.video.codec}`);
      }
      const videoRotation = options.video.rotation;
      if (typeof videoRotation === "number" && ![0, 90, 180, 270].includes(videoRotation)) {
        throw new Error(`Invalid video rotation: ${videoRotation}. Has to be 0, 90, 180 or 270.`);
      } else if (Array.isArray(videoRotation) && (videoRotation.length !== 9 || videoRotation.some((value) => typeof value !== "number"))) {
        throw new Error(`Invalid video transformation matrix: ${videoRotation.join()}`);
      }
    }
    if (options.audio && !SUPPORTED_AUDIO_CODECS2.includes(options.audio.codec)) {
      throw new Error(`Unsupported audio codec: ${options.audio.codec}`);
    }
    if (options.firstTimestampBehavior && !FIRST_TIMESTAMP_BEHAVIORS.includes(options.firstTimestampBehavior)) {
      throw new Error(`Invalid first timestamp behavior: ${options.firstTimestampBehavior}`);
    }
    if (typeof options.fastStart === "object") {
      if (options.video && options.fastStart.expectedVideoChunks === void 0) {
        throw new Error(`'fastStart' is an object but is missing property 'expectedVideoChunks'.`);
      }
      if (options.audio && options.fastStart.expectedAudioChunks === void 0) {
        throw new Error(`'fastStart' is an object but is missing property 'expectedAudioChunks'.`);
      }
    } else if (![false, "in-memory", "fragmented"].includes(options.fastStart)) {
      throw new Error(`'fastStart' option must be false, 'in-memory', 'fragmented' or an object.`);
    }
  };
  _writeHeader = /* @__PURE__ */ new WeakSet();
  writeHeader_fn = function() {
    var _a;
    __privateGet(this, _writer).writeBox(ftyp({
      holdsAvc: ((_a = __privateGet(this, _options).video) == null ? void 0 : _a.codec) === "avc",
      fragmented: __privateGet(this, _options).fastStart === "fragmented"
    }));
    __privateSet(this, _ftypSize, __privateGet(this, _writer).pos);
    if (__privateGet(this, _options).fastStart === "in-memory") {
      __privateSet(this, _mdat, mdat(false));
    } else if (__privateGet(this, _options).fastStart === "fragmented") ;
    else {
      if (typeof __privateGet(this, _options).fastStart === "object") {
        let moovSizeUpperBound = __privateMethod(this, _computeMoovSizeUpperBound, computeMoovSizeUpperBound_fn).call(this);
        __privateGet(this, _writer).seek(__privateGet(this, _writer).pos + moovSizeUpperBound);
      }
      __privateSet(this, _mdat, mdat(true));
      __privateGet(this, _writer).writeBox(__privateGet(this, _mdat));
    }
    __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
  };
  _computeMoovSizeUpperBound = /* @__PURE__ */ new WeakSet();
  computeMoovSizeUpperBound_fn = function() {
    if (typeof __privateGet(this, _options).fastStart !== "object")
      return;
    let upperBound = 0;
    let sampleCounts = [
      __privateGet(this, _options).fastStart.expectedVideoChunks,
      __privateGet(this, _options).fastStart.expectedAudioChunks
    ];
    for (let n of sampleCounts) {
      if (!n)
        continue;
      upperBound += (4 + 4) * Math.ceil(2 / 3 * n);
      upperBound += 4 * n;
      upperBound += (4 + 4 + 4) * Math.ceil(2 / 3 * n);
      upperBound += 4 * n;
      upperBound += 8 * n;
    }
    upperBound += 4096;
    return upperBound;
  };
  _prepareTracks = /* @__PURE__ */ new WeakSet();
  prepareTracks_fn = function() {
    if (__privateGet(this, _options).video) {
      __privateSet(this, _videoTrack, {
        id: 1,
        info: {
          type: "video",
          codec: __privateGet(this, _options).video.codec,
          width: __privateGet(this, _options).video.width,
          height: __privateGet(this, _options).video.height,
          rotation: __privateGet(this, _options).video.rotation ?? 0,
          decoderConfig: null
        },
        timescale: 11520,
        // Timescale used by FFmpeg, contains many common frame rates as factors
        samples: [],
        finalizedChunks: [],
        currentChunk: null,
        firstDecodeTimestamp: void 0,
        lastDecodeTimestamp: -1,
        timeToSampleTable: [],
        compositionTimeOffsetTable: [],
        lastTimescaleUnits: null,
        lastSample: null,
        compactlyCodedChunkTable: []
      });
    }
    if (__privateGet(this, _options).audio) {
      let guessedCodecPrivate = __privateMethod(this, _generateMpeg4AudioSpecificConfig, generateMpeg4AudioSpecificConfig_fn).call(
        this,
        2,
        // Object type for AAC-LC, since it's the most common
        __privateGet(this, _options).audio.sampleRate,
        __privateGet(this, _options).audio.numberOfChannels
      );
      __privateSet(this, _audioTrack, {
        id: __privateGet(this, _options).video ? 2 : 1,
        info: {
          type: "audio",
          codec: __privateGet(this, _options).audio.codec,
          numberOfChannels: __privateGet(this, _options).audio.numberOfChannels,
          sampleRate: __privateGet(this, _options).audio.sampleRate,
          decoderConfig: {
            codec: __privateGet(this, _options).audio.codec,
            description: guessedCodecPrivate,
            numberOfChannels: __privateGet(this, _options).audio.numberOfChannels,
            sampleRate: __privateGet(this, _options).audio.sampleRate
          }
        },
        timescale: __privateGet(this, _options).audio.sampleRate,
        samples: [],
        finalizedChunks: [],
        currentChunk: null,
        firstDecodeTimestamp: void 0,
        lastDecodeTimestamp: -1,
        timeToSampleTable: [],
        compositionTimeOffsetTable: [],
        lastTimescaleUnits: null,
        lastSample: null,
        compactlyCodedChunkTable: []
      });
    }
  };
  _generateMpeg4AudioSpecificConfig = /* @__PURE__ */ new WeakSet();
  generateMpeg4AudioSpecificConfig_fn = function(objectType, sampleRate, numberOfChannels) {
    let frequencyIndices = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350];
    let frequencyIndex = frequencyIndices.indexOf(sampleRate);
    let channelConfig = numberOfChannels;
    let configBits = "";
    configBits += objectType.toString(2).padStart(5, "0");
    configBits += frequencyIndex.toString(2).padStart(4, "0");
    if (frequencyIndex === 15)
      configBits += sampleRate.toString(2).padStart(24, "0");
    configBits += channelConfig.toString(2).padStart(4, "0");
    let paddingLength = Math.ceil(configBits.length / 8) * 8;
    configBits = configBits.padEnd(paddingLength, "0");
    let configBytes = new Uint8Array(configBits.length / 8);
    for (let i = 0; i < configBits.length; i += 8) {
      configBytes[i / 8] = parseInt(configBits.slice(i, i + 8), 2);
    }
    return configBytes;
  };
  _createSampleForTrack = /* @__PURE__ */ new WeakSet();
  createSampleForTrack_fn = function(track, data2, type, timestamp, duration, meta, compositionTimeOffset) {
    let presentationTimestampInSeconds = timestamp / 1e6;
    let decodeTimestampInSeconds = (timestamp - (compositionTimeOffset ?? 0)) / 1e6;
    let durationInSeconds = duration / 1e6;
    let adjusted = __privateMethod(this, _validateTimestamp, validateTimestamp_fn).call(this, presentationTimestampInSeconds, decodeTimestampInSeconds, track);
    presentationTimestampInSeconds = adjusted.presentationTimestamp;
    decodeTimestampInSeconds = adjusted.decodeTimestamp;
    if (meta == null ? void 0 : meta.decoderConfig) {
      if (track.info.decoderConfig === null) {
        track.info.decoderConfig = meta.decoderConfig;
      } else {
        Object.assign(track.info.decoderConfig, meta.decoderConfig);
      }
    }
    let sample = {
      presentationTimestamp: presentationTimestampInSeconds,
      decodeTimestamp: decodeTimestampInSeconds,
      duration: durationInSeconds,
      data: data2,
      size: data2.byteLength,
      type,
      // Will be refined once the next sample comes in
      timescaleUnitsToNextSample: intoTimescale(durationInSeconds, track.timescale)
    };
    return sample;
  };
  _addSampleToTrack = /* @__PURE__ */ new WeakSet();
  addSampleToTrack_fn = function(track, sample) {
    if (__privateGet(this, _options).fastStart !== "fragmented") {
      track.samples.push(sample);
    }
    const sampleCompositionTimeOffset = intoTimescale(sample.presentationTimestamp - sample.decodeTimestamp, track.timescale);
    if (track.lastTimescaleUnits !== null) {
      let timescaleUnits = intoTimescale(sample.decodeTimestamp, track.timescale, false);
      let delta = Math.round(timescaleUnits - track.lastTimescaleUnits);
      track.lastTimescaleUnits += delta;
      track.lastSample.timescaleUnitsToNextSample = delta;
      if (__privateGet(this, _options).fastStart !== "fragmented") {
        let lastTableEntry = last(track.timeToSampleTable);
        if (lastTableEntry.sampleCount === 1) {
          lastTableEntry.sampleDelta = delta;
          lastTableEntry.sampleCount++;
        } else if (lastTableEntry.sampleDelta === delta) {
          lastTableEntry.sampleCount++;
        } else {
          lastTableEntry.sampleCount--;
          track.timeToSampleTable.push({
            sampleCount: 2,
            sampleDelta: delta
          });
        }
        const lastCompositionTimeOffsetTableEntry = last(track.compositionTimeOffsetTable);
        if (lastCompositionTimeOffsetTableEntry.sampleCompositionTimeOffset === sampleCompositionTimeOffset) {
          lastCompositionTimeOffsetTableEntry.sampleCount++;
        } else {
          track.compositionTimeOffsetTable.push({
            sampleCount: 1,
            sampleCompositionTimeOffset
          });
        }
      }
    } else {
      track.lastTimescaleUnits = 0;
      if (__privateGet(this, _options).fastStart !== "fragmented") {
        track.timeToSampleTable.push({
          sampleCount: 1,
          sampleDelta: intoTimescale(sample.duration, track.timescale)
        });
        track.compositionTimeOffsetTable.push({
          sampleCount: 1,
          sampleCompositionTimeOffset
        });
      }
    }
    track.lastSample = sample;
    let beginNewChunk = false;
    if (!track.currentChunk) {
      beginNewChunk = true;
    } else {
      let currentChunkDuration = sample.presentationTimestamp - track.currentChunk.startTimestamp;
      if (__privateGet(this, _options).fastStart === "fragmented") {
        let mostImportantTrack = __privateGet(this, _videoTrack) ?? __privateGet(this, _audioTrack);
        if (track === mostImportantTrack && sample.type === "key" && currentChunkDuration >= 1) {
          beginNewChunk = true;
          __privateMethod(this, _finalizeFragment, finalizeFragment_fn).call(this);
        }
      } else {
        beginNewChunk = currentChunkDuration >= 0.5;
      }
    }
    if (beginNewChunk) {
      if (track.currentChunk) {
        __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, track);
      }
      track.currentChunk = {
        startTimestamp: sample.presentationTimestamp,
        samples: []
      };
    }
    track.currentChunk.samples.push(sample);
  };
  _validateTimestamp = /* @__PURE__ */ new WeakSet();
  validateTimestamp_fn = function(presentationTimestamp, decodeTimestamp, track) {
    var _a, _b;
    const strictTimestampBehavior = __privateGet(this, _options).firstTimestampBehavior === "strict";
    const noLastDecodeTimestamp = track.lastDecodeTimestamp === -1;
    const timestampNonZero = decodeTimestamp !== 0;
    if (strictTimestampBehavior && noLastDecodeTimestamp && timestampNonZero) {
      throw new Error(
        `The first chunk for your media track must have a timestamp of 0 (received DTS=${decodeTimestamp}).Non-zero first timestamps are often caused by directly piping frames or audio data from a MediaStreamTrack into the encoder. Their timestamps are typically relative to the age of thedocument, which is probably what you want.

If you want to offset all timestamps of a track such that the first one is zero, set firstTimestampBehavior: 'offset' in the options.
`
      );
    } else if (__privateGet(this, _options).firstTimestampBehavior === "offset" || __privateGet(this, _options).firstTimestampBehavior === "cross-track-offset") {
      if (track.firstDecodeTimestamp === void 0) {
        track.firstDecodeTimestamp = decodeTimestamp;
      }
      let baseDecodeTimestamp;
      if (__privateGet(this, _options).firstTimestampBehavior === "offset") {
        baseDecodeTimestamp = track.firstDecodeTimestamp;
      } else {
        baseDecodeTimestamp = Math.min(
          ((_a = __privateGet(this, _videoTrack)) == null ? void 0 : _a.firstDecodeTimestamp) ?? Infinity,
          ((_b = __privateGet(this, _audioTrack)) == null ? void 0 : _b.firstDecodeTimestamp) ?? Infinity
        );
      }
      decodeTimestamp -= baseDecodeTimestamp;
      presentationTimestamp -= baseDecodeTimestamp;
    }
    if (decodeTimestamp < track.lastDecodeTimestamp) {
      throw new Error(
        `Timestamps must be monotonically increasing (DTS went from ${track.lastDecodeTimestamp * 1e6} to ${decodeTimestamp * 1e6}).`
      );
    }
    track.lastDecodeTimestamp = decodeTimestamp;
    return { presentationTimestamp, decodeTimestamp };
  };
  _finalizeCurrentChunk = /* @__PURE__ */ new WeakSet();
  finalizeCurrentChunk_fn = function(track) {
    if (__privateGet(this, _options).fastStart === "fragmented") {
      throw new Error("Can't finalize individual chunks 'fastStart' is set to 'fragmented'.");
    }
    if (!track.currentChunk)
      return;
    track.finalizedChunks.push(track.currentChunk);
    __privateGet(this, _finalizedChunks).push(track.currentChunk);
    if (track.compactlyCodedChunkTable.length === 0 || last(track.compactlyCodedChunkTable).samplesPerChunk !== track.currentChunk.samples.length) {
      track.compactlyCodedChunkTable.push({
        firstChunk: track.finalizedChunks.length,
        // 1-indexed
        samplesPerChunk: track.currentChunk.samples.length
      });
    }
    if (__privateGet(this, _options).fastStart === "in-memory") {
      track.currentChunk.offset = 0;
      return;
    }
    track.currentChunk.offset = __privateGet(this, _writer).pos;
    for (let sample of track.currentChunk.samples) {
      __privateGet(this, _writer).write(sample.data);
      sample.data = null;
    }
    __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
  };
  _finalizeFragment = /* @__PURE__ */ new WeakSet();
  finalizeFragment_fn = function(flushStreamingWriter = true) {
    if (__privateGet(this, _options).fastStart !== "fragmented") {
      throw new Error("Can't finalize a fragment unless 'fastStart' is set to 'fragmented'.");
    }
    let tracks = [__privateGet(this, _videoTrack), __privateGet(this, _audioTrack)].filter((track) => track && track.currentChunk);
    if (tracks.length === 0)
      return;
    let fragmentNumber = __privateWrapper(this, _nextFragmentNumber)._++;
    if (fragmentNumber === 1) {
      let movieBox = moov(tracks, __privateGet(this, _creationTime), true);
      __privateGet(this, _writer).writeBox(movieBox);
    }
    let moofOffset = __privateGet(this, _writer).pos;
    let moofBox = moof(fragmentNumber, tracks);
    __privateGet(this, _writer).writeBox(moofBox);
    {
      let mdatBox = mdat(false);
      let totalTrackSampleSize = 0;
      for (let track of tracks) {
        for (let sample of track.currentChunk.samples) {
          totalTrackSampleSize += sample.size;
        }
      }
      let mdatSize = __privateGet(this, _writer).measureBox(mdatBox) + totalTrackSampleSize;
      if (mdatSize >= 2 ** 32) {
        mdatBox.largeSize = true;
        mdatSize = __privateGet(this, _writer).measureBox(mdatBox) + totalTrackSampleSize;
      }
      mdatBox.size = mdatSize;
      __privateGet(this, _writer).writeBox(mdatBox);
    }
    for (let track of tracks) {
      track.currentChunk.offset = __privateGet(this, _writer).pos;
      track.currentChunk.moofOffset = moofOffset;
      for (let sample of track.currentChunk.samples) {
        __privateGet(this, _writer).write(sample.data);
        sample.data = null;
      }
    }
    let endPos = __privateGet(this, _writer).pos;
    __privateGet(this, _writer).seek(__privateGet(this, _writer).offsets.get(moofBox));
    let newMoofBox = moof(fragmentNumber, tracks);
    __privateGet(this, _writer).writeBox(newMoofBox);
    __privateGet(this, _writer).seek(endPos);
    for (let track of tracks) {
      track.finalizedChunks.push(track.currentChunk);
      __privateGet(this, _finalizedChunks).push(track.currentChunk);
      track.currentChunk = null;
    }
    if (flushStreamingWriter) {
      __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
    }
  };
  _maybeFlushStreamingTargetWriter = /* @__PURE__ */ new WeakSet();
  maybeFlushStreamingTargetWriter_fn = function() {
    if (__privateGet(this, _writer) instanceof StreamTargetWriter) {
      __privateGet(this, _writer).flush();
    }
  };
  _ensureNotFinalized = /* @__PURE__ */ new WeakSet();
  ensureNotFinalized_fn = function() {
    if (__privateGet(this, _finalized)) {
      throw new Error("Cannot add new video or audio chunks after the file has been finalized.");
    }
  };
  async function mp4(frames, convertMeta) {
    const p = frames.map((frame) => createImageBitmap(frame));
    const bitmaps = await Promise.all(p);
    if (convertMeta.isAborted) throw new CancelError();
    let width = bitmaps[0].width;
    let height = bitmaps[0].height;
    if (width % 2 !== 0) width += 1;
    if (height % 2 !== 0) height += 1;
    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
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
      bitrate: 2e7
    });
    const delays = convertMeta.source.delays.map((delay) => delay *= 1e3);
    let timestamp = 0;
    const videoFrames = [];
    for (let i = 0; i < bitmaps.length; i++) {
      const frame = new VideoFrame(bitmaps[i], { duration: delays[i], timestamp });
      videoFrames.push(frame);
      videoEncoder.encode(frame, {
        keyFrame: true
      });
      timestamp += delays[i];
    }
    await videoEncoder.flush();
    if (convertMeta.isAborted) throw new CancelError();
    muxer.finalize();
    const { buffer } = muxer.target;
    videoFrames.forEach((frame) => frame.close());
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
    }
  };
  function createConverter() {
    const MAX_CONVERT = 2;
    const framesData = {};
    let isStop = false;
    let queue = [];
    let active2 = [];
    const doConvert = (convertMeta) => {
      var _a;
      const { id, format, source, resolve, reject } = convertMeta;
      active2.push(convertMeta);
      (_a = convertMeta.onProgress) == null ? void 0 : _a.call(convertMeta, 0);
      delete framesData[id];
      const adapter2 = convertAdapter.getAdapter(format);
      adapter2(source.data, convertMeta).then(resolve, reject).finally(() => {
        active2.splice(active2.indexOf(convertMeta), 1);
        if (queue.length) doConvert(queue.shift());
      });
    };
    return {
      del: (taskIds) => {
        if (typeof taskIds === "string") taskIds = [taskIds];
        if (!taskIds.length) return;
        logger.info(
          "Converter del, active:",
          active2.map((meta) => meta.id),
          "queue:",
          queue.map((meta) => meta.id)
        );
        isStop = true;
        taskIds.forEach((taskId) => {
          if (taskId in framesData) delete framesData[taskId];
        });
        active2 = active2.filter((convertMeta) => {
          if (taskIds.includes(convertMeta.id)) {
            convertMeta.abort();
          } else {
            return true;
          }
        });
        queue = queue.filter((convertMeta) => !taskIds.includes(convertMeta.id));
        isStop = false;
        while (active2.length < MAX_CONVERT && queue.length) {
          doConvert(queue.shift());
        }
      },
      addFrame(taskId, data2, delay, order) {
        if (!(taskId in framesData)) {
          framesData[taskId] = {
            id: taskId,
            data: [],
            delays: []
          };
        }
        if (order === void 0) {
          framesData[taskId]["data"].push(data2);
          framesData[taskId]["delays"].push(delay);
        } else {
          framesData[taskId]["data"][order] = data2;
          framesData[taskId]["delays"][order] = delay;
        }
      },
      framesCount(taskId) {
        return taskId in framesData ? framesData[taskId]["delays"].filter((delay) => delay !== void 0).length : 0;
      },
      convert(taskId, format, onProgress) {
        return new Promise((resolve, reject) => {
          const meta = {
            id: taskId,
            format,
            source: framesData[taskId],
            isAborted: false,
            onProgress,
            resolve,
            reject,
            abort() {
              this.isAborted = true;
            }
          };
          logger.info("Converter add", taskId);
          queue.push(meta);
          while (active2.length < MAX_CONVERT && queue.length && !isStop) {
            doConvert(queue.shift());
          }
        });
      }
    };
  }
  const converter = createConverter();
  const pixivHooks = {
    download: {
      singleArtworkProgressFactory(btn, pageCount) {
        if (!btn || !pageCount) return;
        return function onSingleArtworkProgress(progress) {
          if (pageCount === 1) {
            btn.setProgress(progress);
          }
        };
      },
      mulityArtworksProgressFactory(btn, pageCount) {
        if (!btn || !pageCount) return;
        let pageComplete = 0;
        return function onMulityArtworksProgress() {
          if (pageCount < 2) return;
          const progress = Math.floor(++pageComplete / pageCount * 100);
          btn.setProgress(progress);
        };
      }
    },
    bundle: {
      async beforeFileSave(imgBlob, config2) {
        const { taskId, source } = config2;
        compressor.add(taskId, source.filename, imgBlob);
        if (compressor.fileCount(taskId) === source.pageCount) {
          let comment;
          if ("ugoiraMeta" in config2.source) {
            const delays = config2.source.ugoiraMeta.frames.map((frames) => frames.delay);
            comment = JSON.stringify(delays);
          }
          const zipData = await compressor.bundle(taskId, comment);
          compressor.remove(taskId);
          return zipData;
        }
      },
      onError(err, config2) {
        compressor.remove(config2.taskId);
      },
      onAbort(config2) {
        compressor.remove(config2.taskId);
      }
    },
    convert: {
      convertProgressFactory(btn) {
        return function onConvertProgress(progress) {
          if (progress > 0) {
            btn.setProgress(progress, false);
          } else {
            btn.setStatus(ThumbnailBtnStatus.Loading);
          }
        };
      },
      beforeFileSaveFactory(btn) {
        const onProgress = btn ? this.convertProgressFactory(btn) : void 0;
        return async function beforeFileSave(imgBlob, config2) {
          const { taskId, source } = config2;
          if (source.illustType === IllustType.ugoira) {
            converter.addFrame(
              taskId,
              imgBlob,
              source.ugoiraMeta.frames[source.order]["delay"],
              source.order
            );
            if (converter.framesCount(taskId) === source.pageCount) {
              return await converter.convert(taskId, source.extendName, onProgress);
            }
          }
        };
      },
      onError(err, config2) {
        converter.del(config2.taskId);
      },
      onAbort(config2) {
        converter.del(config2.taskId);
      }
    }
  };
  const downloaderHooks = {
    getHooks(meta, downloadType, button) {
      switch (downloadType) {
        case "download":
          return {
            onProgress: pixivHooks.download.singleArtworkProgressFactory(button, meta.pageCount),
            onFileSaved: pixivHooks.download.mulityArtworksProgressFactory(button, meta.pageCount)
          };
        case "bundle":
          return {
            onXhrLoaded: pixivHooks.download.mulityArtworksProgressFactory(button, meta.pageCount),
            beforeFileSave: pixivHooks.bundle.beforeFileSave,
            onError: pixivHooks.bundle.onError
          };
        case "convert":
          return {
            onXhrLoaded: pixivHooks.download.mulityArtworksProgressFactory(button, meta.pageCount),
            beforeFileSave: pixivHooks.convert.beforeFileSaveFactory(button),
            onError: pixivHooks.convert.onError
          };
      }
    }
  };
  class PixivDownloadConfig extends DownloadConfigBuilder {
    constructor(meta) {
      super(meta);
      __publicField(this, "downloadAll", true);
      __publicField(this, "headers", {
        referer: "https://www.pixiv.net"
      });
      __publicField(this, "timeout", 6e4);
      __publicField(this, "getImgSrc", () => "");
      this.meta = meta;
      this.getImgSrc = this.meta.illustType === IllustType.ugoira ? (page) => this.meta.src.replace("ugoira0", "ugoira" + page) : (page) => this.meta.src.replace("_p0", "_p" + page);
    }
    getConvertFormat() {
      return config.get("ugoiraFormat");
    }
    needConvert() {
      return this.meta.illustType === IllustType.ugoira && config.get("ugoiraFormat") !== "zip";
    }
    needBundle() {
      const { pageCount, illustType } = this.meta;
      return this.downloadAll && (illustType === IllustType.ugoira && this.getConvertFormat() === "zip" || pageCount > 1 && (illustType === IllustType.manga && config.get("bundleManga") || illustType === IllustType.illusts && config.get("bundleIllusts")));
    }
    useTranslatedTags() {
      return config.get("tagLang") !== "ja";
    }
    // directSave使firefox下载图片时支持子目录
    useDirectSave() {
      return !!this.getFolderPattern() && !this.needBundle() && !this.needConvert() && (!env.isBlobDlAvaliable() || env.isViolentmonkey() && !this.isFsaEnable());
    }
    supportSubpath() {
      return this.isBrowserApi() || this.isFsaEnable();
    }
    buildPattern(pattern, page) {
      const { id, userId, artist, title, tags, tagsTranslated, createDate, pageCount } = this.meta;
      const currPage = page === void 0 ? pageCount : page;
      const useTags = this.useTranslatedTags() ? tagsTranslated : tags;
      const fArtist = this.normalizeString(artist);
      const fTitle = this.normalizeString(title);
      const fTags = this.normalizeString(useTags.join("_"));
      const replaceDate = (match, p1) => {
        const format = p1 || "YYYY-MM-DD";
        return dayjs(createDate).format(format);
      };
      return pattern.replaceAll(/\{date\((.*?)\)\}|\{date\}/g, replaceDate).replaceAll("{artist}", fArtist).replaceAll("{artistID}", userId).replaceAll("{title}", fTitle).replaceAll("{tags}", fTags).replaceAll("{page}", String(currPage)).replaceAll("{id}", id);
    }
    getDownloadConfig(btn) {
      const { illustType, src, id, pageCount, extendName } = this.meta;
      const pageAttr = btn == null ? void 0 : btn.getAttribute("page");
      const downloadPage = pageAttr ? Number(pageAttr) : void 0;
      if (downloadPage && (downloadPage > pageCount - 1 || downloadPage < 0))
        throw new Error("Invalid downloadPage.");
      if (downloadPage !== void 0) this.downloadAll = false;
      const taskId = id + "_" + Math.random().toString(36).slice(2);
      const headers = this.headers;
      const directSave = this.useDirectSave();
      const supportSubPath = this.supportSubpath();
      const downloadConfigs = [];
      if ((pageCount === 1 || downloadPage !== void 0) && illustType !== IllustType.ugoira) {
        const imgSrc = downloadPage ? this.getImgSrc(downloadPage) : src;
        const pathPattern = supportSubPath ? this.getFullpathPattern() : this.getFilenamePattern() + "." + extendName;
        const path = this.buildPattern(pathPattern, downloadPage ? downloadPage : 0);
        const filename = path.slice(path.lastIndexOf("/") + 1);
        const hooks = downloaderHooks.getHooks({ ...this.meta, pageCount: 1 }, "download", btn);
        const source = {
          ...this.meta,
          pageCount: 1,
          filename,
          order: downloadPage ?? 0
        };
        const downloadConfig = {
          taskId,
          src: imgSrc,
          path,
          source,
          directSave,
          headers,
          timeout: this.timeout,
          ...hooks
        };
        downloadConfigs.push(downloadConfig);
      } else {
        const pathPatternNoExt = supportSubPath ? this.getFullpathPattern().slice(0, -4) : this.getFilenamePattern();
        if (this.needBundle()) {
          const pathPattern = pathPatternNoExt + ".zip";
          const filenamePattern = this.getFilenamePattern().includes("{page}") ? this.getFilenamePattern() + "." + extendName : this.getFilenamePattern() + "_{page}." + extendName;
          let path;
          let imgCount;
          if (illustType === IllustType.ugoira) {
            path = this.buildPattern(pathPattern, 0);
            imgCount = this.meta.ugoiraMeta.frames.length;
          } else {
            path = this.buildPattern(pathPattern);
            imgCount = pageCount;
          }
          const hooks = downloaderHooks.getHooks(
            { ...this.meta, pageCount: imgCount },
            "bundle",
            btn
          );
          for (let page = 0; page < imgCount; page++) {
            const filename = this.buildPattern(filenamePattern, page);
            const imgSrc = this.getImgSrc(page);
            const source = {
              ...this.meta,
              pageCount: imgCount,
              extendName: "zip",
              filename,
              order: page
            };
            const downloadConfig = {
              taskId,
              src: imgSrc,
              path,
              source,
              headers,
              timeout: this.timeout,
              ...hooks
            };
            downloadConfigs.push(downloadConfig);
          }
        } else if (this.needConvert()) {
          const ext = this.getConvertFormat();
          const pathPattern = pathPatternNoExt + "." + ext;
          const path = this.buildPattern(pathPattern, 0);
          const filename = path.slice(path.lastIndexOf("/") + 1);
          const imgCount = this.meta.ugoiraMeta.frames.length;
          const hooks = downloaderHooks.getHooks(
            { ...this.meta, pageCount: imgCount },
            "convert",
            btn
          );
          for (let page = 0; page < imgCount; page++) {
            const imgSrc = this.getImgSrc(page);
            const source = {
              ...this.meta,
              pageCount: imgCount,
              extendName: ext,
              filename,
              order: page
            };
            const downloadConfig = {
              taskId,
              src: imgSrc,
              path,
              source,
              headers,
              timeout: this.timeout,
              ...hooks
            };
            downloadConfigs.push(downloadConfig);
          }
        } else {
          const pathPattern = pathPatternNoExt + "." + extendName;
          const hooks = downloaderHooks.getHooks(this.meta, "download", btn);
          for (let page = 0; page < pageCount; page++) {
            const path = this.buildPattern(pathPattern, page);
            const filename = path.slice(path.lastIndexOf("/") + 1);
            const imgSrc = this.getImgSrc(page);
            const source = {
              ...this.meta,
              filename,
              order: page
            };
            const downloadConfig = {
              taskId,
              src: imgSrc,
              path,
              source,
              directSave,
              headers,
              timeout: this.timeout,
              ...hooks
            };
            downloadConfigs.push(downloadConfig);
          }
        }
      }
      !this.downloadAll && (this.downloadAll = true);
      return downloadConfigs;
    }
  }
  async function downloadArtwork(btn) {
    downloader.dirHandleCheck();
    const id = btn.getAttribute("pdl-id");
    const pixivMeta = await pixivParser.parse(id);
    const { bookmarkData, token, tags, artist, userId, title } = pixivMeta;
    if (!bookmarkData) {
      addBookmark(btn, id, token, tags);
    }
    const downloadConfigs = new PixivDownloadConfig(pixivMeta).getDownloadConfig(btn);
    await downloader.download(downloadConfigs);
    const historyData = {
      pid: Number(id),
      user: artist,
      userId: Number(userId),
      title,
      tags
    };
    historyDb.add(historyData);
  }
  function createThumbnailBtn(nodes) {
    let isSelfBookmark = false;
    const inBookmarkPage = regexp.bookmarkPage.exec(location.pathname);
    inBookmarkPage && inBookmarkPage[1] === getSelfId() && (isSelfBookmark = true);
    nodes.forEach((e) => {
      let illustId;
      let type;
      if ((e.childElementCount !== 0 || e.className.includes("_history-item") || e.className.includes("_history-related-item")) && !e.querySelector("pdl-button") && (illustId = getIllustId(e))) {
        if (isSelfBookmark) {
          type = ThumbnailBtnType.PixivMyBookmark;
        } else if (e.className.includes("_history-related-item")) {
          e.style.position = "relative";
          type = ThumbnailBtnType.PixivHistory;
        } else if (e.className.includes("_history-item")) {
          type = ThumbnailBtnType.PixivHistory;
        }
        const btn = new ThumbnailButton({
          id: illustId,
          type,
          onClick: downloadArtwork
        });
        e.appendChild(btn);
      }
    });
  }
  function fixPixivPreviewer(nodes) {
    const isPpSearchPage = regexp.searchPage.test(location.pathname);
    if (!isPpSearchPage) return;
    nodes.forEach((node) => {
      const pdlEle = node.querySelector("pdl-button");
      if (!pdlEle) return false;
      pdlEle.remove();
    });
  }
  function createPdlBtn(option) {
    const { attrs, classList, textContent, downloadArtwork: downloadArtwork2 } = option;
    const ele = document.createElement("button");
    textContent && (ele.textContent = textContent);
    if (classList && classList.length > 0) {
      for (const cla of classList) {
        ele.classList.add(cla);
      }
    }
    if (attrs) {
      for (const key in attrs) {
        ele.setAttribute(key, attrs[key]);
      }
    }
    if (downloadArtwork2) {
      ele.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const btn = evt.currentTarget;
        if (!btn.classList.contains("pdl-progress")) {
          btn.classList.add("pdl-progress");
          const setProgress = (progress, updateProgressbar = true) => {
            if (progress !== null) {
              progress = Math.floor(progress);
              btn.textContent = String(progress);
              updateProgressbar && btn.style.setProperty("--pdl-progress", progress + "%");
            } else {
              btn.textContent = "";
              updateProgressbar && btn.style.removeProperty("--pdl-progress");
            }
          };
          downloadArtwork2(btn, setProgress).then(() => {
            btn.classList.remove("pdl-error");
            btn.classList.add("pdl-complete");
          }).catch((err) => {
            if (err) logger.error(err);
            btn.classList.remove("pdl-complete");
            btn.classList.add("pdl-error");
          }).finally(() => {
            btn.innerHTML = "";
            btn.style.removeProperty("--pdl-progress");
            btn.classList.remove("pdl-progress");
          });
        }
      });
    }
    return ele;
  }
  const dlBarRef = {
    filter: {
      filterExcludeDownloaded: void 0,
      filterIllusts: void 0,
      filterManga: void 0,
      filterUgoira: void 0
    },
    statusBar: void 0,
    abortBtn: void 0
  };
  function updateStatus(str) {
    dlBarRef.statusBar && (dlBarRef.statusBar.textContent = str);
  }
  function createFilterEl(id, filterType, text2) {
    const checkbox2 = document.createElement("input");
    const label = document.createElement("label");
    checkbox2.id = id;
    checkbox2.type = "checkbox";
    checkbox2.classList.add("pdl-checkbox");
    checkbox2.setAttribute("category", String(filterType));
    checkbox2.checked = config.get(filterType);
    label.setAttribute("for", id);
    label.setAttribute("category", String(filterType));
    label.textContent = text2;
    checkbox2.addEventListener("change", (evt) => {
      const checkbox22 = evt.currentTarget;
      const category = checkbox22.getAttribute("category");
      config.set(category, checkbox22.checked);
    });
    dlBarRef.filter[filterType] = checkbox2;
    const wrap = document.createElement("div");
    wrap.classList.add("pdl-filter");
    wrap.appendChild(checkbox2);
    wrap.appendChild(label);
    return wrap;
  }
  function createFilter() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("pdl-filter-wrap");
    wrapper.appendChild(
      createFilterEl(
        "pdl-filter-exclude_downloaded",
        "filterExcludeDownloaded",
        t("checkbox.filter_exclude_downloaded")
      )
    );
    wrapper.appendChild(
      createFilterEl("pdl-filter-illusts", "filterIllusts", t("checkbox.filter_illusts"))
    );
    wrapper.appendChild(
      createFilterEl("pdl-filter-manga", "filterManga", t("checkbox.filter_manga"))
    );
    wrapper.appendChild(
      createFilterEl("pdl-filter-ugoira", "filterUgoira", t("checkbox.filter_ugoira"))
    );
    return wrapper;
  }
  function createExcludeDownloadedFilter() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("pdl-filter-wrap");
    wrapper.appendChild(
      createFilterEl(
        "pdl-filter-exclude_downloaded",
        "filterExcludeDownloaded",
        t("checkbox.filter_exclude_downloaded")
      )
    );
    return wrapper;
  }
  function createDownloadBar(userId) {
    const nav = document.querySelector("nav");
    if (!nav || nav.previousElementSibling) return;
    const dlBtn = nav.querySelector(".pdl-btn-all");
    if (dlBtn) {
      if (dlBtn.getAttribute("pdl-userid") === userId) return;
      removeDownloadBar();
    }
    const doesRequestPageLoaded = [
      "a[href$='illustrations']",
      "a[href$='manga']",
      "a[href*='bookmarks']"
    ].some((selector) => !!nav.querySelector(selector));
    if (!doesRequestPageLoaded) return;
    const dlBar = document.createElement("div");
    dlBar.classList.add("pdl-dlbar");
    const statusBar = document.createElement("div");
    statusBar.classList.add("pdl-dlbar-status_bar");
    dlBarRef.statusBar = dlBar.appendChild(statusBar);
    const baseClasses = nav.querySelector("a:not([aria-current])").classList;
    dlBarRef.abortBtn = dlBar.appendChild(
      createPdlBtn({
        attrs: { "pdl-userId": userId },
        classList: [...baseClasses, "pdl-stop", "pdl-hide"],
        textContent: t("button.download_stop")
      })
    );
    if (userId !== getSelfId()) {
      const hasWorks = ["a[href$='illustrations']", "a[href$='manga']"].some(
        (selector) => !!nav.querySelector(selector)
      );
      if (hasWorks) {
        const el = createPdlBtn({
          attrs: { "pdl-userid": userId },
          classList: [...baseClasses, "pdl-btn-all"],
          textContent: t("button.download_works")
        });
        el.addEventListener("click", downloadWorks);
        dlBar.appendChild(el);
      }
      if (nav.querySelector("a[href*='bookmarks']")) {
        const el = createPdlBtn({
          attrs: { "pdl-userid": userId, category: "bookmarks" },
          classList: [...baseClasses, "pdl-btn-all"],
          textContent: t("button.download_bookmarks")
        });
        el.addEventListener("click", downloadBookmarksOrTags);
        dlBar.appendChild(el);
      }
    } else {
      if (nav.querySelector("a[href*='bookmarks']")) {
        dlBar.appendChild(
          createPdlBtn({
            attrs: { "pdl-userid": userId, category: "bookmarks", rest: "all" },
            classList: [...baseClasses, "pdl-btn-all"],
            textContent: t("button.download_bookmarks")
          })
        );
        dlBar.appendChild(
          createPdlBtn({
            attrs: {
              "pdl-userid": userId,
              category: "bookmarks",
              rest: "show"
            },
            classList: [...baseClasses, "pdl-btn-all"],
            textContent: t("button.download_bookmarks_public")
          })
        );
        dlBar.appendChild(
          createPdlBtn({
            attrs: {
              "pdl-userid": userId,
              category: "bookmarks",
              rest: "hide"
            },
            classList: [...baseClasses, "pdl-btn-all"],
            textContent: t("button.download_bookmarks_private")
          })
        );
        dlBar.querySelectorAll(".pdl-btn-all").forEach((node) => {
          node.addEventListener("click", downloadBookmarksOrTags);
        });
      }
    }
    const filter = createFilter();
    nav.parentElement.insertBefore(filter, nav);
    nav.appendChild(dlBar);
  }
  function removeDownloadBar() {
    var _a;
    const dlBarWrap = document.querySelector(".pdl-dlbar");
    if (dlBarWrap) {
      dlBarWrap.remove();
      (_a = document.querySelector(".pdl-filter-wrap")) == null ? void 0 : _a.remove();
    }
  }
  function updateFollowLatestDownloadBarBtnText(prevDlBtn, prevDlAllBtn) {
    if (location.pathname.includes("r18") && prevDlBtn.textContent !== t("button.download_r18_one_page")) {
      prevDlBtn.textContent = t("button.download_r18_one_page");
      prevDlAllBtn.textContent = t("button.download_r18");
    } else if (!location.pathname.includes("r18") && prevDlBtn.textContent !== t("button.download_all_one_page")) {
      prevDlBtn.textContent = t("button.download_all_one_page");
      prevDlAllBtn.textContent = t("button.download_all");
    }
  }
  function createFollowLatestDownloadBar() {
    const prevDlBtn = document.querySelector(".pdl-btn-all");
    if (prevDlBtn) {
      const prevDlAllBtn = document.querySelector(".pdl-dl-all");
      updateFollowLatestDownloadBarBtnText(prevDlBtn, prevDlAllBtn);
      return;
    }
    const nav = document.querySelector("nav");
    if (!nav || nav.parentElement.childElementCount === 1) return;
    const navBar = nav.parentElement;
    const modeSwitch = nav.nextElementSibling;
    const filter = createFilter();
    navBar.parentElement.insertBefore(filter, navBar);
    const dlBar = document.createElement("div");
    dlBar.classList.add("pdl-dlbar");
    dlBar.classList.add("pdl-dlbar-follow_latest");
    const statusBar = document.createElement("div");
    statusBar.classList.add("pdl-dlbar-status_bar");
    dlBarRef.statusBar = dlBar.appendChild(statusBar);
    const baseClasses = nav.querySelector("a:not([aria-current])").classList;
    dlBarRef.abortBtn = dlBar.appendChild(
      createPdlBtn({
        attrs: { "pdl-userid": "" },
        classList: [...baseClasses, "pdl-stop", "pdl-hide"],
        textContent: t("button.download_stop")
      })
    );
    const dlBtn = createPdlBtn({
      attrs: { "pdl-userid": "" },
      classList: [...baseClasses, "pdl-btn-all"],
      textContent: t("button.download_works")
    });
    dlBtn.addEventListener("click", downloadFollowLatest);
    dlBar.appendChild(dlBtn);
    const dlAllBtn = createPdlBtn({
      attrs: { "pdl-userid": "" },
      classList: [...baseClasses, "pdl-btn-all", "pdl-dl-all"],
      textContent: t("button.download_works")
    });
    dlAllBtn.addEventListener("click", downloadFollowLatest);
    dlBar.appendChild(dlAllBtn);
    navBar.insertBefore(dlBar, modeSwitch);
  }
  function createSearchDownloadbar() {
    if (document.querySelector(".pdl-dlbar")) return;
    const sections = document.querySelectorAll("section");
    const worksSection = sections[sections.length - 1];
    const styleRefEle = document.querySelector("nav a:not([aria-current])");
    if (!worksSection || !styleRefEle) return;
    const dlBarContainer = worksSection.firstElementChild.firstElementChild;
    const dlBar = document.createElement("div");
    dlBar.classList.add("pdl-dlbar");
    dlBar.classList.add("pdl-dlbar-search");
    const statusBar = document.createElement("div");
    statusBar.classList.add("pdl-dlbar-status_bar");
    dlBarRef.statusBar = dlBar.appendChild(statusBar);
    const baseClasses = styleRefEle.classList;
    dlBarRef.abortBtn = dlBar.appendChild(
      createPdlBtn({
        attrs: { "pdl-userid": "" },
        classList: [...baseClasses, "pdl-stop", "pdl-hide"],
        textContent: t("button.download_stop")
      })
    );
    const dlBtn = createPdlBtn({
      attrs: { "pdl-userid": "" },
      classList: [...baseClasses, "pdl-btn-all"],
      textContent: t("button.download_all_one_page")
    });
    dlBtn.addEventListener("click", downloadSearchResult);
    const filter = createExcludeDownloadedFilter();
    dlBarContainer.parentElement.insertBefore(filter, dlBarContainer);
    dlBar.appendChild(dlBtn);
    dlBarContainer.appendChild(dlBar);
  }
  function changeDlbarDisplay() {
    var _a, _b;
    document.querySelectorAll(".pdl-dlbar .pdl-btn-all").forEach((ele) => {
      ele.classList.toggle("pdl-hide");
    });
    (_a = document.querySelector(".pdl-dlbar .pdl-stop")) == null ? void 0 : _a.classList.toggle("pdl-hide");
    document.querySelectorAll("pdl-artwork-tag, pdl-tag-list-button").forEach((ele) => {
      if (ele.hasAttribute("disabled")) {
        ele.removeAttribute("disabled");
      } else {
        ele.setAttribute("disabled", "");
      }
    });
    (_b = document.querySelector(".pdl-filter-wrap")) == null ? void 0 : _b.classList.toggle("pdl-unavailable");
  }
  async function downloadByIds(total, idsGenerators, signal, onProgress) {
    signal.throwIfAborted();
    const failed = [];
    const unavaliable = [];
    const invalid = [];
    const tasks2 = [];
    let completed = 0;
    let tooManyRequests = false;
    let wakeTooManyRequest;
    let wakeInterval;
    let resolve;
    let reject;
    const done = new Promise((r, j) => {
      resolve = r;
      reject = j;
    });
    signal.addEventListener(
      "abort",
      () => {
        if (tasks2.length) {
          downloader.abort(tasks2);
          tasks2.length = 0;
        }
        wakeTooManyRequest == null ? void 0 : wakeTooManyRequest();
        wakeInterval == null ? void 0 : wakeInterval();
        reject(signal.aborted ? signal.reason : "Unexpected generator error");
      },
      { once: true }
    );
    const afterEach = (illustId) => {
      const avaliable = total - failed.length - unavaliable.length - invalid.length;
      onProgress({
        illustId,
        avaliable,
        completed
      });
      if (completed === avaliable) {
        resolve({ failed, unavaliable });
      }
    };
    onProgress("Downloading...");
    try {
      for (const idsGenerator of idsGenerators) {
        for await (const ids of idsGenerator) {
          logger.info("Got ids:", ids);
          signal.throwIfAborted();
          if (ids.unavaliable.length) {
            unavaliable.push(...ids.unavaliable);
          }
          if (ids.invalid.length) {
            invalid.push(...ids.invalid);
          }
          if (typeof ids.total === "number" && !Number.isNaN(ids.total)) {
            total = ids.total;
          }
          if (ids.avaliable.length) {
            for (const id of ids.avaliable) {
              signal.throwIfAborted();
              if (tooManyRequests) {
                onProgress("Too many requests, wait 30s");
                const { wake: wake2, sleep: sleep22 } = wakeableSleep(3e4);
                wakeTooManyRequest = wake2;
                await sleep22;
                signal.throwIfAborted();
                tooManyRequests = false;
                onProgress("Downloading...");
              }
              let historyData;
              pixivParser.parse(id).then((pixivMeta) => {
                const { id: id2, tags, artist, userId, title } = pixivMeta;
                historyData = {
                  pid: Number(id2),
                  user: artist,
                  userId: Number(userId),
                  title,
                  tags
                };
                const downloadConfigs = new PixivDownloadConfig(pixivMeta).getDownloadConfig();
                tasks2.push(downloadConfigs[0].taskId);
                return downloader.download(downloadConfigs);
              }).then(
                (taskId) => {
                  historyDb.add(historyData);
                  if (!signal.aborted) {
                    tasks2.splice(tasks2.indexOf(taskId[0]), 1);
                    completed++;
                    afterEach(id);
                  }
                },
                (reason) => {
                  if (!signal.aborted) {
                    reason && logger.error(reason);
                    if (reason instanceof RequestError && reason.response.status === 429) {
                      tooManyRequests = true;
                    }
                    if (reason instanceof JsonDataError) {
                      unavaliable.push(id);
                    } else {
                      failed.push(id);
                    }
                    afterEach(id);
                  }
                }
              );
              const { wake, sleep: sleep2 } = wakeableSleep(1e3);
              wakeInterval = wake;
              await sleep2;
            }
          } else {
            afterEach("no avaliable id");
          }
        }
      }
    } catch (error) {
      if (!signal.aborted) {
        done.catch((reason) => {
          logger.info("catch unexpected abort: ", reason);
        });
        signal.dispatchEvent(new Event("abort"));
        throw error;
      }
    }
    return done;
  }
  const downloadSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z"></path></svg>`;
  class ArtworkTagButton extends HTMLElement {
    constructor(tagElement) {
      super();
      __publicField(this, "ob");
      this.tagElement = tagElement;
      this.bindValue(this.getTagProps());
      this.render();
      this.resetTagStyle();
      this.ob = new MutationObserver((records) => {
        if (records.some((record) => record.type === "attributes" && record.attributeName === "href")) {
          this.bindValue(this.getTagProps());
        }
        this.changeBtnColor();
      });
    }
    // 为了美观
    resetTagStyle() {
      this.tagElement.style.borderTopRightRadius = "0px";
      this.tagElement.style.borderBottomRightRadius = "0px";
    }
    getTagProps() {
      const tagTitles = this.tagElement.querySelectorAll("div[title]");
      const tagStr = tagTitles[tagTitles.length - 1].getAttribute("title");
      const tag = tagStr.startsWith("#") ? tagStr.slice(1) : "未分類";
      const url2 = new URL(this.tagElement.href);
      const { searchParams, pathname } = url2;
      const [, , userId, urlCategory] = pathname.split("/");
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
    bindValue(props) {
      this.setAttribute("data-user-id", props.userId);
      this.setAttribute("data-category", props.category);
      this.setAttribute("data-tag", props.tag);
      this.setAttribute("data-bookmark-rest", props.rest);
    }
    changeBtnColor() {
      const { color, backgroundColor } = getComputedStyle(this.tagElement);
      const btn = this.shadowRoot.querySelector("button");
      btn.style.color = color;
      btn.style.backgroundColor = backgroundColor;
    }
    async render() {
      const shadowRoot = this.attachShadow({ mode: "open" });
      addStyleToShadow(shadowRoot);
      shadowRoot.innerHTML = `  <button class="flex h-full items-center pr-2 rounded-e-[4px] disabled:cursor-wait disabled:opacity-70">
    <hr class="!border-t-0 border-l h-6 pr-2" />
    <i class="text-sm w-6 fill-current">
      ${downloadSvg}
    </i>
  </button>`;
      this.changeBtnColor();
    }
    connectedCallback() {
      this.ob.observe(this.tagElement, {
        attributes: true,
        attributeFilter: ["class", "status", "href"]
      });
    }
    disconnectedCallback() {
      this.ob.disconnect();
    }
    static get observedAttributes() {
      return ["disabled"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      const btn = this.shadowRoot.querySelector("button");
      if (typeof newValue === "string") {
        btn.setAttribute("disabled", "");
      } else {
        btn.removeAttribute("disabled");
      }
    }
  }
  customElements.define("pdl-artwork-tag", ArtworkTagButton);
  function onProgressCB(progressData) {
    if (typeof progressData === "string") {
      updateStatus(progressData);
    } else {
      logger.info(
        "Update progress by",
        progressData.illustId,
        ", completed: ",
        progressData.completed
      );
      updateStatus(`Downloading: ${progressData.completed} / ${progressData.avaliable}`);
    }
  }
  async function useDownloadBar(chunksGenerators) {
    var _a;
    if (!dlBarRef.abortBtn) return;
    let total = 0;
    let failedResult;
    const idsGenerators = [];
    !Array.isArray(chunksGenerators) && (chunksGenerators = [chunksGenerators]);
    isDownloading = true;
    changeDlbarDisplay();
    try {
      await Promise.all(chunksGenerators).then((gens) => {
        gens.forEach((val) => {
          total += val.total;
          idsGenerators.push(val.generator);
        });
      });
    } catch (error) {
      logger.error(error);
      updateStatus("Network error, see console");
      changeDlbarDisplay();
      isDownloading = false;
      return;
    }
    if (total === 0) {
      updateStatus("No works");
    } else {
      try {
        logger.info("Total works:", total);
        const controller = new AbortController();
        const signal = controller.signal;
        !signal.throwIfAborted && (signal.throwIfAborted = function() {
          if (this.aborted) {
            throw this.reason;
          }
        });
        if (!("reason" in signal)) {
          const abort = controller.abort;
          controller.abort = function(reason) {
            this.signal.reason = reason ? reason : new DOMException("signal is aborted without reason");
            abort.apply(this);
          };
        }
        (_a = dlBarRef.abortBtn) == null ? void 0 : _a.addEventListener(
          "click",
          () => {
            controller.abort();
          },
          { once: true }
        );
        const { failed, unavaliable } = await downloadByIds(
          total,
          idsGenerators,
          signal,
          onProgressCB
        );
        if (failed.length || unavaliable.length) {
          updateStatus(`Failed: ${failed.length + unavaliable.length}. See console.`);
          console.log("[Pixiv Downloader] Failed: ", failed.join(", "));
          console.log("[Pixiv Downloader] Unavaliable: ", unavaliable.join(", "));
          if (failed.length) failedResult = failed;
        } else {
          console.log("[Pixiv Downloader] Download complete");
          updateStatus("Complete");
        }
      } catch (error) {
        if (error instanceof DOMException) {
          updateStatus("Stop");
        } else {
          updateStatus("Error, see console");
          logger.error(error);
        }
      }
    }
    changeDlbarDisplay();
    isDownloading = false;
    return failedResult;
  }
  function getFilterOption() {
    return {
      filterExcludeDownloaded: config.get("filterExcludeDownloaded"),
      filterIllusts: config.get("filterIllusts"),
      filterManga: config.get("filterManga"),
      filterUgoira: config.get("filterUgoira")
    };
  }
  function downloadAndRetry(chunksGenerators) {
    useDownloadBar(chunksGenerators).then((failed) => {
      if (failed instanceof Array && failed.length) {
        const gen = async function* () {
          yield {
            avaliable: failed,
            unavaliable: [],
            invalid: []
          };
        };
        console.log("[Pixiv Downloader] Retry...");
        useDownloadBar({ total: failed.length, generator: gen() });
      }
    });
  }
  let isDownloading = false;
  function downloadWorks(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (isDownloading) return;
    const btn = evt.target;
    const userId = btn.getAttribute("pdl-userid");
    const filterOption = getFilterOption();
    downloader.dirHandleCheck();
    const ids = pixivParser.getAllWorksGenerator(userId, filterOption);
    downloadAndRetry(ids);
  }
  async function downloadBookmarksOrTags(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (isDownloading) return;
    let userId;
    let category;
    let tag;
    let rest;
    const btn = evt.currentTarget;
    if (btn.dataset.userId) {
      userId = btn.dataset.userId;
      category = btn.dataset.category;
      tag = btn.dataset.tag;
      rest = btn.dataset.bookmarkRest;
    } else {
      userId = btn.getAttribute("pdl-userid");
      category = btn.getAttribute("category");
      tag = btn.getAttribute("tag") || "";
      rest = btn.getAttribute("rest") || "show";
    }
    downloader.dirHandleCheck();
    const filterOption = getFilterOption();
    let idsGenerators;
    if (rest === "all") {
      const idsShowPromise = pixivParser.getChunksGenerator(
        userId,
        "bookmarks",
        "",
        "show",
        filterOption
      );
      const idsHidePromise = pixivParser.getChunksGenerator(
        userId,
        "bookmarks",
        "",
        "hide",
        filterOption
      );
      idsGenerators = [idsShowPromise, idsHidePromise];
    } else {
      idsGenerators = pixivParser.getChunksGenerator(userId, category, tag, rest, filterOption);
    }
    downloadAndRetry(idsGenerators);
  }
  function downloadFollowLatest(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (isDownloading) return;
    const btn = evt.target;
    const mode = location.pathname.includes("r18") ? "r18" : "all";
    const filterOption = getFilterOption();
    let idsGenerators;
    if (btn.classList.contains("pdl-dl-all")) {
      idsGenerators = pixivParser.getFollowLatestGenerator(filterOption, mode);
    } else {
      const params = new URLSearchParams(location.search);
      const page = Number(params.get("p")) || 1;
      idsGenerators = pixivParser.getFollowLatestGenerator(filterOption, mode, page);
    }
    downloadAndRetry(idsGenerators);
  }
  async function downloadSearchResult(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (isDownloading) return;
    const pdlNodes = document.querySelectorAll("section ul li pdl-button");
    if (!pdlNodes.length) return;
    let ids = Array.prototype.map.call(
      pdlNodes,
      (node) => node.getAttribute("pdl-id")
    );
    if (getFilterOption().filterExcludeDownloaded) {
      const filteredIds = [];
      for (const id of ids) {
        const isDownloaded = await historyDb.has(id);
        !isDownloaded && filteredIds.push(id);
      }
      ids = filteredIds;
    }
    const idsGenerators = {
      total: ids.length,
      generator: async function* () {
        yield {
          avaliable: ids,
          unavaliable: [],
          invalid: []
        };
      }()
    };
    downloadAndRetry(idsGenerators);
  }
  class TagListButton extends HTMLElement {
    constructor(tagUrl, onClick) {
      super();
      this.tagUrl = tagUrl;
      this.onClick = onClick;
      this.render();
    }
    getTagProps() {
      const url2 = new URL(this.tagUrl);
      const { searchParams, pathname } = url2;
      const pathComponent = pathname.split("/");
      const [, , userId, urlCategory] = pathComponent;
      let category;
      if (urlCategory === "illustrations" || urlCategory === "artworks") {
        category = "illusts";
      } else {
        category = urlCategory;
      }
      return {
        userId,
        category,
        tag: pathComponent[pathComponent.length - 1],
        rest: searchParams.get("rest") === "hide" ? "hide" : "show"
      };
    }
    bindValue(btn, props) {
      btn.setAttribute("data-user-id", props.userId);
      btn.setAttribute("data-category", props.category);
      btn.setAttribute("data-tag", props.tag);
      btn.setAttribute("data-bookmark-rest", props.rest);
    }
    async render() {
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
      const btn = shadowRoot.querySelector("button");
      this.bindValue(btn, this.getTagProps());
      this.onClick && btn.addEventListener("click", this.onClick);
    }
    static get observedAttributes() {
      return ["disabled"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      const btn = this.shadowRoot.querySelector("button");
      if (typeof newValue === "string") {
        btn.setAttribute("disabled", "");
      } else {
        btn.removeAttribute("disabled");
      }
    }
  }
  customElements.define("pdl-tag-list-button", TagListButton);
  function createTagListBtn() {
    var _a;
    const listContainer = document.querySelector('div[style*="position: relative"]');
    if (!listContainer) return;
    const modalRoot = listContainer == null ? void 0 : listContainer.closest('div[role="presentation"], div[class="charcoal-token"]');
    const closeBtn = (_a = modalRoot == null ? void 0 : modalRoot.querySelector("svg")) == null ? void 0 : _a.parentElement;
    const tagElements = listContainer.querySelectorAll(
      'div[style*="position: absolute"] a'
    );
    tagElements.forEach((ele) => {
      if (ele.querySelector("pdl-tag-list-button")) return;
      const btn = new TagListButton(ele.href, (evt) => {
        closeBtn == null ? void 0 : closeBtn.click();
        downloadBookmarksOrTags(evt);
      });
      if (isDownloading) btn.setAttribute("disabled", "");
      ele.appendChild(btn);
    });
  }
  function createToolbarBtn(id) {
    const toolbar = document.querySelector("main section section");
    if (!toolbar || toolbar.querySelector("pdl-button")) return;
    const btn = new ThumbnailButton({
      id,
      type: ThumbnailBtnType.PixivToolbar,
      onClick: downloadArtwork
    });
    const pdlBtnWrap = toolbar.lastElementChild.cloneNode();
    pdlBtnWrap.appendChild(btn);
    toolbar.appendChild(pdlBtnWrap);
  }
  function createWorkScrollBtn(id) {
    const works = document.querySelectorAll(
      "figure a.gtm-expand-full-size-illust"
    );
    if (works.length < 2) return;
    const containers = Array.from(works).map(
      (node) => node.parentElement.parentElement
    );
    const elementToAppend = Array.from(containers).filter((el) => !el.querySelector("pdl-button"));
    if (!elementToAppend.length) return;
    elementToAppend.forEach((node, idx) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("pdl-wrap-artworks");
      wrapper.appendChild(
        new ThumbnailButton({
          id,
          page: idx,
          type: ThumbnailBtnType.Gallery,
          onClick: downloadArtwork
        })
      );
      node.appendChild(wrapper);
    });
  }
  const createPresentationBtn = /* @__PURE__ */ (() => {
    let observer, btn;
    function cb(mutationList) {
      const newImg = mutationList[1]["addedNodes"][0];
      const [pageNum] = regexp.originSrcPageNum.exec(newImg.src) ?? [];
      if (!pageNum) throw new Error("[Error]Invalid Image Element.");
      btn == null ? void 0 : btn.setAttribute("page", String(pageNum));
    }
    return (id) => {
      const containers = document.querySelector("body > [role='presentation'] > div");
      if (!containers) {
        if (observer) {
          observer.disconnect();
          observer = null;
          btn = null;
        }
        return;
      }
      if (containers.querySelector("pdl-button")) return;
      const img = containers.querySelector("div > img");
      if (!img) return;
      const isOriginImg = regexp.originSrcPageNum.exec(img.src);
      if (!isOriginImg) return;
      const [pageNum] = isOriginImg;
      btn = new ThumbnailButton({
        id,
        type: ThumbnailBtnType.PixivPresentation,
        page: Number(pageNum),
        onClick: downloadArtwork
      });
      containers.appendChild(btn);
      if (!img.parentElement) return;
      observer = new MutationObserver(cb);
      observer.observe(img.parentElement, { childList: true, subtree: true });
    };
  })();
  function createPreviewModalBtn() {
    var _a;
    const illustModalBtn = document.querySelector(
      ".gtm-manga-viewer-preview-modal-open:not(.pdl-listened)"
    );
    const mangaModalBtn = document.querySelector(".gtm-manga-viewer-open-preview:not(.pdl-listened)");
    const mangaViewerModalBtn = (_a = document.querySelectorAll(
      ".gtm-manga-viewer-close-icon:not(.pdl-listened)"
    )) == null ? void 0 : _a[1];
    if (!illustModalBtn && !mangaModalBtn && !mangaViewerModalBtn) return;
    [illustModalBtn, mangaModalBtn, mangaViewerModalBtn].forEach((node) => {
      if (node) {
        node.classList.add("pdl-listened");
        node.addEventListener("click", handleModalClick);
      }
    });
  }
  function handleModalClick() {
    const timer = setInterval(() => {
      logger.info("Start to find modal.");
      const ulList = document.querySelectorAll("ul");
      const previewList = ulList[ulList.length - 1];
      if (getComputedStyle(previewList).display !== "grid") return;
      clearInterval(timer);
      const [, id] = regexp.artworksPage.exec(location.pathname) ?? [];
      previewList.childNodes.forEach((node, idx) => {
        node.style.position = "relative";
        node.appendChild(
          new ThumbnailButton({
            id,
            page: idx,
            onClick: downloadArtwork
          })
        );
      });
    }, 300);
  }
  function createMangaViewerBtn(id) {
    const mangaViewerBackBtn = document.querySelector(".gtm-manga-viewer-close-icon");
    if (!mangaViewerBackBtn) return;
    const container = mangaViewerBackBtn.parentElement;
    if (container.querySelector("pdl-button")) return;
    container.appendChild(
      new ThumbnailButton({
        id,
        type: ThumbnailBtnType.PixivMangaViewer,
        onClick: downloadArtwork
      })
    );
  }
  function createFrequentTagBtn() {
    const tagsEles = Array.from(document.querySelectorAll("a[status]"));
    if (!tagsEles.length) return;
    tagsEles.forEach((ele) => {
      var _a;
      if (((_a = ele.nextElementSibling) == null ? void 0 : _a.tagName) === "PDL-ARTWORK-TAG") return;
      const artworkTagBtn = new ArtworkTagButton(ele);
      artworkTagBtn.addEventListener("click", downloadBookmarksOrTags);
      if (isDownloading) artworkTagBtn.setAttribute("disabled", "");
      ele.parentElement.appendChild(artworkTagBtn);
    });
  }
  function pageActions() {
    const pathname = location.pathname;
    let param;
    switch (true) {
      case !!(param = regexp.artworksPage.exec(pathname)): {
        const id = param[1];
        createToolbarBtn(id);
        createWorkScrollBtn(id);
        createPresentationBtn(id);
        createPreviewModalBtn();
        createMangaViewerBtn(id);
        break;
      }
      case !!(param = regexp.userPage.exec(pathname)): {
        const id = param[1] || param[2];
        createDownloadBar(id);
        const matchTagPage = regexp.userPageTags.exec(pathname);
        if (matchTagPage) {
          createFrequentTagBtn();
          createTagListBtn();
        }
        break;
      }
      case regexp.followLatest.test(pathname): {
        createFollowLatestDownloadBar();
        break;
      }
      case regexp.searchPage.test(pathname): {
        createSearchDownloadbar();
        break;
      }
      case regexp.historyPage.test(pathname): {
        createThumbnailBtn(document.querySelectorAll("span[style]._history-item"));
        break;
      }
      default:
        removeDownloadBar();
        break;
    }
  }
  let firstRun = true;
  function observerCallback(records) {
    const addedNodes = [];
    records.forEach((record) => {
      if (!record.addedNodes.length) return;
      record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "PDL-BUTTON" && node.tagName !== "IMG") {
          addedNodes.push(node);
        }
      });
    });
    if (!addedNodes.length) return;
    if (firstRun) {
      createThumbnailBtn(document.querySelectorAll("a"));
      firstRun = false;
    } else {
      fixPixivPreviewer(addedNodes);
      const thumbnails = addedNodes.reduce((prev, current) => {
        return prev.concat(
          current instanceof HTMLAnchorElement ? [current] : Array.from(current.querySelectorAll("a"))
        );
      }, []);
      createThumbnailBtn(thumbnails);
    }
    pageActions();
  }
  const downloadBar = `.pdl-dlbar{display:flex;flex-grow:1}.pdl-dlbar.pdl-dlbar-follow_latest{padding:0 8px}.pdl-dlbar .pdl-dlbar-status_bar{flex-grow:1;height:46px;line-height:46px;padding-right:8px;text-align:right;font-weight:700;font-size:16px;color:#858585;white-space:nowrap;cursor:default}.pdl-dlbar .pdl-btn-all,.pdl-dlbar .pdl-stop{background-color:transparent;border:none;padding:0 8px}.pdl-dlbar .pdl-btn-all:hover,.pdl-dlbar .pdl-stop:hover{color:var(--pdl-text1)}.pdl-dlbar .pdl-btn-all:before,.pdl-dlbar .pdl-stop:before{content:"";height:24px;width:24px;transition:background-image .2s ease 0s;background:no-repeat center/85%}.pdl-dlbar .pdl-btn-all:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}.pdl-dlbar .pdl-btn-all:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}.pdl-dlbar .pdl-stop:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}.pdl-dlbar .pdl-stop:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-btn-all:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-btn-all:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-stop:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-stop:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}:root[data-theme=default] .pdl-dlbar .pdl-btn-all:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root[data-theme=default] .pdl-dlbar .pdl-btn-all:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root[data-theme=default] .pdl-dlbar .pdl-stop:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}:root[data-theme=default] .pdl-dlbar .pdl-stop:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}@media (prefers-color-scheme: light){:root .pdl-dlbar .pdl-btn-all:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-btn-all:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-stop:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-stop:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}}:root[data-theme=dark] .pdl-dlbar .pdl-btn-all:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root[data-theme=dark] .pdl-dlbar .pdl-btn-all:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root[data-theme=dark] .pdl-dlbar .pdl-stop:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}:root[data-theme=dark] .pdl-dlbar .pdl-stop:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}@media (prefers-color-scheme: dark){:root .pdl-dlbar .pdl-btn-all:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-btn-all:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-stop:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}:root .pdl-dlbar .pdl-stop:hover:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E %3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'%3E%3C/path%3E %3C/svg%3E")}}.pdl-filter-wrap{display:flex;justify-content:flex-end;gap:12px;margin:4px 0;font-weight:700;font-size:14px;line-height:14px;color:#858585;transition:color .2s ease 0s}.pdl-filter-wrap .pdl-filter:hover{color:var(--pdl-text1)}.pdl-filter-wrap .pdl-filter label{padding-left:8px;cursor:pointer}`;
  const checkbox = '.pdl-checkbox{cursor:pointer;margin:0!important;padding:0!important;vertical-align:top;-webkit-appearance:none;-moz-appearance:none;appearance:none;position:relative;box-sizing:border-box;width:28px;border:2px solid transparent!important;border-radius:14px!important;height:14px;background-color:#858585!important;transition:background-color .2s ease 0s,box-shadow .2s ease 0s}.pdl-checkbox:hover{background-color:var(--pdl-bg3-hover)!important}.pdl-checkbox:checked{background-color:#0096fa!important}.pdl-checkbox:after{content:"";position:absolute;display:block;top:0;left:0;width:10px;height:10px;transform:translate(0);background-color:#fff;border-radius:10px;transition:transform .2s ease 0s}.pdl-checkbox:checked:after{transform:translate(14px)}';
  class Pixiv extends SiteInject {
    inject() {
      super.inject();
      new MutationObserver(observerCallback).observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    injectStyle() {
      super.injectStyle();
      _GM_addStyle(checkbox);
      _GM_addStyle(downloadBar);
    }
    observeColorScheme() {
      const onThemeChange = () => {
        const sitePreferDark = document.documentElement.getAttribute("data-theme");
        if (sitePreferDark === "dark") {
          this.setModalDarkMode();
        } else {
          this.setModalLightMode();
        }
      };
      onThemeChange();
      new MutationObserver(onThemeChange).observe(document.documentElement, {
        attributes: true,
        childList: false,
        subtree: false
      });
    }
  }
  function getSiteInjector(host) {
    const sitesAdapter = {
      "danbooru.donmai.us": Danbooru,
      "www.pixiv.net": Pixiv,
      "rule34.xxx": Rule34
    };
    if (host in sitesAdapter) {
      return sitesAdapter[host];
    }
  }
  const siteInject = getSiteInjector(location.host);
  siteInject && new siteInject();

})(Dexie, dayjs, JSZip, GIF);