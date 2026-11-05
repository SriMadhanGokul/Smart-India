// All SMARTINDIA.DIGITAL content, kept apart from the motion code.

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
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${MARK.map(p => `<path d="M${p.map(([x, y]) => `${(o + x * s).toFixed(1)} ${(o - y * s).toFixed(1)}`).join(' L')} Z" fill="${fill}"/>`).join('')}</svg>`;
};

export const HERO = {
  line1: 'Designed to',
  fixed: 'grow your ',
  words: ['business.', 'brand.', 'reach.', 'impact.'],
  // [in, out] times of each rotating word (measured from the reference's blur-scramble rhythm)
  times: [[7.25, 10.15], [11.0, 13.4], [14.1, 16.65], [17.5, 99]],
  est: 'Est. Tirupur',
  years: '15+ years in<br>digital service.',
  blurb: 'Mobile and web applications and brands built for reach, growth and impact.',
  hold: 'Scroll to <span class="ic">✸</span> explore',
  dare: 'Dare <span class="ic">⚡</span> to grow your brand.',
};

export const ABOUT = {
  text: 'SMARTINDIA.DIGITAL is a creative digital agency crafting high-impact brand experiences through strategy, design, and technology.',
  left: 'Creativity meets strategy.<br>Design. Develop. Deliver.<br>Built to grow.',
  mission: 'Our mission is to help startups and established brands grow, with mobile and web applications that attract, engage and convert.',
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
  ['GreenGrocer', 'font-weight:500;letter-spacing:.06em;font-size:19px'],
  ['CHEN REAL ESTATE', 'font-weight:400;letter-spacing:.2em;font-size:13px'],
  ['Capterra ★ 4.8', 'font-weight:600'],
];
export const WORK = [
  { img: 'project1-1.jpg', overlay: 'Shop smarter.', title: 'E-Commerce Growth Platform', text: 'A custom e-commerce web application built to attract, engage and sell.' },
  { img: 'project1-2.jpg', overlay: 'Redesigned.', title: 'Brand & Website Redesign', text: 'A refreshed identity and a fast, modern website for a growing brand.' },
  { img: 'project1-3.jpg', overlay: 'Mobile first.', title: 'TechSolutions Mobile App', text: 'A seamless, user-friendly mobile app that earned amazing feedback from its customers.' },
];
export const SERVICES_WORDS = ['DESIGN', 'MOBILE & WEB', 'APPLICATION', 'DEVELOPMENT'];
export const SERVICES = [
  ['Mobile Application<br>Development', 'Powerful and intuitive mobile applications for iOS and Android with seamless user journeys.', 'phone'],
  ['Web Application<br>Development', 'Custom, scalable web applications built from scratch with modern technologies like Laravel and React.', 'webapp'],
  ['Website<br>Development', 'Custom, responsive, high-performance websites tailored to your business.', 'squares'],
  ['Graphic<br>Designing', 'Logos, posters and visual identities that capture your brand’s essence.', 'spiral'],
];
export const TESTIMONIAL = {
  clients: ['Chen Real Estate', 'FashionNova', 'TechSolutions'],
  active: 1,
  quote: 'SMARTINDIA.DIGITAL transformed our online presence completely. Our sales increased by 40% within the first three months of launching the new website.',
  name: 'Sarah Johnson', role: 'CEO, FashionNova', img: 'testi1-1.jpg',
};
export const RIBBON = ['about-1-1.jpg', 'T:2026', 'project1-1.jpg', 'video-1-1.jpg', 'object.png', 'T:SMART®', 'choose-us-1-1.jpg', 'project1-3.jpg', 'aihero.jpeg', 'T:DESIGN', 'contact-1-1.jpg', 'object3.png',
  'project1-2.jpg', 'news-1-1.jpg', 'object2.png', 'about-1-2.jpg', 'T:APPS', 'service-bg-1-1.jpg', 'T:CONVERT', 'team-bg-1-1.jpg', 'T:TIRUPUR', 'choose-us-1-1.jpg', 'object2.png', 'contact-1-1.jpg'];
