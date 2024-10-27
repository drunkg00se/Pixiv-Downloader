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
  parse(id: string, param?: Record<string, string>): SiteMeta | Promise<SiteMeta>;
}
