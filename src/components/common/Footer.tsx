import React from 'react';
import { Wheat } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { t, isOnline } = useSettings();

  return (
    <footer
      className="flex items-center justify-between px-5 sm:px-6 h-9 flex-shrink-0 no-print"
      style={{
        background: '#EAF8E7',
        borderTop: '1px solid #C1E6BA',
      }}
    >
      <div className="flex items-center gap-2">
        <Wheat size={13} className="text-[#4DA674]" />
        <span className="text-[11px] font-medium text-[#28564B]">
          {t.brandName} — {t.brandSub}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-[#55766A]">
        <span className="inline-block w-2 h-2 rounded-full bg-[#4DA674]" />
        <span>{isOnline ? t.systemOnline : t.offlineMode}</span>
      </div>
    </footer>
  );
};
