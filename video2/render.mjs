// Renders index.html frame-by-frame in headless Chrome and encodes an MP4.
//   node render.mjs                      -> full video (out/smartindia-3d-promo.mp4)
//   node render.mjs --stills 3,15,40     -> PNG stills in out/stills/
//   node render.mjs --from 10 --to 20    -> partial render
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FFMPEG = process.env.FFMPEG ||
  'C:/Users/ASUS/AppData/Local/Programs/Python/Python313/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FPS = 30;

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) =>
  v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a, []));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(5178, r));

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
});
const page = await browser.newPage();
page.on('console', m => m.type() === 'error' && console.error('[page]', m.text()));
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.setViewport({ width: 1920, height: 868, deviceScaleFactor: 1 });
await page.goto('http://localhost:5178/index.html', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.ready === true', { timeout: 240000 });
const duration = await page.evaluate('window.DURATION');
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });

if (args.stills) {
  fs.mkdirSync(path.join(ROOT, 'out/stills'), { recursive: true });
  for (const s of String(args.stills).split(',')) {
    await page.evaluate(t => window.renderAt(t), +s);
    await page.screenshot({ path: path.join(ROOT, `out/stills/t${s}.png`) });
    console.log('still', s);
  }
} else {
  const from = +(args.from || 0), to = +(args.to || duration);
  const out = path.join(ROOT, args.out || 'out/video-silent.mp4');
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round((to - from) * FPS);
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.renderAt(t), from + f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`frame ${f}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
server.close();
