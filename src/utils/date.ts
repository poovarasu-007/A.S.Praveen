import { formatDateValue, type LanguageCode } from './i18n';

/** Display date helper. The default remains stable for audit/export callers. */
export function formatDate(dateStr: string | Date, language: LanguageCode = 'en'): string {
  if (!dateStr) return '';
  if (language !== 'en') return formatDateValue(dateStr, language);
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${d.getFullYear()}`;
}

export function formatTime(timeStr?: string | Date, language: LanguageCode = 'en'): string {
  const locale = language === 'ta' ? 'ta-IN' : 'en-IN';
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  if (!timeStr) return new Date().toLocaleTimeString(locale, options);
  if (timeStr instanceof Date) return timeStr.toLocaleTimeString(locale, options);

  // Older records stored a display string such as `03:38:15 pm`. Parse the
  // clock portion when possible so Tamil views still use the active locale;
  // preserve any unknown/custom string rather than corrupting it.
  const match = timeStr.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?m\.?)?\s*$/i);
  if (!match) return timeStr;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] || 0);
  const meridiem = match[4]?.toLowerCase().replace(/\./g, '');
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  if (hour > 23 || minute > 59 || second > 59) return timeStr;
  const parsed = new Date(1970, 0, 1, hour, minute, second);
  return parsed.toLocaleTimeString(locale, options);
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateSequenceFormat(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
