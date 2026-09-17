import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import type { Customer } from '../../types';
import { Users, Search, Phone, MapPin, Receipt, ShoppingBag } from 'lucide-react';

export const CustomerList: React.FC = () => {
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mobile && c.mobile.includes(searchTerm)) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-agri-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Users className="w-5 h-5 text-agri-gold" />
          </div>
          <div>
            <h2 className="text-lg font-black text-agri-900 tracking-tight">
              CUSTOMER DIRECTORY
            </h2>
            <p className="text-xs text-gray-500">
              Auto-saved farmers, traders, and regular customer profiles
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-600 bg-agri-50 px-3 py-1.5 rounded-xl border border-agri-200 font-medium">
          Total Customers: <strong className="text-agri-900 font-mono text-sm">{customers.length}</strong>
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
            placeholder="Search customers by name, mobile number, or village/town..."
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
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact & Mobile</th>
                <th className="py-3 px-4">Address / Village</th>
                <th className="py-3 px-3 text-center">Total Bills</th>
                <th className="py-3 px-4 text-right">Total Purchases</th>
                <th className="py-3 px-3 text-center">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold">No customers found.</p>
                    <p className="text-xs mt-1">Customers are automatically added when generating bills.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-agri-50/50 transition-colors">
                    <td className="py-3 px-3 text-center font-semibold text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{c.name}</div>
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
