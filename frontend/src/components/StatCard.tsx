import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
}

export function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <motion.div
      layout
      className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <motion.p
          key={value}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-semibold text-slate-900"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}
