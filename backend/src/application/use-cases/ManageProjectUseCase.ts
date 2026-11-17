import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../../domain/entities/Project.js";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import { IAIService } from "../../domain/services/IAIService.js";
import { ICodebaseScanner } from "../../domain/services/ICodebaseScanner.js";

export class ManageProjectUseCase {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly aiService: IAIService,
    private readonly codebaseScanner: ICodebaseScanner,
  ) {}

  public async listProjects(): Promise<Project[]> {
    return this.projectRepo.findAll();
  }

  public async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepo.findById(id);
  }

  public async createProject(input: CreateProjectInput): Promise<Project> {
    return this.projectRepo.create(input);
  }

  public async updateProject(
    id: string,
    input: UpdateProjectInput,
  ): Promise<Project | null> {
    return this.projectRepo.update(id, input);
  }

  public async deleteProject(id: string): Promise<boolean> {
    return this.projectRepo.delete(id);
  }

  public async autoGenerateContextFromCodebase(
    rootPath: string,
  ): Promise<string> {
    const scan = await this.codebaseScanner.scanDirectory(rootPath);
    const sampleFiles = scan.files.slice(0, 40).join("\n- ");
    const prompt = `Based on the following project codebase scan, generate a comprehensive project context document:
Project Root: ${scan.rootPath}
Project Type: ${scan.projectType}
Total Files: ${scan.files.length}
Key Dependencies: ${JSON.stringify(scan.dependencies, null, 2)}
Sample File Hierarchy:
- ${sampleFiles}

Include comprehensive Markdown sections for:
1. Executive Summary & Purpose
2. Tech Stack & Key Libraries
3. Architecture Overview & Folder Conventions
4. Jira Conventions (Phase, Activity, default Story Points)
5. Quality, Testing & Contribution Guidelines`;

    const refined = await this.aiService.refineProjectContext(prompt);
    return refined.refinedContext;
  }

  public async refineContextWithAi(manualContext: string) {
    return this.aiService.refineProjectContext(manualContext);
  }
}
