import { expect, test, describe } from 'vitest';
import { getElementText } from '@/lib/util';

describe('fn:getElementText', () => {
  test('pixiv', () => {
    const pixivComment = [
      /** https://www.pixiv.net/en/artworks/123068644 */
      [
        'Mika Pikazo個展&lt;br /&gt;「ILY GIRL」EXHIBITION 2024 in OSAKA&lt;br /&gt;大阪巡回展　開催中&lt;br /&gt;&lt;a href="/jump.php?https%3A%2F%2Fmika-exhibition.jp" target="_blank"&gt;https://mika-exhibition.jp&lt;/a&gt;&lt;br /&gt;&lt;br /&gt;10月2日（水）～10月14日（祝/月）　 &lt;br /&gt;OPEN/10:00　CLOSE/21:00（※最終日のみ16:00）&lt;br /&gt;会場：大阪 あべのキューズモール サークルプラザ',
        'Mika Pikazo個展\n「ILY GIRL」EXHIBITION 2024 in OSAKA\n大阪巡回展　開催中\nhttps://mika-exhibition.jp\n\n10月2日（水）～10月14日（祝/月）　 \nOPEN/10:00　CLOSE/21:00（※最終日のみ16:00）\n会場：大阪 あべのキューズモール サークルプラザ'
      ],
      /** https://www.pixiv.net/en/artworks/122650009 */
      [
        '◤「ILY GIRL」in OSAKA◢&lt;br /&gt;去年の夏に開催した展示会&lt;br /&gt;「ILY GIRL」の大阪巡回展が&lt;br /&gt;決定しました！&lt;br /&gt;10月2日（火）～10月14日（祝/月）　 &lt;br /&gt;大阪　あべのキューズモール　サークルプラザ&lt;br /&gt;&lt;br /&gt;●サイン会開催のお知らせ&lt;br /&gt;・開催日時&lt;br /&gt; 10月12日（土）11:00～、16:00～　　&lt;br /&gt; 10月13日（日）11:00～、16:00～&lt;br /&gt;・開催場所&lt;br /&gt;大阪　あべのキューズモール　サークルプラザ&lt;br /&gt;&lt;br /&gt;※会期中、会場で販売しているオリジナルグッズ（クレーンゲーム、ガチャを除く）を1会計あたり5000円（税込）以上お買い上げの方に先着限定で参加整理券を配布します&lt;br /&gt;詳細はこちら&lt;br /&gt;&lt;strong&gt;&lt;a href="https://twitter.com/MikaPikazo_info" target="_blank"&gt;twitter/MikaPikazo_info&lt;/a&gt;&lt;/strong&gt;',
        '◤「ILY GIRL」in OSAKA◢\n去年の夏に開催した展示会\n「ILY GIRL」の大阪巡回展が\n決定しました！\n10月2日（火）～10月14日（祝/月）　 \n大阪　あべのキューズモール　サークルプラザ\n\n●サイン会開催のお知らせ\n・開催日時\n 10月12日（土）11:00～、16:00～　　\n 10月13日（日）11:00～、16:00～\n・開催場所\n大阪　あべのキューズモール　サークルプラザ\n\n※会期中、会場で販売しているオリジナルグッズ（クレーンゲーム、ガチャを除く）を1会計あたり5000円（税込）以上お買い上げの方に先着限定で参加整理券を配布します\n詳細はこちら\ntwitter/MikaPikazo_info'
      ],
      /** https://www.pixiv.net/en/artworks/123084375 */
      [
        'Xに投稿したイラストです。&lt;br /&gt;あんまり数は描けなかったけど、お顔がいい感じに描けて気に入ってる😊',
        'Xに投稿したイラストです。\nあんまり数は描けなかったけど、お顔がいい感じに描けて気に入ってる😊'
      ]
    ];

    pixivComment.forEach(([dataStr, text]) => {
      const unescapeComment = dataStr
        .replaceAll(/&lt;|&amp;lt;/g, '<')
        .replaceAll(/&gt;|&amp;gt;/g, '>');
      const p = document.createElement('p');
      p.innerHTML = unescapeComment;

      expect(getElementText(p)).toEqual(text);
    });
  });

  test.skip('danbooru', () => {
    const template = [
      /** https://danbooru.donmai.us/posts/8261218 */
      [
        `<section id="original-artist-commentary">
    <h3><span class="prose"></span></h3>
    <div class="prose"><p>スカスカするね〜この服〜♪</p></div>
</section>`,
        'スカスカするね〜この服〜♪'
      ],
      /** https://danbooru.donmai.us/posts/7245207 */
      [
        `<section id="original-artist-commentary">
    <h3><span class="prose">フランドール×言語の階『ゲブラー』</span></h3>
    <div class="prose"><p>『東方×Library Of Ruina』その２です。<br>ゲブラーさんは作中で恐ろしいまでの強さでしたね…。</p></div>
</section>`,
        'フランドール×言語の階『ゲブラー』\n\n『東方×Library Of Ruina』その２です。\nゲブラーさんは作中で恐ろしいまでの強さでしたね…。'
      ],
      /** https://danbooru.donmai.us/posts/8177893 */
      [
        `<section id="original-artist-commentary">
    <h3><span class="prose"></span></h3>
    <div class="prose"><p>七元徳の“知恵”を顕現した『エンシェントキラーズ』ミネルヴァが登場！<br>《雷・槍》<br>ミネルヴァ(cv小田果林／Illustrator：みかんあめ)<br><a rel="external nofollow noreferrer" class="dtext-link dtext-external-link" href="http://lp-pk.fg-games.co.jp/white/">http://lp-pk.fg-games.co.jp/white/</a> <a rel="external nofollow noreferrer" class="dtext-link dtext-external-link dtext-named-external-link" href="https://twitter.com/hashtag/ファンキル">#ファンキル</a> <a rel="external nofollow noreferrer" class="dtext-link dtext-external-link dtext-named-external-link" href="https://twitter.com/hashtag/エンシェントキラーズ">#エンシェントキラーズ</a></p></div>
</section>`,
        '七元徳の“知恵”を顕現した『エンシェントキラーズ』ミネルヴァが登場！\n《雷・槍》\nミネルヴァ(cv小田果林／Illustrator：みかんあめ)\nhttp://lp-pk.fg-games.co.jp/white/ #ファンキル #エンシェントキラーズ'
      ]
    ];

    template.forEach(([html, text]) => {
      const el = document.createElement('section');
      el.innerHTML = html;

      expect(getElementText(el.firstElementChild as HTMLElement)).toEqual(text);
    });
  });
});
