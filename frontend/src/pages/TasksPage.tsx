import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { createTask, deleteTask, fetchTasks, updateTask } from "../api/taskApi";
import { extractErrorMessage } from "../utils/apiError";
import type { Task, TaskInput, TaskStatus } from "../types";

const STATUS_FILTERS: Array<{ label: string; value: TaskStatus | "" }> = [
  { label: "All statuses", value: "" },
  { label: "To do", value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [search, setSearch] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasks({ status, search });
      setTasks(data);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not load tasks"));
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const timeoutId = setTimeout(loadTasks, 250);
    return () => clearTimeout(timeoutId);
  }, [loadTasks]);

  const handleCreate = async (payload: TaskInput) => {
    try {
      await createTask(payload);
      toast.success("Task created");
      await loadTasks();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not create task"));
    }
  };

  const handleUpdate = async (id: number, payload: TaskInput) => {
    try {
      await updateTask(id, payload);
      toast.success("Task updated");
      await loadTasks();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not update task"));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      toast.success("Task deleted");
      await loadTasks();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not delete task"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <TaskForm onSubmit={handleCreate} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus | "")}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <TaskList tasks={tasks} loading={loading} onUpdate={handleUpdate} onDelete={handleDelete} />
      </main>
    </div>
  );
}
