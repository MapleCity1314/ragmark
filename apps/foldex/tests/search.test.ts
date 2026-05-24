import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { loadIndex, saveIndex } from "../src/store";
import { searchKnowledge } from "../src/tools/search";

const testDataDir = join(process.cwd(), "test-foldex-data-search");

describe("searchKnowledge", () => {
  beforeAll(async () => {
    process.env["FOLDEX_DATA_DIR"] = testDataDir;
    await mkdir(join(testDataDir, "bookmarks"), { recursive: true });

    const index = await loadIndex();
    const id = randomUUID();

    const markdown = `---
url: "https://example.com/react-server-components"
title: "Understanding React Server Components"
tags:
  - "react"
  - "frontend"
auto_tags:
  - "react"
  - "server components"
author: "Dan Abramov"
published: "2026-03-15"
structure:
  tables: 0
  code_blocks: 3
  lists: 1
  images: 0
sections:
  - heading: "Introduction"
    level: 2
  - heading: "Benefits"
    level: 2
added: 2026-05-24
---

# Understanding React Server Components

React Server Components run on the server and send HTML to the client.
They improve performance by reducing JavaScript bundle size.
`;

    const file = `bookmarks/${id}.md`;
    await writeFile(join(testDataDir, file), markdown, "utf-8");

    index.bookmarks[id] = {
      id,
      url: "https://example.com/react-server-components",
      title: "Understanding React Server Components",
      tags: ["react", "frontend"],
      auto_tags: ["react", "server components"],
      meta: { author: "Dan Abramov", published_at: "2026-03-15", source: "meta-tag" },
      sections: [
        { id: "s0", heading: "Introduction", level: 2, position: 0 },
        { id: "s1", heading: "Benefits", level: 2, position: 1 },
      ],
      structure: { tables: 0, code_blocks: 3, lists: 1, images: 0 },
      references: [],
      added_at: "2026-05-24T00:00:00Z",
      updated_at: "2026-05-24T00:00:00Z",
      content_hash: "abc",
      file,
    };

    await saveIndex(index);
  });

  afterAll(async () => {
    await rm(testDataDir, { recursive: true, force: true });
  });

  it("finds matching content", async () => {
    const result = await searchKnowledge({ query: "React Server Components", max_results: 5 });
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]?.title).toBe("Understanding React Server Components");
    expect(result.results[0]?.url).toBe("https://example.com/react-server-components");
  });

  it("filters by author", async () => {
    const result = await searchKnowledge({
      query: "React",
      author: "Dan Abramov",
    });
    expect(result.results.length).toBeGreaterThan(0);
  });

  it("returns empty for non-matching query", async () => {
    const result = await searchKnowledge({ query: "nonexistent topic xyz123" });
    expect(result.results).toHaveLength(0);
  });
});
