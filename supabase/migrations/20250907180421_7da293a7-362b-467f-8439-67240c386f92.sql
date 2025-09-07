-- Drop existing tables to start fresh
DROP TABLE IF EXISTS user_actions CASCADE;
DROP TABLE IF EXISTS employee_requests CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS managers CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS user_reports CASCADE;
DROP TABLE IF EXISTS job_assignments CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;

-- Create User table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'You & Wife',
  income NUMERIC NOT NULL DEFAULT 5833,
  expenses NUMERIC NOT NULL DEFAULT 2050,
  debt NUMERIC NOT NULL DEFAULT 300,
  credit_score NUMERIC NOT NULL DEFAULT 720,
  state TEXT NOT NULL DEFAULT 'Ohio',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Savings table
CREATE TABLE public.savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  down_payment NUMERIC NOT NULL DEFAULT 1200,
  emergency_fund NUMERIC NOT NULL DEFAULT 300,
  moving_setup NUMERIC NOT NULL DEFAULT 200,
  maintenance NUMERIC NOT NULL DEFAULT 100,
  total_savings NUMERIC NOT NULL DEFAULT 1800,
  goal NUMERIC NOT NULL DEFAULT 47300,
  percent_to_goal NUMERIC NOT NULL DEFAULT 0.038,
  months_left NUMERIC NOT NULL DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Budget table
CREATE TABLE public.budget (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  income NUMERIC NOT NULL DEFAULT 5833,
  expenses JSONB NOT NULL DEFAULT '{"rent": 800, "utilities": 200, "food": 400, "other": 650}',
  debt JSONB NOT NULL DEFAULT '{"car": 200, "credit_card": 100}',
  savings_rate NUMERIC NOT NULL DEFAULT 0.3,
  disposable_income NUMERIC NOT NULL DEFAULT 3483,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Mortgage table
CREATE TABLE public.mortgage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  home_price NUMERIC NOT NULL DEFAULT 200000,
  down_percent NUMERIC NOT NULL DEFAULT 0.1,
  loan_term NUMERIC NOT NULL DEFAULT 30,
  rate NUMERIC NOT NULL DEFAULT 0.065,
  tax_rate NUMERIC NOT NULL DEFAULT 0.015,
  insurance_rate NUMERIC NOT NULL DEFAULT 0.005,
  pmi_rate NUMERIC NOT NULL DEFAULT 0.005,
  maintenance_rate NUMERIC NOT NULL DEFAULT 0.01,
  hoa NUMERIC NOT NULL DEFAULT 0,
  monthly_payment NUMERIC NOT NULL DEFAULT 1628,
  affordable_price NUMERIC NOT NULL DEFAULT 190000,
  dti NUMERIC NOT NULL DEFAULT 0.308,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Market table
CREATE TABLE public.market (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  state TEXT NOT NULL DEFAULT 'Ohio',
  home_price NUMERIC NOT NULL DEFAULT 200000,
  tax_rate NUMERIC NOT NULL DEFAULT 0.015,
  insurance_rate NUMERIC NOT NULL DEFAULT 0.005,
  price_growth NUMERIC NOT NULL DEFAULT 0.04,
  interest_rate NUMERIC NOT NULL DEFAULT 0.065,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Milestone table
CREATE TABLE public.milestone (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  alert BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can manage their own data" ON public.users
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for savings table
CREATE POLICY "Users can manage their own savings" ON public.savings
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for budget table
CREATE POLICY "Users can manage their own budget" ON public.budget
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for mortgage table
CREATE POLICY "Users can manage their own mortgage" ON public.mortgage
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for market table
CREATE POLICY "Users can manage their own market" ON public.market
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for milestone table
CREATE POLICY "Users can manage their own milestones" ON public.milestone
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create initial user record
  INSERT INTO public.users (user_id, name, income, expenses, debt, credit_score, state)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'You & Wife'),
    5833,
    2050,
    300,
    720,
    'Ohio'
  );
  
  -- Create initial savings record
  INSERT INTO public.savings (user_id, date, down_payment, emergency_fund, moving_setup, maintenance, total_savings, goal, percent_to_goal, months_left)
  VALUES (NEW.id, CURRENT_DATE, 1200, 300, 200, 100, 1800, 47300, 0.038, 24);
  
  -- Create initial budget record
  INSERT INTO public.budget (user_id, date, income, expenses, debt, savings_rate, disposable_income)
  VALUES (NEW.id, CURRENT_DATE, 5833, '{"rent": 800, "utilities": 200, "food": 400, "other": 650}', '{"car": 200, "credit_card": 100}', 0.3, 3483);
  
  -- Create initial mortgage record
  INSERT INTO public.mortgage (user_id, date, home_price, down_percent, loan_term, rate, tax_rate, insurance_rate, pmi_rate, maintenance_rate, hoa, monthly_payment, affordable_price, dti)
  VALUES (NEW.id, CURRENT_DATE, 200000, 0.1, 30, 0.065, 0.015, 0.005, 0.005, 0.01, 0, 1628, 190000, 0.308);
  
  -- Create initial market record
  INSERT INTO public.market (user_id, date, state, home_price, tax_rate, insurance_rate, price_growth, interest_rate)
  VALUES (NEW.id, CURRENT_DATE, 'Ohio', 200000, 0.015, 0.005, 0.04, 0.065);
  
  -- Create initial milestone
  INSERT INTO public.milestone (user_id, date, description, status, alert)
  VALUES (NEW.id, '2026-03-01', '$10,000 saved', 'Pending', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_savings_updated_at BEFORE UPDATE ON public.savings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budget_updated_at BEFORE UPDATE ON public.budget FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mortgage_updated_at BEFORE UPDATE ON public.mortgage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_market_updated_at BEFORE UPDATE ON public.market FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_milestone_updated_at BEFORE UPDATE ON public.milestone FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();