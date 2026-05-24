import type { SyncResult } from "../types";
import { detectBrowsers } from "../browser-detector";
import { addBookmark } from "./add-bookmark";
import { loadIndex } from "../store";

export async function syncBookmarks(
  browsers?: string[],
): Promise<SyncResult> {
  const detectedAll = await detectBrowsers();

  const filtered = browsers
    ? detectedAll.filter((d) => browsers.includes(d.browser))
    : detectedAll;

  const index = await loadIndex();
  const existingUrls = new Set(
    Object.values(index.bookmarks).map((b) => b.url),
  );

  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  const detected = filtered.map((d) => ({
    browser: d.browser,
    count: d.bookmarks.length,
  }));

  for (const d of filtered) {
    for (const bookmark of d.bookmarks) {
      if (existingUrls.has(bookmark.url)) {
        skipped++;
        continue;
      }

      try {
        const tags = bookmark.folder
          ? [bookmark.folder.toLowerCase().replace(/\s+/g, "-")]
          : [];
        await addBookmark(bookmark.url, tags);
        imported++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${bookmark.url}: ${message}`);
      }
    }
  }

  return { detected, imported, skipped, errors };
}
