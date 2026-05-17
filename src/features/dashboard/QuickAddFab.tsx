import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionSheet } from '@/features/transactions/AddTransactionSheet';

export function QuickAddFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-28 right-5 z-20 flex h-14 w-14 items-center justify-center',
          'rounded-full gradient-primary shadow-xl shadow-primary-600/30',
          'transition-all duration-300 hover:shadow-primary-600/50 hover:scale-105',
          'active:scale-95 animate-pulse-glow'
        )}
        aria-label="Tambah transaksi"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Bottom Sheet */}
      {isOpen && (
        <>
          <div
            className="bottom-sheet-overlay"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-surface-900 border-t border-surface-700/50 animate-slide-up safe-bottom">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-surface-600" />
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="text-lg font-bold text-surface-100">Tambah Transaksi</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <AddTransactionSheet onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
