export const icons: Record<string, string[]> = {
 phone: ['~M18 9h12v26H18z', 'M16 5c5-1.6 12-1.5 17 .2 1.5 10 1.3 27 .1 37.4-5 1.4-12 1.5-17 .1-1.5-10.4-1.4-27.4-.1-37.7z', 'M21 9.5h6', 'M22.5 39h3'],
 towerOff: ['M24 12v30', 'M24 12 15 43', 'M24 12l9.5 31', 'M18 31h12', 'M14 6c-4 5-4 11 0 15', 'M34 6c4 5 4 11 0 15', 'M5 5c12 12 26 26 38 38'],
 chart: ['M6 4c-.5 13-.4 26 0 38 12 .5 24 .4 37 0', '~M12 23h5v8h-5z', 'M14.5 18v18', 'M12 23h5v8h-5z', '~M22 15h5v10h-5z', 'M24.5 10v20', 'M22 15h5v10h-5z', '~M32 9h5v8h-5z', 'M34.5 5v16', 'M32 9h5v8h-5z'],
 spark: ['~M28 4 12 26h12l-4 18 16-24H24z', 'M28 4 12 26h12l-4 18 16-24H24z'],
 clock: ['M24 5c11 0 19 8 19 19s-8 19-19 19S5 35 5 24 13 5 24 5z', 'M24 13v11l7 5'],
 coin: ['~M24 7c9 0 17 7.5 17 17s-8 17-17 17S7 33.5 7 24 15 7 24 7z', 'M24 7c9 0 17 7.5 17 17s-8 17-17 17S7 33.5 7 24 15 7 24 7z', 'M24 14v20', 'M29 18c-2-3-10-3-10 1.5S29 23 29 27.5 21 32 19 29'],
 scale: ['M24 7v33', 'M15 42c6-.6 12-.6 18 0', 'M7 13c11-1.5 23-1.5 34 0', 'M7 13 2 27', 'M7 13l5 14', 'M41 13l-5 14', 'M41 13l5 14', '~M1 27c2 6 11 6 12 0z', 'M1 27c2 6 11 6 12 0z', 'M35 27c2 6 11 6 12 0z'],
 scan: ['~M17 24c2-4 9-6 14-2-2 4-9 5-14 2z', 'M7 24c0-11 7.5-17 17-17s17 6 17 17-7.5 17-17 17S7 35 7 24z', 'M17 24c2-4 9-6 14-2-2 4-9 5-14 2z', 'M21 34c1-2.5 5-2.5 6 0-1 2.4-5 2.4-6 0z', 'M13 16c3-3 6-4 9-4'],
 wave: ['M3 24c3 0 3-10 6-10s3 18 6 18 3-24 6-24 3 30 6 30 3-15 6-15 3 7 6 7 3-4 5-4'],
 funnel: ['~M7 8c11-1 23-1 34 0L28 24v13l-8 5V24z', 'M7 8c11-1 23-1 34 0L28 24v13l-8 5V24z'],
 person: ['M24 7c4.5 0 7.5 3.4 7.5 7.6S28.5 22 24 22s-7.5-3-7.5-7.4S19.5 7 24 7z', 'M9 43c1-9 7-15 15-15s14 6 15 15'],
 server: ['~M8 9c10-1.6 22-1.6 32 0v11c-10 1.5-22 1.5-32 0z', 'M8 9c10-1.6 22-1.6 32 0v11c-10 1.5-22 1.5-32 0z', 'M8 27c10-1.5 22-1.5 32 0v11c-10 1.5-22 1.5-32 0z', 'M14 14.5h.1', 'M14 32.5h.1', 'M30 14.5h5', 'M30 32.5h5'],
 db: ['~M10 11c0-5.5 28-5.5 28 0s-28 5.5-28 0z', 'M10 11c0-5.5 28-5.5 28 0s-28 5.5-28 0z', 'M10 11v25c0 5.5 28 5.5 28 0V11', 'M10 23.5c0 5.5 28 5.5 28 0'],
 dice: ['~M8 8c10-1.8 22-1.8 32 0 1.8 10 1.8 22 0 32-10 1.8-22 1.8-32 0-1.8-10-1.8-22 0-32z', 'M8 8c10-1.8 22-1.8 32 0 1.8 10 1.8 22 0 32-10 1.8-22 1.8-32 0-1.8-10-1.8-22 0-32z', 'M16 16h.1', 'M24 24h.1', 'M32 32h.1'],
 crown: ['~M6 36 3 12l11 9 10-14 10 14 11-9-3 24c-12 1.5-24 1.5-36 0z', 'M6 36 3 12l11 9 10-14 10 14 11-9-3 24c-12 1.5-24 1.5-36 0z'],
 star: ['M24 4c1 9 4 12 13 13-9 1-12 4-13 13-1-9-4-12-13-13 9-1 12-4 13-13z']
};

let k = 0;
const ink = (d: string) => d.startsWith('~') ? `<path class="tint" d="${d.slice(1)}"/>` : `<path class="ink" d="${d}" pathLength="1" style="--i:${k++ % 14}"/>`;
export const icon = (n: string, x: number, y: number, s = 1, cls = '') => `<g class="ic ${cls}" transform="translate(${x} ${y}) scale(${s})" style="--sw:${(2.2 / s).toFixed(2)}">${icons[n].map(ink).join('')}</g>`;
export const draw = (d: string, cls = '') => `<path class="ink ${cls}" d="${d}" pathLength="1" style="--i:${k++ % 14}"/>`;
export const tint = (d: string, cls = '') => `<path class="tint ${cls}" d="${d}"/>`;
export const flow = (d: string, cls = '') => `<path class="flow ${cls}" d="${d}" marker-end="url(#ah)"/>`;
export const link = (d: string) => `<path class="flow still" d="${d}"/>`;
export const label = (x: number, y: number, t: string, cls = '', a = 'middle') => `<text class="lab ${cls}" x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
export const box = (x: number, y: number, w: number, h: number) => `M${x} ${y + 2}c${w * .3}-3 ${w * .7}-2 ${w} 0 ${2} ${h * .35} ${1} ${h * .7}-1 ${h} -${w * .35} 2-${w * .7} 1.5-${w}-.5c-1.5-${h * .3}-1.8-${h * .7} 1-${h - 2}z`;
export const jag = (x0: number, x1: number, y: number, seed = 3) => {
 let d = `M${x0} ${y}`, s = seed;
 for (let x = x0 + 6; x <= x1; x += 6) { s = (s * 9301 + 49297) % 233280; d += `L${x} ${(y + (s / 233280 - .5) * 34 * (Math.sin(x * .05) * .5 + .7)).toFixed(1)}`; }
 return d;
};
export const sine = (x0: number, x1: number, y: number, amp = 10, per = 36) => {
 let d = `M${x0} ${y}`;
 for (let x = x0; x < x1; x += per / 2) d += `q${per / 4} ${(((x - x0) / (per / 2)) % 2 ? amp : -amp) * 2} ${per / 2} 0`;
 return d;
};
