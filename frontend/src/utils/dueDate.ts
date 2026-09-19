import type { DueFilterValue, Task } from "../types";
import type { Translations } from "../i18n/translations";

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

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7; // Monday-first
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function matchesDueFilter(task: Task, filter: DueFilterValue): boolean {
  const { preset, from, to } = filter;

  if (preset === "ALL") return true;
  if (preset === "NO_DATE") return !task.dueDate;
  if (!task.dueDate) return false;

  const due = parseDate(task.dueDate);
  const diff = daysUntil(task.dueDate);

  if (preset === "OVERDUE") return diff < 0 && task.status !== "DONE";
  if (preset === "TODAY") return diff === 0;

  if (preset === "THIS_WEEK") {
    const today = startOfToday();
    return due >= startOfWeek(today) && due <= endOfWeek(today);
  }

  if (preset === "THIS_MONTH") {
    const today = startOfToday();
    return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
  }

  if (preset === "CUSTOM") {
    if (from && due < parseDate(from)) return false;
    if (to && due > parseDate(to)) return false;
    return Boolean(from || to);
  }

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

export interface TaskNotification {
  id: string;
  taskId: number;
  severity: "overdue" | "upcoming";
  message: string;
}

const UPCOMING_WINDOW_DAYS = 3;

export function getTaskNotifications(tasks: Task[], labels: Translations["notifications"]): TaskNotification[] {
  const overdue: TaskNotification[] = [];
  const upcoming: TaskNotification[] = [];

  for (const task of tasks) {
    if (!task.dueDate || task.status === "DONE") continue;
    const diff = daysUntil(task.dueDate);

    if (diff < 0) {
      const days = Math.abs(diff);
      overdue.push({
        id: `overdue-${task.id}`,
        taskId: task.id,
        severity: "overdue",
        message: days === 1 ? labels.overdueOne(task.title) : labels.overdueMany(task.title, days),
      });
    } else if (diff <= UPCOMING_WINDOW_DAYS) {
      upcoming.push({
        id: `upcoming-${task.id}`,
        taskId: task.id,
        severity: "upcoming",
        message:
          diff === 0
            ? labels.dueToday(task.title)
            : diff === 1
            ? labels.dueTomorrow(task.title)
            : labels.dueInDays(task.title, diff),
      });
    }
  }

  return [...overdue, ...upcoming];
}
