import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';
import { BillDetailsModal } from '../history/BillDetailsModal';
import { PrintModal } from '../print/PrintModal';
import type { Customer, Bill } from '../../types';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Receipt,
  ShoppingBag,
  ArrowRight,
  Eye,
  Calendar,
  X,
  CreditCard,
  Building
} from 'lucide-react';

export const CustomerList: React.FC = () => {
  const { settings } = useSettings();
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const allBills = useLiveQuery(() => db.bills.toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Inspector & Print modals for bill inside customer history
  const [inspectedBill, setInspectedBill] = useState<Bill | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [printBill, setPrintBill] = useState<Bill | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mobile && c.mobile.includes(searchTerm)) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Bills for selected customer
  const customerBills = selectedCustomer
    ? allBills.filter(
        (b) =>
          b.customer.name.toLowerCase().trim() === selectedCustomer.name.toLowerCase().trim() ||
          (selectedCustomer.mobile && b.customer.mobile === selectedCustomer.mobile)
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const totalSpent = customerBills.reduce((sum, b) => sum + b.grandTotal, 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Header Banner with Agricultural Photo */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-agri-gold/50 text-white min-h-[110px] p-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: "url('/images/farmers_rain_field.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-agri-950/95 via-emerald-950/90 to-agri-950/95" />

        <div className="relative z-10 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agri-gold to-yellow-500 text-agri-950 flex items-center justify-center font-bold text-xl shadow-lg border border-white/40">
            👨‍🌾
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight font-serif uppercase">
                விவசாயிகள் &amp; வாடிக்கையாளர்கள் (FARMER DIRECTORY)
              </h2>
              <span className="bg-yellow-400 text-agri-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {customers.length} Farmers
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              தானிப்பாடி மற்றும் சுற்றுவட்டார கிராமத்து விவசாயிகள் மற்றும் வாடிக்கையாளர் பட்டியல்
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-yellow-200 bg-black/40 px-3.5 py-2 rounded-2xl border border-yellow-400/40 font-bold">
          மொத்த விவசாயிகள்: <strong className="text-yellow-300 font-mono text-sm">{customers.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by farmer name, mobile number, village/town, or crop..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-agri-600 outline-none"
          />
        </div>
      </div>

      {/* Customers Cards / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12">S.No</th>
                <th className="py-3 px-4">Customer / Farmer Name</th>
                <th className="py-3 px-4">Contact & Mobile</th>
                <th className="py-3 px-4">Address / Village</th>
                <th className="py-3 px-3 text-center">Total Bills</th>
                <th className="py-3 px-4 text-right">Total Purchases</th>
                <th className="py-3 px-3 text-center">Last Visit</th>
                <th className="py-3 px-3 text-center">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold">No customers found.</p>
                    <p className="text-xs mt-1">Customers are automatically added when generating bills.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-agri-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 text-center font-semibold text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900 flex items-center space-x-1.5 flex-wrap">
                        <span>{c.name}</span>
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300 font-bold">
                          🌾 Farmer
                        </span>
                        {c.crop && (
                          <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-300 font-bold">
                            {c.crop}
                          </span>
                        )}
                      </div>
                      {c.gstin && (
                        <div className="text-[11px] text-gray-500 font-mono">GSTIN: {c.gstin}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">
                      {c.mobile ? (
                        <span className="flex items-center space-x-1 text-gray-700">
                          <Phone className="w-3 h-3 text-agri-600" />
                          <span>{c.mobile}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {c.address ? (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-agri-600 shrink-0" />
                          <span>{c.address}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-agri-50 text-agri-800 border border-agri-200">
                        <Receipt className="w-3 h-3" />
                        <span>{c.totalBills || 1} bills</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-agri-900">
                      {formatCurrency(c.totalPurchases || 0)}
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-gray-600">
                      {c.lastVisit ? formatDate(c.lastVisit) : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-agri-100 hover:bg-agri-200 text-agri-800 font-bold text-xs transition-colors"
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

      {/* Customer Billing History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border-2 border-agri-600 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-agri-800 to-agri-900 text-white flex items-center justify-between border-b-2 border-agri-gold">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-agri-gold text-agri-950 flex items-center justify-center font-bold text-lg shadow">
                  👥
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight uppercase">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {selectedCustomer.address || 'No address'} • Phone: {selectedCustomer.mobile || 'No phone'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Summary Stats */}
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Bills</span>
                <span className="text-lg font-black text-gray-900 font-mono">{customerBills.length}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Spent</span>
                <span className="text-lg font-black text-agri-800 font-mono">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Last Visit</span>
                <span className="text-xs font-bold text-gray-700 mt-1 block">
                  {selectedCustomer.lastVisit ? formatDate(selectedCustomer.lastVisit) : 'Today'}
                </span>
              </div>
            </div>

            {/* Customer Bills Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-xs font-black uppercase text-agri-950 tracking-wider mb-2.5">
                Past Bills for this Customer ({customerBills.length})
              </h4>

              {customerBills.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No individual bill records found for this customer.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-agri-950 text-white font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Bill No</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Items</th>
                        <th className="p-2.5">Payment</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customerBills.map((b) => (
                        <tr key={b.id} className="hover:bg-emerald-50/50">
                          <td className="p-2.5 font-mono font-bold text-agri-800">{b.billNumber}</td>
                          <td className="p-2.5 text-gray-600">{formatDate(b.date)}</td>
                          <td className="p-2.5 font-medium">{b.items.length} items</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
                              {b.paymentMethod}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                            {formatCurrency(b.grandTotal)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => {
                                setInspectedBill(b);
                                setIsDetailsOpen(true);
                              }}
                              className="px-2 py-1 rounded bg-agri-700 hover:bg-agri-800 text-white font-bold text-[10px]"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 text-right">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-bold text-xs rounded-xl text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      <BillDetailsModal
        isOpen={isDetailsOpen}
        bill={inspectedBill}
        settings={settings}
        onPrintThermal={() => {
          setIsDetailsOpen(false);
          setPrintBill(inspectedBill);
          setIsPrintModalOpen(true);
        }}
        onPrintA4={() => {
          setIsDetailsOpen(false);
          setPrintBill(inspectedBill);
          setIsPrintModalOpen(true);
        }}
        onClose={() => {
          setIsDetailsOpen(false);
          setInspectedBill(null);
        }}
      />

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        bill={printBill}
        settings={settings}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintBill(null);
        }}
      />
    </div>
  );
};

