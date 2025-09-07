-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.handle_new_user();

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