import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { translations } from '../../utils/translations';
import {
  LayoutDashboard,
  ReceiptText,
  Boxes,
  Users,
  History,
  BarChart3,
  HardDriveDownload,
  UserCog,
  Settings,
  ShieldAlert,
  X
} from 'lucide-react';

export type NavSection =
  | 'dashboard'
  | 'billing'
  | 'products'
  | 'customers'
  | 'history'
  | 'reports'
  | 'backup'
  | 'users'
  | 'settings'
  | 'audit';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile
}) => {
  const { isAdmin } = useAuth();
  const { language } = useSettings();
  const t = translations[language];

  interface NavItem {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    adminOnly?: boolean;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: `🌾 ${t.dashboard}`, icon: LayoutDashboard },
    { id: 'billing', label: `🧾 ${t.newBill}`, icon: ReceiptText, badge: 'F2' },
    { id: 'products', label: `📦 ${t.products}`, icon: Boxes },
    { id: 'customers', label: `👥 ${t.customers}`, icon: Users },
    { id: 'history', label: `📋 ${t.billHistory}`, icon: History },
    { id: 'reports', label: `📊 ${t.reports}`, icon: BarChart3 },
    { id: 'backup', label: `💾 ${t.backup}`, icon: HardDriveDownload },
    { id: 'users', label: `👤 ${t.users}`, icon: UserCog, adminOnly: true },
    { id: 'settings', label: `⚙ ${t.settings}`, icon: Settings, adminOnly: true },
    { id: 'audit', label: `🛡 ${t.auditLogs}`, icon: ShieldAlert, adminOnly: true },
  ];

  const handleSelect = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-agri-200 flex flex-col shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out print:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between lg:hidden bg-agri-800 text-white">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌾</span>
            <span className="font-bold">A.S.Praveen Traders</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-agri-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter Quick Action */}
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={() => handleSelect('billing')}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-[0.98] ${
              currentSection === 'billing'
                ? 'bg-agri-700 ring-2 ring-agri-gold ring-offset-2'
                : 'bg-gradient-to-r from-agri-600 to-agri-700 hover:from-agri-700 hover:to-agri-800'
            }`}
          >
            <ReceiptText className="w-5 h-5 text-agri-gold" />
            <span>{t.newBill}</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono text-agri-gold ml-1">F2</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const isActive = currentSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-agri-100 text-agri-800 border-l-4 border-agri-700 font-bold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-agri-800'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-agri-700' : 'text-gray-500 group-hover:text-agri-700'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Agricultural Shop Sidebar Footer Badge */}
        <div className="p-3 border-t border-gray-100 bg-agri-50/70">
          <div className="p-2.5 rounded-lg bg-white border border-agri-200 text-xs text-gray-600 shadow-sm">
            <div className="flex items-center space-x-1.5 font-bold text-agri-800">
              <span>🌾</span>
              <span>Farm Counter v1.0</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Guaranteed Offline Persistent Storage (IndexedDB)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
