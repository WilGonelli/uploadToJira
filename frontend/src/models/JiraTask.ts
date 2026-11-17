/**
 * Pure TypeScript entity representing a Jira task for planning and upload.
 */
export interface JiraTask {
  number: string;
  summary: string;
  status: "OPEN" | "DONE" | string;
  parent: string;
  storyPoints: number;
  phase: string;
  activity: string;
  assign: string;
  priority?: string;
  component?: string;
  targetFiles?: string;
  jiraDescription: string;
  dod: string;
  implementation: string;
  jiraIssueKey?: string;
  jiraIssueUrl?: string;
}

export interface TaskUploadResult {
  totalTasks: number;
  successfulTasks: JiraTask[];
  failedTasks: Array<{ task: JiraTask; error: string }>;
  isDryRun: boolean;
}
