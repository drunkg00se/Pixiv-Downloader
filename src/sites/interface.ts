export interface MediaMeta {
  id: string;
  src: string;
  extendName: string;
  artist: string;
  title: string;
  tags: string[];
  createDate: string;
}

export interface SiteParser<SiteMeta extends MediaMeta> {
  parse(id: string): SiteMeta | Promise<SiteMeta>;
}
