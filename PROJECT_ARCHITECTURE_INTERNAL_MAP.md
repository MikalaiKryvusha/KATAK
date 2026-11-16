# KATAK — Internal architecture map

> **The INTERNAL map: how the system thinks** — the abstractions of the tool and how they interact. Where things live —
> `PROJECT_STRUCTURE_EXTERNAL_MAP.md`. **Living reference — never DONE-tagged.** The design below is the agent's first
> cut `[AI]` (2026-11-16), to be confirmed by the physics recon (`researches/`) and the owner.

## The core abstractions

| Abstraction | What it *is* | Responsibility |
|-------------|--------------|----------------|
| `Site` | the user's environment: mean wind at a reference height, mounting height, terrain class, altitude, air temperature, Weibull shape k | gives air density ρ and the wind distribution at hub height |
| `Wishes` | what the user wants: rotor diameter OR target power/energy, blade count, print limits | the input the recommender answers |
| `Design` | the turbine's parameters: D, length L, blade count N, wrap angle, opening angle, hub Ø, shaft profile and Ø, wall thickness, struts (count, Ø), detail level | the single source both for physics and for geometry |
| `PhysicsModel` | pure functions: ρ(alt, T), shear, Weibull, Cp(λ), Ct, power curve, AEP, RPM, torque, thrust, shaft stress | numbers with units; no DOM |
| `Recommender` | rules (from recon) that turn `Wishes` + `Site` into a `Design` and warnings | "recommended parameters and characteristics" of GOAL.md |
| `GeometryBuilder` | parametric blade surface (conical spiral), hub, shaft, struts → triangles; detail level = sampling density | a closed (watertight) printable mesh |
| `StlWriter` | mesh → binary STL bytes | the download |
| `Preview` | WebGL view of the same mesh (orbit, zoom) | what the user sees before printing |
| `I18n` | one dictionary per language (RU, EN), `data-i18n` keys | the language switch at the top right |

## How they interact

```
Site + Wishes ──▶ Recommender ──▶ Design ──▶ PhysicsModel ──▶ results table, power curve, warnings
                                   │
                                   └──────▶ GeometryBuilder ──▶ Mesh ──▶ Preview (WebGL)
                                                                  └────▶ StlWriter ──▶ katak-<D>mm.stl
```

## Invariants & rules of the model

- The core (`PhysicsModel`, `Recommender`, `GeometryBuilder`, `StlWriter`) is DOM-free and sits between `CORE-BEGIN` and
  `CORE-END` in `kalculator/index.html`, so `kalculator/test.mjs` runs it in Node.
- Every number shown to the user comes from a formula or a constant with a source in `researches/` (three doors: an
  invented number is a bug).
- A generated mesh is closed: every edge belongs to exactly two triangles (checked by the test).
- Internal units are SI (m, kg, s, W); millimetres only at the STL boundary and in print inputs.

## Key decisions embedded in the architecture

- One HTML file, zero dependencies, works offline from disk — the KEINKT Calibrator pattern the owner pointed to (GOAL.md).
- The 3D preview is hand-written WebGL, not a library: keeps the file self-contained (decision log in `MASTER_PLAN.md`).

## Project hooks (tools/hooks, ported from KUMM on the owner's word 2026-11-16)

- `no-permission-question.mjs` — Stop: a turn may not end by asking leave for the agent's own next step.
- `no-backslash-heredoc.mjs` — PreToolUse(Bash): a heredoc body with a backslash is refused (Git Bash collapses it here).
- `stamp-gate.mjs` — PreToolUse(Write/Edit): a today-dated time later than the clock is refused.
- `scratch-sweep.mjs` — SessionStart: scratch dirs of this project's past sessions idle > 24 h are removed file by file.
