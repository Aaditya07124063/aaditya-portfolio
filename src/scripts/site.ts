import Lenis from 'lenis';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)] as T[];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function ready() { root.classList.add('ready'); }

function loader() {
 const el = document.querySelector<HTMLElement>('.loader');
 if (!el || root.classList.contains('seen')) { el?.remove(); requestAnimationFrame(ready); return; }
 const bar = el.querySelector<HTMLElement>('[data-loader-bar]')!;
 const count = el.querySelector<HTMLElement>('[data-loader-count]')!;
 const start = performance.now(), dur = 1500;
 const tick = (t: number) => {
  const p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
  const n = Math.round(e * 20);
  bar.textContent = '█'.repeat(n) + '░'.repeat(20 - n);
  count.textContent = String(Math.round(e * 100)).padStart(3, '0');
  if (p < 1) return requestAnimationFrame(tick);
  el.classList.add('done');
  try { sessionStorage.setItem('aa-seen', '1'); } catch {}
  setTimeout(ready, 350);
  setTimeout(() => el.remove(), 1300);
 };
 requestAnimationFrame(tick);
}

function split() {
 $$('[data-split]').forEach(el => {
  let i = 0;
  const walk = (node: Node) => {
   [...node.childNodes].forEach(child => {
    if (child.nodeType === 3) {
     const frag = document.createDocumentFragment();
     child.textContent!.split(/(\s+)/).forEach(w => {
      if (!w) return;
      if (/^\s+$/.test(w)) return frag.append(w);
      const outer = document.createElement('span'); outer.className = 'w';
      const inner = document.createElement('span'); inner.textContent = w; inner.style.setProperty('--i', String(i++));
      outer.append(inner); frag.append(outer);
     });
     child.replaceWith(frag);
    } else if (child instanceof HTMLElement && !child.classList.contains('hand')) {
     child.style.setProperty('--i', String(i++)); child.classList.add('w-el');
    }
   });
  };
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent!.trim());
  walk(el);
  $$('.w', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
 });
}

function reveal() {
 const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target as HTMLElement;
  el.classList.add('in');
  io.unobserve(el);
 }), {rootMargin: '0px 0px -12% 0px'});
 $$('[data-reveal],[data-split],.draw,.sketch,.card').forEach(el => io.observe(el));
}

function cursor() {
 const c = document.querySelector<HTMLElement>('.cursor');
 if (!c || !fine || reduce) { c?.remove(); return; }
 root.classList.add('has-cursor');
 const dot = c.querySelector<HTMLElement>('.cursor-dot')!, ring = c.querySelector<HTMLElement>('.cursor-ring')!, label = c.querySelector<HTMLElement>('[data-cursor-label]')!;
 let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
 addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate3d(${mx}px,${my}px,0)`; }, {passive: true});
 document.addEventListener('pointerover', e => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('a,button,[data-cursor],.key');
  c.classList.toggle('hover', !!t);
  const text = t?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? '';
  label.textContent = text; c.classList.toggle('label', !!text);
 });
 document.addEventListener('pointerdown', () => c.classList.add('down'));
 document.addEventListener('pointerup', () => c.classList.remove('down'));
 document.addEventListener('pointerleave', () => c.classList.add('gone'));
 document.addEventListener('pointerenter', () => c.classList.remove('gone'));
 const loop = () => { rx = lerp(rx, mx, .18); ry = lerp(ry, my, .18); ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); };
 loop();
 $$('[data-magnetic]').forEach(el => {
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px,${(e.clientY - r.top - r.height / 2) * .4}px)`; });
  el.addEventListener('pointerleave', () => el.style.transform = '');
 });
}

function wave() {
 const el = document.querySelector<HTMLElement>('[data-wave]');
 if (!el) return;
 const chars = ' .-~=≈';
 let visible = false, t = 0, last = 0;
 const n = () => Math.ceil(innerWidth / 8);
 const draw = () => {
  const len = n(), lines: string[] = [];
  for (let r = 0; r < 4; r++) { let s = ''; for (let i = 0; i < len; i++) { const v = Math.sin(i * .09 + t + r * .7) * .5 + Math.sin(i * .031 - t * .6) * .5; s += chars[Math.max(0, Math.min(chars.length - 1, Math.floor((v + 1) / 2 * chars.length + r - 1.5)))]; } lines.push(s); }
  el.textContent = lines.join('\n');
 };
 draw();
 if (reduce) return;
 new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(el);
 const loop = (now: number) => { requestAnimationFrame(loop); if (!visible || now - last < 50) return; last = now; t += .12; draw(); };
 requestAnimationFrame(loop);
}

function preview() {
 const box = document.querySelector<HTMLElement>('.preview');
 if (!box || !fine) return;
 let x = 0, y = 0, px = 0, py = 0, on = false;
 $$('[data-preview]').forEach(row => {
  row.addEventListener('pointerenter', () => {
   on = true; box.classList.add('on');
   $$('.preview-item', box).forEach(p => { const m = p.dataset.previewFor === row.dataset.preview; p.classList.toggle('on', m); if (m) p.querySelector('.sketch')?.classList.add('in'); });
  });
  row.addEventListener('pointerleave', () => { on = false; box.classList.remove('on'); });
 });
 addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, {passive: true});
 const loop = () => { px = lerp(px, x, .12); py = lerp(py, y, .12); box.style.transform = `translate3d(${px + 28}px,${py - 120}px,0) rotate(${on ? (x - px) * .05 : 0}deg)`; requestAnimationFrame(loop); };
 loop();
}

function toc() {
 const links = $$<HTMLAnchorElement>('[data-toc]');
 const bar = document.querySelector<HTMLElement>('.progress');
 const heads = links.map(l => document.getElementById(l.dataset.toc!)).filter(Boolean) as HTMLElement[];
 return () => {
  if (bar) { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; }
  let active = heads[0]?.id;
  heads.forEach(h => { if (h.getBoundingClientRect().top < innerHeight * .3) active = h.id; });
  links.forEach(l => l.classList.toggle('on', l.dataset.toc === active));
 };
}

function chrome(lenis: Lenis | null) {
 const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
 const header = document.querySelector<HTMLElement>('.site-header');
 toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.sr')!.textContent = open ? 'Close menu' : 'Open menu';
  root.classList.toggle('menu-open', open);
  open ? lenis?.stop() : lenis?.start();
 });
 addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('menu-open')) toggle?.click(); });
 document.querySelector('[data-to-top]')?.addEventListener('click', () => lenis ? lenis.scrollTo(0, {duration: 1.6}) : scrollTo({top: 0, behavior: reduce ? 'auto' : 'smooth'}));
 let lastY = 0;
 return (y: number) => { header?.classList.toggle('scrolled', y > 40); header?.classList.toggle('hide', y > lastY && y > 400 && !root.classList.contains('menu-open')); lastY = y; };
}

function stack() {
 const cards = $$('.card');
 return () => cards.forEach((c, i) => {
  const next = cards[i + 1]; if (!next) return;
  const r = next.getBoundingClientRect(), top = c.getBoundingClientRect().top;
  const p = Math.min(1, Math.max(0, 1 - (r.top - top) / (innerHeight * .7)));
  c.style.setProperty('--s', String(1 - p * .06)); c.style.setProperty('--b', String(p));
 });
}

loader();
split();
reveal();
cursor();
wave();
preview();
const lenis = reduce ? null : new Lenis({duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), anchors: true});
const onScroll = [toc(), chrome(lenis), stack()];
if (lenis) {
 lenis.on('scroll', (l: Lenis) => onScroll.forEach(f => f(l.scroll)));
 const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
 requestAnimationFrame(raf);
} else {
 addEventListener('scroll', () => onScroll.forEach(f => f(scrollY)), {passive: true});
}
onScroll.forEach(f => f(scrollY));
