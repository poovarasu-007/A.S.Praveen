import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Filter, Search, ShieldAlert } from 'lucide-react';
import { db } from '../../db/db';
import { useSettings } from '../../context/SettingsContext';
import { formatDateTimeValue } from '../../utils/i18n';
import { formatTime } from '../../utils/date';

export const AuditLogViewer: React.FC = () => {
  const { t, language } = useSettings();
  const auditLogs = useLiveQuery(() => db.auditLogs.orderBy('timestamp').reverse().toArray(), []) || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [recordFilter, setRecordFilter] = useState('ALL');
  const filtered = auditLogs.filter((log) => { const query = searchTerm.trim().toLowerCase(); return (!query || log.action.toLowerCase().includes(query) || log.user.toLowerCase().includes(query) || log.details.toLowerCase().includes(query) || Boolean(log.recordId?.toLowerCase().includes(query))) && (recordFilter === 'ALL' || log.recordType === recordFilter); });
  const filters = ['ALL', 'BILL', 'PRODUCT', 'USER', 'SETTINGS', 'BACKUP', 'AUTH'];

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-8">
      <section className="card-glass flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900 text-primary-100"><ShieldAlert size={20} aria-hidden="true" /></div><div><h1 className="text-lg font-semibold text-primary-900">{t.auditLogs}</h1><p className="text-xs text-text-tertiary">{t.auditDescription}</p></div></div><div className="rounded-xl border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs text-text-secondary">{t.totalActions}: <strong className="font-mono text-sm text-primary-900">{auditLogs.length}</strong></div></section>
      <section className="card-glass flex flex-col gap-3 p-4 md:flex-row"><div className="relative flex-1"><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t.searchAudit} className="input-arch pl-10" aria-label={t.search} /></div><div className="flex gap-1.5 overflow-x-auto" role="group" aria-label={t.filter}>{filters.map((filter) => <button key={filter} type="button" onClick={() => setRecordFilter(filter)} aria-pressed={recordFilter === filter} className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${recordFilter === filter ? 'border-primary-900 bg-primary-900 text-white' : 'border-primary-100 bg-primary-50 text-text-secondary hover:bg-primary-100'}`}>{filter}</button>)}</div></section>
      <section className="card-glass overflow-hidden"><div className="overflow-x-auto"><table className="table-arch"><thead><tr><th>#</th><th>{t.dateTime}</th><th>{t.user}</th><th>{t.auditAction}</th><th>{t.auditDetails}</th></tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={5} className="py-12 text-center text-text-tertiary">{t.noAudit}</td></tr> : filtered.map((log, index) => <tr key={log.id}><td className="text-center text-text-tertiary">{index + 1}</td><td className="whitespace-nowrap"><div className="font-semibold text-primary-900">{formatDateTimeValue(log.timestamp, language)}</div><div className="font-mono text-[10px] text-text-tertiary">{formatTime(log.time, language)}</div></td><td><div className="font-semibold text-primary-900">{log.user}</div><span className="badge-arch mt-1 inline-flex text-[10px]">{log.role === 'ADMIN' ? t.roleAdmin : t.roleOperator}</span></td><td><span className="block font-semibold text-primary-900">{log.action}</span><span className="font-mono text-[10px] text-text-tertiary">{log.recordType}</span></td><td className="font-medium leading-relaxed text-text-secondary">{log.details}{log.recordId && <div className="mt-0.5 font-mono text-[10px] font-semibold text-secondary-700">ID: {log.recordId}</div>}</td></tr>)}</tbody></table></div></section>
      <p className="flex items-center justify-center gap-1 text-center text-[11px] text-text-secondary"><Filter size={12} aria-hidden="true" />{t.auditDescription}</p>
    </div>
  );
};
