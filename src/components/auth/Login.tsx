import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Lock, User, ShieldCheck, AlertCircle, ArrowRight, Sprout, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { settings } = useSettings();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(username, password);
      if (!res.success) {
        setError(res.message || 'Invalid username or password');
      }
    } catch (err: any) {
      setError(err?.message || 'Login error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none overflow-hidden"
      style={{
        background: 'linear-gradient(135deg,#052E16 0%,#14532D 20%,#1E1B4B 45%,#4C1D95 65%,#831843 85%,#7c2d12 100%)',
      }}
    >
      {/* Agricultural background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 scale-105"
        style={{ backgroundImage: "url('/images/farmer_bullock_ploughing.jpg')" }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg,rgba(5,46,22,0.85) 0%,rgba(30,27,75,0.80) 50%,rgba(76,29,149,0.80) 100%)',
        }}
      />

      {/* Floating coloured dots decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { top: '10%', left: '8%',  w: 80,  colour: '#F59E0B', delay: '0s' },
          { top: '70%', left: '5%',  w: 50,  colour: '#22C55E', delay: '1s' },
          { top: '20%', left: '85%', w: 60,  colour: '#EC4899', delay: '0.5s' },
          { top: '75%', left: '80%', w: 90,  colour: '#3B82F6', delay: '1.5s' },
          { top: '45%', left: '92%', w: 40,  colour: '#8B5CF6', delay: '2s' },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              top: dot.top, left: dot.left,
              width: dot.w, height: dot.w,
              background: dot.colour,
              filter: 'blur(30px)',
              animation: `float 4s ease-in-out ${dot.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Animated rainbow stripe at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{
          background: 'linear-gradient(90deg,#F59E0B,#EF4444,#EC4899,#8B5CF6,#3B82F6,#22C55E,#F59E0B)',
          backgroundSize: '300% auto',
          animation: 'shimmer 3s linear infinite',
        }}
      />

      {/* Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Animated logo */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-4 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg,#F59E0B,#EF4444,#EC4899,#8B5CF6)',
            boxShadow: '0 0 0 3px #fff4, 0 0 40px #8B5CF660',
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          🌾
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-serif uppercase drop-shadow-lg">
          {settings.businessName}
        </h1>
        <p className="mt-1 text-sm text-white/70 font-semibold tracking-wide">
          {settings.tagline}
        </p>

        {/* GSTIN badge */}
        <div
          className="inline-flex items-center space-x-2 mt-3 px-4 py-1.5 rounded-full text-[11px] font-mono font-bold text-white shadow-lg"
          style={{ background: 'linear-gradient(90deg,#22C55E44,#16A34A44)', border: '1px solid #22C55E66' }}
        >
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <span>GSTIN: {settings.gstin}</span>
        </div>
      </div>

      {/* Login card */}
      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div
          className="py-8 px-6 sm:px-10 rounded-3xl shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg,#F59E0B,#EF4444,#8B5CF6,#3B82F6,#22C55E) 1',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          }}
        >
          {/* Card top rainbow bar */}
          <div
            className="h-1 rounded-full mb-5"
            style={{ background: 'linear-gradient(90deg,#F59E0B,#EF4444,#EC4899,#8B5CF6,#3B82F6,#22C55E)' }}
          />

          <div className="text-center mb-5">
            <h2 className="text-base font-black text-gray-900 flex items-center justify-center space-x-1.5">
              <Sprout className="w-4 h-4 text-green-600" />
              <span>Counter Billing Terminal</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter operator or administrator credentials
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-pop-in"
                style={{ background: '#fff1f2', border: '1px solid #fda4af', color: '#9f1239' }}>
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#e11d48' }} />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">Username / Operator ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or operator"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold rounded-xl outline-none lowercase font-mono text-gray-900 shadow-sm transition-all"
                  style={{ border: '2px solid #BBF7D0', background: '#f0fdf4' }}
                  onFocus={(e) => { e.target.style.borderColor = '#16A34A'; e.target.style.boxShadow = '0 0 0 3px #16A34A22'; }}
                  onBlur={(e)  => { e.target.style.borderColor = '#BBF7D0'; e.target.style.boxShadow = 'none'; }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold rounded-xl outline-none text-gray-900 shadow-sm transition-all"
                  style={{ border: '2px solid #DDD6FE', background: '#faf5ff' }}
                  onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px #7C3AED22'; }}
                  onBlur={(e)  => { e.target.style.borderColor = '#DDD6FE'; e.target.style.boxShadow = 'none'; }}
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 text-white font-black text-sm rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: isLoading
                  ? '#9CA3AF'
                  : 'linear-gradient(135deg,#16A34A,#1D4ED8,#7C3AED)',
                boxShadow: isLoading ? 'none' : '0 8px 24px rgba(124,58,237,0.35)',
              }}
            >
              <span>{isLoading ? 'Verifying Terminal…' : 'Sign In to Counter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick fill */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center mb-2">
              Default Accounts (Click to Fill)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="p-2.5 rounded-xl text-left transition-all active:scale-95 shadow-sm hover:shadow-md"
                style={{ background: '#fffbeb', border: '1px solid #FCD34D' }}
              >
                <div className="text-[11px] font-bold flex items-center space-x-1" style={{ color: '#78350F' }}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#D97706' }} />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-gray-600 font-mono mt-0.5">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('operator', 'operator123')}
                className="p-2.5 rounded-xl text-left transition-all active:scale-95 shadow-sm hover:shadow-md"
                style={{ background: '#f0fdf4', border: '1px solid #86EFAC' }}
              >
                <div className="text-[11px] font-bold flex items-center space-x-1" style={{ color: '#14532D' }}>
                  <User className="w-3.5 h-3.5" style={{ color: '#16A34A' }} />
                  <span>Operator</span>
                </div>
                <div className="text-[10px] text-gray-600 font-mono mt-0.5">operator / operator123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer address */}
        <p className="text-center text-xs text-white/70 mt-4 leading-tight font-medium drop-shadow">
          📍 {settings.completeAddress} • 📞 {settings.mobile1} / {settings.mobile2}
        </p>
      </div>

      {/* Bottom rainbow stripe */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{
          background: 'linear-gradient(90deg,#22C55E,#3B82F6,#8B5CF6,#EC4899,#EF4444,#F59E0B)',
          backgroundSize: '300% auto',
          animation: 'shimmer 3s linear infinite',
        }}
      />
    </div>
  );
};
