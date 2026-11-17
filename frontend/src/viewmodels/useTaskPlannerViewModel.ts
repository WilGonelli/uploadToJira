import { useState, useCallback } from "react";
import { JiraTask, TaskUploadResult } from "../models/JiraTask.js";
import * as taskApi from "../api/taskApi.js";

export interface TaskPlannerState {
  userPrompt: string;
  plannedTasks: JiraTask[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  uploadResult: TaskUploadResult | null;
}

export interface TaskPlannerActions {
  setUserPrompt: (prompt: string) => void;
  handlePlanTasks: (projectId: string) => Promise<void>;
  handleUpdateTaskCard: (index: number, updatedTask: Partial<JiraTask>) => void;
  handleRemoveTaskCard: (index: number) => void;
  handleAddTaskCard: () => void;
  handleUploadToJira: (projectId: string) => Promise<void>;
  clearUploadResult: () => void;
  clearError: () => void;
}

export function useTaskPlannerViewModel(): {
  state: TaskPlannerState;
  actions: TaskPlannerActions;
} {
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [plannedTasks, setPlannedTasks] = useState<JiraTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<TaskUploadResult | null>(
    null,
  );

  const handlePlanTasks = useCallback(
    async (projectId: string) => {
      if (!projectId) {
        setError("Please select a project before planning tasks.");
        return;
      }
      if (!userPrompt.trim()) {
        setError("Please enter a requirement or feature description.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setUploadResult(null);

      try {
        const tasks = await taskApi.planTasks(projectId, userPrompt);
        setPlannedTasks(tasks);
      } catch (err: any) {
        setError(err.message || "Failed to plan tasks with AI.");
      } finally {
        setIsLoading(false);
      }
    },
    [userPrompt],
  );

  const handleUpdateTaskCard = useCallback(
    (index: number, updatedTask: Partial<JiraTask>) => {
      setPlannedTasks((prev) =>
        prev.map((task, idx) =>
          idx === index ? { ...task, ...updatedTask } : task,
        ),
      );
    },
    [],
  );

  const handleRemoveTaskCard = useCallback((index: number) => {
    setPlannedTasks((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleAddTaskCard = useCallback(() => {
    setPlannedTasks((prev) => [
      ...prev,
      {
        number: String(prev.length + 1).padStart(2, "0"),
        summary: "New Custom Task",
        status: "OPEN",
        parent: "",
        storyPoints: 1,
        phase: "Phase 4",
        activity: "Activity 3",
        assign: "me",
        jiraDescription:
          "Describe the task objectives and implementation details.",
        dod: "1. Unit tests implemented\n2. Code reviewed",
        implementation: "",
      },
    ]);
  }, []);

  const handleUploadToJira = useCallback(
    async (projectId: string) => {
      if (!projectId) {
        setError("Project must be selected to upload tasks.");
        return;
      }
      if (plannedTasks.length === 0) {
        setError("No planned tasks to upload.");
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const result = await taskApi.uploadTasks(projectId, plannedTasks);
        setUploadResult(result);
        if (result.successfulTasks.length === plannedTasks.length) {
          // Update local tasks with assigned keys
          setPlannedTasks(result.successfulTasks);
        }
      } catch (err: any) {
        setError(err.message || "Failed to upload tasks to Jira.");
      } finally {
        setIsUploading(false);
      }
    },
    [plannedTasks],
  );

  const clearUploadResult = useCallback(() => setUploadResult(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    state: {
      userPrompt,
      plannedTasks,
      isLoading,
      isUploading,
      error,
      uploadResult,
    },
    actions: {
      setUserPrompt,
      handlePlanTasks,
      handleUpdateTaskCard,
      handleRemoveTaskCard,
      handleAddTaskCard,
      handleUploadToJira,
      clearUploadResult,
      clearError,
    },
  };
}
