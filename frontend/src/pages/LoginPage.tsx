import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../utils/apiError";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { SubmitButton } from "../components/SubmitButton";
import { useLanguage } from "../i18n/LanguageContext";

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/tasks");
    } catch (error) {
      toast.error(extractErrorMessage(error, t.auth.login.invalidError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t.auth.login.title}
      subtitle={t.auth.login.subtitle}
      footer={
        <>
          {t.auth.login.noAccount}{" "}
          <Link to="/register" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700">
            {t.auth.login.createOne}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t.auth.login.email}
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors duration-150 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <PasswordInput
          id="password"
          label={t.auth.login.password}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <SubmitButton loading={submitting} loadingLabel={t.auth.login.submitting}>
          {t.auth.login.submit}
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
