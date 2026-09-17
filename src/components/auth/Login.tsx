import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Lock, User, ShieldCheck, AlertCircle, ArrowRight, Wheat } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Agricultural Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-agri-700 to-agri-900 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl border-2 border-agri-gold">
          🌾
        </div>

        <h2 className="mt-4 text-2xl md:text-3xl font-black text-agri-950 tracking-tight font-serif uppercase">
          {settings.businessName}
        </h2>
        <p className="mt-1 text-xs text-agri-800 font-semibold tracking-wide">
          {settings.tagline}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          GSTIN: <strong className="text-gray-800">{settings.gstin}</strong>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-agri-200 sm:px-10">
          <div className="border-b border-gray-100 pb-4 mb-5 text-center">
            <h3 className="text-base font-bold text-gray-800">
              Counter Billing Terminal Login
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter authorized operator or administrator credentials
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Username / Operator ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or operator"
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none lowercase font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-agri-700 to-agri-800 hover:from-agri-800 hover:to-agri-900 disabled:bg-gray-400 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In to Counter'}</span>
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
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors"
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
                className="p-2 rounded-xl bg-agri-50 hover:bg-agri-100 border border-agri-200 text-left transition-colors"
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
        <p className="text-center text-xs text-gray-500 mt-4 leading-tight">
          {settings.completeAddress} • Ph: {settings.mobile1}
        </p>
      </div>
    </div>
  );
};
