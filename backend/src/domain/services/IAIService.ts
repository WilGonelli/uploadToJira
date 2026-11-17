import { JiraTask } from "../entities/JiraTask.js";
import { TaskComment } from "../entities/TaskComment.js";

/**
 * Prompt instruction parameters for task planning.
 */
export interface PlanTasksPromptParams {
  userPrompt: string;
  projectContextMarkdown: string;
  historicalTaskSummaries: string[];
}

/**
 * Parameters for generating an implementation comment.
 */
export interface GenerateCommentParams {
  issueKey: string;
  summary: string;
  jiraDescription: string;
  dod: string;
  codeChangesSummary: string;
}

/**
 * Interface contract for AI Agent operations (Google Gemini).
 */
export interface IAIService {
  /**
   * Plans tasks conforming to TASK_CREATION_RULES, checking historical context.
   */
  planTasks(params: PlanTasksPromptParams): Promise<JiraTask[]>;

  /**
   * Analyzes an existing manual project context and provides clarifying questions or refinements.
   */
  refineProjectContext(contextInput: string): Promise<{
    refinedContext: string;
    clarificationQuestions?: string[];
    isReady: boolean;
  }>;

  /**
   * Generates a technical implementation comment adhering to COMMENT_RULES.
   */
  generateTaskComment(params: GenerateCommentParams): Promise<TaskComment>;
}
