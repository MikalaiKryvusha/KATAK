# KATAK — текущее состояние

> Этот файл агент читает перед каждой задачей; это главная передача дел между сессиями. **STATUS — сводка СЕЙЧАС, а не
> летопись** (~200 строк): закрытое уезжает дословно в `PROJECT_HISTORY.md`. Принцип мышления — `PHILOSOPHY.md`
> (простота), метод работы — `AGENT_GUIDE.md`, местные правила владельца — `HOUSE_RULES.md`.

---

## Что сделано (короткий хвост)

### Сессия 1 — 2026-11-16: старт проекта ✅/🔧
- git, `GOAL.md` владельца закоммичен дословно (`c193dd4`).
- KAIF 2.9 + пре-релиз 2.10 развёрнут с канала `main` (`.kaif/kaif.json`: build `3aa4b346ba3b`), задание адаптации пройдено
  до пунктов field-report / verify.
- Хуки: 15 от KAIF (в т. ч. «тест после кода») + 4 из KUMM в `tools/hooks/` (`no-permission-question`, `no-backslash-heredoc`,
  `stamp-gate`, `scratch-sweep`); набор `node tools/test-hooks.mjs` — 67/67.
- `HOUSE_RULES.md`: правила владельца R1–R6 (временное в `.work/tmp` · ≤ 2 субагентов · тест в Chrome сам · каждая
  разведка — конспект · `.mjs` · только Windows), досье машины.
- KUIPS 1.3.1 стоит в `devDependencies` (`npx kuips version`).
- Иконка: круг 1 — 4 варианта `design/icon/katak-icon-variants.html`; владелец: «пробуем вариации D · Наутилус» · «пока не
  нравится» (15:41) → круг 2 — 8 вариаций D `design/icon/katak-icon-d-variations.html`. Оба листа и все SVG собирает
  `node design/icon/build-icons.mjs`; снимок для своей проверки — `node tools/shot.mjs <page> <png>`.
- Идеи владельца: `ideas/01` нос турбины · `ideas/02` инструменты симуляции (❓ решение владельца) · `ideas/03` геометрия
  под сопло.

---

## Где мы сейчас

Фаза 0 (фундамент) почти закрыта; фаза 1 (лицо проекта) и фаза 2 (знание) идут параллельно. Кода калькулятора ещё нет.

| Фаза | Статус | Что там |
|------|--------|---------|
| 0 · фундамент | 🔧 | осталось: судья установки → полевой отчёт в KAIF → `verify-final` → коммит `chore: deploy KAIF` |
| 1 · лицо | 🔧 | иконка ждёт слова владельца; README EN+RU, LICENSE, публичный репозиторий `MikalaiKryvusha/KATAK` |
| 2 · знание | 🔧 | разведка физики идёт (фоновый агент → `researches/01_archimedes_turbine_physics/`); дальше 3D-печать, геометрия, веб |
| 3 · макеты | 🔲 | экраны в розовом стиле + лист KUIPS |
| 4 · прототип | 🔲 | `kalculator/index.html` + `kalculator/test.mjs` + `tools/ui-run.mjs` |

---

## 🤖 Автономный пул задач

- [ ] Конспект 3D-печати: сопло → ширина линии, высота слоя, Arachne, материалы, посадки (`researches/02_…`).
- [ ] Конспект веба: двоичный STL, WebGL-превью, офлайн-страница, i18n (`researches/03_…`).
- [ ] Ядро калькулятора по конспекту физики + `kalculator/test.mjs`.
- [ ] Генератор сетки ротора, оси, распорок, носа; проверка замкнутости; нарезка слайсером из CLI.
- [ ] Страница: вёрстка по образцу KEINKT Calibrator, розовая палитра, RU/EN вверху справа.

## ❓ Ждёт владельца

- ❓ Иконка: выбор из 8 вариаций D → `design/icon/katak-icon-d-variations.html` (открыта у владельца 2026-11-16 15:4x).
- ❓ Инструменты симуляции (FluidX3D / SU2 / CalculiX) — `ideas/02_simulation_tools.md`.
- 🧰 Переименовать папку проекта в `KRINIK_Archimedes_Turbine_Automated_Kalculator` — после закрытия VS Code (пока в ней
  открыта сессия, Windows не даёт).

---

## Где продолжить

1. Если `KAIF_ADAPTATION_TASK.md` ещё в корне — закрыть field-report и verify: `node .kaif/kaif-core.mjs report
   reports/KAIF_UPDATES/KATAK_KAIF_2.9_INSTALL_REPORT.md`, затем `node .kaif/kaif-core.mjs verify-final`, коммит.
2. Перенести отчёт фонового исследователя из черновика `F:\Temp\claude\…\scratchpad\research\` в
   `researches/01_archimedes_turbine_physics/README.md`.
3. Прогон хуков: `node tools/test-hooks.mjs` (67/67).

---

## Открытые баги

- нет
