import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchTasks } from "../api/taskApi";
import { getTaskNotifications, type TaskNotification } from "../utils/dueDate";
import { useLanguage } from "../i18n/LanguageContext";

const REFRESH_INTERVAL_MS = 60_000;

export function NotificationBell() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const tasks = await fetchTasks();
        if (!cancelled) setNotifications(getTaskNotifications(tasks, t.notifications));
      } catch {
        // silent: notifications are a convenience, not critical
      }
    };

    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [t.notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const overdueCount = notifications.filter((n) => n.severity === "overdue").length;
  const upcoming = notifications.filter((n) => n.severity === "upcoming");
  const overdue = notifications.filter((n) => n.severity === "overdue");

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t.notifications.bellLabel}
        className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {notifications.length > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white ${
              overdueCount > 0 ? "bg-red-500" : "bg-indigo-500"
            }`}
          >
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
          >
            <p className="px-3.5 pb-2 text-sm font-semibold text-slate-800">{t.notifications.title}</p>

            {notifications.length === 0 ? (
              <p className="px-3.5 py-6 text-center text-sm text-slate-400">{t.notifications.empty}</p>
            ) : (
              <>
                {overdue.length > 0 && (
                  <div className="mb-1">
                    <p className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-500">
                      {t.notifications.overdueGroup}
                    </p>
                    {overdue.map((n) => (
                      <div key={n.id} className="flex items-start gap-2 px-3.5 py-2 text-sm hover:bg-slate-50">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                        <span className="text-slate-700">{n.message}</span>
                      </div>
                    ))}
                  </div>
                )}
                {upcoming.length > 0 && (
                  <div>
                    <p className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      {t.notifications.upcomingGroup}
                    </p>
                    {upcoming.map((n) => (
                      <div key={n.id} className="flex items-start gap-2 px-3.5 py-2 text-sm hover:bg-slate-50">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        <span className="text-slate-700">{n.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
