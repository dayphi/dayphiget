import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  typeToConfirmPhrase?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDestructive = true,
  typeToConfirmPhrase,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmTextVal, setConfirmTextVal] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const isConfirmed = typeToConfirmPhrase
    ? confirmTextVal === typeToConfirmPhrase
    : true;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={!loading ? onClose : undefined} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 animate-scale-in px-4">
        <div className="glass-card overflow-hidden bg-surface-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-surface-800/50 px-5 py-4">
            <h2 className="text-lg font-bold text-surface-100">{title}</h2>
            {!loading && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="px-5 py-4">
            <div className="text-sm text-surface-300 leading-relaxed">
              {description}
            </div>

            {typeToConfirmPhrase && (
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-surface-400">
                  Ketik <span className="font-bold text-surface-200">"{typeToConfirmPhrase}"</span> untuk mengkonfirmasi:
                </label>
                <input
                  type="text"
                  value={confirmTextVal}
                  onChange={(e) => setConfirmTextVal(e.target.value)}
                  placeholder={typeToConfirmPhrase}
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-surface-800/20 px-5 py-4 border-t border-surface-800/50">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-surface-600 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !isConfirmed}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50',
                isDestructive 
                  ? 'bg-danger-500 hover:bg-danger-600 shadow-danger-500/20' 
                  : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20'
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
