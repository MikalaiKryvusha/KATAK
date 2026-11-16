# Bug 03 — a core floor does not stand on its hub: the blade cut is not planar

**Status:** ✅ DONE 2026-11-16 18:00 +03:00 · **Severity:** S2 (the rear floor prints with its hub 0.7 mm in the air)
**Version/build:** `main` at «… epic 02 phase 1» · **When/context:** 2026-11-16 17:53, the closing judge of phase 1 (finding 6);
confirmed by the main agent's own run. **Fixing:** this session.

## Symptom

Floor 2 of D 280, placed on the bed: the lowest hub vertex is at z = 0.685 mm; only the blade cut faces touch the bed.

## Repro

`node .work/tmp/verify-judge.mjs` → `F6 floor2: lowest hub vertex z = 0.685 mm`.

## Root cause

The floor boundary was set on the blade's MIDDLE surface (v where z = z_f); the sheet is then offset by ± wall/2 along its normal,
so its two faces cross the plane at different heights and the cut face runs across the sheet, 0.7 mm below the plane.

## Fix

The blade vertices of each floor are clamped to the floor's slab [z_f(i), z_f(i+1)] — the cut faces lie in the plane.

## Guard

`kalculator/test.mjs` part «2b. split»: every floor's hub and blade cut touch z = 0 (the lowest hub vertex < 0.01 mm).

## Decisions made without the owner

- none

## Links

`plans/03_epic02_phase1_split.md`

## ✅ STATUS: DONE (2026-11-16 18:00 +03:00)

Hygiene: `node kalculator/test.mjs` 83/83 — @guard split-parts-geometry green; red on the commit «… epic 02 phase 1».
Functional run: `node tools/ui-run.mjs` 50/50 — Chrome: D 280 → 5 parts, each STL within the bed; D 220 on Z 150 → «печатается из 2 этажей ядра», no skirt.
Report: `testcases/reports/2026-11-16_split-print-phase1-fixes.md`.
