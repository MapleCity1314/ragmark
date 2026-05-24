import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { extractSections } from "../../src/parser/sectionizer";

describe("extractSections", () => {
  it("extracts headings as sections", () => {
    const html = `<html><body>
      <h1>Main Title</h1>
      <h2>Introduction</h2>
      <p>intro text</p>
      <h2>Methods</h2>
      <p>methods text</p>
      <h3>Setup</h3>
      <p>setup text</p>
      <h2>Conclusion</h2>
    </body></html>`;
    const dom = new JSDOM(html);
    const sections = extractSections(dom);
    expect(sections).toHaveLength(5);
    expect(sections[0]).toMatchObject({ heading: "Main Title", level: 1, position: 0 });
    expect(sections[1]).toMatchObject({ heading: "Introduction", level: 2, position: 1 });
    expect(sections[2]).toMatchObject({ heading: "Methods", level: 2, position: 2 });
    expect(sections[3]).toMatchObject({ heading: "Setup", level: 3, position: 3 });
    expect(sections[4]).toMatchObject({ heading: "Conclusion", level: 2, position: 4 });
  });

  it("returns empty array when no headings", () => {
    const dom = new JSDOM("<html><body><p>no headings</p></body></html>");
    const sections = extractSections(dom);
    expect(sections).toHaveLength(0);
  });

  it("skips empty headings", () => {
    const html = `<html><body>
      <h2></h2>
      <h2>   </h2>
      <h2>Valid Section</h2>
    </body></html>`;
    const dom = new JSDOM(html);
    const sections = extractSections(dom);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBe("Valid Section");
  });
});
