#!/usr/bin/env node
// build-split-page.mjs — the discussion page of ideas/12 (a rotor larger than the printer bed): the pictures are drawn from the
// KATAK core's own geometry (the blade surface, sideView), so the page cannot drift from the generator. RU — the owner reads it.
//
//   node design/split/build-split-page.mjs      → design/split/split-options.html
//
// Self-contained page (HOUSE_RULES R7 spirit, KAIF explanation-page template): inline SVG, no request leaves the machine. [NOT-TESTED]
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('kalculator/index.html', 'utf8');
const core = html.split('// ===== CORE-BEGIN')[1].split('// ===== CORE-END')[0];
const ctx = {}; vm.createContext(ctx);
vm.runInContext(core.slice(core.indexOf('\n')) + '\nglobalThis.KATAK = KATAK;', ctx);
const K = ctx.KATAK;

const BED = 220, BEDZ = 250, MARGIN = 5, RCUT = BED / 2 - MARGIN;
const COLORS = ['#FF1A8C', '#4ADE80', '#60A5FA'];
const base = { wall_mm: 2, layer_mm: 0.2, bearing_od_mm: 22, bore_mm: 8 };

function model(D) {
  const geo = K.resolve({ ...base, diameter_mm: D }), p = geo.p, R = D / 2, rh = p.hub_od_mm / 2, Ls = p.ld * D;
  const S = (k, u, v) => {
    const th = 2 * Math.PI * k / p.blades + p.hand * 2 * Math.PI * p.turns * u;
    const ro = rh + (R - rh) * u, zo = Ls * u, zh = zo - (ro - rh) / Math.tan(K.alphaAt(p, u));
    const r = rh + v * (ro - rh);
    return [r * Math.cos(th), r * Math.sin(th), zh + v * (zo - zh)];
  };
  return { D, R, rh, Ls, p, S, uc: Math.min(1, (RCUT - rh) / (R - rh)) };
}
const minRect = (pts) => { let best = null; for (let a = 0; a < 180; a += 1) { const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pts) { const X = x * c + y * s, Y = -x * s + y * c; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
  const big = Math.max(x1 - x0, y1 - y0); if (!best || big < best.big) best = { big, small: Math.min(x1 - x0, y1 - y0) }; } return best; };

// the skirt piece k·(segment s of n): sampled surface points beyond r_cut
function skirtPts(m, k, s, n) {
  const pts = [], ua = m.uc + (1 - m.uc) * s / n, ub = m.uc + (1 - m.uc) * (s + 1) / n;
  for (let i = 0; i <= 40; i++) { const u = ua + (ub - ua) * i / 40, ro = m.rh + (m.R - m.rh) * u, vc = (RCUT - m.rh) / (ro - m.rh);
    for (let j = 0; j <= 8; j++) pts.push(m.S(k, u, vc + (1 - vc) * j / 8)); }
  return pts;
}
// the outline of a skirt piece in the top view: the cut curve forward, the outer edge back
function skirtOutline(m, k, s, n) {
  const ua = m.uc + (1 - m.uc) * s / n, ub = m.uc + (1 - m.uc) * (s + 1) / n, cut = [], edge = [];
  for (let i = 0; i <= 40; i++) { const u = ua + (ub - ua) * i / 40, ro = m.rh + (m.R - m.rh) * u, vc = (RCUT - m.rh) / (ro - m.rh);
    cut.push(m.S(k, u, vc)); edge.push(m.S(k, u, 1)); }
  return [...cut, ...edge.reverse()];
}

// ---- the numbers table
const rows = [];
for (const D of [220, 250, 260, 300, 340, 400, 500]) {
  const m = model(D), coreH = m.Ls + 16, floors = Math.ceil(coreH / BEDZ);
  // the whole rotor first: the real mesh of the core, upright, against the bed
  const whole = K.bounds(K.build({ ...base, diameter_mm: D, detail: 'low' }).parts.rotor).size;
  if (Math.max(whole[0], whole[1]) <= BED && whole[2] <= BEDZ) {
    rows.push({ D, L: Math.round(m.Ls), coreH: Math.round(whole[2]), floors: 1, wrap: 0, segs: 0, piece: null, parts: 1, whole: true }); continue;
  }
  let segs = 0, piece = null;
  if (m.uc < 1) for (const n of [1, 2, 3, 4]) { let worst = null; for (let s = 0; s < n; s++) { const pts = skirtPts(m, 0, s, n); const r = minRect(pts.map((q) => [q[0], q[1]]));
      r.h = Math.max(...pts.map((q) => q[2])) - Math.min(...pts.map((q) => q[2])); if (!worst || r.big > worst.big) worst = r; }
    if (worst.big <= BED && worst.h <= BEDZ) { segs = n; piece = worst; break; } }
  const wrap = m.uc < 1 ? Math.round(360 * (1 - m.uc)) : 0;
  rows.push({ D, L: Math.round(m.Ls), coreH: Math.round(coreH), floors, wrap, segs, piece, parts: floors + 3 * segs });
}

// ---- picture 1: the top view of D 400 — three blades, the cut circle, skirts in 2 segments, the Ender bed to scale
function topView(D, n) {
  const m = model(D), W = 460, sc = (W / 2 - 20) / m.R, X = (q) => (W / 2 + q[0] * sc).toFixed(1), Y = (q) => (W / 2 - q[1] * sc).toFixed(1);
  let svg = `<svg viewBox="0 0 ${W} ${W}" class="pic" role="img">`;
  svg += `<rect x="${W / 2 - BED / 2 * sc}" y="${W / 2 - BED / 2 * sc}" width="${BED * sc}" height="${BED * sc}" fill="none" stroke="#FBBF24" stroke-width="1.5" stroke-dasharray="6 4"/>`;
  svg += `<text x="${W / 2 - BED / 2 * sc + 4}" y="${W / 2 - BED / 2 * sc - 6}" fill="#FBBF24">стол Ender 3 · 220 × 220 мм</text>`;
  for (let k = 0; k < 3; k++) for (let s = 0; s < n; s++) {
    const o = skirtOutline(m, k, s, n);
    svg += `<path d="M${o.map((q) => `${X(q)} ${Y(q)}`).join(' L')} Z" fill="${COLORS[k]}" fill-opacity="${s % 2 ? 0.35 : 0.6}" stroke="${COLORS[k]}" stroke-width="1"/>`;
  }
  for (let k = 0; k < 3; k++) { const e = []; for (let i = 0; i <= 120; i++) { const u = 0.02 + 0.98 * i / 120; e.push(m.S(k, u, 1)); }
    svg += `<path d="M${e.map((q) => `${X(q)} ${Y(q)}`).join(' L')}" fill="none" stroke="#F4EEF2" stroke-width="1.2"/>`; }
  svg += `<circle cx="${W / 2}" cy="${W / 2}" r="${RCUT * sc}" fill="none" stroke="#F4EEF2" stroke-width="2" stroke-dasharray="3 3"/>`;
  svg += `<text x="${W / 2 + RCUT * sc * 0.72}" y="${W / 2 + RCUT * sc * 0.72 + 14}" fill="#F4EEF2">разрез r = ${RCUT} мм</text>`;
  svg += `<circle cx="${W / 2}" cy="${W / 2}" r="${m.rh * sc}" fill="#3A2633" stroke="#A99AA3"/>`;
  return svg + '</svg>';
}
// ---- picture 2: the side view of D 400 — the rotor envelope, the core floors, the Ender build height
function sideView(D) {
  const m = model(D), sv = K.sideView({ ...base, diameter_mm: D }), W = 460, H = 460, sc = (H - 60) / Math.max(m.Ls + 30, 2 * m.R);
  const ox = W / 2, oy = H - 30, X = (r) => (ox + r * sc).toFixed(1), Y = (z) => (oy - z * sc).toFixed(1);
  let svg = `<svg viewBox="0 0 ${W} ${H}" class="pic" role="img">`;
  svg += `<rect x="${ox - BED / 2 * sc}" y="${oy - BEDZ * sc}" width="${BED * sc}" height="${BEDZ * sc}" fill="none" stroke="#FBBF24" stroke-width="1.5" stroke-dasharray="6 4"/>`;
  svg += `<text x="${ox - BED / 2 * sc + 4}" y="${oy - BEDZ * sc - 6}" fill="#FBBF24">Ender 3: 220 мм × высота 250 мм</text>`;
  const env = sv.env;   // [z, r] pairs, z from the nose (printed nose down)
  svg += `<path d="M${env.map(([z, r]) => `${X(r)} ${Y(z)}`).join(' L')} L${env.slice().reverse().map(([z, r]) => `${X(-r)} ${Y(z)}`).join(' L')} Z" fill="#FF1A8C" fill-opacity=".18" stroke="#FF5FB0"/>`;
  svg += `<rect x="${X(-RCUT)}" y="${Y(m.Ls)}" width="${2 * RCUT * sc}" height="${m.Ls * sc}" fill="none" stroke="#F4EEF2" stroke-dasharray="3 3"/>`;
  const floors = Math.ceil((m.Ls + 16) / (BEDZ - 10));
  for (let f = 1; f < floors; f++) { const z = m.Ls * f / floors; svg += `<line x1="${X(-RCUT - 12)}" y1="${Y(z)}" x2="${X(RCUT + 12)}" y2="${Y(z)}" stroke="#4ADE80" stroke-width="2.5"/><text x="${X(RCUT + 16)}" y="${Number(Y(z)) + 4}" fill="#4ADE80">поперечный разрез ядра</text>`; }
  svg += `<line x1="${X(0)}" y1="${Y(-10)}" x2="${X(0)}" y2="${Y(m.Ls + 20)}" stroke="#A99AA3" stroke-width="3"/><text x="${X(4)}" y="${Y(m.Ls + 14)}" fill="#A99AA3">стальная ось 8 мм центрирует этажи</text>`;
  svg += `<text x="${X(-m.R)}" y="${oy + 20}" fill="#A99AA3">ротор Ø${D} мм, длина ${Math.round(m.Ls)} мм; пунктир — ядро Ø${2 * RCUT} мм</text>`;
  return svg + '</svg>';
}

const table = rows.map((r) => r.whole
  ? `<tr><td>${r.D}</td><td>${r.L}</td><td colspan="4">ротор помещается на стол целиком (высота ${r.coreH} мм)</td><td><b>1</b></td></tr>`
  : `<tr><td>${r.D}</td><td>${r.L}</td><td>${r.wrap ? r.wrap + '°' : '—'}</td><td>${r.segs ? `${r.segs} × (${Math.round(r.piece.big)} × ${Math.round(r.piece.small)} × ${Math.round(r.piece.h)})` : '—'}</td><td>${r.coreH}${r.coreH > BEDZ ? ' &gt; 250' : ''}</td><td>${r.floors}</td><td><b>${r.parts}</b></td></tr>`).join('');

const page = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>KATAK · ротор больше стола принтера</title>
<style>
:root { --bg:#0D0D0D; --card:#171217; --ink:#F4EEF2; --muted:#A99AA3; --line:#3A2633; --accent:#FF1A8C; --ok:#4ADE80; --warn:#FBBF24; --bad:#FF6B6B; }
* { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.55 "Segoe UI", system-ui, sans-serif }
header { padding:14px 20px; border-bottom:1px solid var(--line); background:var(--card) } header strong { color:var(--accent) } header .sum { color:var(--muted); margin-left:8px }
main { max-width:1000px; margin:0 auto; padding:16px 20px 48px } section.q { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:14px 18px; margin:18px 0 }
h2 { font-size:18px; margin:4px 0 12px } h3 { font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:16px 0 8px }
.pair { display:grid; grid-template-columns:1fr 1fr; gap:12px } figure { margin:0; border:1px solid var(--line); border-radius:10px; padding:8px; text-align:center }
figcaption { font-size:13px; color:var(--muted); margin-top:6px } svg.pic { width:100%; height:auto } svg.pic text { font:12px "Segoe UI", sans-serif }
table { width:100%; border-collapse:collapse; font-size:14px } td, th { padding:6px 8px; border-bottom:1px solid var(--line); text-align:left } th { color:var(--muted); font-weight:600 }
.leaves { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px } .leaf { border:1px solid var(--line); border-left:6px solid var(--muted); border-radius:10px; padding:8px 12px; font-size:14px }
.leaf.ok { border-left-color:var(--ok) } .leaf.warn { border-left-color:var(--warn) } .leaf.bad { border-left-color:var(--bad) } .leaf b { display:block; margin-bottom:4px }
dl.scenario { display:grid; grid-template-columns:max-content 1fr; gap:4px 12px; margin:14px 0 0; padding-top:10px; border-top:1px solid var(--line); font-size:14px } dl.scenario dt { color:var(--muted) } dl.scenario dd { margin:0 }
@media (max-width:700px) { .pair { grid-template-columns:1fr } }
</style></head><body>
<header><strong>KATAK</strong> · ротор больше стола принтера <span class="sum">— что решаем: схему разреза и соединения деталей (идея 12)</span></header>
<main>

<section class="q">
  <h2>1. Что ограничивает размер: ширина стола и высота печати</h2>
  <div class="pair">
    <figure>${topView(400, 2)}<figcaption>Вид вдоль оси, ротор Ø400 мм. Пунктирный круг — разрез ядра r = ${RCUT} мм. Цветные — три юбки, каждая из двух сегментов (светлый и тёмный). Жёлтый квадрат — стол Ender 3 в том же масштабе.</figcaption></figure>
    <figure>${sideView(400)}<figcaption>Вид сбоку, ротор печатается стоя. Ядро Ø${2 * RCUT} мм проходит по ширине стола, но его высота ${Math.round(model(400).Ls + 16)} мм больше 250 мм — ядро режется поперёк оси на этажи.</figcaption></figure>
  </div>
  <dl class="scenario"><dt>Ситуация</dt><dd>Ротор Ø400 мм, принтер Ender 3 (220 × 220 × 250 мм).</dd><dt>Действие</dt><dd>Страница режет готовую геометрию: круговой разрез r = ${RCUT} мм, юбки на сегменты вдоль витка, ядро поперёк оси.</dd><dt>Результат</dt><dd>8 деталей: 2 этажа ядра и 3 юбки по 2 сегмента; самая большая деталь помещается на стол.</dd><dt>Проверка</dt><dd><code>node design/split/build-split-page.mjs</code> — таблица ниже считается из ядра KATAK.</dd></dl>
</section>

<section class="q">
  <h2>2. Сколько деталей выходит на Ender 3</h2>
  <table><tr><th>Ø ротора, мм</th><th>Длина, мм</th><th>Юбка охватывает</th><th>Сегменты юбки (наибольший, мм)</th><th>Высота ядра, мм</th><th>Этажей ядра</th><th>Деталей</th></tr>${table}</table>
  <p>Юбка — часть лопасти за кругом разреза. Чем больше ротор, тем больший угол витка она охватывает: при Ø400 мм это 190°, такую юбку целиком на стол 220 мм не положить. Длина ротора около 0,9 диаметра, поэтому высота ядра упирается в 250 мм уже при Ø250 мм.</p>
</section>

<section class="q">
  <h2>3. Варианты схемы</h2>
  <div class="leaves">
    <div class="leaf warn"><b>А. Ядро и три юбки (4 детали)</b>Схема из слова владельца. На Ender 3 работает до Ø≈250 мм: дальше ядро выше 250 мм. Выигрыш против целого ротора (до 235 мм) небольшой.</div>
    <div class="leaf ok"><b>Б. Этажи ядра и сегменты юбок</b>Круговой разрез, сегменты юбки вдоль витка, ядро поперёк оси. Ø300 мм — 5 деталей, Ø400 мм — 8 деталей. Число деталей страница выбирает сама по размеру стола.</div>
    <div class="leaf bad"><b>В. Разрез плоскостями в слайсере</b>PrusaSlicer умеет резать модель с шипами. Плоскость режет все три лопасти сразу и даёт детали неудобной формы; точки стыков не согласованы с лопастями.</div>
  </div>
</section>

<section class="q">
  <h2>4. Как детали соединяются</h2>
  <div class="leaves">
    <div class="leaf ok"><b>Этажи ядра</b>Стальная ось 8 мм проходит через ступицу и центрирует этажи; шестигранный выступ на торце ступицы не даёт этажам провернуться; стык проклеивается.</div>
    <div class="leaf ok"><b>Юбка к ядру</b>Нахлёст: на кромке разреза ядра печатается полоса-«язык» толщиной в половину стенки, юбка ложится на неё; 2–3 болта M3 на сегмент и клей.</div>
    <div class="leaf ok"><b>Сегмент к сегменту</b>Тот же нахлёст вдоль витка с болтами M3.</div>
    <div class="leaf ok"><b>Наружные шпильки (идея 05)</b>Шпильки между кромками соседних витков, как у оригинала, стягивают юбки и добавляют жёсткости собранному ротору.</div>
  </div>
</section>

</main></body></html>`;
writeFileSync('design/split/split-options.html', page);
console.log('design/split/split-options.html', page.length, 'chars;', rows.map((r) => `D${r.D}: ${r.parts} parts`).join(', '));
