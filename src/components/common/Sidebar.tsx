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

// Per-nav-item colour config
const NAV_COLOURS: Record<NavSection, { bg: string; text: string; border: string; iconColor: string; badge: string }> = {
  dashboard: { bg: '#f0fdf4', text: '#14532D', border: '#16A34A', iconColor: '#16A34A', badge: '#dcfce7' },
  billing:   { bg: '#fffbeb', text: '#78350F', border: '#D97706', iconColor: '#D97706', badge: '#fef3c7' },
  products:  { bg: '#eff6ff', text: '#1e3a8a', border: '#2563EB', iconColor: '#2563EB', badge: '#dbeafe' },
  customers: { bg: '#faf5ff', text: '#4C1D95', border: '#7C3AED', iconColor: '#7C3AED', badge: '#ede9fe' },
  history:   { bg: '#fdf2f8', text: '#831843', border: '#BE185D', iconColor: '#BE185D', badge: '#fce7f3' },
  reports:   { bg: '#ecfeff', text: '#164e63', border: '#0891B2', iconColor: '#0891B2', badge: '#cffafe' },
  backup:    { bg: '#fff7ed', text: '#7c2d12', border: '#EA580C', iconColor: '#EA580C', badge: '#ffedd5' },
  users:     { bg: '#f0fdf4', text: '#14532D', border: '#15803D', iconColor: '#15803D', badge: '#dcfce7' },
  settings:  { bg: '#f8fafc', text: '#0f172a', border: '#475569', iconColor: '#475569', badge: '#f1f5f9' },
  audit:     { bg: '#fff1f2', text: '#7f1d1d', border: '#DC2626', iconColor: '#DC2626', badge: '#fee2e2' },
};

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
    { id: 'billing',   label: `🧾 ${t.newBill}`,    icon: ReceiptText, badge: 'F2' },
    { id: 'products',  label: `📦 ${t.products}`,   icon: Boxes },
    { id: 'customers', label: `👥 ${t.customers}`,  icon: Users },
    { id: 'history',   label: `📋 ${t.billHistory}`,icon: History },
    { id: 'reports',   label: `📊 ${t.reports}`,    icon: BarChart3 },
    { id: 'backup',    label: `💾 ${t.backup}`,     icon: HardDriveDownload },
    { id: 'users',     label: `👤 ${t.users}`,      icon: UserCog, adminOnly: true },
    { id: 'settings',  label: `⚙ ${t.settings}`,   icon: Settings, adminOnly: true },
    { id: 'audit',     label: `🛡 ${t.auditLogs}`,  icon: ShieldAlert, adminOnly: true },
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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out print:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'linear-gradient(180deg,#f8fafc 0%,#f0fdf4 50%,#faf5ff 100%)', borderRight: '1px solid #e2e8f0' }}
      >
        {/* Mobile header in drawer */}
        <div
          className="p-4 border-b flex items-center justify-between lg:hidden text-white"
          style={{ background: 'linear-gradient(135deg,#14532D,#1D4ED8,#7C3AED)' }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌾</span>
            <span className="font-bold">A.S.Praveen Traders</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo area (desktop) */}
        <div
          className="hidden lg:flex items-center space-x-3 px-4 py-4 border-b border-white/40"
          style={{
            background: 'linear-gradient(135deg,#14532D 0%,#166534 40%,#1D4ED8 80%,#7C3AED 100%)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444,#EC4899)' }}
          >
            🌾
          </div>
          <div>
            <p className="font-black text-sm text-white leading-tight">A.S.Praveen Traders</p>
            <p className="text-[10px] text-white/60">Agri Billing System</p>
          </div>
        </div>

        {/* New Bill quick action */}
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={() => handleSelect('billing')}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-white font-black text-sm tracking-wide shadow-lg transition-all active:scale-[0.98]`}
            style={{
              background: currentSection === 'billing'
                ? 'linear-gradient(135deg,#D97706,#B45309)'
                : 'linear-gradient(135deg,#F59E0B,#D97706,#B45309)',
              boxShadow: '0 4px 14px rgba(217,119,6,0.4)',
            }}
          >
            <ReceiptText className="w-5 h-5" />
            <span>{t.newBill}</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono ml-1">F2</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const isActive = currentSection === item.id;
            const colours = NAV_COLOURS[item.id];
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={
                  isActive
                    ? {
                        background: colours.bg,
                        color: colours.text,
                        borderLeft: `4px solid ${colours.border}`,
                        boxShadow: `0 2px 8px ${colours.border}22`,
                        fontWeight: 800,
                      }
                    : { color: '#374151' }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = colours.bg;
                    (e.currentTarget as HTMLElement).style.color = colours.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = '';
                    (e.currentTarget as HTMLElement).style.color = '#374151';
                  }
                }}
              >
                <div className="flex items-center space-x-3 truncate">
                  <span style={{ color: isActive ? colours.iconColor : '#6B7280', display: 'flex' }}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {item.badge && !isActive && (
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                  {item.adminOnly && (
                    <span
                      className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}
                    >
                      Admin
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer with Traditional Agriculture Photo Card */}
        <div className="p-3 border-t border-gray-100">
          <div className="relative rounded-2xl overflow-hidden shadow-md text-white border border-amber-400/40 p-3 flex flex-col justify-end min-h-[95px]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
              style={{ backgroundImage: "url('/images/farmer_bullock_ploughing.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-950 via-agri-950/80 to-transparent" />
            <div className="relative z-10 space-y-1">
              <div className="flex items-center space-x-1.5 font-black text-yellow-300 text-xs">
                <span>🌾</span>
                <span>உழவே தலை • Farm Billing</span>
              </div>
              <p className="text-[10px] text-emerald-100 font-medium leading-tight">
                பாரம்பரிய விவசாயம் & வேளாண் இடுபொருட்கள்
              </p>
              {/* Rainbow bar */}
              <div
                className="mt-1.5 h-1 rounded-full"
                style={{ background: 'linear-gradient(90deg,#F59E0B,#EF4444,#8B5CF6,#3B82F6,#22C55E)' }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
