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
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none bg-agri-950 overflow-hidden">
      {/* Agricultural Background Image with Rich Dark Green Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transform transition-transform duration-1000 ease-out"
        style={{ backgroundImage: "url('/images/farmer_bullock_ploughing.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-agri-950 via-agri-900/80 to-agri-950/90" />

      {/* Subtle Pattern Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Agricultural Logo Badge */}
        <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-gradient-to-br from-agri-gold via-yellow-400 to-amber-600 shadow-2xl border-2 border-white/50 text-agri-950 text-3xl mb-3 animate-pulse">
          🌾
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-serif uppercase drop-shadow-md">
          {settings.businessName}
        </h1>
        <p className="mt-1 text-xs md:text-sm text-emerald-200 font-semibold tracking-wide">
          {settings.tagline}
        </p>
        <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 rounded-full bg-agri-900/80 border border-agri-gold/40 text-[11px] text-agri-gold font-mono font-bold shadow-inner">
          <Sparkles className="w-3 h-3 text-agri-gold" />
          <span>GSTIN: {settings.gstin}</span>
        </div>
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border-2 border-agri-600/30 sm:px-10">
          <div className="border-b border-gray-100 pb-4 mb-5 text-center">
            <h2 className="text-base font-black text-agri-950 flex items-center justify-center space-x-1.5">
              <Sprout className="w-4 h-4 text-agri-600" />
              <span>Counter Billing Terminal</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter operator or administrator credentials
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Username / Operator ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or operator"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-agri-600 focus:border-agri-600 outline-none lowercase font-mono bg-emerald-50/20 text-gray-900 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-agri-600 focus:border-agri-600 outline-none bg-emerald-50/20 text-gray-900 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-agri-700 via-emerald-700 to-agri-800 hover:from-agri-800 hover:to-emerald-900 disabled:bg-gray-400 text-white font-black text-sm rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ring-2 ring-agri-gold/40"
              >
                <span>{isLoading ? 'Verifying Terminal...' : 'Sign In to Counter'}</span>
                <ArrowRight className="w-4 h-4 text-agri-gold" />
              </button>
            </div>
          </form>

          {/* Quick Credential Helpers */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center mb-2">
              Default System Accounts (Click to Fill):
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all active:scale-95 shadow-sm"
              >
                <div className="text-[11px] font-bold text-amber-900 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-gray-600 font-mono mt-0.5">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('operator', 'operator123')}
                className="p-2.5 rounded-xl bg-agri-50 hover:bg-agri-100 border border-agri-200 text-left transition-all active:scale-95 shadow-sm"
              >
                <div className="text-[11px] font-bold text-agri-900 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-agri-700" />
                  <span>Operator</span>
                </div>
                <div className="text-[10px] text-gray-600 font-mono mt-0.5">operator / operator123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Address */}
        <p className="text-center text-xs text-emerald-200/90 mt-4 leading-tight font-medium drop-shadow">
          📍 {settings.completeAddress} • 📞 {settings.mobile1} / {settings.mobile2}
        </p>
      </div>
    </div>
  );
};

