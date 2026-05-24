import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { extractStructure } from "../../src/parser/structure";

describe("extractStructure", () => {
  it("counts tables, code blocks, lists, and images", () => {
    const html = `<html><body>
      <table><tr><td>1</td></tr></table>
      <table><tr><td>2</td></tr></table>
      <pre><code>console.log("hello");</code></pre>
      <pre><code>function foo() {}</code></pre>
      <code>inline</code>
      <ul><li>item</li></ul>
      <ol><li>item</li></ol>
      <img src="a.png" />
      <img src="b.png" />
      <img src="c.png" />
    </body></html>`;
    const dom = new JSDOM(html);
    const result = extractStructure(dom);
    expect(result.tables).toBe(2);
    expect(result.code_blocks).toBe(5);
    expect(result.lists).toBe(2);
    expect(result.images).toBe(3);
  });

  it("returns zeros for empty body", () => {
    const dom = new JSDOM("<html><body></body></html>");
    const result = extractStructure(dom);
    expect(result.tables).toBe(0);
    expect(result.code_blocks).toBe(0);
    expect(result.lists).toBe(0);
    expect(result.images).toBe(0);
  });
});
