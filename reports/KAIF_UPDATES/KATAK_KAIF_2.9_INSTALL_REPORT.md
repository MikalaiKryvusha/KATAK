# KATAK — KAIF 2.9 (+ 2.10 pre-release) install report

**Delivered upstream:** https://github.com/MikalaiKryvusha/KAIF/issues/197

Project: KATAK (Krinik Archimedes Turbine Automated Kalculator) — a greenfield web tool; the tree held only the owner's
`GOAL.md` before the install. Machine: Windows 11 Pro 10.0.26200, Git Bash 5.2.21 + PowerShell 5.1, Node v24.15.0.
Agent: Claude Opus 5.5 (Claude Code, VS Code extension). Session date: 2026-11-16.

## 1. Chronology with numbers

- 15:17 `git init -b main`; owner's `GOAL.md` committed verbatim first (`c193dd4`).
- `KAIF.md` fetched from `raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/KAIF.md`; byte-equal (CR stripped) to the local
  `KAIF/dist/KAIF.md` at KAIF `d2f2127`.
- Loader extracted from the `FILE:` block mechanically (`awk` between the six-backtick fences) — 149 lines, `node --check` ok.
- `node KAIF-LOADER.mjs --lang ru --channel main` → exit 0; marker `version 2.9 · prerelease 2.10 · build 3aa4b346ba3b`;
  `KAIF_ADAPTATION_TASK.md` with 11 items.
- Adaptation items closed in order: study (nine core documents re-read in full, refresh marker 15:24:13) · project-name
  (`KATAK`, 7 seeded H1 headings fixed by a `sed` one-liner) · placeholders (6 kinds, 6 files) · maps · owner-voice (public snapshot,
  git-ignored) · goal-plan · sphere `programming` · kaif-framework · wire-hooks (15 of 15 added, new `.claude/settings.json`).
- `node .kaif/kaif-core.mjs check` → `manifest satisfied: 110 files + 152 agent artifacts present`; 7 warnings
  «still the template's instruction slot» in `end-chat-soft` (2), `end-chat-force` (1), `release` (4) → filled → 0.
- Project additions in the same session (not KAIF payload): `HOUSE_RULES.md` (owner rules R1–R6, environment dossier),
  four hooks ported from a sibling deployment into `tools/hooks/` with a 67-case suite `tools/test-hooks.mjs` (67/67).

## 2. Friction and rakes

1. **The clock placeholder is easy to write wrong and fails silently.** The `clock-now` line says: «write a moment as the
   NOW placeholder in white square brackets». I wrote ASCII `[NOW]` into `ideas/01_nose_cone.md`; the hook left it as is,
   no warning. Found only by reading the file back. A cold agent reads "white square brackets" as `[ ]`. Suggest: print the
   exact characters in the line (the word NOW between U+27E6 and U+27E7) and warn on a write that holds ASCII `[NOW]`.
2. **The subagent cap leaks before `wire-hooks`.** A general-purpose research subagent launched BEFORE the hooks were
   wired spawned two children of its own; the owner saw «3 agents» against his limit of 2 and asked «зачем тебе столько?».
   `subagent-preamble.mjs` («no nested subagents») exists exactly for this, but `wire-hooks` is item 9 of 11. Suggest:
   wire hooks as the FIRST adaptation item (or in `install` itself), so the preamble covers the agent's first launches.
3. **The clock hook fills a placeholder inside a quoted example.** This very report, §2.1, quoted the placeholder in a code
   span to show the correct form; at the write (15:35) `clock-now` replaced it with the time, and the suggestion no longer
   showed what it described (caught by the clean-instance judge, finding F3). Suggest: leave placeholders inside code spans
   and fenced blocks alone.
4. **Slots filled after `checkpoint placeholders` leave the mirrors behind.** `check` named 7 template slots in the canon
   skills; I filled them in `.claude/skills/` AFTER the placeholders checkpoint had re-synced the other systems' copies, so
   12 mirror copies (`.agents`, `.grok`, `.cline`, `.roo`) kept the template — e.g. `.roo/commands/end-chat-force.md` still
   said «git add -A». The slot warning does not name the cure. Fixed with `node .kaif/kaif-core.mjs sync` (175 copies).
   Suggest: the slot warning ends with «then run `sync`», or `check` runs it.

## 3. What confused a cold agent (top 3)

1. Entry cost: the nine core documents are ≈ 170 KB; `AGENT_GUIDE.md` alone ≈ 36k tokens (`check` says so) — it has to be
   read in 4 parts. The study item asks for all nine before any project work.
2. Where to record "study findings" for an EMPTY project: the item names no target; I wrote them into `AGENT_GUIDE.md`
   (Build, Test harness, Git workflow, Code style) and the two maps.
3. `testHook` shape lives only in the header of `.kaif/hooks/test-after-code.mjs`; `.kaif/hooks/README.md` points there.
   The README could carry one example block.

## 4. Final state and judge verdict

- `node .kaif/kaif-core.mjs check`: manifest satisfied (110 + 152); 0 template-slot warnings; mirrors re-synced (`sync`,
  175 copies); entry cost ≈ 79k tokens (8 % of a 1M window); AGENT_GUIDE ≈ 36k tokens (read in parts).
- Hooks observed working live in this session: `test-after-code` (orders after writes, counts runs), `clock-now`
  (prompt line), `knowledge-moment` (map line demanded on reading an unmapped file), and the project's `stamp-gate`
  (refused a `≈15:40` stamp at 15:33) and `no-backslash-heredoc` (refused a heredoc with `C:\probe\path`).
- Judge verdict (clean-instance subagent, read-only, ≈15:37–15:41): **VERIFIED WITH CAVEATS** — all 9 closed checkpoints
  backed on disk; `test-hooks` 67/67 reproduced; `GOAL.md` byte-identical to `c193dd4`; nothing private would be staged.
  Findings and their fate: F1 12 drifted mirrors → fixed (`sync`), §2.4; F2 wrong git-init time → fixed; F3 hook-mangled
  example → fixed, §2.3; F4 field-report and verify open → this delivery, then `verify-final`; F5 commands named before
  they exist → marked PLANNED in the guide and house rules; F6 STATUS template → filled; F7 lockfile name drift →
  `npm install` reconciled; F8 one attribution-lint hit in MASTER_PLAN → rewritten, lint 0.
- Separate `bugs/KAIF/` tickets were NOT filed: the four frictions of §2 travel upstream inside this report.
