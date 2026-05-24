import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { extractReferences } from "../../src/parser/link-extractor";

describe("extractReferences", () => {
  it("extracts external links only", () => {
    const html = `<html><body>
      <a href="https://other-site.com/page">external</a>
      <a href="https://example.com/about">internal</a>
      <a href="/relative">relative</a>
      <a href="mailto:test@example.com">mail</a>
      <a href="javascript:void(0)">js</a>
      <a href="https://another.com">another external</a>
    </body></html>`;
    const dom = new JSDOM(html, { url: "https://example.com" });
    const refs = extractReferences(dom, "https://example.com/article");
    expect(refs).toContain("https://other-site.com/page");
    expect(refs).toContain("https://another.com/");
    expect(refs).not.toContain("https://example.com/about");
  });

  it("returns empty for no external links", () => {
    const html = `<html><body>
      <a href="/about">relative only</a>
    </body></html>`;
    const dom = new JSDOM(html, { url: "https://example.com" });
    const refs = extractReferences(dom, "https://example.com/article");
    expect(refs).toHaveLength(0);
  });

  it("caps at 20 references", () => {
    const links = Array.from({ length: 30 }, (_, i) =>
      `<a href="https://site${i}.com">link</a>`,
    ).join("");
    const dom = new JSDOM(`<html><body>${links}</body></html>`, {
      url: "https://example.com",
    });
    const refs = extractReferences(dom, "https://example.com/article");
    expect(refs.length).toBeLessThanOrEqual(20);
  });
});
