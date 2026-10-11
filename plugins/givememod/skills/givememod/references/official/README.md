# Official mods documentation

The pages are Anthropic's and are not redistributed in this repository. Fetch them here (about 270 KB) once, and again after a Claude Code update:

```bash
cd "<this folder>" && for p in overview create events interface api test troubleshoot admin reference gallery; do curl -sL "https://code.claude.com/docs/en/plugins/mods/$p.md" -o "$p.md"; done
```

PowerShell:

```powershell
foreach ($p in 'overview','create','events','interface','api','test','troubleshoot','admin','reference','gallery') { Invoke-WebRequest "https://code.claude.com/docs/en/plugins/mods/$p.md" -OutFile "$p.md" }
```

Online: <https://code.claude.com/docs/en/plugins/mods/overview>. The agent fetches them by itself when it needs a page and the file is missing.
