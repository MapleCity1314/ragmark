---
name: foldex
description: "Bookmark-to-knowledge MCP server — save URLs, fetch page content, extract as Markdown, and grep-search locally. Auto-detects Chrome/Edge/Brave bookmarks for bulk sync. Triggers on: 'save this bookmark', 'add to knowledge base', 'remember this page', 'search my bookmarks', 'what did I save about', 'sync bookmarks', 'import my bookmarks', 'install foldex', 'setup foldex', 'configure foldex', or any request to persist web page content and search saved pages later."
---

# Foldex — Bookmarks as Knowledge

**Local-first MCP server: bookmark a URL → extract content → save as Markdown → grep-search anytime.**

No cloud. No vector DB. No API keys. Just files and grep.

---

## 1. Installation

### Prerequisites

- Node.js >= 18
- The Foldex MCP server built: run `pnpm build --filter=@ragmark/foldex` from the ragmark monorepo root

### Add to MCP client config

For Claude Desktop, add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "foldex": {
      "command": "node",
      "args": ["<path-to-ragmark>/apps/foldex/dist/index.js"],
      "env": {
        "FOLDEX_DATA_DIR": "~/.foldex/data"
      }
    }
  }
}
```

For other MCP clients (CodeBuddy, Continue, etc.), adapt the config accordingly.

### Verify installation
After restarting your MCP client, ask: **"List my bookmarks"**. If it returns no bookmarks, it's working.

### Optional: Initial browser sync
After verifying Foldex is working, ask the user:

> "Foldex is ready. Want me to sync your existing browser bookmarks? I can auto-detect Chrome, Edge, and Brave."

- If **yes** → call `sync_bookmarks`. Report: detected browsers, import count, skip count.
- If **no** → "No problem. Bookmark pages one at a time, or run 'sync my bookmarks' anytime."
- If **Firefox-only** → explain the need to export HTML first, then use `import_bookmarks`.

---

## 2. Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `FOLDEX_DATA_DIR` | `~/.foldex/data` | Where bookmark `.md` files and index live |
| `FOLDEX_SEARCH_TOOL` | `builtin` | `builtin` (Node.js) or `ripgrep` (faster) |

No API keys. No embedding models. No cloud dependencies.

---

## 3. MCP Tools

### `add_bookmark`

Save a URL to the knowledge base. Fetches the page, extracts main content via Readability, performs five-layer parsing (metadata, auto-tags, structure, sections, references), converts to Markdown, and stores locally.

**Parameters:**
- `url` (string, required) — The URL to save
- `tags` (string[], optional) — Tags for organization

**Returns:** `{ id, title, url, tags, auto_tags, meta: { author, published_at, description }, sections, structure, references, file_size_bytes }`

**When to call:** User says "save this link", "add to my knowledge base", "remember this page", "bookmark this". If the user shares a URL without explicit intent to save, ask first.

**Behavior:**
- Fetches URL → extracts content via Readability → five-layer parsing
- Adds YAML frontmatter with all metadata to the `.md` file
- If URL already exists and content unchanged → returns cached result (no re-fetch)
- If URL exists but content changed → updates in-place
- If fetch fails → report error, offer alternatives

---

### `search_knowledge`

Full-text grep search across all saved bookmark `.md` files. Supports filtering.

**Parameters:**
- `query` (string, required) — Search term(s), case-insensitive
- `max_results` (number, optional) — Default: 5
- `author` (string, optional) — Filter by author name
- `tag` (string, optional) — Filter by tag (matches user tags + auto-tags)
- `section` (string, optional) — Filter by section heading
- `date_from` (string, optional) — Filter by published date from (YYYY-MM-DD)
- `date_to` (string, optional) — Filter by published date to (YYYY-MM-DD)

**Returns:** `{ query, results: [{ file, title, url, author, date, snippet, match_section, match_count, score }], total }`

**When to call:** User asks "what did I save about X", "search my knowledge base", "find pages about Y", "do I have anything on Z". ALWAYS search before answering from memory.

**Important:** If no results found, say so explicitly. Do NOT fabricate.

---

### `list_bookmarks`

List all saved bookmarks with metadata.

**Parameters:**
- `tags` (string[], optional) — Filter by tags (matches both user tags and auto-tags)

**Returns:** `{ bookmarks, total }`

**When to call:** User asks "show my bookmarks", "what have I saved", "list knowledge base".

---

### `remove_bookmark`

Remove a bookmark and its `.md` file.

**Parameters:**
- `url_or_id` (string, required) — URL or bookmark ID

**Returns:** `{ removed: boolean, title?: string }`

---

### `import_bookmarks`

Bulk import from Chrome/Firefox bookmarks HTML export file.

**Parameters:**
- `file_path` (string, required) — Path to bookmarks HTML file

**Returns:** `{ imported, skipped, errors }`

**When to call:** User mentions importing bookmarks, uploading bookmark export file, migrating from browser bookmarks.

---

### `sync_bookmarks`

Auto-detect and sync bookmarks from local browsers (Chrome, Edge, Brave). Incremental — only imports new URLs not already in the knowledge base.

**Parameters:**
- `browsers` (string[], optional) — Limit to specific browsers: `["chrome"]`, `["chrome", "edge"]`. Omit to detect all.

**Returns:** `{ detected: [{ browser, count }], imported, skipped, errors }`

**When to call:** User says "sync bookmarks", "sync my bookmarks", "import from Chrome", "pull in my browser bookmarks".

**Behavior:**
1. Scans filesystem for browser bookmark databases
2. Reports what was found (browser name, bookmark count)
3. For each new URL → fetch + extract + save
4. Skips existing URLs (no duplicate fetch)

---

## 4. Workflows

### Saving a page

1. Ask the user to confirm the URL to save
2. Call `add_bookmark(url, tags?)`
3. Report: title, file size, auto-tags, section count
4. If fetch fails (timeout, 404) → report error, offer: save URL-only (content later), or skip

### Searching knowledge

1. Use the user's exact question as the `query`
2. Call `search_knowledge(query, max_results=5)`
3. Present results: title, URL, snippet, match section
4. If no results → "I couldn't find anything about that in your saved bookmarks."
5. For follow-up questions, refine with filters (author, tag, section, date range)

### Syncing browser bookmarks

1. Call `sync_bookmarks()`
2. Report: "Found Chrome (N bookmarks), Edge (M bookmarks)"
3. Report: "Imported X new, Y already existed, Z errors"
4. If any errors, summarize them briefly

### Bulk import from HTML file

1. Confirm the file path with the user
2. Call `import_bookmarks(file_path)`
3. Report: imported count, skip count, error count
4. This may take a while for large exports — warn the user

---

## 5. Examples

**Save a page:**
> User: "Save https://react.dev/reference/react/use"
> → `add_bookmark(url="https://react.dev/reference/react/use")`
> Agent: "Saved! **use** — author: React Team, 3 sections, auto-tags: react, reference, hooks. 4.2 KB"

**Search:**
> User: "What did I save about React hooks?"
> → `search_knowledge(query="React hooks")`
> Agent: "Found 2 saved pages:
> 1. **use** — `...use is a React Hook that lets you read and subscribe to external stores...` (section: Reference)
> 2. **useState** — `...useState is a React Hook that lets you add state to functional components...`"

**Sync:**
> User: "Sync my browser bookmarks"
> → `sync_bookmarks()`
> Agent: "Found Chrome (142 bookmarks), Edge (19 bookmarks). Syncing... Done! Imported 15 new, 146 already existed, 0 errors."

**Import:**
> User: "Import my bookmarks from ~/Downloads/bookmarks_5_24_26.html"
> → `import_bookmarks(file_path="/home/user/Downloads/bookmarks_5_24_26.html")`
> Agent: "Processed 89 bookmarks. Imported 72 new, 8 skipped (duplicates), 9 errors."

---

## 6. Storage Layout

```
~/.foldex/data/
├── index.json          # Lightweight metadata index (all bookmarks)
└── bookmarks/
    ├── a1b2c3d4.md      # One .md per bookmark
    ├── e5f6g7h8.md      # YAML frontmatter + Markdown body
    └── ...
```

Each `.md` file has YAML frontmatter with url, title, tags, auto_tags, author, published, description, structure, sections, references — followed by the extracted content. You can open them in any editor or search with any grep tool.

---

## 7. Five-Layer Content Parsing

When Foldex saves a URL, it performs five analysis layers on the fetched HTML:

| Layer | What it extracts | Module |
|-------|-----------------|--------|
| **Metadata** | Author, publish date, description (from meta tags, OG, JSON-LD, heuristics) | `parser/metadata.ts` |
| **Auto-tagging** | Keyword extraction via TF-IDF frequency + stop-word filtering | `parser/auto-tagger.ts` |
| **Structure** | Counts of tables, code blocks, lists, images | `parser/structure.ts` |
| **Sections** | Article sections by H1-H6 heading hierarchy | `parser/sectionizer.ts` |
| **References** | External links (cross-domain only, deduplicated, max 20) | `parser/link-extractor.ts` |

All extracted data is stored in both the YAML frontmatter (human-readable) and `index.json` (machine-searchable).
