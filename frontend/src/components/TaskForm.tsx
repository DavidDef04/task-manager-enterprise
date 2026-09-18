import { useState, type FormEvent } from "react";
import type { Task, TaskInput, TaskStatus } from "../types";

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (payload: TaskInput) => Promise<void>;
  onCancel?: () => void;
}

export function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "TODO");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), status });
      if (!initialTask) {
        setTitle("");
        setDescription("");
        setStatus("TODO");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={150}
          autoFocus
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="e.g. Write project README"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="Optional details"
        />
      </div>

      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Saving…" : initialTask ? "Save changes" : "Add task"}
        </button>
      </div>
    </form>
  );
}
