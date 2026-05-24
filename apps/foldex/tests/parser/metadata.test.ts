import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { extractMetadata } from "../../src/parser/metadata";

describe("extractMetadata", () => {
  it("extracts Open Graph metadata", () => {
    const html = `<html><head>
      <meta property="og:title" content="Test Article" />
      <meta property="og:description" content="A test article description" />
      <meta property="article:author" content="John Doe" />
      <meta property="article:published_time" content="2026-01-15" />
    </head><body></body></html>`;
    const dom = new JSDOM(html, { url: "https://example.com" });
    const result = extractMetadata(dom);
    expect(result.author).toBe("John Doe");
    expect(result.published_at).toBe("2026-01-15");
    expect(result.description).toBe("A test article description");
    expect(result.source).toBe("open-graph");
  });

  it("extracts meta tag metadata", () => {
    const html = `<html><head>
      <meta name="author" content="Jane Smith" />
      <meta name="description" content="Meta description" />
    </head><body></body></html>`;
    const dom = new JSDOM(html, { url: "https://example.com" });
    const result = extractMetadata(dom);
    expect(result.author).toBe("Jane Smith");
    expect(result.description).toBe("Meta description");
  });

  it("extracts JSON-LD metadata", () => {
    const html = `<html><head>
      <script type="application/ld+json">
      {
        "@type": "Article",
        "author": {"name": "Alice Johnson"},
        "datePublished": "2025-06-01",
        "description": "JSON-LD description"
      }
      </script>
    </head><body></body></html>`;
    const dom = new JSDOM(html, { url: "https://example.com" });
    const result = extractMetadata(dom);
    expect(result.author).toBe("Alice Johnson");
    expect(result.published_at).toBe("2025-06-01");
    expect(result.description).toBe("JSON-LD description");
    expect(result.source).toBe("json-ld");
  });

  it("falls back to heuristic author extraction", () => {
    const html = `<html><body>
      <a rel="author">Bob Writer</a>
    </body></html>`;
    const dom = new JSDOM(html, { url: "https://example.com" });
    const result = extractMetadata(dom);
    expect(result.author).toBe("Bob Writer");
  });

  it("returns empty metadata for plain pages", () => {
    const html = `<html><head><title>Plain Page</title></head><body></body></html>`;
    const dom = new JSDOM(html, { url: "https://example.com" });
    const result = extractMetadata(dom);
    expect(result.author).toBeUndefined();
    expect(result.published_at).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.source).toBe("none");
  });
});
