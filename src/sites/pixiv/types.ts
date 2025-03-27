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

export interface TagItem {
  /**标签名字 */
  tag: string;
  /**这个标签是否被锁定（被锁定的就不能修改） */
  locked: boolean;
  /**当前用户（浏览者）是否可以删除这个标签*/
  deletable: boolean;
  /**作者的用户 id */
  userId: string;
  /**罗马音，现在这个字段或许已经被移除了 */
  romaji?: string;
  /**这个标签的翻译 */
  translation?: {
    /**翻译后的文字。
         *
         * 注意翻译后的文字并不总是英文。
         *
         根据用户设置的 pixiv 页面语言的不同（如中文、日文、韩语、英文等），en 会返回对应语言的翻译。

         所以用户语言不同时，en 可能不同。

         也可能同一个标签在某些语言时会有 translation 字段，另一些语言时没有 translation 字段。
         */
    en: string;
  };
  /**作者的用户名 */
  userName: string;
}

interface TagsData {
  /**作者的用户 id */
  authorId: string;
  /**作者是否设置了“不允许其他用户编辑标签” */
  isLocked: boolean;
  /**作品的标签列表 */
  tags: TagItem[];
  /**当前用户（浏览者）是否可以编辑这个作品的标签。未登录时总是不能编辑 */
  writable: boolean;
}

export interface PreloadData {
  timestamp: string;
  illust: {
    [illustId: string]: ArtworkDetail;
  };
  user: {
    [userId: string]: {
      userId: string;
      name: string;
      /** user avatar */
      image: string;
      /** user avatar */
      imageBig: string;
      premium: boolean;
      isFollowed: boolean;
      isMypixiv: boolean;
      isBlocking: boolean;
      background: {
        repeat: null;
        color: null;
        url: string;
        isPrivate: boolean;
      };
      sketchLiveId: null;
      partial: 0;
      sketchLives: [];
      commission: {
        acceptRequest: boolean;
        isSubscribedReopenNotification: boolean;
      };
    };
  };
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
    workTitle: null;
    workCaption: null;
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
  zoneConfig: ZoneDataCommon;
  extraData: ExtraDataCommon;
}

export interface UserPageIllustsData {
  works: Record<string, UserPageWorksItem>;
  zoneConfig: ZoneDataCommon;
  extraData: ExtraDataCommon;
}

export interface AllProfile {
  illusts: Record<string, null> | never[];
  manga: Record<string, null> | never[];
  novels: Record<string, null> | never[];
  mangaSeries: Record<string, null> | never[];
  pickup: any[];
  bookmarkCount: {
    public: Record<string, number>;
    private: Record<string, number>;
  };
  externalSiteWorksStatus: Record<string, boolean>;
  request: any;
}

export interface AddBookmark {
  last_bookmark_id: string;
  stacc_status_id: string | null;
}

export interface LikeIllust {
  is_liked: boolean;
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
  zoneConfig: ZoneDataCommon;
}

export interface ArtworkData {
  illustData: ArtworkDetail;
  globalData: GlobalData;
  ugoiraMeta?: UgoiraMeta;
}

export interface AjaxArtworkData {
  illustData: ArtworkDetail;
  ugoiraMeta?: UgoiraMeta;
}

/**
 * https://github.com/xuejianxianzun/PixivBatchDownloader
 */
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
  tags: TagsData;
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
      alt: string;
      titleCaptionTranslation: {
        workTitle: null;
        workCaption: null;
      };
      createDate: string;
      updateDate: string;
      isUnlisted: boolean;
      isMasked: boolean;
      aiType: 0 | 1 | 2;
      profileImageUrl: string;
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
  zoneConfig: ZoneDataCommon;
  extraData: ExtraDataCommon;
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
  /** TODO */
  reuploadDate: null;
  /** TODO */
  locationMask: boolean;
  /** TODO */
  commissionLinkHidden: boolean;
}

interface ExtraDataCommon {
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

type ZoneDataKey =
  | 'responsive'
  | 'rectangle'
  | '500x500'
  | 'header'
  | 'footer'
  | 'expandedFooter'
  | 'logo'
  | 'ad_logo'
  | 'relatedworks';

type ZoneDataCommon = Record<ZoneDataKey, { url: string }>;

interface SeriesIllustThumbnail extends UserPageWorksItem {
  seriesId: string;
  seriesTitle: string;
}

export interface SeriesData {
  tagTranslation: Record<
    string, // tag in unicode format
    {
      en: string;
      ko: string;
      zh: string;
      zh_tw: string;
      romaji: string;
    }
  >;
  thumbnails: {
    illust: SeriesIllustThumbnail[];
    novel: [];
    novelSeries: [];
    novelDraft: [];
    collection: [];
  };
  illustSeries: {
    id: string;
    userId: string;
    title: string;
    description: string;
    caption: string;
    total: number;
    content_order: null;
    url: string;
    coverImageSl: number;
    firstIllustId: string;
    latestIllustId: string;
    createDate: string;
    updateDate: string;
    watchCount: null;
    isWatched: boolean;
    isNotifying: boolean;
  }[];
  requests: [];
  users: {
    partial: number;
    comment: string;
    followedBack: boolean;
    userId: string;
    name: string;
    image: string;
    imageBig: string;
    premium: boolean;
    isFollowed: boolean;
    isMypixiv: boolean;
    isBlocking: boolean;
    background: null;
    commission: null;
  }[];
  page: {
    series: {
      workId: string;
      order: number;
    }[];
    isSetCover: boolean;
    seriesId: number;
    otherSeriesId: string;
    recentUpdatedWorkIds: number[];
    total: number;
    isWatched: boolean;
    isNotifying: boolean;
  };
  extraData: ExtraDataCommon;
  zoneConfig: ZoneDataCommon;
}

export interface PreloadedState {
  ads: {
    config: object;
    flags: object;
  };
  api: {
    token: string;
    services: {
      booth: string;
      sketch: string;
      vroidHub: string;
      accounts: string;
    };
    language: string;
  };
  booth: {
    items: object;
  };
  feedback: {
    open: boolean;
    page: string;
  };
  isDevelopment: boolean;
  meta: {
    config: {
      Illust: object;
      IllustUnlisted: object;
      IllustSeries: object;
      Profile: object;
      Novel: object;
      NovelUnlisted: object;
      NovelSeriesContent: object;
      NovelSeries: object;
      NovelSeriesGlossaryDetail: object;
      Search: object;
      Dashboard: object;
      Preview: object;
      FollowLatest: object;
      Discovery: object;
      UserEvents: object;
      About: object;
      Top: {
        default: {
          title: string;
          description: boolean;
        };
      };
    };
    error: boolean;
    lang: string;
  };
  misc: {
    consent: {
      gdpr: boolean;
    };
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
    oneSignalAppId: string;
  };
  mute: {
    tags: unknown[];
    userIds: unknown[];
    modal: {
      items: unknown[];
    };
  };
  search: {
    tag: {
      tagData: object;
      translation: object;
      loaded: {
        tag_search: string;
      };
    };
    work: {
      works: object;
      popular: object;
      relatedTags: object;
    };
  };
  tag: {
    popular: {
      illust: {
        all: unknown[];
        r18: unknown[];
      };
      novel: {
        all: unknown[];
        r18: unknown[];
      };
      manga: {
        all: unknown[];
        r18: unknown[];
      };
    };
    recommend: {
      illust: {
        all: unknown[];
        r18: unknown[];
      };
    };
    recommendBy: {
      illust: {
        all: unknown[];
        r18: unknown[];
      };
    };
    loaded: {
      search_suggestion: {
        all: string;
        r18: string;
      };
    };
    myFavorite: unknown[];
    genre: {
      manga: {
        all: unknown[];
        r18: unknown[];
      };
    };
    randomSeed: number;
  };
  task: {
    busy: object;
  };
  test: {
    ab: {
      commission_send_and_accept_confirmation: boolean;
      ab_manga_each_lang_populer_works: boolean;
      ab_touch_manga_new_viewer: boolean;
      novel_12th_premium_covers: boolean;
      novel_reading_status: boolean;
      novel_upload_next_js: boolean;
      novel_mod_next_js: boolean;
      novel_reserve_mod_next_js: boolean;
      posted_novel_cover_edit: boolean;
      premium_dmm_lp_update_202502: boolean;
      recommend_tutorial_20191213: boolean;
      www_premium_link_text: boolean;
      www_tags_link_to_en_dic: boolean;
      www_illust_edit_next_js_desktop: boolean;
      www_illust_reserve_edit_next_js_desktop: boolean;
      www_illust_reupload_next_js_desktop: boolean;
      next_js_cardiac_transplant: boolean;
    };
    toggle: {
      toggle_commission_limitation_countermeasure_202403: boolean;
      toggle_commission_lp_renewal: boolean;
      toggle_commission_coupon: boolean;
      toggle_enquete: boolean;
      toggle_manga_thumbnail_crop: boolean;
      toggle_novel_reading_status_show_release_modal: boolean;
      toggle_novel_reading_status_read_next_novel: boolean;
      toggle_premium_contract_update_retry_from_api: boolean;
      toggle_premium_error_next_js: boolean;
      toggle_premium_direct_overseas_users_to_gmo_flow: boolean;
      toggle_premium_edit_term_next_js: boolean;
      toggle_save_feedback: boolean;
      toggle_seasonal_effect_tag_release: boolean;
      toggle_seasonal_effect_tag_show_release_modal: boolean;
      toggle_seasonal_effect_tag_enable_manga_novel: boolean;
      toggle_mybestpixiv_release: boolean;
      toggle_new_logo_2025: boolean;
    };
  };
  thumbnail: {
    illust: object;
    novel: object;
    drafts: {
      illust: object;
      novel: object;
    };
    series: {
      manga: object;
      novel: object;
    };
  };
  userData: {
    pAbDId: number;
    self: {
      id: string;
      pixivId: string;
      name: string;
      profileImg: string;
      profileImgBig: string;
      premium: boolean;
      xRestrict: number;
      adult: boolean;
      illustCreator: boolean;
      novelCreator: boolean;
      hideAiWorks: boolean;
      readingStatusEnabled: boolean;
      illustMaskRules: unknown[];
      location: string;
      isSensitiveViewable: boolean;
    };
    users: object;
    follow: object;
    mypixiv: object;
    block: object;
    acceptRequest: object;
    subscribedReopenNotification: object;
    loaded: {
      self: string;
    };
  };
  webpush: {
    pixivWebpushPermission: null;
  };
  work: {
    bookmark: {
      bookmark: {
        illust: object;
        novel: object;
      };
      bookmarkable: {
        illust: object;
        novel: object;
      };
      manualBookmarks: {
        illust: null;
        novel: null;
      };
    };
    booth: {
      widget: object;
      items: object;
      workBoothIds: {
        illust: object;
        novel: object;
      };
    };
    contest: {
      banners: {
        illust: object;
        novel: object;
      };
      data: {
        illust: object;
        novel: object;
      };
    };
    request: {
      data: {
        illust: object;
        novel: object;
      };
    };
    data: {
      secret: {
        illust: object;
        novel: object;
      };
      illust: object;
      novel: object;
      seriesContent: {
        illust: object;
        novel: object;
      };
    };
    discovery: {
      illust: object;
      novel: object;
    };
    like: {
      illust: object;
      novel: object;
    };
    noLogin: {
      illust: object;
      novel: object;
    };
    poll: {
      illust: object;
      novel: object;
    };
    promotion: {
      comic: {
        illust: object;
        novel: object;
      };
      fanbox: {
        illust: object;
        novel: object;
      };
    };
    recommend: {
      illust: object;
      novel: object;
    };
    response: {
      outData: {
        illust: {
          items: object;
          references: object;
        };
        novel: {
          items: object;
          references: object;
        };
      };
      inData: {
        illust: {
          items: object;
          references: object;
          count: object;
        };
        novel: {
          items: object;
          references: object;
          count: object;
        };
      };
    };
    sensitiveVisibility: {
      illust: object;
      novel: object;
    };
    series: {
      series: {
        byId: {
          illust: object;
          novel: object;
        };
        detailById: {
          manga: object;
          novel: object;
        };
        content: {
          illust: object;
          novel: object;
        };
        contentTitles: {
          manga: object;
          novel: object;
        };
        glossary: {
          manga: object;
          novel: object;
        };
      };
      seriesEditor: {
        novel: {
          seriesContentsById: object;
          nonSeriesWorks: {
            works: object;
            hasMore: boolean;
          };
          deletedWorks: object;
          ordersByDesc: unknown[];
          editFirstOrder: number;
          unsaved: boolean;
          validationMessages: {
            title: unknown[];
            caption: unknown[];
            xRestrict: unknown[];
            aiType: unknown[];
            genre: unknown[];
            cover: unknown[];
          };
          seriesContentCount: number;
        };
      };
      watch: {
        manga: object;
        novel: object;
      };
      notify: {
        manga: object;
        novel: object;
      };
    };
    spoiler: {
      illust: object;
      novel: object;
    };
    tags: {
      byId: {
        illust: object;
        novel: object;
      };
      history: {
        illust: object;
        novel: object;
      };
    };
    userWorks: object;
    youtube: {
      workYoutubeIds: {
        illust: object;
        novel: object;
      };
    };
    newPost: {
      illust: {
        entries: unknown[];
        lastId: string;
      };
      r18_illust: {
        entries: unknown[];
        lastId: string;
      };
      manga: {
        entries: unknown[];
        lastId: string;
      };
      r18_manga: {
        entries: unknown[];
        lastId: string;
      };
      novel: {
        entries: unknown[];
        lastId: string;
      };
      r18_novel: {
        entries: unknown[];
        lastId: string;
      };
    };
  };
  pageCommission: {
    requests: object;
    userList: object;
    userListDesktop: object;
    paymentServiceStatus: unknown[];
    page: {
      manageRequests: {
        info: null;
        requestList: null;
        recentUpdate: null;
      };
      managePlanSettingsEdit: null;
      managePlanSettingsNew: null;
      requestsDetails: {
        requestThread: null;
        creator: null;
        recommendedUserIds: null;
        inProgressRequestIds: null;
        completeRequestIds: null;
        confettiModalStatus: {
          inProgressFan: boolean;
          inProgressCreator: boolean;
          completeFanOrCollaborateUser: boolean;
        };
        alreadyRequestCollaborate: null;
        platformFeeCampaignLabel: null;
        eligibleCampaignList: null;
        isUnlisted: boolean;
        ogp: object;
        locationMask: boolean;
      };
      requestSend: {
        creator: null;
        plan: null;
        planCoverImage: {
          selectableIllustsId: unknown[];
          fetchRanges: number[][];
        };
        inProgressRequestIds: unknown[];
        completeRequestIds: unknown[];
        recommendedTags: unknown[];
        ogp: object;
        progressCampaignList: unknown[];
        locationMask: boolean;
      };
      requestLegal: null;
      request: null;
      requestCreatorRecommendPost: {
        illust: object;
        manga: object;
        ugoira: object;
        novels: object;
      };
      requestCreators: {
        illust: object;
        manga: object;
        ugoira: object;
        novels: object;
      };
      requestInProgress: {
        all: object;
        illust: object;
        manga: object;
        ugoira: object;
        novels: object;
      };
      requestComplete: {
        illust: object;
        manga: object;
        ugoira: object;
        novels: object;
      };
      requestAbout: null;
      manageSales: null;
      manageTransfer: null;
      manageTransferSettings: null;
      manageLegalSettings: null;
      managePayment: null;
    };
  };
  pageNovelEditorsPicks: {
    data: unknown[];
  };
  premium: null;
  illust: {
    page: {
      currentPage: number;
      pages: object;
      hasBookmarked: boolean;
      expanded: boolean;
      openViewer: string;
    };
  };
  illustSeries: {
    series: object;
    seriesEditData: object;
    userAllMangaWorkIds: unknown[];
    loaded: {
      userAllMangaWorkIds: string;
    };
  };
  pageFollowLatest: {
    followUserWorks: object;
    mypixivUserWorks: object;
    folderTags: {
      follow: null;
      mypixiv: null;
    };
  };
  tagTranslationSuggestion: {
    isModalOpen: boolean;
  };
  ssr: {
    time: number;
    location: {
      host: string;
      href: string;
      origin: string;
      search: string;
    };
  };
  recommendUsers: {
    analizedUserId: null;
    users: null;
    seedUserId: null;
    followedUserIds: unknown[];
    usersWithoutUserId: unknown[];
  };
  profile: {
    bookmarks: {
      bookmarkWorks: object;
      bookmarkTags: {
        illust: object;
        novel: object;
      };
      bookmarkTagRenaming: {
        isInProgress: boolean;
      };
    };
    external: {
      sketch: object;
      vroidHub: object;
      enabled: object;
    };
    pickup: {
      pickup: object;
      pickupEditor: {
        unsaved: boolean;
      };
    };
    series: object;
    tag: {
      workTags: object;
      frequentTags: object;
      bookmarkTags: object;
    };
    uploadComplete: object;
    userList: {
      following: object;
      mypixiv: object;
      followers: object;
      folder: {
        tags: unknown[];
      };
      workData: object;
    };
    work: {
      works: object;
      filtered: object;
    };
    requests: {
      postWorkIds: object;
      plans: object;
    };
    request: {
      tabStatus: object;
      page: {
        request: null;
        requestSent: null;
      };
    };
    shouldShowSensitiveNotice: {
      shouldShowSensitiveNotice: object;
    };
  };
  pageDashboard: {
    home: {
      achievement: null;
      contests: unknown[];
      hotWorks: {
        today: null;
      };
      recentUploadWorks: unknown[];
      userCountSummary: object;
      yearBestWork: {
        work: null;
      };
      todayAnniversary: null;
    };
    works: {
      userWorks: unknown[];
      userSeries: unknown[];
      userDrafts: unknown[];
      userReservedWorks: unknown[];
    };
    reactions: {
      recentUploadWorks: {
        illust: object;
        novel: object;
      };
    };
    loaded: {
      reactions: string;
      works: string;
      worksUpToDate: string;
      home: string;
    };
  };
  pageTop: {
    illust: object;
    novel: object;
    manga: object;
  };
  readingStatus: {
    novel: object;
    manga: object;
    novelSeries: object;
    mangaSeries: object;
    visibleReadingProgressBar: boolean;
  };
  street: {
    main: unknown[];
    discover: unknown[];
    recommend_tags: null;
    forYou: unknown[];
    latest: {
      data: null;
      isLoading: boolean;
    };
    subColumn: unknown[];
    loadCount: {
      main: number;
      discover: number;
    };
    contentIndex: number;
    isNewUserToStreet: boolean;
  };
  spa: boolean;
  page: object;
  router: {
    location: null;
  };
}

export interface NextData {
  props: {
    pageProps: {
      forceLegacyNonResponsivePage: boolean;
      meta: {
        title: string;
        description: string;
        canonical: string;
        ogp: {
          title: string;
          type: string;
          image: string;
          description: string;
        };
        twitter: {
          card: string;
          description: string;
          image: string;
          site: string;
          title: string;
          url?: string;
          'app:name:iphone'?: string;
          'app:id:iphone'?: string;
          'app:url:iphone'?: string;
          'app:name:ipad'?: string;
          'app:id:ipad'?: string;
          'app:url:ipad'?: string;
          'app:name:googleplay?': string;
          'app:id:googleplay'?: string;
          'app:url:googleplay'?: string;
        };
        alternateLanguages: {
          ja: string;
          en: string;
        };
        referrerContentOrigin: boolean;
        ratingContent: string;
        robots: string;
        oembedJsonUrl: string;
      };
      lang: 'ja' | 'en' | 'ko' | 'zh' | 'zh_tw';
      isLoggedIn: boolean;
      gaUserData: {
        login: boolean;
        userAgent: string;
        gender: number;
        userId: string;
        illustUploadFlg: string;
        premium: boolean;
        lang: string;
        abTestDeviceId: number;
        premiumRegisterFirstMonthFreeCampaign: boolean;
      };
      forceTheme: null;
      serverSerializedPreloadedState: string;
      dehydratedState: {
        mutations: unknown[];
        queries: unknown[];
      };
      _sentryTraceData: string;
      _sentryBaggage: string;
    };
    /**
     * route
     * @example "/users/[user_id]/bookmarks/[type]/[tag]"
     */
    page: string;
    /** route query
     * @example { tag: "空崎ヒナ", type: artworks, user_id: "4787668" }
     */
    query: Record<string, string>;
    buildId: string;
    assetPrefix: string;
    isFallback: boolean;
    isExperimentalCompile: boolean;
    dynamicIds: number[];
    gip: boolean;
    scriptLoader: unknown[];
  };
}
