# Handoff: Einphix artist site — Home page

## Overview
Home page for **Einphix**, an oil painter's personal site. The page is deliberately almost empty: a
thin nav bar and one painting at a time, crossfading on a 5-second timer, with the work's title and
medium set flush-left under the plate. No hero copy, no buttons, no scroll sections yet — the
painting is the page.

Target stack: **Astro**.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended
look and behavior, not production code to copy verbatim. The task is to **recreate this design in an
Astro project** using Astro's own patterns (layouts, content collections, `astro:assets`, islands),
not to paste the reference HTML into a `.astro` file and ship it.

`reference/home.html` is a framework-free, self-contained implementation: plain HTML, CSS custom
properties, media queries, ~25 lines of vanilla JS. Read exact values from it — every number in this
README matches that file.

## Fidelity
**High fidelity.** Colors, typography, spacing, breakpoint, and motion values are final. Recreate
pixel-for-pixel. The only open items are listed under "Open items" at the bottom.

## Screens / Views

### Home (`/`)
**Purpose:** first impression; show the work, let the visitor into Work / Series.

**Layout** — one column, full viewport height:
- `body`: `min-height:100vh; display:flex; flex-direction:column`
- `header`: `flex:0 0 auto`, `display:flex`, `align-items:center`, `justify-content:space-between`, `gap:24px`, padding `clamp(16px,2.8vw,38px) clamp(18px,3.4vw,46px)`
- `main`: `flex:1 1 auto`, `display:flex`, `justify-content:center`, `align-items:flex-start`, padding `clamp(10px,2vw,28px) clamp(18px,3.4vw,46px) clamp(28px,4vw,52px)`
- image column: `width:100%; max-width:620px`, centered

**Components**

1. **Wordmark** (left of header)
   - Text: `Einphix` rendered uppercase via CSS
   - `font-size: clamp(13px, 1.2vw, 16px)`, `font-weight:300`, `letter-spacing:0.38em`, `text-transform:uppercase`, `white-space:nowrap`
   - Links to `/`

2. **Desktop nav** (right of header, hidden below 900px)
   - Items in order: Work, Series, Sketches, About, Commission, Class
   - `display:flex; align-items:center; gap:clamp(16px,2vw,28px)`
   - Each link: `font-size:12px`, `letter-spacing:0.2em`, `text-transform:uppercase`, `white-space:nowrap`, `opacity:0.66`, `transition:opacity 180ms`; hover → `opacity:1`
   - Current page link: `opacity:1` plus `text-decoration:underline; text-underline-offset:6px; text-decoration-thickness:1px`

3. **Work dropdown** (hover/focus on Work)
   - Panel: `position:absolute; top:calc(100% + 18px); left:50%; transform:translateX(-50%)`
   - `padding:20px 26px`, `background:oklch(0.995 0.002 85)`, `box-shadow:0 22px 48px -24px rgba(0,0,0,0.3), 0 0 0 1px oklch(0 0 0 / 0.05)`, no border-radius
   - Pointer: 10×10px square, `rotate(45deg)`, same fill, `top:-5px; left:50%`
   - Items, `gap:12px`, each `font-size:12px; letter-spacing:0.2em` (same size as the nav — do not enlarge), with graded ink, newest darkest:
     | label | color | route |
     | --- | --- | --- |
     | 2025 – 2024 | `oklch(0.22 0.008 265)` | `/work/2025-2024` |
     | 2023 – 2022 | `oklch(0.5 0.008 265)` | `/work/2023-2022` |
     | 2021 – 2020 | `oklch(0.62 0.008 265)` | `/work/2021-2020` |
     | 2019 – 2018 | `oklch(0.7 0.008 265)` | `/work/2019-2018` |
     | Before 2017 | `oklch(0.76 0.008 265)` | `/work/before-2017` |
   - Hover on an item → `color:oklch(0.22 0.006 80)`, `transition:color 160ms`
   - Entry animation: `fadeIn 160ms ease both` (opacity only — **do not animate transform**, it cancels the `translateX(-50%)` centering)

4. **Series dropdown** — identical panel, one item: **Furry Forces** → `/series/furry-forces`, ink `oklch(0.22 0.008 265)`. More series get appended here.

5. **Social icons** (end of nav row, `gap:15px`, `margin-left:8px`)
   - Instagram, rednote, YouTube, bilibili — in that order
   - 16×16px, `opacity:0.7` → `1` on hover, `transition:opacity 180ms`
   - Instagram / YouTube / bilibili: brand glyphs in `#1a1a1a`. The reference pulls them from `cdn.simpleicons.org`; **replace with local SVGs in production.**
   - rednote: placeholder — a 16px circle, `border:1px solid oklch(0.55 0.006 80)`, `border-radius:50%`, containing the glyph 小 at `font-size:9px`. See "Open items".

6. **Hamburger** (below 900px, replaces the nav)
   - Button 44×44px, `margin-right:-10px` so the bars align optically with the padding edge
   - Three bars: `width:18px; height:1px; background:oklch(0.22 0.006 80)`, `gap:4px`, right-aligned
   - Toggles `aria-expanded`

7. **Mobile nav panel** (opens under the header)
   - `border-top:1px solid oklch(0.9 0.005 85)`, padding `4px <pad-x> 24px`, animation `slideIn 200ms ease both` (opacity + 6px rise)
   - Rows: `padding:16px 0` (≈50px tall — keeps 44px hit targets), `border-bottom:1px solid oklch(0.9 0.005 85)`, `font-size:13px`, `letter-spacing:0.2em`, uppercase
   - Work and Series rows are accordions with a `+` marker (`font-size:16px; opacity:0.5`); expanded list: `gap:14px`, `padding:16px 0 18px 2px`, items `font-size:13px; letter-spacing:0.2em` with the same graded inks
   - Sketches / About / Commission / Class are plain rows
   - Social icons at the bottom, 18×18px, `gap:22px`, `padding-top:24px`

8. **Work carousel** (`main`)
   - All works stacked in one CSS grid cell (`grid-column:1; grid-row:1`) so they crossfade in place; column `width:100%; max-width:620px`
   - Each entry is a `<figure>`: `display:flex; flex-direction:column`, `margin:0`
   - Plate: `width:100%`, `aspect-ratio` from the work's own proportions (3/2, 1/1, 4/3 in the current set), `overflow:hidden`, `background:oklch(0.9 0.005 85)`, `box-shadow:0 40px 80px -40px rgba(0,0,0,0.45)`, no radius
   - Image: `width:100%; height:100%; object-fit:cover; display:block`
   - Caption: `margin-top:18px`, two lines, `gap:5px`, each `font-size:15px; letter-spacing:0.01em`, color `oklch(0.22 0.006 80)`. Line 1 = title, line 2 = `year, medium, imperial / metric` — e.g. `2024, oil on canvas, 20 x 20 in / 51 x 51 cm`
   - Caption is flush-left with the plate's left edge (it is a sibling in the same column — no offsets needed)
   - Inactive entries: `opacity:0` and `pointer-events:none`

## Interactions & Behavior
- **Carousel:** 5s dwell per work, crossfade `opacity 900ms cubic-bezier(0.4, 0, 0.2, 1)`. No arrows, no dots, no captions overlaying the image. Autoplay only; clicking is not wired up yet.
- **Dropdowns:** open on hover **and** `:focus-within` (keyboard). In the Astro build, CSS-only (`.has-menu:hover .menu`) is enough — no island needed. If you convert them to JS, keep a ~160ms close delay so a diagonal cursor path doesn't dismiss them.
- **Hamburger:** toggles the panel; accordions inside toggle independently; closing the panel on breakpoint change is expected.
- **Responsive:** single breakpoint at **900px** — `@media (max-width: 899px)` hides `.nav` and shows `.burger`. Everything else is fluid (`clamp()` padding, `max-width` column). No fixed pixel widths anywhere, no absolute positioning except the dropdown panels and their pointers.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` drops the crossfade transition. Consider also pausing autoplay.

## State Management
Tiny. Only the carousel needs an island (`client:idle`):
- `activeIndex: number` — advanced by an interval every 5000ms, wrapping at `works.length`
- `menuOpen: 'work' | 'series' | null` — only if you implement dropdowns in JS instead of CSS
- `navOpen: boolean`, `expandedSection: 'work' | 'series' | null` — mobile panel; can be CSS `:has()`/`<details>` or a small island

Header and dropdowns should be static HTML. Do not ship the whole page as one client component.

## Content model (Astro content collections)
One collection drives Work, Series, Sketches and the home carousel:

```ts
// src/content/config.ts
const works = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    title: z.string(),              // "Untitled (Wires)"
    year: z.number(),               // 2024
    medium: z.string(),             // "oil on canvas"
    dimensionsImperial: z.string(), // "20 x 20 in"
    dimensionsMetric: z.string(),   // "51 x 51 cm"
    aspect: z.string(),             // "1 / 1" — drives the plate's aspect-ratio
    image: image(),
    series: z.string().optional(),  // "furry-forces"
    kind: z.enum(['work', 'sketch']).default('work'),
    featured: z.boolean().default(false), // appears in the home carousel
    order: z.number().optional(),
  }),
});
```

Caption line 2 is derived: `${year}, ${medium}, ${dimensionsImperial} / ${dimensionsMetric}`.

**Year buckets** are ranges, not single years — derive them from `year` rather than hard-coding
lists, so the dropdown stays correct as work is added:
`2025–2024`, `2023–2022`, `2021–2020`, `2019–2018`, `Before 2017`.

**Work and Series are separate top-level entries** (a deliberate decision — not merged). A single
work can belong to both a year bucket and a series; the two nav entries are just different groupings
of the same collection.

## Routes
| Route | Content |
| --- | --- |
| `/` | crossfade carousel of `featured: true` works |
| `/work` | all works, newest first |
| `/work/[bucket]` | `2025-2024`, `2023-2022`, `2021-2020`, `2019-2018`, `before-2017` |
| `/series` | series index |
| `/series/furry-forces` | works where `series === 'furry-forces'` |
| `/sketches` | works where `kind === 'sketch'` |
| `/about` | — |
| `/commission` | — |
| `/class` | — |

Only `/` is designed. The rest are nav destinations; do not invent layouts for them — stub them or
wait for designs.

## Design Tokens
**Color**
| token | value | use |
| --- | --- | --- |
| `--bg` | `oklch(0.968 0.004 85)` | page background (warm off-white) |
| `--panel` | `oklch(0.995 0.002 85)` | dropdown panel |
| `--ink` | `oklch(0.22 0.006 80)` | all primary text |
| `--rule` | `oklch(0.9 0.005 85)` | hairlines in the mobile panel |
| `--frame-bg` | `oklch(0.9 0.005 85)` | plate background before the image paints |
| year inks | `oklch(0.22 / 0.5 / 0.62 / 0.7 / 0.76 · 0.008 265)` | dropdown year grading |
| social circle border | `oklch(0.55 0.006 80)` | rednote placeholder |

Everything is oklch on purpose — keep it; don't convert to hex (the grading depends on even
lightness steps).

**Typography** — Hanken Grotesk (300/400/500) for everything; JetBrains Mono only for the "drop
image" placeholder in the mock and not needed in production.
| role | size | tracking | case |
| --- | --- | --- | --- |
| wordmark | `clamp(13px, 1.2vw, 16px)` / 300 | `0.38em` | upper |
| nav link | 12px / 400 | `0.2em` | upper |
| dropdown item | 12px / 400 | `0.2em` | as written |
| mobile row | 13px / 400 | `0.2em` | upper |
| mobile sub-item | 13px / 400 | `0.2em` | as written |
| caption | 15px / 400 | `0.01em` | as written |

**Spacing** — header padding `clamp(16px,2.8vw,38px)` × `clamp(18px,3.4vw,46px)`; nav gap `clamp(16px,2vw,28px)`; social gap 15px (18px on mobile: 22px); caption offset 18px; dropdown padding `20px 26px` with `gap:12px`, offset `calc(100% + 18px)`.

**Radius** — 0 everywhere except the 50% social circle. No rounded cards.

**Shadow**
- plate: `0 40px 80px -40px rgba(0,0,0,0.45)`
- dropdown: `0 22px 48px -24px rgba(0,0,0,0.3), 0 0 0 1px oklch(0 0 0 / 0.05)`

**Motion**
| what | value |
| --- | --- |
| carousel crossfade | `opacity 900ms cubic-bezier(0.4, 0, 0.2, 1)` |
| carousel dwell | 5000ms |
| dropdown in | `fadeIn 160ms ease both` (opacity only) |
| mobile panel in | `slideIn 200ms ease both` (opacity + `translateY(6px)`) |
| link hover | `opacity 180ms` |
| dropdown item hover | `color 160ms` |

**Breakpoint** — 900px, single.

## Assets
In `reference/images/` (the artist's own paintings — treat as final content, not placeholders):
| file | work | aspect |
| --- | --- | --- |
| `IMG_63510.jpg` | Untitled (Three) — three rabbits in tactical gear | 3 / 2 |
| `A4-8x8-cloude-F.png` | Untitled (Wires) — power lines and cloud at dusk | 1 / 1 |
| `A-blured.png` | Untitled (Adélie) — penguins on ice | 4 / 3 |

These are unoptimized originals. Run them through `astro:assets` (`<Image>`/`<Picture>`), emit
AVIF/WebP, and set `loading="eager"` + `fetchpriority="high"` on the first carousel frame only.

Fonts are loaded from Google Fonts in the reference. **Self-host them** in production
(`@fontsource/hanken-grotesk` or local woff2 + `font-display:swap`).

Social icons come from `cdn.simpleicons.org` in the reference. **Vendor them as local SVGs.**

## Open items
1. **rednote icon** — the circled 小 is a placeholder. The official mark is a Chinese wordmark that
   is unreadable at 16px; the artist will supply an SVG from rednote's brand page. Keep the
   placeholder until then, and keep `title="rednote"`.
2. **Fourth carousel slot** — the mock has a striped "artwork 04 — drop image" placeholder for a
   daily study. It is omitted from the reference HTML; the carousel is data-driven, so it appears as
   soon as a fourth `featured` work is added.
3. **Dimensions** — the metric/imperial numbers in the captions were inferred from image
   proportions. The artist will confirm exact sizes.
4. **Social URLs** — all `href="#"`. Real profile links pending.
5. **Empty right side of the header on mobile** — intentional; nothing else goes there.

## Files
| path | what it is |
| --- | --- |
| `reference/home.html` | framework-free reference implementation — the visual and behavioral source of truth |
| `reference/images/*` | the three paintings |
| `source/Einphix Home Page.dc.html` | the original design file from the design tool. **Reference only** — it uses a proprietary template runtime (`{{ }}` holes, a `DCLogic` class). Do not port its structure; use `reference/home.html` instead. |
