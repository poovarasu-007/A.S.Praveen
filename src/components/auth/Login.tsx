import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, Wheat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
   Main Login Component
───────────────────────────────────────────────────────────────────── */
export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'error', visible: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="arch-bg min-h-screen flex flex-col items-center justify-center relative select-none">
      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Arch SVG background */}
      <ArchBackground />

      {/* Content — layered above arch */}
      <div className="relative z-10 w-full max-w-md px-4">

        {/* Brand mark — animated reveal */}
        <div
          className={`flex flex-col items-center mb-10 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Logo icon */}
          <div className="relative mb-5">
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

        {/* Login Card */}
        <div
          className={`card-glass-dark p-8 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.18s' }}
        >
          {/* Card header */}
          <div className="mb-7 text-center">
            <h2 className="text-white font-semibold text-lg tracking-wide">
              Welcome Back
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(92,124,137,0.7)', letterSpacing: '0.05em' }}>
              Sign in to access the billing system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
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
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="login-password" className="label-arch">
                Password
              </label>
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
          </form>
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
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Login;
