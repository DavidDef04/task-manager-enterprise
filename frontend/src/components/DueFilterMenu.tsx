import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DatePicker } from "./DatePicker";
import { useLanguage } from "../i18n/LanguageContext";
import type { DueFilterValue, DuePreset } from "../types";

interface DueFilterMenuProps {
  value: DueFilterValue;
  onChange: (value: DueFilterValue) => void;
}

export function DueFilterMenu({ value, onChange }: DueFilterMenuProps) {
  const { t, language } = useLanguage();
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState<string | null>(value.from);
  const [draftTo, setDraftTo] = useState<string | null>(value.to);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presets: Array<{ value: DuePreset; label: string }> = [
    { value: "ALL", label: t.dashboard.dueAll },
    { value: "OVERDUE", label: t.dashboard.dueOverdue },
    { value: "TODAY", label: t.dashboard.dueToday },
    { value: "THIS_WEEK", label: t.dashboard.dueThisWeek },
    { value: "THIS_MONTH", label: t.dashboard.dueThisMonth },
    { value: "NO_DATE", label: t.dashboard.dueNoDate },
  ];

  const selectPreset = (preset: DuePreset) => {
    onChange({ preset, from: null, to: null });
    setOpen(false);
  };

  const applyCustomRange = () => {
    onChange({ preset: "CUSTOM", from: draftFrom, to: draftTo });
    setOpen(false);
  };

  const formatShort = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
      new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)))
    );

  const currentLabel = (() => {
    if (value.preset === "CUSTOM") {
      if (value.from && value.to) return `${formatShort(value.from)} – ${formatShort(value.to)}`;
      if (value.from) return `${t.dashboard.customFrom} ${formatShort(value.from)}`;
      if (value.to) return `${t.dashboard.customTo} ${formatShort(value.to)}`;
      return t.dashboard.dueCustom;
    }
    return presets.find((p) => p.value === value.preset)?.label ?? t.dashboard.dueAll;
  })();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() =>
          setOpen((v) => {
            const next = !v;
            if (next) {
              setDraftFrom(value.from);
              setDraftTo(value.to);
            }
            return next;
          })
        }
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 pl-3.5 pr-3 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span className="whitespace-nowrap text-slate-700">{currentLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-20 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            <div className="space-y-0.5">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => selectPreset(preset.value)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    value.preset === preset.value
                      ? "bg-indigo-50 font-medium text-indigo-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-2 border-t border-slate-100 pt-3">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.dashboard.dueCustom}
              </p>
              <div className="space-y-2 px-1">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{t.dashboard.customFrom}</label>
                  <DatePicker
                    value={draftFrom}
                    onChange={setDraftFrom}
                    placeholder={t.taskForm.datePickerPlaceholder}
                    todayLabel={t.taskForm.datePickerToday}
                    clearLabel={t.taskForm.datePickerClear}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{t.dashboard.customTo}</label>
                  <DatePicker
                    value={draftTo}
                    onChange={setDraftTo}
                    placeholder={t.taskForm.datePickerPlaceholder}
                    todayLabel={t.taskForm.datePickerToday}
                    clearLabel={t.taskForm.datePickerClear}
                  />
                </div>
                <button
                  type="button"
                  onClick={applyCustomRange}
                  disabled={!draftFrom && !draftTo}
                  className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.dashboard.applyCustomRange}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
