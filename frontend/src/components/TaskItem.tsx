import { useState } from "react";
import type { Task, TaskInput } from "../types";
import { TaskForm } from "./TaskForm";

const STATUS_STYLES: Record<Task["status"], string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, payload: TaskInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isEditing) {
    return (
      <TaskForm
        initialTask={task}
        onSubmit={async (payload) => {
          await onUpdate(task.id, payload);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-slate-800">{task.title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status]}`}>
            {task.status.replace("_", " ")}
          </span>
        </div>
        {task.description && <p className="mt-1 text-sm text-slate-500">{task.description}</p>}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
