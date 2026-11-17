import { JiraTask } from "../../domain/entities/JiraTask.js";
import { IJiraService } from "../../domain/services/IJiraService.js";

export class GetMyTasksUseCase {
  constructor(private readonly jiraService: IJiraService) {}

  public async execute(
    statusCategory?: string,
    maxResults?: number,
    projectKey?: string,
    onlyMyTasks?: boolean,
    onlyCurrentSprint?: boolean,
  ): Promise<JiraTask[]> {
    return this.jiraService.fetchMyAssignedTasks(
      statusCategory,
      maxResults,
      projectKey,
      onlyMyTasks,
      onlyCurrentSprint,
    );
  }
}
