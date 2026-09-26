import React from 'react';
import { Menu, LogOut, Wheat, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { t } = useSettings();

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0 no-print z-20 shadow-soft"
      style={{
        background: '#023337',
        borderBottom: '1px solid rgba(193, 230, 186, 0.25)',
      }}
    >
      {/* Left — hamburger + brand */}
      <div className="flex items-center gap-3">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-2 -ml-1 lg:hidden text-white/80 hover:text-white rounded-lg hover:bg-[#145046] transition-colors"
          aria-label={t.navNavigation}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4DA674 0%, #287056 100%)',
              border: '1px solid #C1E6BA',
            }}
          >
            <Wheat size={16} className="text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span
              className="font-display font-bold text-white text-sm tracking-wider"
              style={{ letterSpacing: '0.07em' }}
            >
              {t.brandName}
            </span>
            <span className="text-[10px] tracking-widest text-[#C1E6BA] mt-0.5" style={{ letterSpacing: '0.12em' }}>
              {t.brandSub}
            </span>
          </div>
        </div>
      </div>

      {/* Right — language selector + user info + logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher compact />

        {currentUser && (
          <>
            {/* User badge */}
            <div
              className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5"
              style={{
                background: 'rgba(18, 75, 70, 0.65)',
                border: '1px solid rgba(193, 230, 186, 0.25)',
              }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: isAdmin ? '#4DA674' : '#145046' }}
              >
                {isAdmin ? <Shield size={12} className="text-white" /> : <User size={12} className="text-white" />}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-semibold text-white">{currentUser.name}</span>
                <span className="text-[10px] text-[#C1E6BA] mt-0.5">
                  {currentUser.role === 'ADMIN' ? t.roleAdmin : t.roleOperator}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              id="header-logout-btn"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg text-white/90 hover:text-white hover:bg-[#145046] transition-colors border border-transparent hover:border-[#348667]/40 cursor-pointer"
              title={t.logout}
               aria-label={t.logout}
            >
              <LogOut size={15} />
              <span className="hidden sm:inline font-medium">{t.logout}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
