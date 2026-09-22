import React, { useEffect, useState } from 'react';
import {
  ShoppingCart, TrendingUp, Users, Package,
  ArrowRight, Clock, CreditCard, AlertTriangle,
  Banknote, Smartphone, RefreshCw,
} from 'lucide-react';
import { db } from '../../db/db';
import { useAuth } from '../../context/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Bill, Product } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface DashboardProps {
  onNavigateToNewBill: () => void;
  onNavigateToHistory: () => void;
  onSelectBillToView: (bill: Bill) => void;
}

/* ── Helper ────────────────────────────────────────────────────────── */
const todayISO = () => new Date().toISOString().slice(0, 10);

const paymentIcon = (method: string) => {
  if (method === 'Cash') return <Banknote size={13} />;
  if (method === 'UPI')  return <Smartphone size={13} />;
  if (method === 'Card') return <CreditCard size={13} />;
  return <CreditCard size={13} />;
};

/* ── Stat Card ─────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentColor?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, accentColor = '#5C7C89', delay = 0 }) => (
  <div
    className="stat-card animate-fade-up opacity-0-start"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    <div className="flex items-start justify-between">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}35`,
          color: accentColor,
        }}
      >
        {icon}
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-widest mt-1"
        style={{ color: 'rgba(92,124,137,0.6)', letterSpacing: '0.12em' }}
      >
        TODAY
      </span>
    </div>
    <div className="mt-2">
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs mt-1" style={{ color: accentColor }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
    </div>
  </div>
);

/* ── Main Dashboard ─────────────────────────────────────────────────── */
export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToNewBill,
  onNavigateToHistory,
  onSelectBillToView,
}) => {
  const { currentUser } = useAuth();
  const today = todayISO();

  /* Live Dexie queries */
  const todayBills = useLiveQuery(
    () => db.bills.where('date').equals(today).toArray(),
    [today],
    []
  );

  const recentBills = useLiveQuery(
    () => db.bills.orderBy('createdAt').reverse().limit(8).toArray(),
    [],
    []
  );

  const lowStockProducts = useLiveQuery(
    () =>
      db.products
        .filter(
          p =>
            p.active &&
            p.stockQuantity !== undefined &&
            p.minStockAlert !== undefined &&
            p.stockQuantity <= p.minStockAlert
        )
        .limit(5)
        .toArray(),
    [],
    []
  );

  /* Computed today stats */
  const todaySales  = todayBills?.length ?? 0;
  const todayRev    = todayBills?.reduce((s, b) => s + b.grandTotal, 0) ?? 0;
  const todayCustomers = new Set(todayBills?.map(b => b.customer.name)).size;

  /* Greeting */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6 pb-6">
      {/* ── Welcome banner ─────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 sm:p-8 relative overflow-hidden animate-fade-up"
        style={{
          background: 'linear-gradient(135deg, rgba(31,73,89,0.55) 0%, rgba(1,20,37,0.7) 100%)',
          border: '1px solid rgba(92,124,137,0.22)',
        }}
      >
        {/* Arch accent */}
        <div
          className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 120% at 100% 50%, rgba(92,124,137,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(92,124,137,0.7)', letterSpacing: '0.15em' }}>
            {greeting}
          </p>
          <h1 className="font-display font-light text-2xl sm:text-3xl text-white">
            {currentUser?.name ?? 'Welcome'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              id="dash-new-bill-btn"
              onClick={onNavigateToNewBill}
              className="btn-primary gap-2 py-2.5 px-5"
            >
              <ShoppingCart size={16} />
              New Bill
            </button>
            <button
              id="dash-history-btn"
              onClick={onNavigateToHistory}
              className="btn-outline gap-2 py-2.5 px-5"
            >
              <Clock size={16} />
              Bill History
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bills Today"
          value={todaySales}
          sub={`${todayCustomers} customers`}
          icon={<ShoppingCart size={18} />}
          accentColor="#5C7C89"
          delay={0}
        />
        <StatCard
          label="Revenue Today"
          value={formatCurrency(todayRev)}
          sub="incl. GST"
          icon={<TrendingUp size={18} />}
          accentColor="#4ade80"
          delay={80}
        />
        <StatCard
          label="Customers"
          value={todayCustomers}
          sub="unique today"
          icon={<Users size={18} />}
          accentColor="#60a5fa"
          delay={160}
        />
        <StatCard
          label="Low Stock"
          value={lowStockProducts?.length ?? 0}
          sub="items need restock"
          icon={<Package size={18} />}
          accentColor={lowStockProducts?.length ? '#fbbf24' : '#5C7C89'}
          delay={240}
        />
      </div>

      {/* ── Bottom grid ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Bills */}
        <div className="lg:col-span-2 card-glass">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(92,124,137,0.12)' }}>
            <h2 className="font-semibold text-white text-sm tracking-wide">Recent Bills</h2>
            <button
              onClick={onNavigateToHistory}
              className="btn-ghost text-xs py-1.5 gap-1"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          {recentBills && recentBills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-arch">
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBills.map(bill => (
                    <tr
                      key={bill.id}
                      className="cursor-pointer"
                      onClick={() => onSelectBillToView(bill)}
                    >
                      <td>
                        <span className="font-mono text-xs" style={{ color: '#5C7C89' }}>
                          {bill.billNumber}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-white/85">{bill.customer.name}</span>
                      </td>
                      <td>
                        <span className="font-semibold text-white">{formatCurrency(bill.grandTotal)}</span>
                      </td>
                      <td>
                        <span className="badge-arch gap-1">
                          {paymentIcon(bill.paymentMethod)}
                          {bill.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {bill.time}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(92,124,137,0.1)', border: '1px solid rgba(92,124,137,0.15)' }}
              >
                <ShoppingCart size={22} style={{ color: 'rgba(92,124,137,0.5)' }} />
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No bills yet. Create your first bill!</p>
              <button onClick={onNavigateToNewBill} className="btn-primary py-2 px-5 text-xs mt-1">
                New Bill
              </button>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="card-glass">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(92,124,137,0.12)' }}>
            <h2 className="font-semibold text-white text-sm tracking-wide">Stock Alerts</h2>
            {lowStockProducts && lowStockProducts.length > 0 && (
              <span className="badge-warning">{lowStockProducts.length}</span>
            )}
          </div>

          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
              {lowStockProducts.map(product => (
                <div
                  key={product.id}
                  className="px-5 py-3.5 flex items-start justify-between gap-3"
                  style={{ borderColor: 'rgba(92,124,137,0.08)' }}
                >
                  <div className="min-w-0">
                    <p className="text-white/85 text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{product.category}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className="text-sm font-bold"
                      style={{ color: (product.stockQuantity ?? 0) === 0 ? '#f87171' : '#fbbf24' }}
                    >
                      {product.stockQuantity ?? 0}
                    </span>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{product.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <Package size={18} style={{ color: '#4ade80' }} />
              </div>
              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                All stock levels are healthy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
