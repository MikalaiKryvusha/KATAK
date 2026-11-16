# KATAK — текущее состояние

> Этот файл агент читает перед каждой задачей; это главная передача дел между сессиями. **STATUS — сводка СЕЙЧАС, а не
> летопись** (~200 строк): закрытое уезжает дословно в `PROJECT_HISTORY.md`. Принцип мышления — `PHILOSOPHY.md`
> (простота), метод работы — `AGENT_GUIDE.md`, местные правила владельца — `HOUSE_RULES.md`.

---

## Что сделано (короткий хвост)

### Сессия 1 — 2026-11-16: от GOAL.md до публичного прототипа ✅
- **KAIF 2.9 + пре-релиз 2.10** развёрнут с канала `main`; полевой отчёт — https://github.com/MikalaiKryvusha/KAIF/issues/197.
  Хуки: 15 от KAIF (в т. ч. «тест после кода») + 4 из KUMM в `tools/hooks/` (набор `node tools/test-hooks.mjs` 67/67).
- **Правила владельца** R1–R6 в `HOUSE_RULES.md`: временное — `.work/tmp`; ≤ 2 субагентов, вложенные считаются; тест в
  Chrome без спроса; каждая разведка — конспект; JS — `.mjs`; только Windows, без WSL.
- **Разведки:** `researches/01` физика и инженерия спиральной турбины (52 источника), `02` 3D-печать под сопло, `03` веб и STL.
- **Иконка** выбрана владельцем: D5.24 без точек → `design/icon/katak-icon.svg` (`homeworks/01_icon_choice.md`, 9 кругов).
- **Прототип калькулятора** `kalculator/index.html`: ядро физики и геометрии + страница RU/EN (5 шагов, график, предупреждения,
  WebGL-превью, STL ротора и носа). Ядро: `node kalculator/test.mjs` 57/57. Страница в Chrome: `node tools/ui-run.mjs` 12/12.
  STL проходят `--info` PrusaSlicer (manifold = yes). Отчёт прогона — `testcases/reports/2026-11-16_kalculator-prototype.md`.
- **Публичный репозиторий** https://github.com/MikalaiKryvusha/KATAK (MIT, README EN + RU по портрету голоса).

---

## Где мы сейчас

| Фаза (`MASTER_PLAN.md`) | Статус | Что там |
|------|--------|---------|
| 0 · фундамент | ✅ | KAIF, хуки, домашние правила, KUIPS 1.3.1 в devDependencies |
| 1 · лицо | ✅ | иконка выбрана; README, LICENSE, репозиторий |
| 2 · знание | ✅ первый круг | три конспекта; CFD-проверка — `ideas/02` (решение владельца) |
| 3 · макеты | 🔲 | лист KUIPS по готовой странице: `npx kuips init / shoot / layout / build / check` |
| 4 · прототип | 🔧 | работает, ждёт взгляда владельца и печати первого ротора |
| 5 · релиз 1.0 | 🔲 | один HTML-файл без внешних картинок, GitHub Pages — по слову владельца |

---

## 🤖 Автономный пул задач

- [ ] Лист KUIPS экранов калькулятора (фаза 3 — `design/flow-map/`).
- [ ] Нарезка STL в OrcaSlicer/PrusaSlicer из CLI с профилем принтера (G-code) — в `tools/ui-run.mjs` или отдельным прогоном.
- [ ] Вшить иконку в страницу (data URI), чтобы скачанный один файл `index.html` был самодостаточным (сейчас ссылка `../design/icon/`).
- [ ] Смысловой проход §7B чистым экземпляром по README и текстам страницы (машинная проверка портрета — 0 попаданий; §7B не сделан).
- [ ] Посадочный «пробник» зазоров (идея в `researches/02` §6).

## ❓ Ждёт владельца

- 🧰 Посмотреть калькулятор (`kalculator/index.html`) и напечатать первый ротор — впечатления → `ideas/`.
- ❓ Инструменты симуляции под Windows (FluidX3D / SU2 / CalculiX) — `ideas/02_simulation_tools.md`.
- 🧰 Переименовать папку проекта в `KRINIK_Archimedes_Turbine_Automated_Kalculator` после закрытия VS Code (пока в ней
  открыта сессия, Windows не даёт): `Rename-Item "D:\work\ai_sandbox\KRINIK_Archimedes_Turbine_Automated_Calculator" "KRINIK_Archimedes_Turbine_Automated_Kalculator"`.

---

## Где продолжить

1. `node kalculator/test.mjs` (57/57) и `node tools/ui-run.mjs` (12/12) — убедиться, что дерево зелёное.
2. Взять задачу из пула выше; новое от владельца — в `ideas/`.
3. При правке `kalculator/index.html` хук «тест после кода» требует `node tools/ui-run.mjs` до остановки.

---

## Открытые баги

- нет
