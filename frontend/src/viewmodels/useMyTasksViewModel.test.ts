import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMyTasksViewModel } from "./useMyTasksViewModel.js";
import * as taskApi from "../api/taskApi.js";
import { JiraTask } from "../models/JiraTask.js";

vi.mock("../api/taskApi.js");
vi.mock("../api/commentApi.js");

describe("useMyTasksViewModel", () => {
  const mockTasks: JiraTask[] = [
    {
      number: "01",
      summary: "Sample Jira Task",
      status: "OPEN",
      parent: "IMPCT-297",
      storyPoints: 1,
      phase: "Phase 4",
      activity: "Activity 3",
      assign: "me",
      jiraDescription: "Description text",
      dod: "DoD checklist",
      implementation: "",
      jiraIssueKey: "IMPCT-101",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with provided project key and fetches tasks", async () => {
    vi.mocked(taskApi.fetchMyTasks).mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useMyTasksViewModel("IMPCT"));

    expect(result.current.state.projectKey).toBe("IMPCT");

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    expect(taskApi.fetchMyTasks).toHaveBeenCalledWith(
      "IMPCT",
      "In Progress, To Do",
      true,
      true,
    );
    expect(result.current.state.assignedTasks).toEqual(mockTasks);
  });

  it("updates projectKey and reloads tasks for new project", async () => {
    vi.mocked(taskApi.fetchMyTasks).mockResolvedValue([]);

    const { result } = renderHook(() => useMyTasksViewModel("IMPCT"));

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    act(() => {
      result.current.actions.setProjectKey("NEWPROJ");
    });

    expect(result.current.state.projectKey).toBe("NEWPROJ");

    await act(async () => {
      await result.current.actions.loadAssignedTasks("NEWPROJ");
    });

    expect(taskApi.fetchMyTasks).toHaveBeenCalledWith(
      "NEWPROJ",
      "In Progress, To Do",
      true,
      true,
    );
  });

  it("handles modal open and close states", async () => {
    vi.mocked(taskApi.fetchMyTasks).mockResolvedValue([]);

    const { result } = renderHook(() => useMyTasksViewModel());

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    expect(result.current.state.isCommentModalOpen).toBe(false);
    expect(result.current.state.selectedTaskForComment).toBeNull();

    act(() => {
      result.current.actions.openCommentModal(mockTasks[0]);
    });

    expect(result.current.state.isCommentModalOpen).toBe(true);
    expect(result.current.state.selectedTaskForComment).toEqual(mockTasks[0]);

    act(() => {
      result.current.actions.closeCommentModal();
    });

    expect(result.current.state.isCommentModalOpen).toBe(false);
    expect(result.current.state.selectedTaskForComment).toBeNull();
  });
});
