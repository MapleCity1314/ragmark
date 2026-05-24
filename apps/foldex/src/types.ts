export interface BookmarkMeta {
  author?: string;
  published_at?: string;
  description?: string;
  source: "meta-tag" | "json-ld" | "open-graph" | "heuristic" | "none";
}

export interface BookmarkSection {
  id: string;
  heading: string;
  level: number;
  position: number;
}

export interface BookmarkStructure {
  tables: number;
  code_blocks: number;
  lists: number;
  images: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  auto_tags: string[];
  meta: BookmarkMeta;
  sections: BookmarkSection[];
  structure: BookmarkStructure;
  references: string[];
  added_at: string;
  updated_at: string;
  content_hash: string;
  file: string;
}

export interface BookmarkIndex {
  version: number;
  bookmarks: Record<string, Bookmark>;
}

export interface SearchResult {
  file: string;
  title: string;
  url: string;
  author?: string;
  date?: string;
  snippet: string;
  match_section?: string;
  match_count: number;
  score: number;
}

export interface SearchParams {
  query: string;
  max_results?: number;
  author?: string;
  tag?: string;
  section?: string;
  date_from?: string;
  date_to?: string;
}

export interface SyncResult {
  detected: Array<{ browser: string; count: number }>;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface BrowserBookmark {
  url: string;
  title: string;
  folder?: string;
}

export interface BrowserDetectResult {
  browser: string;
  path: string;
  bookmarks: BrowserBookmark[];
}

export interface AddBookmarkResult {
  id: string;
  title: string;
  url: string;
  tags: string[];
  auto_tags: string[];
  meta: BookmarkMeta;
  sections: BookmarkSection[];
  structure: BookmarkStructure;
  references: string[];
  file_size_bytes: number;
}
