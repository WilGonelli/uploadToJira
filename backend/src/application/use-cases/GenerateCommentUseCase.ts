import { TaskComment } from "../../domain/entities/TaskComment.js";
import { IAIService } from "../../domain/services/IAIService.js";
import { ICodebaseScanner } from "../../domain/services/ICodebaseScanner.js";

export interface GenerateCommentCommand {
  issueKey: string;
  summary: string;
  jiraDescription?: string;
  dod?: string;
  rootPath?: string;
  keywords?: string[];
}

export class GenerateCommentUseCase {
  constructor(
    private readonly aiService: IAIService,
    private readonly codebaseScanner: ICodebaseScanner,
  ) {}

  public async execute(command: GenerateCommentCommand): Promise<TaskComment> {
    const rootPath = command.rootPath || "";
    const keywords =
      command.keywords && command.keywords.length > 0
        ? command.keywords
        : command.summary.split(/\s+/).filter((w) => w.length > 3);

    const relevantFiles = await this.codebaseScanner.findRelevantFiles(
      rootPath,
      keywords,
    );
    const filesContent = await this.codebaseScanner.readFilesContent(
      rootPath,
      relevantFiles,
    );

    const codeChangesSummary = Object.entries(filesContent)
      .map(
        ([filePath, content]) =>
          `--- File: ${filePath} ---\n${content.slice(0, 1500)}`,
      )
      .join("\n\n");

    return this.aiService.generateTaskComment({
      issueKey: command.issueKey,
      summary: command.summary,
      jiraDescription: command.jiraDescription || "",
      dod: command.dod || "",
      codeChangesSummary:
        codeChangesSummary ||
        "Code changes inferred from task summary and project context.",
    });
  }
}
