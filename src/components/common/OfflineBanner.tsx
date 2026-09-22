import React, { useState, useEffect } from 'react';
import { WifiOff, Database, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface OfflineBannerProps {
  onNavigateToBackup: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onNavigateToBackup }) => {
  const { settings } = useSettings();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    if (settings?.backupReminderDays && settings.backupReminderDays > 0) {
      const lastBackup = settings.lastBackupDate;
      if (!lastBackup) {
        setShowBackupReminder(true);
        return;
      }
      const daysSince = Math.floor(
        (Date.now() - new Date(lastBackup).getTime()) / 86_400_000
      );
      setShowBackupReminder(daysSince >= settings.backupReminderDays);
    }
  }, [settings]);

  if (dismissed) return null;

  if (!isOnline) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2 text-xs no-print"
        style={{
          background: 'rgba(234,179,8,0.08)',
          borderBottom: '1px solid rgba(234,179,8,0.2)',
        }}
      >
        <div className="flex items-center gap-2" style={{ color: '#fbbf24' }}>
          <WifiOff size={13} />
          <span>You are currently offline. All data is saved locally.</span>
        </div>
        <button onClick={() => setDismissed(true)} className="btn-ghost p-1">
          <X size={14} />
        </button>
      </div>
    );
  }

  if (showBackupReminder) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2 text-xs no-print"
        style={{
          background: 'rgba(92,124,137,0.08)',
          borderBottom: '1px solid rgba(92,124,137,0.15)',
        }}
      >
        <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <Database size={13} style={{ color: '#5C7C89' }} />
          <span>
            Backup reminder: It&apos;s been a while since your last backup.{' '}
            <button
              onClick={() => { onNavigateToBackup(); setDismissed(true); }}
              className="underline underline-offset-2 transition-colors hover:text-white"
              style={{ color: '#5C7C89' }}
            >
              Backup now
            </button>
          </span>
        </div>
        <button onClick={() => setDismissed(true)} className="btn-ghost p-1">
          <X size={14} />
        </button>
      </div>
    );
  }

  return null;
};
