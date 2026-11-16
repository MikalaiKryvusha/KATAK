# EXPERIENCE — the agent's accumulated experience

> The agent's growing log of lessons. **Externalized memory of *what works and what doesn't*** — so a
> fresh, context-less session (or an autonomous loop) never repeats a dead end. Consult it BEFORE a task;
> append to it AFTER a meaningful attempt (success **or** failure). Grep, don't scroll.
>
> **Tags live inline on every entry** (not in a central list) — so one grep finds the experiences directly:
> `grep '#loop' EXPERIENCE.md` · `grep -i '#context\|#build' EXPERIENCE.md` · `grep '❌' -A4 EXPERIENCE.md`
> · `grep 'EXP-0007' EXPERIENCE.md`. Reuse an existing tag where one fits (grep to see what's in use).
>
> **Entry format (keep it short and grep-friendly).** Newest on top. Every entry starts with a stable id,
> an ISO date, an outcome marker (`✅` / `❌` / `❌→✅`), and inline `#tags`:
>
> ```
> ### EXP-0001 · 2026-01-01 · ✅ · #tag #area
> class: <slug from the class list below — the UNIT OF RECURRENCE>
> **Context:** one line — what was being done.
> **Tried / did:** the approach, briefly.
> **Result:** ✅/❌ — what happened.
> **Lesson:** the reusable takeaway (the reason this entry exists).   → link: bugs/NN · ideas/NN · plans/NN
> **Repro:** the ready-to-run command/check that verifies or applies the lesson — a weak session
>   executes a pasted command reliably, an essay it won't act on. REQUIRED since 2.1: a lesson
>   with no Repro line is not accepted (field-proven: lessons with a Repro command get executed,
>   essay-lessons get read and ignored). If the lesson genuinely has no command, say what to
>   OBSERVE instead — but say it as an action.
> **Trigger:** for class-level lessons — the decision point that must invoke this lesson, as
>   "writing X → run Y" (the lesson names WHERE it applies, instead of hoping to be remembered).
> **Not for:** the lesson's validity range — where it does NOT apply. A documented lesson is still a
>   hypothesis; applied outside its range it kills good ideas.
> ```
>
> **A lesson that repeats is a lesson that failed as text.** When the same class recurs in NEW code
> after its entry was recorded, the journal has proven insufficient — the lesson MUST become
> executable (a linter rule, a guard, a gate), and the entry gains the line
> `mechanized: <the tool>`. Two strikes → a mechanism, never a third reminder.
>
> **The deadline is RUN, not remembered** (2.7, epic EL; origin issue #69 — a field audit of one
> project's journal: 14 of 15 failure classes recurred AFTER their lesson was written, five lessons
> written 6–17 times in different words, 5.8 % mechanized): `node .kaif/tools/kaif-experience-lint.mjs
> check` reads the `class:` field as the UNIT of recurrence and reddens on the SECOND failure entry of
> one class with no `mechanized:`, naming the class and both entries by id. Two fates clear it, both
> WRITTEN: name the guard in the entry (`mechanized: <the tool>`), or re-check the price once for the
> WHOLE class and declare it — `<!-- class-ok: <slug> — <why it is not cheaply possible> -->` (an empty
> declaration is itself a finding; the declared classes are printed on the summary line and that list
> only shrinks). A third record is never a fate. It also warns when
> `mechanized:` names a command this project does not contain, and when a slug is outside the list
> below; `--shrink EXP-NNNN` collapses a MECHANIZED entry to one line pointing at its guard (shows by
> default, `--yes` writes — the text itself stays in the git history). The command belongs in the
> closing ritual (`/end-chat-soft`).
>
> **The class list of this journal** — a CONTROLLED list, not a closed one: pick a slug from it, and
> when a lesson genuinely brings a new class, add the slug here in the same write (the linter warns
> about an unlisted slug, it never refuses). The starter list below is what a field audit had already
> measured (origin issue #69) — replace and grow it with your project's own classes.
>
> <!-- classes: question-already-answered, guard-not-proven-against-threat, shown-as-link,
>      claim-before-evidence, owner-decision-not-applied, text-in-agents-world,
>      etalon-from-dirty-tree, shell-lied, escaping-layer, twins-missed,
>      field-dropped-in-rebuild, render-unverified, subagent-overspawn, environment-guessed -->
>
> | Class slug | The failure it names |
> |---|---|
> | `question-already-answered` | the owner is asked what his own past word, the goal doc or a run already decided |
> | `guard-not-proven-against-threat` | a guard shipped without being seen red on the threat it claims to stop |
> | `shown-as-link` | showing replaced by a link or a path instead of the thing itself |
> | `claim-before-evidence` | a claim written wider than the observation behind it |
> | `owner-decision-not-applied` | a decision the owner gave is recorded and not carried into the artifact |
> | `text-in-agents-world` | text written for the agent's own world instead of the owner's |
> | `etalon-from-dirty-tree` | a reference/etalon captured from a tree that was not clean |
> | `shell-lied` | the shell or the tool swallowed/rewrote what was passed to it |
> | `escaping-layer` | one escaping level lost between the tool and the file |
> | `twins-missed` | one of two layers/copies moved and the twin stayed behind |
> | `field-dropped-in-rebuild` | a field or section silently lost when an artifact was regenerated |
>
> The `#tags` are **trigger-tags**: before a task, grep by the task's tags and QUOTE the relevant
> lessons in your report (id + one line) — or state "no relevant lessons". An unquoted recall is
> unverifiable; `/fable-judge` checks for this line.
>
> Skill: `/experience` (capture a lesson · recall relevant lessons).

## Entries

### EXP-0005 · 2026-11-16 · ❌→✅ · #geometry #normalise #select #tests
class: field-dropped-in-rebuild
mechanized: kalculator/test.mjs @guard ogive-is-not-ellipsoid + tools/ui-run.mjs case «bugs/01»
**Context:** the nose fairing profiles of the core (ellipsoid · ogive · cone), written in units of the base radius.
**Tried / did:** normalised the tangent ogive with `const L = 1` — the length-to-radius ratio of the field never reached it.
**Result:** ❌ the «оживало» option silently produced the ellipsoid (a tangent ogive with L = R is a quarter circle); the
closedness tests stayed green because both shapes are closed. ✅ `L = Ln / Rb` (bugs/01).
**Lesson:** when a formula is normalised, every dimension it had becomes a ratio that must still be passed in; and every
option of a select must produce an output different from its siblings — a test that only checks validity cannot see a
wrong-but-valid shape.
**Repro:** `node kalculator/test.mjs` — part 2, «ogive nose is slimmer than the ellipsoid nose».
**Trigger:** adding a shape or mode to a select → add a check that its output differs from the other options'.
**Not for:** options that are meant to coincide at a boundary value (they need a non-boundary input in the check).

### EXP-0004 · 2026-11-16 · ❌→✅ · #stamp #clock #hooks
class: claim-before-evidence
mechanized: tools/hooks/stamp-gate.mjs — refuses a today-stamp later than the clock before it lands in a file
**Context:** writing moments into documents (MASTER_PLAN, a run report, memory) during a long session.
**Tried / did:** typed the time by feel: «≈15:40» at 15:33, «16:17» at 16:16, «≈16:25» at 16:22.
**Result:** ❌ three refusals by the stamp-gate hook; ✅ each fixed with `date` of the same minute.
**Lesson:** a moment is probed in the same tool call as the write; the hook is the backstop, not the method.
**Repro:** `date '+%Y-%m-%d %H:%M %z'` right before the Write that carries the stamp.
**Trigger:** writing a time of day into any file → probe `date` first.
**Not for:** future plans and appointments (tomorrow, or `claim-ok:` on the line).

### EXP-0003 · 2026-11-16 · ❌→✅ · #svg #icon #design
class: render-unverified
mechanized: tools/shot.mjs — every design page is looked at as a PNG before it is shown
**Context:** generating the four KATAK icon variants in SVG (`design/icon/build-icons.mjs`).
**Tried / did:** stroked a straight vertical line (the K stem) and a horizontal line (the shaft) with a pink
`linearGradient` in the default `objectBoundingBox` units.
**Result:** ❌ both lines were not painted at all — a straight line has a zero-width (or zero-height) box, and the SVG
spec says an objectBoundingBox paint server is then not rendered; the screenshot showed «<» instead of «K». ✅ after
`gradientUnits="userSpaceOnUse"` with canvas coordinates.
**Lesson:** a gradient that paints strokes goes in `userSpaceOnUse`; look at the rendered PNG, never trust the SVG text.
**Repro:** `node design/icon/build-icons.mjs && node tools/shot.mjs design/icon/katak-icon-variants.html .work/tmp/i.png` — the K stem is visible.
**Trigger:** writing an SVG gradient used as a stroke → set `gradientUnits="userSpaceOnUse"`.
**Not for:** gradients that fill areas (circles, tiles) — a box exists there, both units work.

### EXP-0002 · 2026-11-16 · ❌→✅ · #agents #subagent #owner
class: subagent-overspawn
mechanized: .kaif/hooks/subagent-preamble.mjs — wired in .claude/settings.json, adds the no-nesting bound to every launch
**Context:** a background research subagent (general-purpose) launched before the KAIF hooks were wired.
**Tried / did:** briefed it without a word about nesting.
**Result:** ❌ it spawned two children of its own; the owner saw «3 agents» against his limit of 2 (`HOUSE_RULES.md` R2)
and asked «зачем тебе столько?». ✅ the two children stopped (`TaskStop`), the parent told to finish alone.
**Lesson:** every subagent brief says «Do NOT spawn any agents yourself»; the KAIF hook `subagent-preamble.mjs` adds the
same bound once wired — wire hooks before the first launch.
**Repro:** `ListAgents` right after a launch — the count must stay ≤ 2.
**Trigger:** writing an Agent call → the brief carries the no-nesting line and the live count is checked first.
**Not for:** —

### EXP-0001 · 2026-11-16 · ✅ · #hooks #windows #scratch
class: environment-guessed
mechanized: tools/test-hooks.mjs part L2 — the hash-named root case
**Context:** porting KUMM's `scratch-sweep.mjs` (removes idle scratch dirs of past sessions).
**Tried / did:** KUMM looks for `<TEMP>/claude/<path slug>/`; on this machine the harness names the folder by a hash
(`F:\Temp\claude\58b92a294c75b47e\<session>\`, not sha256/md5/sha1 of the path — probed).
**Result:** ✅ the root is found by the project's session ids (the `*.jsonl` names next to `transcript_path`); only those
sessions' dirs are removed. A first dry run with a Git Bash path (`/c/Users/…`) found nothing — Node on Windows needs
`C:/Users/…` (`cygpath -m`).
**Lesson:** feed Windows Node scripts Windows paths; derive harness folders from the event, not from a guessed naming rule.
**Repro:** `node tools/test-hooks.mjs` — part L2 (hash-named root) 4/4.
**Trigger:** a hook or tool that locates harness files → read the location from the hook event.
**Not for:** —

