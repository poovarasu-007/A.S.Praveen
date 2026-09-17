import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BusinessSettings } from '../types';
import { db, DEFAULT_BUSINESS_SETTINGS } from '../db/db';

interface SettingsContextType {
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>, performedBy: string) => Promise<boolean>;
  isOnline: boolean;
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  isBackupDue: boolean;
  daysSinceLastBackup: number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  // Load settings from DB
  const loadSettings = async () => {
    try {
      const saved = await db.settings.get('main_settings');
      if (saved) {
        setSettings(saved);
      } else {
        await db.settings.put(DEFAULT_BUSINESS_SETTINGS);
        setSettings(DEFAULT_BUSINESS_SETTINGS);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    loadSettings();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<BusinessSettings>, performedBy: string): Promise<boolean> => {
    try {
      const updated: BusinessSettings = {
        ...settings,
        ...newSettings,
        id: 'main_settings'
      };

      await db.settings.put(updated);
      setSettings(updated);

      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        user: performedBy,
        role: 'ADMIN',
        action: 'Updated Business Settings',
        recordType: 'SETTINGS',
        details: 'Settings configuration updated'
      });

      return true;
    } catch (err) {
      console.error('Failed to update settings:', err);
      return false;
    }
  };

  // Calculate if backup is due
  let daysSinceLastBackup = 0;
  let isBackupDue = false;

  if (settings.backupReminderDays > 0) {
    if (!settings.lastBackupDate) {
      isBackupDue = true;
      daysSinceLastBackup = 999;
    } else {
      const last = new Date(settings.lastBackupDate).getTime();
      const now = new Date().getTime();
      daysSinceLastBackup = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (daysSinceLastBackup >= settings.backupReminderDays) {
        isBackupDue = true;
      }
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isOnline,
        language,
        setLanguage,
        isBackupDue,
        daysSinceLastBackup
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
