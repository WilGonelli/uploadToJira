/**
 * Pure TypeScript entity representing a technical implementation comment.
 */
export interface TaskComment {
  issueKey: string;
  technicalSummary: string;
  impactedFiles: string[];
  testingNotes: string;
  dodChecklist: string[];
  rawMarkdown: string;
}

export interface CommentUploadResult {
  commentId: string;
  issueKey: string;
  created: string;
  author: string;
}
