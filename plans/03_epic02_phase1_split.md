# Plan 03 — epic 02, phase 1: cut the computed rotor into core floors and skirts (butt seams)

> **Created:** 2026-11-16 · **Parent:** `plans/02_EPIC_split_print.md` (row «1 · разрез») · **Status:** 🔧 in progress ·
> **Outbound:** —

## Goal vector

**Achieve:** when the rotor does not fit the printer, the core cuts it into core floors (planes across the axis) and three
identical skirts (outside r_cut in the top view), each a closed mesh that fits the bed; the page lists the parts and gives
their STL files. Anchor: «1 · разрез | этажи ядра и юбки как отдельные замкнутые сетки, стык встык; выбор числа деталей по
столу; поле «Печать по частям» и список деталей с кнопками STL».

## Acceptance criteria (the epic's 1–3)

1. D 280, bed 220 × 220 × 250 → 5 parts: 2 floors + 1 skirt STL printed 3 times. `node tools/ui-run.mjs` case «split».
2. Every part closed; every part's box ≤ 220 × 220 × 250 mm after its placement; Σ volumes within 2 % of the whole rotor.
   `node kalculator/test.mjs` part «split».
3. D 280: 0 % of a skirt blocked on the axial path from the front. `node kalculator/test.mjs` case «assembly path».

## Steps

- [ ] 1. Core: `blade()` takes a region in its own coordinates — u range and v range per row (v_lo(u), v_hi(u)); rows narrower
      than 0.3 mm are dropped; every contiguous run of rows becomes its own `gridSolid`.
- [ ] 2. Core: `split(p, d, bed)` — floors f = ⌈H / Z⌉ at equal planes; r_cut = bed_xy/2 − 5 mm; the core blade v ≤ v_c(u),
      the skirt v ≥ v_c(u), the floor split v ≶ v_f(u) (z linear in v along the blade's straight generator); the hub cut at the
      planes (revolve profiles per floor); ties and rim off in split mode (a warning names it).
- [ ] 3. Core: placement — each part stands on z = 0; the skirt turned about the axis to its smallest footprint.
- [ ] 4. Core: `assemblyBlocked(p, d, r_cut)` — the share of skirt points with another blade in front at the same angle and radius.
- [ ] 5. Page: field «Печать по частям» (авто · нет); the parts table in step 5 (name · count · size) and one STL button per part.
- [ ] 6. Tests: `kalculator/test.mjs` part «split» (criteria 2–3, control: D 220 → one part); `tools/ui-run.mjs` case «split»
      (criterion 1, the downloaded STLs fit the bed).
- [ ] 7. Run report in `testcases/reports/`; a look at the parts (render or preview) by the agent; commit; `/fable-judge`.

## Risks

- (a) Degenerate rows at the ends of a region (width → 0): dropped rows leave a sliver ≤ 0.3 mm — counted by the volume check.
- (b) The floor plane may cross a blade where z(u, v) is not monotone in v — it is (z_o > z_h), asserted in the test.
- (b) The bearing seats of the hub must not be cut by a floor plane — the plane is moved off a seat if it falls on one.
- (c) Ties and the exit rim cannot be split in this phase — switched off in split mode with a visible warning.
