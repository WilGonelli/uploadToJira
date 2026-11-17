import crypto from "crypto";
import Database from "better-sqlite3";
import {
  HistoricalTask,
  CreateHistoricalTaskInput,
} from "../../domain/entities/HistoricalTask.js";
import { IHistoricalTaskRepository } from "../../domain/repositories/IHistoricalTaskRepository.js";

interface HistoricalTaskRow {
  id: string;
  project_id: string;
  task_number: string;
  summary: string;
  jira_issue_key: string;
  status: string;
  story_points: number;
  dod: string;
  uploaded_at: string;
}

export class SqliteHistoricalTaskRepository implements IHistoricalTaskRepository {
  private readonly db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  private mapRowToEntity(row: HistoricalTaskRow): HistoricalTask {
    return {
      id: row.id,
      projectId: row.project_id,
      taskNumber: row.task_number,
      summary: row.summary,
      jiraIssueKey: row.jira_issue_key,
      status: row.status,
      storyPoints: row.story_points,
      dod: row.dod,
      uploadedAt: row.uploaded_at,
    };
  }

  public async findByProjectId(projectId: string): Promise<HistoricalTask[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM historical_tasks WHERE project_id = ? ORDER BY uploaded_at DESC",
    );
    const rows = stmt.all(projectId) as HistoricalTaskRow[];
    return rows.map((row) => this.mapRowToEntity(row));
  }

  public async create(
    input: CreateHistoricalTaskInput,
  ): Promise<HistoricalTask> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO historical_tasks (
        id, project_id, task_number, summary, jira_issue_key, status, story_points, dod, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.projectId,
      input.taskNumber,
      input.summary,
      input.jiraIssueKey,
      input.status,
      input.storyPoints,
      input.dod,
      now,
    );

    return {
      id,
      projectId: input.projectId,
      taskNumber: input.taskNumber,
      summary: input.summary,
      jiraIssueKey: input.jiraIssueKey,
      status: input.status,
      storyPoints: input.storyPoints,
      dod: input.dod,
      uploadedAt: now,
    };
  }

  public async createBatch(
    inputs: CreateHistoricalTaskInput[],
  ): Promise<HistoricalTask[]> {
    const insertTransaction = this.db.transaction(
      (items: CreateHistoricalTaskInput[]) => {
        const results: HistoricalTask[] = [];
        const stmt = this.db.prepare(`
        INSERT INTO historical_tasks (
          id, project_id, task_number, summary, jira_issue_key, status, story_points, dod, uploaded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

        for (const item of items) {
          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          stmt.run(
            id,
            item.projectId,
            item.taskNumber,
            item.summary,
            item.jiraIssueKey,
            item.status,
            item.storyPoints,
            item.dod,
            now,
          );
          results.push({
            id,
            projectId: item.projectId,
            taskNumber: item.taskNumber,
            summary: item.summary,
            jiraIssueKey: item.jiraIssueKey,
            status: item.status,
            storyPoints: item.storyPoints,
            dod: item.dod,
            uploadedAt: now,
          });
        }
        return results;
      },
    );

    return insertTransaction(inputs);
  }

  public async isDuplicateSummary(
    projectId: string,
    summary: string,
  ): Promise<boolean> {
    const normalized = summary.trim().toLowerCase();
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM historical_tasks WHERE project_id = ? AND LOWER(TRIM(summary)) = ?",
    );
    const row = stmt.get(projectId, normalized) as { count: number };
    return row.count > 0;
  }
}
