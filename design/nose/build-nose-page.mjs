#!/usr/bin/env node
// build-nose-page.mjs — the choice page of ideas/10 (the arrow-like fairing): candidate nose profiles drawn side by side at the
// same length and base (L/R = 1.6, the page default nose_ratio 0.8), with a numeric check of every profile printed into the page
// and the console: r(tip) = 0, r(base) = R, monotone, the number of inflections. Formulas: researches/04 §3 (verified here).
//
//   node design/nose/build-nose-page.mjs      → design/nose/nose-candidates.html                                [NOT-TESTED]
import { writeFileSync } from 'node:fs';

const LAM = 1.6;                                            // L/R
// every profile: x/L from the tip (0) to the base (1) → r/R
const ellipse = (s) => Math.sqrt(Math.max(0, 1 - (1 - s) ** 2));
const ogive = (s) => { const L = LAM, rho = (1 + L * L) / 2, x = s * L; return Math.sqrt(Math.max(0, rho * rho - (L - x) ** 2)) + 1 - rho; };
const cone = (s) => s;
const ogee = (t) => (s) => { const K = (LAM * LAM + 1) / 2, a = t * K, b = (1 - t) * K, x = s * LAM;
  return x <= t * LAM ? a - Math.sqrt(Math.max(0, a * a - x * x)) : 1 - b + Math.sqrt(Math.max(0, b * b - (LAM - x) ** 2)); };
const bluntOgee = (t, rn) => {                              // §3.2: a tip sphere tangent to the concave arc, then stretched to L
  const K = (LAM * LAM + 1) / 2, rho1 = t * K, xc = Math.sqrt(2 * rho1 * rn + rn * rn), xt = xc * rho1 / (rho1 + rn), xa = xc - rn, base = ogee(t);
  return (s) => { const x = xa + s * (LAM - xa);            // stretched: s = 0 → the new tip x_a, s = 1 → the base
    return x <= xt ? Math.sqrt(Math.max(0, rn * rn - (x - xc) ** 2)) : base(x / LAM); };
};
const kuma = (s) => 2 * s * s - s ** 4;

const C = [
  ['А', 'эллипсоид (есть на странице)', ellipse],
  ['Б', 'касательное оживало (есть на странице, исправлено — баг 01)', ogive],
  ['В', 'конус (есть на странице)', cone],
  ['Г', 'острый гусёк, перегиб посередине (t = 0,5)', ogee(0.5)],
  ['Д', 'острый гусёк, перегиб ближе к носу (t = 0,35)', ogee(0.35)],
  ['Е', 'затуплённый гусёк — два перегиба (t = 0,5, нос r = 0,03 R)', bluntOgee(0.5, 0.03)],
  ['Ж', 'гладкая сигмоида 2u² − u⁴', kuma],
];

// numeric check: endpoints, monotone, inflections (sign changes of the second difference, ignoring |Δ²| < 1e-7)
function check(f) {
  const N = 2000, r = Array.from({ length: N + 1 }, (_, i) => f(i / N));
  let mono = true, infl = 0, prev = 0;
  for (let i = 1; i <= N; i++) if (r[i] < r[i - 1] - 1e-9) mono = false;
  for (let i = 1; i < N; i++) { const d2 = r[i + 1] - 2 * r[i] + r[i - 1]; if (Math.abs(d2) < 1e-7) continue; const sg = Math.sign(d2); if (prev && sg !== prev) infl++; prev = sg; }
  return { r0: r[0], r1: r[N], mono, infl };
}
function picture(f) {
  const W = 300, H = 150, L = 240, R = L / LAM / 1.0 * 0.5, x0 = 30, y0 = H / 2, pts = [];
  for (let i = 0; i <= 200; i++) { const s = i / 200; pts.push([x0 + s * L, f(s) * R]); }
  const top = pts.map(([x, r]) => `${x.toFixed(1)} ${(y0 - r).toFixed(1)}`).join(' L'), bot = pts.slice().reverse().map(([x, r]) => `${x.toFixed(1)} ${(y0 + r).toFixed(1)}`).join(' L');
  return `<svg viewBox="0 0 ${W} ${H}" class="pic"><line x1="10" y1="${y0}" x2="${W - 6}" y2="${y0}" stroke="#A99AA3" stroke-dasharray="6 3 2 3"/>` +
    `<path d="M${top} L${bot} Z" fill="#F4EEF2" fill-opacity=".85" stroke="#FF1A8C" stroke-width="1.5"/>` +
    `<rect x="${x0 + L}" y="${y0 - R}" width="14" height="${2 * R}" fill="#3A2633" stroke="#A99AA3"/></svg>`;
}
const cards = C.map(([id, name, f]) => { const c = check(f); console.log(`${id} ${name}: r(0) ${c.r0.toFixed(4)} · r(L) ${c.r1.toFixed(4)} · monotone ${c.mono} · inflections ${c.infl}`);
  // the tip by its slope dr/dx at x → 0 (in R per L): steep — rounded; near zero — a needle; between — a sharp point
  const slope = f(0.001) / 0.001 / LAM, tip = slope > 3 ? 'нос скруглённый' : slope < 0.2 ? 'нос — игла' : 'нос острый';
  return `<figure>${picture(f)}<figcaption><b>${id}.</b> ${name}<br><span class="m">перегибов: ${c.infl} · ${tip}</span></figcaption></figure>`; }).join('');

const page = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>KATAK · форма обтекателя «как у стрелы»</title><style>
body { margin:0; background:#0D0D0D; color:#F4EEF2; font:15px/1.55 "Segoe UI", system-ui, sans-serif }
header { padding:14px 20px; border-bottom:1px solid #3A2633; background:#171217 } header strong { color:#FF1A8C } header span { color:#A99AA3; margin-left:8px }
main { max-width:1000px; margin:0 auto; padding:16px 20px 48px } .grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:12px }
figure { margin:0; background:#171217; border:1px solid #3A2633; border-radius:10px; padding:8px } figcaption { font-size:14px; margin-top:4px } .m { color:#A99AA3; font-size:13px }
svg.pic { width:100%; height:auto } p { color:#A99AA3 }
</style></head><body><header><strong>KATAK</strong> · форма обтекателя «как у стрелы» <span>— какая из форм та, что вы описали: «тонкий нос, широкая база, два перегиба»</span></header>
<main><div class="grid">${cards}</div>
<p>Все формы — одной длины и одного диаметра базы (длина равна 0,8 диаметра, как на странице по умолчанию); нос слева, справа — база у стойки подшипника. Г, Д, Е, Ж — новые; в стрельбе из лука такой наконечник называют вогнутым (concave point), кривую — «гусёк» (ogee). Острая игла Г и Д тоньше линии сопла 0,4 мм, поэтому для печати подходит Е — у неё нос скруглён и перегибов ровно два.</p></main></body></html>`;
writeFileSync('design/nose/nose-candidates.html', page);
console.log('design/nose/nose-candidates.html');
