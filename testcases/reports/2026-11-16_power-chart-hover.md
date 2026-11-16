# Test run report — the power chart: two axes, named speeds, a legend, the hover box (idea 09)

**Created:** 2026-11-16 17:04 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** working tree on top of
the commit «a self-contained page …» (the chart edits uncommitted at the moment of the runs)

## 1. Work

The owner's word, chat of session 2, 16:47: «графику нехватает пояснений и интерактива ховером мыши» (`ideas/09`). Basis: the
acceptance criteria 1–5 of `ideas/09_power_chart_hover_and_legend.md`; the core's power curve (`ph.curve`, every 0.5 m/s).

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright (channel `chrome`, headless,
1440 × 900). The page opened from disk (`file://`), no network, the page's defaults. No production exists — the real-world
line does not apply.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 17:00 +03:00 | `node tools/ui-run.mjs --shots .work/tmp/ui-run` | 0 · 34 of 34 (before the hover cases existed) |
| 2 | 2026-11-16 17:01 +03:00 | `node tools/ui-run.mjs --shots .work/tmp/ui-run` | 1 · 37 of 38 — the hover case read an empty box |
| 3 | 2026-11-16 17:02 +03:00 | `node tools/ui-run.mjs --shots .work/tmp/ui-run` | 0 · 38 of 38 |
| 4 | 2026-11-16 17:03 +03:00 | `node kalculator/test.mjs` | 0 · 60 of 60 |

## 4. Checks

Hygiene: `node kalculator/test.mjs` 60/60 (the core is unchanged); `kaif-voice-lint check kalculator/index.html` — 0 findings.
Functional run: Chrome opened the page from disk, scrolled to the chart, moved the mouse over it and read the box.

| Case | Status | Observed |
|---|---|---|
| legend and named marks on the chart | pass | «включение 3,0 · средняя 4,0 · номинал 12,5 · отключение 14,0 · электрическая мощность · доля времени» |
| the right axis is in % | pass | the «%» label at the right axis |
| hover at 10 m/s → speed, power equal to the core curve, share of time | pass | «Скорость ветра: 10,0 м/с · Мощность: 2,17 Вт · Доля времени: 0,4 %» against the core's 2.173 W |
| control: the pointer leaves the chart → the box hides | pass | `visibility="hidden"` |
| the other 34 cases | pass | see the run output |

## 5. Found

- Run 2: the hover case failed because the chart lay below the 900 px viewport and the mouse moved outside the window — a
  defect of the run, not of the page: the case now scrolls the chart into view first (`scrollIntoViewIfNeeded`).

## 6. Traces

`.work/tmp/ui-run/1e-chart-hover.png` — the chart with the hover box at 10 m/s (git-ignored).

## 7. Verdict

pass — the four criteria checked by the run hold. Criterion «tap on a phone» is coded (`pointerdown`) and not yet walked by
the run with a touch emulation.
