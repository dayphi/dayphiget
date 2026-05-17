import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { getCurrentMonth } from '@/lib/utils';
import type {
  Transaction,
  Category,
  IncomeSource,
  PaymentMethod,
  BudgetItem,
  Hutang,
  DashboardSummary,
} from '@/types';

interface BudgetState {
  // Data
  transactions: Transaction[];
  categories: Category[];
  incomeSources: IncomeSource[];
  paymentMethods: PaymentMethod[];
  budgetItems: BudgetItem[];
  hutangList: Hutang[];
  currentMonth: string;

  // Computed
  summary: DashboardSummary | null;

  // Loading
  isLoading: boolean;

  // Actions
  setCurrentMonth: (month: string) => void;
  fetchAll: (userId: string) => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  fetchCategories: (userId: string) => Promise<void>;
  fetchIncomeSources: (userId: string) => Promise<void>;
  fetchPaymentMethods: (userId: string) => Promise<void>;
  fetchBudgetItems: (userId: string) => Promise<void>;
  fetchHutang: (userId: string) => Promise<void>;
  computeSummary: () => void;

  // Transaction CRUD
  addTransaction: (tx: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Hutang CRUD
  addHutang: (h: Partial<Hutang>) => Promise<void>;
  updateHutang: (id: string, h: Partial<Hutang>) => Promise<void>;
  deleteHutang: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  transactions: [],
  categories: [],
  incomeSources: [],
  paymentMethods: [],
  budgetItems: [],
  hutangList: [],
  currentMonth: getCurrentMonth(),
  summary: null,
  isLoading: true,

  setCurrentMonth: (month) => set({ currentMonth: month }),

  fetchAll: async (userId) => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchCategories(userId),
      get().fetchIncomeSources(userId),
      get().fetchPaymentMethods(userId),
      get().fetchTransactions(userId),
      get().fetchBudgetItems(userId),
      get().fetchHutang(userId),
    ]);
    get().computeSummary();
    set({ isLoading: false });
  },

  fetchTransactions: async (userId) => {
    const month = get().currentMonth;
    const startDate = `${month}-01`;
    const endDate = new Date(
      parseInt(month.split('-')[0]),
      parseInt(month.split('-')[1]),
      0
    ).toISOString().split('T')[0];

    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*), payment_method:payment_methods(*)')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) set({ transactions: data as Transaction[] });
  },

  fetchCategories: async (userId) => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order');

    if (data) set({ categories: data as Category[] });
  },

  fetchIncomeSources: async (userId) => {
    const { data } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', userId);

    if (data) set({ incomeSources: data as IncomeSource[] });
  },

  fetchPaymentMethods: async (userId) => {
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId);

    if (data) set({ paymentMethods: data as PaymentMethod[] });
  },

  fetchBudgetItems: async (userId) => {
    const month = get().currentMonth;
    const { data } = await supabase
      .from('budget_items')
      .select('*, category:categories(*), budget:budgets!inner(*)')
      .eq('budget.user_id', userId)
      .eq('budget.month', month);

    if (data) set({ budgetItems: data as BudgetItem[] });
  },

  fetchHutang: async (userId) => {
    const { data } = await supabase
      .from('hutang')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority');

    if (data) set({ hutangList: data as Hutang[] });
  },

  computeSummary: () => {
    const { transactions, incomeSources, hutangList } = get();

    const totalIncome = incomeSources.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalHutang = hutangList.reduce((sum, h) => sum + Number(h.monthly_payment), 0);
    const sisaBudget = totalIncome - totalExpense - totalHutang;

    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(lastDay - now.getDate(), 1);
    const dailyLimit = Math.max(sisaBudget / daysRemaining, 0);

    const todayStr = now.toISOString().split('T')[0];
    const todaySpent = transactions
      .filter((t) => t.type === 'expense' && t.date === todayStr)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const sisaPct = totalIncome > 0 ? (sisaBudget / totalIncome) * 100 : 0;
    const status = sisaBudget < 0 ? 'deficit' : sisaPct < 15 ? 'warning' : 'healthy';

    set({
      summary: {
        totalIncome,
        totalExpense,
        totalHutang,
        sisaBudget,
        status,
        dailyLimit,
        todaySpent,
        daysRemaining,
      },
    });
  },

  addTransaction: async (tx) => {
    const { data } = await supabase
      .from('transactions')
      .insert(tx)
      .select('*, category:categories(*), payment_method:payment_methods(*)')
      .single();

    if (data) {
      set((state) => ({
        transactions: [data as Transaction, ...state.transactions],
      }));
      get().computeSummary();
    }
  },

  updateTransaction: async (id, tx) => {
    const { data } = await supabase
      .from('transactions')
      .update({ ...tx, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(*), payment_method:payment_methods(*)')
      .single();

    if (data) {
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? (data as Transaction) : t
        ),
      }));
      get().computeSummary();
    }
  },

  deleteTransaction: async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
    get().computeSummary();
  },

  addHutang: async (h) => {
    const { data } = await supabase
      .from('hutang')
      .insert(h)
      .select()
      .single();

    if (data) {
      set((state) => ({
        hutangList: [...state.hutangList, data as Hutang],
      }));
      get().computeSummary();
    }
  },

  updateHutang: async (id, h) => {
    const { data } = await supabase
      .from('hutang')
      .update({ ...h, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (data) {
      set((state) => ({
        hutangList: state.hutangList.map((item) =>
          item.id === id ? (data as Hutang) : item
        ),
      }));
      get().computeSummary();
    }
  },

  deleteHutang: async (id) => {
    await supabase.from('hutang').delete().eq('id', id);
    set((state) => ({
      hutangList: state.hutangList.filter((h) => h.id !== id),
    }));
    get().computeSummary();
  },
}));
