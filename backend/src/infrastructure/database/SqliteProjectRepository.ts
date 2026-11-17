import crypto from "crypto";
import Database from "better-sqlite3";
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../../domain/entities/Project.js";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";

interface ProjectRow {
  id: string;
  name: string;
  jira_project_key: string;
  jira_parent_key: string;
  root_path: string;
  context_markdown: string;
  created_at: string;
  updated_at: string;
}

export class SqliteProjectRepository implements IProjectRepository {
  private readonly db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  private mapRowToEntity(row: ProjectRow): Project {
    return {
      id: row.id,
      name: row.name,
      jiraProjectKey: row.jira_project_key,
      jiraParentKey: row.jira_parent_key,
      rootPath: row.root_path,
      contextMarkdown: row.context_markdown,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public async findById(id: string): Promise<Project | null> {
    const stmt = this.db.prepare("SELECT * FROM projects WHERE id = ?");
    const row = stmt.get(id) as ProjectRow | undefined;
    return row ? this.mapRowToEntity(row) : null;
  }

  public async findAll(): Promise<Project[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM projects ORDER BY updated_at DESC",
    );
    const rows = stmt.all() as ProjectRow[];
    return rows.map((row) => this.mapRowToEntity(row));
  }

  public async create(input: CreateProjectInput): Promise<Project> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO projects (
        id, name, jira_project_key, jira_parent_key, root_path, context_markdown, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.name,
      input.jiraProjectKey,
      input.jiraParentKey,
      input.rootPath || "",
      input.contextMarkdown || "",
      now,
      now,
    );

    return {
      id,
      name: input.name,
      jiraProjectKey: input.jiraProjectKey,
      jiraParentKey: input.jiraParentKey,
      rootPath: input.rootPath || "",
      contextMarkdown: input.contextMarkdown || "",
      createdAt: now,
      updatedAt: now,
    };
  }

  public async update(
    id: string,
    input: UpdateProjectInput,
  ): Promise<Project | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const name = input.name ?? existing.name;
    const jiraProjectKey = input.jiraProjectKey ?? existing.jiraProjectKey;
    const jiraParentKey = input.jiraParentKey ?? existing.jiraParentKey;
    const rootPath = input.rootPath ?? existing.rootPath;
    const contextMarkdown = input.contextMarkdown ?? existing.contextMarkdown;

    const stmt = this.db.prepare(`
      UPDATE projects SET
        name = ?,
        jira_project_key = ?,
        jira_parent_key = ?,
        root_path = ?,
        context_markdown = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      name,
      jiraProjectKey,
      jiraParentKey,
      rootPath,
      contextMarkdown,
      now,
      id,
    );

    return {
      id,
      name,
      jiraProjectKey,
      jiraParentKey,
      rootPath,
      contextMarkdown,
      createdAt: existing.createdAt,
      updatedAt: now,
    };
  }

  public async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM projects WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
