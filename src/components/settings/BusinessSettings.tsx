import React, { useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, PhoneCall, Printer, Save, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import type { GstMode } from '../../types';

export const BusinessSettingsView: React.FC = () => {
  const { settings, updateSettings, t } = useSettings();
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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (!businessName.trim() || !gstin.trim() || !mobile1.trim()) { setError(t.settingsRequired); return; }
    try {
      setIsSaving(true);
      const completeAddress = `${addressLine1}, ${street}, ${city}, ${district}, ${state} - ${pincode}`;
      const ok = await updateSettings({ businessName: businessName.trim(), tagline: tagline.trim(), gstin: gstin.trim().toUpperCase(), mobile1: mobile1.trim(), mobile2: mobile2.trim(), addressLine1: addressLine1.trim(), street: street.trim(), city: city.trim(), district: district.trim(), state: state.trim(), pincode: pincode.trim(), completeAddress, email: email.trim() || undefined, invoiceFooterMessage: invoiceFooterMessage.trim(), defaultGstMode, defaultPrintFormat }, currentUser?.username || 'admin');
      if (ok) { setFeedback(t.settingsSaveSuccess); window.setTimeout(() => setFeedback(''), 5000); } else setError(t.error);
    } catch (err: any) { setError(err?.message || t.error); } finally { setIsSaving(false); }
  };

  const field = (label: string, value: string, setter: (value: string) => void, type = 'text', required = false, extraClass = '') => <div><label className="label-arch">{label}{required && <span className="ml-1 text-error">*</span>}</label><input aria-label={label} type={type} value={value} onChange={(event) => setter(event.target.value)} className={`input-arch ${extraClass}`} required={required} /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-8">
      <section className="card-glass flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900 text-primary-100"><SettingsIcon size={20} aria-hidden="true" /></div><div><h1 className="text-lg font-semibold text-primary-900">{t.settings}</h1><p className="text-xs text-text-tertiary">{t.settingsDescription}</p></div></div><div className="flex items-center gap-1.5 rounded-xl border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-secondary-700"><ShieldCheck size={15} aria-hidden="true" />{t.gstProtected}</div></section>
      {feedback && <div className="flex items-center gap-2 rounded-xl border border-success bg-success-bg p-3 text-xs font-semibold text-secondary-700" role="status"><CheckCircle2 size={16} aria-hidden="true" />{feedback}</div>}
      {error && <div className="flex items-center gap-2 rounded-xl border border-error bg-error-bg p-3 text-xs font-semibold text-error" role="alert"><AlertCircle size={16} aria-hidden="true" />{error}</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <section className="card-glass space-y-4 p-5"><h2 className="flex items-center gap-2 border-b border-border-subtle pb-2 text-sm font-semibold text-primary-900"><Building2 size={16} className="text-secondary-700" aria-hidden="true" />{t.businessIdentity}</h2><div className="grid gap-4 sm:grid-cols-2">{field(t.officialBusinessName, businessName, setBusinessName, 'text', true, 'font-semibold')}{field(t.businessTagline, tagline, setTagline)}{field(t.gstinNumber, gstin, (value) => setGstin(value.toUpperCase()), 'text', true, 'font-mono uppercase')}{field(t.businessEmail, email, setEmail, 'email')}</div></section>
        <section className="card-glass space-y-4 p-5"><h2 className="flex items-center gap-2 border-b border-border-subtle pb-2 text-sm font-semibold text-primary-900"><PhoneCall size={16} className="text-secondary-700" aria-hidden="true" />{t.contactAddress}</h2><div className="grid gap-4 sm:grid-cols-2">{field(t.primaryMobile, mobile1, setMobile1, 'tel', true, 'font-mono')}{field(t.phone2, mobile2, setMobile2, 'tel', false, 'font-mono')}{field(t.buildingFlat, addressLine1, setAddressLine1)}{field(t.roadStreet, street, setStreet)}{field(t.cityTownVillage, city, setCity)}{field(t.district, district, setDistrict)}{field(t.state, state, setState)}{field(t.pinCode, pincode, setPincode, 'text', false, 'font-mono')}</div></section>
        <section className="card-glass space-y-4 p-5"><h2 className="flex items-center gap-2 border-b border-border-subtle pb-2 text-sm font-semibold text-primary-900"><Printer size={16} className="text-secondary-700" aria-hidden="true" />{t.billingDefaults}</h2><div className="grid gap-4 sm:grid-cols-2"><div><label className="label-arch" htmlFor="default-gst-mode">{t.defaultGstCalculation}</label><select id="default-gst-mode" value={defaultGstMode} onChange={(event) => setDefaultGstMode(event.target.value as GstMode)} className="input-arch"><option value="CGST_SGST">{t.intraStateTax}</option><option value="IGST">{t.interStateTax}</option><option value="EXEMPT">{t.gstExempt}</option></select></div><div><label className="label-arch" htmlFor="default-print-format">{t.defaultPrintOutput}</label><select id="default-print-format" value={defaultPrintFormat} onChange={(event) => setDefaultPrintFormat(event.target.value as '80mm' | 'A4')} className="input-arch font-semibold"><option value="80mm">{t.thermalOption}</option><option value="A4">{t.a4Option}</option></select></div><div className="sm:col-span-2"><label className="label-arch" htmlFor="invoice-footer">{t.invoiceFooterNote}</label><input id="invoice-footer" type="text" value={invoiceFooterMessage} onChange={(event) => setInvoiceFooterMessage(event.target.value)} placeholder={t.invoiceThankYou} className="input-arch" /></div></div></section>
        {isAdmin ? <div className="flex justify-end pt-2"><button type="submit" disabled={isSaving} className="btn-primary px-6 py-3 text-sm"><Save size={16} aria-hidden="true" />{isSaving ? t.savingSettings : t.saveSettings}</button></div> : <p className="text-center text-xs italic text-text-tertiary">{t.settingsViewOnly}</p>}
      </form>
    </div>
  );
};
