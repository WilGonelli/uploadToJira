import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

/**
 * Manages the SQLite database connection and table migrations.
 */
export class SqliteDatabase {
  private db: Database.Database;

  constructor(dbPath: string) {
    const resolvedPath = path.resolve(dbPath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(resolvedPath);
    this.configurePragmas();
    this.runMigrations();
  }

  private configurePragmas(): void {
    // Enable Write-Ahead Logging for high concurrency and foreign keys
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  private runMigrations(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        jira_project_key TEXT NOT NULL,
        jira_parent_key TEXT NOT NULL,
        root_path TEXT NOT NULL DEFAULT '',
        context_markdown TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS historical_tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        task_number TEXT NOT NULL,
        summary TEXT NOT NULL,
        jira_issue_key TEXT NOT NULL,
        status TEXT NOT NULL,
        story_points REAL NOT NULL DEFAULT 1,
        dod TEXT NOT NULL DEFAULT '',
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_historical_tasks_project 
      ON historical_tasks(project_id);

      CREATE INDEX IF NOT EXISTS idx_historical_tasks_summary 
      ON historical_tasks(project_id, summary);
    `);
  }

  /**
   * Returns the underlying better-sqlite3 database instance.
   */
  public getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Closes the database connection.
   */
  public close(): void {
    this.db.close();
  }
}
