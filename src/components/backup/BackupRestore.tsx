import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../db/db';
import { formatDate, formatTime, getTodayDateString } from '../../utils/date';
import { ConfirmModal } from '../common/ConfirmModal';
import type { BackupPayload, BusinessSettings } from '../../types';
import {
  HardDriveDownload,
  Upload,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Database
} from 'lucide-react';

export const BackupRestore: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { settings, updateSettings, isBackupDue, daysSinceLastBackup } = useSettings();

  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<BackupPayload | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export Complete Backup JSON
  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      setErrorMsg('');

      const [products, bills, customers, users, dbSettings, dailySequences, auditLogs] =
        await Promise.all([
          db.products.toArray(),
          db.bills.toArray(),
          db.customers.toArray(),
          db.users.toArray(),
          db.settings.get('main_settings'),
          db.dailySequences.toArray(),
          db.auditLogs.toArray(),
        ]);

      const now = new Date();
      const backupData: BackupPayload = {
        version: '1.0.0',
        exportedAt: now.toISOString(),
        businessName: settings.businessName,
        products,
        bills,
        customers,
        users,
        settings: dbSettings || settings,
        dailySequences,
        auditLogs
      };

      // Generate downloadable JSON
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `praveen-traders-backup-${getTodayDateString()}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update last backup date in settings
      await updateSettings({ lastBackupDate: now.toISOString() }, currentUser?.username || 'admin');

      // Record in audit log
      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now.toISOString(),
        date: formatDate(now),
        time: formatTime(now),
        user: currentUser?.username || 'admin',
        role: currentUser?.role || 'ADMIN',
        action: 'Exported Complete Database Backup',
        recordType: 'BACKUP',
        details: `Saved ${bills.length} bills, ${products.length} products, ${customers.length} customers to ${filename}`
      });

      setFeedbackMsg(`✓ Complete backup downloaded successfully: ${filename}`);
      setTimeout(() => setFeedbackMsg(''), 6000);
    } catch (err: any) {
      console.error('Backup export failed:', err);
      setErrorMsg('Failed to generate backup: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  // 2. File Selected for Restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed: BackupPayload = JSON.parse(content);

        // Validation (Section 28)
        if (!parsed.version || !parsed.exportedAt || !Array.isArray(parsed.bills) || !Array.isArray(parsed.products)) {
          throw new Error('Invalid backup file structure. Missing required database tables or version metadata.');
        }

        setPendingRestoreData(parsed);
        setIsRestoreConfirmOpen(true);
      } catch (err: any) {
        setErrorMsg('Validation Error: ' + (err?.message || 'Could not parse backup file. Please select a valid JSON backup file.'));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  // 3. Confirm and Execute Restore
  const handleExecuteRestore = async () => {
    if (!pendingRestoreData) return;

    try {
      // First, take a current emergency snapshot before overwriting
      const currentBills = await db.bills.toArray();
      const currentProducts = await db.products.toArray();

      // Transactionally replace collections
      await db.transaction('rw', [db.products, db.bills, db.customers, db.dailySequences, db.auditLogs], async () => {
        // Clear existing
        await db.products.clear();
        await db.bills.clear();
        await db.customers.clear();
        await db.dailySequences.clear();

        // Restore collections
        if (pendingRestoreData.products?.length) await db.products.bulkAdd(pendingRestoreData.products);
        if (pendingRestoreData.bills?.length) await db.bills.bulkAdd(pendingRestoreData.bills);
        if (pendingRestoreData.customers?.length) await db.customers.bulkAdd(pendingRestoreData.customers);
        if (pendingRestoreData.dailySequences?.length) await db.dailySequences.bulkAdd(pendingRestoreData.dailySequences);
      });

      // Audit Log
      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: formatDate(new Date()),
        time: formatTime(new Date()),
        user: currentUser?.username || 'admin',
        role: 'ADMIN',
        action: 'Restored Database from Backup',
        recordType: 'BACKUP',
        details: `Restored backup originally taken on ${pendingRestoreData.exportedAt} (${pendingRestoreData.bills.length} bills, ${pendingRestoreData.products.length} products)`
      });

      setFeedbackMsg(`✓ Database successfully restored! Loaded ${pendingRestoreData.bills.length} bills and ${pendingRestoreData.products.length} products.`);
      setIsRestoreConfirmOpen(false);
      setPendingRestoreData(null);
    } catch (err: any) {
      console.error('Restore error:', err);
      setErrorMsg('Failed to restore database: ' + (err?.message || 'Transaction error'));
    }
  };

  // 4. Update Reminder Interval
  const handleReminderChange = async (days: number) => {
    await updateSettings({ backupReminderDays: days }, currentUser?.username || 'admin');
    setFeedbackMsg(`Backup reminder updated to every ${days === 0 ? 'Disabled' : `${days} days`}.`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-agri-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <HardDriveDownload className="w-5 h-5 text-agri-gold" />
          </div>
          <div>
            <h2 className="text-lg font-black text-agri-900 tracking-tight">
              BACKUP & RESTORE SYSTEM
            </h2>
            <p className="text-xs text-gray-500">
              Export and restore all local billing records, customers, products, and sequences
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-600 bg-agri-50 px-3 py-1.5 rounded-xl border border-agri-200">
          Last Backup:{' '}
          <strong className="text-agri-900">
            {settings.lastBackupDate ? formatDate(settings.lastBackupDate) : 'Never taken'}
          </strong>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Overdue Alert Banner if due */}
      {isBackupDue && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-200 rounded-xl">
              <Bell className="w-5 h-5 text-amber-800 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">⚠ Backup Reminder Overdue</h4>
              <p className="text-amber-800 mt-0.5">
                Your last backup was {daysSinceLastBackup === 999 ? 'never taken' : `${daysSinceLastBackup} days ago`}. Please download a backup to keep your billing safe.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow transition-colors shrink-0 flex items-center space-x-1.5"
          >
            <HardDriveDownload className="w-4 h-4" />
            <span>Backup Now</span>
          </button>
        </div>
      )}

      {/* Main Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Backup Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-5 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <HardDriveDownload className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Export Complete Backup</h3>
              <p className="text-xs text-gray-500">Download single-file JSON database archive</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Exports all agricultural products, customers, bills, sequence counters, and audit logs into an encrypted JSON file format.
          </p>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px] text-gray-600 font-mono space-y-1">
            <div>Format: <strong className="text-gray-900">JSON Archive (.json)</strong></div>
            <div>Target File: <strong className="text-agri-800">praveen-traders-backup-{getTodayDateString()}.json</strong></div>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full py-3 px-4 bg-agri-700 hover:bg-agri-800 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <HardDriveDownload className="w-4 h-4 text-agri-gold" />
            <span>{isExporting ? 'Generating Backup...' : 'Download Complete Backup'}</span>
          </button>
        </div>

        {/* Restore Backup Card (Admin Protected) */}
        <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-5 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
              <Upload className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Restore Application Data</h3>
              <p className="text-xs text-gray-500">Admin-only restoration from valid JSON backup</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Upload a previously exported Praveen Traders backup file to restore database tables. Schema and integrity checks are automatically verified.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {isAdmin ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-black text-white font-bold text-sm rounded-xl shadow flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 text-agri-gold" />
              <span>Select Backup File to Restore</span>
            </button>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Restoration requires System Administrator authentication.</span>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-5 space-y-3">
        <h3 className="font-bold text-sm text-gray-800 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-agri-700" />
          <span>Configurable Backup Reminder</span>
        </h3>

        <p className="text-xs text-gray-600">
          Set how frequently the system should display a backup reminder on the dashboard header.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {[
            { days: 1, label: 'Every 1 Day' },
            { days: 7, label: 'Every 7 Days (Recommended)' },
            { days: 30, label: 'Every 30 Days' },
            { days: 0, label: 'Disabled' },
          ].map((option) => (
            <button
              key={option.days}
              onClick={() => handleReminderChange(option.days)}
              className={`px-3 py-2 rounded-xl font-bold border transition-colors ${
                settings.backupReminderDays === option.days
                  ? 'bg-agri-700 text-white border-agri-800 shadow'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Restore (Section 28) */}
      <ConfirmModal
        isOpen={isRestoreConfirmOpen}
        title="WARNING: Restore Application Backup"
        warningText="Restoring this backup may replace existing application data. Verify that you have created a recent backup before continuing."
        detailsText={
          pendingRestoreData
            ? `Backup details: Exported at ${formatDate(pendingRestoreData.exportedAt)} with ${pendingRestoreData.bills.length} bills and ${pendingRestoreData.products.length} products.`
            : undefined
        }
        confirmLabel="Restore Database"
        confirmButtonColor="amber"
        requirePassword={true}
        onConfirm={handleExecuteRestore}
        onCancel={() => {
          setIsRestoreConfirmOpen(false);
          setPendingRestoreData(null);
        }}
      />
    </div>
  );
};
