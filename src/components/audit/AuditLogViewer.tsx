import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { ShieldAlert, Search, Filter, ShieldCheck, Clock, Calendar } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const auditLogs = useLiveQuery(() => db.auditLogs.orderBy('timestamp').reverse().toArray(), []) || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [recordFilter, setRecordFilter] = useState('ALL');

  const filtered = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.recordId && log.recordId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = recordFilter === 'ALL' || log.recordType === recordFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-agri-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <ShieldAlert className="w-5 h-5 text-agri-gold" />
          </div>
          <div>
            <h2 className="text-lg font-black text-agri-900 tracking-tight">
              SYSTEM AUDIT LOGS
            </h2>
            <p className="text-xs text-gray-500">
              Immutable security trail for price modifications, bill generations, and deletions
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-600 bg-agri-50 px-3 py-1.5 rounded-xl border border-agri-200 font-medium">
          Total Recorded Actions: <strong className="text-agri-900 font-mono text-sm">{auditLogs.length}</strong>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by user, action, details, or bill number..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-agri-600 outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {['ALL', 'BILL', 'PRODUCT', 'USER', 'SETTINGS', 'BACKUP', 'AUTH'].map((type) => (
            <button
              key={type}
              onClick={() => setRecordFilter(type)}
              className={`px-3 py-2 rounded-xl font-bold transition-colors ${
                recordFilter === type
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3 w-36">Date & Time</th>
                <th className="py-3 px-3 w-32">User</th>
                <th className="py-3 px-3 w-28">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No audit logs matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-agri-50/40 transition-colors">
                    <td className="py-3 px-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                      <div className="font-semibold">{log.date}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{log.time}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{log.user}</div>
                      <span className="text-[10px] uppercase font-bold text-agri-700 bg-agri-50 px-1.5 py-0.5 rounded border border-agri-200">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-800 block">{log.action}</span>
                      <span className="text-[10px] font-mono text-gray-500">{log.recordType}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium leading-relaxed">
                      {log.details}
                      {log.recordId && (
                        <div className="text-[10px] font-mono text-agri-800 font-bold mt-0.5">
                          ID: {log.recordId}
                        </div>
                      )}
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
