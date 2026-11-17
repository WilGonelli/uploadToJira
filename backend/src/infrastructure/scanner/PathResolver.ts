import fs from "fs";
import path from "path";
import os from "os";

export type RuntimeEnvironment = "docker" | "wsl" | "windows" | "linux";

/**
 * Intelligent cross-platform path resolver for hybrid Windows / WSL / Docker setups.
 */
export class PathResolver {
  private readonly defaultWorkspace: string;

  constructor(defaultWorkspace: string = "/workspace") {
    this.defaultWorkspace = defaultWorkspace;
  }

  /**
   * Detects the runtime environment in which Node.js is currently executing.
   */
  public detectEnvironment(): RuntimeEnvironment {
    // 1. Check for standard container indicators (Podman creates /.containerenv, Docker creates /.dockerenv)
    if (fs.existsSync("/.containerenv") || fs.existsSync("/.dockerenv")) {
      return "docker";
    }

    // 2. Check for native Windows
    if (process.platform === "win32") {
      return "windows";
    }

    // 3. Check for WSL (Windows Subsystem for Linux)
    if (process.platform === "linux") {
      const release = os.release().toLowerCase();
      if (release.includes("microsoft") || release.includes("wsl")) {
        return "wsl";
      }
      return "linux";
    }

    return "linux";
  }

  /**
   * Translates any Windows or Linux/WSL path into the actual path accessible in the current runtime.
   *
   * Examples:
   * - In Docker/WSL: 'C:\\Users\\john\\project' -> '/mnt/c/Users/john/project'
   * - In Windows: '/mnt/c/Users/john/project' -> 'C:/Users/john/project'
   * - Relative path 'my-project' -> '/workspace/my-project' or '<cwd>/my-project'
   */
  public resolve(inputPath: string | undefined): string {
    if (!inputPath || !inputPath.trim()) {
      return this.defaultWorkspace;
    }

    let clean = inputPath.trim().replace(/^["']|["']$/g, "");
    const env = this.detectEnvironment();

    // Check for Windows Drive pattern (e.g. C:\ or c:/ or D:\)
    const winDriveMatch = clean.match(/^([a-zA-Z]):[\\/](.*)$/);

    if (winDriveMatch) {
      const driveLetter = winDriveMatch[1].toLowerCase();
      const relativePart = winDriveMatch[2].replace(/\\/g, "/");

      if (env === "docker" || env === "wsl" || env === "linux") {
        // Map to standard WSL/Docker mount point: /mnt/<drive>/<path>
        const mntPath = `/mnt/${driveLetter}/${relativePart}`;
        if (fs.existsSync(mntPath)) {
          return mntPath;
        }

        // Check if mapped inside container workspace fallback
        const workspaceCandidate = path.join(
          this.defaultWorkspace,
          path.basename(clean),
        );
        if (fs.existsSync(workspaceCandidate)) {
          return workspaceCandidate;
        }

        return mntPath;
      }

      // In native Windows, normalize path
      return path.resolve(`${driveLetter.toUpperCase()}:/${relativePart}`);
    }

    // Check for WSL /mnt/<drive> pattern on native Windows
    const wslDriveMatch = clean.match(/^\/mnt\/([a-zA-Z])\/(.*)$/);
    if (wslDriveMatch && env === "windows") {
      const driveLetter = wslDriveMatch[1].toUpperCase();
      const relativePart = wslDriveMatch[2].replace(/\//g, "\\");
      return path.resolve(`${driveLetter}:\\${relativePart}`);
    }

    // Relative path resolution
    if (!path.isAbsolute(clean)) {
      const fromWorkspace = path.resolve(this.defaultWorkspace, clean);
      if (fs.existsSync(fromWorkspace)) return fromWorkspace;

      const fromCwd = path.resolve(process.cwd(), clean);
      if (fs.existsSync(fromCwd)) return fromCwd;

      return fromWorkspace;
    }

    return path.resolve(clean);
  }
}
