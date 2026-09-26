import type { PaymentMethod, ProductCategory, UnitType } from '../types';

export type LanguageCode = 'en' | 'ta';

export const LANGUAGE_STORAGE_KEY = 'as_praveen_language';
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const localeMap: Record<LanguageCode, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
};

export const languageLabels: Record<LanguageCode, string> = {
  en: 'English',
  ta: 'தமிழ்',
};

const paymentMethodLabels: Record<LanguageCode, Record<PaymentMethod, string>> = {
  en: {
    Cash: 'Cash',
    UPI: 'UPI',
    Card: 'Card',
    'Bank Transfer': 'Bank Transfer',
    Credit: 'Credit',
    Other: 'Other',
  },
  ta: {
    Cash: 'ரொக்கம்',
    UPI: 'யூபிஐ',
    Card: 'அட்டை',
    'Bank Transfer': 'வங்கி பரிமாற்றம்',
    Credit: 'கடன்',
    Other: 'இதர',
  },
};

export function formatPaymentMethod(method: PaymentMethod, language: LanguageCode = DEFAULT_LANGUAGE): string {
  return paymentMethodLabels[language]?.[method] || method;
}

const unitLabels: Record<LanguageCode, Record<UnitType, string>> = {
  en: {
    kg: 'kg', gram: 'gram', quintal: 'quintal', ton: 'ton', bag: 'bag', litre: 'litre',
    ml: 'ml', piece: 'piece', box: 'box', packet: 'packet', bundle: 'bundle', set: 'set',
  },
  ta: {
    kg: 'கிலோ', gram: 'கிராம்', quintal: 'குவிண்டல்', ton: 'டன்', bag: 'பை', litre: 'லிட்டர்',
    ml: 'மில்லி', piece: 'துண்டு', box: 'பெட்டி', packet: 'பாக்கெட்', bundle: 'கட்டு', set: 'தொகுதி',
  },
};

export function formatUnit(unit: UnitType, language: LanguageCode = DEFAULT_LANGUAGE): string {
  return unitLabels[language]?.[unit] || unit;
}

const productCategoryLabels: Record<LanguageCode, Record<ProductCategory, string>> = {
  en: {
    Seeds: 'Seeds', Fertilizers: 'Fertilizers', Pesticides: 'Pesticides', 'Organic Manure': 'Organic Manure',
    'Agricultural Tools': 'Agricultural Tools', 'Irrigation Equipment': 'Irrigation Equipment',
    'Plant Growth Products': 'Plant Growth Products', 'Crop Protection': 'Crop Protection',
    'Bio-Fertilizers': 'Bio-Fertilizers', 'Farming Accessories': 'Farming Accessories', Other: 'Other',
  },
  ta: {
    Seeds: 'விதைகள்', Fertilizers: 'உரங்கள்', Pesticides: 'பூச்சிக்கொல்லிகள்', 'Organic Manure': 'கரிம உரம்',
    'Agricultural Tools': 'வேளாண் கருவிகள்', 'Irrigation Equipment': 'பாசன உபகரணங்கள்',
    'Plant Growth Products': 'தாவர வளர்ச்சி பொருட்கள்', 'Crop Protection': 'பயிர் பாதுகாப்பு',
    'Bio-Fertilizers': 'உயிர் உரங்கள்', 'Farming Accessories': 'வேளாண் துணைக்கருவிகள்', Other: 'இதர',
  },
};

export function formatProductCategory(category: ProductCategory, language: LanguageCode = DEFAULT_LANGUAGE): string {
  return productCategoryLabels[language]?.[category] || category;
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return value === 'en' || value === 'ta';
}

export function getStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguageCode(value) ? value : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function storeLanguage(language: LanguageCode): void {
  if (!isLanguageCode(language) || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Storage can be unavailable in private/offline contexts; the in-memory
    // language still changes for the current session.
  }
}

export function applyLanguage(language: LanguageCode): void {
  if (typeof document === 'undefined') return;
  const safeLanguage = isLanguageCode(language) ? language : DEFAULT_LANGUAGE;
  document.documentElement.lang = safeLanguage;
  document.documentElement.dir = 'ltr';
  document.documentElement.dataset.language = safeLanguage;
  document.documentElement.dataset.theme ||= 'light';
}

export function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}

export function formatCurrency(amount: number | null | undefined, language: LanguageCode = DEFAULT_LANGUAGE): string {
  const safeAmount = amount === null || amount === undefined || Number.isNaN(amount) ? 0 : amount;
  try {
    return new Intl.NumberFormat(localeMap[language], {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `₹${safeAmount.toFixed(2)}`;
  }
}

export function formatNumber(value: number | null | undefined, language: LanguageCode = DEFAULT_LANGUAGE): string {
  const safeValue = value === null || value === undefined || Number.isNaN(value) ? 0 : value;
  return new Intl.NumberFormat(localeMap[language]).format(safeValue);
}

export function formatDateValue(value: string | Date | null | undefined, language: LanguageCode = DEFAULT_LANGUAGE): string {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(localeMap[language], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeValue(value: string | Date | null | undefined, language: LanguageCode = DEFAULT_LANGUAGE): string {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(localeMap[language], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
