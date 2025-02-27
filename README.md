# Pixiv Downloader

<img width='1080' src = 'https://p.sda1.dev/19/c6a3e925e3d274972c1b20c7831762cc/output-90.webp' />

## 主要功能

- 一键下载站点各页面图片。
- 批量下载。
- 自定义图片文件名，保存文件夹。
- 记录下载图片历史，支持导出 / 导入。
- 转换Pixiv动图（ugoira）格式，支持 Mp4 | Webm | Webp | Gif | Apng。

## 安装

1. 安装用户脚本管理器扩展，如[Tampermonkey](https://tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/)。
2. 通过[GreasyFork（需注册）](https://greasyfork.org/zh-CN/scripts/432150-pixiv-downloader) / [Sleazyfork（无需注册）](https://sleazyfork.org/zh-CN/scripts/432150-pixiv-downloader)安装脚本。

## 使用前

1. **如果需要将图片保存到子文件夹，以下两种方法请选其一：**
   1. 将**Tampermonkey 设置**中的“**配置模式**”由“**新手**”改为“**高级**”，然后找到“**下载 BETA**”，将“**下载模式**”修改为“**浏览器 API**”。
   2. 在**Pixiv Downloader 设置**中开启“**使用 FileSystemAccess API**”。
2. 为方便使用，可以将浏览器设置中“**下载前询问每个文件的保存位置**”选项关闭。

## 支持网站

| 网站                                                                         | 支持批量下载                                                                                                                                                           | 附注                                                                                                           |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [Pixiv](https://www.pixiv.net)                                               | [已关注用户的新作](https://www.pixiv.net/bookmark_new_illust.php)、画师 / 个人主页、按用户作品标签                                                                     |                                                                                                                |
| [Danbooru](https://danbooru.donmai.us/)                                      | [Posts](https://danbooru.donmai.us/posts)、[Pools](https://danbooru.donmai.us/pools/gallery)、Favorite groups                                                          |                                                                                                                |
| [Yande.re](https://yande.re/post)                                            | [投稿](https://yande.re/post)、[人气](https://yande.re/post/popular_recent)、[人气（按日/周/月）](https://yande.re/post/popular_by_day?day=10&month=2&year=2025)、图集 |                                                                                                                |
| [Konachan.net](https://konachan.net/)、[Konachan.com](https://konachan.com/) | 同上                                                                                                                                                                   | 在konachan.net进行批量下载时，请在下载器中添加标签黑名单"rating:q", "rating:e"，否则批量下载仍将下载NSFW图片。 |
| [Sakugabooru](https://www.sakugabooru.com/)                                  | 同上                                                                                                                                                                   |                                                                                                                |
| [Rule34](https://rule34.xxx/)                                                | [Posts](https://rule34.xxx/index.php?page=post&s=list&tags=all)、Pools、My Favorites                                                                                   |                                                                                                                |
| Gelbooru                                                                     | Posts、Pools、My Favorites                                                                                                                                             |                                                                                                                |
| E621、E926、E6ai                                                             | Posts、Pools、Favorites                                                                                                                                                | 暂不支持过滤用户黑名单                                                                                         |

## 更多功能

- 下载作品时收藏 / 点赞。
- 定时备份下载历史。

### Pixiv

- 将多页插画，漫画作品打包下载为zip压缩包。
- 为插图加入 #pixivGlow2024 萤火虫季节特效。

## 使用【浏览器 API】和使用【FileSystemAccess API】的区别

### 浏览器 API

- 如浏览器设置的下载目录为**D:\Downloads**, 那么可以将图片保存到该目录下，如**D:\Downloads**\Pixiv\artwork.jpg
- ViolentMonkey 不支持。

### FileSystemAccess API

- 不受浏览器默认下载目录限制，如浏览器设置的下载目录为**D:\Downloads**，可以手动选择图片保存到其它目录，如**D:\other dir**\pixiv\artwork.jpg。
- 本地存在相同文件时，可以选择“重命名”，“覆盖”或“提示”操作。
- Violentmonkey 可用。
- **限制**: 首次下载，或关闭所有 pixiv 标签后，需要手动选择图片保存目录。Firefox暂不支持。

## 我的浏览器能用吗

|               | Chrome         | Edge           | Firefox                              |
| ------------- | -------------- | -------------- | ------------------------------------ |
| Tampermonkey  | ✔             | ✔             | ✔⚠️FileSystemAccess API             |
| Violentmonkey | ✔⚠️浏览器 API | ✔⚠️浏览器 API | ✔⚠️浏览器 API，FileSystemAccess API |

其他请自行测试 : )

---

如果这个脚本有帮助到你，欢迎扫一扫微信赞赏码，赞助我一瓶可口可乐（没有瞧不起百事可乐的意思 ^\_^）。

<img width='200' style="border-radius: 50%;" src = 'https://s3.bmp.ovh/imgs/2022/11/11/85885dd73ebf6ad5.png' />

使用愉快！
