import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskPlannerViewModel } from "./useTaskPlannerViewModel.js";
import * as taskApi from "../api/taskApi.js";
import { JiraTask } from "../models/JiraTask.js";

vi.mock("../api/taskApi.js");

describe("useTaskPlannerViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default empty state", () => {
    const { result } = renderHook(() => useTaskPlannerViewModel());

    expect(result.current.state.userPrompt).toBe("");
    expect(result.current.state.plannedTasks).toEqual([]);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.isUploading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it("handles adding, updating, and removing task cards manually", () => {
    const { result } = renderHook(() => useTaskPlannerViewModel());

    act(() => {
      result.current.actions.handleAddTaskCard();
    });

    expect(result.current.state.plannedTasks.length).toBe(1);
    expect(result.current.state.plannedTasks[0].summary).toBe(
      "New Custom Task",
    );

    act(() => {
      result.current.actions.handleUpdateTaskCard(0, {
        summary: "Custom Updated Title",
        storyPoints: 3,
      });
    });

    expect(result.current.state.plannedTasks[0].summary).toBe(
      "Custom Updated Title",
    );
    expect(result.current.state.plannedTasks[0].storyPoints).toBe(3);

    act(() => {
      result.current.actions.handleRemoveTaskCard(0);
    });

    expect(result.current.state.plannedTasks.length).toBe(0);
  });

  it("calls taskApi.planTasks and populates planned tasks", async () => {
    const mockTasks: JiraTask[] = [
      {
        number: "01",
        summary: "Planned Task via Gemini",
        status: "OPEN",
        parent: "F04-A03",
        storyPoints: 2,
        phase: "Phase 4",
        activity: "Activity 3",
        assign: "me",
        jiraDescription: "Description",
        dod: "DoD checklist",
        implementation: "",
      },
    ];

    vi.mocked(taskApi.planTasks).mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTaskPlannerViewModel());

    act(() => {
      result.current.actions.setUserPrompt("Implement auth feature");
    });

    await act(async () => {
      await result.current.actions.handlePlanTasks("proj-123");
    });

    expect(taskApi.planTasks).toHaveBeenCalledWith(
      "proj-123",
      "Implement auth feature",
    );
    expect(result.current.state.plannedTasks).toEqual(mockTasks);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });
});
