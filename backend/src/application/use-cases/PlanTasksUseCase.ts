import { JiraTask } from "../../domain/entities/JiraTask.js";
import { IAIService } from "../../domain/services/IAIService.js";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import { IHistoricalTaskRepository } from "../../domain/repositories/IHistoricalTaskRepository.js";

export interface PlanTasksCommand {
  projectId: string;
  userPrompt: string;
}

/**
 * Normalizes task attributes to strictly enforce Jira task creation rules.
 */
export function normalizeJiraTaskAttributes(
  task: JiraTask,
  defaultParentKey: string = "IMPCT-297",
): JiraTask {
  const summaryLower = task.summary.toLowerCase();

  const isTraining =
    summaryLower.includes("treinamento") || summaryLower.includes("training");

  if (isTraining) {
    return {
      ...task,
      parent: "IMPCT-122",
      phase: "",
      activity: "",
      storyPoints: 0.5,
    };
  }

  const isTesting =
    summaryLower.includes("test") ||
    summaryLower.includes("teste") ||
    summaryLower.includes("vitest") ||
    summaryLower.includes("stryker") ||
    summaryLower.includes("mutation") ||
    summaryLower.includes("coverage") ||
    summaryLower.includes("cobertura");

  let description = task.jiraDescription?.trim() || "";
  let dod = task.dod?.trim() || "";

  if (isTesting) {
    if (!description) {
      description = `Implementar e expandir a suíte de testes unitários isolada utilizando Vitest e React Testing Library para cobrir o fluxo funcional de ${task.summary}. Garantir cobertura de cenários de sucesso, respostas de erro, manipulação de estado do hook/ViewModel e renderização semântica acessível.`;
    }
    if (!dod) {
      dod = `1. Suíte de testes criada com Vitest e React Testing Library cobrindo fluxos de sucesso e exceção.\n2. Asserções implementadas consultando elementos exclusivamente por papéis acessíveis (screen.getByRole / getByLabelText).\n3. Testes executando e passando com 100% de sucesso sem quebras de cobertura via npm test.`;
    }
    return {
      ...task,
      parent: "IMPCT-120",
      phase: "4",
      activity: "3",
      storyPoints: 1,
      assign: task.assign || "me",
      jiraDescription: description,
      dod,
    };
  }

  const isDoc =
    summaryLower.includes("doc") ||
    summaryLower.includes("documenta") ||
    summaryLower.includes("readme") ||
    summaryLower.includes("manual");

  if (isDoc) {
    if (!description) {
      description = `Atualizar e consolidar a documentação técnica em Markdown para ${task.summary}. Registrar especificações arquiteturais (MVVM), ciclo de vida, contratos de interface e referências aos arquivos em Docs/ e README.md.`;
    }
    if (!dod) {
      dod = `1. Arquivos de documentação em Docs/ e README.md devidamente atualizados.\n2. Contratos de interface, ViewModels e fluxos explicados em inglês técnico claro.\n3. Referências a endpoints e caminhos de arquivo sincronizados com o repositório.`;
    }
    return {
      ...task,
      parent: "IMPCT-306",
      phase: "5",
      activity: "4",
      storyPoints: 1,
      assign: task.assign || "me",
      jiraDescription: description,
      dod,
    };
  }

  // Development task: enforce valid parent, phase, activity and story points
  const validParent =
    task.parent && task.parent !== "IMPCT-300" && task.parent.trim()
      ? task.parent.trim()
      : defaultParentKey || "IMPCT-297";

  const validPhase =
    task.phase &&
    !["development", "dev", "desenvolvimento", "testing", "test"].includes(
      task.phase.toLowerCase(),
    )
      ? task.phase.trim()
      : "3";

  const validActivity =
    task.activity &&
    !["testing", "test", "development", "dev"].includes(
      task.activity.toLowerCase(),
    )
      ? task.activity.trim()
      : "5";

  const validSp =
    typeof task.storyPoints === "number" &&
    task.storyPoints > 0 &&
    task.storyPoints <= 2
      ? task.storyPoints
      : 2;

  if (!description) {
    description = `Desenvolver e integrar a funcionalidade de ${task.summary} no front-end. Aplicar separação de responsabilidades pelo padrão MVVM (Model, ViewModel e View), estilização via CSS Modules e conformidade rigorosa com acessibilidade WCAG 2.1 AA.`;
  }
  if (!dod) {
    dod = `1. Funcionalidade implementada na camada apropriada (View/ViewModel/Model) sem dependências circulares.\n2. Estilização responsiva estruturada via CSS Modules nativos.\n3. Acessibilidade semântica (rótulos acessíveis, roles e navegação por teclado) validada.`;
  }

  return {
    ...task,
    parent: validParent,
    phase: validPhase,
    activity: validActivity,
    storyPoints: validSp,
    assign: task.assign || "me",
    jiraDescription: description,
    dod,
  };
}

/**
 * Ensures weekly training tasks contain all 3 standard weeks per requested assignee
 * conforming strictly to Rule 3 of TASK_CREATION_RULES.md.
 */
export function ensureWeeklyTrainingTasks(
  tasks: JiraTask[],
  userPrompt: string,
): JiraTask[] {
  const promptLower = userPrompt.toLowerCase();
  const hasTrainingInPrompt =
    promptLower.includes("treinamento") || promptLower.includes("training");

  const trainingTasksInList = tasks.filter((t) => {
    const s = t.summary.toLowerCase();
    return s.includes("treinamento") || s.includes("training");
  });

  if (!hasTrainingInPrompt && trainingTasksInList.length === 0) {
    return tasks;
  }

  const isOnlyIntern =
    promptLower.includes("apenas para o estagiario") ||
    promptLower.includes("somente para o estagiario") ||
    promptLower.includes("apenas para o estagiário") ||
    promptLower.includes("somente para o estagiário");

  const isOnlyJunior =
    promptLower.includes("apenas para mim") ||
    promptLower.includes("somente para mim") ||
    promptLower.includes("apenas para o junior") ||
    promptLower.includes("somente para o junior");

  const wantsJunior =
    !isOnlyIntern &&
    (promptLower.includes("mim") ||
      promptLower.includes("junior") ||
      promptLower.includes("júnior") ||
      promptLower.includes("me") ||
      trainingTasksInList.some((t) => t.assign === "me") ||
      hasTrainingInPrompt);

  const wantsIntern =
    !isOnlyJunior &&
    (promptLower.includes("estagiario") ||
      promptLower.includes("estagiário") ||
      promptLower.includes("nicolas") ||
      trainingTasksInList.some((t) => t.assign.includes("nicolas")) ||
      (!isOnlyJunior &&
        hasTrainingInPrompt &&
        !promptLower.includes("apenas para mim")));

  const assignees: string[] = [];
  if (wantsJunior) assignees.push("me");
  if (wantsIntern) assignees.push("nicolas.santos@fit-tecnologia.org.br");

  // Keep non-training tasks
  const nonTrainingTasks = tasks.filter((t) => {
    const s = t.summary.toLowerCase();
    return !s.includes("treinamento") && !s.includes("training");
  });

  // Generate 3 standard weeks for each target assignee
  const canonicalTrainingTasks: JiraTask[] = [];
  for (const assignee of assignees) {
    for (const week of [1, 2, 3]) {
      canonicalTrainingTasks.push({
        number: "00",
        summary: `Treinamento semanal - Semana ${week}`,
        status: "OPEN",
        parent: "IMPCT-122",
        storyPoints: 0.5,
        phase: "",
        activity: "",
        assign: assignee,
        jiraDescription: "",
        dod: "",
        implementation: "",
      });
    }
  }

  const combined = [...nonTrainingTasks, ...canonicalTrainingTasks];
  return combined.map((t, idx) => ({
    ...t,
    number: String(idx + 1).padStart(2, "0"),
  }));
}

export class PlanTasksUseCase {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly historicalRepo: IHistoricalTaskRepository,
    private readonly aiService: IAIService,
  ) {}

  public async execute(command: PlanTasksCommand): Promise<JiraTask[]> {
    const project = await this.projectRepo.findById(command.projectId);
    if (!project) {
      throw new Error(`Project not found with ID: ${command.projectId}`);
    }

    const history = await this.historicalRepo.findByProjectId(
      command.projectId,
    );
    const historicalSummaries = history.map((h) => h.summary);

    const plannedTasks = await this.aiService.planTasks({
      userPrompt: command.userPrompt,
      projectContextMarkdown: project.contextMarkdown,
      historicalTaskSummaries: historicalSummaries,
    });

    // Strictly normalize Jira attributes to ensure compliance with TASK_CREATION_RULES
    const normalizedTasks = plannedTasks.map((task) =>
      normalizeJiraTaskAttributes(task, project.jiraParentKey),
    );

    // Expand weekly training tasks to the mandatory 3 weeks per person if requested
    return ensureWeeklyTrainingTasks(normalizedTasks, command.userPrompt);
  }
}
