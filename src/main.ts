import './sites/base/moebooru/resetArrayFrom';

import { Rule34 } from './sites/rule34';
import { Danbooru } from './sites/danbooru';
import { Pixiv } from './sites/pixiv';
import { Yande } from './sites/yande';
import { ATFbooru } from './sites/atfbooru';
import { Konachan } from './sites/konanchan';
import './lib/components/app.tailwind.css';

// Remove CSS injected into dom in the dev server
if (import.meta.env.DEV) {
  document.head.querySelector('style[data-vite-dev-id]')?.remove();
}

function getSiteInjector() {
  const sitesAdapter = [Pixiv, Danbooru, Rule34, Yande, ATFbooru, Konachan];

  for (let i = 0; i < sitesAdapter.length; i++) {
    if (location.hostname === sitesAdapter[i].hostname) {
      return sitesAdapter[i];
    }
  }
}

const siteInject = getSiteInjector();
siteInject && new siteInject().inject();
