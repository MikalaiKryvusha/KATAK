# Test run report — epic 02 phase 1: the judge's findings fixed (bugs 02, 03, 04 and the small ones)

**Created:** 2026-11-16 18:01 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** working tree on top of
«feat(kalculator): print a rotor larger than the bed from parts — epic 02 phase 1» (the fixes uncommitted during the runs)

## 1. Work

The closing judge of phase 1 (17:53, REFUTED narrowly): bugs/02 (sliver skirts when the rotor overflows only in Z), bugs/03
(the floor cut not planar — the rear floor's hub 0.685 mm above the bed), bugs/04 (the seam not vertical — the skirt cannot
slide in from the nose); the warning text «больше 120°» at 120°; «три юбки» in the hint; the drive-letter case in the harness;
false lines in `plans/03`. Basis: the judge's report, the bug documents, EXP-0006.

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright (channel `chrome`, headless).
The page opened from disk, no network. No production exists — the real-world line does not apply.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 17:55 +03:00 | `node .work/tmp/verify-judge.mjs` (throwaway) on the committed core | 0 · findings 4 and 6 reproduced: skirt 22 × 22 × 11; hub at 0.685 mm |
| 2 | 2026-11-16 17:57 +03:00 | `node kalculator/test.mjs`; the same checks on the committed core | 0 · 83 of 83; the four new checks red on the committed core |
| 3 | 2026-11-16 17:59 +03:00 | `node tools/ui-run.mjs --shots .work/tmp/ui-run` | 0 · 50 of 50 |
| 4 | 2026-11-16 17:59 +03:00 | `node .kaif/tools/kaif-voice-lint.mjs load`, then `check kalculator/index.html` | 0 · 0 findings (first check flagged the portrait older than an hour) |

## 4. Checks

Hygiene: `node kalculator/test.mjs` 83/83 — @guard split-parts-geometry: D 220 on 220 × 220 × 150 → 2 floors, no skirt; D 220
on 220 × 220 × 250 → 1 part; both floors' lowest hub vertex at 0.000 mm; core ≤ 105.000 mm and skirt ≥ 105.000 mm from the axis
(r_cut 105). On the committed core: skirt present, «floor1, skirt», hub at 0.685 mm, core to 105.755 mm — red.
Functional run: Chrome on the page from disk, by the user's path:

| Case | Status | Observed |
|---|---|---|
| D 280 → 5 parts, the STLs within the bed | pass | 140 × 143 × 137 · 210 × 210 × 137 · 134 × 134 × 72 mm |
| bugs/02: D 220 on Z 150 → floors only | pass | «Ротор выше стола принтера и печатается из 2 этажей ядра.», no skirt row |
| the other 48 cases | pass | see the run output |

## 5. Found

- The stamp-gate hook refused a typed time once more (18:01 at 18:00) — EXP-0004 «Recurred» line; the variable method used since.

## 6. Traces

`.work/tmp/ui-run/` (git-ignored); `.work/tmp/verify-judge.mjs`; the judge's probes `.work/tmp/judge-split/`.

## 7. Verdict

pass — every finding of the judge closed by a fix, a guard or a corrected line; the volume of the parts is now −1.2 % of the
whole rotor (the planar floor cut removes the sheet's slanted ends).
