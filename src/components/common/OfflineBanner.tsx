import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { AlertCircle, HardDriveDownload, WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  onNavigateToBackup: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onNavigateToBackup }) => {
  const { isOnline, isBackupDue, daysSinceLastBackup } = useSettings();

  return (
    <div className="space-y-1 print:hidden select-none">
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> Internet connectivity is unavailable. All bills and customer data are being saved securely to your computer's local database.
            </span>
          </div>
          <span className="text-[11px] bg-amber-700/80 px-2 py-0.5 rounded border border-amber-500">
            Local IndexedDB Ready
          </span>
        </div>
      )}

      {isBackupDue && (
        <div className="bg-gradient-to-r from-agri-gold/20 via-amber-100 to-amber-50 border-b border-amber-300 text-amber-900 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Backup Reminder:</strong> Your last complete database backup was{' '}
              {daysSinceLastBackup === 999 ? 'never taken' : `${daysSinceLastBackup} days ago`}. Regular backups protect your sales history.
            </span>
          </div>
          <button
            onClick={onNavigateToBackup}
            className="flex items-center space-x-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors shrink-0 ml-3"
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>Backup Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
