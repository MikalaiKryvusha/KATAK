#!/usr/bin/env node
// ui-run.mjs — the FUNCTIONAL run of the KATAK page: this machine's Google Chrome (Playwright, channel "chrome"; the owner allowed
// it without asking — HOUSE_RULES.md R3) opens kalculator/index.html from disk the way a user does, walks the scenarios of
// plans/01 (acceptance criteria 1–4), READS what the page shows, saves screenshots, and prints one line per case.
//
//   node tools/ui-run.mjs [--headed] [--shots <dir>]        exit 0 — every case as expected, 1 — not
//
// Cases: smoke (defaults compute, no console errors) · nozzle → wall in whole lines · «by power» picks a diameter ·
// English leaves no Cyrillic in the visible text · rotor and nose STL download as valid binary STL · phone width has no
// horizontal scroll. [NOT-TESTED]
import { chromium } from 'playwright';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, readFileSync } from 'node:fs';

const a = process.argv.slice(2);
const shots = a.includes('--shots') ? a[a.indexOf('--shots') + 1] : '.work/tmp/ui-run';
mkdirSync(shots, { recursive: true });
// --page <html> runs the same cases against another copy of the page (used to prove a guard red on an old version)
const url = pathToFileURL(resolve(a.includes('--page') ? a[a.indexOf('--page') + 1] : 'kalculator/index.html')).href;

let bad = 0, total = 0;
const check = (name, ok, got = '') => { total++; if (!ok) bad++; console.log(`${ok ? 'pass' : 'FAIL'} ${name}${got !== '' ? ' — ' + got : ''}`); };

const browser = await chromium.launch({ channel: 'chrome', headless: !a.includes('--headed') });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, locale: 'ru-RU' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const requests = [];                                      // every URL the page asks for — the page is self-contained (HOUSE_RULES R7)
page.on('request', (r) => requests.push(r.url()));
const settle = () => page.waitForTimeout(700);           // compute is debounced 120 ms, the preview 200 ms
const setField = async (id, value) => {
  const el = page.locator('#in-' + id);
  if ((await el.evaluate((e) => e.tagName)) === 'SELECT') await el.selectOption(String(value)); else await el.fill(String(value));
  await settle();
};
const kpiText = () => page.locator('#kpis').innerText();
const specText = (id) => page.locator(id).innerText();

// ---- 1. smoke: the page opens from disk with no network and computes the defaults
await page.goto(url, { waitUntil: 'load' }); await settle();
check('smoke: the page opens from disk', (await page.title()).includes('KATAK'), await page.title());
const k0 = await kpiText();
check('smoke: the result shows mean power, energy per year, rpm', /Вт/.test(k0) && /кВт·ч/.test(k0) && /об\/мин/.test(k0), k0.replace(/\s+/g, ' ').slice(0, 120));
const warn0 = await page.locator('#warnings').innerText();
check('smoke: the default turbine passes the geometry checks and fits the 220 mm bed', /удовлетворяет проверкам/.test(warn0) && !/превышает область печати/.test(warn0), warn0.replace(/\s+/g, ' ').slice(0, 160));
await page.screenshot({ path: join(shots, '1-defaults-ru.png'), fullPage: true });
// ---- 1a. self-contained (owner 2026-11-16 16:50 «HTML наш самодостаточен»): no request beyond the page itself, the tab icon
// is a data URI, no visible pointer into the repository; the intro: the lede full width, the three cards in one row (16:51)
// the drive letter may differ in case between the cwd and Chrome's URL (the phase-1 judge, finding 2) — compare without case
const foreign = requests.filter((u) => u.toLowerCase() !== url.toLowerCase() && !u.startsWith('data:') && !u.startsWith('blob:'));
check('self-contained: the page requests no other file', foreign.length === 0, foreign.slice(0, 3).join(' | ') || 'none');
check('self-contained: the tab icon is a data URI from the inline logo', (await page.evaluate(() => (document.querySelector('link[rel=icon]') || {}).href || '')).startsWith('data:image/svg+xml'));
check('self-contained: no «researches/» in the visible text', !/researches\//.test(await page.evaluate(() => document.body.innerText)));
const intro = await page.evaluate(() => {
  const r = (el) => el.getBoundingClientRect(), facts = [...document.querySelectorAll('.fact')].map(r), lede = r(document.querySelector('.lede'));
  return { tops: facts.map((f) => Math.round(f.top)), ledeW: Math.round(lede.width), wrapW: Math.round(r(document.querySelector('.intro')).width), gap: Math.round(facts[0].top - lede.bottom) };
});
check('intro 1440 px: three cards in one row under a full-width lede', new Set(intro.tops).size === 1 && intro.ledeW >= intro.wrapW - 2 && intro.gap >= 0 && intro.gap <= 40,
  `tops ${intro.tops.join('/')}, lede ${intro.ledeW} of ${intro.wrapW}, gap ${intro.gap}px`);
// ---- 1b. a figure on every step (ideas/04): the wind profile, the rotor side view, the wall cross-section, the power curve
for (const id of ['#viz-site', '#viz-rotor', '#viz-print', '#chart']) {
  const nEl = await page.locator(id + ' > *').count();
  check(`figure ${id} is drawn`, nEl >= 5, `${nEl} elements`);
}

// ---- 1b'. the (i) buttons (ideas/07): one per field; hover opens the popup, leaving closes it, a click pins it, Esc closes it
const nField = await page.locator('.field').count(), nInfo = await page.locator('.field .info').count();
check('ideas/07: every field has an (i) button', nField > 30 && nInfo === nField, `${nInfo} of ${nField}`);
const ib = page.locator('.info[data-info="v_ref"]'); await ib.scrollIntoViewIfNeeded(); await ib.hover(); await page.waitForTimeout(150);
const pop = page.locator('#info-pop');
check('ideas/07: hovering (i) of «Средняя скорость ветра» opens the popup with its title', await pop.isVisible() && /Средняя скорость ветра/.test(await pop.innerText()), (await pop.innerText()).split('\n')[0]);
await page.screenshot({ path: join(shots, '1g-info-hover.png') });
await page.mouse.move(5, 5); await page.waitForTimeout(400);
check('ideas/07: control — the pointer leaves → the popup closes', !(await pop.isVisible()));
await ib.click(); await page.waitForTimeout(100); await page.mouse.move(5, 5); await page.waitForTimeout(400);
check('ideas/07: a click pins the popup (it stays when the pointer leaves)', await pop.isVisible());
await page.keyboard.press('Escape'); await page.waitForTimeout(100);
check('ideas/07: Esc closes the pinned popup', !(await pop.isVisible()));

// ---- 1c. the owner's print defaults (2026-11-16 16:42–16:43): layer 0.2 mm, wall 2 mm → snapped up to 5 lines of a 0.4 nozzle
check('defaults: layer field 0.2, wall field 2', (await page.inputValue('#in-layer_mm')) === '0.2' && (await page.inputValue('#in-wall_mm')) === '2',
  `${await page.inputValue('#in-layer_mm')} / ${await page.inputValue('#in-wall_mm')}`);
const psDef = await specText('#print-spec');
check('defaults: wall «2,08 мм = 5 линий», layer 0,20 mm', /2,08 мм = 5 линий/.test(psDef) && /0,20 \/ 0,45 мм/.test(psDef), psDef.replace(/\s+/g, ' ').slice(0, 90));
check('defaults: no layer-range warning at nozzle 0.4', !/Высота слоя .* составляет/.test(await page.locator('#warnings').innerText()));
// the owner's Ender-3 defaults (2026-11-16 16:53–16:54): D 220, PETG, detail 70 %, bearing 608, build volume 220 × 220 × 250
const defs = await page.evaluate(() => Object.fromEntries(['diameter_mm', 'material', 'detail', 'bearing', 'bed_mm', 'bed_z_mm'].map((id) => [id, document.getElementById('in-' + id).value])));
check('defaults: D 220, PETG, detail 70, bearing 608, bed 220 × 250', JSON.stringify(defs) === JSON.stringify({ diameter_mm: '220', material: 'PETG', detail: '70', bearing: '608', bed_mm: '220', bed_z_mm: '250' }), JSON.stringify(defs));
// Minsk (owner 16:53, researches/05): 3.7 m/s at 10 m, suburb, roof above the ridge, 220 m, 7 °C, k 2
const site = await page.evaluate(() => Object.fromEntries(['v_ref', 'z_ref', 'terrain', 'site', 'alt_m', 'temp_c', 'weibull_k'].map((id) => [id, document.getElementById('in-' + id).value])));
check('defaults: the site is Minsk', JSON.stringify(site) === JSON.stringify({ v_ref: '3.7', z_ref: '10', terrain: 'suburb', site: 'roof_high', alt_m: '220', temp_c: '7', weibull_k: '2' }), JSON.stringify(site));
// the power curve of the AWM brochure (researches/06): the result table names the maximum at 14 m/s, the chart says «максимум 14,0»
check('result: «Наибольшая мощность при 14 м/с» is shown', /Наибольшая мощность при 14 м\/с/.test(await specText('#res-spec')));
check('chart: the 14 m/s mark reads «максимум 14,0»', (await page.locator('#chart').innerText().catch(() => '')) !== null && (await page.locator('#chart').evaluate((s) => s.textContent)).includes('максимум 14,0'));
check('defaults: 608 on the bearing row of the print table', /608 · 8×22×7 мм/.test(await specText('#print-spec')));
// the 608 bore (8 mm) is below the computed steel shaft at D 220 → the page says so; control — 6001 (12 mm) → no such line
const ws = await page.locator('#warnings').innerText();
check('defaults: «Внутренний диаметр подшипника 608 равен 8 мм и меньше расчётного диаметра стального вала …»', /Внутренний диаметр подшипника 608 равен 8 мм и меньше расчётного диаметра стального вала \d+,\d мм/.test(ws), (ws.match(/Внутренний диаметр[^.]*\./) || ['none'])[0]);
await setField('bearing', '6001');
check('control: bearing 6001 (12 mm) → no shaft warning', !/Внутренний диаметр подшипника/.test(await page.locator('#warnings').innerText()));
await setField('bearing', '608');

// ---- 1d. the layer outside 25–75 % of the nozzle warns (researches/02 §4); control — back to 0.4, the warning goes
await setField('nozzle_mm', '0.2');
const wl = await page.locator('#warnings').innerText();
check('nozzle 0.2 with layer 0.2 → «Высота слоя 0,20 мм составляет 100 % диаметра сопла»', /Высота слоя 0,20 мм составляет 100 % диаметра сопла/.test(wl), (wl.match(/Высота слоя[^.]*\./) || ['none'])[0]);
await setField('nozzle_mm', '0.4');
check('control: nozzle 0.4 → no layer-range warning', !/Высота слоя .* составляет/.test(await page.locator('#warnings').innerText()));

// ---- 2. the nozzle → the wall snaps to whole lines (plans/01 criterion 4)
await setField('nozzle_mm', '0.4'); await setField('layer_mm', '0.2'); await setField('wall_mm', '1.0');
const ps = await specText('#print-spec');
check('nozzle 0.4, layer 0.2, wall 1.0 → «1,26 мм = 3 линии» (plural form too)', /1,26 мм = 3 линии/.test(ps), ps.split('\n')[0]);
await setField('nozzle_mm', '0.8');
const ps8 = await specText('#print-spec');
check('nozzle 0.8 → a different line count, still whole lines', /= \d+ лини[яий]/.test(ps8) && !/1,26 мм = 3/.test(ps8), ps8.split('\n')[0]);
await setField('nozzle_mm', '0.4'); await setField('layer_mm', '0.2'); await setField('wall_mm', '2');   // back to the owner's defaults

// ---- 2b. the build height Z is checked on its own: a 150 mm Z cannot take the upright ~223 mm rotor, X/Y 220 can
await setField('split', 'no');                            // the print from parts off: the overflow is reported as such
await setField('bed_z_mm', '150');
check('build height Z 150 mm → «превышает область печати»', /превышает область печати/.test(await page.locator('#warnings').innerText()));
await setField('bed_z_mm', '250');
check('control: Z back to 250 mm → no overflow warning', !/превышает область печати/.test(await page.locator('#warnings').innerText()));
await setField('split', 'auto');

// ---- 2c. the print from parts (epic 02, plans/03 criterion 1): D 280 on 220 × 220 × 250 → 5 parts, each STL fits the bed
await setField('diameter_mm', '280'); await page.waitForTimeout(1500);
const wsp = await page.locator('#warnings').innerText();
check('split D 280: «печатается из 5 деталей: этажей ядра — 2, одинаковых юбок — 3»', /печатается из 5 деталей: этажей ядра — 2, одинаковых юбок — 3/.test(wsp), (wsp.match(/Ротор больше стола[^.]*\./) || ['none'])[0]);
const prow = await page.locator('#parts tr').count();
check('split D 280: the parts table lists 3 parts (+ the header)', prow === 4 && await page.locator('#parts').isVisible(), `${prow} rows`);
const stlBox = (bytes) => { const n = bytes.readUInt32LE(80), lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < n; i++) for (let v = 0; v < 3; v++) for (let k = 0; k < 3; k++) { const x = bytes.readFloatLE(84 + 50 * i + 12 + 12 * v + 4 * k); lo[k] = Math.min(lo[k], x); hi[k] = Math.max(hi[k], x); }
  return hi.map((h, k) => h - lo[k]); };
for (const id of ['floor1', 'floor2', 'skirt']) {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click(`#parts [data-part="${id}"]`)]);
  const f = join(shots, dl.suggestedFilename()); await dl.saveAs(f); const sz = stlBox(readFileSync(f));
  check(`split D 280: ${id} STL fits 220 × 220 × 250`, sz[0] <= 220 && sz[1] <= 220 && sz[2] <= 250 && sz[2] > 10, `${dl.suggestedFilename()} · ${sz.map((x) => x.toFixed(0)).join(' × ')}`);
}
await page.screenshot({ path: join(shots, '1f-split-280.png'), fullPage: true });
await setField('diameter_mm', '220'); await page.waitForTimeout(1200);
check('control: D 220 fits whole → no parts table', !(await page.locator('#parts').isVisible()));
// bugs/02 on the user path: a rotor too tall only — floors, no sliver skirts
await setField('bed_z_mm', '150'); await page.waitForTimeout(1200);
const wz = await page.locator('#warnings').innerText();
check('bugs/02: D 220 on Z 150 → «печатается из 2 этажей ядра», no skirt row', /печатается из 2 этажей ядра/.test(wz) && !/Юбка лопасти/.test(await page.locator('#parts').innerText()), (wz.match(/Ротор выше стола[^.]*\./) || ['none'])[0]);
await setField('bed_z_mm', '250'); await page.waitForTimeout(1000);

// ---- 3. «by power»: the page picks the diameter
await setField('mode', 'power'); await setField('target_w', '5'); await setField('target_v', '6');
const wp = await page.locator('#warnings').innerText();
check('«by power» 5 W at 6 m/s → a diameter is suggested', /Для мощности 5(,0)? Вт при скорости ветра 6(,0)? м\/с требуется ротор диаметром около [\d\s ]+ мм/.test(wp), (wp.match(/Для мощности.*мм/) || [''])[0]);
await setField('mode', 'diameter');

// ---- 3b. the power chart (ideas/09, owner 2026-11-16 16:47): two axes, named speed marks, a legend on the chart; hovering
// 10 m/s shows the box with the speed, the power equal to the core's curve point at 10 m/s, and the share of time
const ct = await page.locator('#chart').evaluate((s) => [...s.querySelectorAll('text')].map((t) => t.textContent).join(' | '));
// «максимум 14,0»: the 14 m/s mark follows the brochure's «Maximum» since the curve holds there (researches/06 §5)
check('chart: legend and named marks (включение, номинал, максимум, средняя; доля времени)', ['электрическая мощность', 'доля времени', 'включение 3,0', 'номинал 12,5', 'максимум 14,0', 'средняя'].every((w) => ct.includes(w)), ct.slice(0, 160));
check('chart: the right axis is in %', /\| %( \||$)/.test(ct));
await page.locator('#chart').scrollIntoViewIfNeeded();   // the mouse acts in the viewport: the chart must be on screen
const box = await page.locator('#chart').boundingBox();
const at10 = 46 + (640 - 46 - 46) * 10 / 20;              // the chart's own x(10) in its 640-wide viewBox
await page.mouse.move(box.x + at10 * box.width / 640, box.y + box.height * 0.5); await page.waitForTimeout(150);
const tip = await page.evaluate(() => ({ vis: document.getElementById('chart-tip').getAttribute('visibility'), text: document.getElementById('chart-tip').textContent }));
const pe10 = await page.evaluate(() => window.KATAK_PAGE.state().ph.curve.find((c) => c.v === 10).pe);
const tipW = Number((tip.text.match(/Мощность: ([\d,]+)/) || ['', 'NaN'])[1].replace(',', '.'));
check('chart hover at 10 m/s: «Скорость ветра: 10,0 м/с», power = the core curve at 10 m/s, a share of time', tip.vis === 'visible' && /Скорость ветра: 10,0 м\/с/.test(tip.text) && Math.abs(tipW - pe10) < 0.006 && /Доля времени: [\d,]+ %/.test(tip.text), `${tip.text} · core ${pe10.toFixed(3)}`);
await page.screenshot({ path: join(shots, '1e-chart-hover.png'), clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
await page.mouse.move(box.x - 40, box.y - 40); await page.waitForTimeout(100);
check('control: the pointer leaves the chart → the box hides', (await page.evaluate(() => document.getElementById('chart-tip').getAttribute('visibility'))) === 'hidden');

// ---- 4. downloads: rotor and nose as valid binary STL; the preview is built at the print detail (owner 2026-11-16 16:43),
// so the preview's triangle count equals the rotor STL's; control — detail 10 % gives a smaller preview than 40 %
const previewTris = async () => Number(((await page.locator('#build-info').innerText()).match(/^([\d\s ]+) △/) || ['', ''])[1].replace(/\D/g, ''));
await setField('detail', '10'); const tris10 = await previewTris();
await setField('detail', '40'); const tris40 = await previewTris();
check('control: preview at detail 10 % has fewer triangles than at 40 %', tris10 > 0 && tris10 < tris40, `${tris10} < ${tris40}`);
for (const [btn, part] of [['#dl-rotor', 'rotor'], ['#dl-nose', 'nose']]) {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click(btn)]);
  const file = join(shots, dl.suggestedFilename()); await dl.saveAs(file);
  const bytes = readFileSync(file), n = bytes.readUInt32LE(80);
  check(`download ${part}: binary STL, size = 84 + 50·N`, bytes.length === 84 + 50 * n && n > 500, `${dl.suggestedFilename()}, ${n} triangles`);
  if (part === 'rotor') check('preview triangles = rotor STL triangles (the preview uses the print detail)', n === tris40, `${tris40} vs ${n}`);
}
// ---- 4b. bugs/01: «оживало» downloads a nose of its own shape — slimmer than the ellipsoid (the volume of the STL itself)
const stlVolume = (bytes) => { let v = 0; const n = bytes.readUInt32LE(80); for (let i = 0; i < n; i++) { const o = 84 + 50 * i + 12, f = (k) => bytes.readFloatLE(o + 4 * k);
  const a = [f(0), f(1), f(2)], b = [f(3), f(4), f(5)], c = [f(6), f(7), f(8)]; v += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6; } return v; };
const noseVol = async (shape) => { await setField('nose_shape', shape); const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#dl-nose')]);
  const f = join(shots, `nose-${shape}.stl`); await dl.saveAs(f); return stlVolume(readFileSync(f)); };
const vEl = await noseVol('ellipse'), vOg = await noseVol('ogive');
check('bugs/01: the «оживало» nose STL is ≥ 3 % smaller in volume than the «эллипсоид» one', vOg < 0.97 * vEl, `${vOg.toFixed(0)} vs ${vEl.toFixed(0)} mm³`);
// ideas/10 — «стрела» (the owner's choice Ж): its own option, a nose far slimmer than the ellipsoid (∫r² ≈ 0.34 against 0.67)
const vSg = await noseVol('sigmoid');
check('ideas/10: the «стрела» nose STL is a distinct shape — under 75 % of the «эллипсоид» volume', vSg < 0.75 * vEl && vSg > 0, `${vSg.toFixed(0)} vs ${vEl.toFixed(0)} mm³`);
await setField('nose_shape', 'ellipse');

// ---- 5. English: no Cyrillic left in the visible text (the language list itself names «Русский»)
await page.selectOption('#lang-select', 'en'); await settle();
const visible = await page.evaluate(() => {
  const sel = document.getElementById('lang-select'); sel.style.display = 'none';
  const t = document.body.innerText; sel.style.display = ''; return t;
});
const cyr = visible.match(/[А-Яа-яЁё][А-Яа-яЁё\s]{0,20}/g) || [];
check('English: no Cyrillic in the visible text', cyr.length === 0, cyr.slice(0, 3).join(' | ') || 'none');
check('English: numbers use a decimal point', /\d\.\d/.test(await kpiText()));
await page.screenshot({ path: join(shots, '2-defaults-en.png'), fullPage: true });
await page.selectOption('#lang-select', 'ru'); await settle();

// ---- 6. phone width: one column, no horizontal scroll
await page.setViewportSize({ width: 390, height: 844 }); await settle();
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('phone 390 px: no horizontal scroll', overflow <= 0, `${overflow}px`);
const phoneTops = await page.evaluate(() => [...document.querySelectorAll('.fact')].map((f) => Math.round(f.getBoundingClientRect().top)));
check('phone 390 px: the three cards stack one under another', phoneTops[0] < phoneTops[1] && phoneTops[1] < phoneTops[2], phoneTops.join('/'));
await page.screenshot({ path: join(shots, '3-phone-ru.png'), fullPage: true });

// ---- 6b. a phone with a touch screen: a tap on (i) opens the popup, a tap elsewhere closes it (ideas/07)
{
  const tctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: 'ru-RU' });
  const tp = await tctx.newPage(); tp.on('pageerror', (e) => errors.push(String(e)));
  await tp.goto(url, { waitUntil: 'load' }); await tp.waitForTimeout(1200);
  const tb = tp.locator('.info[data-info="nozzle_mm"]'); await tb.scrollIntoViewIfNeeded(); await tb.tap(); await tp.waitForTimeout(200);
  const tpop = tp.locator('#info-pop'), box = await tpop.boundingBox();
  check('ideas/07: phone — a tap on (i) of «Диаметр сопла» opens the popup inside the screen width', await tpop.isVisible() && /Диаметр сопла/.test(await tpop.innerText()) && box.x >= 0 && box.x + box.width <= 390,
    box ? `x ${box.x.toFixed(0)}…${(box.x + box.width).toFixed(0)}` : 'none');
  await tp.screenshot({ path: join(shots, '3b-info-phone.png') });
  await tp.locator('h1').tap(); await tp.waitForTimeout(200);
  check('ideas/07: phone — a tap elsewhere closes it', !(await tpop.isVisible()));
  await tctx.close();
}

check('no console errors in the whole run', errors.length === 0, errors.join(' | ') || 'none');
await browser.close();
console.log(`-- ${total - bad} of ${total} as expected · screenshots in ${shots}`);
process.exit(bad ? 1 : 0);
