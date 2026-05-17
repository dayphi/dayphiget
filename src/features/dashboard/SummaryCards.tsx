import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Target,
} from 'lucide-react';
import { formatRupiah, cn } from '@/lib/utils';
import type { DashboardSummary } from '@/types';

interface Props {
  summary: DashboardSummary;
}

const statusConfig = {
  healthy: {
    label: 'SEHAT',
    color: 'text-success-400',
    bg: 'from-success-600/20 to-success-400/5',
    dot: 'bg-success-400',
    icon: '🟢',
  },
  warning: {
    label: 'WARNING',
    color: 'text-warning-400',
    bg: 'from-warning-600/20 to-warning-400/5',
    dot: 'bg-warning-400',
    icon: '🟡',
  },
  deficit: {
    label: 'DEFICIT',
    color: 'text-danger-400',
    bg: 'from-danger-600/20 to-danger-400/5',
    dot: 'bg-danger-400',
    icon: '🔴',
  },
};

export function SummaryCards({ summary }: Props) {
  const status = statusConfig[summary.status];

  const cards = [
    {
      label: 'Pemasukan',
      value: summary.totalIncome,
      icon: TrendingUp,
      gradient: 'from-emerald-600/20 to-emerald-400/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'Pengeluaran',
      value: summary.totalExpense,
      icon: TrendingDown,
      gradient: summary.totalExpense > summary.totalIncome
        ? 'from-rose-600/20 to-rose-400/5'
        : 'from-blue-600/20 to-blue-400/5',
      iconColor: summary.totalExpense > summary.totalIncome
        ? 'text-rose-400'
        : 'text-blue-400',
      borderColor: summary.totalExpense > summary.totalIncome
        ? 'border-rose-500/20'
        : 'border-blue-500/20',
    },
    {
      label: 'Cicilan',
      value: summary.totalHutang,
      icon: CreditCard,
      gradient: 'from-orange-600/20 to-orange-400/5',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20',
    },
    {
      label: `Sisa ${status.icon}`,
      value: summary.sisaBudget,
      icon: Target,
      gradient: status.bg,
      iconColor: status.color,
      borderColor: `border-${summary.status === 'healthy' ? 'success' : summary.status === 'warning' ? 'warning' : 'danger'}-500/20`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={cn(
            'glass-card relative overflow-hidden p-4 transition-transform active:scale-[0.98]',
            'animate-slide-up',
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Gradient background */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-60',
              card.gradient
            )}
          />

          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <card.icon size={16} className={card.iconColor} />
              <span className="text-xs font-medium text-surface-400">
                {card.label}
              </span>
            </div>
            <p className={cn(
              'text-lg font-bold tabular-nums',
              card.value < 0 ? 'text-danger-400' : 'text-surface-100'
            )}>
              {formatRupiah(card.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
