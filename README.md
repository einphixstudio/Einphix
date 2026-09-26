# Einphix — 个人网站

基于 [Astro](https://astro.build) 构建，托管在 Vercel。

## 开发

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # 产出静态站点到 ./dist
npm run preview  # 本地预览构建结果
```

## 怎么加一张新画

不需要改代码，只改两处：

1. **把图片文件放进对应年份的文件夹**：`src/content/works/<年份>/你的文件名.jpg`
   （没有对应年份的文件夹就新建一个，比如 `src/content/works/2025/`）
2. **在 `src/content/works/works.csv` 里加一行**，字段说明：

   | 列 | 说明 | 示例 |
   | --- | --- | --- |
   | `id` | 唯一标识，随便起，只要不重复 | `untitled-wires` |
   | `title` | 作品标题 | `Untitled (Wires)` |
   | `year` | 年份 | `2024` |
   | `medium` | 材质 | `oil on canvas` |
   | `dimensionsImperial` | 英制尺寸 | `20 x 20 in` |
   | `dimensionsMetric` | 公制尺寸 | `51 x 51 cm` |
   | `aspect` | 画框宽高比（决定图片展示的框子形状） | `1 / 1`、`3 / 2`、`4 / 3` |
   | `image` | 图片相对路径（相对 `works.csv` 所在目录） | `2024/A4-8x8-cloude-F.png` |
   | `series` | 所属系列，没有就留空 | `furry-forces` |
   | `kind` | `work`（作品）或 `sketch`（速写），留空默认 `work` | |
   | `featured` | 是否出现在首页轮播，`true`/`false` | `true` |
   | `order` | 首页轮播里的排序，数字越小越靠前，留空也行 | `1` |

   直接用 Excel / Numbers / Google Sheets 打开 `works.csv` 编辑，保存时**保持 CSV 格式**（不要存成 `.xlsx`）。

3. 保存后跑 `npm run dev` 看效果，没问题就提交、推送到 GitHub，Vercel 会自动重新部署。

CSV 里没写的字段（比如某天想加个 `alt` 文字描述）需要改 `src/content.config.ts` 里的 schema 定义。

## 目录结构

```
src/
├── content.config.ts        内容集合的 schema 定义（CSV 怎么解析、字段校验）
├── content/works/
│   ├── works.csv             所有作品的信息表
│   └── <年份>/                按年份分文件夹存放原图
├── components/
│   ├── SiteHeader.astro      顶部导航 + 下拉菜单 + 移动端菜单
│   └── WorkCarousel.astro    首页轮播
├── layouts/Layout.astro      页面外层（字体、meta）
├── lib/works.ts              读取/整理作品数据的小工具函数
├── styles/tokens.css         全局设计变量（颜色、间距）
└── pages/index.astro         首页
```

其它路由（`/work`、`/about`、`/series` 等）还没有设计稿，暂时没建 —— 等设计确定了再加对应的 `src/pages/*.astro`。

`docs/design-handoff/` 保留了最初的设计交付文档（`README.md`、`reference/home.html` 视觉基准、原始设计稿），方便以后对照。
