import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { getCurrentMonth, getLocalTodayStr } from '@/lib/utils';
import type {
  Transaction,
  Category,
  IncomeSource,
  PaymentMethod,
  WalletTransfer,
  WalletBalance,
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
  walletTransfers: WalletTransfer[];
  walletBalances: WalletBalance[];
  budgetItems: BudgetItem[];
  hutangList: Hutang[];
  currentMonth: string;

  // Computed
  summary: DashboardSummary | null;

  // Loading
  isLoading: boolean;
  hasFetched: boolean;

  // Actions
  setCurrentMonth: (month: string) => void;
  fetchAll: (userId: string) => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  fetchCategories: (userId: string) => Promise<void>;
  fetchIncomeSources: (userId: string) => Promise<void>;
  fetchPaymentMethods: (userId: string) => Promise<void>;
  fetchWalletTransfers: (userId: string) => Promise<void>;
  fetchBudgetItems: (userId: string) => Promise<void>;
  fetchHutang: (userId: string) => Promise<void>;
  computeSummary: () => void;

  // Transaction CRUD
  addTransaction: (tx: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Category CRUD
  addCategory: (c: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Payment Method CRUD
  addPaymentMethod: (pm: Partial<PaymentMethod>) => Promise<void>;
  updatePaymentMethod: (id: string, pm: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  addWalletTransfer: (transfer: Partial<WalletTransfer>) => Promise<void>;
  updateWalletTransfer: (id: string, transfer: Partial<WalletTransfer>) => Promise<void>;
  deleteWalletTransfer: (id: string) => Promise<void>;

  // Income Source CRUD
  addIncomeSource: (s: Partial<IncomeSource>) => Promise<void>;
  updateIncomeSource: (id: string, s: Partial<IncomeSource>) => Promise<void>;
  deleteIncomeSource: (id: string) => Promise<void>;

  // Budget Item
  setBudgetItem: (userId: string, categoryId: string, plannedAmount: number) => Promise<void>;

  // Hutang CRUD
  addHutang: (h: Partial<Hutang>) => Promise<void>;
  updateHutang: (id: string, h: Partial<Hutang>) => Promise<void>;
  deleteHutang: (id: string) => Promise<void>;
  payHutang: (hutangId: string, userId: string, customAmount?: number, paymentMethodId?: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  transactions: [],
  categories: [],
  incomeSources: [],
  paymentMethods: [],
  walletTransfers: [],
  walletBalances: [],
  budgetItems: [],
  hutangList: [],
  currentMonth: getCurrentMonth(),
  summary: null,
  isLoading: true,
  hasFetched: false,

  setCurrentMonth: (month) => set({ currentMonth: month }),

  fetchAll: async (userId) => {
    // Only show loading spinner on first load
    const isFirstLoad = !get().hasFetched;
    if (isFirstLoad) set({ isLoading: true });

    await Promise.all([
      get().fetchCategories(userId),
      get().fetchIncomeSources(userId),
      get().fetchPaymentMethods(userId),
      get().fetchWalletTransfers(userId),
      get().fetchTransactions(userId),
      get().fetchBudgetItems(userId),
      get().fetchHutang(userId),
    ]);
    get().computeSummary();
    if (isFirstLoad) set({ isLoading: false, hasFetched: true });
  },

  fetchTransactions: async (userId) => {
    const month = get().currentMonth;
    const startDate = `${month}-01`;
    // Last day of month using local date (avoid UTC shift)
    const d = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0);
    const endDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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

  fetchWalletTransfers: async (userId) => {
    const month = get().currentMonth;
    const startDate = `${month}-01`;
    const d = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0);
    const endDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const { data } = await supabase
      .from('wallet_transfers')
      .select('*, from_payment_method:payment_methods!wallet_transfers_from_payment_method_id_fkey(*), to_payment_method:payment_methods!wallet_transfers_to_payment_method_id_fkey(*)')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) set({ walletTransfers: data as WalletTransfer[] });
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

  setBudgetItem: async (userId, categoryId, plannedAmount) => {
    const month = get().currentMonth;

    // 1. Ensure budget record exists for this month
    let { data: budget } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('month', month)
      .single();

    if (!budget) {
      const { data: newBudget, error } = await supabase
        .from('budgets')
        .insert({ user_id: userId, month })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      budget = newBudget;
    }

    if (!budget) throw new Error('Gagal membuat budget');

    // 2. Upsert budget item
    const existing = get().budgetItems.find(
      (bi) => bi.category_id === categoryId
    );

    if (existing) {
      const { error } = await supabase
        .from('budget_items')
        .update({ planned_amount: plannedAmount })
        .eq('id', existing.id);
      if (error) throw new Error(error.message);
      set((s) => ({
        budgetItems: s.budgetItems.map((bi) =>
          bi.id === existing.id ? { ...bi, planned_amount: plannedAmount } : bi
        ),
      }));
    } else {
      const { data, error } = await supabase
        .from('budget_items')
        .insert({ budget_id: budget.id, category_id: categoryId, planned_amount: plannedAmount })
        .select('*, category:categories(*)')
        .single();
      if (error) throw new Error(error.message);
      if (data) set((s) => ({ budgetItems: [...s.budgetItems, data as BudgetItem] }));
    }
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
    const { transactions, incomeSources, hutangList, paymentMethods, walletTransfers, budgetItems } = get();

    const recurringIncome = incomeSources.reduce((sum, s) => sum + Number(s.amount), 0);
    const txIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncome = recurringIncome + txIncome;
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalHutang = hutangList.reduce((sum, h) => sum + Number(h.monthly_payment), 0);
    const hutangPaid = expenses
      .filter((t) => t.notes?.startsWith('Bayar cicilan:') || t.category?.name === 'Cicilan Hutang')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const remainingHutang = Math.max(totalHutang - hutangPaid, 0);

    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(lastDay - now.getDate() + 1, 1); // include today

    const todayStr = getLocalTodayStr();
    const spendableExpenses = expenses.filter(
      (t) => t.category?.type !== 'tabungan' && t.category?.name !== 'Cicilan Hutang' && !t.notes?.startsWith('Bayar cicilan:')
    );
    const savingsExpenses = expenses.filter((t) => t.category?.type === 'tabungan');

    const plannedSpend = budgetItems
      .filter((item) => item.category?.type !== 'tabungan' && item.category?.name !== 'Cicilan Hutang')
      .reduce((sum, item) => sum + Number(item.planned_amount), 0);
    const plannedSavings = budgetItems
      .filter((item) => item.category?.type === 'tabungan')
      .reduce((sum, item) => sum + Number(item.planned_amount), 0);
    const spendableSpent = spendableExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const savingsSpent = savingsExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const remainingSpendBudget = Math.max(plannedSpend - spendableSpent, 0);
    const remainingSavingsBudget = Math.max(plannedSavings - savingsSpent, 0);
    const sisaBudget = totalIncome - totalExpense - remainingHutang;

    const todaySpent = spendableExpenses
      .filter((t) => t.date === todayStr)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const dailyLimitSource = plannedSpend > 0 ? 'budget' : 'cashflow';
    const dailyLimitBase = plannedSpend > 0
      ? remainingSpendBudget
      : Math.max(sisaBudget - remainingSavingsBudget, 0);
    const dailyLimit = Math.max((dailyLimitBase + todaySpent) / daysRemaining, 0);

    const sisaPct = totalIncome > 0 ? (sisaBudget / totalIncome) * 100 : 0;
    const status = sisaBudget < 0 ? 'deficit' : sisaPct < 15 ? 'warning' : 'healthy';

    // Pre-group transactions by wallet to avoid O(N*M) loop
    const txByWallet = transactions.reduce<Record<string, { income: number; expense: number }>>((acc, tx) => {
      const pmId = tx.payment_method_id;
      if (!pmId) return acc;
      if (!acc[pmId]) acc[pmId] = { income: 0, expense: 0 };
      acc[pmId][tx.type] += Number(tx.amount);
      return acc;
    }, {});

    const transferByWallet = walletTransfers.reduce<Record<string, { in: number; out: number }>>((acc, tx) => {
      if (!acc[tx.to_payment_method_id]) acc[tx.to_payment_method_id] = { in: 0, out: 0 };
      acc[tx.to_payment_method_id].in += Number(tx.amount);
      
      if (!acc[tx.from_payment_method_id]) acc[tx.from_payment_method_id] = { in: 0, out: 0 };
      acc[tx.from_payment_method_id].out += Number(tx.amount);
      
      return acc;
    }, {});

    const walletBalances = paymentMethods.map((wallet) => {
      const walletId = wallet.id;
      const income = txByWallet[walletId]?.income || 0;
      const expense = txByWallet[walletId]?.expense || 0;
      const transferIn = transferByWallet[walletId]?.in || 0;
      const transferOut = transferByWallet[walletId]?.out || 0;

      return {
        wallet,
        income,
        expense,
        transferIn,
        transferOut,
        balance: Number(wallet.initial_balance || 0) + income - expense + transferIn - transferOut,
      };
    });

    set({
      summary: {
        totalIncome,
        totalExpense,
        totalHutang,
        remainingHutang,
        plannedSpend,
        plannedSavings,
        remainingSpendBudget,
        remainingSavingsBudget,
        dailyLimitSource,
        sisaBudget,
        status,
        dailyLimit,
        todaySpent,
        daysRemaining,
      },
      walletBalances,
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
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
    get().computeSummary();
  },

  // ---- Category CRUD ----
  addCategory: async (c) => {
    const { data, error } = await supabase.from('categories').insert(c).select().single();
    if (error) throw new Error(error.message);
    if (data) set((s) => ({ categories: [...s.categories, data as Category] }));
  },

  updateCategory: async (id, c) => {
    const { data, error } = await supabase.from('categories').update(c).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    if (data) set((s) => ({ categories: s.categories.map((cat) => cat.id === id ? (data as Category) : cat) }));
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },

  // ---- Payment Method CRUD ----
  addPaymentMethod: async (pm) => {
    const { data, error } = await supabase.from('payment_methods').insert(pm).select().single();
    if (error) throw new Error(error.message);
    if (data) set((s) => ({ paymentMethods: [...s.paymentMethods, data as PaymentMethod] }));
    get().computeSummary();
  },

  updatePaymentMethod: async (id, pm) => {
    const { data, error } = await supabase.from('payment_methods').update(pm).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    if (data) {
      set((s) => ({
        paymentMethods: s.paymentMethods.map((p) => p.id === id ? (data as PaymentMethod) : p)
      }));
      get().computeSummary();
    }
  },

  deletePaymentMethod: async (id) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) throw new Error(error.message);
    set((s) => ({ paymentMethods: s.paymentMethods.filter((p) => p.id !== id) }));
    get().computeSummary();
  },

  addWalletTransfer: async (transfer) => {
    const { data, error } = await supabase
      .from('wallet_transfers')
      .insert(transfer)
      .select('*, from_payment_method:payment_methods!wallet_transfers_from_payment_method_id_fkey(*), to_payment_method:payment_methods!wallet_transfers_to_payment_method_id_fkey(*)')
      .single();
    if (error) throw new Error(error.message);
    if (data) {
      set((s) => ({ walletTransfers: [data as WalletTransfer, ...s.walletTransfers] }));
      get().computeSummary();
    }
  },

  updateWalletTransfer: async (id, transfer) => {
    const { data, error } = await supabase
      .from('wallet_transfers')
      .update(transfer)
      .eq('id', id)
      .select('*, from_payment_method:payment_methods!wallet_transfers_from_payment_method_id_fkey(*), to_payment_method:payment_methods!wallet_transfers_to_payment_method_id_fkey(*)')
      .single();
    if (error) throw new Error(error.message);
    if (data) {
      set((s) => ({
        walletTransfers: s.walletTransfers.map((t) => t.id === id ? (data as WalletTransfer) : t),
      }));
      get().computeSummary();
    }
  },

  deleteWalletTransfer: async (id) => {
    const { error } = await supabase.from('wallet_transfers').delete().eq('id', id);
    if (error) throw new Error(error.message);
    set((s) => ({
      walletTransfers: s.walletTransfers.filter((t) => t.id !== id),
    }));
    get().computeSummary();
  },

  // ---- Income Source CRUD ----
  addIncomeSource: async (s) => {
    const { data, error } = await supabase.from('income_sources').insert(s).select().single();
    if (error) throw new Error(error.message);
    if (data) set((state) => ({ incomeSources: [...state.incomeSources, data as IncomeSource] }));
    get().computeSummary();
  },

  updateIncomeSource: async (id, s) => {
    const { data, error } = await supabase.from('income_sources').update(s).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    if (data) set((state) => ({ incomeSources: state.incomeSources.map((i) => i.id === id ? (data as IncomeSource) : i) }));
    get().computeSummary();
  },

  deleteIncomeSource: async (id) => {
    const { error } = await supabase.from('income_sources').delete().eq('id', id);
    if (error) throw new Error(error.message);
    set((s) => ({ incomeSources: s.incomeSources.filter((i) => i.id !== id) }));
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
    const { error } = await supabase.from('hutang').delete().eq('id', id);
    if (error) throw new Error(error.message);
    
    set((state) => ({
      hutangList: state.hutangList.filter((h) => h.id !== id),
    }));
    get().computeSummary();
  },

  payHutang: async (hutangId, userId, customAmount, paymentMethodId) => {
    const hutang = get().hutangList.find((h) => h.id === hutangId);
    if (!hutang) throw new Error('Hutang tidak ditemukan');

    const remaining = Number(hutang.remaining);
    if (remaining <= 0) throw new Error('Hutang sudah lunas');

    const monthly = Number(hutang.monthly_payment);
    const payment = customAmount
      ? Math.min(customAmount, remaining)
      : monthly > 0
        ? Math.min(monthly, remaining)
        : 0;
    if (payment <= 0) throw new Error('Jumlah pembayaran harus lebih dari 0');

    const newRemaining = Math.max(Number(hutang.remaining) - payment, 0);

    // 1. Update hutang remaining (keep active, user can delete manually)
    const { error: hutangError } = await supabase
      .from('hutang')
      .update({
        remaining: newRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hutangId);
    if (hutangError) throw new Error(hutangError.message);

    // 2. Find or create a 'Cicilan Hutang' category for this user
    let { data: hutangCat } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'Cicilan Hutang')
      .limit(1)
      .single();

    if (!hutangCat) {
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert({ user_id: userId, name: 'Cicilan Hutang', type: 'pokok', icon: '💳', color: '#f43f5e', sort_order: 0 })
        .select('id')
        .single();
      if (catError) throw new Error(catError.message);
      hutangCat = newCat;
    }

    // 3. Record as expense transaction
    const todayStr = getLocalTodayStr();

    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'expense',
        category_id: hutangCat!.id,
        payment_method_id: paymentMethodId || null,
        amount: payment,
        date: todayStr,
        notes: `Bayar cicilan: ${hutang.name}`,
      })
      .select('*, category:categories(*), payment_method:payment_methods(*)')
      .single();
    if (txError) throw new Error(txError.message);

    // 4. Update local state
    set((s) => ({
      hutangList: s.hutangList.map((h) =>
        h.id === hutangId ? { ...h, remaining: newRemaining } : h
      ),
      transactions: txData ? [txData as Transaction, ...s.transactions] : s.transactions,
    }));
    get().computeSummary();
  },
}));
