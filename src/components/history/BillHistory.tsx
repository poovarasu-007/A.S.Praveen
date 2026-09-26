import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { recalculateGlobalSequence } from '../../db/sequence';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatTime, getTodayDateString } from '../../utils/date';
import { formatNumber } from '../../utils/i18n';
import { BillDetailsModal } from './BillDetailsModal';
import { PrintModal } from '../print/PrintModal';
import { ConfirmModal } from '../common/ConfirmModal';
import type { Bill, PaymentMethod } from '../../types';
import { History, Search, Eye, Printer, Trash2, CheckCircle2 } from 'lucide-react';

type DateFilter = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

const COPY = {
  en: {
    historySubtitle: 'A permanent record of sales and securely stored invoices',
    totalBills: 'Total bills',
    searchPlaceholder: 'Search by bill number, customer, mobile or product...',
    allBills: 'All bills',
    yesterday: 'Yesterday',
    emptyHint: 'Create a bill to begin tracking sales history.',
    viewDetails: 'View bill details',
    printBill: 'Print or reprint bill',
    deleteBill: 'Delete bill (administrator only)',
    deleteError: 'Unable to delete the bill.',
    deleteTitle: 'Permanently delete this bill?',
    deleteWarning: 'This bill will be permanently deleted from local storage. The operation will be recorded in the audit log.',
    deletePermanently: 'Delete permanently',
    billDeleted: 'Bill {number} was permanently deleted.',
  },
  ta: {
    historySubtitle: 'விற்பனைகளின் நிரந்தர பதிவும் பாதுகாப்பாக சேமிக்கப்பட்ட ரசீதுகளும்',
    totalBills: 'மொத்த பில்கள்',
    searchPlaceholder: 'பில் எண், வாடிக்கையாளர், கைபேசி அல்லது பொருள் மூலம் தேடுங்கள்...',
    allBills: 'அனைத்துப் பில்கள்',
    yesterday: 'நேற்று',
    emptyHint: 'விற்பனை வரலாறைப் பதிவு செய்ய முதல் பில்லை உருவாக்கவும்.',
    viewDetails: 'பில் விவரங்களைப் பார்க்கவும்',
    printBill: 'பில்லை அச்சிடவும் அல்லது மீண்டும் அச்சிடவும்',
    deleteBill: 'பில்லை நீக்கு (நிர்வாகிக்கு மட்டும்)',
    deleteError: 'பில்லை நீக்க முடியவில்லை.',
    deleteTitle: 'இந்தப் பில்லை நிரந்தரமாக நீக்கவிரும்புகிறீர்களா?',
    deleteWarning: 'இந்தப் பில் உள்ள சேமிப்பிலிருந்து நிரந்தரமாக நீக்கப்படும். இந்தச் செயல் தணிக்கைப் பதிவில் பதிவு செய்யப்படும்.',
    deletePermanently: 'நிரந்தரமாக நீக்கு',
    billDeleted: 'பில் {number} நிரந்தரமாக நீக்கப்பட்டது.',
  },
} as const;

export const BillHistory: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { settings, language, t } = useSettings();
  const copy = COPY[language];
  const bills = useLiveQuery(() => db.bills.orderBy('createdAt').reverse().toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [printBill, setPrintBill] = useState<Bill | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const filteredBills = bills.filter((bill) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      bill.billNumber.toLowerCase().includes(search) ||
      bill.customer.name.toLowerCase().includes(search) ||
      (bill.customer.mobile && bill.customer.mobile.includes(search)) ||
      bill.items.some((item) => item.productName.toLowerCase().includes(search));

    if (!matchesSearch) return false;

    const todayString = getTodayDateString();
    const billDate = bill.date;

    if (dateFilter === 'today') {
      return billDate === todayString;
    }

    if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      return billDate === yesterdayString;
    }

    if (dateFilter === 'this_week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(billDate) >= weekAgo;
    }

    if (dateFilter === 'this_month') {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      return new Date(billDate) >= firstDayOfMonth;
    }

    if (dateFilter === 'custom') {
      if (customStartDate && billDate < customStartDate) return false;
      if (customEndDate && billDate > customEndDate) return false;
      return true;
    }

    return true;
  });

  const paymentLabel = (method: PaymentMethod): string => {
    if (method === 'Cash') return t.paymentCash;
    if (method === 'UPI') return t.paymentUpi;
    if (method === 'Card') return t.paymentCard;
    if (method === 'Bank Transfer') return t.bank;
    if (method === 'Credit') return t.paymentCredit;
    return t.other;
  };

  const handleDeleteBill = async () => {
    if (!billToDelete) return;

    try {
      await db.bills.delete(billToDelete.id);
      await recalculateGlobalSequence();

      const auditTimestamp = new Date();
      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: auditTimestamp.toISOString(),
        date: formatDate(auditTimestamp, language),
        time: formatTime(auditTimestamp, language),
        user: currentUser?.username || 'admin',
        role: 'ADMIN',
        action: 'Deleted Bill',
        recordType: 'BILL',
        recordId: billToDelete.billNumber,
        details: `Deleted bill ${billToDelete.billNumber} for ${billToDelete.customer.name} (${formatCurrency(billToDelete.grandTotal, language)})`,
      });

      setFeedback(copy.billDeleted.replace('{number}', billToDelete.billNumber));
      setIsDeleteOpen(false);
      setBillToDelete(null);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Failed to delete bill:', err);
      alert(copy.deleteError);
    }
  };

  const dateFilters: { id: DateFilter; label: string }[] = [
    { id: 'all', label: copy.allBills },
    { id: 'today', label: t.today },
    { id: 'yesterday', label: copy.yesterday },
    { id: 'this_week', label: t.thisWeek },
    { id: 'this_month', label: t.thisMonth },
    { id: 'custom', label: t.customRange },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <section
        className="card-glass relative overflow-hidden border-primary-200 bg-gradient-to-br from-primary-50 via-surface to-secondary-50 p-5"
        aria-labelledby="bill-history-title"
      >
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-primary-100/70 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-200 bg-white text-secondary-700 shadow-soft-sm">
              <History size={23} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="bill-history-title" className="section-title text-xl font-semibold sm:text-2xl">
                  {t.billHistory}
                </h2>
                <span className="badge-arch">{formatNumber(bills.length, language)}</span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">{copy.historySubtitle}</p>
            </div>
          </div>

          <div className="rounded-xl border border-primary-200 bg-white/80 px-3.5 py-2 text-xs font-medium text-text-secondary shadow-soft-sm">
            {copy.totalBills}:{' '}
            <strong className="ml-1 font-mono text-sm text-secondary-700">{formatNumber(bills.length, language)}</strong>
          </div>
        </div>
      </section>

      {feedback && (
        <div className="toast toast-success static relative w-full" role="status" aria-live="polite">
          <CheckCircle2 size={17} className="shrink-0 text-success" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      <section className="card-glass space-y-3 p-4" aria-label={`${t.search} & ${t.filter}`}>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search size={19} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-700" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="input-arch pl-11"
              aria-label={copy.searchPlaceholder}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto" role="group" aria-label={t.filterRange}>
            {dateFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setDateFilter(filter.id)}
                aria-pressed={dateFilter === filter.id}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  dateFilter === filter.id
                    ? 'border-primary-900 bg-primary-900 text-white'
                    : 'border-primary-100 bg-white text-text-secondary hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-100 bg-primary-50/70 p-3 text-xs">
            <span className="font-semibold text-text-secondary">{t.dateRange}:</span>
            <label className="flex items-center gap-1.5 text-text-secondary">
              <span>{t.from}:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(event) => setCustomStartDate(event.target.value)}
                className="input-arch w-auto py-1.5 font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-1.5 text-text-secondary">
              <span>{t.to}:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(event) => setCustomEndDate(event.target.value)}
                className="input-arch w-auto py-1.5 font-mono text-xs"
              />
            </label>
          </div>
        )}
      </section>

      <section className="card-glass overflow-hidden" aria-label={t.billHistory}>
        <div className="overflow-x-auto">
          <table className="table-arch min-w-[980px]">
            <caption className="sr-only">{t.billHistory}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-12 text-center">#</th>
                <th scope="col">{t.billNo}</th>
                <th scope="col">{t.dateTime}</th>
                <th scope="col">{t.customerName}</th>
                <th scope="col" className="text-center">{t.items}</th>
                <th scope="col" className="text-center">{t.paymentMethod}</th>
                <th scope="col" className="text-right">{t.grandTotal}</th>
                <th scope="col" className="text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <History size={30} className="mx-auto mb-2 text-secondary-700" aria-hidden="true" />
                    <p className="text-sm font-semibold text-text-secondary">{t.noBills}</p>
                    <p className="mt-1 text-xs text-text-tertiary">{copy.emptyHint}</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill, index) => (
                  <tr key={bill.id}>
                    <td className="text-center font-semibold text-text-tertiary">{formatNumber(index + 1, language)}</td>
                    <td className="font-mono font-semibold text-secondary-700">{bill.billNumber}</td>
                    <td className="text-xs text-text-secondary">
                      <div>{formatDate(bill.date, language)}</div>
                      <div className="font-mono text-[10px] text-text-tertiary">{formatTime(bill.time, language)}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-primary-900">{bill.customer.name}</div>
                      {bill.customer.mobile && (
                        <div className="font-mono text-xs text-text-tertiary">{bill.customer.mobile}</div>
                      )}
                    </td>
                    <td className="text-center">
                      <span className="badge-arch">{formatNumber(bill.items.length, language)}</span>
                    </td>
                    <td className="text-center"><span className="badge-info">{paymentLabel(bill.paymentMethod)}</span></td>
                    <td className="text-right font-mono text-sm font-semibold text-primary-900">
                      {formatCurrency(bill.grandTotal, language)}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsDetailsOpen(true);
                          }}
                          className="btn-light p-2 text-secondary-700"
                          title={copy.viewDetails}
                          aria-label={`${copy.viewDetails}: ${bill.billNumber}`}
                        >
                          <Eye size={15} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPrintBill(bill);
                            setIsPrintOpen(true);
                          }}
                          className="btn-light p-2 text-secondary-700"
                          title={copy.printBill}
                          aria-label={`${copy.printBill}: ${bill.billNumber}`}
                        >
                          <Printer size={15} aria-hidden="true" />
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setBillToDelete(bill);
                              setIsDeleteOpen(true);
                            }}
                            className="btn-light p-2 text-error hover:text-red-800"
                            title={copy.deleteBill}
                            aria-label={`${copy.deleteBill}: ${bill.billNumber}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <BillDetailsModal
        isOpen={isDetailsOpen}
        bill={selectedBill}
        settings={settings}
        onPrintThermal={() => {
          setIsDetailsOpen(false);
          setPrintBill(selectedBill);
          setIsPrintOpen(true);
        }}
        onPrintA4={() => {
          setIsDetailsOpen(false);
          setPrintBill(selectedBill);
          setIsPrintOpen(true);
        }}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedBill(null);
        }}
      />

      <PrintModal
        isOpen={isPrintOpen}
        bill={printBill}
        settings={settings}
        onClose={() => {
          setIsPrintOpen(false);
          setPrintBill(null);
        }}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        title={copy.deleteTitle}
        warningText={copy.deleteWarning}
        billDetails={
          billToDelete
            ? {
                billNumber: billToDelete.billNumber,
                customerName: billToDelete.customer.name,
                amount: formatCurrency(billToDelete.grandTotal, language),
              }
            : undefined
        }
        confirmLabel={copy.deletePermanently}
        confirmButtonColor="red"
        requirePassword={true}
        onConfirm={handleDeleteBill}
        onCancel={() => {
          setIsDeleteOpen(false);
          setBillToDelete(null);
        }}
      />
    </div>
  );
};
