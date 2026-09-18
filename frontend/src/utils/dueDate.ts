import type { DueFilter, Task } from "../types";

function startOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function daysUntil(dueDate: string): number {
  const today = startOfToday();
  const due = parseDate(dueDate);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function isOverdue(task: Task): boolean {
  return !!task.dueDate && task.status !== "DONE" && daysUntil(task.dueDate) < 0;
}

export function matchesDueFilter(task: Task, filter: DueFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "NO_DATE") return !task.dueDate;
  if (!task.dueDate) return false;

  const diff = daysUntil(task.dueDate);
  if (filter === "OVERDUE") return diff < 0 && task.status !== "DONE";
  if (filter === "TODAY") return diff === 0;
  if (filter === "NEXT_7_DAYS") return diff >= 0 && diff <= 7;
  return true;
}

interface DueDateLabels {
  today: string;
  tomorrow: string;
  yesterday: string;
}

export function formatDueDate(dueDate: string, labels: DueDateLabels): string {
  const diff = daysUntil(dueDate);
  const formatted = parseDate(dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  if (diff === 0) return labels.today;
  if (diff === 1) return labels.tomorrow;
  if (diff === -1) return labels.yesterday;
  return formatted;
}
