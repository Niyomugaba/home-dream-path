-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT := COALESCE(NEW.raw_user_meta_data->>'name', 'New User');
  v_state TEXT := COALESCE(NEW.raw_user_meta_data->>'state', 'Ohio');
  v_income NUMERIC := 5833; -- Default income, override with metadata if available
  v_expenses NUMERIC := 2050; -- Default expenses
  v_debt NUMERIC := 300; -- Default debt
  v_credit_score INTEGER := 720; -- Default credit score
  v_home_price NUMERIC := 200000; -- Default home price
  v_down_payment NUMERIC := 1200; -- Default down payment
  v_emergency_fund NUMERIC := 300; -- Default emergency fund
  v_moving_setup NUMERIC := 200; -- Default moving setup
  v_maintenance NUMERIC := 100; -- Default maintenance
  v_total_savings NUMERIC := v_down_payment + v_emergency_fund + v_moving_setup + v_maintenance;
  v_goal NUMERIC := 47300; -- Default savings goal
  v_monthly_payment NUMERIC := 1628; -- Default monthly mortgage payment
  v_dti NUMERIC;
BEGIN
  -- Calculate DTI (debt-to-income ratio)
  v_dti := ROUND(v_monthly_payment / v_income, 3);

  -- Begin transaction
  BEGIN
    -- Insert into users table
    INSERT INTO public.users (user_id, name, income, expenses, debt, credit_score, state)
    VALUES (
      NEW.id,
      v_name,
      v_income,
      v_expenses,
      v_debt,
      v_credit_score,
      v_state
    );

    -- Insert into savings table
    INSERT INTO public.savings (user_id, date, down_payment, emergency_fund, moving_setup, maintenance, total_savings, goal, percent_to_goal, months_left)
    VALUES (
      NEW.id,
      CURRENT_DATE,
      v_down_payment,
      v_emergency_fund,
      v_moving_setup,
      v_maintenance,
      v_total_savings,
      v_goal,
      ROUND(v_total_savings / v_goal, 3),
      24
    );

    -- Insert into budget table with JSONB for expenses and debt
    INSERT INTO public.budget (user_id, date, income, expenses, debt, savings_rate, disposable_income)
    VALUES (
      NEW.id,
      CURRENT_DATE,
      v_income,
      '{"rent": 800, "utilities": 200, "food": 400, "other": 650}'::JSONB,
      '{"car": 200, "credit_card": 100}'::JSONB,
      0.3,
      v_income * (1 - 0.3) - v_expenses
    );

    -- Insert into mortgage table
    INSERT INTO public.mortgage (user_id, date, home_price, down_percent, loan_term, rate, tax_rate, insurance_rate, pmi_rate, maintenance_rate, hoa, monthly_payment, affordable_price, dti)
    VALUES (
      NEW.id,
      CURRENT_DATE,
      v_home_price,
      0.1,
      30,
      0.065,
      0.015,
      0.005,
      0.005,
      0.01,
      0,
      v_monthly_payment,
      v_home_price * 0.95, -- Affordable price as 95% of home price
      v_dti
    );

    -- Insert into market table
    INSERT INTO public.market (user_id, date, state, home_price, tax_rate, insurance_rate, price_growth, interest_rate)
    VALUES (
      NEW.id,
      CURRENT_DATE,
      v_state,
      v_home_price,
      0.015,
      0.005,
      0.04,
      0.065
    );

    -- Insert into milestone table
    INSERT INTO public.milestone (user_id, date, description, status, alert)
    VALUES (
      NEW.id,
      CURRENT_DATE + INTERVAL '6 months', -- Dynamic milestone date
      '$10,000 saved',
      'Pending',
      true
    );

    RETURN NEW;

  EXCEPTION WHEN OTHERS THEN
    -- Log error (Supabase logs errors to the database logs)
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NULL; -- Prevent transaction from committing on error
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();