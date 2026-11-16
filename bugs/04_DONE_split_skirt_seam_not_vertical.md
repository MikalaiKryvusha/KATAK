# Bug 04 — the skirt seam is not a vertical surface: sliding the skirt in from the nose cuts into its own core blade

**Status:** ✅ DONE 2026-11-16 18:00 +03:00 · **Severity:** S2 (the assembly order the page prints cannot be followed)
**Version/build:** `main` at «… epic 02 phase 1» · **When/context:** 2026-11-16 17:53, the closing judge of phase 1 (finding 7,
`.work/tmp/judge-split/probe2.mjs`: 90 / 123 / 64 of 615 skirt points inside the own core blade at 0.5 / 1 / 2 mm before the
seat when the skirt comes from the nose; 0 from the rear). **Fixing:** this session.

## Symptom

The page says «каждая деталь надвигается вдоль оси со стороны носа»; moving the skirt along the axis from the nose, the skirt's
edge passes through its own core blade's edge before the seat.

## Root cause

Like bug 03: the seam was set on the middle surface at r = r_cut and the sheet offset along its normal, so the seam face is
inclined to the axis; `assemblyBlocked()` checks only the OTHER blades, so «0 % blocked» did not cover the own seam.

## Fix

Core blade vertices are clamped to r ≤ r_cut and skirt vertices to r ≥ r_cut — the seam is the vertical cylinder r = r_cut, and
a move along the axis slides along it (the same surface the dovetail comb of phase 2 is drawn on).

## Guard

`kalculator/test.mjs` part «2b. split»: the seam vertices of the core and of the skirt lie on r = r_cut (± 0.01 mm); the judge's
`probe2.mjs` re-run: 0 intrusions from the nose.

## Decisions made without the owner

- none

## Links

`researches/07` §4 · `plans/02_EPIC_split_print.md`

## ✅ STATUS: DONE (2026-11-16 18:00 +03:00)

Hygiene: `node kalculator/test.mjs` 83/83 — @guard split-parts-geometry green; red on the commit «… epic 02 phase 1».
Functional run: `node tools/ui-run.mjs` 50/50 — Chrome: D 280 → 5 parts, each STL within the bed; D 220 on Z 150 → «печатается из 2 этажей ядра», no skirt.
Report: `testcases/reports/2026-11-16_split-print-phase1-fixes.md`.
