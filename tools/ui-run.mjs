#!/usr/bin/env node
// ui-run.mjs — the FUNCTIONAL run of the KATAK page: this machine's Google Chrome (Playwright, channel "chrome"; the owner allowed
// it without asking — HOUSE_RULES.md R3) opens kalculator/index.html from disk the way a user does, walks the scenarios, READS
// what the page shows, saves screenshots, and prints one line per case.
//
//   node tools/ui-run.mjs [--headed] [--shots <dir>]        exit 0 — every case as expected, 1 — not
//
// Scenarios grow with the page (plans/01 acceptance criteria). [NOT-TESTED]
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
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

// ---- smoke: the page opens from disk with no network, the user's main action works
await page.goto(url, { waitUntil: 'load' });
check('smoke: the page opens from disk', (await page.title()).includes('KATAK'), await page.title());

const dlButton = page.locator('#dl');
if (await dlButton.count()) {
  const [download] = await Promise.all([page.waitForEvent('download'), dlButton.click()]);
  const file = join(shots, download.suggestedFilename());
  await download.saveAs(file);
  const bytes = readFileSync(file);
  const n = bytes.readUInt32LE(80);
  check('smoke: «download STL» saves a binary STL', bytes.length === 84 + 50 * n && n > 1000, `${download.suggestedFilename()}, ${bytes.length} bytes, ${n} triangles`);
  const out = await page.locator('#out').textContent();
  check('the page reports the wall in whole lines', /wall [\d.]+ mm = \d+ lines/.test(out || ''), out);
}

await page.screenshot({ path: join(shots, 'page.png'), fullPage: true });
check('no console errors', errors.length === 0, errors.join(' | ') || 'none');
await browser.close();
console.log(`-- ${total - bad} of ${total} as expected · screenshots in ${shots}`);
process.exit(bad ? 1 : 0);
