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
   | `medium` | 用什么颜料画的 | `oil` / `acrylic` / `watercolor` |
   | `surface` | 画在什么上面，没有就留空（比如数字绘画） | `canvas` / `board` / `paper` / `gessoed paper` / `sketchbook` |
   | `dimensions` | 尺寸，**只写数字**，不用写 "in"，网站会自动补上——`14x14`、`14 x 14`、`7.5x9.5` 怎么写都行 | `14x14` |
   | `series` | 所属系列，没有就留空。填了之后自动会有一个 `/series/<系列名>` 页面（用跟 Work 年份页一样的横向卷轴 + 灯箱），导航栏 Series 下拉也会自动多一项，不用改代码——除非这个系列需要特殊设计（像 Furry Forces 那样），那种要专门跟我说 | `dreamscape` |
   | `kind` | `work`（按年份放进 Work 页面）、`study`（探索性作品，比如 CG、水粉、跟主风格不搭的尝试——放进 Studies 分类）或 `commission`（委托作品，不会出现在 Work 或 Studies 任何页面——比如 Commission 页面头图这种，只是单独被某个页面点名引用的画，不需要出现在作品列表里），留空默认 `work`。大小写、单复数都认（`study`/`studies`、`commission`/`commissions`） | |
   | `kind2` | 可选，**让这张画同时出现在第二个分类的页面里**。比如一张画 `kind=study`、`kind2=work`，就会同时出现在它的 Studies 分类页**和**对应年份的 Work 页面。取值范围跟 `kind` 一样（`work`/`study`/`commission`），留空就是没有第二个分类 | `work` |
   | `featured` | 是否出现在首页轮播，`TRUE`/`FALSE` | `TRUE` |
   | `featuredOrder` | **只管首页轮播**的顺序，数字越小越靠前。只有 `featured=TRUE` 才有意义 | `1` |
   | `order` | **只管这张画在自己主分类（`kind`）对应页面里排第几**，数字越小越靠前，跟首页轮播完全无关。填了就"置顶"到该年份/该类型页面最前面（在其它同样填了 `order` 的画之间按数字排）；不填就按年份新到旧自然排在后面 | `1` |
   | `kind2Order` | 跟 `order`同样的排序规则，但**只管第二个分类（`kind2`）对应页面里排第几**——跟 `order` 互相独立，只有填了 `kind2` 才有意义 | `1` |
   | `description` | 这张画的介绍文字，没有就留空（暂时还没有页面会显示它，先存着） | |

   **`medium` + `surface` 怎么显示**：网站会自动拼成"Oil on canvas"这样的一句话。大部分 surface 用"on"连接，但 `surface=sketchbook` 时自动换成"in"（"Oil in sketchbook"），因为素描本习惯说"画在本子里"而不是"画在本子上"。`surface` 留空就只显示 `medium`（比如以后加数字绘画，`medium=digital`，没有物理材质可以不填）。

   直接用 Excel / Numbers / Google Sheets 打开 `works.csv` 编辑，保存时**保持 CSV 格式**（不要存成 `.xlsx`）。

   **⚠️ 如果用 Excel 存**：标题里如果有重音符号、中文之类的非英文字符（比如 "Adélie"），存的时候一定要选 **"CSV UTF-8"** 那个选项，不要选普通的 "CSV"——普通 CSV 在 Windows 上会把这些字符存坏。Google Sheets / Numbers 导出的 CSV 默认就是对的，不用担心。

3. 保存后跑 `npm run dev` 看效果，没问题就提交、推送到 GitHub，Vercel 会自动重新部署。

CSV 里没写的字段（比如某天想加个 `alt` 文字描述）需要改 `src/content.config.ts` 里的 schema 定义。

**如果某一行的图片文件还没传上去，或者文件名跟 `id` 不一致**：网站不会因此崩溃——那张图的位置会显示一个灰底 "Image missing" 占位块，其他所有作品照常显示，终端会打印一行提示（`[works.csv] image not found for "<id>": <文件名>`）方便你知道该补哪张图。等图片传上去、文件名对上了，刷新页面占位块就会自动变成真实的画。

## 怎么改 Commission 页面的内容

`/commission` 页面的价格、流程步骤、加价项、促销横条，都是从 `src/content/commission/` 下面 4 个小表格读的，跟画作数据完全分开。都用 Excel 打开改，改完跑 `npm run dev` 看效果：

| 文件 | 内容 | 字段说明 |
| --- | --- | --- |
| `pricing.csv` | 价格表 | `id`=尺寸（比如 `9 x 12`），`animal`/`portrait`=对应价格（纯数字，不用写 `$`） |
| `steps.csv` | "如何委托"的流程步骤 | `step`=第几步（数字，可以重复——同一个 `step` 数字下的几行会显示在同一个编号下面，比如你截图里"2"下面有两块内容）；`title`/`description`=每块的标题和说明。`description` 里想换行就直接在 Excel 单元格里按 Alt+Enter 换行，会保留 |
| `addons.csv` | 加价项 | `order`=显示顺序（数字），`label`=加价项名称，`description`=说明 |
| `settings.csv` | 零散的开关和文案 | 两列表格：`id`=设置项名字，`value`=内容。目前有这些 `id`：`promoEnabled`（`TRUE`/`FALSE`，促销横条的总开关）、`promoStart`/`promoEnd`（促销的起止日期，格式 `2026-12-01`，都留空就是"只要开关是 TRUE 就一直显示"）、`promoText`（促销文案）、`heroHeading`/`heroSubtext`（顶部大标题和副标题）、`heroImageId`（顶部圆形展示图用哪张画，填 `works.csv` 里的 `id`）、`pricingIntro`（价格表上方说明）、`depositText`（押金说明） |

**促销横条现在设的是圣诞活动**（`promoEnabled=TRUE`，`promoStart=2026-12-01`，`promoEnd=2027-01-10`）——只有当前日期落在这个区间内才会显示，区间外自动隐藏，不用你手动记得开关。

⚠️ **这是静态网站**：日期判断是在**网站构建的时候**算的，不是访客看网页那一刻实时算的。也就是说如果 12 月 1 号那天网站没有重新部署，横条不会准时在那天出现，要等到下一次构建（比如你推送了别的改动，或者手动触发一次部署）才会生效。如果想要精确到那天自动生效，需要设置一个定时任务在那天触发重新部署——目前还没做这个，先手动留意就行。

## 怎么改 Class 页面的内容

`/class` 页面的画材清单、颜色清单、FAQ，都是从 `src/content/class/` 下面 4 个小表格读的。都用 Excel 打开改，改完跑 `npm run dev` 看效果：

| 文件 | 内容 | 字段说明 |
| --- | --- | --- |
| `supplies.csv` | 画材清单的卡片（Canson 纸、颜料、笔刷等），也包括那个高亮的 Michaels 丙烯颜料块 | `order`=显示顺序（数字），`name`=名称，`description`=说明（想换行就 Alt+Enter），`link`=Amazon 购买链接（留空就不显示购买按钮），`imageExt`=图片后缀（比如 `jpg`；留空就显示"Photo coming soon"占位），`highlight`=`TRUE`/`FALSE`（`TRUE` 的那一行会显示成页面上单独高亮的 Michaels 颜料块，而不是普通网格卡片，目前是 `liquitex-acrylic-paint` 这一行） |
| `colors.csv` | 高亮的 Michaels 丙烯颜料块里的"必买颜色"列表 | `order`=显示顺序，`name`=颜色名，`note`=备注（比如"建议买 250ml"，没有就留空） |
| `faq.csv` | 顶部 FAQ 手风琴 | `order`=显示顺序，`question`=问题，`answer`=答案（中英双语直接写在同一格里，想换行就 Alt+Enter） |
| `settings.csv` | 零散文案 | `id`=设置项名字，`value`=内容。目前有：`suppliesHeading`/`colorsHeading`/`faqHeading`（三个区块的标题）、`acrylicIntro`（"去本地 Michaels 购买"那行提示） |

**图片和 `works.csv` 是同一套规则**：图片跟 CSV 放在同一个文件夹（`src/content/class/`），文件名 = 这一行的 `id` + `.` + `imageExt`，比如 `canson-watercolor-pad.jpg`。不用另外传到 `public/` 文件夹。

⚠️ 同样注意 Excel 保存要选 **"CSV UTF-8"**，不要选普通 "CSV"，否则中文和特殊符号会存坏。

## 目录结构

```
src/
├── content.config.ts          内容集合的 schema 定义（CSV 怎么解析、字段校验）
├── content/works/
│   ├── works.csv               所有作品的信息表
│   └── <id>.<后缀>              所有原图，都在这一层，文件名 = id
├── content/commission/
│   ├── pricing.csv              价格表
│   ├── steps.csv                委托流程步骤
│   ├── addons.csv               加价项
│   └── settings.csv             促销开关、hero 文案等零散设置
├── content/class/
│   ├── supplies.csv             画材清单卡片
│   ├── colors.csv                Michaels 丙烯颜料"必买颜色"列表
│   ├── faq.csv                   FAQ 手风琴
│   └── settings.csv              区块标题、丙烯颜料介绍等零散设置
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
│   ├── studies.ts               Studies 的分类逻辑（从 medium 字段自动生成）+ 数据函数
│   ├── series.ts                通用系列页的逻辑（从 series 字段自动生成，排除有专属页面的系列）+ 数据函数
│   ├── commission.ts            读取 Commission 页面 4 个 CSV 的数据函数
│   └── classPage.ts             读取 Class 页面 4 个 CSV 的数据函数
├── styles/tokens.css           全局设计变量（颜色、间距）
└── pages/
    ├── index.astro              首页
    ├── about.astro               About 页面
    ├── commission.astro          Commission 页面
    ├── class.astro                Class 页面
    ├── series/
    │   ├── furry-forces.astro    Furry Forces 专属系列页（自定义设计）
    │   └── [series].astro        其它系列的通用页，如 /series/dreamscape
    ├── work/[bucket].astro      作品年份页，如 /work/2025-2024
    └── studies/
        ├── index.astro           /studies，显示所有 study 作品
        └── [medium].astro        /studies/watercolor 等，按类型筛选
```

已经做好的页面：首页（`/`）、About（`/about`）、Commission（`/commission`）、Class（`/class`）、Series 系列页（`/series/<系列名>`）、作品年份页（`/work/2026`、`/work/2025-2024` 等 6 个年份区间，2026 单独一档）、Studies（`/studies` 和 `/studies/<类型>`）。

年份区间写在 [workBuckets.ts](src/lib/workBuckets.ts) 的 `YEAR_BUCKETS` 里，以后年份不够用了（比如要加 2027），去那改。

**Studies 的分类是自动生成的**：不是像年份那样写死列表，而是看 CSV 里 `kind=study` 的作品用了哪些 `medium` 值（比如 `watercolor`、`digital`），就自动生成对应的页面和导航下拉菜单项。以后加一种新类型，不用改代码，CSV 里出现了就自动有页面。

**Series 页面也是自动生成的，逻辑跟 Studies 一样**：`works.csv` 里只要有作品填了 `series` 字段，就自动会有对应的 `/series/<系列名>` 页面（用的是跟 Work 年份页一样的横向卷轴 + 灯箱模板），导航栏 Series 下拉也自动跟着更新。**例外**：像 Furry Forces 这种需要专属设计的系列，要在 [series.ts](src/lib/series.ts) 的 `CUSTOM_SERIES_SLUGS` 里加上它的 slug 排除掉，然后单独建一个 `src/pages/series/<系列名>.astro` 手工设计（参照 `furry-forces.astro`）。以后新系列如果没有特殊要求，CSV 里填上 `series` 就完事，不用找我改代码；如果想要单独设计，跟我说一声。

`docs/design-handoff/` 保留了最初的设计交付文档（`README.md`、`reference/home.html` 视觉基准、原始设计稿），方便以后对照。
