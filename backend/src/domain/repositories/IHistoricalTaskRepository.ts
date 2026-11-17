import {
  HistoricalTask,
  CreateHistoricalTaskInput,
} from "../entities/HistoricalTask.js";

/**
 * Interface contract for persisting and retrieving historical tasks to avoid duplication.
 */
export interface IHistoricalTaskRepository {
  findByProjectId(projectId: string): Promise<HistoricalTask[]>;
  create(input: CreateHistoricalTaskInput): Promise<HistoricalTask>;
  createBatch(inputs: CreateHistoricalTaskInput[]): Promise<HistoricalTask[]>;
  isDuplicateSummary(projectId: string, summary: string): Promise<boolean>;
}
