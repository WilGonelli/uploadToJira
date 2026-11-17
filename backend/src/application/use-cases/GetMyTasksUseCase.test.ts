import { describe, it, expect, vi } from "vitest";
import { GetMyTasksUseCase } from "./GetMyTasksUseCase.js";
import { IJiraService } from "../../domain/services/IJiraService.js";
import { JiraTask } from "../../domain/entities/JiraTask.js";

describe("GetMyTasksUseCase", () => {
  const mockTasks: JiraTask[] = [
    {
      number: "01",
      summary: "Implement authentication",
      status: "OPEN",
      parent: "IMPCT-297",
      storyPoints: 2,
      phase: "Phase 4",
      activity: "Activity 3",
      assign: "me",
      jiraDescription: "Description",
      dod: "DoD",
      implementation: "",
      jiraIssueKey: "IMPCT-101",
      jiraIssueUrl: "https://fit-tecnologia.atlassian.net/browse/IMPCT-101",
    },
  ];

  const mockJiraService: IJiraService = {
    fetchMyAssignedTasks: vi.fn().mockResolvedValue(mockTasks),
    createIssue: vi.fn(),
    uploadTasks: vi.fn(),
    addComment: vi.fn(),
    transitionToDone: vi.fn(),
  };

  it("delegates to JiraService with correct parameters", async () => {
    const useCase = new GetMyTasksUseCase(mockJiraService);
    const result = await useCase.execute(
      "In Progress",
      15,
      "IMPCT",
      true,
      true,
    );

    expect(mockJiraService.fetchMyAssignedTasks).toHaveBeenCalledWith(
      "In Progress",
      15,
      "IMPCT",
      true,
      true,
    );
    expect(result).toEqual(mockTasks);
  });

  it("works with default parameters", async () => {
    const useCase = new GetMyTasksUseCase(mockJiraService);
    const result = await useCase.execute();

    expect(mockJiraService.fetchMyAssignedTasks).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    expect(result).toHaveLength(1);
  });
});
