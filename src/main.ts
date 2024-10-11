import { Rule34 } from './sites/rule34';
import { Danbooru } from './sites/danbooru';
import { Pixiv } from './sites/pixiv';
import { Yande } from './sites/yande';
import { SiteInject } from './sites/base';
import { ATFbooru } from './sites/atfbooru';
import './lib/components/app.tailwind.css';

type SiteInjectConstructor = new () => SiteInject;
function getSiteInjector(host: string): SiteInjectConstructor | void {
  const sitesAdapter: Record<string, SiteInjectConstructor> = {
    'danbooru.donmai.us': Danbooru,
    'www.pixiv.net': Pixiv,
    'rule34.xxx': Rule34,
    'yande.re': Yande,
    'booru.allthefallen.moe': ATFbooru
  };

  if (host in sitesAdapter) {
    return sitesAdapter[host];
  }
}

const siteInject = getSiteInjector(location.host);
siteInject && new siteInject();
