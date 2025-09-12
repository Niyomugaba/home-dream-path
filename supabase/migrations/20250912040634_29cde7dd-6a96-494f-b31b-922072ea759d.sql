-- Enable RLS on the us_states table (public data, but still need RLS for consistency)
ALTER TABLE public.us_states ENABLE ROW LEVEL SECURITY;

-- Create policy for us_states (public read access since it's reference data)
CREATE POLICY "US states data is publicly readable" 
ON public.us_states 
FOR SELECT 
USING (true);

-- Fix search_path for existing functions by updating them
CREATE OR REPLACE FUNCTION public.calculate_total_pay()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Calculate total pay based on hours and rates
  IF NEW.regular_hours IS NOT NULL AND NEW.hourly_rate IS NOT NULL THEN
    NEW.total_pay := (NEW.regular_hours * NEW.hourly_rate) + 
                     COALESCE((NEW.overtime_hours * NEW.overtime_rate), 0);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_job_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- When job is marked as completed, ensure actual_total is set if not already
  IF NEW.status = 'completed' AND (NEW.actual_total IS NULL OR NEW.actual_total = 0) THEN
    -- Use estimated_total as fallback if actual_total not set
    NEW.actual_total := COALESCE(NEW.actual_total, NEW.estimated_total);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_time_entry_pay()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Calculate total pay based on hours, rates, and tips
  IF NEW.regular_hours IS NOT NULL AND NEW.hourly_rate IS NOT NULL THEN
    NEW.total_pay := (NEW.regular_hours * NEW.hourly_rate) + 
                     COALESCE((NEW.overtime_hours * NEW.overtime_rate), 0) +
                     COALESCE(NEW.tip_amount, 0);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_role(user_id uuid DEFAULT auth.uid())
RETURNS admin_role
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT admin_role FROM public.admin_users 
  WHERE admin_users.user_id = $1 AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.create_notification(target_user_id uuid, notification_type text, notification_title text, notification_message text, notification_data jsonb DEFAULT NULL::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (target_user_id, notification_type, notification_title, notification_message, notification_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_client_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only update if job status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update the client's statistics
    UPDATE clients 
    SET 
      total_jobs_completed = (
        SELECT COUNT(*) 
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      total_revenue = (
        SELECT COALESCE(SUM(COALESCE(actual_total, estimated_total)), 0)
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  
  -- If job status changed from completed to something else, recalculate
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    UPDATE clients 
    SET 
      total_jobs_completed = (
        SELECT COUNT(*) 
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      total_revenue = (
        SELECT COALESCE(SUM(COALESCE(actual_total, estimated_total)), 0)
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_client_stats_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only update if new job is completed
  IF NEW.status = 'completed' THEN
    UPDATE clients 
    SET 
      total_jobs_completed = (
        SELECT COUNT(*) 
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      total_revenue = (
        SELECT COALESCE(SUM(COALESCE(actual_total, estimated_total)), 0)
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_on_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user1_name TEXT;
  user2_name TEXT;
BEGIN
  -- Only create notifications when status changes to 'matched'
  IF NEW.status = 'matched' AND (OLD.status IS NULL OR OLD.status != 'matched') THEN
    -- Get user names
    SELECT name INTO user1_name FROM public.profiles WHERE user_id = NEW.user_id;
    SELECT name INTO user2_name FROM public.profiles WHERE user_id = NEW.target_user_id;
    
    -- Create notification for user_id
    PERFORM public.create_notification(
      NEW.user_id,
      'match',
      'New Match! 💕',
      'You have a new match with ' || COALESCE(user2_name, 'someone special'),
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.target_user_id)
    );
    
    -- Create notification for target_user_id
    PERFORM public.create_notification(
      NEW.target_user_id,
      'match',
      'New Match! 💕',
      'You have a new match with ' || COALESCE(user1_name, 'someone special'),
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_employee_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_number := 'BM' || LPAD(counter::TEXT, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM public.employees WHERE employee_number = new_number) THEN
      RETURN new_number;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_job_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_number := 'JOB' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(counter::TEXT, 3, '0');
    IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE job_number = new_number) THEN
      RETURN new_number;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_employee_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
    NEW.employee_number := generate_employee_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_job_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number := generate_job_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;