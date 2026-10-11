"""Builds the project page (docs/index.html, docs/ru.html, docs/zh.html) and its SEO files from one template.

Run from the repository root: python scripts/build_site.py
"""
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, 'docs')
SITE = 'https://timoncool.github.io/givememod/'
REPO = 'https://github.com/timoncool/givememod'
VERSION = '1.0.1'
UPDATED = '2026-10-11'
LANGS = ['en', 'ru', 'zh']
FILES = {'en': 'index.html', 'ru': 'ru.html', 'zh': 'zh.html'}
NAMES = {'en': 'EN', 'ru': 'RU', 'zh': '中文'}
LOCALES = {'en': 'en_US', 'ru': 'ru_RU', 'zh': 'zh_CN'}

E = html.escape

INSTALL = [
    'claude plugin marketplace add timoncool/givememod',
    'claude plugin install givememod@givememod',
]

T = {
    'en': {
        'title': 'givememod: a Claude Code mod for the task in front of you',
        'desc': 'A Claude Code skill that reads the conversation, proposes the small mod that fits it, builds it from tested templates, loads it live in the terminal and the desktop app, and keeps the ones you like.',
        'og_alt': 'Say /givememod. Get a mod for the task in front of you.',
        'nav': [('cases', 'Cases'), ('how', 'How it works'), ('inside', 'Inside'), ('install', 'Install'), ('faq', 'FAQ')],
        'h1a': 'Say /givememod.', 'h1b': 'Get a mod for this task.',
        'lead': 'A Claude Code skill. It reads what you are doing, builds the small mod that fits it, loads it live in the terminal or the desktop app, and tunes it until you like it.',
        'cta': 'Install', 'star': 'Star on GitHub',
        'video_alt': 'Seven tasks in the Claude Code desktop app and terminal; each time /givememod builds the mod that fits.',
        'why_h': 'Why',
        'why': [
            'Claude Code mods are small plugins that run inside Claude Code: a band above the prompt, a side pane, a toast, a hold on a tool call, a command that answers instantly. More than 3,000 public ones appeared in a few weeks, and almost all are general products.',
            'What a task needs is smaller and shorter-lived: the bar for this migration, the guard for this deploy, the watcher for this test suite. givememod writes that one in a minute and knows what the 3,000 others already figured out.',
        ],
        'cases_h': 'Situation in, mod out',
        'cases_sub': 'Type /givememod on its own and it reads the conversation; add words to ask for something specific.',
        'cases': [
            ('A plan drives the work', 'plan-progress', 'Plan ███████░░░░░ 3/5 · Fixing the session check'),
            ('Risky commands ahead', 'risky-hold', 'Run this recursive delete? rm -rf build/ dist/'),
            ('Tests run long', 'watch-command', 'watch: npm test → exit 1'),
            ('The context fills up', 'context-gauge', 'Context 71% 142k / 200k ▁▂▃▄▅▆▇'),
            ('Many files are changing', 'files-touched', 'Files: 12 read · 9 edited · 1 new · /files'),
            ('Answers end with options', 'reply-choices', '1: Keep Postgres   2: Move to Redis'),
            ('Long autonomous turns', 'turn-receipt', '1m 15s · 3 tool calls (Edit 2, Bash 1) · 1 failed'),
            ('The goal drifts', 'goal-pin', 'Goal ship the login fix  12m'),
            ('Decisions pile up', 'pinboard', 'Claude pins decisions with its own tool, in a pane'),
            ('A deadline or a break', 'focus-timer', '18:42 review [pause] [stop]'),
        ],
        'how_h': 'How it works',
        'how': [
            ('Reads the situation', 'What you asked, the shape of the work (a plan, many files, long jobs, risky commands, subagents), session state, the project, your favorites.'),
            ('Picks one mod', 'The smallest mod that helps. /givememod builds it at once and names the runner-up; unasked, on a long task, it is offered in one line with what it shows, where and what it costs.'),
            ('Builds it from a template', 'Eleven tested templates and 29 building blocks, written by the rules the loader enforces, into the session\'s mods folder.'),
            ('Checks it', 'claude plugin validate and claude plugin test before you see it.'),
            ('Loads it live', 'The first time, Claude Code asks to enable hot reloading for the session; after that every change appears when the reply ends.'),
            ('Keeps the ones you like', 'Say "keep it": the mod goes to your skills folder, loads in every session with nothing to install, and is proposed first the next time a similar task comes up.'),
        ],
        'in_h': 'What is inside',
        'in_sub': 'Everything the skill reads before it writes a line.',
        'stats': [('3,057', 'public mods mapped: what people build, why and how'), ('222', 'mod repositories read file by file'), ('29', 'building blocks with code'), ('11', 'templates with tests')],
        'refs': [
            ('picker', 'situation → template, the one-line proposal, the usual tweaks'),
            ('techniques', 'how the best mods share the band, animate, draw on every surface, guard calls, call models, keep state'),
            ('resources', 'glyphs, palettes, icons, sprites, sounds, helper files and tools, each with its licence'),
            ('gotchas', 'every documented trap, the official limits, what the built-in guard skips, open issues'),
            ('landscape', '17 jobs people build mods for, best examples, open niches'),
            ('review-and-cost', 'vetting a third-party mod and pricing it in tokens'),
        ],
        'where_h': 'Where it works',
        'where': [
            ('Terminal', 'Claude Code 2.1.287+: bands, panes, status line, toasts, held tool calls, commands.'),
            ('Desktop app', 'The Code tab of Claude Desktop, 2.1.286+: the same mods, drawn as cards, panes and toasts.'),
            ('Elsewhere', 'Hooks also run in claude -p, the SDK and the VS Code panel, where nothing is drawn.'),
        ],
        'pc_h': 'Good and not so good',
        'pros_h': 'Good', 'cons_h': 'Not so good',
        'pros': [
            'Zero tokens by default: the templates make no model calls and add nothing to the context.',
            'Every mod is validated and tested before you see it.',
            'One-off mods go away with the session; the ones you keep follow you.',
            'Reviews third-party mods before you install them: reach, cost, red flags.',
        ],
        'cons': [
            'Mods run with your permissions; a guard on Bash is a reminder, not a sandbox.',
            'The first mod of a session asks you to enable hot reloading.',
            'Mods draw only in the terminal and the desktop Code tab; in VS Code and claude -p the hooks run without drawing.',
            'A mod that hooks Bash breaks Bash in worktree subagents until Claude Code fixes it.',
        ],
        'inst_h': 'Install',
        'inst': ['Add the marketplace (any terminal)', 'Install the plugin', 'Restart Claude Code, then in any session'],
        'try': '/givememod',
        'copy': 'Copy', 'copied': 'Copied',
        'use_h': 'Things to say',
        'use': ['/givememod', '/givememod a bar of the plan above the prompt', '/givememod hold any rm -rf until I confirm', '/givememod run npm test every 20 seconds', 'keep this one', 'is this mod safe to install?'],
        'faq_h': 'Questions',
        'faq': [
            ('What is a Claude Code mod?', 'A plugin whose hooks module runs inside Claude Code. It can draw a band above the prompt, open a pane, show toasts and a status line, hold a tool call until you answer, add commands that answer with no model turn, and give Claude tools.'),
            ('Does it cost tokens?', 'Building a mod is one ordinary Claude turn. The mods themselves make no model calls unless you ask for one, and they add nothing to the context.'),
            ('Where do the mods live?', 'A one-off mod lives in the session\'s mods folder and is cleaned up with old sessions. A kept mod is copied to ~/.claude/skills/<name> (or the project\'s .claude/skills) and loads from there in every session.'),
            ('Does it work in the desktop app?', 'Yes, in the Code tab of Claude Desktop. Install the plugin once from a terminal; the skill is then there in desktop sessions too.'),
            ('Is a mod safe?', 'A mod runs with your permissions. Every template is small and readable, guards fail closed, and the skill reviews any third-party mod before you load it.'),
            ('Can I share a mod I like?', 'Yes. A folder with a marketplace file beside plugin.json is installable with /plugin install <mod> --marketplace <owner>/<repo>.'),
        ],
        'author_h': 'Who made this',
        'author': 'Nerual Dreming. Artist, founder of ArtGeneration.me and the Neuro-Cartel community, author of Angry Switcher, ACE-Step Studio, YuE2 Studio and MiniMax Music3 Studio.',
        'support': 'Support the project',
        'foot': [('MIT license', REPO + '/blob/main/LICENSE'), ('What changed', REPO + '/blob/main/CHANGELOG.md'), ('Report an issue', REPO + '/issues')],
        'updated': 'Updated',
    },
    'ru': {
        'title': 'givememod: мод Claude Code под задачу, которая у тебя сейчас',
        'desc': 'Скилл для Claude Code: читает диалог, предлагает маленький мод под задачу, собирает его из проверенных шаблонов, подгружает на лету в терминале и в десктопе и оставляет понравившиеся.',
        'og_alt': 'Пишешь /givememod и получаешь мод под текущую задачу.',
        'nav': [('cases', 'Кейсы'), ('how', 'Как работает'), ('inside', 'Что внутри'), ('install', 'Установка'), ('faq', 'Вопросы')],
        'h1a': 'Пишешь /givememod.', 'h1b': 'Получаешь мод под задачу.',
        'lead': 'Скилл для Claude Code. Смотрит, что ты делаешь, собирает маленький мод под это, подгружает его на лету в терминале или в десктопе и доводит, пока не понравится.',
        'cta': 'Установить', 'star': 'Звезда на GitHub',
        'video_alt': 'Семь задач в десктопе Claude Code и в терминале: каждый раз /givememod собирает подходящий мод.',
        'why_h': 'Зачем',
        'why': [
            'Моды Claude Code это маленькие плагины внутри Claude Code: полоса над промптом, боковая панель, уведомление, удержание вызова инструмента, команда, которая отвечает мгновенно. За несколько недель появилось больше 3000 публичных, и почти все это общие продукты.',
            'Задаче нужно что-то меньше и короче: полоса для этой миграции, гард для этого деплоя, наблюдатель за этими тестами. givememod пишет такой мод за минуту и знает всё, до чего додумались авторы тех 3000.',
        ],
        'cases_h': 'Ситуация на входе, мод на выходе',
        'cases_sub': 'Просто /givememod, и он сам читает диалог; добавь слова, чтобы попросить конкретное.',
        'cases': [
            ('Работа идёт по плану', 'plan-progress', 'План ███████░░░░░ 3/5 · Исправляю проверку сессии'),
            ('Впереди опасные команды', 'risky-hold', 'Выполнить рекурсивное удаление? rm -rf build/ dist/'),
            ('Тесты идут долго', 'watch-command', 'watch: npm test → exit 1'),
            ('Контекст заполняется', 'context-gauge', 'Context 71% 142k / 200k ▁▂▃▄▅▆▇'),
            ('Меняется много файлов', 'files-touched', 'Файлы: 12 прочитано · 9 изменено · 1 новый · /files'),
            ('Ответы кончаются вариантами', 'reply-choices', '1: Оставить Postgres   2: Перейти на Redis'),
            ('Долгие автономные ходы', 'turn-receipt', '1m 15s · 3 вызова (Edit 2, Bash 1) · 1 сбой'),
            ('Цель расплывается', 'goal-pin', 'Цель: выкатить фикс логина  12m'),
            ('Копятся решения', 'pinboard', 'Claude закрепляет решения своим тулом, в панели'),
            ('Дедлайн или перерыв', 'focus-timer', '18:42 ревью [пауза] [стоп]'),
        ],
        'how_h': 'Как работает',
        'how': [
            ('Читает ситуацию', 'Что ты попросил, характер работы (план, много файлов, долгие задачи, опасные команды, сабагенты), состояние сессии, проект, твои любимые моды.'),
            ('Выбирает один мод', 'Самый маленький полезный мод. По /givememod собирает его сразу и называет запасной; без запроса, на долгой задаче, предлагает одной строкой: что показывает, где и сколько стоит.'),
            ('Собирает из шаблона', 'Одиннадцать проверенных шаблонов и 29 блоков, по правилам, которые проверяет загрузчик, в папку модов сессии.'),
            ('Проверяет', 'claude plugin validate и claude plugin test до того, как ты его увидишь.'),
            ('Подгружает на лету', 'В первый раз Claude Code спросит, включить ли hot reload для сессии; дальше каждая правка появляется, когда заканчивается ответ.'),
            ('Оставляет понравившиеся', 'Скажи «оставь»: мод уходит в папку скиллов, грузится в каждой сессии без установки, и в похожей задаче его предложат первым.'),
        ],
        'in_h': 'Что внутри',
        'in_sub': 'Всё, что скилл читает, прежде чем написать строку.',
        'stats': [('3057', 'публичных модов на карте: что делают люди, зачем и как'), ('222', 'репозитория модов прочитаны пофайлово'), ('29', 'блоков с кодом'), ('11', 'шаблонов с тестами')],
        'refs': [
            ('picker', 'ситуация → шаблон, предложение одной строкой, типовые доводки'),
            ('techniques', 'как лучшие моды делят полосу, анимируют, рисуют на всех поверхностях, сторожат вызовы, зовут модель, хранят состояние'),
            ('resources', 'глифы, палитры, иконки, спрайты, звуки, файлы-хелперы и инструменты, у каждого лицензия'),
            ('gotchas', 'все известные грабли, официальные лимиты, что пропускает встроенный guard, открытые баги'),
            ('landscape', '17 задач, ради которых пишут моды, лучшие примеры, пустые ниши'),
            ('review-and-cost', 'проверка чужого мода и его цена в токенах'),
        ],
        'where_h': 'Где работает',
        'where': [
            ('Терминал', 'Claude Code 2.1.287+: полосы, панели, строка статуса, уведомления, удержание вызовов, команды.'),
            ('Десктоп', 'Вкладка Code в Claude Desktop, 2.1.286+: те же моды, нарисованные карточками, панелями и уведомлениями.'),
            ('Остальное', 'Хуки работают и в claude -p, SDK и панели VS Code, но там ничего не рисуется.'),
        ],
        'pc_h': 'Плюсы и минусы',
        'pros_h': 'Плюсы', 'cons_h': 'Минусы',
        'pros': [
            'Ноль токенов по умолчанию: шаблоны не вызывают модель и ничего не добавляют в контекст.',
            'Каждый мод проходит validate и тесты до того, как ты его увидишь.',
            'Разовые моды уходят вместе с сессией, оставленные идут с тобой дальше.',
            'Проверяет чужие моды до установки: до чего дотягиваются, сколько стоят, что настораживает.',
        ],
        'cons': [
            'Моды работают с твоими правами; гард на Bash это напоминание, а не песочница.',
            'Первый мод в сессии попросит включить hot reload.',
            'Моды рисуют только в терминале и во вкладке Code десктопа; в VS Code и claude -p хуки работают без отрисовки.',
            'Мод с хуком на Bash ломает Bash у сабагентов в worktree, пока это не починят в Claude Code.',
        ],
        'inst_h': 'Установка',
        'inst': ['Добавь маркетплейс (в любом терминале)', 'Установи плагин', 'Перезапусти Claude Code и в любой сессии'],
        'try': '/givememod',
        'copy': 'Копировать', 'copied': 'Скопировано',
        'use_h': 'Что можно сказать',
        'use': ['/givememod', '/givememod полосу плана над промптом', '/givememod держи rm -rf, пока не подтвержу', '/givememod гоняй npm test каждые 20 секунд', 'оставь этот', 'этот мод безопасно ставить?'],
        'faq_h': 'Вопросы',
        'faq': [
            ('Что такое мод Claude Code?', 'Плагин с модулем хуков, который работает внутри Claude Code. Он умеет рисовать полосу над промптом, открывать панель, показывать уведомления и строку статуса, держать вызов инструмента до твоего ответа, добавлять команды без хода модели и давать Claude свои инструменты.'),
            ('Это тратит токены?', 'Сборка мода это один обычный ход Claude. Сами моды не вызывают модель, если не попросить, и ничего не добавляют в контекст.'),
            ('Где живут моды?', 'Разовый мод лежит в папке модов сессии и убирается вместе со старыми сессиями. Оставленный копируется в ~/.claude/skills/<имя> (или в .claude/skills проекта) и грузится оттуда в каждой сессии.'),
            ('В десктопе работает?', 'Да, во вкладке Code в Claude Desktop. Установи плагин один раз из терминала, и скилл появится в десктопных сессиях.'),
            ('Мод безопасен?', 'Мод работает с твоими правами. Каждый шаблон маленький и читаемый, гарды закрываются при сбое, а чужой мод скилл проверяет до загрузки.'),
            ('Можно поделиться модом?', 'Да. Папка с файлом маркетплейса рядом с plugin.json ставится командой /plugin install <мод> --marketplace <владелец>/<репо>.'),
        ],
        'author_h': 'Кто сделал',
        'author': 'Nerual Dreming. Художник, основатель ArtGeneration.me и сообщества Нейро-Картель, автор Angry Switcher, ACE-Step Studio, YuE2 Studio и MiniMax Music3 Studio.',
        'support': 'Поддержать проект',
        'foot': [('Лицензия MIT', REPO + '/blob/main/LICENSE'), ('Что изменилось', REPO + '/blob/main/CHANGELOG.md'), ('Сообщить о проблеме', REPO + '/issues')],
        'updated': 'Обновлено',
    },
    'zh': {
        'title': 'givememod：为手头任务定制的 Claude Code mod',
        'desc': '一个 Claude Code skill：读懂对话，提出合适的小 mod，用测试过的模板构建，在终端和桌面版中实时加载，并保留你喜欢的那些。',
        'og_alt': '输入 /givememod，得到适合当前任务的 mod。',
        'nav': [('cases', '场景'), ('how', '原理'), ('inside', '内容'), ('install', '安装'), ('faq', '问答')],
        'h1a': '输入 /givememod。', 'h1b': '得到适合这项任务的 mod。',
        'lead': '一个 Claude Code skill。它看你在做什么，构建合适的小 mod，在终端或桌面版中实时加载，并按你的意见调整。',
        'cta': '安装', 'star': '在 GitHub 上加星',
        'video_alt': 'Claude Code 桌面版和终端中的七个任务；每次 /givememod 都构建合适的 mod。',
        'why_h': '为什么',
        'why': [
            'Claude Code mod 是运行在 Claude Code 内部的小插件：输入框上方的信息栏、侧边面板、提示、暂停工具调用、立即响应的命令。几周内出现了 3000 多个公开 mod，几乎都是通用产品。',
            '一项任务需要的更小、更短命：这次迁移的进度条、这次部署的保护、这组测试的监视器。givememod 一分钟写好它，并且知道那 3000 个 mod 积累的经验。',
        ],
        'cases_h': '输入情境，得到 mod',
        'cases_sub': '只输入 /givememod，它会读懂对话；加上文字可以提出具体要求。',
        'cases': [
            ('工作按计划进行', 'plan-progress', '计划 ███████░░░░░ 3/5 · 修复会话检查'),
            ('即将执行危险命令', 'risky-hold', '要运行递归删除吗？rm -rf build/ dist/'),
            ('测试很慢', 'watch-command', 'watch: npm test → exit 1'),
            ('上下文快满了', 'context-gauge', 'Context 71% 142k / 200k ▁▂▃▄▅▆▇'),
            ('很多文件在变化', 'files-touched', '文件：读取 12 · 修改 9 · 新建 1 · /files'),
            ('回答以选项结尾', 'reply-choices', '1: 继续用 Postgres   2: 迁到 Redis'),
            ('长时间自主运行', 'turn-receipt', '1m 15s · 3 次调用（Edit 2, Bash 1）· 失败 1'),
            ('目标偏离', 'goal-pin', '目标：发布登录修复  12m'),
            ('决定越积越多', 'pinboard', 'Claude 用自己的工具置顶决定，显示在面板'),
            ('截止时间或休息', 'focus-timer', '18:42 评审 [暂停] [停止]'),
        ],
        'how_h': '原理',
        'how': [
            ('读懂情境', '你的请求、工作形态（计划、大量文件、长任务、危险命令、子代理）、会话状态、项目、你的收藏。'),
            ('选出一个 mod', '最小可用的 mod。输入 /givememod 会直接构建并给出备选；没人要求时，遇到长任务会用一行提出：显示什么、在哪里、成本多少。'),
            ('用模板构建', '11 个测试过的模板和 29 个构建块，遵循加载器的规则，写入本会话的 mods 文件夹。'),
            ('检查', '在你看到之前运行 claude plugin validate 和 claude plugin test。'),
            ('实时加载', '第一次 Claude Code 会询问是否为本会话启用热重载；之后每次修改都在回答结束时生效。'),
            ('保留喜欢的', '说"留下它"：mod 进入你的 skills 文件夹，无需安装即在每个会话中加载，下次遇到类似任务时优先推荐。'),
        ],
        'in_h': '里面有什么',
        'in_sub': 'skill 在写下第一行之前读过的全部内容。',
        'stats': [('3057', '个公开 mod 的地图：做了什么、为什么、怎么做'), ('222', '个 mod 仓库逐文件读过'), ('29', '个带代码的构建块'), ('11', '个带测试的模板')],
        'refs': [
            ('picker', '情境 → 模板、一行提议、常见调整'),
            ('techniques', '优秀 mod 如何共享信息栏、做动画、在各界面绘制、拦截调用、调用模型、保存状态'),
            ('resources', '字符、配色、图标、像素图、音效、辅助代码和工具，附许可证'),
            ('gotchas', '所有已知的坑、官方限制、内置守卫跳过的事件、未解决的 issue'),
            ('landscape', '人们写 mod 的 17 类任务、最佳示例、空白领域'),
            ('review-and-cost', '审查第三方 mod 并估算 token 成本'),
        ],
        'where_h': '在哪里可用',
        'where': [
            ('终端', 'Claude Code 2.1.287+：信息栏、面板、状态行、提示、暂停的工具调用、命令。'),
            ('桌面版', 'Claude Desktop 的 Code 标签页，2.1.286+：同样的 mod，绘制为卡片、面板和提示。'),
            ('其他', 'claude -p、SDK 和 VS Code 面板中钩子也会运行，但不绘制任何内容。'),
        ],
        'pc_h': '优点和不足',
        'pros_h': '优点', 'cons_h': '不足',
        'pros': [
            '默认零 token：模板不调用模型，也不向上下文添加内容。',
            '每个 mod 在你看到之前都通过 validate 和测试。',
            '临时 mod 随会话结束而消失，保留的会一直跟着你。',
            '安装第三方 mod 前先审查：能访问什么、成本多少、有什么风险。',
        ],
        'cons': [
            'mod 以你的权限运行；Bash 守卫是提醒，不是沙箱。',
            '会话中第一个 mod 会请求启用热重载。',
            'mod 只在终端和桌面版 Code 标签页中绘制；在 VS Code 和 claude -p 中钩子照常运行，但不绘制。',
            '在 Claude Code 修复之前，拦截 Bash 的 mod 会让 worktree 子代理中的 Bash 失效。',
        ],
        'inst_h': '安装',
        'inst': ['添加 marketplace（任意终端）', '安装插件', '重启 Claude Code，然后在任意会话中'],
        'try': '/givememod',
        'copy': '复制', 'copied': '已复制',
        'use_h': '可以这样说',
        'use': ['/givememod', '/givememod 在输入框上方显示计划进度', '/givememod 任何 rm -rf 都先等我确认', '/givememod 每 20 秒运行一次 npm test', '留下这个', '这个 mod 安装安全吗？'],
        'faq_h': '问答',
        'faq': [
            ('什么是 Claude Code mod？', '一个带钩子模块、在 Claude Code 内部运行的插件。它可以在输入框上方绘制信息栏、打开面板、显示提示和状态行、在你回答前暂停工具调用、添加无需模型回合的命令，并为 Claude 提供工具。'),
            ('会消耗 token 吗？', '构建 mod 是一次普通的 Claude 回合。mod 本身不会调用模型（除非你要求），也不向上下文添加内容。'),
            ('mod 存放在哪里？', '临时 mod 位于会话的 mods 文件夹，随旧会话一起清理。保留的 mod 复制到 ~/.claude/skills/<名称>（或项目的 .claude/skills），每个会话都从那里加载。'),
            ('桌面版能用吗？', '能，在 Claude Desktop 的 Code 标签页中。在终端安装一次插件，桌面会话里也能用这个 skill。'),
            ('mod 安全吗？', 'mod 以你的权限运行。每个模板都很小且易读，守卫在出错时拒绝执行，第三方 mod 在加载前会被审查。'),
            ('能分享我做的 mod 吗？', '能。在 plugin.json 旁放一个 marketplace 文件，就可以用 /plugin install <mod> --marketplace <owner>/<repo> 安装。'),
        ],
        'author_h': '作者',
        'author': 'Nerual Dreming。艺术家，ArtGeneration.me 和 Neuro-Cartel 社区的创始人，Angry Switcher、ACE-Step Studio、YuE2 Studio 和 MiniMax Music3 Studio 的作者。',
        'support': '支持项目',
        'foot': [('MIT 许可证', REPO + '/blob/main/LICENSE'), ('更新日志', REPO + '/blob/main/CHANGELOG.md'), ('报告问题', REPO + '/issues')],
        'updated': '更新于',
    },
}

LINKS = [('GitHub', 'https://github.com/timoncool'), ('Telegram @nerual_dreming', 'https://t.me/nerual_dreming'), ('Telegram @neuroport', 'https://t.me/neuroport'), ('ArtGeneration.me', 'https://artgeneration.me')]
DONATE = 'https://github.com/timoncool/ACE-Step-Studio/blob/master/DONATE.md'
STARS = 'https://img.shields.io/github/stars/timoncool/givememod?style=flat&amp;label=%E2%98%85&amp;color=2a2b30&amp;cacheSeconds=3600'

CSS = """
@font-face { font-family: 'Cascadia Mono'; src: url('site/fonts/cascadia-mono.woff2') format('woff2'); font-weight: 200 700; font-display: swap; }
:root { --bg: #111214; --panel: #18191c; --panel-2: #1f2024; --line: #2a2b30; --text: #ececec; --muted: #9b9ea6; --accent: #d97757; --ok: #6cc58a; --warn: #e0b15a; --r: 14px; color-scheme: dark;
  --sans: 'Segoe UI', system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; --mono: 'Cascadia Mono', ui-monospace, Menlo, Consolas, monospace; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 76px; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { margin: 0; background: var(--bg); color: var(--text); font: 400 17px/1.65 var(--sans); -webkit-font-smoothing: antialiased; }
a { color: var(--accent); text-underline-offset: 3px; }
a:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }
code, .mono { font-family: var(--mono); }
.wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
header { position: sticky; top: 0; z-index: 10; background: rgba(17,18,20,.9); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.bar { display: flex; align-items: center; gap: 22px; height: 62px; }
.brand { display: flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; font-weight: 700; font-family: var(--mono); white-space: nowrap; }
.brand img { width: 28px; height: 28px; border-radius: 7px; }
.bar nav { display: flex; gap: 22px; margin-left: auto; }
.bar nav a { color: var(--muted); text-decoration: none; font-size: 15px; white-space: nowrap; }
.bar nav a:hover { color: var(--text); }
.langs { display: flex; gap: 4px; }
.langs a { color: var(--muted); font-size: 13px; text-decoration: none; border: 1px solid var(--line); border-radius: 7px; padding: 3px 9px; }
.langs a[aria-current] { color: var(--text); border-color: var(--muted); }
.gh { display: flex; align-items: center; gap: 8px; color: var(--text); text-decoration: none; font-size: 14px; }
.hero { padding: 64px 0 40px; text-align: center; }
h1 { margin: 0; font-size: clamp(32px, 4.6vw, 60px); line-height: 1.08; letter-spacing: -0.03em; font-weight: 800; }
h1 code { color: var(--accent); font-weight: 700; }
h1 .after { display: block; margin-top: 8px; color: var(--muted); font-weight: 700; }
.lead { margin: 22px auto 0; color: var(--muted); font-size: 19px; max-width: 46em; }
.cta { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 30px; }
.btn { display: inline-flex; align-items: center; gap: 10px; height: 48px; padding: 0 22px; border-radius: 12px; font: inherit; font-weight: 600; text-decoration: none; white-space: nowrap; border: 1px solid var(--line); color: var(--text); background: var(--panel); cursor: pointer; transition: transform .12s ease, border-color .12s ease; }
.btn:hover { border-color: var(--muted); }
.btn:active { transform: translateY(1px); }
.btn.primary { background: var(--accent); border-color: var(--accent); color: #1a0f0a; }
.reel { margin: 44px auto 0; max-width: 1100px; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 30px 80px rgba(0,0,0,.45); }
.reel video { display: block; width: 100%; height: auto; aspect-ratio: 1280 / 720; background: #0d0d0e; }
section { padding: 80px 0; border-top: 1px solid var(--line); }
h2 { margin: 0 0 12px; font-size: 32px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 800; }
.sub { margin: 0 0 34px; color: var(--muted); max-width: 64ch; }
.why { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px; }
.why p { margin: 0; }
.cases { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.case { padding: 18px 20px; border: 1px solid var(--line); border-radius: var(--r); background: var(--panel); display: grid; gap: 10px; min-width: 0; }
.case .s { font-weight: 600; }
.case .s::after { content: "  →  "; color: var(--muted); font-weight: 400; }
.case .m { font-family: var(--mono); color: var(--accent); font-size: 15px; }
.case .v { font-family: var(--mono); font-size: 14px; color: var(--muted); background: var(--panel-2); border-radius: 9px; padding: 9px 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.steps6 { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; counter-reset: s; }
.steps6 li { counter-increment: s; padding: 22px; border: 1px solid var(--line); border-radius: var(--r); background: var(--panel); }
.steps6 li::before { content: counter(s, decimal-leading-zero); display: block; font-family: var(--mono); color: var(--accent); font-size: 14px; margin-bottom: 10px; }
.steps6 b { display: block; font-size: 18px; margin-bottom: 6px; }
.steps6 span { color: var(--muted); font-size: 15.5px; }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.stat { padding: 22px; border-radius: var(--r); background: var(--panel); border: 1px solid var(--line); }
.stat b { display: block; font-size: 40px; line-height: 1; color: var(--accent); font-weight: 800; letter-spacing: -0.02em; }
.stat span { display: block; margin-top: 12px; font-size: 15px; color: var(--muted); }
.refs { margin-top: 30px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 40px; }
.refs div { display: grid; grid-template-columns: 11em minmax(0, 1fr); gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--line); }
.refs dt { font-family: var(--mono); color: var(--text); font-size: 15px; }
.refs dd { margin: 0; color: var(--muted); font-size: 15px; }
.where { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.where div { padding: 22px; border-radius: var(--r); border: 1px solid var(--line); }
.where b { display: block; margin-bottom: 6px; font-size: 18px; }
.where span { color: var(--muted); font-size: 15.5px; }
.pc { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px; }
.pc h3 { margin: 0 0 14px; font-size: 19px; }
.pc ul { list-style: none; margin: 0; padding: 0; }
.pc li { position: relative; padding: 0 0 14px 26px; }
.pc li::before { position: absolute; left: 0; font-weight: 700; font-family: var(--mono); }
.pros li::before { content: "+"; color: var(--ok); }
.cons li::before { content: "-"; color: var(--warn); }
.inst { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: start; }
.steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; counter-reset: i; }
.steps li { counter-increment: i; min-width: 0; }
.steps p { margin: 0 0 8px; }
.steps p::before { content: counter(i) ". "; color: var(--accent); font-weight: 700; }
.cmd { display: flex; align-items: center; gap: 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); padding: 10px 10px 10px 16px; }
.cmd code { flex: 1; min-width: 0; overflow-x: auto; white-space: nowrap; font-size: 15px; }
.cmd code::before { content: "> "; color: var(--accent); }
.cmd button { flex: none; height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel-2); color: var(--muted); font: inherit; font-size: 13px; cursor: pointer; }
.cmd button:hover { color: var(--text); border-color: var(--muted); }
.say h3 { margin: 0 0 14px; font-size: 19px; }
.say ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.say li { font-family: var(--mono); font-size: 15px; padding: 10px 14px; border-radius: 10px; background: var(--panel); border: 1px solid var(--line); overflow-x: auto; white-space: nowrap; }
details { border-bottom: 1px solid var(--line); max-width: 900px; }
summary { cursor: pointer; padding: 18px 0; font-weight: 600; list-style: none; display: flex; justify-content: space-between; gap: 16px; }
summary::-webkit-details-marker { display: none; }
summary::after { content: "+"; color: var(--accent); font-weight: 700; font-family: var(--mono); }
details[open] summary::after { content: "-"; }
details p { margin: 0 0 20px; color: var(--muted); max-width: 74ch; }
.author { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: 40px; align-items: start; }
.author p { margin: 0; max-width: 60ch; }
.author ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
footer { border-top: 1px solid var(--line); padding: 28px 0 40px; color: var(--muted); font-size: 14px; }
footer .wrap { display: flex; flex-wrap: wrap; gap: 22px; }
footer a { color: var(--muted); }
footer span { margin-left: auto; }
@media (max-width: 960px) {
  .bar nav { display: none; }
  .langs { margin-left: auto; }
  .why, .pc, .inst, .author, .refs { grid-template-columns: 1fr; gap: 28px; }
  .cases { grid-template-columns: 1fr; }
  .steps6, .where { grid-template-columns: 1fr; }
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  section { padding: 60px 0; }
}
@media (max-width: 520px) {
  .wrap { padding: 0 16px; }
  .gh { display: none; }
  .refs div { grid-template-columns: 1fr; gap: 2px; }
  footer span { margin-left: 0; }
}
"""

SCRIPT = """
document.querySelectorAll('.cmd button').forEach(function (b) {
  b.addEventListener('click', function () {
    var text = b.parentNode.querySelector('code').textContent;
    navigator.clipboard.writeText(text).then(function () {
      var label = b.textContent;
      b.textContent = b.dataset.done;
      setTimeout(function () { b.textContent = label; }, 1400);
    });
  });
});
var v = document.querySelector('.reel video');
if (v && !matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('controls'); v.play().catch(function () { v.setAttribute('controls', ''); }); }
"""


def url_of(lang):
    return SITE if lang == 'en' else SITE + FILES[lang]


def json_ld(lang, t):
    graph = [
        {'@type': 'SoftwareApplication', '@id': SITE + '#app', 'name': 'givememod', 'url': url_of(lang), 'inLanguage': lang,
         'description': t['desc'], 'applicationCategory': 'DeveloperApplication', 'applicationSubCategory': 'Claude Code skill',
         'operatingSystem': 'Windows, macOS, Linux', 'softwareVersion': VERSION, 'isAccessibleForFree': True,
         'license': 'https://opensource.org/licenses/MIT', 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'},
         'image': SITE + f'og-{lang}.jpg', 'codeRepository': REPO, 'sameAs': [REPO], 'downloadUrl': REPO,
         'author': {'@id': 'https://github.com/timoncool#person'}, 'dateModified': UPDATED},
        {'@type': 'Person', '@id': 'https://github.com/timoncool#person', 'name': 'Nerual Dreming', 'url': 'https://github.com/timoncool',
         'sameAs': ['https://github.com/timoncool', 'https://t.me/nerual_dreming', 'https://artgeneration.me']},
        {'@type': 'FAQPage', 'inLanguage': lang, 'mainEntity': [
            {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in t['faq']]},
    ]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False)


def cmd(text, t):
    return f'<div class="cmd"><code>{E(text)}</code><button type="button" data-done="{E(t["copied"])}">{E(t["copy"])}</button></div>'


def page(lang):
    t = T[lang]
    url = url_of(lang)
    alts = ''.join(f'<link rel="alternate" hreflang="{l}" href="{url_of(l)}" />' for l in LANGS) + f'<link rel="alternate" hreflang="x-default" href="{SITE}" />'
    og_alts = ''.join(f'<meta property="og:locale:alternate" content="{LOCALES[l]}" />' for l in LANGS if l != lang)
    nav = ''.join(f'<a href="#{i}">{E(n)}</a>' for i, n in t['nav'])
    langs = ''.join(f'<a href="{FILES[l]}" hreflang="{l}" lang="{l}"' + (' aria-current="page"' if l == lang else '') + f'>{NAMES[l]}</a>' for l in LANGS)
    why = ''.join(f'<p>{E(p)}</p>' for p in t['why'])
    cases = ''.join(f'<div class="case"><div><span class="s">{E(s)}</span><span class="m">{E(m)}</span></div><div class="v">{E(v)}</div></div>' for s, m, v in t['cases'])
    how = ''.join(f'<li><b>{E(h)}</b><span>{E(b)}</span></li>' for h, b in t['how'])
    stats = ''.join(f'<div class="stat"><b>{E(v)}</b><span>{E(l)}</span></div>' for v, l in t['stats'])
    refs = ''.join(f'<div><dt>{E(n)}</dt><dd>{E(d)}</dd></div>' for n, d in t['refs'])
    where = ''.join(f'<div><b>{E(h)}</b><span>{E(b)}</span></div>' for h, b in t['where'])
    pros = ''.join(f'<li>{E(x)}</li>' for x in t['pros'])
    cons = ''.join(f'<li>{E(x)}</li>' for x in t['cons'])
    steps = ''.join(f'<li><p>{E(h)}</p>{cmd(c, t)}</li>' for h, c in zip(t['inst'], INSTALL + [t['try']]))
    use = ''.join(f'<li>{E(x)}</li>' for x in t['use'])
    faq = ''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in t['faq'])
    links = ''.join(f'<li><a href="{u}" rel="me noopener">{E(n)}</a></li>' for n, u in LINKS) + f'<li><a href="{DONATE}" rel="noopener">{E(t["support"])}</a></li>'
    foot = ''.join(f'<a href="{u}">{E(n)}</a>' for n, u in t['foot'])
    h1a = E(t['h1a']).replace('/givememod', '<code>/givememod</code>')
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{E(t['title'])}</title>
<meta name="description" content="{E(t['desc'])}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="author" content="Nerual Dreming" />
<meta name="theme-color" content="#111214" />
<meta name="color-scheme" content="dark" />
<link rel="canonical" href="{url}" />
{alts}
<link rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48" />
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
<link rel="manifest" href="site.webmanifest" />
<link rel="preload" href="site/fonts/cascadia-mono.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" as="image" href="teaser-{lang}.jpg" fetchpriority="high" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="givememod" />
<meta property="og:title" content="{E(t['title'])}" />
<meta property="og:description" content="{E(t['desc'])}" />
<meta property="og:url" content="{url}" />
<meta property="og:locale" content="{LOCALES[lang]}" />
{og_alts}
<meta property="og:image" content="{SITE}og-{lang}.jpg" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="{E(t['og_alt'])}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{E(t['title'])}" />
<meta name="twitter:description" content="{E(t['desc'])}" />
<meta name="twitter:image" content="{SITE}og-{lang}.jpg" />
<meta name="twitter:image:alt" content="{E(t['og_alt'])}" />
<script type="application/ld+json">{json_ld(lang, t)}</script>
<style>{CSS}</style>
</head>
<body>
<header>
  <div class="wrap bar">
    <a class="brand" href="{FILES[lang]}"><img src="icon-64.png" alt="" width="28" height="28" />givememod</a>
    <nav aria-label="{E(t['nav'][0][1])}">{nav}</nav>
    <div class="langs">{langs}</div>
    <a class="gh" href="{REPO}"><span>GitHub</span><img src="{STARS}" alt="GitHub stars" height="20" /></a>
  </div>
</header>
<main class="wrap">
  <div class="hero">
    <h1>{h1a}<span class="after">{E(t['h1b'])}</span></h1>
    <p class="lead">{E(t['lead'])}</p>
    <div class="cta"><a class="btn primary" href="#install">{E(t['cta'])}</a><a class="btn" href="{REPO}">{E(t['star'])}<img src="{STARS}" alt="" height="20" /></a></div>
    <figure class="reel"><video src="teaser-{lang}.mp4" poster="teaser-{lang}.jpg" muted loop playsinline controls preload="metadata" width="1280" height="720" aria-label="{E(t['video_alt'])}"></video></figure>
  </div>

  <section id="why"><h2>{E(t['why_h'])}</h2><div class="why">{why}</div></section>

  <section id="cases"><h2>{E(t['cases_h'])}</h2><p class="sub">{E(t['cases_sub'])}</p><div class="cases">{cases}</div></section>

  <section id="how"><h2>{E(t['how_h'])}</h2><ol class="steps6">{how}</ol></section>

  <section id="inside"><h2>{E(t['in_h'])}</h2><p class="sub">{E(t['in_sub'])}</p><div class="stats">{stats}</div><dl class="refs">{refs}</dl></section>

  <section id="where"><h2>{E(t['where_h'])}</h2><div class="where">{where}</div></section>

  <section id="tradeoffs"><h2>{E(t['pc_h'])}</h2><div class="pc"><div class="pros"><h3>{E(t['pros_h'])}</h3><ul>{pros}</ul></div><div class="cons"><h3>{E(t['cons_h'])}</h3><ul>{cons}</ul></div></div></section>

  <section id="install"><h2>{E(t['inst_h'])}</h2><div class="inst"><ol class="steps">{steps}</ol><div class="say"><h3>{E(t['use_h'])}</h3><ul>{use}</ul></div></div></section>

  <section id="faq"><h2>{E(t['faq_h'])}</h2>{faq}</section>

  <section id="author"><div class="author"><div><h2>{E(t['author_h'])}</h2><p>{E(t['author'])}</p></div><ul>{links}</ul></div></section>
</main>
<footer><div class="wrap">{foot}<span>{E(t['updated'])} {UPDATED}</span></div></footer>
<script>{SCRIPT}</script>
</body>
</html>
'''


def write(name, text):
    with open(os.path.join(DOCS, name), 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def main():
    for lang in LANGS:
        write(FILES[lang], page(lang))
    links = ''.join(f'<xhtml:link rel="alternate" hreflang="{l}" href="{url_of(l)}" />' for l in LANGS) + f'<xhtml:link rel="alternate" hreflang="x-default" href="{SITE}" />'
    urls = ''.join(f'  <url><loc>{url_of(l)}</loc><lastmod>{UPDATED}</lastmod>\n    {links}</url>\n' for l in LANGS)
    write('sitemap.xml', f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n{urls}</urlset>\n')
    write('robots.txt', f'User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n')
    write('site.webmanifest', json.dumps({'name': 'givememod', 'short_name': 'givememod', 'start_url': './', 'display': 'browser',
                                          'background_color': '#111214', 'theme_color': '#111214',
                                          'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png'}]}, indent=2) + '\n')
    en = T['en']
    cases = '\n'.join(f'- {s} → `{m}`: {v}' for s, m, v in en['cases'])
    write('llms.txt', f'''# givememod

> {en['desc']}

givememod is a Claude Code skill packaged as a plugin. On `/givememod` (or "make me a mod") it reads the conversation, proposes the smallest mod that fits, copies one of 11 tested templates into the session's dev-mods folder, adapts it with 29 building blocks, checks it with `claude plugin validate` and `claude plugin test`, and lets Claude Code hot-reload it. Kept mods go to `~/.claude/skills/<name>/`, where Claude Code loads them as `<name>@skills-dir` with no install.

- Install: `claude plugin marketplace add timoncool/givememod`, then `claude plugin install givememod@givememod` in any terminal (inside a terminal session `/plugin install givememod@givememod` works too).
- Needs Claude Code 2.1.287+ in the terminal, 2.1.286+ in the desktop Code tab.
- Inside: the decomposition of 3,057 public mods, techniques and reusable assets from 222 mod repositories read file by file, gotchas with the official limits, a test-kit guide, a review checklist.

## Situations and mods

{cases}

## Links

- [Repository]({REPO})
- [Page in English]({SITE})
- [Page in Russian]({SITE}ru.html)
- [Page in Chinese]({SITE}zh.html)
- [Changelog]({REPO}/blob/main/CHANGELOG.md)
''')
    print('[OK] docs: index.html, ru.html, zh.html, sitemap.xml, robots.txt, site.webmanifest, llms.txt')


if __name__ == '__main__':
    main()
