import TurndownService from "turndown";
import type { JSDOM } from "jsdom";
import type { BookmarkMeta, BookmarkStructure, BookmarkSection } from "./types";

export function convertToMarkdown(
  contentHtml: string,
  title: string,
  url: string,
  tags: string[],
  auto_tags: string[],
  meta: BookmarkMeta,
  sections: BookmarkSection[],
  structure: BookmarkStructure,
  references: string[],
  dom: JSDOM,
): string {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });
  turndown.addRule("preservePre", {
    filter: (node) => {
      return (
        node.nodeName === "PRE" ||
        (node.nodeName === "CODE" && !node.closest("pre"))
      );
    },
    replacement: (content, node) => {
      const lang =
        node instanceof dom.window.HTMLElement
          ? node.className.replace("language-", "") || ""
          : "";
      return "\n\n```" + lang + "\n" + content + "\n```\n\n";
    },
  });

  const body = turndown.turndown(contentHtml || "");

  const frontmatter = buildFrontmatter(
    title,
    url,
    tags,
    auto_tags,
    meta,
    sections,
    structure,
    references,
  );

  return `${frontmatter}\n\n# ${escapeYaml(title)}\n\n${body.trim()}`;
}

function buildFrontmatter(
  title: string,
  url: string,
  tags: string[],
  auto_tags: string[],
  meta: BookmarkMeta,
  sections: BookmarkSection[],
  structure: BookmarkStructure,
  references: string[],
): string {
  const lines: string[] = ["---"];
  lines.push(`url: "${escapeYaml(url)}"`);
  lines.push(`title: "${escapeYaml(title)}"`);

  if (meta.author) lines.push(`author: "${escapeYaml(meta.author)}"`);
  if (meta.published_at) lines.push(`published: "${meta.published_at}"`);
  if (meta.description)
    lines.push(`description: "${escapeYaml(meta.description)}"`);

  if (tags.length > 0) {
    lines.push("tags:");
    for (const t of tags) lines.push(`  - "${escapeYaml(t)}"`);
  }
  if (auto_tags.length > 0) {
    lines.push("auto_tags:");
    for (const t of auto_tags) lines.push(`  - "${escapeYaml(t)}"`);
  }

  if (
    structure.tables > 0 ||
    structure.code_blocks > 0 ||
    structure.lists > 0 ||
    structure.images > 0
  ) {
    lines.push("structure:");
    if (structure.tables > 0) lines.push(`  tables: ${structure.tables}`);
    if (structure.code_blocks > 0)
      lines.push(`  code_blocks: ${structure.code_blocks}`);
    if (structure.lists > 0) lines.push(`  lists: ${structure.lists}`);
    if (structure.images > 0) lines.push(`  images: ${structure.images}`);
  }

  if (sections.length > 0) {
    lines.push("sections:");
    for (const s of sections) {
      lines.push(`  - heading: "${escapeYaml(s.heading)}"`);
      lines.push(`    level: ${s.level}`);
    }
  }

  if (references.length > 0) {
    lines.push("references:");
    for (const r of references) lines.push(`  - "${r}"`);
  }

  const now = new Date().toISOString().slice(0, 10);
  lines.push(`added: ${now}`);

  lines.push("---");
  return lines.join("\n");
}

function escapeYaml(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
