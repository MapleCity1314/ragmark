import { readFile, writeFile, mkdir, readdir, unlink, stat } from "fs/promises";
import { join, dirname } from "path";
import { createHash } from "crypto";
import type { BookmarkIndex } from "./types";
import { getConfig } from "./config";

function indexPath(): string {
  return join(getConfig().dataDir, "index.json");
}

function bookmarksDir(): string {
  return join(getConfig().dataDir, "bookmarks");
}

function filePath(id: string): string {
  return join(bookmarksDir(), `${id}.md`);
}

export async function loadIndex(): Promise<BookmarkIndex> {
  try {
    const data = await readFile(indexPath(), "utf-8");
    return JSON.parse(data) as BookmarkIndex;
  } catch {
    const empty: BookmarkIndex = { version: 2, bookmarks: {} };
    await saveIndex(empty);
    return empty;
  }
}

export async function saveIndex(index: BookmarkIndex): Promise<void> {
  await mkdir(dirname(indexPath()), { recursive: true });
  await writeFile(indexPath(), JSON.stringify(index, null, 2), "utf-8");
}

export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export async function saveBookmarkFile(
  id: string,
  markdown: string,
): Promise<string> {
  const fp = filePath(id);
  await mkdir(dirname(fp), { recursive: true });
  await writeFile(fp, markdown, "utf-8");
  return fp;
}

export async function readBookmarkFile(id: string): Promise<string> {
  return readFile(filePath(id), "utf-8");
}

export async function removeBookmarkFile(id: string): Promise<void> {
  try {
    await unlink(filePath(id));
  } catch {
    // file may not exist
  }
}

export async function listBookmarkFiles(): Promise<string[]> {
  try {
    const entries = await readdir(bookmarksDir());
    return entries.filter((e) => e.endsWith(".md"));
  } catch {
    return [];
  }
}

export async function getFileSize(id: string): Promise<number> {
  try {
    const s = await stat(filePath(id));
    return s.size;
  } catch {
    return 0;
  }
}

export function makeRelPath(id: string): string {
  return `bookmarks/${id}.md`;
}
