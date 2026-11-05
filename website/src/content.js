// Browser view of the site data (src/data.js): adds URLs that respect where the site is hosted (its base path).
import { HOME_WORK, PROJECTS, SERVICES } from './data.js';

export * from './data.js';

const BASE = import.meta.env.BASE_URL;
export const MEDIA = `${BASE}media/`;   // static images & audio (public/media)
export const href = path => `${BASE}${path}`;

export const SERVICE_CARDS = SERVICES.map(s => [s.titleBr, s.short, s.icon, href(`services/${s.slug}/`)]);
export const WORK = HOME_WORK.map(slug => {
  const p = PROJECTS.find(x => x.slug === slug);
  return { img: p.img, overlay: p.overlay, title: p.name, text: p.text, url: href(`projects/${p.slug}/`) };
});
