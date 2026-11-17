import { describe, it, expect } from "vitest";
import { AdfBuilder } from "./AdfBuilder.js";

describe("AdfBuilder", () => {
  it("builds valid ADF document for task description and DoD", () => {
    const desc = "Implement filter persistence.";
    const dod =
      "1. SessionStorage store implemented\n2. Vitest unit tests added";
    const impl = "Added zustand store.";

    const adf = AdfBuilder.buildIssueDescription(desc, dod, impl);

    expect(adf.type).toBe("doc");
    expect(adf.version).toBe(1);
    expect(adf.content.length).toBeGreaterThan(0);

    const headingNodes = adf.content.filter((n) => n.type === "heading");
    expect(headingNodes.length).toBe(2); // DoD heading + Implementation heading

    const listNodes = adf.content.filter((n) => n.type === "bulletList");
    expect(listNodes.length).toBe(1);
    expect(listNodes[0].content?.length).toBe(2);
  });

  it("builds valid ADF comment document from markdown headings and bullet lists", () => {
    const markdown = `### Technical Implementation Summary
Implemented local caching.

### Impacted Files
- \`src/store.ts\`
- \`src/view.tsx\``;

    const adf = AdfBuilder.buildCommentDocument(markdown);

    expect(adf.type).toBe("doc");
    expect(adf.version).toBe(1);

    const headings = adf.content.filter((n) => n.type === "heading");
    expect(headings.length).toBe(2);

    const bulletLists = adf.content.filter((n) => n.type === "bulletList");
    expect(bulletLists.length).toBe(1);
    expect(bulletLists[0].content?.length).toBe(2);
  });
});
