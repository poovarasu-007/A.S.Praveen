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
  ShoppingBag
} from 'lucide-react';

interface DashboardProps {
  onNavigateToNewBill: () => void;
  onNavigateToHistory: () => void;
  onSelectBillToView: (bill: Bill) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToNewBill,
  onNavigateToHistory,
  onSelectBillToView,
}) => {
  const { currentUser } = useAuth();
  const { settings } = useSettings();

  const allBills = useLiveQuery(() => db.bills.toArray(), []) || [];
  const allCustomers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const allProducts = useLiveQuery(() => db.products.toArray(), []) || [];

  const todayStr = getTodayDateString();
  const todayBills = allBills.filter((b) => b.date === todayStr);

  // Today KPI calculations
  const todayRevenue = todayBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const todayItemsSold = todayBills.reduce(
    (sum, b) => sum + b.items.reduce((iSum, it) => iSum + it.quantity, 0),
    0
  );
  const todayCustomersCount = new Set(todayBills.map((b) => b.customer.name.toLowerCase())).size;
  const todayTaxCollected = todayBills.reduce((sum, b) => sum + (b.totalTax || 0), 0);

  const todayCash = todayBills.filter(b => b.paymentMethod === 'Cash').reduce((sum, b) => sum + b.grandTotal, 0);
  const todayUpi = todayBills.filter(b => b.paymentMethod === 'UPI').reduce((sum, b) => sum + b.grandTotal, 0);
  const todayCredit = todayBills.filter(b => b.paymentMethod === 'Credit').reduce((sum, b) => sum + b.grandTotal, 0);
  const todayAvgBill = todayBills.length > 0 ? todayRevenue / todayBills.length : 0;

  // Product sales aggregation
  const productMap = new Map<string, { name: string; unit: string; qty: number; revenue: number }>();
  allBills.forEach((b) => {
    b.items.forEach((it) => {
      const existing = productMap.get(it.productName);
      if (existing) {
        existing.qty += it.quantity;
        existing.revenue += it.totalAmount;
      } else {
        productMap.set(it.productName, {
          name: it.productName,
          unit: it.unit,
          qty: it.quantity,
          revenue: it.totalAmount
        });
      }
    });
  });
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Recent 5 bills
  const recentBills = [...allBills]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-agri-800 via-agri-700 to-emerald-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative background symbols */}
        <div className="absolute right-4 -bottom-6 text-9xl opacity-10 pointer-events-none select-none font-serif">
          🌾
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-agri-gold font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Billing Counter Active</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight font-serif">
              {settings.businessName}
            </h2>
            <p className="text-xs md:text-sm text-agri-100 max-w-xl mt-1">
              {settings.completeAddress}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateToNewBill}
              className="py-3 px-5 rounded-2xl bg-agri-gold hover:bg-yellow-500 text-agri-950 font-black text-sm tracking-wide shadow-lg flex items-center space-x-2 transition-all active:scale-95"
            >
              <ReceiptText className="w-5 h-5" />
              <span>Start New Bill (F2)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards from Section 19 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Today's Bills */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-agri-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Today's Bills
            </span>
            <div className="p-2 rounded-xl bg-agri-100 text-agri-700">
              <ReceiptText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black font-mono text-gray-900">
              {todayBills.length}
            </div>
            <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
              Average: {formatCurrency(todayAvgBill)}
            </span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-agri-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black font-mono text-agri-800">
              {formatCurrency(todayRevenue)}
            </div>
            <span className="text-[11px] text-amber-800 font-medium mt-0.5 block">
              GST Tax: {formatCurrency(todayTaxCollected)}
            </span>
          </div>
        </div>

        {/* Items Sold */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-agri-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Products Sold Today
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black font-mono text-gray-900">
              {todayItemsSold}
            </div>
            <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
              Catalog: {allProducts.length} items
            </span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-agri-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Today's Customers
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black font-mono text-gray-900">
              {todayCustomersCount}
            </div>
            <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
              Total registered: {allCustomers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Sales Breakdown & Payment Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-agri-200 shadow-sm space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
            Today's Payment Modes
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-gray-800">Cash</span>
              </div>
              <span className="font-mono font-bold text-emerald-800">{formatCurrency(todayCash)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-700" />
                <span className="font-semibold text-gray-800">UPI / QR</span>
              </div>
              <span className="font-mono font-bold text-blue-800">{formatCurrency(todayUpi)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-rose-700" />
                <span className="font-semibold text-gray-800">Credit (Khata)</span>
              </div>
              <span className="font-mono font-bold text-rose-800">{formatCurrency(todayCredit)}</span>
            </div>
          </div>
        </div>

        {/* Top selling agricultural products */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-agri-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Top Selling Agricultural Products
            </h3>
            <span className="text-[11px] text-gray-400">By quantity sold</span>
          </div>

          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No sales recorded yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 text-xs transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full bg-agri-100 text-agri-800 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-900">{p.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-agri-800 bg-agri-50 px-2 py-0.5 rounded border border-agri-200">
                      {p.qty} {p.unit}
                    </span>
                    <span className="font-mono font-bold text-gray-800 w-24 text-right">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Bills Counter Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="font-bold text-sm text-gray-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-agri-700" />
            <span>Recent Counter Bills</span>
          </div>

          <button
            onClick={onNavigateToHistory}
            className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center space-x-1"
          >
            <span>View All Bills Archive</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Bill Number</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-4">Customer Name</th>
                <th className="py-2.5 px-3 text-center">Items</th>
                <th className="py-2.5 px-3 text-center">Payment</th>
                <th className="py-2.5 px-4 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No counter bills created yet. Click "Start New Bill (F2)" to begin!
                  </td>
                </tr>
              ) : (
                recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-agri-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-agri-800">
                      {bill.billNumber}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{formatDate(bill.date)}</td>
                    <td className="py-2.5 px-4 font-bold text-gray-900">{bill.customer.name}</td>
                    <td className="py-2.5 px-3 text-center font-medium">{bill.items.length}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(bill.grandTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onSelectBillToView(bill)}
                        className="px-2.5 py-1 rounded-lg bg-agri-50 hover:bg-agri-100 text-agri-800 font-bold border border-agri-200 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
