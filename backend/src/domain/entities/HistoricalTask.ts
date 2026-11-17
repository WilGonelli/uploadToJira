/**
 * Historical record of an uploaded task to prevent duplicate planning.
 */
export interface HistoricalTask {
  id: string;
  projectId: string;
  taskNumber: string;
  summary: string;
  jiraIssueKey: string;
  status: "OPEN" | "DONE" | string;
  storyPoints: number;
  dod: string;
  uploadedAt: string;
}

export type CreateHistoricalTaskInput = Omit<
  HistoricalTask,
  "id" | "uploadedAt"
>;
