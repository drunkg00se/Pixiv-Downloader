import { Danbooru } from '../danbooru';

export class ATFbooru extends Danbooru {
  static get hostname(): string {
    return 'booru.allthefallen.moe';
  }
}
