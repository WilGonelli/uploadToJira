import { Request, Response } from "express";
import { ManageProjectUseCase } from "../../application/use-cases/ManageProjectUseCase.js";

export class ProjectController {
  constructor(private readonly manageProjectUC: ManageProjectUseCase) {}

  public async getAllProjects(_req: Request, res: Response): Promise<void> {
    try {
      const projects = await this.manageProjectUC.listProjects();
      res.json({ success: true, data: projects });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.manageProjectUC.getProjectById(req.params.id);
      if (!project) {
        res.status(404).json({ success: false, error: "Project not found" });
        return;
      }
      res.json({ success: true, data: project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, jiraProjectKey, jiraParentKey, rootPath, contextMarkdown } =
        req.body;
      if (!name || !jiraProjectKey || !jiraParentKey) {
        res.status(400).json({
          success: false,
          error:
            "Fields 'name', 'jiraProjectKey', and 'jiraParentKey' are required",
        });
        return;
      }
      const project = await this.manageProjectUC.createProject({
        name,
        jiraProjectKey,
        jiraParentKey,
        rootPath: rootPath || "",
        contextMarkdown: contextMarkdown || "",
      });
      res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.manageProjectUC.updateProject(
        req.params.id,
        req.body,
      );
      if (!project) {
        res.status(404).json({ success: false, error: "Project not found" });
        return;
      }
      res.json({ success: true, data: project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async refineContext(req: Request, res: Response): Promise<void> {
    try {
      const { manualContext, rootPath } = req.body;
      if (typeof rootPath === "string") {
        const autoContext =
          await this.manageProjectUC.autoGenerateContextFromCodebase(
            rootPath.trim(),
          );
        res.json({
          success: true,
          data: { refinedContext: autoContext, isReady: true },
        });
        return;
      }

      if (
        !manualContext ||
        typeof manualContext !== "string" ||
        !manualContext.trim()
      ) {
        res
          .status(400)
          .json({
            success: false,
            error: "Missing 'manualContext' or 'rootPath'",
          });
        return;
      }

      const result = await this.manageProjectUC.refineContextWithAi(
        manualContext.trim(),
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error("[ProjectController] refineContext error:", err);
      res
        .status(500)
        .json({
          success: false,
          error: err.message || "Failed to refine context",
        });
    }
  }
}
