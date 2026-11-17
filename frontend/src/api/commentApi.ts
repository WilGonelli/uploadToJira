import { TaskComment, CommentUploadResult } from "../models/TaskComment.js";
import { ApiResponse } from "../models/ApiResponse.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface GenerateCommentPayload {
  issueKey: string;
  summary: string;
  jiraDescription?: string;
  dod?: string;
  rootPath?: string;
  keywords?: string[];
}

export async function generateComment(
  payload: GenerateCommentPayload,
): Promise<TaskComment> {
  const res = await fetch(`${BASE_URL}/api/comments/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<TaskComment> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to generate comment");
  return json.data;
}

export async function uploadComment(
  issueKey: string,
  commentMarkdown: string,
): Promise<CommentUploadResult> {
  const res = await fetch(`${BASE_URL}/api/comments/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issueKey, commentMarkdown }),
  });
  const json: ApiResponse<CommentUploadResult> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.error || "Failed to upload comment");
  return json.data;
}
