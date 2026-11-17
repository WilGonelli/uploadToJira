/**
 * Represents a technical implementation comment for a Jira issue.
 */
export interface TaskComment {
  /** Target Jira issue key (e.g. "F04-123") */
  issueKey: string;
  /** Summary of what was done */
  technicalSummary: string;
  /** List of impacted files */
  impactedFiles: string[];
  /** Validations and automated tests performed */
  testingNotes: string;
  /** Checklist of DoD criteria satisfied */
  dodChecklist: string[];
  /** Formatted markdown output following COMMENT_RULES */
  rawMarkdown: string;
}

/**
 * Result returned after posting a comment to Jira.
 */
export interface CommentUploadResult {
  commentId: string;
  issueKey: string;
  created: string;
  author: string;
}
