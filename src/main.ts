import { Rule34 } from './sites/rule34';
import { Danbooru } from './sites/danbooru';
import { Pixiv } from './sites/pixiv';
import { SiteInject } from './sites/base';

type SiteInjectConstructor = new () => SiteInject;
function getSiteInjector(host: string): SiteInjectConstructor | void {
	const sitesAdapter: Record<string, SiteInjectConstructor> = {
		'danbooru.donmai.us': Danbooru,
		'www.pixiv.net': Pixiv,
		'rule34.xxx': Rule34
	};

	if (host in sitesAdapter) {
		return sitesAdapter[host];
	}
}

const siteInject = getSiteInjector(location.host);
siteInject && new siteInject();
