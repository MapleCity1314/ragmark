import { readFile } from "fs/promises";
import { addBookmark } from "./add-bookmark";
import { loadIndex } from "../store";

export async function importBookmarks(
  filePath: string,
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  try {
    const html = await readFile(filePath, "utf-8");
    const links = parseNetscapeBookmarks(html);

    const index = await loadIndex();
    const existingUrls = new Set(
      Object.values(index.bookmarks).map((b) => b.url),
    );

    for (const link of links) {
      if (existingUrls.has(link.url)) {
        skipped++;
        continue;
      }

      try {
        await addBookmark(link.url, link.tags);
        imported++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${link.url}: ${message}`);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to read file: ${message}`);
  }

  return { imported, skipped, errors };
}

interface ParsedBookmark {
  url: string;
  title: string;
  tags: string[];
}

function parseNetscapeBookmarks(html: string): ParsedBookmark[] {
  const bookmarks: ParsedBookmark[] = [];
  const anchorRegex = /<a[^>]*?href="(https?:\/\/[^"]+)"[^>]*?>/gi;
  const tagRegex = />([^<]*)<\/a>/i;

  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null) {
    const url = match[1];
    if (!url) continue;

    const tagMatch = tagRegex.exec(match[0]);
    const title = tagMatch?.[1]?.trim() || url;

    const folder = extractFolder(html, match.index);
    const tags = folder ? [folder.toLowerCase().replace(/\s+/g, "-")] : [];

    bookmarks.push({ url, title, tags });
  }

  return bookmarks;
}

function extractFolder(html: string, position: number): string | undefined {
  const before = html.slice(0, position);
  const reversed = before.split("").reverse().join("");

  const dtOpen = reversed.indexOf("><TD");
  if (dtOpen === -1) return undefined;

  const afterDt = reversed.slice(dtOpen + 4);
  const h3Match = afterDt.match(/^>([^<]+)<3H</m);
  if (!h3Match?.[1]) return undefined;

  return h3Match[1].split("").reverse().join("").trim();
}
