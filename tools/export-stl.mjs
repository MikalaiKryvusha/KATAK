#!/usr/bin/env node
// export-stl.mjs — builds the KATAK parts with the page's own core (cut out of kalculator/index.html, as the test does) and
// writes them as binary STL files, for slicing and rendering outside the browser.
//
//   node tools/export-stl.mjs [outDir] [--param value …]      e.g. node tools/export-stl.mjs .work/tmp/stl --diameter_mm 300 --detail high
//
// [NOT-TESTED]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const html = readFileSync(new URL('../kalculator/index.html', import.meta.url), 'utf8');
const core = html.split('// ===== CORE-BEGIN')[1].split('// ===== CORE-END')[0];
const ctx = {}; vm.createContext(ctx);
vm.runInContext(core.slice(core.indexOf('\n')) + '\nglobalThis.KATAK = KATAK;', ctx);
const K = ctx.KATAK;

const a = process.argv.slice(2);
const outDir = a[0] && !a[0].startsWith('--') ? a[0] : '.work/tmp/stl';
const params = {};
for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const v = a[i + 1]; params[a[i].slice(2)] = isNaN(Number(v)) ? (v === 'true' ? true : v === 'false' ? false : v) : Number(v); i++; }
mkdirSync(outDir, { recursive: true });
const r = K.build(params);
for (const [name, m] of Object.entries(r.parts)) {
  const file = join(outDir, `katak-${name}-${r.params.diameter_mm}mm.stl`);
  writeFileSync(file, K.toSTL(m, name));
  const c = K.checkClosed(m), b = K.bounds(m);
  console.log(`${file}: ${m.f.length} triangles, closed ${c.closed}, ${b.size.map((x) => x.toFixed(1)).join(' x ')} mm, ${(K.signedVolume(m) / 1000).toFixed(1)} cm3`);
}
console.log(`wall ${r.wall.wall_mm.toFixed(3)} mm = ${r.wall.lines} lines · L/D ${r.params.ld} · hub ${r.params.hub_od_mm.toFixed(1)} mm · checks ${JSON.stringify(r.checks.warn)}`);
