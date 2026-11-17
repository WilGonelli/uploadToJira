import { Request, Response } from "express";
import { PlanTasksUseCase } from "../../application/use-cases/PlanTasksUseCase.js";
import { UploadTasksUseCase } from "../../application/use-cases/UploadTasksUseCase.js";
import { GetMyTasksUseCase } from "../../application/use-cases/GetMyTasksUseCase.js";

export class TaskController {
  constructor(
    private readonly planTasksUC: PlanTasksUseCase,
    private readonly uploadTasksUC: UploadTasksUseCase,
    private readonly getMyTasksUC: GetMyTasksUseCase,
  ) {}

  public async planTasks(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userPrompt } = req.body;
      if (!projectId || !userPrompt) {
        res.status(400).json({
          success: false,
          error: "Fields 'projectId' and 'userPrompt' are required",
        });
        return;
      }
      const tasks = await this.planTasksUC.execute({ projectId, userPrompt });
      res.json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async uploadTasks(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, tasks } = req.body;
      if (!projectId || !Array.isArray(tasks) || tasks.length === 0) {
        res.status(400).json({
          success: false,
          error:
            "Fields 'projectId' and a non-empty 'tasks' array are required",
        });
        return;
      }
      const result = await this.uploadTasksUC.execute({ projectId, tasks });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getMyTasks(req: Request, res: Response): Promise<void> {
    try {
      const statusCategory = req.query.statusCategory as string | undefined;
      const projectKey = req.query.projectKey as string | undefined;
      const maxResults = req.query.maxResults
        ? parseInt(req.query.maxResults as string, 10)
        : undefined;
      const onlyMyTasks = req.query.onlyMyTasks === "false" ? false : true;
      const onlyCurrentSprint =
        req.query.onlyCurrentSprint === "false" ? false : true;
      const tasks = await this.getMyTasksUC.execute(
        statusCategory,
        maxResults,
        projectKey,
        onlyMyTasks,
        onlyCurrentSprint,
      );
      res.json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
