# Plan 04 — epic 02, phase 2: the dovetail comb on the skirt seam, the stop shelf, the hub spigot, the glue gap

> **Created:** 2026-11-16 · **Parent:** `plans/02_EPIC_split_print.md` (row «2 · сочленение») · **Status:** 🔲 next ·
> **Outbound:** the comb defaults (pitch, depth, angle, gap) to the owner until a test print

## Goal vector

**Achieve:** the parts of the print from parts go together mechanically and hold on a glue seam (the owner's words of 17:26 and
17:33: «вставлялись механически и брались швом на клей», «гребёнка ласточкиных хвостов»): the core's seam carries dovetail tabs,
the skirt the matching sockets, both with vertical walls; a shelf stops the skirt; the floors meet on a hub spigot.
Anchor: «2 · сочленение | гребёнка ласточкиных хвостов на вертикальном шве юбки …».

## Acceptance criteria (the epic's 4–5)

1. Situation. D 280 on 220 × 220 × 250, defaults. Action. The core builds the parts. Result. The core seam carries N dovetail
   tabs (N = ⌊seam length / pitch⌋, inset from the ends), the skirt the matching sockets; between every tab wall and its socket
   wall the gap equals the page field (0.2 mm default) ± 0.02 mm. Check. `node kalculator/test.mjs` part «comb».
2. The tab and socket walls are vertical: every flank vertex of a tab lies on its flank curve in the top view (± 0.01 mm).
3. The skirt slides on from the nose: on the axial path no skirt point enters the core (the judge's intrusion probe, on the real
   meshes of `split(…, { place: false })`): 0 points at 0.25 / 0.5 / 1 / 2 / 5 mm before the seat.
4. The floors: the rear floor's hub carries a spigot of half the hub wall, the front floor's hub the matching recess; the gap as
   in 1.
5. Every part closed; PrusaSlicer `--info` → manifold = yes; the parts look right in a render (the agent's eye).

## Steps

- [ ] 1. Core: the comb in the top view — tab footprint (θ, r): a dovetail between r_cut and r_cut + depth, half-width growing with
      r by the dovetail angle; tabs along the seam arc at the pitch, inset by half a pitch from the ends.
- [ ] 2. Core: the core gets tab regions (one region per tab in the blade's coordinates: r from max(r_cut, the flank) to
      r_cut + depth), clipped by the floor planes like the rest of the floor; the skirt gets its base region r ≥ r_cut + depth + gap
      and its teeth region r_cut ≤ r ≤ the flank − gap between the tabs.
- [ ] 3. Core: vertical walls — after the offset, every vertex near a flank is put onto its flank curve in the top view, near
      r_cut + depth onto that cylinder (EXP-0006).
- [ ] 4. Core: the stop shelf — a strip of two lines on the core's leeward face under the seam, reaching r_cut + depth.
- [ ] 5. Core: the hub spigot and recess at every floor plane.
- [ ] 6. Page: the field «Зазор под клей, мм» (0.2); the comb pitch, depth and angle as constants with the owner's open question.
- [ ] 7. Tests (criteria 1–5), the run report, renders, `/fable-judge` re-judging phases 1 and 2 together.

## Risks

- (a) The tab regions overlap the base region in the neck — closed shells overlapping, the slicer unions them (the hub and the
      blades already rely on it); the closedness test runs per shell.
- (b) A thin tooth between two tabs near the seam ends — inset the tabs; drop a tooth narrower than two lines.
- (b) The skirt's print orientation (stands on a few points) — decide with the owner after the comb exists (supports or a tilt).
