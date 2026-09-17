import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';
import { initializeDatabase } from './db/db';
import { Header } from './components/common/Header';
import { Sidebar, type NavSection } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { OfflineBanner } from './components/common/OfflineBanner';
import { Login } from './components/auth/Login';

// Main Views
import { Dashboard } from './components/dashboard/Dashboard';
import { BillingCounter } from './components/billing/BillingCounter';
import { ProductMaster } from './components/products/ProductMaster';
import { CustomerList } from './components/customers/CustomerList';
import { BillHistory } from './components/history/BillHistory';
import { SalesReports } from './components/reports/SalesReports';
import { BackupRestore } from './components/backup/BackupRestore';
import { UserManagement } from './components/users/UserManagement';
import { BusinessSettingsView } from './components/settings/BusinessSettings';
import { AuditLogViewer } from './components/audit/AuditLogViewer';

// Print & Inspection Modals
import { BillDetailsModal } from './components/history/BillDetailsModal';
import { PrintModal } from './components/print/PrintModal';
import type { Bill } from './types';

export const App: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const { settings } = useSettings();

  const [currentSection, setCurrentSection] = useState<NavSection>('billing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Selected bill inspector modal
  const [inspectedBill, setInspectedBill] = useState<Bill | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [printBill, setPrintBill] = useState<Bill | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Database initialization on initial mount
  useEffect(() => {
    initializeDatabase().catch((err) => {
      console.error('Database initialization error:', err);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F4] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-agri-700 text-white text-3xl flex items-center justify-center animate-bounce shadow-xl">
          🌾
        </div>
        <h2 className="mt-4 font-black text-agri-950 font-serif text-xl tracking-tight">
          A.S.PRAVEEN TRADERS
        </h2>
        <p className="text-xs text-gray-500 font-mono mt-1">Loading Local Billing Database...</p>
      </div>
    );
  }

  // If not authenticated, render Login view
  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] select-none">
      {/* Top Header */}
      <Header onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Offline & Backup Reminder Banner */}
      <OfflineBanner onNavigateToBackup={() => setCurrentSection('backup')} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(section) => setCurrentSection(section)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 print:p-0 print:overflow-visible">
          {currentSection === 'dashboard' && (
            <Dashboard
              onNavigateToNewBill={() => setCurrentSection('billing')}
              onNavigateToHistory={() => setCurrentSection('history')}
              onSelectBillToView={(b) => {
                setInspectedBill(b);
                setIsDetailsOpen(true);
              }}
            />
          )}

          {currentSection === 'billing' && <BillingCounter />}

          {currentSection === 'products' && <ProductMaster />}

          {currentSection === 'customers' && <CustomerList />}

          {currentSection === 'history' && <BillHistory />}

          {currentSection === 'reports' && <SalesReports />}

          {currentSection === 'backup' && <BackupRestore />}

          {currentSection === 'users' && <UserManagement />}

          {currentSection === 'settings' && <BusinessSettingsView />}

          {currentSection === 'audit' && <AuditLogViewer />}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Cross-module Bill Inspector Modal */}
      <BillDetailsModal
        isOpen={isDetailsOpen}
        bill={inspectedBill}
        settings={settings}
        onPrintThermal={() => {
          setIsDetailsOpen(false);
          setPrintBill(inspectedBill);
          setIsPrintModalOpen(true);
        }}
        onPrintA4={() => {
          setIsDetailsOpen(false);
          setPrintBill(inspectedBill);
          setIsPrintModalOpen(true);
        }}
        onClose={() => {
          setIsDetailsOpen(false);
          setInspectedBill(null);
        }}
      />

      {/* Cross-module Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        bill={printBill}
        settings={settings}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintBill(null);
        }}
      />
    </div>
  );
};

export default App;
