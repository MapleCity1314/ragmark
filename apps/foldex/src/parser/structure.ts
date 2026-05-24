import type { JSDOM } from "jsdom";
import type { BookmarkStructure } from "../types";

export function extractStructure(dom: JSDOM): BookmarkStructure {
  const doc = dom.window.document;

  const tables = doc.querySelectorAll("table").length;
  const codeBlocks =
    doc.querySelectorAll("pre code, pre, code").length;
  const lists =
    doc.querySelectorAll("ul, ol").length;
  const images =
    doc.querySelectorAll("img").length;

  return { tables, code_blocks: codeBlocks, lists, images };
}
