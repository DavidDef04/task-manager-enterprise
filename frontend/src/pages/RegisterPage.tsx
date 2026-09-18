import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../utils/apiError";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { SubmitButton } from "../components/SubmitButton";
import { useLanguage } from "../i18n/LanguageContext";

export function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t.auth.register.passwordMismatch);
      return;
    }

    setSubmitting(true);
    try {
      await register({ username, email, password });
      toast.success(t.auth.register.accountCreated);
      navigate("/tasks");
    } catch (error) {
      toast.error(extractErrorMessage(error, t.auth.register.createError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t.auth.register.title}
      subtitle={t.auth.register.subtitle}
      footer={
        <>
          {t.auth.register.haveAccount}{" "}
          <Link to="/login" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700">
            {t.auth.register.logIn}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t.auth.register.username}
          </label>
          <input
            id="username"
            type="text"
            required
            minLength={3}
            maxLength={50}
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="janedoe"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors duration-150 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t.auth.register.email}
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

        <div>
          <PasswordInput
            id="password"
            label={t.auth.register.password}
            required
            minLength={10}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.auth.register.passwordHint}
          />
          <p className="mt-1.5 text-xs text-slate-400">{t.auth.register.passwordRequirements}</p>
        </div>

        <div>
          <PasswordInput
            id="confirmPassword"
            label={t.auth.register.confirmPassword}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t.auth.register.confirmPasswordHint}
            className={passwordsMismatch ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}
          />
          {passwordsMismatch && <p className="mt-1.5 text-xs text-red-600">{t.auth.register.passwordMismatch}</p>}
        </div>

        <SubmitButton loading={submitting} loadingLabel={t.auth.register.submitting}>
          {t.auth.register.submit}
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
