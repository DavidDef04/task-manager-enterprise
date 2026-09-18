import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-200 opacity-40 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-purple-200 opacity-40 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-sky-200 opacity-40 blur-3xl" />
      </div>

      <div className="animate-fade-slide-up relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-7 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          {children}
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </div>
  );
}
