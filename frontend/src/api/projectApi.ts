import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../models/Project.js";
import { ApiResponse } from "../models/ApiResponse.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE_URL}/api/projects`);
  const json: ApiResponse<Project[]> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to fetch projects");
  return json.data;
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const res = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json: ApiResponse<Project> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to create project");
  return json.data;
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json: ApiResponse<Project> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to update project");
  return json.data;
}

export async function refineProjectContext(params: {
  manualContext?: string;
  rootPath?: string;
}): Promise<{
  refinedContext: string;
  clarificationQuestions?: string[];
  isReady: boolean;
}> {
  const res = await fetch(`${BASE_URL}/api/projects/refine-context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to refine project context");
  return json.data;
}
