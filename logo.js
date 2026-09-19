/* logo.js — gerador SVG do monograma (iniciais dentro de uma forma) */
window.BP = window.BP || {};

BP.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
BP.cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
BP.fontMeta = n => BP.FONTS.find(f => f.n === n) || {n, c:'sans', w:'400'};
BP.fontFamily = n => { const f = BP.fontMeta(n); const fb = {serif:'Georgia, serif', mono:'ui-monospace, SFMono-Regular, Menlo, monospace'}[f.c] || 'system-ui, sans-serif'; return `"${n}", ${fb}`; };
BP.fontFamilySvg = n => BP.fontFamily(n).replace(/"/g, "'");
BP.caseText = (t, mode) => mode === 'upper' ? t.toUpperCase() : mode === 'lower' ? t.toLowerCase() : mode === 'mixed' ? BP.cap(t.toLowerCase()) : t;

BP.autoInitials = name => {
  const words = (name || '').replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).filter(w => w && !/^(de|da|do|e|&|the|of|and|studio|labs?|co)$/i.test(w));
  if (!words.length) return 'AB';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase().slice(0, 3);
};

/* contorno com lóbulos (selo ondulado) */
function lobePath(rBase, amp, lobes, N) {
  const pts = [];
  for (let i = 0; i < N; i++) { const t = (i / N) * Math.PI * 2; const r = rBase + amp * Math.cos(lobes * t); pts.push(`${(50 + r * Math.cos(t)).toFixed(2)} ${(50 + r * Math.sin(t)).toFixed(2)}`); }
  return 'M' + pts.join('L') + 'Z';
}
/* pontas alternando raio externo/interno (estrelas e selos pontudos) */
function starPoints(n, rOut, rIn, rot = -90) {
  const p = [];
  for (let i = 0; i < n * 2; i++) { const a = (rot + i * 180 / n) * Math.PI / 180; const r = i % 2 ? rIn : rOut; p.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`); }
  return p.join(' ');
}
const joined = (inner, fill, w) => `<g fill="${fill}" stroke="${fill}" stroke-width="${w}" stroke-linejoin="round">${inner}</g>`;

BP.shapeSVG = function (id, fill) {
  switch (id) {
    case 'circle': return `<circle cx="50" cy="50" r="50" fill="${fill}"/>`;
    case 'rounded': return `<rect width="100" height="100" rx="24" fill="${fill}"/>`;
    case 'squircle': return `<path d="M50 0C86 0 100 14 100 50C100 86 86 100 50 100C14 100 0 86 0 50C0 14 14 0 50 0Z" fill="${fill}"/>`;
    case 'notch': return `<path d="M26 3H82A15 15 0 0 1 97 18V82A15 15 0 0 1 82 97H18A15 15 0 0 1 3 82V26Z" fill="${fill}"/>`;
    case 'pill': return `<rect x="0" y="17" width="100" height="66" rx="33" fill="${fill}"/>`;
    case 'ticket': return `<path d="M6 14H94V40A10 10 0 0 0 94 60V86H6V60A10 10 0 0 0 6 40Z" fill="${fill}"/>`;
    case 'hex': return joined('<polygon points="50,5 90,27 90,73 50,95 10,73 10,27"/>', fill, 9);
    case 'pentagon': return joined('<polygon points="50,4 93.7,35.8 77,87.2 23,87.2 6.3,35.8"/>', fill, 10);
    case 'octagon': return joined('<polygon points="30,3 70,3 97,30 97,70 70,97 30,97 3,70 3,30"/>', fill, 6);
    case 'triangle': return joined('<polygon points="50,10 90,80 10,80"/>', fill, 14);
    case 'diamond': return `<rect x="16" y="16" width="68" height="68" rx="15" transform="rotate(45 50 50)" fill="${fill}"/>`;
    case 'cross': return `<path d="M37 3H63A11 11 0 0 1 74 14V26H86A11 11 0 0 1 97 37V63A11 11 0 0 1 86 74H74V86A11 11 0 0 1 63 97H37A11 11 0 0 1 26 86V74H14A11 11 0 0 1 3 63V37A11 11 0 0 1 14 26H26V14A11 11 0 0 1 37 3Z" fill="${fill}"/>`;
    case 'arch': return `<path d="M10 90V45A40 40 0 0 1 90 45V90A7 7 0 0 1 83 97H17A7 7 0 0 1 10 90Z" fill="${fill}"/>`;
    case 'shield': return joined('<path d="M50 3L93 17V50C93 74 74 90 50 97C26 90 7 74 7 50V17L50 3Z"/>', fill, 8);
    case 'drop': return `<path d="M50 3C50 3 86 42 86 62A36 36 0 0 1 14 62C14 42 50 3 50 3Z" fill="${fill}"/>`;
    case 'leaf': return `<path d="M0 45C0 20 20 0 45 0H100V55C100 80 80 100 55 100H0Z" fill="${fill}"/>`;
    case 'flower': return `<g fill="${fill}"><circle cx="50" cy="26" r="26"/><circle cx="74" cy="50" r="26"/><circle cx="50" cy="74" r="26"/><circle cx="26" cy="50" r="26"/><rect x="24" y="24" width="52" height="52" rx="10"/></g>`;
    case 'cloud': return `<g fill="${fill}"><circle cx="30" cy="56" r="22"/><circle cx="52" cy="42" r="28"/><circle cx="74" cy="56" r="20"/><rect x="8" y="54" width="84" height="26" rx="13"/></g>`;
    case 'blob': return `<path d="M56 3C77 1 99 20 98 47C97 70 86 96 58 98C31 100 2 86 3 56C4 26 30 5 56 3Z" fill="${fill}"/>`;
    case 'blob2': return `<path d="M63 5C84 11 99 30 95 52C91 74 96 89 72 95C48 101 22 93 11 74C0 55 5 29 23 15C37 4 48 1 63 5Z" fill="${fill}"/>`;
    case 'speech': return `<path d="M24 6H76A20 20 0 0 1 96 26V56A20 20 0 0 1 76 76H46L26 94V76H24A20 20 0 0 1 4 56V26A20 20 0 0 1 24 6Z" fill="${fill}"/>`;
    case 'bookmark': return `<path d="M16 2H84A10 10 0 0 1 94 12V94A4 4 0 0 1 87.6 97.2L50 70L12.4 97.2A4 4 0 0 1 6 94V12A10 10 0 0 1 16 2Z" fill="${fill}"/>`;
    case 'star': return joined(`<polygon points="${starPoints(5, 48, 26)}"/>`, fill, 9);
    case 'burst': return joined(`<polygon points="${starPoints(12, 48, 36)}"/>`, fill, 6);
    case 'seal': return joined(`<path d="${lobePath(45, 4.5, 12, 72)}"/>`, fill, 3);
    case 'spark': return `<path d="M50 0C54 32 68 46 100 50C68 54 54 68 50 100C46 68 32 54 0 50C32 46 46 32 50 0Z" fill="${fill}"/>`;
    case 'ring': return `<circle cx="50" cy="50" r="43" fill="none" stroke="${fill}" stroke-width="9"/>`;
    case 'ringSquare': return `<rect x="7" y="7" width="86" height="86" rx="24" fill="none" stroke="${fill}" stroke-width="9"/>`;
    default: return '';
  }
};

BP.logoSVG = function (s, o = {}) {
  const size = o.size || 120, variant = o.variant || 'color';
  const l = s.logo, c = s.colors;
  const col = {primary:c.primary, secondary:c.secondary, accent:c.accent, ink:c.ink, paper:c.paper};
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  const grad = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${c.gradientAngle - 45} .5 .5)"><stop offset="0" stop-color="${c.primary}"/><stop offset="1" stop-color="${c.secondary}"/></linearGradient></defs>`;
  let bg, fg, useGrad = false;
  if (variant === 'color') { useGrad = l.bg === 'gradient'; bg = useGrad ? `url(#${gid})` : col[l.bg]; fg = col[l.fg]; }
  else if (variant === 'mono') { bg = col.ink; fg = col.paper; }
  else if (variant === 'inverse') { bg = col.paper; fg = col.ink; }
  else { bg = '#ffffff'; fg = col.ink; }
  const hollow = l.shape === 'none' || BP.STROKE_SHAPES.includes(l.shape);
  if (hollow) {
    bg = variant === 'color' ? bg : variant === 'mono' ? col.ink : variant === 'inverse' ? col.paper : '#ffffff';
    fg = bg;
    if (l.shape === 'none' && variant === 'color' && l.fg === l.bg) fg = col.ink;
  }
  let detailColor = col.accent;
  if (l.bg === 'accent' || (l.shape === 'none' && l.bg === 'accent')) detailColor = col.secondary;
  if (variant !== 'color') detailColor = fg;
  const initials = BP.caseText(s.identity.initials || BP.autoInitials(s.identity.name), l.case);
  const meta = BP.SHAPES.find(x => x.id === l.shape) || {};
  const ts0 = l.size * (meta.sf || 1);
  const ts = ts0 * (initials.length >= 4 ? 0.56 : initials.length === 3 ? 0.72 : initials.length === 1 ? 1.15 : 1);
  const detail = l.detail && l.detail !== 'none' ? `<tspan fill="${detailColor}">${BP.esc(l.detail)}</tspan>` : '';
  const shape = l.shape === 'none' ? '' : `<g transform="rotate(${l.tilt || 0} 50 50)">${BP.shapeSVG(l.shape, bg)}</g>`;
  const text = `<text x="50" y="${50 + (l.yShift || 0) + (meta.dy || 0)}" text-anchor="middle" dominant-baseline="central" font-family="${BP.fontFamilySvg(l.font)}" font-weight="${l.weight}" font-size="${ts}" letter-spacing="${l.tracking}" fill="${fg}">${BP.esc(initials)}${detail}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" class="b-symbol" role="img" aria-label="${BP.esc(s.identity.name)}">${useGrad || (l.shape === 'none' && l.bg === 'gradient' && variant === 'color') ? grad : ''}${shape}${text}</svg>`;
};

/* lockup: símbolo + nome (nome em HTML pra usar a fonte via CSS) */
BP.lockup = function (s, o = {}) {
  const size = o.size || 36, lk = o.lockup || s.logo.lockup, variant = o.variant || 'color';
  const sym = BP.logoSVG(s, {size, variant});
  const name = BP.caseText(s.identity.name, s.logo.wordCase);
  const wordStyle = `font-family:${BP.fontFamily(s.logo.font)};font-weight:${s.logo.wordWeight};font-size:${(size * 0.6).toFixed(1)}px;letter-spacing:${(s.logo.tracking / 220).toFixed(3)}em;line-height:1;${s.logo.italic ? 'font-style:italic;' : ''}`;
  const colorStyle = o.color ? `color:${o.color}` : variant === 'color' ? 'color:var(--b-fg)' : variant === 'mono' ? 'color:var(--b-ink)' : variant === 'inverse' ? 'color:var(--b-paper)' : 'color:#fff';
  if (lk === 'symbol') return `<span class="b-lockup">${sym}</span>`;
  if (lk === 'wordmark') return `<span class="b-lockup" style="${colorStyle}"><span class="b-wordmark" style="${wordStyle}">${BP.esc(name)}</span></span>`;
  const v = lk === 'vertical';
  return `<span class="b-lockup ${v ? 'b-lockup-v' : ''}" style="gap:${Math.round(s.logo.gap * size / 36)}px;${colorStyle}">${sym}<span class="b-wordmark" style="${wordStyle}">${BP.esc(name)}</span></span>`;
};

/* ---- cor: utilidades ---- */
BP.hexToRgb = h => { h = (h || '#000').replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
BP.rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
BP.lum = h => { const [r, g, b] = BP.hexToRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
BP.contrast = (a, b) => { const l1 = BP.lum(a), l2 = BP.lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
BP.bestOn = (bg, a, b) => BP.contrast(bg, a) >= BP.contrast(bg, b) ? a : b;
BP.hexToHsl = h => { let [r, g, b] = BP.hexToRgb(h).map(v => v / 255); const max = Math.max(r, g, b), min = Math.min(r, g, b); let hh = 0, s = 0; const l = (max + min) / 2; if (max !== min) { const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: hh = (g - b) / d + (g < b ? 6 : 0); break; case g: hh = (b - r) / d + 2; break; default: hh = (r - g) / d + 4; } hh /= 6; } return [hh * 360, s * 100, l * 100]; };
BP.hslToHex = (h, s, l) => { h = ((h % 360) + 360) % 360 / 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100; let r, g, b; if (s === 0) r = g = b = l; else { const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = t => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }; r = f(h + 1 / 3); g = f(h); b = f(h - 1 / 3); } return BP.rgbToHex(r * 255, g * 255, b * 255); };
BP.badge = ratio => ratio >= 7 ? ['AAA', 'aaa'] : ratio >= 4.5 ? ['AA', 'aa'] : ratio >= 3 ? ['AA grande', 'lg'] : ['Falha', 'fail'];

/* mistura sRGB simples (aproxima color-mix) */
BP.mix = (a, b, t) => { const A = BP.hexToRgb(a), B = BP.hexToRgb(b); return BP.rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
/* aproxima `fg` até atingir contraste mínimo contra `bg`, preservando matiz */
BP.readable = (fg, bg, min = 4.5) => {
  if (BP.contrast(fg, bg) >= min) return fg;
  const [h, s, l0] = BP.hexToHsl(fg);
  const dir = BP.lum(bg) > 0.42 ? -1 : 1;
  let best = fg, bestC = BP.contrast(fg, bg);
  for (let i = 1; i <= 20; i++) {
    const l = l0 + dir * i * 5;
    if (l < 0 || l > 100) break;
    const cand = BP.hslToHex(h, s, l);
    const c = BP.contrast(cand, bg);
    if (c > bestC) { bestC = c; best = cand; }
    if (c >= min) return cand;
  }
  return best;
};

BP.harmony = (primary, mode) => {
  const [h, s, l] = BP.hexToHsl(primary);
  const S = Math.max(35, Math.min(70, s)), L = Math.max(42, Math.min(62, l));
  const paper = BP.hslToHex(h, Math.min(40, s), 97.5), ink = BP.hslToHex(h, Math.min(25, s), 15);
  switch (mode) {
    case 'analog': return {primary, secondary: BP.hslToHex(h + 35, S, L + 8), accent: BP.hslToHex(h - 35, S + 10, 78), paper, ink};
    case 'comp': return {primary, secondary: BP.hslToHex(h + 180, S, L + 6), accent: BP.hslToHex(h + 150, S + 5, 80), paper, ink};
    case 'triad': return {primary, secondary: BP.hslToHex(h + 120, S, L + 6), accent: BP.hslToHex(h + 240, S, 78), paper, ink};
    default: return {primary, secondary: BP.hslToHex(h + 25, S - 15, L + 22), accent: BP.hslToHex(h + 200, S - 10, 84), paper, ink};
  }
};
