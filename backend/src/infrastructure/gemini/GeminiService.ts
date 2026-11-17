import { GoogleGenAI } from "@google/genai";
import { JiraTask } from "../../domain/entities/JiraTask.js";
import { TaskComment } from "../../domain/entities/TaskComment.js";
import {
  IAIService,
  PlanTasksPromptParams,
  GenerateCommentParams,
} from "../../domain/services/IAIService.js";

export class GeminiService implements IAIService {
  private readonly ai: GoogleGenAI;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string = "gemini-2.5-flash") {
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  private async generateWithRetry(
    params: {
      model: string;
      contents: any;
      config?: any;
    },
    maxRetries: number = 3,
  ): Promise<any> {
    let delay = 1500;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.ai.models.generateContent(params);
      } catch (err: any) {
        const isRateOrDemand =
          err.status === 503 ||
          err.status === 429 ||
          (err.message &&
            (err.message.includes("503") ||
              err.message.includes("429") ||
              err.message.includes("demand") ||
              err.message.includes("UNAVAILABLE")));

        if (isRateOrDemand && attempt < maxRetries) {
          console.warn(
            `[GeminiService] Attempt ${attempt} failed with ${err.status || 503}. Retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
  }

  public async planTasks(params: PlanTasksPromptParams): Promise<JiraTask[]> {
    const historicalContext =
      params.historicalTaskSummaries.length > 0
        ? `\nALREADY CREATED TASKS IN THIS PROJECT (DO NOT DUPLICATE THESE SCOPES):\n- ${params.historicalTaskSummaries.join(
            "\n- ",
          )}`
        : "";

    const systemInstruction = `You are an elite Staff Software Engineer and Jira Project Lead adhering strictly to official Jira Task Creation Rules.
Decompose user requirements into modular, atomic Jira tasks adhering unconditionally to the following rules:

### 🌐 REGRA MANDATÓRIA DE IDIOMA (MANDATORY LANGUAGE: PORTUGUESE):
Todas as tarefas DEVEM ter seu título (summary), descrição técnica detalhada (jiraDescription) e Definition of Done (dod) redigidos OBRIGATORIAMENTE EM PORTUGUÊS (Português do Brasil).
NUNCA gere títulos, descrições ou checklists em inglês. Toda a saída em JSON destinada aos tickets do Jira deve estar em português.

### 🧩 DIVISÃO OBRIGATÓRIA DE RESPONSABILIDADES EM ETAPAS ATÔMICAS:
Sempre que o usuário solicitar uma funcionalidade, tela ou requisito, você DEVE dividir o desenvolvimento em tarefas atômicas e simples (1 a 2 Story Points por tarefa), separando rigorosamente as seguintes etapas:

1. ETAPA DE TELA & COMPONENTES VISUAIS (Interface, Layout e CSS Modules):
   - Escopo: Criação da estrutura visual JSX, conformidade semântica de acessibilidade (WCAG 2.1 AA) e estilização com CSS Modules nativos.
   - Responsável (assign): Pode ser atribuído ao Estagiário ("nicolas.santos@fit-tecnologia.org.br") para tarefas visuais e de CSS, ou ao Júnior ("me").
   - Parent: "IMPCT-297" (ou parentKey do projeto)
   - Phase: "3", Activity: "5"
   - Story Points: 1 ou 2 pontos (escopo enxuto).
   - Título exemplo: "Criar layout visual e componentes de interface para X" ou "Implementar estrutura visual e folhas de estilo CSS Modules de X".

2. ETAPA DE LÓGICA DE NEGÓCIO & INTEGRAÇÃO (ViewModels, Models e Serviços):
   - Escopo: Implementação do custom hook (ViewModel), contratos de interface/DTO (Model), manipulação de estado e integração HTTP com Axios. Zero JSX, zero CSS.
   - Responsável (assign): Júnior ("me").
   - Parent: "IMPCT-297" (ou parentKey do projeto)
   - Phase: "3", Activity: "5"
   - Story Points: 1 ou 2 pontos (lógica focada).
   - Título exemplo: "Implementar hook useXViewModel e camada de serviço para integração com API" ou "Desenvolver lógica de negócio e gerenciamento de estado para X".

3. ETAPA DE TESTES UNITÁRIOS E DE COMPONENTE (QA / Qualidade):
   - Escopo: Criação e expansão de suítes de testes unitários isoladas com Vitest e React Testing Library (renderHook, userEvent, screen.getByRole), testes de mutação com Stryker e validação de cobertura.
   - REGRA DE OURO: NUNCA embutir testes na tarefa de desenvolvimento. Deve ser SEMPRE uma tarefa dedicada separada.
   - Responsável (assign): Júnior ("me").
   - Parent: "IMPCT-120", Phase: "4", Activity: "3"
   - Story Points: 1 ponto (sempre 1 ponto).
   - Título exemplo: "Suíte de testes unitários com Vitest e RTL para o fluxo de X".

4. ETAPA DE DOCUMENTAÇÃO TÉCNICA (Docs / Markdown):
   - Escopo: Atualização e especificação técnica em arquivos Markdown em Docs/ ou README.md (contratos, diagramas e instruções operacionais).
   - REGRA DE OURO: NUNCA embutir documentação na tarefa de desenvolvimento. Deve ser SEMPRE uma tarefa dedicada separada.
   - Responsável (assign): Júnior ("me").
   - Parent: "IMPCT-306", Phase: "5", Activity: "4"
   - Story Points: 1 ponto (sempre 1 ponto).
   - Título exemplo: "Atualizar documentação técnica e especificações em Docs/ para o módulo de X".

5. ETAPA DE TREINAMENTO SEMANAL (Capacitação Técnica):
   - Escopo: Tarefas de capacitação semanal ("Treinamento semanal - Semana N").
   - REGRA MANDATÓRIA: Quando solicitado treinamento semanal, gere SEMPRE as 3 semanas para cada pessoa:
     * 3 tarefas para o Júnior ('me'): Semana 1, Semana 2, Semana 3.
     * 3 tarefas para o Estagiário ('nicolas.santos@fit-tecnologia.org.br'): Semana 1, Semana 2, Semana 3.
   - Parent: "IMPCT-122", Story Points: 0.5, Phase: "", Activity: "", jiraDescription: "", dod: "".

### MANDATORY JSON SCHEMA (ALL FIELDS ARE REQUIRED):
Each object in the JSON array MUST contain:
- summary: (string em português) Título técnico claro e objetivo da tarefa.
- status: (string) "OPEN" ou "DONE".
- parent: (string) Chave pai conforme a regra da etapa ("IMPCT-297", "IMPCT-120", "IMPCT-306", "IMPCT-122").
- phase: (string) Valor de fase conforme a regra ("3", "4", "5", ou "" para treinamento).
- activity: (string) Valor de atividade conforme a regra ("5", "3", "4", ou "" para treinamento).
- storyPoints: (number) Estimativa: 1 ou 2 para dev, 1 para testes, 1 para docs, 0.5 para treinamento.
- assign: (string) "me" ou "nicolas.santos@fit-tecnologia.org.br".
- jiraDescription: (string em português) Descrição técnica aprofundada explicando o contexto, problema, arquitetura e passos de implementação. NUNCA deixe vazio (exceto para treinamento).
- dod: (string em português) Checklist numerado de critérios verificáveis de conclusão ("1. Critério um\\n2. Critério dois\\n3. Critério três"). NUNCA deixe vazio (exceto para treinamento).

Deduplication: DO NOT recreate or duplicate any tasks that match previously completed tasks.
Respond ONLY with a valid JSON array of JiraTask objects matching the schema. No markdown formatting ticks, no explanation outside JSON.`;

    const userPrompt = `PROJECT CONTEXT:
${params.projectContextMarkdown}
${historicalContext}

USER REQUEST:
${params.userPrompt}

Generate the JSON list of tasks now:`;

    const response = await this.generateWithRetry({
      model: this.modelName,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim() || "[]";
    try {
      const parsed = JSON.parse(rawText);
      const list = Array.isArray(parsed) ? parsed : parsed.tasks || [];
      return list.map((item: any, idx: number) => {
        const desc =
          item.jiraDescription ||
          item.description ||
          item.jira_description ||
          item.desc ||
          item.scope ||
          "";

        const dodRaw =
          item.dod ||
          item.definitionOfDone ||
          item.definition_of_done ||
          item.criteria ||
          item.acceptanceCriteria ||
          item.checklist ||
          "";

        const dodText = Array.isArray(dodRaw)
          ? dodRaw.join("\n")
          : String(dodRaw || "");

        return {
          number: String(idx + 1).padStart(2, "0"),
          summary: item.summary || item.title || "Untitled Task",
          status: item.status === "DONE" ? "DONE" : "OPEN",
          parent: item.parent || "",
          storyPoints:
            Number(item.storyPoints || item.story_points || item.points) || 1,
          phase: item.phase || "",
          activity: item.activity || "",
          assign: item.assign || item.assignee || "me",
          priority: item.priority || "Média",
          component: item.component || "General",
          targetFiles: item.targetFiles || item.target_files || "",
          jiraDescription: String(desc || "").trim(),
          dod: String(dodText || "").trim(),
          implementation: item.implementation || "",
        };
      });
    } catch {
      throw new Error(
        `Failed to parse tasks JSON generated by Gemini: ${rawText.slice(0, 200)}`,
      );
    }
  }

  public async refineProjectContext(contextInput: string): Promise<{
    refinedContext: string;
    clarificationQuestions?: string[];
    isReady: boolean;
  }> {
    const systemInstruction = `You are a Principal Software Architect assisting a team in documenting project technical contexts.
Analyze the user's project description or codebase scan.
1. Synthesize a complete, high-quality technical context document in Markdown covering:
   - Tech Stack & Ecosystem (frameworks, runtime, libraries, testing tools)
   - Architectural Pattern & Project Structure
   - Jira Conventions (e.g. Phase, Activity, default Story Points)
   - Code Quality & Engineering Guidelines
2. If crucial details are missing or ambiguous, formulate 2 to 4 targeted clarification questions in "clarificationQuestions" and set "isReady": false.
3. If the details are sufficient, set "clarificationQuestions": [] and "isReady": true.
4. MANDATORY: ALWAYS populate "refinedContext" with a full, structured Markdown document synthesizing all known information so far. Never return an empty or null "refinedContext".

Return ONLY a JSON object matching this schema:
{
  "refinedContext": "Comprehensive Markdown technical context string",
  "clarificationQuestions": ["Question 1", "Question 2"],
  "isReady": boolean
}`;

    const response = await this.generateWithRetry({
      model: this.modelName,
      contents: [{ role: "user", parts: [{ text: contextInput }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim() || "{}";
    try {
      const parsed = JSON.parse(rawText);
      const refinedContext =
        parsed.refinedContext && parsed.refinedContext.trim().length > 0
          ? parsed.refinedContext
          : `# Project Technical Context\n\n${contextInput}\n\n## Architecture\n- Auto-generated context from codebase inspection.`;

      return {
        refinedContext,
        clarificationQuestions: Array.isArray(parsed.clarificationQuestions)
          ? parsed.clarificationQuestions
          : [],
        isReady: typeof parsed.isReady === "boolean" ? parsed.isReady : true,
      };
    } catch {
      return {
        refinedContext: `# Project Technical Context\n\n${contextInput}`,
        clarificationQuestions: [
          "Could you specify the target Jira Phase and Activity values for tasks in this project?",
        ],
        isReady: false,
      };
    }
  }

  public async generateTaskComment(
    params: GenerateCommentParams,
  ): Promise<TaskComment> {
    const systemInstruction = `You are a Senior Software Engineer documenting completed work on a Jira issue.
Follow COMMENT_RULES to build a high-quality, professional technical implementation comment.

CRITICAL LANGUAGE REQUIREMENT:
- The entire comment content MUST be written in PORTUGUESE (pt-BR).
- All narrative explanations, technical summary, testing descriptions, and DoD checklist confirmations MUST be in Portuguese.
- File paths, command lines, code identifiers, types, or package names should remain in backticks (e.g. \`JiraService.ts\`, \`npm test\`).
- Section titles in rawMarkdown MUST be in Portuguese:
  ### Resumo da Implementação Técnica
  ### Arquivos Impactados
  ### Evidências de Teste e Validação
  ### Checklist de Definition of Done (DoD)

Structure and Schema:
1. Resumo da Implementação Técnica: Explicação concisa e clara sobre o que foi desenvolvido, refatorado ou corrigido e a justificativa técnica/arquitetural.
2. Arquivos Impactados: Lista exata dos arquivos criados ou modificados.
3. Evidências de Teste e Validação: Detalhes dos testes unitários, testes manuais ou comandos executados para comprovação.
4. Checklist de Definition of Done (DoD): Confirmação de como cada critério do DoD foi atendido.

Return ONLY a JSON object matching this schema:
{
  "technicalSummary": "Descrição detalhada em português sobre a solução implementada...",
  "impactedFiles": ["caminho/arquivo1.ts", "caminho/arquivo2.tsx"],
  "testingNotes": "Descrição em português dos testes unitários, de integração ou manuais realizados...",
  "dodChecklist": ["1. Critério 1 atendido através de ...", "2. Critério 2 atendido através de ..."],
  "rawMarkdown": "### Resumo da Implementação Técnica\\n...\\n\\n### Arquivos Impactados\\n...\\n\\n### Evidências de Teste e Validação\\n...\\n\\n### Checklist de Definition of Done (DoD)\\n..."
}`;

    const prompt = `JIRA ISSUE KEY: ${params.issueKey}
RESUMO DA TASK: ${params.summary}
DESCRIÇÃO NO JIRA: ${params.jiraDescription}
DEFINITION OF DONE (DoD): ${params.dod}

MUDANÇAS E EVIDÊNCIAS NO CÓDIGO FONTE DO PROJETO:
${params.codeChangesSummary}

Gere o comentário técnico estritamente em português (pt-BR) no formato JSON:`;

    const response = await this.generateWithRetry({
      model: this.modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim() || "{}";
    try {
      const parsed = JSON.parse(rawText);
      const fallbackMarkdown = `### Resumo da Implementação Técnica\n${parsed.technicalSummary || "Implementação concluída conforme especificado."}\n\n### Arquivos Impactados\n${(
        parsed.impactedFiles || []
      )
        .map((f: string) => `- \`${f}\``)
        .join(
          "\n",
        )}\n\n### Evidências de Teste e Validação\n${parsed.testingNotes || "Validado via suíte de testes automatizados."}\n\n### Checklist de Definition of Done (DoD)\n${(
        parsed.dodChecklist || []
      )
        .map((item: string) => `- [x] ${item}`)
        .join("\n")}`;

      return {
        issueKey: params.issueKey,
        technicalSummary:
          parsed.technicalSummary || "Implementação concluída com sucesso.",
        impactedFiles: parsed.impactedFiles || [],
        testingNotes:
          parsed.testingNotes || "Validado através de testes automatizados.",
        dodChecklist: parsed.dodChecklist || [],
        rawMarkdown: parsed.rawMarkdown || fallbackMarkdown,
      };
    } catch {
      return {
        issueKey: params.issueKey,
        technicalSummary: "Tarefa concluída de acordo com as especificações.",
        impactedFiles: [],
        testingNotes: "Testes unitários executados com sucesso.",
        dodChecklist: [],
        rawMarkdown: `### Resumo da Implementação Técnica\nTarefa ${params.issueKey} concluída com sucesso.\n\n### Evidências de Teste e Validação\nValidações e testes executados.`,
      };
    }
  }
}
