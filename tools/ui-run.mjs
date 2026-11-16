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
const url = pathToFileURL(resolve('kalculator/index.html')).href;

let bad = 0, total = 0;
const check = (name, ok, got = '') => { total++; if (!ok) bad++; console.log(`${ok ? 'pass' : 'FAIL'} ${name}${got !== '' ? ' — ' + got : ''}`); };

const browser = await chromium.launch({ channel: 'chrome', headless: !a.includes('--headed') });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, locale: 'ru-RU' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
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
check('smoke: the default turbine passes the geometry checks and fits the 220 mm bed', /проходит проверки/.test(warn0) && !/больше стола/.test(warn0), warn0.replace(/\s+/g, ' ').slice(0, 160));
await page.screenshot({ path: join(shots, '1-defaults-ru.png'), fullPage: true });

// ---- 2. the nozzle → the wall snaps to whole lines (plans/01 criterion 4)
await setField('nozzle_mm', '0.4'); await setField('layer_mm', '0.2'); await setField('wall_mm', '1.0');
const ps = await specText('#print-spec');
check('nozzle 0.4, layer 0.2, wall 1.0 → «1,26 мм = 3 линии» (plural form too)', /1,26 мм = 3 линии/.test(ps), ps.split('\n')[0]);
await setField('nozzle_mm', '0.8');
const ps8 = await specText('#print-spec');
check('nozzle 0.8 → a different line count, still whole lines', /= \d+ лини[яий]/.test(ps8) && !/1,26 мм = 3/.test(ps8), ps8.split('\n')[0]);
await setField('nozzle_mm', '0.4'); await setField('layer_mm', ''); await setField('wall_mm', '');

// ---- 3. «by power»: the page picks the diameter
await setField('mode', 'power'); await setField('target_w', '5'); await setField('target_v', '6');
const wp = await page.locator('#warnings').innerText();
check('«by power» 5 W at 6 m/s → a diameter is suggested', /Для 5(,0)? Вт при 6(,0)? м\/с нужен ротор ≈ [\d\s ]+ мм/.test(wp), (wp.match(/Для.*мм/) || [''])[0]);
await setField('mode', 'diameter');

// ---- 4. downloads: rotor and nose as valid binary STL
for (const [btn, part] of [['#dl-rotor', 'rotor'], ['#dl-nose', 'nose']]) {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click(btn)]);
  const file = join(shots, dl.suggestedFilename()); await dl.saveAs(file);
  const bytes = readFileSync(file), n = bytes.readUInt32LE(80);
  check(`download ${part}: binary STL, size = 84 + 50·N`, bytes.length === 84 + 50 * n && n > 500, `${dl.suggestedFilename()}, ${n} triangles`);
}

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
await page.screenshot({ path: join(shots, '3-phone-ru.png'), fullPage: true });

check('no console errors in the whole run', errors.length === 0, errors.join(' | ') || 'none');
await browser.close();
console.log(`-- ${total - bad} of ${total} as expected · screenshots in ${shots}`);
process.exit(bad ? 1 : 0);
