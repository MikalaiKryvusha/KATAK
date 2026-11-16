#!/usr/bin/env node
// test.mjs — host test of the KATAK core (the block between CORE-BEGIN and CORE-END in kalculator/index.html), the KEINKT
// pattern: the page's core is cut out and run in Node through vm. Hygiene of the core, not a functional run of the page —
// that is tools/ui-run.mjs in Chrome (TESTING_FRAMEWORK.md → "What the word "test" means").
//
//   node kalculator/test.mjs      # exit 0 — every case as expected, 1 — not
//
// Cases by dimension (equivalence classes · boundaries): the wall rule (nozzles 0.2 / 0.4 / 0.6 / 0.8, a request below one
// line, exactly on T(N), just above it) · closedness of every part at every detail level and every hub mode · STL bytes
// (size, header, count, normals) · placement on the bed and overall size. Not covered yet: physics (phase B), slicing (the
// run report slices the file in OrcaSlicer).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const core = html.split('// ===== CORE-BEGIN')[1].split('// ===== CORE-END')[0];
const ctx = {};
vm.createContext(ctx);
vm.runInContext(core.slice(core.indexOf('\n')) + '\nglobalThis.KATAK = KATAK;', ctx);
const K = ctx.KATAK;

let bad = 0, total = 0;
const check = (name, ok, got = '') => { total++; if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${got !== '' ? ' — ' + got : ''}`); };
const near = (a, b, eps = 1e-3) => Math.abs(a - b) <= eps;

// ---- 1. wall under the nozzle (researches/02 §2): T(N) = N·w − (N − 1)·h·(1 − π/4), the request is a minimum
console.log('1. wall for the nozzle');
{
  const w = K.wallForNozzle({ nozzle_mm: 0.4, layer_mm: 0.2, wanted_mm: 1.0 });
  check('0.4 nozzle, 0.2 layer: line width 0.45 (1.125·d)', near(w.line_mm, 0.45), w.line_mm.toFixed(3));
  check('spacing 0.407 (Slic3r flow math example)', near(w.spacing_mm, 0.4071, 1e-4), w.spacing_mm.toFixed(4));
  check('wanted 1.0 → 3 lines, 1.264 mm (never thinner than asked)', w.lines === 3 && near(w.wall_mm, 1.2642, 1e-3), `${w.lines} lines, ${w.wall_mm.toFixed(4)}`);
  const exact = K.wallForNozzle({ nozzle_mm: 0.4, layer_mm: 0.2, wanted_mm: w.T(4) });
  check('wanted exactly T(4) → 4 lines (boundary)', exact.lines === 4, `${exact.lines}`);
  const above = K.wallForNozzle({ nozzle_mm: 0.4, layer_mm: 0.2, wanted_mm: w.T(4) + 0.01 });
  check('wanted T(4) + 0.01 → 5 lines (boundary)', above.lines === 5, `${above.lines}`);
  const tiny = K.wallForNozzle({ nozzle_mm: 0.4, layer_mm: 0.2, wanted_mm: 0.1 });
  check('wanted below one line → the 2-line minimum', tiny.lines === 2 && near(tiny.wall_mm, 0.857, 1e-3), `${tiny.lines}, ${tiny.wall_mm.toFixed(3)}`);
  for (const d of [0.2, 0.6, 0.8]) {
    const r = K.wallForNozzle({ nozzle_mm: d, wanted_mm: 2 });
    check(`nozzle ${d}: default layer = 50 % of the nozzle, wall ≥ 2 mm`, near(r.layer_mm, Math.round(0.5 * d / 0.02) * 0.02) && r.wall_mm >= 2 - 1e-9 && r.wall_mm - r.spacing_mm < 2,
      `layer ${r.layer_mm.toFixed(2)}, ${r.lines} lines, ${r.wall_mm.toFixed(3)} mm`);
  }
}

// ---- 2. every part closed, at every detail level and every hub mode
console.log('2. closed meshes');
for (const detail of Object.keys(K.DETAIL)) {
  const t0 = Date.now();
  const r = K.build({ detail });
  for (const [name, m] of Object.entries(r.parts)) {
    const c = K.checkClosed(m);
    check(`${detail}: ${name} closed (every directed edge once, its reverse once)`, c.closed, `${c.triangles} triangles, open ${c.open}, doubled ${c.doubled}`);
    check(`${detail}: ${name} has positive volume`, K.signedVolume(m) > 0, `${(K.signedVolume(m) / 1000).toFixed(1)} cm³`);
  }
  console.log(`     (${detail}: ${Date.now() - t0} ms)`);
}
for (const hub of [{ bore: 'bearings' }, { bore: 'profile', bore_kind: 'round' }, { bore: 'profile', bore_kind: 'hex' },
  { bore: 'profile', bore_kind: 'd' }, { bore: 'profile', bore_kind: 'square' }, { bore: 'solid', bore_kind: 'round' }, { bore: 'solid', bore_kind: 'hex' }]) {
  const r = K.build({ detail: 'low', ...hub });
  const c = K.checkClosed(r.parts.rotor);
  check(`hub ${hub.bore}${hub.bore_kind ? '/' + hub.bore_kind : ''}: rotor closed`, c.closed, `open ${c.open}, doubled ${c.doubled}`);
}
for (const shape of ['ellipse', 'ogive', 'cone']) {
  const r = K.build({ detail: 'low', nose_shape: shape });
  const c = K.checkClosed(r.parts.nose);
  check(`nose ${shape}: closed, positive volume`, c.closed && K.signedVolume(r.parts.nose) > 0, `open ${c.open}, doubled ${c.doubled}`);
}
{
  const r = K.build({ detail: 'low', ties: 0 });
  check('no ties: rotor closed', K.checkClosed(r.parts.rotor).closed);
  const r2 = K.build({ detail: 'low', rim: true, diameter_mm: 450 });
  check('exit rim on a 450 mm rotor: closed', K.checkClosed(r2.parts.rotor).closed);
  check('defaults: validity checks pass (root rises, blades keep a gap)', r2.checks.warn.length === 0 && K.build({ detail: 'low' }).checks.warn.length === 0, JSON.stringify(K.build({ detail: 'low' }).checks));
}

// ---- 3. placement and size
console.log('3. placement and size');
{
  const r = K.build({ detail: 'low' });
  const b = K.bounds(r.parts.rotor), p = r.params;
  check('rotor stands on the bed (min z = 0)', near(b.lo[2], 0, 1e-6), b.lo[2].toFixed(4));
  // the blade's thickness at the mouth reaches below the mouth plane by up to half a wall (its normal leans), so the rotor
  // stands that much higher — the expected height is a band, not a point (first run: 312.58 for 312 + wall 1.264)
  const H = r.dims.Ls + p.hub_front_mm + p.hub_back_mm;
  check('rotor height = length + hub front + hub back (+ up to one wall)', b.size[2] >= H - 0.01 && b.size[2] <= H + r.wall.wall_mm, b.size[2].toFixed(2));
  const span = Math.max(b.size[0], b.size[1]);
  // the three edges reach R only at their exit points, 120° apart — the box is narrower than D (first run: 280.6 for 300)
  check('rotor width within 0.8·D … D + one wall', span > 0.8 * p.diameter_mm && span < p.diameter_mm + r.wall.wall_mm + 1, span.toFixed(2));
}

// ---- 4. binary STL (researches/03 §2)
console.log('4. binary STL');
{
  const r = K.build({ detail: 'low' });
  const m = r.parts.rotor, bytes = K.toSTL(m, 'rotor');
  check('size = 84 + 50·N', bytes.length === 84 + 50 * m.f.length, `${bytes.length} bytes, ${m.f.length} triangles`);
  const head = Buffer.from(bytes.slice(0, 80)).toString('latin1');
  check('header does not start with "solid"', !head.startsWith('solid'), JSON.stringify(head.slice(0, 24)));
  const dv = new DataView(bytes.buffer);
  check('triangle count field = N', dv.getUint32(80, true) === m.f.length);
  const nx = dv.getFloat32(84, true), ny = dv.getFloat32(88, true), nz = dv.getFloat32(92, true);
  check('first normal is a unit vector', near(Math.hypot(nx, ny, nz), 1, 1e-4));
}

console.log(`-- ${total - bad} of ${total} as expected`);
process.exit(bad ? 1 : 0);
