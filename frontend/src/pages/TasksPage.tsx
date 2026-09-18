import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { StatCard } from "../components/StatCard";
import { createTask, deleteTask, fetchTasks, updateTask } from "../api/taskApi";
import { extractErrorMessage } from "../utils/apiError";
import { useAuth } from "../context/AuthContext";
import type { Task, TaskInput, TaskStatus } from "../types";

const STATUS_FILTERS: Array<{ label: string; value: TaskStatus | "" }> = [
  { label: "All statuses", value: "" },
  { label: "To do", value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

export function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not load tasks"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = !status || task.status === status;
      const matchesSearch = !query || task.title.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [tasks, status, search]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    }),
    [tasks]
  );

  const handleCreate = async (payload: TaskInput) => {
    try {
      await createTask(payload);
      toast.success("Task created");
      setCreateOpen(false);
      await loadTasks();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not create task"));
    }
  };

  const handleUpdate = async (payload: TaskInput) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, payload);
      toast.success("Task updated");
      setEditingTask(null);
      await loadTasks();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not update task"));
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
      toast.success("Task deleted");
      setDeletingTask(null);
      await loadTasks();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not delete task"));
    }
  };

  const firstName = user?.username ?? "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
            <p className="mt-1 text-sm text-slate-500">Here's what's on your plate today.</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New task
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total"
            value={stats.total}
            accent="bg-indigo-50 text-indigo-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            label="To do"
            value={stats.todo}
            accent="bg-slate-100 text-slate-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="In progress"
            value={stats.inProgress}
            accent="bg-amber-50 text-amber-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            }
          />
          <StatCard
            label="Done"
            value={stats.done}
            accent="bg-emerald-50 text-emerald-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto rounded-lg bg-slate-100 p-1">
            {STATUS_FILTERS.map((option) => (
              <button
                key={option.label}
                onClick={() => setStatus(option.value)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  status === option.value ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <TaskList tasks={filteredTasks} loading={loading} onEdit={setEditingTask} onDelete={setDeletingTask} />
      </main>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New task">
        <TaskForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editingTask} onClose={() => setEditingTask(null)} title="Edit task">
        {editingTask && (
          <TaskForm initialTask={editingTask} onSubmit={handleUpdate} onCancel={() => setEditingTask(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deletingTask}
        title="Delete task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeletingTask(null)}
      />
    </div>
  );
}
