import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart3, Calendar, Download, FileSpreadsheet, Package, Printer, Receipt, Users } from 'lucide-react';
import { db } from '../../db/db';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getTodayDateString } from '../../utils/date';
import { formatNumber, formatPaymentMethod, formatUnit } from '../../utils/i18n';
import { exportBillsToCSV } from '../../utils/export';
import type { UnitType } from '../../types';

type ReportTab = 'summary' | 'products' | 'customers' | 'bills';

export const SalesReports: React.FC = () => {
  const { t, language } = useSettings();
  const bills = useLiveQuery(() => db.bills.toArray(), []) || [];
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());

  const setQuickRange = (range: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
    const today = new Date();
    const todayString = getTodayDateString();
    if (range === 'today') { setStartDate(todayString); setEndDate(todayString); return; }
    if (range === 'all') { setStartDate('2020-01-01'); setEndDate(todayString); return; }
    const start = new Date(today);
    if (range === 'yesterday') start.setDate(start.getDate() - 1);
    if (range === 'week') start.setDate(start.getDate() - 7);
    if (range === 'month') start.setDate(1);
    const year = start.getFullYear(); const month = String(start.getMonth() + 1).padStart(2, '0'); const day = String(start.getDate()).padStart(2, '0');
    const startString = `${year}-${month}-${day}`;
    setStartDate(startString); setEndDate(range === 'yesterday' ? startString : todayString);
  };

  const filteredBills = bills.filter((bill) => (!startDate || bill.date >= startDate) && (!endDate || bill.date <= endDate));
  const totalBills = filteredBills.length;
  const totalSales = filteredBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const totalTaxable = filteredBills.reduce((sum, bill) => sum + bill.subtotal, 0);
  const totalTax = filteredBills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);
  const totalCgst = filteredBills.reduce((sum, bill) => sum + (bill.cgst || 0), 0);
  const totalSgst = filteredBills.reduce((sum, bill) => sum + (bill.sgst || 0), 0);
  const totalIgst = filteredBills.reduce((sum, bill) => sum + (bill.igst || 0), 0);
  const cashSales = filteredBills.filter((bill) => bill.paymentMethod === 'Cash').reduce((sum, bill) => sum + bill.grandTotal, 0);
  const upiSales = filteredBills.filter((bill) => bill.paymentMethod === 'UPI').reduce((sum, bill) => sum + bill.grandTotal, 0);
  const cardSales = filteredBills.filter((bill) => bill.paymentMethod === 'Card').reduce((sum, bill) => sum + bill.grandTotal, 0);
  const creditSales = filteredBills.filter((bill) => bill.paymentMethod === 'Credit').reduce((sum, bill) => sum + bill.grandTotal, 0);

  const productMap = new Map<string, { productName: string; unit: UnitType; quantitySold: number; salesAmount: number; gstAmount: number; totalAmount: number }>();
  filteredBills.forEach((bill) => bill.items.forEach((item) => {
    const existing = productMap.get(item.productName);
    if (existing) { existing.quantitySold += item.quantity; existing.salesAmount += item.taxableAmount; existing.gstAmount += item.gstAmount; existing.totalAmount += item.totalAmount; }
    else productMap.set(item.productName, { productName: item.productName, unit: item.unit, quantitySold: item.quantity, salesAmount: item.taxableAmount, gstAmount: item.gstAmount, totalAmount: item.totalAmount });
  }));
  const productSummaries = Array.from(productMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);

  const customerMap = new Map<string, { customerName: string; mobile?: string; billsCount: number; totalPurchase: number }>();
  filteredBills.forEach((bill) => {
    const key = bill.customer.name.trim(); const existing = customerMap.get(key);
    if (existing) { existing.billsCount += 1; existing.totalPurchase += bill.grandTotal; }
    else customerMap.set(key, { customerName: bill.customer.name, mobile: bill.customer.mobile, billsCount: 1, totalPurchase: bill.grandTotal });
  });
  const customerSummaries = Array.from(customerMap.values()).sort((a, b) => b.totalPurchase - a.totalPurchase);
  const money = (value: number) => formatCurrency(value, language);
  const number = (value: number) => formatNumber(value, language);

  const tabs: { id: ReportTab; label: string; icon: React.ElementType }[] = [
    { id: 'summary', label: t.summaryBreakdown, icon: BarChart3 }, { id: 'products', label: t.productWiseSales, icon: Package }, { id: 'customers', label: t.customerPurchases, icon: Users }, { id: 'bills', label: t.detailedBills, icon: Receipt },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-8">
      <section className="card-glass flex flex-wrap items-center justify-between gap-3 p-4 print:hidden" aria-labelledby="reports-heading">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900 text-primary-100"><BarChart3 size={20} aria-hidden="true" /></div><div><h1 id="reports-heading" className="text-lg font-semibold text-primary-900">{t.reports}</h1><p className="text-xs text-text-tertiary">{t.salesReportsDescription}</p></div></div>
        <div className="flex gap-2"><button type="button" onClick={() => exportBillsToCSV(filteredBills, `sales-report-${startDate}-to-${endDate}.csv`, language)} disabled={!filteredBills.length} className="btn-primary px-3 py-2 text-xs"><Download size={15} aria-hidden="true" />{t.exportCsv}</button><button type="button" onClick={() => window.print()} className="btn-light px-3 py-2 text-xs"><Printer size={15} aria-hidden="true" />{t.printReport}</button></div>
      </section>

      <section className="card-glass space-y-3 p-4 print:hidden" aria-label={t.filter}>
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-3 text-xs"><span className="flex items-center gap-1 font-semibold text-text-secondary"><Calendar size={15} className="text-secondary-700" aria-hidden="true" />{t.filterRange}</span><label className="flex items-center gap-1.5 text-text-tertiary">{t.from}<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="input-arch w-auto py-1.5 text-xs" /></label><label className="flex items-center gap-1.5 text-text-tertiary">{t.to}<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="input-arch w-auto py-1.5 text-xs" /></label></div><div className="flex flex-wrap gap-1.5">{[['today', t.today], ['yesterday', t.yesterday], ['week', t.last7Days], ['month', t.thisMonth], ['all', t.allTime]].map(([id, label]) => <button key={id} type="button" onClick={() => setQuickRange(id as Parameters<typeof setQuickRange>[0])} className="btn-light px-2.5 py-1 text-xs">{label}</button>)}</div></div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label={t.reports}>
        <div className="card-panel p-4"><span className="label-arch">{t.totalRevenue}</span><div className="mt-1 font-mono text-xl font-bold text-secondary-700 md:text-2xl">{money(totalSales)}</div><span className="mt-1 block text-[11px] text-text-tertiary">{t.subtotal}: {money(totalTaxable)}</span></div>
        <div className="card-panel p-4"><span className="label-arch">{t.totalBillsGenerated}</span><div className="mt-1 font-mono text-xl font-bold text-primary-900 md:text-2xl">{number(totalBills)}</div><span className="mt-1 block text-[11px] text-text-tertiary">{t.totalRevenue}: {money(totalBills ? totalSales / totalBills : 0)}</span></div>
        <div className="card-panel p-4"><span className="label-arch">{t.taxCollected}</span><div className="mt-1 font-mono text-xl font-bold text-warning md:text-2xl">{money(totalTax)}</div><span className="mt-1 block text-[11px] text-text-tertiary">CGST: {money(totalCgst)} · SGST: {money(totalSgst)}</span></div>
        <div className="card-panel p-4"><span className="label-arch">{t.cashVsDigital}</span><div className="mt-1 space-y-0.5 font-mono text-sm font-semibold text-primary-900"><div className="flex justify-between"><span className="text-text-tertiary">{t.cash}</span><span>{money(cashSales)}</span></div><div className="flex justify-between"><span className="text-text-tertiary">{t.upi}/{t.card}</span><span>{money(upiSales + cardSales)}</span></div></div></div>
      </section>

      <div className="flex gap-2 overflow-x-auto border-b border-border-subtle pb-1 print:hidden" role="tablist" aria-label={t.reports}>{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${activeTab === id ? 'border-primary-900 bg-primary-900 text-white' : 'border-primary-100 bg-white text-text-secondary hover:bg-primary-50'}`}><Icon size={15} aria-hidden="true" />{label}</button>)}</div>

      {activeTab === 'summary' && <div className="grid gap-4 md:grid-cols-2"><section className="card-panel p-4"><h2 className="label-arch">{t.gstBreakdown}</h2><div className="mt-3 space-y-2 text-xs"><div className="flex justify-between rounded-lg bg-primary-50 p-2"><span className="font-semibold text-text-secondary">{t.cgst}</span><span className="font-mono font-semibold text-primary-900">{money(totalCgst)}</span></div><div className="flex justify-between rounded-lg bg-primary-50 p-2"><span className="font-semibold text-text-secondary">{t.sgst}</span><span className="font-mono font-semibold text-primary-900">{money(totalSgst)}</span></div><div className="flex justify-between rounded-lg bg-primary-50 p-2"><span className="font-semibold text-text-secondary">{t.igst}</span><span className="font-mono font-semibold text-primary-900">{money(totalIgst)}</span></div><div className="flex justify-between rounded-lg border border-warning/30 bg-warning-bg p-2.5 text-sm font-semibold text-warning"><span>{t.taxCollected}</span><span className="font-mono">{money(totalTax)}</span></div></div></section><section className="card-panel p-4"><h2 className="label-arch">{t.paymentBreakdown}</h2><div className="mt-3 space-y-2 text-xs"><div className="flex justify-between rounded-lg bg-primary-50 p-2"><span className="font-semibold text-text-secondary">{t.cashPayments}</span><span className="font-mono font-semibold text-secondary-700">{money(cashSales)}</span></div><div className="flex justify-between rounded-lg bg-primary-50 p-2"><span className="font-semibold text-text-secondary">{t.upiTransfers}</span><span className="font-mono font-semibold text-secondary-700">{money(upiSales)}</span></div><div className="flex justify-between rounded-lg bg-primary-50 p-2"><span className="font-semibold text-text-secondary">{t.cardPayments}</span><span className="font-mono font-semibold text-secondary-700">{money(cardSales)}</span></div><div className="flex justify-between rounded-lg bg-primary-50 p-2"><span className="font-semibold text-text-secondary">{t.outstanding}</span><span className="font-mono font-semibold text-error">{money(creditSales)}</span></div></div></section></div>}

      {activeTab === 'products' && <section className="card-glass overflow-hidden"><div className="border-b border-border-subtle bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">{t.productSalesSummary} ({number(productSummaries.length)})</div><div className="overflow-x-auto"><table className="table-arch"><thead><tr><th>#</th><th>{t.productName}</th><th>{t.unit}</th><th>{t.quantitySold}</th><th>{t.taxableSales}</th><th>{t.gstTax}</th><th>{t.totalRevenue}</th></tr></thead><tbody>{productSummaries.length === 0 ? <tr><td colSpan={7} className="py-10 text-center text-text-tertiary">{t.noProductSales}</td></tr> : productSummaries.map((product, index) => <tr key={product.productName}><td className="text-center text-text-tertiary">{index + 1}</td><td className="font-semibold text-primary-900">{product.productName}</td><td className="text-center">{formatUnit(product.unit, language)}</td><td className="text-right font-semibold text-secondary-700">{number(product.quantitySold)}</td><td className="text-right font-mono">{money(product.salesAmount)}</td><td className="text-right font-mono text-warning">{money(product.gstAmount)}</td><td className="text-right font-mono font-semibold text-primary-900">{money(product.totalAmount)}</td></tr>)}</tbody></table></div></section>}

      {activeTab === 'customers' && <section className="card-glass overflow-hidden"><div className="border-b border-border-subtle bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">{t.customerPurchases} ({number(customerSummaries.length)})</div><div className="overflow-x-auto"><table className="table-arch"><thead><tr><th>#</th><th>{t.customerName}</th><th>{t.mobile}</th><th>{t.billsCount}</th><th>{t.totalPurchased}</th></tr></thead><tbody>{customerSummaries.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-text-tertiary">{t.noCustomerRecords}</td></tr> : customerSummaries.map((customer, index) => <tr key={customer.customerName}><td className="text-center text-text-tertiary">{index + 1}</td><td className="font-semibold text-primary-900">{customer.customerName}</td><td className="font-mono text-xs text-text-secondary">{customer.mobile || '-'}</td><td className="text-center font-semibold text-secondary-700">{number(customer.billsCount)}</td><td className="text-right font-mono font-semibold text-primary-900">{money(customer.totalPurchase)}</td></tr>)}</tbody></table></div></section>}

      {activeTab === 'bills' && <section className="card-glass overflow-hidden"><div className="border-b border-border-subtle bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">{t.billsIssued} ({number(filteredBills.length)})</div><div className="overflow-x-auto"><table className="table-arch"><thead><tr><th>#</th><th>{t.billNumber}</th><th>{t.date}</th><th>{t.customerName}</th><th>{t.items}</th><th>{t.payment}</th><th>{t.taxCollected}</th><th>{t.grandTotal}</th></tr></thead><tbody>{filteredBills.map((bill, index) => <tr key={bill.id}><td className="text-center text-text-tertiary">{index + 1}</td><td className="font-mono font-semibold text-secondary-700">{bill.billNumber}</td><td className="text-xs text-text-secondary">{formatDate(bill.date, language)}</td><td className="font-semibold text-primary-900">{bill.customer.name}</td><td className="text-center">{bill.items.length}</td><td className="text-center text-xs">{formatPaymentMethod(bill.paymentMethod, language)}</td><td className="text-right font-mono text-warning">{money(bill.totalTax)}</td><td className="text-right font-mono font-semibold text-primary-900">{money(bill.grandTotal)}</td></tr>)}</tbody></table></div></section>}
    </div>
  );
};
