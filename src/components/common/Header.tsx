import React from 'react';
import { Menu, LogOut, Wheat, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout, isAdmin } = useAuth();

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0 no-print"
      style={{
        background: 'rgba(1, 14, 26, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(92,124,137,0.15)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Left — hamburger + brand */}
      <div className="flex items-center gap-3">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="btn-ghost p-2 -ml-1 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1F4959 0%, #2d6275 100%)',
              border: '1px solid rgba(92,124,137,0.35)',
            }}
          >
            <Wheat size={14} className="text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span
              className="font-display font-medium text-white text-sm tracking-wider"
              style={{ letterSpacing: '0.07em' }}
            >
              A.S. PRAVEEN TRADERS
            </span>
            <span className="text-[10px] tracking-widest" style={{ color: 'rgba(92,124,137,0.65)', letterSpacing: '0.12em' }}>
              BILLING SYSTEM
            </span>
          </div>
        </div>
      </div>

      {/* Right — user info + logout */}
      {currentUser && (
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User badge */}
          <div
            className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{
              background: 'rgba(31,73,89,0.25)',
              border: '1px solid rgba(92,124,137,0.2)',
            }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: isAdmin ? 'rgba(92,124,137,0.3)' : 'rgba(31,73,89,0.5)' }}
            >
              {isAdmin ? <Shield size={12} className="text-white" /> : <User size={12} className="text-white" />}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-semibold text-white/90">{currentUser.name}</span>
              <span
                className="text-[10px]"
                style={{ color: 'rgba(92,124,137,0.75)', letterSpacing: '0.06em' }}
              >
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            id="header-logout-btn"
            onClick={logout}
            className="btn-ghost gap-1.5 text-xs py-2"
            title="Logout"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
