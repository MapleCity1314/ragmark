<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Foldex-书签即知识-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTQgMTkuNUEyLjUgMi41IDAgMCAxIDYuNSAxN0gyMCIvPjxwYXRoIGQ9Ik02LjUgMkgyMHYyMEg2LjVBMi41IDIuNSAwIDAgMSA0IDE5LjVWNC41QTIuNSAyLjUgMCAwIDEgNi41IDJaIi8+PC9zdmc+">
    <img alt="Foldex" src="https://img.shields.io/badge/Foldex-书签即知识-6366f1?style=for-the-badge">
  </picture>
</p>

<p align="center">
  <strong>Bookmarks as Knowledge.</strong> A local-first MCP server that turns every URL you save into a searchable, structured Markdown knowledge base — no cloud, no vector DB, no API keys.
</p>

<p align="center">
  <a href="#installation"><img src="https://img.shields.io/badge/Node-%3E%3D18-339933?logo=nodedotjs" alt="Node.js"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-ready-6366f1?logo=protocolsdotio" alt="MCP"></a>
  <a href="#"><img src="https://img.shields.io/badge/build-passing-22c55e" alt="Build"></a>
  <a href="#"><img src="https://img.shields.io/badge/tests-23%2F23-22c55e" alt="Tests"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-6366f1" alt="License"></a>
</p>

---

## What is Foldex?

<table>
<tr>
<td width="50%">

### Save

Drop a URL. Foldex fetches the page, extracts the meaningful content with **Readability** (the same engine behind Firefox Reader View), and runs a **five-layer parsing pipeline** to pull out everything useful.

```yaml
---
url: "https://react.dev/reference/react/use"
title: "use – React"
author: "React Team"
published: "2024-12-05"
tags: [react]
auto_tags: [hook, reference, state]
structure:
  code_blocks: 4
  tables: 0
sections:
  - heading: "Reference"
    level: 2
  - heading: "Usage"
    level: 2
references:
  - "https://github.com/facebook/react"
added: 2026-05-24
---
```

</td>
<td width="50%">

### Search

Ask in natural language. Foldex grep-searches all your stored Markdown files and returns ranked results with source context.

```
> "What did I save about React hooks?"

1. use – React (react.dev)
   ...synchronize external stores with useSyncExternalStore, the
   hook reads and subscribes to a store...
   § Usage · 4 matches

2. React Server Components (myblog.dev)
   ...unlike client components, Server Components don't use hooks
   like useState or useEffect...
   § Limitations · 2 matches
```

</td>
</tr>
</table>

---

## Five-Layer Content Parsing

Every saved page goes through five analysis layers — no AI required, all local:

```
  raw HTML
     │
     ├─ 1. Metadata ───── meta tags, JSON-LD, Open Graph → author, date, description
     ├─ 2. Auto-tagging ─ TF-IDF keyword extraction + stop-word filter → [tag, ...]
     ├─ 3. Structure ──── counts of tables, code blocks, lists, images
     ├─ 4. Sections ───── H1-H6 heading hierarchy → [{level, heading}]
     └─ 5. References ─── cross-domain external links → [url, ...]
     │
  Markdown + YAML frontmatter
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (this project uses pnpm 9+ with Turborepo)

### 1. Build from source

```bash
cd ragmark
pnpm install
pnpm build --filter=@ragmark/foldex
```

### 2. Add to your MCP client

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "foldex": {
      "command": "node",
      "args": ["<path-to-ragmark>/apps/foldex/dist/index.js"],
      "env": {
        "FOLDEX_DATA_DIR": "/home/you/.foldex/data"
      }
    }
  }
}
```

### 3. Verify

Restart your client and say: **"List my bookmarks"**. An empty list means it's working.

### 4. Optional — sync your browser bookmarks

> "Sync my bookmarks"

Foldex auto-detects **Chrome**, **Edge**, and **Brave** bookmark databases and imports them all. Firefox users export to HTML first, then run:

> "Import bookmarks from ~/Downloads/bookmarks.html"

---

## Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `FOLDEX_DATA_DIR` | `~/.foldex/data` | Storage directory for index and `.md` files |
| `FOLDEX_SEARCH_TOOL` | `builtin` | `builtin` (Node.js) or `ripgrep` for faster search |

That's it. No API keys. No embedding models. No cloud.

---

## MCP Tools

| Tool | What it does |
|---|---|
| `add_bookmark` | Fetch a URL, run five-layer parsing, save as `.md` |
| `search_knowledge` | Full-text grep across all saved pages with filters |
| `list_bookmarks` | Browse your knowledge base, filter by tag |
| `remove_bookmark` | Delete a bookmark and its Markdown file |
| `import_bookmarks` | Bulk import from a Chrome/Firefox HTML export |
| `sync_bookmarks` | Auto-detect local browser bookmarks, incremental sync |

---

## Storage Layout

```
~/.foldex/data/
├── index.json              # Lightweight metadata index
└── bookmarks/
    ├── a1b2c3d4.md         # One Markdown file per bookmark
    ├── e5f6g7h8.md         # YAML frontmatter + clean content
    └── ...
```

Each `.md` file is human-readable and grep-friendly. Open them in any editor. Search them with any tool.

---

## Architecture

```
MCP Client (Claude Desktop / CodeBuddy / ...)
  │  stdio
  ▼
├─ server.ts ──────────────────────────────────────────────────────────
│  registers 6 tools, dispatches to handlers                          │
│                                                                     │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │add-bookmark │  │  search  │  │   list   │  │ sync-bookmarks │  │
│  └──────┬──────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
│         │              │             │               │            │
│  ┌──────▼──────┐       │             │        ┌──────▼───────────┐ │
│  │ extractor   │       │             │        │ browser-detector │ │
│  │ +5 parsers  │       │             │        │ Chrome/Edge/Brave│ │
│  │ +md-convert │       │             │        └──────────────────┘ │
│  └──────┬──────┘       │             │                             │
│         │              │             │                             │
│  ┌──────▼──────────────▼─────────────▼───────────────────────────┐ │
│  │                        store.ts                               │ │
│  │          index.json  ←→  bookmarks/*.md  (filesystem)         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  parser/                                                           │
│  metadata.ts  auto-tagger.ts  structure.ts  sectionizer.ts         │
│  link-extractor.ts                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Development

```bash
# From monorepo root
pnpm install                        # Install all dependencies
pnpm build --filter=@ragmark/foldex # Compile TypeScript
pnpm lint --filter=@ragmark/foldex  # ESLint
pnpm check-types --filter=@ragmark/foldex  # TypeScript type-check
pnpm test --filter=@ragmark/foldex  # Vitest (23 tests)
pnpm dev --filter=@ragmark/foldex   # Watch mode via tsx
```

### Project Structure

```
apps/foldex/
├── src/
│   ├── index.ts              # Entry point (stdio MCP server)
│   ├── server.ts             # MCP server setup + tool registration
│   ├── config.ts             # Environment variable parsing
│   ├── types.ts              # Shared TypeScript types
│   ├── extractor.ts          # fetch + Readability content extraction
│   ├── md-converter.ts       # HTML → Markdown + YAML frontmatter
│   ├── store.ts              # File system CRUD (index.json + .md files)
│   ├── browser-detector.ts   # Chrome/Edge/Brave bookmark detection
│   ├── parser/
│   │   ├── metadata.ts       # Meta tags, JSON-LD, Open Graph parsing
│   │   ├── auto-tagger.ts    # TF-IDF keyword extraction
│   │   ├── structure.ts      # Table/code/list/image counting
│   │   ├── sectionizer.ts    # H1-H6 heading hierarchy
│   │   └── link-extractor.ts # Cross-domain link collection
│   └── tools/
│       ├── add-bookmark.ts   # Full pipeline: fetch → parse → save
│       ├── search.ts         # Grep search with filters
│       ├── list.ts           # Bookmark listing
│       ├── remove.ts         # Bookmark deletion
│       ├── import.ts         # Netscape bookmark HTML import
│       └── sync-bookmarks.ts # Browser bookmark sync
├── tests/                    # 7 test suites, 23 test cases
├── SKILL.md                  # Agent skill definition
└── package.json
```

### Key Dependencies

| Package | Role |
|---|---|
| [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/sdk) | MCP protocol implementation |
| [`@mozilla/readability`](https://github.com/mozilla/readability) | Content extraction |
| [`jsdom`](https://github.com/jsdom/jsdom) | DOM parsing |
| [`turndown`](https://github.com/mixmark-io/turndown) | HTML → Markdown conversion |

---

## Why Markdown + Grep?

- **Human-readable.** Every bookmark is a standalone `.md` file you can open, edit, or share.
- **Zero lock-in.** Your knowledge base is just a folder of files.
- **No vector DB.** No LanceDB, no ChromaDB, no Pinecone. Grep is fast enough.
- **No API keys.** No OpenAI, no Anthropic. Everything runs on your machine.
- **Composable.** Pipe the `.md` files into any tool — `rg`, `fzf`, `grep`, or even feed them to an LLM with a context window.

---

<p align="center">
  <sub>Built with ❤️ as part of the <a href="https://github.com/ragmark">ragmark</a> monorepo</sub>
</p>
