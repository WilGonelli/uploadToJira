import { describe, it, expect, vi } from "vitest";
import {
  PlanTasksUseCase,
  normalizeJiraTaskAttributes,
  ensureWeeklyTrainingTasks,
} from "./PlanTasksUseCase.js";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import { IHistoricalTaskRepository } from "../../domain/repositories/IHistoricalTaskRepository.js";
import { IAIService } from "../../domain/services/IAIService.js";
import { JiraTask } from "../../domain/entities/JiraTask.js";

describe("PlanTasksUseCase", () => {
  it("fetches historical tasks to prevent duplication and executes AI planning", async () => {
    const mockProject = {
      id: "proj-1",
      name: "Portal",
      jiraProjectKey: "F04",
      jiraParentKey: "F04-A03",
      rootPath: "workspace/portal",
      contextMarkdown: "React + TS stack",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    };

    const mockProjectRepo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue(mockProject),
      findAll: vi.fn().mockResolvedValue([mockProject]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const mockHistoricalRepo: IHistoricalTaskRepository = {
      findByProjectId: vi.fn().mockResolvedValue([
        {
          id: "hist-1",
          projectId: "proj-1",
          taskNumber: "01",
          summary: "Initial Auth Setup",
          jiraIssueKey: "F04-100",
          status: "DONE",
          storyPoints: 1,
          dod: "Auth working",
          uploadedAt: "2026-01-02",
        },
      ]),
      create: vi.fn(),
      createBatch: vi.fn(),
      isDuplicateSummary: vi.fn(),
    };

    const mockPlannedTask: JiraTask = {
      number: "02",
      summary: "Add Filter Persistence",
      status: "OPEN",
      parent: "",
      storyPoints: 2,
      phase: "Phase 4",
      activity: "Activity 3",
      assign: "me",
      jiraDescription: "Store filter in sessionStorage",
      dod: "1. Store added",
      implementation: "",
    };

    const mockAiService: IAIService = {
      planTasks: vi.fn().mockResolvedValue([mockPlannedTask]),
      refineProjectContext: vi.fn(),
      generateTaskComment: vi.fn(),
    };

    const useCase = new PlanTasksUseCase(
      mockProjectRepo,
      mockHistoricalRepo,
      mockAiService,
    );

    const result = await useCase.execute({
      projectId: "proj-1",
      userPrompt: "Please plan task for filter persistence",
    });

    expect(mockProjectRepo.findById).toHaveBeenCalledWith("proj-1");
    expect(mockHistoricalRepo.findByProjectId).toHaveBeenCalledWith("proj-1");
    expect(mockAiService.planTasks).toHaveBeenCalledWith({
      userPrompt: "Please plan task for filter persistence",
      projectContextMarkdown: mockProject.contextMarkdown,
      historicalTaskSummaries: ["Initial Auth Setup"],
    });

    expect(result.length).toBe(1);
    expect(result[0].summary).toBe("Add Filter Persistence");
    expect(result[0].parent).toBe("F04-A03");
  });

  describe("normalizeJiraTaskAttributes", () => {
    it("correctly normalizes unit and component testing tasks", () => {
      const task: JiraTask = {
        number: "01",
        summary: "Update Unit and Component Tests for React 19 and Vitest",
        status: "OPEN",
        parent: "IMPCT-300", // invalid hallucinated parent
        storyPoints: 3, // wrong SP for tests
        phase: "Development", // wrong string
        activity: "Testing", // wrong string
        assign: "me",
        jiraDescription: "Description",
        dod: "DoD",
        implementation: "",
      };

      const normalized = normalizeJiraTaskAttributes(task);

      expect(normalized.parent).toBe("IMPCT-120");
      expect(normalized.phase).toBe("4");
      expect(normalized.activity).toBe("3");
      expect(normalized.storyPoints).toBe(1);
    });

    it("correctly normalizes technical documentation tasks", () => {
      const task: JiraTask = {
        number: "02",
        summary: "Update Architecture Documentation in Docs/",
        status: "OPEN",
        parent: "",
        storyPoints: 2,
        phase: "",
        activity: "",
        assign: "me",
        jiraDescription: "Docs update",
        dod: "DoD",
        implementation: "",
      };

      const normalized = normalizeJiraTaskAttributes(task);

      expect(normalized.parent).toBe("IMPCT-306");
      expect(normalized.phase).toBe("5");
      expect(normalized.activity).toBe("4");
      expect(normalized.storyPoints).toBe(1);
    });

    it("correctly normalizes weekly training tasks", () => {
      const task: JiraTask = {
        number: "03",
        summary: "Treinamento semanal - Semana 1",
        status: "OPEN",
        parent: "",
        storyPoints: 1,
        phase: "Phase 4",
        activity: "Activity 3",
        assign: "me",
        jiraDescription: "",
        dod: "",
        implementation: "",
      };

      const normalized = normalizeJiraTaskAttributes(task);

      expect(normalized.parent).toBe("IMPCT-122");
      expect(normalized.phase).toBe("");
      expect(normalized.activity).toBe("");
      expect(normalized.storyPoints).toBe(0.5);
    });

    it("correctly normalizes front-end development tasks", () => {
      const task: JiraTask = {
        number: "04",
        summary: "Implement User Profile Settings Form",
        status: "OPEN",
        parent: "IMPCT-300", // hallucinated
        storyPoints: 0, // invalid
        phase: "Development",
        activity: "Development",
        assign: "me",
        jiraDescription: "Profile view",
        dod: "DoD",
        implementation: "",
      };

      const normalized = normalizeJiraTaskAttributes(task, "IMPCT-297");

      expect(normalized.parent).toBe("IMPCT-297");
      expect(normalized.phase).toBe("3");
      expect(normalized.activity).toBe("5");
      expect(normalized.storyPoints).toBe(2);
    });

    it("synthesizes technical description and DoD when omitted by AI", () => {
      const task: JiraTask = {
        number: "05",
        summary: "Atualizar testes unitários para os fluxos de autenticação",
        status: "OPEN",
        parent: "",
        storyPoints: 1,
        phase: "",
        activity: "",
        assign: "me",
        jiraDescription: "",
        dod: "",
        implementation: "",
      };

      const normalized = normalizeJiraTaskAttributes(task);

      expect(normalized.jiraDescription).toContain(
        "Atualizar testes unitários para os fluxos de autenticação",
      );
      expect(normalized.dod).toContain("1.");
      expect(normalized.dod).toContain("npm test");
    });
  });

  describe("ensureWeeklyTrainingTasks", () => {
    it("expands incomplete training tasks to all 3 weeks for both junior and intern", () => {
      // Incomplete tasks returned by AI (e.g. only Semana 1 for each)
      const rawAiTasks: JiraTask[] = [
        {
          number: "01",
          summary: "Treinamento semanal - Semana 1",
          status: "OPEN",
          parent: "IMPCT-122",
          storyPoints: 0.5,
          phase: "",
          activity: "",
          assign: "me",
          jiraDescription: "",
          dod: "",
          implementation: "",
        },
        {
          number: "02",
          summary: "Treinamento semanal - Semana 1",
          status: "OPEN",
          parent: "IMPCT-122",
          storyPoints: 0.5,
          phase: "",
          activity: "",
          assign: "nicolas.santos@fit-tecnologia.org.br",
          jiraDescription: "",
          dod: "",
          implementation: "",
        },
      ];

      const result = ensureWeeklyTrainingTasks(
        rawAiTasks,
        "gerar as tasks padrão de treinamento semanal para mim e para o estagiario",
      );

      // Must generate exactly 6 tasks
      expect(result.length).toBe(6);

      // Junior tasks (Semana 1, 2, 3)
      const juniorTasks = result.filter((t) => t.assign === "me");
      expect(juniorTasks.length).toBe(3);
      expect(juniorTasks.map((t) => t.summary)).toEqual([
        "Treinamento semanal - Semana 1",
        "Treinamento semanal - Semana 2",
        "Treinamento semanal - Semana 3",
      ]);
      expect(
        juniorTasks.every(
          (t) => t.parent === "IMPCT-122" && t.storyPoints === 0.5,
        ),
      ).toBe(true);

      // Intern tasks (Semana 1, 2, 3)
      const internTasks = result.filter(
        (t) => t.assign === "nicolas.santos@fit-tecnologia.org.br",
      );
      expect(internTasks.length).toBe(3);
      expect(internTasks.map((t) => t.summary)).toEqual([
        "Treinamento semanal - Semana 1",
        "Treinamento semanal - Semana 2",
        "Treinamento semanal - Semana 3",
      ]);
      expect(
        internTasks.every(
          (t) => t.parent === "IMPCT-122" && t.storyPoints === 0.5,
        ),
      ).toBe(true);
    });

    it("generates 3 weeks when requested only for junior", () => {
      const result = ensureWeeklyTrainingTasks(
        [],
        "gerar as tasks de treinamento semanal apenas para mim",
      );

      expect(result.length).toBe(3);
      expect(result.every((t) => t.assign === "me")).toBe(true);
      expect(result.map((t) => t.summary)).toEqual([
        "Treinamento semanal - Semana 1",
        "Treinamento semanal - Semana 2",
        "Treinamento semanal - Semana 3",
      ]);
    });
  });
});
