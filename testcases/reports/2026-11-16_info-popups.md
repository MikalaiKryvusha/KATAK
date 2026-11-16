# Test run report — the (i) buttons and their popups (idea 07)

**Created:** 2026-11-16 18:44 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** working tree on top of
«feat(kalculator): the (i) button beside every field and its popup (idea 07, the mechanism)» (the texts uncommitted during runs)

## 1. Work

`ideas/07`: the owner's words «у каждой опции впереди должна быть (i) инфо кнопка - тап на телефоне или ховер на десктопе по
которой открывает поп-ап с пояснением опции и разных вариантов и на что они влияют, и где и какой вариант является оптимумом»;
18:13 «где Инфо кнопки?», «делаем». The popup texts of 39 fields RU + EN (drafted by a subagent from researches/01–07, reviewed by
a clean instance against the voice portrait — 35 findings, 33 applied, 2 settled by the notes).

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright (headless; a touch-phone context
390 × 844 for the tap cases). The page opened from disk, no network. No production exists — the real-world line does not apply.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 18:22 +03:00 | `node tools/ui-run.mjs` (the mechanism, hint fallback) | 0 · 57 of 57 |
| 2 | 2026-11-16 18:31 +03:00 | `node .work/tmp/check-info-numbers.mjs` (throwaway, first texts) | 0 · 761 numbers, 4 not in the notes (2 page results, RU + EN) |
| 3 | 2026-11-16 18:33 +03:00 | `node tools/ui-run.mjs` | 1 · 58 of 59 — the English case matched «Optimum» while CSS uppercases it |
| 4 | 2026-11-16 18:34 +03:00 | `node tools/ui-run.mjs` | 0 · 59 of 59 |
| 5 | 2026-11-16 18:43 +03:00 | `node .work/tmp/check-info-numbers.mjs`; `kaif-voice-lint check kalculator/index.html`; `node kalculator/test.mjs` (the revised texts) | 0 · 787 numbers, 0 unsourced; voice 0; 83 of 83 |
| 6 | 2026-11-16 18:44 +03:00 | `node tools/ui-run.mjs` | 0 · 59 of 59 |

## 4. Checks

Hygiene: every number of the texts found in researches/01–07 or the core (787); voice-lint 0; the clean-instance §7B pass.
Functional run: Chrome walks the page as a user:

| Case | Status | Observed |
|---|---|---|
| one (i) per field | pass | 39 of 39 |
| hover opens with the field's title; the pointer leaves → closes | pass | «Средняя скорость ветра»; hidden |
| a click pins; Esc closes | pass | visible after the pointer leaves; hidden after Esc |
| every popup has the four sections incl. «Оптимум» | pass | all 39 |
| English popup: four sections, no Cyrillic | pass | «Nozzle diameter … OPTIMUM …» |
| phone: a tap opens within 390 px; a tap elsewhere closes | pass | x 12…378; hidden |

## 5. Found

- Run 3: a defect of the run (case-sensitive «Optimum» against CSS uppercase), not of the page — the match ignores case now.

## 6. Traces

`.work/tmp/ui-run/1g-info-hover.png`, `3b-info-phone.png`; `.work/tmp/info-texts.mjs` (the source of the embedded block).

## 7. Verdict

pass.
