import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { PasswordInput } from "../components/PasswordInput";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useAuth } from "../context/AuthContext";
import { changePassword, fetchCurrentUser, updateProfile } from "../api/userApi";
import { extractErrorMessage } from "../utils/apiError";
import { useLanguage } from "../i18n/LanguageContext";

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then((profile) => {
        setUsername(profile.username);
        setEmail(profile.email);
        setMemberSince(new Date(profile.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
      })
      .catch(() => {
        // fall back silently to the cached session values already shown
      });
  }, []);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const profile = await updateProfile({ username, email });
      updateUser({ username: profile.username, email: profile.email });
      toast.success(t.settings.profileUpdated);
    } catch (error) {
      toast.error(extractErrorMessage(error, t.settings.profileError));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error(t.settings.passwordMismatch);
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success(t.settings.passwordChanged);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error(extractErrorMessage(error, t.settings.passwordError));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <Link
            to="/tasks"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t.common.backToDashboard}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.settings.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.settings.subtitle}</p>
        </div>

        <SettingsCard
          title={t.settings.profileTitle}
          description={memberSince ? t.settings.memberSince(memberSince) : t.settings.profileFallbackDescription}
        >
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="settings-username" className="mb-1.5 block text-sm font-medium text-slate-700">
                {t.settings.username}
              </label>
              <input
                id="settings-username"
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label htmlFor="settings-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                {t.settings.email}
              </label>
              <input
                id="settings-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingProfile ? t.settings.saving : t.settings.saveChanges}
              </button>
            </div>
          </form>
        </SettingsCard>

        <SettingsCard title={t.settings.languageTitle} description={t.settings.languageDescription}>
          <LanguageSwitcher />
        </SettingsCard>

        <SettingsCard title={t.settings.securityTitle} description={t.settings.securityDescription}>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <PasswordInput
              id="current-password"
              label={t.settings.currentPassword}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <PasswordInput
              id="new-password"
              label={t.settings.newPassword}
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.settings.newPasswordHint}
            />
            <PasswordInput
              id="confirm-new-password"
              label={t.settings.confirmNewPassword}
              required
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder={t.settings.confirmNewPasswordHint}
            />
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingPassword ? t.settings.updating : t.settings.updatePassword}
              </button>
            </div>
          </form>
        </SettingsCard>
      </main>
    </div>
  );
}
