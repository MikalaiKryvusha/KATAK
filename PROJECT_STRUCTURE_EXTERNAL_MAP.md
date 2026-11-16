# KATAK — External structure map

> **The EXTERNAL map: what the project looks like from the outside** — directories, files, and the dependencies between
> them. Companion: `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` (the logic). **Living reference — never DONE-tagged.**
> Planned paths are marked *(planned)* until they exist on disk.

## The tree

```
KATAK/
├── kalculator/            # the product (planned): the browser tool, one HTML file, zero dependencies
│   ├── index.html         # UI + i18n (RU/EN) + the core between CORE-BEGIN / CORE-END markers
│   └── test.mjs           # node test of the core: physics numbers, mesh closure, STL bytes
├── design/
│   ├── icon/              # icon variants page + the chosen katak-icon.svg
│   └── flow-map/          # KUIPS sheet: screens and flows of the tool (manifest + frames)
├── tools/
│   ├── ui-run.mjs         # functional run: drives the page in this machine's Chrome (Playwright), screenshots
│   └── hooks/             # Claude Code hooks ported from KUMM (see the table below)
├── researches/            # recon notes (physics, aerodynamics, geometry, STL, web), Russian — owner rule R4
├── testcases/             # case sets + reports/<date>_<work>.md of every run
├── plans/ ideas/ bugs/ interviews/ homeworks/ reports/   # KAIF knowledge dirs, each with its README
├── .kaif/                 # KAIF machinery: kaif.json marker (testHook kinds), hooks/, tools/, spheres/
├── .claude/               # skills + settings.json (KAIF hooks wired by `kaif-core wire-hooks`)
├── .work/tmp/             # agent temp files, git-ignored (HOUSE_RULES R1)
├── GOAL.md                # the owner's vision — verbatim, never edited by the agent
├── HOUSE_RULES.md         # local law: owner rules R1–R4, stands, environment dossier, tools
└── README.md · LICENSE    # storefront EN + RU, MIT (planned)
```

## What each part is

| Path | What it is | Depends on / references |
|------|-----------|-------------------------|
| `kalculator/index.html` | the shipped tool — opens from disk, works offline | nothing external (fonts fall back to system) |
| `kalculator/test.mjs` | extracts the core from `index.html` and checks it | `kalculator/index.html` |
| `tools/ui-run.mjs` | Playwright run in Chrome: language switch, inputs, results, STL download | `kalculator/index.html`, `playwright` (via `kuips`) |
| `tools/hooks/no-permission-question.mjs` | Stop hook: refuses a turn that ends with "shall I do my next step?" | transcript JSONL |
| `tools/hooks/no-backslash-heredoc.mjs` | PreToolUse(Bash) hook: refuses a heredoc body with a backslash (Git Bash eats it here) | — |
| `tools/hooks/stamp-gate.mjs` | PreToolUse(Write/Edit) hook: refuses a today-stamp later than the clock | — |
| `tools/hooks/scratch-sweep.mjs` | SessionStart hook: removes this project's scratch dirs idle > 24 h | `<TEMP>/claude/…`, `.work/tmp` |
| `design/flow-map/flow-map.json` | KUIPS manifest of the tool's screens | `kuips` devDependency |

## Cross-references & dependency rules

- The product (`kalculator/`) depends on nothing in the repo; everything else may reference it, never the reverse.
- `GOAL.md` is the owner's; the agent derives `MASTER_PLAN.md` from it and never edits it.
- Generated files (KUIPS sheet HTML, screenshots) are rebuilt from their sources, never edited by hand.

## Entry points

1. `GOAL.md` → `STATUS.md` → `MASTER_PLAN.md`.
2. `kalculator/index.html` (the product) and `kalculator/test.mjs`.
3. `HOUSE_RULES.md` for the stands and the owner's standing rules.
