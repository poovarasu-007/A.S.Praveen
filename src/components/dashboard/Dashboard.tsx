import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatTime, getTodayDateString } from '../../utils/date';
import type { Bill } from '../../types';
import {
  ReceiptText,
  TrendingUp,
  Package,
  Users,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpRight,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  onNavigateToNewBill: () => void;
  onNavigateToHistory: () => void;
  onSelectBillToView: (bill: Bill) => void;
}

// Colourful KPI card config
const KPI_STYLES = [
  { label: "Today's Bills",    valueKey: 'todayBills',       subKey: 'todayAvgBill',      icon: ReceiptText,  from: '#22C55E', to: '#15803D', bg: '#f0fdf4', sub: 'Avg:',        subFmt: 'currency' },
  { label: "Today's Revenue",  valueKey: 'todayRevenue',     subKey: 'todayTaxCollected', icon: TrendingUp,   from: '#3B82F6', to: '#1D4ED8', bg: '#eff6ff', sub: 'GST:',        subFmt: 'currency' },
  { label: 'Total Customers',  valueKey: 'allCustomers',     subKey: 'todayCustomers',    icon: Users,        from: '#8B5CF6', to: '#7C3AED', bg: '#faf5ff', sub: 'Today:',      subFmt: 'buyers'   },
  { label: 'Catalog Items',    valueKey: 'allProducts',      subKey: 'todayItemsSold',    icon: Package,      from: '#F97316', to: '#EA580C', bg: '#fff7ed', sub: 'Sold Today:', subFmt: 'plain'    },
  { label: 'Pending Credit',   valueKey: 'totalCredit',      subKey: 'todayCredit',       icon: CreditCard,   from: '#F43F5E', to: '#E11D48', bg: '#fff1f2', sub: 'Today:',      subFmt: 'currency' },
  { label: 'Monthly Revenue',  valueKey: 'monthRevenue',     subKey: 'monthBillsCount',   icon: Calendar,     from: '#F59E0B', to: '#D97706', bg: '#fffbeb', sub: 'Bills:',      subFmt: 'plain'    },
];

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToNewBill,
  onNavigateToHistory,
  onSelectBillToView,
}) => {
  const { currentUser } = useAuth();
  const { settings } = useSettings();

  const allBills      = useLiveQuery(() => db.bills.toArray(),     []) || [];
  const allCustomers  = useLiveQuery(() => db.customers.toArray(), []) || [];
  const allProducts   = useLiveQuery(() => db.products.toArray(),  []) || [];

  const todayStr     = getTodayDateString();
  const todayBills   = allBills.filter((b) => b.date === todayStr);

  const todayRevenue        = todayBills.reduce((s, b) => s + b.grandTotal, 0);
  const todayItemsSold      = todayBills.reduce((s, b) => s + b.items.reduce((is, it) => is + it.quantity, 0), 0);
  const todayCustomersCount = new Set(todayBills.map((b) => b.customer.name.toLowerCase())).size;
  const todayTaxCollected   = todayBills.reduce((s, b) => s + (b.totalTax || 0), 0);
  const todayCash           = todayBills.filter(b => b.paymentMethod === 'Cash').reduce((s, b) => s + b.grandTotal, 0);
  const todayUpi            = todayBills.filter(b => b.paymentMethod === 'UPI').reduce((s, b) => s + b.grandTotal, 0);
  const todayCredit         = todayBills.filter(b => b.paymentMethod === 'Credit').reduce((s, b) => s + b.grandTotal, 0);
  const todayAvgBill        = todayBills.length > 0 ? todayRevenue / todayBills.length : 0;

  const currentMonthPrefix = todayStr.substring(0, 7);
  const monthBills   = allBills.filter((b) => b.date && b.date.startsWith(currentMonthPrefix));
  const monthRevenue = monthBills.reduce((s, b) => s + b.grandTotal, 0);

  const totalPendingCredit = allBills
    .filter(b => b.paymentMethod === 'Credit')
    .reduce((s, b) => s + b.grandTotal, 0);

  // KPI value resolver
  const kpiValues: Record<string, number> = {
    todayBills:        todayBills.length,
    todayRevenue,
    allCustomers:      allCustomers.length,
    allProducts:       allProducts.length,
    totalCredit:       totalPendingCredit,
    monthRevenue,
    todayTaxCollected,
    todayCustomers:    todayCustomersCount,
    todayItemsSold,
    todayCredit,
    monthBillsCount:   monthBills.length,
    todayAvgBill,
  };

  const fmtKpi = (val: number, fmt: string, sub: string) => {
    if (fmt === 'currency') return formatCurrency(val);
    if (fmt === 'buyers')   return `${val} buyers`;
    return String(val);
  };

  // Top products
  const productMap = new Map<string, { name: string; unit: string; qty: number; revenue: number }>();
  allBills.forEach((b) => {
    b.items.forEach((it) => {
      const ex = productMap.get(it.productName);
      if (ex) { ex.qty += it.quantity; ex.revenue += it.totalAmount; }
      else     productMap.set(it.productName, { name: it.productName, unit: it.unit, qty: it.quantity, revenue: it.totalAmount });
    });
  });
  const topProducts = Array.from(productMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Recent bills
  const recentBills = [...allBills]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Payment badge colour
  const payBadge = (method: string) => {
    if (method === 'Cash')   return { bg: '#f0fdf4', color: '#14532D', border: '#86EFAC' };
    if (method === 'UPI')    return { bg: '#eff6ff', color: '#1e3a8a', border: '#93C5FD' };
    if (method === 'Credit') return { bg: '#fff1f2', color: '#7f1d1d', border: '#FCA5A5' };
    return { bg: '#f8fafc', color: '#374151', border: '#e2e8f0' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* ── 1. Hero Banner ─────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl text-white min-h-[220px] flex flex-col justify-between"
        style={{
          background: 'linear-gradient(135deg,#052E16 0%,#14532D 20%,#1D4ED8 55%,#7C3AED 80%,#BE185D 100%)',
        }}
      >
        {/* Agricultural bg image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-105"
          style={{ backgroundImage: "url('/images/farmers_rain_field.jpg')" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,rgba(5,46,22,0.80) 0%,rgba(30,27,75,0.70) 50%,rgba(76,29,149,0.70) 100%)' }}
        />
        {/* Rainbow top stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg,#F59E0B,#EF4444,#EC4899,#8B5CF6,#3B82F6,#22C55E,#F59E0B)',
          }}
        />

        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider mb-2" style={{ color: '#FCD34D' }}>
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <Sparkles className="w-4 h-4" />
                <span>Agricultural Billing &amp; Farm Management System</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight font-serif uppercase drop-shadow-md text-white">
                {settings.businessName}
              </h1>
              <p className="text-sm md:text-base font-serif italic mt-1 font-bold drop-shadow" style={{ color: '#FCD34D' }}>
                "Fresh Inputs. Better Farming. Stronger Future."
              </p>
              <p className="text-xs text-white/70 max-w-xl mt-1">
                📍 {settings.completeAddress} • 📞 {settings.mobile1}
              </p>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToNewBill}
                className="py-3.5 px-6 rounded-2xl font-black text-sm tracking-wide shadow-xl flex items-center space-x-2.5 transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg,#F59E0B,#EF4444)',
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(245,158,11,0.5)',
                }}
              >
                <ReceiptText className="w-5 h-5 stroke-[2.5]" />
                <span>+ NEW BILL (F2)</span>
              </button>

              <button
                onClick={onNavigateToHistory}
                className="py-3.5 px-5 rounded-2xl text-white border font-bold text-xs md:text-sm tracking-wide shadow-lg flex items-center space-x-2 transition-all active:scale-95 hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.30)' }}
              >
                <Clock className="w-4 h-4" style={{ color: '#FCD34D' }} />
                <span>VIEW SALES</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {KPI_STYLES.map((kpi, idx) => {
          const Icon = kpi.icon;
          const mainVal = kpiValues[kpi.valueKey] ?? 0;
          const subVal  = kpiValues[kpi.subKey]   ?? 0;
          const showMain = ['currency'].includes(kpi.subFmt) || idx === 0 || idx === 2 || idx === 3 || idx === 4 || idx === 5
            ? (kpi.subFmt === 'currency' && (idx === 1 || idx === 4 || idx === 5))
              ? formatCurrency(mainVal)
              : String(mainVal)
            : String(mainVal);

          const mainDisplay = (kpi.valueKey.includes('Revenue') || kpi.valueKey.includes('Credit') || kpi.valueKey.includes('month'))
            ? formatCurrency(mainVal)
            : String(mainVal);

          return (
            <div
              key={kpi.label}
              className="rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: kpi.bg,
                borderTop: `4px solid ${kpi.from}`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">
                  {kpi.label}
                </span>
                <div
                  className="p-2 rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg,${kpi.from},${kpi.to})` }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl font-black font-mono" style={{ color: kpi.to }}>
                  {mainDisplay}
                </div>
                <span className="text-[10px] font-medium block mt-0.5" style={{ color: kpi.from }}>
                  {kpi.sub} {fmtKpi(subVal, kpi.subFmt, kpi.sub)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Payment Modes + Top Products ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment breakdown */}
        <div className="bg-white rounded-3xl p-5 shadow-md space-y-3" style={{ border: '2px solid #f0fdf4' }}>
          <h3 className="font-black text-xs uppercase tracking-wider text-gray-900 flex items-center space-x-1.5 border-b border-gray-100 pb-2">
            <span>💳</span>
            <span>Today's Payment Modes</span>
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { icon: Banknote,   label: 'Cash Counter',    amount: todayCash,   from: '#22C55E', to: '#15803D', bg: '#f0fdf4', border: '#86EFAC' },
              { icon: Smartphone, label: 'UPI / QR',        amount: todayUpi,    from: '#3B82F6', to: '#1D4ED8', bg: '#eff6ff', border: '#93C5FD' },
              { icon: CreditCard, label: 'Credit (Khata)',  amount: todayCredit, from: '#F43F5E', to: '#E11D48', bg: '#fff1f2', border: '#FCA5A5' },
            ].map((pm) => {
              const Ic = pm.icon;
              return (
                <div
                  key={pm.label}
                  className="flex justify-between items-center p-3 rounded-2xl"
                  style={{ background: pm.bg, border: `1px solid ${pm.border}` }}
                >
                  <div className="flex items-center space-x-2">
                    <Ic className="w-4 h-4" style={{ color: pm.from }} />
                    <span className="font-bold text-gray-800">{pm.label}</span>
                  </div>
                  <span className="font-mono font-black text-sm" style={{ color: pm.to }}>
                    {formatCurrency(pm.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="md:col-span-2 bg-white rounded-3xl p-5 shadow-md space-y-3" style={{ border: '2px solid #f0fdf4' }}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-black text-xs uppercase tracking-wider text-gray-900 flex items-center space-x-1.5">
              <span>🌾</span>
              <span>Top Selling Agricultural Products</span>
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: '#f0fdf4', color: '#15803D' }}>
              Ranked by qty
            </span>
          </div>

          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No sales recorded yet.</p>
            ) : (
              topProducts.map((p, idx) => {
                const colours = ['#F59E0B','#22C55E','#3B82F6','#8B5CF6','#F43F5E'];
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl text-xs transition-colors hover:bg-gray-50 border border-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-6 h-6 rounded-full text-white font-black text-xs flex items-center justify-center shadow-sm"
                        style={{ background: colours[idx] ?? '#6B7280' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-bold text-gray-900">{p.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className="font-bold px-2.5 py-1 rounded-xl"
                        style={{ background: '#f0fdf4', color: '#14532D', border: '1px solid #86EFAC' }}
                      >
                        {p.qty} {p.unit}
                      </span>
                      <span className="font-mono font-black text-gray-900 w-28 text-right text-sm">
                        {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── 5. Recent Bills Table ───────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-md overflow-hidden" style={{ border: '2px solid #f0fdf4' }}>
        <div
          className="p-4 text-white flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg,#052E16,#14532D,#1D4ED8,#7C3AED)',
            borderBottom: '3px solid #F59E0B',
          }}
        >
          <div className="font-bold text-sm flex items-center space-x-2">
            <Clock className="w-4 h-4" style={{ color: '#FCD34D' }} />
            <span>Recent Counter Bills</span>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs font-black flex items-center space-x-1 transition-colors hover:text-yellow-200"
            style={{ color: '#FCD34D' }}
          >
            <span>View All Bills Archive</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr style={{ background: 'linear-gradient(90deg,#f0fdf4,#eff6ff,#faf5ff)' }}>
                {['Bill Number','Date & Time','Customer','Items','Payment','Grand Total','Action'].map((h) => (
                  <th key={h} className="py-3 px-3 text-xs font-black uppercase tracking-wider text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    <p className="font-bold text-sm text-gray-600">No counter bills created yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Click "+ NEW BILL (F2)" above to begin billing.</p>
                  </td>
                </tr>
              ) : (
                recentBills.map((bill, idx) => {
                  const pb = payBadge(bill.paymentMethod);
                  const rowBg = idx % 2 === 0 ? '#fff' : '#fafbff';
                  return (
                    <tr key={bill.id} style={{ background: rowBg }} className="hover:bg-yellow-50/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-black text-sm" style={{ color: '#15803D' }}>
                        {bill.billNumber}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        <div>{formatDate(bill.date)}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{formatTime(bill.time)}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{bill.customer.name}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className="font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#f0fdf4', color: '#14532D', border: '1px solid #86EFAC' }}
                        >
                          {bill.items.length} items
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className="px-2.5 py-1 rounded-xl font-bold"
                          style={{ background: pb.bg, color: pb.color, border: `1px solid ${pb.border}` }}
                        >
                          {bill.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-gray-950 text-sm">
                        {formatCurrency(bill.grandTotal)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onSelectBillToView(bill)}
                          className="px-3 py-1.5 rounded-xl text-white font-black text-xs shadow-sm transition-all active:scale-95"
                          style={{ background: 'linear-gradient(135deg,#16A34A,#1D4ED8)', boxShadow: '0 3px 10px rgba(29,78,216,0.3)' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
