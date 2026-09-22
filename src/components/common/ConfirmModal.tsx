import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Lock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  confirmButtonColor,
  requirePassword = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    danger: { icon: 'rgba(239,68,68,0.9)', border: 'rgba(239,68,68,0.35)', bg: 'rgba(239,68,68,0.12)' },
    warning: { icon: 'rgba(234,179,8,0.9)', border: 'rgba(234,179,8,0.35)', bg: 'rgba(234,179,8,0.12)' },
    info: { icon: 'rgba(92,124,137,0.9)', border: 'rgba(92,124,137,0.35)', bg: 'rgba(92,124,137,0.12)' },
  }[effectiveVariant];

  const btnClass = {
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-primary',
  }[effectiveVariant];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (requirePassword) {
      if (!password) {
        setError('Please enter your admin password to proceed');
        return;
      }
      if (currentUser?.passwordHash) {
        const isMatch = await verifyPassword(password, currentUser.passwordHash);
        if (!isMatch) {
          setError('Incorrect admin password. Action aborted.');
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      await onConfirm();
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayText = warningText || message;
  const busy = isLoading || isSubmitting;

  return (
    <div
      className="modal-overlay animate-fade-in z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="card-glass-dark w-full max-w-md animate-scale-in border border-[#1F4959]/60 shadow-2xl rounded-2xl overflow-hidden bg-[#0a1926]/95 text-slate-100"
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
            <h3 id="confirm-title" className="text-white font-semibold text-base">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {displayText && (
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {displayText}
            </p>
          )}

          {billDetails && (
            <div className="bg-[#011425]/80 border border-[#1F4959]/50 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Bill Number:</span>
                <span className="font-mono font-bold text-teal-300">{billDetails.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="font-bold text-white">{billDetails.customerName}</span>
              </div>
              <div className="flex justify-between border-t border-[#1F4959]/40 pt-1.5 mt-1.5">
                <span className="text-slate-400 font-medium">Amount:</span>
                <span className="font-bold text-amber-300 text-sm font-mono">{billDetails.amount}</span>
              </div>
            </div>
          )}

          {detailsText && (
            <div className="text-xs text-amber-200/90 bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
              {detailsText}
            </div>
          )}

          {requirePassword && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Confirm with Admin Password:</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2 text-sm bg-[#011425] border border-[#1F4959] rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 focus:outline-none transition-all"
                autoFocus
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-300 font-medium bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-xl">
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
              className="btn-outline flex-1 py-2.5 rounded-xl text-xs font-medium"
            >
              {cancelLabel}
            </button>
            <button
              id="confirm-action-btn"
              type="submit"
              disabled={busy}
              className={`${btnClass} flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg`}
            >
              {busy ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
