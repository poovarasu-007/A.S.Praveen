import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Phone,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
  Wheat,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { interpolate } from '../../utils/i18n';
import type { UserRole } from '../../types';

interface ToastState {
  message: string;
  type: 'error' | 'info';
  visible: boolean;
}

const ArchBackground: React.FC = () => (
  <div className="arch-overlay" aria-hidden="true">
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
      <path d="M120 900V380Q720-80 1320 380V900" stroke="currentColor" strokeOpacity=".12" />
      <path d="M200 900V420Q720 0 1240 420V900" stroke="currentColor" strokeOpacity=".16" />
      <path d="M290 900V460Q720 40 1150 460V900" stroke="currentColor" strokeOpacity=".20" />
      <path d="M390 900V510Q720 100 1050 510V900" stroke="currentColor" strokeOpacity=".24" />
      <path d="M490 900V570Q720 170 950 570V900" stroke="currentColor" strokeOpacity=".28" />
      <path d="M590 900V640Q720 240 850 640V900" stroke="currentColor" strokeOpacity=".34" />
      <ellipse cx="720" cy="870" rx="600" ry="120" fill="currentColor" fillOpacity=".06" />
      <ellipse cx="720" cy="900" rx="380" ry="80" fill="currentColor" fillOpacity=".08" />
    </svg>
  </div>
);

/** Authentication, registration, and password recovery share the same light
 * botanical language. Business logic remains delegated to AuthContext. */
export const Login: React.FC = () => {
  const { login, createUser, resetPassword } = useAuth();
  const { t } = useSettings();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('OPERATOR');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'error', visible: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    setToast({ message, type, visible: true });
    window.setTimeout(() => setToast((current) => ({ ...current, visible: false })), 4500);
  };

  const localizeAuthMessage = (message: string): string => {
    const known: Record<string, string> = {
      'Invalid username or user does not exist': t.invalidUsername,
      'User account is deactivated. Contact Admin.': t.accountDeactivated,
      'Invalid password. Please try again.': t.invalidPassword,
      'An error occurred during authentication': t.authUnexpected,
      'Please provide full name, username, and password.': t.authRequired,
      'Username must be at least 3 characters long.': t.authMinUsername,
      'Password must be at least 4 characters long.': t.authMinPassword,
      'A user with this username already exists.': t.usernameExists,
      'Account created successfully!': t.authAccountCreated,
      'Please enter your username.': t.usernameRequired,
      'New password must be at least 4 characters long.': t.authMinPassword,
      'No account found matching this username.': t.usernameNotFound,
      'Password reset successfully! Please sign in with your new password.': t.authResetSuccess,
      'Verification failed. Please enter the registered shop mobile number (8825633575) or master recovery key.': t.authVerificationFailed,
    };
    return known[message] || message;
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      showToast(t.authRequired);
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.success) showToast(localizeAuthMessage(result.message || t.invalidPassword));
    } catch {
      showToast(t.authUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = regName.trim();
    const cleanUsername = regUsername.trim().toLowerCase();
    if (!cleanName || !cleanUsername || !regPassword) {
      showToast(t.authRequired);
      return;
    }
    if (cleanUsername.length < 3) {
      showToast(t.authMinUsername);
      return;
    }
    if (regPassword.length < 4) {
      showToast(t.authMinPassword);
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast(t.authPasswordsMismatch);
      return;
    }
    setIsLoading(true);
    try {
      const result = await createUser({
        name: cleanName,
        username: cleanUsername,
        phone: regPhone.trim() || undefined,
        role: regRole,
        passwordPlain: regPassword,
        autoLogin: false,
      });
      if (result.success) {
        showToast(t.authAccountCreated, 'info');
        setUsername(cleanUsername);
        setPassword('');
        setRegName(''); setRegUsername(''); setRegPhone(''); setRegPassword(''); setRegConfirmPassword(''); setRegRole('OPERATOR');
        setMode('login');
      } else {
        showToast(localizeAuthMessage(result.message || t.authUnexpected));
      }
    } catch {
      showToast(t.authUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanUsername = forgotUsername.trim().toLowerCase();
    if (!cleanUsername) { showToast(t.usernameRequired); return; }
    if (!verificationCode.trim()) { showToast(t.authRecoveryHint); return; }
    if (newPassword.length < 4) { showToast(t.authMinPassword); return; }
    if (newPassword !== confirmPassword) { showToast(t.authPasswordsMismatch); return; }
    setIsLoading(true);
    try {
      const result = await resetPassword(cleanUsername, newPassword, verificationCode.trim());
      if (result.success) {
        showToast(t.authResetSuccess, 'info');
        setUsername(cleanUsername); setPassword(''); setForgotUsername(''); setVerificationCode(''); setNewPassword(''); setConfirmPassword(''); setMode('login');
      } else {
        showToast(localizeAuthMessage(result.message || t.authUnexpected));
      }
    } catch {
      showToast(t.authUnexpected);
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'login' ? t.welcomeBack : mode === 'register' ? t.createAccountTitle : t.forgotPasswordTitle;
  const subtitle = mode === 'login' ? t.signInSubtitle : mode === 'register' ? t.createAccountSubtitle : t.forgotPasswordSubtitle;

  return (
    <div className="auth-shell arch-bg min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="noise-overlay" aria-hidden="true" />
      <ArchBackground />
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        <div className="mb-5 flex items-center justify-end"><LanguageSwitcher compact light /></div>
        <div className="flex flex-1 items-center justify-center">
          <div className={`auth-card transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            <div className="flex flex-col items-center border-b border-border-subtle px-6 pb-6 pt-7 text-center sm:px-9">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-100 bg-primary-900 shadow-soft" aria-hidden="true"><Wheat size={30} className="text-white" /></div>
              <p className="font-display text-2xl font-semibold tracking-wide text-primary-900">{t.brandName}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary-700">{t.brandSub}</p>
              <p className="mt-3 text-xs text-text-tertiary">{t.authTagline}</p>
            </div>

            <div className="px-6 py-6 sm:px-9 sm:py-8">
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-primary-900">{title}</h1>
                <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
              </div>

              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="on">
                  <div>
                    <label className="label-arch" htmlFor="login-username">{t.username}</label>
                    <input id="login-username" className="input-arch" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.usernamePlaceholder} autoComplete="username" disabled={isLoading} autoFocus />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <label className="label-arch mb-0" htmlFor="login-password">{t.password}</label>
                      <button type="button" className="text-xs font-semibold text-secondary-700 underline underline-offset-2 hover:text-primary-900" onClick={() => { setForgotUsername(username.trim()); setMode('forgot'); }}>{t.forgotPassword}</button>
                    </div>
                    <div className="relative">
                      <input id="login-password" className="input-arch pr-12" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} autoComplete="current-password" disabled={isLoading} />
                      <button type="button" onClick={() => setShowPass((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-text-tertiary hover:bg-primary-50 hover:text-primary-900" aria-label={showPass ? t.authHidePassword : t.authShowPassword} title={showPass ? t.authHidePassword : t.authShowPassword}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <p className="rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-xs text-text-secondary">{t.defaultCredentials}</p>
                  <button id="login-submit-btn" type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">{isLoading ? <><Loader2 size={18} className="animate-spin" />{t.loading}</> : t.signIn}</button>
                  <div className="border-t border-border-subtle pt-4 text-center"><button type="button" onClick={() => setMode('register')} className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-700 hover:text-primary-900"><UserPlus size={15} />{t.dontHaveAccount} <strong className="underline underline-offset-2">{t.registerNow}</strong></button></div>
                </form>
              )}

              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4" autoComplete="on">
                  <div className="mb-1 flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-lg font-semibold text-primary-900"><UserPlus size={18} className="text-primary-500" />{t.createAccountTitle}</h2><p className="mt-1 text-xs text-text-tertiary">{t.createAccountSubtitle}</p></div><button type="button" onClick={() => setMode('login')} className="rounded-lg p-2 text-text-tertiary hover:bg-primary-50 hover:text-primary-900" title={t.authBackToLogin} aria-label={t.authBackToLogin}><ArrowLeft size={18} /></button></div>
                  <div><label className="label-arch" htmlFor="reg-name">{t.fullName} *</label><input id="reg-name" className="input-arch" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder={t.fullNamePlaceholder} autoComplete="name" disabled={isLoading} autoFocus /></div>
                  <div><label className="label-arch" htmlFor="reg-username">{t.username} *</label><input id="reg-username" className="input-arch font-mono" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder={t.usernamePlaceholder} autoComplete="username" disabled={isLoading} /></div>
                  <div><label className="label-arch" htmlFor="reg-phone">{t.phoneNumber} ({t.authMobileOptional})</label><div className="relative"><Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" /><input id="reg-phone" className="input-arch pl-9 font-mono" type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder={t.phoneNumberPlaceholder} autoComplete="tel" disabled={isLoading} /></div></div>
                  <fieldset><legend className="label-arch">{t.role} *</legend><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setRegRole('OPERATOR')} aria-pressed={regRole === 'OPERATOR'} className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${regRole === 'OPERATOR' ? 'border-primary-500 bg-primary-100 text-primary-900' : 'border-border bg-white text-text-secondary hover:bg-primary-50'}`}><UserIcon size={15} />{t.roleOperator}</button><button type="button" onClick={() => setRegRole('ADMIN')} aria-pressed={regRole === 'ADMIN'} className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${regRole === 'ADMIN' ? 'border-primary-500 bg-primary-100 text-primary-900' : 'border-border bg-white text-text-secondary hover:bg-primary-50'}`}><ShieldCheck size={15} />{t.roleAdmin}</button></div></fieldset>
                  <div className="grid gap-3 sm:grid-cols-2"><div><label className="label-arch" htmlFor="reg-password">{t.password} *</label><div className="relative"><input id="reg-password" className="input-arch pr-11" type={showRegPass ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder={t.authMinChars} autoComplete="new-password" disabled={isLoading} /><button type="button" onClick={() => setShowRegPass((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-text-tertiary hover:bg-primary-50 hover:text-primary-900" aria-label={showRegPass ? t.authHidePassword : t.authShowPassword}>{showRegPass ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></div><div><label className="label-arch" htmlFor="reg-confirm-password">{t.confirmPassword} *</label><input id="reg-confirm-password" className="input-arch" type={showRegPass ? 'text' : 'password'} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder={t.authRepeatPassword} autoComplete="new-password" disabled={isLoading} /></div></div>
                  <button id="register-submit-btn" type="submit" disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <><Loader2 size={17} className="animate-spin" />{t.loading}</> : t.createAccountButton}</button>
                  <div className="text-center"><button type="button" onClick={() => setMode('login')} className="text-sm text-secondary-700 hover:text-primary-900">{t.authLoginAgain}</button></div>
                </form>
              )}

              {mode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4" autoComplete="on">
                  <div className="mb-1 flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-lg font-semibold text-primary-900"><KeyRound size={18} className="text-primary-500" />{t.forgotPasswordTitle}</h2><p className="mt-1 text-xs text-text-tertiary">{t.forgotPasswordSubtitle}</p></div><button type="button" onClick={() => setMode('login')} className="rounded-lg p-2 text-text-tertiary hover:bg-primary-50 hover:text-primary-900" title={t.authBackToLogin} aria-label={t.authBackToLogin}><ArrowLeft size={18} /></button></div>
                  <div><label className="label-arch" htmlFor="forgot-username">{t.username} *</label><input id="forgot-username" className="input-arch font-mono" value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)} placeholder={t.usernamePlaceholder} autoComplete="username" disabled={isLoading} autoFocus /></div>
                  <div><label className="label-arch" htmlFor="forgot-verification">{t.verificationCode} *</label><input id="forgot-verification" className="input-arch" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder={t.verificationCodePlaceholder} disabled={isLoading} /><p className="mt-1 text-xs text-text-tertiary">{t.authRecoveryHint}</p></div>
                  <div className="grid gap-3 sm:grid-cols-2"><div><label className="label-arch" htmlFor="forgot-newpass">{t.newPassword} *</label><div className="relative"><input id="forgot-newpass" className="input-arch pr-11" type={showNewPass ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t.authMinChars} autoComplete="new-password" disabled={isLoading} /><button type="button" onClick={() => setShowNewPass((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-text-tertiary hover:bg-primary-50 hover:text-primary-900" aria-label={showNewPass ? t.authHidePassword : t.authShowPassword}>{showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></div><div><label className="label-arch" htmlFor="forgot-confirm">{t.confirmPassword} *</label><input id="forgot-confirm" className="input-arch" type={showNewPass ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t.authRepeatPassword} autoComplete="new-password" disabled={isLoading} /></div></div>
                  <button id="forgot-submit-btn" type="submit" disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <><Loader2 size={17} className="animate-spin" />{t.loading}</> : t.resetPasswordButton}</button>
                  <div className="text-center"><button type="button" onClick={() => setMode('login')} className="inline-flex items-center gap-1 text-sm text-secondary-700 hover:text-primary-900"><ArrowLeft size={14} />{t.authBackToLogin}</button></div>
                </form>
              )}
            </div>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-text-tertiary">{t.offlineBillingSystem} · v1.0.0</p>
      </main>

      {toast.visible && <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-info'}`} role="alert" aria-live="polite">{toast.type === 'error' ? <AlertCircle size={17} aria-hidden="true" /> : <CheckCircle2 size={17} aria-hidden="true" /> }<span>{toast.message}</span></div>}
    </div>
  );
};

export default Login;
