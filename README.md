# Smart India — 3D website and promo video

| Folder | What it is |
|---|---|
| [`website/`](website/) | The SMARTINDIA.DIGITAL homepage. It's a Vite app with a scroll-driven 3D story on desktop and a stacked layout for mobile. See [`website/README.md`](website/README.md). |
| [`video2/`](video2/) | Source and renderer for the approved 76-second promo video. The scenes are HTML/WebGL, rendered frame by frame in headless Chrome and encoded with ffmpeg. |
| [`video/`](video/) | The first, vertical promo draft. It has been superseded by `video2/`. |

## Quick start (website)

```bash
cd website
npm install
npm run dev        # http://localhost:5179
npm run build      # production files in website/dist
```

Rendered videos (`*.mp4`), dependencies and build output are not committed.
