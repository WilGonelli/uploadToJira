import { JiraTask, TaskUploadResult } from "../../domain/entities/JiraTask.js";
import { IJiraService } from "../../domain/services/IJiraService.js";
import { IHistoricalTaskRepository } from "../../domain/repositories/IHistoricalTaskRepository.js";

export interface UploadTasksCommand {
  projectId: string;
  tasks: JiraTask[];
}

export class UploadTasksUseCase {
  constructor(
    private readonly jiraService: IJiraService,
    private readonly historicalRepo: IHistoricalTaskRepository,
  ) {}

  public async execute(command: UploadTasksCommand): Promise<TaskUploadResult> {
    if (!command.tasks || command.tasks.length === 0) {
      throw new Error("No tasks provided for Jira upload");
    }

    const uploadResult = await this.jiraService.uploadTasks(command.tasks);

    // Save successfully uploaded tasks into historical log to prevent duplicate creation
    if (uploadResult.successfulTasks.length > 0) {
      await this.historicalRepo.createBatch(
        uploadResult.successfulTasks.map((t) => ({
          projectId: command.projectId,
          taskNumber: t.number,
          summary: t.summary,
          jiraIssueKey: t.jiraIssueKey || "",
          status: t.status,
          storyPoints: t.storyPoints,
          dod: t.dod,
        })),
      );
    }

    return uploadResult;
  }
}
