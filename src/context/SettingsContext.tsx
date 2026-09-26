import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BusinessSettings } from '../types';
import { db, DEFAULT_BUSINESS_SETTINGS } from '../db/db';
import { translations, type TranslationDictionary } from '../utils/translations';
import {
  DEFAULT_LANGUAGE,
  applyLanguage,
  getStoredLanguage,
  storeLanguage,
  type LanguageCode,
} from '../utils/i18n';

interface SettingsContextType {
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>, performedBy: string) => Promise<boolean>;
  isOnline: boolean;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
  isBackupDue: boolean;
  daysSinceLastBackup: number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  // Read and validate the saved preference once, then keep it in React state
  // so switching languages does not reload or reset the current form/session.
  const [language, setLanguageState] = useState<LanguageCode>(getStoredLanguage);

  useEffect(() => {
    applyLanguage(language);
    if (typeof document !== 'undefined') {
      document.title = language === 'ta'
        ? 'ஏ.எஸ். பிரவீன் டிரேடர்ஸ் | விவசாய பில்லிங் சிஸ்டம்'
        : 'A.S. Praveen Traders | Agricultural Billing System';
    }
  }, [language]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const englishKeys = Object.keys(translations.en);
    const tamilKeys = new Set(Object.keys(translations.ta));
    const missingTamil = englishKeys.filter((key) => !tamilKeys.has(key));
    if (missingTamil.length) console.warn('[i18n] Missing Tamil translation keys:', missingTamil);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    if (lang !== 'en' && lang !== 'ta') return;
    setLanguageState(lang);
    storeLanguage(lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === DEFAULT_LANGUAGE ? 'ta' : DEFAULT_LANGUAGE);
  };

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

  const t = translations[language];

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isOnline,
        language,
        setLanguage,
        toggleLanguage,
        t,
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
