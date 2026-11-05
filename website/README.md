# SMARTINDIA.DIGITAL — website

A multi-page site. The homepage is the approved scroll story, and every link in the site opens a page of this site. Content comes from smartindia.digital, with SEO and marketing removed.

## Run it

```bash
npm install
npm run dev        # http://localhost:5179
npm run build      # production files in dist/
npm run preview    # serve dist/ on http://localhost:4179
npm run build:pages  # build for the GitHub Pages preview (served under /Smart-India/, not indexed by search engines)
```

## Live preview

https://srimadhangokul.github.io/Smart-India/ is served from the `gh-pages` branch, which holds only built files and is separate from `main`. Search engines are told not to list it, and analytics stay off there.

To publish an update, run these from this folder:

```bash
npm run build:pages
touch dist/.nojekyll
cd dist
git init -b gh-pages
git add -A
git commit -m "Publish website preview"
git push -f https://github.com/SriMadhanGokul/Smart-India.git gh-pages
rm -rf .git
```

## Pages

| URL | Page |
|---|---|
| `/` | Home: the scroll story |
| `/about/` | About |
| `/services/` | Services list |
| `/services/app-development/` | Mobile Application Development |
| `/services/web-application-development/` | Web Application Development |
| `/services/web-development/` | Website Development |
| `/services/graphic-designing/` | Graphic Designing |
| `/projects/` | Portfolio |
| `/projects/<project>/` | One page per project (7) |
| `/team/`, `/pricing/`, `/testimonials/`, `/faq/` | Team, Pricing, Testimonials, FAQ |
| `/blogs/`, `/blogs/<post>/` | News list and article |
| `/contact/` | Contact form and details. "Discuss your project" buttons land on its form (`#discuss`) |
| `/book-a-call/` | Call now, or request a call. "Book a free call" buttons land on its form (`#request`) |
| `/404.html` | Shown for any address that doesn't exist |

Each page is built as real HTML, so addresses can be opened directly, refreshed and shared.

## How it works

Two layouts are chosen before the first paint (the script in `site/layout.js`).

- **Full** is used on landscape screens at least 1100 px wide, with WebGL available and no reduced-motion setting.
- **Lite** covers phones and tablets. It tells the same 3D story in normal page flow (`src/mobile3d.js`).
- **Lite without 3D** is the fallback for reduced motion, browsers without WebGL2, and phones that prove too slow: the same content as a plain stacked page with light reveal animations.

**Homepage (full layout).** The whole story plays in one pinned viewport: loader → hero → about → glass marquee → key facts → selected work → services and the falling stone → testimonials → design in motion → footer.
- The scroll position is mapped onto the approved video's timeline (`buildMap()` in `src/desktop.js`).
- In the About, Key facts and Selected work sections, content follows the wheel 1:1.
- The set pieces each get a fixed scroll length: the slat wipes, the stone, the carving and the ribbon.
- Real time drives the loader, the hero intro, the fire, the storm and the count-ups.
- Every section is laid out on a 1920×868 design frame. The frame is scaled by `--u` and centred, so the composition stays the same at any desktop size. The 3D camera is matched to the same frame.
- The loader plays once per visit. Coming back to the homepage goes straight to the hero.

**Homepage (phones and tablets).** The page scrolls normally, and the 3D sits on one fixed canvas behind it. The sections follow the reference's phone site: the fire-lit S behind the hero and About, the S flying through a glass marquee, slats into Key facts (a swipeable row of cards), stacked work cards, then two pinned stages. The services stage runs white panel → storm → the stone through the glass words → the S carved → service cards drifting over it. The design-in-motion stage runs sliding words → the ring of cards → a 2×3 grid.
- Scroll progress through each stage is mapped onto the same story timeline as desktop (`SVC_KEYS` in `src/mobile3d.js`), so both layouts share the same scenes and keyframes.
- In this layout the design frame is scaled to fit a slice 560 design px wide (`LITE_W` in `src/gl/core.js`, and the script in `site/layout.js`), so the 3D stays on screen in portrait.
- Heights use `100lvh`, the tallest viewport, so a phone's URL bar sliding away doesn't move anything. Items near the bottom of a stage allow for the bar with `100lvh - 100svh`.
- To keep it smooth on phones, the scenes use smaller textures and fewer objects, and the 3D scene is shaded once and copied to the screen.
- If frames stay slow, the render resolution steps down in two stages. If a phone is still too slow, or the WebGL context is lost for good, the site switches to the layout without 3D for the rest of the visit (`governor` in `src/gl/core.js`).

**Inner pages.** These use normal document flow, sized from `--px` (one design pixel at 1920 wide). They add a 3D S behind the hero wherever WebGL is available, slat wipes between sections, and a five-slat transition between pages.

## Where things are

| File | What it holds |
|---|---|
| `src/data.js` | **All copy, facts and lists.** Edit text here. |
| `site/pages.js` | The inner page templates and the list of pages |
| `site/layout.js` | Shared `<head>`, header, menu overlay and footer |
| `site/plugin.js` | Vite plugin that turns the page list into real HTML files |
| `index.html` | Homepage markup |
| `src/content.js` | Adds site-relative URLs to the data, for browser code |
| `src/main.js`, `src/desktop.js`, `src/lite.js` | Homepage scripts: entry, desktop scroll story, phone layout |
| `src/mobile3d.js`, `src/dim.js` | The phone's 3D story; the design-in-motion scene, shared with desktop |
| `src/page.js`, `src/hero3d.js` | Inner page scripts: reveals, wipes, FAQ, contact form, 3D hero |
| `src/chrome.js` | Menu behaviour, sound, page transitions, footer, analytics |
| `src/blocks.js` | Homepage section markup, plus the testimonial switcher |
| `src/loader.js` | Intro loader and its clock |
| `src/gl/` | WebGL: `core` (camera and frame), `logo` (the fire-lit S), `glass` (glass type), `stone`, `storm`, `services` |
| `src/styles.css`, `src/pages.css` | Shared and homepage styles; inner page styles |
| `public/media/` | Images and `ambient.mp3` |

## Content rule

SEO and marketing are not offered on this site, and that includes social media marketing and Meta & Google ads. Real client quotes are never reworded: a quote about those services is left out instead.

## Placeholders to replace

1. **Logo.** The angular "S" is a stand-in mark. Its shape is `MARK` and `MARK_PATHS` in `src/data.js`, which drive five things:
   - the 3D logo
   - the carving on the stone
   - the loader
   - the header mark
   - `public/favicon.svg`, which has to be updated separately
2. **Founding year.** `HERO.est` currently reads "Est. Tirupur".
3. **Social profiles.** Every entry in `SOCIAL` is `'#'`. Those links do nothing until real URLs go in.
4. **Prices.** The old pricing page's only plan was an SEO package, so `/pricing/` describes the engagement models from the FAQ and asks for a quote. Add real plans to `PLANS`.
5. **Blog.** The old site's only post was about digital marketing. The current article is rewritten around mobile and web applications from the site's own service copy. Review it or replace it in `BLOG`.
6. **Project details.** The old project pages list only client, duration, platform and a link, so the one-line descriptions are written from each client site's own title.
7. **Project images.** These are screenshots of the client sites. Tara Naturals uses its logo because its site's images didn't load in capture, and Paakhi Jewels has a plain card because its site was unreachable. The TechSolutions card is written from Rajesh Kumar's testimonial and uses a stock phone mockup.
8. **Testimonial photos.** Avatars show initials for now. Add `photo: 'file.jpg'` to a testimonial in `public/media/` once there is a real photo of that person.

## Moving it into the Laravel app

1. Copy `src/` to `resources/js/smartindia/` and `public/media/` to the Laravel `public/media/`.
2. In the Laravel project, run `npm install three lenis`.
3. Create one Blade view per page, using the built HTML in `dist/` as the starting markup, with the same URLs as routes. Replace the stylesheet and script tags with `@vite([...])` pointing at `styles.css`, `pages.css`, and `main.js` (home) or `page.js` (inner pages).
4. In Laravel's `vite.config.js`, set `build.target: 'es2022'`. The entry module uses top-level await.
5. **Forms:** this static site has no server, so the contact and booking forms open the visitor's email app, with Gmail and copy-message as fallbacks (`src/page.js`). Point them at the existing `contact/store` route so messages send directly from the page.
6. Redirect old addresses: `/services/seo`, `/services/social-media-marketing` and `/services/meta-google-ads` to `/services/`, and `/projects/details?id=…` to the matching `/projects/<project>/`.
7. Clarity (`xxhznt5zik`) and the Meta Pixel (`1062073803017574`) load only in production builds on `smartindia.digital` (`chrome.js`). Remove the old inline snippets from the layout so visits aren't counted twice.

`window.__site` is a debugging hook that exists only on the dev server's homepage. `__site.go(52)` jumps to the stone scene, for example.
