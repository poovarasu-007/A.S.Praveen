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
import { GlobalAgriculturalBackground } from './components/common/GlobalAgriculturalBackground';
import type { Bill } from './types';
import { Wheat } from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const { settings, t } = useSettings();

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
      <div className="min-h-screen arch-bg flex flex-col items-center justify-center p-4 relative">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-100 bg-primary-900 shadow-soft animate-float" aria-hidden="true"><Wheat size={30} className="text-primary-100" /></div>
          <h2
            className="font-display font-bold text-primary-900 text-xl tracking-wider"
            style={{ letterSpacing: '0.12em' }}
          >
            {t.brandName}
          </h2>
          <div className="flex items-center gap-2 text-text-secondary">
            <div className="spinner w-4 h-4" />
            <span className="text-xs font-medium tracking-wide">
              {t.loading}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, render Login view
  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background/70 text-primary-900">
      {/* Unified Global Agricultural Background with 50% opacity in Billing */}
      <GlobalAgriculturalBackground
        opacity={currentSection === 'billing' ? 0.5 : 0.85}
        showMist={true}
      />

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

        {/* Dynamic Content View with transparent background over the agricultural scenery */}
        <main className="flex-1 overflow-y-auto bg-transparent p-3 sm:p-4 md:p-6 print:p-0 print:overflow-visible">
          <div key={currentSection} className="page-transition-wrapper animate-page-enter h-full">
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
          </div>
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
