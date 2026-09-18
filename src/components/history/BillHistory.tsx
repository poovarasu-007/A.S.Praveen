import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { recalculateGlobalSequence } from '../../db/sequence';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatTime, getTodayDateString } from '../../utils/date';
import { BillDetailsModal } from './BillDetailsModal';
import { PrintModal } from '../print/PrintModal';
import { ConfirmModal } from '../common/ConfirmModal';
import type { Bill } from '../../types';
import {
  History,
  Search,
  Calendar,
  Eye,
  Printer,
  Trash2,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

type DateFilter = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export const BillHistory: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { settings } = useSettings();
  const bills = useLiveQuery(() => db.bills.orderBy('createdAt').reverse().toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modals state
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [printBill, setPrintBill] = useState<Bill | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Filter bills
  const filteredBills = bills.filter((b) => {
    // 1. Search Query
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      b.billNumber.toLowerCase().includes(search) ||
      b.customer.name.toLowerCase().includes(search) ||
      (b.customer.mobile && b.customer.mobile.includes(search)) ||
      b.items.some((it) => it.productName.toLowerCase().includes(search));

    if (!matchesSearch) return false;

    // 2. Date Filtering
    const todayStr = getTodayDateString();
    const billDate = b.date;

    if (dateFilter === 'today') {
      return billDate === todayStr;
    }

    if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = yesterday.toISOString().split('T')[0];
      return billDate === yestStr;
    }

    if (dateFilter === 'this_week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(billDate) >= weekAgo;
    }

    if (dateFilter === 'this_month') {
      const firstDayMonth = new Date();
      firstDayMonth.setDate(1);
      return new Date(billDate) >= firstDayMonth;
    }

    if (dateFilter === 'custom') {
      if (customStartDate && billDate < customStartDate) return false;
      if (customEndDate && billDate > customEndDate) return false;
      return true;
    }

    return true;
  });

  const handleDeleteBill = async () => {
    if (!billToDelete) return;

    try {
      // 1. Delete bill permanently from IndexedDB
      await db.bills.delete(billToDelete.id);

      // 2. Recalculate global bill sequence so next auto number stays correct
      await recalculateGlobalSequence();

      // 3. Add Audit Log
      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: formatDate(new Date()),
        time: formatTime(new Date()),
        user: currentUser?.username || 'admin',
        role: 'ADMIN',
        action: 'Deleted Bill',
        recordType: 'BILL',
        recordId: billToDelete.billNumber,
        details: `Deleted bill ${billToDelete.billNumber} for ${billToDelete.customer.name} (₹${billToDelete.grandTotal})`
      });

      setFeedback(`Bill ${billToDelete.billNumber} has been permanently deleted.`);
      setIsDeleteOpen(false);
      setBillToDelete(null);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Failed to delete bill:', err);
      alert('Error deleting bill');
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Header Banner with Agricultural Photo */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-agri-gold/50 text-white min-h-[110px] p-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: "url('/images/farmer_bullock_ploughing.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-agri-950/95 via-emerald-950/90 to-agri-950/95" />

        <div className="relative z-10 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agri-gold to-yellow-500 text-agri-950 flex items-center justify-center font-bold text-xl shadow-lg border border-white/40">
            📜
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight font-serif uppercase">
                விற்பனை ரசீது வரலாறு (BILL HISTORY &amp; ARCHIVE)
              </h2>
              <span className="bg-yellow-400 text-agri-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {bills.length} Bills
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              விவசாயிகளின் நிரந்தர விற்பனை பதிவேடு • ரசீதுகள் பாதுகாப்பாக சேமிக்கப்பட்டுள்ளன
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-yellow-200 bg-black/40 px-3.5 py-2 rounded-2xl border border-yellow-400/40 font-bold">
          மொத்த ரசீதுகள்: <strong className="text-yellow-300 font-mono text-sm">{bills.length}</strong>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Bill Number (e.g. AST-...), Customer Name, Mobile, or Product..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-agri-600 outline-none"
            />
          </div>

          {/* Quick Date Range Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'All Bills' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as DateFilter)}
                className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  dateFilter === f.id
                    ? 'bg-agri-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === 'custom' && (
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs bg-agri-50/50 p-2.5 rounded-xl">
            <span className="font-bold text-gray-700">Date Range:</span>
            <div className="flex items-center space-x-1.5">
              <span>From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg outline-none font-mono text-xs"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span>To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg outline-none font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bill History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12">S.No</th>
                <th className="py-3 px-3">Bill No</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3 text-center">Items</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold">No bills found.</p>
                    <p className="text-xs mt-1">
                      Create your first bill to start tracking sales.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-agri-50/50 transition-colors">
                    <td className="py-3 px-3 text-center font-semibold text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-agri-800">
                      {b.billNumber}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600">
                      <div>{formatDate(b.date)}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{formatTime(b.time)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{b.customer.name}</div>
                      {b.customer.mobile && (
                        <div className="text-xs text-gray-500 font-mono">{b.customer.mobile}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {b.items.length} items
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-agri-50 text-agri-800 border border-agri-200">
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 text-sm">
                      {formatCurrency(b.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* View Original Snapshot */}
                        <button
                          onClick={() => {
                            setSelectedBill(b);
                            setIsDetailsOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-agri-700 hover:text-agri-900 hover:bg-agri-100 transition-colors"
                          title="View Bill Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Print / Reprint */}
                        <button
                          onClick={() => {
                            setPrintBill(b);
                            setIsPrintOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="Print / Reprint Bill"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Admin Delete Only */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setBillToDelete(b);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete Bill (Admin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Bill Details Modal */}
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

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintOpen}
        bill={printBill}
        settings={settings}
        onClose={() => {
          setIsPrintOpen(false);
          setPrintBill(null);
        }}
      />

      {/* Delete Confirmation Modal strictly matching Section 4 */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="WARNING: Delete Bill Permanently"
        warningText="This bill will be permanently deleted from local IndexedDB storage. This operation is recorded in the audit log."
        billDetails={
          billToDelete
            ? {
                billNumber: billToDelete.billNumber,
                customerName: billToDelete.customer.name,
                amount: formatCurrency(billToDelete.grandTotal),
              }
            : undefined
        }
        confirmLabel="Delete Permanently"
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
