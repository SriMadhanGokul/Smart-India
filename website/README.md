# SMARTINDIA.DIGITAL — website

The homepage built from the approved motion design (`../video2/out/smartindia-studio-promo-v4.mp4`).

## Run it

```bash
npm install
npm run dev        # http://localhost:5179
npm run build      # production files in dist/
npm run preview    # serve dist/ on http://localhost:4179
```

## How it works

There are two layouts, and `src/main.js` picks one on load.

- **Desktop** is used on landscape screens at least 1100 px wide, with WebGL available and no reduced-motion setting. The whole story plays in one pinned viewport: loader → hero → about → glass marquee → key facts → selected work → services and the falling stone → testimonials → design in motion → footer.
  - The scroll position is mapped onto the approved video's timeline (`buildMap()` in `src/desktop.js`).
  - In the About, Key facts and Selected work sections, content follows the wheel 1:1.
  - The set pieces each get a fixed scroll length: the slat wipes, the stone, the carving and the ribbon.
  - Real time drives the loader, the hero intro, the fire, the storm and the count-ups.
  - Every section is laid out on a 1920×868 design frame. The frame is scaled by `--u` and centred, so the composition stays the same at any desktop size. The 3D camera is matched to the same frame.
- **Lite** covers phones, tablets, reduced motion, and browsers without WebGL. It tells the same story with the same content, stacked in normal page flow, and uses light reveal animations instead of 3D.

## Where things are

| File | What it holds |
|---|---|
| `src/content.js` | **All copy, links and images.** Edit text here. |
| `src/desktop.js` | Desktop scroll story (timeline, layers, ribbon) |
| `src/lite.js` | Mobile / tablet layout |
| `src/chrome.js` | Header, menu overlay, ambient sound, footer, analytics |
| `src/blocks.js` | Shared section markup, plus the testimonial switcher |
| `src/loader.js` | Intro loader |
| `src/gl/` | WebGL: `core` (camera and frame), `logo` (the fire-lit S), `glass` (glass type), `stone`, `storm`, `services` |
| `src/styles.css` | All styles, desktop first, with the lite section at the end |
| `public/media/` | Images and `ambient.mp3` |

## Placeholders to replace

1. **Logo.** The angular "S" is a stand-in mark. Its shape is `MARK` and `MARK_PATHS` in `src/content.js`, which drive five things:
   - the 3D logo
   - the carving on the stone
   - the loader
   - the header mark
   - `public/favicon.svg`, which has to be updated separately
2. **Founding year.** `HERO.est` currently reads "Est. Tirupur".
3. **Social profiles.** Every entry in `SOCIAL` is `'#'`. Those links do nothing until real URLs go in.
4. **Testimonial photos.** Avatars show initials for now. Add `photo: 'file.jpg'` to a testimonial in `public/media/` once there is a real photo of that person.
5. **Project pages.** All three `WORK[].url` entries point to `/projects/details`.

## Moving it into the Laravel app

1. Copy `src/` to `resources/js/smartindia/` and `public/media/` to the Laravel `public/media/`.
2. In the Laravel project, run `npm install three lenis`.
3. Create a Blade view:
   - Put the `<head>` meta tags and the Google Fonts link from `index.html` in its head.
   - Paste the `<body>` markup.
   - Replace the stylesheet and script tags with `@vite(['resources/js/smartindia/styles.css', 'resources/js/smartindia/main.js'])`.
4. In Laravel's `vite.config.js`, set `build.target: 'es2022'`. The entry module uses top-level await.
5. Clarity (`xxhznt5zik`) and the Meta Pixel (`1062073803017574`) load only in production builds (`chrome.js`). Remove the old inline snippets from the layout so visits aren't counted twice.
6. Links currently use absolute `https://smartindia.digital/...` URLs. Swap them for `route()` helpers if you prefer.

`window.__site` is a debugging hook that exists only on the dev server. `__site.go(52)` jumps to the stone scene, for example.
