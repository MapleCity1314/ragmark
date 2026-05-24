import type { Bookmark } from "../types";
import { loadIndex } from "../store";

export interface ListParams {
  tags?: string[];
}

export interface ListResult {
  bookmarks: Array<{
    id: string;
    url: string;
    title: string;
    tags: string[];
    auto_tags: string[];
    author?: string;
    published_at?: string;
    added_at: string;
    file: string;
    sections_count: number;
    references_count: number;
  }>;
  total: number;
}

export async function listBookmarks(params: ListParams = {}): Promise<ListResult> {
  const index = await loadIndex();
  let bookmarks = Object.values(index.bookmarks);

  if (params.tags && params.tags.length > 0) {
    const filterTags = params.tags.map((t) => t.toLowerCase());
    bookmarks = bookmarks.filter((bm) => {
      const allTags = [...bm.tags, ...bm.auto_tags].map((t) =>
        t.toLowerCase(),
      );
      return filterTags.some((ft) => allTags.includes(ft));
    });
  }

  bookmarks.sort(
    (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime(),
  );

  return {
    bookmarks: bookmarks.map(summarize),
    total: bookmarks.length,
  };
}

function summarize(bm: Bookmark): ListResult["bookmarks"][number] {
  return {
    id: bm.id,
    url: bm.url,
    title: bm.title,
    tags: bm.tags,
    auto_tags: bm.auto_tags,
    author: bm.meta.author,
    published_at: bm.meta.published_at,
    added_at: bm.added_at,
    file: bm.file,
    sections_count: bm.sections.length,
    references_count: bm.references.length,
  };
}
