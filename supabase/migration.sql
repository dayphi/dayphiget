-- ============================================
-- DAYPHI BUDGET — Complete Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- ====== ENUM ======
DO $$ BEGIN
  CREATE TYPE category_type AS ENUM ('pokok', 'hutang', 'variabel', 'tabungan', 'lainnya');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ====== PROFILES ======
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT,
  currency          TEXT DEFAULT 'IDR',
  theme             TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  notifications     BOOLEAN DEFAULT true,
  alert_warning_pct INT DEFAULT 15,
  alert_hutang_pct  INT DEFAULT 30,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ====== INCOME SOURCES ======
CREATE TABLE IF NOT EXISTS income_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  amount        NUMERIC(15,2) NOT NULL,
  pay_day       INT CHECK (pay_day BETWEEN 1 AND 31),
  is_recurring  BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ====== CATEGORIES ======
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        category_type NOT NULL,
  icon        TEXT,
  color       TEXT DEFAULT '#6366f1',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ====== PAYMENT METHODS ======
CREATE TABLE IF NOT EXISTS payment_methods (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====== TRANSACTIONS ======
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id       UUID NOT NULL REFERENCES categories(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  type              TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount            NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  notes             TEXT,
  tags              TEXT[],
  is_recurring      BOOLEAN DEFAULT false,
  recurring_freq    TEXT CHECK (recurring_freq IN ('daily','weekly','monthly','yearly')),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(user_id, type);

-- ====== BUDGETS ======
CREATE TABLE IF NOT EXISTS budgets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month      TEXT NOT NULL,  -- 'YYYY-MM'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);

CREATE TABLE IF NOT EXISTS budget_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id      UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id    UUID NOT NULL REFERENCES categories(id),
  planned_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  UNIQUE(budget_id, category_id)
);

-- ====== HUTANG ======
CREATE TABLE IF NOT EXISTS hutang (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  total_amount    NUMERIC(15,2) NOT NULL,
  remaining       NUMERIC(15,2) NOT NULL,
  monthly_payment NUMERIC(15,2) NOT NULL,
  interest_rate   NUMERIC(5,2) DEFAULT 0,
  due_day         INT CHECK (due_day BETWEEN 1 AND 31),
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  est_payoff_date DATE,
  priority        INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ====== SCENARIOS ======
CREATE TABLE IF NOT EXISTS scenarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  adjustments JSONB NOT NULL DEFAULT '{}',
  result_sisa NUMERIC(15,2),
  is_active   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ====== QUICK TEMPLATES ======
CREATE TABLE IF NOT EXISTS quick_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  category_id   UUID REFERENCES categories(id),
  amount        NUMERIC(15,2) NOT NULL,
  type          TEXT DEFAULT 'expense',
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hutang ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_templates ENABLE ROW LEVEL SECURITY;

-- Profiles: users can CRUD their own profile
CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- All other tables: users manage own data via user_id
CREATE POLICY "Users manage own data" ON income_sources
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own data" ON categories
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own data" ON payment_methods
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own data" ON transactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own data" ON budgets
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own budget items" ON budget_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid())
  );

CREATE POLICY "Users manage own data" ON hutang
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own data" ON scenarios
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own data" ON quick_templates
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- DONE! 🎉
-- ============================================
-- All tables created with RLS enabled.
-- Profile auto-created on signup.
-- Ready for Dayphi Budget MVP.
