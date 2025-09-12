-- Create transactions table for flexible income/expense tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'savings_contribution', 'savings_withdrawal', 'debt_payment')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage their own transactions" 
ON public.transactions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create settings table for user defaults
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  default_income NUMERIC NOT NULL DEFAULT 5833,
  default_expenses JSONB NOT NULL DEFAULT '{"rent": 800, "utilities": 200, "food": 400, "transportation": 300, "insurance": 150, "other": 650}'::JSONB,
  default_debt JSONB NOT NULL DEFAULT '{"car": 200, "credit_card": 100, "student_loan": 0, "other": 0}'::JSONB,
  savings_goals JSONB NOT NULL DEFAULT '{"down_payment": 20000, "emergency_fund": 12300, "moving_setup": 7000, "maintenance": 2000}'::JSONB,
  mortgage_defaults JSONB NOT NULL DEFAULT '{"down_percent": 0.1, "loan_term": 30, "hoa": 0, "maintenance_rate": 0.01, "pmi_rate": 0.005}'::JSONB,
  selected_state TEXT NOT NULL DEFAULT 'Ohio',
  credit_score_goal INTEGER NOT NULL DEFAULT 750,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage their own settings" 
ON public.user_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create US states data table
CREATE TABLE public.us_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_name TEXT NOT NULL UNIQUE,
  state_code TEXT NOT NULL UNIQUE,
  avg_property_tax_rate NUMERIC NOT NULL DEFAULT 0.015,
  avg_insurance_rate NUMERIC NOT NULL DEFAULT 0.005,
  avg_home_price NUMERIC NOT NULL DEFAULT 200000,
  avg_interest_rate NUMERIC NOT NULL DEFAULT 0.065,
  price_growth_rate NUMERIC NOT NULL DEFAULT 0.04,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Populate US states data
INSERT INTO public.us_states (state_name, state_code, avg_property_tax_rate, avg_insurance_rate, avg_home_price, avg_interest_rate, price_growth_rate) VALUES
('Alabama', 'AL', 0.0041, 0.0035, 180000, 0.065, 0.035),
('Alaska', 'AK', 0.0119, 0.0045, 350000, 0.070, 0.025),
('Arizona', 'AZ', 0.0066, 0.0040, 420000, 0.064, 0.055),
('Arkansas', 'AR', 0.0062, 0.0030, 150000, 0.066, 0.030),
('California', 'CA', 0.0075, 0.0065, 750000, 0.063, 0.045),
('Colorado', 'CO', 0.0051, 0.0045, 520000, 0.064, 0.050),
('Connecticut', 'CT', 0.0208, 0.0050, 280000, 0.065, 0.025),
('Delaware', 'DE', 0.0057, 0.0040, 380000, 0.065, 0.030),
('Florida', 'FL', 0.0083, 0.0080, 350000, 0.064, 0.055),
('Georgia', 'GA', 0.0092, 0.0045, 280000, 0.065, 0.040),
('Hawaii', 'HI', 0.0028, 0.0060, 950000, 0.066, 0.020),
('Idaho', 'ID', 0.0069, 0.0035, 450000, 0.065, 0.060),
('Illinois', 'IL', 0.0228, 0.0040, 220000, 0.066, 0.020),
('Indiana', 'IN', 0.0085, 0.0030, 180000, 0.065, 0.035),
('Iowa', 'IA', 0.0154, 0.0025, 170000, 0.066, 0.030),
('Kansas', 'KS', 0.0142, 0.0035, 180000, 0.066, 0.035),
('Kentucky', 'KY', 0.0086, 0.0030, 160000, 0.066, 0.030),
('Louisiana', 'LA', 0.0055, 0.0055, 190000, 0.067, 0.025),
('Maine', 'ME', 0.0132, 0.0045, 380000, 0.065, 0.030),
('Maryland', 'MD', 0.0108, 0.0045, 450000, 0.065, 0.025),
('Massachusetts', 'MA', 0.0124, 0.0050, 620000, 0.064, 0.030),
('Michigan', 'MI', 0.0157, 0.0035, 200000, 0.066, 0.025),
('Minnesota', 'MN', 0.0114, 0.0040, 320000, 0.065, 0.035),
('Mississippi', 'MS', 0.0081, 0.0040, 130000, 0.067, 0.025),
('Missouri', 'MO', 0.0099, 0.0035, 190000, 0.066, 0.030),
('Montana', 'MT', 0.0085, 0.0040, 480000, 0.066, 0.045),
('Nebraska', 'NE', 0.0176, 0.0030, 200000, 0.066, 0.035),
('Nevada', 'NV', 0.0084, 0.0045, 420000, 0.064, 0.050),
('New Hampshire', 'NH', 0.0218, 0.0040, 450000, 0.065, 0.030),
('New Jersey', 'NJ', 0.0249, 0.0045, 500000, 0.065, 0.020),
('New Mexico', 'NM', 0.0080, 0.0035, 250000, 0.066, 0.040),
('New York', 'NY', 0.0168, 0.0050, 420000, 0.065, 0.025),
('North Carolina', 'NC', 0.0084, 0.0040, 320000, 0.065, 0.045),
('North Dakota', 'ND', 0.0098, 0.0030, 280000, 0.066, 0.040),
('Ohio', 'OH', 0.0157, 0.0035, 180000, 0.065, 0.030),
('Oklahoma', 'OK', 0.0090, 0.0040, 160000, 0.066, 0.035),
('Oregon', 'OR', 0.0087, 0.0045, 520000, 0.064, 0.050),
('Pennsylvania', 'PA', 0.0159, 0.0040, 230000, 0.065, 0.025),
('Rhode Island', 'RI', 0.0154, 0.0050, 450000, 0.065, 0.025),
('South Carolina', 'SC', 0.0057, 0.0045, 250000, 0.065, 0.040),
('South Dakota', 'SD', 0.0128, 0.0030, 250000, 0.066, 0.040),
('Tennessee', 'TN', 0.0069, 0.0035, 280000, 0.065, 0.045),
('Texas', 'TX', 0.0181, 0.0055, 300000, 0.065, 0.045),
('Utah', 'UT', 0.0060, 0.0040, 520000, 0.065, 0.055),
('Vermont', 'VT', 0.0186, 0.0040, 380000, 0.065, 0.025),
('Virginia', 'VA', 0.0081, 0.0040, 420000, 0.065, 0.035),
('Washington', 'WA', 0.0092, 0.0050, 750000, 0.064, 0.055),
('West Virginia', 'WV', 0.0059, 0.0030, 140000, 0.067, 0.020),
('Wisconsin', 'WI', 0.0176, 0.0035, 240000, 0.065, 0.030),
('Wyoming', 'WY', 0.0062, 0.0035, 320000, 0.066, 0.035);

-- Create credit score history table
CREATE TABLE public.credit_score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_score_history ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage their own credit score history" 
ON public.credit_score_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger to update updated_at columns
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_score_history_updated_at
  BEFORE UPDATE ON public.credit_score_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to create default settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_name TEXT := COALESCE(NEW.raw_user_meta_data->>'name', 'New User');
  v_state TEXT := COALESCE(NEW.raw_user_meta_data->>'state', 'Ohio');
  v_income NUMERIC := 5833;
  v_expenses NUMERIC := 2050;
  v_debt NUMERIC := 300;
  v_credit_score INTEGER := 720;
  v_home_price NUMERIC := 200000;
  v_down_payment NUMERIC := 1200;
  v_emergency_fund NUMERIC := 300;
  v_moving_setup NUMERIC := 200;
  v_maintenance NUMERIC := 100;
  v_total_savings NUMERIC := v_down_payment + v_emergency_fund + v_moving_setup + v_maintenance;
  v_goal NUMERIC := 47300;
  v_monthly_payment NUMERIC := 1628;
  v_dti NUMERIC;
BEGIN
  v_dti := ROUND(v_monthly_payment / v_income, 3);

  BEGIN
    -- Insert user settings first
    INSERT INTO public.user_settings (
      user_id, 
      default_income, 
      default_expenses, 
      default_debt, 
      savings_goals, 
      mortgage_defaults, 
      selected_state, 
      credit_score_goal
    ) VALUES (
      NEW.id,
      v_income,
      '{"rent": 800, "utilities": 200, "food": 400, "transportation": 300, "insurance": 150, "other": 650}'::JSONB,
      '{"car": 200, "credit_card": 100, "student_loan": 0, "other": 0}'::JSONB,
      '{"down_payment": 20000, "emergency_fund": 12300, "moving_setup": 7000, "maintenance": 2000}'::JSONB,
      '{"down_percent": 0.1, "loan_term": 30, "hoa": 0, "maintenance_rate": 0.01, "pmi_rate": 0.005}'::JSONB,
      v_state,
      750
    );

    -- Insert initial credit score
    INSERT INTO public.credit_score_history (user_id, score, notes)
    VALUES (NEW.id, v_credit_score, 'Initial credit score');

    -- Insert into users table
    INSERT INTO public.users (user_id, name, income, expenses, debt, credit_score, state)
    VALUES (NEW.id, v_name, v_income, v_expenses, v_debt, v_credit_score, v_state);

    -- Insert into savings table
    INSERT INTO public.savings (user_id, date, down_payment, emergency_fund, moving_setup, maintenance, total_savings, goal, percent_to_goal, months_left)
    VALUES (NEW.id, CURRENT_DATE, v_down_payment, v_emergency_fund, v_moving_setup, v_maintenance, v_total_savings, v_goal, ROUND(v_total_savings / v_goal, 3), 24);

    -- Insert into budget table
    INSERT INTO public.budget (user_id, date, income, expenses, debt, savings_rate, disposable_income)
    VALUES (NEW.id, CURRENT_DATE, v_income, '{"rent": 800, "utilities": 200, "food": 400, "other": 650}'::JSONB, '{"car": 200, "credit_card": 100}'::JSONB, 0.3, v_income * (1 - 0.3) - v_expenses);

    -- Insert into mortgage table
    INSERT INTO public.mortgage (user_id, date, home_price, down_percent, loan_term, rate, tax_rate, insurance_rate, pmi_rate, maintenance_rate, hoa, monthly_payment, affordable_price, dti)
    VALUES (NEW.id, CURRENT_DATE, v_home_price, 0.1, 30, 0.065, 0.015, 0.005, 0.005, 0.01, 0, v_monthly_payment, v_home_price * 0.95, v_dti);

    -- Insert into market table
    INSERT INTO public.market (user_id, date, state, home_price, tax_rate, insurance_rate, price_growth, interest_rate)
    VALUES (NEW.id, CURRENT_DATE, v_state, v_home_price, 0.015, 0.005, 0.04, 0.065);

    -- Insert into milestone table
    INSERT INTO public.milestone (user_id, date, description, status, alert)
    VALUES (NEW.id, CURRENT_DATE + INTERVAL '6 months', '$10,000 saved', 'Pending', true);

    RETURN NEW;

  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NULL;
  END;
END;
$$;