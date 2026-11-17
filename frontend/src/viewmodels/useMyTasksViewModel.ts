import { useState, useCallback, useEffect } from "react";
import { JiraTask } from "../models/JiraTask.js";
import { TaskComment } from "../models/TaskComment.js";
import * as taskApi from "../api/taskApi.js";
import * as commentApi from "../api/commentApi.js";

export interface MyTasksState {
  projectKey: string;
  statusCategory: string;
  onlyMyTasks: boolean;
  onlyCurrentSprint: boolean;
  assignedTasks: JiraTask[];
  isLoading: boolean;
  error: string | null;
  selectedTaskForComment: JiraTask | null;
  isCommentModalOpen: boolean;
  generatedCommentDraft: TaskComment | null;
  isGeneratingComment: boolean;
  isUploadingComment: boolean;
  commentSuccessMessage: string | null;
}

export interface MyTasksActions {
  setProjectKey: (key: string) => void;
  setStatusCategory: (category: string) => void;
  setOnlyMyTasks: (onlyMine: boolean) => void;
  setOnlyCurrentSprint: (onlyCurrent: boolean) => void;
  loadAssignedTasks: (
    projectKeyOverride?: string,
    statusCategoryOverride?: string,
    onlyMyTasksOverride?: boolean,
    onlyCurrentSprintOverride?: boolean,
  ) => Promise<void>;
  openCommentModal: (task: JiraTask) => void;
  closeCommentModal: () => void;
  handleGenerateComment: (rootPath?: string) => Promise<void>;
  handleUpdateCommentMarkdown: (markdown: string) => void;
  handleUploadCommentToJira: () => Promise<void>;
  clearError: () => void;
}

export function useMyTasksViewModel(initialProjectKey: string = ""): {
  state: MyTasksState;
  actions: MyTasksActions;
} {
  const [projectKey, setProjectKey] = useState<string>(initialProjectKey);
  const [statusCategory, setStatusCategory] =
    useState<string>("In Progress, To Do");
  const [onlyMyTasks, setOnlyMyTasks] = useState<boolean>(true);
  const [onlyCurrentSprint, setOnlyCurrentSprint] = useState<boolean>(true);
  const [assignedTasks, setAssignedTasks] = useState<JiraTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTaskForComment, setSelectedTaskForComment] =
    useState<JiraTask | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState<boolean>(false);
  const [generatedCommentDraft, setGeneratedCommentDraft] =
    useState<TaskComment | null>(null);
  const [isGeneratingComment, setIsGeneratingComment] =
    useState<boolean>(false);
  const [isUploadingComment, setIsUploadingComment] = useState<boolean>(false);
  const [commentSuccessMessage, setCommentSuccessMessage] = useState<
    string | null
  >(null);

  const loadAssignedTasks = useCallback(
    async (
      projectKeyOverride?: string,
      statusCategoryOverride?: string,
      onlyMyTasksOverride?: boolean,
      onlyCurrentSprintOverride?: boolean,
    ) => {
      setIsLoading(true);
      setError(null);
      const targetProjectKey =
        projectKeyOverride !== undefined ? projectKeyOverride : projectKey;
      const targetCategory =
        statusCategoryOverride !== undefined
          ? statusCategoryOverride
          : statusCategory;
      const targetOnlyMyTasks =
        onlyMyTasksOverride !== undefined ? onlyMyTasksOverride : onlyMyTasks;
      const targetOnlyCurrentSprint =
        onlyCurrentSprintOverride !== undefined
          ? onlyCurrentSprintOverride
          : onlyCurrentSprint;

      try {
        const tasks = await taskApi.fetchMyTasks(
          targetProjectKey,
          targetCategory,
          targetOnlyMyTasks,
          targetOnlyCurrentSprint,
        );
        setAssignedTasks(tasks);
      } catch (err: any) {
        setError(err.message || "Failed to load assigned Jira tasks.");
      } finally {
        setIsLoading(false);
      }
    },
    [projectKey, statusCategory, onlyMyTasks, onlyCurrentSprint],
  );

  useEffect(() => {
    loadAssignedTasks(initialProjectKey, undefined, true, true);
  }, []);

  const openCommentModal = useCallback((task: JiraTask) => {
    setSelectedTaskForComment(task);
    setGeneratedCommentDraft(null);
    setCommentSuccessMessage(null);
    setIsCommentModalOpen(true);
  }, []);

  const closeCommentModal = useCallback(() => {
    setIsCommentModalOpen(false);
    setSelectedTaskForComment(null);
    setGeneratedCommentDraft(null);
    setCommentSuccessMessage(null);
  }, []);

  const handleGenerateComment = useCallback(
    async (rootPath?: string) => {
      if (!selectedTaskForComment) return;

      setIsGeneratingComment(true);
      setError(null);

      try {
        const comment = await commentApi.generateComment({
          issueKey:
            selectedTaskForComment.jiraIssueKey ||
            selectedTaskForComment.number,
          summary: selectedTaskForComment.summary,
          jiraDescription: selectedTaskForComment.jiraDescription,
          dod: selectedTaskForComment.dod,
          rootPath: rootPath || "",
        });
        setGeneratedCommentDraft(comment);
      } catch (err: any) {
        setError(
          err.message || "Failed to generate technical comment with AI.",
        );
      } finally {
        setIsGeneratingComment(false);
      }
    },
    [selectedTaskForComment],
  );

  const handleUpdateCommentMarkdown = useCallback((markdown: string) => {
    setGeneratedCommentDraft((prev) =>
      prev ? { ...prev, rawMarkdown: markdown } : null,
    );
  }, []);

  const handleUploadCommentToJira = useCallback(async () => {
    if (
      !selectedTaskForComment?.jiraIssueKey ||
      !generatedCommentDraft?.rawMarkdown
    ) {
      setError("Cannot upload comment: missing issue key or comment markdown.");
      return;
    }

    setIsUploadingComment(true);
    setError(null);

    try {
      await commentApi.uploadComment(
        selectedTaskForComment.jiraIssueKey,
        generatedCommentDraft.rawMarkdown,
      );
      setCommentSuccessMessage(
        `Comment successfully posted to Jira issue ${selectedTaskForComment.jiraIssueKey}!`,
      );
    } catch (err: any) {
      setError(err.message || "Failed to upload comment to Jira.");
    } finally {
      setIsUploadingComment(false);
    }
  }, [selectedTaskForComment, generatedCommentDraft]);

  const clearError = useCallback(() => setError(null), []);

  return {
    state: {
      projectKey,
      statusCategory,
      onlyMyTasks,
      onlyCurrentSprint,
      assignedTasks,
      isLoading,
      error,
      selectedTaskForComment,
      isCommentModalOpen,
      generatedCommentDraft,
      isGeneratingComment,
      isUploadingComment,
      commentSuccessMessage,
    },
    actions: {
      setProjectKey,
      setStatusCategory,
      setOnlyMyTasks,
      setOnlyCurrentSprint,
      loadAssignedTasks,
      openCommentModal,
      closeCommentModal,
      handleGenerateComment,
      handleUpdateCommentMarkdown,
      handleUploadCommentToJira,
      clearError,
    },
  };
}
