import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  Wheat, 
  UserPlus, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  User as UserIcon, 
  Phone 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

/* ─────────────────────────────────────────────────────────────────────
   Toast notification (self-contained)
───────────────────────────────────────────────────────────────────── */
interface ToastState {
  message: string;
  type: 'error' | 'info';
  visible: boolean;
}

/* ─────────────────────────────────────────────────────────────────────
   Arch SVG background component
───────────────────────────────────────────────────────────────────── */
const ArchBackground: React.FC = () => (
  <div className="arch-overlay" aria-hidden="true">
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outermost arch — faintest */}
      <path
        d="M120 900 L120 380 Q720 -80 1320 380 L1320 900"
        stroke="rgba(92,124,137,0.10)"
        strokeWidth="1"
        fill="none"
      />
      {/* Outer arch */}
      <path
        d="M200 900 L200 420 Q720 0 1240 420 L1240 900"
        stroke="rgba(92,124,137,0.14)"
        strokeWidth="1"
        fill="none"
      />
      {/* Mid-outer arch */}
      <path
        d="M290 900 L290 460 Q720 40 1150 460 L1150 900"
        stroke="rgba(92,124,137,0.18)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Mid arch */}
      <path
        d="M390 900 L390 510 Q720 100 1050 510 L1050 900"
        stroke="rgba(92,124,137,0.22)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Mid-inner arch */}
      <path
        d="M490 900 L490 570 Q720 170 950 570 L950 900"
        stroke="rgba(92,124,137,0.28)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Inner arch */}
      <path
        d="M590 900 L590 640 Q720 240 850 640 L850 900"
        stroke="rgba(92,124,137,0.35)"
        strokeWidth="1.5"
        fill="rgba(31,73,89,0.04)"
      />
      {/* Innermost arch glow */}
      <path
        d="M660 900 L660 700 Q720 300 780 700 L780 900"
        stroke="rgba(92,124,137,0.5)"
        strokeWidth="2"
        fill="rgba(31,73,89,0.07)"
      />

      {/* Bottom atmospheric glow band */}
      <ellipse
        cx="720"
        cy="870"
        rx="600"
        ry="120"
        fill="rgba(31,73,89,0.12)"
      />
      <ellipse
        cx="720"
        cy="900"
        rx="380"
        ry="80"
        fill="rgba(92,124,137,0.08)"
      />

      {/* Top key-light on arch apex */}
      <ellipse
        cx="720"
        cy="200"
        rx="160"
        ry="60"
        fill="rgba(92,124,137,0.05)"
      />
    </svg>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────
   Main Login, Register & Forgot Password Component
───────────────────────────────────────────────────────────────────── */
export const Login: React.FC = () => {
  const { login, createUser, resetPassword } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Sign In Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('OPERATOR');
  const [regAdminKey, setRegAdminKey] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  // Forgot Password Form State
  const [forgotUsername, setForgotUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Common UI State
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'error', visible: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4500);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Please enter your username and password.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        showToast(result.message ?? 'Invalid credentials. Please try again.');
      }
    } catch {
      showToast('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Create User / Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = regName.trim();
    const cleanUsername = regUsername.trim().toLowerCase();

    if (!cleanName || !cleanUsername || !regPassword) {
      showToast('Please fill in Name, Username, and Password.');
      return;
    }

    if (cleanUsername.length < 3) {
      showToast('Username must be at least 3 characters.');
      return;
    }

    if (regPassword.length < 4) {
      showToast('Password must be at least 4 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match. Please verify.');
      return;
    }

    if (regRole === 'ADMIN') {
      const cleanKey = regAdminKey.trim().toLowerCase();
      const validAdminKeys = ['asp@2024', 'asp2024', 'admin123', '8825633575'];
      if (!cleanKey || !validAdminKeys.includes(cleanKey)) {
        showToast('Admin authorization key is required to register an Administrator.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await createUser({
        name: cleanName,
        username: cleanUsername,
        phone: regPhone.trim() || undefined,
        role: regRole,
        passwordPlain: regPassword,
        autoLogin: false
      });

      if (result.success) {
        showToast('Account created successfully! You can now sign in.', 'info');
        setUsername(cleanUsername);
        setPassword('');
        // Reset register fields
        setRegName('');
        setRegUsername('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegAdminKey('');
        setRegRole('OPERATOR');
        setMode('login');
      } else {
        showToast(result.message || 'Failed to create account.');
      }
    } catch {
      showToast('An unexpected error occurred while creating user.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Forgot Password / Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = forgotUsername.trim().toLowerCase();

    if (!cleanUsername) {
      showToast('Please enter your username.');
      return;
    }

    if (!verificationCode.trim()) {
      showToast('Please enter the registered shop mobile number or master recovery key.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      showToast('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(cleanUsername, newPassword, verificationCode.trim());
      if (result.success) {
        showToast('Password reset successfully! Please sign in with your new password.', 'info');
        setUsername(cleanUsername);
        setPassword('');
        setForgotUsername('');
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setMode('login');
      } else {
        showToast(result.message || 'Failed to reset password.');
      }
    } catch {
      showToast('An unexpected error occurred during password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="arch-bg min-h-screen flex flex-col items-center justify-center relative select-none py-10">
      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Arch SVG background */}
      <ArchBackground />

      {/* Content — layered above arch */}
      <div className="relative z-10 w-full max-w-md px-4">

        {/* Brand mark — animated reveal */}
        <div
          className={`flex flex-col items-center mb-7 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Logo icon */}
          <div className="relative mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1F4959 0%, #2d6275 100%)',
                border: '1px solid rgba(92,124,137,0.4)',
                boxShadow: '0 8px 32px rgba(31,73,89,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <Wheat size={28} className="text-white" />
            </div>
            {/* Soft glow ring */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: '0 0 40px rgba(92,124,137,0.3)',
                pointerEvents: 'none',
              }}
            />
          </div>

          <h1
            className="font-display text-3xl font-light tracking-widest text-white text-center"
            style={{ letterSpacing: '0.12em' }}
          >
            A.S. PRAVEEN
          </h1>
          <span
            className="font-display text-lg font-light mt-0.5 text-center"
            style={{ color: 'rgba(92,124,137,0.9)', letterSpacing: '0.25em' }}
          >
            TRADERS
          </span>
          <p
            className="text-xs mt-2 tracking-widest uppercase text-center"
            style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em' }}
          >
            Agricultural Products &amp; Farm Inputs
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            Card Container
        ─────────────────────────────────────────────────────────────────── */}
        <div
          className={`card-glass-dark p-7 sm:p-8 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.18s' }}
        >

          {/* ═══════════════════════════════════════════════════════════════
              MODE 1: SIGN IN
          ═══════════════════════════════════════════════════════════════ */}
          {mode === 'login' && (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-white font-semibold text-lg tracking-wide">
                  Welcome Back
                </h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(92,124,137,0.7)', letterSpacing: '0.05em' }}>
                  Sign in to access the billing system
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
                {/* Username field */}
                <div>
                  <label htmlFor="login-username" className="label-arch">
                    Username
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="input-arch"
                    autoComplete="username"
                    spellCheck={false}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="label-arch mb-0">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotUsername(username.trim());
                        setMode('forgot');
                      }}
                      className="text-xs text-agri-gold hover:text-agri-light transition-colors font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input-arch pr-12"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors duration-200"
                      style={{ color: 'rgba(92,124,137,0.7)' }}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Hint */}
                <p className="text-xs px-1" style={{ color: 'rgba(92,124,137,0.55)' }}>
                  Default credentials — Admin: <span style={{ color: 'rgba(255,255,255,0.5)' }}>admin</span> / Operator: <span style={{ color: 'rgba(255,255,255,0.5)' }}>operator</span>
                </p>

                {/* Submit button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 text-base tracking-widest mt-2"
                  style={{ letterSpacing: '0.12em' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Authenticating…
                    </>
                  ) : (
                    'SIGN IN'
                  )}
                </button>

                {/* Toggle to Create Account */}
                <div className="pt-3 border-t border-white/10 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors cursor-pointer py-1 font-medium"
                  >
                    <UserPlus size={14} className="text-agri-gold" />
                    <span>Don&apos;t have an account? <strong className="text-agri-gold font-semibold underline underline-offset-2">Create Account</strong></span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              MODE 2: CREATE USER (REGISTER)
          ═══════════════════════════════════════════════════════════════ */}
          {mode === 'register' && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold text-lg tracking-wide flex items-center gap-2">
                    <UserPlus size={18} className="text-agri-gold" />
                    <span>Create Account</span>
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(92,124,137,0.7)' }}>
                    Set up an operator or administrator account
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  title="Back to Sign In"
                >
                  <ArrowLeft size={18} />
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5" autoComplete="off">
                {/* Full Name */}
                <div>
                  <label htmlFor="reg-name" className="label-arch">
                    Full Name *
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. S. Kumar"
                    className="input-arch"
                    spellCheck={false}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="reg-username" className="label-arch">
                    Username (Login ID) *
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="e.g. kumar"
                    className="input-arch font-mono"
                    spellCheck={false}
                    disabled={isLoading}
                  />
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label htmlFor="reg-phone" className="label-arch">
                    Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="input-arch font-mono pl-9"
                      disabled={isLoading}
                    />
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="reg-role" className="label-arch">
                    System Role *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('OPERATOR')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        regRole === 'OPERATOR'
                          ? 'bg-agri-700/60 border-agri-gold text-white shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <UserIcon size={14} className={regRole === 'OPERATOR' ? 'text-agri-gold' : 'text-white/40'} />
                      <span>Operator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('ADMIN')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        regRole === 'ADMIN'
                          ? 'bg-amber-900/50 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <ShieldCheck size={14} className={regRole === 'ADMIN' ? 'text-amber-400' : 'text-white/40'} />
                      <span>Administrator</span>
                    </button>
                  </div>
                </div>

                {/* Admin authorization key check if ADMIN role selected */}
                {regRole === 'ADMIN' && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1.5 animate-fadeIn">
                    <label htmlFor="reg-adminkey" className="text-xs font-semibold text-amber-300 block">
                      Admin Master Passcode *
                    </label>
                    <input
                      id="reg-adminkey"
                      type="password"
                      value={regAdminKey}
                      onChange={e => setRegAdminKey(e.target.value)}
                      placeholder="Enter Admin Master Key or Shop Phone"
                      className="input-arch text-xs py-2"
                      disabled={isLoading}
                    />
                    <span className="text-[10px] text-amber-300/70 block">
                      Required to verify permission to create an Administrator account
                    </span>
                  </div>
                )}

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-password" className="label-arch">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showRegPass ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        className="input-arch pr-8 text-xs"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass(!showRegPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        tabIndex={-1}
                      >
                        {showRegPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-confirm-password" className="label-arch">
                      Confirm *
                    </label>
                    <input
                      id="reg-confirm-password"
                      type={showRegPass ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="input-arch text-xs"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 text-sm tracking-wider mt-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating Account…
                    </>
                  ) : (
                    'CREATE ACCOUNT'
                  )}
                </button>

                {/* Back to Login link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    Already have an account? <span className="text-agri-gold font-semibold underline underline-offset-2">Sign In</span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              MODE 3: FORGOT PASSWORD (RESET)
          ═══════════════════════════════════════════════════════════════ */}
          {mode === 'forgot' && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold text-lg tracking-wide flex items-center gap-2">
                    <KeyRound size={18} className="text-agri-gold" />
                    <span>Reset Password</span>
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(92,124,137,0.7)' }}>
                    Verify identity to set a new password
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  title="Back to Sign In"
                >
                  <ArrowLeft size={18} />
                </button>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-3.5" autoComplete="off">
                {/* Target Username */}
                <div>
                  <label htmlFor="forgot-username" className="label-arch">
                    Account Username *
                  </label>
                  <input
                    id="forgot-username"
                    type="text"
                    value={forgotUsername}
                    onChange={e => setForgotUsername(e.target.value)}
                    placeholder="e.g. operator or admin"
                    className="input-arch font-mono"
                    spellCheck={false}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* Security Verification Key / Registered Shop Mobile */}
                <div>
                  <label htmlFor="forgot-verification" className="label-arch">
                    Verification Code / Shop Mobile *
                  </label>
                  <input
                    id="forgot-verification"
                    type="text"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="Enter Shop Mobile (8825633575) or Master Key"
                    className="input-arch text-xs"
                    disabled={isLoading}
                  />
                  <span className="text-[11px] block mt-1" style={{ color: 'rgba(92,124,137,0.65)' }}>
                    Enter registered shop mobile (8825633575) or master recovery key (asp@2024).
                  </span>
                </div>

                {/* New Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="forgot-newpass" className="label-arch">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        id="forgot-newpass"
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        className="input-arch pr-8 text-xs"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        tabIndex={-1}
                      >
                        {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="forgot-confirm" className="label-arch">
                      Confirm *
                    </label>
                    <input
                      id="forgot-confirm"
                      type={showNewPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="input-arch text-xs"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  id="forgot-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 text-sm tracking-wider mt-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating Password…
                    </>
                  ) : (
                    'RESET PASSWORD'
                  )}
                </button>

                {/* Back to Login link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to <strong className="text-agri-gold font-semibold underline underline-offset-2">Sign In</strong></span>
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

        {/* Footer note */}
        <p
          className={`text-center text-xs mt-8 transition-all duration-700 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ color: 'rgba(92,124,137,0.4)', transitionDelay: '0.45s', letterSpacing: '0.05em' }}
        >
          Offline Billing System &nbsp;·&nbsp; v1.0.0
        </p>
      </div>

      {/* Toast notification */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold animate-slide-down ${
            toast.type === 'error' ? 'toast-error' : 'toast-info'
          }`}
          role="alert"
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="flex-shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Login;
