<img width='1166' src = 'https://p.sda1.dev/19/9cb2c0bac85515f7b6d430eee921bc56/screenshot_1_.png' />

# Pixiv Downloader

- 下载 [Pixiv](https://www.pixiv.net) | [Danbooru](https://danbooru.donmai.us/) | [Rule34](https://rule34.xxx/) | [Yande](https://yande.re/post) 图片。
- 下载时将图片加入收藏。
- 自定义图片文件名，保存文件夹。
- 记录下载图片历史。
- Pixiv支持更多功能：
  - 批量下载用户作品 / 收藏，按作品标签下载。
  - 将多页插画，漫画作品打包下载为 zip 压缩包。
  - 转换动图（ugoira）格式：Mp4 | Webm | Webp | Gif | Apng。
  - 为下载图片加入 #pixivGlow2024 动画效果。

## 我的浏览器能用吗

|               | Chrome         | Edge           | Firefox                              |
| ------------- | -------------- | -------------- | ------------------------------------ |
| Tampermonkey  | ✔             | ✔             | ✔⚠️FileSystemAccess API             |
| Violentmonkey | ✔⚠️浏览器 API | ✔⚠️浏览器 API | ✔⚠️浏览器 API，FileSystemAccess API |

其他请自行测试 : )

## 使用前

1. **如果需要将图片保存到子文件夹，以下两种方法请选其一：**
   1. 将**Tampermonkey 设置**中的“**配置模式**”由“**新手**”改为“**高级**”，然后找到“**下载 BETA**”，将“**下载模式**”修改为“**浏览器 API**”。
   2. 在**Pixiv Downloader 设置**中开启“**使用 FileSystemAccess API**”。
2. 为方便使用，可以将浏览器设置中“**下载前询问每个文件的保存位置**”选项关闭。

## 使用方法

1. 只要你见到下载按钮，点他。
2. Pixiv 用户 / 已关注用户的新作 页面，点击页面右上侧用户头像，进行批量下载。
3. 点击页面右下方设置图标召出设置面板，修改脚本设置。

## 使用【浏览器 API】和使用【FileSystemAccess API】的区别

### 浏览器 API

- 如浏览器设置的下载目录为**D:\Downloads**, 那么可以将图片保存到该目录下，如**D:\Downloads**\Pixiv\artwork.jpg
- ViolentMonkey 不支持。

### FileSystemAccess API

- 不受浏览器默认下载目录限制，如浏览器设置的下载目录为**D:\Downloads**，可以手动选择图片保存到其它目录，如**D:\other dir**\pixiv\artwork.jpg。
- 本地存在相同文件时，可以选择“重命名”，“覆盖”或“提示”操作。
- Violentmonkey 可用。
- **限制**: 首次下载，或关闭所有 pixiv 标签后，需要手动选择图片保存目录。Firefox暂不支持。

---

如果你觉得这个脚本有帮助到你，欢迎扫一扫微信赞赏码，赞助我一瓶可口可乐（没有瞧不起百事可乐的意思 ^\_^）。

<img width='200' style="border-radius: 50%;" src = 'https://s3.bmp.ovh/imgs/2022/11/11/85885dd73ebf6ad5.png' />

使用愉快！
