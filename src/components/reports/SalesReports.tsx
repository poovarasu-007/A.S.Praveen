import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getTodayDateString } from '../../utils/date';
import { exportBillsToCSV } from '../../utils/export';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Package,
  Users,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react';

type ReportTab = 'summary' | 'products' | 'customers' | 'bills';

export const SalesReports: React.FC = () => {
  const bills = useLiveQuery(() => db.bills.toArray(), []) || [];

  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());

  // Quick Range Helper
  const setQuickRange = (range: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
    const today = new Date();
    const todayStr = getTodayDateString();

    if (range === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (range === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (range === 'week') {
      const w = new Date();
      w.setDate(w.getDate() - 7);
      setStartDate(w.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (range === 'month') {
      const m = new Date();
      m.setDate(1);
      setStartDate(m.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (range === 'all') {
      setStartDate('2020-01-01');
      setEndDate(todayStr);
    }
  };

  // Filter bills by chosen date range
  const filteredBills = bills.filter((b) => {
    if (startDate && b.date < startDate) return false;
    if (endDate && b.date > endDate) return false;
    return true;
  });

  // Calculate Metrics
  const totalBills = filteredBills.length;
  const totalSales = filteredBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalTaxable = filteredBills.reduce((sum, b) => sum + b.subtotal, 0);
  const totalTax = filteredBills.reduce((sum, b) => sum + (b.totalTax || 0), 0);
  const totalCgst = filteredBills.reduce((sum, b) => sum + (b.cgst || 0), 0);
  const totalSgst = filteredBills.reduce((sum, b) => sum + (b.sgst || 0), 0);
  const totalIgst = filteredBills.reduce((sum, b) => sum + (b.igst || 0), 0);

  // Payment Breakdown
  const cashSales = filteredBills.filter(b => b.paymentMethod === 'Cash').reduce((sum, b) => sum + b.grandTotal, 0);
  const upiSales = filteredBills.filter(b => b.paymentMethod === 'UPI').reduce((sum, b) => sum + b.grandTotal, 0);
  const cardSales = filteredBills.filter(b => b.paymentMethod === 'Card').reduce((sum, b) => sum + b.grandTotal, 0);
  const creditSales = filteredBills.filter(b => b.paymentMethod === 'Credit').reduce((sum, b) => sum + b.grandTotal, 0);

  // Product Aggregation
  interface ProductSummary {
    productName: string;
    unit: string;
    quantitySold: number;
    salesAmount: number;
    gstAmount: number;
    totalAmount: number;
  }

  const productMap = new Map<string, ProductSummary>();
  filteredBills.forEach(bill => {
    bill.items.forEach(item => {
      const existing = productMap.get(item.productName);
      if (existing) {
        existing.quantitySold += item.quantity;
        existing.salesAmount += item.taxableAmount;
        existing.gstAmount += item.gstAmount;
        existing.totalAmount += item.totalAmount;
      } else {
        productMap.set(item.productName, {
          productName: item.productName,
          unit: item.unit,
          quantitySold: item.quantity,
          salesAmount: item.taxableAmount,
          gstAmount: item.gstAmount,
          totalAmount: item.totalAmount
        });
      }
    });
  });
  const productSummaries = Array.from(productMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);

  // Customer Aggregation
  interface CustomerSummary {
    customerName: string;
    mobile?: string;
    billsCount: number;
    totalPurchase: number;
  }

  const customerMap = new Map<string, CustomerSummary>();
  filteredBills.forEach(bill => {
    const key = bill.customer.name.trim();
    const existing = customerMap.get(key);
    if (existing) {
      existing.billsCount += 1;
      existing.totalPurchase += bill.grandTotal;
    } else {
      customerMap.set(key, {
        customerName: bill.customer.name,
        mobile: bill.customer.mobile,
        billsCount: 1,
        totalPurchase: bill.grandTotal
      });
    }
  });
  const customerSummaries = Array.from(customerMap.values()).sort((a, b) => b.totalPurchase - a.totalPurchase);

  const handleExportCSV = () => {
    const filename = `sales-report-${startDate}-to-${endDate}.csv`;
    exportBillsToCSV(filteredBills, filename);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-agri-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <BarChart3 className="w-5 h-5 text-agri-gold" />
          </div>
          <div>
            <h2 className="text-lg font-black text-agri-900 tracking-tight">
              SALES REPORTS & ANALYTICS
            </h2>
            <p className="text-xs text-gray-500">
              Detailed sales performance, GST tax collections, and product reports
            </p>
          </div>
        </div>

        {/* Export & Print Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredBills.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-800 hover:bg-black text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Range Selection Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-gray-700 flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-agri-700" />
              <span>Filter Range:</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono text-xs focus:ring-2 focus:ring-agri-600"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono text-xs focus:ring-2 focus:ring-agri-600"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setQuickRange('today')}
              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setQuickRange('yesterday')}
              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Yesterday
            </button>
            <button
              onClick={() => setQuickRange('week')}
              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setQuickRange('month')}
              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              This Month
            </button>
            <button
              onClick={() => setQuickRange('all')}
              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-agri-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Total Revenue
          </span>
          <div className="text-xl md:text-2xl font-black font-mono text-agri-800 mt-1">
            {formatCurrency(totalSales)}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Taxable: {formatCurrency(totalTaxable)}
          </span>
        </div>

        {/* Total Bills */}
        <div className="bg-white rounded-2xl p-4 border border-agri-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Total Bills Generated
          </span>
          <div className="text-xl md:text-2xl font-black font-mono text-gray-900 mt-1">
            {totalBills}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Avg: {formatCurrency(totalBills > 0 ? totalSales / totalBills : 0)}
          </span>
        </div>

        {/* GST Tax Collected */}
        <div className="bg-white rounded-2xl p-4 border border-agri-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Total GST Collected
          </span>
          <div className="text-xl md:text-2xl font-black font-mono text-amber-800 mt-1">
            {formatCurrency(totalTax)}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            CGST: {formatCurrency(totalCgst)} | SGST: {formatCurrency(totalSgst)}
          </span>
        </div>

        {/* Payment Modes */}
        <div className="bg-white rounded-2xl p-4 border border-agri-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Cash vs Digital
          </span>
          <div className="text-sm font-bold text-gray-800 mt-1 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Cash:</span>
              <span>{formatCurrency(cashSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">UPI/Card:</span>
              <span>{formatCurrency(upiSales + cardSales)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-1 print:hidden">
        {[
          { id: 'summary', label: 'Summary Breakdown', icon: BarChart3 },
          { id: 'products', label: 'Product-wise Sales', icon: Package },
          { id: 'customers', label: 'Customer Purchases', icon: Users },
          { id: 'bills', label: 'Detailed Bills List', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Summary */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax Breakdown Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-agri-800">
              GST Tax Breakdown (Selected Period)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-700">Central GST (CGST):</span>
                <span className="font-mono font-bold text-gray-900">{formatCurrency(totalCgst)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-700">State GST (SGST):</span>
                <span className="font-mono font-bold text-gray-900">{formatCurrency(totalSgst)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-700">Integrated GST (IGST):</span>
                <span className="font-mono font-bold text-gray-900">{formatCurrency(totalIgst)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-sm font-bold text-amber-900">
                <span>Total Tax Collected:</span>
                <span className="font-mono">{formatCurrency(totalTax)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-agri-800">
              Payment Method Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-700">Cash Payments:</span>
                <span className="font-mono font-bold text-emerald-800">{formatCurrency(cashSales)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-700">UPI / QR Transfers:</span>
                <span className="font-mono font-bold text-blue-800">{formatCurrency(upiSales)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-700">Debit / Credit Card:</span>
                <span className="font-mono font-bold text-purple-800">{formatCurrency(cardSales)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-700">Credit (Outstanding):</span>
                <span className="font-mono font-bold text-rose-800">{formatCurrency(creditSales)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Product-wise Report */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm text-gray-800 flex justify-between items-center">
            <span>Product Sales Summary ({productSummaries.length} Products Sold)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-3 text-center">Unit</th>
                  <th className="py-3 px-3 text-right">Quantity Sold</th>
                  <th className="py-3 px-4 text-right">Taxable Sales</th>
                  <th className="py-3 px-3 text-right">GST Tax</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No product sales recorded in this date range.
                    </td>
                  </tr>
                ) : (
                  productSummaries.map((p, idx) => (
                    <tr key={idx} className="hover:bg-agri-50/40">
                      <td className="py-3 px-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{p.productName}</td>
                      <td className="py-3 px-3 text-center text-xs text-gray-600">{p.unit}</td>
                      <td className="py-3 px-3 text-right font-bold text-agri-800">{p.quantitySold}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatCurrency(p.salesAmount)}</td>
                      <td className="py-3 px-3 text-right font-mono text-amber-800">{formatCurrency(p.gstAmount)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-agri-900">
                        {formatCurrency(p.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Customer-wise Report */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm text-gray-800">
            Customer Purchases Summary ({customerSummaries.length} Customers)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-3 text-center">Bills Count</th>
                  <th className="py-3 px-4 text-right">Total Purchased</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customerSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No customer records found for this period.
                    </td>
                  </tr>
                ) : (
                  customerSummaries.map((c, idx) => (
                    <tr key={idx} className="hover:bg-agri-50/40">
                      <td className="py-3 px-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{c.customerName}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">{c.mobile || '-'}</td>
                      <td className="py-3 px-3 text-center font-bold text-agri-800">{c.billsCount}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-agri-900">
                        {formatCurrency(c.totalPurchase)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Bills List */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm text-gray-800">
            Bills Issued in Range ({filteredBills.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-3">Bill Number</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3 text-center">Items</th>
                  <th className="py-3 px-3 text-center">Mode</th>
                  <th className="py-3 px-4 text-right">Tax</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBills.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-agri-50/40">
                    <td className="py-3 px-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-agri-800">{b.billNumber}</td>
                    <td className="py-3 px-3 text-xs text-gray-600">{formatDate(b.date)}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{b.customer.name}</td>
                    <td className="py-3 px-3 text-center">{b.items.length}</td>
                    <td className="py-3 px-3 text-center text-xs">{b.paymentMethod}</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-800">{formatCurrency(b.totalTax)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">{formatCurrency(b.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
