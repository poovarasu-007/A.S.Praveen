import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Phone, MapPin, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4 text-xs text-gray-600 print:hidden select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
          <span className="font-bold text-agri-800 text-sm">{settings.businessName}</span>
          <span className="hidden sm:inline text-gray-400">•</span>
          <span className="text-gray-600 font-medium">{settings.tagline}</span>
        </div>

        <div className="flex items-center space-x-4 text-gray-700">
          <span className="flex items-center space-x-1">
            <Phone className="w-3.5 h-3.5 text-agri-700" />
            <span className="font-semibold text-agri-900">Mob: {settings.mobile1} | {settings.mobile2}</span>
          </span>
          <span className="hidden lg:flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-agri-700" />
            <span>{settings.city}, {settings.district}</span>
          </span>
          <span className="hidden md:flex items-center space-x-1 text-agri-700 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>GST: {settings.gstin}</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
