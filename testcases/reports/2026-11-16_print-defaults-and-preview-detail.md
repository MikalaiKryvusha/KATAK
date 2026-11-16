# Test run report — the owner's print defaults, the layer-range warning, the preview at the print detail

**Created:** 2026-11-16 16:48 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** working tree on top of
`551836a` (the edits uncommitted at the moment of the runs)

## 1. Work

Three words of the owner in the chat of session 2: «Высота слоя мм по умолчанию 0.2 мм» (16:42), «толщина стенки ротора по
уполчанию 2 мм» (16:43), «превью должно строиться при той детализации, которая указана для печати» (16:43). Plus the
layer-range warning of researches/02 §4 (25–75 % of the nozzle), which the fixed 0.2 mm default makes reachable. Basis: the
owner's words above, researches/02 §2 (T(N)) and §4.

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright (channel `chrome`, headless).
The page opened from disk (`file://`), no network. Data: the page's defaults plus the scenario inputs of §4. No production
exists — the real-world line does not apply.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 16:44 +03:00 | `node .work/tmp/bench.mjs` (throwaway) | 0 · detail 100 % → 81 088 triangles in 153–168 ms |
| 2 | 2026-11-16 16:46 +03:00 | `node kalculator/test.mjs` | 0 · 60 of 60 |
| 3 | 2026-11-16 16:47 +03:00 | `node tools/ui-run.mjs --shots .work/tmp/ui-run` | 0 · 25 of 25 |

## 4. Checks

Hygiene: `node kalculator/test.mjs` 60/60 — the core is unchanged by these edits; `kaif-voice-lint check kalculator/index.html` — 0 findings.
Functional run: Chrome opened the page from disk and walked the cases below as a user; the read results are quoted.

| Case | Status | Observed |
|---|---|---|
| defaults: layer field 0.2, wall field 2 | pass | `0.2 / 2` |
| defaults: wall snapped up to whole lines of the 0.4 nozzle | pass | «2,08 мм = 5 линий», «0,20 / 0,45 мм» |
| defaults: no layer-range warning at nozzle 0.4 (50 %) | pass | none |
| nozzle 0.2 with layer 0.2 → warning | pass | «Высота слоя 0,20 мм составляет 100 % диаметра сопла.» |
| control: nozzle back to 0.4 → warning gone | pass | none |
| control: preview at detail 10 % smaller than at 40 % | pass | 3 440 < 18 592 triangles |
| preview triangles = rotor STL triangles at detail 40 % | pass | 18 592 vs 18 592 |
| the 18 earlier cases (smoke, figures, nozzle → lines, Z overflow, «by power», downloads, EN, phone, console) | pass | see the run output |
| the agent looked at `1-defaults-ru.png` | pass | the 3D model at 40 % renders; «18 592 △ · 165 ms» under it |

## 5. Found

none

## 6. Traces

Screenshots and STL files of run 3: `.work/tmp/ui-run/` (git-ignored, not committed): `1-defaults-ru.png`, `2-defaults-en.png`,
`3-phone-ru.png`, `katak-rotor-200mm-5x0.4.stl`, `katak-nose-200mm-5x0.4.stl`.

## 7. Verdict

pass — every case as expected; the core is untouched (60/60). The semantic §7B pass over the new page strings is not done in
this run (it goes with the idea 07 texts).
