import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionSheet } from '@/features/transactions/AddTransactionSheet';
import { BottomSheet } from '@/components/ui/BottomSheet';

export function QuickAddFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-23 right-5 z-20 flex h-14 w-14 items-center justify-center',
          'rounded-full gradient-primary shadow-xl shadow-primary-600/30',
          'opacity-80 transition-all duration-300 hover:scale-105 hover:opacity-100 hover:shadow-primary-600/50',
          'active:scale-95 animate-pulse-glow'
        )}
        aria-label="Tambah transaksi"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      <BottomSheet
        title="Tambah Transaksi"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <AddTransactionSheet onClose={() => setIsOpen(false)} />
      </BottomSheet>
    </>
  );
}
