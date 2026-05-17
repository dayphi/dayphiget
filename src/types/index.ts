// ===== Database Types =====

export type CategoryType = 'pokok' | 'hutang' | 'variabel' | 'tabungan' | 'lainnya';
export type TransactionType = 'income' | 'expense';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  display_name: string | null;
  currency: string;
  theme: ThemeMode;
  notifications: boolean;
  alert_warning_pct: number;
  alert_hutang_pct: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  pay_day: number | null;
  is_recurring: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  payment_method_id: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  notes: string | null;
  tags: string[] | null;
  is_recurring: boolean;
  recurring_freq: RecurringFrequency | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  payment_method?: PaymentMethod;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string; // 'YYYY-MM'
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  category_id: string;
  planned_amount: number;
  // Joined
  category?: Category;
}

export interface Hutang {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  remaining: number;
  monthly_payment: number;
  interest_rate: number;
  due_day: number | null;
  start_date: string;
  est_payoff_date: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  adjustments: Record<string, number>;
  result_sisa: number | null;
  is_active: boolean;
  created_at: string;
}

export interface QuickTemplate {
  id: string;
  user_id: string;
  label: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  sort_order: number;
  created_at: string;
  // Joined
  category?: Category;
}

// ===== UI Types =====

export type BudgetStatus = 'healthy' | 'warning' | 'deficit';

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  totalHutang: number;
  sisaBudget: number;
  status: BudgetStatus;
  dailyLimit: number;
  todaySpent: number;
  daysRemaining: number;
}

export interface CategoryBreakdown {
  category: Category;
  planned: number;
  actual: number;
  remaining: number;
  percentUsed: number;
}

export interface AlertItem {
  id: string;
  type: 'deficit' | 'near_limit' | 'overspend' | 'hutang_ratio' | 'daily_limit' | 'due_date';
  message: string;
  severity: 'info' | 'warning' | 'danger';
  timestamp: string;
  read: boolean;
}
