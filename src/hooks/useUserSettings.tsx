import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  id: string;
  user_id: string;
  default_income: number;
  default_expenses: any;
  default_debt: any;
  savings_goals: any;
  mortgage_defaults: any;
  selected_state: string;
  credit_score_goal: number;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error loading settings",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings({ ...settings, ...newSettings });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings,
  };
};