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

/* ── Nav section type — exported so App.tsx can use it ─────────── */
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

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',     icon: <LayoutDashboard size={17} /> },
  { id: 'billing',    label: 'Billing',        icon: <ShoppingCart size={17} /> },
  { id: 'products',   label: 'Products',       icon: <Package size={17} /> },
  { id: 'customers',  label: 'Customers',      icon: <Users size={17} /> },
  { id: 'history',    label: 'Bill History',   icon: <History size={17} /> },
  { id: 'reports',    label: 'Sales Reports',  icon: <BarChart3 size={17} /> },
  { id: 'backup',     label: 'Backup',         icon: <Database size={17} /> },
  { id: 'users',      label: 'User Mgmt',      icon: <UserCog size={17} />, adminOnly: true },
  { id: 'settings',   label: 'Settings',       icon: <Settings size={17} />, adminOnly: true },
  { id: 'audit',      label: 'Audit Log',      icon: <ClipboardList size={17} />, adminOnly: true },
];

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

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const handleSelect = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <nav className="flex flex-col h-full py-4 px-3 gap-1">
      {/* Section label */}
      <p
        className="px-3 py-2 text-[10px] uppercase tracking-widest mb-1"
        style={{ color: 'rgba(92,124,137,0.5)', letterSpacing: '0.15em' }}
      >
        Navigation
      </p>

      {visibleItems.map((item) => (
        <button
          key={item.id}
          id={`nav-${item.id}`}
          onClick={() => handleSelect(item.id)}
          className={`nav-item w-full text-left ${currentSection === item.id ? 'active' : ''}`}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      {/* Admin section label */}
      {isAdmin && (
        <>
          <div className="divider-arch my-3 mx-1" />
          <p
            className="px-3 py-1 text-[10px] uppercase tracking-widest mb-1"
            style={{ color: 'rgba(92,124,137,0.5)', letterSpacing: '0.15em' }}
          >
            Administration
          </p>
        </>
      )}
    </nav>
  );

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 no-print overflow-y-auto"
        style={{
          background: 'rgba(0, 10, 20, 0.85)',
          borderRight: '1px solid rgba(92,124,137,0.12)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Overlay ──────────────────────────────────────── */}
      {isOpenMobile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onCloseMobile}
          />

          {/* Slide-in drawer */}
          <aside
            className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col overflow-y-auto animate-slide-in-left lg:hidden"
            style={{
              background: 'rgba(0, 10, 20, 0.97)',
              borderRight: '1px solid rgba(92,124,137,0.18)',
            }}
          >
            {/* Close button */}
            <div
              className="flex items-center justify-between px-4 h-14 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(92,124,137,0.12)' }}
            >
              <span
                className="font-display font-medium text-sm text-white/80 tracking-wider"
                style={{ letterSpacing: '0.08em' }}
              >
                MENU
              </span>
              <button
                onClick={onCloseMobile}
                className="btn-ghost p-2"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};
