import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserData {
  id: string;
  user_id: string;
  name: string;
  income: number;
  expenses: number;
  debt: number;
  credit_score: number;
  state: string;
}

export interface SavingsData {
  id: string;
  user_id: string;
  date: string;
  down_payment: number;
  emergency_fund: number;
  moving_setup: number;
  maintenance: number;
  total_savings: number;
  goal: number;
  percent_to_goal: number;
  months_left: number;
}

export interface BudgetData {
  id: string;
  user_id: string;
  date: string;
  income: number;
  expenses: any;
  debt: any;
  savings_rate: number;
  disposable_income: number;
}

export interface MortgageData {
  id: string;
  user_id: string;
  date: string;
  home_price: number;
  down_percent: number;
  loan_term: number;
  rate: number;
  tax_rate: number;
  insurance_rate: number;
  pmi_rate: number;
  maintenance_rate: number;
  hoa: number;
  monthly_payment: number;
  affordable_price: number;
  dti: number;
}

export interface MarketData {
  id: string;
  user_id: string;
  date: string;
  state: string;
  home_price: number;
  tax_rate: number;
  insurance_rate: number;
  price_growth: number;
  interest_rate: number;
}

export interface MilestoneData {
  id: string;
  user_id: string;
  date: string;
  description: string;
  status: string;
  alert: boolean;
}

export const useUserData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [mortgageData, setMortgageData] = useState<MortgageData | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch all user data in parallel
      const [
        { data: userResult, error: userError },
        { data: savingsResult, error: savingsError },
        { data: budgetResult, error: budgetError },
        { data: mortgageResult, error: mortgageError },
        { data: marketResult, error: marketError },
        { data: milestonesResult, error: milestonesError }
      ] = await Promise.all([
        supabase.from('users').select('*').eq('user_id', user.id).single(),
        supabase.from('savings').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(1).single(),
        supabase.from('budget').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(1).single(),
        supabase.from('mortgage').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(1).single(),
        supabase.from('market').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(1).single(),
        supabase.from('milestone').select('*').eq('user_id', user.id).order('date', { ascending: false })
      ]);

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user data:', userError);
        toast({
          title: "Error loading user data",
          description: userError.message,
          variant: "destructive",
        });
      } else if (userResult) {
        setUserData(userResult);
      }

      if (savingsError && savingsError.code !== 'PGRST116') {
        console.error('Error fetching savings data:', savingsError);
      } else if (savingsResult) {
        setSavingsData(savingsResult);
      }

      if (budgetError && budgetError.code !== 'PGRST116') {
        console.error('Error fetching budget data:', budgetError);
      } else if (budgetResult) {
        setBudgetData(budgetResult);
      }

      if (mortgageError && mortgageError.code !== 'PGRST116') {
        console.error('Error fetching mortgage data:', mortgageError);
      } else if (mortgageResult) {
        setMortgageData(mortgageResult);
      }

      if (marketError && marketError.code !== 'PGRST116') {
        console.error('Error fetching market data:', marketError);
      } else if (marketResult) {
        setMarketData(marketResult);
      }

      if (milestonesError && milestonesError.code !== 'PGRST116') {
        console.error('Error fetching milestones:', milestonesError);
      } else if (milestonesResult) {
        setMilestones(milestonesResult);
      }
    } catch (error: any) {
      console.error('Error in fetchUserData:', error);
      toast({
        title: "Error loading data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const refreshData = () => {
    if (user) {
      fetchUserData();
    }
  };

  return {
    userData,
    savingsData,
    budgetData,
    mortgageData,
    marketData,
    milestones,
    loading,
    refreshData,
  };
};