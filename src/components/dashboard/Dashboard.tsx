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
  ShoppingBag,
  Boxes,
  Calendar,
  Layers,
  CheckCircle2,
  Sprout,
  Compass,
  ArrowRight
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

  // Monthly KPI calculation
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
  const monthBills = allBills.filter((b) => b.date && b.date.startsWith(currentMonthPrefix));
  const monthRevenue = monthBills.reduce((sum, b) => sum + b.grandTotal, 0);

  // Total pending payments across all credit bills
  const totalPendingCredit = allBills
    .filter(b => b.paymentMethod === 'Credit')
    .reduce((sum, b) => sum + b.grandTotal, 0);

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

  // Recent 6 bills
  const recentBills = [...allBills]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Agricultural Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-agri-gold/50 bg-agri-950 text-white min-h-[220px] flex flex-col justify-between">
        {/* Full-width agricultural field image background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
          style={{ backgroundImage: "url('/images/farmers_rain_field.jpg')" }}
        />
        {/* Rich dark green gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-agri-950 via-agri-900/85 to-agri-950/70" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-agri-gold font-bold text-xs uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-agri-gold animate-ping" />
                <Sparkles className="w-4 h-4" />
                <span>Agricultural Billing & Farm Management System</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight font-serif uppercase drop-shadow-md text-white">
                {settings.businessName}
              </h1>
              <p className="text-sm md:text-base text-yellow-300 font-serif italic mt-1 font-bold drop-shadow">
                "Fresh Inputs. Better Farming. Stronger Future."
              </p>
              <p className="text-xs text-emerald-100/80 max-w-xl mt-1">
                📍 {settings.completeAddress} • 📞 {settings.mobile1}
              </p>
            </div>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToNewBill}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-agri-950 font-black text-sm tracking-wide shadow-xl flex items-center space-x-2.5 transition-all active:scale-95 ring-2 ring-white/60"
              >
                <ReceiptText className="w-5 h-5 text-agri-950 stroke-[2.5]" />
                <span>+ NEW BILL (F2)</span>
              </button>

              <button
                onClick={onNavigateToHistory}
                className="py-3.5 px-5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-bold text-xs md:text-sm tracking-wide shadow-lg flex items-center space-x-2 transition-all active:scale-95"
              >
                <Clock className="w-4 h-4 text-agri-gold" />
                <span>VIEW SALES</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dashboard 6 Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* 1. Today's Bills */}
        <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/20 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Today's Bills
            </span>
            <div className="p-2 rounded-xl bg-agri-100 text-agri-700">
              <ReceiptText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-gray-900">
              {todayBills.length}
            </div>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
              Avg: {formatCurrency(todayAvgBill)}
            </span>
          </div>
        </div>

        {/* 2. Today's Sales */}
        <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/20 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black font-mono text-agri-800">
              {formatCurrency(todayRevenue)}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
              GST: {formatCurrency(todayTaxCollected)}
            </span>
          </div>
        </div>

        {/* 3. Total Customers */}
        <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/20 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-gray-900">
              {allCustomers.length}
            </div>
            <span className="text-[10px] text-purple-700 font-medium block mt-0.5">
              Today: {todayCustomersCount} buyers
            </span>
          </div>
        </div>

        {/* 4. Total Products */}
        <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/20 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-gray-900">
              {allProducts.length}
            </div>
            <span className="text-[10px] text-blue-700 font-medium block mt-0.5">
              Sold Today: {todayItemsSold}
            </span>
          </div>
        </div>

        {/* 5. Pending Payments (Credit) */}
        <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/20 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Pending Credit
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black font-mono text-rose-800">
              {formatCurrency(totalPendingCredit)}
            </div>
            <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
              Today Credit: {formatCurrency(todayCredit)}
            </span>
          </div>
        </div>

        {/* 6. Monthly Sales */}
        <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/20 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Monthly Sales
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black font-mono text-amber-900">
              {formatCurrency(monthRevenue)}
            </div>
            <span className="text-[10px] text-amber-800 font-medium block mt-0.5">
              {monthBills.length} bills this month
            </span>
          </div>
        </div>
      </div>

      {/* 3. Agriculture Today Visual Cards (4 Reference Images Story) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-agri-700 text-agri-gold flex items-center justify-center font-bold text-sm shadow">
              🌱
            </div>
            <h2 className="text-base font-black text-agri-950 uppercase tracking-wider">
              Agriculture Today • Farming & Technology Heritage
            </h2>
          </div>
          <span className="text-xs text-agri-700 font-semibold bg-agri-100 px-3 py-1 rounded-full border border-agri-300">
            A.S. Praveen Traders Heritage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Traditional Farming */}
          <div className="group relative rounded-2xl overflow-hidden shadow-md border-2 border-emerald-200 bg-agri-950 text-white h-52 flex flex-col justify-end transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/images/farmer_bullock_ploughing.jpg"
              alt="Traditional farmer ploughing with bullocks"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-950 via-agri-900/60 to-transparent" />
            <div className="relative z-10 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-agri-950 px-2 py-0.5 rounded-full inline-block">
                🌾 Traditional Farming
              </span>
              <h3 className="font-bold text-sm text-white leading-snug">
                Bullock Ploughing & Soil Preparation
              </h3>
              <p className="text-[11px] text-emerald-200 line-clamp-2">
                Time-honored soil conditioning with certified heirloom seeds and natural fertilizers.
              </p>
            </div>
          </div>

          {/* Card 2: Modern Machinery */}
          <div className="group relative rounded-2xl overflow-hidden shadow-md border-2 border-emerald-200 bg-agri-950 text-white h-52 flex flex-col justify-end transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/images/tractor_spraying_crops.jpg"
              alt="Modern tractor spraying agricultural crops"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-950 via-agri-900/60 to-transparent" />
            <div className="relative z-10 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-agri-950 px-2 py-0.5 rounded-full inline-block">
                🚜 Modern Machinery
              </span>
              <h3 className="font-bold text-sm text-white leading-snug">
                Tractor Boom Spraying & Crop Care
              </h3>
              <p className="text-[11px] text-emerald-200 line-clamp-2">
                High-capacity crop protection and nutrient delivery for large acreage farmland.
              </p>
            </div>
          </div>

          {/* Card 3: Smart Drone Tech */}
          <div className="group relative rounded-2xl overflow-hidden shadow-md border-2 border-emerald-200 bg-agri-950 text-white h-52 flex flex-col justify-end transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/images/drone_spraying_crops.jpg"
              alt="Agricultural drone spraying crops"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-950 via-agri-900/60 to-transparent" />
            <div className="relative z-10 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-400 text-agri-950 px-2 py-0.5 rounded-full inline-block">
                🛸 Smart Agriculture
              </span>
              <h3 className="font-bold text-sm text-white leading-snug">
                Hexacopter Drone Crop Mist
              </h3>
              <p className="text-[11px] text-emerald-200 line-clamp-2">
                Precision micro-foliar spraying and AI farm monitoring inputs.
              </p>
            </div>
          </div>

          {/* Card 4: Farmers in Rain Field */}
          <div className="group relative rounded-2xl overflow-hidden shadow-md border-2 border-emerald-200 bg-agri-950 text-white h-52 flex flex-col justify-end transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/images/farmers_rain_field.jpg"
              alt="Farmers working in green field during rain"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-950 via-agri-900/60 to-transparent" />
            <div className="relative z-10 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-lime-400 text-agri-950 px-2 py-0.5 rounded-full inline-block">
                🌧️ Monsoon Care
              </span>
              <h3 className="font-bold text-sm text-white leading-snug">
                Paddy Planting & Water Management
              </h3>
              <p className="text-[11px] text-emerald-200 line-clamp-2">
                Supporting farmers through every monsoon cycle with high-yield paddy inputs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Payment Modes & Top Products Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment breakdown */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-600/20 shadow-md space-y-3">
          <h3 className="font-black text-xs uppercase tracking-wider text-agri-950 flex items-center space-x-1.5 border-b border-emerald-100 pb-2">
            <span>💳</span>
            <span>Today's Payment Modes</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-gray-800">Cash Counter</span>
              </div>
              <span className="font-mono font-black text-emerald-900 text-sm">{formatCurrency(todayCash)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-700" />
                <span className="font-bold text-gray-800">UPI / QR Transfers</span>
              </div>
              <span className="font-mono font-black text-blue-900 text-sm">{formatCurrency(todayUpi)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-rose-700" />
                <span className="font-bold text-gray-800">Credit (Khata)</span>
              </div>
              <span className="font-mono font-black text-rose-900 text-sm">{formatCurrency(todayCredit)}</span>
            </div>
          </div>
        </div>

        {/* Top selling agricultural products */}
        <div className="md:col-span-2 bg-white rounded-3xl p-5 border-2 border-emerald-600/20 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <h3 className="font-black text-xs uppercase tracking-wider text-agri-950 flex items-center space-x-1.5">
              <span>🌾</span>
              <span>Top Selling Agricultural Products</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg">
              Ranked by quantity
            </span>
          </div>

          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No sales recorded yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/50 text-xs transition-colors border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-agri-gold text-agri-950 font-black text-xs flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-900">{p.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300">
                      {p.qty} {p.unit}
                    </span>
                    <span className="font-mono font-black text-agri-950 w-28 text-right text-sm">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent Counter Bills Table */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-emerald-600/20 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-agri-900 to-emerald-950 text-white flex items-center justify-between border-b-2 border-agri-gold">
          <div className="font-bold text-sm flex items-center space-x-2">
            <Clock className="w-4 h-4 text-agri-gold" />
            <span>Recent Counter Bills</span>
          </div>

          <button
            onClick={onNavigateToHistory}
            className="text-xs font-black text-amber-300 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <span>View All Bills Archive</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-agri-950 text-agri-gold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-white">Bill Number</th>
                <th className="py-3 px-3 text-white">Date & Time</th>
                <th className="py-3 px-4 text-white">Customer Name</th>
                <th className="py-3 px-3 text-center text-white">Items</th>
                <th className="py-3 px-3 text-center text-white">Payment</th>
                <th className="py-3 px-4 text-right text-white">Grand Total</th>
                <th className="py-3 px-3 text-center text-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 text-xs">
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400 bg-emerald-50/20">
                    <p className="font-bold text-sm text-gray-600">No counter bills created yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Click "+ NEW BILL (F2)" above to begin billing.</p>
                  </td>
                </tr>
              ) : (
                recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-agri-800 text-sm">
                      {bill.billNumber}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      <div>{formatDate(bill.date)}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{formatTime(bill.time)}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">{bill.customer.name}</td>
                    <td className="py-3 px-3 text-center font-medium">
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        {bill.items.length} items
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-xl bg-gray-100 font-bold text-gray-800 border border-gray-200">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-gray-950 text-sm">
                      {formatCurrency(bill.grandTotal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectBillToView(bill)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-agri-700 to-emerald-800 hover:from-agri-800 hover:to-emerald-900 text-white font-black text-xs shadow-sm transition-all active:scale-95"
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

