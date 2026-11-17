import { describe, it, expect, vi } from "vitest";
import { UploadTasksUseCase } from "./UploadTasksUseCase.js";
import { IJiraService } from "../../domain/services/IJiraService.js";
import { IHistoricalTaskRepository } from "../../domain/repositories/IHistoricalTaskRepository.js";
import { JiraTask } from "../../domain/entities/JiraTask.js";

describe("UploadTasksUseCase", () => {
  const mockTasks: JiraTask[] = [
    {
      number: "01",
      summary: "Task 1",
      status: "Code Review",
      parent: "IMPCT-297",
      storyPoints: 2,
      phase: "Phase 4",
      activity: "Activity 3",
      assign: "me",
      jiraDescription: "Desc",
      dod: "DoD",
      implementation: "",
      jiraIssueKey: "IMPCT-101",
      jiraIssueUrl: "https://fit-tecnologia.atlassian.net/browse/IMPCT-101",
    },
  ];

  it("uploads tasks and records successful ones in historical repository", async () => {
    const mockJiraService: IJiraService = {
      fetchMyAssignedTasks: vi.fn(),
      createIssue: vi.fn(),
      uploadTasks: vi.fn().mockResolvedValue({
        totalTasks: 1,
        successfulTasks: mockTasks,
        failedTasks: [],
        isDryRun: false,
      }),
      addComment: vi.fn(),
      transitionToDone: vi.fn(),
    };

    const mockHistoricalRepo: IHistoricalTaskRepository = {
      findByProjectId: vi.fn(),
      create: vi.fn(),
      createBatch: vi.fn().mockResolvedValue([]),
      isDuplicateSummary: vi.fn(),
    };

    const useCase = new UploadTasksUseCase(mockJiraService, mockHistoricalRepo);
    const result = await useCase.execute({
      projectId: "proj-1",
      tasks: mockTasks,
    });

    expect(mockJiraService.uploadTasks).toHaveBeenCalledWith(mockTasks);
    expect(mockHistoricalRepo.createBatch).toHaveBeenCalledWith([
      {
        projectId: "proj-1",
        taskNumber: "01",
        summary: "Task 1",
        jiraIssueKey: "IMPCT-101",
        status: "Code Review",
        storyPoints: 2,
        dod: "DoD",
      },
    ]);
    expect(result.successfulTasks).toHaveLength(1);
  });

  it("throws error if no tasks are provided", async () => {
    const mockJiraService = {} as IJiraService;
    const mockHistoricalRepo = {} as IHistoricalTaskRepository;
    const useCase = new UploadTasksUseCase(mockJiraService, mockHistoricalRepo);

    await expect(
      useCase.execute({ projectId: "proj-1", tasks: [] }),
    ).rejects.toThrow("No tasks provided for Jira upload");
  });
});
