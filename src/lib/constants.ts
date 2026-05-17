import type { CategoryType } from '@/types';

export const APP_NAME = 'Dayphi Budget';
export const APP_VERSION = '1.0.0';

/** Default category templates for onboarding */
export const DEFAULT_CATEGORIES: {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}[] = [
  // Pokok (Essential)
  { name: 'Makan & Minum', type: 'pokok', icon: '🍔', color: '#f97316' },
  { name: 'Transportasi', type: 'pokok', icon: '🚗', color: '#3b82f6' },
  { name: 'Listrik & Air', type: 'pokok', icon: '⚡', color: '#eab308' },
  { name: 'Internet & HP', type: 'pokok', icon: '📱', color: '#06b6d4' },
  { name: 'Sewa/Kos', type: 'pokok', icon: '🏠', color: '#8b5cf6' },

  // Variabel (Variable)
  { name: 'Belanja', type: 'variabel', icon: '🛍️', color: '#ec4899' },
  { name: 'Hiburan', type: 'variabel', icon: '🎮', color: '#a855f7' },
  { name: 'Kesehatan', type: 'variabel', icon: '💊', color: '#10b981' },
  { name: 'Pendidikan', type: 'variabel', icon: '📚', color: '#6366f1' },
  { name: 'Lainnya', type: 'variabel', icon: '📦', color: '#64748b' },

  // Tabungan (Savings)
  { name: 'Tabungan', type: 'tabungan', icon: '🏦', color: '#22c55e' },
  { name: 'Dana Darurat', type: 'tabungan', icon: '🛟', color: '#14b8a6' },
  { name: 'Investasi', type: 'tabungan', icon: '📈', color: '#0ea5e9' },
];

/** Default payment methods */
export const DEFAULT_PAYMENT_METHODS = [
  { name: 'Cash', icon: '💵' },
  { name: 'Transfer Bank', icon: '🏦' },
  { name: 'E-Wallet', icon: '📱' },
  { name: 'Kartu Kredit', icon: '💳' },
  { name: 'Kartu Debit', icon: '💳' },
];

/** Category type labels */
export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  pokok: 'Pokok',
  variabel: 'Variabel',
  tabungan: 'Tabungan',
};

/** Category type colors */
export const CATEGORY_TYPE_COLORS: Record<CategoryType, string> = {
  pokok: '#f97316',
  variabel: '#8b5cf6',
  tabungan: '#22c55e',
};

/** Category icon picker options */
export const CATEGORY_ICON_OPTIONS = [
  '\u{1F354}', '\u{1F35C}', '\u{1F6D2}', '\u{1F697}', '\u{1F68C}', '\u26A1',
  '\u{1F4F1}', '\u{1F3E0}', '\u{1F4B3}', '\u{1F4B5}', '\u{1F3E6}', '\u{1F4C8}',
  '\u{1F6CD}\uFE0F', '\u{1F3AE}', '\u{1F3AC}', '\u{1F3A7}', '\u{1F4AA}', '\u{1F48A}',
  '\u{1F393}', '\u{1F4DA}', '\u{1F4E6}', '\u{1F381}', '\u{1F6E0}\uFE0F', '\u{1F4DD}',
] as const;

/** Nav items */
export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'Home' },
  { path: '/transactions', label: 'Transaksi', icon: 'Receipt' },
  { path: '/budget', label: 'Budget', icon: 'PieChart' },
  { path: '/hutang', label: 'Hutang', icon: 'CreditCard' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const;
