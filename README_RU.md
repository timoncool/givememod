<div align="center">

# givememod

**Пишешь /givememod — и Claude Code собирает мод под задачу, которая у тебя сейчас.**

[![License](https://img.shields.io/github/license/timoncool/givememod?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/timoncool/givememod?style=flat-square)](https://github.com/timoncool/givememod/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/timoncool/givememod?style=flat-square)](https://github.com/timoncool/givememod/commits)
[![Page](https://img.shields.io/badge/page-givememod-4fc1e9?style=flat-square)](https://timoncool.github.io/givememod/ru.html)

**[English](README.md)** · **[Русский](README_RU.md)** · **[中文](README_ZH.md)**

<img src="docs/teaser-ru.gif" alt="Семь задач в десктопе Claude Code и в терминале: каждый раз /givememod читает ситуацию и собирает подходящий мод: полосу плана, удержание опасных команд, наблюдатель за тестами, датчик контекста, панель файлов, кнопки ответов, мод в любимых" width="860">

</div>

givememod — скилл для Claude Code, который делает моды Claude Code по запросу. Он читает текущий диалог, предлагает подходящий маленький мод (полосу прогресса плана, счётчик затронутых файлов, гард на единственную опасную команду этой задачи, наблюдатель за тестами), собирает его из проверенных шаблонов, подгружает на лету и доводит, пока не понравится. Понравившиеся моды становятся любимыми, остальные уходят вместе с сессией.

## Зачем

С октября 2026 в Claude Code есть [моды](https://code.claude.com/docs/en/plugins/mods/overview): маленькие плагины, которые работают внутри Claude Code и умеют рисовать полосу над промптом, открывать боковую панель, держать вызов инструмента до твоего ответа или добавлять команду, которая отвечает мгновенно. За первые недели появилось больше 3000 публичных модов. Почти все — общие продукты. Не хватает маленького мода именно под *эту* задачу: полосы для этой миграции, чек-листа для этого бага, гарда для этого деплоя. givememod пишет его за минуту и знает всё, до чего уже додумались авторы тех 3000.

## Возможности

- **Одна команда** — `/givememod полосу прогресса для этого рефакторинга` или просто «сделай мне мод под это»
- **Читает ситуацию** — план в работе, много файлов, долгие задачи, опасные команды, сабагенты, ожидание CI, ответы с вариантами в конце: предлагает подходящий мод, а на долгой задаче сам предложит один раз
- **11 проверенных шаблонов** — прогресс плана, затронутые файлы, датчик контекста, чек хода, закреплённая цель, удержание опасной команды, наблюдатель команды, кнопки ответов, пинборд с тулом для Claude, таймер, пустой стартовый; каждый проходит `claude plugin validate` и свои тесты
- **Подгружается сразу** — мод пишется в папку модов сессии и появляется, когда заканчивается ответ; каждая правка подхватывается так же
- **Любимые моды** — сказал «оставь» — мод уходит в папку скиллов, и Claude Code грузит его в каждой сессии без установки, а в похожей задаче его предложат первым
- **Весь корпус внутри** — 29 блоков с кодом, справочник по отрисовке, все задокументированные грабли с официальными лимитами, тест-кит, чек-лист ревью чужих модов
- **Карта 3057 публичных модов** — что делают люди, зачем, как, и лучший пример под каждую задачу, все со ссылками
- **Что знают лучшие моды** — 222 репозитория модов прочитаны пофайлово: приёмы, глифы, палитры, иконки, спрайты, звуки, файлы-хелперы и инструменты, которые стоит переиспользовать, у каждого источник и лицензия
- **Ноль токенов по умолчанию** — шаблоны не вызывают модель и ничего не добавляют в контекст

## Быстрый старт

Вставь в Claude Code (в терминале или во вкладке Code десктопа):

```text
Install the Claude Code plugin givememod from https://github.com/timoncool/givememod. In the shell run `claude plugin marketplace add timoncool/givememod`, then `claude plugin install givememod@givememod`, and check that `claude plugin list` shows givememod enabled. Then tell me to run /reload-plugins (or restart Claude Code) so that /givememod appears, and after that to type /givememod in any conversation.
```

Или вручную, в любом терминале:

```bash
claude plugin marketplace add timoncool/givememod
claude plugin install givememod@givememod
```

Модам нужен Claude Code 2.1.287+ (во вкладке Code десктопа — 2.1.286+). Плагин ставится на пользователя, поэтому он есть и в терминале, и в десктопе; внутри терминальной сессии работает и `/plugin install givememod@givememod`.

## Как пользоваться

```text
/givememod полоса плана над промптом
/givememod держи любой rm -rf и force push, пока я не подтвержу
/givememod гоняй `npm test` каждые 20 секунд
/givememod какой мод тут пригодится?
сделай мне мод, который считает файлы, которые ты трогаешь
```

Когда мод в сессии пишется впервые, Claude Code спрашивает **Enable hot reloading for this session?** — выбери **Enable for this session**. Мод появится, когда закончится ответ; проси правки — каждая подгрузится так же.

| Шаблон | Что получаешь |
|---|---|
| `plan-progress` | `Plan ███░░ 3/5 · Fixing the bug` из списка задач самого Claude |
| `files-touched` | `Files: 4 read · 2 edited · 1 new` и панель `/files` |
| `context-gauge` | `Context 62% 124k / 200k ▂▃▅▆` |
| `turn-receipt` | строка под каждым ответом: время, инструменты, изменённые файлы, сбои; тост на долгих ходах |
| `goal-pin` | цель диалога над промптом с таймером |
| `risky-hold` | `rm -rf`, `reset --hard`, force push, `DROP` ждут твоего **Run it** |
| `watch-command` | команда по таймеру, её состояние под промптом, тост при смене результата |
| `reply-choices` | пронумерованные варианты в конце ответа становятся кнопками |
| `pinboard` | решения, задачи и ссылки, которые Claude закрепляет своим тулом, в боковой панели |
| `focus-timer` | обратный отсчёт над промптом |
| `starter` | пустой каркас для всего остального |

**Оставить мод**: скажи «оставь этот». Он копируется в `~/.claude/skills/<имя>/` (или в `.claude/skills/` проекта, если он нужен только там) и записывается в `~/.claude/givememod/FAVORITES.md`. Папку с `plugin.json` оттуда Claude Code грузит как `<имя>@skills-dir` со следующей сессии, ставить ничего не надо; выключить — `claude plugin disable <имя>@skills-dir`.

**Ещё умеет**: объясняет, почему мод ничего не делает; проверяет чужой мод до установки (до чего дотягивается, сколько стоит за ход); отвечает «кто уже сделал X?» по карте публичных модов.

## Сделано с givememod

Моды, которые он собрал в живых сессиях:

**Сверка ТЗ.** «Сверь всё, что я просил в этом диалоге»: полоса считает пункты ТЗ, здесь 27 из 29 сделано, из них 9 доделаны со второго захода, 1 открыт, 1 не начат; `/tz` показывает список.

<img src="docs/made-with/tz-check.png" alt="Полоса над полем ввода: Сверка ТЗ givememod, прогресс-бар, 27/29, доделано 9, открыто 1, не делал 1, /tz" width="748">

**Музыка над полем ввода.** «Плеер Spotify»: что играет, прогресс трека и кнопки назад, пауза, вперёд.

<img src="docs/made-with/spotify.png" alt="Полоса над полем ввода: кнопки назад, пауза, вперёд, The Redeemer — ANIZYZ, 0:39 из 1:33" width="746">

**Долгая работа на виду.** «Покажи пайплайн дубляжа»: нейродубляж GTA V из 12 этапов, текущий шаг со своим счётчиком и что дальше. Готовый шаг сереет с галочкой, полоса идёт дальше.

<img src="docs/made-with/pipeline.png" alt="GTA V нейродубляж: этап 5 из 12, текущий шаг, Parakeet 17 639 из 29 676, что дальше" width="760">
<img src="docs/made-with/pipeline-done.png" alt="Шаг Parakeet готов: 29 676 из 29 676, 100%" width="760">
<img src="docs/made-with/pipeline-next.png" alt="GTA V нейродубляж: этап 6 из 12 и следующий шаг" width="760">

**[slapbox](https://github.com/timoncool/slapbox).** Начался в сессии givememod как «мод, чтобы шлёпать Claude, когда он косячит», и вырос в отдельный мод: восемь шлёпалок, девять попок, а Claude узнаёт счёт с твоим следующим сообщением.

<img src="https://raw.githubusercontent.com/timoncool/slapbox/main/docs/teaser-ru.gif" alt="slapbox: мультяшную попку над полем ввода шлёпают рукой, тапком, стеком, линейкой и сковородой, меняются попки" width="760">

## Что внутри

| Часть | Содержимое |
|---|---|
| `SKILL.md` | пайплайн: ситуация → кандидат → сборка → проверка → доводка → в любимые |
| `references/picker.md` | таблица «ситуация → шаблон», предложение одной строкой, типовые доводки |
| `references/blocks.md` | 29 блоков с кодом: полоса, панель, вкладки, гард, удержание, `tool.check`, переписывание промпта, таймеры, состояние, перерисовка строк самого Claude Code, тулы для модели, вызовы модели, Raster и blit, Client, звук, свои методы `$`, анимация без шторма перерисовок, все поверхности, сообщения модели, отложенные действия, общее состояние сессий |
| `references/ui-cookbook.md` | места отрисовки, элементы по поверхностям, фокус и хоткеи, строка подсказки, замеренные особенности десктопа |
| `references/gotchas.md` | все известные грабли: симптом → причина → фикс, официальные лимиты, что пропускает встроенный guard, открытые баги, устаревшие утверждения времён early access |
| `references/testing.md` | тест-кит `claude-code/testing` с рабочими заглушками |
| `references/review-and-cost.md` | проверка чужого мода, цена по prompt cache, совместная работа модов |
| `references/landscape.md` | 3057 публичных модов разобраны: 17 задач, механики, лучшие примеры, идеи, которые стоит украсть, где тесно и где пусто |
| `references/techniques.md` | как лучшие моды решают повторяющиеся задачи, каждый приём со ссылкой на файл |
| `references/resources.md` | глифы, палитры, иконки, пиксель-арт, звуки, таблицы данных, файлы-хелперы и инструменты из публичных модов, с лицензиями |
| `references/api-index.md` | все события, методы `$` и поля `next` по строке на каждое, собрано из типов сборки |
| `references/catalog/mods.tsv` | каждый публичный мод: звёзды, ссылка, хуки, вызовы, уровень доступа |
| `templates/` | 11 модов с тестами |
| `examples/` | примеры модов от Anthropic и лучшие моды сообщества, с лицензиями |

## Как это работает

1. **Ситуация**: что ты попросил, характер работы, состояние сессии, проект, твои любимые моды.
2. **Кандидат**: самый маленький полезный мод; `/givememod` собирает его сразу и называет запасной, а без запроса мод только предлагается одной строкой.
3. **Сборка**: шаблон копируется в папку модов сессии и дорабатывается блоками по правилам, которые проверяет загрузчик.
4. **Проверка**: `claude plugin validate` и `claude plugin test` до того, как ты его увидишь.
5. **Доводка**: короче, под промптом, в боковой панели, только пока Claude работает, другой цвет, спрашивать перед X.
6. **В любимые**: оставленные моды уходят в папку скиллов, грузятся в каждой сессии и в следующий раз предлагаются первыми.

## Другие проекты [@timoncool](https://github.com/timoncool)

| Проект | Описание |
|--------|----------|
| [Angry Switcher](https://github.com/timoncool/angry-switcher) | Ругайся на Claude Code сколько хочешь — он читает чистую версию |
| [satori](https://github.com/timoncool/satori) | Самообучение для Claude Code: исправления становятся скиллами |
| [telegram-api-mcp](https://github.com/timoncool/telegram-api-mcp) | Telegram Bot API как MCP-сервер |
| [civitai-mcp-ultimate](https://github.com/timoncool/civitai-mcp-ultimate) | Civitai API как MCP-сервер |
| [trail-spec](https://github.com/timoncool/trail-spec) | TRAIL — протокол трекинга контента |
| [ACE-Step Studio](https://github.com/timoncool/ACE-Step-Studio) | AI-студия музыки — песни, вокал, каверы, клипы |
| [VideoSOS](https://github.com/timoncool/videosos) | AI-видеопродакшн в браузере |

## Авторы

- **Nerual Dreming** — [Telegram](https://t.me/nerual_dreming) | [neuro-cartel.com](https://neuro-cartel.com) | [ArtGeneration.me](https://artgeneration.me)

## Благодарности

Опирается на [документацию по модам](https://code.claude.com/docs/en/plugins/mods/overview) от Anthropic, [встроенные моды](https://github.com/anthropics/claude-code/tree/main/mods) и [примеры модов](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods). Карта публичных модов построена по [karanb192/awesome-claude-code-mods](https://github.com/karanb192/awesome-claude-code-mods). Грабли и паттерны собраны из скиллов сообщества, перечисленных в [`references/sources.md`](plugins/givememod/skills/givememod/references/sources.md): BeLazy167, Sstobo, DannyMac180, jclfocused, ysoftman, BorjaGM1, emanueledenaro, jamubc, tomada1114, nogu66, karanb192 и другие. Примеры модов от [hamzafer](https://github.com/hamzafer/claude-code-mods), [sezaakgun](https://github.com/sezaakgun/cc-arcade) и [jarrodwatts](https://github.com/jarrodwatts/claude-image-view) (MIT).

## Поддержать автора

Я создаю опенсорс софт и занимаюсь исследованиями в области ИИ. Большая часть всего, что я делаю, находится в открытом доступе. Ваши пожертвования позволяют мне создавать и исследовать больше, не отвлекаясь на поиск еды для продолжения существования =)

**[Все способы поддержки](https://github.com/timoncool/ACE-Step-Studio/blob/master/DONATE.md)** | **[dalink.to/nerual_dreming](https://dalink.to/nerual_dreming)** | **[boosty.to/neuro_art](https://boosty.to/neuro_art)**

- **BTC:** `1E7dHL22RpyhJGVpcvKdbyZgksSYkYeEBC`
- **ETH (ERC20):** `0xb5db65adf478983186d4897ba92fe2c25c594a0c`
- **USDT (TRC20):** `TQST9Lp2TjK6FiVkn4fwfGUee7NmkxEE7C`

## Star History

<a href="https://github.com/timoncool/givememod/stargazers">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="docs/stars-dark.svg" />
   <source media="(prefers-color-scheme: light)" srcset="docs/stars-light.svg" />
   <img alt="Star History Chart" src="docs/stars-light.svg" />
 </picture>
</a>

## Лицензия

MIT. Примеры модов сохраняют свои лицензии (MIT, Apache-2.0), файл лицензии лежит рядом с каждым.
