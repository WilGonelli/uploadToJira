import { JiraTask, TaskUploadResult } from "../entities/JiraTask.js";
import { CommentUploadResult } from "../entities/TaskComment.js";

/**
 * Interface contract for Jira Cloud REST API operations.
 */
export interface IJiraService {
  /**
   * Fetches issues assigned to the authenticated user or all project tasks, optionally filtered by project key, status category, and active sprint.
   */
  fetchMyAssignedTasks(
    statusCategory?: string,
    maxResults?: number,
    projectKey?: string,
    onlyMyTasks?: boolean,
    onlyCurrentSprint?: boolean,
  ): Promise<JiraTask[]>;

  /**
   * Creates a single task issue in Jira Cloud.
   */
  createIssue(task: JiraTask): Promise<{ issueKey: string; issueUrl: string }>;

  /**
   * Batch creates multiple tasks in Jira Cloud.
   */
  uploadTasks(tasks: JiraTask[]): Promise<TaskUploadResult>;

  /**
   * Adds an implementation comment formatted in ADF to a Jira issue.
   */
  addComment(
    issueKey: string,
    commentMarkdown: string,
  ): Promise<CommentUploadResult>;

  /**
   * Transitions an issue to DONE state.
   */
  transitionToDone(issueKey: string): Promise<boolean>;
}
