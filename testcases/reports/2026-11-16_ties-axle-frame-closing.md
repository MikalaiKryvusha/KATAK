# Test run report — the ties inside the blade (bugs/05), the axle on two supports, the V frame, the closing judge's fixes

**Created:** 2026-11-16 19:10 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** `main` from «fix(kalculator):
printed ties end inside the blade wall …» to the closing commit of session 2

## 1. Work

The owner's words of session 2: 18:52 «петачный стяжки всё ещё пробивают лопость» (bugs/05); 18:55 «Я почти УВЕРЕН, что 8 мм
стержен ЗАПРОСТО выбержит такую турбину» (the axle on two supports); 18:53 «форма кронштейна не такая, как я тебе в прошюре
скидывал» (the V frame). The closing judge (19:08): the bearing popup still promised the removed warning; stale comment and rows.

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright (headless). The page opened from
disk, no network. No production exists — the real-world line does not apply.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 18:56 +03:00 | `node kalculator/test.mjs`; the same guard on the committed core | 0 · 85 of 85; 80 / 76 of 192 tie end vertices outside (red) |
| 2 | 2026-11-16 18:57 +03:00 | `node tools/ui-run.mjs` (ties) | 0 · 60 of 60 |
| 3 | 2026-11-16 19:00 +03:00 | `node tools/ui-run.mjs` (the axle) | 1 · 59 of 60 — the row read «8,0 мм», the case expected «8 мм»; the page now prints whole diameters |
| 4 | 2026-11-16 19:00 +03:00 | `node tools/ui-run.mjs` | 0 · 60 of 60 |
| 5 | 2026-11-16 19:01 +03:00 | `node .work/tmp/viewshot.mjs` (throwaway), then `node tools/ui-run.mjs` (the frame) | 0 · the V seen; 60 of 60 |
| 6 | 2026-11-16 19:10 +03:00 | `kaif-voice-lint check`; `node kalculator/test.mjs`; `node tools/ui-run.mjs` (after the judge's fixes) | 0 · voice 0; 85 of 85; 60 of 60 |

## 4. Checks

Hygiene: @guard ties-inside-blade (rays through the real blade meshes, every tie end vertex inside a wall): 0 of 192 at D 220
and D 300; the core's axle factor at D 220 for 8 mm: 3.03 (the cantilever gave 1.81).
Functional run: Chrome on the page from disk, by the user's path:

| Case | Status | Observed |
|---|---|---|
| defaults: no axle warning; «Запас прочности оси 8 мм (IEC 61400-2: не ниже 3,3)» | pass | 3,0 |
| control: D 600 on the 8 mm axle → «не выдерживает» | pass | the warning line |
| the frame: the post under the rotor's middle, two arms (the agent's eye) | pass | `.work/tmp/view-default.png` |
| the other 58 cases | pass | see the run output |

## 5. Found

- Run 3: a defect of the run's expectation (whole diameters), fixed on the page.
- The closing judge: the bearing popup promised the removed warning (a standing falsehood, corrected RU + EN); the comment on the
  post's place; two rows of the decision journal without their `[AI]` / assembly-limit note — corrected.

## 6. Traces

`.work/tmp/ui-run/` (git-ignored); `.work/tmp/view-default.png`; the judge's `.work/tmp/judge2-ui/`.

## 7. Verdict

partial — every case passes; the functional run with printed ties ON is not walked yet (bugs/05 stays open until it is).
