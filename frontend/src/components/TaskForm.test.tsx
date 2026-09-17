import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskForm } from "./TaskForm";

describe("TaskForm", () => {
  it("submits the entered title, description and status", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Write report" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Quarterly report" } });
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Write report",
        description: "Quarterly report",
        status: "TODO",
      });
    });
  });

  it("does not submit when the title is blank", () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Add task" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("pre-fills the form and shows a cancel button when editing an existing task", () => {
    const onCancel = vi.fn();
    render(
      <TaskForm
        initialTask={{
          id: 1,
          title: "Existing task",
          description: "Existing description",
          status: "IN_PROGRESS",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    expect(screen.getByDisplayValue("Existing task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
