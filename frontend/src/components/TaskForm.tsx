import { useState, type FormEvent } from "react";
import type { Task, TaskInput, TaskStatus } from "../types";
import { useLanguage } from "../i18n/LanguageContext";
import { DatePicker } from "./DatePicker";

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (payload: TaskInput) => Promise<void>;
  onCancel?: () => void;
}

export function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
  const { t } = useLanguage();

  const statusOptions: Array<{ value: TaskStatus; label: string; activeClass: string }> = [
    { value: "TODO", label: t.taskForm.statusTodo, activeClass: "bg-slate-800 text-white shadow-sm" },
    { value: "IN_PROGRESS", label: t.taskForm.statusInProgress, activeClass: "bg-amber-500 text-white shadow-sm" },
    { value: "DONE", label: t.taskForm.statusDone, activeClass: "bg-emerald-500 text-white shadow-sm" },
  ];

  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "TODO");
  const [dueDate, setDueDate] = useState<string | null>(initialTask?.dueDate ?? null);
  const [estimatedHours, setEstimatedHours] = useState(
    initialTask?.estimatedHours != null ? String(initialTask.estimatedHours) : ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: dueDate || null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      });
      if (!initialTask) {
        setTitle("");
        setDescription("");
        setStatus("TODO");
        setDueDate(null);
        setEstimatedHours("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t.taskForm.titleLabel}
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
          placeholder={t.taskForm.titlePlaceholder}
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t.taskForm.descriptionLabel}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder={t.taskForm.descriptionPlaceholder}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{t.taskForm.statusLabel}</span>
        <div className="flex gap-1.5 rounded-lg bg-slate-100 p-1">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                status === option.value ? option.activeClass : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.taskForm.dueDateLabel}</label>
          <DatePicker
            value={dueDate}
            onChange={setDueDate}
            placeholder={t.taskForm.datePickerPlaceholder}
            todayLabel={t.taskForm.datePickerToday}
            clearLabel={t.taskForm.datePickerClear}
          />
        </div>

        <div>
          <label htmlFor="estimatedHours" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t.taskForm.estimatedHoursLabel}
          </label>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input
              id="estimatedHours"
              type="number"
              min={0}
              step={0.5}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder={t.taskForm.estimatedHoursPlaceholder}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {t.common.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? t.taskForm.saving : initialTask ? t.taskForm.saveChanges : t.taskForm.addTask}
        </button>
      </div>
    </form>
  );
}
