import './sites/base/moebooru/resetArrayFrom';

import { Rule34 } from './sites/rule34';
import { Danbooru } from './sites/danbooru';
import { Pixiv } from './sites/pixiv';
import { Yande } from './sites/yande';
import { ATFbooru } from './sites/atfbooru';
import { Konachan } from './sites/konanchan';
import { Sakugabooru } from './sites/sakugabooru';
import { Safebooru } from './sites/safebooru';
import { Gelbooru } from './sites/gelbooru';
import { E621ng } from './sites/e621';
import './lib/components/app.tailwind.css';

// Remove CSS injected into dom in the dev server
if (import.meta.env.DEV) {
  document.head.querySelector('style[data-vite-dev-id]')?.remove();
}

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
    E621ng
  ];
  const hostname = location.hostname;

  for (const sites of sitesAdapters) {
    if (typeof sites.hostname === 'string') {
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
