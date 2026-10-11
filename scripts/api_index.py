"""Builds references/api-index.md: every event, every $ method and every field of next, one line each, from a Claude Code types file.

Run from the repository root: python scripts/api_index.py <path to claude-code.d.ts or claude-code/index.d.ts>
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'plugins', 'givememod', 'skills', 'givememod', 'references', 'api-index.md')


def first_sentence(doc):
    text = ' '.join(l.strip().lstrip('*').strip() for l in doc if not l.strip().startswith('@'))
    text = re.split(r'\s@\w+', text)[0].strip()
    m = re.match(r'(.+?\.)(\s|$)', text)
    s = (m.group(1) if m else text).strip()
    return s.replace('|', '\\|')[:220]


def docs_before(lines, i, indent):
    if i == 0 or not lines[i - 1].strip().endswith('*/'):
        return []
    j = i - 1
    while j > 0 and not lines[j].strip().startswith('/**'):
        j -= 1
    body = []
    for l in lines[j:i]:
        s = l.strip()
        if s.startswith('/**'):
            s = s[3:]
        if s.endswith('*/'):
            s = s[:-2]
        if s.strip().startswith('@'):
            break
        body.append(s)
    return body


def main(path):
    lines = open(path, encoding='utf-8').read().split('\n')
    version = re.search(r'Claude Code (\d+(?:\.\d+)+)', lines[0])
    version = version.group(1) if version else '?'

    events, seen = [], set()
    for i, l in enumerate(lines):
        m = re.match(r"^      '([a-z]+\.[A-Za-z.]+)': (.+)$", l)
        if m and m.group(1) not in seen and not m.group(2).endswith('Chunk;'):
            seen.add(m.group(1))
            events.append((m.group(1), first_sentence(docs_before(lines, i, 6))))
    events.sort()

    start = next(i for i, l in enumerate(lines) if l.startswith('  export interface CoreEngineInterface') or l.startswith('  interface CoreEngineInterface'))
    nouns, noun = [], None
    for i in range(start, len(lines)):
        l = lines[i]
        if l.startswith('  }') or l.startswith('  };'):
            break
        m = re.match(r'^      ([a-z]+): \{$', l)
        if m:
            noun = m.group(1)
            continue
        m = re.match(r'^          (?:readonly )?([a-zA-Z]+)\??: ', l)
        if noun and m:
            nouns.append((f'$.{noun}.{m.group(1)}', first_sentence(docs_before(lines, i, 10))))

    classic = sorted(set(re.findall(r"hook_event_name: '([A-Za-z]+)'", '\n'.join(lines))))

    nxt = []
    s = next(i for i, l in enumerate(lines) if l.startswith('  export type Next<'))
    for i in range(s, len(lines)):
        if lines[i].startswith('  };'):
            break
        m = re.match(r'^      readonly ([a-zA-Z]+): ', lines[i])
        if m:
            nxt.append((f'next.{m.group(1)}', first_sentence(docs_before(lines, i, 6))))
    c = next(i for i, l in enumerate(lines) if l.startswith('  export type Caught = {'))
    for i in range(c, len(lines)):
        if lines[i].startswith('  };'):
            break
        m = re.match(r'^      readonly ([a-zA-Z]+): ', lines[i])
        if m:
            nxt.append((f'next.{m.group(1)} (in .catch)', first_sentence(docs_before(lines, i, 6))))

    out = [
        '# API index',
        '',
        f'Every event a hook can take, every `$` method and every field of `next`, one line each, from the types of Claude Code {version}. '
        'The types file of the running build stays the authority: grep it for the name to read the full declaration and its examples. '
        'Rebuild this file after an update with `python scripts/api_index.py <types file>` in the repository.',
        '',
        f'## Events ({len(events)})',
        '',
        '| Event | What it is |',
        '|---|---|',
    ]
    out += [f'| `{n}` | {d} |' for n, d in events]
    out += ['', f'Classic hook events ({len(classic)}), each `classic.<Name>` with the settings hook\'s input and result: ' + ', '.join(f'`{c}`' for c in classic) + '.']
    out += ['', f'## `$` methods ({len(nouns)})', '', '| Call | What it does |', '|---|---|']
    out += [f'| `{n}` | {d} |' for n, d in nouns]
    out += ['', f'## `next` ({len(nxt)})', '', '| Field | What it is |', '|---|---|']
    out += [f'| `{n}` | {d} |' for n, d in nxt]
    open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(out) + '\n')
    print(f'[OK] {OUT}: {len(events)} events, {len(nouns)} methods, {len(nxt)} next fields, Claude Code {version}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('usage: python scripts/api_index.py <types file>')
    main(sys.argv[1])
