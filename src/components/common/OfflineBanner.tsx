import React, { useState, useEffect } from 'react';
import { WifiOff, Database, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface OfflineBannerProps {
  onNavigateToBackup: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onNavigateToBackup }) => {
  const { settings, t } = useSettings();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [daysSince, setDaysSince] = useState(0);

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
        setDaysSince(99);
        return;
      }
      const days = Math.floor(
        (Date.now() - new Date(lastBackup).getTime()) / 86_400_000
      );
      setDaysSince(days);
      setShowBackupReminder(days >= settings.backupReminderDays);
    }
  }, [settings]);

  if (dismissed) return null;

  if (!isOnline) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2 text-xs no-print"
        style={{
          background: '#FFF7E0',
          borderBottom: '1px solid #B7791F',
          color: '#6B4A0B',
        }}
      >
        <div className="flex items-center gap-2 font-medium">
          <WifiOff size={14} className="text-[#B7791F]" />
          <span>{t.offlineMode}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-[#6B4A0B] hover:bg-[#B7791F]/20 cursor-pointer"
          aria-label={t.close}
        >
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
          background: '#EAF8E7',
          borderBottom: '1px solid #C1E6BA',
          color: '#023337',
        }}
      >
        <div className="flex items-center gap-2 font-medium">
          <Database size={14} className="text-[#4DA674]" />
          <span>
            {t.backupReminderMsg.replace('{days}', String(daysSince))}{' '}
            <button
              onClick={() => { onNavigateToBackup(); setDismissed(true); }}
              className="font-bold underline underline-offset-2 text-[#287056] hover:text-[#023337] cursor-pointer ml-1"
            >
              {t.backupNow}
            </button>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-[#023337] hover:bg-[#C1E6BA]/40 cursor-pointer"
          aria-label={t.close}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return null;
};
