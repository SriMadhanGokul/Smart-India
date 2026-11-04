// SMARTINDIA.DIGITAL site content. Copy lives here so the motion code stays content-agnostic.

// The S mark: three beams forming a squared "S" (top L, middle bar, bottom L), in mark units (~±1.2).
export const MARK = [
  [[-1, 1.2], [1.1, 1.2], [.9, .86], [-.66, .86], [-.66, .22], [-1, .02]],
  [[-.58, .17], [.76, .17], [.58, -.17], [-.76, -.17]],
  [[1, -1.2], [-1.1, -1.2], [-.9, -.86], [.66, -.86], [.66, -.22], [1, -.02]],
];
// Chisel paths used to draw each piece onto the stone (centre lines, in drawing order).
export const MARK_PATHS = [
  [[1.0, 1.03], [-.83, 1.03], [-.83, .1]],
  [[-.76, 0], [.76, 0]],
  [[-1.0, -1.03], [.83, -1.03], [.83, -.1]],
];
export const markSVG = (size, fill) => {
  const s = size / 2.6, o = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">${MARK.map(p => `<path d="M${p.map(([x, y]) => `${(o + x * s).toFixed(1)} ${(o - y * s).toFixed(1)}`).join(' L')} Z" fill="${fill}"/>`).join('')}</svg>`;
};

export const SITE = 'https://smartindia.digital';
export const MEDIA = '/media/';   // static images & audio (public/media)
export const CONTACT = {
  email: 'info@smartindia.ai', phone: '+91 99949 00470', tel: '+919994900470',
  city: 'Tirupur, Tamil Nadu, India', hours: 'Mon – Sat 8:00 – 6:30', contactUrl: 'https://smartindia.digital/contact',
};
export const NAV = [
  ['Home', SITE], ['About', `${SITE}/about`], ['Services', `${SITE}/services`], ['Portfolio', `${SITE}/projects`],
  ['Team', `${SITE}/team`], ['Pricing', `${SITE}/pricing`], ['Testimonials', `${SITE}/testimonials`], ['FAQ', `${SITE}/faq`],
  ['Blogs', `${SITE}/blogs`], ['Contact', `${SITE}/contact`],
];
// The client's existing site has no social URLs yet ("#"); fill these in when available.
export const SOCIAL = [['Instagram', '#'], ['Facebook', '#'], ['LinkedIn', '#'], ['Twitter', '#']];

export const HERO = {
  line1: 'Designed to',
  fixed: 'grow your ',
  words: ['business.', 'brand.', 'reach.', 'impact.'],
  est: 'Est. Tirupur',
  years: '15+ years in<br>digital service.',
  blurb: 'Websites, apps, SEO, ads and brands built for reach, growth and impact.',
  hold: 'Scroll to <span class="ic">✸</span> explore',
  dare: 'Dare <span class="ic">⚡</span> to grow your brand.',
};
export const ABOUT = {
  text: 'SMARTINDIA.DIGITAL is a creative digital agency crafting high-impact brand experiences through strategy, design, and technology.',
  left: 'Creativity meets strategy.<br>Design. Develop. Deliver.<br>Built to grow.',
  mission: 'Our mission is to help startups and established brands grow, with websites, apps and campaigns that attract, engage and convert.',
  focus: 'Tailored solutions.<br>Seamless execution.',
};
export const MARQUEE = ['DESIGN', 'DEVELOP', 'DELIVER'];
export const LOADER_LABELS = ['Inspire', 'Innovate', 'Impact'];

export const FACTS = [
  { label: 'Satisfied clients', text: 'Clients returning to us<br>again and again.', value: 92, suffix: '%', img: 'about-1-1.jpg' },
  { label: 'Happy customers', text: '4.8/5 average rating from<br>5k+ customer reviews.', value: 300, suffix: '+' },
  { label: 'Years in digital service', text: 'Different skills.<br>One standard.', value: 15, suffix: '+', img: 'choose-us-1-1.jpg' },
];
export const CLIENTS = [
  ['FashionNova', 'font-family:Georgia,serif;font-style:italic;font-weight:700'],
  ['TechSolutions', 'font-weight:700;letter-spacing:-.04em'],
  ['GreenGrocer', 'font-weight:500;letter-spacing:.06em;font-size:.9em'],
  ['CHEN REAL ESTATE', 'font-weight:400;letter-spacing:.2em;font-size:.62em'],
  ['Capterra ★ 4.8', 'font-weight:600'],
];
export const WORK = [
  { img: 'project1-1.jpg', overlay: 'Shop smarter.', title: 'E-Commerce Growth Platform', text: 'A conversion-focused online store built to attract, engage and sell.', url: `${SITE}/projects/details` },
  { img: 'project1-2.jpg', overlay: 'Redesigned.', title: 'Brand & Website Redesign', text: 'A refreshed identity and a fast, modern website for a growing brand.', url: `${SITE}/projects/details` },
  { img: 'project1-3.jpg', overlay: 'Rank #1.', title: 'Local Business SEO Campaign', text: 'On-page, off-page and local SEO that put a local business on the map.', url: `${SITE}/projects/details` },
];
export const SERVICES_WORDS = ['SEO', 'DESIGN', 'DEVELOPMENT', 'MARKETING'];
export const SERVICES = [
  ['Social Media<br>Marketing', 'Strategic campaigns that grow engagement and brand presence on every platform.', 'rings', `${SITE}/services/social-media-marketing`],
  ['Web<br>Development', 'Custom, responsive, high-performance websites tailored to your business.', 'squares', `${SITE}/services/web-development`],
  ['App<br>Development', 'Intuitive iOS and Android apps that deliver seamless user journeys.', 'phone', `${SITE}/services/app-development`],
  ['SEO', 'On-page, off-page and local SEO strategies that lift your rankings.', 'bars', `${SITE}/services/seo`],
  ['Meta &amp; Google<br>Ads', 'Highly targeted campaigns that maximise your return on ad spend.', 'target', `${SITE}/services/meta-google-ads`],
  ['Graphic<br>Designing', 'Logos, posters and visual identities that capture your brand’s essence.', 'spiral', `${SITE}/services/graphic-designing`],
];
// Testimonials from the client's current site. Avatars show initials; add `photo: 'file.jpg'` (in public/media)
// once the client supplies a real photo of that person.
export const TESTIMONIALS = [
  { client: 'FashionNova', name: 'Sarah Johnson', role: 'CEO, FashionNova', quote: 'SMARTINDIA.DIGITAL transformed our online presence completely. Our sales increased by 40% within the first three months of launching the new website.' },
  { client: 'TechSolutions', name: 'Rajesh Kumar', role: 'Founder, TechSolutions', quote: 'The mobile app they developed for us is seamless and user-friendly. We’ve received amazing feedback from our customers.' },
  { client: 'GreenGrocer', name: 'Amanda Lee', role: 'Marketing Manager, GreenGrocer', quote: 'Their SEO and Meta Ads strategies are top-notch. We now rank on the first page for our target keywords, and our cost per acquisition has dropped significantly.' },
  { client: 'Chen Real Estate', name: 'Michael Chen', role: 'Owner, Chen Real Estate', quote: 'The branding and graphic design work perfectly captured the luxury feel we wanted for our property listings. Professional, creative and fast.' },
];
export const RIBBON = ['about-1-1.jpg', 'T:2026', 'project1-1.jpg', 'video-1-1.jpg', 'object.png', 'T:SMART®', 'choose-us-1-1.jpg', 'project1-3.jpg', 'aihero.jpeg', 'T:DESIGN', 'contact-1-1.jpg', 'object3.png',
  'project1-2.jpg', 'news-1-1.jpg', 'object2.png', 'about-1-2.jpg', 'T:SEARCH', 'service-bg-1-1.jpg', 'T:CONVERT', 'team-bg-1-1.jpg', 'T:TIRUPUR', 'choose-us-1-1.jpg', 'object2.png', 'contact-1-1.jpg'];
export const FOOTER = {
  kicker: 'Let’s build what inspires.',
  heading: 'Ready to build something bold?',
};
