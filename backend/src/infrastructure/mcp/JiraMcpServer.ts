import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { IJiraService } from "../../domain/services/IJiraService.js";
import { IAIService } from "../../domain/services/IAIService.js";
import { ICodebaseScanner } from "../../domain/services/ICodebaseScanner.js";
import { IHistoricalTaskRepository } from "../../domain/repositories/IHistoricalTaskRepository.js";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import { JiraTask } from "../../domain/entities/JiraTask.js";

export interface McpServerDependencies {
  jiraService: IJiraService;
  aiService: IAIService;
  codebaseScanner: ICodebaseScanner;
  projectRepository: IProjectRepository;
  historicalTaskRepository: IHistoricalTaskRepository;
}

export class JiraMcpServer {
  private readonly server: Server;
  private readonly deps: McpServerDependencies;

  constructor(deps: McpServerDependencies) {
    this.deps = deps;
    this.server = new Server(
      {
        name: "jira-ai-orchestrator-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.registerHandlers();
  }

  private registerHandlers(): void {
    // 1. Tool catalog declaration
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "plan_tasks",
          description:
            "Plans Jira tasks adhering to project rules and checking historical tasks to prevent duplicate scopes.",
          inputSchema: {
            type: "object",
            properties: {
              projectId: { type: "string", description: "Target project UUID" },
              userPrompt: {
                type: "string",
                description: "Requirement or feature to decompose",
              },
            },
            required: ["projectId", "userPrompt"],
          },
        },
        {
          name: "upload_tasks_to_jira",
          description:
            "Uploads planned Jira tasks into Jira Cloud and persists them into historical tasks.",
          inputSchema: {
            type: "object",
            properties: {
              projectId: { type: "string", description: "Target project UUID" },
              tasks: {
                type: "array",
                description: "List of validated JiraTask objects to upload",
                items: { type: "object" },
              },
            },
            required: ["projectId", "tasks"],
          },
        },
        {
          name: "get_my_tasks",
          description:
            "Fetches active Jira tasks currently assigned to the authenticated user.",
          inputSchema: {
            type: "object",
            properties: {
              statusCategory: {
                type: "string",
                description: "Filter (default: 'In Progress, To Do')",
              },
              projectKey: {
                type: "string",
                description: "Jira Project Key (e.g. 'IMPCT')",
              },
              maxResults: { type: "number", default: 20 },
            },
          },
        },
        {
          name: "scan_project_codebase",
          description:
            "Scans project repository files and dependencies for context or diff analysis.",
          inputSchema: {
            type: "object",
            properties: {
              rootPath: {
                type: "string",
                description: "Relative or absolute directory path",
              },
            },
            required: ["rootPath"],
          },
        },
        {
          name: "generate_task_comment",
          description:
            "Reads Jira task description and relevant project code files to generate a standardized technical comment.",
          inputSchema: {
            type: "object",
            properties: {
              issueKey: {
                type: "string",
                description: "Jira Issue Key (e.g. 'F04-123')",
              },
              summary: { type: "string", description: "Task summary" },
              jiraDescription: {
                type: "string",
                description: "Task Jira description",
              },
              dod: {
                type: "string",
                description: "Definition of Done checklist",
              },
              rootPath: {
                type: "string",
                description: "Project codebase root path",
              },
              keywords: {
                type: "array",
                items: { type: "string" },
                description: "Keywords to locate modified files",
              },
            },
            required: ["issueKey", "summary"],
          },
        },
        {
          name: "upload_comment_to_jira",
          description:
            "Uploads an approved implementation comment to a Jira issue.",
          inputSchema: {
            type: "object",
            properties: {
              issueKey: { type: "string", description: "Jira issue key" },
              commentMarkdown: {
                type: "string",
                description: "Formatted markdown comment",
              },
            },
            required: ["issueKey", "commentMarkdown"],
          },
        },
      ],
    }));

    // 2. Tool execution handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "plan_tasks": {
            const projectId = String(args?.projectId);
            const userPrompt = String(args?.userPrompt);
            const project =
              await this.deps.projectRepository.findById(projectId);
            if (!project) throw new Error(`Project not found: ${projectId}`);

            const history =
              await this.deps.historicalTaskRepository.findByProjectId(
                projectId,
              );
            const historicalSummaries = history.map((h) => h.summary);

            const tasks = await this.deps.aiService.planTasks({
              userPrompt,
              projectContextMarkdown: project.contextMarkdown,
              historicalTaskSummaries: historicalSummaries,
            });

            return {
              content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
            };
          }

          case "upload_tasks_to_jira": {
            const projectId = String(args?.projectId);
            const tasks = args?.tasks as JiraTask[];
            if (!Array.isArray(tasks) || tasks.length === 0) {
              throw new Error("No tasks provided for upload");
            }

            const uploadResult = await this.deps.jiraService.uploadTasks(tasks);

            // Record successfully created tasks into historical tasks to prevent duplication
            if (uploadResult.successfulTasks.length > 0) {
              await this.deps.historicalTaskRepository.createBatch(
                uploadResult.successfulTasks.map((t) => ({
                  projectId,
                  taskNumber: t.number,
                  summary: t.summary,
                  jiraIssueKey: t.jiraIssueKey || "",
                  status: t.status,
                  storyPoints: t.storyPoints,
                  dod: t.dod,
                })),
              );
            }

            return {
              content: [
                { type: "text", text: JSON.stringify(uploadResult, null, 2) },
              ],
            };
          }

          case "get_my_tasks": {
            const statusCat = args?.statusCategory
              ? String(args.statusCategory)
              : undefined;
            const projectKey = args?.projectKey
              ? String(args.projectKey)
              : undefined;
            const maxResults = args?.maxResults
              ? Number(args.maxResults)
              : undefined;
            const onlyMyTasks = args?.onlyMyTasks !== false;
            const onlyCurrentSprint = args?.onlyCurrentSprint !== false;
            const tasks = await this.deps.jiraService.fetchMyAssignedTasks(
              statusCat,
              maxResults,
              projectKey,
              onlyMyTasks,
              onlyCurrentSprint,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
            };
          }

          case "scan_project_codebase": {
            const rootPath = String(args?.rootPath || "");
            const scanResult =
              await this.deps.codebaseScanner.scanDirectory(rootPath);
            return {
              content: [
                { type: "text", text: JSON.stringify(scanResult, null, 2) },
              ],
            };
          }

          case "generate_task_comment": {
            const issueKey = String(args?.issueKey);
            const summary = String(args?.summary);
            const jiraDescription = String(args?.jiraDescription || "");
            const dod = String(args?.dod || "");
            const rootPath = String(args?.rootPath || "");
            const keywords = Array.isArray(args?.keywords)
              ? (args.keywords as string[])
              : summary.split(" ").filter((w) => w.length > 3);

            const relevantFiles =
              await this.deps.codebaseScanner.findRelevantFiles(
                rootPath,
                keywords,
              );
            const filesContent =
              await this.deps.codebaseScanner.readFilesContent(
                rootPath,
                relevantFiles,
              );

            const codeChangesSummary = Object.entries(filesContent)
              .map(
                ([file, code]) =>
                  `--- File: ${file} ---\n${code.slice(0, 1500)}`,
              )
              .join("\n\n");

            const comment = await this.deps.aiService.generateTaskComment({
              issueKey,
              summary,
              jiraDescription,
              dod,
              codeChangesSummary:
                codeChangesSummary ||
                "Code changes inferred from task summary and context.",
            });

            return {
              content: [
                { type: "text", text: JSON.stringify(comment, null, 2) },
              ],
            };
          }

          case "upload_comment_to_jira": {
            const issueKey = String(args?.issueKey);
            const commentMarkdown = String(args?.commentMarkdown);
            const res = await this.deps.jiraService.addComment(
              issueKey,
              commentMarkdown,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
            };
          }

          default:
            throw new Error(`Unrecognized MCP tool: ${name}`);
        }
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: error.message || String(error) }],
        };
      }
    });
  }

  /**
   * Starts the MCP server on stdio transport for CLI/Agent connection.
   */
  public async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  /**
   * Directly invokes an MCP tool in-process (used by Express HTTP API).
   */
  public async executeTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<any> {
    const handler = (this.server as any)._requestHandlers?.get("tools/call");
    if (!handler) {
      throw new Error("Tool request handler not registered");
    }
    const result = await handler({
      method: "tools/call",
      params: { name: toolName, arguments: args },
    });
    if (result.isError) {
      throw new Error(result.content?.[0]?.text || "Tool execution failed");
    }
    return JSON.parse(result.content[0].text);
  }
}
