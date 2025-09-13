-- Enable RLS on the us_states table (public data, but still need RLS for consistency)
ALTER TABLE public.us_states ENABLE ROW LEVEL SECURITY;

-- Create policy for us_states (public read access since it's reference data)
CREATE POLICY "US states data is publicly readable" 
ON public.us_states 
FOR SELECT 
USING (true);