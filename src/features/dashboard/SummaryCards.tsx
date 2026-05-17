import {
  TrendingUp,
  TrendingDown,
  CreditCard,
} from 'lucide-react';
import { formatCompact, formatRupiah, cn } from '@/lib/utils';
import type { DashboardSummary } from '@/types';

interface Props {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: Props) {
  const cards = [
    {
      label: 'Uang masuk',
      value: summary.totalIncome,
      icon: TrendingUp,
      gradient: 'from-emerald-600/20 to-emerald-400/5',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Uang keluar',
      value: summary.totalExpense,
      icon: TrendingDown,
      gradient: summary.totalExpense > summary.totalIncome
        ? 'from-rose-600/20 to-rose-400/5'
        : 'from-blue-600/20 to-blue-400/5',
      iconColor: summary.totalExpense > summary.totalIncome
        ? 'text-rose-400'
        : 'text-blue-400',
    },
    {
      label: 'Cicilan/bln',
      value: summary.totalHutang,
      icon: CreditCard,
      gradient: 'from-orange-600/20 to-orange-400/5',
      iconColor: 'text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={cn(
            'glass-card relative overflow-hidden p-3 transition-transform active:scale-[0.98]',
            'animate-slide-up',
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-60',
              card.gradient
            )}
          />

          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-1.5">
              <card.icon size={15} className={card.iconColor} />
              <span className="min-w-0 truncate text-[11px] font-medium text-surface-400">
                {card.label}
              </span>
            </div>
            <p
              className={cn(
                'text-sm font-bold tabular-nums',
                card.value < 0 ? 'text-danger-400' : 'text-surface-100'
              )}
              title={formatRupiah(card.value)}
            >
              {formatCompact(card.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
