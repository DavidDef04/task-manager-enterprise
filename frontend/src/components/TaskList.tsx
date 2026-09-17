import type { Task, TaskInput } from "../types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onUpdate: (id: number, payload: TaskInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TaskList({ tasks, loading, onUpdate, onDelete }: TaskListProps) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading tasks…</p>;
  }

  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No tasks match your filters yet.</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
