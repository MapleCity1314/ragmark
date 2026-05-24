import type { JSDOM } from "jsdom";
import type { BookmarkSection } from "../types";

export function extractSections(dom: JSDOM): BookmarkSection[] {
  const doc = dom.window.document;
  const sections: BookmarkSection[] = [];
  let position = 0;

  const headings = doc.querySelectorAll(
    "h1, h2, h3, h4, h5, h6",
  );
  for (const heading of headings) {
    const tagName = heading.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1) ?? "1", 10);
    const text = (heading.textContent || "").trim().slice(0, 120);
    if (!text) continue;

    sections.push({
      id: `s${position}`,
      heading: text,
      level,
      position,
    });
    position++;
  }

  return sections;
}
