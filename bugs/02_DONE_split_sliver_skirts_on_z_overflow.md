# Bug 02 — a rotor that overflows only in Z is still cut into sliver skirts

**Status:** ✅ DONE 2026-11-16 18:00 +03:00 · **Severity:** S2 (three useless 22 mm prints and a needless seam per blade)
**Version/build:** `main` at «feat(kalculator): print a rotor larger than the bed from parts — epic 02 phase 1» ·
**When/context:** 2026-11-16 17:53, the closing judge of epic 02 phase 1 (finding 4); confirmed by the main agent's own run.
**Fixing:** this session.

## Symptom

D 220 on a 220 × 220 × 150 bed, «Печать по частям: авто»: the page lists «Юбка лопасти × 3, 22 × 22 × 11 мм» although two core
floors alone fit (the whole rotor is 206 × 199 mm in X/Y).

## Repro

`node .work/tmp/verify-judge.mjs` (throwaway) → `F4 D220 bed 220x150: floor1x1 111x113x112 | floor2x1 201x195x112 | skirtx3 22x22x11`.

## Root cause

INTENT: code cuts at r_cut = bed/2 − 5 mm always; the task expects skirts only when the floors do not fit the bed in X/Y; the
epic says «этажи ядра и юбки … выбор числа деталей по столу». `split()` applied the radial cut unconditionally.

## Fix

`split()` first builds the floors with no radial cut; skirts are cut only when a floor does not fit X/Y.

## Guard

`kalculator/test.mjs` part «2b. split»: D 220 on 220 × 220 × 150 → 2 floors, no skirt; D 220 on 220 × 220 × 250 → 1 part.

## Decisions made without the owner

- none

## Links

`plans/02_EPIC_split_print.md` · `plans/03_epic02_phase1_split.md`

## ✅ STATUS: DONE (2026-11-16 18:00 +03:00)

Hygiene: `node kalculator/test.mjs` 83/83 — @guard split-parts-geometry green; red on the commit «… epic 02 phase 1».
Functional run: `node tools/ui-run.mjs` 50/50 — Chrome: D 280 → 5 parts, each STL within the bed; D 220 on Z 150 → «печатается из 2 этажей ядра», no skirt.
Report: `testcases/reports/2026-11-16_split-print-phase1-fixes.md`.
