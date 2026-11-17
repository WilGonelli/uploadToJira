import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyTasksView } from "./MyTasksView.js";
import * as taskApi from "../api/taskApi.js";
import { Project } from "../models/Project.js";

vi.mock("../api/taskApi.js");
vi.mock("../api/commentApi.js");

describe("MyTasksView", () => {
  const mockProject: Project = {
    id: "proj-1",
    name: "Customer Portal",
    jiraProjectKey: "IMPCT",
    jiraParentKey: "IMPCT-297",
    rootPath: "",
    contextMarkdown: "Context description",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("renders the Jira project input and triggers task search", async () => {
    const user = userEvent.setup();
    vi.mocked(taskApi.fetchMyTasks).mockResolvedValue([
      {
        number: "01",
        summary: "Setup OAuth Provider",
        status: "OPEN",
        parent: "IMPCT-297",
        storyPoints: 3,
        phase: "Phase 4",
        activity: "Activity 3",
        assign: "me",
        jiraDescription: "Configuring client secrets",
        dod: "1. Tested",
        implementation: "",
        jiraIssueKey: "IMPCT-101",
      },
    ]);

    render(<MyTasksView selectedProject={mockProject} />);

    // Verify Jira Project Key input is present and accessible by label
    const projectInput = screen.getByLabelText(
      /chave ou nome do projeto no jira/i,
    );
    expect(projectInput).toBeInTheDocument();
    expect(projectInput).toHaveValue("IMPCT");

    // Click Buscar Tarefas
    const searchButton = screen.getByRole("button", {
      name: /buscar tarefas do projeto no jira/i,
    });
    await user.click(searchButton);

    expect(taskApi.fetchMyTasks).toHaveBeenCalledWith(
      "IMPCT",
      "In Progress, To Do",
      true,
      true,
    );

    // Verify the task card appears
    expect(await screen.findByText("Setup OAuth Provider")).toBeInTheDocument();
    expect(screen.getByText("IMPCT-101")).toBeInTheDocument();
  });
});
