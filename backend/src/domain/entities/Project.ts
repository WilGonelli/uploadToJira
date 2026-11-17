/**
 * Domain entity representing a software project workspace with Jira mapping.
 */
export interface Project {
  /** Unique project identifier (UUID) */
  id: string;
  /** Human-readable project name (e.g. "Customer Portal Migrations") */
  name: string;
  /** Jira Project Key (e.g. "F04", "IMPCT") */
  jiraProjectKey: string;
  /** Default parent issue/epic key (e.g. "F04-A03") */
  jiraParentKey: string;
  /** Relative or absolute root directory inside the workspace (e.g. "my-project") */
  rootPath: string;
  /** Technical project context markdown describing tech stack, rules, and scope */
  contextMarkdown: string;
  /** ISO timestamp when the project was registered */
  createdAt: string;
  /** ISO timestamp when the project was last updated */
  updatedAt: string;
}

/**
 * Data required to register or update a project.
 */
export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
