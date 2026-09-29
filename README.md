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

1. **把图片文件直接放进 `src/content/works/` 文件夹（不分年份，都在一起），文件名 = 那张画的 `id`**：
   `src/content/works/<id>.<后缀>`，比如 `src/content/works/2025-the-fish-thief.jpeg`

   `id` 建议**全部小写**、以年份开头，方便你在文件夹里按字母顺序排序时自然按年份聚在一起，比如：
   `2025-the-fish-thief`、`2024-untitled-wires`。

   **⚠️ 大小写要一致**：Windows 上文件名不分大小写，但网站部署到 Vercel 后跑在 Linux 上是**区分大小写**的——CSV 里的 `id` 必须跟文件名（去掉后缀）一字不差，包括大小写，否则本地看着正常，上线后这张图会 404。全部小写就不会有这个问题。
2. **在 `src/content/works/works.csv` 里加一行**，字段说明：

   | 列 | 说明 | 示例 |
   | --- | --- | --- |
   | `id` | 唯一标识，同时也是图片文件名（不含后缀），只要不重复 | `2025-the-fish-thief` |
   | `imageExt` | 图片文件后缀，跟 1 步里存的文件后缀对应上就行 | `jpg` / `png` |
   | `title` | 作品标题 | `The Fish Thief` |
   | `year` | 年份 | `2025` |
   | `medium` | 材质 | `oil on canvas` |
   | `dimensions` | 尺寸，**只写数字**，不用写 "in"，网站会自动补上——`14x14`、`14 x 14`、`7.5x9.5` 怎么写都行 | `14x14` |
   | `series` | 所属系列，没有就留空 | `furry-forces` |
   | `kind` | `work`（按年份放进 Work 页面）或 `study`（探索性作品，比如 CG、水粉、跟主风格不搭的尝试——放进 Studies 分类），留空默认 `work`。`study`/`studies`、大小写都认 | |
   | `featured` | 是否出现在首页轮播，`TRUE`/`FALSE` | `TRUE` |
   | `order` | 排序用，数字越小越靠前（首页轮播、作品年份页都按这个排），留空也行 | `1` |
   | `description` | 这张画的介绍文字，没有就留空（暂时还没有页面会显示它，先存着） | |

   直接用 Excel / Numbers / Google Sheets 打开 `works.csv` 编辑，保存时**保持 CSV 格式**（不要存成 `.xlsx`）。

   **⚠️ 如果用 Excel 存**：标题里如果有重音符号、中文之类的非英文字符（比如 "Adélie"），存的时候一定要选 **"CSV UTF-8"** 那个选项，不要选普通的 "CSV"——普通 CSV 在 Windows 上会把这些字符存坏。Google Sheets / Numbers 导出的 CSV 默认就是对的，不用担心。

3. 保存后跑 `npm run dev` 看效果，没问题就提交、推送到 GitHub，Vercel 会自动重新部署。

CSV 里没写的字段（比如某天想加个 `alt` 文字描述）需要改 `src/content.config.ts` 里的 schema 定义。

## 目录结构

```
src/
├── content.config.ts          内容集合的 schema 定义（CSV 怎么解析、字段校验）
├── content/works/
│   ├── works.csv               所有作品的信息表
│   └── <id>.<后缀>              所有原图，都在这一层，文件名 = id
├── components/
│   ├── SiteHeader.astro        顶部导航 + 下拉菜单 + 移动端菜单（全站共用）
│   ├── WorkCarousel.astro      首页轮播
│   ├── YearSwitcher.astro      作品年份页的年份切换条
│   ├── WorkRail.astro          作品年份页的横向轨道 + 点击放大（灯箱）
│   ├── MediaSwitcher.astro     Studies 页面的类型切换条（All / Watercolor / ...）
│   └── StudyGrid.astro         Studies 页面的瀑布流 + 点击放大（灯箱）
├── layouts/Layout.astro        页面外层（字体、meta）
├── lib/
│   ├── works.ts                 首页轮播用的数据函数
│   ├── workBuckets.ts           年份分桶逻辑 + 作品年份页的数据函数
│   └── studies.ts               Studies 的分类逻辑（从 medium 字段自动生成）+ 数据函数
├── styles/tokens.css           全局设计变量（颜色、间距）
└── pages/
    ├── index.astro              首页
    ├── about.astro               About 页面
    ├── work/[bucket].astro      作品年份页，如 /work/2025-2024
    └── studies/
        ├── index.astro           /studies，显示所有 study 作品
        └── [medium].astro        /studies/watercolor 等，按类型筛选
```

已经做好的页面：首页（`/`）、About（`/about`）、作品年份页（`/work/2025-2024` 等 5 个年份区间）、Studies（`/studies` 和 `/studies/<类型>`）。

**Studies 的分类是自动生成的**：不是像年份那样写死列表，而是看 CSV 里 `kind=study` 的作品用了哪些 `medium` 值（比如 `watercolor`、`digital`），就自动生成对应的页面和导航下拉菜单项。以后加一种新类型，不用改代码，CSV 里出现了就自动有页面。

其它路由（`/series` 等）还没有设计稿，暂时没建 —— 等设计确定了再加对应的 `src/pages/*.astro`。

`docs/design-handoff/` 保留了最初的设计交付文档（`README.md`、`reference/home.html` 视觉基准、原始设计稿），方便以后对照。
