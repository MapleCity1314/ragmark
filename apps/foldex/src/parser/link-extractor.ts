import type { JSDOM } from "jsdom";

export function extractReferences(dom: JSDOM, sourceUrl: string): string[] {
  const doc = dom.window.document;
  let sourceDomain: string;
  try {
    sourceDomain = new URL(sourceUrl).hostname;
  } catch {
    return [];
  }

  const links = doc.querySelectorAll("a[href]");
  const refs = new Set<string>();

  for (const link of links) {
    const rawHref = link.getAttribute("href");
    if (!rawHref) continue;

    let absolute: string;
    try {
      absolute = new URL(rawHref, sourceUrl).href;
    } catch {
      continue;
    }

    if (!absolute.startsWith("http")) continue;

    let domain: string;
    try {
      domain = new URL(absolute).hostname;
    } catch {
      continue;
    }

    if (domain !== sourceDomain) {
      refs.add(absolute);
    }
  }

  return [...refs].slice(0, 20);
}
