/**
 * Represents a planned or parsed Jira task following standard task rules.
 */
export interface JiraTask {
  /** Sequential task number (e.g. "01", "02") */
  number: string;
  /** Task summary / title */
  summary: string;
  /** Task status (e.g. 'Open', 'In Progress', 'Code Review', 'Done') */
  status: "OPEN" | "DONE" | string;
  /** Parent issue or epic key (e.g. "F04-A03") */
  parent: string;
  /** Story points assigned (e.g. 0.5, 1, 2, 3) */
  storyPoints: number;
  /** Phase field value (e.g. "Phase 4", "3") */
  phase: string;
  /** Activity field value (e.g. "Activity 3", "5") */
  activity: string;
  /** Assignee identifier (email, accountId, or 'me') */
  assign: string;
  /** Priority level ('Baixa', 'Média', 'Alta') */
  priority?: string;
  /** Architectural component category */
  component?: string;
  /** List or comma-separated target files modified/created */
  targetFiles?: string;
  /** Detailed Jira issue description */
  jiraDescription: string;
  /** Definition of Done checklist */
  dod: string;
  /** Technical implementation summary */
  implementation: string;
  /** Assigned Jira issue key after creation (e.g. "F04-123") */
  jiraIssueKey?: string;
  /** Direct URL to the created Jira issue */
  jiraIssueUrl?: string;
}

/**
 * Result returned after batch uploading tasks to Jira.
 */
export interface TaskUploadResult {
  totalTasks: number;
  successfulTasks: JiraTask[];
  failedTasks: Array<{ task: JiraTask; error: string }>;
  isDryRun: boolean;
}
