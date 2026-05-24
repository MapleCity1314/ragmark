import type { JSDOM } from "jsdom";
import type { BookmarkMeta } from "../types";

export function extractMetadata(dom: JSDOM): BookmarkMeta {
  const doc = dom.window.document;
  const meta: Omit<BookmarkMeta, "source"> = {};
  let source: BookmarkMeta["source"] = "none";

  const jsonLd = extractJsonLd(doc);
  if (jsonLd) {
    if (jsonLd.author) meta.author = jsonLd.author;
    if (jsonLd.published_at) meta.published_at = jsonLd.published_at;
    if (jsonLd.description) meta.description = jsonLd.description;
    source = "json-ld";
  }

  const og = extractOpenGraph(doc);
  if (og) {
    if (!meta.author && og.author) meta.author = og.author;
    if (!meta.published_at && og.published_at)
      meta.published_at = og.published_at;
    if (!meta.description && og.description)
      meta.description = og.description;
    if (source === "none") source = "open-graph";
  }

  const tag = extractMetaTags(doc);
  if (tag) {
    if (!meta.author && tag.author) meta.author = tag.author;
    if (!meta.published_at && tag.published_at)
      meta.published_at = tag.published_at;
    if (!meta.description && tag.description)
      meta.description = tag.description;
    if (source === "none") source = "meta-tag";
  }

  if (!meta.author) meta.author = extractAuthorHeuristic(doc);
  if (!meta.published_at) meta.published_at = extractDateHeuristic();

  return { ...meta, source };
}

function extractJsonLd(doc: Document): {
  author?: string;
  published_at?: string;
  description?: string;
} | null {
  const scripts = doc.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || "{}");
      if (!data || typeof data !== "object") continue;

      const root = data["@graph"] ? data["@graph"][0] : data;
      if (
        !root ||
        !["Article", "BlogPosting", "NewsArticle", "WebPage"].includes(
          root["@type"],
        )
      ) {
        continue;
      }

      const result: ReturnType<typeof extractJsonLd> = {};
      if (typeof root.author === "string") {
        result.author = root.author;
      } else if (root.author?.name) {
        result.author = root.author.name;
      }
      if (root.datePublished) result.published_at = root.datePublished;
      if (root.description) result.description = root.description;

      if (Object.keys(result).length > 0) return result;
    } catch {
      continue;
    }
  }
  return null;
}

function extractOpenGraph(doc: Document): {
  author?: string;
  published_at?: string;
  description?: string;
} | null {
  const result: ReturnType<typeof extractOpenGraph> = {};

  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const ogDesc = doc.querySelector('meta[property="og:description"]');
  const ogType = doc.querySelector('meta[property="og:type"]');
  const articleAuthor = doc.querySelector(
    'meta[property="article:author"]',
  );
  const articleDate = doc.querySelector(
    'meta[property="article:published_time"]',
  );

  if (articleAuthor) result.author = articleAuthor.getAttribute("content") ?? undefined;
  if (articleDate) result.published_at = articleDate.getAttribute("content") ?? undefined;
  if (ogDesc) result.description = ogDesc.getAttribute("content") ?? undefined;

  if (ogTitle) {
    const type = ogType?.getAttribute("content");
    if (type === "article") {
      result.published_at =
        result.published_at ||
        (ogTitle.getAttribute("content") ?? undefined);
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function extractMetaTags(doc: Document): {
  author?: string;
  published_at?: string;
  description?: string;
} | null {
  const result: ReturnType<typeof extractMetaTags> = {};

  const author = doc.querySelector('meta[name="author"]');
  const date = doc.querySelector('meta[name="date"]');
  const pubdate = doc.querySelector('meta[name="pubdate"]');
  const desc = doc.querySelector('meta[name="description"]');

  if (author) result.author = author.getAttribute("content") ?? undefined;
  if (desc) result.description = desc.getAttribute("content") ?? undefined;
  if (date) result.published_at = date.getAttribute("content") ?? undefined;
  if (pubdate)
    result.published_at =
      result.published_at || (pubdate.getAttribute("content") ?? undefined);

  return Object.keys(result).length > 0 ? result : null;
}

function extractAuthorHeuristic(doc: Document): string | undefined {
  const selectors = [
    '[rel="author"]',
    ".author",
    ".byline",
    '[itemprop="author"]',
    'a[href*="/author/"]',
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el?.textContent?.trim()) {
      return el.textContent.trim().slice(0, 100);
    }
  }
  return undefined;
}

function extractDateHeuristic(): string | undefined {
  return undefined;
}
