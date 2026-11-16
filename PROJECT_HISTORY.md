# KATAK — Project History (the chronicle)

> The APPEND-ONLY chronicle of how this project lived and grew: closed sessions, shipped phases,
> releases, big decisions in the order they happened. This is where `STATUS.md` sheds its past —
> STATUS stays a short live summary of NOW; everything finished moves HERE (the "bonsai trim" step
> of `/end-chat-soft`).
>
> **Not required reading.** This file is NOT part of `/resume`'s canon set and not in the
> before-every-task minimum — open it only when you actually need the archaeology: how a decision
> came to be, what an old phase contained, when something shipped.
>
> **Chronicle rules (ADR discipline):**
> - **Append-only, newest on top.** A recorded entry is never edited to say something else —
>   history that can be rewritten is not history. Corrections come as NEW entries that reference
>   and supersede the old one.
> - An entry moves here VERBATIM from `STATUS.md` when its work closes — move, don't rewrite;
>   the entry already carries its dates, counters and file pointers.
> - Entries mention versions and dates freely — a chronicle legitimately speaks of old versions,
>   and the update machinery's stale-claims scan knows to leave this file alone.
> - When the file grows unwieldy, split by era: keep the newest era here, move older ones to
>   `PROJECT_HISTORY_<era>.md` files, and leave a one-line index at the top of this file
>   (the pattern large changelogs use).
>
> Living document — never DONE-tagged.

---

## Entries (newest first)

### 2026-11-16 19:03 +03:00 — поправка к записи «Сессия 2» ниже (новая запись, старая не правится)
- «Подшипник 608 тоньше расчётного вала 9,8 мм — страница говорит это предупреждением» — тревога была ложной: ядро считало ось
  консолью от заднего подшипника; с 18:58 ось — балка на двух опорах, у оси 8 мм при D 220 запас 3,0, предупреждения нет
  (слово владельца 18:55; коммит «fix(kalculator): the axle is a beam on two supports …»).
- «5 деталей дают до 340 мм» — это предел по столу; сборка вдоль оси ограничивает 5 деталей на Ender 3 размером 280–300 мм
  (`researches/07` §3), дальше 8 деталей.

### Сессия 2 — 2026-11-16 с 16:41 +03:00 (идёт)
- **Слова владельца применены:** слой 0,2 мм и стенка 2 мм по умолчанию (стенка округляется до 2,08 мм = 5 линий сопла
  0,4); превью строится с печатной детализацией (40 % — 18 592 треугольника, 165 мс); предупреждение, если слой вне 25–75 %
  диаметра сопла (`researches/02` §4). Прогон: ядро 60/60, Chrome 25/25 (`testcases/reports/2026-11-16_print-defaults-and-preview-detail.md`).
- **Вопрос владельца об оборотах** («откуда такие скорости вращения? … 200…600 оборотов») разобран числами: ядро даёт
  286 об/мин для ротора 1,5 м и 573 об/мин для 0,75 м при 12,5 м/с (паспорт Liam F1 — 330 и 550); ротор 0,2 м крутится в
  7,5 раза быстрее полутораметрового. Пояснение просится в окна (i) идеи 07.
- **Страница самодостаточна** (`HOUSE_RULES.md` R7): иконка вписана в страницу (`node tools/embed-icon.mjs`), отсылки к
  `researches/` убраны; вводный текст на всю ширину, карточки в ряд.
- **Значения Ender 3 по умолчанию:** D 220 мм (ротор стоя 206 × 199 × 223 мм; предел по ядру — 235 мм без запаса), PETG,
  детализация 70 %, подшипник 608 (ось 8 мм под шпильку M8 или трубку), область 220 × 220 × 250 мм. Подшипник 608 тоньше
  расчётного вала 9,8 мм — страница говорит это предупреждением. Прогон Chrome 34/34.
- **График мощности** (идея 09): правая ось «доля времени», подписанные скорости, легенда, окно при наведении.
- **Брошюра оригинала** (`researches/06`, PDF владельца в корне, git-ignored): ядро совпадает с AWM по нагрузкам (1–3 %) и
  оборотам; мощность ниже паспорта на 9 % (0,75 м) и 24 % (1,5 м). Кривая переведена на форму брошюры: рост до 14 м/с,
  полка до 35 м/с, строка «Наибольшая мощность при 14 м/с».
- **Минск по умолчанию** (`researches/05`): 3,7 м/с на 10 м (аэродром Минск-1, METAR 1991–2018), k 2, 220 м, 7 °C;
  «пригород» и «кровля выше конька» — выбор агента. При высоте 6 м ветер 2,9 м/с ниже скорости включения: средняя мощность
  0,01 Вт — вопрос владельцу о высоте установки на кровле.
- **Баг 01 закрыт:** «оживало» строилось эллипсоидом (`bugs/01_DONE_…`). Прогон: ядро 65/65, Chrome 42/42.
- **Разведка 04** — форма «как у стрелы»: вогнутый наконечник лучника, кривая «гусёк» (ogee). Формулы перепроверены
  генератором картинки `design/nose/build-nose-page.mjs`: семь профилей рядом, у затуплённого гуська ровно два перегиба.
- **Обтекатель «стрела»** (идея 10 DONE): выбор владельца «Ж. гладкая сигмоида 2u² − u⁴» — четвёртая форма в поле
  обтекателя, вершина скруглена до одной линии сопла. Прогон: ядро 68/68, Chrome 43/43.
- **Эпик 02 «ротор из деталей»** (`plans/02_EPIC_split_print.md`, разведка `researches/07`; слова владельца 17:26, 17:33,
  17:34 → `HOUSE_RULES.md` R8): фаза 1 сделана — поле «Печать по частям», ядро режет ротор на этажи ядра и юбки, таблица
  деталей с кнопками STL; D 280 → 5 деталей, каждая на столе 220 × 220 × 250, PrusaSlicer manifold. Сборка вдоль оси
  проходит, пока юбка охватывает ≤ 120° (Ender 3 — до 280–300 мм). Следующее: судья фазы 1, затем фаза 2 — гребёнка
  ласточкиных хвостов на шве юбки, полка-упор, буртик ступицы, зазор под клей.
- **Рама как у оригинала** (идея 11): поворотная стойка, короткое плечо к переднему подшипнику, длинное под ротором.
- **Идея 12 — ротор больше стола:** страница `design/split/split-options.html`; ответ на вопрос «минимум деталей и максимум
  размера» — перебор по семейству «этажи ядра + 3 юбки × k сегментов»: на Ender 3 5 деталей дают до 340 мм (380 мм с
  наклоном юбок), 8 деталей — до 440/470 мм (`ideas/12`).

### Сессия 1 — 2026-11-16 15:06 → 16:37 +03:00: от GOAL.md до публичного прототипа ✅
- **KAIF 2.9 + пре-релиз 2.10** с канала `main`; полевой отчёт — https://github.com/MikalaiKryvusha/KAIF/issues/197.
  Хуки: 15 от KAIF + 4 из KUMM в `tools/hooks/` (`node tools/test-hooks.mjs` 67/67).
- **Правила владельца** R1–R6 в `HOUSE_RULES.md` (временное в `.work/tmp` · ≤ 2 субагентов · тест в Chrome без спроса ·
  разведка — конспект · `.mjs` · только Windows).
- **Разведки:** `researches/01` физика спиральной турбины (52 источника), `02` 3D-печать под сопло, `03` веб и STL.
- **Иконка** — выбор владельца: D5.24 без точек → `design/icon/katak-icon.svg` (`homeworks/01`, 9 кругов).
- **Калькулятор** `kalculator/index.html` (один файл, офлайн): ядро физики и геометрии; страница RU/EN в академическом
  регистре; рисунок на каждом шаге (профиль ветра, ротор сбоку, сечение стенки, кривая мощности); горизонтальная 3D-модель
  установки (ось, стойка переднего подшипника, обтекатель в 10–100 мм перед ротором, генератор); STL ротора и обтекателя;
  детализация 10–100 %. Ядро `node kalculator/test.mjs` 60/60; Chrome `node tools/ui-run.mjs` 18/18; PrusaSlicer — manifold.
- **Публичный репозиторий** https://github.com/MikalaiKryvusha/KATAK (MIT, README EN + RU по портрету голоса).
