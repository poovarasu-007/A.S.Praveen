import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { verifyPassword } from '../../utils/security';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  warningText?: string;
  billDetails?: {
    billNumber: string;
    customerName: string;
    amount: string;
  };
  detailsText?: string;
  requirePassword?: boolean;
  confirmLabel?: string;
  confirmButtonColor?: 'red' | 'amber' | 'green';
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  warningText = 'This action cannot be undone.',
  billDetails,
  detailsText,
  requirePassword = false,
  confirmLabel = 'Delete Permanently',
  confirmButtonColor = 'red',
  onConfirm,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (requirePassword) {
      if (!password) {
        setError('Please enter your admin password to proceed');
        return;
      }
      if (currentUser) {
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

  const buttonColors = {
    red: 'bg-rose-600 hover:bg-rose-700 text-white',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white',
    green: 'bg-agri-700 hover:bg-agri-800 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-800 font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-lg">{title}</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 font-medium">
            {warningText}
          </p>

          {billDetails && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Bill Number:</span>
                <span className="font-mono font-bold text-gray-900">{billDetails.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Customer:</span>
                <span className="font-bold text-gray-900">{billDetails.customerName}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="text-gray-500 font-medium">Amount:</span>
                <span className="font-bold text-agri-800 text-sm">{billDetails.amount}</span>
              </div>
            </div>
          )}

          {detailsText && (
            <div className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {detailsText}
            </div>
          )}

          {requirePassword && (
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-gray-700 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-gray-500" />
                <span>Confirm with Admin Password:</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-sm font-bold rounded-xl shadow transition-all flex items-center space-x-1.5 active:scale-95 ${buttonColors[confirmButtonColor]}`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing...' : confirmLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
