import fs from "fs";
import path from "path";
import {
  ICodebaseScanner,
  CodebaseScanResult,
} from "../../domain/services/ICodebaseScanner.js";
import { PathResolver } from "./PathResolver.js";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
  ".vscode",
  ".idea",
  "data",
]);

export class CodebaseScanner implements ICodebaseScanner {
  private readonly rootWorkspace: string;
  private readonly pathResolver: PathResolver;

  constructor(rootWorkspace: string = "/workspace") {
    this.rootWorkspace = path.resolve(rootWorkspace);
    this.pathResolver = new PathResolver(this.rootWorkspace);
  }

  private resolveSafePath(targetPath: string): string {
    return this.pathResolver.resolve(targetPath);
  }

  private walkDirectory(dir: string, maxFiles: number = 300): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const queue: string[] = [dir];

    while (queue.length > 0 && results.length < maxFiles) {
      const currentDir = queue.shift()!;
      try {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) {
            continue;
          }
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            queue.push(fullPath);
          } else if (entry.isFile()) {
            const relPath = path.relative(dir, fullPath).replace(/\\/g, "/");
            results.push(relPath);
            if (results.length >= maxFiles) break;
          }
        }
      } catch {
        // Skip unreadable directories
      }
    }
    return results;
  }

  public async scanDirectory(
    relativeOrAbsolutePath: string,
  ): Promise<CodebaseScanResult> {
    const dir = this.resolveSafePath(relativeOrAbsolutePath);
    const files = this.walkDirectory(dir);

    let dependencies: Record<string, string> = {};
    let projectType = "Generic / Unknown";

    const packageJsonPath = path.join(dir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        dependencies = {
          ...(content.dependencies || {}),
          ...(content.devDependencies || {}),
        };
        projectType = "Node.js / TypeScript / Web";
      } catch {
        // Ignored
      }
    }

    const summary = `Found ${files.length} project files. Project type: ${projectType}. Main key dependencies: ${Object.keys(
      dependencies,
    )
      .slice(0, 10)
      .join(", ")}`;

    return {
      rootPath: dir,
      files,
      dependencies,
      projectType,
      summary,
    };
  }

  public async findRelevantFiles(
    relativeOrAbsolutePath: string,
    keywords: string[],
  ): Promise<string[]> {
    const dir = this.resolveSafePath(relativeOrAbsolutePath);
    const files = this.walkDirectory(dir);
    const lowerKeywords = keywords.map((k) => k.toLowerCase());

    return files.filter((file) => {
      const lowerFile = file.toLowerCase();
      return lowerKeywords.some((k) => lowerFile.includes(k));
    });
  }

  public async readFilesContent(
    rootPath: string,
    filePaths: string[],
  ): Promise<Record<string, string>> {
    const dir = this.resolveSafePath(rootPath);
    const result: Record<string, string> = {};

    for (const relPath of filePaths.slice(0, 10)) {
      const fullPath = path.join(dir, relPath);
      if (fs.existsSync(fullPath)) {
        try {
          const stats = fs.statSync(fullPath);
          if (stats.size < 50000) {
            // max 50KB per file to avoid prompt overflow
            result[relPath] = fs.readFileSync(fullPath, "utf-8");
          } else {
            result[relPath] =
              `[File content truncated - Size ${stats.size} bytes]`;
          }
        } catch {
          result[relPath] = "[Error reading file]";
        }
      }
    }

    return result;
  }
}
