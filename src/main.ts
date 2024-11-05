import { Rule34 } from './sites/rule34';
import { Danbooru } from './sites/danbooru';
import { Pixiv } from './sites/pixiv';
import { Yande } from './sites/yande';
import { ATFbooru } from './sites/atfbooru';
import './lib/components/app.tailwind.css';

function getSiteInjector() {
  const sitesAdapter = [Pixiv, Danbooru, Rule34, Yande, ATFbooru];

  for (let i = 0; i < sitesAdapter.length; i++) {
    if (location.hostname === sitesAdapter[i].hostname) {
      return sitesAdapter[i];
    }
  }
}

const siteInject = getSiteInjector();
siteInject && new siteInject().inject();
