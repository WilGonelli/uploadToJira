import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "./TaskCard.js";
import { JiraTask } from "../../models/JiraTask.js";

describe("TaskCard", () => {
  const mockTask: JiraTask = {
    number: "01",
    summary: "Implement authentication flow",
    status: "OPEN",
    parent: "IMPCT-297",
    storyPoints: 2,
    phase: "Phase 4",
    activity: "Activity 3",
    assign: "saowivie",
    jiraDescription: "Develop sign-in endpoints and JWT handling",
    dod: "1. Unit tests written\n2. Documentation updated",
    implementation: "",
  };

  it("renders task summary and all 5 Jira attributes in view mode", () => {
    render(
      <TaskCard
        task={mockTask}
        index={0}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    // Summary
    expect(
      screen.getByRole("heading", { name: "Implement authentication flow" }),
    ).toBeInTheDocument();

    // 5 Jira attributes
    expect(screen.getByText("IMPCT-297")).toBeInTheDocument();
    expect(screen.getByText("2 pts")).toBeInTheDocument();
    expect(screen.getByText("Phase 4")).toBeInTheDocument();
    expect(screen.getByText("Activity 3")).toBeInTheDocument();
    expect(screen.getByText("saowivie")).toBeInTheDocument();
  });

  it("allows entering edit mode and modifying Jira attributes", async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        index={0}
        onUpdate={handleUpdate}
        onRemove={vi.fn()}
      />,
    );

    // Click edit button
    const editButton = screen.getByRole("button", { name: /edit task #01/i });
    await user.click(editButton);

    // Verify all 5 Jira attribute inputs are accessible by label
    const spInput = screen.getByLabelText("Story Points");
    const parentInput = screen.getByLabelText("Parent Key");
    const phaseInput = screen.getByLabelText("Phase");
    const activityInput = screen.getByLabelText("Activity");
    const assignInput = screen.getByLabelText("Assign to");

    expect(spInput).toHaveValue(2);
    expect(parentInput).toHaveValue("IMPCT-297");
    expect(phaseInput).toHaveValue("Phase 4");
    expect(activityInput).toHaveValue("Activity 3");
    expect(assignInput).toHaveValue("saowivie");

    // Modify values
    await user.clear(parentInput);
    await user.type(parentInput, "IMPCT-500");

    await user.clear(phaseInput);
    await user.type(phaseInput, "Phase 5");

    // Click Save
    const saveButton = screen.getByRole("button", {
      name: /save modifications for task #01/i,
    });
    await user.click(saveButton);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    expect(handleUpdate).toHaveBeenCalledWith(
      0,
      expect.objectContaining({
        parent: "IMPCT-500",
        phase: "Phase 5",
      }),
    );
  });

  it("calls onRemove when the delete button is clicked", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        index={0}
        onUpdate={vi.fn()}
        onRemove={handleRemove}
      />,
    );

    const deleteButton = screen.getByRole("button", {
      name: /delete task #01/i,
    });
    await user.click(deleteButton);

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleRemove).toHaveBeenCalledWith(0);
  });
});
