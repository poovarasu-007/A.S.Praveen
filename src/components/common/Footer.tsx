import React from 'react';
import { Wheat } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="flex items-center justify-between px-5 sm:px-6 h-9 flex-shrink-0 no-print"
      style={{
        background: 'rgba(0, 8, 16, 0.8)',
        borderTop: '1px solid rgba(92,124,137,0.1)',
      }}
    >
      <div className="flex items-center gap-2">
        <Wheat size={12} style={{ color: 'rgba(92,124,137,0.5)' }} />
        <span className="text-[11px]" style={{ color: 'rgba(92,124,137,0.45)', letterSpacing: '0.06em' }}>
          A.S. Praveen Traders — Agricultural Billing System
        </span>
      </div>
      <span className="text-[10px]" style={{ color: 'rgba(92,124,137,0.3)', letterSpacing: '0.04em' }}>
        v1.0.0 · Offline
      </span>
    </footer>
  );
};
