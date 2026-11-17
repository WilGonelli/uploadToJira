import axios, { AxiosInstance } from "axios";
import { JiraTask, TaskUploadResult } from "../../domain/entities/JiraTask.js";
import { CommentUploadResult } from "../../domain/entities/TaskComment.js";
import { IJiraService } from "../../domain/services/IJiraService.js";
import { AdfBuilder } from "./AdfBuilder.js";

export interface JiraServiceConfig {
  domain: string;
  email: string;
  apiToken: string;
  projectKey: string;
  parentKey: string;
  issueType: string;
  storyPointsFieldId?: string;
  phaseFieldId?: string;
  activityFieldId?: string;
  doneTransitionId?: string;
  isDryRun: boolean;
}

export class JiraService implements IJiraService {
  private readonly config: JiraServiceConfig;
  private readonly client: AxiosInstance;
  private currentUserId?: string;

  constructor(config: JiraServiceConfig) {
    this.config = config;
    const authHeader = `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString("base64")}`;

    this.client = axios.create({
      baseURL: config.domain.replace(/\/+$/, ""),
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 25000,
    });
  }

  private async getCurrentUserId(): Promise<string | undefined> {
    if (this.currentUserId) return this.currentUserId;
    try {
      const response = await this.client.get("/rest/api/3/myself");
      this.currentUserId = response.data.accountId;
      return this.currentUserId;
    } catch {
      return undefined;
    }
  }

  private extractAdfText(node: any): string {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (node.text) return node.text;
    if (Array.isArray(node.content)) {
      return node.content
        .map((child: any) => this.extractAdfText(child))
        .filter(Boolean)
        .join(" ");
    }
    return "";
  }

  private extractFieldValue(val: any): string {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && val.value) return String(val.value);
    if (typeof val === "object" && val.name) return String(val.name);
    return String(val);
  }

  private getMockAssignedTasks(projectKey: string): JiraTask[] {
    const pk = projectKey.toUpperCase();
    return [
      {
        number: "01",
        summary: `[SIMULAÇÃO] Implementar componentes acessíveis e interface responsiva (${pk})`,
        status: "In Progress",
        parent: `${pk}-297`,
        storyPoints: 2,
        phase: "Phase 4",
        activity: "Activity 3",
        assign: "me",
        jiraDescription: `Desenvolvimento de componentes acessíveis e interface responsiva para o módulo do projeto ${pk}, respeitando as diretrizes WCAG 2.1 AA.`,
        dod: "1. Componentes semânticos implementados\n2. Suporte total a navegação por teclado\n3. Testes unitários com RTL adicionados",
        implementation: "",
        jiraIssueKey: `${pk}-101`,
        jiraIssueUrl: `${this.config.domain}/browse/${pk}-101`,
      },
      {
        number: "02",
        summary: `[SIMULAÇÃO] Criar camada de ViewModel e regras de negócio (${pk})`,
        status: "Code Review",
        parent: `${pk}-297`,
        storyPoints: 2,
        phase: "Phase 4",
        activity: "Activity 3",
        assign: "me",
        jiraDescription: `Implementação dos hooks de ViewModel, orquestração de estados de carregamento, erro e dados na integração com a API.`,
        dod: "1. Hook useViewModel isolado de JSX\n2. Validações de entrada estritamente tipadas\n3. Testes de hook com renderHook cobrindo cenários de sucesso e falha",
        implementation: "",
        jiraIssueKey: `${pk}-102`,
        jiraIssueUrl: `${this.config.domain}/browse/${pk}-102`,
      },
      {
        number: "03",
        summary: `[SIMULAÇÃO] Criar suíte de testes unitários automatizados (${pk})`,
        status: "Open",
        parent: "IMPCT-120",
        storyPoints: 1,
        phase: "Phase 4",
        activity: "Activity 5",
        assign: "me",
        jiraDescription: `Desenvolvimento de testes automatizados com Vitest e Testing Library cobrindo 100% dos fluxos críticos do projeto ${pk}.`,
        dod: "1. Testes de renderização acessível (getByRole)\n2. Testes de comportamento e disparo de eventos de usuário\n3. Execução dos testes via vitest sem falhas",
        implementation: "",
        jiraIssueKey: `${pk}-103`,
        jiraIssueUrl: `${this.config.domain}/browse/${pk}-103`,
      },
      {
        number: "04",
        summary: `[SIMULAÇÃO] Atualizar documentação técnica e diagramas (${pk})`,
        status: "Done",
        parent: "IMPCT-306",
        storyPoints: 1,
        phase: "Phase 4",
        activity: "Activity 3",
        assign: "me",
        jiraDescription: `Atualização de diagramas arquiteturais em Mermaid, documentação TSDoc e guia de execução da API no projeto ${pk}.`,
        dod: "1. Documentação técnica atualizada em inglês\n2. TSDoc completo nos módulos exportados\n3. Diagramas de arquitetura atualizados",
        implementation: "",
        jiraIssueKey: `${pk}-104`,
        jiraIssueUrl: `${this.config.domain}/browse/${pk}-104`,
      },
    ];
  }

  public async fetchMyAssignedTasks(
    statusCategory: string = "In Progress, To Do",
    maxResults: number = 25,
    projectKey?: string,
    onlyMyTasks: boolean = true,
    onlyCurrentSprint: boolean = true,
  ): Promise<JiraTask[]> {
    const effectiveProjectKey =
      projectKey?.trim() || this.config.projectKey || "IMPCT";

    // In dry-run mode, attempt live Jira fetch first if configured;
    // if authentication fails (e.g. 401) or network is down, gracefully fallback to rich simulation tasks
    if (this.config.isDryRun) {
      try {
        const liveTasks = await this.queryJiraTasks(
          statusCategory,
          maxResults,
          projectKey,
          onlyMyTasks,
          onlyCurrentSprint,
        );
        if (liveTasks.length > 0) return liveTasks;
      } catch (err: any) {
        console.warn(
          `[JiraService] Dry-run fallback: unable to query Jira (${err.message}). Returning simulation tasks for project ${effectiveProjectKey}.`,
        );
        return this.getMockAssignedTasks(effectiveProjectKey);
      }
      return this.getMockAssignedTasks(effectiveProjectKey);
    }

    return await this.queryJiraTasks(
      statusCategory,
      maxResults,
      projectKey,
      onlyMyTasks,
      onlyCurrentSprint,
    );
  }

  private async queryJiraTasks(
    statusCategory: string = "In Progress, To Do",
    maxResults: number = 25,
    projectKey?: string,
    onlyMyTasks: boolean = true,
    onlyCurrentSprint: boolean = true,
  ): Promise<JiraTask[]> {
    const clauses: string[] = [];

    if (onlyCurrentSprint !== false) {
      clauses.push("sprint in openSprints()");
    }

    if (onlyMyTasks !== false) {
      if (this.config.email) {
        clauses.push(
          `(assignee = currentUser() OR assignee = "${this.config.email}")`,
        );
      } else {
        clauses.push("assignee = currentUser()");
      }
    }

    const cleanProjectKey = projectKey?.trim();
    if (cleanProjectKey) {
      clauses.push(`project = "${cleanProjectKey}"`);
    }

    if (
      statusCategory &&
      statusCategory.trim() &&
      statusCategory.trim().toLowerCase() !== "all"
    ) {
      const categories = statusCategory
        .split(",")
        .map((s) => `"${s.trim()}"`)
        .filter((s) => s.length > 2)
        .join(",");
      if (categories) {
        clauses.push(`statusCategory in (${categories})`);
      }
    }

    const jql =
      clauses.length > 0
        ? `${clauses.join(" AND ")} ORDER BY updated DESC`
        : "ORDER BY updated DESC";

    const searchFields = [
      "summary",
      "status",
      "parent",
      "description",
      "assignee",
    ];
    if (this.config.storyPointsFieldId)
      searchFields.push(this.config.storyPointsFieldId);
    else searchFields.push("customfield_10002", "customfield_10028");
    if (this.config.phaseFieldId) searchFields.push(this.config.phaseFieldId);
    if (this.config.activityFieldId)
      searchFields.push(this.config.activityFieldId);

    try {
      const response = await this.client.post("/rest/api/3/search/jql", {
        jql,
        maxResults,
        fields: searchFields,
      });

      const issues = response.data.issues || [];
      return issues.map((issue: any, index: number) => {
        const descText = this.extractAdfText(issue.fields.description);
        let jiraDescription = descText;
        let dod = "";

        const dodMatch = descText.search(/Definition of Done\s*\(DoD\)\s*:?/i);
        if (dodMatch !== -1) {
          jiraDescription = descText
            .slice(0, dodMatch)
            .replace(/Descrição da Task\s*:?/i, "")
            .trim();
          dod = descText
            .slice(dodMatch)
            .replace(/Definition of Done\s*\(DoD\)\s*:?/i, "")
            .trim();
        } else {
          jiraDescription = descText
            .replace(/Descrição da Task\s*:?/i, "")
            .trim();
        }

        const rawSp = this.config.storyPointsFieldId
          ? issue.fields[this.config.storyPointsFieldId]
          : (issue.fields.customfield_10002 ?? issue.fields.customfield_10028);
        const storyPoints =
          typeof rawSp === "number" ? rawSp : parseFloat(rawSp) || 1;

        const phaseVal = this.config.phaseFieldId
          ? this.extractFieldValue(issue.fields[this.config.phaseFieldId])
          : "";
        const activityVal = this.config.activityFieldId
          ? this.extractFieldValue(issue.fields[this.config.activityFieldId])
          : "";

        const statusName = issue.fields.status?.name || "Open";

        return {
          number: String(index + 1).padStart(2, "0"),
          summary: issue.fields.summary || "Untitled Task",
          status: statusName,
          parent: issue.fields.parent?.key || this.config.parentKey,
          storyPoints,
          phase: phaseVal,
          activity: activityVal,
          assign:
            issue.fields.assignee?.displayName ||
            issue.fields.assignee?.emailAddress ||
            "me",
          jiraDescription,
          dod,
          implementation: "",
          jiraIssueKey: issue.key,
          jiraIssueUrl: `${this.config.domain}/browse/${issue.key}`,
        };
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        throw new Error(
          "Falha de autenticação no Jira Cloud (HTTP 401 Unauthorized): O token JIRA_API_TOKEN ou e-mail configurado no backend/.env é inválido ou expirou. Por favor, gere um novo token de API em https://id.atlassian.com/manage-profile/security/api-tokens e atualize o arquivo backend/.env.",
        );
      }
      if (err.response?.status === 400) {
        const errorMsgs = err.response.data?.errorMessages?.join(", ") || "";
        throw new Error(
          `Erro no filtro do Jira (HTTP 400 Bad Request): ${errorMsgs || "JQL inválido. Verifique se o projeto '" + (cleanProjectKey || "") + "' existe e se a categoria de status é válida."}`,
        );
      }
      if (err.response?.status === 403) {
        throw new Error(
          "Acesso negado no Jira (HTTP 403 Forbidden): O usuário não possui permissão para visualizar tarefas neste projeto.",
        );
      }
      throw new Error(
        `Falha ao comunicar com o Jira (${err.message}). Verifique a URL do domínio (${this.config.domain}) e sua conexão de rede.`,
      );
    }
  }

  public async createIssue(
    task: JiraTask,
  ): Promise<{ issueKey: string; issueUrl: string }> {
    if (this.config.isDryRun) {
      const mockKey = `DRY-${Math.floor(Math.random() * 900) + 100}`;
      return {
        issueKey: mockKey,
        issueUrl: `${this.config.domain}/browse/${mockKey}`,
      };
    }

    const adfDescription = AdfBuilder.buildIssueDescription(
      task.jiraDescription,
      task.dod,
      task.implementation,
    );

    // Resolve project key dynamically from task.parent (e.g. "IMPCT-297" -> "IMPCT") or fallback
    const resolvedProjectKey =
      task.parent && task.parent.includes("-")
        ? task.parent.split("-")[0]
        : this.config.projectKey || "IMPCT";

    const fields: Record<string, unknown> = {
      project: { key: resolvedProjectKey },
      summary: task.summary,
      issuetype: { name: this.config.issueType || "Task" },
      description: adfDescription,
    };

    if (task.parent || this.config.parentKey) {
      fields.parent = { key: task.parent || this.config.parentKey };
    }

    if (this.config.storyPointsFieldId && task.storyPoints) {
      fields[this.config.storyPointsFieldId] = task.storyPoints;
    }

    if (this.config.phaseFieldId && task.phase) {
      fields[this.config.phaseFieldId] = { value: task.phase };
    }

    if (this.config.activityFieldId && task.activity) {
      fields[this.config.activityFieldId] = { value: task.activity };
    }

    const currentAccountId = await this.getCurrentUserId();
    if (currentAccountId) {
      fields.assignee = { accountId: currentAccountId };
    }

    const response = await this.client.post("/rest/api/3/issue", { fields });
    const issueKey = response.data.key;
    const issueUrl = `${this.config.domain}/browse/${issueKey}`;

    if (
      task.status === "DONE" ||
      task.status?.toUpperCase() === "DONE" ||
      task.status?.toUpperCase() === "CONCLUÍDO"
    ) {
      await this.transitionToDone(issueKey);
    }

    return { issueKey, issueUrl };
  }

  public async uploadTasks(tasks: JiraTask[]): Promise<TaskUploadResult> {
    const successfulTasks: JiraTask[] = [];
    const failedTasks: Array<{ task: JiraTask; error: string }> = [];

    for (const task of tasks) {
      try {
        const result = await this.createIssue(task);
        successfulTasks.push({
          ...task,
          jiraIssueKey: result.issueKey,
          jiraIssueUrl: result.issueUrl,
        });
      } catch (err: any) {
        failedTasks.push({
          task,
          error: err.response?.data?.errorMessages?.join(", ") || err.message,
        });
      }
    }

    return {
      totalTasks: tasks.length,
      successfulTasks,
      failedTasks,
      isDryRun: this.config.isDryRun,
    };
  }

  public async addComment(
    issueKey: string,
    commentMarkdown: string,
  ): Promise<CommentUploadResult> {
    if (this.config.isDryRun) {
      return {
        commentId: "dry-run-comment-id",
        issueKey,
        created: new Date().toISOString(),
        author: "Dry Run User",
      };
    }

    const adfBody = AdfBuilder.buildCommentDocument(commentMarkdown);
    const response = await this.client.post(
      `/rest/api/3/issue/${issueKey}/comment`,
      {
        body: adfBody,
      },
    );

    return {
      commentId: response.data.id,
      issueKey,
      created: response.data.created,
      author: response.data.author?.displayName || "System",
    };
  }

  public async transitionToDone(issueKey: string): Promise<boolean> {
    if (this.config.isDryRun) return true;

    try {
      const transitionsRes = await this.client.get(
        `/rest/api/3/issue/${issueKey}/transitions`,
      );
      const transitions = transitionsRes.data.transitions || [];

      let transitionId = this.config.doneTransitionId;
      if (!transitionId) {
        const doneTransition = transitions.find(
          (t: any) =>
            t.to?.statusCategory?.name?.toUpperCase() === "DONE" ||
            t.name?.toUpperCase().includes("DONE") ||
            t.name?.toUpperCase().includes("CONCLU"),
        );
        transitionId = doneTransition?.id;
      }

      if (!transitionId) return false;

      await this.client.post(`/rest/api/3/issue/${issueKey}/transitions`, {
        transition: { id: transitionId },
      });
      return true;
    } catch {
      return false;
    }
  }
}
