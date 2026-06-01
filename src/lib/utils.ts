import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { IncomeSource } from '@/types';

export const INCOME_SOURCE_TAG_PREFIX = 'income_source:';

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indonesian Rupiah */
export function formatRupiah(amount: number, showSign = false): string {
  const prefix = showSign ? (amount >= 0 ? '+' : '') : '';
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return amount < 0 ? `-${formatted}` : `${prefix}${formatted}`;
}

/** Format a number compactly (e.g., 1.5jt, 500rb) */
export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}rb`;
  }
  return amount.toString();
}

/** Get remaining days in the current month */
export function getRemainingDays(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

/** Get current month string in YYYY-MM format */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function clampedPayDate(year: number, monthIndex: number, payDay: number): Date {
  return new Date(year, monthIndex, Math.min(payDay, daysInMonth(year, monthIndex)));
}

/** Get the first configured recurring payday, falling back to calendar months. */
export function getPrimaryPayDay(incomeSources: IncomeSource[]): number {
  const source = incomeSources.find((item) => item.is_recurring && item.pay_day);
  const payDay = Number(source?.pay_day || 1);
  return Number.isFinite(payDay) ? Math.min(Math.max(Math.trunc(payDay), 1), 31) : 1;
}

/** Get active budget label in YYYY-MM. With payday 25, Jun 25 starts the Jul budget. */
export function getCurrentBudgetMonth(payDay = 1, now = new Date()): string {
  const startThisMonth = clampedPayDate(now.getFullYear(), now.getMonth(), payDay);
  const labelDate = payDay > 1 && now >= startThisMonth
    ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
    : now;

  return `${labelDate.getFullYear()}-${String(labelDate.getMonth() + 1).padStart(2, '0')}`;
}

/** Get date range for a budget period. With payday 25, 2026-06 is May 25-Jun 24. */
export function getBudgetPeriod(month: string, payDay = 1) {
  const [year, oneBasedMonth] = month.split('-').map(Number);

  if (!year || !oneBasedMonth || payDay <= 1) {
    const now = new Date();
    const fallbackMonth = month || getCurrentMonth();
    const [fallbackYear, fallbackOneBasedMonth] = fallbackMonth.split('-').map(Number);
    const end = new Date(fallbackYear || now.getFullYear(), fallbackOneBasedMonth || now.getMonth() + 1, 0);

    return {
      startDate: `${fallbackMonth}-01`,
      endDate: toLocalDateString(end),
      payDay: 1,
    };
  }

  const periodStart = clampedPayDate(year, oneBasedMonth - 2, payDay);
  const nextPeriodStart = clampedPayDate(year, oneBasedMonth - 1, payDay);
  const periodEnd = new Date(nextPeriodStart);
  periodEnd.setDate(periodEnd.getDate() - 1);

  return {
    startDate: toLocalDateString(periodStart),
    endDate: toLocalDateString(periodEnd),
    payDay,
  };
}

/** Count remaining days from today until the active period end, inclusive. */
export function getRemainingDaysInPeriod(endDate: string, now = new Date()): number {
  const [year, month, day] = endDate.split('-').map(Number);
  const end = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((end.getTime() - today.getTime()) / 86_400_000) + 1;
  return Math.max(diff, 1);
}

export function getIncomeSourceIdFromTags(tags: string[] | null | undefined): string | null {
  return tags?.find((tag) => tag.startsWith(INCOME_SOURCE_TAG_PREFIX))?.slice(INCOME_SOURCE_TAG_PREFIX.length) || null;
}

export function isRecurringIncomeTransaction(tags: string[] | null | undefined): boolean {
  return Boolean(getIncomeSourceIdFromTags(tags));
}

export function setIncomeSourceTag(tags: string[] | null | undefined, incomeSourceId: string | null): string[] | null {
  const nextTags = (tags || []).filter((tag) => !tag.startsWith(INCOME_SOURCE_TAG_PREFIX));
  if (incomeSourceId) nextTags.push(`${INCOME_SOURCE_TAG_PREFIX}${incomeSourceId}`);
  return nextTags.length > 0 ? nextTags : null;
}

/** Get local today date string in YYYY-MM-DD format */
export function getLocalTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Calculate percentage with bounds */
export function calcPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((value / total) * 100), 999);
}

/** Get status color based on percentage */
export function getStatusColor(percent: number): string {
  if (percent >= 100) return 'text-danger-500';
  if (percent >= 80) return 'text-warning-500';
  return 'text-success-500';
}

/** Get status bg color based on percentage */
export function getStatusBg(percent: number): string {
  if (percent >= 100) return 'bg-danger-500';
  if (percent >= 80) return 'bg-warning-500';
  return 'bg-success-500';
}

/** Generate a random pastel color */
export function randomColor(): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Format a date to localized string */
export function formatDate(date: string | Date, style: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (style === 'long') {
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Get relative time string (e.g., "2 jam lalu") */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return formatDate(d);
}
