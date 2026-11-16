# Test run report — epic 02 phase 1: the rotor cut into core floors and skirts (butt seams)

**Created:** 2026-11-16 17:42 +03:00 · **Run by:** the agent (Claude Opus 5.5) · **Version/build:** working tree on top of the
commit «docs(plans): epic 02 …» (the code uncommitted at the moment of the runs)

## 1. Work

`plans/03_epic02_phase1_split.md`, criteria 1–3 (and the epic's criterion 5 for these parts): the core function `split()`,
the region form of `blade()`, the page field «Печать по частям», the parts table and its STL buttons. Basis: the owner's words
of 17:26 / 17:33 / 17:34 (`plans/02_EPIC_split_print.md`), `researches/07`.

## 2. Contour

This machine (HOUSE_RULES.md dossier): Windows 11, Node v24.15.0, Google Chrome via Playwright (channel `chrome`, headless),
PrusaSlicer console, Blender 5.3. The page opened from disk, no network. No production exists — the real-world line does not
apply; the printed fit of the parts waits for phase 4 (the owner's test print).

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-16 17:38 +03:00 | `node kalculator/test.mjs` | 0 · 78 of 78 |
| 2 | 2026-11-16 17:40 +03:00 | `node tools/ui-run.mjs --shots .work/tmp/ui-run` | 0 · 49 of 49 |
| 3 | 2026-11-16 17:40 +03:00 | `prusa-slicer-console.exe --info` on the three part STLs of run 2 | 0 · manifold = yes × 3 |
| 4 | 2026-11-16 17:41 +03:00 | Blender `-b -P tools/render-stl.py -- <part.stl> <png> iso` × 3 | 0 · renders looked at |

## 4. Checks

Hygiene: `node kalculator/test.mjs` 78/78 — part «2b. split»: D 280 → floor1, floor2, skirt × 3 = 5 parts; each closed; each
within 220 × 220 × 250 after placement (140 × 142 × 137, 211 × 211 × 137, 132 × 132 × 71); Σ volumes 359 489 vs the whole rotor
359 422 mm³ (+0.02 %); the axial path of the skirt free (0 %, wrap 100°); control D 340 — blocked 3.3 %, wrap 153° (red as it must).
Functional run: Chrome on the page from disk, by the user's path:

| Case | Status | Observed |
|---|---|---|
| D 280 → the split message | pass | «Ротор больше стола принтера и печатается из 5 деталей: этажей ядра — 2, одинаковых юбок — 3.» |
| D 280 → the parts table | pass | 3 parts + the header |
| floor1 / floor2 / skirt STL downloaded, its box from the STL bytes | pass | 140 × 143 × 137 · 211 × 211 × 137 · 134 × 134 × 72 mm |
| control: D 220 fits whole → no parts table | pass | the table hidden |
| the Z overflow cases run with «Печать по частям: нет» | pass | the overflow warning as before |
| the 42 earlier cases | pass | see the run output |

## 5. Found

- The first Blender call wrote nowhere: `render-stl.py` hands a relative output path to Blender, which resolves it elsewhere —
  absolute paths work (recorded for the tool's next edit).

## 6. Traces

`.work/tmp/ui-run/katak-floor1-280mm.stl`, `katak-floor2-280mm.stl`, `katak-skirt-280mm-x3.stl`, `1f-split-280.png`;
`.work/tmp/render-floor1-280mm.png`, `render-floor2-280mm.png`, `render-skirt-280mm-x3.png` (git-ignored).

## 7. Verdict

pass — phase 1 criteria 1–3 hold; the seams are butt seams (the dovetail comb is phase 2).
