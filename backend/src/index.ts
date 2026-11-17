import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { loadConfig } from "./config/index.js";
import { SqliteDatabase } from "./infrastructure/database/SqliteDatabase.js";
import { SqliteProjectRepository } from "./infrastructure/database/SqliteProjectRepository.js";
import { SqliteHistoricalTaskRepository } from "./infrastructure/database/SqliteHistoricalTaskRepository.js";
import { JiraService } from "./infrastructure/jira/JiraService.js";
import { GeminiService } from "./infrastructure/gemini/GeminiService.js";
import { CodebaseScanner } from "./infrastructure/scanner/CodebaseScanner.js";
import { JiraMcpServer } from "./infrastructure/mcp/JiraMcpServer.js";
import { PlanTasksUseCase } from "./application/use-cases/PlanTasksUseCase.js";
import { UploadTasksUseCase } from "./application/use-cases/UploadTasksUseCase.js";
import { GetMyTasksUseCase } from "./application/use-cases/GetMyTasksUseCase.js";
import { GenerateCommentUseCase } from "./application/use-cases/GenerateCommentUseCase.js";
import { UploadCommentUseCase } from "./application/use-cases/UploadCommentUseCase.js";
import { ManageProjectUseCase } from "./application/use-cases/ManageProjectUseCase.js";
import { ProjectController } from "./interfaces/http/projectController.js";
import { TaskController } from "./interfaces/http/taskController.js";
import { CommentController } from "./interfaces/http/commentController.js";
import { createApiRouter } from "./interfaces/http/routes.js";

async function bootstrap() {
  const config = loadConfig();

  // 1. Initialize Database & Repositories
  const database = new SqliteDatabase(config.databasePath);
  const projectRepo = new SqliteProjectRepository(database.getDatabase());
  const historicalRepo = new SqliteHistoricalTaskRepository(
    database.getDatabase(),
  );

  // Load default engineering context from docs if available
  const defaultContextPath = path.resolve(
    process.cwd(),
    "Docs/examples/project-context.md",
  );
  let defaultContext = "";
  try {
    if (fs.existsSync(defaultContextPath)) {
      defaultContext = fs.readFileSync(defaultContextPath, "utf-8");
    }
  } catch {
    defaultContext = "";
  }

  // Auto-seed default project if database is freshly created or populate context
  const existingProjects = await projectRepo.findAll();
  if (existingProjects.length === 0) {
    const defaultProjectKey = config.jira.projectKey || "IMPCT";
    const defaultParentKey = config.jira.parentKey || "IMPCT-297";
    await projectRepo.create({
      name: `Projeto Principal (${defaultProjectKey})`,
      jiraProjectKey: defaultProjectKey,
      jiraParentKey: defaultParentKey,
      rootPath: config.workspaceRootPath || "",
      contextMarkdown: defaultContext,
    });
    console.log(
      `🌱 Initialized default project (${defaultProjectKey} / ${defaultParentKey}) with project context`,
    );
  } else if (!existingProjects[0].contextMarkdown && defaultContext) {
    await projectRepo.update(existingProjects[0].id, {
      contextMarkdown: defaultContext,
    });
    console.log(
      `🌱 Updated empty context in project ${existingProjects[0].name}`,
    );
  }

  // 2. Initialize Infrastructure Services
  const jiraService = new JiraService({
    domain: config.jira.domain,
    email: config.jira.email,
    apiToken: config.jira.apiToken,
    projectKey: config.jira.projectKey,
    parentKey: config.jira.parentKey,
    issueType: config.jira.issueType,
    storyPointsFieldId: config.jira.storyPointsFieldId,
    phaseFieldId: config.jira.phaseFieldId,
    activityFieldId: config.jira.activityFieldId,
    doneTransitionId: config.jira.doneTransitionId,
    isDryRun: config.jira.isDryRun,
  });

  const aiService = new GeminiService(
    config.gemini.apiKey,
    config.gemini.model,
  );
  const codebaseScanner = new CodebaseScanner(config.workspaceRootPath);

  // 3. Initialize Model Context Protocol (MCP) Server
  const mcpServer = new JiraMcpServer({
    jiraService,
    aiService,
    codebaseScanner,
    projectRepository: projectRepo,
    historicalTaskRepository: historicalRepo,
  });

  // If running with --mcp-stdio, attach directly to standard I/O
  if (process.argv.includes("--mcp-stdio")) {
    await mcpServer.startStdio();
    console.log("Jira MCP Server running on stdio transport.");
    return;
  }

  // 4. Initialize Use Cases
  const planTasksUC = new PlanTasksUseCase(
    projectRepo,
    historicalRepo,
    aiService,
  );
  const uploadTasksUC = new UploadTasksUseCase(jiraService, historicalRepo);
  const getMyTasksUC = new GetMyTasksUseCase(jiraService);
  const generateCommentUC = new GenerateCommentUseCase(
    aiService,
    codebaseScanner,
  );
  const uploadCommentUC = new UploadCommentUseCase(jiraService);
  const manageProjectUC = new ManageProjectUseCase(
    projectRepo,
    aiService,
    codebaseScanner,
  );

  // 5. Initialize Controllers and Router
  const projectController = new ProjectController(manageProjectUC);
  const taskController = new TaskController(
    planTasksUC,
    uploadTasksUC,
    getMyTasksUC,
  );
  const commentController = new CommentController(
    generateCommentUC,
    uploadCommentUC,
  );

  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "5mb" }));

  const apiRouter = createApiRouter(
    projectController,
    taskController,
    commentController,
  );
  app.use("/api", apiRouter);

  // Fallback error handler
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("Internal Server Error:", err);
      res
        .status(500)
        .json({
          success: false,
          error: err.message || "Internal server error",
        });
    },
  );

  const server = app.listen(config.port, () => {
    console.log(
      `🚀 Jira AI Backend & MCP Server listening on http://localhost:${config.port}`,
    );
    console.log(`📁 Database path: ${config.databasePath}`);
    console.log(`🤖 Gemini model: ${config.gemini.model}`);
    console.log(`🌐 Jira target: ${config.jira.domain || "Not configured"}`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      try {
        database.close();
      } catch (err) {
        console.error("Error closing database:", err);
      }
      console.log("Backend server closed cleanly.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
