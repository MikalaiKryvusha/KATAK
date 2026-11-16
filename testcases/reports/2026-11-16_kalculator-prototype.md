# Test run report — KATAK kalculator prototype (phases A–C of plans/01)

**Created:** 2026-11-16 16:16 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** working tree on top of
the commit `feat(kalculator): phase A` (the page with physics + UI, uncommitted at the moment of the runs)

## 1. Work

The first prototype of `kalculator/index.html`: the geometry core (blades on the ruled surface of researches/01 §6.2, hub
modes, ties, rim, nose, wall snapped to whole extrusion lines), the physics core (researches/01 §2–§5), and the page (form,
RU/EN, result, chart, WebGL preview, STL downloads). Basis: `plans/01_EPIC_kalculator_prototype.md` acceptance criteria 1–4,
the control examples of researches/01 §3.6 / §4.1 / §5.1 and the wall formula of researches/02 §2.

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright 1.65.1 (channel `chrome`,
headless), PrusaSlicer console, Blender 5.3. The page opened from disk (`file://`), no network. Data: the page's defaults
plus the scenario inputs listed in §4. No production exists yet — the real-world line does not apply.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 16:05 +03:00 | `"C:/Program Files/Prusa3D/PrusaSlicer/prusa-slicer-console.exe" --info .work/tmp/stl/katak-rotor-300mm.stl .work/tmp/stl/katak-nose-300mm.stl` | 0 · rotor and nose `manifold = yes` |
| 2 | 2026-11-16 16:08 +03:00 | `"C:/Program Files/Blender Foundation/Blender 5.3/blender.exe" -b -P tools/render-stl.py -- <rotor.stl> <png> iso` | 0 · render shows the ties (after two fixes) |
| 3 | 2026-11-16 16:14 +03:00 | `node kalculator/test.mjs` | 0 · 57 of 57 |
| 4 | 2026-11-16 16:15 +03:00 | `node tools/ui-run.mjs` | 1 · 11 of 12 — the «by power» expectation was too narrow (see §5) |
| 5 | 2026-11-16 16:16 +03:00 | `node tools/ui-run.mjs` | 0 · 12 of 12 |

## 4. Checks

- Hygiene: `node kalculator/test.mjs` 57/57 — wall rule (nozzles 0.2–0.8, boundaries at T(N)), closedness of rotor and
  nose at 4 detail levels and 7 hub modes, placement, STL bytes, physics against the recon's control examples (ρ 1.225;
  2264 kWh/yr of wind through 1.5 m; 573 rpm; 114.6 N parking; AEP of 1.5 m = 313 kWh/yr, inside the recon's 180–500).
- Functional run: `node tools/ui-run.mjs` walked the page in Chrome as a user and READ the screen:
  1. pass — the page opens from disk; the result shows mean power, energy per year, rpm;
  2. pass — the default 200 mm turbine passes the geometry checks and fits a 220 mm bed (no «больше стола»);
  3. pass — nozzle 0.4 / layer 0.2 / wall 1.0 → «1,26 мм = 3 линии»; nozzle 0.8 → «1,76 мм = 2 линии»;
  4. pass — «by power» 5 W at 6 m/s → «нужен ротор ≈ 580 мм»;
  5. pass — rotor and nose download as binary STL, size = 84 + 50·N (10 504 and 24 576 triangles);
  6. pass — English: no Cyrillic in the visible text; decimal point in numbers;
  7. pass — phone 390 px: no horizontal scroll (screenshot `3-phone-ru.png`, read by eye: one column);
  8. pass — no console errors in the whole run.
- **Outside the page:** PrusaSlicer reads both STL as manifold; Blender renders an Archimedes spiral rotor (nose to the wind,
  three blades opening to the exit, axial ties between the turns) — looked at by eye.

Not covered (said aloud): slicing to G-code with a real printer profile; a real print; the preview's drag and zoom by mouse
(the run does not drive the pointer); the voice check of the page texts (see STATUS).

## 5. Found

- Tube caps wound the wrong way — every rib open (core test, open 144) → fixed before this report.
- Ties silently missing twice (fixed radius crossed one blade; perpendicular ties ran into the hub) → axial ties; seen in the
  Blender render, not in the closedness test.
- Default L/D 0.9 left the blades 6.0 mm apart at the nose for 7.5 mm needed → L/D derived from the gap rule (0.92–0.93).
- Default 300 mm rotor (292 mm tall) did not fit a 220 mm bed → default 200 mm.
- Russian plural «3 линий» → «3 линии» (Intl.PluralRules).
- Run 4's red was the test's own expectation («5 Вт», the page prints «5,0 Вт») — stand printed in §3; the page was right.

## 6. Traces

Screenshots and renders: `testcases/reports/2026-11-16_kalculator-prototype/` — `1-defaults-ru.png`, `2-defaults-en.png`,
`3-phone-ru.png`, `blender-rotor-iso.png`, `blender-rotor-front.png`. Downloaded STL files: `.work/tmp/ui-run/` (not kept).

## 7. Verdict

**pass** — the prototype computes, generates closed printable STL and works in both languages and at phone width; open items
are listed in §4 «Not covered».
