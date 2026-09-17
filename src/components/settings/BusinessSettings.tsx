import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, CheckCircle2, AlertCircle, Building2, PhoneCall, ShieldCheck, Printer } from 'lucide-react';
import type { GstMode } from '../../types';

export const BusinessSettingsView: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { currentUser, isAdmin } = useAuth();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [gstin, setGstin] = useState(settings.gstin);
  const [mobile1, setMobile1] = useState(settings.mobile1);
  const [mobile2, setMobile2] = useState(settings.mobile2);
  const [addressLine1, setAddressLine1] = useState(settings.addressLine1);
  const [street, setStreet] = useState(settings.street);
  const [city, setCity] = useState(settings.city);
  const [district, setDistrict] = useState(settings.district);
  const [state, setState] = useState(settings.state);
  const [pincode, setPincode] = useState(settings.pincode);
  const [email, setEmail] = useState(settings.email || '');
  const [invoiceFooterMessage, setInvoiceFooterMessage] = useState(settings.invoiceFooterMessage);
  const [defaultGstMode, setDefaultGstMode] = useState<GstMode>(settings.defaultGstMode);
  const [defaultPrintFormat, setDefaultPrintFormat] = useState<'80mm' | 'A4'>(settings.defaultPrintFormat);

  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim() || !gstin.trim() || !mobile1.trim()) {
      setError('Business Name, GSTIN, and Primary Mobile are mandatory.');
      return;
    }

    try {
      setIsSaving(true);
      const completeAddress = `${addressLine1}, ${street}, ${city}, ${district}, ${state} - ${pincode}`;

      const ok = await updateSettings(
        {
          businessName: businessName.trim(),
          tagline: tagline.trim(),
          gstin: gstin.trim().toUpperCase(),
          mobile1: mobile1.trim(),
          mobile2: mobile2.trim(),
          addressLine1: addressLine1.trim(),
          street: street.trim(),
          city: city.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          completeAddress,
          email: email.trim() || undefined,
          invoiceFooterMessage: invoiceFooterMessage.trim(),
          defaultGstMode,
          defaultPrintFormat
        },
        currentUser?.username || 'admin'
      );

      if (ok) {
        setFeedback('Settings updated successfully. All changes are reflected immediately on all printed bills.');
        setTimeout(() => setFeedback(''), 5000);
      } else {
        setError('Failed to update settings in local database.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-agri-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Settings className="w-5 h-5 text-agri-gold" />
          </div>
          <div>
            <h2 className="text-lg font-black text-agri-900 tracking-tight">
              BUSINESS SETTINGS
            </h2>
            <p className="text-xs text-gray-500">
              Configure mandatory invoice header, GST parameters, and default print formats
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GSTIN & Shop Header Protected</span>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Business Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-5 space-y-4">
          <h3 className="font-bold text-sm text-agri-900 flex items-center space-x-2 border-b border-gray-100 pb-2">
            <Building2 className="w-4 h-4 text-agri-700" />
            <span>Business Identity & Tax Registration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Official Business Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Business Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                GSTIN (GST Number) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers & Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-5 space-y-4">
          <h3 className="font-bold text-sm text-agri-900 flex items-center space-x-2 border-b border-gray-100 pb-2">
            <PhoneCall className="w-4 h-4 text-agri-700" />
            <span>Mobile Numbers & Physical Shop Address</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Primary Mobile Number <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={mobile1}
                onChange={(e) => setMobile1(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Secondary Mobile Number
              </label>
              <input
                type="text"
                value={mobile2}
                onChange={(e) => setMobile2(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Building No./Flat No.</label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Road / Street</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">City / Town / Village</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Invoice & Default Print Formats */}
        <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-5 space-y-4">
          <h3 className="font-bold text-sm text-agri-900 flex items-center space-x-2 border-b border-gray-100 pb-2">
            <Printer className="w-4 h-4 text-agri-700" />
            <span>Billing Defaults & Invoice Footers</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Default GST Calculation Mode</label>
              <select
                value={defaultGstMode}
                onChange={(e) => setDefaultGstMode(e.target.value as GstMode)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none bg-white"
              >
                <option value="CGST_SGST">Intra-state (CGST + SGST)</option>
                <option value="IGST">Inter-state (IGST)</option>
                <option value="EXEMPT">GST Exempt</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Default Print Output</label>
              <select
                value={defaultPrintFormat}
                onChange={(e) => setDefaultPrintFormat(e.target.value as '80mm' | 'A4')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none bg-white font-bold"
              >
                <option value="80mm">80mm Thermal Receipt (Counter standard)</option>
                <option value="A4">A4 Tax Invoice (Full page)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Invoice Footer Note</label>
              <input
                type="text"
                value={invoiceFooterMessage}
                onChange={(e) => setInvoiceFooterMessage(e.target.value)}
                placeholder="Thank you message displayed on invoices"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        {isAdmin ? (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-agri-700 hover:bg-agri-800 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl shadow-lg flex items-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4 text-agri-gold" />
              <span>{isSaving ? 'Saving Settings...' : 'Save Settings Changes'}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-center text-gray-500 italic">
            Settings are view-only for operator accounts. Login as admin to modify.
          </p>
        )}
      </form>
    </div>
  );
};
