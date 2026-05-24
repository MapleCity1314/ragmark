import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export interface FetchResult {
  html: string;
  title: string;
  url: string;
}

export interface ExtractResult {
  dom: JSDOM;
  title: string;
  url: string;
  textContent: string;
  contentHtml: string;
}

export async function fetchPage(url: string): Promise<FetchResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Foldex/1.0; +https://github.com/ragmark/foldex)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new Error(`Not an HTML page: ${contentType}`);
  }

  const html = await response.text();
  return { html, title: url, url };
}

export function extractContent(
  html: string,
  url: string,
): ExtractResult {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  const title =
    doc.querySelector("title")?.textContent?.trim() ||
    doc.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim() ||
    url;

  const reader = new Readability(doc.cloneNode(true) as Document);
  const article = reader.parse();

  const contentHtml = article?.content || "";
  const textContent = article?.textContent || doc.body?.textContent || "";

  return { dom, title, url, textContent, contentHtml };
}
