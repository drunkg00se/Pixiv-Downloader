interface YieldArtworkId {
  total: number;
  page: number;
  avaliable: string[];
  invalid: string[];
  unavaliable: string[];
}

export type GenerateIdWithValidation<T, K extends string | string[] = []> = (
  pageRange: [start: number, end: number] | null,
  checkValidity: (meta: Partial<T>) => Promise<boolean>,
  ...restArgs: K extends string ? K[] : K
) => Generator<YieldArtworkId, void, undefined> | AsyncGenerator<YieldArtworkId, void, undefined>;

export type GenerateIdWithoutValidation<K extends string | string[] = []> = (
  pageRange: [start: number | null, end: number | null] | null,
  ...restArgs: K extends string ? K[] : K
) => Generator<YieldArtworkId, void, undefined> | AsyncGenerator<YieldArtworkId, void, undefined>;

export type GenPageId<
  T,
  K extends string | string[],
  FilterWhenGenerateIngPage extends true | undefined
> = FilterWhenGenerateIngPage extends true
  ? GenerateIdWithValidation<T, K>
  : GenerateIdWithoutValidation<K>;

export type GenPageIdItem<
  T,
  K extends string | string[],
  FilterWhenGenerateIngPage extends true | undefined
> = {
  id: string;
  name: string;
  fn: GenPageId<T, K, FilterWhenGenerateIngPage>;
};

export interface RegisterConfig<T, FilterWhenGenerateIngPage extends true | undefined = undefined> {
  filterOption: {
    filters: {
      id: string;
      type: 'include' | 'exclude';
      name: string;
      checked: boolean;
      fn(artworkMeta: Partial<T>): boolean | Promise<boolean>;
    }[];
    enableTagFilter?: T extends { tags: string[] } ? true : never;
    filterWhenGenerateIngPage?: FilterWhenGenerateIngPage;
  };
  avatar?: string | ((url: string) => string | Promise<string>);
  pageMatch: {
    name?: string;
    match: string | ((url: string) => boolean) | RegExp;
    genPageId:
      | GenPageIdItem<T, any, FilterWhenGenerateIngPage>
      | GenPageIdItem<T, any, FilterWhenGenerateIngPage>[];
  }[];
  parseMetaByArtworkId(id: string): T | Promise<T>;
  downloadByArtworkId(meta: T, taskId: string): Promise<string>; //return Id for msg
  onDownloadAbort(taskIds: string[]): void;
}
