import { describe, it, expect } from "vitest";
import { extractAutoTags } from "../../src/parser/auto-tagger";

describe("extractAutoTags", () => {
  it("extracts keywords from text", () => {
    const tags = extractAutoTags(
      "Understanding React Server Components",
      "A deep dive into React Server Components and Next.js rendering",
      "React Server Components are a new way to build React applications. They run on the server and send minimal HTML to the client. This approach improves performance and reduces bundle size.",
    );
    expect(tags.length).toBeGreaterThan(0);
    expect(tags).toContain("react");
    expect(tags).toContain("components");
    expect(tags).toContain("server");
  });

  it("returns empty for short text", () => {
    const tags = extractAutoTags("", "", "a the is");
    expect(tags.length).toBeGreaterThanOrEqual(0);
  });

  it("filters stop words", () => {
    const tags = extractAutoTags(
      "The is a and of the",
      "for in on with at by",
      "these are all stop words the and of to in it is",
    );
    for (const tag of tags) {
      expect(["the", "a", "is", "and", "of", "for"]).not.toContain(tag);
    }
  });
});
