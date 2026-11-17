/**
 * Node structure for Atlassian Document Format (ADF) v3.
 */
export interface AdfNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: AdfNode[];
  text?: string;
}

export interface AdfDocument {
  type: "doc";
  version: 1;
  content: AdfNode[];
}

/**
 * Utility to construct Atlassian Document Format (ADF) JSON structures.
 */
export class AdfBuilder {
  /**
   * Builds an ADF document from Jira description, Definition of Done, and implementation notes.
   */
  public static buildIssueDescription(
    jiraDescription: string,
    dod: string,
    implementation?: string,
  ): AdfDocument {
    const content: AdfNode[] = [];

    // Main task description
    if (jiraDescription && jiraDescription.trim().length > 0) {
      const paragraphs = jiraDescription
        .split("\n")
        .filter((p) => p.trim().length > 0);
      for (const paragraph of paragraphs) {
        content.push({
          type: "paragraph",
          content: [{ type: "text", text: paragraph.trim() }],
        });
      }
    }

    // Definition of Done (DoD) header and checklist
    if (dod && dod.trim().length > 0) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Definition of Done (DoD)" }],
      });

      const dodLines = dod
        .split("\n")
        .map((l) =>
          l
            .trim()
            .replace(/^[0-9]+\.\s*/, "")
            .replace(/^-\s*(\[[ xX]\]\s*)?/, ""),
        )
        .filter((l) => l.length > 0);

      if (dodLines.length > 0) {
        content.push({
          type: "bulletList",
          content: dodLines.map((itemText) => ({
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: itemText }],
              },
            ],
          })),
        });
      }
    }

    // Implementation summary
    if (implementation && implementation.trim().length > 0) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Implementation Summary" }],
      });

      const implLines = implementation
        .split("\n")
        .filter((l) => l.trim().length > 0);
      for (const line of implLines) {
        content.push({
          type: "paragraph",
          content: [{ type: "text", text: line.trim() }],
        });
      }
    }

    return {
      type: "doc",
      version: 1,
      content,
    };
  }

  /**
   * Builds an ADF document suitable for Jira issue comments.
   */
  public static buildCommentDocument(markdownText: string): AdfDocument {
    const content: AdfNode[] = [];
    const lines = markdownText.split("\n");

    let currentBulletList: AdfNode[] | null = null;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();

      if (!trimmed) {
        if (currentBulletList) {
          content.push({ type: "bulletList", content: currentBulletList });
          currentBulletList = null;
        }
        continue;
      }

      // Headings
      if (trimmed.startsWith("### ")) {
        if (currentBulletList) {
          content.push({ type: "bulletList", content: currentBulletList });
          currentBulletList = null;
        }
        content.push({
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: trimmed.replace(/^###\s+/, "") }],
        });
        continue;
      }

      if (trimmed.startsWith("## ")) {
        if (currentBulletList) {
          content.push({ type: "bulletList", content: currentBulletList });
          currentBulletList = null;
        }
        content.push({
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: trimmed.replace(/^##\s+/, "") }],
        });
        continue;
      }

      // Bullet lists
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.replace(/^[-*]\s+/, "");
        if (!currentBulletList) {
          currentBulletList = [];
        }
        currentBulletList.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: itemText }],
            },
          ],
        });
        continue;
      }

      // Close open list if encountered paragraph
      if (currentBulletList) {
        content.push({ type: "bulletList", content: currentBulletList });
        currentBulletList = null;
      }

      content.push({
        type: "paragraph",
        content: [{ type: "text", text: trimmed }],
      });
    }

    if (currentBulletList) {
      content.push({ type: "bulletList", content: currentBulletList });
    }

    return {
      type: "doc",
      version: 1,
      content,
    };
  }
}
