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
    <header className="bg-gradient-to-r from-agri-800 via-agri-700 to-agri-900 text-white shadow-md border-b-2 border-agri-gold/40 select-none print:hidden">
      {/* Top Banner with Fixed Business Details */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white focus:outline-none"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-agri-gold/20 border border-agri-gold/40 flex items-center justify-center text-2xl shadow-inner">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white font-serif drop-shadow-sm">
                  {settings.businessName}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-agri-gold text-agri-900 shadow-sm">
                  GST Verified
                </span>
              </div>
              <p className="text-xs text-agri-200 font-medium hidden sm:block">
                {settings.tagline} • <span className="text-agri-gold font-semibold">GSTIN: {settings.gstin}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center/Address Info */}
        <div className="hidden xl:flex flex-col text-xs text-right text-agri-100/90 leading-tight">
          <div className="flex items-center justify-end space-x-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-agri-gold shrink-0" />
            <span>{settings.completeAddress}</span>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-0.5 text-agri-200">
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3 h-3 text-agri-gold" />
              <span>{settings.mobile1} / {settings.mobile2}</span>
            </span>
          </div>
        </div>

        {/* Right Controls: Live Clock, Language, Status & User */}
        <div className="flex items-center space-x-2 md:space-x-3 text-xs">
          {/* Live Date and Time */}
          <div className="hidden md:flex flex-col items-end bg-black/25 px-2.5 py-1 rounded border border-white/10">
            <span className="font-semibold text-agri-100">{formatDate(currentTime)}</span>
            <span className="font-mono text-agri-gold font-bold text-[11px]">{formatTime(currentTime)}</span>
          </div>

          {/* Online / Offline Status Badge */}
          <div
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border ${
              isOnline
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/70 border-amber-500/40 text-amber-300 animate-pulse'
            }`}
            title={isOnline ? 'System is connected' : 'Offline mode active - bills are saved locally'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Bilingual Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium border border-white/15 transition-colors"
            title="Toggle Tamil / English"
          >
            <Globe className="w-3.5 h-3.5 text-agri-gold" />
            <span className="font-bold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Current User & Logout */}
          {currentUser && (
            <div className="flex items-center space-x-2 bg-black/20 pl-2 pr-1 py-1 rounded-lg border border-white/10">
              <div className="flex items-center space-x-1.5">
                <div className={`p-1 rounded ${isAdmin ? 'bg-agri-gold text-agri-900' : 'bg-agri-600 text-white'}`}>
                  {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-white leading-none">{currentUser.name}</span>
                  <span className="text-[10px] text-agri-300 capitalize">{currentUser.role.toLowerCase()}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-agri-300 hover:text-rose-400 hover:bg-white/10 rounded transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Address Bar */}
      <div className="xl:hidden px-4 py-1 bg-agri-950/60 text-[11px] text-agri-200 flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap">
        <span>📍 {settings.completeAddress}</span>
        <span className="font-bold text-agri-gold ml-2">📞 {settings.mobile1}</span>
      </div>
    </header>
  );
};
