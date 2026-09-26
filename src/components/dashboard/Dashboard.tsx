import React, { useMemo } from 'react';
import {
  ArrowRight,
  Banknote,
  Clock,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { formatNumber, formatPaymentMethod, formatProductCategory, formatUnit } from '../../utils/i18n';
import type { Bill } from '../../types';

interface DashboardProps {
  onNavigateToNewBill: () => void;
  onNavigateToHistory: () => void;
  onSelectBillToView: (bill: Bill) => void;
}

const todayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const paymentIcon = (method: string) => {
  if (method === 'Cash') return <Banknote size={13} aria-hidden="true" />;
  if (method === 'UPI') return <Smartphone size={13} aria-hidden="true" />;
  return <CreditCard size={13} aria-hidden="true" />;
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  tone?: 'primary' | 'secondary' | 'warning';
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, tone = 'primary', delay = 0 }) => {
  const toneClass = tone === 'warning' ? 'stat-card-warning' : tone === 'secondary' ? 'stat-card-secondary' : 'stat-card-primary';
  return (
    <div className={`stat-card ${toneClass} animate-fade-up opacity-0-start`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-100 bg-primary-50 text-secondary-700">{icon}</div>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">{label}</span>
      </div>
      <div className="mt-1">
        <p className="font-mono text-2xl font-bold leading-none text-primary-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-text-tertiary">{sub}</p>}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToNewBill, onNavigateToHistory, onSelectBillToView }) => {
  const { currentUser } = useAuth();
  const { t, language } = useSettings();
  const today = todayISO();
  const todayBills = useLiveQuery(() => db.bills.where('date').equals(today).toArray(), [today], []);
  const recentBills = useLiveQuery(() => db.bills.orderBy('createdAt').reverse().limit(8).toArray(), [], []);
  const lowStockProducts = useLiveQuery(() => db.products.filter((product) => product.active && product.stockQuantity !== undefined && product.minStockAlert !== undefined && product.stockQuantity <= product.minStockAlert).limit(5).toArray(), [], []);

  const stats = useMemo(() => {
    const bills = todayBills ?? [];
    const revenue = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const customers = new Set(bills.map((bill) => bill.customer.name)).size;
    return { count: bills.length, revenue, customers };
  }, [todayBills]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greetingMorning : hour < 17 ? t.greetingAfternoon : t.greetingEvening;
  const formattedDate = new Intl.DateTimeFormat(language === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-6">
      <section className="relative overflow-hidden rounded-2xl border border-primary-700 bg-primary-900 p-6 text-white shadow-soft sm:p-8" aria-labelledby="dashboard-greeting">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative z-10">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary-100">{greeting}</p>
          <h1 id="dashboard-greeting" className="font-display text-2xl font-medium text-white sm:text-3xl">{currentUser?.name || t.brandName}</h1>
          <p className="mt-1 text-sm text-primary-100">{formattedDate}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button id="dash-new-bill-btn" onClick={onNavigateToNewBill} className="btn-primary gap-2 px-5 py-2.5"><ShoppingCart size={16} aria-hidden="true" />{t.newBillButton}</button>
            <button id="dash-history-btn" onClick={onNavigateToHistory} className="btn-light gap-2 px-5 py-2.5"><Clock size={16} aria-hidden="true" />{t.viewHistoryButton}</button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label={t.quickActions}>
        <StatCard label={t.todayBills} value={formatNumber(stats.count, language)} sub={`${formatNumber(stats.customers, language)} ${t.customers.toLowerCase()}`} icon={<ShoppingCart size={18} aria-hidden="true" />} delay={0} />
        <StatCard label={t.revenueToday} value={formatCurrency(stats.revenue, language)} sub={t.inclGst} icon={<TrendingUp size={18} aria-hidden="true" />} tone="secondary" delay={80} />
        <StatCard label={t.totalCustomers} value={formatNumber(stats.customers, language)} sub={t.uniqueToday} icon={<Users size={18} aria-hidden="true" />} tone="secondary" delay={160} />
        <StatCard label={t.lowStockItems} value={formatNumber(lowStockProducts?.length ?? 0, language)} sub={t.itemsNeedRestock} icon={<Package size={18} aria-hidden="true" />} tone={lowStockProducts?.length ? 'warning' : 'primary'} delay={240} />
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card-glass overflow-hidden lg:col-span-2" aria-labelledby="recent-bills-heading">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <h2 id="recent-bills-heading" className="text-sm font-semibold text-primary-900">{t.recentBills}</h2>
            <button onClick={onNavigateToHistory} className="btn-ghost gap-1 py-1.5 text-xs">{t.viewAll}<ArrowRight size={13} aria-hidden="true" /></button>
          </div>
          {recentBills && recentBills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-arch">
                <thead><tr><th>{t.billNumber}</th><th>{t.customerName}</th><th>{t.amount}</th><th>{t.payment}</th><th>{t.time}</th></tr></thead>
                <tbody>{recentBills.map((bill) => <tr key={bill.id} className="cursor-pointer" onClick={() => onSelectBillToView(bill)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectBillToView(bill); } }}>
                  <td><span className="font-mono text-xs text-secondary-700">{bill.billNumber}</span></td>
                  <td><span className="font-medium text-primary-900">{bill.customer.name}</span></td>
                  <td><span className="font-mono font-semibold text-primary-900">{formatCurrency(bill.grandTotal, language)}</span></td>
                  <td><span className="badge-arch gap-1">{paymentIcon(bill.paymentMethod)}{formatPaymentMethod(bill.paymentMethod, language)}</span></td>
                  <td><span className="text-xs text-text-tertiary">{bill.time}</span></td>
                </tr>)}</tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-secondary-700"><ShoppingCart size={22} aria-hidden="true" /></div><p className="text-sm text-text-secondary">{t.noRecentBills}</p><button onClick={onNavigateToNewBill} className="btn-primary px-5 py-2 text-xs">{t.newBillButton}</button></div>
          )}
        </section>

        <section className="card-glass overflow-hidden" aria-labelledby="stock-alerts-heading">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4"><h2 id="stock-alerts-heading" className="text-sm font-semibold text-primary-900">{t.stockAlerts}</h2>{Boolean(lowStockProducts?.length) && <span className="badge-warning">{lowStockProducts?.length}</span>}</div>
          {lowStockProducts && lowStockProducts.length > 0 ? <div className="divide-y divide-border-subtle">{lowStockProducts.map((product) => <div key={product.id} className="flex items-start justify-between gap-3 px-5 py-3.5"><div className="min-w-0"><p className="truncate text-sm font-medium text-primary-900">{product.name}</p><p className="mt-0.5 text-xs text-text-tertiary">{formatProductCategory(product.category, language)}</p></div><div className="flex shrink-0 flex-col items-end"><span className={`text-sm font-bold ${(product.stockQuantity ?? 0) === 0 ? 'text-error' : 'text-warning'}`}>{formatNumber(product.stockQuantity ?? 0, language)}</span><span className="text-[10px] text-text-tertiary">{formatUnit(product.unit, language)}</span></div></div>)}</div> : <div className="flex flex-col items-center justify-center gap-2 py-12 text-center"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-100 bg-primary-50 text-secondary-700"><Package size={18} aria-hidden="true" /></div><p className="text-xs text-text-secondary">{t.noLowStock}</p></div>}
        </section>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-text-secondary"><RefreshCw size={12} aria-hidden="true" />{t.systemOnline}</p>
    </div>
  );
};
