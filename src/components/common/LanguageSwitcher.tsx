import React from 'react';
import { Languages } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { languageLabels, type LanguageCode } from '../../utils/i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
  light?: boolean;
}

/** A keyboard-accessible language control shared by authenticated and auth views. */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false, light = false }) => {
  const { language, setLanguage, t } = useSettings();
  const options: LanguageCode[] = ['en', 'ta'];

  return (
    <div
      className={`language-switcher ${light ? 'language-switcher--light' : ''}`}
      role="group"
      aria-label={t.switchLanguage}
    >
      {!compact && <Languages size={14} aria-hidden="true" className="ml-1 text-primary-100" />}
      {options.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={`${t.switchLanguage}: ${languageLabels[code]}`}
          title={languageLabels[code]}
        >
          {code === 'en' ? 'EN' : 'தமிழ்'}
        </button>
      ))}
    </div>
  );
};
