import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

export function BottomSheet({
  title,
  isOpen,
  onClose,
  children,
  maxHeight = 'max-h-[90dvh]',
  className,
}: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 overflow-y-auto rounded-t-3xl bg-surface-900 border-t border-surface-700/50 animate-slide-up safe-bottom',
          maxHeight,
          className
        )}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-surface-600" />
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-lg font-bold text-surface-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
