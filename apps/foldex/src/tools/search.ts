import { readFile } from "fs/promises";
import { join } from "path";
import type { SearchResult, SearchParams, Bookmark } from "../types";
import { getConfig } from "../config";
import { loadIndex } from "../store";

export async function searchKnowledge(
  params: SearchParams,
): Promise<{ query: string; results: SearchResult[]; total: number }> {
  const { query, max_results = 5, author, tag, section, date_from, date_to } = params;
  const index = await loadIndex();
  const bookmarks = Object.values(index.bookmarks);

  const filtered = filterBookmarks(bookmarks, { author, tag, section, date_from, date_to });

  const results: SearchResult[] = [];
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 0);

  for (const bm of filtered) {
    try {
      const fp = join(getConfig().dataDir, bm.file);
      const content = await readFile(fp, "utf-8");

      let matchCount = 0;
      const contentLower = content.toLowerCase();
      for (const term of terms) {
        let idx = 0;
        while ((idx = contentLower.indexOf(term, idx)) !== -1) {
          matchCount++;
          idx += term.length;
        }
      }

      if (matchCount > 0) {
        const snippet = extractSnippet(content, query);
        const matchSection = findMatchingSection(contentLower, terms, bm);

        results.push({
          file: bm.file,
          title: bm.title,
          url: bm.url,
          author: bm.meta.author,
          date: bm.meta.published_at,
          snippet,
          match_section: matchSection,
          match_count: matchCount,
          score: matchCount,
        });
      }
    } catch {
      continue;
    }
  }

  const maxCount = results.length > 0 ? Math.max(...results.map((r) => r.match_count)) : 1;
  for (const r of results) {
    r.score = r.match_count / maxCount;
  }

  results.sort((a, b) => b.score - a.score);
  const final = results.slice(0, max_results);

  return { query, results: final, total: results.length };
}

function filterBookmarks(
  bookmarks: Bookmark[],
  filters: {
    author?: string;
    tag?: string;
    section?: string;
    date_from?: string;
    date_to?: string;
  },
): Bookmark[] {
  return bookmarks.filter((bm) => {
    if (
      filters.author &&
      !bm.meta.author?.toLowerCase().includes(filters.author.toLowerCase())
    ) {
      return false;
    }
    if (filters.tag) {
      const allTags = [...bm.tags, ...bm.auto_tags].map((t) =>
        t.toLowerCase(),
      );
      if (!allTags.some((t) => t.includes(filters.tag!.toLowerCase()))) {
        return false;
      }
    }
    if (filters.section) {
      const hasSection = bm.sections.some((s) =>
        s.heading.toLowerCase().includes(filters.section!.toLowerCase()),
      );
      if (!hasSection) return false;
    }
    if (filters.date_from && bm.meta.published_at) {
      if (bm.meta.published_at < filters.date_from) return false;
    }
    if (filters.date_to && bm.meta.published_at) {
      if (bm.meta.published_at > filters.date_to) return false;
    }
    return true;
  });
}

function extractSnippet(content: string, query: string): string {
  const lower = content.toLowerCase();
  const firstTerm = query.toLowerCase().split(/\s+/)[0];
  if (!firstTerm) return content.slice(0, 200);

  const idx = lower.indexOf(firstTerm);
  if (idx === -1) return content.slice(0, 200);

  const start = Math.max(0, idx - 80);
  const end = Math.min(content.length, idx + 160);
  let snippet = content.slice(start, end).replace(/\n/g, " ").replace(/\s+/g, " ");
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  return snippet;
}

function findMatchingSection(
  contentLower: string,
  terms: string[],
  bm: Bookmark,
): string | undefined {
  if (bm.sections.length === 0) return undefined;

  const positions: Array<{ heading: string; pos: number }> = [];
  for (const sec of bm.sections) {
    const idx = contentLower.indexOf(
      sec.heading.toLowerCase().replace(/^#+\s*/, ""),
    );
    if (idx !== -1) {
      positions.push({ heading: sec.heading, pos: idx });
    }
  }

  if (positions.length === 0) return undefined;

  let firstTermPos = contentLower.length;
  for (const term of terms) {
    const idx = contentLower.indexOf(term);
    if (idx !== -1 && idx < firstTermPos) firstTermPos = idx;
  }

  let bestSection: string | undefined;
  let bestPos = -1;
  for (const sp of positions) {
    if (sp.pos <= firstTermPos && sp.pos > bestPos) {
      bestPos = sp.pos;
      bestSection = sp.heading;
    }
  }

  return bestSection;
}
