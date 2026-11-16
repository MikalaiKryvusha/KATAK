# Bug 05 — the printed ties still pierce the blade: a flat rod end against an inclined blade

**Status:** 🔧 fixed in the core, guard green; the functional run with ties on is NOT YET — the bug stays open until it is walked · **Severity:** S1 (the owner found it twice: session 1 16:24 «что это у тебя за
перемычки, которые пробивают лопости насквозь?», session 2 18:52 «петачный стяжки всё ещё пробивают лопость» with a screenshot)
**Version/build:** `main` at «fix(kalculator): the (i) popup wide and low …» · **When/context:** 2026-11-16 18:52, the owner's
screenshot of the preview with «Число печатных стяжек» > 0. **Fixing:** this session.

## Symptom

A small triangular tip of a tie stands out of the blade's far face in the preview (and in the STL).

## Root cause

INTENT: the code ends the axial rod with a FLAT cap at the blade's middle surface measured at the rod's CENTRE; the task (the
owner's word) expects the tie to stay inside the blade; the comment in `ties()` claimed «ends stop at the blades' middle
surface». The blade is inclined to the axis (α 30–60°): across the rod's diameter d the middle surface rises by d·cot α, so on
one side the flat cap sits (d/2)·cot α above the middle surface — 2.6 mm for d 3 mm at 30° — while the blade's half thickness
along the axis is (t/2)/sin α ≈ 2.1 mm: the cap's edge breaks out by ≈ 0.5 mm. Session 1 moved the ends from the far faces to
the middle surface and checked the centre only; the edge of the cap was never checked.

## Fix

Each vertex of a rod's end ring is put onto the blade's middle surface at its own position (the generator line through the
vertex's angle, at the vertex's radius): the end is cut along the blade, the whole cross-section ends inside the blade.

TWINS: searched the core for an axial prism / tube ending at a blade (`sweepTube(`, `prism(` in `ties`, `rim`, the hub): the
rim and the hub are surfaces of revolution not ending on blades; the frame of the 3D view is not printed — 0 other sites.

## Guard

`kalculator/test.mjs` part 2: @guard ties-inside-blade — with ties on, rays cast through the real blade meshes find every end-ring
vertex of every tie inside a blade wall (odd hits); red on the committed core.

## Decisions made without the owner

- The end follows the blade's middle surface (the tie fuses into the wall's middle); no other change to the tie position.

## Links

`ideas/05_spacer_types_metal_studs.md` (the studs will replace or join the printed ties) · `EXPERIENCE.md` EXP-0006

## Status (2026-11-16 18:57 +03:00)

Two causes, both fixed: the flat cap (each end-ring vertex now follows the blade) and the bare generator line (the real middle
surface is (t/2)·cot α higher — the blade root sinks t/2 into the hub).
Hygiene: `node kalculator/test.mjs` 85/85 — @guard ties-inside-blade: 0 of 192 end vertices outside a blade wall at D 220 and
D 300; on the committed core 80 of 192 and 76 of 192 outside (red).
Functional run: `node tools/ui-run.mjs` 60/60 (the page with defaults; ties are off by default — the owner's preview with
ties on is the real path, NOT YET).
