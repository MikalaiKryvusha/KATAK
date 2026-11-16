# Test run report — the self-contained page, the intro row, the Ender 3 defaults, the shaft warning

**Created:** 2026-11-16 16:57 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** working tree on top of
the commit «the owner's print defaults» (the edits uncommitted at the moment of the runs)

## 1. Work

Words of the owner in the chat of session 2: «HTML наш самодостаточек» (16:50), «дыру убрать, туда поместить в ряд карточки,
текст вверху широко» (16:51), «пластик PETG по умолчанию», «диаметр ротора максимальный возможный для Эндера 3 220мм по
уполчанию», «детализация модели 70 процентов по умолчанию», «подшипник 608 по умолчанию» (16:53), «внутренний профиль круглый
под шпильку или трубку под 608 подшипник по умолчанию» (16:54). Basis: those words, `HOUSE_RULES.md` R7, the Ender-3 build
volume 220 × 220 × 250 mm (3dprinting.com, clevercreations.org).

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright (channel `chrome`, headless).
The page opened from disk (`file://`), no network. Data: the page's defaults plus the scenario inputs of §4. No production
exists — the real-world line does not apply.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 16:51 +03:00 | `node tools/embed-icon.mjs --check` (before embedding) | 1 · DRIFT — the red proof of the pair check |
| 2 | 2026-11-16 16:51 +03:00 | `node tools/embed-icon.mjs` then `--check` | 0 · OK |
| 3 | 2026-11-16 16:52 +03:00 | `node tools/ui-run.mjs --shots .work/tmp/ui-run` | 0 · 30 of 30 |
| 4 | 2026-11-16 16:52 +03:00 | `node tools/ui-run.mjs --page .work/tmp/old/kalculator/index.html` (the committed page) | 1 · 25 of 30 — the 4 new self-contained and intro cases go red, as they must |
| 5 | 2026-11-16 16:54 +03:00 | `node .work/tmp/maxd.mjs` (throwaway) | 0 · D 220 → 206.1 × 199.3 × 222.8 mm; largest fit 235 mm |
| 6 | 2026-11-16 16:56 +03:00 | `node kalculator/test.mjs` | 0 · 60 of 60 |
| 7 | 2026-11-16 16:56 +03:00 | `node tools/ui-run.mjs --shots .work/tmp/ui-run` | 0 · 34 of 34 |

## 4. Checks

Hygiene: `node kalculator/test.mjs` 60/60; `node tools/embed-icon.mjs --check` OK (proved red in run 1).
Functional run: Chrome opened the page from disk and walked the cases below as a user; the read results are quoted.

| Case | Status | Observed |
|---|---|---|
| self-contained: no request beyond the page | pass | none (run 4 on the old page: `…/design/icon/katak-icon.svg`) |
| self-contained: the tab icon is a data URI | pass | `data:image/svg+xml…` |
| self-contained: no «researches/» in the visible text | pass | none |
| intro 1440 px: three cards in one row under a full-width lede | pass | tops 285/285/285, lede 1192 of 1192, gap 16 px (old page: 161/283/405, lede 679) |
| phone 390 px: the cards stack | pass | three increasing tops |
| defaults: D 220, PETG, detail 70, bearing 608, bed 220 × 250 | pass | `{"diameter_mm":"220","material":"PETG","detail":"70","bearing":"608","bed_mm":"220","bed_z_mm":"250"}` |
| defaults: 608 on the print table | pass | «608 · 8×22×7 мм» |
| defaults: the shaft warning | pass | «Внутренний диаметр подшипника 608 равен 8 мм и меньше расчётного диаметра стального вала 9,8 мм.» |
| control: bearing 6001 → no shaft warning | pass | none |
| control: Z back to 250 → no overflow warning | pass | none |
| the 24 other cases (smoke, figures, layer/wall, nozzle → lines, «by power», downloads, preview detail, EN, phone, console) | pass | see the run output |

## 5. Found

none

## 6. Traces

Run 7: `.work/tmp/ui-run/` (git-ignored): `1-defaults-ru.png`, `2-defaults-en.png`, `3-phone-ru.png`, `katak-rotor-220mm-5x0.4.stl`,
`katak-nose-220mm-5x0.4.stl`. Run 4: `.work/tmp/ui-run-old/`.

## 7. Verdict

pass — every case as expected. GAP of the phone-stack case: it also passes on the old page (the old layout stacked too), so
it guards the new layout from a regression, not the change itself.
