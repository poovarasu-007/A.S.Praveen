import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  History,
  BarChart3,
  Database,
  UserCog,
  Settings,
  ClipboardList,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

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
  onCloseMobile,
}) => {
  const { isAdmin } = useAuth();
  const { t } = useSettings();

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard',  label: t.dashboard,     icon: <LayoutDashboard size={18} /> },
    { id: 'billing',    label: t.billing,       icon: <ShoppingCart size={18} /> },
    { id: 'products',   label: t.products,      icon: <Package size={18} /> },
    { id: 'customers',  label: t.customers,     icon: <Users size={18} /> },
    { id: 'history',    label: t.billHistory,   icon: <History size={18} /> },
    { id: 'reports',    label: t.reports,       icon: <BarChart3 size={18} /> },
    { id: 'backup',     label: t.backup,        icon: <Database size={18} /> },
    { id: 'users',      label: t.users,         icon: <UserCog size={18} />, adminOnly: true },
    { id: 'settings',   label: t.settings,      icon: <Settings size={18} />, adminOnly: true },
    { id: 'audit',      label: t.auditLogs,     icon: <ClipboardList size={18} />, adminOnly: true },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleSelect = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <nav className="flex flex-col h-full py-4 px-3 gap-1">
      {/* Section label */}
      <p
        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 text-[#C1E6BA]/80"
        style={{ letterSpacing: '0.12em' }}
      >
        {t.navNavigation}
      </p>

      {visibleItems.map((item) => {
        const isActive = currentSection === item.id;
        return (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => handleSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-180 cursor-pointer select-none text-left ${
              isActive
                ? 'bg-[#C1E6BA] text-[#023337] shadow-sm font-bold'
                : 'text-white/80 hover:text-white hover:bg-[#145046]'
            }`}
          >
            <span className={`flex-shrink-0 ${isActive ? 'text-[#023337]' : 'text-[#C1E6BA]'}`}>
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}

      {/* Admin section label if admin */}
      {isAdmin && (
        <div className="mt-2 pt-2 border-t border-[#124B46]">
          <p
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-1 text-[#C1E6BA]/80"
            style={{ letterSpacing: '0.12em' }}
          >
            {t.navAdministration}
          </p>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0 no-print overflow-y-auto z-10"
        style={{
          background: '#023337',
          borderRight: '1px solid rgba(193, 230, 186, 0.2)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Sidebar Drawer ───────────────────────────────── */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#023337]/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div
            className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl z-10"
            style={{ background: '#023337' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#124B46]">
              <span className="font-display font-bold text-white text-base">
                {t.brandName}
              </span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-[#145046]"
                aria-label={t.close}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
