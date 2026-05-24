import { randomUUID } from "crypto";
import type { Bookmark, AddBookmarkResult } from "../types";
import { fetchPage, extractContent } from "../extractor";
import { convertToMarkdown } from "../md-converter";
import { extractMetadata } from "../parser/metadata";
import { extractAutoTags } from "../parser/auto-tagger";
import { extractStructure } from "../parser/structure";
import { extractSections } from "../parser/sectionizer";
import { extractReferences } from "../parser/link-extractor";
import {
  loadIndex,
  saveIndex,
  saveBookmarkFile,
  hashContent,
  getFileSize,
  makeRelPath,
} from "../store";

export async function addBookmark(
  url: string,
  tags: string[] = [],
): Promise<AddBookmarkResult> {
  const index = await loadIndex();

  const existing = Object.values(index.bookmarks).find(
    (b) => b.url === url,
  );

  const fetchResult = await fetchPage(url);
  const extracted = extractContent(fetchResult.html, fetchResult.url);

  const contentHash = hashContent(extracted.textContent);

  if (existing && existing.content_hash === contentHash) {
    return {
      id: existing.id,
      title: existing.title,
      url: existing.url,
      tags: existing.tags,
      auto_tags: existing.auto_tags,
      meta: existing.meta,
      sections: existing.sections,
      structure: existing.structure,
      references: existing.references,
      file_size_bytes: 0,
    };
  }

  const meta = extractMetadata(extracted.dom);
  const autoTags = extractAutoTags(
    extracted.title,
    meta.description || "",
    extracted.textContent,
  );
  const structure = extractStructure(extracted.dom);
  const sections = extractSections(extracted.dom);
  const references = extractReferences(extracted.dom, url);

  const id = existing?.id || randomUUID();
  const now = new Date().toISOString();

  const markdown = convertToMarkdown(
    extracted.contentHtml,
    extracted.title,
    url,
    tags,
    autoTags,
    meta,
    sections,
    structure,
    references,
    extracted.dom,
  );

  const relPath = makeRelPath(id);
  await saveBookmarkFile(id, markdown);
  const size = await getFileSize(id);

  const bookmark: Bookmark = {
    id,
    url,
    title: extracted.title,
    tags,
    auto_tags: autoTags,
    meta,
    sections,
    structure,
    references,
    added_at: existing?.added_at || now,
    updated_at: now,
    content_hash: contentHash,
    file: relPath,
  };

  index.bookmarks[id] = bookmark;
  await saveIndex(index);

  return {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    tags: bookmark.tags,
    auto_tags: bookmark.auto_tags,
    meta: bookmark.meta,
    sections: bookmark.sections,
    structure: bookmark.structure,
    references: bookmark.references,
    file_size_bytes: size,
  };
}
