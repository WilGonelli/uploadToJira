import { JiraTask, TaskUploadResult } from "../models/JiraTask.js";
import { ApiResponse } from "../models/ApiResponse.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function planTasks(
  projectId: string,
  userPrompt: string,
): Promise<JiraTask[]> {
  const res = await fetch(`${BASE_URL}/api/tasks/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, userPrompt }),
  });
  const json: ApiResponse<JiraTask[]> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to plan tasks");
  return json.data;
}

export async function uploadTasks(
  projectId: string,
  tasks: JiraTask[],
): Promise<TaskUploadResult> {
  const res = await fetch(`${BASE_URL}/api/tasks/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, tasks }),
  });
  const json: ApiResponse<TaskUploadResult> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to upload tasks to Jira");
  return json.data;
}

export async function fetchMyTasks(
  projectKey?: string,
  statusCategory?: string,
  onlyMyTasks: boolean = true,
  onlyCurrentSprint: boolean = true,
): Promise<JiraTask[]> {
  const url = new URL(`${BASE_URL}/api/tasks/my-tasks`);
  if (projectKey && projectKey.trim()) {
    url.searchParams.set("projectKey", projectKey.trim());
  }
  if (statusCategory && statusCategory.trim()) {
    url.searchParams.set("statusCategory", statusCategory.trim());
  }
  url.searchParams.set("onlyMyTasks", String(onlyMyTasks));
  url.searchParams.set("onlyCurrentSprint", String(onlyCurrentSprint));

  const res = await fetch(url.toString());
  const json: ApiResponse<JiraTask[]> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to fetch assigned tasks");
  return json.data;
}
