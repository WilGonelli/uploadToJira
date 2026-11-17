import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjectContextViewModel } from "./useProjectContextViewModel.js";
import * as projectApi from "../api/projectApi.js";

vi.mock("../api/projectApi.js");

describe("useProjectContextViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectApi.fetchProjects).mockResolvedValue([
      {
        id: "proj-1",
        name: "Test Project",
        jiraProjectKey: "TEST",
        jiraParentKey: "TEST-1",
        rootPath: "/test",
        contextMarkdown: "# Context",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ]);
  });

  it("should initialize with default state and load projects", async () => {
    const { result } = renderHook(() => useProjectContextViewModel());

    expect(result.current.state.isScanning).toBe(false);
    expect(result.current.state.scanStepMessage).toBe("");

    await act(async () => {});

    expect(result.current.state.projects).toHaveLength(1);
    expect(result.current.state.selectedProject?.id).toBe("proj-1");
  });

  it("should update isScanning and scanStepMessage during autoGenerateContext", async () => {
    vi.mocked(projectApi.refineProjectContext).mockImplementation(async () => {
      return {
        refinedContext: "Generated Architecture Context",
        isReady: true,
      };
    });

    const { result } = renderHook(() => useProjectContextViewModel());
    await act(async () => {});

    let promise: Promise<void>;
    act(() => {
      promise = result.current.actions.autoGenerateContext("/app");
    });

    expect(result.current.state.isScanning).toBe(true);
    expect(result.current.state.scanStepMessage).toContain(
      "Inspecting repository",
    );

    await act(async () => {
      await promise;
    });

    expect(result.current.state.isScanning).toBe(false);
    expect(result.current.state.scanStepMessage).toBe("");
    expect(result.current.state.refinedContextDraft).toBe(
      "Generated Architecture Context",
    );
    expect(result.current.state.isContextReady).toBe(true);

    act(() => {
      result.current.actions.setDraft("Updated draft manually");
    });
    expect(result.current.state.refinedContextDraft).toBe(
      "Updated draft manually",
    );
  });
});
