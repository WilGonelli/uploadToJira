/**
 * Pure TypeScript entity representing a registered project.
 */
export interface Project {
  id: string;
  name: string;
  jiraProjectKey: string;
  jiraParentKey: string;
  rootPath: string;
  contextMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
