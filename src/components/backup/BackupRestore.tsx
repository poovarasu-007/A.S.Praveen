import React, { useRef, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Clock, Database, HardDriveDownload, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../db/db';
import { formatDate, getTodayDateString } from '../../utils/date';
import { interpolate } from '../../utils/i18n';
import { ConfirmModal } from '../common/ConfirmModal';
import type { BackupPayload } from '../../types';

export const BackupRestore: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { settings, updateSettings, isBackupDue, daysSinceLastBackup, t, language } = useSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<BackupPayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async () => {
    try {
      setIsExporting(true); setErrorMsg('');
      const [products, bills, customers, users, dbSettings, dailySequences, auditLogs] = await Promise.all([db.products.toArray(), db.bills.toArray(), db.customers.toArray(), db.users.toArray(), db.settings.get('main_settings'), db.dailySequences.toArray(), db.auditLogs.toArray()]);
      const now = new Date();
      const backupData: BackupPayload = { version: '1.0.0', exportedAt: now.toISOString(), businessName: settings.businessName, products, bills, customers, users, settings: dbSettings || settings, dailySequences, auditLogs };
      const url = URL.createObjectURL(new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' }));
      const filename = `praveen-traders-backup-${getTodayDateString()}.json`;
      const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      await updateSettings({ lastBackupDate: now.toISOString() }, currentUser?.username || 'admin');
      await db.auditLogs.add({ id: `audit_${Date.now()}`, timestamp: now.toISOString(), date: formatDate(now, language), time: now.toLocaleTimeString(language === 'ta' ? 'ta-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }), user: currentUser?.username || 'admin', role: currentUser?.role || 'ADMIN', action: 'Exported Complete Database Backup', recordType: 'BACKUP', details: `Saved ${bills.length} bills, ${products.length} products, ${customers.length} customers to ${filename}` });
      setFeedbackMsg(`${t.success}: ${filename}`); window.setTimeout(() => setFeedbackMsg(''), 6000);
    } catch (err: any) { setErrorMsg(`${t.error}: ${err?.message || 'Unknown error'}`); } finally { setIsExporting(false); }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return; setErrorMsg('');
    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      try {
        const parsed = JSON.parse(loadEvent.target?.result as string) as BackupPayload;
        if (!parsed.version || !parsed.exportedAt || !Array.isArray(parsed.bills) || !Array.isArray(parsed.products)) throw new Error('Invalid backup file structure.');
        setPendingRestoreData(parsed); setIsRestoreConfirmOpen(true);
      } catch (err: any) { setErrorMsg(`${t.error}: ${err?.message || 'Invalid JSON file'}`); } finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!pendingRestoreData) return;
    try {
      await db.transaction('rw', [db.products, db.bills, db.customers, db.dailySequences, db.auditLogs], async () => {
        await db.products.clear(); await db.bills.clear(); await db.customers.clear(); await db.dailySequences.clear();
        if (pendingRestoreData.products?.length) await db.products.bulkAdd(pendingRestoreData.products);
        if (pendingRestoreData.bills?.length) await db.bills.bulkAdd(pendingRestoreData.bills);
        if (pendingRestoreData.customers?.length) await db.customers.bulkAdd(pendingRestoreData.customers);
        if (pendingRestoreData.dailySequences?.length) await db.dailySequences.bulkAdd(pendingRestoreData.dailySequences);
      });
      await db.auditLogs.add({ id: `audit_${Date.now()}`, timestamp: new Date().toISOString(), date: formatDate(new Date(), language), time: new Date().toLocaleTimeString(language === 'ta' ? 'ta-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }), user: currentUser?.username || 'admin', role: 'ADMIN', action: 'Restored Database from Backup', recordType: 'BACKUP', details: `Restored backup originally taken on ${pendingRestoreData.exportedAt}` });
      setFeedbackMsg(`${t.success}: ${pendingRestoreData.bills.length} ${t.billHistory.toLowerCase()}`); setIsRestoreConfirmOpen(false); setPendingRestoreData(null);
    } catch (err: any) { setErrorMsg(`${t.error}: ${err?.message || 'Transaction error'}`); }
  };

  const handleReminderChange = async (days: number) => { await updateSettings({ backupReminderDays: days }, currentUser?.username || 'admin'); setFeedbackMsg(`${t.success}: ${t.backupReminderTitle}`); window.setTimeout(() => setFeedbackMsg(''), 4000); };
  const lastBackup = settings.lastBackupDate ? formatDate(settings.lastBackupDate, language) : t.neverTaken;

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-8">
      <section className="card-glass flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900 text-primary-100"><HardDriveDownload size={20} aria-hidden="true" /></div><div><h1 className="text-lg font-semibold text-primary-900">{t.backup}</h1><p className="text-xs text-text-tertiary">{t.backupDescription}</p></div></div><div className="rounded-xl border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs text-text-secondary">{t.lastBackup}: <strong className="text-primary-900">{lastBackup}</strong></div></section>
      {feedbackMsg && <div className="flex items-center gap-2 rounded-xl border border-success bg-success-bg p-3 text-xs font-semibold text-secondary-700" role="status"><CheckCircle2 size={16} aria-hidden="true" />{feedbackMsg}</div>}
      {errorMsg && <div className="flex items-center gap-2 rounded-xl border border-error bg-error-bg p-3 text-xs font-semibold text-error" role="alert"><AlertTriangle size={16} aria-hidden="true" />{errorMsg}</div>}
      {isBackupDue && <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-warning/30 bg-warning-bg p-4 text-xs text-warning sm:flex-row sm:items-center"><div className="flex items-start gap-3"><div className="rounded-xl bg-warning/15 p-2"><Bell size={20} aria-hidden="true" /></div><div><h2 className="font-semibold">{t.backupOverdue}</h2><p className="mt-0.5">{daysSinceLastBackup === 999 ? t.backupReminderNever : interpolate(t.backupReminderText, { days: daysSinceLastBackup })}</p></div></div><button type="button" onClick={handleExportBackup} disabled={isExporting} className="btn-light shrink-0 px-4 py-2 text-xs"><HardDriveDownload size={15} aria-hidden="true" />{t.backupNow}</button></div>}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card-glass space-y-4 p-5"><div className="flex items-center gap-2.5"><div className="rounded-xl border border-primary-100 bg-primary-50 p-2.5 text-secondary-700"><HardDriveDownload size={23} aria-hidden="true" /></div><div><h2 className="font-semibold text-primary-900">{t.exportComplete}</h2><p className="text-xs text-text-tertiary">{t.exportDescription}</p></div></div><p className="text-xs leading-relaxed text-text-secondary">{t.backupDescription}</p><div className="space-y-1 rounded-xl border border-primary-100 bg-primary-50 p-3 font-mono text-[11px] text-text-secondary"><div>{t.format}: <strong className="text-primary-900">JSON Archive (.json)</strong></div><div>{t.targetFile}: <strong className="text-secondary-700">praveen-traders-backup-{getTodayDateString()}.json</strong></div></div><button type="button" onClick={handleExportBackup} disabled={isExporting} className="btn-primary w-full py-3 text-sm"><HardDriveDownload size={16} aria-hidden="true" />{isExporting ? t.generatingBackup : t.downloadBackupButton}</button></section>
        <section className="card-glass space-y-4 p-5"><div className="flex items-center gap-2.5"><div className="rounded-xl border border-primary-100 bg-primary-50 p-2.5 text-secondary-700"><Upload size={23} aria-hidden="true" /></div><div><h2 className="font-semibold text-primary-900">{t.restoreData}</h2><p className="text-xs text-text-tertiary">{t.restoreDescription}</p></div></div><p className="text-xs leading-relaxed text-text-secondary">{t.restoreDescription}</p><input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileSelect} className="hidden" />{isAdmin ? <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-light w-full py-3 text-sm"><Upload size={16} aria-hidden="true" />{t.selectBackupFile}</button> : <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning-bg p-3 text-xs text-warning"><ShieldCheck size={16} aria-hidden="true" />{t.restoreRequiresAuth}</div>}</section>
      </div>

      <section className="card-glass space-y-3 p-5"><h2 className="flex items-center gap-2 text-sm font-semibold text-primary-900"><Clock size={16} className="text-secondary-700" aria-hidden="true" />{t.configurableReminder}</h2><p className="text-xs text-text-secondary">{t.reminderDescription}</p><div className="flex flex-wrap gap-2">{[[1, t.everyDay], [7, t.everySevenDays], [30, t.everyThirtyDays], [0, t.disabledOption]].map(([days, label]) => <button key={String(days)} type="button" onClick={() => handleReminderChange(Number(days))} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${settings.backupReminderDays === days ? 'border-primary-900 bg-primary-900 text-white' : 'border-primary-100 bg-primary-50 text-text-secondary hover:bg-primary-100'}`}>{label}</button>)}</div></section>

      <ConfirmModal isOpen={isRestoreConfirmOpen} title={t.restoreWarningTitle} warningText={t.restoreWarningText} detailsText={pendingRestoreData ? interpolate(t.restoreDetails, { date: formatDate(pendingRestoreData.exportedAt, language), bills: pendingRestoreData.bills.length, products: pendingRestoreData.products.length }) : undefined} confirmLabel={t.restoreDatabase} confirmButtonColor="amber" requirePassword onConfirm={handleExecuteRestore} onCancel={() => { setIsRestoreConfirmOpen(false); setPendingRestoreData(null); }} />
    </div>
  );
};
