// 按标签下载对应的作品类别
export type Category = 'illusts' | 'manga' | 'bookmarks';

// 收藏是否公开
export type BookmarksRest = 'show' | 'hide';

export type FollowLatestMode = 'all' | 'r18';

// 作品分类
export enum IllustType {
  illusts,
  manga,
  ugoira
}

export enum BookmarkRestrict {
  public = 0,
  private
}

export interface UserData {
  userId: string;
  name: string;
  image: string;
  imageBig: string;
  premium: boolean;
  isFollowed: boolean;
  isMypixiv: boolean;
  isBlocking: boolean;
  background: null | string;
  sketchLiveId: null;
  partial: number;
  sketchLives: [];
  commission: null;
}

export interface PreloadTagsItemData {
  tag: string;
  locked: boolean;
  deletable: boolean;
  userId: string;
  translation?: { en: string };
  userName: string;
}

interface PreloadTagsData {
  authorId: string;
  isLocked: boolean;
  tags: PreloadTagsItemData[];
  writable: boolean;
}

export interface PreloadIllustData {
  illustId: string;
  illustTitle: string;
  illustComment: string;
  id: string;
  title: string;
  illustType: IllustType;
  tags: PreloadTagsData;
  pageCount: number;
  bookmarkCount: number;
  likeCount: number;
  isBookmarkable: boolean;
  bookmarkData: null | { id: string; private: boolean };
  width: number;
  height: number;
  userId: string;
  userName: string;
  urls: {
    mini: string;
    thumb: string;
    small: string;
    regular: string;
    original: string;
  };
  //ISO 8601 格式的字符串
  createDate: string;
}

export interface PreloadData {
  timestamp: string;
  illust: Record<string, PreloadIllustData>;
  // user: any;
}

/**
 * Ajax Response
 */

export interface PixivAjaxResponse<T> {
  error: boolean;
  message: string;
  body: T;
}

export interface UgoiraMeta {
  src: string;
  originalSrc: string;
  mime_type: string;
  frames: { file: string; delay: number }[];
}

export interface UserPageWorksItem {
  aiType: number;
  id: string;
  title: string;
  illustType: IllustType;
  xRestrict: number;
  restrict: number;
  sl: number;
  url: string;
  description: string;
  tags: string[];
  userId: string;
  userName: string;
  width: number;
  height: number;
  pageCount: number;
  isBookmarkable: boolean;
  // 非null为已收藏
  bookmarkData: null | { id: string; private: boolean };
  alt: string;
  titleCaptionTranslation: {
    // workTitle: null | any;
    // workCaption: null | any;
  };
  createDate: string;
  updateDate: string;
  isUnlisted: boolean;
  isMasked: boolean;
  profileImageUrl: string;
}

export interface UserPageData {
  works: UserPageWorksItem[];
  total: number;
  // zoneConfig: any;
  // extraData: any;
}

export interface UserPageIllustsData {
  works: Record<string, UserPageWorksItem>;
  // zoneConfig: any;
  // extraData: any;
}

export interface AllProfile {
  illusts: Record<string, null> | never[];
  manga: Record<string, null> | never[];
  novels: Record<string, null> | never[];
  mangaSeries: Record<string, null> | never[];
  // pickup: any[];
  bookmarkCount: {
    public: Record<string, number>;
    private: Record<string, number>;
  };
  externalSiteWorksStatus: Record<string, boolean>;
  // request: any;
}

export interface AddBookmark {
  last_bookmark_id: string;
  stacc_status_id: string;
}

export interface GlobalData {
  token: string;
  services: {
    booth: string;
    sketch: string;
    vroidHub: string;
    accounts: string;
  };
  oneSinalAppId: string;
  publicPath: string;
  commonResourcePath: string;
  development: boolean;
  userData: {
    id: string;
    pixivId: string;
    name: string;
    profileImg: string;
    profileImgBig: string;
    premium: boolean;
    xRestrict: number;
    adult: boolean;
    safeMode: boolean;
    illustCreator: boolean;
    novelCreator: boolean;
  };
  adsData: null;
  miscData: {
    consent: { gdpr: boolean };
    policyRevision: boolean;
    grecaptcha: {
      recaptchaEnterpriseScoreSiteKey: string;
    };
    info: {
      id: string;
      title: string;
      createDate: string;
    };
    isSmartphone: boolean;
  };
  premium: object;
  mute: [];
}

export interface FollowLatest {
  page: {
    ids: number[];
    // seems always false
    isLastPage: false;
    tags: any[];
  };
  tagTranslation: Record<
    string,
    {
      en: string;
      ko: string;
      romaji: string;
      zh: string;
      zh_tw: string;
    }
  >;
  thumbnails: {
    illust: UserPageWorksItem[];
    novel: object[];
    novelSeries: object[];
    novelDraft: object[];
  };
  illustSeries: any[];
  requests: any[];
  zoneConfig: Record<'header' | 'footer' | 'logo', { url: string }>;
}

export interface ArtworkData {
  illustData: PreloadIllustData;
  globalData: GlobalData;
  ugoiraMeta?: UgoiraMeta;
}

export interface AjaxArtworkData {
  illustData: ArtworkDetail;
  ugoiraMeta?: UgoiraMeta;
}

export interface ArtworkDetail {
  /**是否为 AI 创作。0 未知 1 否 2 是 */
  aiType: 0 | 1 | 2;
  /**作品 id */
  illustId: string;
  /**作品标题*/
  illustTitle: string;
  /**作品简介*/
  illustComment: string;
  /**作品 id */
  id: string;
  /**作品标题*/
  title: string;
  /**作品简介*/
  description: string;
  /**作品类型
   *
   * 0 插画
   *
   * 1 漫画
   *
   * 2 动图
   */
  illustType: 0 | 1 | 2;
  /**作品的创建日期*/
  createDate: string;
  /**作品主体内容最后一次上传（修改）的日期*/
  uploadDate: string;
  /**作品的公开范围
   *
   * 0 公开
   *
   * 1 仅好P友可见
   *
   * 2 不公开
   */
  restrict: 0 | 1 | 2;
  /**作品的年龄限制
   *
   * 0 全年龄（普通）
   *
   * 1 R-18
   *
   * 2 R-18G
   */
  xRestrict: 0 | 1 | 2;
  /**作品的色情指数（程度）*/
  sl: 0 | 2 | 4 | 6;
  /**作品的第一张图片（或压缩包）的 URL*/
  urls: {
    /**48px 的最小尺寸的小图 */
    mini: string;
    /**250px 的缩略图 */
    thumb: string;
    /**540px 的缩略图 */
    small: string;
    /**1200px 的预览图 */
    regular: string;
    /**原图 */
    original: string;
  };
  /**作品的标签数据 */
  tags: {
    /**作者的用户 id */
    authorId: string;
    /**作者是否设置了“不允许其他用户编辑标签” */
    isLocked: boolean;
    /**作品的标签列表 */
    // tags: {
    //   /**标签名字 */
    //   tag: string;
    //   /**这个标签是否被锁定（被锁定的就不能修改） */
    //   locked: boolean;
    //   /**当前用户（浏览者）是否可以删除这个标签*/
    //   deletable: boolean;
    //   /**作者的用户 id */
    //   userId: string;
    //   /**罗马音，现在这个字段或许已经被移除了 */
    //   romaji?: string;
    //   /**这个标签的翻译 */
    //   translation?: {
    //     /**翻译后的文字。
    //        *
    //        * 注意翻译后的文字并不总是英文。
    //        *
    //        根据用户设置的 pixiv 页面语言的不同（如中文、日文、韩语、英文等），en 会返回对应语言的翻译。

    //        所以用户语言不同时，en 可能不同。

    //        也可能同一个标签在某些语言时会有 translation 字段，另一些语言时没有 translation 字段。
    //        */
    //     en: string;
    //   };
    //   /**作者的用户名 */
    //   userName: string;
    // }[];
    tags: PreloadTagsItemData[];
    /**当前用户（浏览者）是否可以编辑这个作品的标签。未登录时总是不能编辑 */
    writable: boolean;
  };
  /**作品的描述文字。当进入作品页面后会作为页面标题 */
  alt: string;
  /**不清楚 */
  storableTags: string[];
  /**作者的用户 id */
  userId: string;
  /**作者的用户名 */
  userName: string;
  /**作者的账户名（登录时使用的账户名） */
  userAccount: string;
  /**作者的所有图像作品的 id 列表 */
  userIllusts: {
    /**其中大部分作品的数据是 null
     *
     * 只有最多 3 个作品有精简的数据，这是在作品页面内显示在作品大图右侧的 3 个作品
     */
    [key: string]: null | {
      id: string;
      title: string;
      illustType: number;
      xRestrict: 0 | 1 | 2;
      restrict: 0 | 1 | 2;
      sl: 0 | 2 | 4 | 6;
      url: string;
      description: string;
      tags: string[];
      userId: string;
      userName: string;
      width: number;
      height: number;
      pageCount: number;
      isBookmarkable: boolean;
      bookmarkData: null | {
        id: string;
        private: boolean;
      };
    };
  };
  /**你是否给这个作品点赞过 */
  likeData: boolean;
  /**作品里第一张图片的宽度 */
  width: number;
  /**作品里第一张图片的高度 */
  height: number;
  /**总共有几张图片（分 p） */
  pageCount: number;
  /**这个作品的收藏数量 */
  bookmarkCount: number;
  /**这个作品的点赞数量 */
  likeCount: number;
  /**这个作品的评论数量 */
  commentCount: number;
  /**这个作品的响应关联作品的数量 */
  responseCount: number;
  /**这个作品的浏览量 */
  viewCount: number;
  /**读书模式
   *
   * 0 不设置
   *
   * 1 右开(←)
   *
   * 2 左开(→)
   */
  bookStyle: 0 | 1 | 2;
  /**不清楚 */
  isHowto: boolean;
  /**是否为原创作品 */
  isOriginal: boolean;
  /**推测为响应关联作品的数据，但是具体尚不清楚 */
  imageResponseOutData: [];
  imageResponseData: [];
  imageResponseCount: number;
  /**投票数据。大部分作品没有投票所以为 null */
  pollData: null | {
    /**投票的标题 */
    question: string;
    choices: {
      /**选项序号，从 1 开始 */
      id: number;
      /**选项文字 */
      text: string;
      /**选择此选项的人数 */
      count: number;
    }[];
    /**你选择的值 */
    selectedValue: null;
    /**一共有多少人参与投票 */
    total: 0;
  };
  /**系列导航数据
   *
   * 当这个作品属于一个系列时才有值，否则为 null
   */
  seriesNavData: null | {
    /**系列类型*/
    seriesType: 'manga' | string;
    /**系列 id */
    seriesId: string;
    /**系列标题 */
    title: string;
    /**这个作品在系列里的序号。从 1 开始*/
    order: number;
    /**当前用户是否把这个系列添加到了追更列表 */
    isWatched: false;
    /**当前用户是否对这个系列开启了系列更新通知 */
    isNotifying: false;
    /**系列中下一个作品的信息
     *
     * 如果这个作品是系列中的最后一个作品，则没有 next 字段
     */
    next?: {
      title: string;
      order: number;
      id: string;
    };
    /**系列中上一个作品的信息
     *
     * 如果这个作品是系列中的第一个作品，则没有 prev 字段
     */
    prev?: {
      title: string;
      order: number;
      id: string;
    };
  };
  descriptionBoothId: null;
  descriptionYoutubeId: null;
  comicPromotion: null;
  fanboxPromotion: null;
  contestBanners: [];
  /**当前用户是否可以将这个作品添加到收藏 */
  isBookmarkable: boolean;
  /**当前用户对此作品的收藏数据
   *
   * 如果未收藏则是 null
   */
  bookmarkData: null | {
    /**收藏的 id。是一个数字字符串 */
    id: string;
    /**是否为私密（非公开）收藏 */
    private: boolean;
  };
  contestData: null;
  zoneConfig: {
    responsive: {
      url: string;
    };
    rectangle: {
      url: string;
    };
    '500x500': {
      url: string;
    };
    header: {
      url: string;
    };
    footer: {
      url: string;
    };
    expandedFooter: {
      url: string;
    };
    logo: {
      url: string;
    };
    relatedworks: {
      url: string;
    };
  };
  extraData: extraDataCommon;
  titleCaptionTranslation: {
    workTitle: null | string;
    workCaption: null | string;
  };
  /**这个作品是否未列出
   *
   * 如果这个作品仅可由链接浏览，则是 true，这不会显示到作者的作品列表里。如：
   *
   * https://www.pixiv.net/artworks/unlisted/CbLRCId2sY3ZzQDqnQj6
   *
   * 大部分作品都是 false
   */
  isUnlisted: boolean;
  /**这个作品的约稿数据
   *
   * 如果这个作品不是根据约稿创作的，则为 null
   *
   * 如果是根据约稿创作的，则包含约稿数据。
   *
   * 约稿数据的格式可以参阅 https://www.pixiv.net/ajax/illust/101342830
   */
  request: null | object;
  /**作者是否关闭了评论区
   *
   * 0 未关闭
   *
   * 1 关闭
   */
  commentOff: 0 | 1;
}

interface extraDataCommon {
  meta: {
    /**页面标题 */
    title: string;
    /**作品简介，但是前面会附加一些由 Pixiv 添加的说明 */
    description: string;
    /**作品的页面 URL */
    canonical: string;
    /**不同语言所对应的这个作品的页面 URL
     *
     * en 英语时在路径中有 en/
     *
     * 其他语言与 ja 相同，没有这层路径
     */
    alternateLanguages: {
      ja: string;
      en: string;
    };
    /**Pixiv 添加的说明，如：本作「原神 多莉 mod」为附有「R-18」「动图」等标签的插画。 */
    descriptionHeader: string;
    ogp: {
      /**作品原本的简介文本 */
      description: string;
      /**一个 URL
       *
       * 可能是 Pixiv 的 logo 图片 URL，如 https://s.pximg.net/www/images/pixiv_logo.png
       *
       * 也可能是包含这个作品的其他链接，如 https://embed.pixiv.net/artwork.php?illust_id=99381250
       *  */
      image: string;
      /**页面标题 */
      title: string;
      /**不清楚指的是什么类型，指基本都是 "article" */
      type: string;
    };
    twitter: {
      /**作品原本的简介文本 */
      description: string;
      image: string;
      /**作品标题。对于非全年龄作品，Pixiv 可能会在前面加上 [R18] 字符 */
      title: string;
      card: 'summary' | 'summary_large_image' | string;
    };
  };
}
