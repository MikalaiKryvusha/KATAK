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
for (const pct of [10, 50, 100]) {
  const r = K.build({ detail: pct });
  check(`detail ${pct} %: rotor and nose closed`, K.checkClosed(r.parts.rotor).closed && K.checkClosed(r.parts.nose).closed, `${r.parts.rotor.f.length} triangles`);
}
for (const shape of ['ellipse', 'ogive', 'cone', 'sigmoid']) {
  const r = K.build({ detail: 'low', nose_shape: shape });
  const c = K.checkClosed(r.parts.nose);
  check(`nose ${shape}: closed, positive volume`, c.closed && K.signedVolume(r.parts.nose) > 0, `open ${c.open}, doubled ${c.doubled}`);
}
{
  const r = K.build({ detail: 'low', ties: 3 });
  check('ties on (3 planes): rotor closed', K.checkClosed(r.parts.rotor).closed);
  const r2 = K.build({ detail: 'low', rim: true, diameter_mm: 450 });
  check('exit rim on a 450 mm rotor: closed', K.checkClosed(r2.parts.rotor).closed);
  check('defaults: validity checks pass (root rises, blades keep a gap)', r2.checks.warn.length === 0 && K.build({ detail: 'low' }).checks.warn.length === 0, JSON.stringify(K.build({ detail: 'low' }).checks));
}
{
  // @guard ogive-is-not-ellipsoid (bugs/01)
  // THREAT:         the «оживало» choice silently produces another shape (the ellipsoid) in the STL the user prints
  // PROVED-AGAINST: the committed core where the ogive was normalised with L = 1 (volumes equal, mid radius 0.866)
  // GAP:            checks one aspect ratio (0.8) and the volume / mid-length radius, not every point of the profile
  // ON-REAL-PATH:   NOT YET — the page's nose STL is not opened in a slicer by this check
  const nv = (shape) => { const r = K.build({ detail: 'medium', nose_shape: shape, nose_ratio: 0.8 }); return { V: K.signedVolume(r.parts.nose), m: r.parts.nose, b: K.bounds(r.parts.nose) }; };
  const og = nv('ogive'), el = nv('ellipse');
  check('ogive nose is slimmer than the ellipsoid nose (volume ≥ 3 % smaller)', og.V < 0.97 * el.V, `${og.V.toFixed(0)} vs ${el.V.toFixed(0)} mm³`);
  // the radius at mid-length: the widest vertex in a thin slab around half the nose length, against the tangent ogive formula
  const L = 1.6, rho = (1 + L * L) / 2, rMid = Math.sqrt(rho * rho - (L - L / 2) ** 2) + 1 - rho;   // in units of the base radius
  const Rb = og.b.size[0] / 2, zMid = og.b.lo[2] + og.b.size[2] / 2;
  const slab = og.m.v.filter((p) => Math.abs(p[2] - zMid) < og.b.size[2] * 0.02).map((p) => Math.hypot(p[0] - (og.b.lo[0] + Rb), p[1] - (og.b.lo[1] + og.b.size[1] / 2)) / Rb);
  const got = Math.max(...slab);
  check('ogive nose: radius at mid-length = tangent ogive 0.810·R (ellipsoid would be 0.866)', Math.abs(got - rMid) < 0.02, `${got.toFixed(3)} vs ${rMid.toFixed(3)}`);
  // «стрела» (ideas/10, the owner's choice Ж): r/R = 2s² − s⁴ → 0.4375 at mid-length (the cone 0.5, the ogive 0.81)
  const sg = nv('sigmoid'), sRb = sg.b.size[0] / 2, sz = sg.b.lo[2] + sg.b.size[2] / 2;
  const sMid = Math.max(...sg.m.v.filter((p) => Math.abs(p[2] - sz) < sg.b.size[2] * 0.02).map((p) => Math.hypot(p[0] - (sg.b.lo[0] + sRb), p[1] - (sg.b.lo[1] + sg.b.size[1] / 2)) / sRb));
  check('«стрела» nose: radius at mid-length = 2s² − s⁴ = 0.4375·R (the cone would be 0.5)', Math.abs(sMid - 0.4375) < 0.02, sMid.toFixed(3));
  check('«стрела» nose: the tip is rounded, not a needle (a radius ≥ half a line at 1 % of the length)', (() => { const z1 = sg.b.hi[2] - sg.b.size[2] * 0.01;
    return Math.max(...sg.m.v.filter((p) => p[2] >= z1 - 0.05).map((p) => Math.hypot(p[0] - (sg.b.lo[0] + sRb), p[1] - (sg.b.lo[1] + sg.b.size[1] / 2)))) >= 0.2; })());
}

// ---- 2b. the print from parts (epic 02, phase 1; plans/03 criteria 2–3): D 280 on a 220 × 220 × 250 bed
console.log('2b. split');
{
  const inp = { diameter_mm: 280, wall_mm: 2, layer_mm: 0.2, bore: 'bearings', bore_mm: 8, bearing_od_mm: 22, bearing_w_mm: 7, detail: 'medium', ties: 0, rim: false };
  const sp = K.split(inp, { xy: 220, z: 250 });
  check('split D 280: 2 floors + 1 skirt printed 3 times = 5 parts', sp.floors === 2 && sp.parts.length === 3 && sp.total === 5, `${sp.parts.map((q) => `${q.id}×${q.count}`).join(', ')}`);
  for (const q of sp.parts) {
    const c = K.checkClosed(q.mesh);
    check(`split ${q.id}: closed, positive volume`, c.closed && K.signedVolume(q.mesh) > 0, `open ${c.open}, doubled ${c.doubled}`);
    check(`split ${q.id}: fits 220 × 220 × 250 after placement`, q.size[0] <= 220 && q.size[1] <= 220 && q.size[2] <= 250, q.size.map((x) => x.toFixed(0)).join(' × '));
  }
  const whole = K.build(inp).parts.rotor, vW = K.signedVolume(whole), vP = sp.parts.reduce((s, q) => s + q.count * K.signedVolume(q.mesh), 0);
  check('split D 280: Σ part volumes within 2 % of the whole rotor', Math.abs(vP - vW) / vW < 0.02, `${vP.toFixed(0)} vs ${vW.toFixed(0)} mm³ (${(100 * (vP - vW) / vW).toFixed(2)} %)`);
  check('assembly path D 280: no skirt point blocked from the front', sp.blocked === 0, `${(100 * sp.blocked).toFixed(1)} %, wrap ${sp.wrap_deg.toFixed(0)}°`);
  const big = K.split({ ...inp, diameter_mm: 340, detail: 'low' }, { xy: 220, z: 250 });
  check('control: D 340 — the skirt wraps > 120° and its path is blocked', big.blocked > 0.02 && big.wrap_deg > 120, `${(100 * big.blocked).toFixed(1)} %, wrap ${big.wrap_deg.toFixed(0)}°`);
  // @guard split-parts-geometry (bugs/02, bugs/03, bugs/04)
  // THREAT:         sliver skirts printed for nothing; a floor printed with its hub in the air; a skirt that cannot slide on
  // PROVED-AGAINST: the commit «… epic 02 phase 1» (skirt 22 mm at Z 150; hub at 0.685 mm; seam vertices on both sides of r_cut)
  // GAP:            the seam is checked on vertices, the slide itself is not simulated; one diameter per case
  // ON-REAL-PATH:   NOT YET — the owner's test print of the parts (epic phase 4)
  const zOnly = K.split({ ...inp, diameter_mm: 220 }, { xy: 220, z: 150 });
  check('bugs/02: D 220 on 220 × 220 × 150 → 2 floors, no skirt', zOnly.floors === 2 && !zOnly.parts.some((q) => q.kind === 'skirt'), zOnly.parts.map((q) => q.id).join(', '));
  const one = K.split({ ...inp, diameter_mm: 220 }, { xy: 220, z: 250 });
  check('control: D 220 on 220 × 220 × 250 → 1 part (the whole rotor)', one.total === 1, one.parts.map((q) => q.id).join(', '));
  const hubR = K.resolve(inp).p.hub_od_mm;
  for (const q of sp.parts.filter((x) => x.kind === 'floor')) {
    const zHub = Math.min(...q.mesh.v.filter((v) => Math.hypot(v[0], v[1]) <= K.resolve({ ...inp, diameter_mm: 280 }).p.hub_od_mm / 2 + 0.01).map((v) => v[2]));
    check(`bugs/03: ${q.id} stands on its hub (the lowest hub vertex at z ≈ 0)`, Math.abs(zHub) < 0.01, `${zHub.toFixed(3)} mm`);
  }
  const raw = K.split(inp, { xy: 220, z: 250 }, { place: false }), rc = raw.rCut;
  const coreOut = Math.max(...raw.parts.filter((q) => q.kind === 'floor').flatMap((q) => q.mesh.v.map((v) => Math.hypot(v[0], v[1]))));
  const skirtIn = Math.min(...raw.parts.find((q) => q.kind === 'skirt').mesh.v.map((v) => Math.hypot(v[0], v[1])));
  check('bugs/04: the seam is the cylinder r = r_cut — the core within it, the skirt outside it', coreOut <= rc + 1e-6 && skirtIn >= rc - 1e-6, `core ≤ ${coreOut.toFixed(3)}, skirt ≥ ${skirtIn.toFixed(3)}, r_cut ${rc}`);
  void hubR;
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

// ---- 5. physics against the recon's control examples (researches/01 §3.1, §3.6, §4.1, §5.1)
console.log('5. physics');
{
  check('ρ at sea level, 15 °C = 1.225 kg/m³ (§3.1)', near(K.density(0, 15), 1.225, 0.001), K.density(0, 15).toFixed(4));
  check('ρ at 1000 m, ISA 8.5 °C = 1.112 kg/m³ (§3.1)', near(K.density(1000, 8.5), 1.112, 0.002), K.density(1000, 8.5).toFixed(4));
  check('Γ(1.5) = 0.886227', near(K.gamma(1.5), 0.886227, 1e-5), K.gamma(1.5).toFixed(6));
  check('Rayleigh: c = 2·V̄/√π (§3.3)', near(K.weibullC(5, 2), 2 * 5 / Math.sqrt(Math.PI), 1e-6));
  const flat = { ...K.SITE_DEFAULTS, v_ref: 5, z_ref: 6, height_m: 6, alt_m: 0, temp_c: 15, weibull_k: 2, site: 'field' };
  const big = K.physics(flat, K.resolve({ diameter_mm: 1500 }));
  const windKWh = big.windMeanW * 8.76;
  check('wind energy through a 1.5 m rotor at 5 m/s Rayleigh = 2264 kWh/yr (§3.6)', Math.abs(windKWh - 2264) < 15, windKWh.toFixed(0));
  check('AEP of the 1.5 m rotor stays below Betz (1342 kWh/yr)', big.aep < 1342 && big.aep > 50, big.aep.toFixed(0));
  const small = K.physics({ ...flat, v_ref: 5 }, K.resolve({ diameter_mm: 300 }));
  check('rpm of D = 0.3 m at 5 m/s, λ 1.8 = 573 (§4.1)', near(60 * 1.8 * 5 / (Math.PI * 0.3), 573, 1) && near(small.model.lamOpt, 1.8, 1e-9), `λ_opt ${small.model.lamOpt}`);
  const park = K.physics({ ...flat, ve50: 42 }, K.resolve({ diameter_mm: 300 }));
  check('parking load of D = 0.3 m at Ve50 42 m/s ≈ 115 N (§5.1)', Math.abs(park.loads.park - 115) < 2, park.loads.park.toFixed(1));
  check('a steel shaft is sized and a bearing picked for it', park.shaft.d_mm > 6 && park.shaft.bearing.d >= park.shaft.d_mm, `${park.shaft.d_mm.toFixed(1)} mm → ${park.shaft.bearing.id}`);
  const printed = K.physics({ ...K.SITE_DEFAULTS, v_ref: 4.5, z_ref: 6, height_m: 6, site: 'field' }, K.resolve({ diameter_mm: 300 }));
  check('printed D = 0.3 m at 4.5 m/s: AEP of the order of §3.6 (≈ 8.6 kWh/yr, model differs) → 2…20', printed.aep > 2 && printed.aep < 20, printed.aep.toFixed(1));
  const pess = K.physics({ ...flat, cp_preset: 'pessimistic' }, K.resolve({ diameter_mm: 1500 }));
  check('control: the pessimistic preset gives less energy than the realistic one', pess.aep < big.aep, `${pess.aep.toFixed(0)} < ${big.aep.toFixed(0)}`);
  const dP = K.diameterForPower(5, 6, { ...K.SITE_DEFAULTS });
  check('«by power»: 5 W at 6 m/s needs a rotor of a few hundred mm', dP > 150 && dP < 600, dP.toFixed(0) + ' mm');
  // the shape of the AWM «Nett Power Curve» (researches/06 §2.2): rises up to 14 m/s, holds to the survival speed 35 m/s
  const pa = (v) => big.curve.find((c) => Math.abs(c.v - v) < 1e-9).pa;
  check('curve: the power at 14 m/s / at 12.5 m/s = (14/12.5)³ — the brochure gives 140/100 and ≈770/550', near(pa(14) / pa(12.5), (14 / 12.5) ** 3, 1e-9), (pa(14) / pa(12.5)).toFixed(3));
  check('curve: a plateau from 14 to 25 m/s (the brochure plots it to 24 m/s)', near(pa(20), pa(14), 1e-9) && near(pa(25), pa(14), 1e-9) && pa(14) > 0, `${pa(14).toFixed(1)} W`);
  check('control: the maximum at 14 m/s is the electrical pMaxEl and exceeds the rated one', big.pMaxEl > big.pRatedEl, `${big.pMaxEl.toFixed(1)} > ${big.pRatedEl.toFixed(1)} W`);
}

console.log(`-- ${total - bad} of ${total} as expected`);
process.exit(bad ? 1 : 0);
