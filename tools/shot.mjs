#!/usr/bin/env node
// shot.mjs — a screenshot of a local HTML page in this machine's Google Chrome (Playwright, channel "chrome"; the owner allowed
// testing in Chrome without asking — HOUSE_RULES.md R3). Used to look at design pages (icons, mock-ups) with the agent's own eyes.
//
//   node tools/shot.mjs <page.html> <out.png> [--width 1440] [--height 900] [--full] [--dark|--light] [--headed]
//
// Prints the page title, its console errors and the PNG path; exit 1 when the page logged an error or did not load.
// [NOT-TESTED]
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const [page, out] = a.filter((x, i) => !x.startsWith('--') && !['--width', '--height'].includes(a[i - 1]));
if (!page || !out) { console.error('usage: node tools/shot.mjs <page.html> <out.png> [--width N] [--height N] [--full] [--dark|--light] [--headed]'); process.exit(2); }

const browser = await chromium.launch({ channel: 'chrome', headless: !a.includes('--headed') });
const ctx = await browser.newContext({
  viewport: { width: Number(opt('--width', 1440)), height: Number(opt('--height', 900)) },
  colorScheme: a.includes('--dark') ? 'dark' : a.includes('--light') ? 'light' : 'no-preference',
  deviceScaleFactor: 1,
});
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push(String(e)));
const url = /^https?:/.test(page) ? page : pathToFileURL(resolve(page)).href;
const resp = await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: out, fullPage: a.includes('--full') });
console.log(`title: ${await p.title()}`);
console.log(`errors: ${errors.length ? errors.join(' | ') : 'none'}`);
console.log(`png: ${resolve(out)}`);
await browser.close();
process.exit(errors.length || (resp && !resp.ok() && !url.startsWith('file:')) ? 1 : 0);
