import dotenv from "dotenv";
import path from "path";

dotenv.config();

export interface AppConfig {
  port: number;
  corsOrigin: string;
  databasePath: string;
  workspaceRootPath: string;
  gemini: {
    apiKey: string;
    model: string;
  };
  jira: {
    domain: string;
    email: string;
    apiToken: string;
    projectKey: string;
    parentKey: string;
    issueType: string;
    storyPoints: number;
    storyPointsFieldId?: string;
    phaseValue: string;
    activityValue: string;
    phaseFieldId?: string;
    activityFieldId?: string;
    doneTransitionId?: string;
    isDryRun: boolean;
  };
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || "3001", 10),
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    databasePath:
      process.env.DATABASE_PATH ||
      path.resolve(process.cwd(), "../data/jira_ai_orchestrator.sqlite"),
    workspaceRootPath:
      process.env.WORKSPACE_ROOT_PATH || path.resolve(process.cwd(), "../.."),
    gemini: {
      apiKey: (process.env.GEMINI_API_KEY || "").trim(),
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    },
    jira: {
      domain: (process.env.JIRA_DOMAIN || "").trim().replace(/\/+$/, ""),
      email: (process.env.JIRA_EMAIL || "").trim(),
      apiToken: (process.env.JIRA_API_TOKEN || "").trim(),
      projectKey: (process.env.JIRA_PROJECT_KEY || "IMPCT").trim(),
      parentKey: (process.env.JIRA_PARENT_KEY || "").trim(),
      issueType: (process.env.JIRA_ISSUE_TYPE || "Task").trim(),
      storyPoints: parseFloat(process.env.JIRA_STORY_POINTS || "0.5"),
      storyPointsFieldId:
        process.env.JIRA_STORY_POINTS_FIELD_ID?.trim() || undefined,
      phaseValue: (process.env.JIRA_PHASE_VALUE || "").trim(),
      activityValue: (process.env.JIRA_ACTIVITY_VALUE || "").trim(),
      phaseFieldId: process.env.JIRA_PHASE_FIELD_ID?.trim() || undefined,
      activityFieldId: process.env.JIRA_ACTIVITY_FIELD_ID?.trim() || undefined,
      doneTransitionId:
        process.env.JIRA_DONE_TRANSITION_ID?.trim() || undefined,
      isDryRun: process.env.DRY_RUN?.toLowerCase() === "true",
    },
  };
}
