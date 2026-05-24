import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { randomUUID } from "crypto";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import {
  loadIndex,
  saveIndex,
  saveBookmarkFile,
  readBookmarkFile,
  removeBookmarkFile,
} from "../src/store";

const testDataDir = join(process.cwd(), "test-foldex-data");

function setDataDir(): void {
  process.env["FOLDEX_DATA_DIR"] = testDataDir;
}

describe("store", () => {
  beforeEach(async () => {
    setDataDir();
    await mkdir(testDataDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDataDir, { recursive: true, force: true });
  });

  it("loads empty index initially", async () => {
    const index = await loadIndex();
    expect(index.version).toBe(2);
    expect(Object.keys(index.bookmarks)).toHaveLength(0);
  });

  it("saves and loads index with bookmarks", async () => {
    const index = await loadIndex();
    const id = randomUUID();
    index.bookmarks[id] = {
      id,
      url: "https://example.com",
      title: "Test",
      tags: [],
      auto_tags: [],
      meta: { source: "none" },
      sections: [],
      structure: { tables: 0, code_blocks: 0, lists: 0, images: 0 },
      references: [],
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      content_hash: "abc123",
      file: "bookmarks/test.md",
    };
    await saveIndex(index);

    const loaded = await loadIndex();
    expect(loaded.bookmarks[id]?.title).toBe("Test");
  });

  it("saves and reads bookmark markdown files", async () => {
    const id = randomUUID();
    const markdown = "---\nurl: https://example.com\ntitle: Test\n---\n\n# Content";
    await saveBookmarkFile(id, markdown);

    const content = await readBookmarkFile(id);
    expect(content).toBe(markdown);
  });

  it("removes bookmark file", async () => {
    const id = randomUUID();
    await saveBookmarkFile(id, "# Test");
    await removeBookmarkFile(id);

    await expect(readBookmarkFile(id)).rejects.toThrow();
  });
});
