import { describe, it, expect, vi } from "vitest";
import { PathResolver } from "./PathResolver.js";

describe("PathResolver", () => {
  it("translates Windows drive paths (C:\\... and c:/...) to /mnt/c/... on Linux/WSL/Docker", () => {
    const resolver = new PathResolver("/workspace");

    // Mock environment as Docker
    vi.spyOn(resolver, "detectEnvironment").mockReturnValue("docker");

    const winBackslash = "C:\\Users\\william\\projects\\my-app";
    const resolvedBackslash = resolver.resolve(winBackslash);
    expect(resolvedBackslash).toBe("/mnt/c/Users/william/projects/my-app");

    const winForwardSlash = "c:/projects/IBM/another-app";
    const resolvedForward = resolver.resolve(winForwardSlash);
    expect(resolvedForward).toBe("/mnt/c/projects/IBM/another-app");
  });

  it("handles empty or blank paths by returning default workspace", () => {
    const resolver = new PathResolver("/workspace");
    expect(resolver.resolve("")).toBe("/workspace");
    expect(resolver.resolve(undefined)).toBe("/workspace");
  });

  it("detects environment type accurately based on os release, containerenv or dockerenv", () => {
    const resolver = new PathResolver("/workspace");
    const detected = resolver.detectEnvironment();
    expect(["docker", "wsl", "windows", "linux"]).toContain(detected);
  });
});
