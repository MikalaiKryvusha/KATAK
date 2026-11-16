# Test run report — the AWM power curve, Minsk by default, the ogive fairing (bugs/01)

**Created:** 2026-11-16 17:13 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** working tree on top of
the commit «the power chart explains itself …» (the edits uncommitted at the moment of the runs)

## 1. Work

1. The power curve after the AWM brochure (`researches/06` §5): rises up to 14 m/s, holds to 35 m/s; the result names the
   maximum at 14 m/s; the chart mark reads «максимум 14,0».
2. The site defaults are Minsk (owner 16:53 «город Минск по умолчанию»; `researches/05`).
3. bugs/01 — the «оживало» fairing was generated as the ellipsoid.

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright (channel `chrome`, headless).
The page opened from disk (`file://`), no network. No production exists — the real-world line does not apply.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 17:06 +03:00 | `node .work/tmp/parity.mjs` (throwaway) | 0 · the table of `researches/06` §3 |
| 2 | 2026-11-16 17:09 +03:00 | `node kalculator/test.mjs` | 0 · 63 of 63 |
| 3 | 2026-11-16 17:09 +03:00 | `node .work/tmp/oldk/test.mjs` (the same checks on the committed core) | 1 · the two curve checks red, the third throws |
| 4 | 2026-11-16 17:10 +03:00 | `node tools/ui-run.mjs` | 1 · 40 of 41 — the legend case still expected «отключение 14,0» |
| 5 | 2026-11-16 17:10 +03:00 | `node tools/ui-run.mjs` | 0 · 41 of 41 |
| 6 | 2026-11-16 17:12 +03:00 | `node kalculator/test.mjs`; the same on the committed core | 0 · 65 of 65; the ogive guard red there |
| 7 | 2026-11-16 17:12 +03:00 | `node tools/ui-run.mjs`; `--page` the committed page | 0 · 42 of 42; the bugs/01 case red there |

## 4. Checks

Hygiene: `node kalculator/test.mjs` 65/65; `kaif-voice-lint check kalculator/index.html` 0; `node tools/embed-icon.mjs --check` OK.
Functional run: Chrome opened the page from disk and walked the cases below as a user; the read results are quoted.

| Case | Status | Observed |
|---|---|---|
| curve: P(14)/P(12.5) = (14/12.5)³ (core) | pass | 1.405; the brochure 1.40 (140/100, ≈770/550) |
| curve: a plateau 14–25 m/s (core) | pass | 701.5 W at 14, 20 and 25 m/s for D 1500 |
| result: «Наибольшая мощность при 14 м/с» | pass | the row is in the result table |
| chart: «максимум 14,0» | pass | the mark text |
| defaults: the site is Minsk | pass | `{"v_ref":"3.7","z_ref":"10","terrain":"suburb","site":"roof_high","alt_m":"220","temp_c":"7","weibull_k":"2"}` |
| bugs/01: «оживало» nose STL smaller than «эллипсоид» | pass | 4838 vs 5553 mm³ (the committed page: 5553 vs 5553) |
| the other 37 cases | pass | see the run output |

## 5. Found

- bugs/01 (found by the recon subagent, confirmed and fixed here).
- Run 4: a stale expectation in the run itself, after the planned rename of the mark — fixed in the run.
- Observation, not a defect: with Minsk and the installation height 6 m in a suburb (z0 = 1 m) the hub wind is 2.9 m/s, below
  the cut-in 3 m/s, and the mean power reads 0.01 W. The installation height of a roof turbine is the owner's question.

## 6. Traces

`.work/tmp/ui-run/` (git-ignored): `nose-ellipse.stl`, `nose-ogive.stl`, the screenshots; `.work/tmp/ui-run-old/`.

## 7. Verdict

pass — every case as expected; each new guard proved red on the committed version.
