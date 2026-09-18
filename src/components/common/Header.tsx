import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatDate, formatTime } from '../../utils/date';
import {
  Wifi,
  WifiOff,
  User as UserIcon,
  LogOut,
  Menu,
  Globe,
  ShieldCheck,
  Building2,
  PhoneCall
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { settings, isOnline, language, setLanguage } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="text-white shadow-xl select-none print:hidden"
      style={{
        background: 'linear-gradient(135deg, #14532D 0%, #166534 18%, #1D4ED8 45%, #7C3AED 70%, #BE185D 100%)',
        borderBottom: '3px solid transparent',
        borderImage: 'linear-gradient(90deg,#F59E0B,#EF4444,#EC4899,#8B5CF6,#3B82F6,#22C55E) 1',
      }}
    >
      {/* Colourful stripe */}
      <div
        className="h-1 w-full"
        style={{
          background: 'linear-gradient(90deg,#F59E0B,#EF4444,#EC4899,#8B5CF6,#3B82F6,#22C55E,#F59E0B)',
        }}
      />

      {/* Main header row */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white focus:outline-none"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-2">
            {/* Logo badge with rainbow ring */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg,#F59E0B,#EF4444,#EC4899)',
                boxShadow: '0 0 0 2px #fff, 0 0 0 4px #8B5CF6',
              }}
            >
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white font-serif drop-shadow-sm">
                  {settings.businessName}
                </h1>
                {/* Colourful GST badge */}
                <span
                  className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-black tracking-wider rounded-full text-white shadow-sm"
                  style={{ background: 'linear-gradient(90deg,#22C55E,#15803D)' }}
                >
                  ✓ GST Verified
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium hidden sm:block">
                {settings.tagline}&nbsp;•&nbsp;
                <span className="font-bold" style={{ color: '#FCD34D' }}>
                  GSTIN: {settings.gstin}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Address (large screens) */}
        <div className="hidden xl:flex flex-col text-xs text-right text-white/80 leading-tight">
          <div className="flex items-center justify-end space-x-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#FCD34D' }} />
            <span>{settings.completeAddress}</span>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-0.5 text-white/60">
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3 h-3" style={{ color: '#FCD34D' }} />
              <span>{settings.mobile1} / {settings.mobile2}</span>
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center space-x-2 md:space-x-3 text-xs">
          {/* Live clock */}
          <div
            className="hidden md:flex flex-col items-end px-2.5 py-1 rounded-lg border border-white/20"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            <span className="font-semibold text-white/90">{formatDate(currentTime)}</span>
            <span className="font-mono font-bold text-[11px]" style={{ color: '#FCD34D' }}>
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Online / Offline badge */}
          <div
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border ${
              isOnline
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                : 'bg-amber-500/20 border-amber-400/50 text-amber-200'
            }`}
            title={isOnline ? 'System connected' : 'Offline – bills saved locally'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-300" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Language switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg font-bold border border-white/20 transition-colors hover:bg-white/15"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            title="Toggle Tamil / English"
          >
            <Globe className="w-3.5 h-3.5" style={{ color: '#FCD34D' }} />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* User chip */}
          {currentUser && (
            <div
              className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-lg border border-white/20"
              style={{ background: 'rgba(0,0,0,0.25)' }}
            >
              <div className="flex items-center space-x-1.5">
                <div
                  className="p-1 rounded"
                  style={{
                    background: isAdmin
                      ? 'linear-gradient(135deg,#F59E0B,#D97706)'
                      : 'linear-gradient(135deg,#22C55E,#15803D)',
                  }}
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-white leading-none">{currentUser.name}</span>
                  <span className="text-[10px] text-white/60 capitalize">{currentUser.role.toLowerCase()}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-white/60 hover:text-rose-300 hover:bg-white/10 rounded transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile address bar */}
      <div
        className="xl:hidden px-4 py-1 text-[11px] text-white/70 flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ background: 'rgba(0,0,0,0.25)' }}
      >
        <span>📍 {settings.completeAddress}</span>
        <span className="font-bold ml-2" style={{ color: '#FCD34D' }}>
          📞 {settings.mobile1}
        </span>
      </div>
    </header>
  );
};
