import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Lock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { verifyPassword } from '../../utils/security';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  warningText?: string;
  detailsText?: string;
  billDetails?: {
    billNumber: string;
    customerName: string;
    amount: string;
  };
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmButtonColor?: string;
  requirePassword?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  warningText,
  detailsText,
  billDetails,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  confirmButtonColor,
  requirePassword = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveConfirmLabel = confirmLabel || t.confirm;
  const effectiveCancelLabel = cancelLabel || t.cancel;

  /* Lock body scroll while open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPassword('');
      setError('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveVariant: 'danger' | 'warning' | 'info' =
    variant ||
    (confirmButtonColor === 'amber'
      ? 'warning'
      : confirmButtonColor === 'green'
      ? 'info'
      : 'danger');

  const accentColor = {
    danger: { icon: '#B42318', border: '#B42318', bg: '#FDECEC' },
    warning: { icon: '#B7791F', border: '#B7791F', bg: '#FFF7E0' },
    info: { icon: '#287056', border: '#C1E6BA', bg: '#EAF8E7' },
  }[effectiveVariant];

  const btnClass = {
    danger: 'btn-danger',
    warning: 'bg-[#B7791F] hover:bg-[#966318] text-white',
    info: 'btn-primary',
  }[effectiveVariant];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (requirePassword) {
      if (!password) {
        setError(t.passwordRequired);
        return;
      }
      if (currentUser?.passwordHash) {
        const isMatch = await verifyPassword(password, currentUser.passwordHash);
        if (!isMatch) {
          setError(t.incorrectAdminPassword);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      await onConfirm();
      setPassword('');
    } catch (err: any) {
      setError(err?.message || t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayText = warningText || message;
  const busy = isLoading || isSubmitting;

  return (
    <div
      className="modal-overlay animate-fade-in z-50 flex items-center justify-center p-4 bg-[#023337]/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="w-full max-w-md animate-scale-in border border-[#C1E6BA] shadow-2xl rounded-2xl overflow-hidden bg-white text-[#023337]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: accentColor.bg, border: `1px solid ${accentColor.border}` }}
            >
              <AlertTriangle size={20} style={{ color: accentColor.icon }} />
            </div>
            <h3 id="confirm-title" className="text-[#023337] font-bold text-base">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-[#78958A] hover:text-[#023337] p-1 rounded-lg transition-colors cursor-pointer"
             aria-label={t.close}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {displayText && (
            <p className="text-sm text-[#28564B] leading-relaxed font-normal">
              {displayText}
            </p>
          )}

          {billDetails && (
            <div className="bg-[#EAF8E7] border border-[#C1E6BA] rounded-xl p-3.5 space-y-1.5 text-xs text-[#023337]">
              <div className="flex justify-between">
                <span className="text-[#55766A] font-medium">{t.billNumber}:</span>
                <span className="font-mono font-bold text-[#023337]">{billDetails.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55766A] font-medium">{t.customers}:</span>
                <span className="font-bold text-[#023337]">{billDetails.customerName}</span>
              </div>
              <div className="flex justify-between border-t border-[#C1E6BA] pt-1.5 mt-1.5">
                <span className="text-[#55766A] font-medium">{t.amount}:</span>
                <span className="font-bold text-[#388A64] text-sm font-mono">{billDetails.amount}</span>
              </div>
            </div>
          )}

          {detailsText && (
            <div className="text-xs text-[#6B4A0B] bg-[#FFF7E0] border border-[#B7791F]/40 rounded-xl p-3">
              {detailsText}
            </div>
          )}

          {requirePassword && (
            <div className="space-y-1.5 pt-1">
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-[#28564B] flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#4DA674]" />
                <span>{t.confirmAdminPassword}:</span>
              </label>
              <input
                id="confirm-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="input-arch"
                autoFocus
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-[#8A1C1C] font-medium bg-[#FDECEC] border border-[#B42318] p-2.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Divider */}
          <div className="divider-arch" />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              id="confirm-cancel-btn"
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="btn-light flex-1 py-2.5 rounded-xl text-xs font-semibold"
            >
              {effectiveCancelLabel}
            </button>
            <button
              id="confirm-action-btn"
              type="submit"
              disabled={busy}
              className={`${btnClass} flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md`}
            >
              {busy ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{t.processing}</span>
                </>
              ) : (
                effectiveConfirmLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
