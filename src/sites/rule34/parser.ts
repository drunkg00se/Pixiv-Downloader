import { GelbooruParserV020, type GelbooruHtmlPostDataV020 } from '../base/gelbooru/parser';

export class Rule34Parser extends GelbooruParserV020 {
  parseFavoriteByDoc(doc: Document): GelbooruHtmlPostDataV020[] {
    const favDataScripts = doc.querySelectorAll<HTMLScriptElement>('.image-list > span + script');

    const favData = Array.from(favDataScripts).map((el) => {
      const content = el.textContent!;
      const [id] = /(?<=posts\[)[0-9]+?(?=\])/.exec(content)!;
      const [tags] = /(?<=tags: ["']).*?(?=["']\.)/.exec(content)!;
      const [rating] = /(?<=rating: ["']).*?(?=["'],)/.exec(content)!;
      const [score] = /(?<=score: ["'])[0-9]+(?=["'],)/.exec(content)!;
      const [user] = /(?<=user: ["']).*?(?=["']\s+})/.exec(content)!;

      return {
        id,
        tags: tags.split(/\s/g),
        rating: rating.toLowerCase(),
        score: +score,
        user
      };
    });

    return favData;
  }
}
