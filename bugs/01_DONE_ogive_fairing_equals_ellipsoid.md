# Bug 01 — the «ogive» nose fairing is generated as the ellipsoid

**Status:** ✅ DONE 2026-11-16 17:13 +03:00 · **Severity:** S2 (a printed fairing of the wrong shape costs hours of printing)
**Version/build:** `main` at the commit «the power chart explains itself …» · **When/context:** 2026-11-16, session 2 —
reported by the nose-shape recon subagent (`researches/04_nose_cone_shapes/README.md` §4), confirmed by the main agent by
reading the code. **Fixing:** this session.

## Symptom

The page offers three fairing shapes (ellipsoid · ogive · cone). Choosing «оживало» produces exactly the ellipsoid: the
downloaded nose STL and the preview are identical to the «эллипсоид» ones.

## Repro (deterministic)

1. `node kalculator/test.mjs` on the broken version: the nose volumes for `nose_shape: 'ogive'` and `'ellipse'` are equal.
2. By hand: in `nose()` (kalculator/index.html, the core) the ogive branch reads
   `const L = 1, rho = (1 + L * L) / 2, x = 1 - u; return Math.sqrt(rho² − (L − x)²) + 1 − rho;` → with L = 1, rho = 1 and
   r = √(1 − u²), the ellipsoid's own line.

## Root cause

INTENT: code does «the tangent ogive in units of the base radius with L = 1»; the task expects «the tangent ogive of the
fairing's own length-to-diameter ratio»; the spec (the field «Отношение длины обтекателя к диаметру», `researches/01` §6.8)
says the length is 2·R·nose_ratio. The aspect ratio was dropped when the formula was normalised: in units of R the length is
L = Ln/Rb = 2·nose_ratio, never 1. A tangent ogive with L = R is a quarter circle — the ellipsoid.

## Fix

`const L = Ln / Rb, rho = (1 + L * L) / 2, x = (1 - u) * L;` — the tangent ogive r(x) = √(ρ² − (L − x)²) + 1 − ρ with x from
the tip, in units of Rb; r(0) = 0 at the tip, r(L) = 1 and tangent to the base.

TWINS: searched `const L = 1|L = 1,|R = 1,|= 1, rho` in kalculator/index.html — found 0 other sites.

## Guard

`kalculator/test.mjs` part 2: the ogive nose is slimmer than the ellipsoid one (its volume is at least 3 % smaller) and its
radius at mid-length matches the tangent ogive formula. Proved red on the broken version (the run report of the fix).

## Decisions made without the owner

- The fix keeps the tangent ogive (the shape the field name promises); the owner's new «arrow» shape is a separate profile
  (`ideas/10`).

## Links

`researches/04_nose_cone_shapes/README.md` §4 · `ideas/10_arrow_like_fairing_shape.md`

## ✅ STATUS: DONE (2026-11-16 17:13 +03:00)

Hygiene: `node kalculator/test.mjs` 65/65 — the guard `ogive-is-not-ellipsoid` green (volume 8808 vs 10115 mm³, mid radius
0.818 vs 0.810 R) and red on the broken core (10115 vs 10115 mm³; 0.872 R).
Functional run: `node tools/ui-run.mjs` 42/42 — Chrome picks «оживало» on the page, downloads the nose STL and reads its volume:
4838 mm³ against 5553 mm³ for «эллипсоид»; the same case on the committed page gives 5553 vs 5553 (red).
Report: `testcases/reports/2026-11-16_awm-curve-minsk-ogive.md`.
