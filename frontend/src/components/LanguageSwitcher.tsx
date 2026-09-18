import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

const OPTIONS: Array<{ value: Language; label: string }> = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
];

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-1 rounded-lg bg-slate-100 p-1 ${compact ? "" : "w-fit"}`}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          aria-pressed={language === option.value}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            language === option.value ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
